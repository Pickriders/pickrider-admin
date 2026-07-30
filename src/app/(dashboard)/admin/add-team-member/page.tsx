"use client";

import { UI } from "@/components/ui";
import { Permissions } from "../Permissions";
import * as Yup from "yup";
import { useFormik } from "formik";
import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService, CreateUserRequestDto, UserSignUpRoles, queryClient } from "@/services";
import { USER_KEY } from "@/api/queries/user";

/**
 * POST /admins/users only accepts the LoginRoles (USER, PLATFORM_RIDER,
 * DEVELOPER) — the backend DTO hard-rejects platform-staff roles. Staff roles
 * are listed but disabled until the backend supports creating them.
 */
const CREATABLE_ROLES = [
  { value: UserSignUpRoles.USER, label: "User (customer)" },
  { value: UserSignUpRoles.PLATFORM_RIDER, label: "Platform Rider" },
  { value: UserSignUpRoles.DEVELOPER, label: "Developer" },
];

const STAFF_ROLES = [
  "SUPER_ADMIN",
  "PLATFORM_ADMIN",
  "PLATFORM_MANAGER",
  "PLATFORM_OPERATION",
  "PLATFORM_FINANCE",
];

const validationSchema = Yup.object({
  firstname: Yup.string().min(3, "At least 3 characters").required("First name is required"),
  lastname: Yup.string().min(3, "At least 3 characters").required("Last name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  password: Yup.string().min(8, "At least 8 characters").required("Password is required"),
  role: Yup.string().required("Role is required"),
  countryCode: Yup.string().required("Country is required"),
});

const AddTeamMemberPage = () => {
  const router = useRouter();

  const { data: countries } = useApiQuery({
    queryKey: ["countries", "all"],
    queryFn: () => apiService.getCountries({ limit: 50 }),
  });

  const createUserMn = useApiMutation({
    mutationFn: (payload: CreateUserRequestDto) => apiService.createUser2(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_KEY.USERS] });
      toast.success("Team member created successfully");
      router.push("/admin/teams-and-permissions");
    },
  });

  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      role: UserSignUpRoles.USER as string,
      email: "",
      phone: "",
      password: "",
      countryCode: "NG",
    },
    validationSchema,
    onSubmit: (values) => {
      const country = countries?.results?.find((entry) => entry.code === values.countryCode);
      createUserMn.mutate({
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        phone: values.phone.replace(/^\+/, ""),
        password: values.password,
        role: values.role as UserSignUpRoles,
        country: {
          name: country?.name ?? "Nigeria",
          code: country?.code ?? "NG",
          currency: country?.currencyCode ?? "NGN",
        },
      });
    },
  });

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/admin", label: "Admin" }]}
        rootPageLink="/admin"
        currentPage="Add Team Member"
      />

      <section className="bg-background rounded-lg sm:px-14 px-5 py-12 mt-11 ">
        <form onSubmit={formik.handleSubmit}>
          <div className="flex lg:flex-row flex-col gap-y-10 items-start">
            <div className="flex-1 w-full">
              <div className="max-w-[24rem]">
                <UI.PrimaryHeading text="Details" />

                <div className="mt-5 space-y-5">
                  <UI.Input
                    labelValue="First Name"
                    id="First Name"
                    {...formik.getFieldProps("firstname")}
                    errorMessage={formik.touched.firstname && formik.errors.firstname}
                  />
                  <UI.Input
                    labelValue="Last Name"
                    id="Last Name"
                    {...formik.getFieldProps("lastname")}
                    errorMessage={formik.touched.lastname && formik.errors.lastname}
                  />
                  <div>
                    <UI.Label htmlFor="Role" className="text-xs">
                      Role
                    </UI.Label>
                    <UI.Select value={formik.values.role} onValueChange={(value) => formik.setFieldValue("role", value)}>
                      <UI.SelectTrigger id="Role" className="w-full mt-1">
                        <UI.SelectValue placeholder="Select a role" />
                      </UI.SelectTrigger>
                      <UI.SelectContent>
                        {CREATABLE_ROLES.map((role) => (
                          <UI.SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </UI.SelectItem>
                        ))}
                        {STAFF_ROLES.map((role) => (
                          <UI.SelectItem key={role} value={role} disabled>
                            {role} (not creatable via API yet)
                          </UI.SelectItem>
                        ))}
                      </UI.SelectContent>
                    </UI.Select>
                    <p className="mt-1.5 text-xs text-primary-gray font-montserrat">
                      The core API only allows creating User, Platform Rider and Developer accounts. Staff roles must be
                      assigned directly on the backend for now.
                    </p>
                  </div>
                  <div>
                    <UI.Label htmlFor="Country" className="text-xs">
                      Country
                    </UI.Label>
                    <UI.Select
                      value={formik.values.countryCode}
                      onValueChange={(value) => formik.setFieldValue("countryCode", value)}
                    >
                      <UI.SelectTrigger id="Country" className="w-full mt-1">
                        <UI.SelectValue placeholder="Select a country" />
                      </UI.SelectTrigger>
                      <UI.SelectContent>
                        {(countries?.results ?? []).map((country) => (
                          <UI.SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </UI.SelectItem>
                        ))}
                      </UI.SelectContent>
                    </UI.Select>
                  </div>
                  <UI.Input
                    labelValue="Email"
                    type="email"
                    id="Email"
                    {...formik.getFieldProps("email")}
                    errorMessage={formik.touched.email && formik.errors.email}
                  />
                  <UI.Input
                    labelValue="Phone"
                    id="Phone"
                    type="tel"
                    placeholder="2348123456789"
                    {...formik.getFieldProps("phone")}
                    errorMessage={formik.touched.phone && formik.errors.phone}
                  />
                  <UI.Input
                    labelValue="Password"
                    id="Password"
                    type="password"
                    {...formik.getFieldProps("password")}
                    errorMessage={formik.touched.password && formik.errors.password}
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 w-full">
              <Permissions />
            </div>
          </div>
          <UI.PrimaryButton className="mt-5" type="submit" isLoading={createUserMn.isPending} disabled={!formik.isValid}>
            Add
          </UI.PrimaryButton>
        </form>
      </section>
    </div>
  );
};
export default AddTeamMemberPage;
