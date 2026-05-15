import * as Sentry from "@sentry/react";

export function initSentry() {
  // Só inicializa se tiver a DSN configurada
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.log("Sentry DSN não configurada - logging desabilitado");
    return;
  }

  Sentry.init({
    dsn: dsn,
    environment: import.meta.env.MODE, // development ou production
    
    // Taxa de amostragem simples
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% em produção, 100% em dev
    
    // Captura apenas erros não tratados
    beforeSend(event, hint) {
      // Em desenvolvimento, também loga no console
      if (import.meta.env.DEV) {
        console.error("Sentry capturou erro:", hint.originalException);
      }
      return event;
    },
    
    // Ignora alguns erros comuns que não são críticos
    ignoreErrors: [
      // Erros de rede/navegador
      "NetworkError",
      "Network request failed",
      // Erros de extensões do navegador
      "chrome-extension://",
      "moz-extension://",
      // Erros de cancelamento
      "AbortError",
    ],
  });
}

// Função helper para capturar erros manualmente
export function captureError(error: Error, context?: Record<string, any>) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context
    });
  } else {
    console.error("Erro capturado:", error, context);
  }
}

// Função helper para adicionar contexto do usuário
export function setSentryUser(user: { id: string; email?: string; name?: string } | null) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name
      });
    } else {
      Sentry.setUser(null);
    }
  }
}