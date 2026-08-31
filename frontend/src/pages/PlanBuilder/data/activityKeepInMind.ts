/**
 * Personalized Keep in Mind copy for a small set of activities.
 *
 * There are 52 city activities. Filling unique multi-paragraph copy for every
 * heading on every item is a large writing job — add more ids here over time.
 * Activities without an entry fall back to generated copy in activityDetailCopy.ts.
 */
export type ActivityKeepInMind = {
  where: string
  what: string
  expect: string
  bring: string
  know: string
}

export const ACTIVITY_KEEP_IN_MIND: Record<string, ActivityKeepInMind> = {
  'hn-cooking-home': {
    where:
      'Book a family kitchen in or just outside Hanoi’s Old Quarter — lanes around Hang Be, Hang Bac, or a townhouse toward the French Quarter. The point is a real stove, a shared table, and a host who cooks this way most weeks, not a hotel buffet demo. Skip classes that never leave a restaurant dining room. Many hosts include a short wet-market stop first; confirm the meeting point the night before (a café or the house gate) so you are not hunting an alley with a Grab pin that is two doors off.',
    what:
      'This is a small-group home kitchen class: you chop, season, fry, and wrap beside the person who actually cooks for their family. Typical dishes are bun cha, nem (spring rolls), a seasonal stir-fry, or a dipping sauce you will use all trip. You sit down together and eat what you made. It is not a chef’s-table performance and not a street-food crawl — it is one house, a few hours, and the rhythm of a Hanoi lunch.',
    expect:
      'Set aside three to four hours. You will stand at a counter, get a little smoky, and ask a lot of questions. English varies by host; gestures and tasting still work. Class size should stay small — six people at a home stove is already a crowd. The market stop, if included, is short and cash-friendly. You leave full, with a recipe card or phone photos, not a diploma. If someone in your group has shellfish, peanut, or gluten needs, say so when you book, not at the chopping board.',
    bring:
      'Closed-toe shoes, hair tied back, and clothes that can take a splash of fish sauce or oil. Note allergies and spice comfort when you reserve. Small cash is useful for the market, a soft drink, or a thank-you if the class is in a private home. Leave bulky bags at the hotel; kitchens are tight. A phone is enough for recipes — you will not need a laptop.',
    know:
      'From about $35 as a starting point; confirm whether market ingredients, drinks, and hotel pickup are included. This fits food lovers, couples, and first-timers who want a slower Hanoi morning. Ask whether you cook every dish or watch one volunteer while staff finish the rest — a hands-on class means you touch the food. Tip fairly if the host taught in their own kitchen. Add it to your trip as a flexible activity, not a rigid sightseeing slot.',
  },
  'hn-tai-chi-lake': {
    where:
      'Hoan Kiem Lake is the easy join-in: the east bank near Ngoc Son Temple, from about 5:30 to 7:00, when regulars already have a circle going. Lenin Park (Thong Nhat) has weekend groups if the lake feels too tourist-dense. Walk up, watch one round from the back, then step in. There is no ticket booth and no official start time. Hotel “sunrise tai chi” on a rooftop is a different, paid product — fine if you want instruction, not this lakeside public rhythm.',
    what:
      'This is Hanoi’s public morning practice: slow forms, deep breath, and a social circle of locals who have been coming for years. You are a guest in an existing habit, not the star of a class. Some mornings a volunteer counts; most mornings you copy the person in front of you. Soft, free if you join the open circle, and over before the scooter roar fully arrives.',
    expect:
      'Forty-five to sixty minutes if you stay for a full set; you can leave after one round. Arrive 10–15 minutes early and stand at the back. Nobody scores you. If the group uses a speaker, the volume is modest. Photographing people in the circle without a smile and a nod is poor form. Afterward the lake path is for coffee and watching the city wake — that is part of the outing.',
    bring:
      'Soft shoes or bare feet, a light layer for the dawn chill, and water if you tend to run dry. Leave valuables zipped. You do not need a mat. If you want a taught intro instead of copying, ask your hotel for a paid lakeside session — bring cash for that separately.',
    know:
      'Usually free; a small tip is the right thank-you only if someone clearly taught you, not for sharing public park space. Fits early risers and slow travel. The lake is busiest on weekends and around Tet. If you sleep badly, skip it rather than arriving groggy and blocking the regulars. This is an activity slot we can drop in on a Hanoi morning without rearranging the whole day.',
  },
  'ha-lantern-make': {
    where:
      'Workshops sit on Nguyen Thai Hoc and nearby old-town lanes in Hoi An, where frames, silk, and glue are already on the table. You leave with the lantern and can hang it that evening. Ancient-town kiosks selling ready-made lanterns are shopping, not this. Book a seat for late afternoon if you want to walk out into lantern hour with something you actually folded.',
    what:
      'A short craft workshop: you build a bamboo or wire frame, stretch silk or paper, and finish a Hoi An-style lantern you can pack or gift. The maker shows one technique; you try it once or twice at a bench. It is seated, tactile, and over in well under half a day — a souvenir with a story rather than a stall purchase.',
    expect:
      'About one to two hours. Hands get sticky. Your first lantern will look handmade, which is the point. English is usually enough for the steps. Evening light is when the piece looks finished; if you book at noon, take it back out after dark. Ask whether the silk is included or if upgrades cost extra before you sit down.',
    bring:
      'An old shirt or apron mindset — dye and glue happen. Hand wipes help. Cash if you want a second lantern or a larger size from the same studio. You do not need tools. Leave the lantern’s hanging loop free; it is easier to carry through the old town than a shopping bag of souvenirs.',
    know:
      'Price varies by size and silk; confirm before you start so the “from” rate is not a tiny sample. Unique, photogenic, and easy to slot beside an old-town wander. Pack the lantern in clothes, not crushed under a suitcase of coffee. If you only want the photo, buy a ready-made one and skip the class — this is for people who want to make the object.',
  },
}
