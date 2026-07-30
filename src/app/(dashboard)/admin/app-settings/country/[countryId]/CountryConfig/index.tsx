"use client";

import { useGetCountryQuery, useUpdateCountryMn } from "@/api";
import { UI } from "@/components/ui";
import { UpdateCountryDto } from "@/services";
import { formatMoney, subUnitToBaseUnit } from "@/utils";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import * as React from "react";
import * as Yup from "yup";

const FormValidation = Yup.object().shape({
  name: Yup.string().required("Country name is required"),
  config: Yup.object().shape({
    exchangeRate: Yup.number().required("Exchange rate is required"),
    minimumOfferPercentage: Yup.number()
      .required("Minimum offer percentage is required")
      .min(0, "Minimum offer percentage cannot be less that 0")
      .max(100, "Minimum offer percentage cannot be more than 100"),
    userWithdrawalLimits: Yup.object().shape({
      maximumAmount: Yup.number().required("Maximum courier withdrawal amount is required"),
      minimumAmount: Yup.number().required("Minimum courier withdrawal amount is required"),
    }),
    businessWithdrawalLimits: Yup.object().shape({
      maximumAmount: Yup.number().required("Maximum business withdrawal amount is required"),
      minimumAmount: Yup.number().required("Minimum business withdrawal amount is required"),
    }),
    referAndEarn: Yup.boolean().required("Refer and earn is required"),
    referralEarnAmount: Yup.number().optional().min(0, "Referral earn amount cannot be less than 0"),
    ordersRequiredBeforeEarn: Yup.number().optional().min(0, "Orders required before earn cannot be less than 0"),
  }),
});

interface CountryConfigProps {
  countryId: string;
}

const CountryConfig: React.FC<CountryConfigProps> = ({ countryId }) => {
  const router = useRouter();
  const { data: country } = useGetCountryQuery(countryId);
  const updateCountryMn = useUpdateCountryMn(countryId);

  const formik = useFormik<UpdateCountryDto>({
    validationSchema: FormValidation,
    initialValues: {
      name: country?.name ?? "",
      config: {
        exchangeRate: country?.config?.exchangeRate ?? 0,
        minimumOfferPercentage: country?.config?.minimumOfferPercentage ?? 0,
        userWithdrawalLimits: {
          maximumAmount: country?.config?.userWithdrawalLimits.maximumAmount ?? 0,
          minimumAmount: country?.config?.userWithdrawalLimits.minimumAmount ?? 0,
        },
        businessWithdrawalLimits: {
          maximumAmount: country?.config?.businessWithdrawalLimits.maximumAmount ?? 0,
          minimumAmount: country?.config?.businessWithdrawalLimits.minimumAmount ?? 0,
        },
        referAndEarn: country?.config?.referAndEarn ?? false,
        referralEarnAmount: country?.config?.referralEarnAmount ?? 0,
        ordersRequiredBeforeEarn: country?.config?.ordersRequiredBeforeEarn ?? 0,
      },
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      updateCountryMn.mutate(values);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        formik.handleSubmit(e);
      }}
    >
      <div className="mt-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UI.Input
            labelValue="Country name"
            id="Country name"
            className="w-full"
            {...formik.getFieldProps("name")}
            errorMessage={formik.touched.name && formik.errors.name}
          />
          <UI.Input
            labelValue="Country code"
            defaultValue={country?.code}
            placeholder="NG"
            id="Code"
            className="w-full"
            disabled
          />
        </div>
        <div className="mt-6 mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UI.Input
            defaultValue={country?.currencyName}
            placeholder="Naira"
            labelValue="Currency name"
            id="Currency name"
            className="w-full"
            disabled
          />

          <UI.Input
            labelValue="Currency code"
            id="Currency code"
            className="w-full"
            placeholder="NGN"
            defaultValue={country?.currencyCode}
            disabled
          />
          <div className="flex flex-col gap-y-1.5">
            <UI.Label className="text-xs font-montserrat">Exchange rate</UI.Label>
            <div className="flex  text-xs items-center gap-x-3 w-[21rem] border rounded-lg justify-between h-9 py-1 px-4">
              <span>$1</span>
              <span className="grow border-dashed border"></span>
              <span>
                {formatMoney(subUnitToBaseUnit(country?.config?.exchangeRate ?? 0), {
                  currency: country?.currencyCode,
                })}
              </span>
            </div>
          </div>
        </div>

        <UI.PrimaryHeading text="Country Config" />

        <div className="my-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UI.Input
              labelValue="Exchange rate (subunit)"
              id="exchangeRate"
              className="w-full"
              {...formik.getFieldProps("config.exchangeRate")}
              value={formik.values.config?.exchangeRate}
              onChange={({ target }) => {
                const value = target.value?.replace(/[\u20A6,.\s]/g, "");
                if (isNaN(Number(value))) return;
                formik.setFieldValue("config.exchangeRate", Number(value));
              }}
              errorMessage={
                formik.getFieldMeta("config.exchangeRate").touched && formik.getFieldMeta("config.exchangeRate").error
              }
            />
            <UI.Input
              labelValue="Minimum Offer Percentage (%)"
              placeholder="0"
              id="minimumOfferPercentage"
              className="w-full"
              type="number"
              min={0}
              max={100}
              {...formik.getFieldProps("config.minimumOfferPercentage")}
              errorMessage={
                formik.getFieldMeta("config.minimumOfferPercentage").touched &&
                formik.getFieldMeta("config.minimumOfferPercentage").error
              }
            />
          </div>
        </div>

        <UI.SectionHeader text="Courier Withdrawal Limits" />

        <div className="my-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UI.Input
              labelValue="Minimum withdrawal amount (subunit)"
              id="userMinimumWithdrawal"
              className="w-full"
              {...formik.getFieldProps("config.userWithdrawalLimits.minimumAmount")}
              value={formik.values.config?.userWithdrawalLimits?.minimumAmount}
              onChange={({ target }) => {
                const value = target.value?.replace(/[\u20A6,.\s]/g, "");
                if (isNaN(Number(value))) return;
                formik.setFieldValue("config.userWithdrawalLimits.minimumAmount", Number(value));
              }}
              errorMessage={
                formik.getFieldMeta("config.userWithdrawalLimits.minimumAmount").touched &&
                formik.getFieldMeta("config.userWithdrawalLimits.minimumAmount").error
              }
            />
            <UI.Input
              labelValue="Maximum withdrawal amount (subunit)"
              id="userMaximumWithdrawal"
              className="w-full"
              {...formik.getFieldProps("config.userWithdrawalLimits.maximumAmount")}
              value={formik.values.config?.userWithdrawalLimits?.maximumAmount}
              onChange={({ target }) => {
                const value = target.value?.replace(/[\u20A6,.\s]/g, "");
                if (isNaN(Number(value))) return;
                formik.setFieldValue("config.userWithdrawalLimits.maximumAmount", Number(value));
              }}
              errorMessage={
                formik.getFieldMeta("config.userWithdrawalLimits.maximumAmount").touched &&
                formik.getFieldMeta("config.userWithdrawalLimits.maximumAmount").error
              }
            />
          </div>
        </div>

        <UI.SectionHeader text="Business Withdrawal Limits" />

        <div className="my-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UI.Input
              labelValue="Minimum withdrawal amount (subunit)"
              id="businessMinimumWithdrawal"
              className="w-full"
              {...formik.getFieldProps("config.businessWithdrawalLimits.minimumAmount")}
              value={formik.values.config?.businessWithdrawalLimits?.minimumAmount}
              onChange={({ target }) => {
                const value = target.value?.replace(/[\u20A6,.\s]/g, "");
                if (isNaN(Number(value))) return;
                formik.setFieldValue("config.businessWithdrawalLimits.minimumAmount", Number(value));
              }}
              errorMessage={
                formik.getFieldMeta("config.businessWithdrawalLimits.minimumAmount").touched &&
                formik.getFieldMeta("config.businessWithdrawalLimits.minimumAmount").error
              }
            />
            <UI.Input
              labelValue="Maximum withdrawal amount (subunit)"
              id="businessMaximumWithdrawal"
              className="w-full"
              {...formik.getFieldProps("config.businessWithdrawalLimits.maximumAmount")}
              value={formik.values.config?.businessWithdrawalLimits?.maximumAmount}
              onChange={({ target }) => {
                const value = target.value?.replace(/[\u20A6,.\s]/g, "");
                if (isNaN(Number(value))) return;
                formik.setFieldValue("config.businessWithdrawalLimits.maximumAmount", Number(value));
              }}
              errorMessage={
                formik.getFieldMeta("config.businessWithdrawalLimits.maximumAmount").touched &&
                formik.getFieldMeta("config.businessWithdrawalLimits.maximumAmount").error
              }
            />
          </div>
          <div className="my-5 flex gap-y-4 flex-wrap items-center gap-x-4">
            <UI.Label htmlFor="Queue order by default" className="text-xs">
              Refer and earn
            </UI.Label>
            <UI.Switch
              id="Queue order by default"
              checked={formik.values.config?.referAndEarn}
              onCheckedChange={(checked) => formik.setFieldValue("config.referAndEarn", checked)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UI.Input
              labelValue="Referral earn amount (subunit)"
              id="referralEarnAmount"
              className="w-full"
              {...formik.getFieldProps("config.referralEarnAmount")}
              value={formik.values.config?.referralEarnAmount}
              onChange={({ target }) => {
                const value = target.value?.replace(/[\u20A6,.\s]/g, "");
                if (isNaN(Number(value))) return;
                formik.setFieldValue("config.referralEarnAmount", Number(value));
              }}
              errorMessage={
                formik.getFieldMeta("config.referralEarnAmount").touched &&
                formik.getFieldMeta("config.referralEarnAmount").error
              }
            />
            <UI.Input
              labelValue="Orders required before earn"
              id="ordersRequiredBeforeEarn"
              className="w-full"
              {...formik.getFieldProps("config.ordersRequiredBeforeEarn")}
              value={formik.values.config?.ordersRequiredBeforeEarn}
              onChange={({ target }) => {
                const value = target.value?.replace(/[\u20A6,.\s]/g, "");
                if (isNaN(Number(value))) return;
                formik.setFieldValue("config.ordersRequiredBeforeEarn", Number(value));
              }}
              errorMessage={
                formik.getFieldMeta("config.ordersRequiredBeforeEarn").touched &&
                formik.getFieldMeta("config.ordersRequiredBeforeEarn").error
              }
            />
          </div>
        </div>

        <div className="mt-12 flex items-center gap-x-4">
          <UI.PrimaryButton variant="outline" className="w-[10rem]" onClick={() => router.back()} type="button">
            Back
          </UI.PrimaryButton>
          <UI.PrimaryButton
            className="w-[10rem]"
            type="submit"
            disabled={!formik.isValid}
            isLoading={updateCountryMn.isPending}
          >
            Save
          </UI.PrimaryButton>
        </div>
      </div>
    </form>
  );
};

export { CountryConfig };
