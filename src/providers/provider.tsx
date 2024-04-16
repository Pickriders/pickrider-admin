"use client";

import { queryClient } from "@/lib/react-query-client";
import { QueryClientProvider } from "react-query";

const provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default provider;
