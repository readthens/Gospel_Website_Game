export const CHALLENGE_TYPES = Object.freeze({
  CHOICE_QUIZ: 'choiceQuiz',
  ACTION_METER: 'actionMeter',
})

export const CHALLENGE_IDS = Object.freeze({
  LISTEN_REFLECTION: 'listenReflection',
  DOCUMENT_TRUTH: 'documentTruth',
  REPAIR_GATE: 'repairGate',
  FINAL_ASSESSMENT: 'finalAssessment',
})

const choice = (id, text, score) => ({
  id,
  text,
  score,
})

const choiceRound = (prompt, options) => ({
  prompt,
  options,
})

const actionRound = ({
  prompt,
  instructions,
  goal,
  timeLimitMs,
  leftKeys = ['ArrowLeft', 'KeyA'],
  rightKeys = ['ArrowRight', 'KeyD'],
}) => ({
  prompt,
  instructions,
  goal,
  timeLimitMs,
  leftKeys,
  rightKeys,
})

export const CHALLENGES = Object.freeze({
  [CHALLENGE_IDS.LISTEN_REFLECTION]: {
    id: CHALLENGE_IDS.LISTEN_REFLECTION,
    type: CHALLENGE_TYPES.CHOICE_QUIZ,
    title: 'Listen Carefully',
    subtitle: 'Choose the replies that show you heard what the farmers were carrying.',
    instructions: 'Use UP / DOWN or W / S to choose. Press ENTER or SPACE to confirm.',
    passThreshold: 2,
    maxScore: 2,
    retryPolicy: {
      allowRetry: false,
      singleAttempt: true,
    },
    feedback: {
      passed: {
        title: 'You listened closely.',
        body: 'You caught that the burden was not only delay on paper, but loss in the home.',
        tone: 'hope',
      },
      failed: {
        title: 'You heard them, but missed the weight.',
        body: 'The task still counts, but the ending will remember whether you understood.',
        tone: 'warning',
      },
    },
    rounds: [
      choiceRound('What were Mang Lito and Nena really asking for?', [
        choice('listen-a', 'Tubig at ayos na dapat nandito na, hindi awa na hanggang salita lang.', 1),
        choice('listen-b', 'Kaunting awa lang, kahit manatiling tahimik ang sira.', 0),
        choice('listen-c', 'Na marinig nang totoo kung paano ang delay ay bawas sa hapunan, gamot, at school.', 1),
        choice('listen-d', 'Na gumaan ang papel kahit mabigat pa rin ang buhay rito.', 0),
      ]),
      choiceRound('Kapag "delay" lang ang tawag dito sa bayan, ano ang ibig sabihin nito sa baryo?', [
        choice('delay-a', 'Bawas sa hapunan, gamot, at school.', 1),
        choice('delay-b', 'Wala naman, basta marunong lang maghintay ang pamilya.', 0),
        choice('delay-c', 'Nasasanay ang tao sa pangakong walang dating.', 1),
        choice('delay-d', 'Mas mabuting huwag na itong pangalanan.', 0),
      ]),
    ],
  },
  [CHALLENGE_IDS.DOCUMENT_TRUTH]: {
    id: CHALLENGE_IDS.DOCUMENT_TRUTH,
    type: CHALLENGE_TYPES.CHOICE_QUIZ,
    title: 'Record The Truth',
    subtitle: 'Pick the clearest record. Do not soften the damage.',
    instructions: 'Use UP / DOWN or W / S to choose. Press ENTER or SPACE to confirm.',
    passThreshold: 2,
    maxScore: 3,
    retryPolicy: {
      allowRetry: false,
      singleAttempt: true,
    },
    feedback: {
      passed: {
        title: 'You named it plainly.',
        body: 'The record kept the damage, the delay, and the family cost visible.',
        tone: 'hope',
      },
      failed: {
        title: 'The record was too soft.',
        body: 'You still finished the task, but the ending will remember whether you told the truth clearly.',
        tone: 'warning',
      },
    },
    rounds: [
      choiceRound('Which record names the irrigation problem most truthfully?', [
        choice('doc-a', 'Mainit ang panahon kaya mahina ang ani.', 0),
        choice('doc-b', 'Sirang kanal; may pondong ipinangako, pero ang ayos hindi dumating.', 1),
        choice('doc-c', 'May kaunting aberya pero aayos din siguro.', 0),
        choice('doc-d', 'Hindi malinaw kung bakit humina ang ani.', 0),
      ]),
      choiceRound('Which line best records how the delay reached the household?', [
        choice('doc-e', 'Bawas sa pagkain, gamot, pamasahe, at school money kapag kulang ang ani.', 1),
        choice('doc-f', 'Medyo nahirapan lang ang pamilya pero nakaraos naman.', 0),
        choice('doc-g', 'May ilang alalahanin sa bahay na hindi na kailangang isulat.', 0),
        choice('doc-h', 'Naging emosyonal ang usapan kaya mahirap ilagay sa board.', 0),
      ]),
      choiceRound('Which final note keeps the debt visible?', [
        choice('doc-i', 'Nauna ang gastos sa binhi at abono; naiwan ang utang sa susunod na tanim.', 1),
        choice('doc-j', 'Magiging maayos din ito basta masipag ulit sa susunod.', 0),
        choice('doc-k', 'Baka hindi naman kailangang banggitin ang utang sa ulat.', 0),
        choice('doc-l', 'Personal na problema na lang iyon ng bawat pamilya.', 0),
      ]),
    ],
  },
  [CHALLENGE_IDS.REPAIR_GATE]: {
    id: CHALLENGE_IDS.REPAIR_GATE,
    type: CHALLENGE_TYPES.ACTION_METER,
    title: 'Free The Gate',
    subtitle: 'Loosen the mud-stuck gate with steady work.',
    instructions: 'Alternate LEFT / RIGHT or A / D before time runs out.',
    passThreshold: 1,
    maxScore: 1,
    retryPolicy: {
      allowRetry: true,
      singleAttempt: false,
    },
    feedback: {
      passed: {
        title: 'The gate moved.',
        body: 'Not enough to solve everything, but enough to begin the flow.',
        tone: 'hope',
      },
      failed: {
        title: 'The gate is still stuck.',
        body: 'Try again. Small repair still takes real effort.',
        tone: 'warning',
      },
    },
    rounds: [
      actionRound({
        prompt: 'Work the jammed gate loose.',
        instructions: 'Alternate LEFT / RIGHT or A / D to build force.',
        goal: 10,
        timeLimitMs: 4200,
      }),
    ],
  },
  [CHALLENGE_IDS.FINAL_ASSESSMENT]: {
    id: CHALLENGE_IDS.FINAL_ASSESSMENT,
    type: CHALLENGE_TYPES.CHOICE_QUIZ,
    title: 'Tatay Ramon Asks',
    subtitle: 'Your answers decide whether you truly learned what this village was carrying.',
    instructions: 'Use UP / DOWN or W / S to choose. Press ENTER or SPACE to confirm.',
    passThreshold: 3,
    maxScore: 4,
    retryPolicy: {
      allowRetry: false,
      singleAttempt: true,
    },
    feedback: {
      passed: {
        title: 'You understood the burden.',
        body: 'The ending will carry the hopeful branch.',
        tone: 'hope',
      },
      failed: {
        title: 'You did not fully learn it.',
        body: 'The ending will reflect what you still missed.',
        tone: 'warning',
      },
    },
    rounds: [
      choiceRound('If someone says this was only bad weather, what answer shows you understood?', [
        choice('final-a', 'Hindi ito init lang; may kanal at tulong na dapat dumating.', 1),
        choice('final-b', 'Oo, malas lang talaga sa panahon.', 0),
        choice('final-c', 'May sira at delay na iniwan kung saan ito pinaka-kailangan.', 1),
        choice('final-d', 'Wala ring dapat pangalanan dito.', 0),
      ]),
      choiceRound('When the harvest fails, who carries the damage?', [
        choice('final-e', 'Pati bahay: pagkain, gamot, pamasahe, at school money.', 1),
        choice('final-f', 'Bukid lang, hindi naman pati pamilya.', 0),
        choice('final-g', 'Pati mga bata, dahil pati pag-aaral nadadamay.', 1),
        choice('final-h', 'Wala, basta may tiyaga at tahimik lang.', 0),
      ]),
      choiceRound('What is the right first response after seeing the cost?', [
        choice('final-i', 'Makinig nang buo bago magsalita para sa kanila.', 1),
        choice('final-j', 'Magbigay agad ng payo kahit kulang pa ang alam.', 0),
        choice('final-k', 'Sabihin nang diretso ang totoo tungkol sa sira at sa delay.', 1),
        choice('final-l', 'Iwasan ang usapan para hindi mabigat.', 0),
      ]),
      choiceRound('What does the good news look like here?', [
        choice('final-m', 'Manatili, makinig, magsabi ng totoo, at tumulong kung saan kaya.', 1),
        choice('final-n', 'Maawa sandali tapos umalis.', 0),
        choice('final-o', 'Hindi tapos ang bigat, pero hindi dapat nila itong pasan nang sila-sila lang.', 1),
        choice('final-p', 'Hintayin na lang na may ibang umayos.', 0),
      ]),
    ],
  },
})

export function getChallenge(challengeId) {
  return CHALLENGES[challengeId] || null
}

export function getChallengeIds() {
  return Object.keys(CHALLENGES)
}

export default CHALLENGES
