import { Link, createFileRoute } from "@tanstack/react-router";
import { vodici } from "~/data/vodic";
import {
  SITE_URL,
  VODIC_HUB_DESCRIPTION,
  VODIC_HUB_TITLE,
  breadcrumbLd,
} from "~/lib/seo";

/**
 * /vodic — hub stranica sa listom SVIH vodiča.
 * Lista se puni iz src/data/vodic.ts (jedini izvor istine), pa novi vodič
 * automatski završi i ovdje i u internim linkovima.
 */
export const Route = createFileRoute("/vodic/")({
  head: () => ({
    meta: [
      { title: VODIC_HUB_TITLE },
      { name: "description", content: VODIC_HUB_DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/vodic` },
      { property: "og:title", content: VODIC_HUB_TITLE },
      { property: "og:description", content: VODIC_HUB_DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/vodic` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbLd([{ name: "Početna", path: "/" }, { name: "Vodiči" }]),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: VODIC_HUB_TITLE,
          description: VODIC_HUB_DESCRIPTION,
          url: `${SITE_URL}/vodic`,
          inLanguage: "bs",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: vodici.map((v, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: v.naslov,
              url: `${SITE_URL}${v.path}`,
            })),
          },
        }),
      },
    ],
  }),
  component: VodicHub,
});

function VodicHub() {
  return (
    <main className="container-site pb-16 pt-10 lg:pb-24 lg:pt-14">
      {/* Breadcrumb */}
      <nav
        aria-label="Putanja"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-[12.5px] text-slate-500"
      >
        <Link to="/" className="transition-colors hover:text-white">
          Početna
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-slate-300">Vodiči</span>
      </nav>

      {/* Zaglavlje */}
      <div className="animate-fade-up">
        <p className="pill pill-green mb-3">Vodiči za kupovinu</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Vodiči
        </h1>
        <p className="mt-3 max-w-3xl text-[14.5px] leading-relaxed text-slate-400">
          Svi vodiči phone.ba na jednom mjestu.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="pill pill-blue">{vodici.length} vodiča</span>
          <span className="pill pill-green">Stvarne cijene u KM</span>
        </div>
      </div>

      {/* Lista vodiča */}
      <section className="mt-9">
        <h2 className="text-xl font-bold text-white">Svi vodiči</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {vodici.map((v) => (
            <Link
              key={v.slug}
              to={v.path}
              className="surface-card surface-card-hover flex flex-col p-5"
            >
              <span className="pill pill-gray w-fit">{v.tema}</span>
              <h3 className="mt-3 text-[16px] font-bold text-white">
                {v.naslov}
              </h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-400">
                {v.opis}
              </p>
              <span className="mt-4 text-[13px] font-semibold text-accent-400">
                Pročitaj vodič →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Cross-sell na katalog */}
      <section className="surface-card mt-10 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-[15.5px] font-bold text-white">
            Tražiš konkretan model?
          </h2>
          <p className="mt-1 text-[13px] text-slate-400">
            Pogledaj cijeli katalog telefona i uporedi ponude u KM.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/telefoni" className="btn-primary btn-md">
            Katalog telefona
          </Link>
        </div>
      </section>
    </main>
  );
}
