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
  percentageCharge: number;
  minimumOfferPercentage: number;
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
   * Percentage charge value
   * @min 0
   * @max 100
   */
  percentageCharge?: number;
  /**
   * Minimum Percentage value
   * @min 0
   * @max 100
   */
  minimumOfferPercentage?: number;
  /** user withdrawal limits */
  userWithdrawalLimits?: WithdrawalLimitsDto;
  /** business withdrawal limits */
  businessWithdrawalLimits?: WithdrawalLimitsDto;
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
   * Minimum order orice
   * @default 200000
   */
  minimumOrderPrice: number;
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
}

export interface StateDto {
  name: string;
  /**
   * @minLength 2
   * @maxLength 3
   */
  code: string;
  /** Configuration for the state */
  config?: StateConfigDto;
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
    percentageCharge?: number;
    /** @default 2000000 */
    minimumOrderPrice?: number;
    /** @default 5 */
    maxRidersPerQuery?: number;
    /** @default 1 */
    maxActiveOrders?: number;
    /** @default 20 */
    maxDistanceRadius?: number;
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

export interface UpdateStateDto {
  /**
   * Name of the state
   * @example "California"
   */
  name: string;
  /** Configuration for the state */
  config?: StateConfigDto;
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
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  deletedAt?: string;
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
}

export interface UpdateLocationRequestDto {
  longitude: number;
  latitude: number;
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
  entityType: "USER" | "BUSINESS";
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

export interface UpdateSettlementAccountRequestDto {
  bankName: string;
  bankCode: string;
  accountName?: string;
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

export interface ListUserResponseDto {
  nextPage?: number | null;
  previousPage?: number | null;
  currentPage: number;
  results: User[];
  perPageLimit: number;
  totalRecords: number;
  totalPages: number;
}

export interface Transaction {
  entityId: string;
  walletId?: string;
  entityType: "USER" | "BUSINESS";
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
  category:
    | "FEES"
    | "BONUS"
    | "REFUND"
    | "ORDER_PAYMENT"
    | "ORDER_EARNING"
    | "WALLET_FUNDING"
    | "REFERRAL_BONUS"
    | "CARD_DEPOSIT"
    | "BANK_DEPOSIT";
  purpose: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "REVERSAL";
  status: "PROCESSING" | "FAILED" | "SUCCESS";
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
  amountTo: number;
  distanceTo: number;
  currency: string;
  confirmationCode?: string;
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
  negotiatedAmount: number;
  offers: Offer[];
  currency: string;
  /** @format date-time */
  scheduledFor?: string;
  color?: string;
  business?: Business;
  user?: User;
  vehicle?: Vehicle;
  rider?: User;
  coupon?: Coupon;
  transactions?: Transaction[];
  _id: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface Offer {
  orderId: string;
  riderId: string;
  /** @default false */
  accepted: boolean;
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

/** @default "SUSPENDED" */
export enum Status {
  APPROVE = "APPROVE",
  DISAPPROVE = "DISAPPROVE",
  SUSPENDED = "SUSPENDED",
  SUBMITTED = "SUBMITTED",
  PENDING = "PENDING",
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

export enum CouponType {
  FIXED = "FIXED",
  PERCENTAGE = "PERCENTAGE",
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
  data: BankResponseDto;
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

export interface Notification {
  entityId?: string;
  entityType?: "USER" | "BUSINESS";
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

/** @default "USER" */
export enum EntityType {
  USER = "USER",
  BUSINESS = "BUSINESS",
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
  /** Notification actions */
  actions?: NotificationAction[];
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

export interface RateRiderResponseDto {
  message: string;
  status: string;
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
  pickupLocations: CreateBulkPickupLocationDto[];
  dropoffLocation: CreateSingleDropoffLocationDto;
  type: "SINGLE" | "BATCH" | "BULK";
  userId?: string;
}

export interface CreateBatchPickupLocationDto {
  address: string;
  longitude: number;
  latitude: number;
  description?: string;
  senderName?: string;
  senderPhone?: string;
  type: "PICKUP" | "DROPOFF";
}

export interface CreateBatchDropoffLocationDto {
  address: string;
  longitude: number;
  latitude: number;
  packageName: string;
  description?: string;
  receiverName: string;
  receiverPhone: string;
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
}

export interface CancelLocationRequestDto {
  reason: string;
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
}

export interface MakeOfferRequestDto {
  offerAmount: number;
}

export interface AcceptRejectOfferRequestDto {
  /** @default false */
  accepted: boolean;
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
}

export interface CompleteLocationRequestDto {
  /** @minLength 4 */
  confirmationCode?: string;
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
  actionType: "ADMIN" | "BUSINESS" | "DEVELOPER" | "SYSTEM" | "USER";
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

export interface GetCountriesParams {
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type GetCountriesData = ListCountryResponseDto;

export type AddCountryData = Country;

export type UpdateCountryData = Country;

export type GetCountryByIdData = Country;

export type AddCountryStatesPayload = string[];

export type AddCountryStatesData = StateDto[];

export type GetCountryStatesData = ListStateResponseDto;

export type GetCountryStateByIdData = State;

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

export interface CreateUserParams {
  referralCode?: any;
}

export type CreateUserData = CreateUserRequestDto;

export type GetUserProfileData = User;

export type UpdateUserProfileData = User;

export type UpdateUserLocationData = User;

export type UpdateProfilePhotoData = UpdatedPhotoResponseDto;

export type UpdateUserAddressesData = MessageResponseDto;

export type UserKycVerificationData = MessageResponseDto;

export type ChangeUserPasswordData = MessageResponseDto;

export type GetUserWalletsData = WalletListResponseDto;

export type GetUserWalletData = Wallet;

export type InitializeFundWalletData = FundWalletResponseDto;

export type UpdateSettlementAccountData = Wallet;

export type InitiateWithdrawalData = Wallet;

export type GetActiveCouponsData = object[];

export interface GetAllReferralsParams {
  /** the records sorting order */
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type GetAllReferralsData = ListUserResponseDto;

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

export type CreateUser2Data = CreateUserRequestDto;

export interface GetUsersParams {
  /** Filter by setting either of the enum values ['0', '1', 'false', 'true'] */
  phoneVerified?: "0" | "1" | "false" | "true";
  /** Filter by setting either of the enum values ['0', '1', 'false', 'true'] */
  emailVerified?: "0" | "1" | "false" | "true";
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

export type GetUserData = User;

export type VerifyDriversLicense2Data = object;

export type UpdateDriversLicenseData = User;

export type UpdateSettlementAccount2Data = Wallet;

export type GetUserProfile2Data = User;

export type UpdateProfilePhoto2Data = UpdatedPhotoResponseDto;

export type UpdateUserAddresses2Data = MessageResponseDto;

export type ChangeUserPassword2Data = MessageResponseDto;

export type CreateWalletData = Wallet;

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
  /** transaction category filter. commap separated list of TransactionCategory */
  category?: string;
  /** transaction status filter. comma separated list of TransactionStatus */
  status?: string;
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type GetTransactions2Data = ListTransactionResponseDto;

export type GetTransactionData = Transaction;

export type CreateCouponData = object;

export type CreateGroupData = object;

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
  /** Allowed categories separated by comma : FEES,BONUS,REFUND,ORDER_PAYMENT,ORDER_EARNING,WALLET_FUNDING,REFERRAL_BONUS,CARD_DEPOSIT,BANK_DEPOSIT */
  category?: string;
  /** Allowed statuses separated by comma : PROCESSING,FAILED,SUCCESS */
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

export type GetReviewsData = ListReviewResponseDto;

export type RateRiderData = RateRiderResponseDto;

export type UpdateUserVehicleData = Vehicle;

export type GetVehicleData = Vehicle;

export type DeleteUserVehicleData = MessageResponseDto;

export interface GetVehiclesParams {
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

export type UpdateUserVehicle2Data = Vehicle;

export type VerifyVehicleData = Vehicle;

export type RejectVehicleData = Vehicle;

export type SuspendVehicleData = Vehicle;

export type GetVehicle2Data = Vehicle;

export type DeleteVehicleData = MessageResponseDto;

export type CreateSingleOrderData = Order;

export type CreateBulkOrderData = Order;

export type CreateBatchOrderData = Order;

export type RequestOrderRidersData = User[];

export type CancelOrderLocationData = OrderLocation;

export type CancelOrderData = Order;

export type MakeOrderOfferData = Order;

export type InitiateOrderPaymentData = Order;

export type AcceptOrRejectOrderOfferData = Offer;

export type StartOrderData = Order;

export type StartOrderLocationData = OrderLocation;

export type UpdateOrderLocationStatusData = OrderLocation;

export type ApplyOrderCouponData = Order;

export type RemoveOrderCouponData = object;

export type CompleteOrderLocationData = OrderLocation;

export type CompleteOrderData = Order;

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

export type GetLogsData = DataLogsResponseDto;

export interface FindAllParams {
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export type FindAllData = ListAuditLogResponseDto;

export type HandleWebhookEventsData = object;
