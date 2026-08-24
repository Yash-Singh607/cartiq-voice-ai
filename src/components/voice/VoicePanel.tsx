import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Keyboard, ArrowRight, X } from 'lucide-react'
import { MicButton } from './MicButton'
import { Waveform } from './Waveform'
import { AIInterpretation } from './AIInterpretation'
import { useVoiceCommands } from '@/hooks/useVoiceCommands'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'
import { tStr } from '@/data/i18n'

const EXAMPLES_EN = [
  'Add 2 bottles of milk',
  'Find organic apples under ₹200',
  'Remove bananas',
  'Show alternatives to butter',
]

export function VoicePanel() {
  const { language } = useApp()
  const { voiceState, isSupported, transcript, interim, lastResult, start, stop, resetResult, processText } = useVoiceCommands(language)
  const [textMode, setTextMode] = useState(false)
  const [input, setInput] = useState('')

  const displayTranscript = transcript || interim
  const isListening = voiceState === 'listening'
  const isProcessing = voiceState === 'processing'

  const handleText = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    processText(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      {/* Status label */}
      <div className="h-7 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isListening && (
            <motion.div key="listening" initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="flex items-center gap-2 text-rose-500 font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {tStr(language, 'listening')}
            </motion.div>
          )}
          {isProcessing && (
            <motion.div key="processing" initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="text-brand-600 font-medium text-sm animate-pulse">
              {tStr(language, 'processing')}
            </motion.div>
          )}
          {!isListening && !isProcessing && !lastResult && (
            <motion.p key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="text-slate-400 text-sm">{tStr(language, 'micPrompt')}</motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Mic + waveform */}
      <div className="flex flex-col items-center gap-4">
        <MicButton state={voiceState} isSupported={isSupported} onStart={start} onStop={stop} />
        {isListening && (
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}>
            <Waveform active />
          </motion.div>
        )}
      </div>

      {/* Live transcript */}
      <AnimatePresence>
        {displayTranscript && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="w-full max-w-md bg-slate-50 rounded-2xl px-4 py-3 text-center">
            <p className="text-xs text-slate-400 mb-1">I heard</p>
            <p className={cn('text-sm font-medium', isListening ? 'text-brand-600 italic' : 'text-slate-800')}>
              "{displayTranscript}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result feedback */}
      <AnimatePresence>
        {lastResult && (
          <motion.div initial={{ opacity:0, y:8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0 }}
            className={cn(
              'w-full max-w-md rounded-2xl border px-4 py-4',
              lastResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            )}>
            <div className="flex items-start gap-3">
              {lastResult.success
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                : <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className={cn('text-sm font-medium', lastResult.success ? 'text-emerald-800' : 'text-rose-800')}>
                  {lastResult.message}
                </p>
                {lastResult.command && lastResult.success && (
                  <AIInterpretation command={lastResult.command} />
                )}
              </div>
              <button onClick={resetResult} className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0"><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text fallback */}
      <div className="w-full max-w-md">
        {!textMode ? (
          <button onClick={() => setTextMode(true)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mx-auto transition-colors">
            <Keyboard className="w-3.5 h-3.5" /> Type a command instead
          </button>
        ) : (
          <form onSubmit={handleText} className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} autoFocus
              placeholder='e.g. "Add 2 bottles of milk"'
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <button type="submit" className="bg-brand-600 text-white rounded-xl px-4 hover:bg-brand-700 transition-colors flex items-center">
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Examples */}
      <div className="w-full max-w-md">
        <p className="text-2xs text-slate-400 font-medium uppercase tracking-wider mb-2 text-center">Try saying</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLES_EN.map(ex => (
            <motion.button key={ex} whileTap={{ scale: 0.97 }}
              onClick={() => processText(ex)}
              className="text-xs bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-500 px-3 py-1.5 rounded-full border border-transparent hover:border-brand-200 transition-all">
              "{ex}"
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
