import type { Metadata } from "next";
import "./globals.css";
import Umami from "@/components/auth/Umami";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NavBar from "@/components/core/Navbar";
import { AutoDeviceFingerprint } from "@/components/auth/AutoDeviceFingerprint";
import { ViewTransitions } from "next-view-transitions";
import Footer from "@/components/core/Footer";
import { Poppins, Lexend, Montserrat, Roboto, Inter } from "next/font/google";

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lexend",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inter",
  display: "swap",
});

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
    <ViewTransitions>
      <html lang="en">
        {process.env.NEXT_PUBLIC_ENABLE_UMAMI === "true" && <Umami />}
        <body
          className={`${poppins.variable} ${lexend.variable} ${montserrat.variable} ${roboto.variable} ${inter.variable}`}
        >
          <AutoDeviceFingerprint />
          <ThemeProvider defaultTheme="light" storageKey="notes-buddy-theme">
            <NavBar />
            {children}
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
