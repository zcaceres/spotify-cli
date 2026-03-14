import { login } from "../auth/flow.js";
import { loadTokens, deleteTokens, isExpired } from "../auth/token-store.js";
import { output } from "../output.js";
import type { CommandHandler } from "./index.js";

export const loginCommand: CommandHandler = async (args) => {
  const clientId = args.flags["client-id"];
  const tokens = await login(clientId);
  output({ status: "logged_in", expires_at: tokens.expires_at, scope: tokens.scope });
};

export const logoutCommand: CommandHandler = async () => {
  await deleteTokens();
  output({ status: "logged_out" });
};

export const authStatusCommand: CommandHandler = async () => {
  try {
    const tokens = await loadTokens();
    output({
      status: isExpired(tokens) ? "expired" : "valid",
      expires_at: tokens.expires_at,
      scope: tokens.scope.split(" "),
    });
  } catch {
    output({ status: "not_logged_in" });
  }
};
