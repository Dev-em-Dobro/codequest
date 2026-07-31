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

    // NÃO remover aspas, crases nem <>. Em JS isso apaga operadores (>=, <=),
    // template literals (``) e strings do enunciado — a IA alucina o requisito.
    return input
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
        .replace(/\{[^}]*system[^}]*\}/gi, "")
        .replace(/\{[^}]*role[^}]*\}/gi, "")
        .replace(/\bignore\s+(all\s+|any\s+)?(previous|above|prior)\s+instructions\b/gi, "[filtered]")
        .substring(0, 4000)
        .trim();
}

function sanitizeCode(code: string): string {
    if (!code || typeof code !== "string") {
        return "";
    }

    // Bloqueia só o construtor Function(...)/new Function — NÃO a keyword "function".
    // Não reescreve setTimeout/setInterval: são APIs legítimas em exercícios.
    return code
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
        .replace(/(?<![\w$])eval\s*\(/gi, "EVAL_BLOCKED(")
        .replace(/(?<![\w$])Function\s*\(/g, "FUNCTION_BLOCKED(")
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
    return reviewExerciseByInstructions({
        htmlCode,
        cssCode,
        javascriptCode,
        exerciseTitle,
        exerciseDescription,
        exerciseInstructions,
    });
}

/**
 * Correção aberta: julga SOMENTE pelo enunciado.
 * Use quando o exercício aceita cores/textos/valores equivalentes (não fixos no banco).
 */
export async function reviewExerciseByInstructions(params: {
    htmlCode: string;
    cssCode: string;
    javascriptCode: string;
    exerciseTitle: string;
    exerciseDescription?: string;
    exerciseInstructions: string;
    category?: string;
}): Promise<CodeReviewResult> {
    if (!openai) {
        return {
            feedback: "O serviço de revisão por IA não está configurado.",
            suggestions: ["Configure a chave da API OpenAI para habilitar revisão por IA"],
            isCorrect: false,
            score: 0,
        };
    }

    try {
        const sanitizedHtml = sanitizeCode(params.htmlCode);
        const sanitizedCss = sanitizeCode(params.cssCode);
        const sanitizedJs = sanitizeCode(params.javascriptCode);
        const sanitizedTitle = sanitizeInput(params.exerciseTitle);
        const sanitizedDescription = sanitizeInput(params.exerciseDescription || "");
        const sanitizedInstructions = sanitizeInput(params.exerciseInstructions);
        const isJavaScript = (params.category || "").toLowerCase() === "javascript";

        const codeToReview = [
            sanitizedHtml && `HTML:\n${sanitizedHtml}`,
            sanitizedCss && `CSS:\n${sanitizedCss}`,
            sanitizedJs && `JavaScript:\n${sanitizedJs}`,
        ]
            .filter(Boolean)
            .join("\n\n");

        const jsExtraRules = isJavaScript
            ? `
REGRAS ESPECÍFICAS DE JAVASCRIPT:
- Avalie SOMENTE o que está escrito nas INSTRUÇÕES. Ignore dicas internas, solução do banco ou estilo pessoal.
- Aceite const, let e var como equivalentes, salvo se o enunciado exigir um específico.
- Aceite function nomeada, function expression e arrow function como equivalentes, salvo se o enunciado exigir um formato (ex.: "arrow function" ou "função nomeada").
- Aceite aspas simples, aspas duplas e template literals quando o enunciado não exigir um formato.
- Nomes de variáveis/parâmetros só são obrigatórios se o enunciado nomear explicitamente (ex.: array numeros, variável total).
- NÃO exija try/catch, tipagem, comentários, HTML, DOM ou CSS se o enunciado não pedir.
- NÃO exija valores literais exatos (números, nomes de pessoas, textos de exemplo) se o enunciado permitir qualquer valor do tipo pedido.
- Se o enunciado pedir console.log / alert / fetch / for / forEach / map / filter / reduce / find etc., verifique o uso conceitual — não a formatação idêntica à solução modelo.
- Código sintaticamente válido que cumpre todos os pontos do enunciado = score 100 e isCorrect true.
`
            : "";

        const messages: ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: `Você avalia exercícios de HTML/CSS/JS com enunciado ABERTO.

FONTE ÚNICA DE VERDADE: as INSTRUÇÕES do exercício.
- NÃO exija texto, cor hex, fonte ou valor que não esteja escrito no enunciado.
- Se o enunciado diz "uma cor específica" / "ajuste a cor" sem nomear a cor, QUALQUER cor válida serve.
- Se o enunciado nomeia a cor (ex.: vermelho), aceite equivalentes (red, #f00, #ff0000, #e74c3c, etc.).
- Aceite class="x" e class='x' como equivalentes.
- Aceite font-weight: bold e bolder para "negrito".
- Aceite seletores/formatos CSS equivalentes (espaços, ordem de propriedades).
- Em JavaScript, aceite function tradicional e arrow function como equivalentes quando o enunciado pedir uma função.
- NÃO invente requisitos extras (não peça tipografia, layout ou cores além do enunciado).
- Texto de título/parágrafo pode ser qualquer conteúdo razoável, salvo se o enunciado pedir texto exato.
- NÃO mencione marcadores internos (FUNCTION_BLOCKED, EVAL_BLOCKED, etc.): se aparecerem, ignore — não são erro do aluno.
${jsExtraRules}
NOTA:
- 100 e isCorrect true: atende TODOS os pontos do enunciado
- 80-99: quase completo, falta detalhe pequeno do enunciado
- 60-79: parcial
- abaixo de 60: incompleto

Feedback em português, curto (máx. 2 frases / 200 chars).
suggestions: no máximo 3 itens curtos, só sobre o que falta no enunciado.

Retorne APENAS JSON:
{
  "feedback": "string",
  "suggestions": ["string"],
  "isCorrect": boolean,
  "score": number
}`,
            },
            {
                role: "user",
                content: `EXERCÍCIO: ${sanitizedTitle}

DESCRIÇÃO: ${sanitizedDescription}

INSTRUÇÕES (única fonte de verdade):
${sanitizedInstructions}

CÓDIGO DO ALUNO:
${codeToReview || "(vazio)"}

Avalie se o código atende ao enunciado. Não compare com uma solução secreta do banco.`,
            },
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4.1-nano",
            messages,
            response_format: { type: "json_object" },
            temperature: 0,
            max_tokens: 280,
        });

        const result = response.choices[0].message.content;
        if (!result) {
            throw new Error("Resposta vazia da OpenAI");
        }

        const parsed = JSON.parse(result) as CodeReviewResult;
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

        const rawScore = typeof parsed.score === "number" && Number.isFinite(parsed.score)
            ? Math.max(0, Math.min(100, Math.round(parsed.score)))
            : 0;
        const isCorrect = Boolean(parsed.isCorrect) && rawScore >= 100;

        return {
            feedback: trimmedFeedback || (isCorrect
                ? "Exercício concluído! Seu código atende ao enunciado."
                : "O código ainda não atende todos os requisitos do enunciado."),
            suggestions: isCorrect ? [] : suggestions,
            isCorrect,
            score: isCorrect ? 100 : rawScore,
        };
    } catch (error) {
        console.error("Erro na revisão aberta por IA:", error);
        return {
            feedback: "Desculpe, houve um erro ao analisar seu código. Tente novamente.",
            suggestions: ["Verifique sua conexão e tente novamente"],
            isCorrect: false,
            score: 0,
        };
    }
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
