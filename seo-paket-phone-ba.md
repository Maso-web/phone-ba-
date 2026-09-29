# SE О ПАКЕТ ZA PHONE.BA — spreman za povezivanje domene

> **Stanje:** ovaj dokument je kompletan „SEO i meta paket" za phone.ba. Sadržaj je pripremljen tako da se ugradi čim domena phone.ba bude povezana sa sajtom. Ništa se ne mijenja na sajtu dok vlasnik ne odobri ugradnju.

---

## 1. TRENUTNO STANJE (provjereno na radnom sajtu)

| Element | Status | Napomena |
|---|---|---|
| `<title>` | ✅ postoji | "phone.ba — Pronađi idealan telefon i najbolju cijenu u BiH" |
| Meta description | ✅ postoji | OK, ali je prekratka da pokrije sve ključne pojmove |
| `lang="bs"` | ✅ postoji | Tačno za BiH tržište |
| Open Graph (og:*) | ❌ NEMA | Fali — dijeljenje na FB/Viber/WhatsApp bez slike |
| Twitter cards | ❌ NEMA | Fali |
| Canonical | ❌ NEMA | **Kritično** — bez njega Google sam bira URL (www/bez-www, domena/platforma) |
| robots meta | ❌ NEMA | Fali |
| JSON-LD strukturni podaci | ❌ NEMA | **Kritično** — glavni alat za bogate rezultate (rich snippets) |
| robots.txt | ❌ 404 | Fali na radnom okruženju |
| sitemap.xml | ❌ 404 | Fali |
| Favicon | ✅ postoji | PWA ikone postoje |
| SSR (server-side rendering) | ✅ | TanStack Start — Google vidi kompletan sadržaj, odlično |

---

## 2. GLOBALNI META OKVIR (za sve stranice)

Kada domena bude povezana, **svaka** stranica treba sljedeće u `<head>`:

```html
<!-- Osnovno -->
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<link rel="canonical" href="https://phone.ba/STRANICA" />

<!-- Open Graph (Facebook, Viber, WhatsApp, Messenger) -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="phone.ba" />
<meta property="og:locale" content="bs_BA" />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:url" content="https://phone.ba/STRANICA" />
<meta property="og:image" content="https://phone.ba/og-slika.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="https://phone.ba/og-slika.png" />
```

**Og slika (obavezna):** jedinstvena `og-slika.png` 1200×630 u bojama sajta (tamna + zlatna, logo phone.ba). Dijeljenje bez slike = 3× manje klikova.

---

## 3. TITLE + DESCRIPTION PO STRANICI (BS — bosanski jezik)

Smjernica: title ≤ 60 znakova, description 140–160 znakova, ključna riječ na početku.

### Početna (https://phone.ba/)
- **Title:** `phone.ba — AI poređenje cijena telefona u BiH`
  (trenutni: "Pronađi idealan telefon i najbolju cijenu u BiH" — dobar, ali bez "AI" i "poređenje cijena" koji su ključni za pretragu)
- **Description:** `Usporedi cijene telefona u BiH na jednom mjestu — BH Telecom, HT Eronet, m:tel i lokalne trgovine. AI preporuke, cijene u KM, servisi i oprema.`

### Katalog telefona (https://phone.ba/telefoni)
- **Title:** `Telefoni — cijene i poređenje u BiH | phone.ba`
- **Description:** `Svi modeli telefona sa cijenama u KM. Filtriranje po brendu, budžetu i funkciji (kamera, baterija, gaming). Najbolja cijena u BiH na jednom mjestu.`

### Stranica modela (https://phone.ba/telefon/[slug]) — dinamički, po modelu
- **Title:** `[Naziv modela] — cijena u BiH, ponude i specifikacije | phone.ba`
  Primjer: `iPhone 16 Pro — cijena u BiH, ponude i specifikacije | phone.ba`
- **Description:** `[Naziv modela] — uporedi cijene u KM kod BH Telecom, HT Eronet, m:tel i trgovina. Specifikacije, kamera, baterija i gdje je najjeftinije kupiti u BiH.`
- **Canonical:** `https://phone.ba/telefon/[slug]`

### Gadžeti (https://phone.ba/gadzeti)
- **Title:** `Gadžeti — pametni satovi, slušalice i oprema | phone.ba`
- **Description:** `Pametni satovi, bežične slušalice i ostala oprema sa cijenama u KM. Usporedi ponude i pronađi najbolju cijenu u BiH.`

### Servisi (https://phone.ba/servisi)
- **Title:** `Servisi i oprema — imenik u BiH | phone.ba`
- **Description:** `Imenik servisa i prodavnica pribora u Sarajevu, Banja Luci, Mostaru, Tuzli i Zenici. Adrese, kontakti i usluge na jednom mjestu.`

### 404 stranica
- **Title:** `Stranica nije pronađena | phone.ba`
- robots: `noindex` (404 ne smije biti indeksirana)

---

## 4. JSON-LD STRUKTURNI PODACI (ključno za rangiranje)

### 4a. WebSite + SearchAction (na početnoj — omogućava "sitlinks" i site search u Googleu)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "phone.ba",
  "alternateName": "AI agregator cijena telefona u BiH",
  "url": "https://phone.ba/",
  "inLanguage": "bs",
  "publisher": {
    "@type": "Organization",
    "name": "phone.ba",
    "url": "https://phone.ba/",
    "logo": { "@type": "ImageObject", "url": "https://phone.ba/logo-512.png" }
  }
}
```

### 4b. ItemList na katalogu telefona (omogućava Googleu da prikaže cijene direktno)

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Telefoni po cijenama u BiH",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "iPhone 16 Pro",
      "url": "https://phone.ba/telefon/iphone-16-pro"
    }
    // ... svi modeli, position 1-46
  ]
}
```

### 4c. Product + Offer + AggregateRating na stranici modela (najveći uticaj — cijena u KM u pretrazi)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "iPhone 16 Pro",
  "brand": { "@type": "Brand", "name": "Apple" },
  "image": "https://phone.ba/slike/iphone-16-pro.png",
  "description": "iPhone 16 Pro — specifikacije, cijene i ponude u BiH.",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "BAM",
    "lowPrice": "XXXX",           /* najniža cijena u KM iz kataloga */
    "highPrice": "XXXX",          /* najviša cijena u KM */
    "offerCount": "N",            /* broj ponuda */
    "availability": "https://schema.org/InStock",
    "url": "https://phone.ba/telefon/iphone-16-pro"
  }
}
```

> **Obavezno iskreno:** `lowPrice`/`highPrice` se generišu isključivo iz stvarnih cijena u bazi. Dok postoje samo demo cijene, JSON-LD se NE ugrađuje na model — ugradnja tek kad su stvarne (155 stvarnih ponuda već postoji za snapshot, ali vlasnik odlučuje kad)

### 4d. Organization (na početnoj)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "phone.ba",
  "url": "https://phone.ba/",
  "logo": "https://phone.ba/logo-512.png",
  "email": "hello@phone.ba",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "BA"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "hello@phone.ba",
    "contactType": "customer support",
    "availableLanguage": ["bs"]
  }
}
```

---

## 5. robots.txt (spreman za domenu phone.ba)

```txt
User-agent: *
Allow: /

Sitemap: https://phone.ba/sitemap.xml
```

Fajl se stavlja u `public/` — i platforma sa radnog i live okruženja mora servirati `/robots.txt`.

---

## 6. sitemap.xml (generisan — 46 modela + 6 statičkih stranica)

Struktura (fajl u `public/sitemap.xml`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://phone.ba/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://phone.ba/telefoni</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://phone.ba/gadzeti</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://phone.ba/servisi</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <!-- + 46 modela: -->
  <url><loc>https://phone.ba/telefon/[slug]</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <!-- + N gadgeta: -->
  <url><loc>https://phone.ba/gadzet/[slug]</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
</urlset>
```

---

## 7. KLJUČNE RIJEČI ZA RANGIRANJE (BiH tržište, bosanski jezik)

### Primarne (glavne stranice)
| Ključna riječ | Stranica |
|---|---|
| cijene telefona u BiH | početna, /telefoni |
| usporedba cijena telefona | početna |
| najbolji telefon 2026 | /telefoni |
| telefon po najboljoj cijeni | /telefoni |
| pametni satovi cijena | /gadzeti |
| servis telefona Sarajevo | /servisi |

### Sekundarne (po modelu — 46 modela)
`[Model] cijena BiH`, `[Model] KM`, `[Model] BH Telecom`, `[Model] gdje kupiti`, npr. `iPhone 16 Pro cijena BiH`, `Samsung Galaxy S25 cijena KM`, `Xiaomi Redmi Note 14 cijena u Bosni`

### Lokalne (servisi — po gradu)
`servis telefona [grad]`, `popravka telefona [grad]`, `oprema za telefone [grad]` za: Sarajevo, Banja Luka, Mostar, Tuzla, Zenica

---

## 8. KONTROLNA LISTA (šta se radi KADA se domena poveže)

1. **Canonical** na svaku stranicu → `https://phone.ba/...` (bez www — jedan standard)
2. **Meta title + description** po stranici (iz sekcije 3)
3. **Open Graph + Twitter** tagovi (sekcija 2)
4. **og-slika.png** 1200×630 (napraviti u bojama sajta)
5. **JSON-LD**: WebSite (početna) + ItemList (telefoni) + Product (modeli, tek kad su stvarne cijene) + Organization
6. **robots.txt** + **sitemap.xml** u `public/`
7. **Google Search Console** — potvrda domene, predaja sitemap-a
8. **Bing Webmaster** — ista stvar (Bing pokreće i ChatGPT pretragu)
9. Provjera na **validator.schema.org** i **search.google.com/test/rich-results**
10. Nakon 2 sedmice: provjera indeksacije `site:phone.ba` + Search Console izvještaj

---

## 9. ŠTA JE PREOSTALO DA SE OD LUČI (odluke vlasnika)

1. **Da li ide www ili bez www** — preporuka: bez www (`https://phone.ba`)
2. **Da li se JSON-LD Product ugrađuje odmah sa demo cijenama ili tek sa stvarnim** — preporuka: tek sa stvarnim (iskrenost prema Googleu)
3. **Jezik:** samo `bs` (bosanski) za sada — bez hreflang do dodavanja drugih jezika
4. **Da li da se napravi og-slika** 1200×630 u stilu sajta (1 slika)

---

*Pripremljeno: 26.09.2026. — ništa nije ugrađeno u sajt bez odobrenja vlasnika.*