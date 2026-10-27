import { Link } from "@tanstack/react-router";
import type { Phone } from "~/data/phones";
import { relatedPhones } from "~/lib/seo";
import { PhoneCard } from "./PhoneCard";

/**
 * "Slični modeli" — interni linkovi sa stranice modela ka 4–6 relevantnih
 * modela (isti brend / isti cjenovni razred) i ka vodičima za kupovinu.
 * Sve izvedeno iz kataloga; koristi postojeće kartice, bez novog dizajna.
 */
export function RelatedModels({ phone }: { phone: Phone }) {
  const slicni = relatedPhones(phone, 6);
  if (slicni.length === 0) return null;

  return (
    <section aria-labelledby="slicni-naslov" className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="slicni-naslov" className="text-lg font-bold text-white">
            Slični modeli
          </h2>
          <p className="mt-1 text-[12.5px] text-slate-500">
            Isti brend ili sličan cjenovni razred — uporedi prije kupovine.
          </p>
        </div>
        <Link to="/telefoni" search={{}} className="btn-ghost btn-sm">
          Cijeli katalog
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slicni.map((p) => (
          <PhoneCard key={p.slug} phone={p} />
        ))}
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-slate-400">
        <span className="text-slate-500">Vodiči za kupovinu:</span>
        <Link
          to="/vodic/budzet-telefoni"
          className="text-brand-300 transition-colors hover:text-white"
        >
          Najbolji telefon do 400 KM
        </Link>
        <span aria-hidden className="text-slate-600">
          ·
        </span>
        <Link
          to="/vodic/najbolji-telefoni-2026"
          className="text-brand-300 transition-colors hover:text-white"
        >
          Najbolji telefoni 2026
        </Link>
      </p>
    </section>
  );
}
