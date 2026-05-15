declare global {
  interface Window {
    monaco: any;
  }
}

export async function setupMonaco(): Promise<void> {
  if (window.monaco) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js';
    script.onload = () => {
      window.require.config({ 
        paths: { 
          'vs': 'https://unpkg.com/monaco-editor@0.44.0/min/vs' 
        } 
      });
      
      window.require(['vs/editor/editor.main'], () => {
        // Set up Monaco themes and configurations
        window.monaco.editor.defineTheme('codelearn-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '6A737D' },
            { token: 'keyword', foreground: 'F97583' },
            { token: 'string', foreground: '9ECBFF' },
            { token: 'number', foreground: '79B8FF' },
          ],
          colors: {
            'editor.background': '#1a1a1a',
            'editor.foreground': '#e1e4e8',
            'editorLineNumber.foreground': '#6a737d',
            'editorCursor.foreground': '#c8e1ff',
          }
        });

        window.monaco.editor.setTheme('codelearn-dark');
        resolve();
      });
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Monaco Editor'));
    };
    
    document.head.appendChild(script);
  });
}
