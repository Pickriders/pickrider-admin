"use client";

import * as React from "react";
import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";
import { useUpdateDriversLicenseMn } from "@/api";
import { toast } from "sonner";

const REASONS = [
  "License not valid",
  "License mismatch",
  "Unable to verify license number",
  "Document unclear / unreadable",
  "Other",
];

/**
 * Reject a verification. When `userId` is passed (courier licence flow) it
 * persists a DISAPPROVE via the drivers-license update endpoint with the
 * selected reason(s). Without a userId (e.g. business KYC) it stays inert.
 */
export const RejectVerificationModal = ({ userId }: { userId?: string }) => {
  const { closeModal, isOpen } = useQueryModal([{ key: "reject-verification", value: true }]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [note, setNote] = React.useState("");

  const rejectMn = useUpdateDriversLicenseMn(userId ?? "", {
    onSuccess: () => {
      toast.success("Licence rejected");
      setSelected([]);
      setNote("");
      closeModal();
    },
  });

  const toggle = (reason: string) =>
    setSelected((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]));

  const comment = [...selected.filter((r) => r !== "Other"), note.trim()].filter(Boolean).join("; ");
  const canSubmit = !!userId && comment.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    rejectMn.mutate({ status: "DISAPPROVE", comment });
  };

  return (
    <UI.AlertDialog open={isOpen}>
      <UI.AlertDialogContent className="w-[92vw] max-w-[34rem]">
        <UI.AlertDialogHeader>
          <UI.AlertDialogTitle className="font-clash-display">Reject licence</UI.AlertDialogTitle>
        </UI.AlertDialogHeader>

        <ul className="space-y-3">
          {REASONS.map((reason) => (
            <li key={reason} className="flex items-center gap-x-3">
              <UI.Checkbox id={reason} checked={selected.includes(reason)} onCheckedChange={() => toggle(reason)} />
              <label className="text-sm font-semibold text-foreground" htmlFor={reason}>
                {reason}
              </label>
            </li>
          ))}
        </ul>

        <UI.TextArea
          className="mt-2 h-32"
          placeholder="Add a note (shown to the courier)..."
          value={note}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
        />

        <div className="mt-4 flex items-center gap-3">
          <UI.PrimaryButton
            variant="destructive"
            onClick={submit}
            isLoading={rejectMn.isPending}
            loadingText="Rejecting..."
            disabled={!canSubmit}
          >
            Reject licence
          </UI.PrimaryButton>
          <UI.PrimaryButton onClick={closeModal} type="button" variant="outline">
            Cancel
          </UI.PrimaryButton>
        </div>
      </UI.AlertDialogContent>
    </UI.AlertDialog>
  );
};
