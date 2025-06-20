import type { Metadata } from "next";
import "./globals.css";
import "easymde/dist/easymde.min.css";
import Umami from "@/components/auth/umami";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NavBar from "@/components/core/navbar";

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
        <ThemeProvider defaultTheme="light" storageKey="notes-buddy-theme">
          <NavBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
