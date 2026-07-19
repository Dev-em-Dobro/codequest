export type ExerciseDifficulty = "iniciante" | "intermediario" | "avancado";
export type ExerciseCategory = "html" | "css" | "javascript";
/** deterministic = ValidationEngine; ai = juízo só pelo enunciado (cores/valores abertos). */
export type ExerciseReviewMode = "deterministic" | "ai";

export interface CodeTriplet {
    html: string;
    css: string;
    javascript: string;
}

export interface Exercise {
    id: string;
    title: string;
    description: string;
    instructions: string;
    difficulty: ExerciseDifficulty;
    category: ExerciseCategory;
    points: number;
    order: number;
    initialCode: CodeTriplet;
    starterTemplate: CodeTriplet;
    solutionCode: CodeTriplet;
    hints: string[];
    validationRules: Array<{ type: string; rule: string; message: string; count?: number }>;
    tests: string[];
    /** Quando "ai", a correção ignora validationRules rígidas e usa só o enunciado. */
    reviewMode?: ExerciseReviewMode;
}

export interface InsertExercise extends Omit<Exercise, "id"> {
    id?: string;
}

export interface UserProgress {
    id: string;
    userId: string;
    exerciseId: string;
    completed: boolean;
    userCode: CodeTriplet;
    attempts: number;
    pointsEarned: number;
    completedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface InsertUserProgress extends Omit<UserProgress, "id"> {
    id?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    totalPoints: number;
    completedExercises: number;
    description?: string;
    avatar?: string;
    github?: string;
    linkedin?: string;
}

export interface InsertUser extends Omit<User, "id"> {
    id?: string;
}

export interface UpdateCode {
    exerciseId: string;
    userCode: CodeTriplet;
}
