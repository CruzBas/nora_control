'use client';

import { useState, useEffect } from 'react';
import { ConfigFiscal, TipoCedula, ModoFE, TIPO_CEDULA_LABELS, PROVINCIAS_CR } from '@/lib/types/facturacion';

interface Props {
    config: ConfigFiscal | null;
    onSave: (data: Partial<ConfigFiscal>) => Promise<unknown>;
}

export default function ConfigFiscalForm({ config, onSave }: Props) {
    const [form, setForm] = useState<Partial<ConfigFiscal>>({
        tipo_cedula: 'juridico',
        cedula: '', nombre_comercial: '', codigo_actividad: '',
        provincia: '1', canton: '01', distrito: '01', barrio: '01', otras_senas: '',
        telefono: '', fax: '00000000', email: '',
        sucursal: '001', terminal: '00001',
        api_url: 'https://api-demo.crlibre.org/api.php',
        hacienda_username: '', hacienda_password: '',
        certificado_token: '', pin_certificado: '',
        modo: 'sandbox',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (config) {
            setForm({ ...config });
        }
    }, [config]);

    const handleSave = async () => {
        setSaving(true);
        await onSave(form);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const setField = (key: string, value: string | number) => {
        setForm(p => ({ ...p, [key]: value }));
    };

    const inputCls = 'w-full px-3 py-2.5 bg-nora-blue-800/60 border border-nora-blue-700/50 rounded-xl text-nora-gray-200 text-sm focus:outline-none focus:border-nora-accent-500/50 transition-colors';
    const labelCls = 'block text-xs font-bold text-nora-gray-400 mb-1.5 uppercase tracking-wider';
    const sectionCls = 'bg-nora-blue-800/30 border border-nora-blue-700/30 rounded-2xl p-5 space-y-4';

    return (
        <div className="space-y-6 max-w-4xl">

            <div className="flex items-center gap-4 p-4 bg-nora-blue-800/40 border border-nora-blue-700/30 rounded-2xl">
                <span className="material-symbols-outlined text-2xl text-nora-accent-400">settings</span>
                <div className="flex-1">
                    <p className="text-sm font-bold text-nora-gray-200">Modo de operación</p>
                    <p className="text-xs text-nora-gray-500">
                        {form.modo === 'sandbox' ? 'Modo de pruebas (Sandbox) — los documentos no son reales' : 'Modo de producción — documentos se envían a Hacienda'}
                    </p>
                </div>
                <select
                    value={form.modo}
                    onChange={e => setField('modo', e.target.value as ModoFE)}
                    className="px-4 py-2 bg-nora-blue-800 border border-nora-blue-700/50 rounded-xl text-sm font-bold text-nora-gray-200 focus:outline-none focus:border-nora-accent-500/50"
                >
                    <option value="sandbox">🧪 Sandbox</option>
                    <option value="produccion">🚀 Producción</option>
                </select>
            </div>


            <div className={sectionCls}>
                <h3 className="text-sm font-black text-nora-gray-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-nora-accent-400">business</span>
                    Datos del Emisor
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Tipo de Cédula</label>
                        <select value={form.tipo_cedula} onChange={e => setField('tipo_cedula', e.target.value as TipoCedula)} className={inputCls}>
                            {Object.entries(TIPO_CEDULA_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Número de Cédula</label>
                        <input value={form.cedula || ''} onChange={e => setField('cedula', e.target.value)} className={inputCls} placeholder="3101234567" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={labelCls}>Nombre Comercial</label>
                        <input value={form.nombre_comercial || ''} onChange={e => setField('nombre_comercial', e.target.value)} className={inputCls} placeholder="Mi Empresa S.A." />
                    </div>
                    <div>
                        <label className={labelCls}>Código de Actividad Económica</label>
                        <input value={form.codigo_actividad || ''} onChange={e => setField('codigo_actividad', e.target.value)} className={inputCls} placeholder="561013" />
                    </div>
                </div>
            </div>


            <div className={sectionCls}>
                <h3 className="text-sm font-black text-nora-gray-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-nora-accent-400">location_on</span>
                    Ubicación
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <label className={labelCls}>Provincia</label>
                        <select value={form.provincia || ''} onChange={e => setField('provincia', e.target.value)} className={inputCls}>
                            {Object.entries(PROVINCIAS_CR).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Cantón</label>
                        <input value={form.canton || ''} onChange={e => setField('canton', e.target.value)} className={inputCls} placeholder="01" />
                    </div>
                    <div>
                        <label className={labelCls}>Distrito</label>
                        <input value={form.distrito || ''} onChange={e => setField('distrito', e.target.value)} className={inputCls} placeholder="01" />
                    </div>
                    <div>
                        <label className={labelCls}>Barrio</label>
                        <input value={form.barrio || ''} onChange={e => setField('barrio', e.target.value)} className={inputCls} placeholder="01" />
                    </div>
                </div>
                <div>
                    <label className={labelCls}>Otras Señas (Dirección)</label>
                    <input value={form.otras_senas || ''} onChange={e => setField('otras_senas', e.target.value)} className={inputCls} placeholder="100m norte del parque central" />
                </div>
            </div>


            <div className={sectionCls}>
                <h3 className="text-sm font-black text-nora-gray-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-nora-accent-400">contact_phone</span>
                    Contacto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className={labelCls}>Teléfono</label>
                        <input value={form.telefono || ''} onChange={e => setField('telefono', e.target.value)} className={inputCls} placeholder="22221111" />
                    </div>
                    <div>
                        <label className={labelCls}>Fax</label>
                        <input value={form.fax || ''} onChange={e => setField('fax', e.target.value)} className={inputCls} placeholder="00000000" />
                    </div>
                    <div>
                        <label className={labelCls}>Email</label>
                        <input type="email" value={form.email || ''} onChange={e => setField('email', e.target.value)} className={inputCls} placeholder="empresa@correo.com" />
                    </div>
                </div>
            </div>


            <div className={sectionCls}>
                <h3 className="text-sm font-black text-nora-gray-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-nora-accent-400">point_of_sale</span>
                    Terminal / Sucursal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className={labelCls}>Sucursal</label>
                        <input value={form.sucursal || ''} onChange={e => setField('sucursal', e.target.value)} className={inputCls} placeholder="001" />
                    </div>
                    <div>
                        <label className={labelCls}>Terminal</label>
                        <input value={form.terminal || ''} onChange={e => setField('terminal', e.target.value)} className={inputCls} placeholder="00001" />
                    </div>
                    <div>
                        <label className={labelCls}>Consecutivo Actual</label>
                        <input type="number" value={form.consecutivo_actual || 0} onChange={e => setField('consecutivo_actual', parseInt(e.target.value))} className={inputCls} />
                    </div>
                </div>
            </div>


            <div className={sectionCls}>
                <h3 className="text-sm font-black text-nora-gray-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-nora-accent-400">api</span>
                    API CRLibre
                </h3>
                <div>
                    <label className={labelCls}>URL de la API</label>
                    <input value={form.api_url || ''} onChange={e => setField('api_url', e.target.value)} className={inputCls} placeholder="https://api-demo.crlibre.org/api.php" />
                    <p className="text-[10px] text-nora-gray-600 mt-1">Demo: https://api-demo.crlibre.org/api.php</p>
                </div>
            </div>


            <div className={sectionCls}>
                <h3 className="text-sm font-black text-nora-gray-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-nora-accent-400">account_balance</span>
                    Credenciales ATV (Hacienda)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Usuario ATV</label>
                        <input value={form.hacienda_username || ''} onChange={e => setField('hacienda_username', e.target.value)} className={inputCls} placeholder="usuario@hacienda" />
                    </div>
                    <div>
                        <label className={labelCls}>Contraseña ATV</label>
                        <input type="password" value={form.hacienda_password || ''} onChange={e => setField('hacienda_password', e.target.value)} className={inputCls} placeholder="••••••••" />
                    </div>
                </div>
            </div>


            <div className={sectionCls}>
                <h3 className="text-sm font-black text-nora-gray-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-nora-accent-400">key</span>
                    Certificado Digital (.p12)
                </h3>
                <p className="text-xs text-nora-gray-500">
                    El token del certificado es generado al subirlo a la API de CRLibre. Consulte la documentación para obtenerlo.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Token del Certificado</label>
                        <input value={form.certificado_token || ''} onChange={e => setField('certificado_token', e.target.value)} className={inputCls} placeholder="Token .p12" />
                    </div>
                    <div>
                        <label className={labelCls}>PIN del Certificado</label>
                        <input type="password" value={form.pin_certificado || ''} onChange={e => setField('pin_certificado', e.target.value)} className={inputCls} placeholder="••••" />
                    </div>
                </div>
            </div>


            <div className="flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-nora-accent-500 hover:bg-nora-accent-400 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-nora-accent-500/25 disabled:opacity-50 active:scale-95"
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <span className="material-symbols-outlined text-lg">save</span>
                    )}
                    Guardar Configuración
                </button>
                {saved && (
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 animate-pulse">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        Guardado correctamente
                    </span>
                )}
            </div>
        </div>
    );
}
