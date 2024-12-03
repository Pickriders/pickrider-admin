"use client";

import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";

export const RejectModal = () => {
  const { closeModal, isOpen } = useQueryModal([
    { key: "reject-business", value: true },
  ]);

  return (
    <UI.AlertDialog open={isOpen}>
      <form action="">
        <UI.AlertDialogContent className="max-w-[40rem]">
          <UI.AlertDialogHeader>
            <UI.AlertDialogTitle className="text-primary-gray font-clash-display">
              Reason
            </UI.AlertDialogTitle>
          </UI.AlertDialogHeader>

          <ul className="space-y-4">
            <li className="flex items-center gap-x-3">
              <UI.Checkbox id="License not valid" />
              <label
                className="text-sm font-semibold text-primary-gray"
                htmlFor="License not valid"
              >
                License not valid
              </label>
            </li>
            <li className="flex items-center gap-x-3">
              <UI.Checkbox id="License mismatch" />
              <label
                className="text-sm font-semibold text-primary-gray"
                htmlFor="License mismatch"
              >
                {" "}
                License mismatch
              </label>
            </li>
            <li className="flex items-center gap-x-3">
              <UI.Checkbox id="license number" />
              <label
                className="text-sm font-semibold text-primary-gray"
                htmlFor="license number"
              >
                Unable to verify license number
              </label>
            </li>
            <li className="flex items-center gap-x-3">
              <UI.Checkbox id="Other" />
              <label
                className="text-sm font-semibold text-primary-gray"
                htmlFor="Other"
              >
                Other
              </label>
            </li>
          </ul>

          <UI.TextArea className="h-40" placeholder="Specify..." />
          <div className="mt-4 space-y-3">
            <UI.PrimaryButton disabled>Reject</UI.PrimaryButton>
            <UI.PrimaryButton
              onClick={closeModal}
              type="button"
              variant="outline"
            >
              Cancel
            </UI.PrimaryButton>
          </div>
        </UI.AlertDialogContent>
      </form>
    </UI.AlertDialog>
  );
};
