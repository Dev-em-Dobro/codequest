"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText, Palette, Zap } from "lucide-react";
import { setupMonaco } from "@/lib/monaco-setup";

type ExerciseCategory = "html" | "css" | "javascript";

type CodeTriplet = {
    html: string;
    css: string;
    javascript: string;
};

type ActiveTab = keyof CodeTriplet;

type TabOption = {
    id: ActiveTab;
    label: string;
    icon: ReactNode;
    colorClass: string;
};

type CodeEditorProps = {
    initialCode: CodeTriplet;
    onChange: (code: CodeTriplet) => void;
    exerciseCategory?: ExerciseCategory;
};

type MonacoRuntime = {
    monaco?: {
        editor: {
            create: (element: HTMLElement, options: Record<string, unknown>) => any;
            setModelLanguage: (model: unknown, languageId: string) => void;
        };
    };
};

const runtime = globalThis as unknown as MonacoRuntime;

function getTabs(category?: ExerciseCategory): TabOption[] {
    if (category === "html") {
        return [{ id: "html", label: "HTML", icon: <FileText className="w-4 h-4" />, colorClass: "text-orange-500" }];
    }

    if (category === "css") {
        return [
            { id: "html", label: "HTML", icon: <FileText className="w-4 h-4" />, colorClass: "text-orange-500" },
            { id: "css", label: "CSS", icon: <Palette className="w-4 h-4" />, colorClass: "text-blue-500" },
        ];
    }

    if (category === "javascript") {
        return [
            {
                id: "javascript",
                label: "JavaScript",
                icon: <Zap className="w-4 h-4" />,
                colorClass: "text-yellow-500",
            },
        ];
    }

    return [
        { id: "html", label: "HTML", icon: <FileText className="w-4 h-4" />, colorClass: "text-orange-500" },
        { id: "css", label: "CSS", icon: <Palette className="w-4 h-4" />, colorClass: "text-blue-500" },
        { id: "javascript", label: "JavaScript", icon: <Zap className="w-4 h-4" />, colorClass: "text-yellow-500" },
    ];
}

export function CodeEditor({ initialCode, onChange, exerciseCategory }: Readonly<CodeEditorProps>) {
    const [isMonacoReady, setIsMonacoReady] = useState(false);
    const [code, setCode] = useState(initialCode);
    const [activeTab, setActiveTab] = useState<ActiveTab>("html");
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const tabs = useMemo(() => getTabs(exerciseCategory), [exerciseCategory]);

    useEffect(() => {
        setupMonaco()
            .then(() => setIsMonacoReady(true))
            .catch(() => setIsMonacoReady(false));
    }, []);

    useEffect(() => {
        setCode(initialCode);
    }, [initialCode]);

    useEffect(() => {
        if (!tabs.some((tab) => tab.id === activeTab)) {
            setActiveTab(tabs[0]?.id ?? "html");
        }
    }, [activeTab, tabs]);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const emitChange = useCallback(
        (nextCode: CodeTriplet) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                onChange(nextCode);
            }, 200);
        },
        [onChange],
    );

    const updateCode = (tab: ActiveTab, value: string) => {
        const nextCode = {
            ...code,
            [tab]: value,
        };

        setCode(nextCode);
        emitChange(nextCode);
    };

    return (
        <div className="w-full">
            <style jsx global>{`
                .monaco-editor .suggest-widget,
                .monaco-editor .parameter-hints-widget,
                .monaco-editor .quick-input-widget,
                .monaco-editor .editor-widget,
                .monaco-editor-hover,
                .monaco-hover {
                    z-index: 9999 !important;
                }

                .monaco-editor .overflow-guard {
                    overflow: hidden !important;
                }

                .monaco-editor .suggest-widget {
                    transform: translateY(80%) !important;
                }
            `}</style>

            <div className="flex border-b border-gray-300 bg-[#f9fafb]">
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center px-4 py-2 text-sm transition-colors ${isActive
                                ? "bg-white border-b-2 border-blue-500 text-gray-900 font-medium"
                                : "text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <span className={`mr-2 ${tab.colorClass}`}>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="relative h-[420px] bg-[#1a1a1a]">
                {isMonacoReady ? (
                    <MonacoEditor
                        language={activeTab}
                        value={code[activeTab]}
                        onChange={(value) => updateCode(activeTab, value)}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-green-400 text-sm">
                        Carregando editor de codigo...
                    </div>
                )}
            </div>
        </div>
    );
}

type MonacoEditorProps = {
    language: ActiveTab;
    value: string;
    onChange: (value: string) => void;
};

function MonacoEditor({ language, value, onChange }: Readonly<MonacoEditorProps>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<any>(null);
    const changeListenerRef = useRef<{ dispose: () => void } | null>(null);
    const onChangeRef = useRef(onChange);
    const applyingExternalValueRef = useRef(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!containerRef.current || !runtime.monaco || editorRef.current) {
            return;
        }

        const monacoEditor = runtime.monaco.editor.create(containerRef.current, {
            value: value || "",
            language,
            theme: "codequest-dark",
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: true,
            automaticLayout: true,
            wordWrap: "on",
            lineNumbers: "on",
            folding: true,
            selectOnLineNumbers: true,
            cursorStyle: "line",
            renderWhitespace: "selection",
            fixedOverflowWidgets: false,
            autoIndent: "full",
            formatOnType: true,
            formatOnPaste: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            acceptSuggestionOnCommitCharacter: true,
            quickSuggestions: {
                other: true,
                comments: true,
                strings: true,
            },
            quickSuggestionsDelay: 100,
            suggest: {
                showIcons: true,
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showInterfaces: true,
                showProperties: true,
                showEvents: true,
                showKeywords: true,
                showWords: true,
                showSnippets: true,
                insertMode: "replace",
                filterGraceful: true,
                localityBonus: true,
                shareSuggestSelections: false,
            },
            parameterHints: { enabled: true },
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoSurround: "languageDefined",
            bracketPairColorization: { enabled: true },
            guides: {
                bracketPairs: true,
                bracketPairsHorizontal: true,
                highlightActiveBracketPair: true,
                indentation: true,
            },
            matchBrackets: "always",
            tabCompletion: "on",
            wordBasedSuggestions: true,
            dragAndDrop: true,
            links: true,
            colorDecorators: true,
            codeLens: false,
        });

        changeListenerRef.current = monacoEditor.onDidChangeModelContent(() => {
            if (applyingExternalValueRef.current) {
                return;
            }

            onChangeRef.current(monacoEditor.getValue());
        });

        editorRef.current = monacoEditor;

        return () => {
            changeListenerRef.current?.dispose();
            monacoEditor.dispose();
            editorRef.current = null;
            changeListenerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!editorRef.current || !runtime.monaco) {
            return;
        }

        const model = editorRef.current.getModel();
        if (model) {
            runtime.monaco.editor.setModelLanguage(model, language);
        }
    }, [language]);

    useEffect(() => {
        if (!editorRef.current) {
            return;
        }

        const currentValue = editorRef.current.getValue();
        if (currentValue !== value) {
            applyingExternalValueRef.current = true;
            editorRef.current.setValue(value || "");
            applyingExternalValueRef.current = false;
        }
    }, [value]);

    return <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 1 }} />;
}
