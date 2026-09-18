import { apiService } from "@/services";

/**
 * Typed namespaces over the generated swagger client (`apiService`, regenerated with
 * `yarn generate-types`). Every call here goes through a generated method, so a route the
 * backend renames or removes fails the type-check instead of 404ing in production. The
 * shapes below mirror the NestJS DTOs the pages read; every amount is in kobo.
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

/**
 * Query params as the generated client wants them: empty values dropped, everything a string.
 * The generated param types are narrower than `Query` (and a few list endpoints do not declare
 * page/limit in Swagger yet), so the result is cast to whatever the method expects.
 */
export function params<T>(query?: Query): T {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = String(value);
  }
  return out as unknown as T;
}

/** Narrow a generated response to the shape the pages read. */
function as<T>(promise: Promise<unknown>): Promise<T> {
  return promise as Promise<T>;
}
async function page<T>(promise: Promise<unknown>): Promise<Paged<T>> {
  return toPaged((await promise) as CorePage<T>);
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
  /** Set once the dispatcher has rung riders for a scheduled order; unset = still waiting for its time. */
  scheduleDispatchedAt?: string;
  scheduleLastRungAt?: string;
  scheduleRingCount?: number;
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
  overview: (range: RangeQuery) => as<Overview>(apiService.overview(params(range))),
  series: (range: RangeQuery & { bucket?: string; riderId?: string; userId?: string }) => as<Series>(apiService.series(params(range))),
  topRiders: (range: RangeQuery & { limit?: number }) => as<TopRider[]>(apiService.topRiders(params(range))),
  peakHours: (range: RangeQuery) => as<PeakHours>(apiService.peakHours(params(range))),
  attention: () => as<Attention>(apiService.attention()),
  charges: (range: RangeQuery) => as<Charges>(apiService.charges(params(range))),
  chargesByRider: (query: Query) => page<RiderChargeRow>(apiService.chargesByRider(params(query))),
  customers: (query: Query) => page<CustomerRow>(apiService.customers(params(query))),
  businesses: (query: Query) => page<BusinessRow>(apiService.businesses(params(query))),
  userOverview: (userId: string, range: RangeQuery) => as<UserOverview>(apiService.userOverview(params({ ...range, userId }))),
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export type LoginResult = { accessToken: string; expiryDurationSeconds: number; refreshToken: string };

export const auth = {
  /** Any platform staff role signs in; the backend decides what the role can do. */
  login: (body: { identifier: string; password: string }) => as<LoginResult>(apiService.loginAdmins(body)),
};

// ── Me ────────────────────────────────────────────────────────────────────────

export const me = {
  get: () => as<User>(apiService.adminGetMyProfile()),
  changePassword: (body: { oldPassword: string; newPassword: string; confirmPassword: string }) =>
    as<unknown>(apiService.adminChangeMyPassword(body)),
  updatePhoto: (body: { photo: string }) => as<User>(apiService.adminUpdateMyPhoto(body)),
  preferences: () => as<AdminPreferences>(apiService.getAdminPreferences()),
  updatePreferences: (body: AdminPreferences) => as<AdminPreferences>(apiService.updateAdminPreferences(body)),
};

// ── Users (customers, couriers, staff) ────────────────────────────────────────

export const users = {
  list: (query: Query) => page<User>(apiService.getUsers(params(query))),
  get: (userId: string) => as<User>(apiService.getUser(userId)),
  wallets: (userId: string) => as<Wallet[] | CorePage<Wallet>>(apiService.adminGetUserWallets(userId)),
  create: (body: Record<string, unknown>) => as<User>(apiService.adminCreateUser(body as never)),
  updateStatus: (userId: string, body: { status: UserStatus; reason?: string }) =>
    as<User>(apiService.updateUserStatus(userId, body as never)),
  adjustWallet: (userId: string, body: { amount: number; type: TransactionType; reason: string }) =>
    as<unknown>(apiService.adjustUserWallet(userId, body as never)),
  refund: (userId: string, body: { orderId: string; amount?: number; reason: string }) =>
    as<unknown>(apiService.refundCustomerOrder(userId, body)),
  /** Paid, non-storefront orders with what has already gone back and what an admin may still refund. */
  refundableOrders: (userId: string, search?: string) =>
    as<RefundableOrder[]>(apiService.refundableOrders(params({ userId, limit: 50, search }))),
  updatePhone: (userId: string, body: { phone: string; reason?: string }) => as<User>(apiService.updateUserPhone(userId, body)),
  setDispatch: (userId: string, body: { paused: boolean; reason?: string }) => as<User>(apiService.setDispatchPaused(userId, body)),
  licenceVerify: (userId: string, body: Record<string, unknown>) => as<User>(apiService.adminVerifyDriversLicense(userId, body as never)),
  /** The approve route takes no body; the licence on file is what gets approved. */
  licenceApprove: (userId: string) => as<User>(apiService.approveDriversLicenseSubmission(userId)),
  licenceUpdate: (userId: string, body: Record<string, unknown>) => as<User>(apiService.updateDriversLicense(userId, body as never)),
  settlementAccount: (userId: string, walletId: string, body: Record<string, unknown>) =>
    as<Wallet>(apiService.adminUpdateSettlementAccount(userId, walletId, body as never)),
};

export type RefundableOrder = {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  type: OrderType;
  totalAmountPayable?: number;
  currency: string;
  createdAt: string;
  paidDate?: string;
  refunded: number;
  refundable: number;
};

// ── Orders ────────────────────────────────────────────────────────────────────

export const orders = {
  list: (query: Query) => page<Order>(apiService.getOrders(params(query))),
  get: (orderId: string) => as<Order>(apiService.getOrder(orderId)),
  offers: (orderId: string) => as<Record<string, unknown>>(apiService.getOrderOffers(orderId)),
  cancel: (orderId: string, body: { reason: string }) => as<Order>(apiService.adminCancelOrder(orderId, body)),
  /** Re-broadcast an order still waiting for a rider (scheduled ones must be paid and inside their lead). */
  ringRiders: (orderId: string) => as<{ riders: number; order: Order }>(apiService.ringRiders(orderId)),
  updateStatus: (orderId: string, body: { status: OrderStatus }) => as<Order>(apiService.updateOrderStatus(orderId, body as never)),
};

// ── Transactions ──────────────────────────────────────────────────────────────

export const transactions = {
  list: (query: Query) => page<Transaction>(apiService.adminGetTransactions(params(query))),
  get: (transactionId: string) => as<Transaction>(apiService.getTransaction(transactionId)),
  summary: (query?: Query) => as<Record<string, unknown>>(apiService.getTransactionSummary(params(query))),
  externalPayments: (query?: Query) => as<Record<string, unknown>>(apiService.getExternalPaymentMetrics(params(query))),
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
  list: (query: Query) => page<Review>(apiService.getReviews(params(query))),
};

// ── Vehicles ──────────────────────────────────────────────────────────────────

export const vehicles = {
  list: (query: Query) => page<Vehicle>(apiService.getVehicles(params(query))),
  get: (vehicleId: string) => as<Vehicle>(apiService.adminGetVehicle(vehicleId)),
  create: (userId: string, body: Record<string, unknown>) => as<Vehicle>(apiService.adminUpdateUserVehicle(userId, body as never)),
  verify: (vehicleId: string, userId: string) => as<Vehicle>(apiService.verifyVehicle(vehicleId, userId)),
  reject: (vehicleId: string, userId: string, body: { reason: string }) =>
    as<Vehicle>(apiService.rejectVehicle(vehicleId, userId, body)),
  suspend: (vehicleId: string, userId: string, body: { reason: string }) =>
    as<Vehicle>(apiService.suspendVehicle(vehicleId, userId, body)),
  remove: (vehicleId: string) => as<unknown>(apiService.deleteVehicle(vehicleId)),
};

// ── Businesses ────────────────────────────────────────────────────────────────

export const businesses = {
  get: (businessId: string) => as<Business>(apiService.getBusiness(businessId)),
  orders: (businessId: string, query: Query) => page<Order>(apiService.getBusinessOrders(params({ ...query, businessId }))),
  users: (businessId: string, query: Query) => page<User>(apiService.getBusinessUsers(params({ ...query, businessId }))),
  vehicles: (businessId: string, query: Query) => page<Vehicle>(apiService.getBusinessVehicles(params({ ...query, businessId }))),
  transactions: (businessId: string, query: Query) =>
    page<Transaction>(apiService.getBusinessTransactions(params({ ...query, businessId }))),
  wallets: (businessId: string) => as<Wallet[] | CorePage<Wallet>>(apiService.getBusinessWallets(businessId)),
  orderStatistics: (businessId: string, query?: Query) =>
    as<Record<string, unknown>>(apiService.getBusinessOrderStatistics(params({ ...query, businessId }))),
  suspendUser: (businessId: string, userId: string) => as<User>(apiService.suspendBusinessUser(businessId, userId)),
  unsuspendUser: (businessId: string, userId: string) => as<User>(apiService.unsuspendBusinessUser(businessId, userId)),
  removeUser: (businessId: string, userId: string) => as<unknown>(apiService.removeUserFromBusiness(businessId, userId)),
  updatePreferences: (businessId: string, body: Record<string, unknown>) =>
    as<Business>(apiService.updateBusinessPreferences(businessId, body as never)),
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
  platformWallet: () => as<Wallet>(apiService.getPlatformWallet()),
  status: () => as<FinanceStatus>(apiService.getFinanceStatus()),
  banks: () => as<{ name: string; code: string }[] | { data?: { name: string; code: string }[] }>(apiService.getPlatformBanks()),
  updateSettlement: (body: { accountNumber: string; bankCode: string }) => as<unknown>(apiService.updateSettlement(body)),
  setPin: (body: { pin: string }) => as<unknown>(apiService.setPin(body)),
  payout: (body: { amount: number; pin: string; reason?: string }) => as<unknown>(apiService.initiatePayout(body)),
  transfer: (body: { userId: string; amount: number; pin: string; reason: string }) => as<unknown>(apiService.transferToUser(body)),
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
    as<{ recipients: number; withPush: number; withEmail: number }>(apiService.estimateBroadcast(body as never)),
  send: (body: BroadcastInput) => as<Broadcast>(apiService.createBroadcast(body as never)),
  broadcasts: (query: Query) => page<Broadcast>(apiService.listBroadcasts(params(query))),
  broadcast: (broadcastId: string) => as<Broadcast>(apiService.getBroadcast(broadcastId)),
  log: (query: Query) => page<NotificationRow>(apiService.log(params(query))),
};

// ── Admin: team, logs, settings ───────────────────────────────────────────────

export type Team = { _id: string; name?: string; entityType?: string; entityId?: string; createdAt: string; [key: string]: unknown };

export const admin = {
  teams: (query: Query) => page<Team>(apiService.adminListTeams(params(query))),
  createTeam: (body: Record<string, unknown>) => as<Team>(apiService.adminCreateTeam(body as never)),
  auditLogs: (query: Query) => page<Record<string, unknown>>(apiService.findAll(params(query))),
  dataLogs: (query: Query) => page<Record<string, unknown>>(apiService.getLogs(params(query))),
  reviews: (query: Query) => page<Record<string, unknown>>(apiService.getReviews(params(query))),
};

export type Country = { _id: string; name: string; code?: string; currency?: string; isActive?: boolean; [key: string]: unknown };
export type CountryState = { _id: string; name: string; countryId?: string; isActive?: boolean; [key: string]: unknown };

export const settings = {
  countries: () => as<Country[] | CorePage<Country>>(apiService.getCountries(params({ limit: 100 }))),
  country: (countryId: string) => as<Country>(apiService.getCountryById(countryId)),
  createCountry: (body: Record<string, unknown>) => as<Country>(apiService.addCountry(body as never)),
  updateCountry: (countryId: string, body: Record<string, unknown>) => as<Country>(apiService.updateCountry(countryId, body as never)),
  states: (countryId: string) => as<CountryState[] | CorePage<CountryState>>(apiService.getCountryStates(countryId)),
  state: (countryId: string, stateId: string) => as<CountryState>(apiService.getCountryStateById(countryId, stateId)),
  createState: (countryId: string, body: Record<string, unknown>) =>
    as<CountryState>(apiService.addCountryStates(countryId, [body] as never)),
  updateState: (countryId: string, stateId: string, body: Record<string, unknown>) =>
    as<CountryState>(apiService.updateCountryState(countryId, stateId, body as never)),
  deliveryPricing: () => as<Record<string, unknown>>(apiService.getDeliveryPricing()),
};

export const deliveryPrice = {
  analytics: (query?: Query) => as<Record<string, unknown>>(apiService.analytics(params(query))),
  config: () => as<Record<string, unknown>>(apiService.adminConfig()),
  updateConfig: (body: Record<string, unknown>) => as<Record<string, unknown>>(apiService.updateConfig(body as never)),
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
  auditLogs: (query: Query) => page<AuditLogRow>(apiService.findAll(params(query))),
  dataLogs: (query: Query) => page<DataLogRow>(apiService.getLogs(params(query))),
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
    as<{ name: string; code: string }[]>(apiService.addCountryStates(countryId, body as never)),
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
  list: (query: Query) => page<Coupon>(apiService.listCoupons(params(query))),
  summary: () => as<CouponsSummary>(apiService.couponsSummary()),
  get: (couponId: string) => as<Coupon>(apiService.getCoupon(couponId)),
  usages: (couponId: string, query: Query) => page<CouponUsage>(apiService.usages(params({ ...query, couponId }))),
  create: (body: CouponInput) => as<Coupon>(apiService.createCoupon(body as never)),
  update: (couponId: string, body: CouponUpdate) => as<Coupon>(apiService.updateCoupon(couponId, body as never)),
  deactivate: (code: string) => as<unknown>(apiService.deactivateCoupon(code)),
  groups: (query: Query) => page<CouponGroup>(apiService.listGroups(params(query))),
  group: (groupId: string) => as<CouponGroup>(apiService.getGroup(groupId)),
  createGroup: (body: { name: string; couponCodes: string[]; userIds?: string[] }) =>
    as<CouponGroup>(apiService.createGroup(body as never)),
  updateGroup: (groupId: string, body: { name?: string; couponCodes?: string[] }) =>
    as<CouponGroup>(apiService.updateGroup(groupId, body as never)),
  addGroupUsers: (groupId: string, userIds: string[]) => as<CouponGroup>(apiService.addGroupUsers(groupId, { userIds })),
  removeGroupUsers: (groupId: string, userIds: string[]) => as<CouponGroup>(apiService.removeGroupUsers(groupId, { userIds })),
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
  catalogue: () => as<AchievementDefinition[]>(apiService.catalogue()),
  summary: () => as<AchievementsSummary>(apiService.achievementsSummary()),
  unlocks: (query: Query) => page<AchievementUnlock>(apiService.unlocks(params(query))),
  forUser: (userId: string) => as<CustomerAchievements>(apiService.forUser(userId)),
  grant: (userId: string, body: { key: string; reason?: string }) => as<CustomerAchievements>(apiService.grant(userId, body)),
  revoke: (userId: string, key: string) => as<CustomerAchievements>(apiService.revoke(userId, key)),
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
  list: (query: Query) => page<Issue>(apiService.listIssues(params(query))),
  summary: () => as<IssuesSummary>(apiService.issuesSummary()),
  get: (issueId: string) => as<Issue>(apiService.getIssue(issueId)),
  forUser: (userId: string, query: Query) => page<Issue>(apiService.listUserIssues(params({ ...query, userId }))),
  updateStatus: (issueId: string, body: { status: IssueStatus; resolution?: string }) =>
    as<Issue>(apiService.updateStatus(issueId, body as never)),
  assign: (issueId: string, adminId: string | null) => as<Issue>(apiService.assign(issueId, { adminId } as never)),
  updatePriority: (issueId: string, priority: IssuePriority) => as<Issue>(apiService.updatePriority(issueId, { priority } as never)),
  addNote: (issueId: string, note: string) => as<Issue>(apiService.addNote(issueId, { note })),
};

// ── In-app announcements ("what's new" popups) ────────────────────────────────

/**
 * Typed straight off the generated contract — the shape the pages read IS the DTO. New
 * namespaces should look like this rather than re-declaring the types above.
 */
export type {
  Announcement,
  AnnouncementAction,
  AnnouncementActionDto,
  AnnouncementReceiptRowDto,
  AnnouncementsSummaryResponseDto as AnnouncementsSummary,
  AppScreenDto as AppScreen,
  AppScreensResponseDto as AppScreens,
  CreateAnnouncementRequestDto as AnnouncementInput,
  UpdateAnnouncementRequestDto as AnnouncementUpdate,
} from "@/services";
export { AnnouncementActionType, AnnouncementAudience, AnnouncementOutcome, AnnouncementStatus } from "@/services";

export const announcements = {
  list: (query: Query) => page<import("@/services").Announcement>(apiService.adminListAnnouncements(params(query))),
  summary: () => apiService.adminAnnouncementsSummary(),
  screens: () => apiService.adminListAnnouncementScreens(),
  get: (announcementId: string) => apiService.adminGetAnnouncement(announcementId),
  receipts: (announcementId: string, query: Query) =>
    page<import("@/services").AnnouncementReceiptRowDto>(apiService.adminListAnnouncementReceipts(params({ ...query, announcementId }))),
  create: (body: import("@/services").CreateAnnouncementRequestDto) => apiService.adminCreateAnnouncement(body),
  update: (announcementId: string, body: import("@/services").UpdateAnnouncementRequestDto) =>
    apiService.adminUpdateAnnouncement(announcementId, body),
  setStatus: (announcementId: string, status: import("@/services").AnnouncementStatus) =>
    apiService.adminUpdateAnnouncementStatus(announcementId, { status }),
  remove: (announcementId: string) => apiService.adminDeleteAnnouncement(announcementId),
};
