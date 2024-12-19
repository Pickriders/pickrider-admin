"use client";

import { UI } from "@/components/ui";
import { Account } from "./Account";
import React from "react";

export const WithdrawAccounts = () => {
  const [selectedBankAccount, setSelectedBankAccount] =
    React.useState<number>(0);

  return (
    <div>
      <UI.PrimaryHeading text="Withdraw" />
      <div className="mt-8">
        <UI.Label
          htmlFor="Amount"
          className="text-xs flex justify-between mb-2"
        >
          Amount
          <span className="text-xs text-primary-gray font-montserrat">
            Current balance:{" "}
            <span className="text-[#1E1F1F] dark:text-white">$500,000</span>
          </span>
        </UI.Label>
        <UI.Input
          id="Amount"
          rightIcon={<UI.Button variant={"ghost"}>Max</UI.Button>}
        />
      </div>
      <div className="mt-8">
        <UI.Label className="text-xs">Select Account</UI.Label>

        <div className="mt-3 space-y-3">
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <Account
                key={i}
                handleSelect={() => setSelectedBankAccount(i)}
                checked={selectedBankAccount === i ? true : false}
              />
            ))}
        </div>
      </div>
    </div>
  );
};
