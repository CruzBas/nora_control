'use server';

import { getTipoCambioBCCR, TipoCambioBCCR } from '../services/tipoCambio.service';

export async function getTipoCambioAction(): Promise<TipoCambioBCCR> {
    return getTipoCambioBCCR();
}
