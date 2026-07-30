"use client";

import { UI } from "@/components/ui";
import { NotificationUnsupportedNote } from "@/components/NotificationUnsupportedNote";
import { SelectedTags } from "@/components/SelectedTags";
import React from "react";
import { FormMessage } from "@/components/FormMessage";

const EmailPage = () => {
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [attachment, setAttachment] = React.useState<File | undefined>(
    undefined
  );

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/couriers", label: "Couriers" }]}
        rootPageLink="/couriers"
        currentPage="Email"
      />

      <section className="bg-background mt-14 px-7 py-10 rounded-lg">
        <NotificationUnsupportedNote />
        <h2 className="font-montserrat text-xs font-semibold text-foreground">
          Push Notification
        </h2>
        <div className="mt-9 ">
          <SelectedTags />
        </div>
        <FormMessage
          attachment={true}
          onAttachmentChange={setAttachment}
          message={message}
          onMessageChange={setMessage}
          title={title}
          onTitleChange={setTitle}
        />
      </section>
    </div>
  );
};
export default EmailPage;
