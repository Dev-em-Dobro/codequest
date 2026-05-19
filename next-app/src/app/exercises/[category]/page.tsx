import { Phase2RouteShell } from "../../_components/phase2-route-shell";

type ExercisesByCategoryPageProps = {
    params: Promise<{ category: string }>;
};

export default async function ExercisesByCategoryPage({ params }: Readonly<ExercisesByCategoryPageProps>) {
    const { category } = await params;

    return (
        <Phase2RouteShell
            path={`/exercises/${category}`}
            title="Exercicios por categoria"
            description="Rota dinamica migrada para App Router. A listagem atual sera conectada na etapa seguinte."
        />
    );
}
