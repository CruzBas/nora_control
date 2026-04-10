import { clienteFiscalService } from '@/lib/services/cliente-fiscal.service';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const result = await clienteFiscalService.getAll();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { data: null, error: (error as Error).message, success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = await clienteFiscalService.create(body);
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
        const { id, ...updates } = body;
        const result = await clienteFiscalService.update(id, updates);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { data: null, error: (error as Error).message, success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });

        const result = await clienteFiscalService.remove(id);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { data: null, error: (error as Error).message, success: false },
            { status: 500 }
        );
    }
}
