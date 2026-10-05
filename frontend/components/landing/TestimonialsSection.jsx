import { Quote, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      "Nous avons réduit notre temps de traitement des candidatures de 70%. L'outil est simple et nos RH l'ont adopté immédiatement.",
    author: 'Adjoavi K.',
    role: 'DRH, Orange Digital Center Bénin',
    initials: 'AK',
  },
  {
    quote:
      "Le système d'emails automatiques nous a sauvé un temps fou. Les candidats sont mieux informés et notre image de marque employeur s'est améliorée.",
    author: 'Moussa D.',
    role: 'Fondateur, TechHub Abidjan',
    initials: 'MD',
  },
  {
    quote:
      "Enfin un outil RH pensé pour l'Afrique. Simple, rapide, en français. Exactement ce dont on avait besoin.",
    author: 'Fatoumata B.',
    role: 'CEO, Dakar Startup Studio',
    initials: 'FB',
  },
];

/**
 * Social proof section with customer testimonials.
 */
export default function TestimonialsSection() {
  return (
    <section id="temoignages" className="bg-[#FAFAFA] px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[40px] font-bold tracking-[-0.02em] text-[#0E0E10] sm:text-[48px]">
            Ils nous font confiance
          </h2>
          <p className="mt-4 text-[17px] text-[#6B7280]">
            Des équipes RH satisfaites à travers l&apos;Afrique de l&apos;Ouest.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <article
              key={testimonial.author}
              className="flex flex-col rounded-[16px] border border-[#E5E5E5] bg-white p-8 shadow-sm transition duration-200 hover:shadow-lg"
            >
              {/* Stars */}
              <div className="mb-5 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} className="fill-[#FFD43B] text-[#FFD43B]" />
                ))}
              </div>

              {/* Quote icon */}
              <Quote size={24} className="mb-3 text-[#F2600C]" strokeWidth={1.5} />

              {/* Quote text */}
              <p className="flex-1 text-[15px] leading-relaxed text-[#374151]">
                {testimonial.quote}
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-[#F5F5F5] pt-5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F2600C] text-[14px] font-bold text-white">
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-[14px] font-bold text-[#0E0E10]">{testimonial.author}</p>
                  <p className="text-[13px] text-[#6B7280]">{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
