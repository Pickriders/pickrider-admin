"use client";

import React from "react";
import { useRejectVehicleMn } from "@/api";
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
];

interface RejectVerificationModalProps {
  vehicleId: string;
  userId: string;
}

export const RejectVerificationModal: React.FC<RejectVerificationModalProps> = ({ vehicleId, userId }) => {
  const { closeModal, isOpen } = useQueryModal([{ key: "reject-verification", value: true }]);
  const rejectVehicleMn = useRejectVehicleMn(vehicleId, userId);

  const [selectedReason, setSelectedReason] = React.useState<string | null>(null);
  const [text, setText] = React.useState("");
  const [otherReason, setOtherReason] = React.useState(false);

  const handleReject = () => {
    if (!selectedReason && !text) return;

    const rejectReason = selectedReason && text ? `${selectedReason} - ${text}` : selectedReason || text;

    rejectVehicleMn.mutate(
      { reason: rejectReason },
      {
        onSuccess: () => {
          handleCloseModal();
        },
      },
    );
  };

  const handleCloseModal = () => {
    closeModal();
    setSelectedReason(null);
    setText("");
    setOtherReason(false);
  };

  return (
    <UI.AlertDialog open={isOpen}>
      <form action="">
        <UI.AlertDialogContent className="max-w-[40rem]">
          <UI.AlertDialogHeader>
            <UI.AlertDialogTitle className="text-primary-gray font-clash-display">Reason</UI.AlertDialogTitle>
          </UI.AlertDialogHeader>

          <ul className="space-y-4">
            <UI.RadioGroup name="suspendReason" onValueChange={setSelectedReason}>
              {REASONS.map((reason, i) => (
                <li key={i} className="flex items-center gap-x-3">
                  <UI.RadioGroupItem checked={selectedReason === reason.value} value={reason.value} id={reason.value} />
                  <label className="text-sm font-semibold text-primary-gray" htmlFor={reason.value}>
                    {reason.label}
                  </label>
                </li>
              ))}
            </UI.RadioGroup>

            <li className="flex items-center gap-x-3">
              <UI.Checkbox
                id={"other"}
                checked={otherReason}
                onCheckedChange={(checked) => setOtherReason(checked as boolean)}
              />
              <label className="text-sm font-semibold text-primary-gray" htmlFor={"other"}>
                Other
              </label>
            </li>
          </ul>

          {otherReason && (
            <UI.TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-40"
              placeholder="Specify..."
            />
          )}
          <div className="mt-4 space-y-3">
            <UI.PrimaryButton
              disabled={!selectedReason && !text}
              onClick={handleReject}
              isLoading={rejectVehicleMn.isPending}
              loadingText="Rejecting..."
            >
              Reject
            </UI.PrimaryButton>
            <UI.PrimaryButton onClick={closeModal} type="button" variant="outline">
              Cancel
            </UI.PrimaryButton>
          </div>
        </UI.AlertDialogContent>
      </form>
    </UI.AlertDialog>
  );
};
