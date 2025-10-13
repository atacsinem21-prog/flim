const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Film verilerini yönet
let films = [];
let settings = {
  site: {
    title: 'Movieway',
    description: 'En yeni filmleri HD kalitede izleyin',
    logo: '/logo.png'
  },
  hero: {
    title: 'En Yeni Filmler',
    subtitle: 'HD kalitede, ücretsiz film izleme deneyimi',
    backgroundImage: 'https://images.unsplash.com/photo-1489599808426-7a6c86d4c3b8?w=1920&h=1080&fit=crop'
  }
};

// Dosyaları yükle
async function loadData() {
  try {
    const filmsData = await fs.readFile('films.json', 'utf8');
    films = JSON.parse(filmsData);
  } catch (error) {
    films = [];
  }
  
  try {
    const settingsData = await fs.readFile('settings.json', 'utf8');
    settings = { ...settings, ...JSON.parse(settingsData) };
  } catch (error) {
    // Varsayılan ayarlar kullanılacak
  }
}

// Ana sayfa
app.get('/', async (req, res) => {
  await loadData();
  
  // Serve index.html file
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Old template route (commented out)
app.get('/old', async (req, res) => {
  await loadData();
  
  const html = `
<!DOCTYPE html>
      <html lang="tr">
        <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${settings.site.title} - HD Film İzle</title>
    <meta name="description" content="${settings.site.description}">
    <link rel="stylesheet" href="/style.css">
    <link rel="icon" href="/favicon.ico">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        </head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <a href="/">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0ZGNkI2QiIvPgo8cGF0aCBkPSJNMTIgMTJIMjhWMjhIMTJWMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYgMTZIMjRWMjBIMTZWMjRIMjBWMjBIMjRWMjRIMjBWMjBIMTZWMjRaIiBmaWxsPSIjRkY2QjZCIi8+Cjwvc3ZnPgo=" alt="${settings.site.title}">
                        <span>${settings.site.title}</span>
                    </a>
                </div>
                
                <nav class="nav">
                    <a href="/" class="nav-link active">Ana Sayfa</a>
                    <a href="/movies" class="nav-link">Filmler</a>
                    <a href="/series" class="nav-link">Diziler</a>
                    <a href="/new" class="nav-link">Yeni</a>
              </nav>
                
                <div class="header-actions">
                    <div class="search-box">
                        <input type="text" placeholder="Film, dizi ara..." id="searchInput">
                        <button id="searchBtn"><i class="fas fa-search"></i></button>
            </div>
                    <a href="/admin" class="admin-btn">Admin</a>
          </div>
            </div>
              </div>
    </header>

    <!-- Hero Section -->
    <section class="hero" style="background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${settings.hero.backgroundImage}')">
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title">${settings.hero.title}</h1>
                <p class="hero-subtitle">${settings.hero.subtitle}</p>
                <div class="hero-stats">
                    <div class="stat">
                        <span class="stat-number">${films.length}</span>
                        <span class="stat-label">Film</span>
            </div>
                    <div class="stat">
                        <span class="stat-number">HD</span>
                        <span class="stat-label">Kalite</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">Ücretsiz</span>
                        <span class="stat-label">İzleme</span>
                  </div>
              </div>
            </div>
            </div>
          </section>

    <!-- Main Content -->
    <main class="main">
        <div class="container">
            <!-- Featured Movies -->
            <section class="section">
                <div class="section-header">
                    <h2 class="section-title">Öne Çıkan Filmler</h2>
                    <a href="/movies" class="view-all">Tümünü Gör <i class="fas fa-arrow-right"></i></a>
            </div>
                <div class="movies-grid">
                    ${films.slice(0, 8).map(film => `
                        <div class="movie-card" data-id="${film.id}">
                            <div class="movie-poster">
                                <img src="${film.posterUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZpbG0gUG9zdGVyPC90ZXh0Pgo8L3N2Zz4K'}" alt="${film.title}" loading="lazy">
                                <div class="movie-overlay">
                                    <button class="play-btn" onclick="playMovie(${film.id})">
                                        <i class="fas fa-play"></i>
                                    </button>
                                    <div class="movie-info">
                                        <span class="movie-year">${film.year}</span>
                                        <span class="movie-rating">${film.imdbRating || 'N/A'}</span>
                      </div>
                      </div>
                    </div>
                            <div class="movie-details">
                                <h3 class="movie-title">${film.title}</h3>
                                <p class="movie-genre">${film.genre || 'Bilinmiyor'}</p>
                </div>
              </div>
                    `).join('')}
            </div>
          </section>

            <!-- Latest Movies -->
            <section class="section">
                <div class="section-header">
                    <h2 class="section-title">En Yeni Filmler</h2>
                    <a href="/new" class="view-all">Tümünü Gör <i class="fas fa-arrow-right"></i></a>
            </div>
                <div class="movies-grid">
                    ${films.slice(-8).reverse().map(film => `
                        <div class="movie-card" data-id="${film.id}">
                            <div class="movie-poster">
                                <img src="${film.posterUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZpbG0gUG9zdGVyPC90ZXh0Pgo8L3N2Zz4K'}" alt="${film.title}" loading="lazy">
                                <div class="movie-overlay">
                                    <button class="play-btn" onclick="playMovie(${film.id})">
                                        <i class="fas fa-play"></i>
                                    </button>
                                    <div class="movie-info">
                                        <span class="movie-year">${film.year}</span>
                                        <span class="movie-rating">${film.imdbRating || 'N/A'}</span>
                    </div>
                </div>
                    </div>
                            <div class="movie-details">
                                <h3 class="movie-title">${film.title}</h3>
                                <p class="movie-genre">${film.genre || 'Bilinmiyor'}</p>
                </div>
              </div>
                    `).join('')}
            </div>
          </section>
            </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>${settings.site.title}</h3>
                    <p>En yeni filmleri HD kalitede izleyin. Ücretsiz, hızlı ve güvenli.</p>
                  </div>
                <div class="footer-section">
                    <h4>Kategoriler</h4>
                    <ul>
                        <li><a href="/movies">Filmler</a></li>
                        <li><a href="/series">Diziler</a></li>
                        <li><a href="/new">Yeni</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Destek</h4>
                    <ul>
                        <li><a href="/contact">İletişim</a></li>
                        <li><a href="/about">Hakkımızda</a></li>
                    </ul>
                  </div>
                </div>
            <div class="footer-bottom">
                <p>&copy; 2024 ${settings.site.title}. Tüm hakları saklıdır.</p>
                  </div>
                </div>
    </footer>

    <!-- Movie Player Modal -->
    <div id="playerModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="playerTitle">Film İzle</h2>
                <button class="close-btn" onclick="closePlayer()">&times;</button>
                  </div>
            <div class="modal-body">
                <div id="playerContainer">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Video yükleniyor...</p>
                </div>
              </div>
                </div>
              </div>
              </div>

    <script src="/app.js"></script>
        </body>
</html>`;
  
  res.send(html);
});

// Film detay sayfası
app.get('/movie/:id', async (req, res) => {
  await loadData();
  const filmId = parseInt(req.params.id);
  console.log('🎬 Film ID requested:', filmId);
  console.log('📋 Available films:', films.map(f => ({ id: f.id, title: f.title })));
  
  const film = films.find(f => f.id === filmId);
  
  if (!film) {
    console.log('❌ Film not found for ID:', filmId);
    return res.status(404).send('Film bulunamadı');
  }
  
  console.log('✅ Film found:', film.title);
  
  const html = `
<!DOCTYPE html>
      <html lang="tr">
        <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${film.title || 'Film'} - ${settings.site.title}</title>
    <meta name="description" content="${film.description || film.title || 'Film'} - HD kalitede izleyin">
    <link rel="stylesheet" href="/style.css">
    <link rel="icon" href="/favicon.ico">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- Bootstrap CSS -->
    <link href="/bootstrap/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <a href="/">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0ZGNkI2QiIvPgo8cGF0aCBkPSJNMTIgMTJIMjhWMjhIMTJWMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYgMTZIMjRWMjBIMTZWMjRIMjBWMjBIMjRWMjRIMjBWMjBIMTZWMjRaIiBmaWxsPSIjRkY2QjZCIi8+Cjwvc3ZnPgo=" alt="${settings.site.title}">
                        <span>${settings.site.title}</span>
                    </a>
              </div>
                
                <nav class="nav">
                    <a href="/" class="nav-link">Ana Sayfa</a>
                    <a href="/movies" class="nav-link">Filmler</a>
                    <a href="/series" class="nav-link">Diziler</a>
                    <a href="/new" class="nav-link">Yeni</a>
            </nav>
                
                <div class="header-actions">
                    <div class="search-box">
                        <input type="text" placeholder="Film, dizi ara..." id="searchInput">
                        <button id="searchBtn"><i class="fas fa-search"></i></button>
                        </div>
                    <a href="/admin" class="admin-btn">Admin</a>
                      </div>
                              </div>
                            </div>
    </header>

    <!-- Movie Detail -->
    <main class="main">
        <div class="container">
            <div class="movie-detail">
                <div class="movie-detail-poster">
                    <img src="${film.posterUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDQwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZpbG0gUG9zdGVyPC90ZXh0Pgo8L3N2Zz4K'}" alt="${film.title}">
                </div>
                <div class="movie-detail-info">
                    <h1 class="movie-detail-title">${film.title || 'Film'}</h1>
                    <div class="movie-detail-meta">
                        <span class="year">${film.year || 'N/A'}</span>
                        <span class="genre">${film.genre || 'Bilinmiyor'}</span>
                        <span class="rating">IMDb: ${film.imdbRating || 'N/A'}</span>
              </div>
                    <p class="movie-detail-description">${film.description || 'Açıklama bulunamadı.'}</p>
                    <div class="movie-detail-actions">
                        <button class="favorite-btn" onclick="toggleFavorite(${film.id})">
                            <i class="fas fa-heart"></i>
                            Favorilere Ekle
                        </button>
                        <button class="play-btn-large" onclick="window.open('${film.videoLink || ''}', '_blank')" style="background: #ff6b6b;">
                            <i class="fas fa-external-link-alt"></i>
                            Vidrame'de İzle
                        </button>
                  </div>
                    <div class="movie-detail-cast">
                        <h3>Oyuncular</h3>
                        <p>${film.cast || 'Bilinmiyor'}</p>
                </div>
                    <div class="movie-detail-director">
                        <h3>Yönetmen</h3>
                        <p>${film.director || 'Bilinmiyor'}</p>
              </div>
                  </div>
                </div>
              </div>
    </main>

    <!-- HDFilmDelisi Style Video Player -->
    <div class="movie-player-section">
        <div class="player-container">
            <!-- Video Player with Bootstrap Modal Logic -->
            <div class="video-player-wrapper">
                <!-- Simple Video Player - Like Yesterday -->
                <div class="video-player-simple">
                    <iframe 
                        src="${film.videoLink || ''}"
                        width="100%" 
                        height="500" 
                        frameborder="0" 
                        scrolling="no" 
                        allowfullscreen
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture">
                    </iframe>
                </div>
              
            <!-- Simple Controls -->
            <div class="simple-controls">
                <button class="simple-btn" onclick="window.open('${film.videoLink || ''}', '_blank')">
                    <i class="fas fa-external-link-alt"></i>
                    Yeni Sekmede Aç
                </button>
            </div>
                </div>
              </div>
              
    <!-- Bootstrap Style Video Modal -->
    <div class="modal fade" id="videoModal" tabindex="-1" aria-labelledby="videoModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="videoModalLabel">${film.title || 'Film'}</h5>
                    <button type="button" class="btn-close" onclick="closeVideoModal()" aria-label="Close"></button>
                </div>
                <div class="modal-body p-0">
                    <div class="video-container-modal">
                        <iframe 
                            id="modalVideoPlayer"
                            class="vpx"
                            data-src="${film.videoLink || ''}" 
                            width="100%" 
                            height="500" 
                            frameborder="0" 
                            scrolling="no" 
                            webkitallowfullscreen 
                            mozallowfullscreen 
                            allowfullscreen 
                            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                            style="border: none; border-radius: 8px; background: #000;">
                        </iframe>
              </div>
                </div>
              </div>
            </div>
              </div>
              
    <!-- Movie Player Modal (for other pages) -->
    <div id="playerModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="playerTitle">${film.title}</h2>
                <button class="close-btn" onclick="closePlayer()">&times;</button>
                  </div>
            <div class="modal-body">
                <div id="playerContainer">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Video yükleniyor...</p>
                </div>
              </div>
                </div>
              </div>
              </div>
        
        <script>
        // Simple Video Player - Like Yesterday
        console.log('🎬 Video loaded directly in iframe');
        console.log('🎬 Video link: ${film.videoLink || ''}');
        
        </script>
            
            if (!currentFilm.videoLink) {
                alert('Video linki bulunamadı!');
                return;
            }
            
            // Show modal
            const modal = document.getElementById('playerModal');
            const playerContainer = document.getElementById('playerContainer');
            const playerTitle = document.getElementById('playerTitle');
            
            playerTitle.textContent = currentFilm.title;
            modal.style.display = 'block';
            
            // Create iframe directly
            const iframe = document.createElement('iframe');
            iframe.className = 'vidrame-player';
            // Convert /vr/ to /embed/ format
            iframe.src = currentFilm.videoLink.replace('/vr/', '/embed/');
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.frameBorder = '0';
            iframe.scrolling = 'no';
            iframe.allowFullscreen = true;
            iframe.setAttribute('webkitallowfullscreen', '');
            iframe.setAttribute('mozallowfullscreen', '');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture');
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';
            iframe.style.background = '#000';
            
            playerContainer.innerHTML = '';
            playerContainer.appendChild(iframe);
        }
        
        // Close player function
        function closePlayer() {
            const modal = document.getElementById('playerModal');
            modal.style.display = 'none';
        }
        
        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('playerModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
        
        // Test Vidrame link function
        function testVidrameLink(url) {
            console.log('🧪 Testing Vidrame link:', url);
            window.open(url, '_blank');
        }
        
        // Show trailer function
        function showTrailer() {
            alert('Fragman özelliği yakında eklenecek!');
        }
        
        // Smart video loader with fallback
        function loadVideo() {
            const iframe = document.querySelector('.vpx');
            if (!iframe || !iframe.dataset.src) return;
            
            const videoUrl = iframe.dataset.src;
            console.log('🎬 Loading video:', videoUrl);
            
            // Check if it's Vidrame or YouTube
            if (videoUrl.includes('vidrame.pro')) {
                console.log('📹 Detected Vidrame link');
                loadVidrameVideo(iframe, videoUrl);
            } else if (videoUrl.includes('youtube.com')) {
                console.log('📹 Detected YouTube link');
                loadYouTubeVideo(iframe, videoUrl);
  } else {
                console.log('📹 Unknown video type, trying direct load');
                iframe.src = videoUrl;
            }
        }
        
        function loadVidrameVideo(iframe, url) {
            // Try different Vidrame formats
            const formats = [
                url, // Original
                url.replace('/vr/', '/embed/'), // Embed format
                url.replace('/vr/', '/player/'), // Player format
            ];
            
            let currentFormat = 0;
            
            function tryNextFormat() {
                if (currentFormat >= formats.length) {
                    console.log('❌ All Vidrame formats failed, showing error');
                    showVideoError(iframe, url);
                    return;
                }
                
                const testUrl = formats[currentFormat];
                console.log(\`🔄 Trying Vidrame format \${currentFormat + 1}/\${formats.length}: \${testUrl}\`);
                
                iframe.src = testUrl;
                
                // Check if iframe loaded successfully
                setTimeout(() => {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        if (iframeDoc && iframeDoc.body && iframeDoc.body.innerHTML.trim() !== '') {
                            console.log(\`✅ Vidrame format \${currentFormat + 1} loaded successfully!\`);
  } else {
                            console.log(\`❌ Vidrame format \${currentFormat + 1} failed, trying next...\`);
                            currentFormat++;
                            tryNextFormat();
                        }
                    } catch (e) {
                        // CORS error is normal for Vidrame, assume it loaded
                        console.log(\`✅ Vidrame format \${currentFormat + 1} loaded (CORS check failed - normal)\`);
                    }
                }, 3000);
            }
            
            tryNextFormat();
        }
        
        function loadYouTubeVideo(iframe, url) {
            console.log('✅ Loading YouTube video directly');
            iframe.src = url;
        }
        
        function showVideoError(iframe, originalUrl) {
            iframe.style.display = 'none';
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = 
                '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #1a1a1a; color: white; text-align: center; padding: 2rem;">' +
                    '<div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>' +
                    '<h3>Video Yüklenemedi</h3>' +
                    '<p style="color: #666; margin-bottom: 1rem;">Vidrame linki çalışmıyor olabilir.</p>' +
                    '<button onclick="window.open(\'' + originalUrl + '\', \'_blank\')" style="background: #ff6b6b; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 5px; cursor: pointer; font-size: 1rem;">' +
                        'Vidrame\'de Aç' +
                    '</button>' +
                '</div>';
            iframe.parentNode.appendChild(errorDiv);
        }
        
        // Fullhdfilmcehennemi Style Video Player
        console.log('🔥 JAVASCRIPT IS LOADING!');
        alert('JavaScript yüklendi!');
        
        // Global video link
        const videoLink = '${film.videoLink || ''}';
        console.log('🎬 Video link:', videoLink);
        
        // Load video function
        function loadVideo() {
            console.log('🎬 Loading video...');
            const videoContainer = document.getElementById('videoContainer');
            const videoPlayer = document.getElementById('videoPlayer');
            const playButton = document.getElementById('playButton');
            
            if (videoContainer && videoPlayer && videoLink) {
                console.log('✅ Elements found, loading video...');
                
                // Hide play button
                if (playButton) {
                    playButton.style.display = 'none';
                }
                
                // Show video container
                videoContainer.style.display = 'block';
                
                // Set video source
                videoPlayer.src = videoLink;
                console.log('🎬 Video source set:', videoLink);
                
                // Try to play
                videoPlayer.onload = function() {
                    console.log('✅ Video loaded successfully!');
                };
                
                videoPlayer.onerror = function() {
                    console.log('❌ Video failed to load');
                    alert('Video yüklenemedi. Lütfen linki kontrol edin.');
                };
                
    } else {
                console.log('❌ Elements not found or no video link');
                alert('Video yüklenemedi!');
            }
        }
        
        // Make loadVideo global
        window.loadVideo = loadVideo;
        
        // Duplicate function removed to prevent conflicts
        
        // Test if elements exist
        setTimeout(function() {
            console.log('🔍 Checking elements...');
            const playButton = document.getElementById('playButton');
            console.log('Play button:', playButton);
            
            if (playButton) {
                console.log('✅ Play button found!');
                playButton.style.border = '3px solid red';
                playButton.style.cursor = 'pointer';
    } else {
                console.log('❌ Play button NOT found!');
            }
        }, 1000);
        
        function loadVideoInModal() {
            const iframe = document.getElementById('modalVideoPlayer');
            if (!iframe) return;
            
            const videoUrl = iframe.getAttribute('data-src');
            if (!videoUrl) return;
            
            console.log('🎬 Loading video:', videoUrl);
            
            if (videoUrl.includes('vidmoly.net')) {
                console.log('📹 Detected Vidmoly link');
                // Vidmoly için özel iframe ayarları
                iframe.src = videoUrl;
                iframe.setAttribute('allowfullscreen', '');
                iframe.setAttribute('webkitallowfullscreen', '');
                iframe.setAttribute('mozallowfullscreen', '');
                iframe.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture');
                iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms allow-presentation');
                iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
                iframe.style.border = 'none';
                iframe.style.borderRadius = '8px';
                iframe.style.background = '#000';
                console.log('✅ Vidmoly iframe configured');
            } else if (videoUrl.includes('vidrame.pro')) {
                console.log('📹 Detected Vidrame link');
                loadVidrameVideo(iframe, videoUrl);
            } else if (videoUrl.includes('youtube.com')) {
                console.log('📹 Detected YouTube link');
                iframe.src = videoUrl;
    } else {
                console.log('📹 Unknown video type, trying direct load');
                iframe.src = videoUrl;
            }
        }
        
        function stopVideoInModal() {
            const iframe = document.getElementById('modalVideoPlayer');
            if (iframe) {
                iframe.src = '';
            }
        }
        
        function loadVidrameVideo(iframe, url) {
            // Try different Vidrame formats
            const formats = [
                url, // Original
                url.replace('/vr/', '/embed/'), // Embed format
                url.replace('/vr/', '/player/'), // Player format
            ];
            
            let currentFormat = 0;
            
            const tryNextFormat = () => {
                if (currentFormat >= formats.length) {
                    console.log('❌ All Vidrame formats failed');
                    showVideoError(iframe, url);
                    return;
                }
                
                const testUrl = formats[currentFormat];
                console.log('🔄 Trying Vidrame format ' + (currentFormat + 1) + '/' + formats.length + ': ' + testUrl);
                
                iframe.src = testUrl;
                
                // Check if iframe loaded successfully
                setTimeout(() => {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        if (iframeDoc && iframeDoc.body && iframeDoc.body.innerHTML.trim() !== '') {
                            console.log('✅ Vidrame format ' + (currentFormat + 1) + ' loaded successfully!');
    } else {
                            console.log('❌ Vidrame format ' + (currentFormat + 1) + ' failed, trying next...');
                            currentFormat++;
                            tryNextFormat();
                        }
                    } catch (e) {
                        // CORS error is normal for Vidrame, assume it loaded
                        console.log('✅ Vidrame format ' + (currentFormat + 1) + ' loaded (CORS check failed - normal)');
                    }
                }, 3000);
            };
            
            tryNextFormat();
        }
        
        function showVideoError(iframe, originalUrl) {
            iframe.style.display = 'none';
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = 
                '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 500px; background: #1a1a1a; color: white; text-align: center; padding: 2rem;">' +
                    '<div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>' +
                    '<h3>Video Yüklenemedi</h3>' +
                    '<p style="color: #666; margin-bottom: 1rem;">Vidrame linki çalışmıyor olabilir.</p>' +
                    '<button onclick="window.open(\'' + originalUrl + '\', \'_blank\')" style="background: #ff6b6b; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 5px; cursor: pointer; font-size: 1rem;">' +
                        'Vidrame\'de Aç' +
                    '</button>' +
                '</div>';
            iframe.parentNode.appendChild(errorDiv);
        }
    </script>
</body>
</html>`;
  
  res.send(html);
});

// Filmler sayfası
app.get('/movies', async (req, res) => {
  await loadData();
  
  const html = `
      <!DOCTYPE html>
    <html lang="tr">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Filmler - ${settings.site.title}</title>
    <meta name="description" content="Tüm filmleri HD kalitede izleyin">
          <link rel="stylesheet" href="/style.css">
    <link rel="icon" href="/favicon.ico">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      </head>
      <body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <a href="/">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0ZGNkI2QiIvPgo8cGF0aCBkPSJNMTIgMTJIMjhWMjhIMTJWMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYgMTZIMjRWMjBIMTZWMjRIMjBWMjBIMjRWMjRIMjBWMjBIMTZWMjRaIiBmaWxsPSIjRkY2QjZCIi8+Cjwvc3ZnPgo=" alt="${settings.site.title}">
                        <span>${settings.site.title}</span>
                    </a>
          </div>
                
                <nav class="nav">
                    <a href="/" class="nav-link">Ana Sayfa</a>
                    <a href="/movies" class="nav-link active">Filmler</a>
                    <a href="/series" class="nav-link">Diziler</a>
                    <a href="/new" class="nav-link">Yeni</a>
                </nav>
                
                <div class="header-actions">
                    <div class="search-box">
                        <input type="text" placeholder="Film, dizi ara..." id="searchInput">
                        <button id="searchBtn"><i class="fas fa-search"></i></button>
          </div>
                    <a href="/admin" class="admin-btn">Admin</a>
                              </div>
                          </div>
                          </div>
    </header>

    <!-- Movies Page -->
    <main class="main">
        <div class="container">
            <div class="page-header">
                <h1>Tüm Filmler</h1>
                <p>${films.length} film bulundu</p>
                          </div>
                          
            <div class="movies-grid">
                ${films.map(film => `
                    <div class="movie-card" data-id="${film.id}">
                        <div class="movie-poster">
                            <img src="${film.posterUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZpbG0gUG9zdGVyPC90ZXh0Pgo8L3N2Zz4K'}" alt="${film.title}" loading="lazy">
                            <div class="movie-overlay">
                                <button class="play-btn" onclick="playMovie(${film.id})">
                                    <i class="fas fa-play"></i>
                                </button>
                                <div class="movie-info">
                                    <span class="movie-year">${film.year}</span>
                                    <span class="movie-rating">${film.imdbRating || 'N/A'}</span>
                          </div>
                      </div>
                          </div>
                        <div class="movie-details">
                            <h3 class="movie-title">${film.title}</h3>
                            <p class="movie-genre">${film.genre || 'Bilinmiyor'}</p>
                      </div>
                  </div>
                `).join('')}
                      </div>
                  </div>
    </main>

    <!-- Movie Player Modal -->
    <div id="playerModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="playerTitle">Film İzle</h2>
                <button class="close-btn" onclick="closePlayer()">&times;</button>
                              </div>
            <div class="modal-body">
                <div id="playerContainer">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Video yükleniyor...</p>
                              </div>
                              </div>
                          </div>
                      </div>
                  </div>

    <!-- Bootstrap JS -->
    <script src="/bootstrap/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  
  res.send(html);
});

// API Routes
app.get('/api/films', async (req, res) => {
  await loadData();
  res.json(films);
});

app.get('/api/settings', async (req, res) => {
  await loadData();
  res.json(settings);
});

app.post('/api/settings', async (req, res) => {
  settings = { ...settings, ...req.body };
  await fs.writeFile('settings.json', JSON.stringify(settings, null, 2));
  res.json(settings);
});

app.post('/api/films', async (req, res) => {
  const newFilm = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
    
    films.push(newFilm);
  await fs.writeFile('films.json', JSON.stringify(films, null, 2));
  res.json(newFilm);
});

app.put('/api/films/:id', async (req, res) => {
  const filmId = parseInt(req.params.id);
  const filmIndex = films.findIndex(f => f.id === filmId);
  
    if (filmIndex === -1) {
      return res.status(404).json({ error: 'Film bulunamadı' });
    }
    
  films[filmIndex] = { ...films[filmIndex], ...req.body };
  await fs.writeFile('films.json', JSON.stringify(films, null, 2));
  res.json(films[filmIndex]);
});

app.delete('/api/films/:id', async (req, res) => {
  const filmId = parseInt(req.params.id);
  films = films.filter(f => f.id !== filmId);
  await fs.writeFile('films.json', JSON.stringify(films, null, 2));
      res.json({ success: true });
});

// Admin paneli
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Server başlat
app.listen(PORT, () => {
  console.log(`🚀 ${settings.site.title} sunucusu http://localhost:${PORT} adresinde çalışıyor`);
  console.log(`📱 Admin paneli: http://localhost:${PORT}/admin`);
});

// İlk veri yükleme
loadData();
