import { describe, it, expect } from 'vitest'
import { parseCommand } from '../src/services/nlpService'

describe('NLP parseCommand', () => {
  it('parses "Add milk"', () => {
    const r = parseCommand('Add milk')
    expect(r.intent).toBe('ADD_ITEM')
    expect(r.product?.toLowerCase()).toBe('milk')
    expect(r.confidence).toBeGreaterThan(0.7)
  })

  it('parses "I need milk"', () => {
    expect(parseCommand('I need milk').intent).toBe('ADD_ITEM')
  })

  it('parses "I want to buy milk"', () => {
    expect(parseCommand('I want to buy milk').intent).toBe('ADD_ITEM')
  })

  it('parses "Add 2 bottles of water"', () => {
    const r = parseCommand('Add 2 bottles of water')
    expect(r.intent).toBe('ADD_ITEM')
    expect(r.product?.toLowerCase()).toContain('water')
    expect(r.quantity).toBe(2)
    expect(r.unit).toBe('bottles')
  })

  it('parses "Buy 5 oranges"', () => {
    const r = parseCommand('Buy 5 oranges')
    expect(r.intent).toBe('ADD_ITEM')
    expect(r.quantity).toBe(5)
  })

  it('parses "Add two bottles of milk"', () => {
    const r = parseCommand('Add two bottles of milk')
    expect(r.quantity).toBe(2)
    expect(r.unit).toBe('bottles')
  })

  it('parses "Remove milk"', () => {
    const r = parseCommand('Remove milk')
    expect(r.intent).toBe('REMOVE_ITEM')
    expect(r.product?.toLowerCase()).toBe('milk')
  })

  it('parses "Remove bananas from my list"', () => {
    const r = parseCommand('Remove bananas from my list')
    expect(r.intent).toBe('REMOVE_ITEM')
    expect(r.product?.toLowerCase()).toContain('banana')
  })

  it('parses "Change milk quantity to 3"', () => {
    const r = parseCommand('Change milk quantity to 3')
    expect(r.intent).toBe('UPDATE_ITEM')
    expect(r.quantity).toBe(3)
  })

  it('parses "Find organic apples"', () => {
    const r = parseCommand('Find organic apples')
    expect(r.intent).toBe('SEARCH_PRODUCT')
    expect(r.attributes).toContain('organic')
  })

  it('parses "Find toothpaste under ₹300"', () => {
    const r = parseCommand('Find toothpaste under ₹300')
    expect(r.intent).toBe('SEARCH_PRODUCT')
    expect(r.maxPrice).toBe(300)
  })

  it('parses "Find shampoo between ₹300 and ₹700"', () => {
    const r = parseCommand('Find shampoo between ₹300 and ₹700')
    expect(r.intent).toBe('SEARCH_PRODUCT')
    expect(r.minPrice).toBe(300)
    expect(r.maxPrice).toBe(700)
  })

  it('parses "Show alternatives to milk"', () => {
    expect(parseCommand('Show alternatives to milk').intent).toBe('GET_SUBSTITUTES')
  })

  it('returns UNKNOWN for empty string', () => {
    const r = parseCommand('')
    expect(r.intent).toBe('UNKNOWN')
    expect(r.confidence).toBe(0)
  })

  it('categorizes milk as Dairy', () => {
    expect(parseCommand('Add milk').category).toBe('Dairy')
  })

  it('categorizes apples as Produce', () => {
    expect(parseCommand('Add apples').category).toBe('Produce')
  })

  it('categorizes bread as Bakery', () => {
    expect(parseCommand('Add bread').category).toBe('Bakery')
  })

  it('categorizes water as Beverages', () => {
    expect(parseCommand('Add water').category).toBe('Beverages')
  })

  it('categorizes toothpaste as Personal Care', () => {
    expect(parseCommand('Add toothpaste').category).toBe('Personal Care')
  })
})
