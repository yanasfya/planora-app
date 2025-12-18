import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import User from "@/models/User";

// Token refresh function for Google OAuth
async function refreshAccessToken(token: any) {
  try {
    const url = "https://oauth2.googleapis.com/token";

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error("[Auth] Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline", // Request refresh token
          prompt: "consent",      // Force consent screen to get refresh token
          response_type: "code",
        },
      },
    }),
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[Auth] Authorize attempt for:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials");
          return null;
        }

        try {
          console.log("[Auth] Connecting to database...");
          await connectToDatabase();
          console.log("[Auth] Database connected");

          const user = await User.findOne({
            email: credentials.email.toString().toLowerCase().trim(),
          });

          console.log("[Auth] User found:", user ? "Yes" : "No");

          if (!user) {
            console.log("[Auth] User not found");
            return null;
          }

          console.log("[Auth] Comparing passwords...");
          const isPasswordValid = await bcrypt.compare(
            credentials.password.toString(),
            user.password
          );

          console.log("[Auth] Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("[Auth] Invalid password");
            return null;
          }

          console.log("[Auth] Authorization successful!");
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image || null,
          };
        } catch (error) {
          console.error("[Auth] Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Initial sign in
      if (account && user) {
        console.log("[Auth] Initial sign in - storing tokens");
        
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 60 * 60 * 1000, // 1 hour fallback
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.image,
          error: undefined,
        };
      }

      // Return previous token if access token has not expired
      if (Date.now() < (token.accessTokenExpires as number)) {
        console.log("[Auth] Token still valid");
        return token;
      }

      // Access token has expired, try to refresh it
      console.log("[Auth] Token expired, attempting refresh");
      
      // Only refresh if we have a refresh token (OAuth only)
      if (token.refreshToken) {
        return await refreshAccessToken(token);
      }

      // No refresh token (credentials login), just return token
      return token;
    },

    async session({ session, token }) {
      // Add user info and token status to session
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        
        // Add error to session if token refresh failed
        if (token.error) {
          console.error("[Auth] Session has token error:", token.error);
          session.error = token.error as string;
        }
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // For Google OAuth, save user to database if not exists
      if (account?.provider === "google" && profile?.email) {
        try {
          await connectToDatabase();
          
          const existingUser = await User.findOne({ email: profile.email });
          
          if (!existingUser) {
            console.log("[Auth] Creating new Google user");
            await User.create({
              email: profile.email,
              name: profile.name,
              image: profile.picture,
              password: "", // No password for OAuth users
            });
          }
        } catch (error) {
          console.error("[Auth] Error saving Google user:", error);
        }
      }
      
      return true;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error", // Add error page for better UX
  },
});