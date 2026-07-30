"use client";

import { UI } from "@/components/ui";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { duotoneSea as syntaxColor } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQueryModal } from "@/hooks";

interface ICodePreviewModalProps {
  code: string;
  title?: string;
  subTitle?: string;
}

const JsonPreviewModal = ({ code, title, subTitle }: ICodePreviewModalProps) => {
  const [Iscopied, setIsCopied] = useState(false);
  const { isOpen, closeModal } = useQueryModal([{ key: "jsonPreview", value: true }]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div>
      <div
        className={cn(
          "z-[60] w-[42rem] flex flex-col font-montserrat  bg-background border h-[35rem] rounded-2xl fixed left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2",
          isOpen
            ? "opacity-100 transition-all  fade-in-0 visible zoom-in-95"
            : "opacity-0  fade-out-0 invisible zoom-out-95",
        )}
      >
        <header className="px-8 py-5">
          <p className="font-semibold">{title ?? "Log payload"}</p>
          {subTitle ? <p className="font-medium">{subTitle}</p> : null}
        </header>
        <div className="grow overflow-scroll scroll-bar">
          <SyntaxHighlighter language="json" style={syntaxColor} wrapLongLines>
            {code}
          </SyntaxHighlighter>
        </div>
        <div className="px-8 py-5 flex items-center justify-end">
          <div className="flex items-center gap-x-3">
            <button
              onClick={closeModal}
              className="text-xs font-bold bg-[#F3F3F3] py-2 px-5 h-10 rounded text-[#1E1F1F]"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="text-xs font-bold flex items-center text-white gap-x-1.5 py-2 px-3 h-10 rounded bg-[#2282C8]"
            >
              {Iscopied ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid place-items-center">
                  <Check size={20} />
                </motion.span>
              ) : (
                <Copy size={20} />
              )}
              Copy to clipboard
            </button>
          </div>
        </div>
      </div>
      <UI.Overlay open={isOpen} openChange={closeModal} />
    </div>
  );
};
export default JsonPreviewModal;
