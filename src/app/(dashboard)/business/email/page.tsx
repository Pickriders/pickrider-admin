"use client";

import { UI } from "@/components/ui";
import { NotificationUnsupportedNote } from "@/components/NotificationUnsupportedNote";
import { SelectedTags } from "@/components/SelectedTags";
import { FormMessage } from "@/components/FormMessage";
import React from "react";

const EmailPage = () => {
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [attachment, setAttachment] = React.useState<File | undefined>(
    undefined
  );

  return (
    <div>
      <UI.BreadCrumbNav
        pageLinks={[{ href: "/business", label: "Business" }]}
        rootPageLink="/business"
        currentPage="Email"
      />

      <section className="bg-background mt-10 px-7 py-6 rounded-lg">
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
