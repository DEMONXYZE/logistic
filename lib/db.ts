// In-memory MVP data store. Resets whenever the dev server restarts.

export type Role = "driver" | "shipper";

export type DriverProfile = {
  licenseNo: string;
  carType: string;
  currentScore: number;
  productivityIndex: number;
  riskLevel: "low" | "medium" | "high";
  availability: "available" | "offline";
};

export type User = {
  id: string;
  phone: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  verificationStatus: "approved";
  createdAt: string;
  driver?: DriverProfile;
};

export type LlmProvider = {
  id: number;
  name: string;
  base_url: string;
  api_key?: string;
  is_active: boolean;
  active_model: string | null;
  created_at: string;
  updated_at: string;
};

export type LlmModel = {
  name: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __botnoiDb:
    | {
        users: User[];
        revokedTokens: Set<string>;
        llmProviders: LlmProvider[];
        llmModels: LlmModel[];
      }
    | undefined;
}

function seedUsers(): User[] {
  return [
    {
      id: "00000000-0000-0000-0000-000000000102",
      phone: "+66811110102",
      email: "seed-driver@example.com",
      passwordHash: "",
      fullName: "คนขับตัวอย่าง",
      role: "driver",
      isActive: true,
      verificationStatus: "approved",
      createdAt: new Date().toISOString(),
      driver: {
        licenseNo: "LIC-002",
        carType: "pickup",
        currentScore: 90,
        productivityIndex: 0,
        riskLevel: "low",
        availability: "available",
      },
    },
  ];
}

function seedLlmProviders(): LlmProvider[] {
  return [
    {
      id: 1,
      name: "ThaiLLM",
      base_url: "http://thaillm.or.th/api/v1",
      is_active: false,
      active_model: "OpenThaiGPT-ThaiLLM-8B-Instruct-v7.2",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: "ThaiLLM2",
      base_url: "http://thaillm.or.th/api/v1",
      is_active: true,
      active_model: "OpenThaiGPT-ThaiLLM-8B-Instruct-v7.2",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

function seedLlmModels(): LlmModel[] {
  return [
    { name: "gpt-3.5-turbo" },
    { name: "gpt-4o" },
    { name: "gpt-4o-mini" },
    { name: "OpenThaiGPT-ThaiLLM-8B-Instruct-v7.2" },
    { name: "Typhoon-S-ThaiLLM-8B-Instruct" },
  ];
}

// Reuse across HMR reloads in dev so data survives route file edits.
const store =
  globalThis.__botnoiDb ??
  (globalThis.__botnoiDb = {
    users: seedUsers(),
    revokedTokens: new Set(),
    llmProviders: seedLlmProviders(),
    llmModels: seedLlmModels(),
  });

export const db = store;

export function findUserByIdentifier(identifier: string): User | undefined {
  return db.users.find(
    (u) => u.email === identifier || u.phone === identifier
  );
}

export function findUserById(id: string): User | undefined {
  return db.users.find((u) => u.id === id);
}