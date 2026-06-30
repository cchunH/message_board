import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
    }
    if (password.length < 3) {
      return NextResponse.json({ error: "密码长度不能少于3位" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "用户名已被注册" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    const token = await signToken({ userId: user.id, userName: user.username });

    return NextResponse.json(
      { token, user: { id: user.id, username: user.username } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
