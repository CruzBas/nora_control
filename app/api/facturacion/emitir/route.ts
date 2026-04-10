import { haciendaService } from '@/lib/services/hacienda.service';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = await haciendaService.procesarFactura(body);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { data: null, error: (error as Error).message, success: false },
            { status: 500 }
        );
    }
}
