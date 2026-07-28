import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth/session";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/server/storage/storage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { application: true },
  });

  if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = document.application.userId === session.userId;
  const isAdmin = session.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const buffer = await storage.read(document.filePath);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `inline; filename="${document.originalFileName}"`,
    },
  });
}
