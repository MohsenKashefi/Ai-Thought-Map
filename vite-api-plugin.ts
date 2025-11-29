import type { Plugin } from "vite";
import { handleGenerateMindMap } from "./src/api-handler";

export function apiPlugin(): Plugin {
  return {
    name: "vite-api-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === "/api/generate-mindmap" && req.method === "POST") {
          try {
            let body = "";
            req.on("data", (chunk) => {
              body += chunk.toString();
            });

            req.on("end", async () => {
              const request = new Request("http://localhost/api/generate-mindmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body,
              });

              const response = await handleGenerateMindMap(request);
              const data = await response.json();

              res.setHeader("Content-Type", "application/json");
              res.statusCode = response.status;
              res.end(JSON.stringify(data));
            });
          } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: String(error) }));
          }
        } else {
          next();
        }
      });
    },
  };
}
