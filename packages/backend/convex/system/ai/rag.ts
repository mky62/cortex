import { openrouter } from "@openrouter/ai-sdk-provider";
import { RAG } from "@convex-dev/rag";
import { components } from "../../_generated/api";

const rag = new RAG(components.agent, {
  textEmbeddingModel: openrouter.textEmbeddingModel("text-embedding-3-small"),
  embeddingDimension: 1536,
});

export default rag;
