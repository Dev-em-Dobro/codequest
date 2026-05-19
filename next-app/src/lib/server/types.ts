import type { User } from "./storage-types";

export interface UserProfileFields {
  description?: string;
  avatar?: string;
  github?: string;
  linkedin?: string;
}

export type AppUser = User & UserProfileFields;

export interface UpdateUserInput extends UserProfileFields {
  name?: string;
  totalPoints?: number;
  completedExercises?: number;
}
