"use client";

import { UI } from "@/components/common";
import { StatsCard } from "./dashboard/StatsCard";
import { SVG } from "@/components/svg";
import { ItemProps } from "@/components/common/Select/Select.type";

const mode: ItemProps[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function Home() {
  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        height: "100vh",
        maxWidth: 1000,
        margin: "0 auto",
        padding: "1rem",
      }}
    ></main>
  );
}
