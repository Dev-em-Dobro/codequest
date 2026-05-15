// Centralized query keys for React Query
// This ensures stable keys and prevents unnecessary re-renders

export const queryKeys = {
  // User related queries
  user: () => ['/api/user'] as const,
  userById: (id: string) => ['/api/user', id] as const,
  
  // Exercises related queries
  exercises: () => ['/api/exercises'] as const,
  exerciseById: (id: string) => ['/api/exercises', id] as const,
  exercisesByCategory: (category: string) => ['/api/exercises', 'category', category] as const,
  
  // Progress related queries
  progress: () => ['/api/progress'] as const,
  progressById: (exerciseId: string) => ['/api/progress', exerciseId] as const,
  
  // Other queries
  ranking: () => ['/api/ranking'] as const,
  categories: () => ['/api/categories'] as const,
} as const;

// Type helpers for better TypeScript support
export type QueryKey = ReturnType<typeof queryKeys[keyof typeof queryKeys]>;