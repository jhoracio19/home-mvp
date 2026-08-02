import Link from 'next/link';
import { getCasaActivaOrRedirect, getMiembrosCasaActiva, getUsuarioActual } from '@/lib/casas/data';
import { nombreMiembro } from '@/lib/casas/nombre-miembro';
import { getGastos } from '@/lib/gastos/data';
import { calcularBalances } from '@/lib/gastos/balance';
import { agregarGasto, eliminarGasto } from './actions';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { EscuchaRealtime } from '@/components/realtime/EscuchaRealtime';

const formatoMoneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const formatoFecha = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' });

// parseFechaLocal-style: evita que 'YYYY-MM-DD' se corra un día por
// interpretarse como UTC (mismo motivo que en lib/urgencia.ts).
function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return formatoFecha.format(new Date(anio, mes - 1, dia));
}

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [casa, gastos, miembros, usuario, { error }] = await Promise.all([
    getCasaActivaOrRedirect(),
    getGastos(),
    getMiembrosCasaActiva(),
    getUsuarioActual(),
    searchParams,
  ]);

  const balances = calcularBalances(gastos, miembros.map((m) => m.usuario_id));
  const hoyISO = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date());

  return (
    <main className="flex flex-1 justify-center bg-[radial-gradient(circle_at_top_left,_rgba(178,150,125,0.3),_transparent_34%)] bg-linen px-4 py-8">
      <EscuchaRealtime tabla="gastos" casaId={casa.id} />
      <section className="w-full max-w-2xl space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa hover:underline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{casa.nombre}</p>
          <h1 className="mt-1 text-2xl font-bold text-cocoa">Gastos compartidos</h1>
          <p className="mt-1 text-sm text-cocoa/70">
            Cada gasto se reparte en partes iguales entre los {miembros.length} miembros de la casa.
          </p>
        </div>

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
                  {redondeado === 0 ? 'Al día' : formatoMoneda.format(Math.abs(redondeado))}
                </p>
                {redondeado !== 0 && (
                  <p className="text-[0.65rem] font-medium uppercase tracking-wide text-cocoa/60">
                    {redondeado > 0 ? 'le deben' : 'debe'}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Agregar gasto */}
        <form action={agregarGasto} className="space-y-3 rounded-lg border border-camel bg-khaki p-4">
          <Input label="¿En qué se gastó?" name="descripcion" placeholder="Ej. Renta, luz, súper…" maxLength={100} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Monto" name="monto" type="number" min="0.01" step="0.01" placeholder="0.00" required />
            <Input label="Fecha" name="fecha" type="date" defaultValue={hoyISO} />
          </div>
          <Select label="¿Quién pagó?" name="pagado_por" defaultValue={usuario.id}>
            {miembros.map((m) => (
              <option key={m.usuario_id} value={m.usuario_id}>
                {nombreMiembro(m)}
              </option>
            ))}
          </Select>
          <SubmitButton className="w-full" pendingText="Agregando…">
            + Agregar gasto
          </SubmitButton>
        </form>

        {gastos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-camel bg-khaki/50 p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-cocoa">Aún no hay gastos registrados.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {gastos.map((gasto) => (
              <li
                key={gasto.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-camel bg-khaki px-4 py-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-cocoa">{gasto.descripcion}</p>
                  <p className="text-xs text-cocoa/70">
                    {formatearFecha(gasto.fecha)} · Pagó {nombreMiembro(miembros.find((m) => m.usuario_id === gasto.pagado_por) ?? { email: '', nombre: null, apellido: null })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-bold text-cocoa">{formatoMoneda.format(gasto.monto)}</span>
                  <form action={eliminarGasto.bind(null, gasto.id)}>
                    <SubmitButton
                      variant="secondary"
                      className="min-h-0 px-2 py-1 text-xs"
                      pendingText="…"
                      confirmMessage={`¿Eliminar el gasto "${gasto.descripcion}"?`}
                    >
                      Quitar
                    </SubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
