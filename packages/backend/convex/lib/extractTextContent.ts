import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { StorageActionWriter } from "convex/server";
import { Id } from "../_generated/dataModel";

const AI_MODELS = {
  image: google("gemini-2.0-flash"),
  pdf: google("gemini-2.0-flash"),
} as const;

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const SYSTEM_PROMPTS = {
  image: "You turn images into text. If it is a photo of a document, transcribe it. If it is not a document, describe it.",
  pdf: "You transform PDF files into text.",
};

export type ExtractTextContentArgs = {
  storageId: Id<"_storage">;
  filename: string;
  bytes?: ArrayBuffer;
  mimeType: string;
};

export async function extractTextContent(
  ctx: { storage: StorageActionWriter },
  args: ExtractTextContentArgs,
): Promise<string> {
  const { storageId, filename, bytes, mimeType } = args;
  const normalizedMimeType = mimeType.toLowerCase();

  if (SUPPORTED_IMAGE_TYPES.some((type) => type === normalizedMimeType)) {
    return extractImageText(
      await getFileBytes(ctx, storageId, bytes),
      normalizedMimeType,
    );
  }

  if (normalizedMimeType.includes("pdf")) {
    return extractPdfText(
      await getFileBytes(ctx, storageId, bytes),
      normalizedMimeType,
      filename,
    );
  }

  if (normalizedMimeType.includes("text")) {
    return extractTextFileContent(ctx, storageId, bytes);
  }

  throw new Error(`Unsupported MIME type: ${mimeType}`);
};

async function getFileBytes(
  ctx: { storage: StorageActionWriter },
  storageId: Id<"_storage">,
  bytes: ArrayBuffer | undefined,
): Promise<ArrayBuffer> {
  const arrayBuffer =
    bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer());

  if (!arrayBuffer) {
    throw new Error("Failed to get file content");
  }

  return arrayBuffer;
}

async function extractTextFileContent(
  ctx: { storage: StorageActionWriter },
  storageId: Id<"_storage">,
  bytes: ArrayBuffer | undefined,
): Promise<string> {
  const arrayBuffer = await getFileBytes(ctx, storageId, bytes);
  const text = new TextDecoder().decode(arrayBuffer);
  return text;
};

async function extractPdfText(
  bytes: ArrayBuffer,
  mimeType: string,
  filename: string,
): Promise<string> {
  const result = await generateText({
    model: AI_MODELS.pdf,
    system: SYSTEM_PROMPTS.pdf,
    maxOutputTokens: 2330,
    messages: [
      {
        role: "user",
        content: [
          { type: "file", data: bytes, mediaType: mimeType, filename },
          {
            type: "text",
            text: "Extract the text from the PDF and print it without explaining you'll do so.",
          }
        ]
      }
    ]
  });

  return result.text;
};

async function extractImageText(
  bytes: ArrayBuffer,
  mimeType: string,
): Promise<string> {
  const result = await generateText({
    model: AI_MODELS.image,
    system: SYSTEM_PROMPTS.image,
    maxOutputTokens: 2330,
    messages: [
      {
        role: "user",
        content: [{ type: "file", data: bytes, mediaType: mimeType }]
      },
    ],
  });

  return result.text;
};
