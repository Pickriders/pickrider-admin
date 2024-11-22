"use client";

import { UI } from "@/components/ui";
import { TextArea } from "../../TextArea";
import { InputText } from "../../InputText";
import React from "react";

export const MessageForm = () => {
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");

  return (
    <form className="mt-10  space-y-10">
      <InputText setValue={setTitle} value={title} />
      <TextArea setValue={setMessage} value={message} />
      <div className="flex flex-col gap-y-3">
        <UI.PrimaryButton>Send</UI.PrimaryButton>
        <UI.PrimaryButton type="button" variant={"outline"}>
          Cancel
        </UI.PrimaryButton>
      </div>
    </form>
  );
};
