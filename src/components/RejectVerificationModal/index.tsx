"use client";

import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";

const REASONS = [
  {
    label: "License not valid",
    value: "License not valid",
  },
  {
    label: "License mismatch",
    value: "License mismatch",
  },
  {
    label: "Unable to verify license number",
    value: "Unable to verify license number",
  },
  {
    label: "Other",
    value: "Other",
  },
];

export const RejectVerificationModal = () => {
  const { closeModal, isOpen } = useQueryModal([
    { key: "reject-verification", value: true },
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
            {REASONS.map((reason, i) => (
              <li key={i} className="flex items-center gap-x-3">
                <UI.Checkbox id={reason.value} />
                <label
                  className="text-sm font-semibold text-primary-gray"
                  htmlFor={reason.value}
                >
                  {reason.label}
                </label>
              </li>
            ))}
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
