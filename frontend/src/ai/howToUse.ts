/** Landing Ask AI opens Ask with this question already submitted. */
export const HOW_TO_USE_PROMPT =
  'How to Use This website to design my itinerary'

export function isHowToUsePrompt(raw: string) {
  return /\bhow to use this (web)?site\b|\bdesign my itinerary\b|\bhow (do i|to) (use|build).{0,60}itinerary\b/i.test(
    raw,
  )
}
