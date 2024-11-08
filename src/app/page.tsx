"use client";

import { UI } from "@/components/common";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen grid place-items-center ">
      <div>
        <h1 className="font-semibold">Welcome to Our Website</h1>
        <p>Explore our features and services.</p>
        <Link href="/dashboard">Go to Dashboard</Link>
      </div>
    </div>
  );
}
