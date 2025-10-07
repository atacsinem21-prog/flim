/*
  Bu dosya, Cloudflare Pages Functions için bir "catch-all" (her şeyi yakala) sunucusudur.
  Express.js projesinin mantığını Cloudflare'in sunucusuz (serverless) ortamına uyarlar.
*/

// --- ANA İSTEK YÖNLENDİRİCİSİ (REQUEST HANDLER) ---

export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    if (pathname === '/') return await buildHomepage(env);
    if (pathname.startsWith('/movie/')) return await buildMovieDetailPage(pathname.split('/')[2], env);
    if (pathname.startsWith('/tv/')) return await buildTvDetailPage(pathname.split('/')[2], env);
    if (pathname === '/lists') return await buildListsPage(env);
    if (pathname === '/movies') return await buildMoviesPage(url.searchParams, env);
    if (pathname === '/yeni') return await buildNewPage(env);
    if (pathname === '/populer') return await buildPopularPage(env);
    if (pathname === '/guide') return await buildGuidePage(env);
    if (pathname === '/search') return await buildSearchPage(url.searchParams, env);
    
    // Eşleşen dinamik route yoksa, Cloudflare'in 'public' klasöründeki statik dosyayı sunmasına izin ver.
    return context.next();

  } catch (error) {
    console.error(`Hata oluştu (${pathname}):`, error);
    return new Response(`Sunucu Hatası: ${error.message}`, { status: 500 });
  }
}

// --- YARDIMCI FONKSİYONLAR ---

const API_BASE = 'https://api.themoviedb.org/3';

// Tüm sayfalarda ortak olan <head> bölümünü oluşturur.
function renderHead({ title = 'Movieway', description = 'Yasal izleme platformlarındaki filmleri ve dizileri keşfedin.', image = '/favicon.ico', url = '' } = {}) {
    return `
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#182531">
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="Movieway">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/style.css">
    <title>${title}</title>
  `;
}

// Tüm sayfalarda ortak olan <header> bölümünü oluşturur.
function renderHeader() {
    return `
    <header class="jw-header">
      <div class="jw-header-inner">
        <a class="jw-logo" href="/">
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;"><polygon points="8,8 32,19 8,30" fill="#ffe047"/><polygon points="32,8 32,30 8,19" fill="#ffe047"/></svg>
          Movieway
        </a>
        <nav class="jw-nav">
          <a href="/yeni">Yeni</a>
          <a href="/populer">Popüler</a>
          <a href="/movies">Filmler</a>
          <a href="/lists">Listeler</a>
        </nav>
        <button class="jw-login-btn">Oturum Aç</button>
      </div>
    </header>`;
}
// ... Diğer yardımcı fonksiyonlar (footer, script'ler vb.) buraya eklenebilir.


// --- SAYFA OLUŞTURMA FONKSİYONLARI ---

async function buildHomepage(env) {
    const TMDB_API_KEY = env.TMDB_API_KEY;
    // ... (Orijinal `app.get('/')` içindeki tüm veri çekme ve HTML oluşturma mantığı buraya gelecek)
    // ... `fetch` kullanarak API istekleri yapılacak ve `html` değişkeni doldurulacak.

    const html = `
    <!DOCTYPE html>
    <html lang="tr">
        <head>${renderHead({title: 'Movieway - Ana Sayfa'})}</head>
        <body>
            ${renderHeader()}
            <!-- Ana sayfa içeriği buraya gelecek -->
            <h1>Hoş Geldiniz!</h1>
        </body>
    </html>`;

    return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

async function buildMovieDetailPage(id, env) {
    const TMDB_API_KEY = env.TMDB_API_KEY;
    // ... (Orijinal `app.get('/movie/:id')` mantığı buraya gelecek)

    const html = `...`; // Film detay sayfası HTML'i
    return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

// Diğer tüm `build...Page` fonksiyonları buraya eklenecek.
// ... (buildListsPage, buildMoviesPage, buildNewPage, buildPopularPage, buildGuidePage, buildSearchPage, buildTvDetailPage) 