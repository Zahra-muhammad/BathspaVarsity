// ============================================
// EVENTS PAGE - ONLY LOADING ANIMATIONS
// ============================================

(function() {
    'use strict';

    // ============================================
    // INITIALIZATION
    // ============================================
    
    function init() {
        if (typeof gsap === 'undefined') {
            console.error('GSAP not loaded');
            return;
        }

        initCustomCursor();
        initLoadingScreen(); // ONLY THIS HAS ANIMATIONS
        
        // Load data immediately and set up refresh
        loadDataFromStorage();
        setInterval(loadDataFromStorage, 5000);
        setInterval(updateCountdowns, 60000);
    }

    // ============================================
    // CUSTOM CURSOR
    // ============================================
    
    function initCustomCursor() {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');
        
        if (!cursor || !follower) return;

        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        function animate() {
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
            requestAnimationFrame(animate);
        }
        animate();

        // Cursor interactions
        document.querySelectorAll('a, button, .card, .news-card, .event-row').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                follower.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });

        // Add cursor interaction for modal close button and overlay
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('news-modal-close') || 
                e.target.classList.contains('news-modal-overlay')) {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('news-modal-close') || 
                e.target.classList.contains('news-modal-overlay')) {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                follower.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        }, true);
    }

    // ============================================
    // LOADING SCREEN - ONLY ANIMATIONS HERE
    // ============================================
    
    function initLoadingScreen() {
        const loading = document.querySelector('.loading-screen');
        const progress = document.querySelector('.loading-progress');
        const menu = document.querySelector('.menu-btn');

        if (!loading || !progress) return;

        gsap.to(progress, {
            width: '100%',
            duration: 2.5,
            ease: 'power2.inOut',
            onComplete: () => {
                gsap.to(loading, {
                    opacity: 0,
                    duration: 0.8,
                    onComplete: () => {
                        loading.style.display = 'none';
                        if (menu) {
                            gsap.to(menu, {
                                opacity: 1,
                                duration: 1,
                                delay: 0.3,
                                onStart: () => menu.style.pointerEvents = 'auto'
                            });
                        }
                        // NO HERO ANIMATION
                    }
                });
            }
        });
    }

    // ============================================
    // DATA LOADING
    // ============================================
    
    function loadDataFromStorage() {
        console.log('Loading data from localStorage...');
        loadStandings();
        loadNews();
        loadEvents();
    }

    function loadStandings() {
        try {
            const data = localStorage.getItem('bsu-standings');
            console.log('Raw standings data:', data);
            
            const standings = data ? JSON.parse(data) : [];
            console.log('Parsed standings:', standings);
            
            if (standings.length > 0) {
                renderStandings(standings);
            } else {
                console.log('No standings data found');
                showEmpty('standingsTable', 'No standings available');
            }
        } catch (error) {
            console.error('Error loading standings:', error);
            showEmpty('standingsTable', 'Error loading standings');
        }
    }

    function loadNews() {
        try {
            const data = localStorage.getItem('bsu-news');
            const news = data ? JSON.parse(data) : [];
            console.log('Loaded news:', news.length, 'items');
            
            if (news.length > 0) {
                renderNews(news);
            } else {
                showEmpty('newsGrid', 'No news available');
            }
        } catch (error) {
            console.error('Error loading news:', error);
            showEmpty('newsGrid', 'Error loading news');
        }
    }

    function loadEvents() {
        try {
            const data = localStorage.getItem('bsu-events');
            const events = data ? JSON.parse(data) : [];
            console.log('Loaded events:', events.length, 'items');
            
            if (events.length > 0) {
                renderEvents(events);
                updateCountdowns();
            } else {
                showEmpty('eventsList', 'No events available');
            }
        } catch (error) {
            console.error('Error loading events:', error);
            showEmpty('eventsList', 'Error loading events');
        }
    }

    // ============================================
    // RENDERING - NO ANIMATIONS
    // ============================================
    
    function renderStandings(standings) {
        console.log('Rendering standings...', standings);
        
        const tbody = document.querySelector('#standingsTable tbody');
        if (!tbody) {
            console.error('Table tbody not found!');
            return;
        }

        // Sort by points
        standings.sort((a, b) => (b.points || 0) - (a.points || 0));

        // Generate HTML
        const html = standings.map((team, i) => {
            const position = String(i + 1).padStart(2, '0');
            const name = team.name || 'Unknown';
            const played = team.played || 0;
            const wins = team.w || 0;
            const draws = team.d || 0;
            const losses = team.l || 0;
            const points = team.points || 0;
            
            return `
                <tr>
                    <td>${position}</td>
                    <td style="font-weight:600">${name}</td>
                    <td>${played}</td>
                    <td style="color:#34d399">${wins}</td>
                    <td style="color:#f59e0b">${draws}</td>
                    <td style="color:#f87171">${losses}</td>
                    <td style="font-family:'Space Grotesk';font-size:20px;font-weight:600">${points}</td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = html;
        console.log('Standings rendered successfully');
    }

    function renderNews(news) {
        const grid = document.getElementById('newsGrid');
        if (!grid) {
            console.error('News grid not found!');
            return;
        }

        grid.innerHTML = news.map(article => {
            // Check if article has an image
            const hasImage = article.image && article.image.trim() !== '';
            
            // Create the thumbnail with either the uploaded image or a gradient fallback
            const thumbStyle = hasImage 
                ? `background-image: url('${article.image}'); background-size: cover; background-position: center;`
                : `background: linear-gradient(135deg,#6366f1 0%,#a855f7 50%,#ec4899 100%);`;
            
            return `
                <article class="news-card" onclick="showNewsModal('${article.id}')" style="cursor: pointer;">
                    <div class="news-thumb" style="${thumbStyle}"></div>
                    <div class="section-label">${article.cat || 'General'}</div>
                    <h3>${article.title || 'Untitled'}</h3>
                    <div style="color:#888;font-size:0.85rem;margin-top:8px">${article.time || 'Recently'}</div>
                </article>
            `;
        }).join('');
        
        console.log('News rendered successfully');
    }

    // ============================================
    // NEWS MODAL
    // ============================================
    
    window.showNewsModal = function(newsId) {
        try {
            const data = localStorage.getItem('bsu-news');
            const news = data ? JSON.parse(data) : [];
            const article = news.find(n => n.id === newsId);
            
            if (!article) {
                console.error('Article not found');
                return;
            }

            // Create modal if it doesn't exist
            let modal = document.getElementById('newsModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'newsModal';
                modal.className = 'news-modal';
                document.body.appendChild(modal);
            }

            // Check if article has an image
            const hasImage = article.image && article.image.trim() !== '';
            const imageHTML = hasImage 
                ? `<img src="${article.image}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 16px; margin-bottom: 24px;">`
                : '';

            modal.innerHTML = `
                <div class="news-modal-overlay" onclick="closeNewsModal()"></div>
                <div class="news-modal-content">
                    ${imageHTML}
                    <div class="news-modal-badge" style="display: inline-block; padding: 8px 16px; background: rgba(255,255,255,0.1); border-radius: 999px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px; color: #ff8c42;">${article.cat || 'General'}</div>
                    <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 16px; line-height: 1.2;">${article.title || 'Untitled'}</h2>
                    <div style="color: #888; font-size: 0.9rem; margin-bottom: 24px;">${article.time || 'Recently'}</div>
                    <div style="color: #c0c0c0; line-height: 1.8; font-size: 1rem; white-space: pre-wrap;">${article.content || 'No content available'}</div>
                </div>
            `;

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Animate modal in
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
            
        } catch (error) {
            console.error('Error showing modal:', error);
        }
    };

    window.closeNewsModal = function() {
        const modal = document.getElementById('newsModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    };

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeNewsModal();
        }
    });

    function renderEvents(events) {
        const list = document.getElementById('eventsList');
        if (!list) {
            console.error('Events list not found!');
            return;
        }

        events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

        list.innerHTML = events.map(event => {
            const dt = new Date(event.datetime);
            return `
                <div class="event-row">
                    <div class="event">
                        <div>${event.title || 'Untitled'}</div>
                        <div class="meta">${dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • ${dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • ${event.location || 'TBA'}</div>
                    </div>
                    <div class="event-countdown" data-dt="${event.datetime}">--</div>
                </div>
            `;
        }).join('');

        updateCountdowns();
        console.log('Events rendered successfully');
    }

    function showEmpty(id, msg) {
        console.log('Showing empty state for:', id);
        
        // Special handling for standings table
        if (id === 'standingsTable') {
            const tbody = document.querySelector('#standingsTable tbody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:60px 20px;color:#888;"><div style="font-size:3rem;opacity:0.5;">📋</div><p>${msg}</p></td></tr>`;
                return;
            }
        }
        
        // Regular empty state for other elements
        const el = document.getElementById(id);
        if (!el) {
            console.error('Element not found:', id);
            return;
        }
        
        el.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#888;"><div style="font-size:3rem;opacity:0.5;">📋</div><p>${msg}</p></div>`;
    }

    // ============================================
    // COUNTDOWN
    // ============================================
    
    function updateCountdowns() {
        document.querySelectorAll('[data-dt]').forEach(el => {
            const target = new Date(el.getAttribute('data-dt'));
            let diff = Math.max(0, target - new Date());

            if (diff === 0) {
                el.textContent = 'Started';
                el.style.color = '#ff8c42';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            diff -= days * (1000 * 60 * 60 * 24);
            const hours = Math.floor(diff / (1000 * 60 * 60));
            diff -= hours * (1000 * 60 * 60);
            const mins = Math.floor(diff / (1000 * 60));

            if (days > 0) el.textContent = `${days}d ${hours}h`;
            else if (hours > 0) el.textContent = `${hours}h ${mins}m`;
            else el.textContent = `${mins}m`;
        });
    }

    // ============================================
    // DEMO DATA
    // ============================================
    
    function renderDemoData() {
        const teams = [
            { id: 'BSU', name: 'Bath Spa University' },
            { id: 'UWE', name: 'UWE Bristol' },
            { id: 'GU', name: 'Gloucester University' }
        ];

        const matches = [
            { comp: 'Rugby', home: 'BSU', away: 'GU', homeScore: 24, awayScore: 24, status: 'live', clock: '67:43' },
            { comp: 'Football', home: 'BSU', away: 'UWE', homeScore: 3, awayScore: 1, status: 'final', clock: 'FT' }
        ];

        const stats = [
            { id: 'winRate', label: 'Win Rate', value: 75, max: 100 },
            { id: 'goals', label: 'Goals Scored', value: 42, max: 60 },
            { id: 'perf', label: 'Performance Index', value: 88, max: 100 }
        ];

        // Render matches
        const matchList = document.getElementById('matchesList');
        if (matchList) {
            matchList.innerHTML = matches.map(m => {
                const home = teams.find(t => t.id === m.home);
                const away = teams.find(t => t.id === m.away);
                return `
                    <div class="card">
                        <div class="match-header">
                            <span class="status ${m.status}">${m.status.toUpperCase()}</span>
                            <span class="meta">${m.clock} • ${m.comp}</span>
                        </div>
                        <div class="match">
                            <div class="team">
                                <div class="name">${home?.name || m.home}</div>
                                <div class="score">${m.homeScore}</div>
                            </div>
                            <div class="vs">vs</div>
                            <div class="team">
                                <div class="name">${away?.name || m.away}</div>
                                <div class="score">${m.awayScore}</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Render stats - NO ANIMATIONS
        const statsGrid = document.getElementById('statsGrid');
        if (statsGrid) {
            statsGrid.innerHTML = stats.map(s => {
                const percentage = (s.value / s.max) * 100;
                return `
                    <div class="card stat">
                        <div class="label">${s.label}</div>
                        <div class="value">${s.value}${s.id === 'winRate' ? '%' : ''}</div>
                        <div class="bar"><i style="width:${percentage}%"></i></div>
                    </div>
                `;
            }).join('');
        }
    }

    // ============================================
    // START
    // ============================================
    
    if (document.readyState !== 'loading') {
        init();
        renderDemoData();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            renderDemoData();
        });
    }

}) ();

 // ==========================
  // Menu Button Circle Transition
  // ==========================
  const menuBtn = document.querySelector('.menu-btn');
  
  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get the target menu page from href
      const targetUrl = menuBtn.getAttribute('href');
      
      if (!targetUrl) return;
      
      // Create expanding circle element
      const circle = document.createElement('div');
      circle.className = 'menu-transition-circle';
      circle.style.cssText = `
        position: fixed;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: #000;
        z-index: 9999;
        pointer-events: none;
        transform: translate(-50%, -50%);
      `;
      document.body.appendChild(circle);
      
      // Get button position for circle origin
      const btnRect = menuBtn.getBoundingClientRect();
      const centerX = btnRect.left + btnRect.width / 2;
      const centerY = btnRect.top + btnRect.height / 2;
      
      // Position circle at button center
      gsap.set(circle, {
        left: centerX,
        top: centerY,
        xPercent: -50,
        yPercent: -50
      });
      
      // Calculate size needed to cover screen
      const maxDimension = Math.max(window.innerWidth, window.innerHeight) * 2.5;
      
      // Animate the circle expansion
      gsap.to(circle, {
        width: maxDimension,
        height: maxDimension,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
          // Navigate to menu page with skipLoader parameter
          window.location.href = targetUrl + '?skipLoader=true';
        }
      });
    });
  }


  // ==========================
  // Smooth Scroll for Anchors
  // ==========================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });


  // ==========================
  // Menu Toggle
  // ==========================
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
    });
  }
