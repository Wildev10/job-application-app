import Link from 'next/link';

/**
 * Render the admin dashboard overview.
 */
export default function AdminPage() {
  return (
    <section className="space-y-6 rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-7">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737373]">Dashboard</p>
        <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-[#0f0f0f] sm:text-4xl">
          Pilotage du recrutement
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-[#525252] sm:text-base">
          Accedez rapidement aux candidatures, mettez a jour les statuts et personnalisez les
          informations de votre entreprise.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/candidatures"
          className="rounded-xl border border-[#e5e5e5] bg-[#fafaf9] p-5 transition hover:border-[#d4d4d4]"
        >
          <p className="text-sm font-semibold text-[#0f0f0f]">Candidatures</p>
          <p className="mt-2 text-sm text-[#525252]">
            Consultez la liste complete des profils, appliquez des filtres et modifiez les statuts.
          </p>
        </Link>

        <Link
          href="/admin/parametres"
          className="rounded-xl border border-[#e5e5e5] bg-[#fafaf9] p-5 transition hover:border-[#d4d4d4]"
        >
          <p className="text-sm font-semibold text-[#0f0f0f]">Parametres</p>
          <p className="mt-2 text-sm text-[#525252]">
            Modifiez les informations de votre entreprise et verifiez vos emails automatiques.
          </p>
        </Link>
      </div>
    </section>
  );
}
