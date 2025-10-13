import { connectorsApi } from '@/lib/api/connectors';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ connector: string }> }
) {
  try {
    const { connector } = await params;
    const configMap = await connectorsApi.getConnectorConfigMap(connector);
    return NextResponse.json(configMap);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connector config map' },
      { status: 500 }
    );
  }
}
