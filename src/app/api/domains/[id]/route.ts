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
    const { isDefault } = body;
    const { id } = await params;

    const existingDomain = await prisma.domain.findFirst({
      where: {
        id,
        userId: authData.user.id,
      },
    });

    if (!existingDomain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    if (isDefault) {
      await prisma.domain.updateMany({
        where: {
          userId: authData.user.id,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const updatedDomain = await prisma.domain.update({
      where: { id },
      data: { isDefault },
    });

    return NextResponse.json(updatedDomain);
  } catch (error) {
    console.error("Error updating domain:", error);
    return NextResponse.json(
      { error: "Failed to update domain" },
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

    const existingDomain = await prisma.domain.findFirst({
      where: {
        id,
        userId: authData.user.id,
      },
    });

    if (!existingDomain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    await prisma.domain.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting domain:", error);
    return NextResponse.json(
      { error: "Failed to delete domain" },
      { status: 500 },
    );
  }
}
