import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { getDb } from "@/db/drizzle"
import { accounts, sessions, users, verificationTokens } from "@/db/schema"

export const { handlers, signIn, signOut, auth } = NextAuth(async (req) => {
  let adapter;
  try {
    const db = await getDb();
    adapter = DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    });
  } catch (e) {
    console.warn("No se pudo conectar a D1. Auth funcionará sin persistencia.");
  }

  return {
    adapter,
    providers: [
      // FORZAMOS LA CONFIGURACIÓN AQUÍ
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      })
    ],
    secret: process.env.AUTH_SECRET, // Aseguramos que el secreto también se lea
    session: { strategy: "jwt" },
    callbacks: {
      async session({ session, token }) {
        if (token.sub && session.user) {
          session.user.id = token.sub;
        }
        return session;
      }
    }
  }
})