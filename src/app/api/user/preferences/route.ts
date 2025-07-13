import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth-server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
  try {
    const authData = await getCurrentUser();
    if (!authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { theme } = body;

    if (!theme || !["light", "dark", "system"].includes(theme)) {
      return NextResponse.json(
        { error: "Invalid theme. Must be 'light', 'dark', or 'system'" },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: authData.user.id,
      },
      data: {
        theme,
      },
      select: {
        id: true,
        theme: true,
      },
    });

    return NextResponse.json({
      success: true,
      theme: updatedUser.theme,
    });
  } catch (error) {
    console.error("Error updating user theme:", error);
    return NextResponse.json(
      { error: "Failed to update theme preference" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const authData = await getCurrentUser();
    if (!authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: authData.user.id,
      },
      select: {
        theme: true,
      },
    });

    return NextResponse.json({
      theme: user?.theme || "system",
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch user preferences" },
      { status: 500 },
    );
  }
}
