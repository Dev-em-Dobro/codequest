import { Phase2RouteShell } from "../../_components/phase2-route-shell";

type ExerciseDetailPageProps = {
    params: Promise<{ id: string }>;
};

export default async function ExerciseDetailPage({ params }: Readonly<ExerciseDetailPageProps>) {
    const { id } = await params;

    return (
        <Phase2RouteShell
            path={`/exercise/${id}`}
            title="Detalhe do exercicio"
            description="Rota dinamica migrada para App Router. A tela funcional sera conectada mantendo a URL atual."
        />
    );
}
