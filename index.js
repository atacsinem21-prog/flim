const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = 3000;

// JSON parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TMDB_API_KEY = 'dd77ab03a0de7a1e5500b8a64fc886de';

// --- SPORLAR ENTEGRASYONU SABİTLERİ ---
const THESPORTSDB_API_KEY = '123'; // TheSportsDB ücretsiz API anahtarınız
const SUPER_LIG_ID = '4406'; // Turkish Super Lig ID

// Statik dosyalar için public klasörü
app.use(express.static('public'));

// Admin ayarları yönetimi
const SETTINGS_FILE = path.join(__dirname, 'admin-settings.json');

// Ayarları oku
async function getSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ayarlar okunamadı:', error);
    return null;
  }
}

// Ayarları kaydet
async function saveSettings(settings) {
  try {
    settings.advanced.lastUpdated = new Date().toISOString();
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Ayarlar kaydedilemedi:', error);
    return false;
  }
}

// Admin API Routes
app.get('/api/admin/settings', async (req, res) => {
  const settings = await getSettings();
  if (settings) {
    res.json(settings);
  } else {
    res.status(500).json({ error: 'Ayarlar okunamadı' });
  }
});

app.post('/api/admin/settings', async (req, res) => {
  const newSettings = req.body;
  const success = await saveSettings(newSettings);
  if (success) {
    res.json({ success: true, message: 'Ayarlar kaydedildi' });
  } else {
    res.status(500).json({ error: 'Ayarlar kaydedilemedi' });
  }
});

app.post('/api/admin/settings/:section', async (req, res) => {
  const section = req.params.section;
  const sectionData = req.body;
  
  try {
    const settings = await getSettings();
    if (!settings) {
      return res.status(500).json({ error: 'Ayarlar okunamadı' });
    }
    
    settings[section] = { ...settings[section], ...sectionData };
    const success = await saveSettings(settings);
    
    if (success) {
      res.json({ success: true, message: `${section} ayarları kaydedildi` });
    } else {
      res.status(500).json({ error: 'Ayarlar kaydedilemedi' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Modern head template fonksiyonu
function renderHead({ title = 'Movieway', description = 'Yasal izleme platformlarındaki filmleri kolayca keşfedin. Popüler, yeni çıkan ve en iyi filmleri Movieway ile bulun!', image = '/favicon.ico', url = 'https://movieway.com' } = {}) {
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

// Ana sayfa
app.get('/', async (req, res) => {
  try {
    // Admin ayarlarını oku
    const settings = await getSettings();
    
    // Ayarlardan değerleri al
    const siteTitle = settings?.site?.title || 'Movieway';
    const siteDescription = settings?.site?.description || 'Yasal izleme platformlarındaki filmleri kolayca keşfedin.';
    const announcementEnabled = settings?.announcement?.enabled || false;
    const announcementText = settings?.announcement?.text || '';
    const moviesPerSection = settings?.homepage?.moviesPerSection || 6;
    
    // Reklam ayarları
    const topBannerEnabled = settings?.ads?.topBanner?.enabled || false;
    const topBannerCode = settings?.ads?.topBanner?.code || '';
    const topBannerHeight = settings?.ads?.topBanner?.height || '90px';
    const topBannerBg = settings?.ads?.topBanner?.backgroundColor || '#f0f0f0';
    const topBannerRadius = settings?.ads?.topBanner?.borderRadius || '8px';
    
    const bottomBannerEnabled = settings?.ads?.bottomBanner?.enabled || false;
    const bottomBannerCode = settings?.ads?.bottomBanner?.code || '';
    const bottomBannerHeight = settings?.ads?.bottomBanner?.height || '120px';
    const bottomBannerBg = settings?.ads?.bottomBanner?.backgroundColor || '#f0f0f0';
    const bottomBannerRadius = settings?.ads?.bottomBanner?.borderRadius || '8px';
    
    // Debug için console log
    console.log('Reklam Ayarları:', {
      topBannerEnabled,
      bottomBannerEnabled,
      settings: settings?.ads
    });
    const [popularMoviesRes, popularTVRes, airingTodayTVRes, nowPlayingMoviesRes, onTheAirTVRes, topRatedMoviesRes, topRatedTVRes] = await Promise.all([
      axios.get('https://api.themoviedb.org/3/movie/popular', { params: { api_key: TMDB_API_KEY, language: 'tr-TR', page: 1 } }),
      axios.get('https://api.themoviedb.org/3/tv/popular', { params: { api_key: TMDB_API_KEY, language: 'tr-TR', page: 1 } }),
      axios.get('https://api.themoviedb.org/3/tv/airing_today', { params: { api_key: TMDB_API_KEY, language: 'tr-TR', page: 1 } }),
      axios.get('https://api.themoviedb.org/3/movie/now_playing', { params: { api_key: TMDB_API_KEY, language: 'tr-TR', page: 1 } }),
      axios.get('https://api.themoviedb.org/3/tv/on_the_air', { params: { api_key: TMDB_API_KEY, language: 'tr-TR', page: 1 } }),
      axios.get('https://api.themoviedb.org/3/movie/top_rated', { params: { api_key: TMDB_API_KEY, language: 'tr-TR', page: 1 } }),
      axios.get('https://api.themoviedb.org/3/tv/top_rated', { params: { api_key: TMDB_API_KEY, language: 'tr-TR', page: 1 } })
    ]);
    const popularMovies = popularMoviesRes.data.results;
    const popularTV = popularTVRes.data.results;
    const airingTodayTV = airingTodayTVRes.data.results;
    const nowPlayingMovies = nowPlayingMoviesRes.data.results;
    const onTheAirTV = onTheAirTVRes.data.results;
    const topRatedMovies = topRatedMoviesRes.data.results;
    const topRatedTV = topRatedTVRes.data.results;

    // En yüksek IMDB puanlı filmi bul (ör: Esaretin Bedeli)
    const highestRatedMovie = topRatedMovies.reduce((max, movie) => (movie.vote_average > (max.vote_average || 0) ? movie : max), {});
    const heroBgUrl = highestRatedMovie && highestRatedMovie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${highestRatedMovie.backdrop_path}`
      : 'https://image.tmdb.org/t/p/original/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg';

    // Sporlar için yaklaşan maçları çek
    let upcomingMatches = [];
    try {
      const sportsRes = await axios.get(`https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_API_KEY}/eventsnextleague.php?id=${SUPER_LIG_ID}`);
      upcomingMatches = sportsRes.data.events || [];
    } catch (e) {
      upcomingMatches = [];
    }

    // Son Fragmanlar için veri çek
    let trailers = [];
    try {
      const upcomingMoviesRes = await axios.get('https://api.themoviedb.org/3/movie/upcoming', { params: { api_key: TMDB_API_KEY, language: 'tr-TR', page: 1 } });
      const moviesForTrailers = upcomingMoviesRes.data.results.slice(0, 10);
      const trailerPromises = moviesForTrailers.map(movie =>
        axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/videos`, { params: { api_key: TMDB_API_KEY, language: 'tr-TR' } })
      );
      const videoResponses = await Promise.all(trailerPromises);

      videoResponses.forEach((response, index) => {
        const movie = moviesForTrailers[index];
        // Find the official trailer, fallback to any trailer, then any video
        const officialTrailer = response.data.results.find(video => video.type === 'Trailer' && video.official && video.site === 'YouTube') || response.data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube') || response.data.results.find(video => video.site === 'YouTube');
        if (officialTrailer) {
          trailers.push({
            movieId: movie.id,
            movieTitle: movie.title,
            posterPath: movie.backdrop_path || movie.poster_path,
            trailerKey: officialTrailer.key,
            trailerName: officialTrailer.name,
          });
        }
      });
    } catch (e) {
      console.error("Error fetching trailers:", e);
      trailers = [];
    }

    res.send(`
      <html lang="tr">
        <head>
          ${renderHead({
            title: 'Movieway - Yasal İzleme Platformları Film Rehberi',
            description: 'Popüler, yeni çıkan ve en iyi filmleri Movieway ile keşfedin. Hangi film hangi platformda hemen öğrenin!',
            image: '/favicon.ico',
            url: 'https://movieway.com/'
          })}
        </head>
        <body style="background: url('${heroBgUrl}') center center/cover no-repeat fixed; background-color: #0a0a0a;">
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
          </header>
          ${announcementEnabled ? `
          <div class="announcement-bar" style="background: #ffe047; color: #333; padding: 12px 24px; text-align: center; font-weight: 600; margin-bottom: 24px;">
            ${announcementText}
          </div>
          ` : ''}
          <section class="jw-hero">
            <h1 class="jw-hero-title">Filmler, TV dizileri ve spor için akış rehberiniz</h1>
            <div class="jw-hero-desc">Yeni, popüler ve gelecek eğlence içeriklerini nerede izleyeceğinizi Movieway ile keşfedin.</div>
          </section>
          <div class="jw-platform-logos">
            <div class="jw-platform-logo-item"><img src="/netflix.avif" alt="Netflix" title="Netflix" /></div>
            <div class="jw-platform-logo-item"><img src="/disneyplus.avif" alt="Disney+" title="Disney+" /></div>
            <div class="jw-platform-logo-item"><img src="/amazonprimevideo.avif" alt="Amazon Prime" title="Amazon Prime" /></div>
            <div class="jw-platform-logo-item"><img src="/hbo-max-logo-1.svg" alt="HBO Max" title="HBO Max" style="background:#23252b;border-radius:12px;padding:4px;object-fit:contain;" /></div>
            <div class="jw-platform-logo-item"><img src="/apple-tv-plus-logo.svg" alt="Apple TV+" title="Apple TV+" style="background:#23252b;border-radius:12px;padding:4px;object-fit:contain;" /></div>
            <div class="jw-platform-logo-item"><img src="/hulu.svg" alt="Hulu" title="Hulu" style="background:#23252b;border-radius:12px;padding:4px;object-fit:contain;" /></div>
            <div class="jw-platform-logo-item"><img src="/paramount-3.svg" alt="Paramount+" title="Paramount+" style="background:#23252b;border-radius:12px;padding:4px;object-fit:contain;" /></div>
            <div class="jw-platform-logo-item"><img src="/peacock-1.svg" alt="Peacock" title="Peacock" style="background:#23252b;border-radius:12px;padding:4px;object-fit:contain;" /></div>
          </div>
          <!-- Tanıtım başlığı ve açıklaması kutusu -->
          <section style="width:100%;display:flex;flex-direction:column;align-items:center;margin:32px 0 0 0;">
            <h2 style="color:#00aaff;font-size:2.2em;font-weight:900;margin-bottom:0;">Filmler, diziler ve platformlar için akış rehberiniz</h2>
            <div style="color:#bdbdbd;font-size:1.13em;margin-top:8px;">Tüm yasal izleme platformlarındaki filmleri tek bir yerde keşfedin. Popüler, yeni çıkan ve en iyi filmler burada!</div>
          </section>
          <!-- Öne Çıkanlar (En yüksek IMDB'li film kutusu) -->
          <section class="jw-section" style="margin-top: 32px;">
            <div class="jw-movie-detail-info">
              <img src="https://image.tmdb.org/t/p/w500${highestRatedMovie.poster_path}" alt="${highestRatedMovie.title}" style="border-radius: 12px; box-shadow: 0 2px 12px #0007; width: 180px; height: 260px; object-fit: cover;" />
              <div class="jw-movie-detail-content">
                <h2 style="font-size:2em;font-weight:900;margin-bottom:8px;">${highestRatedMovie.title}</h2>
                <div style="color:#ffe047;font-weight:700;font-size:1.1em;margin-bottom:8px;"><img src='/imdb.png' alt='IMDB' title='IMDB' style='height:22px;width:auto;vertical-align:middle;margin-right:6px;border-radius:4px;background:#fff;padding:1.5px 4px;box-shadow:0 1px 4px #0002;' />${highestRatedMovie.vote_average ? highestRatedMovie.vote_average.toFixed(1) : '-'} (${highestRatedMovie.vote_count} oy)</div>
                <div style="color:#fff;font-size:1.08em;margin-bottom:18px;">${highestRatedMovie.overview || ''}</div>
                <a href="/movie/${highestRatedMovie.id}" class="detail-btn">Daha Fazla Bilgi</a>
              </div>
            </div>
          </section>
          <!-- Son Fragmanlar Section -->
          <section class="jw-section">
            <h2 style="font-size:1.4em;font-weight:700;color:#fff;margin:0; margin-bottom: 24px;">Son Fragmanlar</h2>
            <div class="jw-tabs">
                <button class="jw-tab-item active">Popüler</button>
                <button class="jw-tab-item">Yayında</button>
                <button class="jw-tab-item">Televizyonda</button>
                <button class="jw-tab-item">Sinemalarda</button>
            </div>
            <div class="jw-carousel-wrapper">
              <button class="jw-carousel-arrow left" data-target="trailers-row">&#8592;</button>
              <div class="jw-movie-row" id="trailers-row">
                ${trailers.map(trailer => `
                  <a href="https://www.youtube.com/watch?v=${trailer.trailerKey}" target="_blank" class="jw-trailer-card">
                    <div class="jw-trailer-poster-wrap">
                      <img src="https://image.tmdb.org/t/p/w500${trailer.posterPath}" alt="${trailer.trailerName}" onerror="this.style.display='none'" />
                      <div class="jw-play-icon-overlay">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 37.85V10.15C16 8.23 18.24 7.27 19.71 8.74L35.43 22.59C36.63 23.79 36.63 25.71 35.43 26.91L19.71 40.76C18.24 42.23 16 41.27 16 39.35V37.85Z" fill="white"/></svg>
                      </div>
                    </div>
                    <div class="jw-trailer-title">${trailer.movieTitle}</div>
                    <div class="jw-trailer-subtitle">${trailer.trailerName}</div>
                  </a>
                `).join('')}
              </div>
              <button class="jw-carousel-arrow right" data-target="trailers-row">&#8594;</button>
            </div>
          </section>
          <section class="jw-section">
            <div class="jw-section-title">Popüler Filmler <a href="/movies" style="font-size:0.7em;color:#ffe047;margin-left:12px;text-decoration:underline;">Tümünü Gör</a></div>
            <div class="jw-carousel-wrapper">
              <button class="jw-carousel-arrow left" data-target="popular-row">&#8592;</button>
              <div class="jw-movie-row" id="popular-row">
                ${popularMovies.slice(0,moviesPerSection).map((movie, i) => `
                  <div class="jw-movie-card" tabindex="0" onclick="window.location='/movie/${movie.id}'">
                    <span class="jw-movie-num">${i+1}</span>
                    <div class="jw-movie-poster-wrap"><img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" /></div>
                    <div class="jw-movie-title">${movie.title}</div>
                    <div class="jw-movie-year">${movie.release_date ? movie.release_date.substring(0, 4) : ''}</div>
                  </div>
                `).join('')}
              </div>
              <button class="jw-carousel-arrow right" data-target="popular-row">&#8594;</button>
            </div>
          </section>
          <section class="jw-section jw-section-split">
            <div class="jw-section-left">
              <div class="jw-section-title">Yeni Filmler</div>
              <div class="jw-section-desc">Akış hizmetlerinde yayına giren tüm yeni filmlere göz atın.</div>
              <a class="jw-section-link" href="/movies">Tüm yeni filmleri gör</a>
            </div>
            <div class="jw-section-right">
              <div class="jw-carousel-wrapper">
                <button class="jw-carousel-arrow left" data-target="new-movies-row">&#8592;</button>
                <div class="jw-movie-row" id="new-movies-row">
                  ${nowPlayingMovies.slice(0,8).map(movie => `
                    <div class="jw-movie-card" tabindex="0" onclick="window.location='/movie/${movie.id}'">
                      <div class="jw-movie-poster-wrap"><img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" /></div>
                      <div class="jw-movie-rating" style="color:#ffe047;font-weight:700;margin:4px 0 0 0;"><img src='/imdb.png' alt='IMDB' title='IMDB' style='height:22px;width:auto;vertical-align:middle;margin-right:6px;border-radius:4px;background:#fff;padding:1.5px 4px;box-shadow:0 1px 4px #0002;' />${movie.vote_average ? movie.vote_average.toFixed(1) : '-'}</div>
                      <div class="jw-movie-title">${movie.title}</div>
                    </div>
                  `).join('')}
                </div>
                <button class="jw-carousel-arrow right" data-target="new-movies-row">&#8594;</button>
              </div>
            </div>
          </section>
          <section class="jw-section jw-section-split">
            <div class="jw-section-left">
              <div class="jw-section-title">Haftanın En İyi Filmleri</div>
              <div class="jw-section-desc">Bu hafta en çok izlenen ve beğenilen filmleri keşfedin.</div>
              <a class="jw-section-link" href="/movies">Tümünü gör</a>
            </div>
            <div class="jw-section-right">
              <div class="jw-carousel-wrapper">
                <button class="jw-carousel-arrow left" data-target="top-movies-row">&#8592;</button>
                <div class="jw-movie-row" id="top-movies-row">
                  ${topRatedMovies.slice(0,8).map(movie => `
                    <div class="jw-movie-card" tabindex="0" onclick="window.location='/movie/${movie.id}'">
                      <div class="jw-movie-poster-wrap"><img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" /></div>
                      <div class="jw-movie-rating" style="color:#ffe047;font-weight:700;margin:4px 0 0 0;"><img src='/imdb.png' alt='IMDB' title='IMDB' style='height:22px;width:auto;vertical-align:middle;margin-right:6px;border-radius:4px;background:#fff;padding:1.5px 4px;box-shadow:0 1px 4px #0002;' />${movie.vote_average ? movie.vote_average.toFixed(1) : '-'}</div>
                      <div class="jw-movie-title">${movie.title}</div>
                    </div>
                  `).join('')}
                </div>
                <button class="jw-carousel-arrow right" data-target="top-movies-row">&#8594;</button>
              </div>
            </div>
          </section>
          <section class="jw-section jw-section-split">
            <div class="jw-section-left">
              <div class="jw-section-title">Haftanın En İyi Dizileri</div>
              <div class="jw-section-desc">En popüler ve yeni çıkan dizileri burada bulabilirsiniz.</div>
              <a class="jw-section-link" href="/movies">Tüm dizileri gör</a>
            </div>
            <div class="jw-section-right">
              <div class="jw-carousel-wrapper">
                <button class="jw-carousel-arrow left" data-target="top-series-row">&#8592;</button>
                <div class="jw-movie-row" id="top-series-row">
                  ${onTheAirTV.slice(0,8).map(tv => `
                    <div class="jw-movie-card" tabindex="0" onclick="window.location='/tv/${tv.id}'">
                      <div class="jw-movie-poster-wrap"><img src="https://image.tmdb.org/t/p/w300${tv.poster_path}" alt="${tv.name}" /></div>
                      <div class="jw-movie-rating" style="color:#ffe047;font-weight:700;margin:4px 0 0 0;"><img src='/imdb.png' alt='IMDB' title='IMDB' style='height:22px;width:auto;vertical-align:middle;margin-right:6px;border-radius:4px;background:#fff;padding:1.5px 4px;box-shadow:0 1px 4px #0002;' />${tv.vote_average ? tv.vote_average.toFixed(1) : '-'}</div>
                      <div class="jw-movie-title">${tv.name}</div>
                    </div>
                  `).join('')}
                </div>
                <button class="jw-carousel-arrow right" data-target="top-series-row">&#8594;</button>
              </div>
            </div>
          </section>
          
          <!-- ALT BANNER REKLAM ALANI -->
          <div class="bottom-banner-ad" style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 16px; margin-top: 48px; background: #4ecdc4; border-radius: 8px;">
            <div style="background: ${bottomBannerBg}; height: ${bottomBannerHeight}; border-radius: ${bottomBannerRadius}; display: flex; align-items: center; justify-content: center; border: 2px solid #00ff00;">
              ${bottomBannerCode ? `<div style="width: 100%; height: 100%;">${bottomBannerCode}</div>` : 
                '<div style="color: #333; font-size: 16px; font-weight: bold;">🎯 ALT BANNER REKLAM ALANI<br><small style="font-size: 12px;">Admin panelinden reklam kodunuzu ekleyin</small></div>'}
            </div>
          </div>
          
          <main>
            <footer class="jw-footer">
              <div class="jw-footer-grid">
                <div class="jw-footer-section">
                  <div class="jw-footer-title">Ülkeler</div>
                  <div class="jw-footer-links">
                    <a href="#" class="jw-footer-link">Türkiye</a>
                    <a href="#" class="jw-footer-link">ABD</a>
                    <a href="#" class="jw-footer-link">İngiltere</a>
                    <a href="#" class="jw-footer-link">Almanya</a>
                    <a href="#" class="jw-footer-link">Fransa</a>
                    <a href="#" class="jw-footer-link">İspanya</a>
                    <a href="#" class="jw-footer-link">İtalya</a>
                    <a href="#" class="jw-footer-link">Kanada</a>
                    <a href="#" class="jw-footer-link">Avustralya</a>
                    <a href="#" class="jw-footer-link">Japonya</a>
                  </div>
                </div>
                <div class="jw-footer-section">
                  <div class="jw-footer-title">Platformlar</div>
                  <div class="jw-footer-links">
                    <a href="#" class="jw-footer-link">Netflix</a>
                    <a href="#" class="jw-footer-link">Disney+</a>
                    <a href="#" class="jw-footer-link">Amazon Prime</a>
                    <a href="#" class="jw-footer-link">HBO Max</a>
                    <a href="#" class="jw-footer-link">Apple TV+</a>
                    <a href="#" class="jw-footer-link">Hulu</a>
                    <a href="#" class="jw-footer-link">Paramount+</a>
                    <a href="#" class="jw-footer-link">Peacock</a>
                  </div>
                </div>
                <div class="jw-footer-section">
                  <div class="jw-footer-title">Kategoriler</div>
                  <div class="jw-footer-links">
                    <a href="#" class="jw-footer-link">Filmler</a>
                    <a href="#" class="jw-footer-link">Diziler</a>
                    <a href="#" class="jw-footer-link">Belgeseller</a>
                    <a href="#" class="jw-footer-link">Spor</a>
                    <a href="#" class="jw-footer-link">Çocuk</a>
                    <a href="#" class="jw-footer-link">Aksiyon</a>
                    <a href="#" class="jw-footer-link">Komedi</a>
                    <a href="#" class="jw-footer-link">Drama</a>
                  </div>
                </div>
                <div class="jw-footer-section">
                  <div class="jw-footer-title">Şirket</div>
                  <div class="jw-footer-links">
                    <a href="#" class="jw-footer-link">Hakkımızda</a>
                    <a href="#" class="jw-footer-link">Kariyer</a>
                    <a href="#" class="jw-footer-link">Basın</a>
                    <a href="#" class="jw-footer-link">İletişim</a>
                    <a href="#" class="jw-footer-link">Yardım</a>
                    <a href="#" class="jw-footer-link">Gizlilik</a>
                    <a href="#" class="jw-footer-link">Kullanım Şartları</a>
                    <a href="#" class="jw-footer-link">Çerezler</a>
                  </div>
                </div>
              </div>
              <div class="jw-footer-bottom">
                <div class="jw-footer-copyright">© 2024 Movieway. Tüm hakları saklıdır.</div>
                <div class="jw-footer-social">
                  <a href="#" class="jw-social-link">📘</a>
                  <a href="#" class="jw-social-link">🐦</a>
                  <a href="#" class="jw-social-link">📷</a>
                  <a href="#" class="jw-social-link">📺</a>
                </div>
              </div>
            </footer>
            <div class="jw-cookie-bar">
              <div class="jw-cookie-text">Bu web sitesi deneyiminizi geliştirmek için çerezleri kullanır. Sitemizi kullanmaya devam ederek çerez kullanımımızı kabul etmiş olursunuz.</div>
              <div class="jw-cookie-buttons">
                <button class="jw-cookie-btn accept">Kabul Et</button>
                <button class="jw-cookie-btn decline">Reddet</button>
              </div>
            </div>
            <script>
              // Favoriler localStorage
              function getFavs() {
                try { return JSON.parse(localStorage.getItem('movieway_favs') || '[]'); } catch { return []; }
              }
              function setFavs(favs) {
                localStorage.setItem('movieway_favs', JSON.stringify(favs));
              }
              function updateFavBtns() {
                const favs = getFavs();
                document.querySelectorAll('.favorite-btn').forEach(btn => {
                  const id = btn.getAttribute('data-movie-id');
                  if (favs.includes(id)) btn.classList.add('favorited');
                  else btn.classList.remove('favorited');
                });
              }
              document.addEventListener('DOMContentLoaded', function() {
                updateFavBtns();
                document.querySelectorAll('.favorite-btn').forEach(btn => {
                  btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const id = btn.getAttribute('data-movie-id');
                    let favs = getFavs();
                    if (favs.includes(id)) favs = favs.filter(f => f !== id);
                    else favs.push(id);
                    setFavs(favs);
                    updateFavBtns();
                  });
                });
              });
            </script>
            <script>
// Carousel ok butonları için vanilla JS
(function(){
  function scrollRow(rowId, dir) {
    var row = document.getElementById(rowId);
    if (!row) return;
    var card = row.querySelector('.jw-movie-card, .jw-trailer-card');
    var scrollAmount = card ? card.offsetWidth + 28 : 220;
    row.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
  }
  document.querySelectorAll('.jw-carousel-arrow').forEach(function(btn){
    btn.addEventListener('click', function(){
      var target = btn.getAttribute('data-target');
      scrollRow(target, btn.classList.contains('left') ? -1 : 1);
    });
  });
})();
</script>
          </main>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.send('Bir hata oluştu.');
  }
});

// Arama sayfası
app.get('/search', async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.send('Lütfen bir arama sorgusu girin.');
  }

  try {
    // 1. Film araması
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie`,
      {
        params: {
          api_key: TMDB_API_KEY,
          query: query,
          language: 'tr-TR'
        }
      }
    );

    const results = response.data.results;
    if (results.length === 0) {
      return res.send(`
        <html lang="tr">
          <head>
            ${renderHead({
              title: `Arama Sonucu - Movieway`,
              description: 'Aradığınız film bulunamadı.',
              image: '/favicon.ico',
              url: 'https://movieway.com/search'
            })}
          </head>
          <body>
            <div class="hero-bg" style="background-image:url('https://image.tmdb.org/t/p/original/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg');"></div>
            <header class="main-header">
              <div class="header-content">
                <div class="site-title">
                  <span class="site-title-logo">
                    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="19" cy="19" r="19" fill="#00aaff" fill-opacity="0.13"/>
                      <polygon points="13,10 28,19 13,28" fill="#00aaff"/>
                    </svg>
                  </span>
                  <a class="site-title-text" href="/">Movieway</a>
                </div>
                <nav class="main-nav">
                  <a href="/">Ana Sayfa</a>
                </nav>
                <form class="header-search" action="/search" method="get">
                  <input type="text" name="query" placeholder="Arama..." required />
                  <button type="submit">Ara</button>
                </form>
              </div>
            </header>
            <main>
              <section class="hero">
                <h1 class="hero-title">Sonuç bulunamadı</h1>
                <p class="hero-desc">Aradığınız film bulunamadı. Lütfen başka bir isim deneyin.</p>
              </section>
            </main>
          </body>
        </html>
      `);
    }

    // İlk sonucu al
    const movie = results[0];

    // 2. İzleme sağlayıcılarını çek
    const providersRes = await axios.get(
      `https://api.themoviedb.org/3/movie/${movie.id}/watch/providers`,
      {
        params: {
          api_key: TMDB_API_KEY
        }
      }
    );

    // Türkiye için sağlayıcılar (ülke kodu: TR)
    const providers = providersRes.data.results.TR;
    const heroBgUrl = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : 'https://image.tmdb.org/t/p/original/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg';

    res.send(`
      <html lang="tr">
        <head>
          ${renderHead({
            title: `${movie.title} - Movieway`,
            description: movie.overview || 'Film detayları ve izleme platformları Movieway\'de.',
            image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/favicon.ico',
            url: `https://movieway.com/movie/${movie.id}`
          })}
        </head>
        <body>
          <div class="hero-bg" style="background-image:url('${heroBgUrl}');"></div>
          <header class="main-header">
            <div class="header-content">
              <div class="site-title">
                <span class="site-title-logo">
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="19" cy="19" r="19" fill="#00aaff" fill-opacity="0.13"/>
                    <polygon points="13,10 28,19 13,28" fill="#00aaff"/>
                  </svg>
                </span>
                <a class="site-title-text" href="/">Movieway</a>
              </div>
              <nav class="main-nav">
                <a href="/">Ana Sayfa</a>
              </nav>
              <form class="header-search" action="/search" method="get">
                <input type="text" name="query" placeholder="Arama..." required />
                <button type="submit">Ara</button>
              </form>
            </div>
          </header>
          <main>
            <section class="hero" style="min-height: 40vh;">
              <h1 class="hero-title">${movie.title} (${movie.release_date ? movie.release_date.substring(0, 4) : 'Yıl yok'})</h1>
              <p class="hero-desc">${movie.overview || ''}</p>
            </section>
            <section style="display:flex;justify-content:center;align-items:flex-start;margin-top:-60px;z-index:2;position:relative;">
              <div style="background:#23252bcc;border-radius:18px;box-shadow:0 2px 24px #000a;padding:32px 38px 32px 28px;display:flex;gap:38px;align-items:flex-start;max-width:900px;width:100%;">
                <div style="min-width:180px;">
                  <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" style="width:180px;height:270px;object-fit:cover;border-radius:12px;box-shadow:0 2px 16px #0008;" />
                </div>
                <div style="flex:1;">
                  <div style="font-size:1.15em;color:#ffe047;font-weight:bold;margin-bottom:8px;"><img src='/imdb.png' alt='IMDB' title='IMDB' style='height:22px;width:auto;vertical-align:middle;margin-right:6px;border-radius:4px;background:#fff;padding:1.5px 4px;box-shadow:0 1px 4px #0002;' />${movie.vote_average ? movie.vote_average.toFixed(1) : '-'}</div>
                  <div style="margin-bottom:18px;">
                <b>Yasal izleme platformları:</b><br>
                    <div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:8px;">
                      ${providers && providers.flatrate
                    ? providers.flatrate.map(provider =>
                            `<div style="background:#181a20cc;padding:8px 14px;border-radius:10px;display:flex;align-items:center;gap:8px;box-shadow:0 2px 8px #0005;">
                              <img src="https://image.tmdb.org/t/p/w45${provider.logo_path}" alt="${provider.provider_name}" title="${provider.provider_name}" style="height:32px;width:auto;border-radius:6px;" />
                              <span style="color:#fff;">${provider.provider_name}</span>
                        </div>`
                      ).join('')
                        : '<span style="color:#bdbdbd;">Bilgi bulunamadı.</span>'
                }
              </div>
                  </div>
                  <a class="detail-btn" href="/movie/${movie.id}" style="margin-top:18px;">Detay</a>
            </div>
          </div>
            </section>
          </main>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.send('Bir hata oluştu.');
  }
});

// Film detay sayfası
app.get('/movie/:id', async (req, res) => {
  const movieId = req.params.id;
  const [movieRes, creditsRes, videosRes, keywordsRes, externalIdsRes] = await Promise.all([
    axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, { params: { api_key: TMDB_API_KEY, language: 'tr-TR' } }),
    axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, { params: { api_key: TMDB_API_KEY, language: 'tr-TR' } }),
    axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, { params: { api_key: TMDB_API_KEY, language: 'tr-TR' } }),
    axios.get(`https://api.themoviedb.org/3/movie/${movieId}/keywords`, { params: { api_key: TMDB_API_KEY } }),
    axios.get(`https://api.themoviedb.org/3/movie/${movieId}/external_ids`, { params: { api_key: TMDB_API_KEY } })
  ]);
    const movie = movieRes.data;
  const credits = creditsRes.data;
  const videos = videosRes.data.results;
  const keywords = keywordsRes.data.keywords;
  const external = externalIdsRes.data;
  const bgUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'https://image.tmdb.org/t/p/original/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg';
  const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer');
  const genres = movie.genres ? movie.genres.map(g => g.name).join(', ') : '';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime/60)} sa ${movie.runtime%60} dk` : '';
  const director = credits.crew.find(c => c.job === 'Director');
  const writer = credits.crew.find(c => c.job === 'Writer' || c.job === 'Screenplay');
  const cast = credits.cast.slice(0, 8);
    res.send(`
    <html lang="tr">
        <head>
        ${renderHead({
          title: `${movie.title} - Movieway`,
          description: movie.overview || 'Film detayları ve izleme platformları Movieway\'de.',
          image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/favicon.ico',
          url: `https://movieway.com/movie/${movie.id}`
        })}
        </head>
      <body style="background: url('${bgUrl}') center center/cover no-repeat fixed; background-color: #0a0a0a;">
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
        </header>
        <main style="max-width:1200px;margin:0 auto;padding:48px 24px 32px 24px;">
          <div style="display:flex;gap:38px;align-items:flex-start;">
            <div style="min-width:220px;">
              <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" style="width:220px;height:330px;object-fit:cover;border-radius:14px;box-shadow:0 2px 16px #0008;" />
            </div>
            <div style="flex:1;">
              <h1 style="font-size:2.2em;font-weight:900;color:#fff;margin-bottom:8px;">${movie.title} <span style="font-size:0.7em;font-weight:400;color:#ffe047;">(${movie.release_date ? movie.release_date.substring(0,4) : ''})</span></h1>
              <div style="color:#ffe047;font-weight:700;font-size:1.1em;margin-bottom:8px;">${genres} ${runtime ? '• ' + runtime : ''}</div>
              <div style="color:#ffe047;font-weight:700;font-size:1.1em;margin-bottom:8px;"><img src='/imdb.png' alt='IMDB' title='IMDB' style='height:22px;width:auto;vertical-align:middle;margin-right:6px;border-radius:4px;background:#fff;padding:1.5px 4px;box-shadow:0 1px 4px #0002;' />${movie.vote_average ? movie.vote_average.toFixed(1) : '-'}</div>
              <div style="color:#bdbdbd;font-size:1.08em;margin-bottom:18px;">${movie.overview || ''}</div>
              <div style="margin-bottom:12px;">
                <b>Yönetmen:</b> ${director ? director.name : '-'}<br>
                <b>Yazar:</b> ${writer ? writer.name : '-'}
              </div>
              <div style="margin-bottom:18px;">
                <b>Bütçe:</b> ${movie.budget ? '$'+movie.budget.toLocaleString() : '-'}<br>
                <b>Hasılat:</b> ${movie.revenue ? '$'+movie.revenue.toLocaleString() : '-'}
              </div>
              <div style="margin-bottom:18px;">
                <b>Anahtar Kelimeler:</b> ${keywords && keywords.length ? keywords.map(k=>`<span style='display:inline-block;background:#23252b;color:#ffe047;padding:3px 10px;border-radius:8px;font-size:0.97em;margin:2px;'>${k.name}</span>`).join('') : '-'}
              </div>
              <div style="margin-bottom:18px;">
                <b>Sosyal Medya:</b>
                ${external.imdb_id ? `<a href="https://www.imdb.com/title/${external.imdb_id}" target="_blank" style="color:#ffe047;margin-right:10px;">IMDb</a>` : ''}
                ${external.facebook_id ? `<a href="https://facebook.com/${external.facebook_id}" target="_blank" style="color:#ffe047;margin-right:10px;">Facebook</a>` : ''}
                ${external.instagram_id ? `<a href="https://instagram.com/${external.instagram_id}" target="_blank" style="color:#ffe047;margin-right:10px;">Instagram</a>` : ''}
                ${external.twitter_id ? `<a href="https://twitter.com/${external.twitter_id}" target="_blank" style="color:#ffe047;margin-right:10px;">Twitter</a>` : ''}
              </div>
              ${trailer ? `<div style="margin-bottom:18px;"><iframe width="420" height="236" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen style="border-radius:12px;"></iframe></div>` : ''}
            </div>
          </div>
          <div style="margin-top:38px;">
            <h2 style="font-size:1.3em;font-weight:900;color:#fff;margin-bottom:12px;">Öne Çıkan Oyuncular</h2>
            <div style="display:flex;gap:18px;overflow-x:auto;padding-bottom:8px;">
              ${cast.map(actor => `
                <div style="min-width:120px;text-align:center;">
                  <img src="https://image.tmdb.org/t/p/w185${actor.profile_path}" alt="${actor.name}" style="width:100px;height:100px;object-fit:cover;border-radius:50%;box-shadow:0 2px 8px #0007;" />
                  <div style="color:#fff;font-weight:700;margin-top:6px;">${actor.name}</div>
                  <div style="color:#ffe047;font-size:0.97em;">${actor.character || ''}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </main>
      </body>
    </html>
  `);
});

// Listeler sayfası
app.get('/lists', (req, res) => {
  const lists = [
    { title: '21. Yüzyılın En İyi 15 Filmi', count: 15, img: 'https://image.tmdb.org/t/p/w500/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg' },
    { title: 'Marvel Sinematik Evreni: Birinci Evre Filmleri', count: 6, img: 'https://image.tmdb.org/t/p/w500/6Wdl9N6dL0Hi0T1qJLWSz6gMLbd.jpg' },
    { title: '2025 Emmy Adayları', count: 70, img: 'https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg' },
    { title: 'Netflix Yapımı En İyi 10 Animasyon', count: 10, img: 'https://image.tmdb.org/t/p/w500/2CAL2433ZeIihfX1Hb2139CX0pW.jpg' },
    { title: 'The Devil Wears Prada Oyuncularının Yer Aldığı Diğer Yapımlar', count: 72, img: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg' },
    { title: 'Charlie\'s Angels Serisindeki Tüm Yapımlar', count: 5, img: 'https://image.tmdb.org/t/p/w500/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg' },
    { title: 'Poltergeist Serisindeki Yapımlar', count: 5, img: 'https://image.tmdb.org/t/p/w500/6DrHO1jr3qVrViUO6s6kFiAGM7.jpg' },
    { title: 'Tüm Jackass Filmleri', count: 9, img: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg' },
    { title: '2025\'te 10 Yaşına Girecek Gişe Rekortmeni 10 Film', count: 10, img: 'https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg' },
    { title: 'Nicholas Hoult\'un En İyi Performansları', count: 10, img: 'https://image.tmdb.org/t/p/w500/6Wdl9N6dL0Hi0T1qJLWSz6gMLbd.jpg' }
  ];
  res.send(`
    <html lang="tr">
      <head>
        ${renderHead({
          title: 'Listeler - Movieway',
          description: 'Herkese açık film ve dizi listeleri. En iyi listeleri keşfedin!',
          image: '/favicon.ico',
          url: 'https://movieway.com/lists'
        })}
      </head>
      <body style="background:#0a0a0a;">
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
        </header>
        <main style="max-width:1200px;margin:100px auto 0 auto;padding:0 24px;">
          <h1 style="font-size:2em;font-weight:900;color:#ffe047;margin-bottom:32px;">Herkese Açık Listeler</h1>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:28px;">
            ${lists.map(list => `
              <div style="background:#181a20;border-radius:18px;box-shadow:0 2px 16px #0006;overflow:hidden;display:flex;flex-direction:column;min-height:180px;">
                <div style="height:120px;background:#23252b;overflow:hidden;">
                  <img src="${list.img}" alt="${list.title}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.7);" />
                </div>
                <div style="padding:18px 18px 12px 18px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                  <div style="font-size:1.13em;font-weight:700;color:#fff;margin-bottom:8px;">${list.title}</div>
                  <div style="color:#ffe047;font-size:1em;font-weight:600;">${list.count} ESER</div>
                </div>
              </div>
            `).join('')}
          </div>
        </main>
      </body>
    </html>
  `);
});

// /movies sayfası: Kategori filtreli film grid
app.get('/movies', async (req, res) => {
  const type = req.query.type === 'tv' ? 'tv' : 'movie';
  const movieGenres = [
    { id: 12, name: 'Macera' },
    { id: 28, name: 'Aksiyon' },
    { id: 35, name: 'Komedi' },
    { id: 18, name: 'Dram' },
    { id: 878, name: 'Bilim Kurgu' },
    { id: 16, name: 'Animasyon' },
    { id: 27, name: 'Korku' },
    { id: 10749, name: 'Romantik' },
    { id: 99, name: 'Belgesel' }
  ];
  const tvGenres = [
    { id: 10759, name: 'Aksiyon & Macera' },
    { id: 16, name: 'Animasyon' },
    { id: 35, name: 'Komedi' },
    { id: 80, name: 'Suç' },
    { id: 99, name: 'Belgesel' },
    { id: 18, name: 'Dram' },
    { id: 10751, name: 'Aile' },
    { id: 10762, name: 'Çocuk' },
    { id: 9648, name: 'Gizem' },
    { id: 10763, name: 'Haber' },
    { id: 10764, name: 'Reality' },
    { id: 10765, name: 'Bilim Kurgu & Fantastik' },
    { id: 10766, name: 'Pembe Dizi' },
    { id: 10767, name: 'Talk Show' },
    { id: 10768, name: 'Savaş & Politik' },
    { id: 37, name: 'Western' }
  ];
  const genres = type === 'tv' ? tvGenres : movieGenres;
  const selected = parseInt(req.query.genre) || null;
  const page = parseInt(req.query.page) || 1;
  let url;
  if (type === 'tv') {
    url = selected
      ? `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=tr-TR&with_genres=${selected}&page=${page}`
      : `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=tr-TR&page=${page}`;
  } else {
    url = selected
      ? `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=tr-TR&with_genres=${selected}&page=${page}`
      : `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=tr-TR&page=${page}`;
  }
  const itemsRes = await axios.get(url);
  const items = itemsRes.data.results;
  res.send(`
    <html lang="tr">
      <head>
        ${renderHead({
          title: type === 'tv' ? 'Tüm Diziler - Movieway' : 'Tüm Filmler - Movieway',
          description: type === 'tv' ? 'Tüm popüler dizileri türlere göre filtreleyerek keşfedin!' : 'Tüm popüler filmleri türlere göre filtreleyerek keşfedin!',
          image: '/favicon.ico',
          url: type === 'tv' ? 'https://movieway.com/movies?type=tv' : 'https://movieway.com/movies'
        })}
      </head>
      <body style="background:#0a0a0a;">
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
        </header>
        <main style="max-width:1200px;margin:100px auto 0 auto;padding:0 24px;">
          <h1 style="font-size:2em;font-weight:900;color:#ffe047;margin-bottom:24px;">${type === 'tv' ? 'Tüm Diziler' : 'Tüm Filmler'}</h1>
          <div style="display:flex;gap:18px;margin-bottom:32px;flex-wrap:wrap;">
            <a href="/movies" style="padding:8px 18px;border-radius:18px;font-weight:700;color:${type==='movie'&&!selected ? '#181a20' : '#ffe047'};background:${type==='movie'&&!selected ? '#ffe047' : 'transparent'};text-decoration:none;transition:all 0.15s;">Filmler</a>
            <a href="/movies?type=tv" style="padding:8px 18px;border-radius:18px;font-weight:700;color:${type==='tv'&&!selected ? '#181a20' : '#ffe047'};background:${type==='tv'&&!selected ? '#ffe047' : 'transparent'};text-decoration:none;transition:all 0.15s;">Diziler</a>
            ${genres.map(g => `<a href="/movies?type=${type}&genre=${g.id}" style="padding:8px 18px;border-radius:18px;font-weight:700;color:${selected===g.id ? '#181a20' : '#ffe047'};background:${selected===g.id ? '#ffe047' : 'transparent'};text-decoration:none;transition:all 0.15s;">${g.name}</a>`).join('')}
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:28px;">
            ${items.map(item => `
              <div style="background:#181a20;border-radius:18px;box-shadow:0 2px 16px #0006;overflow:hidden;display:flex;flex-direction:column;min-height:180px;cursor:pointer;transition:transform 0.16s;" onclick="window.location='/${type === 'tv' ? 'tv' : 'movie'}/${item.id}'">
                <div style="height:270px;background:#23252b;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                  <img src="https://image.tmdb.org/t/p/w300${item.poster_path}" alt="${type === 'tv' ? item.name : item.title}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.92);" />
                </div>
                <div style="padding:14px 14px 10px 14px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                  <div style="font-size:1.13em;font-weight:700;color:#fff;margin-bottom:8px;">${type === 'tv' ? item.name : item.title}</div>
                  <div style="color:#ffe047;font-size:1em;font-weight:600;">${type === 'tv' ? (item.first_air_date ? item.first_air_date.substring(0, 4) : '') : (item.release_date ? item.release_date.substring(0, 4) : '')}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </main>
        </body>
      </html>
    `);
});

// --- HEADER ROUTES ---

// YENİ: En yeni filmler ve diziler
app.get('/yeni', async (req, res) => {
  const [nowPlayingMoviesRes, airingTodayTVRes] = await Promise.all([
    axios.get('https://api.themoviedb.org/3/movie/now_playing', { params: { api_key: TMDB_API_KEY, language: 'tr-TR', page: 1 } }),
    axios.get('https://api.themoviedb.org/3/tv/airing_today', { params: { api_key: TMDB_API_KEY, language: 'tr-TR', page: 1 } })
  ]);
  const nowPlayingMovies = nowPlayingMoviesRes.data.results;
  const airingTodayTV = airingTodayTVRes.data.results;
  res.send(`
    <html lang="tr">
      <head>
        ${renderHead({
          title: 'Yeni Çıkanlar - Movieway',
          description: 'En yeni filmler ve diziler burada!',
          image: '/favicon.ico',
          url: 'https://movieway.com/yeni'
        })}
      </head>
      <body style="background:#0a0a0a;">
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
        </header>
        <main style="max-width:1200px;margin:100px auto 0 auto;padding:0 24px;">
          <h1 style="font-size:2em;font-weight:900;color:#ffe047;margin-bottom:24px;">Yeni Çıkan Filmler</h1>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:28px;margin-bottom:48px;">
            ${nowPlayingMovies.map(movie => `
              <div style="background:#181a20;border-radius:18px;box-shadow:0 2px 16px #0006;overflow:hidden;display:flex;flex-direction:column;min-height:180px;cursor:pointer;transition:transform 0.16s;" onclick="window.location='/movie/${movie.id}'">
                <div style="height:270px;background:#23252b;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                  <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.92);" />
                </div>
                <div style="padding:14px 14px 10px 14px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                  <div style="font-size:1.13em;font-weight:700;color:#fff;margin-bottom:8px;">${movie.title}</div>
                  <div style="color:#ffe047;font-size:1em;font-weight:600;">${movie.release_date ? movie.release_date.substring(0, 4) : ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <h1 style="font-size:2em;font-weight:900;color:#ffe047;margin-bottom:24px;">Yeni Çıkan Diziler</h1>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:28px;">
            ${airingTodayTV.map(tv => `
              <div style="background:#181a20;border-radius:18px;box-shadow:0 2px 16px #0006;overflow:hidden;display:flex;flex-direction:column;min-height:180px;cursor:pointer;transition:transform 0.16s;" onclick="window.location='/tv/${tv.id}'">
                <div style="height:270px;background:#23252b;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                  <img src="https://image.tmdb.org/t/p/w300${tv.poster_path}" alt="${tv.name}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.92);" />
                </div>
                <div style="padding:14px 14px 10px 14px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                  <div style="font-size:1.13em;font-weight:700;color:#fff;margin-bottom:8px;">${tv.name}</div>
                  <div style="color:#ffe047;font-size:1em;font-weight:600;">${tv.first_air_date ? tv.first_air_date.substring(0, 4) : ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </main>
      </body>
    </html>
  `);
});

// POPÜLER: Popüler filmler ve diziler
app.get('/populer', async (req, res) => {
  const [popularMoviesRes, popularTVRes] = await Promise.all([
    axios.get('https://api.themoviedb.org/3/movie/popular', { params: { api_key: TMDB_API_KEY, language: 'tr-TR', page: 1 } }),
    axios.get('https://api.themoviedb.org/3/tv/popular', { params: { api_key: TMDB_API_KEY, language: 'tr-TR', page: 1 } })
  ]);
  const popularMovies = popularMoviesRes.data.results;
  const popularTV = popularTVRes.data.results;
  res.send(`
    <html lang="tr">
      <head>
        ${renderHead({
          title: 'Popüler - Movieway',
          description: 'En popüler filmler ve diziler burada!',
          image: '/favicon.ico',
          url: 'https://movieway.com/populer'
        })}
      </head>
      <body style="background:#0a0a0a;">
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
        </header>
        <main style="max-width:1200px;margin:100px auto 0 auto;padding:0 24px;">
          <h1 style="font-size:2em;font-weight:900;color:#ffe047;margin-bottom:24px;">Popüler Filmler</h1>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:28px;margin-bottom:48px;">
            ${popularMovies.map(movie => `
              <div style="background:#181a20;border-radius:18px;box-shadow:0 2px 16px #0006;overflow:hidden;display:flex;flex-direction:column;min-height:180px;cursor:pointer;transition:transform 0.16s;" onclick="window.location='/movie/${movie.id}'">
                <div style="height:270px;background:#23252b;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                  <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.92);" />
                </div>
                <div style="padding:14px 14px 10px 14px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                  <div style="font-size:1.13em;font-weight:700;color:#fff;margin-bottom:8px;">${movie.title}</div>
                  <div style="color:#ffe047;font-size:1em;font-weight:600;">${movie.release_date ? movie.release_date.substring(0, 4) : ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <h1 style="font-size:2em;font-weight:900;color:#ffe047;margin-bottom:24px;">Popüler Diziler</h1>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:28px;">
            ${popularTV.map(tv => `
              <div style="background:#181a20;border-radius:18px;box-shadow:0 2px 16px #0006;overflow:hidden;display:flex;flex-direction:column;min-height:180px;cursor:pointer;transition:transform 0.16s;" onclick="window.location='/tv/${tv.id}'">
                <div style="height:270px;background:#23252b;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                  <img src="https://image.tmdb.org/t/p/w300${tv.poster_path}" alt="${tv.name}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.92);" />
                </div>
                <div style="padding:14px 14px 10px 14px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                  <div style="font-size:1.13em;font-weight:700;color:#fff;margin-bottom:8px;">${tv.name}</div>
                  <div style="color:#ffe047;font-size:1em;font-weight:600;">${tv.first_air_date ? tv.first_air_date.substring(0, 4) : ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </main>
      </body>
    </html>
  `);
});

// GUIDE: Platformlar, türler ve izleme rehberi
app.get('/guide', async (req, res) => {
  // 1. Popüler Platformlar logoları
  const platformLogos = [
    { src: '/netflix.avif', alt: 'Netflix' },
    { src: '/disneyplus.avif', alt: 'Disney+' },
    { src: '/amazonprimevideo.avif', alt: 'Amazon Prime Video' },
    { src: '/mubi.avif', alt: 'MUBI' },
    { src: '/itunes.avif', alt: 'Apple iTunes' },
    { src: '/play.avif', alt: 'Google Play' },
    { src: '/youtubered.avif', alt: 'YouTube' }
  ];
  // 2. Popüler Türler (TMDB'den en yüksek puan ortalamasına göre)
  const genresRes = await axios.get('https://api.themoviedb.org/3/genre/movie/list', { params: { api_key: TMDB_API_KEY, language: 'tr-TR' } });
  const genres = genresRes.data.genres;
  // Her tür için en yüksek puanlı 3 film
  const genreMovies = {};
  for (const genre of genres) {
    const topRes = await axios.get('https://api.themoviedb.org/3/discover/movie', { params: { api_key: TMDB_API_KEY, language: 'tr-TR', sort_by: 'vote_average.desc', with_genres: genre.id, 'vote_count.gte': 100 } });
    genreMovies[genre.id] = topRes.data.results.slice(0, 3);
  }
  res.send(`
    <html lang="tr">
      <head>
        ${renderHead({
          title: 'Guide - Movieway',
          description: 'Platformlar, türler ve izleme rehberi.',
          image: '/favicon.ico',
          url: 'https://movieway.com/guide'
        })}
        <style>
          .jw-guide-genre-btn { background:#23252b;color:#ffe047;padding:10px 22px;border-radius:14px;font-size:1.13em;font-weight:700;cursor:pointer;transition:all 0.15s;border:none;outline:none;margin-bottom:8px; }
          .jw-guide-genre-btn:hover { background:#ffe047;color:#23252b; }
          .jw-guide-modal { display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(10,10,10,0.85);z-index:9999;align-items:center;justify-content:center; }
          .jw-guide-modal.active { display:flex; }
          .jw-guide-modal-content { background:#181a20;border-radius:18px;box-shadow:0 2px 24px #000a;padding:38px 38px 32px 38px;max-width:480px;width:100%;color:#fff; }
          .jw-guide-modal-close { position:absolute;top:18px;right:28px;font-size:2em;color:#ffe047;cursor:pointer; }
        </style>
      </head>
      <body style="background:#0a0a0a;">
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
        </header>
        <main style="max-width:1200px;margin:100px auto 0 auto;padding:0 24px;">
          <h1 style="font-size:2em;font-weight:900;color:#ffe047;margin-bottom:24px;">Platformlar ve Türler</h1>
          <div style="background:#181a20;border-radius:18px;box-shadow:0 2px 16px #0006;padding:32px 24px 24px 24px;margin-bottom:32px;">
            <h2 style="color:#ffe047;font-size:1.3em;font-weight:700;margin-bottom:12px;">Popüler Platformlar</h2>
            <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center;">
              ${platformLogos.map(p => `
                <img src="${p.src}" alt="${p.alt}" title="${p.alt}" style="width:60px;height:60px;object-fit:contain;border-radius:12px;background:#23252b;padding:8px;" onerror="this.onerror=null;this.outerHTML='<svg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' fill=\'none\' style=\'background:#23252b;border-radius:12px;padding:8px;\'><rect width=\'60\' height=\'60\' rx=\'12\' fill=\'#23252b\'/><rect x=\'12\' y=\'18\' width=\'36\' height=\'24\' rx=\'4\' fill=\'#ffe047\'/><rect x=\'18\' y=\'24\' width=\'24\' height=\'12\' rx=\'2\' fill=\'#23252b\'/></svg>'" />
              `).join('')}
            </div>
          </div>
          <div style="background:#181a20;border-radius:18px;box-shadow:0 2px 16px #0006;padding:32px 24px 24px 24px;margin-bottom:32px;">
            <h2 style="color:#ffe047;font-size:1.3em;font-weight:700;margin-bottom:12px;">Popüler Türler</h2>
            <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center;">
              ${genres.map(g => `<button class="jw-guide-genre-btn" onclick="showGenreModal(${g.id})">${g.name}</button>`).join('')}
            </div>
          </div>
          <div id="jw-guide-modal" class="jw-guide-modal">
            <div class="jw-guide-modal-content" id="jw-guide-modal-content"></div>
            <span class="jw-guide-modal-close" onclick="closeGenreModal()">&times;</span>
          </div>
        </main>
        <script>
          const genreMovies = ${JSON.stringify(genreMovies)};
          const genres = ${JSON.stringify(genres)};
          function showGenreModal(id) {
            const genre = genres.find(g => g.id === id);
            const movies = genreMovies[id] || [];
            let html = '<h2 style=\'color:#ffe047;font-size:1.2em;font-weight:700;margin-bottom:12px;\'>' + genre.name + '</h2>';
            html += '<div style=\'color:#bdbdbd;font-size:1.08em;margin-bottom:18px;\'>' + genre.name + ' türünde en yüksek puanlı filmler:</div>';
            html += movies.length ? movies.map(function(m) {
              return '<div style=\'display:flex;align-items:center;gap:12px;margin-bottom:10px;\'>' +
                '<img src=\'https://image.tmdb.org/t/p/w92' + m.poster_path + '\' alt=\'' + m.title + '\' style=\'width:38px;height:56px;object-fit:cover;border-radius:6px;box-shadow:0 2px 8px #0005;\' />' +
                '<span style=\'color:#fff;font-weight:700;\'>' + m.title + '</span>' +
                '<span style=\'color:#ffe047;font-weight:700;margin-left:8px;\'>' +
                  '<img src=\'/imdb.png\' alt=\'IMDB\' title=\'IMDB\' style=\'height:18px;width:auto;vertical-align:middle;margin-right:4px;border-radius:4px;background:#fff;padding:1px 3px;box-shadow:0 1px 4px #0002;\' />' +
                  (m.vote_average ? m.vote_average.toFixed(1) : '-') +
                '</span>' +
              '</div>';
            }).join('') : '<div style="color:#bdbdbd;">Bilgi bulunamadı.</div>';
            document.getElementById('jw-guide-modal-content').innerHTML = html;
            document.getElementById('jw-guide-modal').classList.add('active');
          }
          function closeGenreModal() {
            document.getElementById('jw-guide-modal').classList.remove('active');
          }
          document.getElementById('jw-guide-modal').addEventListener('click', function(e) {
            if (e.target === this) closeGenreModal();
          });
        </script>
      </body>
    </html>
  `);
});

// Basit admin authentication middleware
const adminAuth = (req, res, next) => {
  const { username, password } = req.query;
  if (username === 'admin' && password === 'movieway2024') {
    next();
  } else {
    res.send(`
      <html>
        <head><title>Admin Login</title></head>
        <body style="font-family: Arial; padding: 50px; background: #f5f5f5;">
          <div style="max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; color: #333;">Admin Girişi</h2>
            <form method="get" action="/admin">
              <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">Kullanıcı Adı:</label>
                <input type="text" name="username" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px;">Şifre:</label>
                <input type="password" name="password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              <button type="submit" style="width: 100%; padding: 12px; background: #ffe047; color: #333; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Giriş Yap</button>
            </form>
            <p style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              Varsayılan: admin / movieway2024
            </p>
          </div>
        </body>
      </html>
    `);
  }
};

// Admin paneli route'u
app.get('/admin', adminAuth, (req, res) => {
  res.sendFile(__dirname + '/admin.html');
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
  console.log(`Admin paneli: http://localhost:${PORT}/admin`);
});