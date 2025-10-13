import { connectorsApi } from '@/lib/api/connectors';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ connector: string }> }
) {
  try {
    const { connector } = await params;
    const tradingRules = await connectorsApi.getTradingRules(connector);
    return NextResponse.json(tradingRules);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trading rules' },
      { status: 500 }
    );
  }
}
