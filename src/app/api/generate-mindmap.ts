import type { GenerateMindMapRequest, GenerateMindMapResponse } from "../../types/mindmap";
import { generateMindMap } from "../../services/ai";

/**
 * API route handler for generating mind maps
 * Accepts POST requests with user input and returns a generated mind map
 *
 * Note: When used with `rwsdk/router`, route handlers receive a single
 * context object containing `request` and `env`, not the raw Request.
 */
export async function POST({
  request,
  ctx,
  env,
}: {
  request: Request;
  ctx?: any;
  env?: Env;
}): Promise<Response> {
  try {
    const body: GenerateMindMapRequest = await request.json();

    if (!body.userInput || typeof body.userInput !== "string") {
      return Response.json(
        {
          success: false,
          error: "userInput is required and must be a string",
        } as GenerateMindMapResponse,
        { status: 400 }
      );
    }

    // Get API key from environment variable - try multiple sources
    // 1. Try env parameter (from Cloudflare Workers/Wrangler)
    // 2. Try ctx.env (from Redwood SDK context)
    // 3. Try process.env (fallback for nodejs_compat mode)
    let apiKey = env?.GEMINI_API_KEY || ctx?.env?.GEMINI_API_KEY;
    
    // Fallback: Try process.env if available (works with nodejs_compat flag)
    if (!apiKey && typeof process !== "undefined" && process.env) {
      apiKey = process.env.GEMINI_API_KEY;
    }

    if (!apiKey) {
      console.error("=== API KEY DEBUG ===");
      console.error("env?.GEMINI_API_KEY:", env?.GEMINI_API_KEY ? "✓ Found" : "✗ Not found");
      console.error("ctx?.env?.GEMINI_API_KEY:", ctx?.env?.GEMINI_API_KEY ? "✓ Found" : "✗ Not found");
      console.error("process.env?.GEMINI_API_KEY:", typeof process !== "undefined" && process.env?.GEMINI_API_KEY ? "✓ Found" : "✗ Not found");
      console.error("env keys:", env ? Object.keys(env) : "env is undefined");
      console.error("ctx.env keys:", ctx?.env ? Object.keys(ctx.env) : "ctx.env is undefined");
      console.error("process.env keys:", typeof process !== "undefined" && process.env ? Object.keys(process.env).filter(k => k.includes("GEMINI")) : "process.env not available");
      console.error("====================");
      
      return Response.json(
        {
          success: false,
          error: "Gemini API key not configured. Please set GEMINI_API_KEY in .dev.vars file. Make sure to restart the dev server after adding the key.",
        } as GenerateMindMapResponse,
        { status: 500 }
      );
    }
    
    console.log("✓ API key loaded successfully");

    // Optional: Use a custom model if provided in environment (defaults to gemini-2.0-flash-exp)
    const model = (env as Record<string, any>)?.GEMINI_MODEL || (ctx?.env as Record<string, any>)?.GEMINI_MODEL || undefined;

    const mindMap = await generateMindMap(body.userInput, apiKey, model);

    return Response.json({
      success: true,
      mindMap,
    } as GenerateMindMapResponse);
  } catch (error) {
    console.error("Error generating mind map:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      } as GenerateMindMapResponse,
      { status: 500 }
    );
  }
}
