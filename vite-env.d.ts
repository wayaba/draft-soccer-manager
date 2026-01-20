/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_MOCK: string
  readonly VITE_GEMINI_API_KEY: string
  // más variables de entorno que puedas tener...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
