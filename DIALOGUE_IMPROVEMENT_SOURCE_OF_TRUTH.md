# Dialogue Improvement Source of Truth

This document is the current source of truth for the narrative rewrite and dialogue pass.

It is intended to drive implementation updates in the existing game runtime without changing the current mechanics, scene flow, layout, or task structure.

## 1. Menu / Shell Copy

### Title
When the Water Doesn't Come

### Subtitle
A short Gospel-shaped story about Filipino farmers, broken irrigation, and the choice to respond.

### About / Intro Blurb
Walk through a village still waiting on water.
See how a broken canal becomes hunger, debt, and fear at home.
Then choose how to answer: by listening, naming the truth, and helping where you can.

### Start Button
Begin

### End Buttons
Play Again
Back to Menu

## 2. Objective Flow

### intro
Walk into the waiting village.

### farmer
Hear Tatay Ramon out.

### crops
Inspect the dead crops.

### canal
Inspect the irrigation canal.

### family
See what the failed harvest does at home.

### reflection
Continue forward and reflect.

### hub
Join the response: listen, record, and help repair.

### ending
Walk toward the field.

## 3. Prompt Wording

### tutorialSign
Read sign

### farmer1
Talk

### dryCrops
Inspect

### brokenCanal
Inspect canal

### projectPoster
Read poster

### canalDamage
Inspect

### mother1
Talk

### child1
Talk

### fertilizerSack
Inspect

### debtLedger
Inspect

### listenFarmerA
Talk

### listenFarmerB
Talk

### documentBoard
Record

### repairGate
Help repair

### endingVillager
Talk

## 4. Full Interaction / Dialogue Pack

## A. Trigger: introNarration
**Speaker: Narration**

Mainit ang hangin.  
Tuyo ang daan.  
May asarol na nakasandal, pero walang gumagalaw.  
Parang matagal nang may hinihintay dito.

## B. Interactable: tutorialSign
**Speaker: Sign**

Move with the arrow keys or A and D.  
Press SPACE to jump.  
Press E to interact.

## C. Interactable: farmer1
**Speaker: Tatay Ramon**

Napadaan ka sa mabigat na panahon.

**Player**  
Ano pong nangyari rito?

**Tatay Ramon**  
Nagtanim kami sa tamang oras.  
Nangutang para sa binhi.  
Inayos ang lupa.  
Tapos naghintay sa tubig.

**Player**  
Hindi po umabot?

**Tatay Ramon**  
Hindi umabot nang maayos.  
Sabi may pondo na raw para sa ayos ng kanal.  
Hanggang sabi lang.  
Habang kami, araw-araw na naghihintay.

**Player**  
Kaya numipis ang tanim.

**Tatay Ramon**  
Oo.  
Hindi dahil tamad kami.  
Kulang ang tubig.

After this: progression should move toward `crops`.

## D. Interactable: dryCrops
**Speaker: Dry Crops**

Magaspang ang dahon.  
Kapit ang ugat.  
Pero hindi nabuo ang butil.  
May trabaho rito.  
Tubig lang ang hindi dumating.

**Player**  
Kita naman.  
May nag-alaga rito.

After first inspection: progression should move toward `canal`.

## E. Interactable: brokenCanal
Required combined sequence:

### canal
**Speaker: Narration**

Mas halata sa lapit ang sira.  
Bitak ang gilid.  
May putik sa bahaging dapat dinadaluyan ng tubig.  
May nagsabi nang ayos na raw ito.  
Pero hindi iyon ang nakikita mo.

**Player**  
Kung ayos na, bakit hanggang dito lang ang tubig?

### canalReveal
**Speaker: Narration**

Hindi lang ito simpleng malas sa panahon.  
May dapat naayos dito.  
May dapat na umabot.  
Pero naiwan ang sira kung saan ito pinaka-kailangan.

After this:
- irrigation is marked seen
- symbolic reveal happens
- progression moves toward `family`

## F. Interactable: projectPoster
**Speaker: Poster**

REPAIR FUNDED.  
PROJECT APPROVED.  
COMPLETED.

**Player**  
Completed?  
Sa itsura nito?

**Narration**  
Malinis ang papel.  
Sira pa rin ang kanal.

## G. Interactable: canalDamage
**Speaker: Canal Wall**

Bumuka ang semento.  
Huminto ang agos.  
Kasama ring huminto ang tiwala.

## H. Interactable: mother1
**Speaker: Aling Rosa**

Kapag kulang ang ani, hindi lang bukid ang tinatamaan.

**Player**  
Hanggang bahay po?

**Aling Rosa**  
Hanggang bahay.  
Doon na nagsisimula ang bawas.  
Kaunting ulam.  
Gamot mamaya na.  
Pamasahe kung may matira.  
Tapos pati baon at school money ni Mara, iniisip na rin.

**Player**  
Kayo po ang nag-aadjust sa lahat.

**Aling Rosa**  
May choice ba?  
Pag kapos, lahat tinitimbang.

## I. Interactable: child1
**Speaker: Mara**

Alam ko kapag worried si Nanay.

**Player**  
Paano mo nalalaman?

**Mara**  
Binibilang niya ulit ang bigas.  
Hinuhugasan niya ulit ang parehong plato.  
Tapos mahina silang magsalita ni Tatay.

**Player**  
Naririnig mo pa rin?

**Mara**  
Oo naman.  
Kapag umutang ulit si Tatay...  
makakapag-aral pa ba ako?

**Player**  
...

**Player**  
Hindi mo dapat iniisip 'yan nang ikaw lang.

After both `mother1` and `child1`: progression moves toward `reflection`.

## J. Interactable: fertilizerSack
**Speaker: Fertilizer Sack**

Halos ubos na.  
Bayad na ito bago pa umani.  
Nauna ang gastos.  
Naiwan ang utang.

## K. Interactable: debtLedger
**Speaker: Debt Ledger**

Maingat ang sulat.  
Mabigat ang bilang.  
Isang taniman,  
nakasandal sa susunod.

## L. Trigger: reflectionZone
**Speaker: Narration**

Sapat na ang nakita mo.  
Hindi lang ito tungkol sa init.  
Hindi lang ito simpleng tagtuyot.  
May tubig na dapat dumaloy.  
May kanal na dapat naayos.  
May tulong na dapat nakarating.

**Player**  
Napadaan lang ako rito kanina.

**Narration**  
Ngayon alam mo na.

**Player**  
Oo.  
At hindi na ako pwedeng tumingin lang.

**Narration**  
Kapag malinaw mo nang nakita ang bigat,  
may sagot ka nang kailangang ibigay.

After this:
- tasks unlock
- progression moves to `hub`

## M. Interactable: listenFarmerA
**Speaker: Mang Lito**

Hindi kami humihingi ng pabor.

**Player**  
Ano pong hinihingi ninyo?

**Mang Lito**  
Tubig na dapat nandito na.  
Patas na laban.  
Hayaan mong ang ani ang humusga sa amin,  
hindi ang delay ng iba.

**Player**  
Gaano na po katagal ito?

**Mang Lito**  
Matagal na.  
Sapat para masanay ang tao sa pangakong walang dating.

## N. Interactable: listenFarmerB
**Speaker: Nena**

Sa bayan, delay lang ang tawag nila rito.  
Parang papel lang ang nahuli.

**Player**  
Pero iba ang tama rito.

**Nena**  
Oo.  
Dito, ang delay, bawas sa hapunan.  
Bawas sa gamot.  
Bawas sa school.  
Kapag walang nakikinig, nagmumukha tuloy normal.

**Player**  
At hindi naman talaga normal.

**Nena**  
Hindi.  
Nasasanay lang ang tao sa tahimik.

## O. Sequence: listenComplete
**Speaker: Narration**

Nanatili ka para marinig ang buo.  
Mahalaga rin 'yon.  
May bigat na hindi mo mauunawaan  
kapag hindi ka muna nakikinig.

## P. Interactable / Task: documentBoard
Combined sequence:

### documentBoard
**Speaker: Community Board**

Isinusulat mo ang matagal nang pasan ng baryo.  
Sirang kanal.  
Pondong ipinangako.  
Ayos na hindi dumating.  
Utang na nadala sa susunod na tanim.  
Pagkain, gamot, at eskuwela na nagsisiksikan sa iisang budget.

**Player**  
Isulat nang diretso.  
Huwag pagaanin.

### documentComplete
**Speaker: Narration**

Maikli lang sa pahina.  
Pero mas mahirap na itong itanggi  
kapag nakapangalan na.

## Q. Interactable / Task: repairGate
Combined sequence:

### repairGateIntro
**Speaker: Water Gate**

Makunat pa.  
Kinakapitan ng putik at kalawang.  
Pero kahit maliit na bukas,  
may ibig sabihin sa palayang matagal nang naghihintay.

**Player**  
Sige lang.  
Subukan ulit.

### repairGateComplete
**Speaker: Narration**

May gumalaw.  
Hindi sapat.  
Pero totoo.  
At minsan, doon nagsisimula ang pag-asa.

**Player**  
Hindi pa ayos.  
Pero nagsimula.

## R. Sequence: hubUnlock
**Speaker: Narration**

Sira pa rin ang kanal.  
Nandoon pa rin ang utang.  
Mabigat pa rin ang bukas.  
Pero hindi na tahimik ang paghihintay.  
At hindi na nila ito pasan nang sila-sila lang.

After this:
- ending path unlocks
- player objective moves toward `ending`

## S. Trigger: gateReminder
No formal dialogue sequence.

Optional future line if needed:

**Player**  
May kulang pa.  
Hindi pa rito nagtatapos.

## T. Interactable: endingVillager
**Speaker: Tatay Ramon**

Mabigat pa rin ang bukas.  
Pero ngayong araw,  
hindi kami pinabayaang kami-kami lang.

## U. Trigger: endingNarrationZone
Combined sequence:

### endingNarration
**Speaker: Narration**

May umusad na tubig.  
Hindi pa sapat para sa lahat.  
Nandoon pa rin ang ledger.  
Nandoon pa rin ang kaba para sa susunod na tanim.  
Pero may gumalaw na hindi lang salita.

### endingVillager
**Speaker: Tatay Ramon**

Mabigat pa rin ang bukas.  
Pero ngayong araw,  
hindi kami pinabayaang kami-kami lang.

### endingGospel
**Speaker: Narration**

Hindi sapat ang awa kung hanggang tingin lang.  
Ang mabuting balita nagsisimula  
kapag may nakikinig,  
nagsasabi ng totoo,  
at nananatili kahit mahirap.

**Player**  
Hindi pa tapos.  
Pero hindi na rin ito tahimik.

After this:
- final narration flag is set
- `EndScene` starts

## 5. Ending Screen Copy

### Headline
Hope Begins

### Body
May umusad na tubig, kahit kaunti.  
Nandoon pa rin ang utang.  
Nandoon pa rin ang hirap ng susunod na tanim.  
Pero hindi na tahimik ang bigat na ito.  
At hindi na ito pasan nang mag-isa.

### Reflection
Ang mabuting balita hindi laging biglaan.  
Minsan nagsisimula ito sa pakikinig,  
sa katotohanan,  
at sa pag-stay kapag mahirap nang umalis.

## 6. Task Labels / Short UI Copy

### listen
**Label:** Listen

**Summary:** Makinig sa mga taong may pasan ng bigat.

### document
**Label:** Record

**Summary:** Isulat ang matagal nang hindi dapat tinatago.

### repair
**Label:** Repair

**Summary:** Simulan ang kayang galawin.

## 7. Mandatory vs Optional

### Mandatory story content
- `introNarration`
- `farmer1`
- `brokenCanal`
- `mother1`
- `child1`
- `reflectionZone`
- `listenFarmerA`
- `listenFarmerB`
- `listenComplete`
- `documentBoard`
- `documentComplete`
- `repairGateIntro`
- `repairGateComplete`
- `hubUnlock`
- `endingNarration`
- `endingVillager`
- `endingGospel`

### Optional flavor content
- `tutorialSign`
- `dryCrops`
- `projectPoster`
- `canalDamage`
- `fertilizerSack`
- `debtLedger`

## 8. Important Runtime Note

### Single interactions
- `tutorialSign`
- `farmer1`
- `dryCrops`
- `projectPoster`
- `canalDamage`
- `mother1`
- `child1`
- `fertilizerSack`
- `debtLedger`
- `listenFarmerA`
- `listenFarmerB`
- `endingVillager`

### Combined sequences
- `brokenCanal` = `canal` + `canalReveal`
- `documentBoard` = `documentBoard` + `documentComplete`
- `repairGate` = `repairGateIntro` + `repairGateComplete`
- final ending = `endingNarration` + `endingVillager` + `endingGospel`
