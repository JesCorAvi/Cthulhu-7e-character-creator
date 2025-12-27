import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { getDb } from "@/db/drizzle"
import { accounts, sessions, users, verificationTokens } from "@/db/schema"

export const { handlers, signIn, signOut, auth } = NextAuth(async (req) => {
  // Inicializamos la DB solo cuando hay una petición real
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
    console.warn("No se pudo conectar a D1 (probablemente durante el build). Auth no funcionará en este contexto.");
    // Devolvemos una config sin adaptador si falla (para que el build pase)
  }

  return {
    adapter,
    providers: [Google],
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