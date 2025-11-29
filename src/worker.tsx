import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "./app/Document";
import { setCommonHeaders } from "./app/headers";
import { Home } from "./app/pages/Home";
import { POST as generateMindMapPOST } from "./app/api/generate-mindmap";

export type AppContext = {
  env: Env;
};

export default defineApp([
  setCommonHeaders(),
  ({ ctx, env }: any) => {
    // Debug: Check what we receive in middleware
    console.log("=== MIDDLEWARE DEBUG ===");
    console.log("env:", env);
    console.log("env keys:", env ? Object.keys(env) : "undefined");
    console.log("GEMINI_API_KEY:", env?.GEMINI_API_KEY);
    console.log("========================");

    // Pass env to context
    (ctx as AppContext).env = env;
  },
  route("/api/generate-mindmap", ({ request, ctx, env }: any) => {
    // Ensure env is passed correctly - prioritize env parameter, fallback to ctx.env
    const finalEnv = env || (ctx as AppContext)?.env || {};
    console.log("=== ROUTE WRAPPER DEBUG ===");
    console.log("env parameter:", env ? Object.keys(env) : "undefined");
    console.log("ctx.env:", (ctx as AppContext)?.env ? Object.keys((ctx as AppContext).env) : "undefined");
    console.log("GEMINI_API_KEY in env:", env?.GEMINI_API_KEY ? "✓ Found" : "✗ Not found");
    console.log("GEMINI_API_KEY in ctx.env:", (ctx as AppContext)?.env?.GEMINI_API_KEY ? "✓ Found" : "✗ Not found");
    console.log("===========================");
    return generateMindMapPOST({ request, ctx, env: finalEnv });
  }),
  render(Document, [route("/", Home)]),
]);
