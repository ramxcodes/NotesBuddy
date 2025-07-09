"use client";

import { IconContextProvider } from "./IconContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <IconContextProvider>{children}</IconContextProvider>;
}
