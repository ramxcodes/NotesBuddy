import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Access Your Study Dashboard",
  description:
    "Sign in to your Notes Buddy account to access personalized study notes, AI-powered learning tools, and track your academic progress.",
  robots: {
    index: false,
    follow: true,
    nocache: true,
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
