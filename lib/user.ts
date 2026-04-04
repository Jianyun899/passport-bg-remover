import { getServerSession } from 'next-auth'
import { prisma } from './prisma'
import { authOptions } from './auth'

// 获取或创建用户（首次登录自动创建，送3次）
export async function getOrCreateUser(email: string, name?: string | null, image?: string | null) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return existing

  return prisma.user.create({
    data: {
      email,
      name,
      image,
      credits: 3, // 新注册送3次
    },
  })
}

// 获取当前登录用户（含额度）
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return prisma.user.findUnique({ where: { email: session.user.email } })
}

// 消耗1次额度，返回是否成功
export async function consumeCredit(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.credits <= 0) return false

  await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: 1 } },
  })
  return true
}

// 记录处理历史
export async function createProcessingRecord(
  userId: string,
  bgColor: string,
  sizePreset: string
) {
  return prisma.processingRecord.create({
    data: { userId, bgColor, sizePreset },
  })
}
