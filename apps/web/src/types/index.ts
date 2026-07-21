// ─── Base Types ──────────────────────────────────────────────

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

// ─── User ────────────────────────────────────────────────────

export interface IUser extends Timestamps {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'superadmin';
}

// ─── Gym ─────────────────────────────────────────────────────

export interface IGym extends Timestamps {
  _id: string;
  owner: string;
  name: string;
  logo?: string;
  address?: string;
  contactNumber?: string;
  email?: string;
  currency: string;
  timezone: string;
  // SaaS Subscription fields
  subscriptionPlan: 'free_trial' | 'tier1' | 'tier2' | 'tier3';
  subscriptionStatus: 'active' | 'expired' | 'pending_approval';
  subscriptionExpiresAt: string;
  subscriptionPendingPlan?: 'tier1' | 'tier2' | 'tier3' | '';
  subscriptionPaymentDetails?: {
    transactionId?: string;
    submittedAt?: string;
  };
}

// ─── Member ──────────────────────────────────────────────────

export type Gender = 'male' | 'female' | 'other';

export interface IEmergencyContact {
  name: string;
  phone: string;
}

export interface IMember extends Timestamps {
  _id: string;
  gym: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  gender: Gender;
  dateOfBirth?: string;
  joiningDate: string;
  emergencyContact?: IEmergencyContact;
  notes?: string;
}

// ─── Membership Plan ─────────────────────────────────────────

export interface IMembershipPlan extends Timestamps {
  _id: string;
  gym: string;
  name: string;
  durationInDays: number;
  price: number;
  discount?: number;
  tax?: number;
  description?: string;
  isActive: boolean;
}

// ─── Membership (enrollment/renewal period) ──────────────────

export type MembershipOutcome = 'renewed' | 'upgraded';

export interface IMembership extends Timestamps {
  _id: string;
  member: string | IMember;
  plan: string | IMembershipPlan;
  startDate: string;
  endDate: string;
  previousMembership?: string;
  outcome?: MembershipOutcome;
}

// ─── Payment ─────────────────────────────────────────────────

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer';

export interface IPayment extends Timestamps {
  _id: string;
  gym: string;
  member: string | IMember;
  membership: string | IMembership;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  notes?: string;
}

// ─── Status Color Bands ──────────────────────────────────────

export type MembershipStatus = 'active' | 'expiring_soon' | 'critical' | 'expired' | 'none';

// 🟢 Active      = >7 days left
// 🟡 Expiring Soon = 4–7 days
// 🟠 Critical    = 0–3 days
// 🔴 Expired     = past endDate
// ⚪ None        = no membership

// ─── API Response Envelope ───────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Pagination ──────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
  message: string;
}

// ─── Dashboard ───────────────────────────────────────────────

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiringSoon: number;
  expired: number;
  todayRevenue: number;
  monthlyRevenue: number;
  recentPayments: IPayment[];
  recentRegistrations: IMember[];
}

// ─── Auth ────────────────────────────────────────────────────

export interface LoginResponse {
  user: IUser;
  gym: IGym | null;
  accessToken: string;
}

export interface RegisterResponse {
  user: IUser;
  gym: IGym;
  accessToken: string;
}

// ─── Reports ─────────────────────────────────────────────────

export type ReportPeriod = 'day' | 'week' | 'month' | 'year';

export interface RevenueDataPoint {
  label: string;
  revenue: number;
}

export interface MemberCountDataPoint {
  label: string;
  active: number;
  new: number;
  renewed: number;
  expired: number;
}
