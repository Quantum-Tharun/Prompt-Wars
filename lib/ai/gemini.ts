import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { type AgentTraceEntry } from "../schemas/domain.schema";

export interface ExecuteAgentParams<T> {
  agentName: "SkillAnalyzer" | "CareerGapAnalyst" | "LearningPlanner" | "AdaptiveMentor";
  systemPrompt: string;
  userPrompt: string;
  zodSchema: z.ZodType<T>;
  deterministicFallback: () => T;
  extractKeyFindings: (data: T) => string[];
  inputSummary: string;
  timeoutMs?: number;
}

export interface AgentExecutionResult<T> {
  data: T;
  trace: AgentTraceEntry;
}

export async function executeAgentWithFallback<T>(
  params: ExecuteAgentParams<T>
): Promise<AgentExecutionResult<T>> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  const timeoutMs = params.timeoutMs || 5000;

  const isInvalidKey =
    !apiKey ||
    apiKey.trim() === "" ||
    apiKey.includes("your_gemini_api_key_here") ||
    apiKey === "placeholder";

  if (isInvalidKey) {
    const data = params.deterministicFallback();
    const durationMs = Date.now() - startTime;
    return {
      data,
      trace: {
        agentName: params.agentName,
        executedAt: new Date().toISOString(),
        durationMs,
        usedFallback: true,
        inputSummary: params.inputSummary,
        keyFindings: params.extractKeyFindings(data),
      },
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: params.systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const callPromise = (async () => {
      const result = await model.generateContent(params.userPrompt);
      const text = result.response.text();
      const rawParsed = JSON.parse(text);
      return params.zodSchema.parse(rawParsed);
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Agent ${params.agentName} exceeded ${timeoutMs}ms circuit breaker`)),
        timeoutMs
      )
    );

    const validated = await Promise.race([callPromise, timeoutPromise]);
    const durationMs = Date.now() - startTime;

    return {
      data: validated,
      trace: {
        agentName: params.agentName,
        executedAt: new Date().toISOString(),
        durationMs,
        usedFallback: false,
        inputSummary: params.inputSummary,
        keyFindings: params.extractKeyFindings(validated),
      },
    };
  } catch (error) {
    console.warn(
      `[SkillPath AI] ${params.agentName} LLM fallback activated (${error instanceof Error ? error.message : String(error)}).`
    );

    const data = params.deterministicFallback();
    const durationMs = Date.now() - startTime;
    return {
      data,
      trace: {
        agentName: params.agentName,
        executedAt: new Date().toISOString(),
        durationMs,
        usedFallback: true,
        inputSummary: params.inputSummary,
        keyFindings: params.extractKeyFindings(data),
      },
    };
  }
}
