import { NextRequest, NextResponse } from 'next/server'
import { getSessionStatus } from '@/app/actions/stripe'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      )
    }

    const status = await getSessionStatus(sessionId)
    
    return NextResponse.json({
      success: true,
      ...status,
    })
  } catch (error) {
    console.error('[v0] Error fetching payment status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    )
  }
}
