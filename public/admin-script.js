// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Menu toggle functionality
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('adminSidebar');
    const menuItems = document.querySelectorAll('.menu-item');
    const pageTitle = document.getElementById('pageTitle');
    const contentBody = document.getElementById('contentBody');

    // Global settings variable
    let currentSettings = {};

    // Load settings on page load
    loadSettings();

    // Load settings from server
    async function loadSettings() {
        try {
            const response = await fetch('/api/admin/settings');
            if (response.ok) {
                currentSettings = await response.json();
                console.log('Ayarlar yüklendi:', currentSettings);
            } else {
                console.error('Ayarlar yüklenemedi');
            }
        } catch (error) {
            console.error('Ayarlar yükleme hatası:', error);
        }
    }

    // Save settings to server
    async function saveSettings(section, data) {
        try {
            const response = await fetch(`/api/admin/settings/${section}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Ayarlar kaydedildi:', result);
                showNotification('Ayarlar başarıyla kaydedildi!', 'success');
                return true;
            } else {
                console.error('Ayarlar kaydedilemedi');
                showNotification('Ayarlar kaydedilemedi!', 'error');
                return false;
            }
        } catch (error) {
            console.error('Ayarlar kaydetme hatası:', error);
            showNotification('Sunucu hatası!', 'error');
            return false;
        }
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            ${type === 'success' ? 'background: #27ae60;' : 
              type === 'error' ? 'background: #e74c3c;' : 
              'background: #3498db;'}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Toggle sidebar on mobile
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Menu item click handlers
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active class from all items
            menuItems.forEach(menuItem => menuItem.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get page data
            const page = this.getAttribute('data-page');
            loadPageContent(page);
            
            // Close sidebar on mobile after selection
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Load page content based on selected menu item
    function loadPageContent(page) {
        const pageData = {
            'genel': {
                title: 'Genel Ayarlar',
                content: getGeneralSettingsContent()
            },
            'anasayfa': {
                title: 'Ana Sayfa Ayarları',
                content: getHomepageSettingsContent()
            },
            'ust-kisim': {
                title: 'Üst Kısım Ayarları',
                content: getHeaderSettingsContent()
            },
            'icerik': {
                title: 'İçerik Yönetimi',
                content: getContentManagementContent()
            },
            'arsiv': {
                title: 'Arşiv Yönetimi',
                content: getArchiveManagementContent()
            },
            'alt-kisim': {
                title: 'Alt Kısım Ayarları',
                content: getFooterSettingsContent()
            },
            'player': {
                title: 'Player Ayarları',
                content: getPlayerSettingsContent()
            },
            'reklam': {
                title: 'Reklam Yönetimi',
                content: getAdManagementContent()
            },
            'gorunum': {
                title: 'Görünüm Ayarları',
                content: getAppearanceSettingsContent()
            },
            'stil': {
                title: 'Stil Ayarları',
                content: getStyleSettingsContent()
            },
            'seo': {
                title: 'SEO Ayarları',
                content: getSEOSettingsContent()
            },
            'bot': {
                title: 'Bot Ayarları',
                content: getBotSettingsContent()
            },
            'gelismis': {
                title: 'Gelişmiş Ayarlar',
                content: getAdvancedSettingsContent()
            }
        };

        const data = pageData[page];
        if (data) {
            pageTitle.textContent = data.title;
            contentBody.innerHTML = data.content;
        }
    }

    // Content generators for different pages
    function getGeneralSettingsContent() {
        return `
            <div class="settings-section">
                <h2 class="section-title">Lisans Bilgileri</h2>
                <div class="setting-item">
                    <label class="setting-label">Durum:</label>
                    <span class="setting-value status-active">Aktif</span>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Süre:</label>
                    <span class="setting-value">Ömür Boyu</span>
                </div>
            </div>

            <div class="settings-section">
                <h2 class="section-title">İletişim Ayarları</h2>
                <div class="setting-item">
                    <label class="setting-label">E-posta:</label>
                    <input type="email" class="setting-input" value="info@movieway.com" placeholder="E-posta adresinizi girin">
                </div>
            </div>

            <div class="settings-section">
                <h2 class="section-title">Duyuru Ayarları</h2>
                <div class="setting-item">
                    <label class="setting-label">Duyuru alanını etkinleştir</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="announcementToggle" checked>
                        <label for="announcementToggle" class="toggle-label"></label>
                    </div>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Tüm sayfalarda göster</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="showAllPagesToggle" checked>
                        <label for="showAllPagesToggle" class="toggle-label"></label>
                    </div>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Duyuru Metni</label>
                    <textarea class="setting-textarea" placeholder="Duyuru metninizi buraya yazın...">Sevgili İzleyicilerimiz, Movieway artık reklamsız! Bilginize, iyi seyirler dileriz.</textarea>
                </div>
            </div>

            <div class="settings-section">
                <h2 class="section-title">Favicon</h2>
                <div class="setting-item">
                    <label class="setting-label">Özel Favicon</label>
                    <input type="file" class="setting-file" accept="image/*">
                </div>
            </div>

            <div class="settings-section">
                <h2 class="section-title">Varsayılan Gravatar</h2>
                <div class="setting-item">
                    <label class="setting-label">Özel Gravatar</label>
                    <input type="file" class="setting-file" accept="image/*">
                </div>
            </div>

            <div class="settings-actions">
                <button class="btn-reset">Ayarları Sıfırla</button>
            </div>
        `;
    }

    function getHomepageSettingsContent() {
        return `
            <div class="settings-section">
                <h2 class="section-title">Ana Sayfa Düzeni</h2>
                <div class="setting-item">
                    <label class="setting-label">Hero Bölümü</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="heroSectionToggle" checked>
                        <label for="heroSectionToggle" class="toggle-label"></label>
                    </div>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Platform Logoları</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="platformLogosToggle" checked>
                        <label for="platformLogosToggle" class="toggle-label"></label>
                    </div>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Popüler Filmler Bölümü</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="popularMoviesToggle" checked>
                        <label for="popularMoviesToggle" class="toggle-label"></label>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h2 class="section-title">İçerik Ayarları</h2>
                <div class="setting-item">
                    <label class="setting-label">Film Sayısı (Her Bölüm)</label>
                    <input type="number" class="setting-input" value="6" min="1" max="20">
                </div>
                <div class="setting-item">
                    <label class="setting-label">Otomatik Güncelleme</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="autoUpdateToggle" checked>
                        <label for="autoUpdateToggle" class="toggle-label"></label>
                    </div>
                </div>
            </div>
        `;
    }

    function getHeaderSettingsContent() {
        return `
            <div class="settings-section">
                <h2 class="section-title">Header Ayarları</h2>
                <div class="setting-item">
                    <label class="setting-label">Logo Metni</label>
                    <input type="text" class="setting-input" value="Movieway" placeholder="Site adınızı girin">
                </div>
                <div class="setting-item">
                    <label class="setting-label">Menü Öğeleri</label>
                    <textarea class="setting-textarea" placeholder="Menü öğelerini virgülle ayırın">Yeni, Popüler, Filmler, Listeler</textarea>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Arama Çubuğu</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="searchBarToggle" checked>
                        <label for="searchBarToggle" class="toggle-label"></label>
                    </div>
                </div>
            </div>
        `;
    }

    function getContentManagementContent() {
        return `
            <div class="settings-section">
                <h2 class="section-title">Film Yönetimi</h2>
                <div class="setting-item">
                    <label class="setting-label">Yeni Film Ekle</label>
                    <button class="btn-primary">Film Ekle</button>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Toplu Film İçe Aktar</label>
                    <input type="file" class="setting-file" accept=".csv,.json">
                </div>
            </div>

            <div class="settings-section">
                <h2 class="section-title">Dizi Yönetimi</h2>
                <div class="setting-item">
                    <label class="setting-label">Yeni Dizi Ekle</label>
                    <button class="btn-primary">Dizi Ekle</button>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Sezon/Episode Yönetimi</label>
                    <button class="btn-secondary">Yönet</button>
                </div>
            </div>
        `;
    }

    function getArchiveManagementContent() {
        return `
            <div class="settings-section">
                <h2 class="section-title">Arşiv Ayarları</h2>
                <div class="setting-item">
                    <label class="setting-label">Otomatik Arşivleme</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="autoArchiveToggle">
                        <label for="autoArchiveToggle" class="toggle-label"></label>
                    </div>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Arşiv Yaşı (Gün)</label>
                    <input type="number" class="setting-input" value="365" min="30" max="3650">
                </div>
            </div>
        `;
    }

    function getFooterSettingsContent() {
        return `
            <div class="settings-section">
                <h2 class="section-title">Footer Ayarları</h2>
                <div class="setting-item">
                    <label class="setting-label">Footer Metni</label>
                    <textarea class="setting-textarea" placeholder="Footer metninizi yazın">© 2024 Movieway. Tüm hakları saklıdır.</textarea>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Sosyal Medya Linkleri</label>
                    <textarea class="setting-textarea" placeholder="Sosyal medya linklerinizi yazın"></textarea>
                </div>
            </div>
        `;
    }

    function getPlayerSettingsContent() {
        return `
            <div class="settings-section">
                <h2 class="section-title">Video Player Ayarları</h2>
                <div class="setting-item">
                    <label class="setting-label">Varsayılan Kalite</label>
                    <select class="setting-input">
                        <option value="auto">Otomatik</option>
                        <option value="720p">720p</option>
                        <option value="1080p">1080p</option>
                        <option value="4k">4K</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Otomatik Oynatma</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="autoPlayToggle">
                        <label for="autoPlayToggle" class="toggle-label"></label>
                    </div>
                </div>
            </div>
        `;
    }

    function getAdManagementContent() {
        return `
            <div class="settings-section">
                <h2 class="section-title">Genel Reklam Ayarları</h2>
                <div class="setting-item">
                    <label class="setting-label">Reklamları Etkinleştir</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="adsEnabledToggle" ${currentSettings.ads?.enabled ? 'checked' : ''}>
                        <label for="adsEnabledToggle" class="toggle-label"></label>
                    </div>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Google AdSense Ana Kodu</label>
                    <textarea class="setting-textarea" id="adSenseCode" placeholder="AdSense ana kodunuzu yapıştırın">${currentSettings.ads?.adSenseCode || ''}</textarea>
                </div>
            </div>

            <div class="settings-section">
                <h2 class="section-title">Üst Banner Reklam</h2>
                <div class="setting-item">
                    <label class="setting-label">Üst Banner'ı Etkinleştir</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="topBannerEnabledToggle" ${currentSettings.ads?.topBanner?.enabled ? 'checked' : ''}>
                        <label for="topBannerEnabledToggle" class="toggle-label"></label>
                    </div>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Reklam Kodu</label>
                    <textarea class="setting-textarea" id="topBannerCode" placeholder="Üst banner reklam kodunuzu yapıştırın">${currentSettings.ads?.topBanner?.code || ''}</textarea>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Yükseklik</label>
                    <input type="text" class="setting-input" id="topBannerHeight" value="${currentSettings.ads?.topBanner?.height || '90px'}" placeholder="90px">
                </div>
                <div class="setting-item">
                    <label class="setting-label">Arka Plan Rengi</label>
                    <input type="color" class="setting-input" id="topBannerBg" value="${currentSettings.ads?.topBanner?.backgroundColor || '#f0f0f0'}">
                </div>
            </div>

            <div class="settings-section">
                <h2 class="section-title">Alt Banner Reklam</h2>
                <div class="setting-item">
                    <label class="setting-label">Alt Banner'ı Etkinleştir</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="bottomBannerEnabledToggle" ${currentSettings.ads?.bottomBanner?.enabled ? 'checked' : ''}>
                        <label for="bottomBannerEnabledToggle" class="toggle-label"></label>
                    </div>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Reklam Kodu</label>
                    <textarea class="setting-textarea" id="bottomBannerCode" placeholder="Alt banner reklam kodunuzu yapıştırın">${currentSettings.ads?.bottomBanner?.code || ''}</textarea>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Yükseklik</label>
                    <input type="text" class="setting-input" id="bottomBannerHeight" value="${currentSettings.ads?.bottomBanner?.height || '120px'}" placeholder="120px">
                </div>
                <div class="setting-item">
                    <label class="setting-label">Arka Plan Rengi</label>
                    <input type="color" class="setting-input" id="bottomBannerBg" value="${currentSettings.ads?.bottomBanner?.backgroundColor || '#f0f0f0'}">
                </div>
            </div>

            <div class="settings-section">
                <h2 class="section-title">Sol & Sağ Yan Banner Reklam</h2>
                <div class="setting-item">
                    <label class="setting-label">Yan Banner'ları Etkinleştir</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="sidebarBannerEnabledToggle" ${currentSettings.ads?.sidebarBanner?.enabled ? 'checked' : ''}>
                        <label for="sidebarBannerEnabledToggle" class="toggle-label"></label>
                    </div>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Reklam Kodu (Her iki yan için aynı)</label>
                    <textarea class="setting-textarea" id="sidebarBannerCode" placeholder="Yan banner reklam kodunuzu yapıştırın">${currentSettings.ads?.sidebarBanner?.code || ''}</textarea>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Banner Genişliği</label>
                    <input type="text" class="setting-input" id="sidebarBannerWidth" value="${currentSettings.ads?.sidebarBanner?.width || '200px'}" placeholder="200px">
                </div>
                <div class="setting-item">
                    <label class="setting-label">Banner Yüksekliği</label>
                    <input type="text" class="setting-input" id="sidebarBannerHeight" value="${currentSettings.ads?.sidebarBanner?.height || '300px'}" placeholder="300px">
                </div>
                <div class="setting-item">
                    <label class="setting-label">Arka Plan Rengi</label>
                    <input type="color" class="setting-input" id="sidebarBannerBg" value="${currentSettings.ads?.sidebarBanner?.backgroundColor || '#f0f0f0'}">
                </div>
            </div>

            <div class="settings-actions">
                <button class="btn-save" onclick="saveAllAdSettings()">Tüm Reklam Ayarlarını Kaydet</button>
            </div>
        `;
    }

    function getAppearanceSettingsContent() {
        return `
            <div class="settings-section">
                <h2 class="section-title">Tema Ayarları</h2>
                <div class="setting-item">
                    <label class="setting-label">Tema Rengi</label>
                    <input type="color" class="setting-input" value="#ffe047">
                </div>
                <div class="setting-item">
                    <label class="setting-label">Koyu Tema</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="darkThemeToggle" checked>
                        <label for="darkThemeToggle" class="toggle-label"></label>
                    </div>
                </div>
            </div>
        `;
    }

    function getStyleSettingsContent() {
        return `
            <div class="settings-section">
                <h2 class="section-title">Özel CSS</h2>
                <div class="setting-item">
                    <label class="setting-label">Özel Stil Kodu</label>
                    <textarea class="setting-textarea" style="height: 200px;" placeholder="Özel CSS kodlarınızı buraya yazın"></textarea>
                </div>
            </div>
        `;
    }

    function getSEOSettingsContent() {
        return `
            <div class="settings-section">
                <h2 class="section-title">SEO Ayarları</h2>
                <div class="setting-item">
                    <label class="setting-label">Site Başlığı</label>
                    <input type="text" class="setting-input" value="Movieway - Film ve Dizi Rehberi" placeholder="Site başlığınızı girin">
                </div>
                <div class="setting-item">
                    <label class="setting-label">Meta Açıklama</label>
                    <textarea class="setting-textarea" placeholder="Site açıklamanızı yazın">Yasal izleme platformlarındaki filmleri ve dizileri keşfedin.</textarea>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Google Analytics Kodu</label>
                    <textarea class="setting-textarea" placeholder="GA kodunuzu yapıştırın"></textarea>
                </div>
            </div>
        `;
    }

    function getBotSettingsContent() {
        return `
            <div class="settings-section">
                <h2 class="section-title">Bot Ayarları</h2>
                <div class="setting-item">
                    <label class="setting-label">Otomatik Film Çekme</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="autoFetchToggle" checked>
                        <label for="autoFetchToggle" class="toggle-label"></label>
                    </div>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Güncelleme Sıklığı (Saat)</label>
                    <input type="number" class="setting-input" value="6" min="1" max="24">
                </div>
            </div>
        `;
    }

    function getAdvancedSettingsContent() {
        return `
            <div class="settings-section">
                <h2 class="section-title">Gelişmiş Ayarlar</h2>
                <div class="setting-item">
                    <label class="setting-label">Cache Temizle</label>
                    <button class="btn-warning">Cache Temizle</button>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Veritabanı Yedekle</label>
                    <button class="btn-secondary">Yedekle</button>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Sistem Bilgileri</label>
                    <button class="btn-info">Görüntüle</button>
                </div>
            </div>
        `;
    }

    // Alert close functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('alert-close') || e.target.closest('.alert-close')) {
            const alertMessage = document.querySelector('.alert-message');
            if (alertMessage) {
                alertMessage.style.display = 'none';
            }
        }
    });

    // Form save functionality
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('setting-input') || 
            e.target.classList.contains('setting-textarea') ||
            e.target.classList.contains('setting-file')) {
            
            const form = e.target.closest('.settings-section');
            if (form) {
                saveFormData(form);
            }
        }
    });

    // Toggle switch change handlers
    document.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox' && e.target.closest('.toggle-switch')) {
            const form = e.target.closest('.settings-section');
            if (form) {
                saveFormData(form);
            }
        }
    });

    // Save form data
    async function saveFormData(form) {
        const sectionTitle = form.querySelector('.section-title').textContent;
        const sectionMap = {
            'Genel Ayarlar': 'site',
            'Duyuru Ayarları': 'announcement',
            'Ana Sayfa Düzeni': 'homepage',
            'İçerik Ayarları': 'homepage',
            'Header Ayarları': 'header',
            'Footer Ayarları': 'footer',
            'Video Player Ayarları': 'player',
            'Reklam Ayarları': 'ads',
            'Tema Ayarları': 'appearance',
            'SEO Ayarları': 'seo',
            'Bot Ayarları': 'bot'
        };

        const section = sectionMap[sectionTitle] || 'site';
        const formData = new FormData(form);
        const data = {};

        // Collect form data
        for (let [key, value] of formData.entries()) {
            if (key.includes('Toggle') || key.includes('Switch')) {
                data[key.replace('Toggle', '').replace('Switch', '').toLowerCase()] = value === 'on';
            } else {
                data[key.toLowerCase()] = value;
            }
        }

        // Handle specific fields
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                const fieldName = input.id.replace('Toggle', '').replace('Switch', '').toLowerCase();
                data[fieldName] = input.checked;
            } else if (input.type !== 'file') {
                const fieldName = input.name || input.id || input.className.replace('setting-', '');
                if (fieldName && fieldName !== 'setting-input' && fieldName !== 'setting-textarea') {
                    data[fieldName.toLowerCase()] = input.value;
                }
            }
        });

        await saveSettings(section, data);
    }

    // Settings reset functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-reset')) {
            if (confirm('Tüm ayarları sıfırlamak istediğinizden emin misiniz?')) {
                // Reset logic here
                alert('Ayarlar sıfırlandı!');
            }
        }
    });

    // Save all ad settings
    async function saveAllAdSettings() {
        const adSettings = {
            enabled: document.getElementById('adsEnabledToggle')?.checked || false,
            adSenseCode: document.getElementById('adSenseCode')?.value || '',
            topBanner: {
                enabled: document.getElementById('topBannerEnabledToggle')?.checked || false,
                code: document.getElementById('topBannerCode')?.value || '',
                height: document.getElementById('topBannerHeight')?.value || '90px',
                backgroundColor: document.getElementById('topBannerBg')?.value || '#f0f0f0',
                borderRadius: '8px'
            },
            bottomBanner: {
                enabled: document.getElementById('bottomBannerEnabledToggle')?.checked || false,
                code: document.getElementById('bottomBannerCode')?.value || '',
                height: document.getElementById('bottomBannerHeight')?.value || '120px',
                backgroundColor: document.getElementById('bottomBannerBg')?.value || '#f0f0f0',
                borderRadius: '8px'
            },
            sidebarBanner: {
                enabled: document.getElementById('sidebarBannerEnabledToggle')?.checked || false,
                code: document.getElementById('sidebarBannerCode')?.value || '',
                width: document.getElementById('sidebarBannerWidth')?.value || '200px',
                height: document.getElementById('sidebarBannerHeight')?.value || '300px',
                backgroundColor: document.getElementById('sidebarBannerBg')?.value || '#f0f0f0',
                borderRadius: '8px'
            }
        };

        const success = await saveSettings('ads', adSettings);
        if (success) {
            showNotification('Reklam ayarları başarıyla kaydedildi!', 'success');
        }
    }

    // Make saveAllAdSettings globally available
    window.saveAllAdSettings = saveAllAdSettings;
