import type { GenerateMindMapRequest, GenerateMindMapResponse } from "./types/mindmap";
import { generateMindMap } from "./services/ai";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load environment variables from .env.local or .dev.vars
function loadApiKey(): string {
  // Try .dev.vars first (for Cloudflare Workers)
  try {
    const devVarsPath = resolve(process.cwd(), ".dev.vars");
    const devVarsContent = readFileSync(devVarsPath, "utf-8");
    // Match GEMINI_API_KEY=value (handles quoted and unquoted values, comments, etc.)
    const lines = devVarsContent.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^GEMINI_API_KEY\s*=\s*(.+)$/);
      if (match) {
        // Remove quotes if present and trim
        const value = match[1].trim().replace(/^["']|["']$/g, "").trim();
        if (value) {
          console.log("✓ Loaded API key from .dev.vars");
          return value;
        }
      }
    }
  } catch (err) {
    // File doesn't exist or can't be read
  }

  // Try .env.local (for Vite)
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const envContent = readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      // Try both VITE_GEMINI_API_KEY and GEMINI_API_KEY
      const match = trimmed.match(/^(?:VITE_)?GEMINI_API_KEY\s*=\s*(.+)$/);
      if (match) {
        const value = match[1].trim().replace(/^["']|["']$/g, "").trim();
        if (value) {
          console.log("✓ Loaded API key from .env.local");
          return value;
        }
      }
    }
  } catch (err) {
    // File doesn't exist or can't be read
  }

  console.error("⚠ Could not load API key from .env.local or .dev.vars");
  return "";
}

let GEMINI_API_KEY = loadApiKey();

export async function handleGenerateMindMap(req: Request): Promise<Response> {
  try {
    const body: GenerateMindMapRequest = await req.json();
    const apiKey = GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json({
        success: false,
        error: "GEMINI_API_KEY is not configured",
      } as GenerateMindMapResponse, { status: 500 });
    }

    const mindMap = await generateMindMap(body.userInput, apiKey);

    return Response.json({
      success: true,
      mindMap,
    } as GenerateMindMapResponse);
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    } as GenerateMindMapResponse, { status: 500 });
  }
}
