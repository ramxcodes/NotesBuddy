import BlockedSignOutButton from "@/components/blocked/BlockedSignOutButton";
import { APP_CONFIG } from "@/utils/config";

import { checkUserBlockedStatus, getSession } from "@/lib/db/user";
import { redirect } from "next/navigation";

export default async function BlockedPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  const isBlocked = await checkUserBlockedStatus(session.user.id);
  if (!isBlocked) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 p-8 dark:bg-zinc-900">
      <div className="max-w-md rounded-md border-4 border-black bg-white p-8 text-center shadow-[8px_8px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[8px_8px_0px_0px_#757373]">
        <h1 className="mb-6 text-4xl font-black text-red-500 dark:text-red-400">
          Account Blocked
        </h1>
        <p className="mb-6 text-lg font-bold text-black dark:text-white">
          Your account has been blocked due to too many active devices. For
          security reasons, we limit accounts to{" "}
          {APP_CONFIG.MAX_DEVICES_PER_USER} active devices.
        </p>
        <p className="mb-8 text-sm font-semibold text-black dark:text-white">
          Please contact support if you believe this is an error or if you need
          to manage your active devices.
        </p>
        <BlockedSignOutButton />
      </div>
    </div>
  );
}
