import { Phase2RouteShell } from "../../_components/phase2-route-shell";

export default function AdminAddExercisePage() {
    return (
        <Phase2RouteShell
            path="/admin/add-exercise"
            title="Admin - Adicionar exercicio"
            description="Rota migrada para App Router. O fluxo de criacao sera ligado mantendo o contrato da API atual."
        />
    );
}
