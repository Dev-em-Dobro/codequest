import { useQuery } from "@tanstack/react-query";
import { Check, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Exercise, UserProgress } from "@shared/schema";
import { useAuth } from "@/lib/simple-auth-client";
import { useEffect, useRef, useMemo } from "react";
import { queryKeys } from "@/lib/queryKeys";

interface ExerciseSidebarProps {
  currentExerciseId?: string;
}

export function ExerciseSidebar({ currentExerciseId }: ExerciseSidebarProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const activeExerciseRef = useRef<HTMLDivElement>(null);

  // Memoized query keys for stable references
  const exercisesQueryKey = useMemo(() => queryKeys.exercises(), []);
  const progressQueryKey = useMemo(() => queryKeys.progress(), []);
  
  const { data: exercises = [] } = useQuery({
    queryKey: exercisesQueryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!isAuthenticated && !isLoading,
    select: (data) => data || [], // Ensure array fallback
    placeholderData: [], // Prevent loading flicker
  }) as { data: Exercise[] };

  const { data: progress = [] } = useQuery({
    queryKey: progressQueryKey,
    staleTime: 2 * 60 * 1000, // 2 minutes for progress (more frequent updates needed)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!isAuthenticated && !isLoading,
    select: (data) => data || [], // Ensure array fallback
    placeholderData: [], // Prevent loading flicker
  }) as { data: UserProgress[] };

  // Find current exercise to determine category
  const currentExercise = exercises.find(ex => ex.id === currentExerciseId);
  const currentCategory = currentExercise?.category;

  // Filter exercises by current category
  const filteredExercises = currentCategory 
    ? exercises.filter(ex => ex.category === currentCategory)
    : exercises;

  const getExerciseStatus = (exerciseId: string) => {
    const exerciseProgress = progress.find((p) => p.exerciseId === exerciseId);
    return exerciseProgress?.completed ? "completed" : "available";
  };

  // Calculate progress only for exercises in current category
  const categoryExerciseIds = filteredExercises.map(ex => ex.id);
  const completedInCategory = progress.filter(p => 
    p.completed && categoryExerciseIds.includes(p.exerciseId)
  ).length;
  const totalInCategory = filteredExercises.length;
  const progressPercentage =
    totalInCategory > 0 ? (completedInCategory / totalInCategory) * 100 : 0;

  return (
    <aside className="w-80 bg-[#172122] shadow-sm border-r border-gray-200 overflow-y-auto min-h-screen">
      <div className="p-6 bg-[#172122]">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">
            Seu Progresso
          </h2>
          <div className="mb-2">
            <Progress value={progressPercentage} className="h-3" />
          </div>
          <p className="text-sm text-white/70">
            <span className="number">{completedInCategory}</span> de <span className="number">{totalInCategory}</span> exercícios concluídos
            {currentCategory && ` (${currentCategory.toUpperCase()})`}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-md font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
            Exercícios - {currentCategory ? currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1) : 'Todos'}
          </h3>

          <div className="flex flex-col gap-[30px]">
            {filteredExercises.map((exercise) => {
              const status = getExerciseStatus(exercise.id);
              const isActive = currentExerciseId === exercise.id;

              return (
                <div
                  key={exercise.id}
                  onClick={() => {
                    if (exercise.id !== currentExerciseId) {
                      window.location.href = `/exercise/${exercise.id}`;
                    }
                  }}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    status === "completed"
                      ? "bg-green-600/50 border border-green-400/70 hover:bg-green-600/60"
                      : isActive
                        ? "bg-secondary/10 border-2 border-secondary"
                        : "bg-card-foreground/5 border border-card-foreground/20 hover:bg-[#919595]/10"
                  }`}
                >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        status === "completed"
                          ? "bg-success"
                          : isActive
                            ? "bg-secondary"
                            : "bg-card-foreground/30"
                      }`}
                    >
                      {status === "completed" ? (
                        <Check className="text-white w-4 h-4" />
                      ) : isActive ? (
                        <Play className="text-white w-3 h-3 ml-0.5" />
                      ) : (
                        <span className="text-sm font-bold text-white number">
                          {exercise.order}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white" style={{ fontFamily: 'var(--font-inter)' }}>
                        {exercise.title}
                      </h4>
                      <p className="text-sm text-white/70 capitalize" style={{ fontFamily: 'var(--font-inter)' }}>
                        {exercise.difficulty} • <span className="number">{exercise.points}</span> pontos
                      </p>
                    </div>
                  </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}