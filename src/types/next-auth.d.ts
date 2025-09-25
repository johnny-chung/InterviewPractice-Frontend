import "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
      proMember?: boolean;
    };
  }

  interface Profile {
    app_metadata?: {
      proMember?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    proMember?: boolean;
  }
}
