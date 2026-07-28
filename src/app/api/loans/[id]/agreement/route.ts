import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth/session";
import { prisma } from "@/lib/prisma";

function formatRand(value: number) {
  return `R${value.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const loan = await prisma.loan.findUnique({
    where: { id },
    include: { application: { include: { user: { include: { profile: true } } } } },
  });

  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = loan.application.userId === session.userId;
  const isAdmin = session.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = loan.application.user.profile;
  const borrowerName = profile ? `${profile.firstName} ${profile.lastName}` : loan.application.user.email;

  const body = `MERIK LOAN AGREEMENT
=====================

Borrower: ${borrowerName}
Email: ${loan.application.user.email}
Loan ID: ${loan.id}
Date: ${new Date(loan.createdAt).toLocaleDateString("en-ZA")}

LOAN TERMS
----------
Principal Amount: ${formatRand(loan.principal)}
Interest Rate: ${loan.interestRate}%
Service Fee: ${formatRand(loan.serviceFee)}
Total Repayable: ${formatRand(loan.totalRepayable)}
Term: ${loan.termDays} days
Due Date: ${loan.dueDate ? new Date(loan.dueDate).toLocaleDateString("en-ZA") : "TBC"}
Status: ${loan.status}

DECLARATION
-----------
This agreement confirms the terms of a short-term loan issued by MERIK in
accordance with the National Credit Act and MERIK's responsible lending
policy. Final costs shown above were disclosed to the borrower before
acceptance.

This is a system-generated summary for demonstration purposes and does not
constitute a legally binding credit agreement.
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="merik-agreement-${loan.id}.txt"`,
    },
  });
}
