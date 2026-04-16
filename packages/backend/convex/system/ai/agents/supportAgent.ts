import { components } from "../../../_generated/api.js";
import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";

export const supportAgent = new Agent(components.agent, {
  name: "My Agent",
  languageModel: openai.chat("gpt-4o-mini"),
  instructions: "You are a weather forecaster."
});
