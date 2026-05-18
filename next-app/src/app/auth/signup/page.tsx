import { Phase2RouteShell } from "../../_components/phase2-route-shell";

export default function SignUpPage() {
    return (
        <Phase2RouteShell
            path="/auth/signup"
            title="Cadastro"
            description="Rota migrada para App Router. A regra atual de validacao de email sera reaproveitada na integracao."
        />
    );
}
