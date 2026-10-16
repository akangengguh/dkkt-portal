import "temporal-polyfill/full/global";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { clientAddress, rateLimitRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ipLimit = await rateLimitRequest("login-ip", clientAddress(request), 30, 900);
    if (ipLimit.unavailable) {
      return NextResponse.json({ success: false, message: "Layanan login sementara tidak tersedia." }, { status: 503 });
    }
    if (!ipLimit.allowed) {
      return NextResponse.json({ success: false, message: "Terlalu banyak percobaan. Coba lagi beberapa menit." }, { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } });
    }

let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Format permintaan tidak valid.",
        },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Format permintaan tidak valid.",
        },
        { status: 400 },
      );
    }

    const identifier =
      typeof body.identifier === "string"
        ? body.identifier.trim().toLowerCase()
        : typeof body.email === "string"
          ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username/email dan password wajib diisi.",
        },
        { status: 400 },
      );
    }

    const identifierLimit = await rateLimitRequest("login-identifier", identifier, 10, 900);
    if (identifierLimit.unavailable) {
      return NextResponse.json({ success: false, message: "Layanan login sementara tidak tersedia." }, { status: 503 });
    }
    if (!identifierLimit.allowed) {
      return NextResponse.json({ success: false, message: "Terlalu banyak percobaan untuk akun ini. Coba lagi beberapa menit." }, { status: 429, headers: { "Retry-After": String(identifierLimit.retryAfter) } });
    }

    const user = await db.orm.public.User.first({ email: identifier })
      || await db.orm.public.User.first({ username: identifier });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password tidak valid.",
        },
        { status: 401 },
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akun Anda tidak aktif. Hubungi administrator.",
        },
        { status: 403 },
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password tidak valid.",
        },
        { status: 401 },
      );
    }

    if (user.artistId) {
      const artist = await db.orm.public.Artist.first({ id: user.artistId });
      if (!artist || !artist.isActive || artist.registrationStatus !== "ACTIVE") {
        return NextResponse.json(
          { success: false, message: "Akses CMS dinonaktifkan karena status profil seniman tidak aktif atau belum terverifikasi." },
          { status: 403 },
        );
      }
    }

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 },
    );
  }
}