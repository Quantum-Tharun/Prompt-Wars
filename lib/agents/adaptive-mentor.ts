import { z } from "zod";
import {
  type LearningRoadmap,
  type RoadmapModule,
  type WeakTopicRecord,
} from "../schemas/domain.schema";
import { getSkillById } from "../data-loader";
import { executeAgentWithFallback, type AgentExecutionResult } from "../ai/gemini";

export const AdaptiveMentorOutputSchema = z.object({
  diagnosisHeadline: z.string(),
  conceptBreakdowns: z.array(
    z.object({
      topicTag: z.string(),
      whyItMatters: z.string(),
      mentalModelTip: z.string(),
    })
  ),
  roadmapMutationExplanation: z.string(),
  nextImmediateStep: z.string(),
});
export type AdaptiveMentorOutput = z.infer<typeof AdaptiveMentorOutputSchema>;

const TOPIC_MENTOR_TIPS: Record<string, { why: string; tip: string }> = {
  js_functions_scope: {
    why: "Lexical scope and closures govern variable lifetime and encapsulation across all modern JavaScript modules and UI components.",
    tip: "Think of functions as carrying a backpack: whenever a function is defined, it keeps an immutable reference to the lexical environment where it was born.",
  },
  js_arrays_objects: {
    why: "Modern state architectures require non-mutating array transformations (filter, map, reduce) to preserve state immutability.",
    tip: "Always distinguish between methods that mutate in-place (push, splice) vs. pure transformers (map, filter). Treat arrays as immutable data streams.",
  },
  js_async_promises: {
    why: "The single-threaded V8 event loop processes asynchronous tasks through strict priority: synchronous call stack first, then microtasks (Promises), then macrotasks (timers).",
    tip: "Visualize two queues: the microtask queue (VIP express lane for Promise.then) and the macrotask queue (regular lane for setTimeout). Microtasks always completely drain before the next macrotask runs.",
  },
  sql_joins: {
    why: "Relational database querying requires precision in Cartesian products and row matching logic.",
    tip: "In a LEFT JOIN, unmatched rows receive NULL. If you put a condition in the WHERE clause on the right table, you silently convert it to an INNER JOIN.",
  },
  sql_aggregation: {
    why: "Data aggregation forms the backbone of all metrics, analytics, and group reporting.",
    tip: "WHERE filters rows before they enter the grouping bucket; HAVING filters the buckets after aggregate functions have computed totals.",
  },
};

export async function runAdaptiveMentor(
  failedSkillId: string,
  quizScore: number,
  failedWeakTopics: WeakTopicRecord[],
  mutatedRoadmap: LearningRoadmap,
  insertedModule: RoadmapModule | null
): Promise<AgentExecutionResult<AdaptiveMentorOutput>> {
  const skill = getSkillById(failedSkillId);
  const skillName = skill?.name || failedSkillId;

  const systemPrompt = `You are the Adaptive AI Mentor (Agent 4) in the SkillPath AI architecture.
Your mission is to deliver rigorous, supportive, and technically surgical coaching after a checkpoint assessment failure.
Analyze the exact failed micro-topics, provide high-clarity mental models and practical debugging advice, and explain why the learning roadmap DAG was rewired to preserve educational integrity.
Output strictly in JSON conforming to the schema.`;

  const userPrompt = `Assessment Checkpoint Results:
Skill: ${skillName} (${failedSkillId})
Checkpoint Score: ${quizScore}% (Threshold: 60%)
Failed Micro-Topics:
${JSON.stringify(failedWeakTopics, null, 2)}

Surgically Inserted Remediation Module:
${JSON.stringify(insertedModule, null, 2)}

Current Roadmap Revision: ${mutatedRoadmap.revisionNumber}

Deliver technical coaching, mental models, roadmap mutation rationale, and the immediate actionable step.`;

  const deterministicFallback = (): AdaptiveMentorOutput => {
    const uniqueTopics = Array.from(new Set(failedWeakTopics.map((w) => w.topicTag)));

    const conceptBreakdowns = uniqueTopics.map((tag) => {
      const known = TOPIC_MENTOR_TIPS[tag];
      const mt = skill?.microTopics.find((t) => t.tag === tag);
      const label = mt?.label || tag;

      return {
        topicTag: tag,
        whyItMatters:
          known?.why ||
          `Competence in ${label} is an essential prerequisite for higher-order engineering in ${skillName}.`,
        mentalModelTip:
          known?.tip ||
          `Trace execution step-by-step using a whiteboard or scratchpad, isolating variable bindings at each boundary.`,
      };
    });

    const insertedTitle = insertedModule?.title || "Targeted Remediation Module";

    const roadmapMutationExplanation =
      `Because your checkpoint score was ${quizScore}% (below the 60% mastery threshold), our DAG adaptation engine spliced a surgical module: "${insertedTitle}". ` +
      `To prevent compounding confusion, downstream modules (such as React and full-stack integration) have been dynamically locked. They will automatically unlock once you complete this targeted remediation.`;

    const nextImmediateStep = `Open the interactive sandbox in "${insertedTitle}", review the curated documentation on [${uniqueTopics.join(", ")}], and build the diagnostic exercises before re-attempting the validation checkpoint.`;

    return {
      diagnosisHeadline: `Diagnostic Feedback for ${skillName}: Checkpoint Score ${quizScore}%`,
      conceptBreakdowns,
      roadmapMutationExplanation,
      nextImmediateStep,
    };
  };

  return executeAgentWithFallback<AdaptiveMentorOutput>({
    agentName: "AdaptiveMentor",
    systemPrompt,
    userPrompt,
    zodSchema: AdaptiveMentorOutputSchema,
    deterministicFallback,
    extractKeyFindings: (data) => [
      data.diagnosisHeadline,
      data.roadmapMutationExplanation,
      data.nextImmediateStep,
    ],
    inputSummary: `Adaptive coaching on ${skillName} (${quizScore}% score) with ${failedWeakTopics.length} failed weak topics.`,
  });
}

