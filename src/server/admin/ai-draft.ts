"use server";

import OpenAI from "openai";

import { getOpenAiApiKey, getOpenAiModel } from "@/config/server-env";
import { getCurrentAdmin } from "@/lib/auth/admin";

/**
 * "Write a draft with AI" for the product editor.
 *
 * Returns draft text only; nothing is saved here. The manager reviews and
 * edits the draft in the form and saves it with the normal Save button, so
 * every published word has been read by a person.
 */

const CONTENT_LOCALES = ["rw", "en"] as const;
type ContentLocale = (typeof CONTENT_LOCALES)[number];

/** Fields the AI may draft, with the same length limits the Save action enforces. */
const DRAFT_FIELDS = {
  name: 200,
  short_description: 300,
  description: 5000,
  traditional_use: 3000,
  usage_instructions: 3000,
  origin: 300,
  storage_instructions: 1000,
  warnings: 3000,
  seo_title: 70,
  seo_description: 170,
} as const;
export type DraftField = keyof typeof DRAFT_FIELDS;
const DRAFT_FIELD_NAMES = Object.keys(DRAFT_FIELDS) as DraftField[];

export type ProductDraftInput = {
  names: Partial<Record<ContentLocale, string>>;
  category: string | null;
  /** Text the manager already wrote, so the draft agrees with it. */
  existing: Partial<Record<ContentLocale, Partial<Record<string, string>>>>;
};

export type ProductDraftResult =
  | { status: "success"; draft: Record<ContentLocale, Partial<Record<DraftField, string>>> }
  | { status: "error"; message: string; detail?: string };

const SYSTEM_PROMPT = `You write product information for the website of Imbaraga z'Igisura, a family shop in Musanze, Rwanda, that has sold natural products (herbs, spices, seeds, oils, honey and other plant-based products) for more than 20 years. Customers read the site on their phones in Kinyarwanda or English.

Write a draft for one product, in both Kinyarwanda ("rw") and English ("en"). The two languages say the same thing; write each one naturally, not as a word-for-word translation.

Fields:
- name: the product name. If the shop gave a name in that language, repeat it exactly. Otherwise use the name people in Rwanda commonly use for it in that language; if there is no common Kinyarwanda name, keep the international name.
- short_description: one or two short sentences for the product card.
- description: what the product is and what it looks, smells or tastes like. Two short paragraphs at most.
- traditional_use: how people commonly use it: in food, drinks, tea, baking, around the home, for skin and hair, AND the health and wellness uses and benefits it is widely known for (see the health rules below). Shown under the heading "How it is commonly used". Two or three short paragraphs at most.
- usage_instructions: the best ways to use and prepare it (for example: crush before use, how much for a pot of tea, add near the end of cooking).
- origin: where the plant or product comes from originally, in general (for example "Native to southern China and Vietnam"). This is NOT where the shop buys it; never guess a supplier or country of purchase.
- storage_instructions: how to keep it fresh.
- warnings: only real, well-known cautions for THIS product (for example: not for pregnant women, not for small children, can cause allergy, avoid large amounts with certain conditions). Empty string if there is none. Never a general "ask your doctor" sentence.
- seo_title: at most 60 characters, includes the product name.
- seo_description: at most 160 characters.

Rules (the business requires these):
- Health uses and benefits (the shop wants these): describe the health and wellness uses this product is widely known for and that are supported by reliable sources, and what it contains (for example vitamins, fibre, healthy fats). Write them as how people commonly use it or what it is known for ("many people drink ginger tea when they have a cold or an upset stomach", "it is rich in fibre", "it is known to support digestion"), never as a promise or a guarantee.
- Never say it cures, heals or treats a disease, never name serious diseases (such as cancer, diabetes, HIV, high blood pressure, infertility), never give doses for an illness, and never suggest using it instead of a doctor's treatment. If a health benefit is only a belief without good evidence, leave it out.
- Speak about natural products. Never use the words "medicine", "medicinal", "remedy", "traditional" or "herbal medicine" in English, and never use "imiti", "umuti", "gakondo", "ibicuruzwa" or "ubucuruzi" in Kinyarwanda. In Kinyarwanda you may say "ibintu by'umwimerere" or "ibikomoka ku bimera".
- Do not add general disclaimers or advice to see a doctor (put only product-specific cautions in "warnings").
- Never mention prices, sizes, stock, delivery, discounts, the shop's suppliers or anything else about the business itself.
- Only write what is widely known and true for this product. If you are not sure what the product is, or not sure about a field, return an empty string for that field rather than guessing.
- Plain, warm, simple language. No marketing exaggeration, no emojis, no headings or bullet symbols.
- Kinyarwanda: correct, natural Kinyarwanda as spoken in Rwanda; keep common product names that Rwandans use (for example Tangawizi, Mudarasini).`;

function draftSchema() {
  const localeSchema = {
    type: "object",
    properties: Object.fromEntries(DRAFT_FIELD_NAMES.map((f) => [f, { type: "string" }])),
    required: DRAFT_FIELD_NAMES,
    additionalProperties: false,
  };
  return {
    type: "object",
    properties: { rw: localeSchema, en: localeSchema },
    required: ["rw", "en"],
    additionalProperties: false,
  };
}

/** Words the business asked never to use; a draft field containing one is dropped. */
const FORBIDDEN_WORDS =
  /\b(medicines?|medicinal|remed(y|ies)|traditional|cures?|imiti|umuti|gakondo|ibicuruzwa|ubucuruzi)\b/i;

const clean = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function buildUserPrompt(input: ProductDraftInput): string {
  const lines = ["Product:"];
  for (const l of CONTENT_LOCALES) {
    const name = clean(input.names[l], 200);
    if (name) lines.push(`- name (${l}): ${name}`);
  }
  const category = clean(input.category, 200);
  if (category) lines.push(`- category: ${category}`);

  const existing: string[] = [];
  for (const l of CONTENT_LOCALES) {
    for (const [field, value] of Object.entries(input.existing[l] ?? {})) {
      const text = clean(value, 3000);
      if (text) existing.push(`- ${field} (${l}): ${text}`);
    }
  }
  if (existing.length > 0) {
    lines.push(
      "",
      "The shop already wrote the following. Treat it as correct, keep your draft consistent with it, and do not contradict it:",
      ...existing,
    );
  }
  return lines.join("\n");
}

export async function draftProductTextAction(
  input: ProductDraftInput,
): Promise<ProductDraftResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return { status: "error", message: "errors.notAuthorized" };

  const apiKey = getOpenAiApiKey();
  if (!apiKey) return { status: "error", message: "aiDraft.failed" };

  if (!CONTENT_LOCALES.some((l) => clean(input?.names?.[l], 200))) {
    return { status: "error", message: "aiDraft.nameMissing" };
  }

  try {
    const client = new OpenAI({ apiKey, timeout: 90_000, maxRetries: 1 });
    const response = await client.responses.create({
      model: getOpenAiModel(),
      instructions: SYSTEM_PROMPT,
      input: buildUserPrompt(input),
      reasoning: { effort: "medium" },
      max_output_tokens: 16000,
      // Product names are not private, but nothing needs to be kept by OpenAI.
      store: false,
      text: {
        format: { type: "json_schema", name: "product_draft", strict: true, schema: draftSchema() },
      },
    });

    if (response.status !== "completed" || !response.output_text) {
      console.error(
        "[ai-draft] unexpected response:",
        response.status,
        response.incomplete_details,
      );
      return { status: "error", message: "aiDraft.failed" };
    }

    const parsed = JSON.parse(response.output_text) as Record<string, Record<string, unknown>>;
    const draft = { rw: {}, en: {} } as Record<ContentLocale, Partial<Record<DraftField, string>>>;
    for (const l of CONTENT_LOCALES) {
      for (const field of DRAFT_FIELD_NAMES) {
        const value = clean(parsed[l]?.[field], DRAFT_FIELDS[field]);
        if (value && !FORBIDDEN_WORDS.test(value)) draft[l][field] = value;
      }
    }
    return { status: "success", draft };
  } catch (error) {
    return describeError(error);
  }
}

/**
 * Tells the manager WHY the draft failed (wrong key, no credit, model not
 * available, …) so it can be fixed without reading server logs. Only shown
 * to signed-in admins.
 */
function describeError(error: unknown): ProductDraftResult {
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return { status: "error", message: "aiDraft.errorTimeout" };
  }
  if (error instanceof OpenAI.APIError) {
    console.error("[ai-draft] API error", error.status, error.code, error.message);
    if (error.status === 401) return { status: "error", message: "aiDraft.errorKey" };
    if (error.code === "insufficient_quota") {
      return { status: "error", message: "aiDraft.errorQuota" };
    }
    if (error.status === 429) return { status: "error", message: "aiDraft.errorBusy" };
    if (error.status === 404 || error.code === "model_not_found") {
      return { status: "error", message: "aiDraft.errorModel" };
    }
    return {
      status: "error",
      message: "aiDraft.failedDetail",
      detail: `${error.status ?? ""} ${error.message}`.trim().slice(0, 200),
    };
  }
  console.error("[ai-draft] failed:", error instanceof Error ? error.message : error);
  return {
    status: "error",
    message: "aiDraft.failedDetail",
    detail: (error instanceof Error ? error.message : String(error)).slice(0, 200),
  };
}
