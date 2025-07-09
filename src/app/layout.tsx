import type { Metadata } from "next";
import "./globals.css";
import Umami from "@/components/auth/Umami";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NavBar from "@/components/core/Navbar";
import { AutoDeviceFingerprint } from "@/components/auth/AutoDeviceFingerprint";

export const metadata: Metadata = {
  title: "Notes Buddy",
  description: "Notes Buddy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {process.env.NEXT_PUBLIC_ENABLE_UMAMI === "true" && <Umami />}
      <body>
        <AutoDeviceFingerprint />
        <ThemeProvider defaultTheme="light" storageKey="notes-buddy-theme">
          <NavBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
