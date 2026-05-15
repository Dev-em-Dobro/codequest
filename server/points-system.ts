import { storage } from "./storage";

// Points awarded for different actions
export const POINTS_CONFIG = {
  EXERCISE_COMPLETION: 10,
  FIRST_TIME_COMPLETION: 15,
  PERFECT_SOLUTION: 25,
  DAILY_STREAK: 5,
} as const;

export interface PointsAwarded {
  points: number;
  reason: string;
  exerciseId: string;
  userId: string;
}

export async function awardPoints(
  userId: string, 
  exerciseId: string, 
  pointsType: keyof typeof POINTS_CONFIG
): Promise<PointsAwarded> {
  const points = POINTS_CONFIG[pointsType];
  
  try {
    // Get current user
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user points
    const updatedUser = await storage.updateUser(userId, {
      totalPoints: (user.totalPoints || 0) + points,
    });

    // Update user progress for this exercise
    await storage.updateUserProgress(exerciseId, {
      completed: true,
      completedAt: new Date(),
      points: points,
    });

    const reason = getPointsReason(pointsType);

    return {
      points,
      reason,
      exerciseId,
      userId,
    };
  } catch (error) {
    console.error("Error awarding points:", error);
    throw error;
  }
}

function getPointsReason(pointsType: keyof typeof POINTS_CONFIG): string {
  switch (pointsType) {
    case "EXERCISE_COMPLETION":
      return "Exercício concluído";
    case "FIRST_TIME_COMPLETION":
      return "Primeiro exercício concluído";
    case "PERFECT_SOLUTION":
      return "Solução perfeita";
    case "DAILY_STREAK":
      return "Sequência diária";
    default:
      return "Pontos ganhos";
  }
}

export async function getUserLevel(points: number): Promise<number> {
  return Math.floor(points / 100) + 1;
}

export async function getPointsToNextLevel(points: number): Promise<number> {
  const currentLevel = await getUserLevel(points);
  const nextLevelPoints = currentLevel * 100;
  return nextLevelPoints - points;
}