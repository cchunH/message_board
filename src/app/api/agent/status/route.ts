import { NextResponse } from "next/server";
import { getAgentMode } from "@/lib/agent/client";

export async function GET() {
  return NextResponse.json(getAgentMode());
}
