// ---------------------------------------------------------------------------
// CONTENT FOR THE SESSION
// ---------------------------------------------------------------------------
// Everything students see lives in this file. Edit the wording here and
// redeploy. Nothing else needs to change.
//
// Poll kinds:
//   'binary' / 'multiple'  an ordinary vote, hidden until the presenter reveals
//   'audit'                the job audit (careers and tasks are below)
//   'poems'                the human-or-machine poem reveal
//
// `compareWith` shows an earlier poll's result beside this one, for a revote.

// ---- The four goods of work (Gheaus & Herzog) ------------------------------
const GOODS = [
  { id: 'excellence', label: 'Excellence' },
  { id: 'contribution', label: 'Social contribution' },
  { id: 'recognition', label: 'Social recognition' },
  { id: 'community', label: 'Community' },
];

// ---- Job audit -------------------------------------------------------------
// Each career has six tasks. For each task:
//   good  which of the four goods of work the task mainly serves, or null if
//         it is plain drudgery
//   liab  true if someone has to answer for the outcome (used by the
//         "minimize liability" framing)
// Aim for one obvious hand-off, at most one obvious keep, and the rest in the
// gray zone, where efficiency pulls against something else.
const CAREERS = [
  {
    id: 'accountant',
    label: 'Accountant',
    tasks: [
      { text: 'Reconcile the monthly accounts', good: null, liab: false },
      { text: "Find the red flags in a client's books", good: 'excellence', liab: false },
      { text: 'Decide whether a questionable expense crosses the line', good: 'contribution', liab: true },
      { text: 'Sign the audit opinion with your name on it', good: 'recognition', liab: true },
      { text: "Tell the client's CEO the numbers don't hold up", good: 'contribution', liab: false },
      { text: 'Train the first-year associates', good: 'community', liab: false },
    ],
  },
  {
    id: 'analyst',
    label: 'Financial analyst',
    tasks: [
      { text: 'Pull and clean the quarterly data', good: null, liab: false },
      { text: 'Build the valuation model', good: 'excellence', liab: false },
      { text: 'Decide whether to recommend a risky investment', good: 'contribution', liab: true },
      { text: 'Present the recommendation to the client', good: 'recognition', liab: false },
      { text: 'Call a client whose portfolio just lost a third of its value', good: 'contribution', liab: false },
      { text: 'Mentor the summer intern', good: 'community', liab: false },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing manager',
    tasks: [
      { text: 'Pull the campaign metrics', good: null, liab: false },
      { text: "Come up with the campaign's big idea", good: 'excellence', liab: false },
      { text: 'Write the ad copy', good: 'excellence', liab: false },
      { text: 'Decide whether an edgy ad goes too far', good: 'contribution', liab: true },
      { text: 'Pitch the campaign to the client in person', good: 'recognition', liab: false },
      { text: 'Take the team out after the launch', good: 'community', liab: false },
    ],
  },
  {
    id: 'consultant',
    label: 'Management consultant',
    tasks: [
      { text: "Turn the team's notes into a slide deck", good: null, liab: false },
      { text: "Interview the client's employees about what is going wrong", good: 'excellence', liab: false },
      { text: 'Work out the recommendation', good: 'excellence', liab: false },
      { text: 'Tell the CEO her strategy is failing', good: 'contribution', liab: false },
      { text: 'Recommend which jobs to cut', good: null, liab: true },
      { text: 'Coach a junior consultant through a first project', good: 'community', liab: false },
    ],
  },
  {
    id: 'founder',
    label: 'Entrepreneur',
    tasks: [
      { text: 'Do the bookkeeping and payroll', good: null, liab: false },
      { text: 'Come up with the product idea', good: 'excellence', liab: false },
      { text: 'Pitch investors for funding', good: 'recognition', liab: false },
      { text: 'Decide which early employee to let go', good: null, liab: true },
      { text: 'Answer your first hundred customers yourself', good: 'contribution', liab: false },
      { text: 'Celebrate the first sale with your co-founder', good: 'community', liab: false },
    ],
  },
  {
    id: 'engineer',
    label: 'Software engineer',
    tasks: [
      { text: 'Write the tests and documentation', good: null, liab: false },
      { text: "Design the system's architecture", good: 'excellence', liab: false },
      { text: 'Write the core code', good: 'excellence', liab: false },
      { text: "Review a teammate's code", good: 'community', liab: false },
      { text: 'Decide whether to ship with a known bug', good: 'contribution', liab: true },
      { text: 'Present your project at the company demo day', good: 'recognition', liab: false },
    ],
  },
  {
    id: 'lawyer',
    label: 'Lawyer',
    tasks: [
      { text: 'Review ten thousand documents for the case', good: null, liab: false },
      { text: 'Research the precedents', good: 'excellence', liab: false },
      { text: 'Write the brief', good: 'excellence', liab: false },
      { text: 'Argue the case in court', good: 'recognition', liab: true },
      { text: 'Advise a client whether to take the plea deal', good: 'contribution', liab: true },
      { text: 'Sit with a client the night before the verdict', good: 'community', liab: false },
    ],
  },
  {
    id: 'physician',
    label: 'Physician',
    tasks: [
      { text: 'Write the chart notes and insurance forms', good: null, liab: false },
      { text: 'Read the scan and make the diagnosis', good: 'excellence', liab: true },
      { text: 'Perform the surgery', good: 'excellence', liab: true },
      { text: 'Tell a patient the diagnosis is terminal', good: 'contribution', liab: false },
      { text: 'Decide with a family whether to continue treatment', good: 'contribution', liab: true },
      { text: 'Teach the residents', good: 'community', liab: false },
    ],
  },
  {
    id: 'teacher',
    label: 'Teacher',
    tasks: [
      { text: 'Grade the multiple-choice quizzes', good: null, liab: false },
      { text: 'Design the course', good: 'excellence', liab: false },
      { text: 'Give the lecture', good: 'recognition', liab: false },
      { text: 'Grade the essays and write the comments', good: 'contribution', liab: true },
      { text: 'Write the recommendation letters', good: 'contribution', liab: false },
      { text: 'Meet with a student who is struggling', good: 'community', liab: false },
    ],
  },
  {
    id: 'student',
    label: 'College student',
    tasks: [
      { text: 'Format the citations', good: null, liab: false },
      { text: 'Do the assigned reading', good: 'excellence', liab: false },
      { text: 'Take notes in lecture', good: 'excellence', liab: false },
      { text: 'Write the first draft of the paper', good: 'excellence', liab: true },
      { text: 'Email the professor to ask for an extension', good: null, liab: false },
      { text: 'Study with your group before the exam', good: 'community', liab: false },
    ],
  },
];

// How a student can sort each task.
const SORTS = [
  { id: 'human', label: 'Keep it human' },
  { id: 'with', label: 'Do it with AI' },
  { id: 'ai', label: 'Hand it to AI' },
];

// Why a student would keep the task they would fight hardest for.
const REASONS = [
  { id: 'enjoy', label: "I'd enjoy doing it" },
  { id: 'deserve', label: 'People deserve a human here' },
  { id: 'credit', label: 'I want the credit' },
  { id: 'responsible', label: 'Someone has to be responsible' },
  { id: 'trust', label: "I still wouldn't trust the AI" },
];

// ---- Poems -----------------------------------------------------------------
// `ai` says which poem (a or b) the machine wrote. Authors stay hidden from
// students' phones until the presenter reaches the reveal step.
const LEISURE = [
  'What is this life if, full of care,',
  'We have no time to stand and stare.',
  '',
  'No time to stand beneath the boughs',
  'And stare as long as sheep or cows.',
  '',
  'No time to see, when woods we pass,',
  'Where squirrels hide their nuts in grass.',
  '',
  'No time to see, in broad daylight,',
  'Streams full of stars, like skies at night.',
  '',
  "No time to turn at Beauty's glance,",
  'And watch her feet, how they can dance.',
  '',
  'No time to wait till her mouth can',
  'Enrich that smile her eyes began.',
  '',
  'A poor life this if, full of care,',
  'We have no time to stand and stare.',
].join('\n');

const MILL = [
  'The mill-wheel stopped at half-past four;',
  'I heard the quiet through the door.',
  '',
  'The dust hung golden over grain,',
  'And swallows took the yard again.',
  '',
  'My hands, that never learned to rest,',
  'Lay like two strangers on my breast.',
  '',
  'I watched a beetle scale a sack,',
  'And lose its hold, and labour back,',
  '',
  'And thought how little I had seen',
  'Of all the hours that lie between',
  '',
  'The morning bell and evening one,',
  'But what was owed and what was done.',
  '',
  'The wheel will turn at six, they say.',
  'I never knew how long was day.',
].join('\n');

const UNIVERSE = [
  'A man said to the universe:',
  '"Sir, I exist!"',
  '"However," replied the universe,',
  '"The fact has not created in me',
  'A sense of obligation."',
].join('\n');

const SEA = [
  'I asked the sea how long it had been working.',
  '"Always," it said, and went on with the shore.',
  '"And are you paid?" I asked.',
  'The sea considered this,',
  'And brought me back my question, slightly worn.',
].join('\n');

// ---- The running order -----------------------------------------------------
const POLLS = [
  {
    id: 'dream',
    section: 'Opening',
    kind: 'multiple',
    question: 'If AI could do your dream job better than you, would you still want to do it?',
    options: [
      { id: 'same', label: 'Yes, just as much' },
      { id: 'less', label: 'Yes, but it would mean less to me' },
      { id: 'other', label: "No, I'd do something else" },
      { id: 'none', label: "No, I wouldn't work at all" },
    ],
    note: 'What would you do instead? Which parts of the job would you miss?',
  },
  {
    id: 'tenmil',
    section: 'Opening',
    kind: 'multiple',
    context: 'On your 22nd birthday you receive $10 million, tax-free.',
    question: "Do you still pursue the career you're planning now?",
    options: [
      { id: 'same', label: 'Yes, the same career' },
      { id: 'other', label: "I'd work, but at something else" },
      { id: 'none', label: "I wouldn't work" },
    ],
    note: "O'Brien compares total automation to retiring at 20 after winning the lottery.",
  },
  {
    id: 'audit',
    section: 'Job audit',
    kind: 'audit',
    question: 'Job audit: what would you keep?',
    context:
      "Pick a career. Sort its six tasks twice: first for today's AI, then for an AI that does every task as well as the best person in the field.",
    round1: "Round 1: today's AI. Sort each task.",
    round2:
      'Round 2: now the AI does every one of these as well as the best person in your field, reliably, for free. Sort again.',
    note: "Everything you kept in Round 2, you would be doing the slow way on purpose. O'Brien says that makes it a game. Do you agree?",
  },
  {
    id: 'exploit',
    section: 'A world without work',
    kind: 'binary',
    context:
      'Suppose you would really prefer not to work, but the alternative is going without food or housing. An employer offers you a job, and you take it.',
    question: 'Is a job offer exploitative when the only alternative is poverty?',
    options: [
      { id: 'yes', label: "Yes, you can't freely say no" },
      { id: 'no', label: 'No, the offer leaves you better off' },
    ],
    note: 'Compare the rich person offering $1,000 to someone who is starving. Is a job offer different?',
  },
  {
    id: 'champ1',
    section: 'Work or game?',
    kind: 'binary',
    context:
      'One person becomes the world chess champion. Another is a scientist whose career produces one solid but forgettable discovery.',
    question: 'Which life has more meaning?',
    options: [
      { id: 'champ', label: 'The chess champion' },
      { id: 'sci', label: 'The scientist' },
    ],
    note: "O'Brien grants that the champion's achievement might count for more than a middling paper.",
  },
  {
    id: 'champ2',
    section: 'Work or game?',
    kind: 'binary',
    stageLabel: 'The twist',
    context:
      "Same two lives. Now suppose an AI could have made the scientist's discovery in seconds, and she knew it.",
    question: 'Which life has more meaning now?',
    options: [
      { id: 'champ', label: 'The chess champion' },
      { id: 'sci', label: 'The scientist' },
    ],
    compareWith: 'champ1',
    compareLabels: ['Before the twist', 'After the twist'],
    note: "If the room moved toward the champion, it agrees with O'Brien that AI turns the scientist's work into a game.",
  },
  {
    id: 'poems',
    section: 'Human or machine?',
    kind: 'poems',
    question: 'Two poems',
    poems: {
      a: { text: MILL, author: 'Written by an AI (Claude) for this class, 2026' },
      b: { text: LEISURE, author: 'W. H. Davies, "Leisure" (1911)' },
    },
    ai: 'a',
    note: 'Lenman: if you learned Shakespeare was a computer, would you take the book off the shelf?',
  },
  {
    id: 'poems2',
    section: 'Human or machine?',
    kind: 'poems',
    stageLabel: 'Reserve pair',
    question: 'Two more poems',
    poems: {
      a: { text: UNIVERSE, author: 'Stephen Crane, "A man said to the universe" (1899)' },
      b: { text: SEA, author: 'Written by an AI (Claude) for this class, 2026' },
    },
    ai: 'b',
    note: 'A second pair, if there is time or the first pair was too easy.',
  },
  {
    id: 'slow',
    section: 'Closing',
    kind: 'binary',
    question:
      'Should we slow AI down to preserve meaningful human work, or speed it up to reach a world of abundance sooner?',
    options: [
      { id: 'slow', label: 'Slow it down' },
      { id: 'fast', label: 'Speed it up' },
    ],
    note: "O'Brien favors patience, even with the moral and economic costs of waiting.",
  },
  {
    id: 'dream2',
    section: 'Closing',
    kind: 'multiple',
    stageLabel: 'Revote',
    question: 'If AI could do your dream job better than you, would you still want to do it?',
    options: [
      { id: 'same', label: 'Yes, just as much' },
      { id: 'less', label: 'Yes, but it would mean less to me' },
      { id: 'other', label: "No, I'd do something else" },
      { id: 'none', label: "No, I wouldn't work at all" },
    ],
    compareWith: 'dream',
    compareLabels: ['Start of class', 'Now'],
    note: 'Did anything today change your answer?',
  },
];

module.exports = { POLLS, CAREERS, GOODS, SORTS, REASONS };
