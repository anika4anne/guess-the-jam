import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ message: "Authentication successful" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Something went wrong", details: error.message },
        { status: 500 },
      );
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 },
      );
    }
  }
}
