/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_QUIZ_OFFLINE_MODE?: string;
  readonly VITE_AI_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
