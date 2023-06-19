import { NextResponse } from "next/server";

import { db, eq } from "@/lib/orm";

export const POST = async (request: Request) => {
  return NextResponse.json({
    message: "Hello World",
  }, { status: 200 });
};

export const GET = async () => {
  return NextResponse.json({
    message: "Hello World",
  }, { status: 200 });
};
