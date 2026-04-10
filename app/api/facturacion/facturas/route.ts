import { haciendaService } from '@/lib/services/hacienda.service';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const result = await haciendaService.getFacturas();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { data: null, error: (error as Error).message, success: false },
            { status: 500 }
        );
    }
}
