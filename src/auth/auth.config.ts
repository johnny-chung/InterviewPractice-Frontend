import type { NextAuthConfig } from "next-auth";
import Auth0 from "next-auth/providers/auth0";

export const authConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Auth0({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER!,
      token: {
        params: {
          audience: process.env.AUTH0_AUDIENCE,
        },
      },
      idToken: true,
      authorization: {
        params: {
          audience: encodeURI(process.env.AUTH0_AUDIENCE ?? ""),
          scope: "openid profile email offline_access",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        console.debug("account: ", account);
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at ?? null;
      }
      if (profile && typeof profile === "object") {
        const metadata = (profile as Record<string, unknown>).app_metadata as
          | Record<string, unknown>
          | undefined;
        if (metadata && "proMember" in metadata) {
          token.proMember = Boolean(metadata.proMember);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.accessToken = token.accessToken as string | undefined;
        session.user.proMember = Boolean(token.proMember);
      }
      if (token?.accessTokenExpires) {
        session.expires = new Date(
          (token.accessTokenExpires as number) * 1000
        ).toISOString() as Date & string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
