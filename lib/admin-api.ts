import { NextResponse } from "next/server";

export function adminApiError(error: unknown, fallback: string) {
  const digest = typeof error === "object" && error !== null && "digest" in error
    ? String(error.digest)
    : "";
  const message = error instanceof Error ? error.message : "";

  if (digest.startsWith("NEXT_REDIRECT")) {
    return NextResponse.json(
      { success: false, message: "Silakan masuk untuk melanjutkan." },
      { status: 401 },
    );
  }

  if (message.startsWith("Permission denied:")) {
    return NextResponse.json(
      { success: false, message: "Anda tidak memiliki izin untuk tindakan ini." },
      { status: 403 },
    );
  }

  console.error("ADMIN_API_ERROR:", error);
  return NextResponse.json(
    { success: false, message: fallback },
    { status: 500 },
  );
}
