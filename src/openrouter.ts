import * as https from "https";
import * as http from "http";
import { URL } from "url";
import { displayInfo, displayWarning, createLogEntry } from "./cli-utils";

const OPENROUTER_API_KEY = process.env.TIDYAI_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b:free";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
}

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class OpenRouterClient {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = OPENROUTER_API_KEY;
  }

  async getSuggestions(fileNames: string[]): Promise<Record<string, string>> {
    // If no API key is set, use default suggestions
    if (!this.apiKey) {
      displayWarning(
        "TIDYAI_API_KEY not set, using default folder suggestions"
      );
      // Create a log entry
      await createLogEntry(
        process.cwd(),
        "TIDYAI_API_KEY not set, using default folder suggestions",
        ".tidyai/logs"
      );
      return this.getDefaultSuggestions(fileNames);
    }

    displayInfo("Sending request to OpenRouter API...");

    // Prepare the prompt for the AI
    const fileList = fileNames.join("\n");
    const prompt = `You are an AI assistant that helps organize files. Based on the filenames provided, suggest appropriate folder names to organize them.
    
File names:
${fileList}

For each file, suggest one logical folder name based on its content or type. Respond ONLY with a JSON object where keys are the filenames and values are the suggested folder names. Do not include any other text in your response.

Example response format:
{
  "document.pdf": "Documents",
  "photo.jpg": "Images",
  "script.js": "Scripts"
}`;

    try {
      const response = await this.makeRequest({
        model: DEFAULT_MODEL,
        messages: [{ role: "user", content: prompt }],
      });

      // Check if the response has the expected structure
      if (!response || !response.choices || response.choices.length === 0) {
        displayWarning(
          "Unexpected API response structure, using default folder suggestions"
        );
        // Create a log entry
        await createLogEntry(
          process.cwd(),
          "Unexpected API response structure, using default folder suggestions",
          ".tidyai/logs"
        );
        return this.getDefaultSuggestions(fileNames);
      }

      const content = response.choices[0].message.content;
      // Parse the JSON response
      return JSON.parse(content);
    } catch (error) {
      displayWarning(
        `Error getting suggestions from OpenRouter API: ${
          (error as Error).message
        }`
      );
      // Create a log entry
      await createLogEntry(
        process.cwd(),
        `Error getting suggestions from OpenRouter API: ${
          (error as Error).message
        }`,
        ".tidyai/logs"
      );
      // Return default folder names if API fails
      return this.getDefaultSuggestions(fileNames);
    }
  }

  private makeRequest(
    data: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const url = new URL(OPENROUTER_API_URL);

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      const req = https.request(options, (res) => {
        let responseBody = "";

        res.on("data", (chunk) => {
          responseBody += chunk;
        });

        res.on("end", () => {
          try {
            // Check if the response status indicates an error
            if (res.statusCode && res.statusCode >= 400) {
              displayWarning(
                `API request failed with status ${res.statusCode}: ${responseBody}`
              );
              reject(
                new Error(`API request failed with status ${res.statusCode}`)
              );
              return;
            }

            const response = JSON.parse(responseBody);
            resolve(response);
          } catch (error) {
            displayWarning(`Error parsing API response: ${responseBody}`);
            reject(error);
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  private getDefaultSuggestions(fileNames: string[]): Record<string, string> {
    const suggestions: Record<string, string> = {};

    for (const fileName of fileNames) {
      // Simple default logic based on file extensions
      const ext = fileName.split(".").pop()?.toLowerCase() || "";

      if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
        suggestions[fileName] = "Images";
      } else if (["pdf", "doc", "docx", "txt", "rtf"].includes(ext)) {
        suggestions[fileName] = "Documents";
      } else if (["mp4", "avi", "mov", "wmv", "flv"].includes(ext)) {
        suggestions[fileName] = "Videos";
      } else if (["mp3", "wav", "ogg", "flac"].includes(ext)) {
        suggestions[fileName] = "Audio";
      } else if (
        ["js", "ts", "jsx", "tsx", "html", "css", "scss"].includes(ext)
      ) {
        suggestions[fileName] = "Code";
      } else {
        suggestions[fileName] = "Other";
      }
    }

    return suggestions;
  }
}
