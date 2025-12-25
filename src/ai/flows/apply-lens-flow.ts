
'use server';
/**
 * @fileOverview An AI flow to apply a contact lens to a user's photo.
 *
 * - applyLens - A function that handles the lens application process.
 * - ApplyLensInput - The input type for the applyLens function.
 * - ApplyLensOutput - The return type for the applyLens function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';

const ApplyLensInputSchema = z.object({
  userPhotoDataUri: z
    .string()
    .describe(
      "A photo of a user's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  lensPhotoDataUri: z
    .string()
    .describe(
      "A photo of just the contact lens, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ApplyLensInput = z.infer<typeof ApplyLensInputSchema>;

const ApplyLensOutputSchema = z.object({
  imageDataUri: z.string().optional().describe("The resulting image of the user with the lens applied, as a data URI. Only present on success."),
  error: z.string().optional().describe("An error message if the operation failed."),
});
export type ApplyLensOutput = z.infer<typeof ApplyLensOutputSchema>;

export async function applyLens(input: ApplyLensInput): Promise<ApplyLensOutput> {
  return applyLensFlow(input);
}

const applyLensFlow = ai.defineFlow(
  {
    name: 'applyLensFlow',
    inputSchema: ApplyLensInputSchema,
    outputSchema: ApplyLensOutputSchema,
  },
  async (input) => {
    const { media, text } = await ai.generate({
        model: googleAI.model('gemini-1.5-pro'),
        prompt: [
            { media: { url: input.userPhotoDataUri } },
            { media: { url: input.lensPhotoDataUri } },
            {
                text: `You are a virtual try-on assistant for a contact lens store.
Your task is to realistically apply the provided contact lens image onto the user's eyes in their photo.
- Identify the eyes in the user's photo.
- Take the texture and color from the contact lens image.
- Apply the lens to the user's eyes, ensuring it looks natural and fits the iris correctly.
- Maintain the original quality and lighting of the user's photo.
- Do not add any text, watermarks, or other artifacts to the image.
- Return ONLY the modified image. Do not return any text.
- If you cannot detect a face or eyes, or if the user's eyes are closed, you MUST reply with the single word "ERROR" and nothing else.`
            },
        ],
    });
    
    if (text?.trim().toUpperCase() === 'ERROR' || !media?.url) {
        return {
            error: "تعذر اكتشاف وجه أو عينين في الصورة. يرجى محاولة التقاط صورة أوضح."
        };
    }

    return {
      imageDataUri: media.url
    };
  }
);
