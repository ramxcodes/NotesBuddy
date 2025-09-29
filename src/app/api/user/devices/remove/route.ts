import { NextRequest, NextResponse } from "next/server";
import { getUserId, checkUserBlockedStatus } from "@/lib/db/user";
import { removeUserDevice } from "@/dal/user/device/query";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, userId: bodyUserId } = body as {
      deviceId?: string;
      userId?: string;
    };

    if (!deviceId || typeof deviceId !== "string") {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 },
      );
    }

    let actingUserId = await getUserId();

    if (!actingUserId) {
      if (bodyUserId && typeof bodyUserId === "string") {
        const isBlocked = await checkUserBlockedStatus(bodyUserId);
        if (isBlocked) {
          actingUserId = bodyUserId;
        }
      }
    }

    if (!actingUserId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    const result = await removeUserDevice(actingUserId, deviceId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Device removed successfully",
      remainingDevices: result.remainingDevices,
    });
  } catch (error) {
    console.error("Error in device removal API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
