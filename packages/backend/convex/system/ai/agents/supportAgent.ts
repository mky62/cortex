import { components } from "../../../_generated/api.js";
import { Agent } from "@convex-dev/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

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
