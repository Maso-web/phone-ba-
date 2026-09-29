import { Link, createFileRoute } from "@tanstack/react-router";
import {
  GADGET_BRANDS,
  gadgets,
  minGadgetPrice,
  type GadgetCategory,
} from "~/data/gadgets";
import {
  GADGET_CATEGORIES,
  GADGET_CATEGORY_LABELS,
} from "~/lib/gadgetSpecs";
import { GadgetCard } from "~/components/GadgetCard";
import { GadgetIcon } from "~/components/GadgetVisual";
import { GadgetNote } from "~/components/GadgetNote";

/** Filter rubrike: `?kategorija=pametni_satovi` (nepoznato se ignorira) */
export interface GadzetiSearch {
  kategorija?: GadgetCategory;
}

export const Route = createFileRoute("/gadzeti")({
  validateSearch: (search: Record<string, unknown>): GadzetiSearch => {
    const k = search.kategorija;
    return GADGET_CATEGORIES.includes(k as GadgetCategory)
      ? { kategorija: k as GadgetCategory }
      : {};
  },
  head: () => ({
    meta: [
      { title: "Gadžeti — pametni satovi, slušalice i oprema | phone.ba" },
      {
        name: "description",
        content:
          "Pametni satovi, bežične slušalice, narukvice i power bankovi u BiH — uporedi stvarne cijene iz BH online shopova u KM.",
      },
    ],
  }),
  component: Gadzeti,
});

function Gadzeti() {
  const { kategorija } = Route.useSearch();

  const lista = gadgets
    .filter((g) => !kategorija || g.category === kategorija)
    .sort((a, b) => minGadgetPrice(a) - minGadgetPrice(b));

  const brojPoKategoriji = (k: GadgetCategory) =>
    gadgets.filter((g) => g.category === k).length;

  const stvarnePonude = gadgets.reduce(
    (sum, g) => sum + g.sellers.filter((s) => !s.demo).length,
    0,
  );

  return (
    <main className="container-site pb-16 pt-10 lg:pb-24 lg:pt-14">
      {/* Zaglavlje */}
      <div className="animate-fade-up">
        <p className="pill pill-green mb-3">Gadžeti</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Gadžeti i oprema
        </h1>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-slate-400">
          Pametni satovi, bežične slušalice, narukvice i power bankovi koji se
          stvarno prodaju u Bosni i Hercegovini — cijene u KM iz BH online
          shopova, s podacima provjerenim na izvoru.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="pill pill-green">
            {stvarnePonude} stvarnih ponuda
          </span>
          <span className="pill pill-blue">
            {gadgets.length} gadžeta u katalogu
          </span>
          <span className="pill pill-gray">
            {GADGET_BRANDS.length} brendova
          </span>
        </div>
        <GadgetNote className="mt-3 max-w-3xl" />
      </div>

      {/* Filteri po podkategoriji */}
      <div className="surface-card mt-7 p-4 sm:p-5">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter po podkategoriji"
        >
          <Link
            to="/gadzeti"
            search={{}}
            className="chip"
            aria-pressed={!kategorija}
          >
            Svi gadžeti ({gadgets.length})
          </Link>
          {GADGET_CATEGORIES.map((k) => (
            <Link
              key={k}
              to="/gadzeti"
              search={{ kategorija: k }}
              className="chip"
              aria-pressed={kategorija === k}
            >
              <GadgetIcon category={k} className="h-4 w-4" />
              {GADGET_CATEGORY_LABELS[k]} ({brojPoKategoriji(k)})
            </Link>
          ))}
        </div>
      </div>

      {/* Rezultati */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] text-slate-400">
          <strong className="font-bold text-white">{lista.length}</strong>{" "}
          {lista.length === 1 ? "gadžet" : "gadžeta"}
          {kategorija && (
            <>
              {" "}
              u kategoriji{" "}
              <strong className="font-semibold text-slate-300">
                {GADGET_CATEGORY_LABELS[kategorija]}
              </strong>
            </>
          )}
        </p>
        <p className="text-[12px] text-slate-600">
          Sortirano po najnižoj cijeni
        </p>
      </div>

      {lista.length === 0 ? (
        <div className="surface-card mt-5 px-6 py-16 text-center">
          <p className="text-4xl" aria-hidden>
            ⌚
          </p>
          <h2 className="mt-4 text-xl font-bold text-white">
            Nema gadžeta u ovoj kategoriji
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-slate-400">
            Katalog gadžeta se širi — pogledaj sve gadžete ili katalog telefona.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/gadzeti" search={{}} className="btn-primary btn-md">
              Svi gadžeti
            </Link>
            <Link to="/telefoni" className="btn-ghost btn-md">
              Telefoni
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lista.map((g) => (
            <GadgetCard key={g.slug} gadget={g} />
          ))}
        </div>
      )}

      {/* Cross-sell ka telefonima */}
      <section className="surface-card mt-10 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-[15.5px] font-bold text-white">
            Tražiš opremu uz novi telefon?
          </h2>
          <p className="mt-1 text-[13px] text-slate-400">
            Na svakoj stranici telefona prikazujemo gadžete koji se s njim
            najbolje slažu.
          </p>
        </div>
        <Link to="/telefoni" className="btn-primary btn-md">
          Pogledaj telefone
        </Link>
      </section>
    </main>
  );
}
