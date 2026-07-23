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

import {
  AcceptOrRejectOrderOfferData,
  AcceptOrRejectOrderOfferParams,
  AcceptRejectOfferRequestDto,
  AddCountryData,
  AddCountryDto,
  AddCountryStatesData,
  AddCountryStatesParams,
  AddCountryStatesPayload,
  AddGroupUsersData,
  AddGroupUsersParams,
  AddKycDetailsData,
  AddKycDetailsParams,
  AddVehiclesData,
  AddVehiclesDto,
  ApplyOrderCouponData,
  ApplyOrderCouponParams,
  ApproveDriversLicenseSubmissionData,
  ApproveDriversLicenseSubmissionParams,
  AssignUserVehicleData,
  AssignUserVehicleParams,
  AssignVehicleDto,
  BulkMarkNotificationsAsReadData,
  CancelLocationRequestDto,
  CancelOrderData,
  CancelOrderLocationData,
  CancelOrderLocationParams,
  CancelOrderParams,
  CancelOrderRequestDto,
  ChangePasswordRequestDto,
  ChangeUserPassword2Data,
  ChangeUserPasswordData,
  CheckTokenValidityData,
  CompleteLocationRequestDto,
  CompleteOrderData,
  CompleteOrderLocationData,
  CompleteOrderLocationParams,
  CompleteOrderParams,
  CreateBatchOrderData,
  CreateBatchOrderDto,
  CreateBulkOrderData,
  CreateBulkOrderDto,
  CreateBusinessData,
  CreateBusinessRequestDto,
  CreateBusinessUserData,
  CreateBusinessUserRequestDto,
  CreateCouponData,
  CreateCouponRequestDto,
  CreateDedicatedVirtualAccountData,
  CreateGroupData,
  CreateGroupRequestDto,
  CreateSingleOrderData,
  CreateSingleOrderDto,
  CreateTemplateData,
  CreateTemplateRequestDto,
  CreateUser2Data,
  CreateUserData,
  CreateUserParams,
  CreateUserRequestDto,
  CreateVirtualAccountRequestDto,
  CreateWalletData,
  DeactivateCouponData,
  DeactivateCouponParams,
  DeleteUserAccountData,
  DeleteUserVehicleData,
  DeleteUserVehicleParams,
  DeleteVehicleData,
  DeleteVehicleParams,
  FindAllData,
  FindAllParams,
  FundWalletRequestDto,
  GetActiveCouponsData,
  GetActiveOffersData,
  GetActiveOffersParams,
  GetAllReferralsData,
  GetAllReferralsParams,
  GetBanksData,
  GetBanksParams,
  GetBusinessData,
  GetBusinessOrderData,
  GetBusinessOrderParams,
  GetBusinessOrderStatisticsData,
  GetBusinessOrderStatisticsParams,
  GetBusinessOrderStatusChartData,
  GetBusinessOrderStatusChartParams,
  GetBusinessOrderTypeChartData,
  GetBusinessOrderTypeChartParams,
  GetBusinessOrdersData,
  GetBusinessOrdersParams,
  GetBusinessParams,
  GetBusinessTransactionData,
  GetBusinessTransactionParams,
  GetBusinessTransactionsData,
  GetBusinessTransactionsParams,
  GetBusinessUserData,
  GetBusinessUserParams,
  GetBusinessUsersData,
  GetBusinessUsersParams,
  GetBusinessVehiclesData,
  GetBusinessVehiclesParams,
  GetBusinessWalletData,
  GetBusinessWalletParams,
  GetBusinessWalletsData,
  GetBusinessWalletsParams,
  GetCountriesData,
  GetCountriesParams,
  GetCountryByIdData,
  GetCountryByIdParams,
  GetCountryStateByIdData,
  GetCountryStateByIdParams,
  GetCountryStatesData,
  GetCountryStatesParams,
  GetHeartbeatData,
  GetLogsData,
  GetNotificationsData,
  GetNotificationsParams,
  GetOrderData,
  GetOrderParams,
  GetOrderStatusChartData,
  GetOrderStatusChartParams,
  GetOrderTypeChartData,
  GetOrderTypeChartParams,
  GetOrdersData,
  GetOrdersParams,
  GetPlatformWalletData,
  GetQueuedOrdersData,
  GetReviewsData,
  GetRiderOrderData,
  GetRiderOrderParams,
  GetRiderOrderStatisticsData,
  GetRiderOrderStatisticsParams,
  GetRiderOrdersData,
  GetRiderOrdersParams,
  GetTransactionData,
  GetTransactionParams,
  GetTransactions2Data,
  GetTransactions2Params,
  GetTransactionsData,
  GetTransactionsParams,
  GetUserData,
  GetUserNotificationData,
  GetUserNotificationParams,
  GetUserOrderData,
  GetUserOrderParams,
  GetUserOrdersData,
  GetUserOrdersParams,
  GetUserParams,
  GetUserProfile2Data,
  GetUserProfileData,
  GetUserReviewsData,
  GetUserReviewsParams,
  GetUserTransactionData,
  GetUserTransactionParams,
  GetUserTransactionsData,
  GetUserTransactionsParams,
  GetUserVehicleData,
  GetUserWalletData,
  GetUserWalletParams,
  GetUserWalletsData,
  GetUsersData,
  GetUsersParams,
  GetVehicle2Data,
  GetVehicle2Params,
  GetVehicleData,
  GetVehicleParams,
  GetVehiclesData,
  GetVehiclesParams,
  GoogleSignInData,
  GoogleSignInRequestDto,
  HandleWebhookEventsData,
  HandleWebhookEventsParams,
  InitializeFundWalletData,
  InitializeFundWalletParams,
  InitiateOrderPaymentData,
  InitiateOrderPaymentParams,
  InitiateWithdrawalData,
  InitiateWithdrawalParams,
  InitiateWithdrawalRequestDto,
  KYCDetailsDto,
  LoginAdminsData,
  LoginBusinessData,
  LoginData,
  LoginRequestDto,
  MakeOfferRequestDto,
  MakeOrderOfferData,
  MakeOrderOfferParams,
  NewFeatureLaunchNotificationData,
  Object,
  PasswordResetData,
  PasswordResetRequestData,
  QueueOrderData,
  QueueOrderParams,
  RateRiderData,
  RateRiderRequestDto,
  RejectVehicleData,
  RejectVehicleParams,
  RemoveGroupUsersData,
  RemoveGroupUsersParams,
  RemoveOrderCouponData,
  RemoveOrderCouponParams,
  RemoveUserFromBusinessData,
  RemoveUserFromBusinessParams,
  RequestOrderRidersData,
  RequestOrderRidersParams,
  ResendTokenData,
  ResetPasswordRequestDto,
  RidersRequestDto,
  RunData,
  StartOrderData,
  StartOrderLocationData,
  StartOrderLocationParams,
  StartOrderParams,
  SubmitDriversLicenseData,
  SubmitDriversLicenseRequestDto,
  SuspendBusinessUserData,
  SuspendBusinessUserParams,
  SuspendVehicleData,
  SuspendVehicleParams,
  ToggleOnlinePresenceData,
  TokenRequestDto,
  TriggerNotificationData,
  TriggerNotificationRequestDto,
  UnsuspendBusinessUserData,
  UnsuspendBusinessUserParams,
  UpdateAddressesRequestDto,
  UpdateBusinessPreferencesData,
  UpdateBusinessPreferencesParams,
  UpdateBusinessUserData,
  UpdateBusinessUserParams,
  UpdateBusinessVehicleData,
  UpdateBusinessVehicleParams,
  UpdateCountryData,
  UpdateCountryDto,
  UpdateCountryParams,
  UpdateCountryStateData,
  UpdateCountryStateParams,
  UpdateDriverLicenseRequestDto,
  UpdateDriversLicenseData,
  UpdateDriversLicenseParams,
  UpdateEmailData,
  UpdateEmailRequestDto,
  UpdateGroupUsersRequestDto,
  UpdateLocationRequestDto,
  UpdateLocationStatusRequestDto,
  UpdateNotificationsRequestDto,
  UpdateOrderLocationStatusData,
  UpdateOrderLocationStatusParams,
  UpdatePhoneNumberData,
  UpdatePhoneRequestDto,
  UpdatePhotoRequestDto,
  UpdatePreferencesRequestDto,
  UpdateProfilePhoto2Data,
  UpdateProfilePhotoData,
  UpdateProfileRequestDto,
  UpdateSettlementAccount2Data,
  UpdateSettlementAccount2Params,
  UpdateSettlementAccountData,
  UpdateSettlementAccountParams,
  UpdateSettlementAccountRequestDto,
  UpdateStateDto,
  UpdateUserAddresses2Data,
  UpdateUserAddressesData,
  UpdateUserLocationData,
  UpdateUserPreferencesData,
  UpdateUserProfileData,
  UpdateUserVehicle2Data,
  UpdateUserVehicle2Params,
  UpdateUserVehicleData,
  UpdateVehicleRequestDto,
  UpdateVehicleStatusRequestDto,
  UserKYCDetailDto,
  UserKycVerificationData,
  VerifyDriversLicense2Data,
  VerifyDriversLicense2Params,
  VerifyDriversLicenseData,
  VerifyEmailData,
  VerifyEmailRequestDto,
  VerifyPhoneData,
  VerifyPhoneRequestDto,
  VerifyVehicleData,
  VerifyVehicleParams,
  WalletCreateRequestDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Api<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name GetHeartbeat
   * @request GET:/api/v1/ping
   * @response `200` `GetHeartbeatData`
   */
  getHeartbeat = (params: RequestParams = {}) =>
    this.request<GetHeartbeatData, any>({
      path: `/api/v1/ping`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-configs
   * @name GetCountries
   * @request GET:/api/v1/admin-configs/countries
   * @secure
   * @response `200` `GetCountriesData`
   */
  getCountries = (query: GetCountriesParams, params: RequestParams = {}) =>
    this.request<GetCountriesData, any>({
      path: `/api/v1/admin-configs/countries`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-configs
   * @name AddCountry
   * @request POST:/api/v1/admin-configs/countries
   * @secure
   * @response `201` `AddCountryData`
   */
  addCountry = (data: AddCountryDto, params: RequestParams = {}) =>
    this.request<AddCountryData, any>({
      path: `/api/v1/admin-configs/countries`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-configs
   * @name UpdateCountry
   * @request PATCH:/api/v1/admin-configs/countries/{countryId}
   * @secure
   * @response `200` `UpdateCountryData`
   */
  updateCountry = (
    { countryId, ...query }: UpdateCountryParams,
    data: UpdateCountryDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateCountryData, any>({
      path: `/api/v1/admin-configs/countries/${countryId}`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-configs
   * @name GetCountryById
   * @request GET:/api/v1/admin-configs/countries/{countryId}
   * @secure
   * @response `200` `GetCountryByIdData`
   */
  getCountryById = (
    { countryId, ...query }: GetCountryByIdParams,
    params: RequestParams = {},
  ) =>
    this.request<GetCountryByIdData, any>({
      path: `/api/v1/admin-configs/countries/${countryId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-configs
   * @name AddCountryStates
   * @request POST:/api/v1/admin-configs/countries/{countryId}/states
   * @secure
   * @response `201` `AddCountryStatesData`
   */
  addCountryStates = (
    { countryId, ...query }: AddCountryStatesParams,
    data: AddCountryStatesPayload,
    params: RequestParams = {},
  ) =>
    this.request<AddCountryStatesData, any>({
      path: `/api/v1/admin-configs/countries/${countryId}/states`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-configs
   * @name GetCountryStates
   * @request GET:/api/v1/admin-configs/countries/{countryId}/states
   * @secure
   * @response `200` `GetCountryStatesData`
   */
  getCountryStates = (
    { countryId, ...query }: GetCountryStatesParams,
    params: RequestParams = {},
  ) =>
    this.request<GetCountryStatesData, any>({
      path: `/api/v1/admin-configs/countries/${countryId}/states`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-configs
   * @name GetCountryStateById
   * @request GET:/api/v1/admin-configs/countries/{countryId}/states/{stateId}
   * @secure
   * @response `200` `GetCountryStateByIdData`
   */
  getCountryStateById = (
    { countryId, stateId, ...query }: GetCountryStateByIdParams,
    params: RequestParams = {},
  ) =>
    this.request<GetCountryStateByIdData, any>({
      path: `/api/v1/admin-configs/countries/${countryId}/states/${stateId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admin-configs
   * @name UpdateCountryState
   * @request PATCH:/api/v1/admin-configs/countries/{countryId}/states/{stateId}
   * @secure
   * @response `200` `UpdateCountryStateData`
   */
  updateCountryState = (
    { countryId, stateId, ...query }: UpdateCountryStateParams,
    data: UpdateStateDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateCountryStateData, any>({
      path: `/api/v1/admin-configs/countries/${countryId}/states/${stateId}`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name LoginAdmins
   * @request POST:/api/v1/auth/admins/login
   * @response `201` `LoginAdminsData`
   */
  loginAdmins = (data: LoginRequestDto, params: RequestParams = {}) =>
    this.request<LoginAdminsData, any>({
      path: `/api/v1/auth/admins/login`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name Login
   * @request POST:/api/v1/auth/users/login
   * @response `201` `LoginData`
   */
  login = (data: LoginRequestDto, params: RequestParams = {}) =>
    this.request<LoginData, any>({
      path: `/api/v1/auth/users/login`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name LoginBusiness
   * @request POST:/api/v1/auth/businesses/login
   * @response `201` `LoginBusinessData`
   */
  loginBusiness = (data: LoginRequestDto, params: RequestParams = {}) =>
    this.request<LoginBusinessData, any>({
      path: `/api/v1/auth/businesses/login`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name VerifyPhone
   * @request POST:/api/v1/auth/verify/phone
   * @response `201` `VerifyPhoneData`
   */
  verifyPhone = (data: VerifyPhoneRequestDto, params: RequestParams = {}) =>
    this.request<VerifyPhoneData, any>({
      path: `/api/v1/auth/verify/phone`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name VerifyEmail
   * @request POST:/api/v1/auth/verify/email
   * @response `201` `VerifyEmailData`
   */
  verifyEmail = (data: VerifyEmailRequestDto, params: RequestParams = {}) =>
    this.request<VerifyEmailData, any>({
      path: `/api/v1/auth/verify/email`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name PasswordResetRequest
   * @request POST:/api/v1/auth/password-reset-request
   * @response `201` `PasswordResetRequestData`
   */
  passwordResetRequest = (data: TokenRequestDto, params: RequestParams = {}) =>
    this.request<PasswordResetRequestData, any>({
      path: `/api/v1/auth/password-reset-request`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name PasswordReset
   * @request POST:/api/v1/auth/password-reset
   * @response `201` `PasswordResetData`
   */
  passwordReset = (data: ResetPasswordRequestDto, params: RequestParams = {}) =>
    this.request<PasswordResetData, any>({
      path: `/api/v1/auth/password-reset`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name ResendToken
   * @request POST:/api/v1/auth/resend-token
   * @response `201` `ResendTokenData`
   */
  resendToken = (data: TokenRequestDto, params: RequestParams = {}) =>
    this.request<ResendTokenData, any>({
      path: `/api/v1/auth/resend-token`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name CheckTokenValidity
   * @request POST:/api/v1/auth/check-token
   * @response `201` `CheckTokenValidityData`
   */
  checkTokenValidity = (
    data: VerifyPhoneRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<CheckTokenValidityData, any>({
      path: `/api/v1/auth/check-token`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags auth
   * @name GoogleSignIn
   * @request POST:/api/v1/auth/google
   * @response `201` `GoogleSignInData`
   */
  googleSignIn = (data: GoogleSignInRequestDto, params: RequestParams = {}) =>
    this.request<GoogleSignInData, any>({
      path: `/api/v1/auth/google`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name CreateUser
   * @request POST:/api/v1/users
   * @response `201` `CreateUserData`
   */
  createUser = (
    query: CreateUserParams,
    data: CreateUserRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<CreateUserData, any>({
      path: `/api/v1/users`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name GetUserProfile
   * @request GET:/api/v1/users/me
   * @secure
   * @response `200` `GetUserProfileData`
   */
  getUserProfile = (params: RequestParams = {}) =>
    this.request<GetUserProfileData, any>({
      path: `/api/v1/users/me`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name UpdateUserProfile
   * @request PATCH:/api/v1/users/me/update-profile
   * @secure
   * @response `200` `UpdateUserProfileData`
   */
  updateUserProfile = (
    data: UpdateProfileRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateUserProfileData, any>({
      path: `/api/v1/users/me/update-profile`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name UpdateUserLocation
   * @request PATCH:/api/v1/users/me/update-location
   * @secure
   * @response `200` `UpdateUserLocationData`
   */
  updateUserLocation = (
    data: UpdateLocationRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateUserLocationData, any>({
      path: `/api/v1/users/me/update-location`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name UpdateProfilePhoto
   * @request PATCH:/api/v1/users/me/update-profile-photo
   * @secure
   * @response `200` `UpdateProfilePhotoData`
   */
  updateProfilePhoto = (
    data: UpdatePhotoRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateProfilePhotoData, any>({
      path: `/api/v1/users/me/update-profile-photo`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name UpdateUserAddresses
   * @request PATCH:/api/v1/users/me/update-addresses
   * @secure
   * @response `200` `UpdateUserAddressesData`
   */
  updateUserAddresses = (
    data: UpdateAddressesRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateUserAddressesData, any>({
      path: `/api/v1/users/me/update-addresses`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name UserKycVerification
   * @request PUT:/api/v1/users/me/kyc
   * @secure
   * @response `200` `UserKycVerificationData`
   */
  userKycVerification = (data: UserKYCDetailDto, params: RequestParams = {}) =>
    this.request<UserKycVerificationData, any>({
      path: `/api/v1/users/me/kyc`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name ChangeUserPassword
   * @request PATCH:/api/v1/users/me/password-change
   * @secure
   * @response `200` `ChangeUserPasswordData`
   */
  changeUserPassword = (
    data: ChangePasswordRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<ChangeUserPasswordData, any>({
      path: `/api/v1/users/me/password-change`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name GetUserWallets
   * @request GET:/api/v1/users/me/wallets
   * @secure
   * @response `200` `GetUserWalletsData`
   */
  getUserWallets = (params: RequestParams = {}) =>
    this.request<GetUserWalletsData, any>({
      path: `/api/v1/users/me/wallets`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name GetUserWallet
   * @request GET:/api/v1/users/me/wallets/{walletId}
   * @secure
   * @response `200` `GetUserWalletData`
   */
  getUserWallet = (
    { walletId, ...query }: GetUserWalletParams,
    params: RequestParams = {},
  ) =>
    this.request<GetUserWalletData, any>({
      path: `/api/v1/users/me/wallets/${walletId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name InitializeFundWallet
   * @request POST:/api/v1/users/me/wallets/{walletId}/initialize-funding
   * @secure
   * @response `201` `InitializeFundWalletData`
   */
  initializeFundWallet = (
    { walletId, ...query }: InitializeFundWalletParams,
    data: FundWalletRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<InitializeFundWalletData, any>({
      path: `/api/v1/users/me/wallets/${walletId}/initialize-funding`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name UpdateSettlementAccount
   * @request PATCH:/api/v1/users/me/wallets/{walletId}/settlement-account
   * @secure
   * @response `200` `UpdateSettlementAccountData`
   */
  updateSettlementAccount = (
    { walletId, ...query }: UpdateSettlementAccountParams,
    data: UpdateSettlementAccountRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateSettlementAccountData, any>({
      path: `/api/v1/users/me/wallets/${walletId}/settlement-account`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name InitiateWithdrawal
   * @request PATCH:/api/v1/users/me/wallets/{walletId}/withdrawal-request
   * @secure
   * @response `200` `InitiateWithdrawalData`
   */
  initiateWithdrawal = (
    { walletId, ...query }: InitiateWithdrawalParams,
    data: InitiateWithdrawalRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<InitiateWithdrawalData, any>({
      path: `/api/v1/users/me/wallets/${walletId}/withdrawal-request`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name GetActiveCoupons
   * @request GET:/api/v1/users/me/coupons
   * @secure
   * @response `200` `GetActiveCouponsData`
   */
  getActiveCoupons = (params: RequestParams = {}) =>
    this.request<GetActiveCouponsData, any>({
      path: `/api/v1/users/me/coupons`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name GetAllReferrals
   * @request GET:/api/v1/users/me/referrals
   * @secure
   * @response `200` `GetAllReferralsData`
   */
  getAllReferrals = (
    query: GetAllReferralsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetAllReferralsData, any>({
      path: `/api/v1/users/me/referrals`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name GetUserTransactions
   * @request GET:/api/v1/users/me/transactions
   * @secure
   * @response `200` `GetUserTransactionsData`
   */
  getUserTransactions = (
    query: GetUserTransactionsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetUserTransactionsData, any>({
      path: `/api/v1/users/me/transactions`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name GetUserTransaction
   * @request GET:/api/v1/users/me/transactions/{transactionId}
   * @secure
   * @response `200` `GetUserTransactionData`
   */
  getUserTransaction = (
    { transactionId, ...query }: GetUserTransactionParams,
    params: RequestParams = {},
  ) =>
    this.request<GetUserTransactionData, any>({
      path: `/api/v1/users/me/transactions/${transactionId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name DeleteUserAccount
   * @request DELETE:/api/v1/users/me/delete-account
   * @secure
   * @response `200` `DeleteUserAccountData`
   */
  deleteUserAccount = (params: RequestParams = {}) =>
    this.request<DeleteUserAccountData, any>({
      path: `/api/v1/users/me/delete-account`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name UpdatePhoneNumber
   * @request PATCH:/api/v1/users/me/phone
   * @secure
   * @response `200` `UpdatePhoneNumberData`
   */
  updatePhoneNumber = (
    data: UpdatePhoneRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdatePhoneNumberData, any>({
      path: `/api/v1/users/me/phone`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name UpdateEmail
   * @request PATCH:/api/v1/users/me/email
   * @secure
   * @response `200` `UpdateEmailData`
   */
  updateEmail = (data: UpdateEmailRequestDto, params: RequestParams = {}) =>
    this.request<UpdateEmailData, any>({
      path: `/api/v1/users/me/email`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name UpdateUserPreferences
   * @request PATCH:/api/v1/users/me/preferences
   * @secure
   * @response `200` `UpdateUserPreferencesData`
   */
  updateUserPreferences = (
    data: UpdatePreferencesRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateUserPreferencesData, any>({
      path: `/api/v1/users/me/preferences`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name ToggleOnlinePresence
   * @request PATCH:/api/v1/users/me/toggle-presence
   * @secure
   * @response `200` `ToggleOnlinePresenceData`
   */
  toggleOnlinePresence = (params: RequestParams = {}) =>
    this.request<ToggleOnlinePresenceData, any>({
      path: `/api/v1/users/me/toggle-presence`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name GetRiderOrder
   * @request GET:/api/v1/users/me/orders/{orderId}
   * @secure
   * @response `200` `GetRiderOrderData`
   */
  getRiderOrder = (
    { orderId, ...query }: GetRiderOrderParams,
    params: RequestParams = {},
  ) =>
    this.request<GetRiderOrderData, any>({
      path: `/api/v1/users/me/orders/${orderId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name VerifyDriversLicense
   * @request PATCH:/api/v1/users/me/documents/drivers-license/verify
   * @secure
   * @response `200` `VerifyDriversLicenseData`
   */
  verifyDriversLicense = (
    data: SubmitDriversLicenseRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<VerifyDriversLicenseData, any>({
      path: `/api/v1/users/me/documents/drivers-license/verify`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name SubmitDriversLicense
   * @request PATCH:/api/v1/users/me/documents/drivers-license
   * @secure
   * @response `200` `SubmitDriversLicenseData`
   */
  submitDriversLicense = (
    data: SubmitDriversLicenseRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<SubmitDriversLicenseData, any>({
      path: `/api/v1/users/me/documents/drivers-license`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags users
   * @name GetUserVehicle
   * @request GET:/api/v1/users/me/vehicle
   * @secure
   * @response `200` `GetUserVehicleData`
   */
  getUserVehicle = (params: RequestParams = {}) =>
    this.request<GetUserVehicleData, any>({
      path: `/api/v1/users/me/vehicle`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/users
   * @name NewFeatureLaunchNotification
   * @request PATCH:/api/v1/admins/users/new-features-nofitication
   * @secure
   * @response `200` `NewFeatureLaunchNotificationData`
   */
  newFeatureLaunchNotification = (params: RequestParams = {}) =>
    this.request<NewFeatureLaunchNotificationData, any>({
      path: `/api/v1/admins/users/new-features-nofitication`,
      method: "PATCH",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/users
   * @name CreateUser2
   * @request POST:/api/v1/admins/users
   * @originalName createUser
   * @duplicate
   * @response `201` `CreateUser2Data`
   */
  createUser2 = (data: CreateUserRequestDto, params: RequestParams = {}) =>
    this.request<CreateUser2Data, any>({
      path: `/api/v1/admins/users`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/users
   * @name GetUsers
   * @request GET:/api/v1/admins/users
   * @secure
   * @response `200` `GetUsersData`
   */
  getUsers = (query: GetUsersParams, params: RequestParams = {}) =>
    this.request<GetUsersData, any>({
      path: `/api/v1/admins/users`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/users
   * @name GetUser
   * @request GET:/api/v1/admins/users/{userId}
   * @secure
   * @response `200` `GetUserData`
   */
  getUser = ({ userId, ...query }: GetUserParams, params: RequestParams = {}) =>
    this.request<GetUserData, any>({
      path: `/api/v1/admins/users/${userId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * Hand-added — re-add after any regen. Admin customer-console actions.
   * Backend: src/users/users.admins.controller.ts.
   */
  getUserWalletsAdmin = ({ userId }: { userId: string }, params: RequestParams = {}) =>
    this.request<import("./data-contracts").WalletListResponseDto, any>({
      path: `/api/v1/admins/users/${userId}/wallets`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  updateUserStatus = (
    { userId }: { userId: string },
    data: import("./data-contracts").AdminUpdateUserStatusDto,
    params: RequestParams = {},
  ) =>
    this.request<import("./data-contracts").User, any>({
      path: `/api/v1/admins/users/${userId}/status`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  adjustUserWallet = (
    { userId }: { userId: string },
    data: import("./data-contracts").AdminAdjustWalletDto,
    params: RequestParams = {},
  ) =>
    this.request<any, any>({
      path: `/api/v1/admins/users/${userId}/wallets/adjust`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  refundCustomerOrder = (
    { userId }: { userId: string },
    data: import("./data-contracts").AdminRefundOrderDto,
    params: RequestParams = {},
  ) =>
    this.request<any, any>({
      path: `/api/v1/admins/users/${userId}/refund`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/users
   * @name VerifyDriversLicense2
   * @request PATCH:/api/v1/admins/users/{userId}/drivers-license/verify
   * @originalName verifyDriversLicense
   * @duplicate
   * @secure
   * @response `200` `VerifyDriversLicense2Data`
   */
  verifyDriversLicense2 = (
    { userId, ...query }: VerifyDriversLicense2Params,
    data: SubmitDriversLicenseRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<VerifyDriversLicense2Data, any>({
      path: `/api/v1/admins/users/${userId}/drivers-license/verify`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/users
   * @name ApproveDriversLicenseSubmission
   * @request PATCH:/api/v1/admins/users/{userId}/drivers-license/approve
   * @secure
   * @response `200` `ApproveDriversLicenseSubmissionData`
   */
  approveDriversLicenseSubmission = (
    { userId, ...query }: ApproveDriversLicenseSubmissionParams,
    params: RequestParams = {},
  ) =>
    this.request<ApproveDriversLicenseSubmissionData, any>({
      path: `/api/v1/admins/users/${userId}/drivers-license/approve`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/users
   * @name UpdateDriversLicense
   * @request PATCH:/api/v1/admins/users/{userId}/drivers-license/update
   * @secure
   * @response `200` `UpdateDriversLicenseData`
   */
  updateDriversLicense = (
    { userId, ...query }: UpdateDriversLicenseParams,
    data: UpdateDriverLicenseRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateDriversLicenseData, any>({
      path: `/api/v1/admins/users/${userId}/drivers-license/update`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/users
   * @name UpdateSettlementAccount2
   * @request PATCH:/api/v1/admins/users/users/{userId}/wallets/{walletId}/settlement-account
   * @originalName updateSettlementAccount
   * @duplicate
   * @secure
   * @response `200` `UpdateSettlementAccount2Data`
   */
  updateSettlementAccount2 = (
    { userId, walletId, ...query }: UpdateSettlementAccount2Params,
    data: UpdateSettlementAccountRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateSettlementAccount2Data, any>({
      path: `/api/v1/admins/users/users/${userId}/wallets/${walletId}/settlement-account`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/users
   * @name GetUserProfile2
   * @request GET:/api/v1/admins/users/me
   * @originalName getUserProfile
   * @duplicate
   * @secure
   * @response `200` `GetUserProfile2Data`
   */
  getUserProfile2 = (params: RequestParams = {}) =>
    this.request<GetUserProfile2Data, any>({
      path: `/api/v1/admins/users/me`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/users
   * @name UpdateProfilePhoto2
   * @request PATCH:/api/v1/admins/users/me/update-profile-photo
   * @originalName updateProfilePhoto
   * @duplicate
   * @secure
   * @response `200` `UpdateProfilePhoto2Data`
   */
  updateProfilePhoto2 = (
    data: UpdatePhotoRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateProfilePhoto2Data, any>({
      path: `/api/v1/admins/users/me/update-profile-photo`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/users
   * @name UpdateUserAddresses2
   * @request PATCH:/api/v1/admins/users/me/update-addresses
   * @originalName updateUserAddresses
   * @duplicate
   * @secure
   * @response `200` `UpdateUserAddresses2Data`
   */
  updateUserAddresses2 = (
    data: UpdateAddressesRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateUserAddresses2Data, any>({
      path: `/api/v1/admins/users/me/update-addresses`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/users
   * @name ChangeUserPassword2
   * @request PATCH:/api/v1/admins/users/me/password-change
   * @originalName changeUserPassword
   * @duplicate
   * @secure
   * @response `200` `ChangeUserPassword2Data`
   */
  changeUserPassword2 = (
    data: ChangePasswordRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<ChangeUserPassword2Data, any>({
      path: `/api/v1/admins/users/me/password-change`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags wallets
   * @name CreateWallet
   * @request POST:/api/v1/wallets
   * @secure
   * @response `201` `CreateWalletData`
   */
  createWallet = (data: WalletCreateRequestDto, params: RequestParams = {}) =>
    this.request<CreateWalletData, any>({
      path: `/api/v1/wallets`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/wallets
   * @name GetPlatformWallet
   * @request GET:/api/v1/admins/wallets/platform-wallet
   * @secure
   * @response `200` `GetPlatformWalletData`
   */
  getPlatformWallet = (params: RequestParams = {}) =>
    this.request<GetPlatformWalletData, any>({
      path: `/api/v1/admins/wallets/platform-wallet`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags transactions
   * @name GetTransactions
   * @request GET:/api/v1/transactions
   * @secure
   * @response `200` `GetTransactionsData`
   */
  getTransactions = (
    query: GetTransactionsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetTransactionsData, any>({
      path: `/api/v1/transactions`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/transactions
   * @name GetTransactions2
   * @request GET:/api/v1/admins/transactions
   * @originalName getTransactions
   * @duplicate
   * @secure
   * @response `200` `GetTransactions2Data`
   */
  getTransactions2 = (
    query: GetTransactions2Params,
    params: RequestParams = {},
  ) =>
    this.request<GetTransactions2Data, any>({
      path: `/api/v1/admins/transactions`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * Hand-added (not in the generated swagger yet) — re-add after any regen.
   *
   * @tags admins/transactions
   * @name GetExternalPaymentMetrics
   * @request GET:/api/v1/admins/transactions/metrics/external-payments
   * @secure
   */
  getExternalPaymentMetrics = (
    query?: { dateRange?: string; entityId?: string },
    params: RequestParams = {},
  ) =>
    this.request<import("./data-contracts").ExternalPaymentMetricsResponseDto, any>({
      path: `/api/v1/admins/transactions/metrics/external-payments`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /** Hand-added — re-add after any regen. Money-flow summary for finances. */
  getTransactionSummary = (query?: { dateRange?: string }, params: RequestParams = {}) =>
    this.request<import("./data-contracts").TransactionMetricsSummaryResponseDto, any>({
      path: `/api/v1/admins/transactions/metrics/summary`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/transactions
   * @name GetTransaction
   * @request GET:/api/v1/admins/transactions/{transactionId}
   * @secure
   * @response `200` `GetTransactionData`
   */
  getTransaction = (
    { transactionId, ...query }: GetTransactionParams,
    params: RequestParams = {},
  ) =>
    this.request<GetTransactionData, any>({
      path: `/api/v1/admins/transactions/${transactionId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/coupons
   * @name CreateCoupon
   * @request POST:/api/v1/admins/coupons
   * @secure
   * @response `201` `CreateCouponData`
   */
  createCoupon = (data: CreateCouponRequestDto, params: RequestParams = {}) =>
    this.request<CreateCouponData, any>({
      path: `/api/v1/admins/coupons`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/coupons
   * @name CreateGroup
   * @request POST:/api/v1/admins/coupons/groups
   * @secure
   * @response `201` `CreateGroupData`
   */
  createGroup = (data: CreateGroupRequestDto, params: RequestParams = {}) =>
    this.request<CreateGroupData, any>({
      path: `/api/v1/admins/coupons/groups`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/coupons
   * @name AddGroupUsers
   * @request PATCH:/api/v1/admins/coupons/groups/{groupId}/add
   * @secure
   * @response `200` `AddGroupUsersData`
   */
  addGroupUsers = (
    { groupId, ...query }: AddGroupUsersParams,
    data: UpdateGroupUsersRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<AddGroupUsersData, any>({
      path: `/api/v1/admins/coupons/groups/${groupId}/add`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/coupons
   * @name RemoveGroupUsers
   * @request PATCH:/api/v1/admins/coupons/groups/{groupId}/remove
   * @secure
   * @response `200` `RemoveGroupUsersData`
   */
  removeGroupUsers = (
    { groupId, ...query }: RemoveGroupUsersParams,
    data: UpdateGroupUsersRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<RemoveGroupUsersData, any>({
      path: `/api/v1/admins/coupons/groups/${groupId}/remove`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/coupons
   * @name DeactivateCoupon
   * @request PATCH:/api/v1/admins/coupons/{couponCode}/deactivate
   * @secure
   * @response `200` `DeactivateCouponData`
   */
  deactivateCoupon = (
    { couponCode, ...query }: DeactivateCouponParams,
    params: RequestParams = {},
  ) =>
    this.request<DeactivateCouponData, any>({
      path: `/api/v1/admins/coupons/${couponCode}/deactivate`,
      method: "PATCH",
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags payments
   * @name GetBanks
   * @request GET:/api/v1/payments/{provider}/banks
   * @secure
   * @response `200` `GetBanksData`
   */
  getBanks = (
    { provider, ...query }: GetBanksParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBanksData, any>({
      path: `/api/v1/payments/${provider}/banks`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags payments
   * @name CreateDedicatedVirtualAccount
   * @request POST:/api/v1/payments/dedicated-account/create
   * @secure
   * @response `201` `CreateDedicatedVirtualAccountData`
   */
  createDedicatedVirtualAccount = (
    data: CreateVirtualAccountRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<CreateDedicatedVirtualAccountData, any>({
      path: `/api/v1/payments/dedicated-account/create`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags notifications
   * @name GetNotifications
   * @request GET:/api/v1/notifications
   * @secure
   * @response `200` `GetNotificationsData`
   */
  getNotifications = (
    query: GetNotificationsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetNotificationsData, any>({
      path: `/api/v1/notifications`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags notifications
   * @name GetUserNotification
   * @request GET:/api/v1/notifications/{notificationId}
   * @secure
   * @response `200` `GetUserNotificationData`
   */
  getUserNotification = (
    { notificationId, ...query }: GetUserNotificationParams,
    params: RequestParams = {},
  ) =>
    this.request<GetUserNotificationData, any>({
      path: `/api/v1/notifications/${notificationId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags notifications
   * @name BulkMarkNotificationsAsRead
   * @request PATCH:/api/v1/notifications/mark-as-read
   * @secure
   * @response `200` `BulkMarkNotificationsAsReadData`
   */
  bulkMarkNotificationsAsRead = (
    data: UpdateNotificationsRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<BulkMarkNotificationsAsReadData, any>({
      path: `/api/v1/notifications/mark-as-read`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/notifications
   * @name CreateTemplate
   * @request POST:/api/v1/admins/notifications/templates
   * @secure
   * @response `201` `CreateTemplateData`
   */
  createTemplate = (
    data: CreateTemplateRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<CreateTemplateData, any>({
      path: `/api/v1/admins/notifications/templates`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/notifications
   * @name TriggerNotification
   * @request POST:/api/v1/admins/notifications/trigger
   * @secure
   * @response `201` `TriggerNotificationData`
   */
  triggerNotification = (
    data: TriggerNotificationRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<TriggerNotificationData, any>({
      path: `/api/v1/admins/notifications/trigger`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name CreateBusiness
   * @request POST:/api/v1/businesses
   * @response `201` `CreateBusinessData`
   */
  createBusiness = (
    data: CreateBusinessRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<CreateBusinessData, any>({
      path: `/api/v1/businesses`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name CreateBusinessUser
   * @request POST:/api/v1/businesses/users
   * @secure
   * @response `201` `CreateBusinessUserData`
   */
  createBusinessUser = (
    data: CreateBusinessUserRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<CreateBusinessUserData, any>({
      path: `/api/v1/businesses/users`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetBusinessUser
   * @request GET:/api/v1/businesses/{businessId}/users/{userId}
   * @secure
   * @response `200` `GetBusinessUserData`
   */
  getBusinessUser = (
    { businessId, userId, ...query }: GetBusinessUserParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBusinessUserData, any>({
      path: `/api/v1/businesses/${businessId}/users/${userId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name UpdateBusinessUser
   * @request PATCH:/api/v1/businesses/{businessId}/users/{userId}
   * @secure
   * @response `200` `UpdateBusinessUserData`
   */
  updateBusinessUser = (
    { businessId, userId, ...query }: UpdateBusinessUserParams,
    data: UpdateProfileRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateBusinessUserData, any>({
      path: `/api/v1/businesses/${businessId}/users/${userId}`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name RemoveUserFromBusiness
   * @request DELETE:/api/v1/businesses/{businessId}/users/{userId}
   * @secure
   * @response `200` `RemoveUserFromBusinessData`
   */
  removeUserFromBusiness = (
    { businessId, userId, ...query }: RemoveUserFromBusinessParams,
    params: RequestParams = {},
  ) =>
    this.request<RemoveUserFromBusinessData, any>({
      path: `/api/v1/businesses/${businessId}/users/${userId}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetBusinessUsers
   * @request GET:/api/v1/businesses/{businessId}/users
   * @secure
   * @response `200` `GetBusinessUsersData`
   */
  getBusinessUsers = (
    { businessId, ...query }: GetBusinessUsersParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBusinessUsersData, any>({
      path: `/api/v1/businesses/${businessId}/users`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name AddVehicles
   * @request POST:/api/v1/businesses/vehicles
   * @secure
   * @response `201` `AddVehiclesData`
   */
  addVehicles = (data: AddVehiclesDto, params: RequestParams = {}) =>
    this.request<AddVehiclesData, any>({
      path: `/api/v1/businesses/vehicles`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name AssignUserVehicle
   * @request PATCH:/api/v1/businesses/vehicles/{vehicleId}/assign
   * @secure
   * @response `200` `AssignUserVehicleData`
   */
  assignUserVehicle = (
    { vehicleId, ...query }: AssignUserVehicleParams,
    data: AssignVehicleDto,
    params: RequestParams = {},
  ) =>
    this.request<AssignUserVehicleData, any>({
      path: `/api/v1/businesses/vehicles/${vehicleId}/assign`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name AddKycDetails
   * @request PATCH:/api/v1/businesses/{businessId}/kyc
   * @secure
   * @response `200` `AddKycDetailsData`
   */
  addKycDetails = (
    { businessId, ...query }: AddKycDetailsParams,
    data: KYCDetailsDto,
    params: RequestParams = {},
  ) =>
    this.request<AddKycDetailsData, any>({
      path: `/api/v1/businesses/${businessId}/kyc`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetUserReviews
   * @request GET:/api/v1/businesses/users/{userId}/reviews
   * @secure
   * @response `200` `GetUserReviewsData`
   */
  getUserReviews = (
    { userId, ...query }: GetUserReviewsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetUserReviewsData, any>({
      path: `/api/v1/businesses/users/${userId}/reviews`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetBusinessTransactions
   * @request GET:/api/v1/businesses/{businessId}/transactions
   * @secure
   * @response `200` `GetBusinessTransactionsData`
   */
  getBusinessTransactions = (
    { businessId, ...query }: GetBusinessTransactionsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBusinessTransactionsData, any>({
      path: `/api/v1/businesses/${businessId}/transactions`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetBusinessTransaction
   * @request GET:/api/v1/businesses/{businessId}/transactions/{transactionId}
   * @secure
   * @response `200` `GetBusinessTransactionData`
   */
  getBusinessTransaction = (
    { businessId, transactionId, ...query }: GetBusinessTransactionParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBusinessTransactionData, any>({
      path: `/api/v1/businesses/${businessId}/transactions/${transactionId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetBusinessOrders
   * @request GET:/api/v1/businesses/{businessId}/orders
   * @secure
   * @response `200` `GetBusinessOrdersData`
   */
  getBusinessOrders = (
    { businessId, ...query }: GetBusinessOrdersParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBusinessOrdersData, any>({
      path: `/api/v1/businesses/${businessId}/orders`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetBusinessOrder
   * @request GET:/api/v1/businesses/{businessId}/orders/{orderId}
   * @secure
   * @response `200` `GetBusinessOrderData`
   */
  getBusinessOrder = (
    { businessId, orderId, ...query }: GetBusinessOrderParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBusinessOrderData, any>({
      path: `/api/v1/businesses/${businessId}/orders/${orderId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetBusinessWallets
   * @request GET:/api/v1/businesses/{businessId}/wallets
   * @secure
   * @response `200` `GetBusinessWalletsData`
   */
  getBusinessWallets = (
    { businessId, ...query }: GetBusinessWalletsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBusinessWalletsData, any>({
      path: `/api/v1/businesses/${businessId}/wallets`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetBusinessWallet
   * @request GET:/api/v1/businesses/{businessId}/wallets/{walletId}
   * @secure
   * @response `200` `GetBusinessWalletData`
   */
  getBusinessWallet = (
    { walletId, businessId, ...query }: GetBusinessWalletParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBusinessWalletData, any>({
      path: `/api/v1/businesses/${businessId}/wallets/${walletId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetBusinessOrderStatistics
   * @request GET:/api/v1/businesses/{businessId}/order-statistics
   * @secure
   * @response `200` `GetBusinessOrderStatisticsData`
   */
  getBusinessOrderStatistics = (
    { businessId, ...query }: GetBusinessOrderStatisticsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBusinessOrderStatisticsData, any>({
      path: `/api/v1/businesses/${businessId}/order-statistics`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetBusinessOrderStatusChart
   * @request GET:/api/v1/businesses/{businessId}/order-status-chart
   * @secure
   * @response `200` `GetBusinessOrderStatusChartData`
   */
  getBusinessOrderStatusChart = (
    { businessId, ...query }: GetBusinessOrderStatusChartParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBusinessOrderStatusChartData, any>({
      path: `/api/v1/businesses/${businessId}/order-status-chart`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetBusinessOrderTypeChart
   * @request GET:/api/v1/businesses/{businessId}/order-type-chart
   * @secure
   * @response `200` `GetBusinessOrderTypeChartData`
   */
  getBusinessOrderTypeChart = (
    { businessId, ...query }: GetBusinessOrderTypeChartParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBusinessOrderTypeChartData, any>({
      path: `/api/v1/businesses/${businessId}/order-type-chart`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetBusiness
   * @request GET:/api/v1/businesses/{businessId}
   * @secure
   * @response `200` `GetBusinessData`
   */
  getBusiness = (
    { businessId, ...query }: GetBusinessParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBusinessData, any>({
      path: `/api/v1/businesses/${businessId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name GetBusinessVehicles
   * @request GET:/api/v1/businesses/{businessId}/vehicles
   * @secure
   * @response `200` `GetBusinessVehiclesData`
   */
  getBusinessVehicles = (
    { businessId, ...query }: GetBusinessVehiclesParams,
    params: RequestParams = {},
  ) =>
    this.request<GetBusinessVehiclesData, any>({
      path: `/api/v1/businesses/${businessId}/vehicles`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * Hand-added — re-add after any regen. Backend: GET /businesses/:businessId
   * (guarded AdminRoles; platform admins allowed by the service check).
   *
   * @tags businesses
   * @name GetBusinessById
   * @request GET:/api/v1/businesses/{businessId}
   * @secure
   */
  getBusinessById = (
    { businessId }: { businessId: string },
    params: RequestParams = {},
  ) =>
    this.request<import("./data-contracts").Business, any>({
      path: `/api/v1/businesses/${businessId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name UpdateBusinessPreferences
   * @request PATCH:/api/v1/businesses/{businessId}/preferences
   * @secure
   * @response `200` `UpdateBusinessPreferencesData`
   */
  updateBusinessPreferences = (
    { businessId, ...query }: UpdateBusinessPreferencesParams,
    data: UpdatePreferencesRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateBusinessPreferencesData, any>({
      path: `/api/v1/businesses/${businessId}/preferences`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name SuspendBusinessUser
   * @request PATCH:/api/v1/businesses/{businessId}/users/{userId}/suspend
   * @secure
   * @response `200` `SuspendBusinessUserData`
   */
  suspendBusinessUser = (
    { businessId, userId, ...query }: SuspendBusinessUserParams,
    params: RequestParams = {},
  ) =>
    this.request<SuspendBusinessUserData, any>({
      path: `/api/v1/businesses/${businessId}/users/${userId}/suspend`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name UnsuspendBusinessUser
   * @request PATCH:/api/v1/businesses/{businessId}/users/{userId}/unsuspend
   * @secure
   * @response `200` `UnsuspendBusinessUserData`
   */
  unsuspendBusinessUser = (
    { businessId, userId, ...query }: UnsuspendBusinessUserParams,
    params: RequestParams = {},
  ) =>
    this.request<UnsuspendBusinessUserData, any>({
      path: `/api/v1/businesses/${businessId}/users/${userId}/unsuspend`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags businesses
   * @name UpdateBusinessVehicle
   * @request PATCH:/api/v1/businesses/{businessId}/vehicles/{vehicleId}
   * @secure
   * @response `200` `UpdateBusinessVehicleData`
   */
  updateBusinessVehicle = (
    { businessId, vehicleId, ...query }: UpdateBusinessVehicleParams,
    data: UpdateVehicleRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateBusinessVehicleData, any>({
      path: `/api/v1/businesses/${businessId}/vehicles/${vehicleId}`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags reviews
   * @name GetReviews
   * @request GET:/api/v1/reviews
   * @secure
   * @response `200` `GetReviewsData`
   */
  getReviews = (params: RequestParams = {}) =>
    this.request<GetReviewsData, any>({
      path: `/api/v1/reviews`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags reviews
   * @name RateRider
   * @request POST:/api/v1/reviews/rate-rider
   * @secure
   * @response `201` `RateRiderData`
   */
  rateRider = (data: RateRiderRequestDto, params: RequestParams = {}) =>
    this.request<RateRiderData, any>({
      path: `/api/v1/reviews/rate-rider`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags vehicles
   * @name UpdateUserVehicle
   * @request POST:/api/v1/vehicles
   * @secure
   * @response `201` `UpdateUserVehicleData`
   */
  updateUserVehicle = (
    data: UpdateVehicleRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateUserVehicleData, any>({
      path: `/api/v1/vehicles`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags vehicles
   * @name GetVehicle
   * @request GET:/api/v1/vehicles/{vehicleId}
   * @secure
   * @response `200` `GetVehicleData`
   */
  getVehicle = (
    { vehicleId, ...query }: GetVehicleParams,
    params: RequestParams = {},
  ) =>
    this.request<GetVehicleData, any>({
      path: `/api/v1/vehicles/${vehicleId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags vehicles
   * @name DeleteUserVehicle
   * @request DELETE:/api/v1/vehicles/{vehicleId}
   * @secure
   * @response `200` `DeleteUserVehicleData`
   */
  deleteUserVehicle = (
    { vehicleId, ...query }: DeleteUserVehicleParams,
    params: RequestParams = {},
  ) =>
    this.request<DeleteUserVehicleData, any>({
      path: `/api/v1/vehicles/${vehicleId}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/vehicles
   * @name GetVehicles
   * @request GET:/api/v1/admins/vehicles
   * @secure
   * @response `200` `GetVehiclesData`
   */
  getVehicles = (query: GetVehiclesParams, params: RequestParams = {}) =>
    this.request<GetVehiclesData, any>({
      path: `/api/v1/admins/vehicles`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/vehicles
   * @name UpdateUserVehicle2
   * @request POST:/api/v1/admins/vehicles/{userId}/create
   * @originalName updateUserVehicle
   * @duplicate
   * @secure
   * @response `201` `UpdateUserVehicle2Data`
   */
  updateUserVehicle2 = (
    { userId, ...query }: UpdateUserVehicle2Params,
    data: UpdateVehicleRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateUserVehicle2Data, any>({
      path: `/api/v1/admins/vehicles/${userId}/create`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/vehicles
   * @name VerifyVehicle
   * @request PATCH:/api/v1/admins/vehicles/{vehicleId}/users/{userId}/verify
   * @secure
   * @response `200` `VerifyVehicleData`
   */
  verifyVehicle = (
    { vehicleId, userId, ...query }: VerifyVehicleParams,
    params: RequestParams = {},
  ) =>
    this.request<VerifyVehicleData, any>({
      path: `/api/v1/admins/vehicles/${vehicleId}/users/${userId}/verify`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/vehicles
   * @name RejectVehicle
   * @request PATCH:/api/v1/admins/vehicles/{vehicleId}/users/{userId}/reject
   * @secure
   * @response `200` `RejectVehicleData`
   */
  rejectVehicle = (
    { vehicleId, userId, ...query }: RejectVehicleParams,
    data: UpdateVehicleStatusRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<RejectVehicleData, any>({
      path: `/api/v1/admins/vehicles/${vehicleId}/users/${userId}/reject`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/vehicles
   * @name SuspendVehicle
   * @request PATCH:/api/v1/admins/vehicles/{vehicleId}/users/{userId}/suspend
   * @secure
   * @response `200` `SuspendVehicleData`
   */
  suspendVehicle = (
    { vehicleId, userId, ...query }: SuspendVehicleParams,
    data: UpdateVehicleStatusRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<SuspendVehicleData, any>({
      path: `/api/v1/admins/vehicles/${vehicleId}/users/${userId}/suspend`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/vehicles
   * @name GetVehicle2
   * @request GET:/api/v1/admins/vehicles/{vehicleId}
   * @originalName getVehicle
   * @duplicate
   * @secure
   * @response `200` `GetVehicle2Data`
   */
  getVehicle2 = (
    { vehicleId, ...query }: GetVehicle2Params,
    params: RequestParams = {},
  ) =>
    this.request<GetVehicle2Data, any>({
      path: `/api/v1/admins/vehicles/${vehicleId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/vehicles
   * @name DeleteVehicle
   * @request DELETE:/api/v1/admins/vehicles/{vehicleId}
   * @secure
   * @response `200` `DeleteVehicleData`
   */
  deleteVehicle = (
    { vehicleId, ...query }: DeleteVehicleParams,
    params: RequestParams = {},
  ) =>
    this.request<DeleteVehicleData, any>({
      path: `/api/v1/admins/vehicles/${vehicleId}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name CreateSingleOrder
   * @request POST:/api/v1/orders/single
   * @secure
   * @response `201` `CreateSingleOrderData`
   */
  createSingleOrder = (
    data: CreateSingleOrderDto,
    params: RequestParams = {},
  ) =>
    this.request<CreateSingleOrderData, any>({
      path: `/api/v1/orders/single`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name CreateBulkOrder
   * @request POST:/api/v1/orders/bulk
   * @secure
   * @response `201` `CreateBulkOrderData`
   */
  createBulkOrder = (data: CreateBulkOrderDto, params: RequestParams = {}) =>
    this.request<CreateBulkOrderData, any>({
      path: `/api/v1/orders/bulk`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name CreateBatchOrder
   * @request POST:/api/v1/orders/batch
   * @secure
   * @response `201` `CreateBatchOrderData`
   */
  createBatchOrder = (data: CreateBatchOrderDto, params: RequestParams = {}) =>
    this.request<CreateBatchOrderData, any>({
      path: `/api/v1/orders/batch`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name RequestOrderRiders
   * @request POST:/api/v1/orders/{orderId}/request-riders
   * @secure
   * @response `201` `RequestOrderRidersData`
   */
  requestOrderRiders = (
    { orderId, ...query }: RequestOrderRidersParams,
    data: RidersRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<RequestOrderRidersData, any>({
      path: `/api/v1/orders/${orderId}/request-riders`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name CancelOrderLocation
   * @request PATCH:/api/v1/orders/{orderId}/locations/{locationId}/cancel
   * @secure
   * @response `200` `CancelOrderLocationData`
   */
  cancelOrderLocation = (
    { orderId, locationId, ...query }: CancelOrderLocationParams,
    data: CancelLocationRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<CancelOrderLocationData, any>({
      path: `/api/v1/orders/${orderId}/locations/${locationId}/cancel`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name CancelOrder
   * @request PATCH:/api/v1/orders/{orderId}/cancel
   * @secure
   * @response `200` `CancelOrderData`
   */
  cancelOrder = (
    { orderId, ...query }: CancelOrderParams,
    data: CancelOrderRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<CancelOrderData, any>({
      path: `/api/v1/orders/${orderId}/cancel`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name MakeOrderOffer
   * @request POST:/api/v1/orders/{orderId}/offers
   * @secure
   * @response `201` `MakeOrderOfferData`
   */
  makeOrderOffer = (
    { orderId, ...query }: MakeOrderOfferParams,
    data: MakeOfferRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<MakeOrderOfferData, any>({
      path: `/api/v1/orders/${orderId}/offers`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name InitiateOrderPayment
   * @request PATCH:/api/v1/orders/{orderId}/wallets/{walletId}/pay
   * @secure
   * @response `200` `InitiateOrderPaymentData`
   */
  initiateOrderPayment = (
    { orderId, walletId, ...query }: InitiateOrderPaymentParams,
    params: RequestParams = {},
  ) =>
    this.request<InitiateOrderPaymentData, any>({
      path: `/api/v1/orders/${orderId}/wallets/${walletId}/pay`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name AcceptOrRejectOrderOffer
   * @request PATCH:/api/v1/orders/{orderId}/offers/{offerId}
   * @secure
   * @response `200` `AcceptOrRejectOrderOfferData`
   */
  acceptOrRejectOrderOffer = (
    { orderId, offerId, ...query }: AcceptOrRejectOrderOfferParams,
    data: AcceptRejectOfferRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<AcceptOrRejectOrderOfferData, any>({
      path: `/api/v1/orders/${orderId}/offers/${offerId}`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name StartOrder
   * @request PATCH:/api/v1/orders/{orderId}/start
   * @secure
   * @response `200` `StartOrderData`
   */
  startOrder = (
    { orderId, ...query }: StartOrderParams,
    params: RequestParams = {},
  ) =>
    this.request<StartOrderData, any>({
      path: `/api/v1/orders/${orderId}/start`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name StartOrderLocation
   * @request PATCH:/api/v1/orders/{orderId}/locations/{locationId}/start
   * @secure
   * @response `200` `StartOrderLocationData`
   */
  startOrderLocation = (
    { orderId, locationId, ...query }: StartOrderLocationParams,
    params: RequestParams = {},
  ) =>
    this.request<StartOrderLocationData, any>({
      path: `/api/v1/orders/${orderId}/locations/${locationId}/start`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name UpdateOrderLocationStatus
   * @request PATCH:/api/v1/orders/{orderId}/locations/{locationId}/status
   * @secure
   * @response `200` `UpdateOrderLocationStatusData`
   */
  updateOrderLocationStatus = (
    { orderId, locationId, ...query }: UpdateOrderLocationStatusParams,
    data: UpdateLocationStatusRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<UpdateOrderLocationStatusData, any>({
      path: `/api/v1/orders/${orderId}/locations/${locationId}/status`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name ApplyOrderCoupon
   * @request PATCH:/api/v1/orders/{orderId}/coupons/{couponCode}/apply
   * @secure
   * @response `200` `ApplyOrderCouponData`
   */
  applyOrderCoupon = (
    { orderId, couponCode, ...query }: ApplyOrderCouponParams,
    params: RequestParams = {},
  ) =>
    this.request<ApplyOrderCouponData, any>({
      path: `/api/v1/orders/${orderId}/coupons/${couponCode}/apply`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name RemoveOrderCoupon
   * @request PATCH:/api/v1/orders/{orderId}/coupons/{couponCode}/remove
   * @secure
   * @response `200` `RemoveOrderCouponData`
   */
  removeOrderCoupon = (
    { orderId, couponCode, ...query }: RemoveOrderCouponParams,
    params: RequestParams = {},
  ) =>
    this.request<RemoveOrderCouponData, any>({
      path: `/api/v1/orders/${orderId}/coupons/${couponCode}/remove`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name CompleteOrderLocation
   * @request PATCH:/api/v1/orders/{orderId}/locations/{locationId}/complete
   * @secure
   * @response `200` `CompleteOrderLocationData`
   */
  completeOrderLocation = (
    { orderId, locationId, ...query }: CompleteOrderLocationParams,
    data: CompleteLocationRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<CompleteOrderLocationData, any>({
      path: `/api/v1/orders/${orderId}/locations/${locationId}/complete`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name CompleteOrder
   * @request PATCH:/api/v1/orders/{orderId}/complete
   * @secure
   * @response `200` `CompleteOrderData`
   */
  completeOrder = (
    { orderId, ...query }: CompleteOrderParams,
    params: RequestParams = {},
  ) =>
    this.request<CompleteOrderData, any>({
      path: `/api/v1/orders/${orderId}/complete`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name QueueOrder
   * @request PATCH:/api/v1/orders/{orderId}/queue
   * @secure
   * @response `200` `QueueOrderData`
   */
  queueOrder = (
    { orderId, ...query }: QueueOrderParams,
    params: RequestParams = {},
  ) =>
    this.request<QueueOrderData, any>({
      path: `/api/v1/orders/${orderId}/queue`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name GetQueuedOrders
   * @request GET:/api/v1/orders/queued-orders
   * @secure
   * @response `200` `GetQueuedOrdersData`
   */
  getQueuedOrders = (params: RequestParams = {}) =>
    this.request<GetQueuedOrdersData, any>({
      path: `/api/v1/orders/queued-orders`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name GetActiveOffers
   * @request GET:/api/v1/orders/{orderId}/active-offers
   * @secure
   * @response `200` `GetActiveOffersData`
   */
  getActiveOffers = (
    { orderId, ...query }: GetActiveOffersParams,
    params: RequestParams = {},
  ) =>
    this.request<GetActiveOffersData, any>({
      path: `/api/v1/orders/${orderId}/active-offers`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name GetUserOrders
   * @request GET:/api/v1/orders
   * @secure
   * @response `200` `GetUserOrdersData`
   */
  getUserOrders = (query: GetUserOrdersParams, params: RequestParams = {}) =>
    this.request<GetUserOrdersData, any>({
      path: `/api/v1/orders`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name GetRiderOrders
   * @request GET:/api/v1/orders/riders
   * @secure
   * @response `200` `GetRiderOrdersData`
   */
  getRiderOrders = (query: GetRiderOrdersParams, params: RequestParams = {}) =>
    this.request<GetRiderOrdersData, any>({
      path: `/api/v1/orders/riders`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name GetUserOrder
   * @request GET:/api/v1/orders/{orderId}
   * @secure
   * @response `200` `GetUserOrderData`
   */
  getUserOrder = (
    { orderId, ...query }: GetUserOrderParams,
    params: RequestParams = {},
  ) =>
    this.request<GetUserOrderData, any>({
      path: `/api/v1/orders/${orderId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name GetRiderOrderStatistics
   * @request GET:/api/v1/orders/riders/order-statistics
   * @secure
   * @response `200` `GetRiderOrderStatisticsData`
   */
  getRiderOrderStatistics = (
    query: GetRiderOrderStatisticsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetRiderOrderStatisticsData, any>({
      path: `/api/v1/orders/riders/order-statistics`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name GetOrderStatusChart
   * @request GET:/api/v1/orders/riders/status-chart
   * @secure
   * @response `200` `GetOrderStatusChartData`
   */
  getOrderStatusChart = (
    query: GetOrderStatusChartParams,
    params: RequestParams = {},
  ) =>
    this.request<GetOrderStatusChartData, any>({
      path: `/api/v1/orders/riders/status-chart`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags orders
   * @name GetOrderTypeChart
   * @request GET:/api/v1/orders/riders/type-chart
   * @secure
   * @response `200` `GetOrderTypeChartData`
   */
  getOrderTypeChart = (
    query: GetOrderTypeChartParams,
    params: RequestParams = {},
  ) =>
    this.request<GetOrderTypeChartData, any>({
      path: `/api/v1/orders/riders/type-chart`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/orders
   * @name GetOrders
   * @request GET:/api/v1/admins/orders
   * @secure
   * @response `200` `GetOrdersData`
   */
  getOrders = (query: GetOrdersParams, params: RequestParams = {}) =>
    this.request<GetOrdersData, any>({
      path: `/api/v1/admins/orders`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags admins/orders
   * @name GetOrder
   * @request GET:/api/v1/admins/orders/{orderId}
   * @secure
   * @response `200` `GetOrderData`
   */
  getOrder = (
    { orderId, ...query }: GetOrderParams,
    params: RequestParams = {},
  ) =>
    this.request<GetOrderData, any>({
      path: `/api/v1/admins/orders/${orderId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags datalogs
   * @name GetLogs
   * @request GET:/api/v1/datalogs
   * @secure
   * @response `200` `GetLogsData`
   */
  getLogs = (params: RequestParams = {}) =>
    this.request<GetLogsData, any>({
      path: `/api/v1/datalogs`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags audit-logs
   * @name FindAll
   * @request GET:/api/v1/audit-logs
   * @secure
   * @response `200` `FindAllData`
   */
  findAll = (query: FindAllParams, params: RequestParams = {}) =>
    this.request<FindAllData, any>({
      path: `/api/v1/audit-logs`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags webhooks
   * @name HandleWebhookEvents
   * @request POST:/api/v1/webhooks/public/{provider}/events
   * @response `200` `HandleWebhookEventsData`
   */
  handleWebhookEvents = (
    { provider, ...query }: HandleWebhookEventsParams,
    data: Object,
    params: RequestParams = {},
  ) =>
    this.request<HandleWebhookEventsData, any>({
      path: `/api/v1/webhooks/public/${provider}/events`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags crons
   * @name Run
   * @request GET:/api/v1/crons/run
   * @response `200` `RunData`
   */
  run = (params: RequestParams = {}) =>
    this.request<RunData, any>({
      path: `/api/v1/crons/run`,
      method: "GET",
      ...params,
    });
}
