export type ExchangeChannel = {
  id: string
  label: string
  tone: 'good' | 'compare' | 'caution'
  summary: string
  tip?: string
}

export const EXCHANGE_CHANNELS: ExchangeChannel[] = [
  {
    id: 'bank',
    label: 'Bank / official exchange',
    tone: 'good',
    summary: 'Often reliable rates and clearer paperwork — hours and queues vary.',
    tip: 'Usually the safest baseline rate in major cities.',
  },
  {
    id: 'airport',
    label: 'Airport exchange',
    tone: 'compare',
    summary: 'Convenient on arrival. Compare the final amount, not only the board rate.',
    tip: 'Fine for a small arrival float — top up later in town.',
  },
  {
    id: 'hotel',
    label: 'Hotel desk',
    tone: 'compare',
    summary: 'Convenient but frequently less competitive — useful for small top-ups.',
    tip: 'Ask the all-in VND you’ll receive before handing cash.',
  },
  {
    id: 'tourist',
    label: 'Tourist-area exchange',
    tone: 'compare',
    summary: 'Can be fine; count notes carefully and confirm fees before handing cash.',
    tip: 'Compare 2–3 nearby desks; busy streets often hide weaker rates.',
  },
  {
    id: 'informal',
    label: 'Informal / unverified exchange',
    tone: 'caution',
    summary: 'Avoid — rate tricks and counterfeit risk outweigh any quoted “deal”.',
    tip: 'If it feels too good to be true, walk away.',
  },
]

export const EXCHANGE_CHECKLIST = [
  { id: 'rate', label: 'Quoted exchange rate', tip: 'Ask for the rate you will actually receive.' },
  { id: 'fee', label: 'Service fee', tip: 'Some desks hide fees outside the board rate.' },
  { id: 'final', label: 'Final amount received', tip: 'Calculate VND before you commit.' },
  { id: 'count', label: 'Denomination / counting', tip: 'Count notes in front of the teller.' },
  { id: 'receipt', label: 'Receipt', tip: 'Keep a record for disputes or large amounts.' },
] as const

/** How to chase a better deal — interactive tips for the Exchange tab */
export const EXCHANGE_PRICE_PLAYS = [
  {
    id: 'compare',
    title: 'Compare the final VND',
    body: 'Ignore flashy board rates. Ask: “How many đồng do I get for this exact amount?”',
    symbol: '01',
  },
  {
    id: 'timing',
    title: 'Skip the first desk you see',
    body: 'Airport and hotel counters trade convenience for margin. Change a little, then compare in town.',
    symbol: '02',
  },
  {
    id: 'notes',
    title: 'Bring clean, large notes',
    body: 'Crisp USD / EUR / GBP notes often get better treatment than torn or very small bills.',
    symbol: '03',
  },
  {
    id: 'walk',
    title: 'Be ready to walk',
    body: 'If fees appear late or counting feels rushed, leave. Another desk is usually nearby.',
    symbol: '04',
  },
] as const

export const PAYMENT_METHODS = [
  {
    id: 'cash',
    label: 'Cash (VND)',
    availability: 'Excellent',
    bestFor: 'Markets, street food, small vendors, tips',
    limits: 'Carry smaller notes; large bills can be hard to break',
    image:
      'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'card',
    label: 'Cards',
    availability: 'Good in formal businesses',
    bestFor: 'Hotels, larger restaurants, malls, booking platforms',
    limits: 'Less universal for sidewalk stalls and some taxis',
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'contactless',
    label: 'Contactless',
    availability: 'Growing in cities',
    bestFor: 'Modern cafés, chains, ride-hailing linked cards',
    limits: 'Do not assume every terminal supports it',
    image:
      'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'qr',
    label: 'QR / local wallets',
    availability: 'Common for locals',
    bestFor: 'Some cafés and shops once set up',
    limits: 'Often needs a Vietnamese bank/wallet — visitors usually rely on cash/card',
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
  },
] as const

export const ATM_GUIDANCE = {
  availability: 'Widespread in cities and tourist towns',
  typicalLimit: 'Often around 2–5 million VND per withdrawal — machine-dependent',
  atmFee: 'Many machines charge a local fee — amount varies by bank',
  foreignFee: 'Your card issuer may add foreign transaction fees — provider dependent',
  dcc: 'Decline dynamic currency conversion (charging in your home currency) when offered — usually worse value',
  bestPractice:
    'Prefer established bank-operated ATMs in well-lit locations. Check the total before confirming.',
}

/** Best places travellers typically find reliable ATMs */
/** Named ATM operators travellers actually see — availability is typical, not a live map. */
export const ATM_NETWORKS = [
  { name: 'Vietcombank', availability: 'Widely available nationwide — the usual tourist-friendly network' },
  { name: 'BIDV', availability: 'Widely available nationwide' },
  { name: 'VietinBank', availability: 'Widely available nationwide' },
  { name: 'Agribank', availability: 'Widely available, including smaller towns' },
  { name: 'Techcombank', availability: 'Widely available in cities and tourist areas' },
  { name: 'Sacombank', availability: 'Common in the south and major cities' },
  { name: 'MB Bank', availability: 'Common in cities' },
  { name: 'ACB', availability: 'Common in cities' },
  { name: 'VPBank', availability: 'Common in cities' },
  { name: 'TPBank', availability: 'Cities — some 24/7 LiveBank machines' },
] as const

export const ATM_LOCATIONS = [
  {
    id: 'bank',
    title: 'Bank branches',
    tag: 'Most reliable',
    summary: 'Vietcombank, BIDV, Agribank, Techcombank and similar — usually clearer fees.',
    image:
      'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&w=900&q=80',
    tips: ['Look for the bank logo on the machine', 'Daytime hours feel safer', 'Keep the receipt'],
  },
  {
    id: 'mall',
    title: 'Malls & big hotels',
    tag: 'Easy to find',
    summary: 'Air-conditioned lobbies and shopping centres cluster several machines together.',
    image:
      'https://images.unsplash.com/photo-1519567241046-7f570a22ce55?auto=format&fit=crop&w=900&q=80',
    tips: ['Good if you need a quiet, lit space', 'Compare fees across nearby machines', 'Watch for DCC prompts'],
  },
  {
    id: 'airport',
    title: 'Airports & stations',
    tag: 'Arrival float',
    summary: 'Useful for a first withdrawal — often busier and sometimes pricier.',
    image:
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80',
    tips: ['Take only what you need for day one', 'Top up later in town if possible', 'Stay alert in crowds'],
  },
  {
    id: 'street',
    title: 'Busy main streets',
    tag: 'Convenient',
    summary: 'Common in tourist corridors — stick to well-lit corners with foot traffic.',
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=900&q=80',
    tips: ['Avoid isolated side-alley machines at night', 'Cover the keypad', 'Walk away if anything feels odd'],
  },
] as const

export const ATM_FIND_ONLINE = [
  {
    id: 'maps',
    title: 'Offline-ready maps',
    body: 'Download Google / Apple offline maps for your city before you lose signal. Search “ATM” or a bank name.',
  },
  {
    id: 'ride',
    title: 'Ride-hailing pin',
    body: 'Grab / Be can drop you at a mall or bank once you have data — or use hotel Wi‑Fi to set the pin first.',
  },
  {
    id: 'bank-app',
    title: 'Bank locator pages',
    body: 'Screenshot Vietcombank / BIDV ATM pages while online so you still have addresses offline.',
  },
] as const

export const ATM_FIND_OFFLINE = [
  {
    id: 'ask',
    title: 'Ask at reception',
    body: 'Hotels and homestays almost always know the nearest bank ATM — ask for the bank name, not just “ATM”.',
  },
  {
    id: 'follow',
    title: 'Follow the logos',
    body: 'Walk toward main roads, petrol stations, pharmacies and supermarket fronts — ATMs cluster there.',
  },
  {
    id: 'landmark',
    title: 'Use landmarks',
    body: 'Point at a map in your guidebook or ask “ngân hàng?” (bank). Staff often walk you to the corner.',
  },
] as const

export const ATM_SCREEN_MOVES = [
  {
    id: 'vnd',
    title: 'Choose VND',
    body: 'Always withdraw in Vietnamese đồng, not your home currency.',
  },
  {
    id: 'dcc',
    title: 'Decline DCC',
    body: 'If asked to pay in USD/EUR/INR, say no — that conversion is usually worse.',
  },
  {
    id: 'fee',
    title: 'Read the fee screen',
    body: 'Confirm the local ATM fee and the amount before you accept.',
  },
  {
    id: 'limit',
    title: 'Watch the limit',
    body: 'If the machine caps out (~2–5M VND), do a second withdrawal rather than forcing a huge one.',
  },
] as const

export const CONVERTER_PRESETS = [
  { amount: 1, currency: 'USD', label: '$1' },
  { amount: 5, currency: 'USD', label: '$5' },
  { amount: 10, currency: 'USD', label: '$10' },
  { amount: 50, currency: 'USD', label: '$50' },
  { amount: 100, currency: 'INR', label: '₹100' },
  { amount: 500, currency: 'INR', label: '₹500' },
  { amount: 1000, currency: 'INR', label: '₹1,000' },
] as const

export const BASE_CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'SGD', 'CAD', 'JPY'] as const
