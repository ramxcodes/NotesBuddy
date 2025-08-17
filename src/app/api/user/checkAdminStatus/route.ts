import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/db/user";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    console.log("session data", session);
    if (!session?.user.id) {
      return NextResponse.json(
        { isAdmin: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const getCachedUserRoleHandler = unstable_cache(
      async (userId: string) => {
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
          });
          return user?.role || null;
        } catch {
          return null;
        }
      },
      [`user-role-${session.user.id}`],
      {
        revalidate: 1800,
        tags: [`user-role-${session.user.id}`],
      },
    );

    const userRole = await getCachedUserRoleHandler(session.user.id);
    const isAdmin = userRole === "ADMIN";

    return NextResponse.json({ isAdmin });
  } catch {
    return NextResponse.json(
      { isAdmin: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
