

export interface TipoCambioBCCR {
    compra: number;
    venta: number;
    fecha: string;
    fuente: string;
}


let cachedRate: TipoCambioBCCR | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION_MS = 30 * 60 * 1000;

/**
 * Obtiene el tipo de cambio del BCCR desde tipodecambio.cr
 */
async function fetchFromTipoDeCambioCR(): Promise<TipoCambioBCCR> {
    const res = await fetch('https://tipodecambio.cr/api/rates', {
        next: { revalidate: 1800 }, // Cache de Next.js: 30 min
    });

    if (!res.ok) throw new Error(`tipodecambio.cr respondió ${res.status}`);

    const data = await res.json();

    // Usar el tipo de cambio oficial del BCCR
    if (data.bccr_rate) {
        return {
            compra: data.bccr_rate.compra,
            venta: data.bccr_rate.venta,
            fecha: data.bccr_rate.fecha,
            fuente: 'BCCR (vía tipodecambio.cr)',
        };
    }

    const bccr = data.rates?.find((r: any) => r.entidad === 'BCCR');
    if (bccr) {
        return {
            compra: bccr.compra,
            venta: bccr.venta,
            fecha: bccr.actualizacion,
            fuente: 'BCCR (vía tipodecambio.cr)',
        };
    }

    throw new Error('No se encontró el tipo de cambio del BCCR en tipodecambio.cr');
}

/**
 * Obtiene el tipo de cambio del BCCR desde gometa.org (fallback)
 */
async function fetchFromGometa(): Promise<TipoCambioBCCR> {
    const res = await fetch('https://apis.gometa.org/tdc/tdc.json', {
        next: { revalidate: 1800 },
    });

    if (!res.ok) throw new Error(`gometa.org respondió ${res.status}`);

    const data = await res.json();

    return {
        compra: parseFloat(data.compra),
        venta: parseFloat(data.venta),
        fecha: data.compra_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        fuente: 'BCCR (vía gometa.org)',
    };
}

export async function getTipoCambioBCCR(): Promise<TipoCambioBCCR> {
    // Verificar cache
    const now = Date.now();
    if (cachedRate && (now - cacheTimestamp) < CACHE_DURATION_MS) {
        return cachedRate;
    }

    try {
        cachedRate = await fetchFromTipoDeCambioCR();
        cacheTimestamp = now;
        return cachedRate;
    } catch (err) {
        console.warn('[TipoCambio] Error con tipodecambio.cr, intentando gometa.org:', err);
    }

    try {
        cachedRate = await fetchFromGometa();
        cacheTimestamp = now;
        return cachedRate;
    } catch (err) {
        console.error('[TipoCambio] Error con ambas fuentes:', err);
    }


    if (cachedRate) return cachedRate;

    return {
        compra: 451,
        venta: 458,
        fecha: new Date().toISOString().split('T')[0],
        fuente: 'Valor por defecto (sin conexión)',
    };
}
