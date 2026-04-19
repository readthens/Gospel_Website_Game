const TASK_IDS = Object.freeze({
  LISTEN: 'listen',
  DOCUMENT: 'document',
  REPAIR: 'repair',
})

export const DIALOGUE_KEYS = Object.freeze({
  TUTORIAL_SIGN: 'tutorialSign',
  INTRO_NARRATION: 'introNarration',
  FARMER_1: 'farmer1',
  DRY_CROPS: 'dryCrops',
  CANAL: 'canal',
  PROJECT_POSTER: 'poster',
  CANAL_DAMAGE: 'canalDamage',
  CANAL_REVEAL: 'canalReveal',
  MOTHER_1: 'mother1',
  CHILD_1: 'child1',
  FERTILIZER_SACK: 'fertilizerSack',
  DEBT_LEDGER: 'debtLedger',
  REFLECTION: 'reflection',
  LISTEN_FARMER_A: 'listenFarmerA',
  LISTEN_FARMER_B: 'listenFarmerB',
  LISTEN_COMPLETE: 'listenComplete',
  DOCUMENT_BOARD: 'documentBoard',
  DOCUMENT_COMPLETE: 'documentComplete',
  REPAIR_GATE_INTRO: 'repairGateIntro',
  REPAIR_GATE_COMPLETE: 'repairGateComplete',
  HUB_UNLOCK: 'hubUnlock',
  ENDING_NARRATION: 'endingNarration',
  ENDING_VILLAGER: 'endingVillager',
  ENDING_GOSPEL: 'endingGospel',
  FAMILY_BURDEN: 'familyBurden',
  TASK_LISTEN: 'taskListen',
  TASK_DOCUMENT: 'taskDocument',
  TASK_REPAIR: 'taskRepair',
  ENDING_SEQUENCE: 'endingSequence',
})

export const DIALOGUE = Object.freeze({
  [DIALOGUE_KEYS.TUTORIAL_SIGN]: {
    speaker: 'Sign',
    lines: [
      'Move with the arrow keys or A and D.',
      'Press SPACE to jump.',
      'Press E to interact.',
    ],
  },
  [DIALOGUE_KEYS.INTRO_NARRATION]: {
    speaker: 'Narration',
    lines: [
      'Mainit ang hangin.',
      'Tuyo ang daan.',
      'May asarol na nakasandal, pero walang gumagalaw.',
      'Parang matagal nang may hinihintay dito.',
    ],
  },
  [DIALOGUE_KEYS.FARMER_1]: {
    turns: [
      {
        speaker: 'Tatay Ramon',
        lines: ['Napadaan ka sa mabigat na panahon.'],
      },
      {
        speaker: 'Player',
        lines: ['Ano pong nangyari rito?'],
      },
      {
        speaker: 'Tatay Ramon',
        lines: [
          'Nagtanim kami sa tamang oras.',
          'Nangutang para sa binhi.',
          'Inayos ang lupa.',
          'Tapos naghintay sa tubig.',
        ],
      },
      {
        speaker: 'Player',
        lines: ['Hindi po umabot?'],
      },
      {
        speaker: 'Tatay Ramon',
        lines: [
          'Hindi umabot nang maayos.',
          'Sabi may pondo na raw para sa ayos ng kanal.',
          'Hanggang sabi lang.',
          'Habang kami, araw-araw na naghihintay.',
        ],
      },
      {
        speaker: 'Player',
        lines: ['Kaya numipis ang tanim.'],
      },
      {
        speaker: 'Tatay Ramon',
        lines: [
          'Oo.',
          'Hindi dahil tamad kami.',
          'Kulang ang tubig.',
        ],
      },
    ],
  },
  [DIALOGUE_KEYS.DRY_CROPS]: {
    turns: [
      {
        speaker: 'Dry Crops',
        lines: [
          'Magaspang ang dahon.',
          'Kapit ang ugat.',
          'Pero hindi nabuo ang butil.',
          'May trabaho rito.',
          'Tubig lang ang hindi dumating.',
        ],
      },
      {
        speaker: 'Player',
        lines: [
          'Kita naman.',
          'May nag-alaga rito.',
        ],
      },
    ],
  },
  [DIALOGUE_KEYS.CANAL]: {
    turns: [
      {
        speaker: 'Narration',
        lines: [
          'Mas halata sa lapit ang sira.',
          'Bitak ang gilid.',
          'May putik sa bahaging dapat dinadaluyan ng tubig.',
          'May nagsabi nang ayos na raw ito.',
          'Pero hindi iyon ang nakikita mo.',
        ],
      },
      {
        speaker: 'Player',
        lines: ['Kung ayos na, bakit hanggang dito lang ang tubig?'],
      },
    ],
  },
  [DIALOGUE_KEYS.PROJECT_POSTER]: {
    turns: [
      {
        speaker: 'Poster',
        lines: [
          'REPAIR FUNDED.',
          'PROJECT APPROVED.',
          'COMPLETED.',
        ],
      },
      {
        speaker: 'Player',
        lines: [
          'Completed?',
          'Sa itsura nito?',
        ],
      },
      {
        speaker: 'Narration',
        lines: [
          'Malinis ang papel.',
          'Sira pa rin ang kanal.',
        ],
      },
    ],
  },
  [DIALOGUE_KEYS.CANAL_DAMAGE]: {
    speaker: 'Canal Wall',
    lines: [
      'Bumuka ang semento.',
      'Huminto ang agos.',
      'Kasama ring huminto ang tiwala.',
    ],
  },
  [DIALOGUE_KEYS.CANAL_REVEAL]: {
    speaker: 'Narration',
    lines: [
      'Hindi lang ito simpleng malas sa panahon.',
      'May dapat naayos dito.',
      'May dapat na umabot.',
      'Pero naiwan ang sira kung saan ito pinaka-kailangan.',
    ],
  },
  [DIALOGUE_KEYS.MOTHER_1]: {
    turns: [
      {
        speaker: 'Aling Rosa',
        lines: ['Kapag kulang ang ani, hindi lang bukid ang tinatamaan.'],
      },
      {
        speaker: 'Player',
        lines: ['Hanggang bahay po?'],
      },
      {
        speaker: 'Aling Rosa',
        lines: [
          'Hanggang bahay.',
          'Doon na nagsisimula ang bawas.',
          'Kaunting ulam.',
          'Gamot mamaya na.',
          'Pamasahe kung may matira.',
          'Tapos pati baon at school money ni Mara, iniisip na rin.',
        ],
      },
      {
        speaker: 'Player',
        lines: ['Kayo po ang nag-aadjust sa lahat.'],
      },
      {
        speaker: 'Aling Rosa',
        lines: [
          'May choice ba?',
          'Pag kapos, lahat tinitimbang.',
        ],
      },
    ],
  },
  [DIALOGUE_KEYS.CHILD_1]: {
    turns: [
      {
        speaker: 'Mara',
        lines: ['Alam ko kapag worried si Nanay.'],
      },
      {
        speaker: 'Player',
        lines: ['Paano mo nalalaman?'],
      },
      {
        speaker: 'Mara',
        lines: [
          'Binibilang niya ulit ang bigas.',
          'Hinuhugasan niya ulit ang parehong plato.',
          'Tapos mahina silang magsalita ni Tatay.',
        ],
      },
      {
        speaker: 'Player',
        lines: ['Naririnig mo pa rin?'],
      },
      {
        speaker: 'Mara',
        lines: [
          'Oo naman.',
          'Kapag umutang ulit si Tatay...',
          'makakapag-aral pa ba ako?',
        ],
      },
      {
        speaker: 'Player',
        lines: [
          '...',
          "Hindi mo dapat iniisip 'yan nang ikaw lang.",
        ],
      },
    ],
  },
  [DIALOGUE_KEYS.FERTILIZER_SACK]: {
    speaker: 'Fertilizer Sack',
    lines: [
      'Halos ubos na.',
      'Bayad na ito bago pa umani.',
      'Nauna ang gastos.',
      'Naiwan ang utang.',
    ],
  },
  [DIALOGUE_KEYS.DEBT_LEDGER]: {
    speaker: 'Debt Ledger',
    lines: [
      'Maingat ang sulat.',
      'Mabigat ang bilang.',
      'Isang taniman,',
      'nakasandal sa susunod.',
    ],
  },
  [DIALOGUE_KEYS.REFLECTION]: {
    turns: [
      {
        speaker: 'Narration',
        lines: [
          'Sapat na ang nakita mo.',
          'Hindi lang ito tungkol sa init.',
          'Hindi lang ito simpleng tagtuyot.',
          'May tubig na dapat dumaloy.',
          'May kanal na dapat naayos.',
          'May tulong na dapat nakarating.',
        ],
      },
      {
        speaker: 'Player',
        lines: ['Napadaan lang ako rito kanina.'],
      },
      {
        speaker: 'Narration',
        lines: ['Ngayon alam mo na.'],
      },
      {
        speaker: 'Player',
        lines: [
          'Oo.',
          'At hindi na ako pwedeng tumingin lang.',
        ],
      },
      {
        speaker: 'Narration',
        lines: [
          'Kapag malinaw mo nang nakita ang bigat,',
          'may sagot ka nang kailangang ibigay.',
        ],
      },
    ],
  },
  [DIALOGUE_KEYS.LISTEN_FARMER_A]: {
    turns: [
      {
        speaker: 'Mang Lito',
        lines: ['Hindi kami humihingi ng pabor.'],
      },
      {
        speaker: 'Player',
        lines: ['Ano pong hinihingi ninyo?'],
      },
      {
        speaker: 'Mang Lito',
        lines: [
          'Tubig na dapat nandito na.',
          'Patas na laban.',
          'Hayaan mong ang ani ang humusga sa amin,',
          'hindi ang delay ng iba.',
        ],
      },
      {
        speaker: 'Player',
        lines: ['Gaano na po katagal ito?'],
      },
      {
        speaker: 'Mang Lito',
        lines: [
          'Matagal na.',
          'Sapat para masanay ang tao sa pangakong walang dating.',
        ],
      },
    ],
  },
  [DIALOGUE_KEYS.LISTEN_FARMER_B]: {
    turns: [
      {
        speaker: 'Nena',
        lines: [
          'Sa bayan, delay lang ang tawag nila rito.',
          'Parang papel lang ang nahuli.',
        ],
      },
      {
        speaker: 'Player',
        lines: ['Pero iba ang tama rito.'],
      },
      {
        speaker: 'Nena',
        lines: [
          'Oo.',
          'Dito, ang delay, bawas sa hapunan.',
          'Bawas sa gamot.',
          'Bawas sa school.',
          'Kapag walang nakikinig, nagmumukha tuloy normal.',
        ],
      },
      {
        speaker: 'Player',
        lines: ['At hindi naman talaga normal.'],
      },
      {
        speaker: 'Nena',
        lines: [
          'Hindi.',
          'Nasasanay lang ang tao sa tahimik.',
        ],
      },
    ],
  },
  [DIALOGUE_KEYS.LISTEN_COMPLETE]: {
    speaker: 'Narration',
    lines: [
      "Nanatili ka para marinig ang buo.",
      "Mahalaga rin 'yon.",
      'May bigat na hindi mo mauunawaan',
      'kapag hindi ka muna nakikinig.',
    ],
  },
  [DIALOGUE_KEYS.DOCUMENT_BOARD]: {
    turns: [
      {
        speaker: 'Community Board',
        lines: [
          'Isinusulat mo ang matagal nang pasan ng baryo.',
          'Sirang kanal.',
          'Pondong ipinangako.',
          'Ayos na hindi dumating.',
          'Utang na nadala sa susunod na tanim.',
          'Pagkain, gamot, at eskuwela na nagsisiksikan sa iisang budget.',
        ],
      },
      {
        speaker: 'Player',
        lines: [
          'Isulat nang diretso.',
          'Huwag pagaanin.',
        ],
      },
    ],
  },
  [DIALOGUE_KEYS.DOCUMENT_COMPLETE]: {
    speaker: 'Narration',
    lines: [
      'Maikli lang sa pahina.',
      'Pero mas mahirap na itong itanggi',
      'kapag nakapangalan na.',
    ],
  },
  [DIALOGUE_KEYS.REPAIR_GATE_INTRO]: {
    turns: [
      {
        speaker: 'Water Gate',
        lines: [
          'Makunat pa.',
          'Kinakapitan ng putik at kalawang.',
          'Pero kahit maliit na bukas,',
          'may ibig sabihin sa palayang matagal nang naghihintay.',
        ],
      },
      {
        speaker: 'Player',
        lines: [
          'Sige lang.',
          'Subukan ulit.',
        ],
      },
    ],
  },
  [DIALOGUE_KEYS.REPAIR_GATE_COMPLETE]: {
    turns: [
      {
        speaker: 'Narration',
        lines: [
          'May gumalaw.',
          'Hindi sapat.',
          'Pero totoo.',
          'At minsan, doon nagsisimula ang pag-asa.',
        ],
      },
      {
        speaker: 'Player',
        lines: [
          'Hindi pa ayos.',
          'Pero nagsimula.',
        ],
      },
    ],
  },
  [DIALOGUE_KEYS.HUB_UNLOCK]: {
    speaker: 'Narration',
    lines: [
      'Sira pa rin ang kanal.',
      'Nandoon pa rin ang utang.',
      'Mabigat pa rin ang bukas.',
      'Pero hindi na tahimik ang paghihintay.',
      'At hindi na nila ito pasan nang sila-sila lang.',
    ],
  },
  [DIALOGUE_KEYS.ENDING_NARRATION]: {
    speaker: 'Narration',
    lines: [
      'May umusad na tubig.',
      'Hindi pa sapat para sa lahat.',
      'Nandoon pa rin ang ledger.',
      'Nandoon pa rin ang kaba para sa susunod na tanim.',
      'Pero may gumalaw na hindi lang salita.',
    ],
  },
  [DIALOGUE_KEYS.ENDING_VILLAGER]: {
    speaker: 'Tatay Ramon',
    lines: [
      'Mabigat pa rin ang bukas.',
      'Pero ngayong araw,',
      'hindi kami pinabayaang kami-kami lang.',
    ],
  },
  [DIALOGUE_KEYS.ENDING_GOSPEL]: {
    turns: [
      {
        speaker: 'Narration',
        lines: [
          'Hindi sapat ang awa kung hanggang tingin lang.',
          'Ang mabuting balita nagsisimula',
          'kapag may nakikinig,',
          'nagsasabi ng totoo,',
          'at nananatili kahit mahirap.',
        ],
      },
      {
        speaker: 'Player',
        lines: [
          'Hindi pa tapos.',
          'Pero hindi na rin ito tahimik.',
        ],
      },
    ],
  },
})

const LEGACY_DIALOGUE_KEYS = Object.freeze({
  ARRIVAL_TUTORIAL: DIALOGUE_KEYS.TUTORIAL_SIGN,
  FARMER_ENCOUNTER: DIALOGUE_KEYS.FARMER_1,
  BROKEN_IRRIGATION: DIALOGUE_KEYS.CANAL,
  REFLECTION_AREA: DIALOGUE_KEYS.REFLECTION,
  ENDING_PARTIAL: DIALOGUE_KEYS.ENDING_SEQUENCE,
})

const normalizeDialogueKey = (key) => LEGACY_DIALOGUE_KEYS[key] || key

const toDialogueLines = (entry) => {
  if (!entry) {
    return []
  }

  if (Array.isArray(entry.turns) && entry.turns.length) {
    return entry.turns.flatMap((turn) => (
      (turn.lines || []).map((text) => ({
        speaker: turn.speaker,
        text,
      }))
    ))
  }

  return (entry.lines || []).map((text) => ({
    speaker: entry.speaker,
    text,
  }))
}

const toSequenceLines = (dialogueKeys = []) =>
  dialogueKeys.flatMap((dialogueKey) => {
    const entry = DIALOGUE[dialogueKey]

    if (!entry) {
      return []
    }

    return toDialogueLines(entry)
  })

const createSequence = ({
  key,
  beat,
  startBeat = null,
  startObjectiveId = null,
  taskId = null,
  lockMovement = true,
  completion = {},
  dialogueKeys = [],
}) => ({
  key,
  beat,
  startBeat,
  startObjectiveId,
  taskId,
  lockMovement,
  completion,
  lines: toSequenceLines(dialogueKeys),
})

export const DIALOGUE_SEQUENCES = Object.freeze({
  [DIALOGUE_KEYS.TUTORIAL_SIGN]: createSequence({
    key: DIALOGUE_KEYS.TUTORIAL_SIGN,
    beat: 'intro',
    dialogueKeys: [DIALOGUE_KEYS.TUTORIAL_SIGN],
  }),
  [DIALOGUE_KEYS.INTRO_NARRATION]: createSequence({
    key: DIALOGUE_KEYS.INTRO_NARRATION,
    beat: 'intro',
    dialogueKeys: [DIALOGUE_KEYS.INTRO_NARRATION],
  }),
  [DIALOGUE_KEYS.FARMER_1]: createSequence({
    key: DIALOGUE_KEYS.FARMER_1,
    beat: 'farmer',
    dialogueKeys: [DIALOGUE_KEYS.FARMER_1],
  }),
  [DIALOGUE_KEYS.DRY_CROPS]: createSequence({
    key: DIALOGUE_KEYS.DRY_CROPS,
    beat: 'crops',
    dialogueKeys: [DIALOGUE_KEYS.DRY_CROPS],
  }),
  [DIALOGUE_KEYS.CANAL]: createSequence({
    key: DIALOGUE_KEYS.CANAL,
    beat: 'canal',
    dialogueKeys: [DIALOGUE_KEYS.CANAL, DIALOGUE_KEYS.CANAL_REVEAL],
  }),
  [DIALOGUE_KEYS.PROJECT_POSTER]: createSequence({
    key: DIALOGUE_KEYS.PROJECT_POSTER,
    beat: 'canal',
    dialogueKeys: [DIALOGUE_KEYS.PROJECT_POSTER],
  }),
  [DIALOGUE_KEYS.CANAL_DAMAGE]: createSequence({
    key: DIALOGUE_KEYS.CANAL_DAMAGE,
    beat: 'canal',
    dialogueKeys: [DIALOGUE_KEYS.CANAL_DAMAGE],
  }),
  [DIALOGUE_KEYS.FAMILY_BURDEN]: createSequence({
    key: DIALOGUE_KEYS.FAMILY_BURDEN,
    beat: 'family',
    dialogueKeys: [DIALOGUE_KEYS.MOTHER_1, DIALOGUE_KEYS.CHILD_1],
  }),
  [DIALOGUE_KEYS.MOTHER_1]: createSequence({
    key: DIALOGUE_KEYS.MOTHER_1,
    beat: 'family',
    dialogueKeys: [DIALOGUE_KEYS.MOTHER_1],
  }),
  [DIALOGUE_KEYS.CHILD_1]: createSequence({
    key: DIALOGUE_KEYS.CHILD_1,
    beat: 'family',
    dialogueKeys: [DIALOGUE_KEYS.CHILD_1],
  }),
  [DIALOGUE_KEYS.FERTILIZER_SACK]: createSequence({
    key: DIALOGUE_KEYS.FERTILIZER_SACK,
    beat: 'family',
    dialogueKeys: [DIALOGUE_KEYS.FERTILIZER_SACK],
  }),
  [DIALOGUE_KEYS.DEBT_LEDGER]: createSequence({
    key: DIALOGUE_KEYS.DEBT_LEDGER,
    beat: 'family',
    dialogueKeys: [DIALOGUE_KEYS.DEBT_LEDGER],
  }),
  [DIALOGUE_KEYS.REFLECTION]: createSequence({
    key: DIALOGUE_KEYS.REFLECTION,
    beat: 'reflection',
    dialogueKeys: [DIALOGUE_KEYS.REFLECTION],
  }),
  [DIALOGUE_KEYS.LISTEN_FARMER_A]: createSequence({
    key: DIALOGUE_KEYS.LISTEN_FARMER_A,
    beat: 'hub',
    startObjectiveId: 'hub',
    dialogueKeys: [DIALOGUE_KEYS.LISTEN_FARMER_A],
  }),
  [DIALOGUE_KEYS.LISTEN_FARMER_B]: createSequence({
    key: DIALOGUE_KEYS.LISTEN_FARMER_B,
    beat: 'hub',
    startObjectiveId: 'hub',
    dialogueKeys: [DIALOGUE_KEYS.LISTEN_FARMER_B],
  }),
  [DIALOGUE_KEYS.LISTEN_COMPLETE]: createSequence({
    key: DIALOGUE_KEYS.LISTEN_COMPLETE,
    beat: 'hub',
    startObjectiveId: 'hub',
    dialogueKeys: [DIALOGUE_KEYS.LISTEN_COMPLETE],
  }),
  [DIALOGUE_KEYS.DOCUMENT_BOARD]: createSequence({
    key: DIALOGUE_KEYS.DOCUMENT_BOARD,
    beat: 'hub',
    startObjectiveId: 'hub',
    dialogueKeys: [DIALOGUE_KEYS.DOCUMENT_BOARD, DIALOGUE_KEYS.DOCUMENT_COMPLETE],
  }),
  [DIALOGUE_KEYS.REPAIR_GATE_INTRO]: createSequence({
    key: DIALOGUE_KEYS.REPAIR_GATE_INTRO,
    beat: 'hub',
    startObjectiveId: 'hub',
    dialogueKeys: [DIALOGUE_KEYS.REPAIR_GATE_INTRO, DIALOGUE_KEYS.REPAIR_GATE_COMPLETE],
  }),
  [DIALOGUE_KEYS.TASK_LISTEN]: createSequence({
    key: DIALOGUE_KEYS.TASK_LISTEN,
    beat: 'hub',
    startObjectiveId: 'hub',
    taskId: TASK_IDS.LISTEN,
    dialogueKeys: [
      DIALOGUE_KEYS.LISTEN_FARMER_A,
      DIALOGUE_KEYS.LISTEN_FARMER_B,
      DIALOGUE_KEYS.LISTEN_COMPLETE,
    ],
  }),
  [DIALOGUE_KEYS.TASK_DOCUMENT]: createSequence({
    key: DIALOGUE_KEYS.TASK_DOCUMENT,
    beat: 'hub',
    startObjectiveId: 'hub',
    taskId: TASK_IDS.DOCUMENT,
    dialogueKeys: [DIALOGUE_KEYS.DOCUMENT_BOARD, DIALOGUE_KEYS.DOCUMENT_COMPLETE],
  }),
  [DIALOGUE_KEYS.TASK_REPAIR]: createSequence({
    key: DIALOGUE_KEYS.TASK_REPAIR,
    beat: 'hub',
    startObjectiveId: 'hub',
    taskId: TASK_IDS.REPAIR,
    dialogueKeys: [DIALOGUE_KEYS.REPAIR_GATE_INTRO, DIALOGUE_KEYS.REPAIR_GATE_COMPLETE],
  }),
  [DIALOGUE_KEYS.HUB_UNLOCK]: createSequence({
    key: DIALOGUE_KEYS.HUB_UNLOCK,
    beat: 'hub',
    startObjectiveId: 'hub',
    dialogueKeys: [DIALOGUE_KEYS.HUB_UNLOCK],
  }),
  [DIALOGUE_KEYS.ENDING_VILLAGER]: createSequence({
    key: DIALOGUE_KEYS.ENDING_VILLAGER,
    beat: 'ending',
    startObjectiveId: 'ending',
    dialogueKeys: [DIALOGUE_KEYS.ENDING_VILLAGER],
  }),
  [DIALOGUE_KEYS.ENDING_SEQUENCE]: createSequence({
    key: DIALOGUE_KEYS.ENDING_SEQUENCE,
    beat: 'ending',
    startObjectiveId: 'ending',
    dialogueKeys: [
      DIALOGUE_KEYS.ENDING_NARRATION,
      DIALOGUE_KEYS.ENDING_VILLAGER,
      DIALOGUE_KEYS.ENDING_GOSPEL,
    ],
  }),
})

export function getDialogue(key) {
  return DIALOGUE[normalizeDialogueKey(key)] || null
}

export function getDialogueSequence(key) {
  return DIALOGUE_SEQUENCES[normalizeDialogueKey(key)] || null
}

export function getDialogueKeys() {
  return Object.keys(DIALOGUE_SEQUENCES)
}

export function getTaskDialogueKey(taskId) {
  const match = Object.values(DIALOGUE_SEQUENCES).find((sequence) => sequence.taskId === taskId)
  return match ? match.key : null
}

export default DIALOGUE_SEQUENCES
