import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { consumeCredit, createProcessingRecord } from '@/lib/user'
import { prisma } from '@/lib/prisma'

// edge runtime 不支持 prisma，改用 nodejs
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // 1. 验证登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to use this service', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // 2. 查用户额度
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || user.credits <= 0) {
      return NextResponse.json(
        { error: 'No credits remaining. Please purchase more credits.', code: 'NO_CREDITS' },
        { status: 402 }
      )
    }

    // 3. 获取图片
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const bgColor = (formData.get('bgColor') as string) || '#FFFFFF'
    const sizePreset = (formData.get('sizePreset') as string) || 'US Passport'

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiKey = process.env.REMOVE_BG_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // 4. 调用 remove.bg
    const removeBgForm = new FormData()
    removeBgForm.append('image_file', imageFile)
    removeBgForm.append('size', 'auto')

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: removeBgForm,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Remove.bg API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to remove background. Please try again.' },
        { status: response.status }
      )
    }

    // 5. 扣除额度 + 记录历史
    await consumeCredit(user.id)
    await createProcessingRecord(user.id, bgColor, sizePreset)

    // 6. 返回图片
    const imageBuffer = await response.arrayBuffer()
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
        'X-Credits-Remaining': String(user.credits - 1),
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
