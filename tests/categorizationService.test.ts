import { describe, it, expect } from 'vitest'
import { categorize } from '../src/services/categorizationService'

describe('categorize', () => {
  it('milk → Dairy',         () => expect(categorize('milk')).toBe('Dairy'))
  it('almond milk → Dairy',  () => expect(categorize('almond milk')).toBe('Dairy'))
  it('Apples → Produce',     () => expect(categorize('Apples')).toBe('Produce'))
  it('Bread → Bakery',       () => expect(categorize('Bread')).toBe('Bakery'))
  it('Water → Beverages',    () => expect(categorize('Water')).toBe('Beverages'))
  it('Toothpaste → Personal Care', () => expect(categorize('Toothpaste')).toBe('Personal Care'))
  it('Chicken → Meat',       () => expect(categorize('Chicken')).toBe('Meat'))
  it('Shampoo → Personal Care', () => expect(categorize('Shampoo')).toBe('Personal Care'))
  it('Rice → Pantry',        () => expect(categorize('Rice')).toBe('Pantry'))
  it('unknown → Other',      () => expect(categorize('xyzzy99')).toBe('Other'))
})
