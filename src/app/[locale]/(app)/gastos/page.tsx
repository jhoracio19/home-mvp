import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getCasaActivaOrRedirect, getMiembrosCasaActiva, getUsuarioActual } from '@/lib/casas/data';
import { nombreMiembro } from '@/lib/casas/nombre-miembro';
import { getGastos, getPagos } from '@/lib/gastos/data';
import { calcularBalances } from '@/lib/gastos/balance';
import { intlLocale } from '@/lib/intl-locale';
import { agregarGasto, eliminarGasto, registrarPago, eliminarPago } from './actions';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { EscuchaRealtime } from '@/components/realtime/EscuchaRealtime';

type Miembro = { usuario_id: string; email: string; rol: string; nombre: string | null; apellido: string | null };

function nombrePorId(miembros: Miembro[], usuarioId: string, alguien: string) {
  const m = miembros.find((x) => x.usuario_id === usuarioId);
  return m ? nombreMiembro(m) : alguien;
}

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [casa, gastos, pagos, miembros, usuario, { error }, t, locale] = await Promise.all([
    getCasaActivaOrRedirect(),
    getGastos(),
    getPagos(),
    getMiembrosCasaActiva(),
    getUsuarioActual(),
    searchParams,
    getTranslations('Gastos'),
    getLocale() as Promise<Locale>,
  ]);

  const formatoMoneda = new Intl.NumberFormat(intlLocale(locale), { style: 'currency', currency: 'MXN' });
  const formatoFecha = new Intl.DateTimeFormat(intlLocale(locale), { day: 'numeric', month: 'short' });

  // parseFechaLocal-style: evita que 'YYYY-MM-DD' se corra un día por
  // interpretarse como UTC (mismo motivo que en lib/urgencia.ts).
  function formatearFecha(fecha: string) {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return formatoFecha.format(new Date(anio, mes - 1, dia));
  }

  const balances = calcularBalances(gastos, pagos, miembros.map((m) => m.usuario_id));
  const hoyISO = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date());

  // Gastos y pagos se muestran en una sola línea de tiempo — para
  // quien la ve, "se gastó X" y "se pagó X" son el mismo tipo de
  // evento (algo que movió el balance), aunque vivan en tablas
  // distintas por el motivo explicado en schema.sql.
  const actividad = [
    ...gastos.map((g) => ({ tipo: 'gasto' as const, id: g.id, fecha: g.fecha, createdAt: g.created_at, gasto: g })),
    ...pagos.map((p) => ({ tipo: 'pago' as const, id: p.id, fecha: p.fecha, createdAt: p.created_at, pago: p })),
  ].sort((a, b) => (a.fecha === b.fecha ? b.createdAt.localeCompare(a.createdAt) : b.fecha.localeCompare(a.fecha)));

  return (
    <main className="flex flex-1 justify-center bg-[radial-gradient(circle_at_top_left,_rgba(178,150,125,0.3),_transparent_34%)] bg-linen px-4 py-8">
      <EscuchaRealtime tabla="gastos" casaId={casa.id} />
      <EscuchaRealtime tabla="pagos" casaId={casa.id} />
      <section className="w-full max-w-2xl space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa hover:underline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('volver')}
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{casa.nombre}</p>
          <h1 className="mt-1 text-2xl font-bold text-cocoa">{t('titulo')}</h1>
          <p className="mt-1 text-sm text-cocoa/70">{t('descripcion', { n: miembros.length })}</p>
        </div>

        <Link href="/gastos/resumen" className="inline-block text-xs font-semibold text-camel hover:underline">
          {t('verResumen')}
        </Link>

        {error && (
          <p className="rounded-lg border border-[#a8422e] bg-[#a8422e]/10 px-3 py-2 text-sm font-medium text-[#a8422e]">
            {error}
          </p>
        )}

        {/* Balances */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {miembros.map((m) => {
            const balance = balances.get(m.usuario_id) ?? 0;
            const redondeado = Math.round(balance * 100) / 100;
            return (
              <div key={m.usuario_id} className="rounded-lg border border-camel bg-khaki p-3">
                <p className="truncate text-xs font-semibold text-cocoa">{nombreMiembro(m)}</p>
                <p
                  className={`mt-1 text-lg font-bold ${
                    redondeado > 0 ? 'text-[#6B8F5A]' : redondeado < 0 ? 'text-[#a8422e]' : 'text-cocoa/50'
                  }`}
                >
                  {redondeado === 0 ? t('alDia') : formatoMoneda.format(Math.abs(redondeado))}
                </p>
                {redondeado !== 0 && (
                  <p className="text-[0.65rem] font-medium uppercase tracking-wide text-cocoa/60">
                    {redondeado > 0 ? t('leDeben') : t('debe')}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Agregar gasto */}
        <form action={agregarGasto} className="space-y-3 rounded-lg border border-camel bg-khaki p-4">
          <h2 className="text-sm font-bold text-cocoa">{t('nuevoGasto')}</h2>
          <Input label={t('enQueSeGasto')} name="descripcion" placeholder={t('ejemploGasto')} maxLength={100} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('monto')} name="monto" type="number" min="0.01" step="0.01" placeholder="0.00" required />
            <Input label={t('fecha')} name="fecha" type="date" defaultValue={hoyISO} />
          </div>
          <Select label={t('quienPago')} name="pagado_por" defaultValue={usuario.id}>
            {miembros.map((m) => (
              <option key={m.usuario_id} value={m.usuario_id}>
                {nombreMiembro(m)}
              </option>
            ))}
          </Select>
          <SubmitButton className="w-full" pendingText={t('agregandoGasto')}>
            {t('agregarGastoBoton')}
          </SubmitButton>
        </form>

        {/* Registrar pago */}
        <form action={registrarPago} className="space-y-3 rounded-lg border border-camel bg-linen p-4">
          <h2 className="text-sm font-bold text-cocoa">{t('registrarUnPago')}</h2>
          <p className="text-xs text-cocoa/70">{t('descripcionPago')}</p>
          <div className="grid grid-cols-2 gap-3">
            <Select label={t('quienPago')} name="de_usuario_id" defaultValue={usuario.id}>
              {miembros.map((m) => (
                <option key={m.usuario_id} value={m.usuario_id}>
                  {nombreMiembro(m)}
                </option>
              ))}
            </Select>
            <Select label={t('aQuien')} name="a_usuario_id" defaultValue="" required>
              <option value="" disabled>
                {t('elígeAlguien')}
              </option>
              {miembros.map((m) => (
                <option key={m.usuario_id} value={m.usuario_id}>
                  {nombreMiembro(m)}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('monto')} name="monto" type="number" min="0.01" step="0.01" placeholder="0.00" required />
            <Input label={t('fecha')} name="fecha" type="date" defaultValue={hoyISO} />
          </div>
          <SubmitButton variant="secondary" className="w-full" pendingText={t('registrando')}>
            {t('registrarPagoBoton')}
          </SubmitButton>
        </form>

        {actividad.length === 0 ? (
          <div className="rounded-lg border border-dashed border-camel bg-khaki/50 p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-cocoa">{t('sinActividad')}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {actividad.map((item) =>
              item.tipo === 'gasto' ? (
                <li
                  key={`gasto-${item.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-camel bg-khaki px-4 py-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-cocoa">{item.gasto.descripcion}</p>
                    <p className="text-xs text-cocoa/70">
                      {t('pagoLabel', {
                        fecha: formatearFecha(item.gasto.fecha),
                        nombre: nombrePorId(miembros, item.gasto.pagado_por, t('alguien')),
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-bold text-cocoa">{formatoMoneda.format(item.gasto.monto)}</span>
                    <form action={eliminarGasto.bind(null, item.gasto.id)}>
                      <SubmitButton
                        variant="secondary"
                        className="min-h-0 px-2 py-1 text-xs"
                        pendingText="…"
                        confirmMessage={t('confirmarEliminarGasto', { descripcion: item.gasto.descripcion })}
                      >
                        {t('quitar')}
                      </SubmitButton>
                    </form>
                  </div>
                </li>
              ) : (
                <li
                  key={`pago-${item.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#6B8F5A]/40 bg-[#6B8F5A]/10 px-4 py-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-cocoa">
                      {t('pagoDe', {
                        de: nombrePorId(miembros, item.pago.de_usuario_id, t('alguien')),
                        a: nombrePorId(miembros, item.pago.a_usuario_id, t('alguien')),
                      })}
                    </p>
                    <p className="text-xs text-cocoa/70">{t('pagoEtiqueta', { fecha: formatearFecha(item.pago.fecha) })}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-bold text-[#6B8F5A]">{formatoMoneda.format(item.pago.monto)}</span>
                    <form action={eliminarPago.bind(null, item.pago.id)}>
                      <SubmitButton
                        variant="secondary"
                        className="min-h-0 px-2 py-1 text-xs"
                        pendingText="…"
                        confirmMessage={t('confirmarEliminarPago')}
                      >
                        {t('quitar')}
                      </SubmitButton>
                    </form>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </section>
    </main>
  );
}
