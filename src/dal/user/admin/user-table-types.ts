export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isBlocked: boolean;
  isPremiumActive: boolean;
  currentPremiumTier: "TIER_1" | "TIER_2" | "TIER_3" | null;
  createdAt: Date;
  deviceCount: number;
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    university: string;
    degree: string;
    year: string;
    semester: string;
  } | null;
  premiumHistory?: Array<{
    id: string;
    tier: "TIER_1" | "TIER_2" | "TIER_3";
    isActive: boolean;
    expiryDate: Date;
    createdAt: Date;
  }>;
  deviceDetails?: Array<{
    id: string;
    deviceLabel: string | null;
    fingerprint: Record<string, unknown>;
    lastUsedAt: Date;
    isActive: boolean;
  }>;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export type SortOption = "A_TO_Z" | "Z_TO_A" | "NEW_USERS" | "OLD_USERS";
export type FilterOption =
  | "ALL"
  | "PREMIUM"
  | "FREE"
  | "BLOCKED"
  | "HAD_PREMIUM";
