import type { Exercise } from "./storage-types";

export interface ValidationResult {
    isValid: boolean;
    message: string;
    score: number;
    details?: string;
}

export interface ValidationResults {
    isValid: boolean;
    overallScore: number;
    results: ValidationResult[];
    jsOutput?: string;
}

export class ValidationEngine {
    async validateExercise(
        exercise: Exercise,
        userCode: { html: string; css: string; javascript: string },
    ): Promise<ValidationResults> {
        const results: ValidationResult[] = [];
        let totalScore = 0;
        let jsOutput = "";

        if (exercise.category === "html") {
            const htmlResult = this.validateHTML(exercise, userCode.html);
            results.push(htmlResult);
            totalScore += htmlResult.score;
        }

        if (exercise.category === "css") {
            const cssResult = this.validateCSS(exercise, userCode.css);
            results.push(cssResult);
            totalScore += cssResult.score;
        }

        if (exercise.category === "javascript") {
            const jsResult = await this.validateJavaScript(exercise, userCode.javascript);
            results.push(jsResult.validation);
            totalScore += jsResult.validation.score;
            jsOutput = jsResult.output;
        }

        const overallScore = results.length > 0 ? totalScore / results.length : 0;
        const isValid = overallScore >= 100;

        return { isValid, overallScore, results, jsOutput };
    }

    private validateHTML(exercise: Exercise, html: string): ValidationResult {
        const htmlLower = html.toLowerCase();

        if (!html.trim()) {
            return { isValid: false, message: "Código HTML está vazio. Adicione algum conteúdo HTML.", score: 0 };
        }

        if (exercise.id === "html-primeiro-paragrafo") {
            if (!htmlLower.includes("<p>") || !htmlLower.includes("</p>")) {
                return { isValid: false, message: "Exercício requer uma tag <p>. Adicione um parágrafo.", score: 20 };
            }

            if (!htmlLower.includes("primeiro parágrafo") && !htmlLower.includes("olá, mundo")) {
                return {
                    isValid: false,
                    message: "O parágrafo deve conter o texto solicitado no exercício.",
                    score: 60,
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
                };
            }

            const liCount = (html.match(/<li>/gi) || []).length;
            if (liCount < 3) {
                return {
                    isValid: false,
                    message: `Lista deve ter pelo menos 3 itens. Você tem ${liCount}.`,
                    score: 50,
                };
            }

            const hasFruits = ["maçã", "banana", "laranja"].some((fruit) => htmlLower.includes(fruit));
            if (!hasFruits) {
                return {
                    isValid: false,
                    message: "Lista deve incluir algumas das frutas mencionadas: maçã, banana, laranja.",
                    score: 70,
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
            return { isValid: false, message: "HTML deve conter tags válidas.", score: 10 };
        }

        return { isValid: true, message: "HTML parece válido!", score: 85 };
    }

    private validateCSS(exercise: Exercise, css: string): ValidationResult {
        if (!css.trim()) {
            return { isValid: false, message: "Código CSS está vazio. Adicione alguns estilos.", score: 0 };
        }

        const cssLower = css.toLowerCase();

        if (exercise.id === "css-botao-colorido") {
            if (!cssLower.includes("button")) {
                return { isValid: false, message: "CSS deve estilizar o elemento 'button'.", score: 20 };
            }
            if (!cssLower.includes("background-color") && !cssLower.includes("background:")) {
                return { isValid: false, message: "Botão deve ter uma cor de fundo (background-color).", score: 40 };
            }
            if (!cssLower.includes("color:") && !cssLower.includes("color ")) {
                return { isValid: false, message: "Botão deve ter cor do texto definida.", score: 60 };
            }
            if (!cssLower.includes(":hover")) {
                return { isValid: false, message: "Adicione um efeito hover para o botão.", score: 80 };
            }
            return { isValid: true, message: "Excelente! Botão estilizado com cores e efeito hover.", score: 100 };
        }

        if (exercise.id === "css-flexbox-basico") {
            if (!cssLower.includes("display: flex") && !cssLower.includes("display:flex")) {
                return {
                    isValid: false,
                    message: "Deve usar 'display: flex' no container.",
                    score: 30,
                };
            }

            if (!cssLower.includes("justify-content")) {
                return {
                    isValid: false,
                    message: "Use 'justify-content' para alinhar os elementos.",
                    score: 60,
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
            return { isValid: false, message: "CSS deve conter regras válidas com { }.", score: 20 };
        }

        return { isValid: true, message: "CSS parece válido!", score: 85 };
    }

    private async validateJavaScript(
        exercise: Exercise,
        javascript: string,
    ): Promise<{ validation: ValidationResult; output: string }> {
        if (!javascript.trim()) {
            return {
                validation: { isValid: false, message: "Código JavaScript está vazio.", score: 0 },
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
                    validation: { isValid: false, message: "Código deve usar a função 'alert()'.", score: 30 },
                    output: capturedOutput,
                };
            }

            if (!javascript.includes("Bem-vindo ao JavaScript")) {
                return {
                    validation: {
                        isValid: false,
                        message: "Alert deve mostrar a mensagem 'Bem-vindo ao JavaScript!'.",
                        score: 60,
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
