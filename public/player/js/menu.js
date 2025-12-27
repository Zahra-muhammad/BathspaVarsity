// GSAP Menu Animation
document.addEventListener('DOMContentLoaded', () => {

    
    // Set initial states
    gsap.set('.menu-item', { opacity: 0, x: -50 });
    gsap.set('.social-link', { opacity: 0, y: 30 });
    gsap.set('.menu-footer-text', { opacity: 0, y: 30 });
    gsap.set('.close-btn', { opacity: 0, y: 30 });
    gsap.set('.image-container', { opacity: 0, scale: 0.8 });

    // Create main timeline
    const tl = gsap.timeline();

    // Animate image container first
    tl.to('.image-container', {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'power3.out'
    })
    // Animate menu items with stagger
    .to('.menu-item', {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
    }, '-=0.8')
    // Animate bottom elements
    .to('.social-link', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
    }, '-=0.4')
    .to('.menu-footer-text', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
    }, '-=0.5')
    .to('.close-btn', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
    }, '-=0.4');

    // Get the referring page from document.referrer or close button href
    function getPreviousPage() {
        const closeButton = document.querySelector('.close-button');
        if (closeButton && closeButton.href) {
            // Extract the page from the href
            const url = new URL(closeButton.href, window.location.origin);
            return url.pathname.split('/').pop().split('?')[0];
        }
        
        // Fallback: try to get from referrer
        if (document.referrer) {
            const referrerUrl = new URL(document.referrer);
            const referrerPage = referrerUrl.pathname.split('/').pop();
            if (referrerPage && referrerPage.endsWith('.html')) {
                return referrerPage;
            }
        }
        
        // Default fallback
        return 'student-dashboard.html';
    }

    // Close button functionality with Circle Transition
    const closeBtn = document.querySelector('.close-button');
    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Get the target page
        const targetPage = getPreviousPage();
        
        // Get button position for animation origin
        const btnRect = closeBtn.getBoundingClientRect();
        const centerX = btnRect.left + btnRect.width / 2;
        const centerY = btnRect.top + btnRect.height / 2;
        
        // Calculate the distance to the farthest corner
        const maxDistX = Math.max(centerX, window.innerWidth - centerX);
        const maxDistY = Math.max(centerY, window.innerHeight - centerY);
        const maxRadius = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY) * 2;
        
        // Preload the target page in background
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = 'none';
        iframe.style.zIndex = '1';
        iframe.src = `${targetPage}?skipLoader=true`;
        document.body.appendChild(iframe);
        
        // Set circular clip-path on menu container
        const menuContainer = document.querySelector('.menu-container');
        menuContainer.style.clipPath = `circle(${maxRadius}px at ${centerX}px ${centerY}px)`;
        
        // Wait for page to load
        iframe.onload = () => {
            // Show the preloaded page behind
            gsap.set(iframe, { opacity: 1 });
            
            // Circle shrinking effect only
            gsap.to(menuContainer, {
                clipPath: `circle(0px at ${centerX}px ${centerY}px)`,
                duration: 0.8,
                ease: 'power3.inOut',
                onComplete: () => {
                    // Replace current page with the loaded page
                    window.location.replace(`${targetPage}?skipLoader=true`);
                }
            });
        };
    });

    // Enhanced hover animations for menu items
    const menuLinks = document.querySelectorAll('.menu-link');
    
    menuLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            gsap.to(link, {
                x: 20,
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        link.addEventListener('mouseleave', () => {
            gsap.to(link, {
                x: 0,
                duration: 0.4,
                ease: 'power2.out'
            });
        });
    });

    // Social links hover animation
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            gsap.to(link, {
                y: -3,
                scale: 1.1,
                duration: 0.3,
                ease: 'back.out(1.7)'
            });
        });

        link.addEventListener('mouseleave', () => {
            gsap.to(link, {
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });

    // Subtle parallax effect on image
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    gsap.ticker.add(() => {
        gsap.to('.image-container img', {
            x: mouseX * 10,
            y: mouseY * 10,
            duration: 1,
            ease: 'power2.out'
        });
    });

    
});

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