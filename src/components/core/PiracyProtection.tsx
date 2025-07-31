"use client";

import { useEffect, useState } from "react";
import DisableDevtool from "disable-devtool";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PiracyProtectionProps {
  isPremium?: boolean;
}

export default function PiracyProtection({ isPremium }: PiracyProtectionProps) {
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);

  useEffect(() => {
    DisableDevtool({
      disableMenu: true,
      disableCopy: true,
      disableCut: true,
      disablePaste: true,
      disableSelect: true,
      url: "/anti-piracy",
    });

    // Additional custom protections
    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      // Disable F12 (Developer Tools)
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+S (Save)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+P (Print)
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+A (Select All)
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+F (Find)
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+H (History)
      if (e.ctrlKey && e.key === "h") {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+K (Console in Firefox)
      if (e.ctrlKey && e.shiftKey && e.key === "K") {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+M (Device Toolbar)
      if (e.ctrlKey && e.shiftKey && e.key === "M") {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+P (Command Menu)
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        return false;
      }

      // Disable Alt+F4 (Close Window)
      if (e.altKey && e.key === "F4") {
        e.preventDefault();
        return false;
      }

      // Disable Escape key
      if (e.key === "Escape") {
        e.preventDefault();
        return false;
      }
    };

    // Disable mouse events
    const disableMouseEvents = (e: MouseEvent) => {
      // Disable middle click
      if (e.button === 1) {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag and drop
    const disableDragDrop = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable wheel events
    const disableWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        return false;
      }
    };

    // Disable printing
    const disablePrint = () => {
      window.print = () => {};
    };

    // Disable text selection with CSS
    const disableTextSelection = () => {
      const style = document.createElement("style");
      style.textContent = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        input, textarea {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
      `;
      document.head.appendChild(style);
    };

    // Apply all protections
    document.addEventListener("keydown", disableKeyboardShortcuts);
    document.addEventListener("mousedown", disableMouseEvents);
    document.addEventListener("dragstart", disableDragDrop);
    document.addEventListener("drop", disableDragDrop);
    document.addEventListener("wheel", disableWheel, { passive: false });

    disablePrint();
    disableTextSelection();

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", disableKeyboardShortcuts);
      document.removeEventListener("mousedown", disableMouseEvents);
      document.removeEventListener("dragstart", disableDragDrop);
      document.removeEventListener("drop", disableDragDrop);
      document.removeEventListener("wheel", disableWheel);
    };
  }, []);

  // Premium content protection
  useEffect(() => {
    if (!isPremium) return;

    // Show the premium dialog
    setShowPremiumDialog(true);
  }, [isPremium]);

  const handleProceedToPremium = async () => {
    setShowPremiumDialog(false);

    // Show toast for premium content access
    toast("🔒 Entering safe mode for premium content...", {
      duration: 3000,
    });

    // Enter fullscreen mode
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // Show alternative toast if fullscreen fails
        toast(
          "Premium content is protected. Some browser restrictions may apply.",
          {
            duration: 3000,
          },
        );
      }
    };

    // Handle fullscreen exit attempts
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // User tried to exit fullscreen, redirect to previous page or home
        const previousUrl = document.referrer || "/";
        toast("Exiting premium content due to fullscreen exit", {
          duration: 2000,
        });
        setTimeout(() => {
          window.location.href = previousUrl;
        }, 1000);
      }
    };

    // Handle escape key and other exit attempts
    const handleEscapeAttempt = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "F11") {
        e.preventDefault();
        e.stopPropagation();

        // Redirect instead of allowing exit
        const previousUrl = document.referrer || "/";
        toast("Exiting premium content...", { duration: 2000 });
        setTimeout(() => {
          window.location.href = previousUrl;
        }, 1000);
      }
    };

    // Handle browser back/forward navigation
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();

      // Prevent navigation and redirect
      const previousUrl = document.referrer || "/";
      window.location.href = previousUrl;
    };

    // Apply premium protections with a slight delay
    setTimeout(() => {
      enterFullscreen();
    }, 1000);

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleEscapeAttempt, {
      capture: true,
    });
    window.addEventListener("popstate", handlePopState);

    // Add additional protection for context menu on premium content
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast("Right-click is disabled on premium content", { duration: 2000 });
    };

    document.addEventListener("contextmenu", handleContextMenu);
  };

  return (
    <>
      <AlertDialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <AlertDialogContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-excon text-2xl font-black text-black dark:text-white">
              Premium Content Access
            </AlertDialogTitle>
            <AlertDialogDescription className="font-satoshi text-base font-bold text-black dark:text-white">
              You are accessing premium content. <br /> This content is
              protected and will be displayed in fullscreen mode for security
              purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleProceedToPremium}
              className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:text-white hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
            >
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
