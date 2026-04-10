import { haciendaService } from '@/lib/services/hacienda.service';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const result = await haciendaService.getConfig();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { data: null, error: (error as Error).message, success: false },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const result = await haciendaService.upsertConfig(body);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { data: null, error: (error as Error).message, success: false },
            { status: 500 }
        );
    }
}
