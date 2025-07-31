import { LockIcon } from "@/components/icons/LockIcon";
import {Link} from "next-view-transitions";

export default function AntiPiracyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="rounded-md border-2 border-black p-8 shadow-[8px_8px_0px_0px_#000] dark:border-white/20 dark:shadow-[8px_8px_0px_0px_#757373]">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <LockIcon className="mx-auto mb-4 h-16 w-16" />  
            <h1 className="font-excon mb-4 text-4xl font-black text-black dark:text-white">
              PIRACY DETECTED
            </h1>
            <p className="font-satoshi text-lg font-bold text-black dark:text-white">
              Unauthorized access attempt blocked
            </p>
          </div>

          {/* Content Section */}
          <div className="mb-8 space-y-6">
            <div className="rounded-md border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
              <h2 className="font-excon mb-3 text-2xl font-black text-black dark:text-white">
                What happened?
              </h2>
              <p className="font-satoshi font-bold text-black dark:text-white">
                Our system detected unauthorized access attempts to protected
                content. This could include opening developer tools, attempting
                to copy content, or other piracy-related activities.
              </p>
            </div>

          
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="font-excon inline-flex items-center justify-center rounded-md border-2 border-black px-6 py-3 text-lg font-black shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[6px_6px_0px_0px_#757373]"
            >
              Go Home
            </Link>
            <Link
              href="/premium"
              className="font-excon inline-flex items-center justify-center rounded-md border-2 border-black px-6 py-3 text-lg font-black shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] dark:border-white/20 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[6px_6px_0px_0px_#757373]"
            >
              View Pricing
            </Link>
          </div>

          {/* Footer Warning */}
          <div className="mt-8 rounded-md border-2 border-black p-4 dark:border-white/20">
            <p className="font-satoshi text-center text-sm font-bold text-black dark:text-white">
              Continued piracy attempts may result in Account blocking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
