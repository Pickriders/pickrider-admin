"use client";

import { UI } from "@/components/ui";
// import { TextArea } from "../../TextArea";
// import { InputText } from "../../InputText";
import React from "react";
import { SVG } from "@/components/svg";
import { TextInputWithCounter } from "@/components/ui/InputTextCounter";
import { TextAreaWithCounter } from "@/components/ui/TextAreaWithCounter";

export const MessageForm = () => {
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");

  return (
    <form className="mt-10  space-y-8">
      <TextInputWithCounter setValue={setTitle} value={title} />
      <TextAreaWithCounter setValue={setMessage} value={message} />

      <div className="flex flex-col gap-y-3">
        <UI.PrimaryButton>Send</UI.PrimaryButton>
        <UI.PrimaryButton type="button" variant={"outline"}>
          Cancel
        </UI.PrimaryButton>
      </div>
    </form>
  );
};
