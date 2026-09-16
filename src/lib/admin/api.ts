import { http } from "./http";

/**
 * Hand-typed client for the core admin API (routes under /api/v1). Shapes
 * mirror the NestJS DTOs; every amount is in kobo. This replaces the generated
 * swagger client for the admin pages, which had drifted from the server.
 */

// ── Envelopes ─────────────────────────────────────────────────────────────────

/** What the core API sends for every list. */
export type CorePage<T> = {
  results: T[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  perPageLimit: number;
  nextPage: number | null;
  previousPage: number | null;
};

/** What the tables read. */
export type Paged<T> = { items: T[]; total: number; page: number; limit: number; totalPages: number };

export function toPaged<T>(page: CorePage<T> | undefined | null): Paged<T> {
  return {
    items: page?.results ?? [],
    total: page?.totalRecords ?? 0,
    page: page?.currentPage ?? 1,
    limit: page?.perPageLimit ?? 20,
    totalPages: page?.totalPages ?? 0,
  };
}

export type Query = Record<string, string | number | boolean | undefined | null>;

function clean(query?: Query) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = String(value);
  }
  return out;
}

async function get<T>(url: string, query?: Query) {
  const { data } = await http.get<T>(url, { params: clean(query) });
  return data;
}
async function list<T>(url: string, query?: Query) {
  return toPaged(await get<CorePage<T>>(url, query));
}
async function post<T>(url: string, body?: unknown) {
  const { data } = await http.post<T>(url, body);
  return data;
}
async function patch<T>(url: string, body?: unknown) {
  const { data } = await http.patch<T>(url, body);
  return data;
}
async function del<T>(url: string) {
  const { data } = await http.delete<T>(url);
  return data;
}

// ── Entities ──────────────────────────────────────────────────────────────────

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";
export type KycStatus = "APPROVE" | "DISAPPROVE" | "SUSPENDED" | "SUBMITTED" | "PENDING";
export type OrderStatus = "INITIATED" | "ACCEPTED" | "ON_GOING" | "COMPLETED" | "CANCELLED";
export type OrderType = "SINGLE" | "BATCH" | "BULK";
export type VehicleStatus = "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";
export type TransactionStatus = "PROCESSING" | "FAILED" | "SUCCESS" | "CANCELLED";
export type TransactionType = "CREDIT" | "DEBIT";
export type TransactionCategory = "FEE" | "DEPOSIT" | "WITHDRAWAL" | "REVERSAL" | "CHARGE";

export type User = {
  _id: string;
  firstname?: string;
  lastname?: string;
  middlename?: string;
  email?: string;
  phone?: string;
  photo?: string;
  gender?: string;
  status: UserStatus;
  roles: string[];
  isRider?: boolean;
  isOnline?: boolean;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  bvnVerified?: boolean;
  nin?: string;
  driversLicenseVerified?: KycStatus;
  driversLicense?: Record<string, unknown> | null;
  dispatchPaused?: boolean;
  dispatchPausedAt?: string;
  dispatchPausedReason?: string;
  businessId?: string;
  country?: string;
  state?: string;
  addresses?: unknown[];
  lastLoginDate?: string;
  createdAt: string;
  updatedAt?: string;
  adminPreferences?: AdminPreferences;
  /** Rider list only (leaderboard rollups). */
  completedDeliveries?: number;
  totalEarned?: number;
  [key: string]: unknown;
};

export type AdminPreferences = { theme?: "light" | "dark" | "system"; font?: string };

export type Wallet = {
  _id: string;
  entityId: string;
  entityType: "USER" | "BUSINESS" | "TEAM";
  balance: number;
  currency: string;
  status?: string;
  settlement?: {
    bankName?: string;
    bankCode?: string;
    accountName?: string;
    accountNumber?: string;
    isVerified?: boolean;
  } | null;
  createdAt?: string;
  [key: string]: unknown;
};

export type OrderLocation = {
  _id: string;
  address?: string;
  status?: string;
  type?: string;
  recipientName?: string;
  recipientPhone?: string;
  coordinates?: { lat?: number; lng?: number } | number[];
  [key: string]: unknown;
};

export type Order = {
  _id: string;
  orderNumber?: string;
  status: OrderStatus;
  type: OrderType;
  userId?: string | User;
  riderId?: string | User | null;
  totalAmountPayable?: number;
  negotiatedAmount?: number;
  serviceCharge?: number;
  discount?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  isScheduled?: boolean;
  scheduledFor?: string;
  pickup?: OrderLocation;
  locations?: OrderLocation[];
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type Transaction = {
  _id: string;
  entityId: string;
  entityType?: string;
  amount: number;
  charge?: number;
  type: TransactionType;
  status: TransactionStatus;
  category: TransactionCategory;
  purpose: string;
  reference?: string;
  description?: string;
  provider?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  [key: string]: unknown;
};

export type Vehicle = {
  _id: string;
  name?: string;
  make?: string;
  model?: string;
  plateNumber?: string;
  color?: string;
  year?: string | number;
  type?: string;
  status: VehicleStatus;
  userId?: string | User | null;
  businessId?: string;
  images?: string[];
  verifiedAt?: string;
  statusComment?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type Business = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  logo?: string;
  businessHandle?: string;
  isActive?: boolean;
  type?: string;
  businessType?: string;
  userId?: string;
  createdAt: string;
  [key: string]: unknown;
};

export type Broadcast = {
  _id: string;
  audience: "CUSTOMERS" | "RIDERS" | "BUSINESSES" | "USERS";
  channels: ("PUSH" | "EMAIL")[];
  subject: string;
  message: string;
  status: string;
  filters?: Record<string, unknown>;
  recipients: number;
  sent?: number;
  failed?: number;
  createdBy?: string | User;
  createdAt: string;
  completedAt?: string;
  [key: string]: unknown;
};

export type NotificationRow = {
  _id: string;
  entityId?: string | User;
  type: string;
  status: string;
  category?: string;
  subject?: string;
  message?: string;
  broadcastId?: string;
  createdAt: string;
  [key: string]: unknown;
};

// ── Stats ─────────────────────────────────────────────────────────────────────

export type OrderWindow = {
  orders: number;
  completed: number;
  cancelled: number;
  ongoing: number;
  volume: number;
  riderFees: number;
  serviceCharge: number;
  discounts: number;
  completedVolume: number;
  averageOrderValue: number;
  completionRate: number;
  cancellationRate: number;
  customers: number;
  riders: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPaymentStatus: Record<string, number>;
};

export type StatsRange = { from: string; to: string };

export type Overview = {
  range: StatsRange;
  current: OrderWindow;
  previous: OrderWindow;
  users: Record<string, number>;
  vehicles: Record<string, number>;
  wallets: Record<string, number>;
  transactions: Record<string, number>;
  live: {
    awaitingRider: number;
    awaitingRiderStale: number;
    accepted: number;
    ongoing: number;
    completedToday: number;
    cancelledToday: number;
    placedToday: number;
    ridersOnline: number;
  };
};

export type SeriesPoint = {
  bucket: string;
  orders: number;
  completed: number;
  cancelled: number;
  volume: number;
  serviceCharge: number;
  riderFees: number;
  single: number;
  batch: number;
  bulk: number;
  newCustomers: number;
  newRiders: number;
  moneyIn: number;
  moneyOut: number;
};

export type Series = { range: StatsRange; bucket: "day" | "week" | "month"; points: SeriesPoint[] };

export type TopRider = {
  riderId: string;
  rider?: Pick<User, "_id" | "firstname" | "lastname" | "phone" | "photo" | "isOnline" | "status" | "driversLicenseVerified">;
  deliveries: number;
  cancelled: number;
  riderFees: number;
  volume: number;
  rating: number | null;
  reviews: number;
};

export type PeakHours = { range: StatsRange; cells: { day: number; hour: number; count: number; volume: number }[] };

export type Attention = {
  licencesAwaitingReview: number;
  vehiclesPendingVerification: number;
  ordersAwaitingRider: number;
  ordersAwaitingRiderStale: number;
  withdrawalsProcessing: number;
  withdrawalsProcessingAmount: number;
  failedTransactions24h: number;
  failedNotifications24h: number;
  suspendedRiders: number;
  ridersPausedFromDispatch: number;
  issuesOpen?: number;
  issuesUnassigned?: number;
};

export type UserOverview = {
  range: StatsRange;
  user: User;
  wallet: Wallet | null;
  asCustomer: { current: OrderWindow; previous: OrderWindow; lifetime: OrderWindow };
  asRider: { current: OrderWindow; previous: OrderWindow; lifetime: OrderWindow };
  transactions: Record<string, { amount: number; count: number }>;
  reviews: { average: number | null; count: number; distribution: number[] };
  vehicles: Vehicle[];
  business: Business | null;
};

export type CustomerRow = User & {
  walletBalance: number;
  orders: number;
  completedOrders: number;
  cancelledOrders: number;
  spent: number;
  lastOrderAt?: string;
};

export type BusinessRow = Business & {
  owner?: Pick<User, "_id" | "firstname" | "lastname" | "email" | "phone" | "status" | "photo">;
  walletBalance: number;
  ridersCount: number;
  vehiclesCount: number;
  orders: number;
  completedOrders: number;
  volume: number;
};

export type RangeQuery = { from?: string; to?: string; all?: boolean };

/** What the platform keeps from trips: rider commission plus customer service charge. */
export type ChargeWindow = {
  riderCommission: number;
  riderCommissionCount: number;
  serviceCharge: number;
  serviceChargeCount: number;
  total: number;
  trips: number;
  tripsCharged: number;
  ridersCharged: number;
  averageCommission: number;
};

export type Charges = { range: StatsRange; current: ChargeWindow; previous: ChargeWindow };

export type RiderChargeRow = {
  entityId: string;
  entityType: "USER" | "BUSINESS";
  rider?: Pick<User, "_id" | "firstname" | "lastname" | "phone" | "photo" | "isOnline" | "status">;
  business?: { _id: string; name: string; phone?: string; logo?: string };
  trips: number;
  earned: number;
  charges: number;
  lastAt: string;
};

export const stats = {
  overview: (range: RangeQuery) => get<Overview>("/admins/stats/overview", range),
  series: (range: RangeQuery & { bucket?: string; riderId?: string; userId?: string }) => get<Series>("/admins/stats/series", range),
  topRiders: (range: RangeQuery & { limit?: number }) => get<TopRider[]>("/admins/stats/top-riders", range),
  peakHours: (range: RangeQuery) => get<PeakHours>("/admins/stats/peak-hours", range),
  attention: () => get<Attention>("/admins/stats/attention"),
  charges: (range: RangeQuery) => get<Charges>("/admins/stats/charges", range),
  chargesByRider: (query: Query) => list<RiderChargeRow>("/admins/stats/charges/riders", query),
  customers: (query: Query) => list<CustomerRow>("/admins/stats/customers", query),
  businesses: (query: Query) => list<BusinessRow>("/admins/stats/businesses", query),
  userOverview: (userId: string, range: RangeQuery) => get<UserOverview>(`/admins/stats/users/${userId}/overview`, range),
};

// ── Me ────────────────────────────────────────────────────────────────────────

export const me = {
  get: () => get<User>("/admins/users/me"),
  changePassword: (body: { oldPassword: string; newPassword: string; confirmPassword: string }) => patch<unknown>("/admins/users/me/password-change", body),
  updatePhoto: (body: { photo: string }) => patch<User>("/admins/users/me/update-profile-photo", body),
  preferences: () => get<AdminPreferences>("/admins/users/me/preferences"),
  updatePreferences: (body: AdminPreferences) => patch<AdminPreferences>("/admins/users/me/preferences", body),
};

// ── Users (customers, couriers, staff) ────────────────────────────────────────

export const users = {
  list: (query: Query) => list<User>("/admins/users", query),
  get: (userId: string) => get<User>(`/admins/users/${userId}`),
  wallets: (userId: string) => get<Wallet[] | CorePage<Wallet>>(`/admins/users/${userId}/wallets`),
  create: (body: Record<string, unknown>) => post<User>("/admins/users", body),
  updateStatus: (userId: string, body: { status: UserStatus; reason?: string }) => patch<User>(`/admins/users/${userId}/status`, body),
  adjustWallet: (userId: string, body: { amount: number; type: TransactionType; reason: string }) =>
    post<unknown>(`/admins/users/${userId}/wallets/adjust`, body),
  refund: (userId: string, body: { orderId: string; amount?: number; reason: string }) => post<unknown>(`/admins/users/${userId}/refund`, body),
  updatePhone: (userId: string, body: { phone: string; reason?: string }) => patch<User>(`/admins/users/${userId}/phone`, body),
  setDispatch: (userId: string, body: { paused: boolean; reason?: string }) => patch<User>(`/admins/users/${userId}/dispatch`, body),
  licenceVerify: (userId: string, body: Record<string, unknown>) => patch<User>(`/admins/users/${userId}/drivers-license/verify`, body),
  licenceApprove: (userId: string, body: Record<string, unknown>) => patch<User>(`/admins/users/${userId}/drivers-license/approve`, body),
  licenceUpdate: (userId: string, body: Record<string, unknown>) => patch<User>(`/admins/users/${userId}/drivers-license/update`, body),
  settlementAccount: (userId: string, walletId: string, body: Record<string, unknown>) =>
    patch<Wallet>(`/admins/users/${userId}/wallets/${walletId}/settlement-account`, body),
};

// ── Orders ────────────────────────────────────────────────────────────────────

export const orders = {
  list: (query: Query) => list<Order>("/admins/orders", query),
  get: (orderId: string) => get<Order>(`/admins/orders/${orderId}`),
  offers: (orderId: string) => get<Record<string, unknown>>(`/admins/orders/${orderId}/offers`),
  cancel: (orderId: string, body: { reason: string }) => post<Order>(`/admins/orders/${orderId}/cancel`, body),
  updateStatus: (orderId: string, body: { status: OrderStatus }) => patch<Order>(`/admins/orders/${orderId}/status`, body),
};

// ── Transactions ──────────────────────────────────────────────────────────────

export const transactions = {
  list: (query: Query) => list<Transaction>("/admins/transactions", query),
  get: (transactionId: string) => get<Transaction>(`/admins/transactions/${transactionId}`),
  summary: (query?: Query) => get<Record<string, unknown>>("/admins/transactions/metrics/summary", query),
  externalPayments: (query?: Query) => get<Record<string, unknown>>("/admins/transactions/metrics/external-payments", query),
};

// ── Reviews ───────────────────────────────────────────────────────────────────

/**
 * A customer's rating of a rider for one order. The list endpoint returns ids
 * only; the customer and the order are resolved per row on the client.
 */
export type ReviewCustomer = Pick<User, "_id" | "firstname" | "lastname" | "phone" | "photo">;
export type ReviewOrder = Pick<Order, "_id" | "orderNumber" | "status" | "type" | "totalAmountPayable" | "completedAt" | "createdAt">;

/** With `expand=1` the customer and order come populated; otherwise they are ids. */
export type Review = {
  _id: string;
  userId: string | ReviewCustomer;
  riderId: string;
  orderId: string | ReviewOrder;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
};

export const reviews = {
  /** GET /reviews accepts riderId, page, limit and order (platform admin only). */
  list: (query: Query) => list<Review>("/reviews", query),
};

// ── Vehicles ──────────────────────────────────────────────────────────────────

export const vehicles = {
  list: (query: Query) => list<Vehicle>("/admins/vehicles", query),
  get: (vehicleId: string) => get<Vehicle>(`/admins/vehicles/${vehicleId}`),
  create: (userId: string, body: Record<string, unknown>) => post<Vehicle>(`/admins/vehicles/${userId}/create`, body),
  verify: (vehicleId: string, userId: string, body?: Record<string, unknown>) =>
    patch<Vehicle>(`/admins/vehicles/${vehicleId}/users/${userId}/verify`, body ?? {}),
  reject: (vehicleId: string, userId: string, body: { reason?: string }) =>
    patch<Vehicle>(`/admins/vehicles/${vehicleId}/users/${userId}/reject`, body),
  suspend: (vehicleId: string, userId: string, body: { reason?: string }) =>
    patch<Vehicle>(`/admins/vehicles/${vehicleId}/users/${userId}/suspend`, body),
  remove: (vehicleId: string) => del<unknown>(`/admins/vehicles/${vehicleId}`),
};

// ── Businesses ────────────────────────────────────────────────────────────────

export const businesses = {
  get: (businessId: string) => get<Business>(`/businesses/${businessId}`),
  orders: (businessId: string, query: Query) => list<Order>(`/businesses/${businessId}/orders`, query),
  users: (businessId: string, query: Query) => list<User>(`/businesses/${businessId}/users`, query),
  vehicles: (businessId: string, query: Query) => list<Vehicle>(`/businesses/${businessId}/vehicles`, query),
  transactions: (businessId: string, query: Query) => list<Transaction>(`/businesses/${businessId}/transactions`, query),
  wallets: (businessId: string) => get<Wallet[] | CorePage<Wallet>>(`/businesses/${businessId}/wallets`),
  orderStatistics: (businessId: string, query?: Query) => get<Record<string, unknown>>(`/businesses/${businessId}/order-statistics`, query),
  suspendUser: (businessId: string, userId: string, body?: { reason?: string }) =>
    patch<User>(`/businesses/${businessId}/users/${userId}/suspend`, body ?? {}),
  unsuspendUser: (businessId: string, userId: string) => patch<User>(`/businesses/${businessId}/users/${userId}/unsuspend`, {}),
  removeUser: (businessId: string, userId: string) => del<unknown>(`/businesses/${businessId}/users/${userId}`),
  updatePreferences: (businessId: string, body: Record<string, unknown>) => patch<Business>(`/businesses/${businessId}/preferences`, body),
};

// ── Platform finance ──────────────────────────────────────────────────────────

export type FinanceStatus = {
  balance: number;
  currency: string;
  hasPin: boolean;
  hasBank: boolean;
  settlement: { bankName?: string; accountName?: string; accountNumberMasked?: string; isVerified?: boolean } | null;
};

export const finance = {
  platformWallet: () => get<Wallet>("/admins/wallets/platform-wallet"),
  status: () => get<FinanceStatus>("/admins/wallets/finance-status"),
  banks: () => get<{ name: string; code: string }[] | { data?: { name: string; code: string }[] }>("/admins/wallets/banks"),
  updateSettlement: (body: { accountNumber: string; bankCode: string }) => post<unknown>("/admins/wallets/platform-wallet/settlement", body),
  setPin: (body: { pin: string }) => post<unknown>("/admins/wallets/pin", body),
  payout: (body: { amount: number; pin: string; reason?: string }) => post<unknown>("/admins/wallets/platform-wallet/payout", body),
  transfer: (body: { userId: string; amount: number; pin: string; reason: string }) =>
    post<unknown>("/admins/wallets/platform-wallet/transfer", body),
};

// ── Messaging ─────────────────────────────────────────────────────────────────

export type BroadcastFilters = { status?: UserStatus[]; onlineOnly?: boolean; licenceApprovedOnly?: boolean; country?: string };
export type BroadcastInput = {
  audience: Broadcast["audience"];
  userIds?: string[];
  filters?: BroadcastFilters;
  channels: ("PUSH" | "EMAIL")[];
  subject: string;
  message: string;
};

export const messaging = {
  estimate: (body: Pick<BroadcastInput, "audience" | "userIds" | "filters">) =>
    post<{ recipients: number; withPush: number; withEmail: number }>("/admins/notifications/broadcasts/estimate", body),
  send: (body: BroadcastInput) => post<Broadcast>("/admins/notifications/broadcasts", body),
  broadcasts: (query: Query) => list<Broadcast>("/admins/notifications/broadcasts", query),
  broadcast: (broadcastId: string) => get<Broadcast>(`/admins/notifications/broadcasts/${broadcastId}`),
  log: (query: Query) => list<NotificationRow>("/admins/notifications/log", query),
};

// ── Admin: team, logs, settings ───────────────────────────────────────────────

export type Team = { _id: string; name?: string; entityType?: string; entityId?: string; createdAt: string; [key: string]: unknown };

export const admin = {
  teams: (query: Query) => list<Team>("/admins/teams", query),
  createTeam: (body: Record<string, unknown>) => post<Team>("/admins/teams", body),
  auditLogs: (query: Query) => list<Record<string, unknown>>("/audit-logs", query),
  dataLogs: (query: Query) => list<Record<string, unknown>>("/datalogs", query),
  reviews: (query: Query) => list<Record<string, unknown>>("/reviews", query),
};

export type Country = { _id: string; name: string; code?: string; currency?: string; isActive?: boolean; [key: string]: unknown };
export type CountryState = { _id: string; name: string; countryId?: string; isActive?: boolean; [key: string]: unknown };

export const settings = {
  countries: () => get<Country[] | CorePage<Country>>("/admin-configs/countries"),
  country: (countryId: string) => get<Country>(`/admin-configs/countries/${countryId}`),
  createCountry: (body: Record<string, unknown>) => post<Country>("/admin-configs/countries", body),
  updateCountry: (countryId: string, body: Record<string, unknown>) => patch<Country>(`/admin-configs/countries/${countryId}`, body),
  states: (countryId: string) => get<CountryState[] | CorePage<CountryState>>(`/admin-configs/countries/${countryId}/states`),
  state: (countryId: string, stateId: string) => get<CountryState>(`/admin-configs/countries/${countryId}/states/${stateId}`),
  createState: (countryId: string, body: Record<string, unknown>) => post<CountryState>(`/admin-configs/countries/${countryId}/states`, body),
  updateState: (countryId: string, stateId: string, body: Record<string, unknown>) =>
    patch<CountryState>(`/admin-configs/countries/${countryId}/states/${stateId}`, body),
  deliveryPricing: () => get<Record<string, unknown>>("/admin-configs/delivery-pricing"),
};

export const deliveryPrice = {
  analytics: (query?: Query) => get<Record<string, unknown>>("/delivery-price/admin/analytics", query),
  config: () => get<Record<string, unknown>>("/delivery-price/admin/config"),
  updateConfig: (body: Record<string, unknown>) => patch<Record<string, unknown>>("/delivery-price/admin/config", body),
};

/** Some endpoints return a bare array and some a page; tables want one shape. */
export function asArray<T>(value: T[] | CorePage<T> | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : (value.results ?? []);
}

// ── CSV ───────────────────────────────────────────────────────────────────────

export function toCsv(rows: Record<string, unknown>[], columns: { key: string; label: string }[]) {
  const escape = (value: unknown) => {
    const text = value == null ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const head = columns.map((c) => escape(c.label)).join(",");
  const body = rows.map((row) => columns.map((c) => escape(row[c.key])).join(",")).join("\n");
  return `${head}\n${body}`;
}

export function downloadCsv(name: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Orders: populated shapes ──────────────────────────────────────────────────

/** What the order aggregations attach for the customer and the rider. */
export type OrderParty = Pick<User, "_id" | "firstname" | "lastname" | "photo" | "phone"> & {
  email?: string;
  /** Rider only, from the order detail aggregation. */
  reviews?: { average: number; count: number };
};

export type OrderRecipient = {
  _id?: string;
  name: string;
  phone: string;
  confirmationCode: string;
  status: string;
  completedAt?: string;
};

/** One stop on an order as the API returns it (pickup or drop-off). */
export type OrderStop = OrderLocation & {
  type?: "PICKUP" | "DROPOFF";
  status?: "PENDING" | "IN_TRANSIT" | "ARRIVED" | "COMPLETED" | "CANCELLED";
  position?: { type?: string; coordinates?: number[] };
  senderName?: string;
  senderPhone?: string;
  senderPhoto?: string;
  receiverName?: string;
  receiverPhone?: string;
  packageName?: string;
  description?: string;
  category?: string;
  confirmationCode?: string;
  recipients?: OrderRecipient[];
  amountTo?: number;
  distanceTo?: number;
  startedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
};

/**
 * An order row from GET /admins/orders or /admins/orders/:id. The list attaches
 * `user` and `rider` (name, phone, photo); the detail also attaches the coupon,
 * the order review and the rider's rating.
 */
export type OrderRow = Order & {
  user?: OrderParty | null;
  rider?: OrderParty | null;
  locations?: OrderStop[];
  totalAmount?: number;
  discountAmount?: number;
  discountType?: string;
  currency?: string;
  paidDate?: string;
  cancelledBy?: string;
  channel?: string;
  offers?: unknown[];
  totalLocations?: number;
  confirmedLocations?: number;
  cancelledLocations?: number;
  ongoingLocations?: number;
  autoAcceptOffer?: boolean;
  minimumOfferPercentage?: number;
  maxRiderSurgePercentage?: number;
  businessId?: string;
  vehicleId?: string;
  coupon?: { code?: string; name?: string } | null;
  review?: { rating?: number; comment?: string; createdAt?: string } | null;
};

export type OrderBid = {
  _id: string;
  amount: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt?: string;
  rider: OrderParty | null;
  riderStats: { totalBids: number; wonBids: number; avgBid: number } | null;
};

/** GET /admins/orders/:id/offers */
export type OrderOffers = {
  orderId: string;
  totalBids: number;
  uniqueRiders: number;
  lowestBid: number | null;
  highestBid: number | null;
  acceptedAmount: number | null;
  offers: OrderBid[];
};

// ── Vehicles and businesses: fuller shapes ────────────────────────────────────

/**
 * What the vehicle schema actually carries. The list populates `user`; the
 * single-vehicle route returns the bare document (userId / businessId only).
 */
export type VehicleRecord = Vehicle & {
  engineNumber?: string;
  chasisNumber?: string;
  photos?: string[];
  statusComment?: string;
  verifiedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  user?: User | null;
  business?: Business | null;
};

export type VehicleInput = {
  name: string;
  plateNumber: string;
  make: string;
  model: string;
  chasisNumber: string;
  engineNumber: string;
  photos: string[];
  color?: string;
};

export type BusinessAddress = {
  country?: string;
  state?: string;
  lga?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  branchName?: string;
  landmark?: string;
};

export type BusinessPreferences = {
  notification?: { email?: boolean; push?: boolean; sms?: boolean };
  orderRequestNotification?: { vibration?: boolean; sound?: boolean };
  bidding?: { priceSuggestion?: boolean; minus?: number; plus?: number };
  onboarding?: Record<string, unknown>;
};

/** The business document as GET /businesses/:id returns it. */
export type BusinessDetail = Business & {
  photo?: string;
  branchName?: string;
  website?: string;
  webhook?: string;
  aboutMe?: string;
  address?: BusinessAddress;
  country?: { name?: string; code?: string } | string;
  state?: { name?: string } | string;
  city?: { name?: string } | string;
  users?: string[];
  vehicles?: string[];
  preferences?: BusinessPreferences;
  isDeleted?: boolean;
  updatedAt?: string;
};

export type BusinessOrderStatistics = {
  total: number;
  completed: number;
  cancelled: number;
  single: number;
  batch: number;
  bulk: number;
};

/** Only `notification` and `onboarding` are persisted by the service today. */
export type BusinessPreferencesInput = {
  notification?: { email: boolean; push: boolean; sms: boolean };
  onboarding?: Record<string, unknown>;
};

// ── Admin section: typed rows for the logs and settings tabs ──────────────────

export type AuditLogRow = {
  _id: string;
  actionBy?: string;
  actionType?: string;
  action?: string;
  actionSuccessful?: boolean;
  requestUrl?: string;
  requestMethod?: string;
  ipAddress?: string;
  requestData?: unknown;
  responseData?: unknown;
  createdAt: string;
  [key: string]: unknown;
};

export type DataLogRow = {
  _id: string;
  data?: unknown;
  level?: "LOG" | "INFO" | "DEBUG" | "ERROR";
  logType?: "SYSTEM" | "USER";
  createdAt: string;
  [key: string]: unknown;
};

export const adminLogs = {
  auditLogs: (query: Query) => list<AuditLogRow>("/audit-logs", query),
  dataLogs: (query: Query) => list<DataLogRow>("/datalogs", query),
};

/** Country config as the core stores it; money fields are kobo. */
export type CountryConfig = {
  exchangeRate?: number;
  minimumOfferPercentage?: number;
  maxRiderSurgePercentage?: number;
  userWithdrawalLimits?: { minimumAmount?: number; maximumAmount?: number };
  businessWithdrawalLimits?: { minimumAmount?: number; maximumAmount?: number };
  referAndEarn?: boolean;
  referralEarnAmount?: number;
  ordersRequiredBeforeEarn?: number;
};

/** State config as the core stores it; money fields are kobo, distances km or metres as named. */
export type StateConfig = {
  basePricePerKm?: number;
  baseFuelPrice?: number;
  currentFuelPrice?: number;
  percentageCharge?: number;
  serviceCharge?: number;
  minimumOrderPrice?: number;
  distanceTaperThreshold?: number;
  distanceTaperBeyondRate?: number;
  maxRidersPerQuery?: number;
  maxActiveOrders?: number;
  maxDistanceRadius?: number;
  queueOrderByDefault?: boolean;
  locationUpdateEnabled?: boolean;
  locationUpdateFreeRadiusMeters?: number;
  locationUpdateMaxPerLocation?: number;
  locationUpdateMaxDeclinesPerLocation?: number;
  locationUpdateRiderAcceptTimeoutSec?: number;
  arrivalGateEnabled?: boolean;
  arrivalRadiusMeters?: number;
  etaEnabled?: boolean;
  etaAverageSpeedKmh?: number;
};

export const settingsExtra = {
  /** POST /admin-configs/countries/:id/states takes an array of { name, code }; config is set with a PATCH afterwards. */
  createStates: (countryId: string, body: { name: string; code: string }[]) =>
    post<{ name: string; code: string }[]>(`/admin-configs/countries/${countryId}/states`, body),
};

// ── Delivery price calculator (this endpoint already returns naira, not kobo) ─

export type DeliveryPriceAnalytics = {
  range: { from: string; to: string };
  /** Naira per litre. */
  currentFuelPrice: number;
  quotes: {
    total: number;
    batchRate: number;
    avgDistanceKm: number;
    /** Naira. */
    avgPrice: number;
    perDay: { date: string; count: number; fuel: number }[];
    distanceBands: { band: string; count: number }[];
    topPickups: { area: string; count: number }[];
    topDropoffs: { area: string; count: number }[];
  };
  engagement: { share: number; copy: number; book: number; shareRate: number; bookRate: number };
  feedback: {
    total: number;
    verdicts: { too_low: number; fair: number; too_high: number };
    bySegment: { _id: { segment: string; verdict: string }; count: number }[];
    byBand: { _id: { band: string; verdict: string }; count: number }[];
    /** median is naira. */
    medianSuggestedByBand: { band: string; median: number; count: number }[];
  };
};

export type DeliveryCalcConfig = {
  maxExtraStops: number;
  staleDays: number;
  batchDiscountPercent: number;
  /** Naira snapshot of the core NG/EN state config, read only here. */
  corePricing?: { pricePerKm: number; minimum: number; fuelPrice: number };
};

/** What POST /admins/notifications/broadcasts/estimate actually returns (`total`, not `recipients`). */
export type BroadcastEstimate = { total?: number; recipients?: number; withPush: number; withEmail: number };

// ── Coupons ───────────────────────────────────────────────────────────────────

export type CouponType = "FIXED" | "PERCENTAGE";
export type CouponLifecycle = "ACTIVE" | "EXPIRED" | "EXHAUSTED" | "INACTIVE";

export type Person = {
  _id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  photo?: string;
};

export type Coupon = {
  _id: string;
  code: string;
  name?: string;
  description?: string;
  currency: string;
  type: CouponType;
  /** Percentage (0–100) or a FIXED amount in kobo. */
  value: number;
  maxDiscount?: number;
  expirationDate: string;
  isActive: boolean;
  usageCount: number;
  limit: number;
  isOneTime: boolean;
  isGeneral: boolean;
  createdAt: string;
  updatedAt?: string;
  // Admin rollups
  lifecycle: CouponLifecycle;
  discountTotal: number;
  uniqueUsers: number;
  lastUsedAt?: string;
  groupNames: string[];
  isReward: boolean;
  [key: string]: unknown;
};

export type CouponInput = {
  code: string;
  name?: string;
  description?: string;
  currency: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  expirationDate: string;
  limit: number;
  isActive?: boolean;
  isOneTime?: boolean;
  isGeneral?: boolean;
};

export type CouponUpdate = Partial<
  Pick<
    CouponInput,
    "name" | "description" | "expirationDate" | "limit" | "maxDiscount" | "isActive" | "isGeneral" | "isOneTime"
  >
>;

export type CouponUsage = {
  _id: string;
  couponId: string;
  userId: string;
  orderId: string;
  createdAt: string;
  discountAmount?: number;
  user?: Person;
  order?: {
    _id: string;
    orderNumber?: string;
    status?: string;
    type?: string;
    discountAmount?: number;
    totalAmountPayable?: number;
    currency?: string;
    createdAt?: string;
  };
  [key: string]: unknown;
};

export type CouponsSummary = {
  total: number;
  active: number;
  expiring7d: number;
  redemptions30d: number;
  redemptionsTotal: number;
  discount30d: number;
  discountTotal: number;
  rewardCoupons: number;
  rewardCouponsRedeemed: number;
  daily: { date: string; count: number; discount: number }[];
  topCoupons: { code: string; name?: string; count: number; discount: number }[];
};

export type CouponGroup = {
  _id: string;
  name: string;
  userCount: number;
  couponCount: number;
  coupons?: Pick<Coupon, "_id" | "code" | "name" | "isActive" | "expirationDate">[];
  users?: Person[];
  createdAt?: string;
  [key: string]: unknown;
};

export const coupons = {
  list: (query: Query) => list<Coupon>("/admins/coupons", query),
  summary: () => get<CouponsSummary>("/admins/coupons/summary"),
  get: (couponId: string) => get<Coupon>(`/admins/coupons/${couponId}`),
  usages: (couponId: string, query: Query) => list<CouponUsage>(`/admins/coupons/${couponId}/usages`, query),
  create: (body: CouponInput) => post<Coupon>("/admins/coupons", body),
  update: (couponId: string, body: CouponUpdate) => patch<Coupon>(`/admins/coupons/${couponId}`, body),
  deactivate: (code: string) => patch<unknown>(`/admins/coupons/${code}/deactivate`),
  groups: (query: Query) => list<CouponGroup>("/admins/coupons/groups", query),
  group: (groupId: string) => get<CouponGroup>(`/admins/coupons/groups/${groupId}`),
  createGroup: (body: { name: string; couponCodes: string[]; userIds?: string[] }) =>
    post<CouponGroup>("/admins/coupons/groups", body),
  updateGroup: (groupId: string, body: { name?: string; couponCodes?: string[] }) =>
    patch<CouponGroup>(`/admins/coupons/groups/${groupId}`, body),
  addGroupUsers: (groupId: string, userIds: string[]) =>
    patch<CouponGroup>(`/admins/coupons/groups/${groupId}/add`, { userIds }),
  removeGroupUsers: (groupId: string, userIds: string[]) =>
    patch<CouponGroup>(`/admins/coupons/groups/${groupId}/remove`, { userIds }),
};

// ── Achievements (customer badges) ────────────────────────────────────────────

export type AchievementCategory = "SINGLE" | "BATCH" | "BULK" | "WALLET" | "REFERRAL" | "SPECIAL";

export type AchievementDefinition = {
  key: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string;
  target: number;
  unit: string;
  tier: number;
  rewardPercent: number;
  unlockedCount: number;
  unlocked30d: number;
  rewardsIssued: number;
  rewardsRedeemed: number;
  discountTotal: number;
  [key: string]: unknown;
};

export type AchievementsSummary = {
  badges: number;
  customersWithBadges: number;
  unlocksTotal: number;
  unlocks30d: number;
  rewardsIssued: number;
  rewardsRedeemed: number;
  rewardsOutstanding: number;
  discountTotal: number;
  rewardPercentByTier: Record<string, number>;
  rewardMaxDiscount: number;
  rewardValidityDays: number;
  daily: { date: string; count: number }[];
};

export type AchievementUnlock = {
  userId: string;
  key: string;
  title: string;
  category: AchievementCategory;
  unlockedAt: string;
  acknowledgedAt?: string;
  couponCode?: string;
  couponExpiresAt?: string;
  rewardState?: "REDEEMED" | "ACTIVE" | "EXPIRED" | "NONE";
  discountAmount?: number;
  user?: Person;
  [key: string]: unknown;
};

export type CustomerAchievement = {
  key: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  unit: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
  unlockedAt?: string;
  isNew: boolean;
  reward: { percent: number; maxDiscount: number; validityDays: number; couponCode?: string; expiresAt?: string };
};

export type CustomerAchievements = {
  results: CustomerAchievement[];
  unlockedCount: number;
  stats: Record<string, number>;
};

export const achievements = {
  catalogue: () => get<AchievementDefinition[]>("/admins/achievements"),
  summary: () => get<AchievementsSummary>("/admins/achievements/summary"),
  unlocks: (query: Query) => list<AchievementUnlock>("/admins/achievements/unlocks", query),
  forUser: (userId: string) => get<CustomerAchievements>(`/admins/achievements/users/${userId}`),
  grant: (userId: string, body: { key: string; reason?: string }) =>
    post<CustomerAchievements>(`/admins/achievements/users/${userId}/grant`, body),
  revoke: (userId: string, key: string) => del<CustomerAchievements>(`/admins/achievements/users/${userId}/${key}`),
};

// ── Support: issue reports ────────────────────────────────────────────────────

export type IssueStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
export type IssuePriority = "HIGH" | "MEDIUM" | "LOW";
export type IssueCategory =
  "ORDER" | "DELIVERY" | "RIDER_BEHAVIOUR" | "APP_TECHNICAL" | "PAYMENT_REFUND" | "SAFETY_SECURITY" | "OTHER";
export type IssueSubjectType = "ORDER" | "TRANSACTION" | "GENERAL";

export type IssueNote = { _id?: string; adminId: string | Person; note: string; createdAt: string };

export type Issue = {
  _id: string;
  reference: string;
  userId: string;
  subjectType: IssueSubjectType;
  orderId?: string;
  transactionId?: string;
  category: IssueCategory;
  priority: IssuePriority;
  description: string;
  attachments: string[];
  status: IssueStatus;
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  assignedTo?: string;
  firstResponseAt?: string;
  notes?: IssueNote[];
  noteCount?: number;
  createdAt: string;
  updatedAt?: string;
  user?: Person;
  assignee?: Person;
  order?: {
    _id: string;
    orderNumber?: string;
    status?: string;
    type?: string;
    totalAmountPayable?: number;
    currency?: string;
    createdAt?: string;
  };
  transaction?: {
    _id: string;
    reference?: string;
    amount?: number;
    currency?: string;
    status?: string;
    purpose?: string;
    createdAt?: string;
  };
  [key: string]: unknown;
};

export type IssuesSummary = {
  open: number;
  inReview: number;
  unassigned: number;
  highPriorityOpen: number;
  resolved7d: number;
  new7d: number;
  avgResolutionHours: number | null;
  avgFirstResponseHours: number | null;
  overdue: number;
  byCategory: { key: string; count: number }[];
  byPriority: { key: string; count: number }[];
};

export const issues = {
  list: (query: Query) => list<Issue>("/admins/issues", query),
  summary: () => get<IssuesSummary>("/admins/issues/summary"),
  get: (issueId: string) => get<Issue>(`/admins/issues/${issueId}`),
  forUser: (userId: string, query: Query) => list<Issue>(`/admins/issues/users/${userId}`, query),
  updateStatus: (issueId: string, body: { status: IssueStatus; resolution?: string }) =>
    patch<Issue>(`/admins/issues/${issueId}/status`, body),
  assign: (issueId: string, adminId: string | null) => patch<Issue>(`/admins/issues/${issueId}/assign`, { adminId }),
  updatePriority: (issueId: string, priority: IssuePriority) =>
    patch<Issue>(`/admins/issues/${issueId}/priority`, { priority }),
  addNote: (issueId: string, note: string) => post<Issue>(`/admins/issues/${issueId}/notes`, { note }),
};
