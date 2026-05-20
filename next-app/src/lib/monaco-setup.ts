type MonacoRuntime = {
    monaco?: {
        editor: {
            defineTheme: (name: string, themeData: unknown) => void;
            setTheme: (name: string) => void;
        };
    };
    require?: {
        config: (configuration: { paths: Record<string, string> }) => void;
        (modules: string[], onLoad: () => void, onError?: (error: unknown) => void): void;
    };
};

const MONACO_VERSION = "0.44.0";
const MONACO_LOADER_ID = "codequest-monaco-loader";
const runtime = globalThis as unknown as MonacoRuntime;

async function ensureMonacoLoader(): Promise<void> {
    if (runtime.require) {
        return;
    }

    const existingScript = document.getElementById(MONACO_LOADER_ID) as HTMLScriptElement | null;

    if (existingScript) {
        await new Promise<void>((resolve, reject) => {
            existingScript.addEventListener("load", () => resolve(), { once: true });
            existingScript.addEventListener("error", () => reject(new Error("Falha ao carregar loader do Monaco.")), {
                once: true,
            });
        });
        return;
    }

    await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.id = MONACO_LOADER_ID;
        script.src = `https://unpkg.com/monaco-editor@${MONACO_VERSION}/min/vs/loader.js`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Falha ao carregar script do Monaco."));
        document.head.appendChild(script);
    });
}

export async function setupMonaco(): Promise<void> {
    if (runtime.monaco) {
        return;
    }

    await ensureMonacoLoader();

    if (!runtime.require) {
        throw new Error("AMD loader do Monaco nao foi inicializado.");
    }

    const vsPath = `https://unpkg.com/monaco-editor@${MONACO_VERSION}/min/vs`;
    runtime.require.config({ paths: { vs: vsPath } });

    await new Promise<void>((resolve, reject) => {
        runtime.require?.(
            ["vs/editor/editor.main"],
            () => {
                if (!runtime.monaco) {
                    reject(new Error("Monaco nao foi carregado corretamente."));
                    return;
                }

                runtime.monaco.editor.defineTheme("codequest-dark", {
                    base: "vs-dark",
                    inherit: true,
                    rules: [
                        { token: "comment", foreground: "6A737D" },
                        { token: "keyword", foreground: "F97583" },
                        { token: "string", foreground: "9ECBFF" },
                        { token: "number", foreground: "79B8FF" },
                    ],
                    colors: {
                        "editor.background": "#1a1a1a",
                        "editor.foreground": "#e1e4e8",
                        "editorLineNumber.foreground": "#6a737d",
                        "editorCursor.foreground": "#c8e1ff",
                    },
                });

                runtime.monaco.editor.setTheme("codequest-dark");
                resolve();
            },
            (error) => {
                const details = error instanceof Error ? error.message : "erro desconhecido";
                reject(new Error(`Falha ao inicializar Monaco: ${details}`));
            },
        );
    });
}
