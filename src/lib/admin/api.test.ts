import type { AxiosRequestConfig } from "axios";

import { apiService } from "@/services";
import * as api from "./api";

/**
 * Route contract for the typed namespaces.
 *
 * Every function in ./api.ts goes through a generated `apiService` method. The type-checker
 * already fails when a method disappears; this pins the rest of the contract — HTTP verb,
 * path, query and body — so a regenerated client that silently re-points a method (a backend
 * rename, a collision suffix, a moved route) fails here instead of 404ing in front of staff.
 *
 * The "every function has a case" test at the bottom means a new namespace function cannot
 * ship without a line in CASES.
 */
type Captured = { method: string; url: string; params?: Record<string, unknown>; data?: unknown };

const PAGE = { results: [{ _id: "x" }], totalRecords: 1, totalPages: 1, currentPage: 1, perPageLimit: 20, nextPage: null, previousPage: null };

let captured: Captured[] = [];
let nextResponse: unknown = PAGE;

beforeAll(() => {
  apiService.instance.defaults.adapter = async (config: AxiosRequestConfig) => {
    captured.push({
      method: (config.method ?? "get").toUpperCase(),
      url: config.url ?? "",
      params: config.params as Record<string, unknown> | undefined,
      data: typeof config.data === "string" ? JSON.parse(config.data) : config.data,
    });
    return { data: nextResponse, status: 200, statusText: "OK", headers: {}, config: config as never };
  };
});

beforeEach(() => {
  captured = [];
  nextResponse = PAGE;
});

type Case = {
  /** `namespace.fn` — must match an export of ./api.ts */
  name: string;
  call: () => Promise<unknown>;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  params?: Record<string, unknown>;
  data?: unknown;
  /** Set when the function returns a Paged<T> (list) rather than the raw body. */
  paged?: boolean;
};

const P = "/api/v1";
const ID = "64b000000000000000000001";
const OTHER = "64b000000000000000000002";

const CASES: Case[] = [
  // stats
  { name: "stats.overview", call: () => api.stats.overview({ from: "2026-09-01", to: "2026-09-17" }), method: "GET", path: `${P}/admins/stats/overview`, params: { from: "2026-09-01", to: "2026-09-17" } },
  { name: "stats.series", call: () => api.stats.series({ from: "a", to: "b", bucket: "day" }), method: "GET", path: `${P}/admins/stats/series`, params: { from: "a", to: "b", bucket: "day" } },
  { name: "stats.topRiders", call: () => api.stats.topRiders({ all: true, limit: 5 }), method: "GET", path: `${P}/admins/stats/top-riders`, params: { all: "true", limit: "5" } },
  { name: "stats.peakHours", call: () => api.stats.peakHours({ all: true }), method: "GET", path: `${P}/admins/stats/peak-hours`, params: { all: "true" } },
  { name: "stats.attention", call: () => api.stats.attention(), method: "GET", path: `${P}/admins/stats/attention` },
  { name: "stats.charges", call: () => api.stats.charges({ from: "a" }), method: "GET", path: `${P}/admins/stats/charges`, params: { from: "a" } },
  { name: "stats.chargesByRider", call: () => api.stats.chargesByRider({ page: 2, limit: 10 }), method: "GET", path: `${P}/admins/stats/charges/riders`, params: { page: "2", limit: "10" }, paged: true },
  { name: "stats.customers", call: () => api.stats.customers({ search: "ada" }), method: "GET", path: `${P}/admins/stats/customers`, params: { search: "ada" }, paged: true },
  { name: "stats.businesses", call: () => api.stats.businesses({ page: 1 }), method: "GET", path: `${P}/admins/stats/businesses`, params: { page: "1" }, paged: true },
  { name: "stats.userOverview", call: () => api.stats.userOverview(ID, { all: true }), method: "GET", path: `${P}/admins/stats/users/${ID}/overview`, params: { all: "true" } },
  // auth / me
  { name: "auth.login", call: () => api.auth.login({ identifier: "a@b.c", password: "pw" }), method: "POST", path: `${P}/auth/admins/login`, data: { identifier: "a@b.c", password: "pw" } },
  { name: "me.get", call: () => api.me.get(), method: "GET", path: `${P}/admins/users/me` },
  { name: "me.changePassword", call: () => api.me.changePassword({ oldPassword: "a", newPassword: "b", confirmPassword: "b" }), method: "PATCH", path: `${P}/admins/users/me/password-change`, data: { oldPassword: "a", newPassword: "b", confirmPassword: "b" } },
  { name: "me.updatePhoto", call: () => api.me.updatePhoto({ photo: "data:" }), method: "PATCH", path: `${P}/admins/users/me/update-profile-photo`, data: { photo: "data:" } },
  { name: "me.preferences", call: () => api.me.preferences(), method: "GET", path: `${P}/admins/users/me/preferences` },
  { name: "me.updatePreferences", call: () => api.me.updatePreferences({ theme: "dark" }), method: "PATCH", path: `${P}/admins/users/me/preferences`, data: { theme: "dark" } },
  // users
  { name: "users.list", call: () => api.users.list({ isRider: true, page: 1 }), method: "GET", path: `${P}/admins/users`, params: { isRider: "true", page: "1" }, paged: true },
  { name: "users.get", call: () => api.users.get(ID), method: "GET", path: `${P}/admins/users/${ID}` },
  { name: "users.wallets", call: () => api.users.wallets(ID), method: "GET", path: `${P}/admins/users/${ID}/wallets` },
  { name: "users.create", call: () => api.users.create({ email: "x" }), method: "POST", path: `${P}/admins/users`, data: { email: "x" } },
  { name: "users.updateStatus", call: () => api.users.updateStatus(ID, { status: "SUSPENDED", reason: "r" }), method: "PATCH", path: `${P}/admins/users/${ID}/status`, data: { status: "SUSPENDED", reason: "r" } },
  { name: "users.adjustWallet", call: () => api.users.adjustWallet(ID, { amount: 100, type: "CREDIT", reason: "r" }), method: "POST", path: `${P}/admins/users/${ID}/wallets/adjust`, data: { amount: 100, type: "CREDIT", reason: "r" } },
  { name: "users.refund", call: () => api.users.refund(ID, { orderId: OTHER, amount: 5, reason: "r" }), method: "POST", path: `${P}/admins/users/${ID}/refund`, data: { orderId: OTHER, amount: 5, reason: "r" } },
  { name: "users.refundableOrders", call: () => api.users.refundableOrders(ID, "PR-1"), method: "GET", path: `${P}/admins/users/${ID}/refundable-orders`, params: { limit: "50", search: "PR-1" } },
  { name: "users.updatePhone", call: () => api.users.updatePhone(ID, { phone: "0801" }), method: "PATCH", path: `${P}/admins/users/${ID}/phone`, data: { phone: "0801" } },
  { name: "users.setDispatch", call: () => api.users.setDispatch(ID, { paused: true }), method: "PATCH", path: `${P}/admins/users/${ID}/dispatch`, data: { paused: true } },
  { name: "users.licenceVerify", call: () => api.users.licenceVerify(ID, { number: "1" }), method: "PATCH", path: `${P}/admins/users/${ID}/drivers-license/verify`, data: { number: "1" } },
  { name: "users.licenceApprove", call: () => api.users.licenceApprove(ID), method: "PATCH", path: `${P}/admins/users/${ID}/drivers-license/approve` },
  { name: "users.licenceUpdate", call: () => api.users.licenceUpdate(ID, { status: "APPROVE" }), method: "PATCH", path: `${P}/admins/users/${ID}/drivers-license/update`, data: { status: "APPROVE" } },
  { name: "users.settlementAccount", call: () => api.users.settlementAccount(ID, OTHER, { bankCode: "058" }), method: "PATCH", path: `${P}/admins/users/${ID}/wallets/${OTHER}/settlement-account`, data: { bankCode: "058" } },
  // orders
  { name: "orders.list", call: () => api.orders.list({ status: "INITIATED", search: "PR", sortBy: "scheduledFor" }), method: "GET", path: `${P}/admins/orders`, params: { status: "INITIATED", search: "PR", sortBy: "scheduledFor" }, paged: true },
  { name: "orders.get", call: () => api.orders.get(ID), method: "GET", path: `${P}/admins/orders/${ID}` },
  { name: "orders.offers", call: () => api.orders.offers(ID), method: "GET", path: `${P}/admins/orders/${ID}/offers` },
  { name: "orders.cancel", call: () => api.orders.cancel(ID, { reason: "r" }), method: "POST", path: `${P}/admins/orders/${ID}/cancel`, data: { reason: "r" } },
  { name: "orders.ringRiders", call: () => api.orders.ringRiders(ID), method: "POST", path: `${P}/admins/orders/${ID}/ring-riders` },
  { name: "orders.updateStatus", call: () => api.orders.updateStatus(ID, { status: "COMPLETED" }), method: "PATCH", path: `${P}/admins/orders/${ID}/status`, data: { status: "COMPLETED" } },
  // transactions
  { name: "transactions.list", call: () => api.transactions.list({ search: "ref" }), method: "GET", path: `${P}/admins/transactions`, params: { search: "ref" }, paged: true },
  { name: "transactions.get", call: () => api.transactions.get(ID), method: "GET", path: `${P}/admins/transactions/${ID}` },
  { name: "transactions.summary", call: () => api.transactions.summary({ dateRange: "a,b" }), method: "GET", path: `${P}/admins/transactions/metrics/summary`, params: { dateRange: "a,b" } },
  { name: "transactions.externalPayments", call: () => api.transactions.externalPayments(), method: "GET", path: `${P}/admins/transactions/metrics/external-payments`, params: {} },
  // reviews
  { name: "reviews.list", call: () => api.reviews.list({ riderId: ID, expand: 1 }), method: "GET", path: `${P}/reviews`, params: { riderId: ID, expand: "1" }, paged: true },
  // vehicles
  { name: "vehicles.list", call: () => api.vehicles.list({ status: "PENDING" }), method: "GET", path: `${P}/admins/vehicles`, params: { status: "PENDING" }, paged: true },
  { name: "vehicles.get", call: () => api.vehicles.get(ID), method: "GET", path: `${P}/admins/vehicles/${ID}` },
  { name: "vehicles.create", call: () => api.vehicles.create(ID, { make: "Bajaj" }), method: "POST", path: `${P}/admins/vehicles/${ID}/create`, data: { make: "Bajaj" } },
  { name: "vehicles.verify", call: () => api.vehicles.verify(ID, OTHER), method: "PATCH", path: `${P}/admins/vehicles/${ID}/users/${OTHER}/verify` },
  { name: "vehicles.reject", call: () => api.vehicles.reject(ID, OTHER, { reason: "r" }), method: "PATCH", path: `${P}/admins/vehicles/${ID}/users/${OTHER}/reject`, data: { reason: "r" } },
  { name: "vehicles.suspend", call: () => api.vehicles.suspend(ID, OTHER, { reason: "r" }), method: "PATCH", path: `${P}/admins/vehicles/${ID}/users/${OTHER}/suspend`, data: { reason: "r" } },
  { name: "vehicles.remove", call: () => api.vehicles.remove(ID), method: "DELETE", path: `${P}/admins/vehicles/${ID}` },
  // businesses
  { name: "businesses.get", call: () => api.businesses.get(ID), method: "GET", path: `${P}/businesses/${ID}` },
  { name: "businesses.orders", call: () => api.businesses.orders(ID, { page: 1 }), method: "GET", path: `${P}/businesses/${ID}/orders`, params: { page: "1" }, paged: true },
  { name: "businesses.users", call: () => api.businesses.users(ID, { role: "BUSINESS_RIDER" }), method: "GET", path: `${P}/businesses/${ID}/users`, params: { role: "BUSINESS_RIDER" }, paged: true },
  { name: "businesses.vehicles", call: () => api.businesses.vehicles(ID, {}), method: "GET", path: `${P}/businesses/${ID}/vehicles`, params: {}, paged: true },
  { name: "businesses.transactions", call: () => api.businesses.transactions(ID, { type: "CREDIT" }), method: "GET", path: `${P}/businesses/${ID}/transactions`, params: { type: "CREDIT" }, paged: true },
  { name: "businesses.wallets", call: () => api.businesses.wallets(ID), method: "GET", path: `${P}/businesses/${ID}/wallets` },
  { name: "businesses.orderStatistics", call: () => api.businesses.orderStatistics(ID, { dateRange: "a,b" }), method: "GET", path: `${P}/businesses/${ID}/order-statistics`, params: { dateRange: "a,b" } },
  { name: "businesses.suspendUser", call: () => api.businesses.suspendUser(ID, OTHER), method: "PATCH", path: `${P}/businesses/${ID}/users/${OTHER}/suspend` },
  { name: "businesses.unsuspendUser", call: () => api.businesses.unsuspendUser(ID, OTHER), method: "PATCH", path: `${P}/businesses/${ID}/users/${OTHER}/unsuspend` },
  { name: "businesses.removeUser", call: () => api.businesses.removeUser(ID, OTHER), method: "DELETE", path: `${P}/businesses/${ID}/users/${OTHER}` },
  { name: "businesses.updatePreferences", call: () => api.businesses.updatePreferences(ID, { a: 1 }), method: "PATCH", path: `${P}/businesses/${ID}/preferences`, data: { a: 1 } },
  // finance
  { name: "finance.platformWallet", call: () => api.finance.platformWallet(), method: "GET", path: `${P}/admins/wallets/platform-wallet` },
  { name: "finance.status", call: () => api.finance.status(), method: "GET", path: `${P}/admins/wallets/finance-status` },
  { name: "finance.banks", call: () => api.finance.banks(), method: "GET", path: `${P}/admins/wallets/banks` },
  { name: "finance.updateSettlement", call: () => api.finance.updateSettlement({ accountNumber: "1", bankCode: "058" }), method: "POST", path: `${P}/admins/wallets/platform-wallet/settlement`, data: { accountNumber: "1", bankCode: "058" } },
  { name: "finance.setPin", call: () => api.finance.setPin({ pin: "1234" }), method: "POST", path: `${P}/admins/wallets/pin`, data: { pin: "1234" } },
  { name: "finance.payout", call: () => api.finance.payout({ amount: 1, pin: "1234" }), method: "POST", path: `${P}/admins/wallets/platform-wallet/payout`, data: { amount: 1, pin: "1234" } },
  { name: "finance.transfer", call: () => api.finance.transfer({ userId: ID, amount: 1, pin: "1234", reason: "r" }), method: "POST", path: `${P}/admins/wallets/platform-wallet/transfer`, data: { userId: ID, amount: 1, pin: "1234", reason: "r" } },
  // messaging
  { name: "messaging.estimate", call: () => api.messaging.estimate({ audience: "RIDERS", filters: { onlineOnly: true } }), method: "POST", path: `${P}/admins/notifications/broadcasts/estimate`, data: { audience: "RIDERS", filters: { onlineOnly: true } } },
  { name: "messaging.send", call: () => api.messaging.send({ audience: "CUSTOMERS", channels: ["PUSH"], subject: "s", message: "m" }), method: "POST", path: `${P}/admins/notifications/broadcasts`, data: { audience: "CUSTOMERS", channels: ["PUSH"], subject: "s", message: "m" } },
  { name: "messaging.broadcasts", call: () => api.messaging.broadcasts({ page: 1 }), method: "GET", path: `${P}/admins/notifications/broadcasts`, params: { page: "1" }, paged: true },
  { name: "messaging.broadcast", call: () => api.messaging.broadcast(ID), method: "GET", path: `${P}/admins/notifications/broadcasts/${ID}` },
  { name: "messaging.log", call: () => api.messaging.log({ broadcastId: ID }), method: "GET", path: `${P}/admins/notifications/log`, params: { broadcastId: ID }, paged: true },
  // admin section
  { name: "admin.teams", call: () => api.admin.teams({ page: 1 }), method: "GET", path: `${P}/admins/teams`, params: { page: "1" }, paged: true },
  { name: "admin.createTeam", call: () => api.admin.createTeam({ name: "Ops" }), method: "POST", path: `${P}/admins/teams`, data: { name: "Ops" } },
  { name: "admin.auditLogs", call: () => api.admin.auditLogs({ page: 1 }), method: "GET", path: `${P}/audit-logs`, params: { page: "1" }, paged: true },
  { name: "admin.dataLogs", call: () => api.admin.dataLogs({ level: "error" }), method: "GET", path: `${P}/datalogs`, params: { level: "error" }, paged: true },
  { name: "admin.reviews", call: () => api.admin.reviews({}), method: "GET", path: `${P}/reviews`, params: {}, paged: true },
  { name: "adminLogs.auditLogs", call: () => api.adminLogs.auditLogs({ page: 2 }), method: "GET", path: `${P}/audit-logs`, params: { page: "2" }, paged: true },
  { name: "adminLogs.dataLogs", call: () => api.adminLogs.dataLogs({ page: 2 }), method: "GET", path: `${P}/datalogs`, params: { page: "2" }, paged: true },
  // settings
  { name: "settings.countries", call: () => api.settings.countries(), method: "GET", path: `${P}/admin-configs/countries`, params: { limit: "100" } },
  { name: "settings.country", call: () => api.settings.country(ID), method: "GET", path: `${P}/admin-configs/countries/${ID}` },
  { name: "settings.createCountry", call: () => api.settings.createCountry({ name: "NG" }), method: "POST", path: `${P}/admin-configs/countries`, data: { name: "NG" } },
  { name: "settings.updateCountry", call: () => api.settings.updateCountry(ID, { isActive: true }), method: "PATCH", path: `${P}/admin-configs/countries/${ID}`, data: { isActive: true } },
  { name: "settings.states", call: () => api.settings.states(ID), method: "GET", path: `${P}/admin-configs/countries/${ID}/states` },
  { name: "settings.state", call: () => api.settings.state(ID, OTHER), method: "GET", path: `${P}/admin-configs/countries/${ID}/states/${OTHER}` },
  { name: "settings.createState", call: () => api.settings.createState(ID, { name: "Lagos", code: "LA" }), method: "POST", path: `${P}/admin-configs/countries/${ID}/states`, data: [{ name: "Lagos", code: "LA" }] },
  { name: "settings.updateState", call: () => api.settings.updateState(ID, OTHER, { isActive: false }), method: "PATCH", path: `${P}/admin-configs/countries/${ID}/states/${OTHER}`, data: { isActive: false } },
  { name: "settings.deliveryPricing", call: () => api.settings.deliveryPricing(), method: "GET", path: `${P}/admin-configs/delivery-pricing` },
  { name: "settingsExtra.createStates", call: () => api.settingsExtra.createStates(ID, [{ name: "Ogun", code: "OG" }]), method: "POST", path: `${P}/admin-configs/countries/${ID}/states`, data: [{ name: "Ogun", code: "OG" }] },
  // delivery price
  { name: "deliveryPrice.analytics", call: () => api.deliveryPrice.analytics({ from: "a", to: "b" }), method: "GET", path: `${P}/delivery-price/admin/analytics`, params: { from: "a", to: "b" } },
  { name: "deliveryPrice.config", call: () => api.deliveryPrice.config(), method: "GET", path: `${P}/delivery-price/admin/config` },
  { name: "deliveryPrice.updateConfig", call: () => api.deliveryPrice.updateConfig({ fuelPrice: 1 }), method: "PATCH", path: `${P}/delivery-price/admin/config`, data: { fuelPrice: 1 } },
  // coupons
  { name: "coupons.list", call: () => api.coupons.list({ lifecycle: "live" }), method: "GET", path: `${P}/admins/coupons`, params: { lifecycle: "live" }, paged: true },
  { name: "coupons.summary", call: () => api.coupons.summary(), method: "GET", path: `${P}/admins/coupons/summary` },
  { name: "coupons.get", call: () => api.coupons.get(ID), method: "GET", path: `${P}/admins/coupons/${ID}` },
  { name: "coupons.usages", call: () => api.coupons.usages(ID, { page: 1 }), method: "GET", path: `${P}/admins/coupons/${ID}/usages`, params: { page: "1" }, paged: true },
  { name: "coupons.create", call: () => api.coupons.create({ code: "X" } as never), method: "POST", path: `${P}/admins/coupons`, data: { code: "X" } },
  { name: "coupons.update", call: () => api.coupons.update(ID, { isActive: false } as never), method: "PATCH", path: `${P}/admins/coupons/${ID}`, data: { isActive: false } },
  { name: "coupons.deactivate", call: () => api.coupons.deactivate("WELCOME"), method: "PATCH", path: `${P}/admins/coupons/WELCOME/deactivate` },
  { name: "coupons.groups", call: () => api.coupons.groups({ search: "vip" }), method: "GET", path: `${P}/admins/coupons/groups`, params: { search: "vip" }, paged: true },
  { name: "coupons.group", call: () => api.coupons.group(ID), method: "GET", path: `${P}/admins/coupons/groups/${ID}` },
  { name: "coupons.createGroup", call: () => api.coupons.createGroup({ name: "VIP", couponCodes: ["A"] }), method: "POST", path: `${P}/admins/coupons/groups`, data: { name: "VIP", couponCodes: ["A"] } },
  { name: "coupons.updateGroup", call: () => api.coupons.updateGroup(ID, { name: "VIP2" }), method: "PATCH", path: `${P}/admins/coupons/groups/${ID}`, data: { name: "VIP2" } },
  { name: "coupons.addGroupUsers", call: () => api.coupons.addGroupUsers(ID, [OTHER]), method: "PATCH", path: `${P}/admins/coupons/groups/${ID}/add`, data: { userIds: [OTHER] } },
  { name: "coupons.removeGroupUsers", call: () => api.coupons.removeGroupUsers(ID, [OTHER]), method: "PATCH", path: `${P}/admins/coupons/groups/${ID}/remove`, data: { userIds: [OTHER] } },
  // achievements
  { name: "achievements.catalogue", call: () => api.achievements.catalogue(), method: "GET", path: `${P}/admins/achievements` },
  { name: "achievements.summary", call: () => api.achievements.summary(), method: "GET", path: `${P}/admins/achievements/summary` },
  { name: "achievements.unlocks", call: () => api.achievements.unlocks({ key: "FIRST_ORDER" }), method: "GET", path: `${P}/admins/achievements/unlocks`, params: { key: "FIRST_ORDER" }, paged: true },
  { name: "achievements.forUser", call: () => api.achievements.forUser(ID), method: "GET", path: `${P}/admins/achievements/users/${ID}` },
  { name: "achievements.grant", call: () => api.achievements.grant(ID, { key: "FIRST_ORDER" }), method: "POST", path: `${P}/admins/achievements/users/${ID}/grant`, data: { key: "FIRST_ORDER" } },
  { name: "achievements.revoke", call: () => api.achievements.revoke(ID, "FIRST_ORDER"), method: "DELETE", path: `${P}/admins/achievements/users/${ID}/FIRST_ORDER` },
  // issues
  { name: "issues.list", call: () => api.issues.list({ status: "OPEN,IN_REVIEW" }), method: "GET", path: `${P}/admins/issues`, params: { status: "OPEN,IN_REVIEW" }, paged: true },
  { name: "issues.summary", call: () => api.issues.summary(), method: "GET", path: `${P}/admins/issues/summary` },
  { name: "issues.get", call: () => api.issues.get(ID), method: "GET", path: `${P}/admins/issues/${ID}` },
  { name: "issues.forUser", call: () => api.issues.forUser(ID, { page: 1 }), method: "GET", path: `${P}/admins/issues/users/${ID}`, params: { page: "1" }, paged: true },
  { name: "issues.updateStatus", call: () => api.issues.updateStatus(ID, { status: "RESOLVED", resolution: "done" }), method: "PATCH", path: `${P}/admins/issues/${ID}/status`, data: { status: "RESOLVED", resolution: "done" } },
  { name: "issues.assign", call: () => api.issues.assign(ID, OTHER), method: "PATCH", path: `${P}/admins/issues/${ID}/assign`, data: { adminId: OTHER } },
  { name: "issues.updatePriority", call: () => api.issues.updatePriority(ID, "HIGH"), method: "PATCH", path: `${P}/admins/issues/${ID}/priority`, data: { priority: "HIGH" } },
  { name: "issues.addNote", call: () => api.issues.addNote(ID, "hi"), method: "POST", path: `${P}/admins/issues/${ID}/notes`, data: { note: "hi" } },
  // announcements
  { name: "announcements.list", call: () => api.announcements.list({ status: "ACTIVE", audience: "RIDERS" }), method: "GET", path: `${P}/admins/announcements`, params: { status: "ACTIVE", audience: "RIDERS" }, paged: true },
  { name: "announcements.summary", call: () => api.announcements.summary(), method: "GET", path: `${P}/admins/announcements/summary` },
  { name: "announcements.screens", call: () => api.announcements.screens(), method: "GET", path: `${P}/admins/announcements/screens` },
  { name: "announcements.get", call: () => api.announcements.get(ID), method: "GET", path: `${P}/admins/announcements/${ID}` },
  { name: "announcements.receipts", call: () => api.announcements.receipts(ID, { state: "pending" }), method: "GET", path: `${P}/admins/announcements/${ID}/receipts`, params: { state: "pending" }, paged: true },
  { name: "announcements.create", call: () => api.announcements.create({ title: "t", body: "b", audience: api.AnnouncementAudience.CUSTOMERS }), method: "POST", path: `${P}/admins/announcements`, data: { title: "t", body: "b", audience: "CUSTOMERS" } },
  { name: "announcements.update", call: () => api.announcements.update(ID, { title: "t2" }), method: "PATCH", path: `${P}/admins/announcements/${ID}`, data: { title: "t2" } },
  { name: "announcements.setStatus", call: () => api.announcements.setStatus(ID, api.AnnouncementStatus.ACTIVE), method: "PATCH", path: `${P}/admins/announcements/${ID}/status`, data: { status: "ACTIVE" } },
  { name: "announcements.remove", call: () => api.announcements.remove(ID), method: "DELETE", path: `${P}/admins/announcements/${ID}` },
];

describe("api namespaces → generated client routes", () => {
  it.each(CASES.map((c) => [c.name, c] as const))("%s", async (_name, c) => {
    const result = await c.call();

    expect(captured).toHaveLength(1);
    const [req] = captured;
    expect(req.method).toBe(c.method);
    expect(req.url).toBe(c.path);
    if (c.params !== undefined) expect(req.params ?? {}).toEqual(c.params);
    else expect(req.params ?? {}).toEqual({});
    if (c.data !== undefined) expect(req.data).toEqual(c.data);
    else expect(req.data).toBeUndefined();
    if (c.paged) expect(result).toEqual({ items: PAGE.results, total: 1, page: 1, limit: 20, totalPages: 1 });
    else expect(result).toEqual(PAGE);
  });

  it("every namespace function has a route case", () => {
    const covered = new Set(CASES.map((c) => c.name));
    const missing: string[] = [];
    for (const [ns, value] of Object.entries(api)) {
      if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      for (const [fn, member] of Object.entries(value as Record<string, unknown>)) {
        if (typeof member === "function" && !covered.has(`${ns}.${fn}`)) missing.push(`${ns}.${fn}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("route cases only name functions that exist", () => {
    const unknown = CASES.filter((c) => {
      const [ns, fn] = c.name.split(".");
      return typeof (api as unknown as Record<string, Record<string, unknown>>)[ns]?.[fn] !== "function";
    }).map((c) => c.name);
    expect(unknown).toEqual([]);
  });

  it("sends the bearer token from the cookie", async () => {
    let auth: unknown;
    const previous = apiService.instance.defaults.adapter;
    apiService.instance.defaults.adapter = async (config: AxiosRequestConfig) => {
      auth = config.headers?.Authorization;
      return { data: {}, status: 200, statusText: "OK", headers: {}, config: config as never };
    };
    apiService.setSecurityData({ token: "abc" });
    try {
      await api.me.get();
    } finally {
      apiService.setSecurityData(null);
      apiService.instance.defaults.adapter = previous;
    }
    expect(auth).toBe("Bearer abc");
  });
});

describe("envelopes", () => {
  it("toPaged maps the core page and tolerates nothing", () => {
    expect(api.toPaged(PAGE)).toEqual({ items: PAGE.results, total: 1, page: 1, limit: 20, totalPages: 1 });
    expect(api.toPaged(undefined)).toEqual({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  });

  it("params drops empty values and stringifies the rest", () => {
    expect(api.params({ a: 1, b: true, c: "", d: null, e: undefined, f: "x" })).toEqual({ a: "1", b: "true", f: "x" });
    expect(api.params()).toEqual({});
  });

  it("asArray accepts a bare array or a page", () => {
    expect(api.asArray([1, 2])).toEqual([1, 2]);
    expect(api.asArray({ ...PAGE, results: [3] })).toEqual([3]);
    expect(api.asArray(undefined)).toEqual([]);
  });
});
