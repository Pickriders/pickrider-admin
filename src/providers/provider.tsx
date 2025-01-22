"use client";

import { queryClient } from "@/services";
import { QueryClientProvider } from "@tanstack/react-query";

const provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default provider;
