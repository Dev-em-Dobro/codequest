import { Phase2RouteShell } from "../../_components/phase2-route-shell";

export default function ProfilePage() {
    return (
        <Phase2RouteShell
            path="/auth/profile"
            title="Perfil"
            description="Rota migrada para App Router. A edicao de perfil sera conectada apos a migracao dos componentes."
        />
    );
}
