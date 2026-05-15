import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Palette, Zap } from "lucide-react";
import { setupMonaco } from "@/lib/monaco-setup";

interface CodeEditorProps {
  initialCode: {
    html: string;
    css: string;
    javascript: string;
  };
  onChange: (code: { html: string; css: string; javascript: string }) => void;
  exerciseCategory?: string;
}

type ActiveTab = 'html' | 'css' | 'javascript';

export function CodeEditor({ initialCode, onChange, exerciseCategory }: CodeEditorProps) {
  const [isMonacoReady, setIsMonacoReady] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<ActiveTab>('html');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setupMonaco().then(() => {
      setIsMonacoReady(true);
    });
  }, []);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  // Debounced onChange to avoid blocking the editor
  const debouncedOnChange = useCallback((newCode: { html: string; css: string; javascript: string }) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      onChange(newCode);
    }, 300); // 300ms debounce
  }, [onChange]);

  const updateCode = (language: string, value: string) => {
    const newCode = { ...code, [language]: value };
    setCode(newCode);
    debouncedOnChange(newCode);
  };

  const getAvailableTabs = () => {
    if (!exerciseCategory) {
      return [
        { id: 'html', label: 'HTML', icon: <FileText className="w-4 h-4" />, color: 'text-orange-500' },
        { id: 'css', label: 'CSS', icon: <Palette className="w-4 h-4" />, color: 'text-blue-500' },
        { id: 'javascript', label: 'JavaScript', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-500' }
      ];
    }

    switch (exerciseCategory.toLowerCase()) {
      case 'html':
        return [
          { id: 'html', label: 'HTML', icon: <FileText className="w-4 h-4" />, color: 'text-orange-500' }
        ];
      case 'css':
        return [
          { id: 'html', label: 'HTML', icon: <FileText className="w-4 h-4" />, color: 'text-orange-500' },
          { id: 'css', label: 'CSS', icon: <Palette className="w-4 h-4" />, color: 'text-blue-500' }
        ];
      case 'javascript':
        return [
          { id: 'javascript', label: 'JavaScript', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-500' }
        ];
      default:
        return [
          { id: 'html', label: 'HTML', icon: <FileText className="w-4 h-4" />, color: 'text-orange-500' },
          { id: 'css', label: 'CSS', icon: <Palette className="w-4 h-4" />, color: 'text-blue-500' },
          { id: 'javascript', label: 'JavaScript', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-500' }
        ];
    }
  };

  const availableTabs = getAvailableTabs();

  // Garantir que activeTab seja válido
  useEffect(() => {
    if (!availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0]?.id as ActiveTab);
    }
  }, [availableTabs, activeTab]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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
      {/* Abas */}
      <div 
        style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          borderRadius: '8px 8px 0 0'
        }}
      >
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === tab.id ? '#1f2937' : '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '500' : '400',
              transition: 'all 0.2s ease',
              borderRadius: '0'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.borderBottomColor = '#d1d5db';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.borderBottomColor = 'transparent';
              }
            }}
          >
            <span className={tab.color} style={{ marginRight: '8px' }}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Área do Editor */}
      <Card className="border-t-0 rounded-t-none">
        <CardContent className="p-0">
          <div style={{ height: '400px', position: 'relative' }}>
            {/* HTML Editor */}
            <div style={{ display: activeTab === 'html' ? 'block' : 'none', height: '100%' }}>
              {isMonacoReady ? (
                <MonacoEditor
                  language="html"
                  value={code?.html || ""}
                  onChange={(value) => updateCode('html', value)}
                />
              ) : (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="text-green-400">Carregando editor HTML...</div>
                </div>
              )}
            </div>

            {/* CSS Editor */}
            <div style={{ display: activeTab === 'css' ? 'block' : 'none', height: '100%' }}>
              {isMonacoReady ? (
                <MonacoEditor
                  language="css"
                  value={code?.css || ""}
                  onChange={(value) => updateCode('css', value)}
                />
              ) : (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="text-green-400">Carregando editor CSS...</div>
                </div>
              )}
            </div>

            {/* JavaScript Editor */}
            <div style={{ display: activeTab === 'javascript' ? 'block' : 'none', height: '100%' }}>
              {isMonacoReady ? (
                <MonacoEditor
                  language="javascript"
                  value={code?.javascript || ""}
                  onChange={(value) => updateCode('javascript', value)}
                />
              ) : (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="text-green-400">Carregando editor JavaScript...</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MonacoEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
}

function MonacoEditor({ language, value, onChange }: MonacoEditorProps) {
  const [editor, setEditor] = useState<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);

  // Update onChange ref without recreating the editor
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || !window.monaco) return;

    const monacoEditor = window.monaco.editor.create(containerRef.current, {
      value: value || "",
      language: language === "javascript" ? "javascript" : language,
      theme: "vs-dark",
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: true,
      automaticLayout: true,
      wordWrap: "on",
      lineNumbers: "on",
      folding: true,
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: "line",
      renderWhitespace: "selection",
      fixedOverflowWidgets: false,
      // Enhanced coding features
      autoIndent: "full",
      formatOnType: true,
      formatOnPaste: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: "on",
      acceptSuggestionOnCommitCharacter: true,
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
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
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showKeywords: true,
        showWords: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showSnippets: true,
        insertMode: "replace",
        filterGraceful: true,
        localityBonus: true,
        shareSuggestSelections: false
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
        indentation: true
      },
      matchBrackets: "always",
      showUnused: true,
      showDeprecated: true,
      tabCompletion: "on",
      wordBasedSuggestions: true,
      dragAndDrop: true,
      links: true,
      colorDecorators: true,
      codeLens: false, // Disabled to avoid clutter in learning environment
    });

    // Use a stable reference to avoid recreating the listener
    const changeListener = monacoEditor.onDidChangeModelContent(() => {
      onChangeRef.current(monacoEditor.getValue());
    });

    setEditor(monacoEditor);

    return () => {
      changeListener?.dispose();
      monacoEditor?.dispose();
    };
  }, [language]); // Removed onChange from dependencies

  useEffect(() => {
    if (editor) {
      const currentValue = editor.getValue();
      if (currentValue !== value) {
        editor.setValue(value || "");
      }
    }
  }, [value, editor]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0" 
      style={{ 
        pointerEvents: 'auto', 
        zIndex: 1,
        cursor: 'text'
      }} 
    />
  );
}