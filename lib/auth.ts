import "temporal-polyfill/full/global";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "dkkt_session";

const secretValue = process.env.AUTH_SECRET;

if (!secretValue) {
  throw new Error(
    "AUTH_SECRET belum tersedia di file .env.",
  );
}

const secret = new TextEncoder().encode(
  secretValue,
);

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
};

export async function createSession(
  payload: SessionPayload,
) {
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<
  SessionPayload | null
> {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } =
      await jwtVerify(token, secret);

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}