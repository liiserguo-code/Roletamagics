import { NextRequest, NextResponse } from 'next/server'
import { createDepositSession } from '@/app/actions/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { packageId, customAmount } = body

    if (!packageId) {
      return NextResponse.json(
        { error: 'Missing packageId' },
        { status: 400 }
      )
    }

    if (packageId === 'custom' && (!customAmount || customAmount < 10)) {
      return NextResponse.json(
        { error: 'Custom amount must be at least R$ 10.00' },
        { status: 400 }
      )
    }

    const result = await createDepositSession(packageId, customAmount)
    
    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('[v0] Error creating deposit:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create deposit' },
      { status: 500 }
    )
  }
}
