import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Code, AlertTriangle, Key, Database, Shield } from "lucide-react";

export function FirebaseSetupMessage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Code className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CodeQuest</h1>
          </div>
          <p className="text-gray-600">Configuração do Firebase necessária</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Firebase não configurado</CardTitle>
            <CardDescription>
              Para usar a autenticação do Google, é necessário configurar as credenciais do Firebase
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Adicione as seguintes variáveis de ambiente nos Secrets do Replit:
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono">VITE_FIREBASE_API_KEY</code>
                <span className="text-xs text-gray-500">API Key</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono">VITE_FIREBASE_PROJECT_ID</code>
                <span className="text-xs text-gray-500">Project ID</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono">VITE_FIREBASE_APP_ID</code>
                <span className="text-xs text-gray-500">App ID</span>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
              <h4 className="font-medium text-blue-900 flex items-center mb-2">
                <Database className="w-4 h-4 mr-2" />
                Como obter as credenciais
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
                <li>Crie um novo projeto ou selecione o projeto "codequest-35d89"</li>
                <li>Vá em "Project Settings" (ícone de engrenagem)</li>
                <li>Na aba "General", encontre suas credenciais na seção "Your apps"</li>
                <li>Copie os valores necessários e adicione nos Secrets do Replit</li>
              </ol>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4">
              <h4 className="font-medium text-green-900 flex items-center mb-2">
                <Shield className="w-4 h-4 mr-2" />
                Configuração da Autenticação
              </h4>
              <p className="text-sm text-green-800">
                Certifique-se de habilitar a autenticação do Google no Firebase Console:
                Authentication → Sign-in method → Google → Enable
              </p>
            </div>

            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Verificar configuração novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}