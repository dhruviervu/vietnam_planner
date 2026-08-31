import type { Experience } from '../types'

/**
 * Item-specific visitor guide assembled only from this experience’s catalog fields.
 * Sections that do not apply to the item are omitted (no generic temple etiquette on a
 * cooking class, no “eating nearby” filler on a cave).
 */
export function buildExperienceGuideStory(e: Experience): string {
  const place = e.city || e.region
  const regionNote =
    e.city !== e.region ? `${e.city} in ${e.region}` : e.city || e.region
  const access = e.accessibilityDetail
  const dna = e.dna.length ? e.dna.map((d) => d.toLowerCase()).join(', ') : e.category.toLowerCase()
  const hay = `${e.id} ${e.name} ${e.category} ${e.tags.join(' ')} ${e.dna.join(' ')}`
  const sacred =
    e.category === 'History' ||
    /pagoda|temple|tomb|citadel|mausoleum|museum|sanctuary|prison|palace/i.test(hay)
  const foodish = /coffee|food|cook|market|bia-hoi|cafe|street food/i.test(hay)
  const natureish =
    e.category === 'Nature' ||
    e.category === 'Beaches' ||
    /cruise|cave|trek|beach|bay|snorkel|kayak|loop|waterfall/i.test(hay)
  const urban = e.category === 'Cities' || /quarter|street|lake|bridge|walking/i.test(hay)
  const adventure = e.category === 'Adventure' || /loop|trek|cave|kayak|snorkel/i.test(hay)

  const priceBit =
    e.priceType === 'free' || e.price === 0
      ? `${e.name} is free or donation-based (${e.costLabel}). Small fees, transport, and refreshments still add up around ${place}.`
      : `Budget from ${e.costLabel} for ${e.name} itself, then allow extra for transport, tips, and meals in ${place}.`

  const paras: string[] = []

  paras.push(
    `${e.name} is the reason many travellers come to ${regionNote}. ${e.about} ${e.whyGo} This guide stays inside the scope of this one experience—how long it takes (${e.durationLabel.toLowerCase()}), when it feels best (${e.bestTime}), and how to move through it without treating ${place} as a backdrop.`,
  )

  paras.push(
    `Finding your way. ${place} is where ${e.name} actually happens, not a generic Vietnam set. Hours are listed as ${e.hours}; confirm them locally the day you go. ${e.bestTime} is the kindest window for this stop. Slot it into a day that can absorb ${e.durationLabel.toLowerCase()} without a breathless transfer. Save a hotel or pickup pin in Vietnamese and a charged phone for the ride back.`,
  )

  paras.push(
    `The experience. ${e.hook} The feel of this outing is ${dna}. ${access.walking} walking is the realistic expectation, with wheelchair access described as ${access.wheelchair.toLowerCase()} and steps noted as ${access.steps.toLowerCase()}. Ask at the gate or meeting point for the gentlest route if mobility is limited. The memorable part is the sequence of ${e.name} itself, not a checklist of nearby icons.`,
  )

  paras.push(
    `How long to allow. Set aside ${e.durationLabel.toLowerCase()} for ${e.name}, then a buffer for ${place} traffic and the return. Starting earlier than you think you need protects ${e.hook.replace(/\.$/, '')}. If you are stacking other stops the same day, put this one where its length actually fits.`,
  )

  paras.push(
    `Practical details. ${priceBit} ${e.accessibility} Cash still helps for small tickets and tips around ${place}. Agree prices before informal boats, xe om, or add-on guides attached to ${e.name}.`,
  )

  if (sacred) {
    paras.push(
      `History and setting. ${e.about} ${e.name} sits in ${regionNote} as a heritage or commemorative place, not a playground. Dress with shoulders and knees covered if devotion or formal rooms are part of the visit, keep voices low near altars or memorials, and never pose in a way that mocks statues, monks, veterans, or families. The meaning of this stop is specific to ${e.name}—read the rooms you are actually in.`,
    )
  }

  if (foodish) {
    paras.push(
      `Eating nearby. For ${e.name}, taste is the point. ${e.about} Watch turnover, posted prices, and whether the stall or kitchen is doing one thing well. Order the specialty first. Disclose allergies without assuming “no meat” excludes fish sauce or stock. Do not block the cooking line for photographs.`,
    )
  }

  if (natureish || adventure) {
    paras.push(
      `Seasons and packing. ${e.name} is shaped by weather and ground underfoot around ${place}. ${e.bestTime} is the window this outing is built for. Wear shoes that grip wet stone or boat decks, carry water, and follow crew or park instructions even when they shorten a stop. Stay on authorized paths; wildlife and other visitors share the same space.`,
    )
  }

  if (e.popularityTag === 'Must do' || e.popularityTag === 'Popular' || urban) {
    paras.push(
      `Crowds and timing. ${e.name} is ${e.popularityTag.toLowerCase()} in ${place} (${e.reviewCount.toLocaleString()} reviews at ${e.rating}). Weekends, school holidays, and Tet make queues longer. If a viewpoint or stall is saturated, wait or take a secondary angle rather than forcing the famous frame.`,
    )
  }

  paras.push(
    `Getting there and away. Treat the ride to ${e.name} as part of the outing. Use reputable ride-hailing or metered taxis when tired, and wait where a driver can stop without blocking traffic. After ${e.durationLabel.toLowerCase()}, do not schedule an immediate flight from ${place}; traffic and embarkation eat the margin that looks generous on a map.`,
  )

  if (natureish) {
    paras.push(
      `Caring for the place. At ${e.name}, carry litter out, skip unneeded plastic, and do not take shells, coral, stalactites, or offerings as souvenirs. Choose operators who handle waste and pay staff. The landscape around ${place} is the experience—leave it intact.`,
    )
  }

  paras.push(
    `A last thought. ${e.name} will not match an edited reel, and that is the point. ${e.whyGo} Walk the visit you actually booked in ${place}, ask simple questions, and let this one stop arrange itself around you.`,
  )

  return paras.join('\n\n')
}
