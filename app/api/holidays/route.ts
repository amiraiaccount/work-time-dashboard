import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Holiday from "@/models/Holiday";

export async function GET() {
  try {
    await connectDB();
    const list = await Holiday.find().sort({ shamsiDate: 1 }).lean();
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { shamsiDate, title, type = "personal" } = body;

    if (!shamsiDate || !title) {
      return NextResponse.json(
        { error: "shamsiDate and title required" },
        { status: 400 }
      );
    }

    const doc = await Holiday.findOneAndUpdate(
      { shamsiDate },
      { shamsiDate, title, type },
      { upsert: true, new: true }
    );

    return NextResponse.json(doc);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    await Holiday.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
