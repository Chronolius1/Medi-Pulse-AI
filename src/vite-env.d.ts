/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Default Gemini key baked in at build time. See .env.example. */
  readonly VITE_GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
