// ==========================================================
// WATCH-SPORTS PAGE - CLEAN + OPTIMIZED + SKIP LOADER FIXED
// ==========================================================

// Read URL parameters
const urlParams = new URLSearchParams(window.location.search);
const skipLoader = urlParams.get("skipLoader") === "true";

// ----------------------------------------------------------
// LOADER HANDLING
// ----------------------------------------------------------
window.addEventListener("load", () => {
  const loadingScreen = document.querySelector(".loading-screen");
  const loadingProgress = document.querySelector(".loading-progress");
  const menuBtn = document.querySelector(".menu-btn");

  // If skipLoader=true → instantly hide loader
  if (skipLoader) {
    if (loadingScreen) loadingScreen.style.display = "none";
    if (menuBtn) {
      menuBtn.style.opacity = "1";
      menuBtn.style.pointerEvents = "all";
    }
    return;
  }

  // Normal loader animation
  if (loadingScreen && loadingProgress) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setTimeout(() => {
          loadingScreen.style.opacity = "0";
          loadingScreen.style.transition = "opacity 0.5s ease";

          setTimeout(() => {
            loadingScreen.style.display = "none";
            if (menuBtn) {
              menuBtn.style.opacity = "1";
              menuBtn.style.pointerEvents = "all";
            }
          }, 500);
        }, 300);
      }

      loadingProgress.style.width = progress + "%";
    }, 100);
  }
});

// ----------------------------------------------------------
// URL → EMBED PROCESSING
// ----------------------------------------------------------
function getEmbedInfo(url) {
  console.log("Processing URL:", url);

  // YouTube patterns
  const ytPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];
  for (let p of ytPatterns) {
    const m = url.match(p);
    if (m)
      return {
        type: "youtube",
        embedUrl: `https://www.youtube.com/embed/${m[1]}?autoplay=0&rel=0`,
        source: "YouTube",
        isClickable: false
      };
  }

  // Instagram
  if (url.includes("instagram.com")) {
    let clean = url.split("?")[0];
    if (!clean.endsWith("/")) clean += "/";
    return {
      type: "instagram",
      embedUrl: `${clean}embed/`,
      source: "Instagram",
      isClickable: false
    };
  }

  // TikTok
  const tiktok = url.match(/\/video\/(\d+)/);
  if (tiktok) {
    return {
      type: "tiktok",
      embedUrl: `https://www.tiktok.com/embed/v2/${tiktok[1]}`,
      source: "TikTok",
      isClickable: true,
      originalUrl: url
    };
  }

  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo)
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}`,
      source: "Vimeo",
      isClickable: false
    };

  // Twitter/X
  if (url.includes("twitter.com") || url.includes("x.com"))
    return {
      type: "twitter",
      embedUrl: url,
      source: "Twitter/X",
      isClickable: true,
      originalUrl: url
    };

  // Facebook
  if (url.includes("facebook.com") || url.includes("fb.watch"))
    return {
      type: "facebook",
      embedUrl: url,
      source: "Facebook",
      isClickable: true,
      originalUrl: url
    };

  // Direct video
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url))
    return { type: "video", embedUrl: url, source: "Video" };

  // Direct image
  if (/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url))
    return { type: "image", embedUrl: url, source: "Image" };

  // Unknown
  return {
    type: "generic",
    embedUrl: url,
    source: "External",
    isClickable: true,
    originalUrl: url
  };
}

// ----------------------------------------------------------
// CREATE VIDEO CARD
// ----------------------------------------------------------
function createVideoCard(video) {
  const card = document.createElement("div");
  card.className = "video-card";

  const wrapper = document.createElement("div");
  wrapper.className = "video-wrapper";

  const embed = getEmbedInfo(video.originalUrl || video.url);
  console.log("Building:", video.title, embed);

  let html = "";

  const clickable = (elem, url) => {
    elem.style.cursor = "pointer";
    elem.addEventListener("click", () => window.open(url, "_blank"));
  };

  // Types
  switch (embed.type) {
    case "youtube":
    case "vimeo":
    case "instagram":
      html = `<iframe src="${embed.embedUrl}" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
      break;

    case "tiktok":
      html = `
      <div class="tiktok-placeholder" style="background: linear-gradient(135deg,#000,#fe2c55);display:flex;flex-direction:column;justify-content:center;align-items:center;height:100%;border-radius:12px;">
        <p style="font-size:3rem;margin:0;">🎵</p>
        <p style="font-weight:600;color:white;margin:0.25rem 0;">TikTok Video</p>
        <p style="font-size:0.9rem;color:white;opacity:0.8;">Click to view</p>
      </div>`;
      clickable(wrapper, embed.originalUrl);
      break;

    case "twitter":
    case "facebook":
      html = `
      <div class="social-placeholder" style="background:linear-gradient(135deg,#1DA1F2,#0d8bd9);display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;border-radius:12px;">
        <p style="font-size:3rem;margin:0;">${embed.type === "twitter" ? "🐦" : "📘"}</p>
        <p style="font-weight:600;color:white;margin:0.25rem 0;">${embed.source}</p>
        <p style="font-size:0.9rem;color:white;opacity:0.8;">Click to view</p>
      </div>`;
      clickable(wrapper, embed.originalUrl);
      break;

    case "video":
      html = `<video src="${embed.embedUrl}" controls muted preload="metadata" style="border-radius:12px;"></video>`;
      break;

    case "image":
      html = `<img src="${embed.embedUrl}" loading="lazy" style="border-radius:12px;">`;
      break;

    default:
      html = `
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;border-radius:12px;">
          <p style="font-size:3rem;margin:0;">🎬</p>
          <p style="font-weight:600;color:white;margin:0.25rem 0;">${embed.source}</p>
          <p style="font-size:0.9rem;color:white;opacity:0.8;">Click to view</p>
        </div>`;
      clickable(wrapper, embed.originalUrl || video.url);
      break;
  }

  wrapper.innerHTML = html;

  // Badge
  const badge = document.createElement("div");
  badge.className = "platform-badge";
  badge.textContent = embed.source;
  badge.style.cssText =
    "position:absolute;top:10px;right:10px;padding:5px 10px;background:rgba(0,0,0,0.75);color:white;border-radius:6px;font-size:0.7rem;font-weight:700;";
  wrapper.style.position = "relative";
  wrapper.appendChild(badge);

  // Card Text
  const info = document.createElement("div");
  info.className = "video-card-content";
  info.innerHTML = `
      <h3>${video.title}</h3>
      ${video.description ? `<p>${video.description}</p>` : ""}
      <div class="tag-row">
          <span class="tag">${video.category.toUpperCase()}</span>
          <span class="tag secondary">${embed.source}</span>
      </div>
  `;

  card.appendChild(wrapper);
  card.appendChild(info);
  return card;
}

// ----------------------------------------------------------
// FETCH & DISPLAY VIDEOS
// ----------------------------------------------------------
async function loadVideos() {
  const categories = {
    "full-matches": "full-matches-grid",
    highlights: "highlights-grid",
    "old-matches": "old-matches-grid",
    "upcoming-matches": "upcoming-matches-grid"
  };

  try {
    console.log("Fetching videos...");
    const res = await fetch("/api/watch-sports/media");
    if (!res.ok) throw new Error(res.status + " " + res.statusText);

    const videos = await res.json();
    console.log("Loaded:", videos);

    const grouped = {
      "full-matches": [],
      highlights: [],
      "old-matches": [],
      "upcoming-matches": []
    };

    videos.forEach(v => {
      if (grouped[v.category]) grouped[v.category].push(v);
    });

    // Render all categories
    Object.entries(categories).forEach(([cat, gridId]) => {
      const grid = document.getElementById(gridId);
      if (!grid) return;

      grid.innerHTML = "";

      if (grouped[cat].length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <p>📭 No ${cat.replace("-", " ")} available</p>
          </div>`;
        return;
      }

      grouped[cat].forEach(video => grid.appendChild(createVideoCard(video)));
    });
  } catch (err) {
    console.error("VIDEO ERROR:", err);

    Object.values(categories).forEach(id => {
      const grid = document.getElementById(id);
      if (grid)
        grid.innerHTML = `
          <div class="empty-state error">
            <p>❌ Failed to load videos</p>
            <p>${err.message}</p>
            <button onclick="loadVideos()">Retry</button>
          </div>`;
    });
  }
}

// ----------------------------------------------------------
// GSAP ANIMATIONS
// ----------------------------------------------------------
function initAnimations() {
  if (typeof gsap === "undefined") return;

  if (gsap.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".category-section").forEach(section => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 80%"
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power2.out"
    });
  });
}

// ----------------------------------------------------------
// CUSTOM CURSOR
// ----------------------------------------------------------
function initCustomCursor() {
  const cursor = document.querySelector(".cursor");
  const follower = document.querySelector(".cursor-follower");

  if (!cursor || !follower) return;

  let mx = 0,
    my = 0,
    fx = 0,
    fy = 0;

  document.addEventListener("mousemove", e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + "px";
    cursor.style.top = my + "px";
  });

  function tick() {
    fx += (mx - fx) * 0.1;
    fy += (my - fy) * 0.1;
    follower.style.left = fx + "px";
    follower.style.top = fy + "px";
    requestAnimationFrame(tick);
  }
  tick();

  document.querySelectorAll("a, button, .video-card").forEach(el => {
    el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
  });
}

// ----------------------------------------------------------
// MOUSE FOLLOW PARALLAX
// ----------------------------------------------------------
function initMouseFollow() {
  const wrap = document.querySelector(".wireframe");
  const vids = document.querySelectorAll(".wireframe video");
  if (!wrap || vids.length === 0 || typeof gsap === "undefined") return;

  document.addEventListener("mousemove", e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;

    vids.forEach((v, i) => {
      gsap.to(v, {
        x: x * (0.2 + i * 0.05),
        y: y * (0.2 + i * 0.05),
        duration: 1.5,
        ease: "expo.out"
      });
    });
  });
}

// ----------------------------------------------------------
// INIT EVERYTHING
// ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("Watch-Sports Initialized");
  loadVideos();
  initAnimations();
  initCustomCursor();
  initMouseFollow();
});

// Auto-refresh every 5 mins
setInterval(loadVideos, 5 * 60 * 1000);

// Refresh on tab focus
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) loadVideos();
});

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
