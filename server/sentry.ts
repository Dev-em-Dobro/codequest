import * as Sentry from "@sentry/node";

export function initSentry() {
  // Só inicializa se tiver a DSN configurada
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    console.log("Sentry DSN não configurada - logging desabilitado no backend");
    return;
  }

  Sentry.init({
    dsn: dsn,
    environment: process.env.NODE_ENV || "development",
    
    // Taxa de amostragem simples
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Filtra informações sensíveis
    beforeSend(event) {
      // Remove senhas e tokens de eventos
      if (event.request) {
        if (event.request.data) {
          delete event.request.data.password;
          delete event.request.data.token;
        }
        if (event.request.headers) {
          delete event.request.headers['authorization'];
        }
      }
      return event;
    },
  });
  
  console.log("Sentry inicializado com sucesso");
}

// Helper para capturar erros manualmente
export function captureError(error: Error, context?: Record<string, any>) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context
    });
  } else {
    console.error("Erro capturado:", error, context);
  }
}