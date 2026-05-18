import { Phase2RouteShell } from "../../_components/phase2-route-shell";

export default function ForgotPasswordPage() {
    return (
        <Phase2RouteShell
            path="/auth/forgot-password"
            title="Recuperar senha"
            description="Rota migrada para App Router. O comportamento atual sera mantido durante as proximas fases."
        />
    );
}
