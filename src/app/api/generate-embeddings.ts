/**
 * API endpoint for generating text embeddings using Gemini
 */

import type { RequestEvent } from 'rwsdk';

interface EmbeddingRequest {
  texts: string[];
}

interface EmbeddingResponse {
  success: boolean;
  embeddings?: number[][];
  error?: string;
}

export async function POST(event: RequestEvent): Promise<Response> {
  try {
    const request: EmbeddingRequest = await event.request.json();

    if (!request.texts || !Array.isArray(request.texts)) {
      return Response.json({
        success: false,
        error: 'Invalid request: texts array is required'
      } as EmbeddingResponse);
    }

    const apiKey = event.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({
        success: false,
        error: 'Gemini API key not configured'
      } as EmbeddingResponse);
    }

    // Use Gemini's text-embedding model
    const model = 'models/text-embedding-004';
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:batchEmbedContents?key=${apiKey}`;

    const geminiRequest = {
      requests: request.texts.map(text => ({
        model,
        content: {
          parts: [{ text }]
        }
      }))
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return Response.json({
        success: false,
        error: `Gemini API error: ${response.status}`
      } as EmbeddingResponse);
    }

    const data = await response.json();

    // Extract embeddings from response
    const embeddings = data.embeddings.map((emb: any) => emb.values);

    return Response.json({
      success: true,
      embeddings
    } as EmbeddingResponse);

  } catch (error) {
    console.error('Error generating embeddings:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    } as EmbeddingResponse);
  }
}
