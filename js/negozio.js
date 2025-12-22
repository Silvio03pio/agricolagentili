// Negozio Page Specific JavaScript

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Load products from JSON
async function loadProducts() {
    try {
        showLoading(true);
        const response = await fetch('data/prodotti.json');
        const data = await response.json();
        
        // Combine all products into one array with category info
        products = [
            ...data.vini.map(product => ({ ...product, categoria: 'vini' })),
            ...data.oli.map(product => ({ ...product, categoria: 'oli' }))
        ];
        
        renderProducts(products);
        showLoading(false);
    } catch (error) {
        console.error('Error loading products:', error);
        showLoading(false);
        showNoProducts('Errore nel caricamento dei prodotti');
    }
}

// Render products based on filters
function renderProducts(productsToRender) {
    const grid = document.getElementById('products-grid');
    const noProducts = document.getElementById('no-products');
    
    grid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        noProducts.style.display = 'block';
        return;
    }
    
    noProducts.style.display = 'none';
    
    productsToRender.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
}

// Create product card HTML
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const isWine = product.categoria === 'vini';
    const badgeText = isWine ? 'Vino' : 'Olio';
    const formatText = isWine ? product.categoria : product.formato;
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.immagine}" alt="${product.nome}" loading="lazy">
            <span class="product-badge">${badgeText}</span>
        </div>
        <div class="product-info">
            <div class="product-category">${isWine ? product.categoria : 'Olio EVO'}</div>
            <h3 class="product-title">${product.nome}</h3>
            <p class="product-description">${product.descrizione}</p>
            <div class="product-details">
                <span class="product-price">€${product.prezzo.toFixed(2)}</span>
                <span class="product-format">${formatText}</span>
            </div>
            <div class="product-actions">
                <button class="btn-add-cart" onclick="addToCart(${product.id}, '${product.categoria}')">
                    Aggiungi al carrello
                </button>
                <button class="btn-view-details" onclick="viewProductDetails(${product.id}, '${product.categoria}')">
                    Dettagli
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Filter products based on selected filters
function filterProducts() {
    const categoryFilter = document.getElementById('category-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    
    let filteredProducts = [...products];
    
    // Apply category filter
    if (categoryFilter !== 'tutti') {
        filteredProducts = filteredProducts.filter(product => product.categoria === categoryFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'tutti') {
        if (typeFilter === '500ml') {
            filteredProducts = filteredProducts.filter(product => product.formato === '500ml');
        } else {
            filteredProducts = filteredProducts.filter(product => product.categoria === typeFilter);
        }
    }
    
    // Apply price filter
    if (priceFilter !== 'tutti') {
        const [min, max] = priceFilter.split('-').map(Number);
        
        filteredProducts = filteredProducts.filter(product => {
            if (priceFilter === '25+') {
                return product.prezzo >= 25;
            }
            return product.prezzo >= min && product.prezzo <= max;
        });
    }
    
    // Apply sorting
    switch (sortFilter) {
        case 'nome':
            filteredProducts.sort((a, b) => a.nome.localeCompare(b.nome));
            break;
        case 'prezzo-low':
            filteredProducts.sort((a, b) => a.prezzo - b.prezzo);
            break;
        case 'prezzo-high':
            filteredProducts.sort((a, b) => b.prezzo - a.prezzo);
            break;
    }
    
    renderProducts(filteredProducts);
}

// Add product to cart
function addToCart(productId, category) {
    const product = products.find(p => p.id === productId && p.categoria === category);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId && item.category === category);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.nome,
            price: product.prezzo,
            image: product.immagine,
            category: product.categoria,
            quantity: 1
        });
    }
    
    updateCart();
    showCartNotification();
}

// Update cart UI
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total-price');
    const checkoutBtn = document.querySelector('.btn-checkout');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Il carrello è vuoto</p>';
        checkoutBtn.disabled = true;
        cartTotal.textContent = '€0.00';
        return;
    }
    
    checkoutBtn.disabled = false;
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">€${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, '${item.category}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, '${item.category}', 1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id}, '${item.category}')">✕</button>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = `€${total.toFixed(2)}`;
}

// Update item quantity in cart
function updateQuantity(productId, category, change) {
    const item = cart.find(item => item.id === productId && item.category === category);
    
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId, category);
    } else {
        updateCart();
    }
}

// Remove item from cart
function removeFromCart(productId, category) {
    cart = cart.filter(item => !(item.id === productId && item.category === category));
    updateCart();
}

// Show cart notification
function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = 'Prodotto aggiunto al carrello!';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgb(140, 140, 102);
        color: white;
        padding: 1rem 2rem;
        border-radius: 6px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// View product details (placeholder)
function viewProductDetails(productId, category) {
    alert('Funzione dettagli prodotto sarà implementata presto!');
}

// Show/hide loading spinner
function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = show ? 'block' : 'none';
}

// Show no products message
function showNoProducts(message) {
    const noProducts = document.getElementById('no-products');
    noProducts.innerHTML = `<h3>${message}</h3>`;
    noProducts.style.display = 'block';
}

// Initialize the shop
function initShop() {
    loadProducts();
    updateCart();
    
    // Add event listeners to filters
    document.getElementById('category-filter').addEventListener('change', filterProducts);
    document.getElementById('type-filter').addEventListener('change', filterProducts);
    document.getElementById('price-filter').addEventListener('change', filterProducts);
    document.getElementById('sort-filter').addEventListener('change', filterProducts);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // Cart functionality
    document.getElementById('cart-button').addEventListener('click', toggleCart);
    document.getElementById('close-cart').addEventListener('click', toggleCart);
}

// Reset all filters
function resetFilters() {
    document.getElementById('category-filter').value = 'tutti';
    document.getElementById('type-filter').value = 'tutti';
    document.getElementById('price-filter').value = 'tutti';
    document.getElementById('sort-filter').value = 'nome';
    
    filterProducts();
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('open');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initShop();
    console.log('Negozio page initialized');
});

// Close cart when clicking outside
document.addEventListener('click', function(event) {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartButton = document.getElementById('cart-button');
    
    if (cartSidebar.classList.contains('open') && 
        !cartSidebar.contains(event.target) && 
        !cartButton.contains(event.target)) {
        cartSidebar.classList.remove('open');
    }
});




// ... (codice esistente) ...

// Enhanced filter function
function filterProducts() {
    const categoryFilter = document.getElementById('category-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    const searchFilter = document.getElementById('search-filter').value.toLowerCase();
    
    let filteredProducts = [...products];
    
    // Apply search filter
    if (searchFilter) {
        filteredProducts = filteredProducts.filter(product => 
            product.nome.toLowerCase().includes(searchFilter) ||
            product.descrizione.toLowerCase().includes(searchFilter)
        );
    }
    
    // Apply category filter
    if (categoryFilter !== 'tutti') {
        filteredProducts = filteredProducts.filter(product => product.categoria === categoryFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'tutti') {
        if (typeFilter === '500ml') {
            filteredProducts = filteredProducts.filter(product => product.formato === '500ml');
        } else {
            filteredProducts = filteredProducts.filter(product => product.categoria === typeFilter);
        }
    }
    
    // Apply price filter
    if (priceFilter !== 'tutti') {
        const [min, max] = priceFilter.split('-').map(Number);
        
        filteredProducts = filteredProducts.filter(product => {
            if (priceFilter === '25+') {
                return product.prezzo >= 25;
            }
            return product.prezzo >= min && product.prezzo <= max;
        });
    }
    
    // Apply sorting
    switch (sortFilter) {
        case 'nome':
            filteredProducts.sort((a, b) => a.nome.localeCompare(b.nome));
            break;
        case 'prezzo-low':
            filteredProducts.sort((a, b) => a.prezzo - b.prezzo);
            break;
        case 'prezzo-high':
            filteredProducts.sort((a, b) => b.prezzo - a.prezzo);
            break;
        case 'rilevanza':
            // Simple relevance scoring based on search
            if (searchFilter) {
                filteredProducts.sort((a, b) => {
                    const aScore = getRelevanceScore(a, searchFilter);
                    const bScore = getRelevanceScore(b, searchFilter);
                    return bScore - aScore;
                });
            }
            break;
    }
    
    renderProducts(filteredProducts);
    updateProductCount(filteredProducts.length);
}

function getRelevanceScore(product, searchTerm) {
    let score = 0;
    if (product.nome.toLowerCase().includes(searchTerm)) score += 3;
    if (product.descrizione.toLowerCase().includes(searchTerm)) score += 1;
    if (product.categoria.toLowerCase().includes(searchTerm)) score += 2;
    return score;
}

function updateProductCount(count) {
    const countElement = document.getElementById('products-count');
    if (countElement) {
        countElement.textContent = `${count} prodotti trovati`;
    }
}

// Enhanced cart functionality


function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total-price');
    const checkoutBtn = document.querySelector('.btn-checkout');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Il carrello è vuoto</p>';
        checkoutBtn.disabled = true;
        cartTotal.textContent = '€0.00';
        return;
    }
    
    checkoutBtn.disabled = false;
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">€${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, '${item.category}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, '${item.category}', 1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id}, '${item.category}')">✕</button>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = `€${total.toFixed(2)}`;
}

// Checkout functionality
function initCheckout() {
    const checkoutBtn = document.querySelector('.btn-checkout');
    checkoutBtn.addEventListener('click', handleCheckout);
}

async function handleCheckout() {
  if (cart.length === 0) return;

  const checkoutBtn = document.querySelector('.btn-checkout');

  try {
    if (checkoutBtn) checkoutBtn.disabled = true;

    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart: cart.map(i => ({ id: i.id, quantity: i.quantity }))
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Checkout error');

    window.location.href = data.url;
  } catch (e) {
    alert('Errore durante il checkout: ' + e.message);
    console.error(e);
  } finally {
    if (checkoutBtn) checkoutBtn.disabled = (cart.length === 0);
  }
}



// Initialize enhanced shop
function initShop() {
    loadProducts();
    updateCart();
    initCheckout();
    
    // Add event listeners
    document.getElementById('category-filter').addEventListener('change', filterProducts);
    document.getElementById('type-filter').addEventListener('change', filterProducts);
    document.getElementById('price-filter').addEventListener('change', filterProducts);
    document.getElementById('sort-filter').addEventListener('change', filterProducts);
    document.getElementById('search-filter').addEventListener('input', debounce(filterProducts, 300));
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // Cart functionality
    document.getElementById('cart-button').addEventListener('click', toggleCart);
    document.getElementById('close-cart').addEventListener('click', toggleCart);
}
