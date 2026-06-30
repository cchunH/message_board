import type { User, Comment } from "@/types";

const API_BASE = "/api";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "请求失败");
  }
  return data;
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, password: string) =>
    request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  getComments: () =>
    request<{ comments: Comment[] }>("/comments"),

  createComment: (content: string, parentId?: string) =>
    request<Comment>("/comments", {
      method: "POST",
      body: JSON.stringify({ content, parentId: parentId || null }),
    }),

  deleteComment: (id: string) =>
    request<{ success: boolean }>(`/comments/${id}`, { method: "DELETE" }),

  updateComment: (id: string, content: string) =>
    request<Comment>(`/comments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }),

  getThreadSummary: (id: string) =>
    request<{ summary: string; sentiment: string; tags: string[] }>(
      `/comments/${id}/summary`
    ),

  assist: (task: "summary" | "draft", draft?: string) =>
    request<{ kind: string; result: string; sentiment?: string; tags?: string[]; threadTitle?: string }>(
      "/agent/assist",
      { method: "POST", body: JSON.stringify({ task, draft }) }
    ),
};
