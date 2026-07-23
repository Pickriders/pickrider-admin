import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { StatsContainer } from "./StatsContainer";
import { ExternalPayments } from "./ExternalPayments";
import { HistoryTable } from "./HistoryTable";
import Link from "next/link";
import { Suspense } from "react";

const FinancesPage = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <UI.PrimaryHeading text="Finances" />
        <div className="flex items-center gap-x-2">
          <UI.Button className="font-montserrat" asChild>
            <Link href={"/finances/withdraw"}>
              Withdraw
              <SVG.DownLoad />
            </Link>
          </UI.Button>
          <UI.Button className="font-montserrat" asChild>
            <Link href={"/finances/initiate-payout"}>
              Initiate Payout
              <SVG.MoneySend />
            </Link>
          </UI.Button>
        </div>
      </div>
      <section className="mt-[2rem] w-full bg-background p-6 rounded-2xl">
        <Suspense>
          <StatsContainer />
        </Suspense>

        <Suspense>
          <ExternalPayments />
        </Suspense>

        <div className="mt-8">
          <UI.SectionHeader text="Transaction history" />
        </div>
        <Suspense>
          <HistoryTable />
        </Suspense>
      </section>
    </div>
  );
};

export default FinancesPage;
