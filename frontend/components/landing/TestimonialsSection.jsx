const TESTIMONIALS = [
  {
    quote:
      'Nous avons réduit notre temps de traitement des candidatures de 70%. L\'outil est simple et nos RH l\'ont adopté immédiatement.',
    author: 'Adjoavi K., DRH, Orange Digital Center Bénin',
    initials: 'AK',
    color: 'from-teal-500 to-cyan-400',
  },
  {
    quote:
      'Le système d\'emails automatiques nous a sauvé un temps fou. Les candidats sont mieux informés et notre image de marque employeur s\'est améliorée.',
    author: 'Moussa D., Fondateur, TechHub Abidjan',
    initials: 'MD',
    color: 'from-slate-700 to-teal-600',
  },
  {
    quote:
      'Enfin un outil RH pensé pour l\'Afrique. Simple, rapide, en français. Exactement ce dont on avait besoin.',
    author: 'Fatoumata B., CEO, Dakar Startup Studio',
    initials: 'FB',
    color: 'from-cyan-500 to-teal-500',
  },
];
// FIX-CONTRAST: lisibilite corrigee

/**
 * Social proof section with customer testimonials.
 */
export default function TestimonialsSection() {
  return (
    <section id="temoignages" className="bg-slate-100 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-slate-900 sm:text-4xl">
            Ils nous font confiance
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <article key={testimonial.author} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-4xl font-black leading-none text-teal-200">“</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">{testimonial.quote}</p>

              <div className="mt-5 flex items-center gap-3">
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.color} text-sm font-bold text-white`}
                >
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-xs font-semibold text-amber-500">Note 5/5</p>
                  <p className="text-xs font-semibold text-slate-900 sm:text-sm">{testimonial.author}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
