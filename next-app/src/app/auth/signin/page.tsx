import { Phase2RouteShell } from "../../_components/phase2-route-shell";

export default function SignInPage() {
    return (
        <Phase2RouteShell
            path="/auth/signin"
            title="Entrar"
            description="Rota migrada para App Router. A ligacao com o fluxo de autenticacao sera conectada no passo seguinte."
        />
    );
}
