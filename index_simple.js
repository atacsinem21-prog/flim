const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Global variables
let settings = {};
let films = [];

// Load data function
async function loadData() {
    try {
        // Load settings
        const settingsData = await fs.readFile('settings.json', 'utf8');
        settings = JSON.parse(settingsData);
        
        // Load films
        const filmsData = await fs.readFile('films.json', 'utf8');
        films = JSON.parse(filmsData);
        
        console.log('✅ Data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

// Homepage route
app.get('/', async (req, res) => {
    await loadData();
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Movie detail route
app.get('/movie/:id', async (req, res) => {
    await loadData();
    
    const filmId = req.params.id;
    console.log('🎬 Film ID requested:', filmId);
    console.log('📋 Available films:', films.map(f => ({ id: f.id, title: f.title })));
    
    const film = films.find(f => f.id == filmId);
    
    if (!film) {
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="logo">
                <a href="/">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0ZGNkI2QiIvPgo8cGF0aCBkPSJNMTIgMTJIMjhWMjhIMTJWMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYgMTZIMjRWMjBIMTZWMjRIMjBWMjBIMjRWMjRIMjBWMjBIMTZWMjRaIiBmaWxsPSIjRkY2QjZCIi8+Cjwvc3ZnPgo=" alt="${settings.site.title}">
                    <span>${settings.site.title}</span>
                </a>
            </div>
            <nav class="nav">
                <a href="/">Ana Sayfa</a>
                <a href="/">Filmler</a>
                <a href="/">Diziler</a>
                <a href="/">Yeni</a>
            </nav>
            <div class="header-actions">
                <div class="search-box">
                    <input type="text" placeholder="Film, dizi ara..." id="searchInput">
                    <button id="searchBtn"><i class="fas fa-search"></i></button>
                </div>
                <a href="/admin" class="admin-btn">Admin</a>
            </div>
        </div>
    </header>

    <!-- Main Content -->
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
            
            <!-- Simple Video Player -->
            <div class="movie-player-section">
                <div class="player-container">
                    <div class="video-player-wrapper">
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
                        
                        <!-- No controls needed - video plays directly -->
                    </div>
                </div>
            </div>
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
                    <h3>Hızlı Linkler</h3>
                    <ul>
                        <li><a href="/">Ana Sayfa</a></li>
                        <li><a href="/">Filmler</a></li>
                        <li><a href="/">Diziler</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>İletişim</h3>
                    <ul>
                        <li><a href="/">Hakkımızda</a></li>
                        <li><a href="/">İletişim</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 ${settings.site.title}. Tüm hakları saklıdır.</p>
            </div>
        </div>
    </footer>

    <script>
        // Simple Video Player - Like Yesterday
        console.log('🎬 Video loaded directly in iframe');
        console.log('🎬 Video link: ${film.videoLink || ''}');
        
        // Simple functions
        function toggleFavorite(filmId) {
            console.log('❤️ Toggle favorite for film:', filmId);
        }
    </script>
</body>
</html>`;
    
    res.send(html);
});

// Admin route
app.get('/admin', async (req, res) => {
    await loadData();
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// API routes
app.get('/api/films', async (req, res) => {
    await loadData();
    res.json(films);
});

app.post('/api/films', async (req, res) => {
    try {
        const newFilm = {
            id: Date.now(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        films.push(newFilm);
        await fs.writeFile('films.json', JSON.stringify(films, null, 2));
        
        res.json({ success: true, film: newFilm });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Movieway sunucusu http://localhost:3000 adresinde çalışıyor');
    console.log('📱 Admin paneli: http://localhost:3000/admin');
});
