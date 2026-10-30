"use client";

import Script from "next/script";
import { useAuth } from "@/hooks/use-auth";

// [Black] Popup da oferta de alunos da Black Infinita — só pra aluno logado
export function BlackPopup() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return null;
    }

    return <Script src="/black-popup.js" strategy="afterInteractive" />;
}
