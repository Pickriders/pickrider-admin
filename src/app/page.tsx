import { UI } from "@/components/common";
import { StatsCard } from "./dashboard/StatsCard";
import { SVG } from "@/components/svg";
import { ItemsProps } from "@/components/common/Select/Select.type";

const months: ItemsProps[] = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function Home() {
  return (
    <main className="grid max-w-[1000px] p-6 border border-slate-300  place-items-center h-screen mx-auto">
      <UI.Select items={months} placeholder={"Months"} />
      <select name="" id="">
        <option value={9}>9</option>
      </select>
      <UI.Input
        type="text"
        rightIcon={<SVG.MessageIcon />}
        placeholder="Search anything"
      />
      <StatsCard statLabel="Total Income" statValue={3500} />
    </main>
  );
}
