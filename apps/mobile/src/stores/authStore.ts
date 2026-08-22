import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  selectedExams?: any[];
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  updateSelectedExams: (examIds: string[]) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) { set({ isLoading: false }); return; }
      const res = await authApi.me();
      if (res.success) {
        set({ user: res.data, isAuthenticated: true, isLoading: false });
      } else {
        await Promise.all([
          AsyncStorage.removeItem("accessToken"),
          AsyncStorage.removeItem("refreshToken")
        ]);
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success) {
        await AsyncStorage.setItem("accessToken", res.data.accessToken);
        await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
        set({ user: res.data.user, isAuthenticated: true });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  register: async (name, email, password, role = "student") => {
    try {
      const res = await authApi.register({ name, email, password, role });
      if (res.success) {
        await AsyncStorage.setItem("accessToken", res.data.accessToken);
        await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
        set({ user: res.data.user, isAuthenticated: true });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  logout: async () => {
    await Promise.all([
      AsyncStorage.removeItem("accessToken"),
      AsyncStorage.removeItem("refreshToken")
    ]);
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const current = get().user;
    if (current) set({ user: { ...current, ...userData } });
  },

  updateSelectedExams: async (examIds) => {
    const res = await authApi.updateSelectedExams(examIds);
    if (res.success) {
      get().updateUser({ selectedExams: res.data.selectedExams });
    }
  },
}));
