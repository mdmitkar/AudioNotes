export type UserRole = 'student' | 'creator' | 'admin';

export type EpisodeStatus = 'draft' | 'pending' | 'published' | 'rejected';

export type SubscriptionStatus = 'active' | 'inactive' | 'expired';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  selectedExams: string[];
  createdAt: string;
}

export interface IExam {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export interface ISubject {
  _id: string;
  examId: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface ITopic {
  _id: string;
  subjectId: string;
  name: string;
  slug: string;
  description: string;
}

export interface IEpisode {
  _id: string;
  title: string;
  description: string;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  creatorId: string;
  creator?: { name: string; _id: string };
  examId: string;
  exam?: IExam;
  subjectId: string;
  subject?: ISubject;
  topicId: string;
  topic?: ITopic;
  duration: number;
  isPremium: boolean;
  status: EpisodeStatus;
  playCount: number;
  featuredAt: string | null;
  whatYoullLearn: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IListeningProgress {
  _id: string;
  userId: string;
  episodeId: string;
  episode?: IEpisode;
  progressSeconds: number;
  completed: boolean;
  lastPlayedAt: string;
}

export interface IBookmark {
  _id: string;
  userId: string;
  episodeId: string;
  episode?: IEpisode;
  createdAt: string;
}

export interface ICreatorProfile {
  _id: string;
  userId: string;
  user?: IUser;
  bio: string;
  expertise: string[];
  examIds: string[];
  totalEpisodes: number;
  totalListeningMinutes: number;
}

export interface ISubscription {
  _id: string;
  userId: string;
  plan: string;
  status: SubscriptionStatus;
  expiresAt: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
