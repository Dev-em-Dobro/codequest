import type { Exercise } from "./storage-types";

export interface ValidationFailure {
    rule: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    message: string;
    score: number;
    details?: string;
    failures?: ValidationFailure[];
}

export interface ValidationResults {
    isValid: boolean;
    overallScore: number;
    results: ValidationResult[];
    failures: ValidationFailure[];
    requirements: string[];
    jsOutput?: string;
}

export type ValidationRule = {
    type: string;
    rule: string;
    message: string;
    count?: number;
};

/** Regras padrão alinhadas ao enunciado quando o exercício ainda não tem validationRules no banco. */
export const DEFAULT_VALIDATION_RULES: Record<string, ValidationRule[]> = {
    "css-flexbox-basico": [
        {
            type: "contains",
            rule: "display: flex",
            message: "Deve usar 'display: flex' no container.",
        },
        {
            type: "contains",
            rule: "justify-content",
            message: "Use 'justify-content' para alinhar os elementos na horizontal.",
        },
    ],
};

function normalizeCssForMatch(css: string): string {
    return css.toLowerCase().replace(/\s+/g, " ");
}

/** Regras no banco às vezes vêm escapadas como regex (ex.: "\\*") — contains é busca literal. */
function normalizeContainsNeedle(rule: string): string {
    return rule
        .replace(/\\([.*+?^${}()|[\]\\])/g, "$1")
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function cssContainsDisplayFlex(cssLower: string): boolean {
    return cssLower.includes("display: flex") || cssLower.includes("display:flex");
}

function dedupeFailures(failures: ValidationFailure[]): ValidationFailure[] {
    const seen = new Set<string>();
    return failures.filter((failure) => {
        const key = `${failure.rule}::${failure.message}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

export function getEffectiveValidationRules(exercise: Exercise): ValidationRule[] {
    // Exercícios com enunciado fixo no código têm prioridade sobre o banco,
    // para a IA nunca exigir requisitos inventados/desatualizados.
    if (DEFAULT_VALIDATION_RULES[exercise.id]) {
        return DEFAULT_VALIDATION_RULES[exercise.id];
    }
    if (Array.isArray(exercise.validationRules) && exercise.validationRules.length > 0) {
        return exercise.validationRules as ValidationRule[];
    }
    return [];
}

export class ValidationEngine {
    async validateExercise(
        exercise: Exercise,
        userCode: { html: string; css: string; javascript: string },
    ): Promise<ValidationResults> {
        const results: ValidationResult[] = [];
        let totalScore = 0;
        let jsOutput = "";
        const failures: ValidationFailure[] = [];
        const effectiveRules = getEffectiveValidationRules(exercise);
        const requirements = effectiveRules.map((rule) => rule.message);

        if (exercise.category === "html") {
            const htmlResult = this.validateHTML(exercise, userCode.html);
            results.push(htmlResult);
            totalScore += htmlResult.score;
            if (htmlResult.failures?.length) {
                failures.push(...htmlResult.failures);
            }
        }

        if (exercise.category === "css") {
            const cssResult = this.validateCSS(exercise, userCode.css);
            results.push(cssResult);
            totalScore += cssResult.score;
            if (cssResult.failures?.length) {
                failures.push(...cssResult.failures);
            }
        }

        if (exercise.category === "javascript") {
            const jsResult = await this.validateJavaScript(exercise, userCode.javascript);
            results.push(jsResult.validation);
            totalScore += jsResult.validation.score;
            jsOutput = jsResult.output;
            if (jsResult.validation.failures?.length) {
                failures.push(...jsResult.validation.failures);
            }
        }

        const ruleFailures = this.applyValidationRules(effectiveRules, userCode, exercise.category);
        failures.push(...ruleFailures);

        const uniqueFailures = dedupeFailures(failures);
        let overallScore = results.length > 0 ? totalScore / results.length : 0;

        // Exercícios sem check específico (score genérico < 100) mas com regras: nota pelas regras.
        const usedGenericFallback = results.some(
            (result) =>
                result.message === "HTML parece válido!" ||
                result.message === "CSS parece válido!" ||
                result.message === "JavaScript executou sem erros!",
        );

        if (usedGenericFallback && effectiveRules.length > 0) {
            const passed = effectiveRules.length - ruleFailures.length;
            overallScore = Math.round((passed / effectiveRules.length) * 100);
        } else if (uniqueFailures.length > 0 && overallScore >= 100) {
            // Regras extras falharam além do check específico.
            const passed = Math.max(0, effectiveRules.length - ruleFailures.length);
            overallScore =
                effectiveRules.length > 0
                    ? Math.min(overallScore, Math.round((passed / effectiveRules.length) * 100))
                    : Math.min(overallScore, 80);
        }

        if (uniqueFailures.length > 0) {
            overallScore = Math.min(overallScore, 99);
        }

        const isValid = overallScore >= 100 && uniqueFailures.length === 0;

        return {
            isValid,
            overallScore: isValid ? 100 : Math.round(overallScore),
            results,
            failures: uniqueFailures,
            requirements,
            jsOutput,
        };
    }

    applyValidationRules(
        rules: ValidationRule[],
        userCode: { html: string; css: string; javascript: string },
        category: Exercise["category"],
    ): ValidationFailure[] {
        if (!rules.length) {
            return [];
        }

        const haystackByCategory: Record<Exercise["category"], string> = {
            html: userCode.html,
            css: userCode.css,
            javascript: userCode.javascript,
        };

        const primary = haystackByCategory[category] || "";
        const combined = `${userCode.html}\n${userCode.css}\n${userCode.javascript}`;
        const failures: ValidationFailure[] = [];

        for (const rule of rules) {
            const targetRaw = category === "css" ? primary : combined;
            const target =
                category === "css" ? normalizeCssForMatch(targetRaw) : targetRaw.toLowerCase();
            const needle = normalizeContainsNeedle(rule.rule);

            if (rule.type === "contains") {
                // display:flex aceita com ou sem espaço
                if (needle === "display: flex" || needle === "display:flex") {
                    if (!cssContainsDisplayFlex(target)) {
                        failures.push({ rule: rule.rule, message: rule.message });
                    }
                    continue;
                }

                if (!target.includes(needle) && !target.includes(needle.replace(/\s+/g, ""))) {
                    failures.push({ rule: rule.rule, message: rule.message });
                }
                continue;
            }

            if (rule.type === "count") {
                const expected = typeof rule.count === "number" ? rule.count : 1;
                const escaped = rule.rule.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const matches = targetRaw.match(new RegExp(escaped, "gi")) || [];
                if (matches.length < expected) {
                    failures.push({ rule: rule.rule, message: rule.message });
                }
            }
        }

        return failures;
    }

    private validateHTML(exercise: Exercise, html: string): ValidationResult {
        const htmlLower = html.toLowerCase();

        if (!html.trim()) {
            return {
                isValid: false,
                message: "Código HTML está vazio. Adicione algum conteúdo HTML.",
                score: 0,
                failures: [{ rule: "html", message: "Código HTML está vazio. Adicione algum conteúdo HTML." }],
            };
        }

        if (exercise.id === "html-primeiro-paragrafo") {
            if (!htmlLower.includes("<p>") || !htmlLower.includes("</p>")) {
                return {
                    isValid: false,
                    message: "Exercício requer uma tag <p>. Adicione um parágrafo.",
                    score: 20,
                    failures: [
                        { rule: "<p>", message: "Exercício requer uma tag <p>. Adicione um parágrafo." },
                    ],
                };
            }

            if (!htmlLower.includes("primeiro parágrafo") && !htmlLower.includes("olá, mundo")) {
                return {
                    isValid: false,
                    message: "O parágrafo deve conter o texto solicitado no exercício.",
                    score: 60,
                    failures: [
                        {
                            rule: "texto",
                            message: "O parágrafo deve conter o texto solicitado no exercício.",
                        },
                    ],
                };
            }

            return { isValid: true, message: "Excelente! Parágrafo criado corretamente.", score: 100 };
        }

        if (exercise.id === "html-lista-frutas") {
            if (!htmlLower.includes("<ul>") || !htmlLower.includes("</ul>")) {
                return {
                    isValid: false,
                    message: "Exercício requer uma lista não ordenada <ul>.",
                    score: 30,
                    failures: [
                        { rule: "<ul>", message: "Exercício requer uma lista não ordenada <ul>." },
                    ],
                };
            }

            const liCount = (html.match(/<li>/gi) || []).length;
            if (liCount < 3) {
                return {
                    isValid: false,
                    message: `Lista deve ter pelo menos 3 itens. Você tem ${liCount}.`,
                    score: 50,
                    failures: [
                        {
                            rule: "<li>",
                            message: `Lista deve ter pelo menos 3 itens. Você tem ${liCount}.`,
                        },
                    ],
                };
            }

            const hasFruits = ["maçã", "banana", "laranja"].some((fruit) => htmlLower.includes(fruit));
            if (!hasFruits) {
                return {
                    isValid: false,
                    message: "Lista deve incluir algumas das frutas mencionadas: maçã, banana, laranja.",
                    score: 70,
                    failures: [
                        {
                            rule: "frutas",
                            message:
                                "Lista deve incluir algumas das frutas mencionadas: maçã, banana, laranja.",
                        },
                    ],
                };
            }

            return {
                isValid: true,
                message: "Perfeito! Lista de frutas criada corretamente.",
                score: 100,
            };
        }

        const hasValidStructure = htmlLower.includes("<") && htmlLower.includes(">");
        if (!hasValidStructure) {
            return {
                isValid: false,
                message: "HTML deve conter tags válidas.",
                score: 10,
                failures: [{ rule: "html", message: "HTML deve conter tags válidas." }],
            };
        }

        return { isValid: true, message: "HTML parece válido!", score: 85 };
    }

    private validateCSS(exercise: Exercise, css: string): ValidationResult {
        if (!css.trim()) {
            return {
                isValid: false,
                message: "Código CSS está vazio. Adicione alguns estilos.",
                score: 0,
                failures: [{ rule: "css", message: "Código CSS está vazio. Adicione alguns estilos." }],
            };
        }

        const cssLower = css.toLowerCase();

        if (exercise.id === "css-botao-colorido") {
            if (!cssLower.includes("button")) {
                return {
                    isValid: false,
                    message: "CSS deve estilizar o elemento 'button'.",
                    score: 20,
                    failures: [{ rule: "button", message: "CSS deve estilizar o elemento 'button'." }],
                };
            }
            if (!cssLower.includes("background-color") && !cssLower.includes("background:")) {
                return {
                    isValid: false,
                    message: "Botão deve ter uma cor de fundo (background-color).",
                    score: 40,
                    failures: [
                        {
                            rule: "background-color",
                            message: "Botão deve ter uma cor de fundo (background-color).",
                        },
                    ],
                };
            }
            if (!cssLower.includes("color:") && !cssLower.includes("color ")) {
                return {
                    isValid: false,
                    message: "Botão deve ter cor do texto definida.",
                    score: 60,
                    failures: [
                        { rule: "color", message: "Botão deve ter cor do texto definida." },
                    ],
                };
            }
            if (!cssLower.includes(":hover")) {
                return {
                    isValid: false,
                    message: "Adicione um efeito hover para o botão.",
                    score: 80,
                    failures: [{ rule: ":hover", message: "Adicione um efeito hover para o botão." }],
                };
            }
            return { isValid: true, message: "Excelente! Botão estilizado com cores e efeito hover.", score: 100 };
        }

        if (exercise.id === "css-flexbox-basico") {
            if (!cssContainsDisplayFlex(cssLower)) {
                return {
                    isValid: false,
                    message: "Deve usar 'display: flex' no container.",
                    score: 30,
                    failures: [
                        { rule: "display: flex", message: "Deve usar 'display: flex' no container." },
                    ],
                };
            }

            if (!cssLower.includes("justify-content")) {
                return {
                    isValid: false,
                    message: "Use 'justify-content' para alinhar os elementos.",
                    score: 60,
                    failures: [
                        {
                            rule: "justify-content",
                            message: "Use 'justify-content' para alinhar os elementos.",
                        },
                    ],
                };
            }

            return {
                isValid: true,
                message: "Perfeito! Flexbox implementado corretamente.",
                score: 100,
            };
        }

        const hasValidCSS = cssLower.includes("{") && cssLower.includes("}");
        if (!hasValidCSS) {
            return {
                isValid: false,
                message: "CSS deve conter regras válidas com { }.",
                score: 20,
                failures: [{ rule: "css", message: "CSS deve conter regras válidas com { }." }],
            };
        }

        return { isValid: true, message: "CSS parece válido!", score: 85 };
    }

    private async validateJavaScript(
        exercise: Exercise,
        javascript: string,
    ): Promise<{ validation: ValidationResult; output: string }> {
        if (!javascript.trim()) {
            return {
                validation: {
                    isValid: false,
                    message: "Código JavaScript está vazio.",
                    score: 0,
                    failures: [{ rule: "javascript", message: "Código JavaScript está vazio." }],
                },
                output: "",
            };
        }

        let syntaxError: unknown = null;
        let capturedOutput = "JavaScript validation completed (static analysis only)";

        try {
            new Function(javascript);
        } catch (error) {
            syntaxError = error;
            capturedOutput = `SYNTAX ERROR: ${(error as Error).message}`;
        }

        if (exercise.id === "js-primeiro-alert") {
            if (!javascript.toLowerCase().includes("alert")) {
                return {
                    validation: {
                        isValid: false,
                        message: "Código deve usar a função 'alert()'.",
                        score: 30,
                        failures: [
                            { rule: "alert", message: "Código deve usar a função 'alert()'." },
                        ],
                    },
                    output: capturedOutput,
                };
            }

            if (!javascript.includes("Bem-vindo ao JavaScript")) {
                return {
                    validation: {
                        isValid: false,
                        message: "Alert deve mostrar a mensagem 'Bem-vindo ao JavaScript!'.",
                        score: 60,
                        failures: [
                            {
                                rule: "Bem-vindo ao JavaScript",
                                message: "Alert deve mostrar a mensagem 'Bem-vindo ao JavaScript!'.",
                            },
                        ],
                    },
                    output: capturedOutput,
                };
            }

            if (syntaxError) {
                return {
                    validation: {
                        isValid: false,
                        message: `Erro de sintaxe: ${(syntaxError as Error).message}`,
                        score: 40,
                        failures: [
                            {
                                rule: "syntax",
                                message: `Erro de sintaxe: ${(syntaxError as Error).message}`,
                            },
                        ],
                    },
                    output: capturedOutput,
                };
            }

            return {
                validation: { isValid: true, message: "Perfeito! Alert funcionando corretamente.", score: 100 },
                output: capturedOutput,
            };
        }

        if (syntaxError) {
            return {
                validation: {
                    isValid: false,
                    message: `Erro de sintaxe: ${(syntaxError as Error).message}`,
                    score: 20,
                    failures: [
                        {
                            rule: "syntax",
                            message: `Erro de sintaxe: ${(syntaxError as Error).message}`,
                        },
                    ],
                },
                output: capturedOutput,
            };
        }

        return {
            validation: { isValid: true, message: "JavaScript executou sem erros!", score: 90 },
            output: capturedOutput,
        };
    }
}

export const validationEngine = new ValidationEngine();
