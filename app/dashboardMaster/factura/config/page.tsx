'use client';

import { useState, useEffect } from 'react';
import { ConfigFacturacion, TipoIdentificacion, AmbienteFE } from '@/lib/types';
import {
    getConfigFacturacionAction,
    saveConfigFacturacionAction,
} from '@/lib/actions/factura-electronica.actions';

const PROVINCIAS: Record<string, string> = {
    '1': 'San José', '2': 'Alajuela', '3': 'Cartago', '4': 'Heredia',
    '5': 'Guanacaste', '6': 'Puntarenas', '7': 'Limón',
};

export default function ConfigFacturacionPage() {
    const [config, setConfig] = useState<Partial<ConfigFacturacion>>({
        cedula_emisor: '',
        tipo_identificacion_emisor: '02',
        nombre_emisor: '',
        nombre_comercial: '',
        codigo_actividad: '',
        provincia: '1',
        canton: '01',
        distrito: '01',
        barrio: '01',
        otras_senas: '',
        telefono: '',
        email: '',
        ambiente: 'sandbox',
        usuario_hacienda: '',
        password_hacienda: '',
        codigo_local: '001',
        codigo_terminal: '00001',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const [locationData, setLocationData] = useState({
        provincias: {} as Record<string, string>,
        cantones: {} as Record<string, string>,
        distritos: {} as Record<string, string>,
        barrios: {} as Record<string, string>,
    });

    useEffect(() => {
        loadConfig();
    }, []);

    // Location API integrations
    useEffect(() => {
        const fetchAPI = async (endpoint: string) => {
            try {
                const res = await fetch(`https://ubicaciones.paginasweb.cr/${endpoint}.json`);
                if (!res.ok) return {};
                return await res.json();
            } catch {
                return {};
            }
        };

        const loadLocations = async () => {
            const provincias = await fetchAPI('provincias');
            const provId = parseInt(config.provincia || '1', 10);
            const cantones = provId ? await fetchAPI(`provincia/${provId}/cantones`) : {};
            const cantonId = parseInt(config.canton || '1', 10);
            const distritos = (provId && cantonId) ? await fetchAPI(`provincia/${provId}/canton/${cantonId}/distritos`) : {};
            const distId = parseInt(config.distrito || '1', 10);
            const barrios = (provId && cantonId && distId) ? await fetchAPI(`provincia/${provId}/canton/${cantonId}/distrito/${distId}/barrios`) : {};
            
            setLocationData({ provincias, cantones, distritos, barrios });
        };

        if (config.provincia) {
            loadLocations();
        }
    }, [config.provincia, config.canton, config.distrito]);


    const loadConfig = async () => {
        setLoading(true);
        const res = await getConfigFacturacionAction();
        if (res.success && res.data) {
            setConfig(res.data);
        }
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            // Remove prefix: data:application/x-pkcs12;base64,...
            const base64Content = base64.split(',')[1];
            update('archivo_p12', base64Content);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {

        setSaving(true);
        setError('');
        setSaved(false);

        // Basic validation
        if (!config.cedula_emisor || !config.nombre_emisor) {
            setError('Cédula y nombre del emisor son obligatorios.');
            setSaving(false);
            return;
        }

        const res = await saveConfigFacturacionAction(config);
        if (res.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } else {
            setError(res.error || 'Error al guardar configuración');
        }
        setSaving(false);
    };

    const update = (field: string, value: string) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nora-accent-500" />
                <p className="text-nora-gray-400 font-medium">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <header className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <a
                        href="/dashboardMaster/factura"
                        className="p-2 bg-nora-blue-800/60 rounded-xl hover:bg-nora-blue-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-nora-gray-400">arrow_back</span>
                    </a>
                    <div>
                        <h1 className="text-3xl font-black text-nora-gray-100 uppercase tracking-tight">
                            Configuración FE
                        </h1>
                        <p className="text-nora-gray-400 text-sm">
                            Datos del emisor y credenciales para facturación electrónica con Hacienda.
                        </p>
                    </div>
                </div>
            </header>

            {/* Ambiente indicator */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${config.ambiente === 'sandbox'
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-green-500/10 border-green-500/30'
                }`}>
                <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-2xl ${config.ambiente === 'sandbox' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                        {config.ambiente === 'sandbox' ? 'science' : 'verified'}
                    </span>
                    <div>
                        <p className={`text-sm font-black uppercase tracking-widest ${config.ambiente === 'sandbox' ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                            Ambiente: {config.ambiente === 'sandbox' ? 'SANDBOX (Pruebas)' : 'PRODUCCIÓN'}
                        </p>
                        <p className="text-xs text-nora-gray-400 mt-0.5">
                            {config.ambiente === 'sandbox'
                                ? 'Los documentos se envían al ambiente de pruebas de Hacienda.'
                                : '⚠️ Los documentos se envían al ambiente real de Hacienda.'}
                        </p>
                    </div>
                </div>
                <select
                    value={config.ambiente}
                    onChange={(e) => update('ambiente', e.target.value)}
                    className="bg-nora-blue-800 border border-nora-blue-700 text-nora-white text-xs font-bold rounded-xl p-3 outline-none"
                >
                    <option value="sandbox">Sandbox</option>
                    <option value="produccion">Producción</option>
                </select>
            </div>

            {/* Emisor Data */}
            <div className="bg-nora-blue-900/40 border border-nora-blue-700/50 rounded-3xl p-6 space-y-5">
                <h2 className="text-[10px] font-black text-nora-accent-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">person</span>
                    Datos del Emisor
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Tipo de Identificación *</label>
                        <select
                            value={config.tipo_identificacion_emisor}
                            onChange={(e) => update('tipo_identificacion_emisor', e.target.value)}
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        >
                            <option value="01">01 — Cédula Física</option>
                            <option value="02">02 — Cédula Jurídica</option>
                            <option value="03">03 — DIMEX</option>
                            <option value="04">04 — NITE</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Número de Cédula *</label>
                        <input
                            type="text"
                            value={config.cedula_emisor}
                            onChange={(e) => update('cedula_emisor', e.target.value.replace(/\D/g, ''))}
                            placeholder="Ej: 3101234567"
                            maxLength={12}
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Nombre / Razón Social *</label>
                        <input
                            type="text"
                            value={config.nombre_emisor}
                            onChange={(e) => update('nombre_emisor', e.target.value)}
                            placeholder="Nombre del contribuyente"
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Nombre Comercial</label>
                        <input
                            type="text"
                            value={config.nombre_comercial || ''}
                            onChange={(e) => update('nombre_comercial', e.target.value)}
                            placeholder="Nombre comercial (opcional)"
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Código de Actividad Económica *</label>
                        <input
                            type="text"
                            value={config.codigo_actividad}
                            onChange={(e) => update('codigo_actividad', e.target.value)}
                            placeholder="Ej: 561300"
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Location */}
            <div className="bg-nora-blue-900/40 border border-nora-blue-700/50 rounded-3xl p-6 space-y-5">
                <h2 className="text-[10px] font-black text-nora-accent-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Ubicación
                </h2>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-2">
                    <p className="text-[11px] text-blue-300">
                        <span className="font-bold">ℹ️ Importante:</span> La ubicación aquí provista <strong>debe ser exactamente la registrada en Tributación / ATV</strong> para esta cédula (Rechazo -37).
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Provincia</label>
                        <select
                            value={config.provincia ? String(parseInt(config.provincia, 10)) : ''}
                            onChange={(e) => {
                                update('provincia', e.target.value);
                                update('canton', '01');
                                update('distrito', '01');
                                update('barrio', '01');
                            }}
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        >
                            <option value="">Seleccione...</option>
                            {Object.entries(locationData.provincias).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Cantón</label>
                        <select
                            value={config.canton ? String(parseInt(config.canton, 10)) : ''}
                            onChange={(e) => {
                                update('canton', e.target.value.padStart(2, '0'));
                                update('distrito', '01');
                                update('barrio', '01');
                            }}
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        >
                            <option value="">Seleccione...</option>
                            {Object.entries(locationData.cantones).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Distrito</label>
                        <select
                            value={config.distrito ? String(parseInt(config.distrito, 10)) : ''}
                            onChange={(e) => {
                                update('distrito', e.target.value.padStart(2, '0'));
                                update('barrio', '01');
                            }}
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        >
                            <option value="">Seleccione...</option>
                            {Object.entries(locationData.distritos).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Barrio</label>
                        <select
                            value={config.barrio ? String(parseInt(config.barrio, 10)) : ''}
                            onChange={(e) => update('barrio', e.target.value.padStart(2, '0'))}
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        >
                            <option value="">Seleccione...</option>
                            {Object.entries(locationData.barrios).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Otras Señas (Dirección)</label>
                    <input
                        type="text"
                        value={config.otras_senas}
                        onChange={(e) => update('otras_senas', e.target.value)}
                        placeholder="Dirección completa"
                        className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                    />
                </div>
            </div>

            {/* Contact */}
            <div className="bg-nora-blue-900/40 border border-nora-blue-700/50 rounded-3xl p-6 space-y-5">
                <h2 className="text-[10px] font-black text-nora-accent-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">call</span>
                    Contacto
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Teléfono</label>
                        <input
                            type="text"
                            value={config.telefono}
                            onChange={(e) => update('telefono', e.target.value.replace(/\D/g, ''))}
                            placeholder="88888888"
                            maxLength={8}
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Email</label>
                        <input
                            type="email"
                            value={config.email}
                            onChange={(e) => update('email', e.target.value)}
                            placeholder="correo@empresa.com"
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Hacienda Credentials */}
            <div className="bg-nora-blue-900/40 border border-nora-blue-700/50 rounded-3xl p-6 space-y-5">
                <h2 className="text-[10px] font-black text-nora-accent-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">key</span>
                    Credenciales API Hacienda
                </h2>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                    <p className="text-xs text-blue-300">
                        <span className="font-bold">ℹ️ Nota:</span> Estas credenciales son las del portal ATV de Hacienda para el API de comprobantes electrónicos. 
                        NO es su llave criptográfica (certificado .p12).
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Usuario (ATV)</label>
                        <input
                            type="text"
                            value={config.usuario_hacienda}
                            onChange={(e) => update('usuario_hacienda', e.target.value)}
                            placeholder="cpj-XXXXXXXXXX@stag.comprobanteselectronicos.go.cr"
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Contraseña (ATV)</label>
                        <input
                            type="password"
                            value={config.password_hacienda}
                            onChange={(e) => update('password_hacienda', e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Cryptographic Key (.p12) */}
            <div className="bg-nora-blue-900/40 border border-nora-blue-700/50 rounded-3xl p-6 space-y-5">
                <h2 className="text-[10px] font-black text-nora-accent-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
                    Llave Criptográfica (.p12)
                </h2>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                    <p className="text-xs text-yellow-300">
                        <span className="font-bold">⚠️ Importante:</span> La llave criptográfica es obligatoria para firmar digitalmente los documentos. Sin esto, Hacienda rechazará las facturas.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Archivo de Llave (.p12)</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".p12"
                                onChange={handleFileChange}
                                className="hidden"
                                id="p12-upload"
                            />
                            <label
                                htmlFor="p12-upload"
                                className={`flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${config.archivo_p12 
                                    ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                    : 'bg-nora-blue-800 border-nora-blue-700 text-nora-gray-500 hover:border-nora-accent-500'
                                }`}
                            >
                                <span className="material-symbols-outlined">
                                    {config.archivo_p12 ? 'verified' : 'upload_file'}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-widest">
                                    {config.archivo_p12 ? 'Llave Cargada' : 'Subir Certificado .p12'}
                                </span>
                            </label>
                            {config.archivo_p12 && (
                                <p className="text-[9px] text-green-500/60 mt-2 text-center">✓ Llave lista para ser guardada</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">PIN de la Llave</label>
                        <input
                            type="password"
                            value={config.pin_p12 || ''}
                            onChange={(e) => update('pin_p12', e.target.value)}
                            placeholder="Ej: 1234"
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        />
                    </div>
                </div>
            </div>


            {/* Consecutive Config */}
            <div className="bg-nora-blue-900/40 border border-nora-blue-700/50 rounded-3xl p-6 space-y-5">
                <h2 className="text-[10px] font-black text-nora-accent-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">tag</span>
                    Numeración
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Código Local</label>
                        <input
                            type="text"
                            value={config.codigo_local}
                            onChange={(e) => update('codigo_local', e.target.value)}
                            placeholder="001"
                            maxLength={3}
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Código Terminal</label>
                        <input
                            type="text"
                            value={config.codigo_terminal}
                            onChange={(e) => update('codigo_terminal', e.target.value)}
                            placeholder="00001"
                            maxLength={5}
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Consec. Facturas</label>
                        <input
                            type="number"
                            value={config.consecutivo_factura ?? 0}
                            readOnly
                            className="w-full bg-nora-blue-800/50 border border-nora-blue-700 text-nora-gray-400 text-sm font-bold rounded-xl p-3 outline-none cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Consec. Tiquetes</label>
                        <input
                            type="number"
                            value={config.consecutivo_tiquete ?? 0}
                            readOnly
                            className="w-full bg-nora-blue-800/50 border border-nora-blue-700 text-nora-gray-400 text-sm font-bold rounded-xl p-3 outline-none cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400">error</span>
                    <p className="text-xs font-bold text-red-400">{error}</p>
                </div>
            )}

            {saved && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400">check_circle</span>
                    <p className="text-xs font-bold text-green-400">Configuración guardada exitosamente.</p>
                </div>
            )}

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-5 font-black rounded-2xl shadow-xl uppercase tracking-widest text-sm transition-all bg-gradient-to-r from-nora-accent-500 to-nora-accent-400 text-white shadow-nora-accent-500/20 hover:from-nora-accent-400 hover:to-nora-accent-300 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
                {saving ? (
                    <>
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Guardando...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined">save</span>
                        Guardar Configuración
                    </>
                )}
            </button>
        </div>
    );
}
