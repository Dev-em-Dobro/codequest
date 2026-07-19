import { storage } from "./storage";
import type { AppUser, UpdateUserInput } from "./types";

export { validationEngine } from "./validation-engine";
export {
    getExerciseHint,
    reviewExerciseCode,
    explainValidationFailures,
    reviewExerciseByInstructions,
} from "./ai-service";
export { getExerciseReviewMode, AI_REVIEW_EXERCISE_IDS } from "./validation-engine";

const userStorageAdapter = {
	async getUser(id: string): Promise<AppUser | undefined> {
		return storage.getUser(id);
	},
	async getAllUsers(): Promise<AppUser[]> {
		return storage.getAllUsers();
	},
	async updateUser(id: string, data: UpdateUserInput): Promise<AppUser> {
		return storage.updateUser(id, data);
	},
};

export { storage, userStorageAdapter };
