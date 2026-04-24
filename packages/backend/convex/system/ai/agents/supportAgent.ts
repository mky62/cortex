import { components } from "../../../_generated/api.js";
import type { ActionCtx } from "../../../_generated/server.js";
import { Agent } from "@convex-dev/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ConvexError } from "convex/values";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const supportAgent = new Agent(components.agent, {
  name: "My Agent",
  languageModel: openrouter.chat("openai/gpt-4o-mini"),
  callSettings: {
    maxOutputTokens: 1024,
  },
  instructions: "You are a support agent. Help the user with their queries."
});

const isOpenRouterAuthError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("user not found") ||
    message.includes("invalid api key") ||
    message.includes("api key is missing") ||
    message.includes("unauthorized")
  );
};

export const generateSupportText = async (
  ctx: ActionCtx,
  threadOpts: { userId?: string | null; threadId?: string },
  args: { prompt: string },
) => {
  if (!process.env.OPENROUTER_API_KEY?.trim()) {
    throw new ConvexError({
      code: "AI_CONFIGURATION_ERROR",
      message: "Missing OPENROUTER_API_KEY in the Convex deployment environment.",
    });
  }

  try {
    return await supportAgent.generateText(ctx, threadOpts, args);
  } catch (error) {
    if (isOpenRouterAuthError(error)) {
      throw new ConvexError({
        code: "AI_CONFIGURATION_ERROR",
        message:
          "OpenRouter rejected the configured API key. Set a valid OPENROUTER_API_KEY for this Convex deployment.",
      });
    }

    throw error;
  }
};
