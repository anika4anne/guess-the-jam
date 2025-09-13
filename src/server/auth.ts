import NextAuth, { type DefaultSession } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import { env } from "../env.js";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
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
});
