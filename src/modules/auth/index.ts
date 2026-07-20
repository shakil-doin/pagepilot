import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { APP } from "@/config/app.config";
import { rateLimit } from "@/lib/rate-limit";
import type { Role, UserStatus } from "@/generated/prisma/enums";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const providers = [
  Credentials({
    credentials: { email: {}, password: {} },
    authorize: async (raw) => {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;
      const limited = rateLimit(`login:${email}`, { limit: 10, windowMs: 15 * 60 * 1000 });
      if (!limited.ok) return null;

      const user = await db.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash || user.status === "DISABLED") return null;

      const valid = await compare(password, user.passwordHash);
      if (!valid) return null;

      return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status };
    },
  }),
  ...(APP.oauth.googleClientId
    ? [Google({ clientId: APP.oauth.googleClientId, clientSecret: APP.oauth.googleClientSecret })]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  secret: APP.authSecret,
  // Deployments sit behind a proxy/CDN; APP_URL is the canonical origin
  trustHost: true,
  logger: {
    error: (error) => {
      // A cookie signed with a rotated AUTH_SECRET fails decryption on every
      // request until the user signs in again. That is expected, not an error:
      // auth() returns null and the layout redirects to /login.
      if (error.name === "JWTSessionError") return;
      console.error("[auth]", error);
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    session: async ({ session, token }) => {
      const claims = token as { id?: string; role?: Role; status?: UserStatus };
      if (claims.id) session.user.id = claims.id;
      if (claims.role) session.user.role = claims.role;
      if (claims.status) session.user.status = claims.status;
      return session;
    },
  },
});
