// Live classroom app for "Meaningful Work and Play in a Post-Work World."
// Node + Express + Socket.io. One presenter (on the projector) drives the room;
// students join on their phones with a room code and answer anonymously.
//
// All wording lives in content.js.

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { POLLS, CAREERS, GOODS, SORTS, SORTS2, REASONS } = require('./content');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.send('ok'));

// ---------------------------------------------------------------------------
// WHAT CLIENTS RECEIVE
// ---------------------------------------------------------------------------
// Speaker notes go to the presenter only. Poem authorship is withheld from
// everyone's browser until the presenter reaches the reveal step.
const POEM_STEPS = ['Rate both poems', 'Guess which one an AI wrote', 'Reveal the authors and rate again'];
const POEM_REVEAL_STEP = 2;

function clientPoll(p, forHost) {
  const out = {
    id: p.id,
    section: p.section,
    kind: p.kind,
    question: p.question,
    context: p.context,
    stageLabel: p.stageLabel,
    options: p.options,
    compareWith: p.compareWith,
    compareLabels: p.compareLabels,
  };
  if (forHost) out.note = p.note;
  if (p.kind === 'poems') {
    out.poems = { a: { text: p.poems.a.text }, b: { text: p.poems.b.text } };
    out.steps = POEM_STEPS;
  }
  if (p.kind === 'audit') {
    out.careers = CAREERS.map((c) => ({ id: c.id, label: c.label, tasks: c.tasks.map((t) => t.text) }));
    out.sorts = SORTS;
    out.sorts2 = SORTS2;
    out.reasons = REASONS;
    out.round1 = p.round1;
    out.round2 = p.round2;
  }
  return out;
}
const HOST_POLLS = POLLS.map((p) => clientPoll(p, true));
const CLIENT_POLLS = POLLS.map((p) => clientPoll(p, false));

function poemAuthors(p) {
  return { ai: p.ai, a: p.poems.a.author, b: p.poems.b.author };
}

// ---------------------------------------------------------------------------
// ROOM STATE
// ---------------------------------------------------------------------------
const rooms = new Map(); // code -> room

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I
function makeCode() {
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  } while (rooms.has(code));
  return code;
}

const pollById = (id) => POLLS.find((p) => p.id === id);
const careerById = (id) => CAREERS.find((c) => c.id === id);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const round1 = (x) => Math.round(x * 10) / 10;
const pct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);

// ---- Ordinary polls --------------------------------------------------------
function simpleTally(poll, votes) {
  const counts = {};
  poll.options.forEach((o) => (counts[o.id] = 0));
  let total = 0;
  for (const v in votes) {
    counts[votes[v]] = (counts[votes[v]] || 0) + 1;
    total++;
  }
  return { counts, total };
}

// ---- Poems -----------------------------------------------------------------
// Each student's record: { r1: {a, b}, guess: 'a' | 'b', r2: {a, b} }
function poemTally(poll, votes) {
  const all = Object.values(votes);
  const first = all.filter((v) => v.r1);
  const both = all.filter((v) => v.r1 && v.r2);
  const guesses = all.filter((v) => v.guess);
  const ai = poll.ai;
  const human = ai === 'a' ? 'b' : 'a';
  // Before/after averages use only students who rated both times, so the
  // change is a real within-person change and not a change in who answered.
  const before = both.length ? both : first;
  return {
    ratedFirst: first.length,
    ratedBoth: both.length,
    guessed: guesses.length,
    guessedRight: guesses.filter((v) => v.guess === ai).length,
    guessCounts: { a: guesses.filter((v) => v.guess === 'a').length, b: guesses.filter((v) => v.guess === 'b').length },
    aiBefore: round1(mean(before.map((v) => v.r1[ai]))),
    humanBefore: round1(mean(before.map((v) => v.r1[human]))),
    aiAfter: both.length ? round1(mean(both.map((v) => v.r2[ai]))) : null,
    humanAfter: both.length ? round1(mean(both.map((v) => v.r2[human]))) : null,
    total: first.length,
  };
}

// ---- Job audit -------------------------------------------------------------
// Each student's record:
//   { career, r1: [sort x6], r2: [sort x6] | null, keepTask: index | null, reason: id | null }
function auditTally(votes) {
  const started = Object.values(votes).filter((v) => v.career && v.r1);
  const done = started.filter((v) => v.r2);
  const n = done.length;
  const count = (arr, s) => arr.filter((x) => x === s).length;
  const avg = (key, s) => round1(mean(done.map((v) => count(v[key], s))));

  // By good of work: of the tasks serving each good, what share did students
  // keep a human on (alone or with AI) in each round?
  const goodRows = [...GOODS, { id: null, label: 'No good of work (drudgery)' }].map((g) => {
    let tasks = 0, kept1 = 0, kept2 = 0, human2 = 0;
    done.forEach((v) => {
      careerById(v.career).tasks.forEach((t, i) => {
        if (t.good !== g.id) return;
        tasks++;
        if (v.r1[i] !== 'ai') kept1++;
        if (v.r2[i] !== 'ai') kept2++;
        if (v.r2[i] === 'human') human2++;
      });
    });
    return { id: g.id, label: g.label, tasks, kept1: pct(kept1, tasks), kept2: pct(kept2, tasks), human2: pct(human2, tasks) };
  });

  // Three framings: what share of these students' tasks would each pure
  // strategy hand to a perfect AI? Compared with what the class actually did.
  let all = 0, liabKeep = 0, goodKeep = 0, classAi1 = 0, classAi2 = 0;
  done.forEach((v) => {
    careerById(v.career).tasks.forEach((t, i) => {
      all++;
      if (t.liab) liabKeep++;
      if (t.good) goodKeep++;
      if (v.r1[i] === 'ai') classAi1++;
      if (v.r2[i] === 'ai') classAi2++;
    });
  });
  const framings = {
    productivity: all ? 100 : 0,
    liability: pct(all - liabKeep, all),
    meaning: pct(all - goodKeep, all),
    class1: pct(classAi1, all),
    class2: pct(classAi2, all),
  };

  // Reasons for the task each student would fight hardest to keep.
  const reasons = {};
  REASONS.forEach((r) => (reasons[r.id] = 0));
  let reasonTotal = 0, keptNothing = 0;
  done.forEach((v) => {
    if (v.reason && reasons[v.reason] !== undefined) { reasons[v.reason]++; reasonTotal++; }
    else if (v.keepTask === null) keptNothing++;
  });

  // Task by task, perfect AI: how many of the students who chose that career
  // kept a human on it?
  const taskRows = [];
  CAREERS.forEach((c) => {
    const who = done.filter((v) => v.career === c.id);
    if (!who.length) return;
    c.tasks.forEach((t, i) => {
      const kept = who.filter((v) => v.r2[i] !== 'ai').length;
      taskRows.push({ career: c.label, text: t.text, kept, n: who.length, share: kept / who.length });
    });
  });
  const byKept = [...taskRows].sort((x, y) => y.share - x.share || y.n - x.n);
  const careers = CAREERS.map((c) => ({ label: c.label, n: done.filter((v) => v.career === c.id).length })).filter((c) => c.n);

  // How many of a student's tasks were handed over only once the AI was perfect.
  const moved = round1(mean(done.map((v) => v.r1.filter((s, i) => s !== 'ai' && v.r2[i] === 'ai').length)));
  const keptAny = done.filter((v) => v.r2.some((s) => s !== 'ai')).length;

  return {
    started: started.length,
    total: n,
    ai1: avg('r1', 'ai'), ai2: avg('r2', 'ai'),
    with1: avg('r1', 'with'), with2: avg('r2', 'with'),
    human1: avg('r1', 'human'), human2: avg('r2', 'human'),
    moved,
    keptAny,
    goods: goodRows,
    framings,
    reasons, reasonTotal, keptNothing,
    mostKept: byKept.slice(0, 5),
    leastKept: byKept.slice(-5).reverse(),
    careers,
  };
}

function tally(room, pollId) {
  const poll = pollById(pollId);
  const votes = room.votes[pollId] || {};
  if (!poll) return { total: 0 };
  if (poll.kind === 'poems') return poemTally(poll, votes);
  if (poll.kind === 'audit') return auditTally(votes);
  return simpleTally(poll, votes);
}

// How many students have finished the current step of the active activity.
function votedCount(room, poll) {
  const votes = Object.values(room.votes[poll.id] || {});
  if (poll.kind === 'poems') {
    const step = room.steps[poll.id] || 0;
    return votes.filter((v) => (step === 0 ? v.r1 : step === 1 ? v.guess : v.r2)).length;
  }
  if (poll.kind === 'audit') return votes.filter((v) => v.r2).length;
  return votes.length;
}

// Snapshot the projector needs for the active poll.
function hostState(room) {
  const idx = room.activeIndex;
  const poll = idx >= 0 ? POLLS[idx] : null;
  const state = {
    activeIndex: idx,
    revealed: room.revealed,
    participantCount: room.participants.size,
    votedCount: poll ? votedCount(room, poll) : 0,
  };
  if (poll) {
    state.tally = tally(room, poll.id);
    if (poll.compareWith) state.compare = tally(room, poll.compareWith);
    if (poll.kind === 'poems') {
      state.step = room.steps[poll.id] || 0;
      if (state.step >= POEM_REVEAL_STEP) state.authors = poemAuthors(poll);
    }
  }
  return state;
}

function emitHost(room) {
  io.to(room.code + ':host').emit('host:state', hostState(room));
}

// What a phone needs to draw the active poll.
function participantPayload(room, voterId) {
  const idx = room.activeIndex;
  if (idx < 0) return null;
  const poll = POLLS[idx];
  const out = {
    poll: CLIENT_POLLS[idx],
    revealed: room.revealed,
    myVote: voterId ? (room.votes[poll.id] || {})[voterId] || null : null,
    tally: room.revealed ? tally(room, poll.id) : null,
  };
  if (poll.kind === 'poems') {
    out.step = room.steps[poll.id] || 0;
    if (out.step >= POEM_REVEAL_STEP) out.authors = poemAuthors(poll);
  }
  return out;
}

// ---------------------------------------------------------------------------
// SOCKETS
// ---------------------------------------------------------------------------
io.on('connection', (socket) => {
  socket.data.role = null;
  socket.data.code = null;

  const hostRoom = () => {
    const room = rooms.get(socket.data.code);
    return room && room.hostId === socket.id ? room : null;
  };

  // ---- PRESENTER ----
  socket.on('host:create', (payload, ack) => {
    let code;
    const wanted = payload && payload.code;
    if (wanted && String(wanted).trim()) {
      code = String(wanted).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      if (code.length < 3) return ack && ack({ error: 'Code needs at least 3 letters or numbers.' });
      if (rooms.has(code)) return ack && ack({ error: 'That code is already in use. Pick another.' });
    } else {
      code = makeCode();
    }
    const room = {
      code,
      hostId: socket.id,
      activeIndex: -1,
      revealed: false,
      votes: {}, // pollId -> { voterId: answer }
      steps: {}, // pollId -> step number (poems only)
      participants: new Map(), // voterId -> live socket count
    };
    rooms.set(code, room);
    socket.data.role = 'host';
    socket.data.code = code;
    socket.join(code + ':host');
    if (typeof ack === 'function') ack({ code, polls: HOST_POLLS });
  });

  // Reclaim a room after the presenter refreshes or reconnects.
  socket.on('host:resume', ({ code } = {}, ack) => {
    const room = rooms.get(code);
    if (!room) return ack && ack({ error: 'Room not found' });
    room.hostId = socket.id;
    socket.data.role = 'host';
    socket.data.code = code;
    socket.join(code + ':host');
    if (typeof ack === 'function') ack({ code, polls: HOST_POLLS, state: hostState(room) });
    emitHost(room);
  });

  socket.on('host:activate', ({ index } = {}) => {
    const room = hostRoom();
    if (!room) return;
    if (typeof index !== 'number' || index < 0 || index >= POLLS.length) return;
    room.activeIndex = index;
    room.revealed = false;
    const poll = POLLS[index];
    if (!room.votes[poll.id]) room.votes[poll.id] = {};
    // Each phone gets its own earlier answer back, so returning to an
    // activity does not wipe what a student already entered.
    io.in(room.code + ':vote').fetchSockets().then((socks) => {
      socks.forEach((s) => s.emit('participant:poll', participantPayload(room, s.data.voterId)));
    });
    emitHost(room);
  });

  // Poems only: move between rate, guess, and reveal.
  socket.on('host:step', ({ step } = {}) => {
    const room = hostRoom();
    if (!room) return;
    const poll = POLLS[room.activeIndex];
    if (!poll || poll.kind !== 'poems') return;
    if (typeof step !== 'number' || step < 0 || step >= POEM_STEPS.length) return;
    room.steps[poll.id] = step;
    const msg = { pollId: poll.id, step };
    if (step >= POEM_REVEAL_STEP) msg.authors = poemAuthors(poll);
    io.to(room.code + ':vote').emit('participant:step', msg);
    emitHost(room);
  });

  socket.on('host:reveal', () => {
    const room = hostRoom();
    if (!room) return;
    room.revealed = true;
    const poll = POLLS[room.activeIndex];
    if (poll) {
      io.to(room.code + ':vote').emit('participant:revealed', { pollId: poll.id, tally: tally(room, poll.id) });
    }
    emitHost(room);
  });

  socket.on('host:reset', () => {
    const room = hostRoom();
    if (!room) return;
    const poll = POLLS[room.activeIndex];
    if (!poll) return;
    room.votes[poll.id] = {};
    room.steps[poll.id] = 0;
    room.revealed = false;
    io.to(room.code + ':vote').emit('participant:poll', { ...participantPayload(room, null), reset: true });
    emitHost(room);
  });

  // ---- STUDENTS ----
  socket.on('participant:join', ({ code, voterId } = {}, ack) => {
    const room = rooms.get((code || '').toUpperCase().trim());
    if (!room) return ack && ack({ error: 'Room not found. Check the code.' });
    // A stable id kept on the phone, so a phone that sleeps and reconnects
    // keeps one set of answers.
    const vid = (voterId && String(voterId).slice(0, 60)) || socket.id;
    socket.data.role = 'vote';
    socket.data.code = room.code;
    socket.data.voterId = vid;
    room.participants.set(vid, (room.participants.get(vid) || 0) + 1);
    socket.join(room.code + ':vote');
    if (typeof ack === 'function') ack({ ok: true, active: participantPayload(room, vid) });
    emitHost(room);
  });

  socket.on('participant:vote', (msg = {}) => {
    const room = rooms.get(socket.data.code);
    const voter = socket.data.voterId;
    if (!room || !voter) return;
    const poll = pollById(msg.pollId);
    const active = POLLS[room.activeIndex];
    // Only the open activity accepts answers.
    if (!poll || !active || active.id !== poll.id) return;
    if (!room.votes[poll.id]) room.votes[poll.id] = {};
    const mine = room.votes[poll.id];

    if (poll.kind === 'poems') {
      const step = room.steps[poll.id] || 0;
      const rec = mine[voter] || {};
      const rating = (x) => Number.isInteger(x) && x >= 1 && x <= 10;
      if (msg.part === 'r1' && step === 0 && rating(msg.a) && rating(msg.b)) rec.r1 = { a: msg.a, b: msg.b };
      else if (msg.part === 'guess' && step === 1 && (msg.pick === 'a' || msg.pick === 'b')) rec.guess = msg.pick;
      else if (msg.part === 'r2' && step === 2 && rating(msg.a) && rating(msg.b)) rec.r2 = { a: msg.a, b: msg.b };
      else return;
      mine[voter] = rec;
      socket.emit('participant:voteAck', { pollId: poll.id, myVote: rec });
      emitHost(room);
      return;
    }

    if (poll.kind === 'audit') {
      const okSort = (arr, len, allowed) =>
        Array.isArray(arr) && arr.length === len && arr.every((s) => allowed.some((o) => o.id === s));
      if (msg.part === 'r1') {
        const career = careerById(msg.career);
        if (!career || !okSort(msg.sort, career.tasks.length, SORTS)) return;
        // Changing career or Round 1 answers starts the student's audit over.
        mine[voter] = { career: career.id, r1: msg.sort, r2: null, keepTask: null, reason: null };
      } else if (msg.part === 'r2') {
        const rec = mine[voter];
        const career = rec && careerById(rec.career);
        if (!career || !okSort(msg.sort, career.tasks.length, SORTS2)) return;
        const keptIdx = msg.sort.map((s, i) => (s !== 'ai' ? i : -1)).filter((i) => i >= 0);
        let keepTask = null, reason = null;
        if (keptIdx.length) {
          if (!keptIdx.includes(msg.keepTask)) return;
          if (!REASONS.some((r) => r.id === msg.reason)) return;
          keepTask = msg.keepTask;
          reason = msg.reason;
        }
        rec.r2 = msg.sort;
        rec.keepTask = keepTask;
        rec.reason = reason;
      } else return;
      socket.emit('participant:voteAck', { pollId: poll.id, myVote: mine[voter] });
      emitHost(room);
      return;
    }

    if (!Array.isArray(poll.options) || !poll.options.some((o) => o.id === msg.optionId)) return;
    mine[voter] = msg.optionId; // one vote per student, changeable
    socket.emit('participant:voteAck', { pollId: poll.id, myVote: msg.optionId });
    emitHost(room);
  });

  socket.on('disconnect', () => {
    const room = rooms.get(socket.data.code);
    if (!room) return;
    if (socket.data.role === 'vote' && socket.data.voterId) {
      const vid = socket.data.voterId;
      const n = (room.participants.get(vid) || 0) - 1;
      if (n <= 0) room.participants.delete(vid);
      else room.participants.set(vid, n);
      // Their answers stay in the tally even if the phone sleeps briefly.
      emitHost(room);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`postwork-poll running on port ${PORT}`);
});
