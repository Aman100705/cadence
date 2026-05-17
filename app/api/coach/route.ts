import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { coachGoal } from "@/lib/coach";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, thrustArea, uomType, targetValue } = body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { error: "Provide a draft goal title of at least 3 characters." },
        { status: 400 }
      );
    }

    const coached = await coachGoal({ title, thrustArea, uomType, targetValue });

    await prisma.aiSuggestion.create({
      data: {
        userId: session.user.id,
        originalText: title,
        suggestedText: coached.suggestion,
        smartScore: coached.smartScore,
      },
    });

    return NextResponse.json(coached);
  } catch (err) {
    console.error("[coach] error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI Coach failed" },
      { status: 500 }
    );
  }
}
