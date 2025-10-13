// Admin Panel JavaScript
let films = [];
let settings = {};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadFilms();
    loadSettings();
    initializeEventListeners();
});

// Event Listeners
function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            showPage(page);
        });
    });

    // Add Film Form
    document.getElementById('addFilmForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addFilm();
    });
}

// Navigation
function showPage(page) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`).classList.add('active');

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        films: 'Film Yönetimi',
        settings: 'Site Ayarları'
    };
    document.getElementById('pageTitle').textContent = titles[page];

    // Show page content
    document.querySelectorAll('.page-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${page}-content`).classList.add('active');

    // Load page specific data
    if (page === 'dashboard') {
        loadDashboard();
    } else if (page === 'films') {
        loadFilmsTable();
    }
}

// Load Films
async function loadFilms() {
    try {
        const response = await fetch('/api/films');
        films = await response.json();
        console.log('Films loaded:', films.length);
        } catch (error) {
        console.error('Error loading films:', error);
        showNotification('Filmler yüklenirken hata oluştu!', 'error');
    }
}

// Load Settings
async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        settings = await response.json();
        console.log('Settings loaded:', settings);
        } catch (error) {
        console.error('Error loading settings:', error);
        // Use default settings
        settings = {
            site: { title: 'Movieway', description: 'En yeni filmleri HD kalitede izleyin' },
            hero: { title: 'En Yeni Filmler', subtitle: 'HD kalitede, ücretsiz film izleme deneyimi' }
        };
    }
}

// Dashboard
function loadDashboard() {
    // Update stats
    document.getElementById('totalFilms').textContent = films.length;
    document.getElementById('totalViews').textContent = '0'; // Placeholder
    document.getElementById('totalFavorites').textContent = '0'; // Placeholder

    // Load recent films
    const recentFilms = films.slice(-5).reverse();
    const recentFilmsList = document.getElementById('recentFilmsList');
    
    if (recentFilms.length === 0) {
        recentFilmsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Henüz film eklenmemiş.</p>';
    } else {
        recentFilmsList.innerHTML = recentFilms.map(film => `
            <div class="film-item">
                <img src="${film.posterUrl || 'https://via.placeholder.com/50x70'}" alt="${film.title}">
                <div class="film-item-info">
                    <h4>${film.title}</h4>
                    <p>${film.year || 'N/A'} • ${film.genre || 'Bilinmiyor'}</p>
                        </div>
                    </div>
        `).join('');
    }
}

// Films Table
function loadFilmsTable() {
    const tbody = document.getElementById('filmsTableBody');
    
    if (films.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #666;">Henüz film eklenmemiş.</td></tr>';
            } else {
        tbody.innerHTML = films.map(film => `
            <tr>
                <td>
                    <img src="${film.posterUrl || 'https://via.placeholder.com/40x60'}" alt="${film.title}">
                </td>
                <td class="film-title">${film.title}</td>
                <td>${film.genre || 'Bilinmiyor'}</td>
                <td>${film.year || 'N/A'}</td>
                <td>${film.imdbRating || 'N/A'}</td>
                <td class="film-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editFilm(${film.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteFilm(${film.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Add Film
async function addFilm() {
    const formData = {
        title: document.getElementById('filmTitle').value,
        description: document.getElementById('filmDescription').value,
        videoLink: document.getElementById('filmVideoLink').value,
            posterUrl: document.getElementById('filmPosterUrl').value,
        year: document.getElementById('filmYear').value,
        genre: document.getElementById('filmGenre').value,
        imdbRating: document.getElementById('filmImdbRating').value,
        director: document.getElementById('filmDirector').value,
        cast: document.getElementById('filmCast').value
    };

    // Validate required fields
    if (!formData.title || !formData.videoLink) {
        showNotification('Başlık ve video linki zorunludur!', 'error');
            return;
        }

        try {
        const response = await fetch('/api/films', {
                    method: 'POST',
                    headers: {
                'Content-Type': 'application/json'
                    },
            body: JSON.stringify(formData)
                });

            if (response.ok) {
            const newFilm = await response.json();
            films.push(newFilm);
            showNotification('Film başarıyla eklendi!', 'success');
            closeAddFilmModal();
            clearAddFilmForm();
            
            // Refresh current page
            if (document.getElementById('dashboard-content').classList.contains('active')) {
                loadDashboard();
            } else if (document.getElementById('films-content').classList.contains('active')) {
                loadFilmsTable();
            }
            } else {
            throw new Error('Film eklenemedi');
            }
        } catch (error) {
        console.error('Error adding film:', error);
        showNotification('Film eklenirken hata oluştu!', 'error');
    }
}

// Edit Film
function editFilm(filmId) {
    const film = films.find(f => f.id === filmId);
    if (!film) return;

    // Fill form with film data
    document.getElementById('filmTitle').value = film.title;
    document.getElementById('filmDescription').value = film.description || '';
    document.getElementById('filmVideoLink').value = film.videoLink || '';
    document.getElementById('filmPosterUrl').value = film.posterUrl || '';
    document.getElementById('filmYear').value = film.year || '';
    document.getElementById('filmGenre').value = film.genre || '';
    document.getElementById('filmImdbRating').value = film.imdbRating || '';
    document.getElementById('filmDirector').value = film.director || '';
    document.getElementById('filmCast').value = film.cast || '';

    // Change form title and submit button
    document.querySelector('#addFilmModal .modal-header h3').textContent = 'Film Düzenle';
    document.querySelector('#addFilmForm button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Güncelle';

    // Store current film ID for update
    document.getElementById('addFilmForm').dataset.filmId = filmId;

    showAddFilmModal();
}

// Delete Film
async function deleteFilm(filmId) {
        if (!confirm('Bu filmi silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
        const response = await fetch(`/api/films/${filmId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
            films = films.filter(f => f.id !== filmId);
                showNotification('Film başarıyla silindi!', 'success');
            loadFilmsTable();
            } else {
            throw new Error('Film silinemedi');
            }
        } catch (error) {
        console.error('Error deleting film:', error);
        showNotification('Film silinirken hata oluştu!', 'error');
    }
}

// Save Settings
async function saveSettings() {
    const settingsData = {
        site: {
            title: document.getElementById('siteTitle').value,
            description: document.getElementById('siteDescription').value
        },
        hero: {
            title: document.getElementById('heroTitle').value,
            subtitle: document.getElementById('heroSubtitle').value,
            backgroundImage: document.getElementById('heroBackground').value
        }
    };

    try {
        const response = await fetch('/api/settings', {
                    method: 'POST',
                    headers: {
                'Content-Type': 'application/json'
                    },
            body: JSON.stringify(settingsData)
                });

                if (response.ok) {
            showNotification('Ayarlar başarıyla kaydedildi!', 'success');
                } else {
            throw new Error('Ayarlar kaydedilemedi');
                }
            } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Ayarlar kaydedilirken hata oluştu!', 'error');
    }
}

// Modal Functions
function showAddFilmModal() {
    document.getElementById('addFilmModal').style.display = 'block';
}

function closeAddFilmModal() {
    document.getElementById('addFilmModal').style.display = 'none';
    clearAddFilmForm();
}

function clearAddFilmForm() {
    document.getElementById('addFilmForm').reset();
    document.getElementById('addFilmForm').dataset.filmId = '';
    document.querySelector('#addFilmModal .modal-header h3').textContent = 'Yeni Film Ekle';
    document.querySelector('#addFilmForm button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Film Ekle';
}

// Notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Close modal on outside click
window.addEventListener('click', function(e) {
    const modal = document.getElementById('addFilmModal');
    if (e.target === modal) {
        closeAddFilmModal();
    }
});

// Load settings into form when settings page is shown
document.addEventListener('click', function(e) {
    if (e.target.dataset.page === 'settings') {
        setTimeout(() => {
            document.getElementById('siteTitle').value = settings.site?.title || '';
            document.getElementById('siteDescription').value = settings.site?.description || '';
            document.getElementById('heroTitle').value = settings.hero?.title || '';
            document.getElementById('heroSubtitle').value = settings.hero?.subtitle || '';
            document.getElementById('heroBackground').value = settings.hero?.backgroundImage || '';
        }, 100);
    }
});