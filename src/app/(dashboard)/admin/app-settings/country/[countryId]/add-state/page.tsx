"use client";

import * as React from "react";
import { useGetCountryQuery } from "@/api";
import { useAddCountryStatesMn } from "@/api/mutations/state";
import { UI } from "@/components/ui";
import { AddCountryStatesPayload, StateDto } from "@/services";
import { useFormik } from "formik";
import { notFound, useParams } from "next/navigation";
import * as Yup from "yup";
import { formatMoney } from "@/utils";
import { useRouter } from "next/navigation";

const FormValidation = Yup.object().shape({
  name: Yup.string().required("State name is required"),
  code: Yup.string().required("State code is required"),
  config: Yup.object().shape({
    baseFuelPrice: Yup.number().required("Base fuel price is required"),
    currentFuelPrice: Yup.number().required("Current fuel price is required"),
    basePricePerKm: Yup.number().required("Price per km is required"),
    percentageCharge: Yup.number().required("Percentage charge is required"),
    serviceCharge: Yup.number().required("Service charge is required"),
    minimumOrderPrice: Yup.number().required("Minimum order price is required"),
    maxRidersPerQuery: Yup.number().required("Max riders per query is required"),
    maxActiveOrders: Yup.number().required("Max active orders is required"),
    maxDistanceRadius: Yup.number().required("Max distance radius is required"),
    queueOrderByDefault: Yup.boolean().required("Queue order by default is required"),
  }),
});

const AddState: React.FC = () => {
  const params = useParams<{ countryId: string }>();
  const addStateMn = useAddCountryStatesMn(params.countryId, {
    onSuccess: () => {
      router.back();
    },
  });
  const { data: country, isLoading: isLoadingCountry } = useGetCountryQuery(params.countryId);
  const currencySymbol = formatMoney(0, { currency: country?.currencyCode, symbolOnly: true });
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoadingCountry && !country) {
      notFound();
    }
  }, [country, isLoadingCountry]);

  const handleSubmit = (values: StateDto) => {
    addStateMn.mutate([values]);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      code: "",
      config: {
        baseFuelPrice: 0,
        currentFuelPrice: 0,
        basePricePerKm: 0,
        percentageCharge: 0,
        serviceCharge: 0,
        minimumOrderPrice: 0,
        maxRidersPerQuery: 0,
        maxActiveOrders: 0,
        maxDistanceRadius: 0,
        queueOrderByDefault: true,
      },
    },
    validationSchema: FormValidation,
    onSubmit: handleSubmit,
  });

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/app-settings", label: "App settings" },
          { href: `/admin/app-settings/country/${params.countryId}`, label: country?.name ?? "Country Details" },
        ]}
        rootPageLink="/admin"
        currentPage="Add State"
      />

      <section className="mt-11 bg-background rounded-2xl p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            formik.handleSubmit(e);
          }}
        >
          <UI.PrimaryHeading text={`Add State to ${country?.name}`} />
          <div className="my-8 flex items-center gap-x-4">
            <UI.Input
              labelValue="State name"
              id="State name"
              className="w-[21rem]"
              {...formik.getFieldProps("name")}
              errorMessage={formik.touched.name && formik.errors.name}
            />
            <UI.Input
              labelValue="Code"
              id="Code"
              className="w-[21rem]"
              {...formik.getFieldProps("code")}
              errorMessage={formik.touched.code && formik.errors.code}
            />
          </div>
          <UI.PrimaryHeading text="State Config" />
          <div className="mt-5 flex gap-y-4 flex-wrap items-center gap-x-4">
            <UI.Input
              labelValue="Base fuel price"
              id="Base fuel price"
              type="number"
              className="w-[21rem]"
              leftIcon={<span className="font-bold text-muted-foreground">{currencySymbol}</span>}
              {...formik.getFieldProps("config.baseFuelPrice")}
              errorMessage={formik.touched.config?.baseFuelPrice && formik.errors.config?.baseFuelPrice}
            />
            <UI.Input
              labelValue="Current fuel price"
              id="Current fuel price"
              className="w-[21rem]"
              type="number"
              leftIcon={<span className="font-bold text-muted-foreground">{currencySymbol}</span>}
              {...formik.getFieldProps("config.currentFuelPrice")}
              errorMessage={formik.touched.config?.currentFuelPrice && formik.errors.config?.currentFuelPrice}
            />
            <UI.Input
              labelValue="Price per km"
              id="Price per km"
              className="w-[21rem]"
              type="number"
              leftIcon={<span className="font-bold text-muted-foreground">{currencySymbol}</span>}
              {...formik.getFieldProps("config.basePricePerKm")}
              errorMessage={formik.touched.config?.basePricePerKm && formik.errors.config?.basePricePerKm}
            />
            <UI.Input
              labelValue="Service charge"
              id="Service charge"
              className="w-[21rem]"
              type="number"
              leftIcon={<span className="font-bold text-muted-foreground">{currencySymbol}</span>}
              {...formik.getFieldProps("config.serviceCharge")}
              errorMessage={formik.touched.config?.serviceCharge && formik.errors.config?.serviceCharge}
            />
            <UI.Input
              labelValue="Percentage charge (%)"
              id="Percentage charge"
              className="w-[21rem]"
              type="number"
              min={0}
              max={100}
              {...formik.getFieldProps("config.percentageCharge")}
              errorMessage={formik.touched.config?.percentageCharge && formik.errors.config?.percentageCharge}
            />
            <UI.Input
              labelValue="Minimum order price"
              id="Minimum order price"
              className="w-[21rem]"
              type="number"
              leftIcon={<span className="font-bold text-muted-foreground">{currencySymbol}</span>}
              {...formik.getFieldProps("config.minimumOrderPrice")}
              errorMessage={formik.touched.config?.minimumOrderPrice && formik.errors.config?.minimumOrderPrice}
            />
          </div>

          <div className="mt-5 flex gap-y-4 flex-wrap items-center gap-x-4">
            <UI.Input
              labelValue="Max riders per query"
              id="Max riders per query"
              className="w-[21rem]"
              type="number"
              {...formik.getFieldProps("config.maxRidersPerQuery")}
              errorMessage={formik.touched.config?.maxRidersPerQuery && formik.errors.config?.maxRidersPerQuery}
            />
            <UI.Input
              labelValue="Max active orders"
              id="Max active orders"
              className="w-[21rem]"
              type="number"
              {...formik.getFieldProps("config.maxActiveOrders")}
              errorMessage={formik.touched.config?.maxActiveOrders && formik.errors.config?.maxActiveOrders}
            />
            <UI.Input
              labelValue="Max distance radius (km)"
              id="Max distance radius"
              className="w-[21rem]"
              type="number"
              {...formik.getFieldProps("config.maxDistanceRadius")}
              errorMessage={formik.touched.config?.maxDistanceRadius && formik.errors.config?.maxDistanceRadius}
            />
          </div>
          <div className="mt-5 flex gap-y-4 flex-wrap items-center gap-x-4">
            <UI.Label htmlFor="Queue order by default" className="text-xs">
              Queue order by default
            </UI.Label>
            <UI.Switch
              id="Queue order by default"
              checked={formik.values.config.queueOrderByDefault}
              onCheckedChange={(checked) => formik.setFieldValue("config.queueOrderByDefault", checked)}
            />
          </div>
          <div className="mt-12 flex items-center gap-x-4">
            <UI.PrimaryButton type="button" variant="outline" className="w-[10rem]" onClick={() => router.back()}>
              Back
            </UI.PrimaryButton>
            <UI.PrimaryButton
              className="w-[10rem]"
              disabled={!formik.isValid}
              isLoading={addStateMn.isPending}
              type="submit"
            >
              Save
            </UI.PrimaryButton>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AddState;
