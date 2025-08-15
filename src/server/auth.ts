import NextAuth, { type DefaultSession } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import { env } from "../env.js";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // other properties
  //   // role: UserRole;
  // }
}

const providers = [];

if (env.AUTH_DISCORD_ID && env.AUTH_DISCORD_SECRET) {
  providers.push(
    DiscordProvider({
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
    }),
  );
}

if (env.AUTH_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  );
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers,
  // callbacks: {
  //   session: ({ session, token }) => ({
  //     session,
  //     user: {
  //       session.user,
  //       id: token.sub,
  //     },
  //   }),
  // },
});
