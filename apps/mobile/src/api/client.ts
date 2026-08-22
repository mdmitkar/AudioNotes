import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) return { Authorization: "Bearer " + token };
    return {};
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const authHeader = await this.getAuthHeader();
    const res = await fetch(this.baseUrl + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
        ...(options.headers as Record<string, string> || {}),
      },
    });

    // Try refresh if 401
    if (res.status === 401) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        const newAuthHeader = await this.getAuthHeader();
        const retryRes = await fetch(this.baseUrl + path, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...newAuthHeader,
            ...(options.headers as Record<string, string> || {}),
          },
        });
        const retryData = await retryRes.json();
        return retryData;
      }
    }

    const data = await res.json();
    return data;
  }

  private async tryRefresh(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) return false;
      const res = await fetch(this.baseUrl + "/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (data.success && data.data.accessToken) {
        await AsyncStorage.setItem("accessToken", data.data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  async post<T>(path: string, body?: object): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: object): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  async uploadFormData<T>(path: string, formData: FormData): Promise<T> {
    const token = await AsyncStorage.getItem("accessToken");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = "Bearer " + token;
    const res = await fetch(this.baseUrl + path, {
      method: "POST",
      headers,
      body: formData,
    });
    return res.json();
  }
}

export const api = new ApiClient(API_BASE);
