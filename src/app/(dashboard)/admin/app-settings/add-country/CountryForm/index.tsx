"use client";

import { UI } from "@/components/ui";
import { useAddCountryMn } from "@/api/mutations/country";
import { useFormik } from "formik";
import { AddCountryDto } from "@/services";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

const FormValidation = Yup.object().shape({
  name: Yup.string().required("Country name is required"),
  code: Yup.string().required("Country code is required"),
  currencyName: Yup.string().required("Currency name is required"),
  currencyCode: Yup.string().required("Currency code is required"),
});

export const CountryForm = () => {
  const router = useRouter();
  const addCountryMn = useAddCountryMn();

  const handleSubmit = (values: AddCountryDto) => {
    addCountryMn.mutate(values);
  };

  const formik = useFormik<AddCountryDto>({
    initialValues: {
      name: "",
      code: "",
      currencyName: "",
      currencyCode: "",
    },
    validationSchema: FormValidation,
    enableReinitialize: true,
    onSubmit: handleSubmit,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        formik.handleSubmit(e);
      }}
    >
      <UI.PrimaryHeading text="Add country" />
      <div className="mt-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UI.Input
            labelValue="Country name"
            id="Country name"
            className="w-full"
            {...formik.getFieldProps("name")}
            errorMessage={formik.touched.name && formik.errors.name}
          />
          <UI.Input
            labelValue="Code"
            id="Code"
            className="w-full"
            {...formik.getFieldProps("code")}
            errorMessage={formik.touched.code && formik.errors.code}
          />
        </div>

        <div className="flex items-center mt-6 gap-x-8">
          <UI.Input
            labelValue="Currency name"
            id="Currency name"
            className="w-full"
            {...formik.getFieldProps("currencyName")}
            errorMessage={formik.touched.currencyName && formik.errors.currencyName}
          />
          <UI.Input
            labelValue="Currency code"
            id="Currency code"
            className="w-full"
            {...formik.getFieldProps("currencyCode")}
            errorMessage={formik.touched.currencyCode && formik.errors.currencyCode}
          />
          <div className="flex flex-col gap-y-1.5">
            <UI.Label className="text-xs font-montserrat">Exchange rate</UI.Label>
            <div className="flex  text-xs items-center gap-x-3 w-full sm:w-[21rem] border rounded-lg justify-between h-9 py-1 px-4">
              <span>$1</span>
              <span className="grow border-dashed border"></span>
              <span>N 1,700</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-x-4">
          <UI.PrimaryButton variant="outline" className="w-[10rem]" type="button" onClick={() => router.back()}>
            Back
          </UI.PrimaryButton>
          <UI.PrimaryButton
            className="w-[10rem]"
            type="submit"
            disabled={!formik.isValid}
            isLoading={addCountryMn.isPending}
          >
            Save
          </UI.PrimaryButton>
        </div>
      </div>
    </form>
  );
};
