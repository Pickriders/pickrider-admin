"use client";

import { useSuspendVehicleMn } from "@/api";
import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";
import { useState } from "react";

const REASONS = [
  {
    label: "Vehicle registration expired.",
    value: "Vehicle registration expired.",
  },
  {
    label: "Vehicle no longer in use.",
    value: "Vehicle no longer in use.",
  },
  {
    label: "Vehicle details update required.",
    value: "Vehicle details update required.",
  },
];

type SuspendVerificationModalProps = {
  vehicleId: string;
  userId: string;
};

export const SuspendVerificationModal = ({ userId, vehicleId }: SuspendVerificationModalProps) => {
  const { closeModal, isOpen } = useQueryModal([{ key: "suspend-vehicle", value: true }]);
  const { mutate, isPending } = useSuspendVehicleMn(vehicleId, userId);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [text, setText] = useState("");

  const isDisabled = !selectedReason && text.trim() === "";

  const handleSuspend = () => {
    if (!selectedReason) return;
    mutate(
      { reason: selectedReason },
      {
        onSuccess: () => {
          closeModal();
          setSelectedReason(null);
          setText("");
        },
      },
    );
  };

  return (
    <UI.AlertDialog open={isOpen}>
      <div onSubmit={handleSuspend}>
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
          </ul>

          {/* <UI.TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-40"
            placeholder="Specify..."
          /> */}
          <div className="mt-4 space-y-3">
            <UI.PrimaryButton
              isLoading={isPending}
              loadingText="Suspending..."
              disabled={isDisabled || isPending}
              onClick={handleSuspend}
            >
              Suspend
            </UI.PrimaryButton>
            <UI.PrimaryButton onClick={closeModal} type="button" variant="outline">
              Cancel
            </UI.PrimaryButton>
          </div>
        </UI.AlertDialogContent>
      </div>
    </UI.AlertDialog>
  );
};
