import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const TypeOverview = () => {
  return (
    <div>
      <h2 className="text-primary-gray font-semibold font-clash-display">
        Type Overview
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-[#F3F3F3] dark:bg-[#1e1f1f]  px-7 py-3 rounded-lg">
          <h2 className="text-primary-gray text-sm font-montserrat font-semibold">
            Total Orders
          </h2>
          <div className="flex items-center gap-x-4 mt-3">
            <TypeOrderIcon />
            <span className="font-clash-display font-semibold text-2xl ">
              60
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <SVG.ChartIcon className="fill-[#32BA7C]" />
            <span className="text-[#32BA7C] font-semibold font-montserrat text-xs">
              + 5.06%
            </span>
          </div>
        </div>
        <div className="bg-[#F3F3F3] dark:bg-[#1e1f1f]  px-7 py-3 rounded-lg">
          <h2 className="text-primary-gray text-sm font-montserrat font-semibold">
            Single Order
          </h2>
          <div className="flex items-center gap-x-4 mt-3">
            <SingleOrderIcon />
            <span className="font-clash-display font-semibold text-2xl ">
              60
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <SVG.ChartIcon className="fill-[#32BA7C]" />
            <span className="text-[#32BA7C] font-semibold font-montserrat text-xs">
              + 5.06%
            </span>
          </div>
        </div>
        <div className="bg-[#F3F3F3] dark:bg-[#1e1f1f]  px-7 py-3 rounded-lg">
          <h2 className="text-primary-gray text-sm font-montserrat font-semibold">
            Batch Delivery
          </h2>
          <div className="flex items-center gap-x-4 mt-3">
            <BatchIcon />
            <span className="font-clash-display font-semibold text-2xl ">
              20
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <SVG.ChartIcon className="fill-[#FF5244]" />
            <span className="text-[#FF5244] font-semibold font-montserrat text-xs">
              - 5.06%
            </span>
          </div>
        </div>
        <div className="bg-[#F3F3F3] dark:bg-[#1e1f1f]  px-7 py-3 rounded-lg">
          <h2 className="text-primary-gray text-sm font-montserrat font-semibold">
            Bulk Pickup
          </h2>
          <div className="flex items-center gap-x-4 mt-3">
            <BulkIcon />
            <span className="font-clash-display font-semibold text-2xl ">
              20
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <SVG.ChartIcon className="fill-[#32BA7C]" />
            <span className="text-[#32BA7C] font-semibold font-montserrat text-xs">
              + 5.06%
            </span>
          </div>
        </div>
      </div>
      <UI.Button variant={"ghost"} className="mt-5" asChild>
        <Link href={""}>
          More details <ChevronRight size={15} />
        </Link>
      </UI.Button>
    </div>
  );
};

const BulkIcon = () => (
  <svg
    width="47"
    height="46"
    viewBox="0 0 47 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="23.8203" cy="23" r="23" fill="#2282C8" />
    <path
      d="M13.8203 24.4286V19H33.8203V24.4286C33.8203 28.4692 33.8203 30.4895 32.5186 31.7447C31.2168 33 29.1217 33 24.9314 33H22.7092C18.5189 33 16.4238 33 15.1221 31.7447C13.8203 30.4895 13.8203 28.4692 13.8203 24.4286Z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.8203 19L14.7819 16.6923C15.5276 14.9026 15.9004 14.0077 16.6562 13.5038C17.412 13 18.3814 13 20.3203 13H27.3203C29.2592 13 30.2286 13 30.9844 13.5038C31.7402 14.0077 32.113 14.9026 32.8588 16.6923L33.8203 19"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M23.8203 19V13"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M21.8203 23H25.8203"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const BatchIcon = () => (
  <svg
    width="47"
    height="46"
    viewBox="0 0 47 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="23.9541" cy="23" r="23" fill="#3FA49F" />
    <path
      d="M13.9541 24.4286V19H33.9541V24.4286C33.9541 28.4692 33.9541 30.4895 32.6524 31.7447C31.3506 33 29.2555 33 25.0652 33H22.843C18.6527 33 16.5576 33 15.2559 31.7447C13.9541 30.4895 13.9541 28.4692 13.9541 24.4286Z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.9541 19L14.9156 16.6923C15.6614 14.9026 16.0342 14.0077 16.79 13.5038C17.5458 13 18.5152 13 20.4541 13H27.4541C29.393 13 30.3624 13 31.1182 13.5038C31.874 14.0077 32.2468 14.9026 32.9926 16.6923L33.9541 19"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M23.9541 19V13"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M21.9541 23H25.9541"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const SingleOrderIcon = () => (
  <svg
    width="47"
    height="46"
    viewBox="0 0 47 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="23.8203" cy="23" r="23" fill="#505582" />
    <path
      d="M13.8203 24.4286V19H33.8203V24.4286C33.8203 28.4692 33.8203 30.4895 32.5186 31.7447C31.2168 33 29.1217 33 24.9314 33H22.7092C18.5189 33 16.4238 33 15.1221 31.7447C13.8203 30.4895 13.8203 28.4692 13.8203 24.4286Z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.8203 19L14.7819 16.6923C15.5276 14.9026 15.9004 14.0077 16.6562 13.5038C17.412 13 18.3814 13 20.3203 13H27.3203C29.2592 13 30.2286 13 30.9844 13.5038C31.7402 14.0077 32.113 14.9026 32.8588 16.6923L33.8203 19"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M23.8203 19V13"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M21.8203 23H25.8203"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const TypeOrderIcon = () => (
  <svg
    width="47"
    height="46"
    viewBox="0 0 47 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="23.9541" cy="23" r="23" fill="#000" />
    <circle cx="23.9541" cy="23" r="23" fill="#000" />
    <path
      d="M13.9541 24.4286V19H33.9541V24.4286C33.9541 28.4692 33.9541 30.4895 32.6524 31.7447C31.3506 33 29.2555 33 25.0652 33H22.843C18.6527 33 16.5576 33 15.2559 31.7447C13.9541 30.4895 13.9541 28.4692 13.9541 24.4286Z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.9541 19L14.9156 16.6923C15.6614 14.9026 16.0342 14.0077 16.79 13.5038C17.5458 13 18.5152 13 20.4541 13H27.4541C29.393 13 30.3624 13 31.1182 13.5038C31.874 14.0077 32.2468 14.9026 32.9926 16.6923L33.9541 19"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M23.9541 19V13"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M21.9541 23H25.9541"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
