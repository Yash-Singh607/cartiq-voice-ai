import type { Intent, ParsedCommand, Category } from '@/types'
import { categorize } from './categorizationService'

// ─── Number word mappings ─────────────────────────────────────────────────────
const NUMS: Record<string, number> = {
  zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,
  eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,
  eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,hundred:100,
  // Hindi
  ek:1,do:2,teen:3,char:4,paanch:5,chhe:6,saat:7,aath:8,nau:9,das:10,
  // Spanish
  uno:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,
}

const UNITS = [
  'bottle','bottles','can','cans','pack','packs','box','boxes','bag','bags',
  'bunch','bunches','gallon','gallons','liter','liters','litre','litres',
  'kg','kilogram','kilograms','g','gram','grams','lb','pound','pounds',
  'oz','ounce','ounces','dozen','dozens','piece','pieces','item','items',
  'jar','jars','tube','tubes','roll','rolls','cup','cups','ml','l',
]

const ATTRIBUTES = [
  'organic','natural','low fat','fat free','sugar free','gluten free','vegan',
  'vegetarian','whole grain','low sodium','unsweetened','light','diet','fresh',
  'frozen','canned','raw','premium','cold pressed',
]

// ─── Intent patterns ─────────────────────────────────────────────────────────
const INTENT_RULES: { intent: Intent; patterns: RegExp[]; conf: number }[] = [
  { intent: 'ADD_ITEM', conf: 0.95, patterns: [
    /\b(add|put|include|insert)\b/i,
    /\b(i need|i want|i'?d like|i would like)\b/i,
    /\b(buy|purchase|get|pick up|grab)\b/i,
    /\b(remember to buy|don'?t forget|we need)\b/i,
    /\b(jod[oa]|chahiye|kharido|lao)\b/i,    // Hindi
    /\b(añad[ei]|agregar|agrega|necesito|quiero|comprar|pon)\b/i, // Spanish
  ]},
  { intent: 'REMOVE_ITEM', conf: 0.95, patterns: [
    /\b(remove|delete|take off|take out|drop)\b/i,
    /\b(don'?t need|do not need|cancel)\b/i,
    /\b(hatao|nikalo)\b/i,
    /\b(quita|elimina|borrar|quitar)\b/i,
  ]},
  { intent: 'UPDATE_ITEM', conf: 0.90, patterns: [
    /\b(change|update|modify|set|make it|increase|decrease)\b/i,
    /\b(quantity to|amount to|more|less)\b/i,
  ]},
  { intent: 'SEARCH_PRODUCT', conf: 0.90, patterns: [
    /\b(find|search|look for|show me|browse)\b/i,
    /\b(dhundo|khoojo|dikhao)\b/i,
    /\b(busca|buscar|encuentra|mu[eé]strame)\b/i,
  ]},
  { intent: 'GET_SUBSTITUTES', conf: 0.92, patterns: [
    /\b(alternative|substitute|instead of|replacement for|options for)\b/i,
    /\b(what else|similar to|swap)\b/i,
    /\b(show alternatives|find alternatives)\b/i,
  ]},
  { intent: 'GET_RECOMMENDATIONS', conf: 0.88, patterns: [
    /\b(recommend|suggest|what should i|what do i need)\b/i,
    /\b(show recommendations|what else should)\b/i,
  ]},
  { intent: 'SHOW_LIST', conf: 0.95, patterns: [
    /\b(show list|my list|shopping list|what'?s on)\b/i,
  ]},
  { intent: 'CLEAR_ITEM', conf: 0.90, patterns: [
    /\b(bought|purchased|done|mark as (done|bought|purchased))\b/i,
    /\b(i got|already have)\b/i,
  ]},
]

function extractPrice(text: string) {
  const between = text.match(/between\s+[₹$€£]?(\d+(?:\.\d+)?)\s+and\s+[₹$€£]?(\d+(?:\.\d+)?)/i)
  if (between) return { minPrice: +between[1], maxPrice: +between[2] }
  const under = text.match(/(?:under|below|less than|at most|max|se kam|menos de)\s+[₹$€£]?(\d+(?:\.\d+)?)/i)
  if (under) return { maxPrice: +under[1] }
  const over = text.match(/(?:above|over|more than|at least)\s+[₹$€£]?(\d+(?:\.\d+)?)/i)
  if (over) return { minPrice: +over[1] }
  // "under ₹300" or "₹300 se kam"
  const direct = text.match(/[₹$€£](\d+(?:\.\d+)?)\s*(?:se kam|se zyada)?/i)
  if (direct) {
    if (text.match(/se kam/i)) return { maxPrice: +direct[1] }
    return { maxPrice: +direct[1] }
  }
  return {}
}

function extractQuantityUnit(text: string): { quantity: number; unit: string; cleaned: string } {
  let q = 1, unit = 'item', cleaned = text
  const numUnitRe = new RegExp(
    `(\\d+(?:\\.\\d+)?|${Object.keys(NUMS).join('|')})\\s+(${UNITS.join('|')})\\s+(?:of\\s+)?`, 'i'
  )
  const m = cleaned.match(numUnitRe)
  if (m) {
    q = parseFloat(m[1]) || NUMS[m[1].toLowerCase()] || 1
    unit = m[2].toLowerCase()
    cleaned = cleaned.replace(m[0], '').trim()
    return { quantity: q, unit, cleaned }
  }
  const numRe = new RegExp(`(\\d+(?:\\.\\d+)?|${Object.keys(NUMS).join('|')})\\s+`, 'i')
  const nm = cleaned.match(numRe)
  if (nm) {
    const parsed = parseFloat(nm[1]) || NUMS[nm[1].toLowerCase()] || 0
    if (parsed > 0) { q = parsed; cleaned = cleaned.replace(nm[0], '').trim() }
  }
  return { quantity: q, unit, cleaned }
}

const STRIP_WORDS = /\b(add|buy|get|need|want|purchase|remove|delete|find|search|show|me|change|update|set|mark|bought|please|just|a|an|the|some|any|for|to|of|on|in|i|we|my|me|instead|from|with|and|or|it|this|that|ok|okay|can|could|would|you)\b/gi

export function parseCommand(transcript: string): ParsedCommand {
  const text = transcript.trim()
  if (!text) return { intent: 'UNKNOWN', confidence: 0, rawTranscript: transcript }

  let bestIntent: Intent = 'UNKNOWN'
  let bestConf = 0
  for (const { intent, patterns, conf } of INTENT_RULES) {
    if (patterns.some(p => p.test(text)) && conf > bestConf) {
      bestConf = conf
      bestIntent = intent
    }
  }

  const prices = extractPrice(text)
  let cleaned = text

  // UPDATE_ITEM special handling
  if (bestIntent === 'UPDATE_ITEM') {
    const um = text.match(/(?:change|update|set)\s+(.+?)\s+(?:quantity\s+)?to\s+(\d+)/i)
    if (um) {
      return {
        intent: 'UPDATE_ITEM', product: um[1].trim(), quantity: +um[2],
        unit: 'item', confidence: bestConf, rawTranscript: transcript,
        category: categorize(um[1]) as Category,
        ...prices,
      }
    }
  }

  const { quantity, unit, cleaned: afterQty } = extractQuantityUnit(cleaned)
  cleaned = afterQty

  const brandM = cleaned.match(/\bfrom\s+([A-Z][a-zA-Z\s]{1,20}?)(?:\s+(?:brand|products?))?(?:\s|$)/i)
  const brand = brandM ? brandM[1].trim() : undefined
  if (brand) cleaned = cleaned.replace(brandM![0], ' ')

  const foundAttrs = ATTRIBUTES.filter(a => cleaned.toLowerCase().includes(a))
  for (const a of foundAttrs) cleaned = cleaned.replace(new RegExp(`\\b${a}\\b`, 'gi'), ' ')

  // Strip intent trigger words
  const stripPatterns: Partial<Record<Intent, RegExp>> = {
    ADD_ITEM: /\b(add|put|include|buy|purchase|get|pick up|grab|i need|i want|i'?d like|remember to buy|don'?t forget|we need|jodo|chahiye|kharido|lao|añade|añadir|agregar|agrega|necesito|quiero|comprar|pon)\b/gi,
    REMOVE_ITEM: /\b(remove|delete|take off|drop|don'?t need|cancel|hatao|nikalo|quita|elimina|borrar)\b/gi,
    SEARCH_PRODUCT: /\b(find|search|look for|show me|browse|dhundo|khoojo|busca|buscar|encuentra|muéstrame)\b/gi,
    GET_SUBSTITUTES: /\b(find|show|get)?\s*(alternative[s]?|substitute[s]?|instead of|replacement for|options for|similar to)\b/gi,
  }
  const stripRe = stripPatterns[bestIntent]
  if (stripRe) cleaned = cleaned.replace(stripRe, ' ')

  let product = cleaned
    .replace(STRIP_WORDS, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Remove price phrases from product name
  product = product
    .replace(/(?:under|below|less than|above|over|between)[^a-z]*/gi, '')
    .replace(/[₹$€£]\d+(?:\.\d+)?/g, '')
    .replace(/\d+(?:\.\d+)?\s*(?:rupees?|dollars?|euros?)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const confidence = bestConf * (product ? 1 : 0.5)

  return {
    intent: bestIntent,
    product: product || undefined,
    quantity,
    unit,
    brand,
    ...prices,
    category: product ? (categorize(product) as Category) : undefined,
    attributes: foundAttrs.length ? foundAttrs : undefined,
    confidence,
    rawTranscript: transcript,
  }
}

export function detectLanguage(text: string): 'hi-IN' | 'es-ES' | 'en-US' {
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'
  if (/\b(añade|necesito|quiero|busca|comprar|quita|agregar)\b/i.test(text)) return 'es-ES'
  return 'en-US'
}
