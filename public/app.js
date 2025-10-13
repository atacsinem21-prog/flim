// Global variables
let films = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadFilms();
    initializeEventListeners();
});

// Load films from API
async function loadFilms() {
    try {
        const response = await fetch('/api/films');
        films = await response.json();
        console.log('Films loaded:', films.length);
    } catch (error) {
        console.error('Error loading films:', error);
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Modal close on outside click
    const modal = document.getElementById('playerModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePlayer();
            }
        });
    }
    
    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePlayer();
        }
    });
}

// Search functionality
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) return;
    
    // Filter films based on search query
    const filteredFilms = films.filter(film => 
        film.title.toLowerCase().includes(query) ||
        film.genre.toLowerCase().includes(query) ||
        film.director.toLowerCase().includes(query) ||
        film.cast.toLowerCase().includes(query)
    );
    
    // Update the page with search results
    updateMoviesGrid(filteredFilms, `"${query}" için ${filteredFilms.length} sonuç bulundu`);
}

// Update movies grid
function updateMoviesGrid(filmsToShow, title = 'Filmler') {
    const moviesGrid = document.querySelector('.movies-grid');
    if (!moviesGrid) return;
    
    const sectionTitle = document.querySelector('.section-title');
    if (sectionTitle) {
        sectionTitle.textContent = title;
    }
    
    moviesGrid.innerHTML = filmsToShow.map(film => `
        <div class="movie-card" data-id="${film.id}">
            <div class="movie-poster">
                <img src="${film.posterUrl || 'https://via.placeholder.com/300x450'}" alt="${film.title}" loading="lazy">
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
    `).join('');
}

// Play movie function - redirect to movie detail page
function playMovie(filmId) {
    // Redirect to movie detail page
    window.location.href = `/movie/${filmId}`;
}

// Load video
function loadVideo(film) {
    const playerContainer = document.getElementById('playerContainer');
    if (!playerContainer) return;
    
    console.log('Loading video for film:', film.title);
    console.log('Video link:', film.videoLink);
    
    if (!film.videoLink) {
        playerContainer.innerHTML = `
            <div class="loading">
                <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                <p>Video linki bulunamadı!</p>
                <p style="font-size: 0.9rem; color: #666;">Admin panelden video linki ekleyin.</p>
            </div>
        `;
        return;
    }
    
    // Show loading for 2 seconds first
    playerContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Video yükleniyor...</p>
            <p style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">${film.videoLink}</p>
        </div>
    `;
    
    // Try to load iframe after 2 seconds
    setTimeout(() => {
        console.log('Creating iframe...');
        
        // Create iframe for video
        const iframe = document.createElement('iframe');
        iframe.src = film.videoLink;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.scrolling = 'no';
        iframe.allowFullscreen = true;
        iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        iframe.style.background = '#000';
        
        // Handle iframe load
        iframe.onload = function() {
            console.log('✅ Video iframe loaded successfully');
            console.log('Iframe src:', iframe.src);
        };
        
        iframe.onerror = function() {
            console.error('❌ Iframe failed to load');
            showVideoError();
        };
        
        // Add iframe to container
        playerContainer.innerHTML = '';
        playerContainer.appendChild(iframe);
        
        // Fallback: if iframe doesn't load in 3 seconds, show error
        setTimeout(() => {
            if (playerContainer.querySelector('iframe')) {
                console.log('Iframe is present, checking if it loaded...');
                // Check if iframe has content
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (!iframeDoc || iframeDoc.body.innerHTML.trim() === '') {
                        console.log('Iframe appears to be empty, showing fallback');
                        showVideoError();
                    }
                } catch (e) {
                    console.log('Cannot access iframe content (CORS), assuming it loaded');
                }
            }
        }, 3000);
        
        function showVideoError() {
            playerContainer.innerHTML = `
                <div class="loading">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <p>Video yüklenemedi!</p>
                    <p style="font-size: 0.9rem; color: #666;">Video linki çalışmıyor olabilir.</p>
                    <button onclick="window.open('${film.videoLink}', '_blank')" style="background: #ff6b6b; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; margin-top: 1rem; cursor: pointer;">
                        Yeni Sekmede Aç
                    </button>
                </div>
            `;
        }
        
    }, 2000);
}

// Close player
function closePlayer() {
    const modal = document.getElementById('playerModal');
    if (modal) {
        modal.style.display = 'none';
        
        // Clear player content
        const playerContainer = document.getElementById('playerContainer');
        if (playerContainer) {
            playerContainer.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Video yükleniyor...</p>
                </div>
            `;
        }
    }
}

// Toggle favorite
function toggleFavorite(filmId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(filmId);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(filmId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButton(filmId);
}

// Get favorites from localStorage
function getFavorites() {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
}

// Update favorite button
function updateFavoriteButton(filmId) {
    const favorites = getFavorites();
    const favoriteBtn = document.querySelector(`[onclick="toggleFavorite(${filmId})"]`);
    
    if (favoriteBtn) {
        const icon = favoriteBtn.querySelector('i');
        if (favorites.includes(filmId)) {
            icon.className = 'fas fa-heart';
            favoriteBtn.style.background = '#ff6b6b';
            favoriteBtn.style.borderColor = '#ff6b6b';
        } else {
            icon.className = 'far fa-heart';
            favoriteBtn.style.background = 'transparent';
            favoriteBtn.style.borderColor = '#ff6b6b';
        }
    }
}

// Add to watch history
function addToHistory(film) {
    const history = getHistory();
    const existingIndex = history.findIndex(item => item.id === film.id);
    
    if (existingIndex > -1) {
        history.splice(existingIndex, 1);
    }
    
    history.unshift({
        id: film.id,
        title: film.title,
        posterUrl: film.posterUrl,
        watchedAt: new Date().toISOString()
    });
    
    // Keep only last 50 items
    if (history.length > 50) {
        history.splice(50);
    }
    
    localStorage.setItem('watchHistory', JSON.stringify(history));
}

// Get watch history
function getHistory() {
    const history = localStorage.getItem('watchHistory');
    return history ? JSON.parse(history) : [];
}

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
            }
        });
    });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', initializeLazyLoading);

// Handle page visibility change (pause video when tab is not active)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, could pause video here if needed
        console.log('Page hidden');
    } else {
        // Page is visible again
        console.log('Page visible');
    }
});

// Error handling for uncaught errors
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Performance monitoring
window.addEventListener('load', function() {
    console.log('Page loaded successfully');
    
    // Log performance metrics
    if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log('Page load time:', loadTime + 'ms');
    }
});

// Export functions for global access
window.playMovie = playMovie;
window.closePlayer = closePlayer;
window.toggleFavorite = toggleFavorite;
window.performSearch = performSearch;
