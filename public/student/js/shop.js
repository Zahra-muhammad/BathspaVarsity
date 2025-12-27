// Loader & Hero animations
const loadingScreen = document.querySelector(".loading-screen");
const loadingProgress = document.querySelector(".loading-progress");
const menuBtn = document.querySelector(".menu-btn");
const cartBtn = document.getElementById("openCart");
const cartSidebar = document.getElementById("cartSidebar");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cart-count");

// Custom Cursor - ONLY if elements exist
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

if (cursor && cursorFollower) {
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

  const hoverElements = document.querySelectorAll('a, button, .btncard');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// Initially hide menu and cart buttons
if (menuBtn) {
  menuBtn.style.opacity = 0;
  menuBtn.style.pointerEvents = "none";
}
if (cartBtn) {
  cartBtn.style.opacity = 0;
  cartBtn.style.pointerEvents = "none";
}

// Loading animation
const urlParams = new URLSearchParams(window.location.search);
const skipLoader = urlParams.get("skipLoader") === "true";

if (skipLoader || !loadingScreen) {
  if (loadingScreen) loadingScreen.style.display = "none";
  if (menuBtn) {
    menuBtn.style.opacity = 1;
    menuBtn.style.pointerEvents = "auto";
  }
  if (cartBtn) {
    cartBtn.style.opacity = 1;
    cartBtn.style.pointerEvents = "auto";
  }
} else if (loadingProgress && typeof gsap !== 'undefined') {
  gsap.to(loadingProgress, {
    width: "100%",
    duration: 2,
    ease: "power1.inOut",
    onComplete: () => {
      gsap.to(loadingScreen, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          loadingScreen.style.display = "none";
          if (menuBtn) {
            menuBtn.style.opacity = 1;
            menuBtn.style.pointerEvents = "auto";
          }
          if (cartBtn) {
            cartBtn.style.opacity = 1;
            cartBtn.style.pointerEvents = "auto";
          }
        }
      });
    }
  });
}

/* ---------------- LOAD PRODUCTS FROM DATABASE ---------------- */

let allProducts = [];
let productsLoaded = false;

async function loadProducts() {
  if (productsLoaded) {
    console.log('⚠️ Products already loaded, skipping...');
    return;
  }
  
  try {
    console.log('📡 Fetching products from database...');
    const response = await fetch('/shop/products');
    
    if (response.ok) {
      allProducts = await response.json();
      productsLoaded = true;
      console.log('✅ Loaded', allProducts.length, 'products from database');
      displayProductsByCategory();
    } else {
      console.error('❌ Failed to load products, status:', response.status);
    }
  } catch (err) {
    console.error('❌ Error loading products:', err);
  }
}

function displayProductsByCategory() {
  const containers = document.querySelectorAll('.container');
  
  if (containers.length < 3) {
    console.warn('⚠️ Not enough containers found. Expected at least 3, found:', containers.length);
    return;
  }

  console.log('📦 Containers found:', containers.length);

  // Get products by category
  const sportsFestJackets = allProducts.filter(p => p.category === 'Sports Fest Jackets');
  const varsityJackets = allProducts.filter(p => p.category === 'Varsity Jackets');
  const jerseys = allProducts.filter(p => p.category === 'Jerseys');
  const accessories = allProducts.filter(p => p.category === 'Accessories');
  
  console.log('🏷️ Products by category:');
  console.log('  - Sports Fest Jackets:', sportsFestJackets.length);
  console.log('  - Varsity Jackets:', varsityJackets.length);
  console.log('  - Jerseys:', jerseys.length);
  console.log('  - Accessories:', accessories.length);
  
  // Function to create product card HTML
  function createProductCard(product) {
    // Ensure image URL is properly formatted
    let imageUrl = product.image;
    
    // If it's a Cloudinary URL, use it directly
    if (imageUrl && imageUrl.startsWith('http')) {
      // Already a full URL, use as is
    } else if (imageUrl && imageUrl.startsWith('/')) {
      // Already has leading slash
    } else if (imageUrl) {
      // Add leading slash for relative paths
      imageUrl = '/' + imageUrl;
    } else {
      // Fallback image
      imageUrl = '/img/placeholder.png';
    }
    
    return `
      <div class="card">
        <img src="${imageUrl}" 
             alt="${product.name}" 
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27300%27 height=%27300%27%3E%3Crect fill=%27%23ddd%27 width=%27300%27 height=%27300%27/%3E%3Ctext fill=%27%23999%27 font-size=%2720%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27%3ENo Image%3C/text%3E%3C/svg%3E';">
        <div class="title">${product.name}</div>
        <div class="subtitle">${product.subtitle || 'Premium Quality'}</div>
        <div class="price">${product.price} AED</div>
        <a href="#" class="btncard" data-id="${product._id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</a>
      </div>
    `;
  }
  
  // Display Sports Fest Jackets - Container index 1
  if (sportsFestJackets.length > 0 && containers[1]) {
    const html = sportsFestJackets.map(product => createProductCard(product)).join('');
    containers[1].insertAdjacentHTML('beforeend', html);
    console.log('✅ Added', sportsFestJackets.length, 'Sports Fest Jackets to container[1]');
  }
  
  // Display Varsity Jackets - Container index 2
  if (varsityJackets.length > 0 && containers[2]) {
    const html = varsityJackets.map(product => createProductCard(product)).join('');
    containers[2].insertAdjacentHTML('beforeend', html);
    console.log('✅ Added', varsityJackets.length, 'Varsity Jackets to container[2]');
  }
  
  // Display Jerseys - Container index 3 (if exists)
  if (jerseys.length > 0 && containers[3]) {
    const html = jerseys.map(product => createProductCard(product)).join('');
    containers[3].insertAdjacentHTML('beforeend', html);
    console.log('✅ Added', jerseys.length, 'Jerseys to container[3]');
  }
  
  // Display Accessories - Container index 4 (if exists)
  if (accessories.length > 0 && containers[4]) {
    const html = accessories.map(product => createProductCard(product)).join('');
    containers[4].insertAdjacentHTML('beforeend', html);
    console.log('✅ Added', accessories.length, 'Accessories to container[4]');
  }
  
  // Re-attach event listeners to ALL buttons
  attachCartListeners();
  
  console.log('🎯 Product display complete!');
}

// Load products ONCE when page loads
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Page loaded, initializing products...');
  loadProducts();
});

/* ---------------- CART FUNCTIONALITY ---------------- */

let cart = [];

// Load cart from localStorage on page load
function loadCart() {
  try {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
      console.log('📦 Loaded', cart.length, 'items from saved cart');
      renderCart();
    }
  } catch (err) {
    console.error('Error loading cart:', err);
    cart = [];
  }
}

// Save cart to localStorage
function saveCart() {
  try {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
  } catch (err) {
    console.error('Error saving cart:', err);
  }
}

function renderCart() {
  if (!cartItems) return;
  
  cartItems.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.5);">Your cart is empty</div>';
  }

  cart.forEach((item, index) => {
    total += item.price;

    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <span>${item.name}</span>
      <span>${item.price.toFixed(2)} AED</span>
      <button class="remove-btn" data-index="${index}">✖</button>
    `;
    cartItems.appendChild(div);
  });

  if (cartTotal) cartTotal.textContent = total.toFixed(2);
  if (cartCount) cartCount.textContent = cart.length;

  // Remove item buttons
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      const removedItem = cart[index];
      cart.splice(index, 1);
      saveCart();
      renderCart();
      console.log('🗑️ Removed from cart:', removedItem.name);
    });
  });
}

// Open/Close Cart
if (cartBtn) {
  cartBtn.addEventListener("click", () => {
    if (cartSidebar) {
      cartSidebar.classList.add("active");
      renderCart();
    }
  });
}

if (closeCart) {
  closeCart.addEventListener("click", () => {
    if (cartSidebar) cartSidebar.classList.remove("active");
  });
}

// Close cart when clicking outside
if (cartSidebar) {
  cartSidebar.addEventListener("click", (e) => {
    if (e.target === cartSidebar) {
      cartSidebar.classList.remove("active");
    }
  });
}

// Attach cart listeners to ALL buttons
function attachCartListeners() {
  const buttons = document.querySelectorAll(".btncard");
  
  console.log('🔘 Attaching cart listeners to', buttons.length, 'buttons');
  
  buttons.forEach(btn => {
    // Remove old listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Get product data from button attributes
      const name = newBtn.dataset.name || newBtn.closest('.card').querySelector('.title')?.textContent || 'Unknown Product';
      const priceText = newBtn.dataset.price || newBtn.closest('.card').querySelector('.price')?.textContent || '0';
      const price = parseFloat(priceText.toString().replace(/[^0-9.]/g, ''));

      // Validate price
      if (isNaN(price) || price <= 0) {
        console.error('❌ Invalid price for product:', name, 'Price text:', priceText);
        alert('Error: Invalid product price');
        return;
      }

      // Add to cart
      cart.push({ name, price });
      saveCart();
      renderCart();
      
      console.log('✅ Added to cart:', name, '-', price, 'AED');
      
      // Show feedback
      const originalText = newBtn.textContent;
      const originalBg = newBtn.style.background;
      newBtn.textContent = 'Added! ✓';
      newBtn.style.background = '#2ed573';
      newBtn.style.pointerEvents = 'none';
      
      setTimeout(() => {
        newBtn.textContent = originalText;
        newBtn.style.background = originalBg;
        newBtn.style.pointerEvents = 'auto';
      }, 1500);
    });
  });
}

// Load cart when page loads
window.addEventListener('DOMContentLoaded', () => {
  loadCart();
});

// Optional: Add checkout functionality
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    // Here you can add checkout logic
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const confirmation = confirm(`Total: ${total.toFixed(2)} AED\n\nProceed to checkout?`);
    
    if (confirmation) {
      console.log('🛒 Checkout initiated with', cart.length, 'items');
      // Add your checkout logic here (e.g., redirect to payment page)
      alert('Checkout feature coming soon!');
    }
  });
}

// Optional: Clear cart functionality
const clearCartBtn = document.getElementById('clearCartBtn');
if (clearCartBtn) {
  clearCartBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Cart is already empty!');
      return;
    }
    
    const confirmation = confirm('Are you sure you want to clear your cart?');
    if (confirmation) {
      cart = [];
      saveCart();
      renderCart();
      console.log('🗑️ Cart cleared');
    }
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

}

