import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { v4 as uuid } from 'uuid'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AddressType = 'Home' | 'Work' | 'Other'

export interface Address {
  id: string
  type: AddressType
  label: string         // custom name like "Mom's house"
  line1: string         // flat/house no, building
  line2?: string        // area, landmark
  city: string
  state: string
  pincode: string
  phone: string
  isDefault: boolean
}

type State = { addresses: Address[]; selectedId: string | null }

type Action =
  | { type: 'ADD'; address: Address }
  | { type: 'UPDATE'; id: string; changes: Partial<Address> }
  | { type: 'DELETE'; id: string }
  | { type: 'SELECT'; id: string }
  | { type: 'SET_DEFAULT'; id: string }
  | { type: 'LOAD'; addresses: Address[]; selectedId: string | null }

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD': {
      let addresses = [...state.addresses]
      if (action.address.isDefault) {
        addresses = addresses.map(a => ({ ...a, isDefault: false }))
      }
      addresses.push(action.address)
      return { addresses, selectedId: action.address.id }
    }
    case 'UPDATE': {
      let addresses = state.addresses.map(a =>
        a.id === action.id ? { ...a, ...action.changes } : a
      )
      if (action.changes.isDefault) {
        addresses = addresses.map(a => a.id === action.id ? a : { ...a, isDefault: false })
      }
      return { ...state, addresses }
    }
    case 'DELETE': {
      const addresses = state.addresses.filter(a => a.id !== action.id)
      // if deleted was selected, pick default or first
      const selected =
        state.selectedId === action.id
          ? (addresses.find(a => a.isDefault)?.id ?? addresses[0]?.id ?? null)
          : state.selectedId
      return { addresses, selectedId: selected }
    }
    case 'SELECT':
      return { ...state, selectedId: action.id }
    case 'SET_DEFAULT':
      return {
        ...state,
        addresses: state.addresses.map(a => ({ ...a, isDefault: a.id === action.id })),
      }
    case 'LOAD':
      return { addresses: action.addresses, selectedId: action.selectedId }
    default:
      return state
  }
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    type: 'Home',
    label: 'Home',
    line1: '42, Sunrise Apartments',
    line2: 'MG Road, Near Trinity Metro',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    phone: '9876543210',
    isDefault: true,
  },
  {
    id: 'addr-2',
    type: 'Work',
    label: 'Office',
    line1: '12th Floor, Brigade Gateway',
    line2: 'Indiranagar, 100 Feet Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    phone: '9876543210',
    isDefault: false,
  },
]

// ─── Context ─────────────────────────────────────────────────────────────────

interface Ctx extends State {
  selectedAddress: Address | null
  addAddress: (data: Omit<Address, 'id'>) => void
  updateAddress: (id: string, changes: Partial<Address>) => void
  deleteAddress: (id: string) => void
  selectAddress: (id: string) => void
  setDefault: (id: string) => void
}

const AddressContext = createContext<Ctx | null>(null)
const KEY_PRIMARY = 'cartiq_addresses'
const KEY_LEGACY = 'SnapGrocer_addresses'
const SEL_KEY_PRIMARY = 'cartiq_selected_address'
const SEL_KEY_LEGACY = 'SnapGrocer_selected_address'

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { addresses: [], selectedId: null }, () => {
    if (typeof window === 'undefined') {
      const def = SEED_ADDRESSES.find(a => a.isDefault)
      return { addresses: SEED_ADDRESSES, selectedId: def?.id ?? null }
    }
    try {
      const saved = localStorage.getItem(KEY_PRIMARY) || localStorage.getItem(KEY_LEGACY)
      const sel = localStorage.getItem(SEL_KEY_PRIMARY) || localStorage.getItem(SEL_KEY_LEGACY)
      if (saved) {
        const addresses = JSON.parse(saved) as Address[]
        const selectedId = sel ?? addresses.find(a => a.isDefault)?.id ?? addresses[0]?.id ?? null
        return { addresses, selectedId }
      }
    } catch {}
    const def = SEED_ADDRESSES.find(a => a.isDefault)
    return { addresses: SEED_ADDRESSES, selectedId: def?.id ?? null }
  })

  // Persist
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY_PRIMARY, JSON.stringify(state.addresses))
    }
  }, [state.addresses])

  useEffect(() => {
    if (typeof window !== 'undefined' && state.selectedId) {
      localStorage.setItem(SEL_KEY_PRIMARY, state.selectedId)
    }
  }, [state.selectedId])

  const selectedAddress = state.addresses.find(a => a.id === state.selectedId) ?? null

  return (
    <AddressContext.Provider value={{
      ...state,
      selectedAddress,
      addAddress: (data) => dispatch({ type: 'ADD', address: { ...data, id: uuid() } }),
      updateAddress: (id, changes) => dispatch({ type: 'UPDATE', id, changes }),
      deleteAddress: (id) => dispatch({ type: 'DELETE', id }),
      selectAddress: (id) => dispatch({ type: 'SELECT', id }),
      setDefault: (id) => dispatch({ type: 'SET_DEFAULT', id }),
    }}>
      {children}
    </AddressContext.Provider>
  )
}

export function useAddress() {
  const ctx = useContext(AddressContext)
  if (!ctx) throw new Error('useAddress outside AddressProvider')
  return ctx
}
