import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, RotateCcw, ExternalLink, CheckCircle, Play } from "lucide-react";

interface LivePreviewProps {
  code: {
    html: string;
    css: string;
    javascript: string;
  };
  autoExecuteJS?: boolean;
  onJSOutput?: (output: string) => void;
}

export function LivePreview({ code, autoExecuteJS = false, onJSOutput }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [jsExecuted, setJsExecuted] = useState(false);
  const [capturedOutput, setCapturedOutput] = useState<string[]>([]);

  const refreshPreview = () => {
    updatePreview();
  };

  const updatePreview = () => {
    if (!iframeRef.current) return;

    // Create JavaScript code that captures output
    const wrappedJS = autoExecuteJS || jsExecuted ? `
      // Capture console.log and alert
      const originalLog = console.log;
      const originalAlert = window.alert;
      const outputs = [];
      
      console.log = function(...args) {
        outputs.push('LOG: ' + args.join(' '));
        originalLog.apply(console, args);
      };
      
      window.alert = function(message) {
        outputs.push('ALERT: ' + message);
        // Show alert in UI instead of popup
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:#2563eb;color:white;padding:10px;border-radius:5px;z-index:9999;max-width:300px;';
        alertDiv.textContent = 'Alert: ' + message;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
      };
      
      try {
        ${code.javascript}
        // Send outputs to parent
        parent.postMessage({ type: 'jsOutput', outputs }, '*');
      } catch (error) {
        outputs.push('ERROR: ' + error.message);
        parent.postMessage({ type: 'jsOutput', outputs }, '*');
      }
    ` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            margin: 0;
            line-height: 1.6;
          }
          ${code.css}
        </style>
      </head>
      <body>
        ${code.html}
        <script>
          ${wrappedJS}
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    iframeRef.current.src = url;

    // Clean up the URL after setting it
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const executeJavaScript = () => {
    setJsExecuted(true);
    setCapturedOutput([]);
    updatePreview();
  };

  const openInNewTab = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visualização - Code Quest</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            margin: 0;
            line-height: 1.6;
          }
          ${code.css}
        </style>
      </head>
      <body>
        ${code.html}
        <script>
          try {
            ${code.javascript}
          } catch (error) {
            console.error('JavaScript Error:', error);
          }
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    if (newWindow) {
      newWindow.onload = () => URL.revokeObjectURL(url);
    }
  };

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'jsOutput') {
        setCapturedOutput(event.data.outputs);
        if (onJSOutput) {
          onJSOutput(event.data.outputs.join('\n'));
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onJSOutput]);

  useEffect(() => {
    // Reset JS execution when code changes
    setJsExecuted(false);
    setCapturedOutput([]);
    updatePreview();
  }, [code.html, code.css]); // Only auto-update for HTML/CSS

  useEffect(() => {
    // Reset JS execution flag when JavaScript changes
    setJsExecuted(false);
    setCapturedOutput([]);
  }, [code.javascript]);

  const hasCode = code?.html?.trim() || code?.css?.trim() || code?.javascript?.trim();

  // Default empty state message
  if (!hasCode) {
    return (
      <div className="w-full h-full bg-gray-50 flex flex-col">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h3 className="font-medium text-gray-900 flex items-center">
            <Eye className="w-4 h-4 mr-2 text-primary" />
            
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Comece a escrever código para ver o resultado aqui!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 className="font-medium text-gray-900 flex items-center">
          
        </h3>
        <div className="flex items-center space-x-2">
          {code.javascript.trim() && (
            <Button
              variant={jsExecuted ? "ghost" : "default"}
              size="sm"
              onClick={executeJavaScript}
              className={jsExecuted ? "p-1 h-auto text-gray-400 hover:text-gray-600" : "h-7 px-3 text-xs"}
            >
              <Play className="w-3 h-3 mr-1" />
              {jsExecuted ? "JS" : "Executar JS"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshPreview}
            className="p-1 h-auto text-gray-400 hover:text-gray-600"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={openInNewTab}
            className="p-1 h-auto text-gray-400 hover:text-gray-600"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Preview Area */}
      <div className="flex-1 bg-white relative">
        {hasCode ? (
          <iframe 
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Execute seu código para ver o resultado!
              </h2>
              <p className="text-gray-500">
                Escreva seu código no editor e clique em 'Executar' para visualizar.
              </p>
            </div>
          </div>
        )}
        
        {/* Success Feedback */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-success text-success-foreground px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-right">
            <CheckCircle className="w-4 h-4" />
            <span>Exercício concluído! +10 pontos</span>
          </div>
        )}
      </div>
    </div>
  );
}