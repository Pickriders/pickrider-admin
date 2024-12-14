"use client";

import { UI } from "@/components/ui";

import React from "react";
import { TextInputWithCounter } from "@/components/ui/InputTextCounter";
import { TextAreaWithCounter } from "@/components/ui/TextAreaWithCounter";
import { SVG } from "@/components/svg";

export const MessageForm = () => {
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");

  return (
    <form className="mt-10  space-y-10">
      <TextInputWithCounter setValue={setTitle} value={title} />
      <TextAreaWithCounter setValue={setMessage} value={message} />
      <label
        htmlFor="attachment"
        className="w-full gap-x-2 cursor-pointer border-[1.5px] text-muted-foreground px-2 text-sm flex justify-center items-center font-montserrat font-semibold py-2.5 rounded-[4px] bg-muted dark:bg-transparent border-[#C7CBE0] dark:border-neutral-800 hover:bg-gray-200 dark:hover:bg-transparent"
      >
        <SVG.LinkIcon />
        Add Attachment
        <input type="file" id="attachment" className="hidden" />
      </label>
      <div className="flex flex-col gap-y-3">
        <UI.PrimaryButton>Send</UI.PrimaryButton>
        <UI.PrimaryButton type="button" variant={"outline"}>
          Cancel
        </UI.PrimaryButton>
      </div>
    </form>
  );
};
