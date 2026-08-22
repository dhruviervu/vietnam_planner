import type { Experience } from '../types'

/**
 * Literary visitor-guide voice matching hand-written EXPERIENCE_GUIDES:
 * measured, practical, historically aware, etiquette-conscious, seasonal.
 * Targets ~1000 words for TTS + detail pages when a curated guide is absent.
 */
export function buildExperienceGuideStory(e: Experience): string {
  const place = e.city || e.region
  const regionNote =
    e.city !== e.region ? `${e.city} in ${e.region}` : e.city || e.region
  const priceBit =
    e.priceType === 'free' || e.price === 0
      ? 'Admission is free or donation-based at many related stops, though small fees, transport, and refreshments still add up.'
      : `Budget roughly from ${e.costLabel} for the core experience itself, then allow extra for transport, tips, and meals.`
  const access = e.accessibilityDetail
  const dna = e.dna.length ? e.dna.map((d) => d.toLowerCase()).join(', ') : e.category.toLowerCase()

  const paras = [
    `${e.name} is one of the experiences that gives ${regionNote} its particular character. ${e.about} ${e.whyGo} Visitors often arrive with a single photograph in mind, yet the place rewards a slower look: the surrounding streets, the working life around the site, and the small decisions that shape comfort, timing, and respect. Treat this guide as a practical companion rather than a rigid script. Local conditions, opening hours, ticket systems, and weather can change without notice, so verify details close to your visit and leave room for the unexpected.`,

    `Begin with orientation. ${place} is not a sealed museum district; it is a living setting where tourism, residence, commerce, and devotion share space. Arrive with a clear hotel address saved in Vietnamese, a charged phone, and a simple plan for getting there and back. ${e.bestTime} is generally the kindest window for light, temperature, and crowds, though ${e.hours} should be confirmed locally. A half-remembered blog post is a poor substitute for current information at the gate. If you are combining several stops in one day, place ${e.name} where its ${e.durationLabel.toLowerCase()} rhythm fits without forcing a breathless transfer.`,

    `What makes ${e.name} memorable is not only its headline view but the texture around it. Look for how people actually use the space: vendors setting up, students photographing graduation outfits, worshippers pausing at an altar, guides negotiating shade, children weaving through adult traffic. The DNA of this experience—${dna}—suggests the mood, yet mood alone is not a plan. Notice thresholds, steps, slippery stone, sudden sun, and narrow passages. ${access.walking} walking is the realistic expectation here, with wheelchair access described as ${access.wheelchair.toLowerCase()} and steps noted as ${access.steps.toLowerCase()}. Ask at the entrance for the gentlest route if mobility is limited.`,

    `History and meaning deepen the visit even when you are not a specialist. Vietnam’s landscapes and monuments carry layered stories of trade, empire, colonial pressure, war, reconstruction, pilgrimage, and contemporary leisure. You do not need to memorize dates to benefit from context; you do need enough humility to avoid treating sacred or solemn places as playgrounds. Dress with shoulders and knees covered where devotion or formal culture is visible, remove hats indoors when appropriate, and keep voices low near altars, tombs, and memorial displays. Never step over offerings, lean on ritual furniture, or pose in a way that mocks statues, monks, veterans, or grieving families.`,

    `Practical pacing matters more than collecting every viewpoint. ${e.hook} That first impression is worth protecting. Start earlier than you think you need to, carry water in a reusable bottle, and build a sit-down pause into the middle of the visit rather than only at the end. Heat, humidity, mist, and sudden rain can rewrite a day in minutes. From roughly November through March in the north, cool grey weather is common; summer elsewhere can be fierce and storm-prone. A light waterproof layer, secure footwear with grip, sun protection, and insect repellent earn their place far more often than an extra decorative outfit.`,

    `${priceBit} Agree prices before cyclo rides, private boats, or informal guides, and keep small notes for tickets, toilets, and tips. Established venues may accept cards with surcharges or intermittent connectivity; cash remains useful for smaller transactions. Beware of staged encounters that begin without a clear price—shoe shines, “free” bracelets, insistent photo sellers—and walk away politely if the terms are unclear. Most interactions are honest; clarity prevents the small disputes that sour an afternoon.`,

    `Food and drink near ${e.name} can be part of the memory if chosen with observation. Busy stalls with fast turnover are often a good sign. Look for ingredients protected from traffic dust and a clear washing system. Ask the price when it is not displayed, share tables when that is the local custom, and return bowls as directed. Disclose allergies without assuming that “no meat” automatically excludes fish sauce, shrimp paste, or stock. If you want a quieter meal, step one or two streets away from the densest tourist frontage; the quality is often higher and the pace kinder.`,

    `Photography should serve attention rather than replace it. Ask before closely photographing vendors, worshippers, school groups, or people at work. Drones are restricted in many locations and should never be flown without explicit permission. Tripods and commercial costume shoots may require approval. Give graduation parties and pilgrimage groups room to complete their ceremonies. The best frames usually come after you have walked the site once without a camera raised—when you understand where light falls, where people move, and where a quieter corner exists.`,

    `Crowds are part of popular Vietnam, especially on weekends, school holidays, and around Tet. ${e.popularityTag === 'Must do' || e.popularityTag === 'Popular' ? `${e.name} draws sustained attention for good reason, so patience is a skill.` : `${e.name} can feel quieter than the headline sights, which is an opportunity—use it without treating residents’ daily space as empty scenery.`} Large tour groups should avoid blocking entire lanes; individuals should keep voices moderate late at night near homes. If a viewpoint is saturated, wait five minutes or choose a secondary angle. The landscape rarely improves by forcing your way to the front of a line.`,

    `Getting there and away deserves the same care as the visit itself. Use reputable ride-hailing or metered taxis when tired, verify the vehicle registration, and wait where a driver can stop without blocking traffic. Motorbike rental is appropriate only for licensed, insured, experienced riders. On boats, wear life jackets as instructed, keep hands inside in caves or narrow channels, and follow the crew’s route rather than improvising for photographs. After a full outing of ${e.durationLabel.toLowerCase()}, avoid scheduling an immediate flight; traffic, weather, and embarkation formalities consume margins that look generous on a map.`,

    `Environmental care is not optional in a country whose coasts, caves, rivers, and karst fields are under real pressure. Carry litter out, decline unnecessary plastic, never take shells, stalactites, coral, or temple offerings as souvenirs, and do not feed monkeys or other wildlife. Stay on authorized paths; rice dikes and forest edges are workplaces and habitats, not open sets. Choose operators who handle waste responsibly and pay staff fairly. A quieter, well-run experience is worth more than a bargain that depends on overcrowding or wildlife harassment.`,

    `Finally, leave space for the unscripted. ${e.name} will not feel identical to an edited reel, and that is its strength. Mist can soften a bay; rain can empty a courtyard; a conversation at a stall can explain more than a caption. Read a little, walk slowly, ask simple questions, and accept that nature, ritual calendars, and city traffic—not the brochure—control parts of the day. Between the famous photograph and the journey home, the lasting pleasure is often the interval in which you simply stood still in ${place} and let the place arrange itself around you.`,
  ]

  let text = paras.join('\n\n')
  // Pad toward ~1000 words with a closing practical checklist if short
  const words = text.trim().split(/\s+/).length
  if (words < 950) {
    text += `\n\nBefore you go, run a short checklist specific to ${e.name}. Confirm opening hours and whether tickets are sold online, on site, or both. Decide your transport in advance for the return as well as the arrival. Pack water, a small amount of cash, sun or rain protection, and footwear that can handle ${access.steps.toLowerCase()}. If you are traveling with children or older companions, identify shaded rests and toilets early. If you care about quiet, ask about school-group peaks and evening entertainment nearby. If you care about learning, hire a licensed guide for an hour rather than collecting unstructured opinions from strangers at the gate. These small disciplines do not make the experience rigid; they make it generous. You arrive ready to notice, ready to yield space to locals, and ready to leave ${place} without needing the day to perform for you. That readiness is the difference between consuming a sight and understanding why travelers return to Vietnam with more than a set of images.`
  }
  return text
}
