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

export async function reviewExerciseCode(
    htmlCode: string,
    cssCode: string,
    javascriptCode: string,
    exerciseTitle: string,
    exerciseDescription: string,
    exerciseInstructions: string,
): Promise<CodeReviewResult> {
    if (!openai) {
        return {
            feedback: "O serviço de revisão por IA não está configurado. Use a validação automática.",
            suggestions: ["Configure a chave da API OpenAI para habilitar revisão por IA"],
            isCorrect: false,
            score: 0,
        };
    }

    try {
        const sanitizedHtml = sanitizeCode(htmlCode);
        const sanitizedCss = sanitizeCode(cssCode);
        const sanitizedJs = sanitizeCode(javascriptCode);
        const sanitizedTitle = sanitizeInput(exerciseTitle);
        const sanitizedDescription = sanitizeInput(exerciseDescription);
        const sanitizedInstructions = sanitizeInput(exerciseInstructions);

        const codeToReview = [
            sanitizedHtml && `HTML:\n${sanitizedHtml}`,
            sanitizedCss && `CSS:\n${sanitizedCss}`,
            sanitizedJs && `JavaScript:\n${sanitizedJs}`,
        ]
            .filter(Boolean)
            .join("\n\n");

        const messages: ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: `Você é um especialista em revisão de código web (HTML, CSS, JavaScript) para exercícios educacionais.

Analise cuidadosamente se o código atende TODOS os requisitos do exercício, mas tenha discernimento para julgar se o códigos atende os requisitos, mesmo que os seletores, classes ou ids estejam diferentes do pedido no enunciado.

REGRAS IMPORTANTES DE AVALIAÇÃO:
- Score 100 e isCorrect true: APENAS se o código atender todos os requisitos
- Score 80-99: Código quase perfeito, mas falta algum pequeno detalhe
- Score 60-79: Código parcialmente correto, faltam alguns requisitos
- Score 40-59: Código com a ideia certa mas muitas falhas
- Score 0-39: Código muito incorreto ou vazio

Para exercícios CSS:
- Verifique se todos os seletores pedidos estão presentes
- Verifique se todas as propriedades solicitadas foram aplicadas
- caso tenha sido usado outros seletores que não foram solicitados, verifique se eles estão corretos do ponto de vista de CSS, se sim pode dar o exercicio como correto

Para exercícios HTML:
- Verifique se todas as tags pedidas estão presentes
- Verifique se a estrutura está correta
- Verifique se o conteúdo solicitado está presente
- Verifique se o código estruturamelmente esta certo, mesmo que as classes ou ids estajam diferentes do pedido no enunciado

Para exercícios JavaScript:
- Verifique se a lógica está correta
- Verifique se produz o resultado esperado

Feedback em português:
- Se correto (100): parabenize e confirme que está perfeito
- Se incorreto: explique o que falta sem dar a resposta

Retorne APENAS um JSON no formato:
{
  "feedback": "string com feedback principal",
  "suggestions": ["array", "de", "sugestões"],
  "isCorrect": boolean (true APENAS se score = 100),
  "score": número de 0 a 100
}`,
            },
            {
                role: "user",
                content: `EXERCÍCIO: ${sanitizedTitle}

DESCRIÇÃO: ${sanitizedDescription}

INSTRUÇÕES: ${sanitizedInstructions}

CÓDIGO ENVIADO:
${codeToReview}

Analise se este código resolve o exercício corretamente.`,
            },
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4.1-nano",
            messages,
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 500,
        });

        const result = response.choices[0].message.content;
        if (!result) {
            throw new Error("Resposta vazia da OpenAI");
        }

        return JSON.parse(result) as CodeReviewResult;
    } catch (error) {
        console.error("Erro na revisão de código OpenAI:", error);
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
