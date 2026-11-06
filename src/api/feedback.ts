import { apiClient } from './client';

export interface FoodFeedback {
  id: string;
  branch_id?: string;
  studentId: string;
  studentName?: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  rating: number; // 1 to 5
  tags: string;
  comments: string;
  createdAt?: string;
}

export interface SubmitFeedbackPayload {
  studentId: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  rating: number;
  tags?: string;
  comments?: string;
}

export async function submitFoodFeedback(payload: SubmitFeedbackPayload): Promise<FoodFeedback> {
  const { data } = await apiClient.post<FoodFeedback>('/feedback', payload);
  return data;
}

export async function getFoodFeedbacks(studentId?: string): Promise<FoodFeedback[]> {
  const { data } = await apiClient.get<FoodFeedback[]>('/feedback', {
    params: studentId ? { studentId } : undefined,
  });
  return data;
}
