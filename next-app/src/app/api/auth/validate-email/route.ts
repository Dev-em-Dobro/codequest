import { NextResponse } from "next/server";
import { storage } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const body = await parseJsonBody(request);
        const email = String(body?.email || "").trim();

        if (!email) {
            return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase();
        const webhookUrl = "https://n8n.srv830193.hstgr.cloud/webhook/valida-email-codequest";
        let isValid = false;

        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: normalizedEmail }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data?.status === "200") {
                    isValid = true;
                }
            }
        } catch {
            isValid = false;
        }

        if (!isValid) {
            return NextResponse.json({
                isValid: false,
                userExists: false,
                message:
                    "Este email não está cadastrado em nossa base de dados. Se não lembra qual seu email do DevQuest, entre em contato com nosso suporte pelo WhatsApp.",
            });
        }

        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({
                isValid: false,
                userExists: true,
                message: "Este email já possui uma conta cadastrada. Por favor, faça login.",
            });
        }

        return NextResponse.json({
            isValid: true,
            userExists: false,
            message: "Email válido! Complete o cadastro com nome e senha.",
        });
    } catch {
        return internalError();
    }
}
