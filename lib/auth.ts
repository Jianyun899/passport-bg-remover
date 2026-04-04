import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getOrCreateUser } from './user'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        await getOrCreateUser(user.email, user.name, user.image)
      }
      return true
    },
    async session({ session }) {
      if (session.user?.email) {
        const { prisma } = await import('./prisma')
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, credits: true, plan: true },
        })
        if (dbUser) {
          (session.user as any).id = dbUser.id;
          (session.user as any).credits = dbUser.credits;
          (session.user as any).plan = dbUser.plan;
        }
      }
      return session
    },
  },
}
