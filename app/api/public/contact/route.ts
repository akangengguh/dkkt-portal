import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { clientAddress, rateLimitRequest } from "@/lib/rate-limit";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const limit = await rateLimitRequest("contact", clientAddress(request), 5, 3600);
    if (limit.unavailable) {
      return NextResponse.json({ success: false, message: "Form kontak sementara tidak tersedia." }, { status: 503 });
    }
    if (!limit.allowed) {
      return NextResponse.json({ success: false, message: "Terlalu banyak pesan dari jaringan Anda. Coba lagi nanti." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 16_384) {
      return NextResponse.json({ success: false, message: "Ukuran pesan melebihi batas yang diizinkan." }, { status: 413 });
    }
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Format pesan tidak valid." },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Format pesan tidak valid." },
        { status: 400 },
      );
    }

    const name = text(body.name);
    const email = text(body.email).toLowerCase();
    const phone = text(body.phone);
    const subject = text(body.subject);
    const message = text(body.message);

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Nama, email, keperluan, dan pesan wajib diisi." },
        { status: 400 },
      );
    }

    if (name.length > 120 || email.length > 160 || subject.length > 120 || message.length > 5000) {
      return NextResponse.json(
        { success: false, message: "Data pesan melebihi batas yang diizinkan." },
        { status: 400 },
      );
    }

    const contactMessage = await db.orm.public.ContactMessage.create({
      name,
      email,
      phone: phone || null,
      subject,
      message,
      status: "UNREAD",
      repliedAt: null,
      repliedBy: null,
    });

    return NextResponse.json(
      { success: true, data: { id: contactMessage.id } },
      { status: 201 },
    );
  } catch (error) {
    console.error("PUBLIC_CONTACT_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Gagal menyimpan pesan. Silakan coba lagi." },
      { status: 500 },
    );
  }
}