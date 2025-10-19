// Real-time Socket.IO client
class RealTimeUpdates {
    constructor() {
        this.socket = null;
        this.init();
    }

    init() {
        // Only connect if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('⚠️ Not connecting to real-time updates - user not logged in');
            return;
        }
        
        // Initialize Socket.IO connection with token for server-side auth
        this.socket = io('http://localhost:3005', { auth: { token } });
        
        this.socket.on('connect', () => {
            console.log('🔄 Connected to real-time updates');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Real-time connection error:', err && err.message ? err.message : err);
            // If auth error, clear socket and avoid retrying silently
            if (err && err.message && err.message.toLowerCase().includes('auth')) {
                this.socket.close();
                this.socket = null;
                console.warn('Real-time disabled: authentication failed');
            }
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from real-time updates');
        });

        // Menu item events
        this.socket.on('menuItemAdded', (menuItem) => {
            this.handleMenuItemAdded(menuItem);
        });

        this.socket.on('menuItemUpdated', (menuItem) => {
            this.handleMenuItemUpdated(menuItem);
        });

        this.socket.on('menuItemDeleted', (data) => {
            this.handleMenuItemDeleted(data.id);
        });

        // Order events
        this.socket.on('newOrder', (order) => {
            this.handleNewOrder(order);
        });

        this.socket.on('orderStatusUpdated', (order) => {
            this.handleOrderStatusUpdated(order);
        });

        this.socket.on('orderCancelled', (data) => {
            this.handleOrderCancelled(data);
        });
    }
    
    // Connect after login
    connectAfterLogin() {
        if (!this.socket) {
            this.init();
        }
    }

    // Menu item handlers
    handleMenuItemAdded(menuItem) {
        // Refresh menu display if on menu page
        if (window.location.pathname.includes('.html') || window.location.pathname === '/') {
            this.refreshMenuItems();
        }
        this.showNotification(`New item added: ${menuItem.name}`, 'success');
    }

    handleMenuItemUpdated(menuItem) {
        // Update specific menu item in DOM
        const itemElement = document.querySelector(`[data-item-id="${menuItem._id}"]`);
        if (itemElement) {
            this.updateMenuItemElement(itemElement, menuItem);
        }
        this.showNotification(`Item updated: ${menuItem.name}`, 'info');
    }

    handleMenuItemDeleted(itemId) {
        // Remove menu item from DOM
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemElement) {
            itemElement.remove();
        }
        this.showNotification('Item removed from menu', 'warning');
    }

    // Order handlers
    handleNewOrder(order) {
        // Refresh orders if on orders page
        if (window.location.pathname.includes('dashboard') || window.location.pathname.includes('orders')) {
            this.refreshOrders();
        }
        this.showNotification(`New order received: ₹${order.totalAmount}`, 'success');
    }

    handleOrderStatusUpdated(order) {
        // Update order status in DOM
        const orderElement = document.querySelector(`[data-order-id="${order._id}"]`);
        if (orderElement) {
            this.updateOrderElement(orderElement, order);
        }
        this.showNotification(`Order ${order._id.slice(-6)} status: ${order.status}`, 'info');
    }

    handleOrderCancelled(data) {
        // Update order status to cancelled
        const orderElement = document.querySelector(`[data-order-id="${data.id}"]`);
        if (orderElement) {
            const statusElement = orderElement.querySelector('.order-status');
            if (statusElement) {
                statusElement.textContent = 'cancelled';
                statusElement.className = 'order-status cancelled';
            }
        }
        this.showNotification('Order cancelled', 'warning');
    }

    // Helper methods
    refreshMenuItems() {
        // Reload menu items from API
        if (typeof loadMenuItems === 'function') {
            loadMenuItems();
        } else {
            // Fallback: reload page after short delay
            setTimeout(() => window.location.reload(), 1000);
        }
    }

    refreshOrders() {
        // Reload orders from API
        if (typeof loadOrders === 'function') {
            loadOrders();
        } else if (typeof loadUserOrders === 'function') {
            loadUserOrders();
        }
    }

    updateMenuItemElement(element, menuItem) {
        // Update menu item display
        const nameEl = element.querySelector('.item-name');
        const priceEl = element.querySelector('.item-price');
        const descEl = element.querySelector('.item-description');
        
        if (nameEl) nameEl.textContent = menuItem.name;
        if (priceEl) priceEl.textContent = `₹${menuItem.price}`;
        if (descEl) descEl.textContent = menuItem.description;
    }

    updateOrderElement(element, order) {
        // Update order status display
        const statusEl = element.querySelector('.order-status');
        if (statusEl) {
            statusEl.textContent = order.status;
            statusEl.className = `order-status ${order.status}`;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add to page
        let container = document.querySelector('.notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize real-time updates when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.realTimeUpdates = new RealTimeUpdates();
});