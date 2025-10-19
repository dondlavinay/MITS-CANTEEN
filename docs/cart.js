let cart = JSON.parse(localStorage.getItem('cart') || '{}');
let prices = {};

// Load prices from various sources
if (window.prices) {
    prices = window.prices;
} else {
    try {
        prices = JSON.parse(localStorage.getItem('cartPrices') || '{}');
    } catch (e) {
        prices = {};
    }
}

function addToCart(itemName, qtyId) {
    const qty = parseInt(document.getElementById(qtyId).value);
    
    if (cart[itemName]) {
        cart[itemName] += qty;
    } else {
        cart[itemName] = qty;
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function removeFromCart(itemName) {
    delete cart[itemName];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const orderBtn = document.getElementById('order-all-btn');
    
    if (Object.keys(cart).length === 0) {
        cartItems.innerHTML = 'None';
        if (orderBtn) orderBtn.style.display = 'none';
    } else {
        cartItems.innerHTML = Object.keys(cart).map(itemName => 
            `<div class="watchlist-item">
                ${itemName} (${cart[itemName]})
                <button class="remove-btn" onclick="removeFromCart('${itemName}')">×</button>
            </div>`
        ).join('');
        if (orderBtn) orderBtn.style.display = 'block';
    }
}

function orderNow(itemName) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first to place an order');
        window.location.href = 'user-login.html';
        return;
    }
    
    cart[itemName] = 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'delivery-details.html';
}

function orderAll() {
    if (Object.keys(cart).length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first to place an order');
        window.location.href = 'user-login.html';
        return;
    }
    
    window.location.href = 'delivery-details.html';
}

// Initialize cart display on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
});