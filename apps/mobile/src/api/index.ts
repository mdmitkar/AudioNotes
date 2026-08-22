import { api } from "./client";

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<any>("/auth/register", data),
  login: (email: string, password: string) =>
    api.post<any>("/auth/login", { email, password }),
  refresh: (refreshToken: string) =>
    api.post<any>("/auth/refresh", { refreshToken }),
  me: () => api.get<any>("/auth/me"),
  updateSelectedExams: (examIds: string[]) =>
    api.patch<any>("/auth/selected-exams", { examIds }),
};

// Exams
export const examApi = {
  list: () => api.get<any>("/exams"),
  get: (id: string) => api.get<any>("/exams/" + id),
  subjects: (examId: string) => api.get<any>("/exams/" + examId + "/subjects"),
};

// Subjects
export const subjectApi = {
  get: (id: string) => api.get<any>("/subjects/" + id),
  topics: (subjectId: string) => api.get<any>("/subjects/" + subjectId + "/topics"),
};

// Topics
export const topicApi = {
  get: (id: string) => api.get<any>("/topics/" + id),
  episodes: (topicId: string) => api.get<any>("/topics/" + topicId + "/episodes"),
};

// Episodes
export const episodeApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<any>("/episodes" + query);
  },
  featured: () => api.get<any>("/episodes/featured"),
  quick: () => api.get<any>("/episodes/quick"),
  popular: () => api.get<any>("/episodes/popular"),
  get: (id: string) => api.get<any>("/episodes/" + id),
  play: (id: string) => api.post<any>("/episodes/" + id + "/play"),
};

// Progress
export const progressApi = {
  all: () => api.get<any>("/progress"),
  inProgress: () => api.get<any>("/progress/in-progress"),
  get: (episodeId: string) => api.get<any>("/progress/" + episodeId),
  save: (episodeId: string, progressSeconds: number, completed?: boolean) =>
    api.post<any>("/progress/" + episodeId, { progressSeconds, completed }),
};

// Bookmarks
export const bookmarkApi = {
  list: () => api.get<any>("/bookmarks"),
  add: (episodeId: string) => api.post<any>("/bookmarks/" + episodeId),
  remove: (episodeId: string) => api.delete<any>("/bookmarks/" + episodeId),
  check: (episodeId: string) => api.get<any>("/bookmarks/check/" + episodeId),
};

// Creator
export const creatorApi = {
  profile: () => api.get<any>("/creator/profile"),
  episodes: () => api.get<any>("/creator/episodes"),
  analytics: () => api.get<any>("/creator/analytics"),
  uploadEpisode: (formData: FormData) => api.uploadFormData<any>("/creator/episodes", formData),
};

// Admin
export const adminApi = {
  stats: () => api.get<any>("/admin/stats"),
  pending: () => api.get<any>("/admin/pending"),
  approveEpisode: (id: string, featured?: boolean) =>
    api.patch<any>("/admin/episodes/" + id + "/approve", { featured }),
  rejectEpisode: (id: string, reason: string) =>
    api.patch<any>("/admin/episodes/" + id + "/reject", { reason }),
  episodes: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<any>("/admin/episodes" + query);
  },
  users: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<any>("/admin/users" + query);
  },
};

// Subscriptions
export const subscriptionApi = {
  my: () => api.get<any>("/subscriptions/my"),
  plans: () => api.get<any>("/subscriptions/plans"),
};
