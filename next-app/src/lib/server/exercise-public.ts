import type { Exercise } from "@/lib/server/storage-types";

/** Quantidade de envios incorretos para liberar a solução oficial. */
export const SOLUTION_UNLOCK_AFTER = 3;

/** Remove solutionCode (e regras internas) da API pública do exercício. */
export function toPublicExercise(exercise: Exercise) {
    const { solutionCode: _solutionCode, validationRules: _validationRules, ...publicExercise } = exercise;
    return publicExercise;
}

export function hasSolutionContent(solution: { html?: string; css?: string; javascript?: string }): boolean {
    return Boolean(
        solution.html?.trim() || solution.css?.trim() || solution.javascript?.trim(),
    );
}
