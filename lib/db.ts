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

declare global {
  // eslint-disable-next-line no-var
  var __botnoiDb: { users: User[]; revokedTokens: Set<string> } | undefined;
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

// Reuse across HMR reloads in dev so data survives route file edits.
const store =
  globalThis.__botnoiDb ??
  (globalThis.__botnoiDb = { users: seedUsers(), revokedTokens: new Set() });

export const db = store;

export function findUserByIdentifier(identifier: string): User | undefined {
  return db.users.find(
    (u) => u.email === identifier || u.phone === identifier
  );
}

export function findUserById(id: string): User | undefined {
  return db.users.find((u) => u.id === id);
}
