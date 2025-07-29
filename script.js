class ECommerceStore {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.currentView = 'grid';
        this.priceComparisonEnabled = true;
        
        this.init();
        this.loadSampleProducts();
    }

    init() {
        this.bindEvents();
        this.updateCartCount();
        this.setupErrorHandling();
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Error occurred:', event.error);
            this.showErrorMessage('An unexpected error occurred. Please refresh the page.');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showErrorMessage('Failed to load data. Please check your connection.');
        });
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.insertBefore(errorDiv, document.body.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        document.body.insertBefore(successDiv, document.body.firstChild);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        searchInput.addEventListener('input', () => this.handleSearch());
        searchBtn.addEventListener('click', () => this.handleSearch());
        
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('category-filter')) {
                this.applyFilters();
            }
        });
        
        const priceRange = document.getElementById('priceRange');
        priceRange.addEventListener('input', (e) => {
            document.getElementById('priceValue').textContent = e.target.value;
            this.applyFilters();
        });
        
        const sortSelect = document.getElementById('sortSelect');
        sortSelect.addEventListener('change', () => this.applySorting());
        
        document.getElementById('gridView').addEventListener('click', () => this.changeView('grid'));
        document.getElementById('listView').addEventListener('click', () => this.changeView('list'));
        
        document.getElementById('cartBtn').addEventListener('click', () => this.showCart());
        
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        if (this.priceComparisonEnabled) {
            const comparisonToggle = document.getElementById('enableComparison');
            if (comparisonToggle) {
                comparisonToggle.addEventListener('change', (e) => {
                    this.priceComparisonEnabled = e.target.checked;
                    this.renderProducts();
                });
            }
        }
    }

    async loadSampleProducts() {
        try {
            document.getElementById('loadingSpinner').style.display = 'block';
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.products = this.generateSampleProducts();
            this.filteredProducts = [...this.products];
            this.renderProducts();
            
            document.getElementById('loadingSpinner').style.display = 'none';
        } catch (error) {
            console.error('Error loading products:', error);
            this.showErrorMessage('Failed to load products. Please try again.');
            document.getElementById('loadingSpinner').style.display = 'none';
        }
    }

    generateSampleProducts() {
        const categories = ["Electronics","Fashion","Home & Garden","Health & Beauty","Sports & Outdoors","Toys & Games","Books","Automotive"];
        const products = [];
        const productNames = [
            'Premium Wireless Headphones', 'Smart Fitness Tracker', 'Organic Cotton T-Shirt',
            'Professional Camera Lens', 'Ergonomic Office Chair', 'Stainless Steel Water Bottle',
            'Bluetooth Smart Speaker', 'Yoga Mat Pro', 'Gaming Mechanical Keyboard',
            'LED Desk Lamp', 'Portable Phone Charger', 'Artisan Coffee Beans'
        ];

        productNames.forEach((name, index) => {
            const category = categories[index % categories.length];
            const basePrice = Math.floor(Math.random() * 200) + 20;
            const rating = (Math.random() * 2 + 3).toFixed(1);
            
            products.push({
                id: index + 1,
                name: name,
                category: category,
                price: basePrice,
                originalPrice: this.priceComparisonEnabled ? basePrice + Math.floor(Math.random() * 50) : null,
                rating: parseFloat(rating),
                reviews: Math.floor(Math.random() * 500) + 10,
                image: this.getProductIcon(category),
                description: 'High-quality ' + name.toLowerCase() + ' perfect for your needs.',
                inStock: Math.random() > 0.1
            });
        });

        return products;
    }

    getProductIcon(category) {
        const icons = {
            'Electronics': 'fas fa-laptop',
            'Clothing': 'fas fa-tshirt',
            'Books': 'fas fa-book',
            'Home & Garden': 'fas fa-home',
            'Sports': 'fas fa-dumbbell'
        };
        return icons[category] || 'fas fa-box';
    }

    handleSearch() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        this.filteredProducts = this.products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
        this.renderProducts();
    }

    applyFilters() {
        const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
            .map(cb => cb.value);
        const maxPrice = parseInt(document.getElementById('priceRange').value);

        this.filteredProducts = this.products.filter(product => {
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
            const priceMatch = product.price <= maxPrice;
            return categoryMatch && priceMatch;
        });

        this.applySorting();
    }

    applySorting() {
        const sortBy = document.getElementById('sortSelect').value;
        
        this.filteredProducts.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                default:
                    return 0;
            }
        });

        this.renderProducts();
    }

    changeView(view) {
        this.currentView = view;
        const gridBtn = document.getElementById('gridView');
        const listBtn = document.getElementById('listView');
        const productsGrid = document.getElementById('productsGrid');

        if (view === 'grid') {
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            productsGrid.classList.remove('list-view');
        } else {
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            productsGrid.classList.add('list-view');
        }
    }

    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        
        if (this.filteredProducts.length === 0) {
            productsGrid.innerHTML = '<div class="error-message">No products found matching your criteria.</div>';
            return;
        }

        productsGrid.innerHTML = this.filteredProducts.map(product => {
            const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
            const priceComparison = this.priceComparisonEnabled && product.originalPrice ? 
                '<div class="price-comparison"><span class="competitor-price">Was $' + product.originalPrice.toFixed(2) + '</span><span class="savings">Save $' + (product.originalPrice - product.price).toFixed(2) + '</span></div>' : '';
            
            return '<div class="product-card" data-product-id="' + product.id + '">' +
                '<div class="product-image"><i class="' + product.image + '"></i></div>' +
                '<div class="product-info">' +
                '<h3 class="product-name">' + product.name + '</h3>' +
                '<div class="product-price">$' + product.price.toFixed(2) + '</div>' +
                '<div class="product-rating">' +
                '<span class="stars">' + stars + '</span>' +
                '<span>(' + product.rating + ') - ' + product.reviews + ' reviews</span>' +
                '</div>' +
                priceComparison +
                '<button class="add-to-cart" onclick="store.addToCart(' + product.id + ')" ' + (!product.inStock ? 'disabled' : '') + '>' +
                (product.inStock ? 'Add to Cart' : 'Out of Stock') +
                '</button>' +
                '</div>' +
                '</div>';
        }).join('');
    }

    addToCart(productId) {
        try {
            const product = this.products.find(p => p.id === productId);
            if (!product || !product.inStock) {
                this.showErrorMessage('Product is not available.');
                return;
            }

            const existingItem = this.cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.cart.push({
                    ...product,
                    quantity: 1
                });
            }

            this.updateCartCount();
            this.saveCart();
            this.showSuccessMessage(product.name + ' added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showErrorMessage('Failed to add item to cart.');
        }
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    showCart() {
        const modal = document.getElementById('cartModal');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty.</p>';
            cartTotal.textContent = '0.00';
        } else {
            cartItems.innerHTML = this.cart.map(item => 
                '<div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #eee;">' +
                '<div>' +
                '<h4>' + item.name + '</h4>' +
                '<p>$' + item.price.toFixed(2) + ' x ' + item.quantity + '</p>' +
                '</div>' +
                '<div>' +
                '<button onclick="store.removeFromCart(' + item.id + ')" style="background: #dc3545; color: white; border: none; padding: 0.5rem; border-radius: 3px; cursor: pointer;">Remove</button>' +
                '</div>' +
                '</div>'
            ).join('');

            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = total.toFixed(2);
        }

        modal.style.display = 'block';
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartCount();
        this.saveCart();
        this.showCart();
    }

    closeModal() {
        document.getElementById('cartModal').style.display = 'none';
    }
}

const complianceChecker = {
    checkGDPRCompliance() {
        const userCountry = this.getUserCountry();
        if (['DE', 'GB', 'FR', 'IT', 'ES'].includes(userCountry)) {
            this.showCookieConsent();
        }
    },

    getUserCountry() {
        return 'US';
    },

    showCookieConsent() {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            const banner = document.createElement('div');
            banner.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; background: #333; color: white; padding: 1rem; text-align: center; z-index: 3000;';
            banner.innerHTML = '<p>We use cookies to improve your experience. By continuing to use this site, you agree to our cookie policy.</p>' +
                '<button onclick="this.parentElement.remove(); localStorage.setItem('cookieConsent', 'true')" style="background: #007bff; color: white; border: none; padding: 0.5rem 1rem; margin-left: 1rem; border-radius: 3px; cursor: pointer;">Accept</button>';
            document.body.appendChild(banner);
        }
    }
};

let store;
document.addEventListener('DOMContentLoaded', () => {
    try {
        store = new ECommerceStore();
        complianceChecker.checkGDPRCompliance();
    } catch (error) {
        console.error('Failed to initialize store:', error);
        document.body.innerHTML = '<div class="error-message">Failed to load the store. Please refresh the page.</div>';
    }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed'));
}