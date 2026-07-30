"use client";

import { UI } from "@/components/ui";
import React from "react";
import { useGetPlatformWalletQuery } from "@/api/queries";
import { PlatformBalance } from "../../PlatformBalance";
import { motion } from "framer-motion";
import { BankPic, Checked } from "./Svg";

export const WithdrawAccounts = () => {
  const { data: platformWallet } = useGetPlatformWalletQuery();
  const settlement = platformWallet?.settlement;

  return (
    <div>
      <UI.PrimaryHeading text="Withdraw" />
      <div className="mt-8">
        <UI.Label htmlFor="Amount" className="text-xs flex justify-between mb-2">
          Amount
          <span className="text-xs text-primary-gray font-montserrat">
            Current balance: <PlatformBalance />
          </span>
        </UI.Label>
        <UI.Input id="Amount" rightIcon={<UI.Button variant={"ghost"}>Max</UI.Button>} />
      </div>
      <div className="mt-8">
        <UI.Label className="text-xs">Settlement Account</UI.Label>

        <div className="mt-3 space-y-3">
          {settlement?.accountNumber ? (
            <div className="h-[4.35rem] bg-accent/50 w-full py-1 px-7 flex items-center gap-x-16 rounded-lg border">
              <div className="flex items-center gap-x-8">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <Checked />
                </motion.div>
                <div>
                  <p className="text-primary-gray font-montserrat">Account Number</p>
                  <span className="text-primary-purple font-clash-display">{settlement.accountNumber}</span>
                </div>
              </div>
              <div>
                <p className="text-primary-gray font-montserrat">Account Name</p>
                <span className="text-primary-purple font-clash-display">{settlement.accountName ?? "—"}</span>
              </div>
              <div className="ms-auto flex items-center gap-x-4">
                <div className="size-[1.5rem]">
                  <BankPic />
                </div>
                <span className="text-primary-gray font-montserrat text-sm">{settlement.bankName ?? ""}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-primary-gray font-montserrat">
              No settlement account is linked to the platform wallet yet.
            </p>
          )}
        </div>
      </div>
      <p className="mt-5 text-xs text-primary-gray font-montserrat">
        Withdrawals are not available yet — the core API has no platform-withdrawal endpoint. This screen will go live
        once the backend ships one.
      </p>
      <UI.PrimaryButton className="mt-5" disabled>
        Withdraw
      </UI.PrimaryButton>
    </div>
  );
};
