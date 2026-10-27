import react from "@vitejs/plugin-react";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vitest/config";

// Local stand-in for Netlify's /api routing: each /api/<name> request runs
// netlify/functions/<name>.ts in the dev server, so `npm run dev` needs no Netlify CLI.
// (No CDN caching locally; that only happens on Netlify.)
function netlifyFunctionsDev(): Plugin {
  return {
    name: "netlify-functions-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([a-z]+)(?:\?|$)/);
        if (!match) return next();
        try {
          const mod = await server.ssrLoadModule(`/netlify/functions/${match[1]}.ts`);
          const origin = `http://${req.headers.host}`;
          const response: Response = await mod.default(new Request(origin + req.url), {});
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          server.config.logger.error(String(err));
          res.statusCode = 404;
          res.end();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Expose server-side keys from .env to the functions (never to the browser bundle).
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  return {
    plugins: [react(), netlifyFunctionsDev()],
    test: { environment: "node" },
  };
});
