"use client";

import { useGetCountryQuery, useGetCountryStateQuery, useUpdateCountryStateMn } from "@/api";
import { UI } from "@/components/ui";
import { UpdateStateDto } from "@/services";
import { baseUnitToSubUnit, formatMoney, subUnitToBaseUnit } from "@/utils";
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
    queueOrderByDefault: Yup.boolean().required("Queue order by default is required"),
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
    locationUpdateEnabled: Yup.boolean(),
    locationUpdateFreeRadiusMeters: Yup.number().min(1, "Free radius must be at least 1 meter"),
    locationUpdateMaxPerLocation: Yup.number().min(1, "Must allow at least 1 update per location"),
    locationUpdateMaxDeclinesPerLocation: Yup.number().min(1, "Must allow at least 1 decline per location"),
    locationUpdateRiderAcceptTimeoutSec: Yup.number().min(30, "Timeout must be at least 30 seconds"),
    arrivalGateEnabled: Yup.boolean(),
    arrivalRadiusMeters: Yup.number().min(1, "Arrival radius must be at least 1 meter"),
    etaEnabled: Yup.boolean(),
    etaAverageSpeedKmh: Yup.number().min(1, "Average speed must be at least 1 km/h"),
  }),
});

interface StateConfigProps {
  countryId: string;
  stateId: string;
}

const StateConfig: React.FC<StateConfigProps> = ({ countryId, stateId }) => {
  const router = useRouter();
  const { data: state } = useGetCountryStateQuery(countryId, stateId);
  const { data: country } = useGetCountryQuery(countryId);
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
        serviceCharge: state?.config?.serviceCharge ?? 0,
        queueOrderByDefault: state?.config?.queueOrderByDefault ?? true,
        minimumOrderPrice: state?.config?.minimumOrderPrice ?? 1,
        maxRidersPerQuery: state?.config?.maxRidersPerQuery ?? 5,
        maxActiveOrders: state?.config?.maxActiveOrders ?? 5,
        maxDistanceRadius: state?.config?.maxDistanceRadius ?? 20,
        locationUpdateEnabled: state?.config?.locationUpdateEnabled ?? false,
        locationUpdateFreeRadiusMeters: state?.config?.locationUpdateFreeRadiusMeters ?? 500,
        locationUpdateMaxPerLocation: state?.config?.locationUpdateMaxPerLocation ?? 1,
        locationUpdateMaxDeclinesPerLocation: state?.config?.locationUpdateMaxDeclinesPerLocation ?? 2,
        locationUpdateRiderAcceptTimeoutSec: state?.config?.locationUpdateRiderAcceptTimeoutSec ?? 240,
        arrivalGateEnabled: state?.config?.arrivalGateEnabled ?? false,
        arrivalRadiusMeters: state?.config?.arrivalRadiusMeters ?? 40,
        etaEnabled: state?.config?.etaEnabled ?? true,
        etaAverageSpeedKmh: state?.config?.etaAverageSpeedKmh ?? 25,
      },
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      updateStateMn.mutate(values);
    },
  });

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/app-settings", label: "App settings" },
          { href: `/admin/app-settings/country/${countryId}`, label: country?.name ?? "Country details" },
        ]}
        rootPageLink="/admin"
        currentPage={state?.name ?? "State Details"}
      />

      <section className="mt-11 bg-background rounded-2xl p-6">
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
              labelValue="Base fuel price (subunit)"
              id="Base fuel price"
              className="w-[21rem]"
              {...formik.getFieldProps("config.baseFuelPrice")}
              value={formik.values.config?.baseFuelPrice}
              onChange={({ target }) => {
                const value = target.value;
                formik.setFieldValue("config.baseFuelPrice", Number(value));
              }}
              errorMessage={
                formik.getFieldMeta("config.baseFuelPrice").touched && formik.getFieldMeta("config.baseFuelPrice").error
              }
            />
            <UI.Input
              labelValue="Current fuel price (subunit)"
              id="Current fuel price"
              className="w-[21rem]"
              {...formik.getFieldProps("config.currentFuelPrice")}
              value={formik.values.config?.currentFuelPrice}
              onChange={({ target }) => {
                const value = target.value?.replace(/[\u20A6,.\s]/g, "");
                if (isNaN(Number(value))) return;
                formik.setFieldValue("config.currentFuelPrice", Number(value));
              }}
              errorMessage={
                formik.getFieldMeta("config.currentFuelPrice").touched &&
                formik.getFieldMeta("config.currentFuelPrice").error
              }
            />
            <UI.Input
              labelValue="Price per km (subunit)"
              id="Price per km"
              className="w-[21rem]"
              {...formik.getFieldProps("config.basePricePerKm")}
              value={formik.values.config?.basePricePerKm}
              onChange={({ target }) => {
                const value = target.value?.replace(/[\u20A6,.\s]/g, "");
                if (isNaN(Number(value))) return;
                formik.setFieldValue("config.basePricePerKm", Number(value));
              }}
              errorMessage={
                formik.getFieldMeta("config.basePricePerKm").touched &&
                formik.getFieldMeta("config.basePricePerKm").error
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
              labelValue="Service charge (subunit)"
              placeholder="0"
              id="serviceCharge"
              type="number"
              min={0}
              className="w-[21rem]"
              {...formik.getFieldProps("config.serviceCharge")}
              value={formik.values.config?.serviceCharge}
              onChange={({ target }) => {
                const value = target.value?.replace(/[\u20A6,.\s]/g, "");
                if (isNaN(Number(value))) return;
                formik.setFieldValue("config.serviceCharge", Number(value));
              }}
              errorMessage={
                formik.getFieldMeta("config.serviceCharge").touched && formik.getFieldMeta("config.serviceCharge").error
              }
            />
            <UI.Input
              labelValue="Minimum order price (subunit)"
              id="minimumOrderPrice"
              className="w-[21rem]"
              {...formik.getFieldProps("config.minimumOrderPrice")}
              value={formik.values.config?.minimumOrderPrice}
              onChange={({ target }) => {
                const value = target.value?.replace(/[\u20A6,.\s]/g, "");
                if (isNaN(Number(value))) return;
                formik.setFieldValue("config.minimumOrderPrice", Number(value));
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
          <div className="mt-5 flex gap-y-4 flex-wrap items-center gap-x-4">
            <UI.Label htmlFor="Queue order by default" className="text-xs">
              Queue order by default
            </UI.Label>
            <UI.Switch
              id="Queue order by default"
              checked={formik.values.config?.queueOrderByDefault}
              onCheckedChange={(checked) => formik.setFieldValue("config.queueOrderByDefault", checked)}
            />
          </div>

          <div className="mt-12">
            <UI.PrimaryHeading text="Mid-order location update" />
            <p className="mt-2 text-xs text-primary-gray">
              Lets a customer move the dropoff mid-order for a fee; the rider must accept. Applies to this state only.
            </p>
            <div className="mt-5 flex gap-y-4 flex-wrap items-center gap-x-4">
              <UI.Label htmlFor="Location update enabled" className="text-xs">
                Enable location updates
              </UI.Label>
              <UI.Switch
                id="Location update enabled"
                checked={formik.values.config?.locationUpdateEnabled}
                onCheckedChange={(checked) => formik.setFieldValue("config.locationUpdateEnabled", checked)}
              />
            </div>
            <div className="my-8 flex gap-y-4 flex-wrap items-center gap-x-4">
              <UI.Input
                labelValue="Free radius (meters)"
                placeholder="500"
                id="locationUpdateFreeRadiusMeters"
                type="number"
                min={1}
                className="w-[21rem]"
                {...formik.getFieldProps("config.locationUpdateFreeRadiusMeters")}
                errorMessage={
                  formik.getFieldMeta("config.locationUpdateFreeRadiusMeters").touched &&
                  formik.getFieldMeta("config.locationUpdateFreeRadiusMeters").error
                }
              />
              <UI.Input
                labelValue="Max updates per location"
                placeholder="1"
                id="locationUpdateMaxPerLocation"
                type="number"
                min={1}
                className="w-[21rem]"
                {...formik.getFieldProps("config.locationUpdateMaxPerLocation")}
                errorMessage={
                  formik.getFieldMeta("config.locationUpdateMaxPerLocation").touched &&
                  formik.getFieldMeta("config.locationUpdateMaxPerLocation").error
                }
              />
              <UI.Input
                labelValue="Max rider declines per location"
                placeholder="2"
                id="locationUpdateMaxDeclinesPerLocation"
                type="number"
                min={1}
                className="w-[21rem]"
                {...formik.getFieldProps("config.locationUpdateMaxDeclinesPerLocation")}
                errorMessage={
                  formik.getFieldMeta("config.locationUpdateMaxDeclinesPerLocation").touched &&
                  formik.getFieldMeta("config.locationUpdateMaxDeclinesPerLocation").error
                }
              />
              <UI.Input
                labelValue="Rider accept timeout (seconds)"
                placeholder="240"
                id="locationUpdateRiderAcceptTimeoutSec"
                type="number"
                min={30}
                className="w-[21rem]"
                {...formik.getFieldProps("config.locationUpdateRiderAcceptTimeoutSec")}
                errorMessage={
                  formik.getFieldMeta("config.locationUpdateRiderAcceptTimeoutSec").touched &&
                  formik.getFieldMeta("config.locationUpdateRiderAcceptTimeoutSec").error
                }
              />
            </div>
          </div>

          <div className="mt-12">
            <UI.PrimaryHeading text="Arrival gate & ETA" />
            <p className="mt-2 text-xs text-primary-gray">
              The arrival gate blocks the rider&apos;s ARRIVED action until they are within the radius of the dropoff.
              ETA shows customers an estimated arrival time based on the average speed below.
            </p>
            <div className="mt-5 flex gap-y-4 flex-wrap items-center gap-x-8">
              <div className="flex items-center gap-x-4">
                <UI.Label htmlFor="Arrival gate enabled" className="text-xs">
                  Enable arrival gate
                </UI.Label>
                <UI.Switch
                  id="Arrival gate enabled"
                  checked={formik.values.config?.arrivalGateEnabled}
                  onCheckedChange={(checked) => formik.setFieldValue("config.arrivalGateEnabled", checked)}
                />
              </div>
              <div className="flex items-center gap-x-4">
                <UI.Label htmlFor="ETA enabled" className="text-xs">
                  Enable ETA
                </UI.Label>
                <UI.Switch
                  id="ETA enabled"
                  checked={formik.values.config?.etaEnabled}
                  onCheckedChange={(checked) => formik.setFieldValue("config.etaEnabled", checked)}
                />
              </div>
            </div>
            <div className="my-8 flex gap-y-4 flex-wrap items-center gap-x-4">
              <UI.Input
                labelValue="Arrival radius (meters)"
                placeholder="40"
                id="arrivalRadiusMeters"
                type="number"
                min={1}
                className="w-[21rem]"
                {...formik.getFieldProps("config.arrivalRadiusMeters")}
                errorMessage={
                  formik.getFieldMeta("config.arrivalRadiusMeters").touched &&
                  formik.getFieldMeta("config.arrivalRadiusMeters").error
                }
              />
              <UI.Input
                labelValue="ETA average speed (km/h)"
                placeholder="25"
                id="etaAverageSpeedKmh"
                type="number"
                min={1}
                className="w-[21rem]"
                {...formik.getFieldProps("config.etaAverageSpeedKmh")}
                errorMessage={
                  formik.getFieldMeta("config.etaAverageSpeedKmh").touched &&
                  formik.getFieldMeta("config.etaAverageSpeedKmh").error
                }
              />
            </div>
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
      </section>
    </div>
  );
};

export { StateConfig };
