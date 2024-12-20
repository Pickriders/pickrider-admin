import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { StatsContainer } from "./StatsContainer";
import { HistoryTable } from "./HistoryTable";
import Link from "next/link";

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
        <StatsContainer />

        <div className="mt-8">
          <UI.SectionHeader text="Transaction history" />
        </div>
        <HistoryTable data={Array(3).fill(0)} />
      </section>
    </div>
  );
};

export default FinancesPage;
