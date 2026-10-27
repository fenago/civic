import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { Contest, MeasureSummary } from "../../shared/civic";

const SummarySchema = z.object({
  whatItDoes: z.string(),
  ifPasses: z.string(),
  ifFails: z.string(),
  whoIsAffected: z.string(),
});

// Kept short on purpose: a shorter prompt keeps latency inside the function timeout.
const SYSTEM_PROMPT = `You write plain-English explanations of ballot measures for a free, nonpartisan voter guide.

Answer four questions using ONLY the official text you are given:
- whatItDoes: What does the measure do?
- ifPasses: What changes if it passes?
- ifFails: What stays the same if it fails?
- whoIsAffected: Who is affected?

Neutrality rules:
- Never recommend a vote or suggest which side is better.
- No loaded, emotional, or persuasive words. Describe; don't characterize.
- Treat the yes and no outcomes with equal care and similar length.
- Do not repeat or weigh the supporters' or opponents' arguments or names.
- If the official text doesn't answer a question, say "The official text does not say."
- Do not add facts, numbers, or context that aren't in the text.

Style: 1-3 short sentences per answer, about an 8th-grade reading level, no jargon.`;

function measureDocument(contest: Contest): string {
  const fields: [string, string | undefined][] = [
    ["Title", contest.referendumTitle ?? contest.ballotTitle],
    ["Subtitle", contest.referendumSubtitle],
    ["Brief", contest.referendumBrief],
    ["Full text", contest.referendumText],
    ["Official statement in favor", contest.referendumProStatement],
    ["Official statement against", contest.referendumConStatement],
    ["Passage threshold", contest.referendumPassageThreshold],
    ["Effect of abstaining", contest.referendumEffectOfAbstain],
  ];
  return fields
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}:\n${v!.trim()}`)
    .join("\n\n");
}

export class SummaryRefused extends Error {}

export async function summarizeMeasure(contest: Contest): Promise<MeasureSummary> {
  // apiKey comes from ANTHROPIC_API_KEY. One attempt only: the function has a hard timeout,
  // and the voter already sees the official text while this loads.
  const client = new Anthropic({ timeout: 22_000, maxRetries: 0 });

  const response = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM_PROMPT,
    output_config: {
      effort: "low",
      format: betaZodOutputFormat(SummarySchema),
    },
    messages: [
      {
        role: "user",
        content: `<official_measure_text>\n${measureDocument(contest)}\n</official_measure_text>`,
      },
    ],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new SummaryRefused(response.stop_reason ?? "no output");
  }
  return response.parsed_output;
}
