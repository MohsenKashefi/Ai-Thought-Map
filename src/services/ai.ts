import type { MindMap } from "../types/mindmap";

/**
 * Creates a comprehensive prompt for Gemini to generate mind maps
 */
function createGeminiPrompt(userInput: string): string {
  return `You are a mind mapping assistant. Your task is to analyze user input and create a structured mind map.

IMPORTANT: You must respond with ONLY valid JSON in this exact format:
{
  "centralIdea": "string - the main topic or problem",
  "branches": [
    {
      "title": "string - main branch title",
      "subBranches": ["string - sub-point 1", "string - sub-point 2"]
    }
  ]
}

Guidelines:
- Create 3-6 main branches that cover different aspects of the topic
- Each branch should have 2-4 sub-branches with specific details
- Keep text concise and clear
- Focus on breaking down complex ideas into organized components
- Do not include any explanatory text, only output the JSON structure

Create a mind map for the following:

${userInput}`;
}

/**
 * Generates a mind map from user input using Google Gemini API
 *
 * @param userInput - The problem, idea, or question from the user
 * @param apiKey - Google Gemini API key
 * @param model - Optional model name (defaults to gemini-2.0-flash-exp)
 * @returns Promise resolving to a MindMap object
 */
export async function generateMindMap(
  userInput: string,
  apiKey: string,
  model: string = "gemini-2.0-flash-exp"
): Promise<MindMap> {
  if (!userInput.trim()) {
    throw new Error("User input cannot be empty");
  }

  if (!apiKey) {
    throw new Error("API key is required");
  }

  const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: createGeminiPrompt(userInput),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini API request failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error("Invalid response format from Gemini API");
  }

  const content = data.candidates[0].content.parts[0].text;

  let mindMap: MindMap;
  try {
    mindMap = JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse Gemini response as JSON: ${error}`);
  }

  // Validate the structure
  if (!mindMap.centralIdea || !Array.isArray(mindMap.branches)) {
    throw new Error("AI response does not match expected mind map structure");
  }

  return mindMap;
}
