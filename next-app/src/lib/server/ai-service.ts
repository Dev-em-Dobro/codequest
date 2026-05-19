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
    const codeSize = htmlCode.length + cssCode.length + javascriptCode.length;
    const hasExerciseContext = Boolean(exerciseTitle || exerciseDescription || exerciseInstructions);
    const contextLabel = hasExerciseContext ? "contexto do exercicio" : "enunciado";
    const feedbackPrefix = codeSize > 0 ? "Recebemos seu codigo para analise." : "Nenhum codigo foi enviado.";

    return {
        feedback: `${feedbackPrefix} Revisao por IA ainda em migracao para o Next.js. Use a validacao automatica por enquanto.`,
        suggestions: [`Revise o ${contextLabel}`, "Tente validar novamente apos ajustar o codigo"],
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
    const codeSize = htmlCode.length + cssCode.length + javascriptCode.length;
    const hasExerciseContext = Boolean(exerciseTitle || exerciseInstructions);
    const contextHint = hasExerciseContext
        ? "revise os requisitos do exercicio"
        : "confirme o enunciado e os objetivos da tarefa";
    const progressHint = codeSize > 0
        ? "refine o que voce ja escreveu em pequenos ajustes"
        : "comece pela estrutura basica e evolua em passos pequenos";

    return `Dica temporaria: ${contextHint} e ${progressHint} (estrutura, estilo e comportamento).`;
}
