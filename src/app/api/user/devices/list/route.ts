import { NextRequest, NextResponse } from "next/server";
import {
  getAllUserDevicesWithDetails,
  canUserRemoveDevice,
  getTimeUntilNextRemoval,
} from "@/dal/user/device/query";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Get user devices
    const devices = await getAllUserDevicesWithDetails(userId, false);

    // Check if user can remove a device
    const canRemove = await canUserRemoveDevice(userId);

    // Get time until next removal if blocked
    const timeUntilNext = canRemove
      ? null
      : await getTimeUntilNextRemoval(userId);

    return NextResponse.json({
      devices,
      canRemove,
      timeUntilNext,
    });
  } catch (error) {
    console.error("Error in device list API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
