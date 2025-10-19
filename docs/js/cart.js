// cart.js - Shared cart logic and prices for all menu pages

// Add all menu item prices here (combined from all pages)
const prices = {
    // Non Veg
    "Chicken Biryani": 120,
    "Egg Curry": 70,
    "Fish Fry": 90,
    "Chicken 65": 100,
    "Mutton Curry": 150,
    "Prawn Fry": 130,
    "Grilled Chicken": 180,
    "Chicken Lollipop": 90,
    // Starters
    "Paneer Tikka": 80,
    "Veg Manchurian": 70,
    "Gobi 65": 70,
    "Fish Fingers": 100,
    "Spring Rolls": 60,
    // Veg
    "Veg Biryani": 60,
    "Idly": 20,
    "Masala Dosa": 35,
    "Karam Dosa": 30,
    "Plain Dosa": 25,
    "Puri": 30,
    "Chapathi": 25,
    "Parota": 25,
    "Curd Rice": 30,
    "Meals": 70,
    // Snacks
    "Samosa": 15,
    "Puffs": 20,
    "Vada": 10,
    "Cutlet": 25,
    "Pakoda": 30,
    "Mirchi Bajji": 30,
    "Spring Roll": 20,
    // Ice Cream
    "Vanilla": 30,
    "Chocolate": 35,
    "Strawberry": 35,
    "Butterscotch": 35,
    "Mango": 35,
    "Pista": 40,
    "Kulfi": 40,
    "Choco Bar": 25,
    // Juice
    "Orange Juice": 25,
    "Apple Juice": 30,
    "Grape Juice": 30,
    "Watermelon Juice": 25,
    "Pineapple Juice": 30,
    "Mango Juice": 30,
    "Lemon Juice": 20,
    "Pomegranate Juice": 35,
    "Carrot Juice": 25,
    "Sprit": 20,
    "Maza": 25,
    "Badham": 35,
    "Pulpi Orange": 30
};

const cart = JSON.parse(localStorage.getItem('cart')) || {};

// Helper: ensure user is authenticated, otherwise redirect to login and return false
function ensureAuthenticatedRedirect() {
    try {
        let token = localStorage.getItem('token');
        if (typeof token === 'string') token = token.trim();
        if (!token || token === 'null' || token === 'undefined' || token === '') {
            console.debug('ensureAuthenticatedRedirect: no valid token found -> redirecting to login');
            alert('Please login to add items to cart!');
            window.location.href = 'user-login.html';
            return false;
        }
        // Require token to be a JWT (three base64url parts). If not, treat as invalid.
        try {
            const parts = token.split('.');
            if (!Array.isArray(parts) || parts.length !== 3) {
                console.debug('ensureAuthenticatedRedirect: token not JWT-shaped -> clearing and redirecting');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.replace('user-login.html');
                return false;
            }

            const payload = parts[1];
            if (payload) {
                const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
                if (decoded.exp && typeof decoded.exp === 'number') {
                    const now = Math.floor(Date.now() / 1000);
                    if (decoded.exp < now) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.replace('user-login.html');
                        return false;
                    }
                }
            }
        } catch (err) {
            console.debug('ensureAuthenticatedRedirect: token decode failed, clearing token', err && err.message);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.replace('user-login.html');
            return false;
        }
        return true;
    } catch (e) {
        window.location.replace('user-login.html');
        return false;
    }
}

function addToCart(item, qtyInputId) {
    if (!ensureAuthenticatedRedirect()) {
        alert('Please login to add items to cart!');
        return;
    }
    
    const qty = parseInt(document.getElementById(qtyInputId).value, 10) || 1;
    if (cart[item]) {
        cart[item] += qty;
        alert(item + " quantity increased to " + cart[item] + " in your cart!");
    } else {
        cart[item] = qty;
        alert(item + " (x" + qty + ") added to your cart!");
    }
    updateCartDisplay();
    saveCart();
}

function increaseInCart(item) {
    if (cart[item]) {
        cart[item] += 1;
        updateCartDisplay();
        saveCart();
    }
}

function decreaseFromCart(item) {
    if (cart[item]) {
        cart[item] -= 1;
        if (cart[item] <= 0) {
            delete cart[item];
        }
        updateCartDisplay();
        saveCart();
    }
}

function removeFromCart(item) {
    if (cart[item]) {
        delete cart[item];
        updateCartDisplay();
        saveCart();
    }
}

function orderNow(item) {
    // If not logged in, require login (check token)
    if (!ensureAuthenticatedRedirect()) return;
    // Add the item to cart (if not already), then go to delivery details page
    if (!cart[item]) {
        cart[item] = 1;
        saveCart();
    }
    window.location.href = 'delivery-details.html';
}

function orderAll() {
    // If not logged in, require login (check token)
    if (!ensureAuthenticatedRedirect()) return;
    if (Object.keys(cart).length === 0) {
        alert("Your cart is empty!");
        return;
    }
    // Go to delivery details page for address, payment, etc.
    window.location.href = 'delivery-details.html';
}

function updateCartDisplay() {
    const el = document.getElementById('cart-items');
    const orderBtn = document.getElementById('order-all-btn');
    let total = 0;
    (async () => {
        const menuItems = await API.getMenuItems();
        const items = Object.keys(cart).map(item => {
            const menuItem = menuItems.find(m => m.name === item);
            const price = menuItem ? menuItem.price : 0;
            const itemTotal = price * cart[item];
            total += itemTotal;
            return `<span class="cart-item">
                <button class="remove-btn" title="Decrease" onclick="decreaseFromCart('${item}')" style="background:#ff6b6b; color:#fff; border-radius:50%; border:none;">-</button>
                ${item} <span style="color:#1e40af;font-weight:600;">₹${price}</span>
                (x${cart[item]})
                <span style="color:#1e40af;">= ₹${itemTotal}</span>
                <button class="remove-btn" title="Increase" onclick="increaseInCart('${item}')" style="background:#22c55e; color:#fff; border-radius:50%; border:none;">+</button>
                <button class="remove-btn" title="Remove" onclick="removeFromCart('${item}')" style="background:#dc2626; color:#fff; border-radius:50%; border:none;">&times;</button>
            </span>`;
        });
        el.innerHTML = items.length
            ? items.join('') + `<div style="margin-top:8px;font-weight:600;">Total: ₹${total}</div>`
            : 'None';
        // Only show order button if there are items and the user is authenticated
        if (!orderBtn) return;
        if (!items.length) {
            orderBtn.style.display = 'none';
        } else {
            const token = API.getToken();
            if (token) {
                orderBtn.style.display = 'block';
                orderBtn.disabled = false;
            } else {
                // show button but disabled with prompt to login for clarity
                orderBtn.style.display = 'block';
                orderBtn.disabled = false; // keep clickable to redirect to login
                orderBtn.addEventListener('click', function redirectToLogin(e) {
                    e.preventDefault();
                    alert('Please login to place your order.');
                    window.location.href = 'user-login.html';
                }, { once: true });
            }
        }
    })();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

document.addEventListener('DOMContentLoaded', updateCartDisplay);

window.prices = prices;