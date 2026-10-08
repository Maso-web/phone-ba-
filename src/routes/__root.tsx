import { useState } from "react";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "~/styles/app.css?url";
import { ChatWidget } from "~/components/ChatWidget";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#05080d" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      {
        title:
          "phone.ba — AI poređenje cijena telefona u BiH",
      },
      {
        name: "description",
        content:
          "Usporedi cijene telefona u BiH na jednom mjestu — BH Telecom, HT Eronet, m:tel i lokalne trgovine. AI preporuke, cijene u KM, servisi i oprema.",
      },
      /* Open Graph — dijeljenje na Facebook, Viber, WhatsApp, Messenger */
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "phone.ba" },
      { property: "og:locale", content: "bs_BA" },
      { property: "og:title", content: "phone.ba — AI poređenje cijena telefona u BiH" },
      {
        property: "og:description",
        content:
          "Usporedi cijene telefona u BiH na jednom mjestu — BH Telecom, HT Eronet, m:tel i lokalne trgovine. AI preporuke, cijene u KM.",
      },
      { property: "og:image", content: "https://phone.ba/og-slika.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      /* Twitter cards */
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "phone.ba — AI poređenje cijena telefona u BiH" },
      {
        name: "twitter:description",
        content: "Usporedi cijene telefona u BiH na jednom mjestu — telekomi i lokalne trgovine, sve u KM.",
      },
      { name: "twitter:image", content: "https://phone.ba/og-slika.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: () => (
    <main className="container-site flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="pill pill-blue mb-4">404</p>
      <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
        Ova stranica ne postoji
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Izgleda da smo zalutali. Vrati se na početnu ili pogledaj katalog
        telefona.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary btn-md">
          Početna
        </Link>
        <Link to="/telefoni" className="btn-ghost btn-md">
          Svi telefoni
        </Link>
      </div>
    </main>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <SiteNav />
      <Outlet />
      <SiteFooter />
      <ChatWidget />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="bs">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-LN99B689HL"></script>
        <script>
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-LN99B689HL');`}
        </script>
        {/* Umami analitika — mjere se SAMO produkcijski hostovi (data-hostname) */}
        <script
          async
          defer
          data-website-id="c0a9e5fe-5414-4343-86c0-872fd73bf64c"
          data-hostname="phone.ba,www.phone.ba,phone-ba-maso-webs-projects.vercel.app,978e64f2bcc18c10d795dc4115634aba.ctonew.app"
          src="https://umami-phone-ba.vercel.app/tracker.js"
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/* ------------------------------------------------------------------ */
/* Navigacija                                                          */
/* ------------------------------------------------------------------ */

/**
 * Navigacioni link sa aktivnim stanjem (ovaj verzija routera nema NavLink
 * export, pa aktivno stanje čitamo iz router state-a).
 */
function NavItem({
  to,
  exact = false,
  children,
}: {
  to: "/" | "/telefoni" | "/gadzeti" | "/servisi";
  exact?: boolean;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = exact ? pathname === to : pathname.startsWith(to);
  return (
    <Link to={to} aria-current={active ? "page" : undefined} className="nav-link">
      {children}
    </Link>
  );
}

function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <div className="container-site flex h-16 items-center justify-between gap-3">
        <Link
          to="/"
          className="group flex items-center gap-2.5"
          aria-label="phone.ba — početna"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-[0_6px_18px_-6px_rgba(62,123,250,0.7)] transition-transform duration-200 group-hover:scale-105">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="#05080d"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4.5 w-4.5"
            >
              <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
              <path d="M11 18.5h2" />
            </svg>
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-white">
            phone<span className="text-accent-400">.ba</span>
          </span>
        </Link>

        <nav
          aria-label="Glavna navigacija"
          className="hidden items-center gap-1 md:flex"
        >
          <NavItem to="/" exact>
            Početna
          </NavItem>
          <NavItem to="/telefoni">Telefoni</NavItem>
          <NavItem to="/gadzeti">Gadžeti</NavItem>
          <NavItem to="/servisi">Servisi i Oprema</NavItem>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/telefoni" className="btn-primary btn-sm hidden sm:inline-flex">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            Pronađi telefon
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Zatvori meni" : "Otvori meni"}
            aria-expanded={menuOpen}
            aria-controls="mobilni-meni"
            onClick={() => setMenuOpen((v) => !v)}
            className="btn-ghost btn-sm !h-9 !w-9 !px-0 md:hidden"
          >
            {menuOpen ? (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                className="h-4 w-4"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                className="h-4 w-4"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobilni meni */}
      {menuOpen && (
        <nav
          id="mobilni-meni"
          aria-label="Mobilna navigacija"
          className="border-t border-white/[0.06] bg-ink-950/95 px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Početna
            </Link>
            <Link
              to="/telefoni"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Telefoni
            </Link>
            <Link
              to="/gadzeti"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Gadžeti
            </Link>
            <Link
              to="/servisi"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Servisi i Oprema
            </Link>
            <Link
              to="/telefoni"
              onClick={() => setMenuOpen(false)}
              className="btn-primary btn-md mt-2"
            >
              Pronađi telefon
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Podnožje                                                            */
/* ------------------------------------------------------------------ */

function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-ink-900/40">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        {/* Brend */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="#05080d"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4.5 w-4.5"
              >
                <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
                <path d="M11 18.5h2" />
              </svg>
            </span>
            <span className="text-[17px] font-extrabold tracking-tight text-white">
              phone<span className="text-accent-400">.ba</span>
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
            AI agregator cijena telefona i pametni pomoćnik za kupovinu u
            Bosni i Hercegovini. Usporedi, uštedi, kupi pametno.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="pill pill-green">Cijene u KM</span>
          </div>
        </div>

        {/* Telefoni */}
        <nav aria-label="Telefoni">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Telefoni
          </h3>
          <ul className="mt-3 space-y-2 text-[13.5px]">
            <li>
              <Link to="/telefoni" className="footer-link">
                Svi telefoni
              </Link>
            </li>
            <li>
              <Link
                to="/telefoni"
                search={{ funkcija: "najbolja_kamera" }}
                className="footer-link"
              >
                Najbolja kamera
              </Link>
            </li>
            <li>
              <Link
                to="/telefoni"
                search={{ funkcija: "najbolja_baterija" }}
                className="footer-link"
              >
                Najbolja baterija
              </Link>
            </li>
            <li>
              <Link
                to="/telefoni"
                search={{ funkcija: "najbolji_gaming" }}
                className="footer-link"
              >
                Najbolji gaming
              </Link>
            </li>
            <li>
              <Link
                to="/telefoni"
                search={{ budzet: "premium" }}
                className="footer-link"
              >
                Premium telefoni
              </Link>
            </li>
          </ul>
        </nav>

        {/* Gadžeti */}
        <nav aria-label="Gadžeti">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Gadžeti
          </h3>
          <ul className="mt-3 space-y-2 text-[13.5px]">
            <li>
              <Link to="/gadzeti" search={{}} className="footer-link">
                Svi gadžeti
              </Link>
            </li>
            <li>
              <Link
                to="/gadzeti"
                search={{ kategorija: "pametni_satovi" }}
                className="footer-link"
              >
                Pametni satovi
              </Link>
            </li>
            <li>
              <Link
                to="/gadzeti"
                search={{ kategorija: "bezbicne_slusalice" }}
                className="footer-link"
              >
                Bežične slušalice
              </Link>
            </li>
            <li>
              <Link
                to="/gadzeti"
                search={{ kategorija: "ostala_oprema" }}
                className="footer-link"
              >
                Ostala oprema
              </Link>
            </li>
          </ul>
        </nav>

        {/* Servisi */}
        <nav aria-label="Servisi i oprema">
          <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Servisi
          </h3>
          <ul className="mt-3 space-y-2 text-[13.5px]">
            <li>
              <Link to="/servisi" search={{}} className="footer-link">
                Servisi i oprema (imenik)
              </Link>
            </li>
            <li>
              <Link
                to="/servisi"
                search={{ grad: "sarajevo" }}
                className="footer-link"
              >
                Sarajevo
              </Link>
            </li>
            <li>
              <Link
                to="/servisi"
                search={{ grad: "banja_luka" }}
                className="footer-link"
              >
                Banja Luka
              </Link>
            </li>
            <li>
              <Link
                to="/servisi"
                search={{ grad: "mostar" }}
                className="footer-link"
              >
                Mostar
              </Link>
            </li>
            <li>
              <Link
                to="/servisi"
                search={{ grad: "tuzla" }}
                className="footer-link"
              >
                Tuzla
              </Link>
            </li>
            <li>
              <Link
                to="/servisi"
                search={{ grad: "zenica" }}
                className="footer-link"
              >
                Zenica
              </Link>
            </li>
          </ul>
        </nav>

        {/* O nama */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            O nama
          </h3>
          <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
            Uspoređujemo ponude BH Telecom, HT Eronet, m:tel i lokalnih
            trgovina kako bi kupovina telefona bila brza i transparentna.
          </p>
          <a
            href="mailto:hello@phone.ba"
            className="footer-link mt-3 inline-block"
          >
            hello@phone.ba
          </a>
        </div>
      </div>

      <div className="border-t border-white/[0.05]">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-[12px] text-slate-600 sm:flex-row">
          <p>© 2026 phone.ba — Sva prava zadržana.</p>
          <p>Developed in Bosnia and Herzegovina 🇧🇦</p>
        </div>
      </div>
    </footer>
  );
}