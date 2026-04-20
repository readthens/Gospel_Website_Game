export const ENDING_VARIANTS = Object.freeze({
  LEARNED: 'learned',
  DID_NOT_LEARN: 'did_not_learn',
})

export const ENDINGS = Object.freeze({
  [ENDING_VARIANTS.LEARNED]: {
    headline: 'Hope Begins',
    body: [
      'May umusad na tubig, kahit kaunti.',
      'Nandoon pa rin ang utang.',
      'Nandoon pa rin ang hirap ng susunod na tanim.',
      'Pero hindi na tahimik ang bigat na ito.',
      'At hindi na ito pasan nang mag-isa.',
    ],
    reflection: [
      'Ang mabuting balita hindi laging biglaan.',
      'Minsan nagsisimula ito sa pakikinig,',
      'sa katotohanan,',
      'at sa pag-stay kapag mahirap nang umalis.',
    ].join('\n'),
  },
  [ENDING_VARIANTS.DID_NOT_LEARN]: {
    headline: 'The Weight Remains',
    body: [
      'May umusad na tubig, pero hindi iyon ang buong kuwento.',
      'Nandoon pa rin ang utang.',
      'Nandoon pa rin ang kaba para sa susunod na tanim.',
      'Kapag hindi pinakinggan nang buo ang bigat, madaling bumalik sa tahimik.',
      'Hindi sapat ang pagdaan lang.',
    ],
    reflection: [
      'Ang mabuting balita hindi nasusukat sa pagtingin lang.',
      'Kailangan nito ng pakikinig,',
      'ng tapat na pangalan sa sugat,',
      'at ng pananatili',
      'kahit mas madaling umiwas.',
    ].join('\n'),
  },
})

export function getEndingCopy(variant = ENDING_VARIANTS.LEARNED) {
  return ENDINGS[variant] || ENDINGS[ENDING_VARIANTS.LEARNED]
}

export default ENDINGS
