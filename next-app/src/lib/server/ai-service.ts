import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    console.warn("WARNING: OPENAI_API_KEY not set. AI features will be disabled.");
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

function sanitizeInput(input: string): string {
    if (!input || typeof input !== "string") {
        return "";
    }

    return input
        .replace(/[<>"'`]/g, "")
        .replace(/\{[^}]*system[^}]*\}/gi, "")
        .replace(/\{[^}]*role[^}]*\}/gi, "")
        .replace(/```[^`]*```/g, "")
        .substring(0, 2000)
        .trim();
}

function sanitizeCode(code: string): string {
    if (!code || typeof code !== "string") {
        return "";
    }

    return code
        .replace(/eval\s*\(/gi, "EVAL_BLOCKED(")
        .replace(/Function\s*\(/gi, "FUNCTION_BLOCKED(")
        .replace(/setTimeout\s*\(/gi, "SETTIMEOUT_BLOCKED(")
        .replace(/setInterval\s*\(/gi, "SETINTERVAL_BLOCKED(")
        .substring(0, 5000)
        .trim();
}

export interface CodeReviewResult {
    feedback: string;
    suggestions: string[];
    score?: number;
    isCorrect?: boolean;
}

export interface ValidationFailureInput {
    rule: string;
    message: string;
}

/**
 * Redige feedback apenas com base nas falhas já detectadas pelo ValidationEngine.
 * NÃO calcula score nem inventa requisitos.
 */
export async function explainValidationFailures(params: {
    exerciseTitle: string;
    exerciseInstructions: string;
    requirements: string[];
    failures: ValidationFailureInput[];
    score: number;
    htmlCode?: string;
    cssCode?: string;
    javascriptCode?: string;
}): Promise<Pick<CodeReviewResult, "feedback" | "suggestions">> {
    const fallbackSuggestions = params.failures
        .map((failure) => failure.message)
        .filter(Boolean)
        .slice(0, 3);

    const fallbackFeedback =
        fallbackSuggestions[0] ||
        "O código ainda não atende todos os requisitos do enunciado.";

    if (!openai) {
        return {
            feedback: fallbackFeedback,
            suggestions: fallbackSuggestions.length
                ? fallbackSuggestions
                : ["Revise as instruções do exercício e tente novamente"],
        };
    }

    try {
        const sanitizedTitle = sanitizeInput(params.exerciseTitle);
        const sanitizedInstructions = sanitizeInput(params.exerciseInstructions);
        const sanitizedHtml = sanitizeCode(params.htmlCode || "");
        const sanitizedCss = sanitizeCode(params.cssCode || "");
        const sanitizedJs = sanitizeCode(params.javascriptCode || "");

        const codeSnippet = [
            sanitizedHtml && `HTML:\n${sanitizedHtml}`,
            sanitizedCss && `CSS:\n${sanitizedCss}`,
            sanitizedJs && `JavaScript:\n${sanitizedJs}`,
        ]
            .filter(Boolean)
            .join("\n\n");

        const requirementsList = params.requirements.length
            ? params.requirements.map((item, index) => `${index + 1}. ${item}`).join("\n")
            : "(nenhum requisito estruturado)";

        const failuresList = params.failures.length
            ? params.failures.map((item, index) => `${index + 1}. ${item.message}`).join("\n")
            : "(nenhuma falha listada)";

        const messages: ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: `Você é um tutor de programação web. Sua ÚNICA tarefa é explicar falhas JÁ DETECTADAS por um validador automático.

REGRAS OBRIGATÓRIAS:
- NÃO invente requisitos, propriedades CSS, tags HTML ou conceitos que não estejam na lista de FALHAS ou REQUISITOS.
- NÃO sugira melhorias extras (ex.: align-items, gap, height, flex-wrap) se isso não estiver nas falhas.
- NÃO calcule nem altere score ou isCorrect — eles já foram definidos pelo sistema.
- Sugestões devem ser paráfrases curtas das falhas detectadas (no máximo 3).
- Feedback em português, no máximo 2 frases (até 200 caracteres).

Retorne APENAS JSON:
{
  "feedback": "string",
  "suggestions": ["string", "string"]
}`,
            },
            {
                role: "user",
                content: `EXERCÍCIO: ${sanitizedTitle}

INSTRUÇÕES DO ENUNCIADO: ${sanitizedInstructions}

REQUISITOS OBRIGATÓRIOS (única fonte de verdade):
${requirementsList}

FALHAS DETECTADAS PELO VALIDADOR (explique somente estas):
${failuresList}

SCORE JÁ CALCULADO PELO SISTEMA: ${params.score}
isCorrect: false

CÓDIGO DO ALUNO (contexto, não invente requisitos a partir dele):
${codeSnippet || "(vazio)"}

Escreva feedback e sugestões alinhados APENAS às falhas acima.`,
            },
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4.1-nano",
            messages,
            response_format: { type: "json_object" },
            temperature: 0,
            max_tokens: 220,
        });

        const result = response.choices[0].message.content;
        if (!result) {
            throw new Error("Resposta vazia da OpenAI");
        }

        const parsed = JSON.parse(result) as Partial<CodeReviewResult>;
        const suggestions = Array.isArray(parsed.suggestions)
            ? parsed.suggestions
                .filter((item): item is string => typeof item === "string")
                .map((item) => item.trim())
                .filter(Boolean)
                .slice(0, 3)
                .map((item) => (item.length > 100 ? `${item.slice(0, 100).trimEnd()}...` : item))
            : [];

        const feedback = typeof parsed.feedback === "string" ? parsed.feedback.trim() : "";
        const trimmedFeedback = feedback.length > 220
            ? `${feedback.slice(0, 220).trimEnd()}...`
            : feedback;

        return {
            feedback: trimmedFeedback || fallbackFeedback,
            suggestions: suggestions.length ? suggestions : fallbackSuggestions,
        };
    } catch (error) {
        console.error("Erro ao explicar falhas com OpenAI:", error);
        return {
            feedback: fallbackFeedback,
            suggestions: fallbackSuggestions.length
                ? fallbackSuggestions
                : ["Revise as instruções do exercício e tente novamente"],
        };
    }
}

/** @deprecated Preferir validação determinística + explainValidationFailures */
export async function reviewExerciseCode(
    htmlCode: string,
    cssCode: string,
    javascriptCode: string,
    exerciseTitle: string,
    exerciseDescription: string,
    exerciseInstructions: string,
): Promise<CodeReviewResult> {
    const explanation = await explainValidationFailures({
        exerciseTitle,
        exerciseInstructions: `${exerciseDescription}\n${exerciseInstructions}`,
        requirements: [],
        failures: [
            {
                rule: "legacy",
                message: "Revise o enunciado e confira se todos os requisitos pedidos foram atendidos.",
            },
        ],
        score: 0,
        htmlCode,
        cssCode,
        javascriptCode,
    });

    return {
        ...explanation,
        isCorrect: false,
        score: 0,
    };
}

export async function getExerciseHint(
    htmlCode: string,
    cssCode: string,
    javascriptCode: string,
    exerciseTitle: string,
    exerciseInstructions: string,
): Promise<string> {
    if (!openai) {
        return "O serviço de dicas por IA não está configurado. Revise as instruções do exercício e continue experimentando!";
    }

    try {
        const sanitizedHtml = sanitizeCode(htmlCode);
        const sanitizedCss = sanitizeCode(cssCode);
        const sanitizedJs = sanitizeCode(javascriptCode);
        const sanitizedTitle = sanitizeInput(exerciseTitle);
        const sanitizedInstructions = sanitizeInput(exerciseInstructions);

        const currentCode = [
            sanitizedHtml && `HTML:\n${sanitizedHtml}`,
            sanitizedCss && `CSS:\n${sanitizedCss}`,
            sanitizedJs && `JavaScript:\n${sanitizedJs}`,
        ]
            .filter(Boolean)
            .join("\n\n") || "Código vazio";

        const messages: ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: "Você é um tutor de programação web. Forneça uma dica suave e educativa que guie o aluno em direção à solução sem revelar a resposta completa. Mantenha a dica concisa e focada no próximo passo. Use markdown para destacar código quando necessário.",
            },
            {
                role: "user",
                content: `EXERCÍCIO: ${sanitizedTitle}

INSTRUÇÕES: ${sanitizedInstructions}

CÓDIGO ATUAL:
${currentCode}

Forneça uma dica para o próximo passo, sem dar a solução completa.`,
            },
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.7,
            max_tokens: 150,
        });

        return response.choices[0].message.content || "Tente revisar as instruções do exercício e continue experimentando!";
    } catch (error) {
        console.error("Erro ao gerar dica:", error);
        return "Desculpe, não foi possível gerar uma dica neste momento. Tente revisar as instruções do exercício.";
    }
}
