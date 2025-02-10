"use client";

import { useGetCountryStateQuery, useUpdateCountryStateMn } from "@/api";
import { UI } from "@/components/ui";
import { UpdateStateDto } from "@/services";
import { formatMoney, subUnitToBaseUnit } from "@/utils";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import * as React from "react";
import * as Yup from "yup";

const FormValidation = Yup.object().shape({
  name: Yup.string().required("State name is required"),
  config: Yup.object().shape({
    basePricePerKm: Yup.number().required("Base price per km is required"),
    baseFuelPrice: Yup.number().required("Base fuel price is required"),
    currentFuelPrice: Yup.number().required("Current fuel price is required"),
    percentageCharge: Yup.number()
      .required("Percentage charge is required")
      .min(0, "Percentage cannot be less than 0")
      .max(100, "Percentage cannot be more than 100"),
    minimumOrderPrice: Yup.number()
      .required("Minimum order price is required")
      .min(0, "Minimum order price cannot be less than 0"),
    maxRidersPerQuery: Yup.number()
      .required("Max riders per query is required")
      .min(0, "Max riders per query cannot be less than 0"),
    maxActiveOrders: Yup.number()
      .required("Max active orders is required")
      .min(0, "Max active orders cannot be less than 0"),
    maxDistanceRadius: Yup.number()
      .required("Max distance radius is required")
      .min(0, "Max distance cannot be less than 0"),
  }),
});

interface StateConfigProps {
  countryId: string;
  stateId: string;
}

const StateConfig: React.FC<StateConfigProps> = ({ countryId, stateId }) => {
  const router = useRouter();
  const { data: state } = useGetCountryStateQuery(countryId, stateId);
  const updateStateMn = useUpdateCountryStateMn(countryId, stateId);

  const formik = useFormik<UpdateStateDto>({
    validationSchema: FormValidation,
    initialValues: {
      name: state?.name ?? "",
      config: {
        basePricePerKm: state?.config?.basePricePerKm ?? 0,
        baseFuelPrice: state?.config?.baseFuelPrice ?? 0,
        currentFuelPrice: state?.config?.currentFuelPrice ?? 0,
        percentageCharge: state?.config?.percentageCharge ?? 0,
        minimumOrderPrice: state?.config?.minimumOrderPrice ?? 1,
        maxRidersPerQuery: state?.config?.maxRidersPerQuery ?? 5,
        maxActiveOrders: state?.config?.maxActiveOrders ?? 5,
        maxDistanceRadius: state?.config?.maxDistanceRadius ?? 20,
      },
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      updateStateMn.mutate(values);
    },
  });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          formik.handleSubmit(e);
        }}
      >
        <UI.PrimaryHeading text="State Details" />
        <div className="my-8 flex items-center gap-x-4">
          <UI.Input
            labelValue="State name"
            id="State name"
            className="w-[21rem]"
            placeholder="State name"
            {...formik.getFieldProps("name")}
            errorMessage={formik.touched.name && formik.errors.name}
          />

          <UI.Input labelValue="Code" id="Code" className="w-[21rem]" defaultValue={state?.code} placeholder="EN" />
        </div>

        <UI.PrimaryHeading text="State Config" />

        <div className="my-8 flex gap-y-4 flex-wrap items-center gap-x-4">
          <UI.Input
            labelValue="Base fuel price"
            id="Base fuel price"
            className="w-[21rem]"
            {...formik.getFieldProps("config.baseFuelPrice")}
            value={formatMoney(subUnitToBaseUnit(formik.values.config?.baseFuelPrice ?? 0), { isCurrency: false })}
            onChange={({ target }) => {
              const value = target.value?.replace(/[\u20A6,.\s]/g, "");
              if (isNaN(Number(value))) return;
              formik.setFieldValue("config.baseFuelPrice", Number(value) * 100);
            }}
            errorMessage={
              formik.getFieldMeta("config.baseFuelPrice").touched && formik.getFieldMeta("config.baseFuelPrice").error
            }
          />
          <UI.Input
            labelValue="Current fuel price"
            id="Current fuel price"
            className="w-[21rem]"
            {...formik.getFieldProps("config.currentFuelPrice")}
            value={formatMoney(subUnitToBaseUnit(formik.values.config?.currentFuelPrice ?? 0), { isCurrency: false })}
            onChange={({ target }) => {
              const value = target.value?.replace(/[\u20A6,.\s]/g, "");
              if (isNaN(Number(value))) return;
              formik.setFieldValue("config.currentFuelPrice", Number(value) * 100);
            }}
            errorMessage={
              formik.getFieldMeta("config.currentFuelPrice").touched &&
              formik.getFieldMeta("config.currentFuelPrice").error
            }
          />
          <UI.Input
            labelValue="Price per km"
            id="Price per km"
            className="w-[21rem]"
            {...formik.getFieldProps("config.basePricePerKm")}
            value={formatMoney(subUnitToBaseUnit(formik.values.config?.basePricePerKm ?? 0), { isCurrency: false })}
            onChange={({ target }) => {
              const value = target.value?.replace(/[\u20A6,.\s]/g, "");
              if (isNaN(Number(value))) return;
              formik.setFieldValue("config.basePricePerKm", Number(value) * 100);
            }}
            errorMessage={
              formik.getFieldMeta("config.basePricePerKm").touched && formik.getFieldMeta("config.basePricePerKm").error
            }
          />
          <UI.Input
            labelValue="Percentage charge (%)"
            placeholder="0"
            id="percentageChange"
            type="number"
            min={0}
            max={100}
            className="w-[21rem]"
            {...formik.getFieldProps("config.percentageCharge")}
            errorMessage={
              formik.getFieldMeta("config.percentageCharge").touched &&
              formik.getFieldMeta("config.percentageCharge").error
            }
          />
          <UI.Input
            labelValue="Minimum order price"
            id="minimumOrderPrice"
            className="w-[21rem]"
            {...formik.getFieldProps("config.minimumOrderPrice")}
            value={formatMoney(subUnitToBaseUnit(formik.values.config?.minimumOrderPrice ?? 0), { isCurrency: false })}
            onChange={({ target }) => {
              const value = target.value?.replace(/[\u20A6,.\s]/g, "");
              if (isNaN(Number(value))) return;
              formik.setFieldValue("config.minimumOrderPrice", Number(value) * 100);
            }}
            errorMessage={
              formik.getFieldMeta("config.minimumOrderPrice").touched &&
              formik.getFieldMeta("config.minimumOrderPrice").error
            }
          />
          <UI.Input
            labelValue="Max number of active orders"
            placeholder="0"
            id="maxActiveOrders"
            type="number"
            min={1}
            className="w-[21rem]"
            {...formik.getFieldProps("config.maxActiveOrders")}
            errorMessage={
              formik.getFieldMeta("config.maxActiveOrders").touched &&
              formik.getFieldMeta("config.maxActiveOrders").error
            }
          />
          <UI.Input
            labelValue="Max number of searchable riders"
            placeholder="0"
            id="maxRidersPerQuery"
            type="number"
            min={1}
            className="w-[21rem]"
            {...formik.getFieldProps("config.maxRidersPerQuery")}
            errorMessage={
              formik.getFieldMeta("config.maxRidersPerQuery").touched &&
              formik.getFieldMeta("config.maxRidersPerQuery").error
            }
          />
          <UI.Input
            labelValue="Max searchable distance (km)"
            placeholder="0"
            id="maxDistanceRadius"
            type="number"
            min={1}
            className="w-[21rem]"
            {...formik.getFieldProps("config.maxDistanceRadius")}
            errorMessage={
              formik.getFieldMeta("config.maxDistanceRadius").touched &&
              formik.getFieldMeta("config.maxDistanceRadius").error
            }
          />
        </div>
        <div className="mt-12 flex items-center gap-x-4">
          <UI.PrimaryButton type="button" variant="outline" className="w-[10rem]" onClick={() => router.back()}>
            Back
          </UI.PrimaryButton>
          <UI.PrimaryButton
            type="submit"
            className="w-[10rem]"
            disabled={!formik.isValid}
            isLoading={updateStateMn.isPending}
          >
            Save
          </UI.PrimaryButton>
        </div>
      </form>
    </>
  );
};

export { StateConfig };
