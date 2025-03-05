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

import {
  AcceptOrRejectOrderOfferData,
  AcceptRejectOfferRequestDto,
  AddCountryData,
  AddCountryDto,
  AddCountryStatesData,
  AddCountryStatesPayload,
  AddGroupUsersData,
  AddKycDetailsData,
  AddVehiclesData,
  AddVehiclesDto,
  ApplyOrderCouponData,
  ApproveDriversLicenseSubmissionData,
  AssignUserVehicleData,
  AssignVehicleDto,
  BulkMarkNotificationsAsReadData,
  CancelLocationRequestDto,
  CancelOrderData,
  CancelOrderLocationData,
  CancelOrderRequestDto,
  ChangePasswordRequestDto,
  ChangeUserPassword2Data,
  ChangeUserPasswordData,
  CheckTokenValidityData,
  CompleteLocationRequestDto,
  CompleteOrderData,
  CompleteOrderLocationData,
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
  CreateUserRequestDto,
  CreateVirtualAccountRequestDto,
  CreateWalletData,
  DeactivateCouponData,
  DeleteUserAccountData,
  DeleteUserVehicleData,
  DeleteVehicleData,
  FindAllData,
  FundWalletRequestDto,
  GetActiveCouponsData,
  GetActiveOffersData,
  GetAllReferralsData,
  GetBanksData,
  GetBusinessData,
  GetBusinessOrderData,
  GetBusinessOrderStatisticsData,
  GetBusinessOrderStatusChartData,
  GetBusinessOrderTypeChartData,
  GetBusinessOrdersData,
  GetBusinessTransactionData,
  GetBusinessTransactionsData,
  GetBusinessUserData,
  GetBusinessUsersData,
  GetBusinessVehiclesData,
  GetBusinessWalletData,
  GetBusinessWalletsData,
  GetCountriesData,
  GetCountryByIdData,
  GetCountryStateByIdData,
  GetCountryStatesData,
  GetHeartbeatData,
  GetLogsData,
  GetNotificationsData,
  GetOrderStatusChartData,
  GetOrderTypeChartData,
  GetQueuedOrdersData,
  GetReviewsData,
  GetRiderOrderData,
  GetRiderOrderStatisticsData,
  GetRiderOrdersData,
  GetTransactionData,
  GetTransactions2Data,
  GetTransactionsData,
  GetUserData,
  GetUserNotificationData,
  GetUserOrderData,
  GetUserOrders2Data,
  GetUserOrdersData,
  GetUserProfile2Data,
  GetUserProfileData,
  GetUserReviewsData,
  GetUserTransactionData,
  GetUserTransactionsData,
  GetUserVehicleData,
  GetUserWalletData,
  GetUserWalletsData,
  GetUsersData,
  GetVehicle2Data,
  GetVehicleData,
  GetVehiclesData,
  HandleWebhookEventsData,
  InitializeFundWalletData,
  InitiateOrderPaymentData,
  InitiateWithdrawalData,
  InitiateWithdrawalRequestDto,
  KYCDetailsDto,
  LoginAdminsData,
  LoginBusinessData,
  LoginData,
  LoginRequestDto,
  MakeOfferRequestDto,
  MakeOrderOfferData,
  NewFeatureLaunchNotificationData,
  Object,
  PasswordResetData,
  PasswordResetRequestData,
  QueueOrderData,
  RateRiderData,
  RateRiderRequestDto,
  RejectVehicleData,
  RemoveGroupUsersData,
  RemoveOrderCouponData,
  RemoveUserFromBusinessData,
  RequestOrderRidersData,
  ResendTokenData,
  ResetPasswordRequestDto,
  RidersRequestDto,
  StartOrderData,
  StartOrderLocationData,
  SubmitDriversLicenseData,
  SubmitDriversLicenseRequestDto,
  SuspendBusinessUserData,
  SuspendVehicleData,
  ToggleOnlinePresenceData,
  TokenRequestDto,
  TriggerNotificationData,
  TriggerNotificationRequestDto,
  UnsuspendBusinessUserData,
  UpdateAddressesRequestDto,
  UpdateBusinessPreferencesData,
  UpdateBusinessUserData,
  UpdateBusinessVehicleData,
  UpdateCountryData,
  UpdateCountryDto,
  UpdateCountryStateData,
  UpdateDriverLicenseRequestDto,
  UpdateDriversLicenseData,
  UpdateEmailData,
  UpdateEmailRequestDto,
  UpdateGroupUsersRequestDto,
  UpdateLocationRequestDto,
  UpdateLocationStatusRequestDto,
  UpdateNotificationsRequestDto,
  UpdateOrderLocationStatusData,
  UpdatePhoneNumberData,
  UpdatePhoneRequestDto,
  UpdatePhotoRequestDto,
  UpdatePreferencesRequestDto,
  UpdateProfilePhoto2Data,
  UpdateProfilePhotoData,
  UpdateProfileRequestDto,
  UpdateSettlementAccount2Data,
  UpdateSettlementAccountData,
  UpdateSettlementAccountRequestDto,
  UpdateStateDto,
  UpdateUserAddresses2Data,
  UpdateUserAddressesData,
  UpdateUserLocationData,
  UpdateUserPreferencesData,
  UpdateUserProfileData,
  UpdateUserVehicle2Data,
  UpdateUserVehicleData,
  UpdateVehicleRequestDto,
  UpdateVehicleStatusRequestDto,
  UserKYCDetailDto,
  UserKycVerificationData,
  VerifyDriversLicense2Data,
  VerifyDriversLicenseData,
  VerifyEmailData,
  VerifyEmailRequestDto,
  VerifyPhoneData,
  VerifyPhoneRequestDto,
  VerifyVehicleData,
  WalletCreateRequestDto,
} from "./data-contracts";

export namespace Api {
  /**
   * No description
   * @name GetHeartbeat
   * @request GET:/api/v1/ping
   * @response `200` `GetHeartbeatData`
   */
  export namespace GetHeartbeat {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {
      "x-api-key"?: string;
    };
    export type ResponseBody = GetHeartbeatData;
  }

  /**
   * No description
   * @tags admin-configs
   * @name GetCountries
   * @request GET:/api/v1/admin-configs/countries
   * @secure
   * @response `200` `GetCountriesData`
   */
  export namespace GetCountries {
    export type RequestParams = {};
    export type RequestQuery = {
      order?: "ASC" | "DESC";
      page?: number;
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCountriesData;
  }

  /**
   * No description
   * @tags admin-configs
   * @name AddCountry
   * @request POST:/api/v1/admin-configs/countries
   * @secure
   * @response `201` `AddCountryData`
   */
  export namespace AddCountry {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AddCountryDto;
    export type RequestHeaders = {};
    export type ResponseBody = AddCountryData;
  }

  /**
   * No description
   * @tags admin-configs
   * @name UpdateCountry
   * @request PATCH:/api/v1/admin-configs/countries/{countryId}
   * @secure
   * @response `200` `UpdateCountryData`
   */
  export namespace UpdateCountry {
    export type RequestParams = {
      countryId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateCountryDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateCountryData;
  }

  /**
   * No description
   * @tags admin-configs
   * @name GetCountryById
   * @request GET:/api/v1/admin-configs/countries/{countryId}
   * @secure
   * @response `200` `GetCountryByIdData`
   */
  export namespace GetCountryById {
    export type RequestParams = {
      countryId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCountryByIdData;
  }

  /**
   * No description
   * @tags admin-configs
   * @name AddCountryStates
   * @request POST:/api/v1/admin-configs/countries/{countryId}/states
   * @secure
   * @response `201` `AddCountryStatesData`
   */
  export namespace AddCountryStates {
    export type RequestParams = {
      countryId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = AddCountryStatesPayload;
    export type RequestHeaders = {};
    export type ResponseBody = AddCountryStatesData;
  }

  /**
   * No description
   * @tags admin-configs
   * @name GetCountryStates
   * @request GET:/api/v1/admin-configs/countries/{countryId}/states
   * @secure
   * @response `200` `GetCountryStatesData`
   */
  export namespace GetCountryStates {
    export type RequestParams = {
      countryId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCountryStatesData;
  }

  /**
   * No description
   * @tags admin-configs
   * @name GetCountryStateById
   * @request GET:/api/v1/admin-configs/countries/{countryId}/states/{stateId}
   * @secure
   * @response `200` `GetCountryStateByIdData`
   */
  export namespace GetCountryStateById {
    export type RequestParams = {
      countryId: string;
      stateId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCountryStateByIdData;
  }

  /**
   * No description
   * @tags admin-configs
   * @name UpdateCountryState
   * @request PATCH:/api/v1/admin-configs/countries/{countryId}/states/{stateId}
   * @secure
   * @response `200` `UpdateCountryStateData`
   */
  export namespace UpdateCountryState {
    export type RequestParams = {
      countryId: string;
      stateId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateStateDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateCountryStateData;
  }

  /**
   * No description
   * @tags auth
   * @name LoginAdmins
   * @request POST:/api/v1/auth/admins/login
   * @response `201` `LoginAdminsData`
   */
  export namespace LoginAdmins {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LoginRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = LoginAdminsData;
  }

  /**
   * No description
   * @tags auth
   * @name Login
   * @request POST:/api/v1/auth/users/login
   * @response `201` `LoginData`
   */
  export namespace Login {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LoginRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = LoginData;
  }

  /**
   * No description
   * @tags auth
   * @name LoginBusiness
   * @request POST:/api/v1/auth/businesses/login
   * @response `201` `LoginBusinessData`
   */
  export namespace LoginBusiness {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LoginRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = LoginBusinessData;
  }

  /**
   * No description
   * @tags auth
   * @name VerifyPhone
   * @request POST:/api/v1/auth/verify/phone
   * @response `201` `VerifyPhoneData`
   */
  export namespace VerifyPhone {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = VerifyPhoneRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = VerifyPhoneData;
  }

  /**
   * No description
   * @tags auth
   * @name VerifyEmail
   * @request POST:/api/v1/auth/verify/email
   * @response `201` `VerifyEmailData`
   */
  export namespace VerifyEmail {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = VerifyEmailRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = VerifyEmailData;
  }

  /**
   * No description
   * @tags auth
   * @name PasswordResetRequest
   * @request POST:/api/v1/auth/password-reset-request
   * @response `201` `PasswordResetRequestData`
   */
  export namespace PasswordResetRequest {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TokenRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = PasswordResetRequestData;
  }

  /**
   * No description
   * @tags auth
   * @name PasswordReset
   * @request POST:/api/v1/auth/password-reset
   * @response `201` `PasswordResetData`
   */
  export namespace PasswordReset {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ResetPasswordRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = PasswordResetData;
  }

  /**
   * No description
   * @tags auth
   * @name ResendToken
   * @request POST:/api/v1/auth/resend-token
   * @response `201` `ResendTokenData`
   */
  export namespace ResendToken {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TokenRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = ResendTokenData;
  }

  /**
   * No description
   * @tags auth
   * @name CheckTokenValidity
   * @request POST:/api/v1/auth/check-token
   * @response `201` `CheckTokenValidityData`
   */
  export namespace CheckTokenValidity {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = VerifyPhoneRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = CheckTokenValidityData;
  }

  /**
   * No description
   * @tags users
   * @name CreateUser
   * @request POST:/api/v1/users
   * @response `201` `CreateUserData`
   */
  export namespace CreateUser {
    export type RequestParams = {};
    export type RequestQuery = {
      referralCode?: any;
    };
    export type RequestBody = CreateUserRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = CreateUserData;
  }

  /**
   * No description
   * @tags users
   * @name GetUserProfile
   * @request GET:/api/v1/users/me
   * @secure
   * @response `200` `GetUserProfileData`
   */
  export namespace GetUserProfile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserProfileData;
  }

  /**
   * No description
   * @tags users
   * @name UpdateUserProfile
   * @request PATCH:/api/v1/users/me/update-profile
   * @secure
   * @response `200` `UpdateUserProfileData`
   */
  export namespace UpdateUserProfile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateProfileRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateUserProfileData;
  }

  /**
   * No description
   * @tags users
   * @name UpdateUserLocation
   * @request PATCH:/api/v1/users/me/update-location
   * @secure
   * @response `200` `UpdateUserLocationData`
   */
  export namespace UpdateUserLocation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateLocationRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateUserLocationData;
  }

  /**
   * No description
   * @tags users
   * @name UpdateProfilePhoto
   * @request PATCH:/api/v1/users/me/update-profile-photo
   * @secure
   * @response `200` `UpdateProfilePhotoData`
   */
  export namespace UpdateProfilePhoto {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdatePhotoRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateProfilePhotoData;
  }

  /**
   * No description
   * @tags users
   * @name UpdateUserAddresses
   * @request PATCH:/api/v1/users/me/update-addresses
   * @secure
   * @response `200` `UpdateUserAddressesData`
   */
  export namespace UpdateUserAddresses {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateAddressesRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateUserAddressesData;
  }

  /**
   * No description
   * @tags users
   * @name UserKycVerification
   * @request PUT:/api/v1/users/me/kyc
   * @secure
   * @response `200` `UserKycVerificationData`
   */
  export namespace UserKycVerification {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UserKYCDetailDto;
    export type RequestHeaders = {};
    export type ResponseBody = UserKycVerificationData;
  }

  /**
   * No description
   * @tags users
   * @name ChangeUserPassword
   * @request PATCH:/api/v1/users/me/password-change
   * @secure
   * @response `200` `ChangeUserPasswordData`
   */
  export namespace ChangeUserPassword {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ChangePasswordRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = ChangeUserPasswordData;
  }

  /**
   * No description
   * @tags users
   * @name GetUserWallets
   * @request GET:/api/v1/users/me/wallets
   * @secure
   * @response `200` `GetUserWalletsData`
   */
  export namespace GetUserWallets {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserWalletsData;
  }

  /**
   * No description
   * @tags users
   * @name GetUserWallet
   * @request GET:/api/v1/users/me/wallets/{walletId}
   * @secure
   * @response `200` `GetUserWalletData`
   */
  export namespace GetUserWallet {
    export type RequestParams = {
      walletId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserWalletData;
  }

  /**
   * No description
   * @tags users
   * @name InitializeFundWallet
   * @request POST:/api/v1/users/me/wallets/{walletId}/initialize-funding
   * @secure
   * @response `201` `InitializeFundWalletData`
   */
  export namespace InitializeFundWallet {
    export type RequestParams = {
      walletId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = FundWalletRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = InitializeFundWalletData;
  }

  /**
   * No description
   * @tags users
   * @name UpdateSettlementAccount
   * @request PATCH:/api/v1/users/me/wallets/{walletId}/settlement-account
   * @secure
   * @response `200` `UpdateSettlementAccountData`
   */
  export namespace UpdateSettlementAccount {
    export type RequestParams = {
      walletId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateSettlementAccountRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateSettlementAccountData;
  }

  /**
   * No description
   * @tags users
   * @name InitiateWithdrawal
   * @request PATCH:/api/v1/users/me/wallets/{walletId}/withdrawal-request
   * @secure
   * @response `200` `InitiateWithdrawalData`
   */
  export namespace InitiateWithdrawal {
    export type RequestParams = {
      walletId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = InitiateWithdrawalRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = InitiateWithdrawalData;
  }

  /**
   * No description
   * @tags users
   * @name GetActiveCoupons
   * @request GET:/api/v1/users/me/coupons
   * @secure
   * @response `200` `GetActiveCouponsData`
   */
  export namespace GetActiveCoupons {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetActiveCouponsData;
  }

  /**
   * No description
   * @tags users
   * @name GetAllReferrals
   * @request GET:/api/v1/users/me/referrals
   * @secure
   * @response `200` `GetAllReferralsData`
   */
  export namespace GetAllReferrals {
    export type RequestParams = {};
    export type RequestQuery = {
      /** the records sorting order */
      order?: "ASC" | "DESC";
      page?: number;
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAllReferralsData;
  }

  /**
   * No description
   * @tags users
   * @name GetUserTransactions
   * @request GET:/api/v1/users/me/transactions
   * @secure
   * @response `200` `GetUserTransactionsData`
   */
  export namespace GetUserTransactions {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserTransactionsData;
  }

  /**
   * No description
   * @tags users
   * @name GetUserTransaction
   * @request GET:/api/v1/users/me/transactions/{transactionId}
   * @secure
   * @response `200` `GetUserTransactionData`
   */
  export namespace GetUserTransaction {
    export type RequestParams = {
      transactionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserTransactionData;
  }

  /**
   * No description
   * @tags users
   * @name DeleteUserAccount
   * @request DELETE:/api/v1/users/me/delete-account
   * @secure
   * @response `200` `DeleteUserAccountData`
   */
  export namespace DeleteUserAccount {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteUserAccountData;
  }

  /**
   * No description
   * @tags users
   * @name UpdatePhoneNumber
   * @request PATCH:/api/v1/users/me/phone
   * @secure
   * @response `200` `UpdatePhoneNumberData`
   */
  export namespace UpdatePhoneNumber {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdatePhoneRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdatePhoneNumberData;
  }

  /**
   * No description
   * @tags users
   * @name UpdateEmail
   * @request PATCH:/api/v1/users/me/email
   * @secure
   * @response `200` `UpdateEmailData`
   */
  export namespace UpdateEmail {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateEmailRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateEmailData;
  }

  /**
   * No description
   * @tags users
   * @name UpdateUserPreferences
   * @request PATCH:/api/v1/users/me/preferences
   * @secure
   * @response `200` `UpdateUserPreferencesData`
   */
  export namespace UpdateUserPreferences {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdatePreferencesRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateUserPreferencesData;
  }

  /**
   * No description
   * @tags users
   * @name ToggleOnlinePresence
   * @request PATCH:/api/v1/users/me/toggle-presence
   * @secure
   * @response `200` `ToggleOnlinePresenceData`
   */
  export namespace ToggleOnlinePresence {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ToggleOnlinePresenceData;
  }

  /**
   * No description
   * @tags users
   * @name GetRiderOrder
   * @request GET:/api/v1/users/me/orders/{orderId}
   * @secure
   * @response `200` `GetRiderOrderData`
   */
  export namespace GetRiderOrder {
    export type RequestParams = {
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRiderOrderData;
  }

  /**
   * No description
   * @tags users
   * @name VerifyDriversLicense
   * @request PATCH:/api/v1/users/me/documents/drivers-license/verify
   * @secure
   * @response `200` `VerifyDriversLicenseData`
   */
  export namespace VerifyDriversLicense {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SubmitDriversLicenseRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = VerifyDriversLicenseData;
  }

  /**
   * No description
   * @tags users
   * @name SubmitDriversLicense
   * @request PATCH:/api/v1/users/me/documents/drivers-license
   * @secure
   * @response `200` `SubmitDriversLicenseData`
   */
  export namespace SubmitDriversLicense {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SubmitDriversLicenseRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = SubmitDriversLicenseData;
  }

  /**
   * No description
   * @tags users
   * @name GetUserVehicle
   * @request GET:/api/v1/users/me/vehicle
   * @secure
   * @response `200` `GetUserVehicleData`
   */
  export namespace GetUserVehicle {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserVehicleData;
  }

  /**
   * No description
   * @tags admins/users
   * @name NewFeatureLaunchNotification
   * @request PATCH:/api/v1/admins/users/new-features-nofitication
   * @secure
   * @response `200` `NewFeatureLaunchNotificationData`
   */
  export namespace NewFeatureLaunchNotification {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = NewFeatureLaunchNotificationData;
  }

  /**
   * No description
   * @tags admins/users
   * @name CreateUser2
   * @request POST:/api/v1/admins/users
   * @originalName createUser
   * @duplicate
   * @response `201` `CreateUser2Data`
   */
  export namespace CreateUser2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateUserRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = CreateUser2Data;
  }

  /**
   * No description
   * @tags admins/users
   * @name GetUsers
   * @request GET:/api/v1/admins/users
   * @secure
   * @response `200` `GetUsersData`
   */
  export namespace GetUsers {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUsersData;
  }

  /**
   * No description
   * @tags admins/users
   * @name GetUser
   * @request GET:/api/v1/admins/users/{userId}
   * @secure
   * @response `200` `GetUserData`
   */
  export namespace GetUser {
    export type RequestParams = {
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserData;
  }

  /**
   * No description
   * @tags admins/users
   * @name VerifyDriversLicense2
   * @request PATCH:/api/v1/admins/users/{userId}/drivers-license/verify
   * @originalName verifyDriversLicense
   * @duplicate
   * @secure
   * @response `200` `VerifyDriversLicense2Data`
   */
  export namespace VerifyDriversLicense2 {
    export type RequestParams = {
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = SubmitDriversLicenseRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = VerifyDriversLicense2Data;
  }

  /**
   * No description
   * @tags admins/users
   * @name ApproveDriversLicenseSubmission
   * @request PATCH:/api/v1/admins/users/{userId}/drivers-license/approve
   * @secure
   * @response `200` `ApproveDriversLicenseSubmissionData`
   */
  export namespace ApproveDriversLicenseSubmission {
    export type RequestParams = {
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ApproveDriversLicenseSubmissionData;
  }

  /**
   * No description
   * @tags admins/users
   * @name UpdateDriversLicense
   * @request PATCH:/api/v1/admins/users/{userId}/drivers-license/update
   * @secure
   * @response `200` `UpdateDriversLicenseData`
   */
  export namespace UpdateDriversLicense {
    export type RequestParams = {
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateDriverLicenseRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateDriversLicenseData;
  }

  /**
   * No description
   * @tags admins/users
   * @name UpdateSettlementAccount2
   * @request PATCH:/api/v1/admins/users/users/{userId}/wallets/{walletId}/settlement-account
   * @originalName updateSettlementAccount
   * @duplicate
   * @secure
   * @response `200` `UpdateSettlementAccount2Data`
   */
  export namespace UpdateSettlementAccount2 {
    export type RequestParams = {
      userId: string;
      walletId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateSettlementAccountRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateSettlementAccount2Data;
  }

  /**
   * No description
   * @tags admins/users
   * @name GetUserProfile2
   * @request GET:/api/v1/admins/users/me
   * @originalName getUserProfile
   * @duplicate
   * @secure
   * @response `200` `GetUserProfile2Data`
   */
  export namespace GetUserProfile2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserProfile2Data;
  }

  /**
   * No description
   * @tags admins/users
   * @name UpdateProfilePhoto2
   * @request PATCH:/api/v1/admins/users/me/update-profile-photo
   * @originalName updateProfilePhoto
   * @duplicate
   * @secure
   * @response `200` `UpdateProfilePhoto2Data`
   */
  export namespace UpdateProfilePhoto2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdatePhotoRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateProfilePhoto2Data;
  }

  /**
   * No description
   * @tags admins/users
   * @name UpdateUserAddresses2
   * @request PATCH:/api/v1/admins/users/me/update-addresses
   * @originalName updateUserAddresses
   * @duplicate
   * @secure
   * @response `200` `UpdateUserAddresses2Data`
   */
  export namespace UpdateUserAddresses2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateAddressesRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateUserAddresses2Data;
  }

  /**
   * No description
   * @tags admins/users
   * @name ChangeUserPassword2
   * @request PATCH:/api/v1/admins/users/me/password-change
   * @originalName changeUserPassword
   * @duplicate
   * @secure
   * @response `200` `ChangeUserPassword2Data`
   */
  export namespace ChangeUserPassword2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ChangePasswordRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = ChangeUserPassword2Data;
  }

  /**
   * No description
   * @tags wallets
   * @name CreateWallet
   * @request POST:/api/v1/wallets
   * @secure
   * @response `201` `CreateWalletData`
   */
  export namespace CreateWallet {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = WalletCreateRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = CreateWalletData;
  }

  /**
   * No description
   * @tags transactions
   * @name GetTransactions
   * @request GET:/api/v1/transactions
   * @secure
   * @response `200` `GetTransactionsData`
   */
  export namespace GetTransactions {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTransactionsData;
  }

  /**
   * No description
   * @tags admins/transactions
   * @name GetTransactions2
   * @request GET:/api/v1/admins/transactions
   * @originalName getTransactions
   * @duplicate
   * @secure
   * @response `200` `GetTransactions2Data`
   */
  export namespace GetTransactions2 {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTransactions2Data;
  }

  /**
   * No description
   * @tags admins/transactions
   * @name GetTransaction
   * @request GET:/api/v1/admins/transactions/{transactionId}
   * @secure
   * @response `200` `GetTransactionData`
   */
  export namespace GetTransaction {
    export type RequestParams = {
      transactionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTransactionData;
  }

  /**
   * No description
   * @tags admins/coupons
   * @name CreateCoupon
   * @request POST:/api/v1/admins/coupons
   * @secure
   * @response `201` `CreateCouponData`
   */
  export namespace CreateCoupon {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateCouponRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCouponData;
  }

  /**
   * No description
   * @tags admins/coupons
   * @name CreateGroup
   * @request POST:/api/v1/admins/coupons/groups
   * @secure
   * @response `201` `CreateGroupData`
   */
  export namespace CreateGroup {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateGroupRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = CreateGroupData;
  }

  /**
   * No description
   * @tags admins/coupons
   * @name AddGroupUsers
   * @request PATCH:/api/v1/admins/coupons/groups/{groupId}/add
   * @secure
   * @response `200` `AddGroupUsersData`
   */
  export namespace AddGroupUsers {
    export type RequestParams = {
      groupId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateGroupUsersRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = AddGroupUsersData;
  }

  /**
   * No description
   * @tags admins/coupons
   * @name RemoveGroupUsers
   * @request PATCH:/api/v1/admins/coupons/groups/{groupId}/remove
   * @secure
   * @response `200` `RemoveGroupUsersData`
   */
  export namespace RemoveGroupUsers {
    export type RequestParams = {
      groupId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateGroupUsersRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = RemoveGroupUsersData;
  }

  /**
   * No description
   * @tags admins/coupons
   * @name DeactivateCoupon
   * @request PATCH:/api/v1/admins/coupons/{couponCode}/deactivate
   * @secure
   * @response `200` `DeactivateCouponData`
   */
  export namespace DeactivateCoupon {
    export type RequestParams = {
      couponCode: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeactivateCouponData;
  }

  /**
   * No description
   * @tags payments
   * @name GetBanks
   * @request GET:/api/v1/payments/{provider}/banks
   * @secure
   * @response `200` `GetBanksData`
   */
  export namespace GetBanks {
    export type RequestParams = {
      provider: "PAYSTACK" | "FLUTTERWAVE";
    };
    export type RequestQuery = {
      /** A cursor key to fetch the previous page of the list after an intial next request */
      previous?: any;
      /** A cursor that indicates your place in the list. It can be used to fetch the next page of the list */
      next?: any;
      /** The number of objects to return per page. Defaults to 50, and limited to 100 records per page. */
      perPage?: any;
      /** Acceptable values are: ghana, kenya, nigeria, and south africa. */
      country?: any;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBanksData;
  }

  /**
   * No description
   * @tags payments
   * @name CreateDedicatedVirtualAccount
   * @request POST:/api/v1/payments/dedicated-account/create
   * @secure
   * @response `201` `CreateDedicatedVirtualAccountData`
   */
  export namespace CreateDedicatedVirtualAccount {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateVirtualAccountRequestDto;
    export type RequestHeaders = {
      provider: string;
    };
    export type ResponseBody = CreateDedicatedVirtualAccountData;
  }

  /**
   * No description
   * @tags notifications
   * @name GetNotifications
   * @request GET:/api/v1/notifications
   * @secure
   * @response `200` `GetNotificationsData`
   */
  export namespace GetNotifications {
    export type RequestParams = {};
    export type RequestQuery = {
      order?: "ASC" | "DESC";
      isRead?: any;
      page?: number;
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetNotificationsData;
  }

  /**
   * No description
   * @tags notifications
   * @name GetUserNotification
   * @request GET:/api/v1/notifications/{notificationId}
   * @secure
   * @response `200` `GetUserNotificationData`
   */
  export namespace GetUserNotification {
    export type RequestParams = {
      notificationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserNotificationData;
  }

  /**
   * No description
   * @tags notifications
   * @name BulkMarkNotificationsAsRead
   * @request PATCH:/api/v1/notifications/mark-as-read
   * @secure
   * @response `200` `BulkMarkNotificationsAsReadData`
   */
  export namespace BulkMarkNotificationsAsRead {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateNotificationsRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = BulkMarkNotificationsAsReadData;
  }

  /**
   * No description
   * @tags admins/notifications
   * @name CreateTemplate
   * @request POST:/api/v1/admins/notifications/templates
   * @secure
   * @response `201` `CreateTemplateData`
   */
  export namespace CreateTemplate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateTemplateRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTemplateData;
  }

  /**
   * No description
   * @tags admins/notifications
   * @name TriggerNotification
   * @request POST:/api/v1/admins/notifications/trigger
   * @secure
   * @response `201` `TriggerNotificationData`
   */
  export namespace TriggerNotification {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TriggerNotificationRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = TriggerNotificationData;
  }

  /**
   * No description
   * @tags businesses
   * @name CreateBusiness
   * @request POST:/api/v1/businesses
   * @response `201` `CreateBusinessData`
   */
  export namespace CreateBusiness {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateBusinessRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = CreateBusinessData;
  }

  /**
   * No description
   * @tags businesses
   * @name CreateBusinessUser
   * @request POST:/api/v1/businesses/users
   * @secure
   * @response `201` `CreateBusinessUserData`
   */
  export namespace CreateBusinessUser {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateBusinessUserRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = CreateBusinessUserData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetBusinessUser
   * @request GET:/api/v1/businesses/{businessId}/users/{userId}
   * @secure
   * @response `200` `GetBusinessUserData`
   */
  export namespace GetBusinessUser {
    export type RequestParams = {
      businessId: string;
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessUserData;
  }

  /**
   * No description
   * @tags businesses
   * @name UpdateBusinessUser
   * @request PATCH:/api/v1/businesses/{businessId}/users/{userId}
   * @secure
   * @response `200` `UpdateBusinessUserData`
   */
  export namespace UpdateBusinessUser {
    export type RequestParams = {
      businessId: string;
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateProfileRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateBusinessUserData;
  }

  /**
   * No description
   * @tags businesses
   * @name RemoveUserFromBusiness
   * @request DELETE:/api/v1/businesses/{businessId}/users/{userId}
   * @secure
   * @response `200` `RemoveUserFromBusinessData`
   */
  export namespace RemoveUserFromBusiness {
    export type RequestParams = {
      businessId: string;
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RemoveUserFromBusinessData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetBusinessUsers
   * @request GET:/api/v1/businesses/{businessId}/users
   * @secure
   * @response `200` `GetBusinessUsersData`
   */
  export namespace GetBusinessUsers {
    export type RequestParams = {
      businessId: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessUsersData;
  }

  /**
   * No description
   * @tags businesses
   * @name AddVehicles
   * @request POST:/api/v1/businesses/vehicles
   * @secure
   * @response `201` `AddVehiclesData`
   */
  export namespace AddVehicles {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AddVehiclesDto;
    export type RequestHeaders = {};
    export type ResponseBody = AddVehiclesData;
  }

  /**
   * No description
   * @tags businesses
   * @name AssignUserVehicle
   * @request PATCH:/api/v1/businesses/vehicles/{vehicleId}/assign
   * @secure
   * @response `200` `AssignUserVehicleData`
   */
  export namespace AssignUserVehicle {
    export type RequestParams = {
      vehicleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = AssignVehicleDto;
    export type RequestHeaders = {};
    export type ResponseBody = AssignUserVehicleData;
  }

  /**
   * No description
   * @tags businesses
   * @name AddKycDetails
   * @request PATCH:/api/v1/businesses/{businessId}/kyc
   * @secure
   * @response `200` `AddKycDetailsData`
   */
  export namespace AddKycDetails {
    export type RequestParams = {
      businessId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = KYCDetailsDto;
    export type RequestHeaders = {};
    export type ResponseBody = AddKycDetailsData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetUserReviews
   * @request GET:/api/v1/businesses/users/{userId}/reviews
   * @secure
   * @response `200` `GetUserReviewsData`
   */
  export namespace GetUserReviews {
    export type RequestParams = {
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserReviewsData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetBusinessTransactions
   * @request GET:/api/v1/businesses/{businessId}/transactions
   * @secure
   * @response `200` `GetBusinessTransactionsData`
   */
  export namespace GetBusinessTransactions {
    export type RequestParams = {
      businessId: string;
    };
    export type RequestQuery = {
      /** filter by riderId */
      riderId?: string;
      /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
      dateRange?: string;
      /** Allowed order types separated by comma : CREDIT,DEBIT */
      type?: string;
      /** Allowed categories separated by comma : FEE,DEPOSIT,WITHDRAWAL,REVERSAL,CHARGE */
      category?: string;
      /** Allowed statuses separated by comma : PROCESSING,FAILED,SUCCESS */
      status?: string;
      /** Order by default is ASC, select either from the the enum ['ASC', 'DESC'] */
      order?: "ASC" | "DESC";
      page?: number;
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessTransactionsData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetBusinessTransaction
   * @request GET:/api/v1/businesses/{businessId}/transactions/{transactionId}
   * @secure
   * @response `200` `GetBusinessTransactionData`
   */
  export namespace GetBusinessTransaction {
    export type RequestParams = {
      businessId: string;
      transactionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessTransactionData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetBusinessOrders
   * @request GET:/api/v1/businesses/{businessId}/orders
   * @secure
   * @response `200` `GetBusinessOrdersData`
   */
  export namespace GetBusinessOrders {
    export type RequestParams = {
      businessId: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessOrdersData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetBusinessOrder
   * @request GET:/api/v1/businesses/{businessId}/orders/{orderId}
   * @secure
   * @response `200` `GetBusinessOrderData`
   */
  export namespace GetBusinessOrder {
    export type RequestParams = {
      businessId: string;
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessOrderData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetBusinessWallets
   * @request GET:/api/v1/businesses/{businessId}/wallets
   * @secure
   * @response `200` `GetBusinessWalletsData`
   */
  export namespace GetBusinessWallets {
    export type RequestParams = {
      businessId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessWalletsData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetBusinessWallet
   * @request GET:/api/v1/businesses/{businessId}/wallets/{walletId}
   * @secure
   * @response `200` `GetBusinessWalletData`
   */
  export namespace GetBusinessWallet {
    export type RequestParams = {
      walletId: string;
      businessId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessWalletData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetBusinessOrderStatistics
   * @request GET:/api/v1/businesses/{businessId}/order-statistics
   * @secure
   * @response `200` `GetBusinessOrderStatisticsData`
   */
  export namespace GetBusinessOrderStatistics {
    export type RequestParams = {
      businessId: string;
    };
    export type RequestQuery = {
      /** filter by riderId */
      riderId?: string;
      /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
      dateRange?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessOrderStatisticsData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetBusinessOrderStatusChart
   * @request GET:/api/v1/businesses/{businessId}/order-status-chart
   * @secure
   * @response `200` `GetBusinessOrderStatusChartData`
   */
  export namespace GetBusinessOrderStatusChart {
    export type RequestParams = {
      businessId: string;
    };
    export type RequestQuery = {
      /** filter by riderId */
      riderId?: string;
      /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
      dateRange?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessOrderStatusChartData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetBusinessOrderTypeChart
   * @request GET:/api/v1/businesses/{businessId}/order-type-chart
   * @secure
   * @response `200` `GetBusinessOrderTypeChartData`
   */
  export namespace GetBusinessOrderTypeChart {
    export type RequestParams = {
      businessId: string;
    };
    export type RequestQuery = {
      /** filter by riderId */
      riderId?: string;
      /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
      dateRange?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessOrderTypeChartData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetBusiness
   * @request GET:/api/v1/businesses/{businessId}
   * @secure
   * @response `200` `GetBusinessData`
   */
  export namespace GetBusiness {
    export type RequestParams = {
      businessId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessData;
  }

  /**
   * No description
   * @tags businesses
   * @name GetBusinessVehicles
   * @request GET:/api/v1/businesses/{businessId}/vehicles
   * @secure
   * @response `200` `GetBusinessVehiclesData`
   */
  export namespace GetBusinessVehicles {
    export type RequestParams = {
      businessId: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessVehiclesData;
  }

  /**
   * No description
   * @tags businesses
   * @name UpdateBusinessPreferences
   * @request PATCH:/api/v1/businesses/{businessId}/preferences
   * @secure
   * @response `200` `UpdateBusinessPreferencesData`
   */
  export namespace UpdateBusinessPreferences {
    export type RequestParams = {
      businessId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdatePreferencesRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateBusinessPreferencesData;
  }

  /**
   * No description
   * @tags businesses
   * @name SuspendBusinessUser
   * @request PATCH:/api/v1/businesses/{businessId}/users/{userId}/suspend
   * @secure
   * @response `200` `SuspendBusinessUserData`
   */
  export namespace SuspendBusinessUser {
    export type RequestParams = {
      businessId: string;
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SuspendBusinessUserData;
  }

  /**
   * No description
   * @tags businesses
   * @name UnsuspendBusinessUser
   * @request PATCH:/api/v1/businesses/{businessId}/users/{userId}/unsuspend
   * @secure
   * @response `200` `UnsuspendBusinessUserData`
   */
  export namespace UnsuspendBusinessUser {
    export type RequestParams = {
      businessId: string;
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = UnsuspendBusinessUserData;
  }

  /**
   * No description
   * @tags businesses
   * @name UpdateBusinessVehicle
   * @request PATCH:/api/v1/businesses/{businessId}/vehicles/{vehicleId}
   * @secure
   * @response `200` `UpdateBusinessVehicleData`
   */
  export namespace UpdateBusinessVehicle {
    export type RequestParams = {
      businessId: string;
      vehicleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateVehicleRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateBusinessVehicleData;
  }

  /**
   * No description
   * @tags reviews
   * @name GetReviews
   * @request GET:/api/v1/reviews
   * @secure
   * @response `200` `GetReviewsData`
   */
  export namespace GetReviews {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetReviewsData;
  }

  /**
   * No description
   * @tags reviews
   * @name RateRider
   * @request POST:/api/v1/reviews/rate-rider
   * @secure
   * @response `201` `RateRiderData`
   */
  export namespace RateRider {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RateRiderRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = RateRiderData;
  }

  /**
   * No description
   * @tags vehicles
   * @name UpdateUserVehicle
   * @request POST:/api/v1/vehicles
   * @secure
   * @response `201` `UpdateUserVehicleData`
   */
  export namespace UpdateUserVehicle {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateVehicleRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateUserVehicleData;
  }

  /**
   * No description
   * @tags vehicles
   * @name GetVehicle
   * @request GET:/api/v1/vehicles/{vehicleId}
   * @secure
   * @response `200` `GetVehicleData`
   */
  export namespace GetVehicle {
    export type RequestParams = {
      vehicleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetVehicleData;
  }

  /**
   * No description
   * @tags vehicles
   * @name DeleteUserVehicle
   * @request DELETE:/api/v1/vehicles/{vehicleId}
   * @secure
   * @response `200` `DeleteUserVehicleData`
   */
  export namespace DeleteUserVehicle {
    export type RequestParams = {
      vehicleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteUserVehicleData;
  }

  /**
   * No description
   * @tags admins/vehicles
   * @name GetVehicles
   * @request GET:/api/v1/admins/vehicles
   * @secure
   * @response `200` `GetVehiclesData`
   */
  export namespace GetVehicles {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetVehiclesData;
  }

  /**
   * No description
   * @tags admins/vehicles
   * @name UpdateUserVehicle2
   * @request POST:/api/v1/admins/vehicles/{userId}/create
   * @originalName updateUserVehicle
   * @duplicate
   * @secure
   * @response `201` `UpdateUserVehicle2Data`
   */
  export namespace UpdateUserVehicle2 {
    export type RequestParams = {
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateVehicleRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateUserVehicle2Data;
  }

  /**
   * No description
   * @tags admins/vehicles
   * @name VerifyVehicle
   * @request PATCH:/api/v1/admins/vehicles/{vehicleId}/users/{userId}/verify
   * @secure
   * @response `200` `VerifyVehicleData`
   */
  export namespace VerifyVehicle {
    export type RequestParams = {
      vehicleId: string;
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = VerifyVehicleData;
  }

  /**
   * No description
   * @tags admins/vehicles
   * @name RejectVehicle
   * @request PATCH:/api/v1/admins/vehicles/{vehicleId}/users/{userId}/reject
   * @secure
   * @response `200` `RejectVehicleData`
   */
  export namespace RejectVehicle {
    export type RequestParams = {
      vehicleId: string;
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateVehicleStatusRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = RejectVehicleData;
  }

  /**
   * No description
   * @tags admins/vehicles
   * @name SuspendVehicle
   * @request PATCH:/api/v1/admins/vehicles/{vehicleId}/users/{userId}/suspend
   * @secure
   * @response `200` `SuspendVehicleData`
   */
  export namespace SuspendVehicle {
    export type RequestParams = {
      vehicleId: string;
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateVehicleStatusRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = SuspendVehicleData;
  }

  /**
   * No description
   * @tags admins/vehicles
   * @name GetVehicle2
   * @request GET:/api/v1/admins/vehicles/{vehicleId}
   * @originalName getVehicle
   * @duplicate
   * @secure
   * @response `200` `GetVehicle2Data`
   */
  export namespace GetVehicle2 {
    export type RequestParams = {
      vehicleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetVehicle2Data;
  }

  /**
   * No description
   * @tags admins/vehicles
   * @name DeleteVehicle
   * @request DELETE:/api/v1/admins/vehicles/{vehicleId}
   * @secure
   * @response `200` `DeleteVehicleData`
   */
  export namespace DeleteVehicle {
    export type RequestParams = {
      vehicleId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteVehicleData;
  }

  /**
   * No description
   * @tags orders
   * @name CreateSingleOrder
   * @request POST:/api/v1/orders/single
   * @secure
   * @response `201` `CreateSingleOrderData`
   */
  export namespace CreateSingleOrder {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateSingleOrderDto;
    export type RequestHeaders = {
      "x-country-code": string;
      "x-state-code": string;
    };
    export type ResponseBody = CreateSingleOrderData;
  }

  /**
   * No description
   * @tags orders
   * @name CreateBulkOrder
   * @request POST:/api/v1/orders/bulk
   * @secure
   * @response `201` `CreateBulkOrderData`
   */
  export namespace CreateBulkOrder {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateBulkOrderDto;
    export type RequestHeaders = {
      "x-country-code": string;
      "x-state-code": string;
    };
    export type ResponseBody = CreateBulkOrderData;
  }

  /**
   * No description
   * @tags orders
   * @name CreateBatchOrder
   * @request POST:/api/v1/orders/batch
   * @secure
   * @response `201` `CreateBatchOrderData`
   */
  export namespace CreateBatchOrder {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateBatchOrderDto;
    export type RequestHeaders = {
      "x-country-code": string;
      "x-state-code": string;
    };
    export type ResponseBody = CreateBatchOrderData;
  }

  /**
   * No description
   * @tags orders
   * @name RequestOrderRiders
   * @request POST:/api/v1/orders/{orderId}/request-riders
   * @secure
   * @response `201` `RequestOrderRidersData`
   */
  export namespace RequestOrderRiders {
    export type RequestParams = {
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = RidersRequestDto;
    export type RequestHeaders = {
      "x-country-code": string;
      "x-state-code": string;
    };
    export type ResponseBody = RequestOrderRidersData;
  }

  /**
   * No description
   * @tags orders
   * @name CancelOrderLocation
   * @request PATCH:/api/v1/orders/{orderId}/locations/{locationId}/cancel
   * @secure
   * @response `200` `CancelOrderLocationData`
   */
  export namespace CancelOrderLocation {
    export type RequestParams = {
      orderId: string;
      locationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CancelLocationRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = CancelOrderLocationData;
  }

  /**
   * No description
   * @tags orders
   * @name CancelOrder
   * @request PATCH:/api/v1/orders/{orderId}/cancel
   * @secure
   * @response `200` `CancelOrderData`
   */
  export namespace CancelOrder {
    export type RequestParams = {
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CancelOrderRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = CancelOrderData;
  }

  /**
   * No description
   * @tags orders
   * @name MakeOrderOffer
   * @request POST:/api/v1/orders/{orderId}/offers
   * @secure
   * @response `201` `MakeOrderOfferData`
   */
  export namespace MakeOrderOffer {
    export type RequestParams = {
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = MakeOfferRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = MakeOrderOfferData;
  }

  /**
   * No description
   * @tags orders
   * @name InitiateOrderPayment
   * @request PATCH:/api/v1/orders/{orderId}/wallets/{walletId}/pay
   * @secure
   * @response `200` `InitiateOrderPaymentData`
   */
  export namespace InitiateOrderPayment {
    export type RequestParams = {
      orderId: string;
      walletId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = InitiateOrderPaymentData;
  }

  /**
   * No description
   * @tags orders
   * @name AcceptOrRejectOrderOffer
   * @request PATCH:/api/v1/orders/{orderId}/offers/{offerId}
   * @secure
   * @response `200` `AcceptOrRejectOrderOfferData`
   */
  export namespace AcceptOrRejectOrderOffer {
    export type RequestParams = {
      orderId: string;
      offerId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = AcceptRejectOfferRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = AcceptOrRejectOrderOfferData;
  }

  /**
   * No description
   * @tags orders
   * @name StartOrder
   * @request PATCH:/api/v1/orders/{orderId}/start
   * @secure
   * @response `200` `StartOrderData`
   */
  export namespace StartOrder {
    export type RequestParams = {
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = StartOrderData;
  }

  /**
   * No description
   * @tags orders
   * @name StartOrderLocation
   * @request PATCH:/api/v1/orders/{orderId}/locations/{locationId}/start
   * @secure
   * @response `200` `StartOrderLocationData`
   */
  export namespace StartOrderLocation {
    export type RequestParams = {
      orderId: string;
      locationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = StartOrderLocationData;
  }

  /**
   * No description
   * @tags orders
   * @name UpdateOrderLocationStatus
   * @request PATCH:/api/v1/orders/{orderId}/locations/{locationId}/status
   * @secure
   * @response `200` `UpdateOrderLocationStatusData`
   */
  export namespace UpdateOrderLocationStatus {
    export type RequestParams = {
      orderId: string;
      locationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateLocationStatusRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateOrderLocationStatusData;
  }

  /**
   * No description
   * @tags orders
   * @name ApplyOrderCoupon
   * @request PATCH:/api/v1/orders/{orderId}/coupons/{couponCode}/apply
   * @secure
   * @response `200` `ApplyOrderCouponData`
   */
  export namespace ApplyOrderCoupon {
    export type RequestParams = {
      orderId: string;
      couponCode: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ApplyOrderCouponData;
  }

  /**
   * No description
   * @tags orders
   * @name RemoveOrderCoupon
   * @request PATCH:/api/v1/orders/{orderId}/coupons/{couponCode}/remove
   * @secure
   * @response `200` `RemoveOrderCouponData`
   */
  export namespace RemoveOrderCoupon {
    export type RequestParams = {
      orderId: string;
      couponCode: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RemoveOrderCouponData;
  }

  /**
   * No description
   * @tags orders
   * @name CompleteOrderLocation
   * @request PATCH:/api/v1/orders/{orderId}/locations/{locationId}/complete
   * @secure
   * @response `200` `CompleteOrderLocationData`
   */
  export namespace CompleteOrderLocation {
    export type RequestParams = {
      orderId: string;
      locationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CompleteLocationRequestDto;
    export type RequestHeaders = {};
    export type ResponseBody = CompleteOrderLocationData;
  }

  /**
   * No description
   * @tags orders
   * @name CompleteOrder
   * @request PATCH:/api/v1/orders/{orderId}/complete
   * @secure
   * @response `200` `CompleteOrderData`
   */
  export namespace CompleteOrder {
    export type RequestParams = {
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {
      "x-country-code": string;
      "x-state-code": string;
    };
    export type ResponseBody = CompleteOrderData;
  }

  /**
   * No description
   * @tags orders
   * @name QueueOrder
   * @request PATCH:/api/v1/orders/{orderId}/queue
   * @secure
   * @response `200` `QueueOrderData`
   */
  export namespace QueueOrder {
    export type RequestParams = {
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = QueueOrderData;
  }

  /**
   * No description
   * @tags orders
   * @name GetQueuedOrders
   * @request GET:/api/v1/orders/queued-orders
   * @secure
   * @response `200` `GetQueuedOrdersData`
   */
  export namespace GetQueuedOrders {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {
      "x-country-code": string;
      "x-state-code": string;
    };
    export type ResponseBody = GetQueuedOrdersData;
  }

  /**
   * No description
   * @tags orders
   * @name GetActiveOffers
   * @request GET:/api/v1/orders/{orderId}/active-offers
   * @secure
   * @response `200` `GetActiveOffersData`
   */
  export namespace GetActiveOffers {
    export type RequestParams = {
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetActiveOffersData;
  }

  /**
   * No description
   * @tags orders
   * @name GetUserOrders
   * @request GET:/api/v1/orders
   * @secure
   * @response `200` `GetUserOrdersData`
   */
  export namespace GetUserOrders {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserOrdersData;
  }

  /**
   * No description
   * @tags orders
   * @name GetRiderOrders
   * @request GET:/api/v1/orders/riders
   * @secure
   * @response `200` `GetRiderOrdersData`
   */
  export namespace GetRiderOrders {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRiderOrdersData;
  }

  /**
   * No description
   * @tags orders
   * @name GetUserOrder
   * @request GET:/api/v1/orders/{orderId}
   * @secure
   * @response `200` `GetUserOrderData`
   */
  export namespace GetUserOrder {
    export type RequestParams = {
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserOrderData;
  }

  /**
   * No description
   * @tags orders
   * @name GetRiderOrderStatistics
   * @request GET:/api/v1/orders/riders/order-statistics
   * @secure
   * @response `200` `GetRiderOrderStatisticsData`
   */
  export namespace GetRiderOrderStatistics {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
      dateRange?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {
      "x-state-code"?: string;
      "x-country-code"?: string;
    };
    export type ResponseBody = GetRiderOrderStatisticsData;
  }

  /**
   * No description
   * @tags orders
   * @name GetOrderStatusChart
   * @request GET:/api/v1/orders/riders/status-chart
   * @secure
   * @response `200` `GetOrderStatusChartData`
   */
  export namespace GetOrderStatusChart {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
      dateRange?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetOrderStatusChartData;
  }

  /**
   * No description
   * @tags orders
   * @name GetOrderTypeChart
   * @request GET:/api/v1/orders/riders/type-chart
   * @secure
   * @response `200` `GetOrderTypeChartData`
   */
  export namespace GetOrderTypeChart {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Comma-separated start and end date filter (e.g., 2023-09-01,2023-09-30) */
      dateRange?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetOrderTypeChartData;
  }

  /**
   * No description
   * @tags admins/orders
   * @name GetUserOrders2
   * @request GET:/api/v1/admins/orders
   * @originalName getUserOrders
   * @duplicate
   * @secure
   * @response `200` `GetUserOrders2Data`
   */
  export namespace GetUserOrders2 {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserOrders2Data;
  }

  /**
   * No description
   * @tags datalogs
   * @name GetLogs
   * @request GET:/api/v1/datalogs
   * @secure
   * @response `200` `GetLogsData`
   */
  export namespace GetLogs {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetLogsData;
  }

  /**
   * No description
   * @tags audit-logs
   * @name FindAll
   * @request GET:/api/v1/audit-logs
   * @secure
   * @response `200` `FindAllData`
   */
  export namespace FindAll {
    export type RequestParams = {};
    export type RequestQuery = {
      order?: "ASC" | "DESC";
      page?: number;
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = FindAllData;
  }

  /**
   * No description
   * @tags webhooks
   * @name HandleWebhookEvents
   * @request POST:/api/v1/webhooks/public/{provider}/events
   * @response `200` `HandleWebhookEventsData`
   */
  export namespace HandleWebhookEvents {
    export type RequestParams = {
      provider: "PAYSTACK" | "FLUTTERWAVE";
    };
    export type RequestQuery = {};
    export type RequestBody = Object;
    export type RequestHeaders = {};
    export type ResponseBody = HandleWebhookEventsData;
  }
}
