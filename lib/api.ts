const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type Role = "admin" | "driver" | "shipper" | string;

export type User = {
  id: string;
  phone: string;
  email: string | null;
  fullName: string;
  role: Role;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | undefined> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(json?.message ?? json?.error ?? "request failed", res.status);
  }

  return json?.data as T | undefined;
}

export function login(identifier: string, password: string) {
  return apiFetch<{ accessToken: string; user: User }>(
    "/api/v1/auth/login",
    { method: "POST", body: JSON.stringify({ identifier, password }) }
  ) as Promise<{ accessToken: string; user: User }>;
}

export function fetchMe(token: string) {
  return apiFetch<{ user: User }>("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<{ user: User }>;
}

export function logout(token: string) {
  return apiFetch("/api/v1/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type RegisterPayload = {
  phone: string;
  email: string;
  password: string;
  fullName: string;
  role: "driver" | "shipper";
  driver?: { licenseNo: string; carType: string };
  shipper?: { companyName: string; billingAddress?: string };
};

export function register(payload: RegisterPayload) {
  return apiFetch<{
    id: string;
    phone?: string;
    email?: string;
    fullName: string;
    role: string;
    verificationStatus: string;
    createdAt: string;
  }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<{
    id: string;
    fullName: string;
    role: string;
    verificationStatus: string;
    createdAt: string;
  }>;
}
