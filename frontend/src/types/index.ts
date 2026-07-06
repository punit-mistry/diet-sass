export interface User {
  id: string;
  name: string;
  email: string;
  role: "client" | "admin";
  isActive?: boolean;
  lastLogin?: string;
  profileImage?: string;
}

export interface DietPlan {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  assignedUsers: { _id: string; name: string; email: string }[];
  createdBy: { _id: string; name: string; email: string };
  isActive: boolean;
  tags: string[];
  createdAt: string;
}

export interface WeeklyUpdate {
  _id: string;
  user: { _id: string; name: string; email: string };
  weight: number;
  mood: "excellent" | "good" | "okay" | "poor" | "terrible";
  photoUrl?: string;
  notes?: string;
  weekStartDate: string;
  isReviewed: boolean;
  adminFeedback?: string;
  createdAt: string;
}

export interface Note {
  _id: string;
  user: { _id: string; name: string; email: string };
  message: string;
  createdBy: { _id: string; name: string; email: string };
  isRead: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export interface Meal {
  time: string;
  description: string;
}

export interface MealRecall {
  _id: string;
  user: { _id: string; name: string; email: string };
  date: string;
  meals: Meal[];
  notes?: string;
  isReviewed: boolean;
  adminFeedback?: string;
  rating?: number;
  createdAt: string;
}
