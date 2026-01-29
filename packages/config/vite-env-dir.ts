import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Simple export for Vite configuration
// This file is separate to avoid any dependencies that might cause issues during Vite config processing
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const envDir: string = resolve(__dirname, "configs");
