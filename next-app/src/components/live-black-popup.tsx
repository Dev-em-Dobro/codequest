"use client";

import Script from "next/script";
import { useAuth } from "@/hooks/use-auth";

// [Black] Popup da live 29/10 — só pra aluno logado; sai do ar sozinho em 30/10
export function LiveBlackPopup() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return null;
    }

    return <Script src="/live-popup.js" strategy="afterInteractive" />;
}
