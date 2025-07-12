import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth-server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authData = await getCurrentUser();
    if (!authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isActive, title, description, tags, expiresAt } = body;
    const { id } = await params;

    const existingUrl = await prisma.url.findFirst({
      where: {
        id,
        userId: authData.user.id,
      },
    });

    if (!existingUrl) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    const updatedUrl = await prisma.url.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags }),
        ...(expiresAt !== undefined && {
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        }),
      },
    });

    return NextResponse.json(updatedUrl);
  } catch (error) {
    console.error("Error updating URL:", error);
    return NextResponse.json(
      { error: "Failed to update URL" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authData = await getCurrentUser();
    if (!authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingUrl = await prisma.url.findFirst({
      where: {
        id,
        userId: authData.user.id,
      },
    });

    if (!existingUrl) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    await prisma.url.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting URL:", error);
    return NextResponse.json(
      { error: "Failed to delete URL" },
      { status: 500 },
    );
  }
}
