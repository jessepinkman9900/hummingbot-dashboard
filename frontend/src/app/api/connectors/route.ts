import { connectorsApi } from '@/lib/api/connectors';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const connectors = await connectorsApi.getAvailableConnectors();
    return NextResponse.json(connectors);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connectors' },
      { status: 500 }
    );
  }
}
