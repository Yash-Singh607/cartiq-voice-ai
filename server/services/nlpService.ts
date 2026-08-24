// Server-side NLP parser (mirrors src/services/nlpService.ts)
// Kept separate to allow server-only AI augmentation in the future.

const WORD_TO_NUM: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  twenty: 20, thirty: 30, fifty: 50, hundred: 100,
  uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
  ek: 1, do: 2, teen: 3, char: 4, paanch: 5, das: 10,
}

const UNITS = [
  'bottle', 'bottles', 'can', 'cans', 'pack', 'packs', 'box', 'boxes',
  'bag', 'bags', 'bunch', 'bunches', 'gallon', 'gallons', 'liter', 'liters',
  'kg', 'kilogram', 'kilograms', 'g', 'gram', 'grams', 'lb', 'pound', 'pounds',
  'oz', 'ounce', 'ounces', 'dozen', 'dozens', 'piece', 'pieces', 'item', 'items',
]

const CATEGORY_KEYWORDS: Record<string, string> = {
  milk: 'Dairy', cheese: 'Dairy', yogurt: 'Dairy', butter: 'Dairy', cream: 'Dairy', eggs: 'Dairy',
  apple: 'Produce', banana: 'Produce', orange: 'Produce', tomato: 'Produce', spinach: 'Produce',
  bread: 'Bakery', bagel: 'Bakery', croissant: 'Bakery',
  water: 'Beverages', juice: 'Beverages', coffee: 'Beverages', tea: 'Beverages',
  chips: 'Snacks', nuts: 'Snacks', chocolate: 'Snacks', candy: 'Snacks',
  soap: 'Household', detergent: 'Household', 'paper towels': 'Household',
  toothpaste: 'Personal Care', shampoo: 'Personal Care', sunscreen: 'Personal Care',
  rice: 'Pantry', pasta: 'Pantry', oil: 'Pantry', flour: 'Pantry',
}

function categorize(name: string): string {
  const n = name.toLowerCase()
  for (const [kw, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (n.includes(kw)) return cat
  }
  return 'Other'
}

function extractQuantity(text: string): { quantity: number; unit: string; cleaned: string } {
  let qty = 1, unit = 'item', cleaned = text
  const numUnitRe = new RegExp(
    `(\\d+|${Object.keys(WORD_TO_NUM).join('|')})\\s+(${UNITS.join('|')})\\s+(?:of\\s+)?`, 'i'
  )
  const m = cleaned.match(numUnitRe)
  if (m) {
    qty = parseInt(m[1]) || WORD_TO_NUM[m[1].toLowerCase()] || 1
    unit = m[2].toLowerCase()
    cleaned = cleaned.replace(m[0], '')
    return { quantity: qty, unit, cleaned }
  }
  const numRe = new RegExp(`(\\d+|${Object.keys(WORD_TO_NUM).join('|')})\\s+`, 'i')
  const nm = cleaned.match(numRe)
  if (nm) {
    const parsed = parseInt(nm[1]) || WORD_TO_NUM[nm[1].toLowerCase()] || 0
    if (parsed > 0) { qty = parsed; cleaned = cleaned.replace(nm[0], '') }
  }
  return { quantity: qty, unit, cleaned }
}

function extractPrice(text: string): { minPrice?: number; maxPrice?: number } {
  const between = text.match(/between\s+[\$₹€£]?(\d+(?:\.\d+)?)\s+and\s+[\$₹€£]?(\d+(?:\.\d+)?)/i)
  if (between) return { minPrice: parseFloat(between[1]), maxPrice: parseFloat(between[2]) }
  const under = text.match(/(?:under|below|less than|at most)\s+[\$₹€£]?(\d+(?:\.\d+)?)/i)
  if (under) return { maxPrice: parseFloat(under[1]) }
  const over = text.match(/(?:above|over|more than|at least)\s+[\$₹€£]?(\d+(?:\.\d+)?)/i)
  if (over) return { minPrice: parseFloat(over[1]) }
  return {}
}

const INTENTS = [
  { intent: 'ADD_ITEM', re: /\b(add|buy|get|need|want|purchase|pick up|grab|kharido|añade|agregar)\b/i },
  { intent: 'REMOVE_ITEM', re: /\b(remove|delete|take off|drop|hatao|quitar|eliminar)\b/i },
  { intent: 'UPDATE_ITEM', re: /\b(change|update|modify|set|increase|decrease)\b/i },
  { intent: 'SEARCH_PRODUCT', re: /\b(find|search|look for|show me|dhundo|busca)\b/i },
  { intent: 'GET_SUBSTITUTES', re: /\b(alternative|substitute|instead of|replacement for)\b/i },
  { intent: 'CLEAR_ITEM', re: /\b(bought|purchased|done|mark as done)\b/i },
  { intent: 'SHOW_LIST', re: /\b(show list|my list|shopping list)\b/i },
]

export function parseCommand(transcript: string) {
  const text = transcript.trim()
  if (!text) return { intent: 'UNKNOWN', confidence: 0, rawTranscript: transcript }

  let intent = 'UNKNOWN'
  for (const { intent: i, re } of INTENTS) {
    if (re.test(text)) { intent = i; break }
  }

  const prices = extractPrice(text)
  const { quantity, unit, cleaned } = extractQuantity(text)

  let product = cleaned
    .replace(/\b(add|buy|get|need|want|purchase|remove|delete|find|search|show me|change|update|set|bought|mark as|pick up|grab|kharido|lao|añade|agregar|busca|from my list|from the list|please|just|a|an|the|some|any|for|me|to|of|i|we)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const brandMatch = text.match(/\bfrom\s+([A-Z][a-zA-Z]+)/i)
  const brand = brandMatch ? brandMatch[1] : undefined

  return {
    intent,
    product: product || undefined,
    quantity,
    unit,
    brand,
    ...prices,
    category: product ? categorize(product) : 'Other',
    confidence: intent === 'UNKNOWN' ? 0.1 : product ? 0.85 : 0.5,
    rawTranscript: transcript,
  }
}
