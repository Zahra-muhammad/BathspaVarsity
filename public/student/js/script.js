document.addEventListener('DOMContentLoaded', () => {
  // Custom Cursor
  const cursor = document.querySelector('.cursor');
  const cursorFollower = document.querySelector('.cursor-follower');
  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateFollower() {
    const distX = mouseX - followerX;
    const distY = mouseY - followerY;
    
    followerX += distX * 0.1;
    followerY += distY * 0.1;
    
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
    
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  const hoverElements = document.querySelectorAll('a, button, .cta-btn, .event-card, .menu-toggle');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor?.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor?.classList.remove('hover'));
  });


  // ==========================
  // Check if we should skip loader
  // ==========================
  const urlParams = new URLSearchParams(window.location.search);
  const skipLoader = urlParams.has('skipLoader');
  
  const loadingScreen = document.querySelector('.loading-screen');
  const loadingProgress = document.querySelector('.loading-progress');

  if (skipLoader) {
    // Hide loader immediately with no transition
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      loadingScreen.style.visibility = 'hidden';
      loadingScreen.style.display = 'none';
    }
    // Remove skipLoader parameter from URL without reload
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Show menu button immediately
    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn) {
      menuBtn.style.opacity = '1';
      menuBtn.style.pointerEvents = 'auto';
      menuBtn.classList.add('visible');
    }
    
    initAnimations();
  } else {
    // Normal loading animation
    if (loadingScreen && loadingProgress) {
      gsap.to(loadingProgress, {
        width: '100%',
        duration: 2,
        ease: 'power1.inOut',
        onComplete: () => {
          gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => {
              loadingScreen.style.display = 'none';
              initAnimations();
            }
          });
        }
      });
    } else {
      initAnimations();
    }
  }


  // ==========================
  // Main Animation Initialization
  // ==========================
  function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // ===== Hero Section =====
    gsap.from('.hero-title', {
      y: 100,
      opacity: 0,
      duration: 1.2,
      ease: 'power4.out'
    });

    gsap.from('.hero-subtitle', {
      y: 50,
      opacity: 0,
      duration: 1,
      delay: 0.3,
      ease: 'power3.out'
    });

    gsap.from('.cta-btn', {
      y: 50,
      opacity: 0,
      duration: 1,
      delay: 0.5,
      stagger: 0.2,
      ease: 'power3.out'
    });

    gsap.from('.scroll-indicator', {
      opacity: 0,
      duration: 1,
      delay: 1,
      ease: 'power2.out'
    });

    // ===== Navbar =====
    gsap.from('.nav', {
      y: -100,
      opacity: 0,
      duration: 1,
      delay: 0.5,
      ease: 'power3.out'
    });

    // ===== Menu Button =====
    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn && !skipLoader) {
      gsap.to(menuBtn, {
        opacity: 1,
        duration: 1,
        delay: 1.2,
        ease: 'power2.out',
        onStart: () => {
          menuBtn.style.pointerEvents = 'auto';
          menuBtn.classList.add('visible');
        }
      });
    }

    // ===== About Section =====
    gsap.from('.about-content h2', {
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top 70%'
      },
      x: -100,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });

    gsap.from('.about-content p', {
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top 70%'
      },
      x: -100,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      stagger: 0.1,
      ease: 'power3.out'
    });

    gsap.from('.stat-item', {
      scrollTrigger: {
        trigger: '.stats-grid',
        start: 'top 80%'
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'back.out(1.7)'
    });

    gsap.from('.about-image-container', {
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top 70%'
      },
      x: 100,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    });

    // ===== Events Section =====
    gsap.from('.event-card', {
      scrollTrigger: {
        trigger: '.events-grid',
        start: 'top 70%'
      },
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // ===== Hero Video Parallax =====
    gsap.to('.sports-img video', {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      scale: 1.2,
      ease: 'none'
    });

    // ===== Stats Counter =====
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
      const target = stat.textContent;
      const isPercent = target.includes('%');
      const isPlus = target.includes('+');
      const numValue = parseInt(target.replace(/[^0-9]/g, ''));

      ScrollTrigger.create({
        trigger: stat,
        start: 'top 80%',
        onEnter: () => {
          gsap.from(stat, {
            textContent: 0,
            duration: 2,
            ease: 'power1.out',
            snap: { textContent: 1 },
            onUpdate: function () {
              const current = Math.ceil(this.targets()[0].textContent);
              stat.textContent = current + (isPercent ? '%' : '') + (isPlus ? '+' : '');
            }
          });
        }
      });
    });

    // ===== Refresh ScrollTrigger after everything loads =====
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }


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

});