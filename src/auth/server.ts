import { CALLBACK_PORT } from "../config.js";

interface CallbackResult {
  code: string;
  state: string;
}

export function startCallbackServer(expectedState: string): Promise<CallbackResult> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.stop();
      reject(new Error("OAuth callback timed out after 120 seconds"));
    }, 120_000);

    const server = Bun.serve({
      port: CALLBACK_PORT,
      fetch(req) {
        const url = new URL(req.url);
        if (url.pathname !== "/callback") {
          return new Response("Not found", { status: 404 });
        }

        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        if (error) {
          clearTimeout(timeout);
          server.stop();
          reject(new Error(`OAuth error: ${error}`));
          return new Response(html("Authorization failed. You can close this tab."), {
            headers: { "Content-Type": "text/html" },
          });
        }

        if (!code || !state) {
          clearTimeout(timeout);
          server.stop();
          reject(new Error("Missing code or state in callback"));
          return new Response(html("Missing parameters. You can close this tab."), {
            headers: { "Content-Type": "text/html" },
          });
        }

        if (state !== expectedState) {
          clearTimeout(timeout);
          server.stop();
          reject(new Error("State mismatch — possible CSRF attack"));
          return new Response(html("State mismatch. You can close this tab."), {
            headers: { "Content-Type": "text/html" },
          });
        }

        clearTimeout(timeout);
        server.stop();
        resolve({ code, state });
        return new Response(html("Login successful! You can close this tab."), {
          headers: { "Content-Type": "text/html" },
        });
      },
    });
  });
}

function html(message: string): string {
  return `<!DOCTYPE html><html><body><h2>${message}</h2></body></html>`;
}
