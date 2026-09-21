/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CountryConfigSchemaDto {
  exchangeRate: number;
  minimumOfferPercentage: number;
  /** @default 40 */
  maxRiderSurgePercentage?: number;
  userWithdrawalLimits: {
    /** @default 0 */
    minimumAmount?: number;
    maximumAmount?: number;
  };
  businessWithdrawalLimits: {
    /** @default 0 */
    minimumAmount?: number;
    maximumAmount?: number;
  };
  /** @default false */
  referAndEarn?: boolean;
  /** @default 0 */
  referralEarnAmount?: number;
  /** @default 1 */
  ordersRequiredBeforeEarn?: number;
}

export interface Country {
  name: string;
  code: string;
  currencyName: string;
  currencyCode: string;
  config: CountryConfigSchemaDto;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ListCountryResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: Country[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface AddCountryDto {
  name: string;
  /**
   * @minLength 2
   * @maxLength 3
   */
  code: string;
  /**
   * @minLength 3
   * @maxLength 3
   */
  currencyCode: string;
  currencyName: string;
}

export interface WithdrawalLimitsDto {
  minimumAmount: number;
  maximumAmount: number;
}

export interface CountryConfigDto {
  /** Exchange rate for the country */
  exchangeRate?: number;
  /**
   * Minimum Percentage value
   * @min 0
   * @max 100
   */
  minimumOfferPercentage?: number;
  /**
   * Max percentage above quote a rider counter-offer may go
   * @min 0
   * @max 100
   */
  maxRiderSurgePercentage?: number;
  /** user withdrawal limits */
  userWithdrawalLimits?: WithdrawalLimitsDto;
  /** business withdrawal limits */
  businessWithdrawalLimits?: WithdrawalLimitsDto;
  /** Whether refer-and-earn is enabled; when true referees earn when conditions are met */
  referAndEarn?: boolean;
  /**
   * Amount to credit referee when referral condition is met (smallest currency unit)
   * @min 0
   */
  referralEarnAmount?: number;
  /**
   * Completed orders required before referee earns. 0 = earn on referred user signup
   * @min 0
   */
  ordersRequiredBeforeEarn?: number;
}

export interface UpdateCountryDto {
  /**
   * Name of the country
   * @example "Nigeria"
   */
  name: string;
  /** Configuration for the country */
  config?: CountryConfigDto;
}

export interface StateDto {
  name: string;
  /**
   * @minLength 2
   * @maxLength 3
   */
  code: string;
}

export interface State {
  countryId: string;
  name: string;
  code: string;
  config: {
    basePricePerKm?: number;
    baseFuelPrice?: number;
    currentFuelPrice?: number;
    /** @default 0 */
    serviceCharge?: number;
    /** @default 0 */
    percentageCharge?: number;
    /** @default 2000000 */
    minimumOrderPrice?: number;
    /** @default 300000 */
    distanceTaperThreshold?: number;
    /** @default 18000 */
    distanceTaperBeyondRate?: number;
    /** @default 5 */
    maxRidersPerQuery?: number;
    /** @default 1 */
    maxActiveOrders?: number;
    /** @default 20 */
    maxDistanceRadius?: number;
    /** @default false */
    queueOrderByDefault?: boolean;
    /** @default false */
    locationUpdateEnabled?: boolean;
    /** @default 500 */
    locationUpdateFreeRadiusMeters?: number;
    /** @default 1 */
    locationUpdateMaxPerLocation?: number;
    /** @default 2 */
    locationUpdateMaxDeclinesPerLocation?: number;
    /** @default 240 */
    locationUpdateRiderAcceptTimeoutSec?: number;
    /** @default false */
    arrivalGateEnabled?: boolean;
    /** @default 40 */
    arrivalRadiusMeters?: number;
    /** @default true */
    etaEnabled?: boolean;
    /** @default 25 */
    etaAverageSpeedKmh?: number;
  };
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ListStateResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: State[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface StateConfigDto {
  /** Price per KM as a number */
  basePricePerKm: number;
  /** Base fuel price */
  baseFuelPrice: number;
  /** Current fuel price as a number */
  currentFuelPrice: number;
  /**
   * Percentage charge as a number
   * @default 0
   */
  percentageCharge: number;
  /**
   * Service charge for orders
   * @default 0
   */
  serviceCharge: number;
  /**
   * Minimum order orice
   * @default 200000
   */
  minimumOrderPrice: number;
  /**
   * Distance taper: raw price (sub-units) up to which the full per-km rate applies
   * @default 300000
   */
  distanceTaperThreshold?: number;
  /**
   * Distance taper: flat per-km rate (sub-units) charged beyond the threshold
   * @default 18000
   */
  distanceTaperBeyondRate?: number;
  /**
   * Maximum riders per query
   * @default 5
   */
  maxRidersPerQuery: number;
  /**
   * Maximum active rider orders
   * @default 1
   */
  maxActiveOrders: number;
  /**
   * Maximum distance radius in kilometers
   * @default 20
   */
  maxDistanceRadius: number;
  /**
   * Field to queue orders by default
   * @default false
   */
  queueOrderByDefault: boolean;
  /**
   * Master toggle for mid-order location updates
   * @default false
   */
  locationUpdateEnabled?: boolean;
  /**
   * Free route-distance delta (metres) for a location edit
   * @default 500
   */
  locationUpdateFreeRadiusMeters?: number;
  /**
   * Max accepted location updates per stop
   * @default 1
   */
  locationUpdateMaxPerLocation?: number;
  /**
   * Max rider-declined location updates before further requests are blocked for a stop
   * @default 2
   */
  locationUpdateMaxDeclinesPerLocation?: number;
  /**
   * Seconds a rider has to accept a location change
   * @default 240
   */
  locationUpdateRiderAcceptTimeoutSec?: number;
  /**
   * Master toggle for the ARRIVED proximity gate + ETA
   * @default false
   */
  arrivalGateEnabled?: boolean;
  /**
   * Radius (metres) to mark a location ARRIVED
   * @default 40
   */
  arrivalRadiusMeters?: number;
  /**
   * Whether to surface estimated pickup/dropoff times
   * @default true
   */
  etaEnabled?: boolean;
  /**
   * Average speed (km/h) for the ETA estimate
   * @default 25
   */
  etaAverageSpeedKmh?: number;
}

export interface UpdateStateDto {
  /**
   * Name of the state
   * @example "California"
   */
  name: string;
  /** Configuration for the state */
  config?: StateConfigDto;
}

export interface RangeDto {
  /** @format date-time */
  from: string;
  /** @format date-time */
  to: string;
}

export interface OrderWindowDto {
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
  byStatus: object;
  byType: object;
  byPaymentStatus: object;
}

export interface OverviewResponseDto {
  range: RangeDto;
  current: OrderWindowDto;
  previous: OrderWindowDto;
  users: object;
  vehicles: object;
  wallets: object;
  transactions: object;
  live: object;
}

export interface SeriesPointDto {
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
}

export interface SeriesResponseDto {
  range: RangeDto;
  bucket: string;
  points: SeriesPointDto[];
}

export interface TopRiderDto {
  riderId: string;
  rider: object;
  deliveries: number;
  cancelled: number;
  riderFees: number;
  volume: number;
  rating: number | null;
  reviews: number;
}

export interface PeakCellDto {
  day: number;
  hour: number;
  count: number;
  volume: number;
}

export interface PeakHoursResponseDto {
  range: RangeDto;
  cells: PeakCellDto[];
}

export interface ChargeWindowDto {
  /** Commission taken from rider earnings */
  riderCommission: number;
  riderCommissionCount: number;
  /** Service charge paid by customers */
  serviceCharge: number;
  serviceChargeCount: number;
  /** riderCommission + serviceCharge */
  total: number;
  /** Rider earning rows (trips paid out) in the window */
  trips: number;
  /** Trips where a commission was actually taken */
  tripsCharged: number;
  ridersCharged: number;
  /** Average commission per charged trip */
  averageCommission: number;
}

export interface ChargesResponseDto {
  range: RangeDto;
  current: ChargeWindowDto;
  previous: ChargeWindowDto;
}

export interface PageableType {
  nextPage?: number;
  previousPage?: number;
  currentPage: number;
  results: any[][];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface AttentionResponseDto {
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
  /** Issue reports still OPEN or IN_REVIEW */
  issuesOpen: number;
  /** Open reports nobody has picked up */
  issuesUnassigned: number;
}

export interface UserOverviewResponseDto {
  range: RangeDto;
  user: object;
  wallet: object | null;
  asCustomer: object;
  asRider: object;
  transactions: object;
  reviews: object;
  vehicles: object[];
  business: object | null;
}

export interface InsightsRangeDto {
  /** @format date-time */
  from: string;
  /** @format date-time */
  to: string;
}

export interface EarningsSummaryDto {
  /** Order earnings after commission, sub-units */
  net: number;
  /** Order earnings before commission, sub-units */
  gross: number;
  /** Platform commission taken on those earnings, sub-units */
  charges: number;
  /** Referral bonuses credited in the window, sub-units */
  referralBonus: number;
  /** Paid deliveries in the window */
  deliveries: number;
  /** net / deliveries, sub-units */
  avgPerDelivery: number;
  /** net for the previous window of the same length */
  previousNet: number;
  /** % change of net vs the previous window, one decimal */
  deltaPct: number;
}

export interface RatingSummaryDto {
  average: number;
  count: number;
  /** Counts for 1★..5★ */
  distribution: number[];
}

export interface BidStatsDto {
  total: number;
  won: number;
  /** % of bids accepted, one decimal */
  winRate: number;
}

export interface PerformanceSummaryDto {
  orders: number;
  completed: number;
  cancelled: number;
  /** % of orders completed, one decimal */
  completionRate: number;
  rating: RatingSummaryDto;
  /** Average minutes from starting a pickup leg to arriving */
  avgPickupMins: number;
  /** Average minutes from starting an order to completing it */
  avgDeliveryMins: number;
  /** Sum of completed legs, km (one decimal) */
  distanceKm: number;
  bids: BidStatsDto;
}

export interface ActivitySummaryDto {
  /** Mon..Sun of the current Lagos week; true = ≥1 completed delivery */
  activeDays: boolean[];
  /** Consecutive days (ending today or yesterday) with ≥1 completed delivery */
  streakDays: number;
}

export interface GoalSummaryDto {
  /** Rider-set weekly net target, sub-units */
  weeklyTarget?: number;
  /** Net earned since Monday, sub-units */
  weekNet: number;
  /** 0-100, capped */
  progressPct: number;
}

export interface InsightsOverviewResponseDto {
  range: InsightsRangeDto;
  earnings: EarningsSummaryDto;
  performance: PerformanceSummaryDto;
  activity: ActivitySummaryDto;
  goal: GoalSummaryDto;
}

export interface EarningsByTypeDto {
  single: number;
  batch: number;
  bulk: number;
}

export interface EarningsSeriesPointDto {
  /** ISO start of the bucket (Lagos time) */
  bucket: string;
  net: number;
  gross: number;
  deliveries: number;
  /** Gross rider fee by order type */
  byType: EarningsByTypeDto;
}

export interface EarningsSeriesResponseDto {
  range: InsightsRangeDto;
  bucket: "day" | "week" | "month";
  points: EarningsSeriesPointDto[];
  /** Gross rider fee by order type over the whole window */
  byType: EarningsByTypeDto;
}

export interface RiderReviewDto {
  _id: string;
  rating: number;
  comment: string;
  orderNumber?: string;
  /** Customer first name only */
  customerName?: string;
  /** @format date-time */
  createdAt: string;
}

export interface RiderReviewsResponseDto {
  results: RiderReviewDto[];
  totalRecords: number;
  page: number;
  limit: number;
  summary: RatingSummaryDto;
}

export interface PeakHourCellDto {
  /** 0 = Sunday … 6 = Saturday (Lagos time) */
  day: number;
  /** 0-23 (Lagos time) */
  hour: number;
  count: number;
}

export interface HotZoneDto {
  latitude: number;
  longitude: number;
  /** Pickups created in the window at this ~100 m cell */
  weight: number;
}

export interface DemandResponseDto {
  range: InsightsRangeDto;
  /** Radius around the rider the data covers, km */
  radiusKm: number;
  /** False when the rider has no known location yet */
  hasLocation: boolean;
  peakHours: PeakHourCellDto[];
  hotZones: HotZoneDto[];
}

export interface MapPointDto {
  latitude: number;
  longitude: number;
  type: "PICKUP" | "DROPOFF";
}

export interface MyMapResponseDto {
  range: InsightsRangeDto;
  points: MapPointDto[];
}

export interface LeaderboardEntryDto {
  riderId: string;
  /** "Chidi O." — first name and last initial */
  name: string;
  photo?: string;
  deliveries: number;
  rating: number;
  rank: number;
  isMe: boolean;
}

export interface LeaderboardMeDto {
  /** 0 when the rider has no completed delivery in the window */
  rank: number;
  deliveries: number;
  /** Riders ranked in this scope and window */
  totalRanked: number;
}

export interface LeaderboardResponseDto {
  range: InsightsRangeDto;
  scope: "state" | "country";
  results: LeaderboardEntryDto[];
  me: LeaderboardMeDto;
}

export interface AchievementDto {
  key: string;
  title: string;
  description: string;
  /** Icon name the client maps to an asset */
  icon: string;
  target: number;
  /** Current value towards target (capped at target once unlocked) */
  progress: number;
  /** @format date-time */
  unlockedAt?: string;
  /** Unlocked and not yet acknowledged — show the celebration */
  isNew: boolean;
}

export interface AchievementsResponseDto {
  results: AchievementDto[];
  unlockedCount: number;
}

export enum InsightsRangePreset {
  Today = "today",
  Week = "week",
  Month = "month",
  LastMonth = "last_month",
  Year = "year",
  All = "all",
}

export interface InsightsWindowDto {
  /** @format date-time */
  from: string;
  /** @format date-time */
  to: string;
}

export interface DeliveriesByTypeDto {
  single: number;
  batch: number;
  bulk: number;
}

export interface DeliveriesSummaryDto {
  /** Completed deliveries in the window */
  completed: number;
  /** Orders cancelled in the window (by anyone) */
  cancelled: number;
  /** Orders still in progress right now (not range-bound) */
  active: number;
  byType: DeliveriesByTypeDto;
  /** Completed deliveries in the previous window of the same length */
  previousCompleted: number;
  /** Percent change vs the previous window, one decimal */
  deltaPct: number;
}

export interface SpendSummaryDto {
  /** What the customer paid (sum of totalAmountPayable on paid orders) */
  total: number;
  /** Delivery fees portion (negotiated with riders) */
  deliveryFees: number;
  /** Platform service charges portion */
  serviceCharges: number;
  /** Saved through coupons/discounts */
  saved: number;
  /** Refunded back to the wallet in the window */
  refunded: number;
  /** Average paid per delivery */
  avgPerDelivery: number;
  previousTotal: number;
  deltaPct: number;
  /** @example "NGN" */
  currency: string;
}

export interface TimingSummaryDto {
  /** Average minutes from order creation to a rider accepting */
  avgAcceptMins: number;
  /** Average minutes from ride start to completion */
  avgDeliveryMins: number;
  /** Kilometres covered on completed deliveries */
  distanceKm: number;
}

export interface ActivityStreakDto {
  /** Consecutive calendar months (Lagos time) with at least one completed delivery, ending this month */
  months: number;
  /** @format date-time */
  lastDeliveryAt: string | null;
  /**
   * Account creation date
   * @format date-time
   */
  memberSince: string | null;
  /** Lifetime completed deliveries */
  lifetimeDeliveries: number;
}

export interface PlaceDto {
  type: "PICKUP" | "DROPOFF";
  address: string;
  latitude: number;
  longitude: number;
  /** Times this address was used */
  count: number;
  /** @format date-time */
  lastUsedAt: string;
}

export interface CustomerInsightsOverviewResponseDto {
  range: InsightsWindowDto;
  deliveries: DeliveriesSummaryDto;
  spend: SpendSummaryDto;
  timing: TimingSummaryDto;
  activity: ActivityStreakDto;
  /** Top three places in the window */
  topPlaces: PlaceDto[];
}

export interface InsightsSeriesPointDto {
  /** Bucket start, ISO */
  bucket: string;
  deliveries: number;
  /** Sub-units */
  spend: number;
}

export interface CustomerInsightsSeriesResponseDto {
  range: InsightsWindowDto;
  bucket: "day" | "week" | "month";
  points: InsightsSeriesPointDto[];
  /** @example "NGN" */
  currency: string;
}

export interface CustomerInsightsPlacesResponseDto {
  pickups: PlaceDto[];
  dropoffs: PlaceDto[];
}

export interface RecapHighlightDto {
  /** Stable key the app maps to an icon/copy, e.g. BUSIEST_DAY */
  key: string;
  title: string;
  value: string;
}

export interface CustomerInsightsRecapResponseDto {
  range: InsightsWindowDto;
  deliveries: DeliveriesSummaryDto;
  spend: SpendSummaryDto;
  timing: TimingSummaryDto;
  activity: ActivityStreakDto;
  /** Top three places in the window */
  topPlaces: PlaceDto[];
  /** @example "2026-09" */
  month: string;
  highlights: RecapHighlightDto[];
  /** True when the month has no activity at all */
  empty?: boolean;
}

export enum AchievementCategory {
  SINGLE = "SINGLE",
  BATCH = "BATCH",
  BULK = "BULK",
  WALLET = "WALLET",
  REFERRAL = "REFERRAL",
  SPECIAL = "SPECIAL",
}

export interface AchievementRewardDto {
  /** Percentage off the next delivery */
  percent: number;
  /** Cap in sub-units */
  maxDiscount: number;
  validityDays: number;
  /** Coupon code once issued */
  couponCode?: string;
  /** @format date-time */
  expiresAt?: string;
}

export interface CustomerAchievementDto {
  key: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string;
  target: number;
  /** Progress towards target, clamped */
  progress: number;
  /** Unit for the progress line, e.g. "single orders" */
  unit: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
  /** @format date-time */
  unlockedAt?: string;
  /** Unlocked but the celebration has not been shown yet */
  isNew: boolean;
  reward: AchievementRewardDto;
}

export interface CustomerAchievementsResponseDto {
  results: CustomerAchievementDto[];
  unlockedCount: number;
  /** Keys unlocked on this request — drive the celebration modal */
  newlyUnlocked: string[];
}

export interface AcknowledgeAchievementResponseDto {
  acknowledged: boolean;
}

export interface AdminAchievementDefinitionDto {
  key: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string;
  target: number;
  unit: string;
  tier: number;
  /** Reward percentage for this tier */
  rewardPercent: number;
  /** Customers who have unlocked it */
  unlockedCount: number;
  /** Unlocks in the last 30 days */
  unlocked30d: number;
  /** Reward coupons issued */
  rewardsIssued: number;
  /** Reward coupons redeemed */
  rewardsRedeemed: number;
  /** Discount granted through this badge, in sub-units */
  discountTotal: number;
}

export interface AchievementsSummaryResponseDto {
  badges: number;
  /** Customers with at least one badge */
  customersWithBadges: number;
  /** Badges unlocked, all time */
  unlocksTotal: number;
  /** Badges unlocked in the last 30 days */
  unlocks30d: number;
  rewardsIssued: number;
  rewardsRedeemed: number;
  /** Issued, not redeemed, still valid */
  rewardsOutstanding: number;
  /** Discount granted through badge rewards, in sub-units */
  discountTotal: number;
  /** Reward percentages by tier */
  rewardPercentByTier: object;
  /** Cap on a reward discount, in sub-units */
  rewardMaxDiscount: number;
  rewardValidityDays: number;
  /** Unlocks per day, last 30 days: {date, count} */
  daily: object[];
}

export interface AdminAchievementUnlockDto {
  userId: string;
  key: string;
  title: string;
  category: AchievementCategory;
  /** @format date-time */
  unlockedAt: string;
  /** @format date-time */
  acknowledgedAt?: string;
  couponCode?: string;
  /** @format date-time */
  couponExpiresAt?: string;
  rewardState?: "REDEEMED" | "ACTIVE" | "EXPIRED" | "NONE";
  /** Discount the reward gave, in sub-units, once redeemed */
  discountAmount?: number;
  user?: object;
}

export interface ListAchievementUnlocksResponseDto {
  nextPage?: number;
  previousPage?: number;
  currentPage: number;
  results: AdminAchievementUnlockDto[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface AdminCustomerAchievementsResponseDto {
  results: CustomerAchievementDto[];
  unlockedCount: number;
  /** The lifetime stats every badge is judged on */
  stats: object;
}

export interface GrantAchievementRequestDto {
  /** Badge key from the catalogue */
  key: string;
  /**
   * Why it was granted by hand (audit trail)
   * @maxLength 500
   */
  reason?: string;
}

/** Required for customer/rider/business logins. Optional for the admin console: any platform staff role signs in. */
export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
  PLATFORM_RIDER = "PLATFORM_RIDER",
  PLATFORM_OPERATION = "PLATFORM_OPERATION",
  PLATFORM_FINANCE = "PLATFORM_FINANCE",
  PLATFORM_BUSINESS = "PLATFORM_BUSINESS",
  PLATFORM_MANAGER = "PLATFORM_MANAGER",
  DEVELOPER = "DEVELOPER",
  BUSINESS_ADMIN = "BUSINESS_ADMIN",
  BUSINESS_USER = "BUSINESS_USER",
  BUSINESS_RIDER = "BUSINESS_RIDER",
}

export interface LoginRequestDto {
  identifier: string;
  /** @minLength 8 */
  password: string;
  /** Required for customer/rider/business logins. Optional for the admin console: any platform staff role signs in. */
  role?: Role;
  /** @default "USER" */
  accessType?: string;
}

export interface AuthTokenResponseDto {
  accessToken: string;
  expiryDurationSeconds: number;
  refreshToken: string;
}

export interface VerifyPhoneRequestDto {
  phone: string;
  /** @minLength 4 */
  code: string;
  /** @minLength 2 */
  countryCode?: string;
}

export interface VerifyEmailRequestDto {
  email: string;
  /** @minLength 4 */
  code: string;
  /** @minLength 2 */
  countryCode?: string;
}

export interface TokenRequestDto {
  identifier: string;
  /** @minLength 2 */
  countryCode?: string;
}

export interface MessageResponseDto {
  message: string;
}

export interface ResetPasswordRequestDto {
  identifier: string;
  /** @minLength 4 */
  code: string;
  /** @minLength 8 */
  password: string;
  /** @minLength 2 */
  countryCode?: string;
}

export interface CheckTokenResponseDto {
  status: boolean;
}

export interface GoogleSignInRequestDto {
  idToken: string;
}

export interface CountryDto {
  name: string;
  /**
   * @minLength 2
   * @maxLength 3
   */
  code: string;
  /**
   * @minLength 3
   * @maxLength 3
   */
  currency: string;
}

export enum UserSignUpRoles {
  USER = "USER",
  PLATFORM_RIDER = "PLATFORM_RIDER",
  DEVELOPER = "DEVELOPER",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export interface CreateUserRequestDto {
  /** @minLength 3 */
  firstname: string;
  /** @minLength 3 */
  lastname: string;
  email: string;
  phone: string;
  /** @minLength 3 */
  password: string;
  country: CountryDto;
  /** @minLength 3 */
  role: UserSignUpRoles;
  photo?: string;
  businessId?: string;
  gender?: Gender;
  referralCode?: string;
  /** @default false */
  isVendor?: boolean;
  businessName?: string;
}

export interface AddressDetailDto {
  country: string;
  state: string;
  lga: string;
  name: string;
  latitude: number;
  longitude: number;
  branchName?: string;
  landmark?: string;
}

export interface AddressesDetailDto {
  home?: AddressDetailDto;
  work?: AddressDetailDto;
}

export interface PreferenceDetailsDto {
  onboarding: {
    /** @default true */
    priceSuggestion?: boolean;
    /** @default 0 */
    minus?: number;
    /** @default 0 */
    plus?: number;
  };
  notification: {
    /** @default true */
    email?: boolean;
    /** @default true */
    push?: boolean;
    /** @default true */
    sms?: boolean;
  };
  bidding: {
    /** @default true */
    priceSuggestion?: boolean;
    /** @default 0 */
    minus?: number;
    /** @default 0 */
    plus?: number;
  };
  orderRequestNotification: {
    /** @default true */
    vibration?: boolean;
    /** @default true */
    sound?: boolean;
  };
  goals: {
    weeklyEarningsTarget?: number;
  };
}

export interface BusinessDetailsSchemaDto {
  /** @format date-time */
  registeredDate: string;
  registeredAddress: string;
  registrationNumber: string;
  proofOfBusinessAddress: string;
}

export interface CountrySchemaDto {
  name: string;
  code: string;
  currency: string;
}

export interface UserDetailsSchemaDto {
  firstname: string;
  middlename: string;
  lastname: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  bvn: string;
  nin: string;
  address: string;
  nationality: CountrySchemaDto;
  idCardType: string;
  idNumber: string;
  idCardDoc: string;
  /** @format date-time */
  idExpiryDate: string;
  /** @format date-time */
  idIssuedDate: string;
}

export interface KYCDetailsSchemaDto {
  businessDetails: BusinessDetailsSchemaDto;
  managerDetails: UserDetailsSchemaDto;
  /** @default "PENDING" */
  status: "APPROVE" | "DISAPPROVE" | "SUSPENDED" | "SUBMITTED" | "PENDING";
  statusComment: string;
}

export interface ReviewDetailsDto {
  average?: number;
  count?: number;
}

export interface User {
  /**
   * @minLength 3
   * @maxLength 256
   */
  firstname: string;
  /**
   * @minLength 3
   * @maxLength 256
   */
  lastname: string;
  /**
   * @minLength 3
   * @maxLength 256
   */
  middlename?: string;
  email: string;
  phone: string;
  googleId?: string;
  businessId?: string;
  addresses?: AddressesDetailDto;
  /** @default false */
  phoneVerified: boolean;
  pendingPhone?: string;
  /** @default false */
  emailVerified: boolean;
  gender?: string;
  dob?: string;
  nin?: string;
  /** @default false */
  ninVerified: boolean;
  voterCard?: string;
  /** @default false */
  voterCardVerified: boolean;
  driversLicense?: string;
  driversLicenseDoc?: string;
  /** @default "PENDING" */
  driversLicenseVerified: "APPROVE" | "DISAPPROVE" | "SUSPENDED" | "SUBMITTED" | "PENDING";
  driversLicenseVerifiedComment?: string;
  /** @default "USER" */
  accessType: "USER" | "ADMIN";
  proofOfAddress?: string;
  /** @default false */
  proofOfAddressVerified: boolean;
  /** @default false */
  isOnline: boolean;
  /** @default "ACTIVE" */
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";
  roles: (
    | "USER"
    | "ADMIN"
    | "SUPER_ADMIN"
    | "PLATFORM_ADMIN"
    | "PLATFORM_RIDER"
    | "PLATFORM_OPERATION"
    | "PLATFORM_FINANCE"
    | "PLATFORM_BUSINESS"
    | "PLATFORM_MANAGER"
    | "DEVELOPER"
    | "BUSINESS_ADMIN"
    | "BUSINESS_USER"
    | "BUSINESS_RIDER"
  )[];
  referredBy?: string;
  referralCode?: string;
  preferences?: PreferenceDetailsDto;
  achievements?: object;
  /** @default false */
  dispatchPaused?: boolean;
  /** @format date-time */
  dispatchPausedAt?: string;
  dispatchPausedReason?: string;
  adminPreferences?: object;
  photo?: string;
  country: {
    name?: string;
    code?: string;
    currency?: string;
  };
  state: {
    name?: string;
    code?: string;
  };
  city: {
    name?: string;
    code?: string;
  };
  location: {
    /** @default "Point" */
    type?: string;
    coordinates?: number[];
  };
  pushToken?: string;
  /** @default 0 */
  supportUnreadCount: number;
  /** @default false */
  isDeleted: boolean;
  /** @default false */
  isRider: boolean;
  /** @default false */
  isVendor: boolean;
  /** @format date-time */
  lastLoginDate?: string;
  recipientCode?: string;
  /** @format date-time */
  emailVerifiedAt?: string;
  /** @format date-time */
  phoneVerifiedAt?: string;
  /** @format date-time */
  passwordUpdatedAt?: string;
  business?: Business;
  reviews?: ReviewDetailsDto;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  deletedAt?: string;
  /** @format date-time */
  walletTermsAcknowledgedAt?: string;
}

export interface Vehicle {
  name: string;
  plateNumber: string;
  color?: string;
  model: string;
  make: string;
  engineNumber: string;
  chasisNumber: string;
  businessId?: string;
  userId?: string;
  photos?: string[];
  /** @default "PENDING" */
  status: "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  statusComment?: string;
  /** @format date-time */
  verifiedAt?: string;
  /** @default false */
  isDeleted: boolean;
  /** @format date-time */
  deletedAt?: string;
  business?: Business;
  user?: User;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface Business {
  name: string;
  userId: string;
  branchName?: string;
  photo?: string;
  phone: string;
  businessHandle?: string;
  email: string;
  pushToken?: string;
  /** @default true */
  isActive: boolean;
  address: {
    country?: string;
    state?: string;
    lga?: string;
    name?: string;
    latitude?: number;
    longitude?: number;
    branchName?: string;
    landmark?: string;
  };
  website?: string;
  webhook?: string;
  kycDetails?: KYCDetailsSchemaDto;
  location: {
    /** @default "Point" */
    type?: string;
    coordinates?: number[];
  };
  users?: string[];
  vehicles: Vehicle[];
  aboutMe?: string;
  country: {
    name?: string;
    code?: string;
    currency?: string;
  };
  state: {
    name?: string;
    code?: string;
  };
  city: {
    name?: string;
    code?: string;
  };
  /** @default "PARTNER" */
  type: "BANKING" | "CLIENT" | "PARTNER" | "SUPPLIER" | "MERCHANT" | "AGENCY_BANKING" | "PICKRIDERS_AGENT";
  /** @default false */
  isDeleted: boolean;
  /** @format date-time */
  deletedAt?: string;
  /** @default "ON_REQUEST" */
  businessType: "AUTO_PILOT" | "ON_REQUEST";
  preferences?: PreferenceDetailsDto;
  profileUser?: object;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface UpdateProfileRequestDto {
  firstname?: string;
  lastname?: string;
  pushToken?: string;
  /** Referral code of another user (e.g. for Google sign-in users who skipped registration). Same logic as registration. */
  referralCode?: string;
  /** Whether the user is a vendor */
  isVendor?: boolean;
}

export interface UpdateLocationRequestDto {
  longitude: number;
  latitude: number;
  state?: string;
  stateCode?: string;
}

export interface UpdatePhotoRequestDto {
  photo: string;
}

export interface UpdatedPhotoResponseDto {
  photo: string;
}

export interface AddressDto {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  state?: string;
  lga?: string;
  branchName?: string;
  landmark?: string;
}

export interface UpdateAddressesRequestDto {
  home?: AddressDto;
  work?: AddressDto;
}

export interface UserKYCDetailDto {
  firstname: string;
  lastname: string;
  bankName: string;
  accountNumber: string;
}

export interface ChangePasswordRequestDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export enum EntityType {
  TEAM = "TEAM",
  USER = "USER",
  BUSINESS = "BUSINESS",
}

export interface Wallet {
  entityId: string;
  name: string;
  entityType: EntityType;
  currency: string;
  countryCode: string;
  status: "ACTIVE" | "SUSPENDED" | "DISABLED";
  /** @default 0 */
  balance: number;
  /** @default false */
  isDefault: boolean;
  settlement: {
    bankName?: string;
    bankCode?: string;
    accountName?: string;
    accountNumber?: string;
    recipientCode?: string;
    /** @default "nuban" */
    recipientType?: "nuban" | "ghipss" | "mobile_money";
    /** @default false */
    isVerified?: boolean;
  };
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface WalletListResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: Wallet[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export enum PaymentProvider {
  PAYSTACK = "PAYSTACK",
  FLUTTERWAVE = "FLUTTERWAVE",
}

export interface FundWalletRequestDto {
  /** @min 100 */
  amount: number;
  provider: PaymentProvider;
}

export interface FundWalletResponseDto {
  /**
   * Field to determine if the process failed or was successful
   * @example true
   */
  success: boolean;
  /**
   * The payment link generated from the payment gateway provider
   * @example "https://example.com"
   */
  payment_url: string;
  /**
   * The unique string bind to this transaction from the payment gateway provider
   * @example "0abcde12345"
   */
  reference?: string;
}

export interface CancelFundWalletRequestDto {
  /**
   * The reference returned when the wallet funding was initialized
   * @example "0abcde12345"
   */
  reference: string;
}

export interface CancelFundWalletResponseDto {
  /**
   * True when the pending deposit was cancelled; false when the payment had actually gone through
   * @example true
   */
  success: boolean;
  /**
   * Outcome of the cancel: 'cancelled' (deposit voided) or 'paid' (payment completed, left for the webhook)
   * @example "cancelled"
   */
  status: string;
}

export interface UpdateSettlementAccountRequestDto {
  bankName: string;
  bankCode: string;
  /**
   * @minLength 10
   * @maxLength 15
   */
  accountNumber: string;
}

export interface InitiateWithdrawalRequestDto {
  /** @min 10000 */
  amount: number;
}

export interface Coupon {
  code: string;
  name?: string;
  description?: string;
  currency: string;
  type: string;
  value: number;
  /** Cap on a PERCENTAGE discount, in sub-units */
  maxDiscount?: number;
  /** @format date-time */
  expirationDate: string;
  isActive?: boolean;
  usageCount?: number;
  limit: number;
  isOneTime?: boolean;
  isGeneral?: boolean;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ReferralReferredUserDto {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  photo?: string;
  /**
   * When the referred user joined (registered)
   * @format date-time
   */
  dateJoined: string;
}

export interface ReferralItemResponseDto {
  referredUser: ReferralReferredUserDto;
  /** Number of completed orders by the referred user */
  completedOrders: number;
  /** PENDING = not yet earned, EARNED = referee was credited */
  status: "PENDING" | "EARNED";
  /** Amount (in smallest currency unit) for this referral */
  value: number;
  /**
   * When the referee was credited (only when status is EARNED)
   * @format date-time
   */
  earnedAt?: string;
}

export interface ListReferralsResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  /** Paginated list of referrals */
  results: ReferralItemResponseDto[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
  /** Total amount (smallest currency unit) the user has earned from referrals */
  totalEarnedFromReferrals: number;
}

export interface Transaction {
  entityId: string;
  walletId?: string;
  entityType: EntityType;
  currency: string;
  amount: number;
  /** @default 0 */
  charge?: number;
  reference: string;
  description?: string;
  /** @default 0 */
  balanceBefore: number;
  balanceAfter: number;
  type: "CREDIT" | "DEBIT";
  category: "FEE" | "DEPOSIT" | "WITHDRAWAL" | "REVERSAL" | "CHARGE";
  purpose:
    | "ORDER_EARNING"
    | "WALLET_FUNDING"
    | "WALLET_WITHDRAWAL"
    | "REFERRAL_BONUS"
    | "ORDER_PAYMENT"
    | "ORDER_EXTERNAL_FUNDING"
    | "ORDER_PAYMENT_REFUND"
    | "ORDER_EARNING_SPLIT"
    | "ORDER_DISCOUNT"
    | "PROVIDER_DEPOSIT_FEE"
    | "PROVIDER_WITHDRAWAL_FEE"
    | "ORDER_SERVICE_CHARGE"
    | "PLATFORM_TRANSFER";
  status: "PROCESSING" | "FAILED" | "SUCCESS" | "CANCELLED";
  /** @default {} */
  metadata?: object;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ListTransactionResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: Transaction[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface TransactionSummaryResponseDto {
  total: number;
}

export interface UpdatePhoneRequestDto {
  phone: string;
}

export interface UpdateEmailRequestDto {
  email: string;
}

export interface NotificationDto {
  email?: boolean;
  pushNotification?: boolean;
  sms?: boolean;
}

export interface BiddingDto {
  priceSuggestion?: boolean;
  minus?: number;
  plus?: number;
}

export interface OrderRequestNotificationDto {
  vibration?: boolean;
  sound?: boolean;
}

export interface GoalsDto {
  /**
   * Weekly net earnings target, sub-units
   * @min 0
   */
  weeklyEarningsTarget?: number;
}

export interface UpdatePreferencesRequestDto {
  notification?: NotificationDto;
  bidding?: BiddingDto;
  orderRequestNotification?: OrderRequestNotificationDto;
  onboarding?: object;
  goals?: GoalsDto;
}

export interface OrderRecipient {
  name: string;
  phone: string;
  confirmationCode: string;
  /** @default "PENDING" */
  status: "PENDING" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED" | "ARRIVED";
  /** @format date-time */
  completedAt?: string;
  _id?: string;
}

export interface OrderLocation {
  orderId?: string;
  type: "PICKUP" | "DROPOFF";
  /** @default "PENDING" */
  status: "PENDING" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED" | "ARRIVED";
  cancelledBy?: "USER" | "RIDER" | "ADMIN";
  address: string;
  position: {
    /** @default "Point" */
    type?: string;
    coordinates?: number[];
  };
  packageName?: string;
  description?: string;
  category?: string;
  receiverName?: string;
  receiverPhone?: string;
  senderName?: string;
  senderPhone?: string;
  senderPhoto?: string;
  amountTo: number;
  distanceTo: number;
  currency: string;
  confirmationCode?: string;
  recipients?: OrderRecipient[];
  /** @format date-time */
  startedAt?: string;
  /** @format date-time */
  arrivedAt?: string;
  /** @format date-time */
  completedAt?: string;
  /** @format date-time */
  cancelledAt?: string;
  cancellationReason?: string;
  nextId?: string;
  previousId?: string;
  /** @default false */
  isOrigin: boolean;
  /** @default false */
  isDestination: boolean;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface OrderLocationUpdate {
  orderId: string;
  locationId: string;
  requestedBy: string;
  /** @default "PENDING" */
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  oldAddress: string;
  oldPosition: object;
  oldAmountTo: number;
  oldDistanceTo: number;
  newAddress: string;
  newPosition: object;
  newAmountTo: number;
  newDistanceTo: number;
  /** @default 0 */
  deltaAmount: number;
  /** @default false */
  detailsOnly: boolean;
  /** @format date-time */
  expiresAt?: string;
  currency: string;
  chargeTransactionId?: string;
  refundTransactionId?: string;
  /** @format date-time */
  respondedAt?: string;
  order?: Order;
  location?: OrderLocation;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface Review {
  userId: string;
  riderId: string;
  orderId: string;
  comment: string;
  /**
   * @min 1
   * @max 5
   */
  rating: number;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface Order {
  userId?: string;
  riderId?: string;
  eligibleRiderIds?: string[];
  vehicleId?: string;
  couponId?: string;
  businessId?: string;
  transactionIds?: string[];
  type: "SINGLE" | "BATCH" | "BULK";
  /** @default "INITIATED" */
  status: "INITIATED" | "ACCEPTED" | "ON_GOING" | "COMPLETED" | "CANCELLED";
  /** @default "PENDING" */
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  cancelledBy?: "USER" | "RIDER" | "ADMIN";
  /** @default 0 */
  totalAmount?: number;
  /** @default 0 */
  discount?: number;
  /** @default 0 */
  discountAmount?: number;
  /** @default "PERCENTAGE" */
  discountType?: "FIXED" | "PERCENTAGE";
  /** @default 0 */
  serviceCharge?: number;
  /** @default 0 */
  totalAmountPayable?: number;
  totalLocations: number;
  /** @default 0 */
  confirmedLocations?: number;
  /** @default 0 */
  cancelledLocations?: number;
  /** @default 0 */
  ongoingLocations?: number;
  /** @format date-time */
  startedAt?: string;
  /** @format date-time */
  paidDate?: string;
  /** @format date-time */
  acceptedAt?: string;
  /** @format date-time */
  completedAt?: string;
  /** @format date-time */
  cancelledAt?: string;
  cancellationReason?: string;
  locations?: OrderLocation[];
  orderNumber: string;
  /** @default false */
  isScheduled: boolean;
  /** @default false */
  autoAcceptOffer: boolean;
  /** @default 0 */
  minimumOfferPercentage: number;
  /** @default 40 */
  maxRiderSurgePercentage: number;
  negotiatedAmount: number;
  offers: Offer[];
  locationUpdates?: OrderLocationUpdate[];
  currency: string;
  /** @format date-time */
  scheduledFor?: string;
  countryCode?: string;
  stateCode?: string;
  /** @format date-time */
  scheduleDispatchedAt?: string;
  /** @format date-time */
  scheduleLastRungAt?: string;
  scheduleRingCount?: number;
  scheduleRemindersSent?: string[];
  color?: string;
  title?: string;
  isQueued?: boolean;
  /** @format date-time */
  queuedAt?: string;
  business?: Business;
  user?: User;
  vehicle?: Vehicle;
  rider?: User;
  coupon?: Coupon;
  transactions?: Transaction[];
  review?: Review;
  channel?: string;
  storefrontVendorId?: string;
  /** @default 0 */
  foodValue?: number;
  /** @default 0 */
  vendorCommissionRate?: number;
  callbackUrl?: string;
  paymentToken?: string;
  externalPaymentReference?: string;
  externalPaymentUrl?: string;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface Offer {
  orderId: string;
  riderId: string;
  /** @default "PENDING" */
  status: "PENDING" | "REJECTED" | "ACCEPTED";
  amount: number;
  order?: Order;
  rider?: User;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface SubmitDriversLicenseRequestDto {
  licenseNumber: string;
  licenseDocument?: string;
  businessId?: string;
}

export interface ListUserResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: User[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface UpdateAdminPreferencesRequestDto {
  theme?: "light" | "dark" | "system";
  /**
   * Font id from the admin font list.
   * @maxLength 80
   */
  font?: string;
}

export interface UpdateUserPhoneRequestDto {
  /**
   * New phone number in E.164 (+234...) or local (0803...) form.
   * @pattern /^\+?\d{10,15}$/
   */
  phone: string;
  /** Why the number was changed (audited). */
  reason?: string;
}

export interface UpdateDispatchPauseRequestDto {
  /** true stops every order from ringing this rider; false resumes. */
  paused: boolean;
  /** Why (audited, shown on the rider record). */
  reason?: string;
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
}

export interface UpdateUserStatusRequestDto {
  status: UserStatus;
  /** Optional note explaining the status change (audited). */
  reason?: string;
}

/** CREDIT tops up, DEBIT deducts. */
export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export interface AdjustWalletRequestDto {
  /**
   * Amount in sub-units (e.g. 10000 = ₦1).
   * @min 1
   */
  amount: number;
  /** CREDIT tops up, DEBIT deducts. */
  type: TransactionType;
  /** Reason for the manual adjustment (audited). */
  reason: string;
}

export interface RefundOrderRequestDto {
  /** Id of the order being refunded. */
  orderId: string;
  /**
   * Amount in sub-units. Defaults to the full order value.
   * @min 1
   */
  amount?: number;
  /** Reason for the refund (audited). */
  reason: string;
}

/** @default "ACCEPTED" */
export enum Status {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
}

export interface UpdateDriverLicenseRequestDto {
  status: Status;
  comment?: string;
}

export interface WalletCreateRequestDto {
  currency: string;
  /**
   * @minLength 2
   * @maxLength 2
   */
  countryCode: string;
  entityId: string;
  entityType: EntityType;
}

export interface ExternalPaymentMetricsResponseDto {
  /** Number of orders paid via a share link. */
  count: number;
  /** Gross amount paid through link payments. */
  totalFunded: number;
  /** Paystack processing fees on those payments. */
  totalFees: number;
  /** Cash actually received after fees (totalFunded - totalFees). */
  netReceived: number;
  /** Distinct customers who used the feature. */
  uniqueCustomers: number;
}

export interface TransactionMetricsSummaryResponseDto {
  /** Total value of successful transactions (sub-units). */
  totalVolume: number;
  /** Number of successful transactions. */
  count: number;
  /** Total credited (money in), sub-units. */
  inflow: number;
  /** Total debited (money out), sub-units. */
  outflow: number;
  /** Total deposits, sub-units. */
  deposits: number;
  /** Total withdrawals, sub-units. */
  withdrawals: number;
  /** Total fees, sub-units. */
  fees: number;
  /** Total refunds/reversals, sub-units. */
  refunds: number;
  /** Total charges, sub-units. */
  charges: number;
  /** Distinct wallets/entities involved. */
  uniqueEntities: number;
}

export enum CouponLifecycle {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  EXHAUSTED = "EXHAUSTED",
  INACTIVE = "INACTIVE",
}

export enum CouponType {
  FIXED = "FIXED",
  PERCENTAGE = "PERCENTAGE",
}

export interface AdminCouponDto {
  code: string;
  name?: string;
  description?: string;
  currency: string;
  type: string;
  value: number;
  /** Cap on a PERCENTAGE discount, in sub-units */
  maxDiscount?: number;
  /** @format date-time */
  expirationDate: string;
  isActive?: boolean;
  usageCount?: number;
  limit: number;
  isOneTime?: boolean;
  isGeneral?: boolean;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  lifecycle: CouponLifecycle;
  /** Sum of discounts granted on orders that used this coupon, in sub-units */
  discountTotal: number;
  /** Distinct customers who redeemed it */
  uniqueUsers: number;
  /** @format date-time */
  lastUsedAt?: string;
  /** Groups the coupon is attached to */
  groupNames: string[];
  /** Issued automatically as a badge reward */
  isReward: boolean;
}

export interface ListCouponsResponseDto {
  nextPage?: number;
  previousPage?: number;
  currentPage: number;
  results: AdminCouponDto[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface CouponsSummaryResponseDto {
  total: number;
  active: number;
  /** Active coupons expiring within 7 days */
  expiring7d: number;
  /** Redemptions in the last 30 days */
  redemptions30d: number;
  /** Redemptions, all time */
  redemptionsTotal: number;
  /** Discount granted in the last 30 days, in sub-units */
  discount30d: number;
  /** Discount granted, all time, in sub-units */
  discountTotal: number;
  /** Badge reward coupons issued */
  rewardCoupons: number;
  /** Badge reward coupons redeemed */
  rewardCouponsRedeemed: number;
  /** Redemptions per day for the last 30 days: {date, count, discount} */
  daily: object[];
  /** Top coupons by redemptions in the last 30 days */
  topCoupons: object[];
}

export interface AdminCouponGroupDto {
  name: string;
  userIds?: string[];
  couponIds?: string[];
  users: User[];
  coupons: Coupon[];
  userCount: number;
  couponCount: number;
}

export interface ListCouponGroupsResponseDto {
  nextPage?: number;
  previousPage?: number;
  currentPage: number;
  results: AdminCouponGroupDto[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface AdminCouponUsageDto {
  couponId: string;
  userId: string;
  orderId: string;
  coupon?: Coupon;
  user?: User;
  order?: Coupon;
  /** Discount applied on the order, in sub-units */
  discountAmount?: number;
}

export interface ListCouponUsagesResponseDto {
  nextPage?: number;
  previousPage?: number;
  currentPage: number;
  results: AdminCouponUsageDto[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface UpdateCouponRequestDto {
  /**
   * @minLength 4
   * @maxLength 80
   */
  name?: string;
  /** @maxLength 500 */
  description?: string;
  /** @format date-time */
  expirationDate?: string;
  /**
   * Total redemptions allowed
   * @min 1
   */
  limit?: number;
  /**
   * Cap on a PERCENTAGE discount, in sub-units
   * @min 1
   */
  maxDiscount?: number;
  /** Pause (false) or resume (true) redemptions */
  isActive?: boolean;
  isGeneral?: boolean;
  isOneTime?: boolean;
}

export interface UpdateGroupRequestDto {
  /** @minLength 6 */
  name?: string;
  /** Replaces the coupons attached to this group */
  couponCodes?: string[];
}

export interface CreateCouponRequestDto {
  code: string;
  name?: string;
  description?: string;
  /** @default "NGN" */
  currency: string;
  type: CouponType;
  /** @default 10 */
  value: number;
  /** Cap on a PERCENTAGE discount, in sub-units */
  maxDiscount?: number;
  /** @format date-time */
  expirationDate: string;
  isActive?: boolean;
  /** @default 100 */
  limit: number;
  isOneTime?: boolean;
  /** @default false */
  isGeneral?: boolean;
}

export interface CreateGroupRequestDto {
  name: string;
  userIds?: string[];
  couponCodes: string[];
}

export interface UpdateGroupUsersRequestDto {
  userIds: string[];
}

export interface BankResponseDto {
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
  id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface BankResponseMetaDto {
  next: string;
  previous: string;
  perPage: number;
}

export interface GetBanksResponseDto {
  status: boolean;
  message: string;
  data: BankResponseDto[];
  meta: BankResponseMetaDto;
}

export interface CreateVirtualAccountRequestDto {
  /** @minLength 3 */
  firstname: string;
  /** @minLength 3 */
  lastname: string;
  email: string;
  phone: string;
  bvn: string;
  /**
   * @minLength 2
   * @maxLength 2
   * @default "NG"
   */
  country?: string;
  bank?: string;
}

export interface UpdatePlatformSettlementDto {
  /** Bank account number. */
  accountNumber: string;
  /** Paystack bank code. */
  bankCode: string;
}

export interface SetWithdrawalPinDto {
  /**
   * 4-digit withdrawal PIN.
   * @minLength 4
   * @maxLength 4
   */
  pin: string;
}

export interface InitiatePayoutDto {
  /**
   * Amount in sub-units (10000 = ₦1).
   * @min 1
   */
  amount: number;
  /**
   * 4-digit withdrawal PIN.
   * @minLength 4
   * @maxLength 4
   */
  pin: string;
  /** Optional note for the payout. */
  reason?: string;
}

export interface TransferToWalletDto {
  /** The user (customer or rider) whose wallet receives the money. */
  userId: string;
  /**
   * Amount in sub-units (10000 = ₦1).
   * @min 1
   */
  amount: number;
  /**
   * 4-digit platform withdrawal PIN.
   * @minLength 4
   * @maxLength 4
   */
  pin: string;
  /** Why the money is being sent (audited, shown on both ledgers). */
  reason: string;
}

export interface Notification {
  entityId?: string;
  entityType?: EntityType;
  broadcastId?: string;
  content: string;
  subject: string;
  type: "IN_APP" | "PUSH" | "SMS" | "EMAIL";
  /** @format date-time */
  readAt?: string;
  category?: "SINGLE" | "BROADCAST" | "SCHEDULED_BROADCAST";
  /** @default false */
  isRead: boolean;
  /** @default false */
  isExternalRecipient: boolean;
  /** @default "SUCCESS" */
  status: "FAILED" | "SUCCESS";
  failureReason?: string;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ListNotificationResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: Notification[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface UpdateNotificationsRequestDto {
  notificationIds: string[];
}

export interface CreateTemplateRequestDto {
  /**
   * @minLength 3
   * @maxLength 50
   * @pattern /^[a-zA-Z0-9_-]*$/
   */
  name: string;
  subject: string;
  html: string;
  text?: string;
  description?: string;
  sender?: string;
  title?: string;
  /** @default true */
  isActive?: boolean;
}

/** @default "EMAIL" */
export enum NotificationType {
  IN_APP = "IN_APP",
  PUSH = "PUSH",
  SMS = "SMS",
  EMAIL = "EMAIL",
}

/** @default "SINGLE" */
export enum NotificationCategory {
  SINGLE = "SINGLE",
  BROADCAST = "BROADCAST",
  SCHEDULED_BROADCAST = "SCHEDULED_BROADCAST",
}

export interface NotificationAction {
  action?: string;
  title?: string;
  url?: string;
}

export interface TemplateRequestDto {
  /**
   * Template variables with dynamic key-value pairs
   * @example {"key":"value","anotherKey":"anotherValue"}
   */
  variables?: object;
  /**
   * Name of the template
   * @example "template_name"
   */
  name: string;
}

export interface TriggerNotificationRequestDto {
  types: NotificationType[];
  entityType?: EntityType;
  category?: NotificationCategory;
  /** @minLength 5 */
  subject?: string;
  /** The entityId field is required if externalRecipient field is not provided */
  entityId?: string;
  /** The externalRecipient field is required if entityId is not provided */
  externalRecipient?: string;
  /** SMS only: deliver to this number instead of the entity's saved phone (e.g. a phone-change code) */
  phoneOverride?: string;
  /** Notification actions */
  actions?: NotificationAction[];
  sound?: string;
  channelId?: string;
  /** Stable Android notification tag; same-tag pushes collapse instead of stacking */
  tag?: string;
  /** Arbitrary key-value data forwarded in the push payload (e.g. { type }) */
  data?: object;
  template?: TemplateRequestDto;
}

export enum BroadcastAudience {
  CUSTOMERS = "CUSTOMERS",
  RIDERS = "RIDERS",
  BUSINESSES = "BUSINESSES",
  USERS = "USERS",
}

export interface BroadcastFiltersDto {
  status?: ("ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED")[];
  /** Riders only: restrict to riders currently online */
  onlineOnly?: boolean;
  /** Riders only: restrict to riders with an approved licence */
  licenceApprovedOnly?: boolean;
  /** Country code, e.g. NG */
  country?: string;
}

export interface BroadcastEstimateRequestDto {
  audience: BroadcastAudience;
  userIds?: string[];
  filters?: BroadcastFiltersDto;
}

export interface BroadcastRequestDto {
  audience: BroadcastAudience;
  /** Required when audience is USERS */
  userIds?: string[];
  filters?: BroadcastFiltersDto;
  /** PUSH and/or EMAIL. Every recipient also gets an in-app copy. */
  channels: ("IN_APP" | "PUSH" | "SMS" | "EMAIL")[];
  /**
   * Push title and email subject
   * @minLength 3
   * @maxLength 120
   */
  subject: string;
  /**
   * Plain text; line breaks are kept
   * @minLength 5
   * @maxLength 2000
   */
  message: string;
}

export interface CityDto {
  name: string;
  /**
   * @minLength 2
   * @maxLength 3
   */
  code: string;
}

export interface CreateBusinessRequestDto {
  businessName: string;
  firstname: string;
  lastname: string;
  middlename?: string;
  phone: string;
  password: string;
  email: string;
  country: CountryDto;
  state?: StateDto;
  city?: CityDto;
  address?: AddressDto;
  photo?: string;
}

export interface CreateBusinessUserRequestDto {
  /** @minLength 3 */
  firstname: string;
  /** @minLength 3 */
  lastname: string;
  email: string;
  phone: string;
  /** @minLength 3 */
  password: string;
  country: CountryDto;
  photo?: string;
  businessId?: string;
  gender?: Gender;
  referralCode?: string;
  /** @default false */
  isVendor?: boolean;
  businessName?: string;
  middlename?: string;
  vehicleId?: string;
  address?: AddressDto;
}

export interface UpdateVehicleRequestDto {
  name: string;
  /** @minLength 4 */
  plateNumber: string;
  /** @minLength 4 */
  make: string;
  /** @minLength 4 */
  model: string;
  /**
   * @minLength 15
   * @maxLength 20
   */
  chasisNumber: string;
  engineNumber: string;
  photos: string[];
  color?: string;
}

export interface AddVehiclesDto {
  vehicles: UpdateVehicleRequestDto[];
}

export interface AssignVehicleDto {
  vehicleId: string;
  userId: string;
}

export interface BusinessDetailDto {
  registeredDate: string;
  registeredAddress: string;
  registrationNumber: string;
  proofOfBusinessAddress: string;
}

export interface UserDetailDto {
  firstname: string;
  middlename?: string;
  lastname: string;
  dob: string;
  /** Gender of the user */
  gender: "MALE" | "FEMALE";
  email: string;
  phone: string;
  bvn?: string;
  nin?: string;
  address?: string;
  nationality?: CountryDto;
  idCardType?: "VOTER_CARD" | "NATIONAL_ID";
  idNumber?: string;
  idCardDoc?: string;
  /** @format date-time */
  idExpiryDate?: string;
  /** @format date-time */
  idIssuedDate?: string;
}

export interface KYCInfo {
  businessDetails: BusinessDetailDto;
  managerDetails: UserDetailDto;
}

export interface KYCDetailsDto {
  kycDetails: KYCInfo;
  userId: string;
}

export interface ListReviewResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: Review[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface ListOrderResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: Order[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface GetOrderStatisticsResponseDto {
  completed: number;
  cancelled: number;
  batch: number;
  bulk: number;
  single: number;
  total: number;
}

export interface GetOrderStatusChartResponseDto {
  date: string;
  completed: number;
  cancelled: number;
  accepted: number;
}

export interface GetOrderTypeChartResponseDto {
  date: string;
  batch: number;
  bulk: number;
  single: number;
}

export interface UpdatePasswordRequestDto {
  password: string;
}

export interface VehicleListResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: Vehicle[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface RateRiderRequestDto {
  riderId: string;
  orderId: string;
  /**
   * @min 1
   * @max 5
   */
  rating: number;
  comment: string;
}

export interface UpdateVehicleStatusRequestDto {
  /** @minLength 15 */
  reason: string;
}

export interface CreateSinglePickupLocationDto {
  address: string;
  category: string;
  longitude: number;
  latitude: number;
  senderName?: string;
  senderPhone?: string;
  senderPhoto?: string;
  description?: string;
  type: "PICKUP" | "DROPOFF";
}

export interface CreateSingleDropoffLocationDto {
  address: string;
  longitude: number;
  latitude: number;
  receiverName: string;
  receiverPhone: string;
  description?: string;
  type: "PICKUP" | "DROPOFF";
}

export interface CreateSingleOrderDto {
  isScheduled?: boolean;
  /**
   * Provide a date if it is a scheduled order
   * @format date-time
   */
  scheduledFor?: string;
  /** Provide a title if it is a scheduled order */
  title?: string;
  /** Provide a color to differentiate orders */
  color?: string;
  /** Order channel (e.g. VENDOR_STOREFRONT) */
  channel?: string;
  /** Storefront vendor ID */
  vendorId?: string;
  /** Food value in kobo for storefront orders */
  foodValue?: number;
  /** Vendor commission rate (e.g. 5 for 5%) */
  vendorCommissionRate?: number;
  /** Whether order is already paid (storefront pre-payment) */
  isPaid?: boolean;
  /** Minimum delivery fee floor in kobo (storefront orders override the core minimumOrderPrice) */
  minimumDeliveryFee?: number;
  pickupLocation: CreateSinglePickupLocationDto;
  dropoffLocation: CreateSingleDropoffLocationDto;
  type: "SINGLE" | "BATCH" | "BULK";
  userId?: string;
}

export interface CreateBulkPickupLocationDto {
  address: string;
  category: string;
  longitude: number;
  latitude: number;
  packageName?: string;
  description?: string;
  senderName?: string;
  senderPhone?: string;
  senderPhoto?: string;
  type: "PICKUP" | "DROPOFF";
}

export interface CreateBulkOrderDto {
  isScheduled?: boolean;
  /**
   * Provide a date if it is a scheduled order
   * @format date-time
   */
  scheduledFor?: string;
  /** Provide a title if it is a scheduled order */
  title?: string;
  /** Provide a color to differentiate orders */
  color?: string;
  /** Order channel (e.g. VENDOR_STOREFRONT) */
  channel?: string;
  /** Storefront vendor ID */
  vendorId?: string;
  /** Food value in kobo for storefront orders */
  foodValue?: number;
  /** Vendor commission rate (e.g. 5 for 5%) */
  vendorCommissionRate?: number;
  /** Whether order is already paid (storefront pre-payment) */
  isPaid?: boolean;
  /** Minimum delivery fee floor in kobo (storefront orders override the core minimumOrderPrice) */
  minimumDeliveryFee?: number;
  pickupLocations: CreateBulkPickupLocationDto[];
  dropoffLocation: CreateSingleDropoffLocationDto;
  type: "SINGLE" | "BATCH" | "BULK";
  userId?: string;
}

export interface QuoteLocationDto {
  longitude: number;
  latitude: number;
  address?: string;
}

export interface QuoteOrderRequestDto {
  /** Order channel (e.g. VENDOR_STOREFRONT) */
  channel?: string;
  /** Minimum delivery fee floor in kobo (storefront override) */
  minimumDeliveryFee?: number;
  pickupLocation: QuoteLocationDto;
  dropoffLocation: QuoteLocationDto;
}

export interface QuoteOrderResponseDto {
  /** Delivery fee before service charge, in sub-units */
  totalAmount: number;
  /** Platform service charge, in sub-units */
  serviceCharge: number;
  /** What the customer pays: totalAmount + serviceCharge */
  totalAmountPayable: number;
  /** Pickup-to-dropoff distance in kilometres */
  distanceKm: number;
  /** Lowest percentage of the fee a rider may offer */
  minimumOfferPercentage: number;
  /** Highest percentage above the fee a rider may bid */
  maxRiderSurgePercentage: number;
  /** @example "NGN" */
  currency: string;
}

export interface QuoteBatchOrderRequestDto {
  /** Order channel (e.g. VENDOR_STOREFRONT) */
  channel?: string;
  /** Minimum delivery fee floor in kobo (storefront override) */
  minimumDeliveryFee?: number;
  /** Percent discount applied to the batch delivery total (storefront) */
  batchDiscountPercent?: number;
  pickupLocation: QuoteLocationDto;
  dropoffLocations: QuoteLocationDto[];
}

export interface QuoteOrderLegDto {
  latitude?: number;
  longitude?: number;
  /** This leg's marginal cost, in sub-units */
  amount: number;
}

export interface QuoteBatchOrderResponseDto {
  totalAmount: number;
  serviceCharge: number;
  totalAmountPayable: number;
  minimumOfferPercentage: number;
  maxRiderSurgePercentage: number;
  /** @example "NGN" */
  currency: string;
  /** Per-leg breakdown so callers can show how the run total was built */
  legs: QuoteOrderLegDto[];
  /** Sum of the legs before any discount */
  rawTotal: number;
  /** Raw total after the batch discount */
  discountedTotal: number;
  /** Run-level price floor for the state */
  minimumOrderPrice: number;
  /** True when the floor raised the total */
  minimumApplied: boolean;
}

export interface QuoteBulkOrderRequestDto {
  /** Order channel (e.g. VENDOR_STOREFRONT) */
  channel?: string;
  /** Minimum delivery fee floor in kobo (storefront override) */
  minimumDeliveryFee?: number;
  pickupLocations: QuoteLocationDto[];
  dropoffLocation: QuoteLocationDto;
}

export interface QuoteBulkOrderResponseDto {
  totalAmount: number;
  serviceCharge: number;
  totalAmountPayable: number;
  minimumOfferPercentage: number;
  maxRiderSurgePercentage: number;
  /** @example "NGN" */
  currency: string;
}

export interface CreateBatchPickupLocationDto {
  address: string;
  longitude: number;
  latitude: number;
  description?: string;
  senderName?: string;
  senderPhone?: string;
  senderPhoto?: string;
  type: "PICKUP" | "DROPOFF";
}

export interface CreateRecipientDto {
  name: string;
  phone: string;
}

export interface CreateBatchDropoffLocationDto {
  address: string;
  longitude: number;
  latitude: number;
  packageName: string;
  description?: string;
  receiverName: string;
  receiverPhone: string;
  recipients?: CreateRecipientDto[];
  type: "PICKUP" | "DROPOFF";
}

export interface CreateBatchOrderDto {
  isScheduled?: boolean;
  /**
   * Provide a date if it is a scheduled order
   * @format date-time
   */
  scheduledFor?: string;
  /** Provide a title if it is a scheduled order */
  title?: string;
  /** Provide a color to differentiate orders */
  color?: string;
  /** Order channel (e.g. VENDOR_STOREFRONT) */
  channel?: string;
  /** Storefront vendor ID */
  vendorId?: string;
  /** Food value in kobo for storefront orders */
  foodValue?: number;
  /** Vendor commission rate (e.g. 5 for 5%) */
  vendorCommissionRate?: number;
  /** Whether order is already paid (storefront pre-payment) */
  isPaid?: boolean;
  /** Minimum delivery fee floor in kobo (storefront orders override the core minimumOrderPrice) */
  minimumDeliveryFee?: number;
  /** Percent discount applied to the batch delivery total (storefront) */
  batchDiscountPercent?: number;
  pickupLocation: CreateBatchPickupLocationDto;
  dropoffLocations: CreateBatchDropoffLocationDto[];
  type: "SINGLE" | "BATCH" | "BULK";
  userId?: string;
}

export interface RidersRequestDto {
  /** @default false */
  autoAcceptOffer?: boolean;
  /** @default 0 */
  offerAmount?: number;
  /** Specific rider IDs to target (skips geo-query) */
  riderIds?: string[];
  /** Enable sequential rider dispatch (ring one rider at a time with 30s timeout) */
  sequentialDispatch?: boolean;
  /**
   * Ignored: the destination comes from STOREFRONT_DISPATCH_CALLBACK_URL, never the request.
   * @deprecated
   */
  callbackUrl?: string;
  /** Rider sorting strategy for sequential dispatch */
  sortingStrategy?: "BANDS" | "SCORING" | "FAIR";
}

export interface ReDispatchRequestDto {
  /** Specific rider IDs to target */
  riderIds?: string[];
  /**
   * Ignored: the destination comes from STOREFRONT_DISPATCH_CALLBACK_URL, never the request.
   * @deprecated
   */
  callbackUrl?: string;
  /** Rider sorting strategy */
  sortingStrategy?: "BANDS" | "SCORING" | "FAIR";
}

export interface ReassignRiderRequestDto {
  /** The Pickriders user ID of the rider to ring */
  riderId: string;
  /** Callback URL for dispatch status updates */
  callbackUrl: string;
  /** Reason for reassigning the rider */
  reason?: string;
}

export interface NearbyRidersCountResponseDto {
  /** Riders who would receive an order placed from this point right now */
  count: number;
  /** Search radius in km (the state’s dispatch radius) */
  radiusKm: number;
  /** True when served from the 60 s cache */
  cached: boolean;
}

export interface RiderLocationsRequestDto {
  /** Array of rider user IDs to get locations for */
  riderIds: string[];
  /** Reference longitude (e.g. store location) for distance calculation */
  longitude: number;
  /** Reference latitude (e.g. store location) for distance calculation */
  latitude: number;
}

export interface CancelLocationRequestDto {
  reason: string;
}

export interface RescheduleOrderRequestDto {
  /**
   * New scheduled time (ISO). At least 1 h from now, at most 30 days ahead.
   * @format date-time
   */
  scheduledFor: string;
  /**
   * New title for the schedule
   * @maxLength 60
   */
  title?: string;
  /**
   * New colour tag for the calendar
   * @maxLength 20
   */
  color?: string;
}

/** @default "USER" */
export enum CancelledBy {
  USER = "USER",
  RIDER = "RIDER",
  ADMIN = "ADMIN",
}

export interface CancelOrderRequestDto {
  reason: string;
  cancelledBy?: CancelledBy;
  customerRefundMode?: "wallet" | "card";
}

export interface MakeOfferRequestDto {
  offerAmount: number;
}

export interface OrderPaymentLinkResponseDto {
  /** Provider payment reference */
  reference: string;
  /** Hosted checkout URL */
  url: string;
  /** Amount payable, in sub-units */
  amount: number;
  /** @example "NGN" */
  currency: string;
}

export interface InitializeOrderPaymentRequestDto {
  /** Email of the person paying for the order (receives the Paystack receipt). */
  email: string;
}

export interface AcceptRejectOfferRequestDto {
  status: Status;
}

export enum OrderLocationStatus {
  PENDING = "PENDING",
  IN_TRANSIT = "IN_TRANSIT",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  ARRIVED = "ARRIVED",
}

export interface UpdateLocationStatusRequestDto {
  status: OrderLocationStatus;
  /** Rider's current longitude, sent to verify proximity when marking ARRIVED */
  longitude?: number;
  /** Rider's current latitude, sent to verify proximity when marking ARRIVED */
  latitude?: number;
}

export interface UpdateOrderLocationDto {
  senderName?: string;
  senderPhone?: string;
  receiverName?: string;
  receiverPhone?: string;
  description?: string;
  packageName?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
}

export interface QuoteOrderLocationResponseDto {
  /** True when only contact details changed — no re-pricing */
  detailsOnly: boolean;
  /** Raw price difference the change introduces, in sub-units */
  deltaAmount: number;
  /** What the customer is actually charged, in sub-units */
  chargeable: number;
  /** True when the change costs the customer nothing */
  free: boolean;
  /** @example "NGN" */
  currency: string;
  /** True when the free-change allowance is exhausted */
  capReached: boolean;
}

/** @default "ACCEPTED" */
export enum LocationUpdateStatus {
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
}

export interface AcceptRejectLocationUpdateRequestDto {
  status: LocationUpdateStatus;
}

export interface CompleteLocationRequestDto {
  /** @minLength 4 */
  confirmationCode?: string;
  recipientId?: string;
  recipientPhone?: string;
}

export interface AdminCancelOrderRequestDto {
  /** Reason for cancelling the order (audited, refunds the customer). */
  reason: string;
}

/** Manual admin status override (audited). */
export enum OrderStatus {
  INITIATED = "INITIATED",
  ACCEPTED = "ACCEPTED",
  ON_GOING = "ON_GOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface AdminUpdateOrderStatusRequestDto {
  /** Manual admin status override (audited). */
  status: OrderStatus;
}

export type SchemaMixed = object;

export interface DataLog {
  data?: SchemaMixed;
  /** @default "ERROR" */
  level?: "LOG" | "INFO" | "DEBUG" | "ERROR";
  /** @default "USER" */
  logType?: "SYSTEM" | "USER";
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface DataLogsResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: any[][];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
  count: number;
  records: DataLog[];
}

export interface AuditLog {
  actionBy?: string;
  actionType: "ADMIN" | "BUSINESS" | "DEVELOPER" | "SYSTEM" | "TEAM" | "USER";
  business?: Business[];
  /** @default "UNKNOWN" */
  action?: string;
  actionSuccessful?: boolean;
  requestUrl?: string;
  requestMethod?: string;
  ipAddress?: string;
  requestData?: string;
  responseData?: string;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ListAuditLogResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: AuditLog[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export enum IssueCategory {
  ORDER = "ORDER",
  DELIVERY = "DELIVERY",
  RIDER_BEHAVIOUR = "RIDER_BEHAVIOUR",
  APP_TECHNICAL = "APP_TECHNICAL",
  PAYMENT_REFUND = "PAYMENT_REFUND",
  SAFETY_SECURITY = "SAFETY_SECURITY",
  OTHER = "OTHER",
}

export enum IssuePriority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export interface CreateIssueRequestDto {
  category: IssueCategory;
  priority?: IssuePriority;
  /**
   * What happened, in the customer’s words
   * @minLength 10
   * @maxLength 2000
   */
  description: string;
  /** Order the issue is about (must belong to the caller) */
  orderId?: string;
  /** Transaction the issue is about (must belong to the caller) */
  transactionId?: string;
  /** Up to 3 images/videos as base64 data URIs (or already-hosted https URLs) */
  attachments?: string[];
}

export enum IssueSubjectType {
  ORDER = "ORDER",
  TRANSACTION = "TRANSACTION",
  GENERAL = "GENERAL",
}

export enum IssueStatus {
  OPEN = "OPEN",
  IN_REVIEW = "IN_REVIEW",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export interface IssueNote {
  _id: string;
  adminId: string;
  note: string;
  /** @format date-time */
  createdAt: string;
}

export interface IssueReport {
  _id: string;
  /** Short human-readable reference, e.g. ISS-7K3M2Q */
  reference: string;
  userId: string;
  subjectType: IssueSubjectType;
  orderId?: string;
  transactionId?: string;
  category: IssueCategory;
  priority: IssuePriority;
  description: string;
  /** Cloud URLs of uploaded images/videos */
  attachments: string[];
  status: IssueStatus;
  /** Support note shown to the customer once resolved/closed */
  resolution?: string;
  /** @format date-time */
  resolvedAt?: string;
  resolvedBy?: string;
  assignedTo?: string;
  notes?: IssueNote[];
  /** @format date-time */
  firstResponseAt?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface ListIssuesResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: IssueReport[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface IssuesCountByKeyDto {
  key: string;
  count: number;
}

export interface IssuesSummaryResponseDto {
  /** OPEN reports */
  open: number;
  /** IN_REVIEW reports */
  inReview: number;
  /** OPEN or IN_REVIEW with nobody assigned */
  unassigned: number;
  /** Open/in-review reports at HIGH priority */
  highPriorityOpen: number;
  /** Resolved or closed in the last 7 days */
  resolved7d: number;
  /** New reports in the last 7 days */
  new7d: number;
  /** Average hours from report to resolution, last 30 days */
  avgResolutionHours: number | null;
  /** Average hours until first status change, last 30 days */
  avgFirstResponseHours: number | null;
  /** Open/in-review reports older than 48 hours */
  overdue: number;
  /** Open/in-review reports per category */
  byCategory: IssuesCountByKeyDto[];
  /** Open/in-review reports per priority */
  byPriority: IssuesCountByKeyDto[];
}

export interface UpdateIssueStatusRequestDto {
  status: IssueStatus;
  /**
   * Note shown to the customer; expected when resolving or closing
   * @maxLength 2000
   */
  resolution?: string;
}

export interface AssignIssueRequestDto {
  /** Admin user id to assign to; omit or null to unassign */
  adminId?: string | null;
}

export interface UpdateIssuePriorityRequestDto {
  priority: IssuePriority;
}

export interface AddIssueNoteRequestDto {
  /**
   * Internal note; the customer never sees it
   * @maxLength 2000
   */
  note: string;
}

export enum AnnouncementAudience {
  CUSTOMERS = "CUSTOMERS",
  RIDERS = "RIDERS",
}

export enum AnnouncementActionType {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
}

export interface AnnouncementAction {
  type: AnnouncementActionType;
  /** Button label, e.g. "Try the price calculator" */
  label: string;
  /** Screen path (INTERNAL) or https URL (EXTERNAL) */
  target: string;
}

export enum AnnouncementStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export interface AnnouncementStats {
  /** Distinct people the popup has been shown to */
  reached: number;
  /** Every time the popup was shown, repeats included */
  impressions: number;
  /** Taps on "Show me later" */
  later: number;
  /** People who closed it for good without taking the action */
  confirmed: number;
  /** People who tapped the action */
  acted: number;
}

export interface Announcement {
  _id: string;
  title: string;
  /** Plain text; line breaks are kept */
  body: string;
  /** A single emoji shown large above the title */
  emoji?: string;
  /** Optional illustration shown above the title */
  imageUrl?: string;
  audience: AnnouncementAudience;
  action?: AnnouncementAction;
  status: AnnouncementStatus;
  /**
   * Do not show before this moment
   * @format date-time
   */
  startsAt?: string;
  /**
   * Stop showing after this moment
   * @format date-time
   */
  endsAt?: string;
  /**
   * When it first went ACTIVE
   * @format date-time
   */
  publishedAt?: string;
  stats: AnnouncementStats;
  createdBy: string;
  updatedBy?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

/** Set when results is empty: why nothing came back (the apps log it in development) */
export enum PendingAnnouncementsReason {
  NOT_A_RIDER = "NOT_A_RIDER",
  NONE_LIVE = "NONE_LIVE",
  ALL_ACKNOWLEDGED = "ALL_ACKNOWLEDGED",
}

export interface PendingAnnouncementsResponseDto {
  /** Oldest published first, so a backlog reads in order */
  results: Announcement[];
  /** Set when results is empty: why nothing came back (the apps log it in development) */
  reason?: PendingAnnouncementsReason;
}

export enum AnnouncementOutcome {
  CONFIRMED = "CONFIRMED",
  ACTED = "ACTED",
}

export interface AcknowledgeAnnouncementRequestDto {
  outcome: AnnouncementOutcome;
}

export interface ListAnnouncementsResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: Announcement[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface AnnouncementsSummaryResponseDto {
  /** Announcements currently popping in an app */
  active: number;
  drafts: number;
  archived: number;
  /** Distinct people reached across active announcements */
  reached: number;
  /** People who tapped an action across active announcements */
  acted: number;
  /** People who closed one for good without acting */
  confirmed: number;
  /** acted / (acted + confirmed), 0-100 */
  actionRate: number;
}

export interface AppScreenDto {
  /** Route path, e.g. /distance-calculator */
  path: string;
  label: string;
  description: string;
}

export interface AppScreensResponseDto {
  CUSTOMERS: AppScreenDto[];
  RIDERS: AppScreenDto[];
}

export interface AnnouncementReceiptUserDto {
  _id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  photo?: string;
}

export interface AnnouncementReceiptRowDto {
  _id: string;
  announcementId: string;
  userId: string;
  impressions: number;
  later: number;
  /** @format date-time */
  lastSeenAt?: string;
  /**
   * Set once; the announcement never pops for this person again
   * @format date-time
   */
  acknowledgedAt?: string;
  outcome?: AnnouncementOutcome;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  user?: AnnouncementReceiptUserDto;
}

export interface ListAnnouncementReceiptsResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: AnnouncementReceiptRowDto[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface AnnouncementActionDto {
  type: AnnouncementActionType;
  /**
   * Button label
   * @minLength 2
   * @maxLength 40
   */
  label: string;
  /**
   * INTERNAL: a screen path from GET admins/announcements/screens (e.g. /distance-calculator). EXTERNAL: an https URL.
   * @maxLength 500
   */
  target: string;
}

export interface CreateAnnouncementRequestDto {
  /**
   * @minLength 3
   * @maxLength 80
   */
  title: string;
  /**
   * Plain text; line breaks are kept
   * @minLength 5
   * @maxLength 500
   */
  body: string;
  /**
   * One emoji shown large above the title
   * @maxLength 8
   */
  emoji?: string;
  /** https URL of an illustration */
  imageUrl?: string;
  audience: AnnouncementAudience;
  action?: AnnouncementActionDto;
  /** DRAFT (default) keeps it hidden; ACTIVE publishes it right away */
  status?: "DRAFT" | "ACTIVE";
  /**
   * Do not show before this moment
   * @format date-time
   */
  startsAt?: string;
  /**
   * Stop showing after this moment
   * @format date-time
   */
  endsAt?: string;
}

export interface UpdateAnnouncementRequestDto {
  /**
   * @minLength 3
   * @maxLength 80
   */
  title?: string;
  /**
   * @minLength 5
   * @maxLength 500
   */
  body?: string;
  /** @maxLength 8 */
  emoji?: string | null;
  imageUrl?: string | null;
  audience?: AnnouncementAudience;
  action?: AnnouncementActionDto | null;
  /** @format date-time */
  startsAt?: string | null;
  /** @format date-time */
  endsAt?: string | null;
}

export interface UpdateAnnouncementStatusRequestDto {
  status: AnnouncementStatus;
}

export type Object = object;

export interface CreateTeamRequestDto {
  /** Whether this team is tied to a Business or a Developer (User) */
  entityType: "BUSINESS" | "DEVELOPER";
  /** Required when entityType is BUSINESS (Business._id). For DEVELOPER, omit to use the registered user. */
  entityId?: string;
  /**
   * Display name of the team / org
   * @minLength 2
   */
  name: string;
  /** User email — must be unique across users */
  email: string;
  /** User phone number */
  phone: string;
  /** Team contact email */
  contactPersonEmail?: string;
  /** Team contact phone number */
  contactPersonPhone?: string;
  /** Base64-encoded image or an existing HTTPS URL */
  logo?: string;
  /** URL-safe handle / slug — auto-generated from email if omitted */
  handle?: string;
  website?: string;
  description?: string;
  firstname: string;
  lastname: string;
  middlename?: string;
  /** @minLength 8 */
  password: string;
  /** Base64-encoded profile photo or HTTPS URL */
  photo?: string;
  country: CountryDto;
  state?: StateDto;
  city?: CityDto;
  address?: AddressDto;
}

export interface ApiKeyDto {
  label: string;
  keyHash: string;
  keyPrefix: string;
  /** @default true */
  isActive?: boolean;
  /** @format date-time */
  lastUsedAt?: string;
  /** @format date-time */
  createdAt?: string;
  createdBy?: string;
}

export interface Team {
  entityType: "BUSINESS" | "DEVELOPER";
  /** Business._id or Developer User._id; no ref (polymorphic) */
  entityId: string;
  name: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  country: {
    name?: string;
    code?: string;
    currency?: string;
  };
  state: {
    name?: string;
    code?: string;
  };
  city: {
    name?: string;
    code?: string;
  };
  logo: string;
  handle: string;
  website: string;
  description: string;
  userId: string;
  apiKeys: ApiKeyDto[];
  config: {
    /** @default "" */
    webhookUrl?: string;
    /** @default "" */
    callbackUrl?: string;
    allowedIPs?: string[];
    /** @default false */
    testMode?: boolean;
    metadata?: SchemaMixed;
  };
  /** @default "ACTIVE" */
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  allowedRoles: ("TEAM_OWNER" | "TEAM_MEMBER" | "TEAM_ADMIN" | "TEAM_VIEWER")[];
  address: {
    country?: string;
    state?: string;
    lga?: string;
    name?: string;
    latitude?: number;
    longitude?: number;
    branchName?: string;
    landmark?: string;
  };
  /** @default false */
  isDeleted: boolean;
  /** @format date-time */
  deletedAt: string;
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ListTeamsResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: Team[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface PointDto {
  lat: number;
  lng: number;
  label?: string;
}

export interface QuoteDto {
  pickup: PointDto;
  dropoff: PointDto;
  stops?: PointDto[];
  countryCode?: string;
  stateCode?: string;
  batchDiscountPercent?: number;
}

export interface FeedbackDto {
  quoteShortId: string;
  verdict: object;
  suggestedPrice?: number;
  segment?: object;
}

export interface DeliveryPriceEventDto {
  quoteShortId?: string;
  type?: "share" | "copy" | "book";
}

export interface UpdateDeliveryCalculatorConfigDto {
  /**
   * Extra stops a quote may include beyond the first drop-off
   * @min 0
   * @max 20
   */
  maxExtraStops?: number;
  /**
   * Days after which a saved quote is treated as stale
   * @min 1
   * @max 365
   */
  staleDays?: number;
  /**
   * Percentage off for batch (multi-stop) quotes, 0-100
   * @min 0
   * @max 100
   */
  batchDiscountPercent?: number;
}

export interface WebPointDto {
  lat: number;
  lng: number;
  label?: string;
}

export interface WebContactDto {
  name: string;
  phone: string;
}

export interface CreateWebOrderDto {
  category: string;
  pickup: WebPointDto;
  dropoff: WebPointDto;
  sender: WebContactDto;
  receiver: WebContactDto;
  note?: string;
  countryCode?: string;
  stateCode?: string;
}

export interface SupportUnreadResponseDto {
  /**
   * Unread support messages for the caller
   * @example 3
   */
  count: number;
}

export type GetHeartbeatData = any;

export type GetDeliveryPricingData = object;

export interface GetCountriesParams {
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type GetCountriesData = ListCountryResponseDto;

export type AddCountryData = Country;

export type UpdateCountryData = Country;

export type GetCountryByIdData = Country;

export type AddCountryStatesPayload = StateDto[];

export type AddCountryStatesData = StateDto[];

export type GetCountryStatesData = ListStateResponseDto;

export type GetCountryStateByIdData = State;

export type UpdateCountryStateData = State;

export interface OverviewParams {
  /** ISO date or YYYY-MM-DD (Lagos day) */
  from?: string;
  /** ISO date or YYYY-MM-DD (Lagos day, inclusive) */
  to?: string;
  /** 1 = everything since the first order */
  all?: string;
}

export type OverviewData = OverviewResponseDto;

export interface SeriesParams {
  /** ISO date or YYYY-MM-DD (Lagos day) */
  from?: string;
  /** ISO date or YYYY-MM-DD (Lagos day, inclusive) */
  to?: string;
  /** 1 = everything since the first order */
  all?: string;
  bucket?: "day" | "week" | "month";
  riderId?: string;
  userId?: string;
}

export type SeriesData = SeriesResponseDto;

export interface TopRidersParams {
  /** ISO date or YYYY-MM-DD (Lagos day) */
  from?: string;
  /** ISO date or YYYY-MM-DD (Lagos day, inclusive) */
  to?: string;
  /** 1 = everything since the first order */
  all?: string;
  limit?: string;
}

export type TopRidersData = TopRiderDto[];

export interface PeakHoursParams {
  /** ISO date or YYYY-MM-DD (Lagos day) */
  from?: string;
  /** ISO date or YYYY-MM-DD (Lagos day, inclusive) */
  to?: string;
  /** 1 = everything since the first order */
  all?: string;
}

export type PeakHoursData = PeakHoursResponseDto;

export interface ChargesParams {
  /** ISO date or YYYY-MM-DD (Lagos day) */
  from?: string;
  /** ISO date or YYYY-MM-DD (Lagos day, inclusive) */
  to?: string;
  /** 1 = everything since the first order */
  all?: string;
}

export type ChargesData = ChargesResponseDto;

export interface ChargesByRiderParams {
  /** ISO date or YYYY-MM-DD (Lagos day) */
  from?: string;
  /** ISO date or YYYY-MM-DD (Lagos day, inclusive) */
  to?: string;
  /** 1 = everything since the first order */
  all?: string;
  /** Rider name or phone, or business name */
  search?: any;
  sortBy?: "charges" | "trips" | "earned" | "last";
  order?: "ASC" | "DESC";
  limit?: any;
  page?: any;
}

export type ChargesByRiderData = PageableType;

export type AttentionData = AttentionResponseDto;

export interface CustomersParams {
  search?: any;
  phoneVerified?: any;
  /** Comma separated UserStatus */
  status?: any;
  sortBy?: "joined" | "lastLogin" | "name" | "orders" | "spent";
  order?: "ASC" | "DESC";
  limit?: any;
  page?: any;
}

export type CustomersData = PageableType;

export interface BusinessesParams {
  search?: any;
  isActive?: any;
  sortBy?: "joined" | "name";
  order?: "ASC" | "DESC";
  limit?: any;
  page?: any;
}

export type BusinessesData = PageableType;

export interface UserOverviewParams {
  /** ISO date or YYYY-MM-DD (Lagos day) */
  from?: string;
  /** ISO date or YYYY-MM-DD (Lagos day, inclusive) */
  to?: string;
  /** 1 = everything since the first order */
  all?: string;
  userId: string;
}

export type UserOverviewData = UserOverviewResponseDto;

export interface GetInsightsOverviewParams {
  /**
   * Comma-separated start and end date (e.g., 2023-09-01,2023-09-30)
   * @pattern DATE_RANGE_PATTERN
   */
  dateRange?: string;
}

export type GetInsightsOverviewData = InsightsOverviewResponseDto;

export interface GetEarningsSeriesParams {
  /**
   * Comma-separated start and end date (e.g., 2023-09-01,2023-09-30)
   * @pattern DATE_RANGE_PATTERN
   */
  dateRange?: string;
  /** @default "day" */
  bucket?: "day" | "week" | "month";
}

export type GetEarningsSeriesData = EarningsSeriesResponseDto;

export interface GetRiderReviewsParams {
  /** @default 1 */
  page?: number;
  /** @default 20 */
  limit?: number;
}

export type GetRiderReviewsData = RiderReviewsResponseDto;

export interface GetDemandParams {
  /**
   * Comma-separated start and end date (e.g., 2023-09-01,2023-09-30)
   * @pattern DATE_RANGE_PATTERN
   */
  dateRange?: string;
}

export type GetDemandData = DemandResponseDto;

export interface GetMyMapParams {
  /**
   * Comma-separated start and end date (e.g., 2023-09-01,2023-09-30)
   * @pattern DATE_RANGE_PATTERN
   */
  dateRange?: string;
}

export type GetMyMapData = MyMapResponseDto;

export interface GetInsightsLeaderboardParams {
  /**
   * Comma-separated start and end date (e.g., 2023-09-01,2023-09-30)
   * @pattern DATE_RANGE_PATTERN
   */
  dateRange?: string;
  /** @default "state" */
  scope?: "state" | "country";
}

export type GetInsightsLeaderboardData = LeaderboardResponseDto;

export type GetAchievementsData = AchievementsResponseDto;

export type AcknowledgeAchievementData = any;

export interface GetCustomerInsightsOverviewParams {
  range?: InsightsRangePreset;
  /**
   * Explicit window, overrides `range`: YYYY-MM-DD,YYYY-MM-DD or a single start
   * @pattern DATE_RANGE_PATTERN
   */
  dateRange?: string;
}

export type GetCustomerInsightsOverviewData = CustomerInsightsOverviewResponseDto;

export interface GetCustomerInsightsSeriesParams {
  range?: InsightsRangePreset;
  /**
   * Explicit window, overrides `range`: YYYY-MM-DD,YYYY-MM-DD or a single start
   * @pattern DATE_RANGE_PATTERN
   */
  dateRange?: string;
  /** Defaults to a bucket that suits the range */
  bucket?: "day" | "week" | "month";
}

export type GetCustomerInsightsSeriesData = CustomerInsightsSeriesResponseDto;

export interface GetCustomerInsightsPlacesParams {
  /**
   * @min 1
   * @max 20
   * @default 5
   */
  limit?: number;
}

export type GetCustomerInsightsPlacesData = CustomerInsightsPlacesResponseDto;

export type GetCustomerInsightsRecapData = CustomerInsightsRecapResponseDto;

export type GetCustomerAchievementsData = CustomerAchievementsResponseDto;

export type AcknowledgeCustomerAchievementData = AcknowledgeAchievementResponseDto;

export type CatalogueData = AdminAchievementDefinitionDto[];

export type AchievementsSummaryData = AchievementsSummaryResponseDto;

export interface UnlocksParams {
  /** Badge key, e.g. ORDERS_5 */
  key?: string;
  /**
   * Customer name, email or phone
   * @maxLength 100
   */
  search?: string;
  /** Reward coupon state */
  reward?: "issued" | "redeemed" | "unredeemed" | "expired";
  /** @format date-time */
  from?: string;
  /** @format date-time */
  to?: string;
  /** @default 1 */
  page?: number;
  /** @default 20 */
  limit?: number;
}

export type UnlocksData = ListAchievementUnlocksResponseDto;

export type ForUserData = AdminCustomerAchievementsResponseDto;

export type GrantData = AdminCustomerAchievementsResponseDto;

export type RevokeData = AdminCustomerAchievementsResponseDto;

export type LoginAdminsData = AuthTokenResponseDto;

export type LoginData = AuthTokenResponseDto;

export type LoginBusinessData = AuthTokenResponseDto;

export type VerifyPhoneData = AuthTokenResponseDto;

export type VerifyEmailData = AuthTokenResponseDto;

export type PasswordResetRequestData = MessageResponseDto;

export type PasswordResetData = AuthTokenResponseDto;

export type ResendTokenData = MessageResponseDto;

export type CheckTokenValidityData = CheckTokenResponseDto;

export type GoogleSignInData = AuthTokenResponseDto;

export interface CreateUserParams {
  referralCode?: any;
}

export type CreateUserData = CreateUserRequestDto;

export type GetUserProfileData = User;

export type UpdateUserProfileData = User;

export type AcknowledgeWalletTermsData = User;

export type UpdateUserLocationData = User;

export type UpdateProfilePhotoData = UpdatedPhotoResponseDto;

export type UpdateUserAddressesData = MessageResponseDto;

export type UserKycVerificationData = MessageResponseDto;

export type ChangeUserPasswordData = MessageResponseDto;

export type GetUserWalletsData = WalletListResponseDto;

export type GetUserWalletData = Wallet;

export type InitializeFundWalletData = FundWalletResponseDto;

export type CancelFundWalletData = CancelFundWalletResponseDto;

export type UpdateSettlementAccountData = Wallet;

export type InitiateWithdrawalData = Wallet;

export type GetActiveCouponsData = Coupon[];

export interface GetAllReferralsParams {
  /** the records sorting order */
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type GetAllReferralsData = ListReferralsResponseDto;

export interface GetUserTransactionsParams {
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
  /** transaction type filter. commap separated list of TransactionType */
  type?: string;
  /** transaction category filter. commap separated list of TransactionCategory */
  category?: string;
  /** transaction status filter. comma separated list of TransactionStatus */
  status?: string;
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type GetUserTransactionsData = ListTransactionResponseDto;

export interface GetUserTransactionsSummaryParams {
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
  /** transaction type filter. comma separated list of TransactionType */
  type?: string;
  /** transaction category filter. comma separated list of TransactionCategory */
  category?: string;
  /** transaction status filter. comma separated list of TransactionStatus */
  status?: string;
}

export type GetUserTransactionsSummaryData = TransactionSummaryResponseDto;

export type GetUserTransactionData = Transaction;

export type DeleteUserAccountData = MessageResponseDto;

export type UpdatePhoneNumberData = MessageResponseDto;

export type UpdateEmailData = MessageResponseDto;

export type UpdateUserPreferencesData = User;

export type ToggleOnlinePresenceData = User;

export type GetRiderOrderData = Order;

export type VerifyDriversLicenseData = User;

export type SubmitDriversLicenseData = object;

export type GetUserVehicleData = Vehicle;

export type AdminCreateUserData = CreateUserRequestDto;

export interface GetUsersParams {
  /** For the rider list (isRider=true), sort by this field. completedDeliveries and totalEarned are lifetime rider metrics returned on each row. Combine with order=DESC for a leaderboard. */
  sortBy?: "createdAt" | "lastLoginDate" | "completedDeliveries" | "totalEarned";
  /** Filter riders by licence KYC status. APPROVE = licence-approved (verified) riders. */
  driversLicenseVerified?: "APPROVE" | "DISAPPROVE" | "SUSPENDED" | "SUBMITTED" | "PENDING";
  /** Search by user email, phone, firstname, lastname, middlename, or nin. This query is case insensitive. */
  userSearch?: string;
  /** Filter by setting either of the enum values ['0', '1', 'false', 'true'] */
  phoneVerified?: "0" | "1" | "false" | "true";
  /** Filter by setting either of the enum values ['0', '1', 'false', 'true'] */
  emailVerified?: "0" | "1" | "false" | "true";
  /** Riders only: true = riders an admin stopped ringing, false = riders still receiving requests */
  dispatchPaused?: "0" | "1" | "false" | "true";
  /** Riders only: filter by whether the rider app is currently online */
  isOnline?: "0" | "1" | "false" | "true";
  /** Filter by setting either of the enum values ['0', '1', 'false', 'true'] */
  isRider?: "0" | "1" | "false" | "true";
  /** Filter by setting either of the enum values ['0', '1', 'false', 'true'] */
  bvnVerified?: "0" | "1" | "false" | "true";
  /** comma-seprarated list of user roles */
  role?: string;
  /** comma-seprarated list of user statuses */
  status?: string;
  /** order by default is ASC, select either from the the enum ['ASC', 'DESC'] */
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type GetUsersData = ListUserResponseDto;

export type AdminGetMyProfileData = User;

export type AdminUpdateMyPhotoData = UpdatedPhotoResponseDto;

export type AdminUpdateMyAddressesData = MessageResponseDto;

export type AdminChangeMyPasswordData = MessageResponseDto;

export type GetAdminPreferencesData = object;

export type UpdateAdminPreferencesData = object;

export type UpdateUserPhoneData = object;

export type SetDispatchPausedData = object;

export type GetUserData = User;

export type AdminGetUserWalletsData = WalletListResponseDto;

export type UpdateUserStatusData = object;

export type AdjustUserWalletData = any;

export interface RefundableOrdersParams {
  limit?: number;
  /** Order number */
  search?: string;
  userId: string;
}

export type RefundableOrdersData = any;

export type RefundCustomerOrderData = object;

export type AdminVerifyDriversLicenseData = User;

export type ApproveDriversLicenseSubmissionData = object;

export type UpdateDriversLicenseData = User;

export type AdminUpdateSettlementAccountData = Wallet;

export type CreateWalletData = Wallet;

export type CreditPlatformWalletData = any;

export type GetPlatformWalletData = Wallet;

export interface GetTransactionsParams {
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
  /** transaction type filter. commap separated list of TransactionType */
  type?: string;
  /** transaction category filter. commap separated list of TransactionCategory */
  category?: string;
  /** transaction status filter. comma separated list of TransactionStatus */
  status?: string;
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type GetTransactionsData = ListTransactionResponseDto;

export interface AdminGetTransactionsParams {
  /** Reference, description, or wallet owner name / phone / email */
  search?: any;
  /** provide a user (entity) id to get transactions for a user */
  entityId?: string;
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
  /** transaction type filter. commap separated list of TransactionType */
  type?: string;
  /** transaction purpose filter. commap separated list of TransactionPurpose */
  purpose?: string;
  /** transaction category filter. commap separated list of TransactionCategory */
  category?: string;
  /** transaction status filter. comma separated list of TransactionStatus */
  status?: string;
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type AdminGetTransactionsData = ListTransactionResponseDto;

export interface GetExternalPaymentMetricsParams {
  /** provide a user (entity) id to scope metrics to a single customer */
  entityId?: string;
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
}

export type GetExternalPaymentMetricsData = ExternalPaymentMetricsResponseDto;

export interface GetTransactionSummaryParams {
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
}

export type GetTransactionSummaryData = TransactionMetricsSummaryResponseDto;

export type GetTransactionData = Transaction;

export interface ListCouponsParams {
  /**
   * Code or name
   * @maxLength 100
   */
  search?: string;
  lifecycle?: CouponLifecycle;
  type?: CouponType;
  /** "true" for general (everyone), "false" for targeted (groups) */
  isGeneral?: string;
  /** "true" to list only badge reward coupons (BADGE-…) */
  rewards?: string;
  sortBy?: "createdAt" | "expirationDate" | "usageCount" | "code" | "value";
  order?: "ASC" | "DESC";
  /** @default 1 */
  page?: number;
  /** @default 20 */
  limit?: number;
}

export type ListCouponsData = ListCouponsResponseDto;

export type CreateCouponData = object;

export type CouponsSummaryData = CouponsSummaryResponseDto;

export interface ListGroupsParams {
  /** Group name */
  search?: string;
  /** "true" to include the per-badge reward groups (badge:…) */
  includeRewardGroups?: string;
  /** @default 1 */
  page?: number;
  /** @default 20 */
  limit?: number;
}

export type ListGroupsData = ListCouponGroupsResponseDto;

export type CreateGroupData = object;

export type GetGroupData = AdminCouponGroupDto;

export type UpdateGroupData = AdminCouponGroupDto;

export type GetCouponData = AdminCouponDto;

export type UpdateCouponData = AdminCouponDto;

export interface UsagesParams {
  /** @default 1 */
  page?: number;
  /** @default 20 */
  limit?: number;
  couponId: string;
}

export type UsagesData = ListCouponUsagesResponseDto;

export type AddGroupUsersData = object;

export type RemoveGroupUsersData = object;

export type DeactivateCouponData = any;

export interface GetBanksParams {
  /** A cursor key to fetch the previous page of the list after an intial next request */
  previous?: any;
  /** A cursor that indicates your place in the list. It can be used to fetch the next page of the list */
  next?: any;
  /** The number of objects to return per page. Defaults to 50, and limited to 100 records per page. */
  perPage?: any;
  /** Acceptable values are: ghana, kenya, nigeria, and south africa. */
  country?: any;
  provider: "PAYSTACK" | "FLUTTERWAVE";
}

export type GetBanksData = GetBanksResponseDto;

export type CreateDedicatedVirtualAccountData = object;

export type GetPlatformBanksData = GetBanksResponseDto;

export type GetFinanceStatusData = any;

export type UpdateSettlementData = any;

export type SetPinData = any;

export type InitiatePayoutData = any;

export type TransferToUserData = any;

export interface GetNotificationsParams {
  order?: "ASC" | "DESC";
  isRead?: any;
  page?: number;
  limit?: number;
}

export type GetNotificationsData = ListNotificationResponseDto;

export type GetUserNotificationData = Notification;

export type BulkMarkNotificationsAsReadData = MessageResponseDto;

export type CreateTemplateData = object;

export type TriggerNotificationData = any;

export type EstimateBroadcastData = any;

export type CreateBroadcastData = object;

export interface ListBroadcastsParams {
  limit?: any;
  page?: any;
}

export type ListBroadcastsData = any;

export type GetBroadcastData = object;

export interface LogParams {
  category?: any;
  /** Comma separated NotificationType */
  type?: any;
  /** Comma separated NotificationStatus */
  status?: any;
  entityId?: any;
  broadcastId?: any;
  limit?: any;
  page?: any;
}

export type LogData = any;

export type CreateBusinessData = CreateBusinessRequestDto;

export type CreateBusinessUserData = CreateBusinessUserRequestDto;

export type GetBusinessUserData = User;

export type UpdateBusinessUserData = User;

export type RemoveUserFromBusinessData = MessageResponseDto;

export interface GetBusinessUsersParams {
  /** Filter by setting either of the enum values ['0', '1', 'false', 'true'] */
  phoneVerified?: "0" | "1" | "false" | "true";
  /** Filter by setting either of the enum values ['0', '1', 'false', 'true'] */
  emailVerified?: "0" | "1" | "false" | "true";
  /** Filter by setting either of the enum values ['0', '1', 'false', 'true'] */
  bvnVerified?: "0" | "1" | "false" | "true";
  /** Allowed statuses separated by comma : ACTIVE,INACTIVE,SUSPENDED,BANNED */
  status?: string;
  /** Allowed roles separated by comma : USER, ADMIN, SUPER_ADMIN, PLATFORM_ADMIN, PLATFORM_RIDER, PLATFORM_OPERATION, PLATFORM_FINANCE, PLATFORM_BUSINESS, PLATFORM_MANAGER, DEVELOPER, BUSINESS_ADMIN, BUSINESS_USER, BUSINESS_RIDER */
  role?: string;
  /** Order by default is ASC, select either from the the enum ['ASC', 'DESC'] */
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
  businessId: string;
}

export type GetBusinessUsersData = ListUserResponseDto;

export type AddVehiclesData = MessageResponseDto;

export type AssignUserVehicleData = MessageResponseDto;

export type AddKycDetailsData = MessageResponseDto;

export type GetUserReviewsData = ListReviewResponseDto;

export interface GetBusinessTransactionsParams {
  /** filter by riderId */
  riderId?: string;
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
  /** Allowed order types separated by comma : CREDIT,DEBIT */
  type?: string;
  /** Allowed categories separated by comma : FEE,DEPOSIT,WITHDRAWAL,REVERSAL,CHARGE */
  category?: string;
  /** Allowed statuses separated by comma : PROCESSING,FAILED,SUCCESS,CANCELLED */
  status?: string;
  /** Order by default is ASC, select either from the the enum ['ASC', 'DESC'] */
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
  businessId: string;
}

export type GetBusinessTransactionsData = ListTransactionResponseDto;

export type GetBusinessTransactionData = Transaction;

export interface GetBusinessOrdersParams {
  /** Comma separated start and end date filter for scheduled orders */
  scheduledFor?: string;
  /** Select this to filter scheduled orders */
  isScheduled?: string;
  /** filter by rider Id */
  riderId?: any;
  /** filter by vehicle Id */
  vehicleId?: any;
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
  /** Allowed order types separated by comma : SINGLE,BATCH,BULK */
  type?: string;
  /** Allowed statuses separated by comma : INITIATED,ACCEPTED,ON_GOING,COMPLETED,CANCELLED */
  status?: string;
  /** Search by order number */
  orderNumber?: any;
  /** Order by default is ASC, select either from the the enum ['ASC', 'DESC'] */
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
  businessId: string;
}

export type GetBusinessOrdersData = ListOrderResponseDto;

export type GetBusinessOrderData = Order;

export type GetBusinessWalletsData = WalletListResponseDto;

export type GetBusinessWalletData = Wallet;

export interface GetBusinessOrderStatisticsParams {
  /** filter by riderId */
  riderId?: string;
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
  businessId: string;
}

export type GetBusinessOrderStatisticsData = GetOrderStatisticsResponseDto;

export interface GetBusinessOrderStatusChartParams {
  /** filter by riderId */
  riderId?: string;
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
  businessId: string;
}

export type GetBusinessOrderStatusChartData = GetOrderStatusChartResponseDto[];

export interface GetBusinessOrderTypeChartParams {
  /** filter by riderId */
  riderId?: string;
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
  businessId: string;
}

export type GetBusinessOrderTypeChartData = GetOrderTypeChartResponseDto[];

export type GetBusinessData = Business;

export interface GetBusinessVehiclesParams {
  /** Select this to filter by assigned/non-assigned vehicles */
  isAssigned?: boolean;
  /** comma-seprarated list of vehicle statuses */
  status?: string;
  /** filter by vehicle Id */
  vehicleId?: any;
  /** Order by default is ASC, select either from the the enum ['ASC', 'DESC'] */
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
  businessId: string;
}

export type GetBusinessVehiclesData = VehicleListResponseDto;

export type UpdateBusinessPreferencesData = Business;

export type SuspendBusinessUserData = User;

export type UnsuspendBusinessUserData = User;

export type UpdateBusinessVehicleData = Vehicle;

export interface GetReviewsParams {
  /** 1 = include the customer and the order on each row */
  expand?: any;
  /** Only reviews left by this customer */
  userId?: any;
  /** Only reviews left for this rider */
  riderId?: any;
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type GetReviewsData = ListReviewResponseDto;

export type RateRiderData = Review;

export type UpdateUserVehicleData = Vehicle;

export type GetVehicleData = Vehicle;

export type DeleteUserVehicleData = MessageResponseDto;

export interface GetVehiclesParams {
  /** Search by vehicle name, plate number, model, make, engine number, or chassis number. Also search by courier email, phone, firstname, lastname, middlename, or nin. This query is case insensitive. */
  vehicleSearch?: string;
  /** Filter by setting either of the enum values ['0', '1', 'false', 'true']. Select this to filter by assigned/non-assigned vehicles */
  isAssigned?: "0" | "1" | "false" | "true";
  /** comma-seprarated list of vehicle models */
  model?: string;
  /** comma-seprarated list of vehicle makes */
  make?: string;
  /** Filter by setting either of the enum values ['0', '1', 'false', 'true'] */
  isDeleted?: "0" | "1" | "false" | "true";
  /** comma-seprarated list of vehicle statuses */
  status?: string;
  /** order by default is ASC, select either from the the enum ['ASC', 'DESC'] */
  order?: "ASC" | "DESC";
}

export type GetVehiclesData = VehicleListResponseDto;

export type AdminUpdateUserVehicleData = Vehicle;

export type VerifyVehicleData = Vehicle;

export type RejectVehicleData = Vehicle;

export type SuspendVehicleData = Vehicle;

export type AdminGetVehicleData = Vehicle;

export type DeleteVehicleData = MessageResponseDto;

export type CreateSingleOrderData = Order;

export type CreateBulkOrderData = Order;

export type QuoteOrderData = QuoteOrderResponseDto;

export type QuoteBatchOrderData = QuoteBatchOrderResponseDto;

export type QuoteBulkOrderData = QuoteBulkOrderResponseDto;

export type CreateBatchOrderData = Order;

export type RequestOrderRidersData = User[];

export type ReDispatchData = object;

export type ReassignRiderData = Order;

export interface GetNearbyRidersCountParams {
  /** @example 6.5244 */
  latitude: number;
  /** @example 3.3792 */
  longitude: number;
}

export type GetNearbyRidersCountData = NearbyRidersCountResponseDto;

export type GetRidersLeaderboardData = any;

export type ListAllRidersData = any;

export type GetRiderLocationsData = any;

export type CancelOrderLocationData = OrderLocation;

export type RescheduleOrderData = Order;

export type CancelOrderData = Order;

export type MakeOrderOfferData = Order;

export type InitiateOrderPaymentData = Order;

export type CreateOrderPaymentLinkData = OrderPaymentLinkResponseDto;

export type VerifyOrderPaymentData = Order;

export type GetOrderPaymentInfoData = any;

export interface ConfirmExternalPaymentByReferenceParams {
  reference: string;
}

export type ConfirmExternalPaymentByReferenceData = any;

export type InitializeExternalOrderPaymentData = any;

export type AcceptOrRejectOrderOfferData = Offer;

export type StartOrderData = Order;

export type StartOrderLocationData = OrderLocation;

export type UpdateOrderLocationStatusData = OrderLocation;

export type GetOrderEtaData = any;

export type QuoteOrderLocationData = QuoteOrderLocationResponseDto;

export type UpdateOrderLocationData = OrderLocationUpdate;

export type RespondToLocationUpdateData = OrderLocationUpdate;

export type ApplyOrderCouponData = Order;

export type RemoveOrderCouponData = Order;

export type CompleteOrderLocationData = OrderLocation;

export type CompleteOrderData = Order;

export type QueueOrderData = Order;

export type GetQueuedOrdersData = Order[];

export type GetActiveOffersData = Offer[];

export interface GetUserOrdersParams {
  /** date filter for scheduled orders - provide this if filtering for scheduled orders */
  scheduledFor?: any;
  /** filter for scheduled orders */
  isScheduled?: any;
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: any;
  /** order type filter. Comma seprarated list of OrderType */
  type?: string;
  /** order status filter. Comma seprarated list of OrderStatus */
  status?: string;
  /** search by order number */
  orderNumber?: any;
  /** the records sorting order */
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type GetUserOrdersData = ListOrderResponseDto;

export interface GetRiderOrdersParams {
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: any;
  /** order type filter. Comma seprarated list of OrderType */
  type?: string;
  /** order status filter. Comma seprarated list of OrderStatus */
  status?: string;
  /** search by order number */
  orderNumber?: any;
  /** the records sorting order */
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type GetRiderOrdersData = ListOrderResponseDto;

export type GetPendingLocationUpdateData = OrderLocationUpdate;

export type GetLatestLocationUpdateForCustomerData = OrderLocationUpdate;

export type GetUserOrderData = Order;

export interface GetRiderOrderStatisticsParams {
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
}

export type GetRiderOrderStatisticsData = GetOrderStatisticsResponseDto;

export interface GetOrderStatusChartParams {
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
}

export type GetOrderStatusChartData = GetOrderStatusChartResponseDto[];

export interface GetOrderTypeChartParams {
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: string;
}

export type GetOrderTypeChartData = GetOrderTypeChartResponseDto[];

export interface GetOrdersParams {
  /** date filter for scheduled orders - provide this if filtering for scheduled orders */
  scheduledFor?: any;
  /** filter for orders by user id */
  byUserId?: any;
  /** filter for scheduled orders */
  isScheduled?: any;
  /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
  dateRange?: any;
  /** order type filter. Comma seprarated list of OrderType */
  type?: string;
  /** order status filter. Comma seprarated list of OrderStatus */
  status?: string;
  /** search by order number */
  orderNumber?: any;
  /** the records sorting order */
  order?: "ASC" | "DESC";
  sortBy?: "createdAt" | "scheduledFor" | "updatedAt";
  /** Order number, or customer / rider name, phone or email */
  search?: string;
  page?: number;
  limit?: number;
}

export type GetOrdersData = ListOrderResponseDto;

export type GetOrderData = Order;

export type GetOrderOffersData = any;

export type RingRidersData = any;

export type AdminCancelOrderData = Order;

export type UpdateOrderStatusData = Order;

export interface GetLogsParams {
  /** Matches inside the logged payload */
  search?: string;
  /** start,end (YYYY-MM-DD) */
  dateRange?: string;
  /** Comma separated DataLogType values */
  logType?: string;
  /** Comma separated DataLogLevel values */
  level?: string;
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type GetLogsData = DataLogsResponseDto;

export interface FindAllParams {
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type FindAllData = ListAuditLogResponseDto;

export type CreateIssueData = IssueReport;

export interface ListMyIssuesParams {
  /** One status, or several comma-separated (e.g. OPEN,IN_REVIEW) */
  status?: IssueStatus;
  category?: IssueCategory;
  priority?: IssuePriority;
  subjectType?: IssueSubjectType;
  /** Admin user id; "unassigned" for reports nobody has picked up */
  assignedTo?: string;
  /**
   * Reference (ISS-…), customer name, email or phone
   * @maxLength 100
   */
  search?: string;
  /** @format date-time */
  from?: string;
  /** @format date-time */
  to?: string;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "status";
  order?: "ASC" | "DESC";
  /** @default 1 */
  page?: number;
  /** @default 20 */
  limit?: number;
}

export type ListMyIssuesData = ListIssuesResponseDto;

export type GetMyIssueData = IssueReport;

export interface ListIssuesParams {
  /** One status, or several comma-separated (e.g. OPEN,IN_REVIEW) */
  status?: IssueStatus;
  category?: IssueCategory;
  priority?: IssuePriority;
  subjectType?: IssueSubjectType;
  /** Admin user id; "unassigned" for reports nobody has picked up */
  assignedTo?: string;
  /**
   * Reference (ISS-…), customer name, email or phone
   * @maxLength 100
   */
  search?: string;
  /** @format date-time */
  from?: string;
  /** @format date-time */
  to?: string;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "status";
  order?: "ASC" | "DESC";
  /** @default 1 */
  page?: number;
  /** @default 20 */
  limit?: number;
}

export type ListIssuesData = ListIssuesResponseDto;

export type IssuesSummaryData = IssuesSummaryResponseDto;

export interface ListUserIssuesParams {
  /** One status, or several comma-separated (e.g. OPEN,IN_REVIEW) */
  status?: IssueStatus;
  category?: IssueCategory;
  priority?: IssuePriority;
  subjectType?: IssueSubjectType;
  /** Admin user id; "unassigned" for reports nobody has picked up */
  assignedTo?: string;
  /**
   * Reference (ISS-…), customer name, email or phone
   * @maxLength 100
   */
  search?: string;
  /** @format date-time */
  from?: string;
  /** @format date-time */
  to?: string;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "status";
  order?: "ASC" | "DESC";
  /** @default 1 */
  page?: number;
  /** @default 20 */
  limit?: number;
  userId: string;
}

export type ListUserIssuesData = ListIssuesResponseDto;

export type GetIssueData = IssueReport;

export type UpdateStatusData = IssueReport;

export type AssignData = IssueReport;

export type UpdatePriorityData = IssueReport;

export type AddNoteData = IssueReport;

export interface ListPendingAnnouncementsParams {
  /** Which app is asking: the customer app sends CUSTOMERS, the rider app RIDERS */
  audience: AnnouncementAudience;
}

export type ListPendingAnnouncementsData = PendingAnnouncementsResponseDto;

export type TrackAnnouncementSeenData = any;

export type TrackAnnouncementLaterData = any;

export type AcknowledgeAnnouncementData = any;

export interface AdminListAnnouncementsParams {
  status?: AnnouncementStatus;
  audience?: AnnouncementAudience;
  /**
   * Title or body text
   * @maxLength 100
   */
  search?: string;
  /** @default 1 */
  page?: number;
  /** @default 20 */
  limit?: number;
}

export type AdminListAnnouncementsData = ListAnnouncementsResponseDto;

export type AdminCreateAnnouncementData = Announcement;

export type AdminAnnouncementsSummaryData = AnnouncementsSummaryResponseDto;

export type AdminListAnnouncementScreensData = AppScreensResponseDto;

export type AdminGetAnnouncementData = Announcement;

export type AdminUpdateAnnouncementData = Announcement;

export type AdminDeleteAnnouncementData = any;

export interface AdminListAnnouncementReceiptsParams {
  /** acknowledged: closed for good; pending: shown but still popping */
  state?: "acknowledged" | "pending";
  outcome?: AnnouncementOutcome;
  /** @default 1 */
  page?: number;
  /** @default 20 */
  limit?: number;
  announcementId: string;
}

export type AdminListAnnouncementReceiptsData = ListAnnouncementReceiptsResponseDto;

export type AdminUpdateAnnouncementStatusData = Announcement;

export type HandleWebhookEventsData = object;

export type CreateTeamData = object;

export interface GetUserTeamParams {
  teamId: string;
}

export type GetUserTeamData = object;

export type AdminCreateTeamData = object;

export interface AdminListTeamsParams {
  order?: "ASC" | "DESC";
  limit?: any;
  page?: any;
}

export type AdminListTeamsData = ListTeamsResponseDto;

export type RunData = any;

export type QuoteData = any;

export type PublicConfigData = any;

export type GetQuoteData = any;

export type FeedbackData = any;

export type EventData = any;

export interface AnalyticsParams {
  from?: string;
  to?: string;
}

export type AnalyticsData = any;

export type AdminConfigData = any;

export type UpdateConfigData = object;

export type CreateData = any;

export type TrackData = any;

export type SearchData = any;

export type OffersData = any;

export type AcceptOfferData = any;

export type PayData = any;

export type CancelData = any;

export type GetUnreadCountData = SupportUnreadResponseDto;

export type MarkAsReadData = SupportUnreadResponseDto;
