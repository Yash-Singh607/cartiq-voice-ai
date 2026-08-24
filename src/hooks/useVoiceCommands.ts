import { useState, useCallback } from 'react'
import { useVoiceRecognition } from './useVoiceRecognition'
import { useShopping } from '@/context/ShoppingContext'
import { parseCommand } from '@/services/nlpService'
import { findByName } from '@/services/productService'
import { capitalize } from '@/utils/format'
import type { Language, ParsedCommand, VoiceState } from '@/types'

export interface CommandResult {
  success: boolean
  message: string
  command?: ParsedCommand
}

export function useVoiceCommands(language: Language) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [lastResult, setLastResult] = useState<CommandResult | null>(null)

  const { addItem, removeByName, updateQtyByName, toggleItem, items } = useShopping()

  const processText = useCallback((text: string): CommandResult => {
    const cmd = parseCommand(text)
    if (cmd.confidence < 0.35) {
      return { success: false, message: "I couldn't quite understand that. Try 'Add milk' or 'Find oranges'.", command: cmd }
    }

    switch (cmd.intent) {
      case 'ADD_ITEM': {
        if (!cmd.product) return { success: false, message: 'What would you like to add?', command: cmd }
        const product = findByName(cmd.product)
        addItem(
          capitalize(cmd.product), cmd.quantity, cmd.unit, cmd.category,
          cmd.brand, product?.price, product?.image, product?.id
        )
        const qty = cmd.quantity && cmd.quantity > 1 ? `${cmd.quantity} × ` : ''
        const unit = cmd.unit && cmd.unit !== 'item' ? ` (${cmd.unit})` : ''
        return { success: true, message: `Added ${qty}${capitalize(cmd.product)}${unit}`, command: cmd }
      }
      case 'REMOVE_ITEM': {
        if (!cmd.product) return { success: false, message: 'What would you like to remove?', command: cmd }
        const removed = removeByName(cmd.product)
        return removed
          ? { success: true, message: `Removed ${capitalize(cmd.product)}`, command: cmd }
          : { success: false, message: `"${cmd.product}" isn't on your list`, command: cmd }
      }
      case 'UPDATE_ITEM': {
        if (!cmd.product || !cmd.quantity) return { success: false, message: 'Specify what to update and the new quantity', command: cmd }
        const ok = updateQtyByName(cmd.product, cmd.quantity)
        return ok
          ? { success: true, message: `Updated ${capitalize(cmd.product)} to ${cmd.quantity}`, command: cmd }
          : { success: false, message: `"${cmd.product}" isn't on your list`, command: cmd }
      }
      case 'CLEAR_ITEM': {
        if (!cmd.product) return { success: false, message: 'Which item did you buy?', command: cmd }
        const item = items.find(i => i.name.toLowerCase().includes(cmd.product!.toLowerCase()))
        if (item) { toggleItem(item.id); return { success: true, message: `Marked ${capitalize(cmd.product)} as purchased`, command: cmd } }
        return { success: false, message: `"${cmd.product}" isn't on your list`, command: cmd }
      }
      case 'SEARCH_PRODUCT':
        return { success: true, message: cmd.product ? `Searching for ${cmd.product}${cmd.maxPrice ? ` under ₹${cmd.maxPrice}` : ''}` : 'Opening search...', command: cmd }
      case 'GET_SUBSTITUTES':
        return { success: true, message: cmd.product ? `Finding alternatives to ${capitalize(cmd.product)}` : 'Finding alternatives...', command: cmd }
      case 'GET_RECOMMENDATIONS':
        return { success: true, message: 'Here are your smart suggestions', command: cmd }
      case 'SHOW_LIST':
        return { success: true, message: "Here's your shopping list", command: cmd }
      default:
        return { success: false, message: "I heard you, but I'm not sure what to do. Try 'Add milk' or 'Remove apples'.", command: cmd }
    }
  }, [addItem, removeByName, updateQtyByName, toggleItem, items])

  const handleFinal = useCallback((text: string) => {
    setTranscript(text)
    setVoiceState('processing')
    const result = processText(text)
    setLastResult(result)
    setVoiceState(result.success ? 'success' : 'error')
    setTimeout(() => setVoiceState('idle'), 3500)
  }, [processText])

  const handleError = useCallback((msg: string) => {
    setVoiceState('error')
    setLastResult({ success: false, message: msg })
    setTimeout(() => setVoiceState('idle'), 4000)
  }, [])

  const { interim, isSupported, start: startRec, stop: stopRec } = useVoiceRecognition({
    language, onFinal: handleFinal, onInterim: t => setTranscript(t), onError: handleError,
  })

  const start = useCallback(() => {
    setTranscript(''); setLastResult(null); setVoiceState('listening'); startRec()
  }, [startRec])

  const stop = useCallback(() => { stopRec(); setVoiceState('idle') }, [stopRec])

  return { voiceState, isSupported, transcript, interim, lastResult, start, stop, processText,
    resetResult: () => { setLastResult(null); setTranscript(''); setVoiceState('idle') } }
}
