import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/db/user";
import { removeUserDevice } from "@/dal/user/device/query";

export async function POST(request: NextRequest) {
  try {
    // Get current user ID
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId || typeof deviceId !== "string") {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 },
      );
    }

    // Remove the device
    const result = await removeUserDevice(userId, deviceId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Return success response
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
