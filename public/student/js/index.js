document.getElementById("signupForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  // Check empty fields
  if (!fullname || !email || !password || !confirmPassword) {
    alert("Please fill in all required fields.");
    return;
  }

  // Password validation
  const passRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
  if (!passRegex.test(password)) {
    alert("Password must be at least 8 characters long and include a number and special character.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  // If validation passes → redirect
  window.location.href = "../team.html";
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