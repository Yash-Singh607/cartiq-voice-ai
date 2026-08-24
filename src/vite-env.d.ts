/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_ENABLE_AI_NLP?: string
  readonly VITE_ENABLE_AUTH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
