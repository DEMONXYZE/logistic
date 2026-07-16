const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

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

export type CargoType =
  | "general"
  | "refrigerated"
  | "hazardous"
  | "fragile"
  | "livestock"
  | "bulk";

export type VehicleType = "pickup" | "4-wheel" | "6-wheel" | "10-wheel" | "trailer";

export type CreateJobPayload = {
  title: string;
  pickupLocation: string;
  dropoffLocation: string;
  cargoType?: CargoType;
  vehicleType?: VehicleType;
  weight?: number;
  price?: number;
  jobDatetime?: string;
};

export type Job = {
  id: string;
  shipperId: string;
  title: string;
  pickupLocation: string;
  dropoffLocation: string;
  cargoType: string;
  vehicleType: string;
  weight: number;
  price: number;
  jobDatetime: string;
  status: string;
  assignmentId?: string;
  createdAt: string;
};

export function createJob(token: string, payload: CreateJobPayload) {
  return apiFetch<Job>("/api/v1/jobs", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  }) as Promise<Job>;
}

export function listJobs(token: string, params?: { page?: number; limit?: number }) {
  const entries = Object.entries(params ?? {}).map(([k, v]) => [k, String(v)]);
  const query = entries.length > 0 ? `?${new URLSearchParams(entries).toString()}` : "";
  return apiFetch<Job[]>(`/api/v1/jobs${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<Job[]>;
}

export function getJob(token: string, id: string) {
  return apiFetch<Job>(`/api/v1/jobs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<Job>;
}

export function cancelJob(token: string, id: string) {
  return apiFetch<null>(`/api/v1/jobs/${id}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type Driver = {
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  licenseNo: string;
  carType: string;
  currentScore: number;
  productivityIndex: number;
  riskLevel: string;
  availability: string;
};

export function listDrivers(token: string) {
  return apiFetch<Driver[]>("/api/v1/drivers", {
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<Driver[]>;
}

export function getDriverById(token: string, id: string) {
  return apiFetch<Driver>(`/api/v1/drivers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<Driver>;
}

export type DriverScore = {
  id: string;
  driver_id: string;
  call_log_id: string;
  sentiment_score: number;
  readiness_score: number;
  overall_score: number;
  is_risk: boolean;
  scored_at: string;
  updated_at: string;
};

export function listDriverScores(token: string, driverId: string) {
  return apiFetch<DriverScore[]>(`/api/v1/scoring/drivers/${driverId}/scores`, {
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<DriverScore[]>;
}

export type CallLog = {
  id: string;
  driver_id: string;
  phone_number: string;
  conversation_log: string;
  audio_url: string;
  call_status: string;
  call_duration_sec: number;
  botnoi_outbound_id: string;
  created_at: string;
  updated_at: string;
};

export function listCallLogs(token: string, params?: { page?: number; limit?: number }) {
  const entries = Object.entries(params ?? {}).map(([k, v]) => [k, String(v)]);
  const query = entries.length > 0 ? `?${new URLSearchParams(entries).toString()}` : "";
  return apiFetch<CallLog[]>(`/api/v1/voice/calls${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<CallLog[]>;
}

export type JobOffer = {
  id: string;
  jobId: string;
  driverId: string;
  offerStatus: string;
  offerTime: string;
  expiresAt: string;
  createdAt: string;
};

export function sendJobOffer(
  token: string,
  jobId: string,
  payload: { driverId: string; expiresAt?: string }
) {
  return apiFetch<JobOffer>(`/api/v1/jobs/${jobId}/offers`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  }) as Promise<JobOffer>;
}

export function listJobOffers(token: string, jobId: string) {
  return apiFetch<JobOffer[]>(`/api/v1/jobs/${jobId}/offers`, {
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<JobOffer[]>;
}

export function listMyOffers(token: string) {
  return apiFetch<JobOffer[]>("/api/v1/job-offers/me", {
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<JobOffer[]>;
}

export function acceptOffer(token: string, offerId: string) {
  return apiFetch<JobAssignment>(`/api/v1/job-offers/${offerId}/accept`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<JobAssignment>;
}

export function rejectOffer(token: string, offerId: string) {
  return apiFetch<null>(`/api/v1/job-offers/${offerId}/reject`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type JobAssignment = {
  id: string;
  jobId: string;
  driverId: string;
  offerId: string;
  status: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
};

export function listMyAssignments(token: string) {
  return apiFetch<JobAssignment[]>("/api/v1/job-assignments/me", {
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<JobAssignment[]>;
}

export type DeliveryStatusValue = "pickup" | "in_transit" | "delivered" | "cancelled";

export type DeliveryEvent = {
  id: string;
  jobAssignmentId: string;
  status: DeliveryStatusValue;
  note: string | null;
  proofImage: string | null;
  createdAt: string;
};

export function addDeliveryStatus(
  token: string,
  assignmentId: string,
  payload: { status: DeliveryStatusValue; note?: string; proofImage?: string }
) {
  return apiFetch<DeliveryEvent>(`/api/v1/job-assignments/${assignmentId}/deliveries`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  }) as Promise<DeliveryEvent>;
}

export function getDeliveryTimeline(token: string, assignmentId: string) {
  return apiFetch<DeliveryEvent[]>(`/api/v1/job-assignments/${assignmentId}/deliveries`, {
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<DeliveryEvent[]>;
}

export type LLMProvider = {
  id: number;
  name: string;
  base_url: string;
  is_active: boolean;
  active_model: string;
  created_at: string;
  updated_at: string;
};

export function listLLMProviders(token: string) {
  return apiFetch<{ providers: LLMProvider[] }>("/api/v1/llm/providers", {
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<{ providers: LLMProvider[] }>;
}

export function createLLMProvider(
  token: string,
  payload: { name: string; base_url: string; api_key: string }
) {
  return apiFetch<null>("/api/v1/llm/providers", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function listLLMModels(token: string, providerId?: number) {
  const query = providerId ? `?provider_id=${providerId}` : "";
  return apiFetch<{ models: string[] }>(`/api/v1/llm/models${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  }) as Promise<{ models: string[] }>;
}

export function updateLLMConfig(
  token: string,
  payload: { provider_id: number; active_model: string }
) {
  return apiFetch<null>("/api/v1/llm/config", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

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
