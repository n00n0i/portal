/// <reference types="vite/client" />

// Fallback process env typing for environments without @types/node available
declare const process: {
  env: Record<string, string | undefined>;
};
