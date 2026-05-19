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
    void htmlCode;
    void cssCode;
    void javascriptCode;
    void exerciseTitle;
    void exerciseDescription;
    void exerciseInstructions;

    return {
        feedback: "Revisão por IA ainda em migração para o Next.js. Use a validação automática por enquanto.",
        suggestions: ["Revise as instruções do exercício", "Tente validar novamente após ajustar o código"],
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
    void htmlCode;
    void cssCode;
    void javascriptCode;
    void exerciseTitle;
    void exerciseInstructions;
    return "Dica temporária: revise os requisitos do enunciado e avance em passos pequenos (estrutura, estilo e comportamento).";
}
