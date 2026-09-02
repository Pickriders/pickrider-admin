/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Manual admin status override (audited). */
export enum OrderStatus {
  INITIATED = "INITIATED",
  ACCEPTED = "ACCEPTED",
  ON_GOING = "ON_GOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

/** @default "ACCEPTED" */
export enum LocationUpdateStatus {
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
}

export enum OrderLocationStatus {
  PENDING = "PENDING",
  IN_TRANSIT = "IN_TRANSIT",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  ARRIVED = "ARRIVED",
}

/** @default "USER" */
export enum CancelledBy {
  USER = "USER",
  RIDER = "RIDER",
  ADMIN = "ADMIN",
}

/** @default "SINGLE" */
export enum NotificationCategory {
  SINGLE = "SINGLE",
  BROADCAST = "BROADCAST",
  SCHEDULED_BROADCAST = "SCHEDULED_BROADCAST",
}

/** @default "EMAIL" */
export enum NotificationType {
  IN_APP = "IN_APP",
  PUSH = "PUSH",
  SMS = "SMS",
  EMAIL = "EMAIL",
}

export enum CouponType {
  FIXED = "FIXED",
  PERCENTAGE = "PERCENTAGE",
}

/** @default "ACCEPTED" */
export enum Status {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
}

/** CREDIT tops up, DEBIT deducts. */
export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
}

export enum PaymentProvider {
  PAYSTACK = "PAYSTACK",
  FLUTTERWAVE = "FLUTTERWAVE",
}

export enum EntityType {
  TEAM = "TEAM",
  USER = "USER",
  BUSINESS = "BUSINESS",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum UserSignUpRoles {
  USER = "USER",
  PLATFORM_RIDER = "PLATFORM_RIDER",
  DEVELOPER = "DEVELOPER",
}

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

export interface LoginRequestDto {
  identifier: string;
  /** @minLength 8 */
  password: string;
  role: Role;
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
  driversLicenseVerified:
    | "APPROVE"
    | "DISAPPROVE"
    | "SUSPENDED"
    | "SUBMITTED"
    | "PENDING";
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
  type:
    | "BANKING"
    | "CLIENT"
    | "PARTNER"
    | "SUPPLIER"
    | "MERCHANT"
    | "AGENCY_BANKING"
    | "PICKRIDERS_AGENT";
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
    | "ORDER_SERVICE_CHARGE";
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

export interface UpdatePreferencesRequestDto {
  notification?: NotificationDto;
  bidding?: BiddingDto;
  orderRequestNotification?: OrderRequestNotificationDto;
  onboarding?: object;
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

export interface Coupon {
  code: string;
  name?: string;
  description?: string;
  currency: string;
  type: string;
  value: number;
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
  color?: string;
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

export interface UpdateUserStatusRequestDto {
  status: UserStatus;
  /** Optional note explaining the status change (audited). */
  reason?: string;
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

export interface CreateCouponRequestDto {
  code: string;
  name?: string;
  description?: string;
  /** @default "NGN" */
  currency: string;
  type: CouponType;
  /** @default 10 */
  value: number;
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

export interface Notification {
  entityId?: string;
  entityType?: EntityType;
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

export interface QuoteBulkOrderRequestDto {
  /** Order channel (e.g. VENDOR_STOREFRONT) */
  channel?: string;
  /** Minimum delivery fee floor in kobo (storefront override) */
  minimumDeliveryFee?: number;
  pickupLocations: QuoteLocationDto[];
  dropoffLocation: QuoteLocationDto;
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
  /** Callback URL for dispatch status updates (required for sequential dispatch) */
  callbackUrl?: string;
  /** Rider sorting strategy for sequential dispatch */
  sortingStrategy?: "BANDS" | "SCORING";
}

export interface ReDispatchRequestDto {
  /** Specific rider IDs to target */
  riderIds?: string[];
  /** Callback URL for dispatch status updates */
  callbackUrl: string;
  /** Rider sorting strategy */
  sortingStrategy?: "BANDS" | "SCORING";
}

export interface ReassignRiderRequestDto {
  /** The Pickriders user ID of the rider to ring */
  riderId: string;
  /** Callback URL for dispatch status updates */
  callbackUrl: string;
  /** Reason for reassigning the rider */
  reason?: string;
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

export interface CancelOrderRequestDto {
  reason: string;
  cancelledBy?: CancelledBy;
}

export interface MakeOfferRequestDto {
  offerAmount: number;
}

export interface InitializeOrderPaymentRequestDto {
  /** Email of the person paying for the order (receives the Paystack receipt). */
  email: string;
}

export interface AcceptRejectOfferRequestDto {
  status: Status;
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

export type GetHeartbeatData = any;

export type GetDeliveryPricingData = object;

export interface GetCountriesParams {
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type GetCountriesData = ListCountryResponseDto;

export type AddCountryData = Country;

export interface UpdateCountryParams {
  countryId: string;
}

export type UpdateCountryData = Country;

export interface GetCountryByIdParams {
  countryId: string;
}

export type GetCountryByIdData = Country;

export type AddCountryStatesPayload = StateDto[];

export interface AddCountryStatesParams {
  countryId: string;
}

export type AddCountryStatesData = StateDto[];

export interface GetCountryStatesParams {
  countryId: string;
}

export type GetCountryStatesData = ListStateResponseDto;

export interface GetCountryStateByIdParams {
  countryId: string;
  stateId: string;
}

export type GetCountryStateByIdData = State;

export interface UpdateCountryStateParams {
  countryId: string;
  stateId: string;
}

export type UpdateCountryStateData = State;

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

export interface GetUserWalletParams {
  walletId: string;
}

export type GetUserWalletData = Wallet;

export interface InitializeFundWalletParams {
  walletId: string;
}

export type InitializeFundWalletData = FundWalletResponseDto;

export interface CancelFundWalletParams {
  walletId: string;
}

export type CancelFundWalletData = CancelFundWalletResponseDto;

export interface UpdateSettlementAccountParams {
  walletId: string;
}

export type UpdateSettlementAccountData = Wallet;

export interface InitiateWithdrawalParams {
  walletId: string;
}

export type InitiateWithdrawalData = Wallet;

export type GetActiveCouponsData = object[];

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

export interface GetUserTransactionParams {
  transactionId: string;
}

export type GetUserTransactionData = Transaction;

export type DeleteUserAccountData = MessageResponseDto;

export type UpdatePhoneNumberData = MessageResponseDto;

export type UpdateEmailData = MessageResponseDto;

export type UpdateUserPreferencesData = User;

export type ToggleOnlinePresenceData = User;

export interface GetRiderOrderParams {
  orderId: string;
}

export type GetRiderOrderData = Order;

export type VerifyDriversLicenseData = User;

export type SubmitDriversLicenseData = object;

export type GetUserVehicleData = Vehicle;

export type CreateUser2Data = CreateUserRequestDto;

export interface GetUsersParams {
  /** For the rider list (isRider=true), sort by this field. completedDeliveries and totalEarned are lifetime rider metrics returned on each row. Combine with order=DESC for a leaderboard. */
  sortBy?:
    | "createdAt"
    | "lastLoginDate"
    | "completedDeliveries"
    | "totalEarned";
  /** Filter riders by licence KYC status. APPROVE = licence-approved (verified) riders. */
  driversLicenseVerified?:
    | "APPROVE"
    | "DISAPPROVE"
    | "SUSPENDED"
    | "SUBMITTED"
    | "PENDING";
  /** Search by user email, phone, firstname, lastname, middlename, or nin. This query is case insensitive. */
  userSearch?: string;
  /** Filter by setting either of the enum values ['0', '1', 'false', 'true'] */
  phoneVerified?: "0" | "1" | "false" | "true";
  /** Filter by setting either of the enum values ['0', '1', 'false', 'true'] */
  emailVerified?: "0" | "1" | "false" | "true";
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

export interface GetUserParams {
  userId: string;
}

export type GetUserData = User;

export interface GetUserWallets2Params {
  userId: string;
}

export type GetUserWallets2Data = WalletListResponseDto;

export interface UpdateUserStatusParams {
  userId: string;
}

export type UpdateUserStatusData = object;

export interface AdjustUserWalletParams {
  userId: string;
}

export type AdjustUserWalletData = object;

export interface RefundCustomerOrderParams {
  userId: string;
}

export type RefundCustomerOrderData = object;

export interface VerifyDriversLicense2Params {
  userId: string;
}

export type VerifyDriversLicense2Data = User;

export interface ApproveDriversLicenseSubmissionParams {
  userId: string;
}

export type ApproveDriversLicenseSubmissionData = object;

export interface UpdateDriversLicenseParams {
  userId: string;
}

export type UpdateDriversLicenseData = User;

export interface UpdateSettlementAccount2Params {
  userId: string;
  walletId: string;
}

export type UpdateSettlementAccount2Data = Wallet;

export type GetUserProfile2Data = User;

export type UpdateProfilePhoto2Data = UpdatedPhotoResponseDto;

export type UpdateUserAddresses2Data = MessageResponseDto;

export type ChangeUserPassword2Data = MessageResponseDto;

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

export interface GetTransactions2Params {
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

export type GetTransactions2Data = ListTransactionResponseDto;

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

export interface GetTransactionParams {
  transactionId: string;
}

export type GetTransactionData = Transaction;

export type CreateCouponData = object;

export type CreateGroupData = object;

export interface AddGroupUsersParams {
  groupId: string;
}

export type AddGroupUsersData = object;

export interface RemoveGroupUsersParams {
  groupId: string;
}

export type RemoveGroupUsersData = object;

export interface DeactivateCouponParams {
  couponCode: string;
}

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

export type GetBanks2Data = GetBanksResponseDto;

export type GetFinanceStatusData = any;

export type UpdateSettlementData = any;

export type SetPinData = any;

export type InitiatePayoutData = any;

export interface GetNotificationsParams {
  order?: "ASC" | "DESC";
  isRead?: any;
  page?: number;
  limit?: number;
}

export type GetNotificationsData = ListNotificationResponseDto;

export interface GetUserNotificationParams {
  notificationId: string;
}

export type GetUserNotificationData = Notification;

export type BulkMarkNotificationsAsReadData = MessageResponseDto;

export type CreateTemplateData = object;

export type TriggerNotificationData = any;

export type CreateBusinessData = CreateBusinessRequestDto;

export type CreateBusinessUserData = CreateBusinessUserRequestDto;

export interface GetBusinessUserParams {
  businessId: string;
  userId: string;
}

export type GetBusinessUserData = User;

export interface UpdateBusinessUserParams {
  businessId: string;
  userId: string;
}

export type UpdateBusinessUserData = User;

export interface RemoveUserFromBusinessParams {
  businessId: string;
  userId: string;
}

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

export interface AssignUserVehicleParams {
  vehicleId: string;
}

export type AssignUserVehicleData = MessageResponseDto;

export interface AddKycDetailsParams {
  businessId: string;
}

export type AddKycDetailsData = MessageResponseDto;

export interface GetUserReviewsParams {
  userId: string;
}

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

export interface GetBusinessTransactionParams {
  businessId: string;
  transactionId: string;
}

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

export interface GetBusinessOrderParams {
  businessId: string;
  orderId: string;
}

export type GetBusinessOrderData = Order;

export interface GetBusinessWalletsParams {
  businessId: string;
}

export type GetBusinessWalletsData = WalletListResponseDto;

export interface GetBusinessWalletParams {
  walletId: string;
  businessId: string;
}

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

export interface GetBusinessParams {
  businessId: string;
}

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

export interface UpdateBusinessPreferencesParams {
  businessId: string;
}

export type UpdateBusinessPreferencesData = Business;

export interface SuspendBusinessUserParams {
  businessId: string;
  userId: string;
}

export type SuspendBusinessUserData = User;

export interface UnsuspendBusinessUserParams {
  businessId: string;
  userId: string;
}

export type UnsuspendBusinessUserData = User;

export interface UpdateBusinessVehicleParams {
  businessId: string;
  vehicleId: string;
}

export type UpdateBusinessVehicleData = Vehicle;

export type GetReviewsData = ListReviewResponseDto;

export type RateRiderData = Review;

export type UpdateUserVehicleData = Vehicle;

export interface GetVehicleParams {
  vehicleId: string;
}

export type GetVehicleData = Vehicle;

export interface DeleteUserVehicleParams {
  vehicleId: string;
}

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

export interface UpdateUserVehicle2Params {
  userId: string;
}

export type UpdateUserVehicle2Data = Vehicle;

export interface VerifyVehicleParams {
  vehicleId: string;
  userId: string;
}

export type VerifyVehicleData = Vehicle;

export interface RejectVehicleParams {
  vehicleId: string;
  userId: string;
}

export type RejectVehicleData = Vehicle;

export interface SuspendVehicleParams {
  vehicleId: string;
  userId: string;
}

export type SuspendVehicleData = Vehicle;

export interface GetVehicle2Params {
  vehicleId: string;
}

export type GetVehicle2Data = Vehicle;

export interface DeleteVehicleParams {
  vehicleId: string;
}

export type DeleteVehicleData = MessageResponseDto;

export type CreateSingleOrderData = Order;

export type CreateBulkOrderData = Order;

export type QuoteOrderData = any;

export type QuoteBatchOrderData = any;

export type QuoteBulkOrderData = any;

export type CreateBatchOrderData = Order;

export interface RequestOrderRidersParams {
  orderId: string;
}

export type RequestOrderRidersData = User[];

export interface ReDispatchParams {
  orderId: string;
}

export type ReDispatchData = object;

export interface ReassignRiderParams {
  orderId: string;
}

export type ReassignRiderData = Order;

export type GetRidersLeaderboardData = any;

export type ListAllRidersData = any;

export type GetRiderLocationsData = any;

export interface CancelOrderLocationParams {
  orderId: string;
  locationId: string;
}

export type CancelOrderLocationData = OrderLocation;

export interface CancelOrderParams {
  orderId: string;
}

export type CancelOrderData = Order;

export interface MakeOrderOfferParams {
  orderId: string;
}

export type MakeOrderOfferData = Order;

export interface InitiateOrderPaymentParams {
  orderId: string;
  walletId: string;
}

export type InitiateOrderPaymentData = Order;

export interface CreateOrderPaymentLinkParams {
  orderId: string;
}

export type CreateOrderPaymentLinkData = any;

export interface VerifyOrderPaymentParams {
  orderId: string;
}

export type VerifyOrderPaymentData = Order;

export interface GetOrderPaymentInfoParams {
  token: string;
}

export type GetOrderPaymentInfoData = any;

export interface ConfirmExternalPaymentByReferenceParams {
  reference: string;
}

export type ConfirmExternalPaymentByReferenceData = any;

export interface InitializeExternalOrderPaymentParams {
  token: string;
}

export type InitializeExternalOrderPaymentData = any;

export interface AcceptOrRejectOrderOfferParams {
  orderId: string;
  offerId: string;
}

export type AcceptOrRejectOrderOfferData = Offer;

export interface StartOrderParams {
  orderId: string;
}

export type StartOrderData = Order;

export interface StartOrderLocationParams {
  orderId: string;
  locationId: string;
}

export type StartOrderLocationData = OrderLocation;

export interface UpdateOrderLocationStatusParams {
  orderId: string;
  locationId: string;
}

export type UpdateOrderLocationStatusData = OrderLocation;

export interface GetOrderEtaParams {
  orderId: string;
}

export type GetOrderEtaData = any;

export interface QuoteOrderLocationParams {
  orderId: string;
  locationId: string;
}

export type QuoteOrderLocationData = any;

export interface UpdateOrderLocationParams {
  orderId: string;
  locationId: string;
}

export type UpdateOrderLocationData = OrderLocationUpdate;

export interface RespondToLocationUpdateParams {
  orderId: string;
  locationId: string;
  updateId: string;
}

export type RespondToLocationUpdateData = OrderLocationUpdate;

export interface ApplyOrderCouponParams {
  orderId: string;
  couponCode: string;
}

export type ApplyOrderCouponData = Order;

export interface RemoveOrderCouponParams {
  orderId: string;
  couponCode: string;
}

export type RemoveOrderCouponData = object;

export interface CompleteOrderLocationParams {
  orderId: string;
  locationId: string;
}

export type CompleteOrderLocationData = OrderLocation;

export interface CompleteOrderParams {
  orderId: string;
}

export type CompleteOrderData = Order;

export interface QueueOrderParams {
  orderId: string;
}

export type QueueOrderData = Order;

export type GetQueuedOrdersData = Order[];

export interface GetActiveOffersParams {
  orderId: string;
}

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

export interface GetLatestLocationUpdateForCustomerParams {
  orderId: string;
}

export type GetLatestLocationUpdateForCustomerData = OrderLocationUpdate;

export interface GetUserOrderParams {
  orderId: string;
}

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
  page?: number;
  limit?: number;
}

export type GetOrdersData = ListOrderResponseDto;

export interface GetOrderParams {
  orderId: string;
}

export type GetOrderData = Order;

export interface CancelOrder2Params {
  orderId: string;
}

export type CancelOrder2Data = Order;

export interface UpdateOrderStatusParams {
  orderId: string;
}

export type UpdateOrderStatusData = Order;

export type GetLogsData = DataLogsResponseDto;

export interface FindAllParams {
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type FindAllData = ListAuditLogResponseDto;

export interface HandleWebhookEventsParams {
  provider: "PAYSTACK" | "FLUTTERWAVE";
}

export type HandleWebhookEventsData = object;

export type CreateTeamData = object;

export interface GetUserTeamParams {
  teamId: string;
}

export type GetUserTeamData = object;

export type CreateTeam2Data = object;

export type FindAll2Data = ListTeamsResponseDto;

export type RunData = any;
