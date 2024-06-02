"use server";

import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "ai/rsc";
import { z } from "zod";

const excalidrawElementSchema = z.object({
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  backgroundColor: z.string().optional(),
  strokeWidth: z.number().optional(),
});

export async function continueConversation(input: string) {
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: openai("gpt-4o"),
      system: "You generate valid Excalidraw elements based on user input.",
      prompt: input,
      schema: excalidrawElementSchema,
    });
    console.log("partialObjectStream", partialObjectStream);

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}
