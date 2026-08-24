import type { Category } from '@/types'

const MAP: Record<string, Category> = {
  // Dairy
  milk: 'Dairy', 'almond milk': 'Dairy', 'oat milk': 'Dairy', 'soy milk': 'Dairy',
  'coconut milk': 'Dairy', cheese: 'Dairy', cheddar: 'Dairy', mozzarella: 'Dairy',
  parmesan: 'Dairy', brie: 'Dairy', yogurt: 'Dairy', curd: 'Dairy', butter: 'Dairy',
  cream: 'Dairy', paneer: 'Dairy', ghee: 'Dairy', eggs: 'Dairy', egg: 'Dairy',
  // Produce
  apple: 'Produce', banana: 'Produce', orange: 'Produce', mango: 'Produce', grapes: 'Produce',
  strawberry: 'Produce', berries: 'Produce', pear: 'Produce', peach: 'Produce',
  watermelon: 'Produce', avocado: 'Produce', lemon: 'Produce', lime: 'Produce',
  pomegranate: 'Produce', kiwi: 'Produce', papaya: 'Produce', guava: 'Produce',
  tomato: 'Produce', spinach: 'Produce', kale: 'Produce', broccoli: 'Produce',
  cauliflower: 'Produce', carrot: 'Produce', onion: 'Produce', garlic: 'Produce',
  ginger: 'Produce', potato: 'Produce', cucumber: 'Produce', lettuce: 'Produce',
  capsicum: 'Produce', beetroot: 'Produce', cabbage: 'Produce', corn: 'Produce',
  mushroom: 'Produce', peas: 'Produce', beans: 'Produce', okra: 'Produce',
  // Bakery
  bread: 'Bakery', sourdough: 'Bakery', bagel: 'Bakery', croissant: 'Bakery',
  muffin: 'Bakery', cake: 'Bakery', cookie: 'Bakery', biscuit: 'Bakery',
  roll: 'Bakery', bun: 'Bakery', pita: 'Bakery', flatbread: 'Bakery', loaf: 'Bakery',
  // Beverages
  water: 'Beverages', juice: 'Beverages', soda: 'Beverages', cola: 'Beverages',
  coffee: 'Beverages', tea: 'Beverages', chai: 'Beverages', lemonade: 'Beverages',
  'energy drink': 'Beverages', kombucha: 'Beverages', 'coconut water': 'Beverages',
  'health drink': 'Beverages', bournvita: 'Beverages', horlicks: 'Beverages',
  'mango lassi': 'Beverages', 'lassi drink': 'Beverages',
  // Snacks
  chips: 'Snacks', crackers: 'Snacks', popcorn: 'Snacks', nuts: 'Snacks',
  almonds: 'Snacks', cashews: 'Snacks', namkeen: 'Snacks', chocolate: 'Snacks',
  candy: 'Snacks', granola: 'Snacks', 'protein bar': 'Snacks', bar: 'Snacks',
  biscuits: 'Snacks', oreo: 'Snacks', kitkat: 'Snacks',
  // Pantry
  rice: 'Pantry', pasta: 'Pantry', flour: 'Pantry', atta: 'Pantry', sugar: 'Pantry',
  salt: 'Pantry', oil: 'Pantry', vinegar: 'Pantry', sauce: 'Pantry', dal: 'Pantry',
  lentils: 'Pantry', oats: 'Pantry', muesli: 'Pantry', 'peanut butter': 'Pantry',
  honey: 'Pantry', jam: 'Pantry', pickle: 'Pantry', noodles: 'Pantry', maggi: 'Pantry',
  turmeric: 'Pantry', masala: 'Pantry', spice: 'Pantry', cereal: 'Pantry',
  // Meat
  chicken: 'Meat', beef: 'Meat', mutton: 'Meat', fish: 'Meat', salmon: 'Meat',
  tuna: 'Meat', shrimp: 'Meat', prawn: 'Meat', bacon: 'Meat', sausage: 'Meat',
  // Household
  soap: 'Household', detergent: 'Household', bleach: 'Household', cleaner: 'Household',
  'dishwash': 'Household', 'dish wash': 'Household', mop: 'Household', broom: 'Household',
  toilet: 'Household', harpic: 'Household', vim: 'Household', pril: 'Household',
  'trash bags': 'Household', 'garbage bag': 'Household', 'paper towels': 'Household',
  laundry: 'Household', surf: 'Household', ariel: 'Household', scotch: 'Household',
  // Personal Care
  toothpaste: 'Personal Care', shampoo: 'Personal Care', conditioner: 'Personal Care',
  moisturiser: 'Personal Care', moisturizer: 'Personal Care', sunscreen: 'Personal Care',
  deodorant: 'Personal Care', deo: 'Personal Care', razor: 'Personal Care',
  lotion: 'Personal Care', 'face wash': 'Personal Care', 'body wash': 'Personal Care',
  perfume: 'Personal Care', 'hand wash': 'Personal Care', sanitizer: 'Personal Care',
  dettol: 'Personal Care', dove: 'Personal Care', himalaya: 'Personal Care', nivea: 'Personal Care',
  // Frozen
  'ice cream': 'Frozen', 'frozen': 'Frozen', cornetto: 'Frozen', magnum: 'Frozen',
  waffles: 'Frozen',
}

export function categorize(name: string): Category {
  const n = name.toLowerCase().trim()
  if (MAP[n]) return MAP[n]
  // longest phrase match first
  const sorted = Object.keys(MAP).sort((a, b) => b.length - a.length)
  for (const phrase of sorted) {
    if (n.includes(phrase)) return MAP[phrase]
  }
  return 'Other'
}

export const ALL_CATEGORIES: Category[] = [
  'Produce','Dairy','Meat','Bakery','Beverages','Snacks','Household','Personal Care','Frozen','Pantry','Other',
]

export const CATEGORY_EMOJI: Record<Category, string> = {
  Produce: '🥦', Dairy: '🥛', Meat: '🥩', Bakery: '🍞', Beverages: '🥤',
  Snacks: '🍿', Household: '🧹', 'Personal Care': '🧴', Frozen: '🧊', Pantry: '🫙', Other: '🛒',
}

export const CATEGORY_COLOR: Record<Category, { bg: string; text: string; border: string }> = {
  Produce:         { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Dairy:           { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  Meat:            { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  Bakery:          { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  Beverages:       { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200' },
  Snacks:          { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  Household:       { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  'Personal Care': { bg: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-200' },
  Frozen:          { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200' },
  Pantry:          { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200' },
  Other:           { bg: 'bg-slate-50',     text: 'text-slate-600',     border: 'border-slate-200' },
}
