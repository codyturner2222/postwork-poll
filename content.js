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
// Aim for one obvious hand-off and the rest in the gray zone, where efficiency
// pulls against something else. With about twenty students, five careers keeps
// enough people on each one for the task-by-task view to mean something.
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
      { text: "Tell a junior designer their work isn't good enough", good: 'community', liab: false },
    ],
  },
  {
    id: 'founder',
    label: 'Entrepreneur',
    tasks: [
      { text: 'Do the bookkeeping and payroll', good: null, liab: false },
      { text: 'Come up with the product idea', good: 'excellence', liab: false },
      { text: 'Pitch investors for funding', good: 'recognition', liab: false },
      { text: 'Hire your first ten employees', good: 'community', liab: true },
      { text: 'Decide which early employee to let go', good: null, liab: true },
      { text: 'Answer your first hundred customers yourself', good: 'contribution', liab: false },
    ],
  },
  {
    id: 'manager',
    label: 'Team manager',
    tasks: [
      { text: 'Build the weekly schedule and approve time off', good: null, liab: false },
      { text: 'Screen two hundred resumes for an open role', good: null, liab: true },
      { text: 'Interview the finalists and choose who to hire', good: 'excellence', liab: true },
      { text: 'Decide who gets the promotion', good: 'contribution', liab: true },
      { text: 'Tell someone they are being laid off', good: null, liab: false },
      { text: 'Coach an employee who is struggling', good: 'community', liab: false },
    ],
  },
];

// How a student can sort each task in Round 1 (today's AI).
const SORTS = [
  { id: 'human', label: 'Keep it human' },
  { id: 'with', label: 'Do it with AI' },
  { id: 'ai', label: 'Hand it to AI' },
];

// Round 2 (a perfect AI) is a forced choice, with no middle option.
const SORTS2 = [
  { id: 'human', label: 'Keep a human on it' },
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
    id: 'audit',
    section: 'Job audit',
    kind: 'audit',
    question: 'Job audit: what would you keep?',
    context:
      "Pick a career. Sort its six tasks twice: first for today's AI, then for an AI that does every task as well as the best person in the field.",
    round1: "Round 1: today's AI. Sort each task.",
    round2:
      'Round 2: now the AI does every one of these as well as the best person in your field, reliably, for free. For each task, keep a human on it or hand it over.',
    note: "Everything you kept in Round 2, you would be doing the slow way on purpose. O'Brien would say that turns it into a game. Do you agree?",
  },
  {
    id: 'stakes',
    section: 'Job audit',
    kind: 'binary',
    context:
      'Procedural work lays out the steps for you to follow. Open-ended work has no set procedure and calls for judgment. Suppose AI does open-ended work better than we do.',
    question: 'Where is the case for keeping humans doing it stronger?',
    options: [
      { id: 'low', label: 'In low-stakes work' },
      { id: 'high', label: 'In high-stakes work' },
    ],
    note: 'Low stakes: the outcome matters less, so we can afford to keep humans. High stakes: that work is the most meaningful, and someone has to be accountable.',
  },
  {
    id: 'exploit',
    section: 'A world without work',
    kind: 'binary',
    context: 'You need a job to afford food and housing. An employer offers you one, and you take it.',
    question: 'Is taking the job a free choice?',
    options: [
      { id: 'yes', label: 'Yes, you chose it' },
      { id: 'no', label: 'No, you had no real alternative' },
    ],
    note: 'If it is not free, is the offer exploitative? Compare the rich person offering $1,000 to someone who is starving.',
  },
  {
    id: 'sci1',
    section: 'Work or game?',
    kind: 'binary',
    context:
      'Two scientists each spend ten years making the same important medical discovery. For the first, no AI could have made it. For the second, an AI could have made it in seconds, but she chose to do the research herself.',
    question: "Was the second scientist's achievement less meaningful?",
    options: [
      { id: 'yes', label: 'Yes, less meaningful' },
      { id: 'no', label: 'No, just as meaningful' },
    ],
    note: "O'Brien says yes: once the AI could do it, doing it yourself is choosing the slow way on purpose.",
  },
  {
    id: 'sci2',
    section: 'Work or game?',
    kind: 'binary',
    stageLabel: 'The twist',
    context: 'Her choice delayed a treatment that would have saved thousands of lives.',
    question: 'Was she wrong to do the research herself?',
    options: [
      { id: 'yes', label: 'Yes, she should have used the AI' },
      { id: 'no', label: 'No, the work was hers to do' },
    ],
    note: 'Is preserving meaningful human work worth the cost to others? This is the closing poll in miniature.',
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
    context:
      'Suppose slowing AI development by 15 years would preserve meaningful human work, but delay major medical discoveries and the elimination of poverty.',
    question: 'Would you support slowing it down?',
    options: [
      { id: 'slow', label: 'Yes, slow it down' },
      { id: 'fast', label: "No, don't slow it down" },
    ],
    note: "O'Brien does not say which course is better. He argues that the loss of meaningful work is a reason for patience, to weigh against the costs of waiting.",
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

module.exports = { POLLS, CAREERS, GOODS, SORTS, SORTS2, REASONS };
