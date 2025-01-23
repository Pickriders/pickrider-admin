"use client";

import Image from "next/image";
import { LoginForm } from "./LoginForm";
import { SVG } from "@/components/svg";
import { HeadLogo } from "./HeadLogo";

export default function Home() {
  return (
    <div className="h-screen p-5 overflow-y-hidden flex  items-center">
      <div className="rounded-2xl bg-[#F3F3F3] dark:bg-[#1e1f1f] lg:block hidden   w-[33rem] h-full pt-8 px-5">
        <div className="grid place-items-center">
          <SVG.PickridersLogo />
        </div>

        <div className="relative h-full grid place-items-center">
          <div className="opacity-5 ">
            <HeadLogo />
          </div>
          <div className="absolute z-20 w-[45rem] left-[4.5rem]">
            <Image
              alt="login pic"
              src={"/login-pic.svg"}
              width={4000}
              height={1000}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[35rem] z-40 w-full mx-auto ">
        <LoginForm />
      </div>
    </div>
  );
}
