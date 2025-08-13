"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "neuro-toast",
          title: "neuro-toast-title",
          description: "neuro-toast-description",
          actionButton: "neuro-toast-action",
          cancelButton: "neuro-toast-cancel",
          closeButton: "neuro-toast-close",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
