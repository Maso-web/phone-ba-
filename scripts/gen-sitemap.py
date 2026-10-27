#!/usr/bin/env python3
"""Generiše public/sitemap.xml iz KATALOGA (ne ručno).

Izvor istine:
  - src/data/phones.ts           → /telefon/<slug>
  - src/data/gadgets.ts          → /gadzet/<slug>  (RAW)
  - src/data/gadgetsOperators.ts → /gadzet/<slug>  (telekom ponude)
  - fiksne stranice: /, /telefoni, /servisi, /gadzeti, /vodic/*

`lastmod` se NE izmišlja: uzima se datum zadnjeg commita fajla koji tu
stranicu stvarno mijenja (`git log -1 --format=%cs -- <fajlovi>`), a ako
fajl ima necommitovane izmjene — današnji datum (stranica je stvarno
promijenjena danas).

Upotreba (iz korijena repozitorija):
    python3 scripts/gen-sitemap.py          # upiše public/sitemap.xml
    python3 scripts/gen-sitemap.py --dry    # samo ispiše
"""
from __future__ import annotations

import datetime
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://phone.ba"
DANAS = datetime.date.today().isoformat()


def slugovi(rel_path: str) -> list[str]:
    """Svi `slug: "..."` unosi iz data fajla (redom pojavljivanja)."""
    text = (ROOT / rel_path).read_text(encoding="utf-8")
    return re.findall(r'^\s{4}slug: "([a-z0-9-]+)"', text, re.M)


def lastmod(fajlovi: list[str]) -> str:
    """Datum zadnje promjene: današnji ako ima necommitovanih izmjena,
    inače datum zadnjeg commita fajla."""
    status = subprocess.run(
        ["git", "status", "--porcelain", "--", *fajlovi],
        cwd=ROOT, capture_output=True, text=True,
    ).stdout.strip()
    if status:
        return DANAS
    datumi = []
    for f in fajlovi:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", f],
            cwd=ROOT, capture_output=True, text=True,
        ).stdout.strip()
        if out:
            datumi.append(out)
    return max(datumi) if datumi else DANAS


def main() -> None:
    dry = "--dry" in sys.argv

    telefoni = slugovi("src/data/phones.ts")
    gadzeti = slugovi("src/data/gadgets.ts") + slugovi("src/data/gadgetsOperators.ts")
    # duplikati bi značili dupli URL u sitemapu — mora ostati jedinstveno
    gadzeti = list(dict.fromkeys(gadzeti))

    fajlovi_stranice = {
        "telefon": ["src/data/phones.ts", "src/routes/telefon/$slug.tsx",
                    "src/data/shop_prices.ts", "src/data/olx_prices.ts"],
        "gadzet": ["src/data/gadgets.ts", "src/data/gadgetsOperators.ts",
                   "src/routes/gadzet/$slug.tsx"],
    }

    urls: list[tuple[str, str, str, str]] = []  # (loc, lastmod, changefreq, priority)
    urls.append((f"{SITE}/", lastmod(["src/routes/index.tsx", "src/data/phones.ts"]), "daily", "1.0"))
    urls.append((f"{SITE}/telefoni", lastmod(["src/routes/telefoni.tsx", "src/data/phones.ts"]), "daily", "0.9"))
    urls.append((f"{SITE}/servisi", lastmod(["src/data/services.ts", "src/routes/servisi.tsx"]), "weekly", "0.7"))
    urls.append((f"{SITE}/gadzeti", lastmod(["src/data/gadgets.ts", "src/routes/gadzeti.tsx"]), "weekly", "0.7"))
    urls.append((
        f"{SITE}/vodic/najbolji-telefoni-2026",
        lastmod(["src/routes/vodic/najbolji-telefoni-2026.tsx", "src/data/shop_prices.ts"]),
        "weekly", "0.7",
    ))
    urls.append((
        f"{SITE}/vodic/budzet-telefoni",
        lastmod(["src/routes/vodic/budzet-telefoni.tsx", "src/data/shop_prices.ts"]),
        "weekly", "0.7",
    ))

    lm_telefon = lastmod(fajlovi_stranice["telefon"])
    for s in telefoni:
        urls.append((f"{SITE}/telefon/{s}", lm_telefon, "weekly", "0.8"))

    lm_gadzet = lastmod(fajlovi_stranice["gadzet"])
    for s in gadzeti:
        urls.append((f"{SITE}/gadzet/{s}", lm_gadzet, "weekly", "0.6"))

    linije = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for loc, lm, cf, pr in urls:
        linije.append(
            f"  <url><loc>{loc}</loc><lastmod>{lm}</lastmod>"
            f"<changefreq>{cf}</changefreq><priority>{pr}</priority></url>"
        )
    linije.append("</urlset>")
    xml = "\n".join(linije) + "\n"

    if dry:
        print(xml)
        return
    (ROOT / "public" / "sitemap.xml").write_text(xml, encoding="utf-8")
    print(f"public/sitemap.xml: {len(urls)} URL-ova "
          f"({len(telefoni)} telefona, {len(gadzeti)} gadžeta)")


if __name__ == "__main__":
    main()
