// Mini Backend for Rivenditori Management
class RivenditoriBackend {
    constructor() {
        this.baseURL = 'https://jsonplaceholder.typicode.com'; // Mock API
        this.productsKey = 'rivenditori_products';
        this.ordersKey = 'rivenditori_orders';
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
    }

    async loadProducts() {
        try {
            // In a real app, fetch from your API
            const response = await fetch('/data/rivenditori-products.json');
            const products = await response.json();
            localStorage.setItem(this.productsKey, JSON.stringify(products));
            return products;
        } catch (error) {
            console.error('Error loading products:', error);
            return this.getDefaultProducts();
        }
    }

    getDefaultProducts() {
        return [
            {
                id: 1001,
                nome: "Vino Riserva Privata",
                descrizione: "Riserva speciale esclusiva per rivenditori",
                prezzo: 28.90,
                prezzoOriginale: 35.90,
                immagine: "https://placehold.co/300x400/cccccc/333333/png?text=Riserva+Privata",
                categoria: "Rosso",
                sku: "RV001"
            },
            {
                id: 1002,
                nome: "Olio Extra Vergine Premium",
                descrizione: "Olio di altissima qualità per clienti esigenti",
                prezzo: 22.50,
                prezzoOriginale: 28.00,
                immagine: "https://placehold.co/300x400/cccccc/333333/png?text=Olio+Premium",
                formato: "500ml",
                sku: "RO001"
            }
        ];
    }

    async getProducts() {
        const productsJSON = localStorage.getItem(this.productsKey);
        return productsJSON ? JSON.parse(productsJSON) : await this.loadProducts();
    }

    async getOrders(userId) {
        // Mock orders data
        const orders = [
            {
                id: 1001,
                userId: userId,
                items: [
                    { productId: 1001, quantity: 2, price: 28.90 },
                    { productId: 1002, quantity: 1, price: 22.50 }
                ],
                total: 80.30,
                status: 'completed',
                date: '2024-01-15'
            },
            {
                id: 1002,
                userId: userId,
                items: [
                    { productId: 1001, quantity: 5, price: 28.90 }
                ],
                total: 144.50,
                status: 'processing',
                date: '2024-01-20'
            }
        ];
        return orders;
    }

    async createOrder(orderData) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const newOrder = {
                    id: Date.now(),
                    ...orderData,
                    status: 'pending'
                };
                resolve(newOrder);
            }, 1000);
        });
    }

    async updateUserProfile(userId, profileData) {
        // Simulate profile update
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Profile updated' });
            }, 500);
        });
    }

    async getPriceList(userId) {
        // Return special pricing for this user
        const products = await this.getProducts();
        return products.map(product => ({
            ...product,
            specialPrice: product.prezzo * 0.8 // 20% discount for resellers
        }));
    }

    setupEventListeners() {
        // Order management
        document.addEventListener('orderCreated', this.handleOrderCreated.bind(this));
        document.addEventListener('profileUpdated', this.handleProfileUpdated.bind(this));
    }

    handleOrderCreated(event) {
        console.log('Order created:', event.detail);
        this.sendOrderNotification(event.detail);
    }

    handleProfileUpdated(event) {
        console.log('Profile updated:', event.detail);
        this.updateLocalUserData(event.detail);
    }

    sendOrderNotification(order) {
        // Simulate sending notification
        console.log('Sending order notification for:', order.id);
    }

    updateLocalUserData(userData) {
        const users = JSON.parse(localStorage.getItem('rivenditori_users')) || [];
        const index = users.findIndex(u => u.id === userData.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            localStorage.setItem('rivenditori_users', JSON.stringify(users));
        }
    }

    // Analytics functions
    async getSalesAnalytics(userId) {
        const orders = await this.getOrders(userId);
        return {
            totalSales: orders.reduce((sum, order) => sum + order.total, 0),
            totalOrders: orders.length,
            averageOrder: orders.reduce((sum, order) => sum + order.total, 0) / orders.length,
            popularProducts: this.getPopularProducts(orders)
        };
    }

    getPopularProducts(orders) {
        const productCount = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                productCount[item.productId] = (productCount[item.productId] || 0) + item.quantity;
            });
        });
        return Object.entries(productCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }
}

// Enhanced Rivenditori Auth with backend integration
class EnhancedRivenditoriAuth extends RivenditoriAuth {
    constructor() {
        super();
        this.backend = new RivenditoriBackend();
    }

    async handleLogin() {
        const formData = new FormData(document.getElementById('loginForm'));
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            this.validateEmail(email);
            this.validatePassword(password);

            const user = this.users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                throw new Error('Credenziali non valide');
            }

            // Verify account status with backend
            if (user.status !== 'approved') {
                throw new Error('Account in attesa di approvazione');
            }

            this.currentUser = user;
            this.saveCurrentUser();
            
            // Load reseller-specific data
            await this.loadResellerData();
            
            this.showSuccess('Login effettuato con successo!');
            this.checkAuthState();

        } catch (error) {
            this.showError(error.message);
        }
    }

    async loadResellerData() {
        if (!this.currentUser) return;
        
        try {
            const [products, analytics] = await Promise.all([
                this.backend.getPriceList(this.currentUser.id),
                this.backend.getSalesAnalytics(this.currentUser.id)
            ]);
            
            this.currentUser.products = products;
            this.currentUser.analytics = analytics;
            this.saveCurrentUser();
            
        } catch (error) {
            console.error('Error loading reseller data:', error);
        }
    }

    async handleResellerOrder(productId, quantity) {
        if (!this.currentUser) return;
        
        try {
            const product = this.currentUser.products.find(p => p.id === productId);
            if (!product) throw new Error('Prodotto non trovato');

            const orderData = {
                userId: this.currentUser.id,
                items: [{
                    productId: product.id,
                    quantity: quantity,
                    price: product.specialPrice || product.prezzo
                }],
                total: (product.specialPrice || product.prezzo) * quantity
            };

            const order = await this.backend.createOrder(orderData);
            
            // Emit event for other components
            document.dispatchEvent(new CustomEvent('orderCreated', { detail: order }));
            
            this.showSuccess('Ordine creato con successo!');
            
        } catch (error) {
            this.showError('Errore nella creazione dell\'ordine: ' + error.message);
        }
    }
}

// Initialize enhanced system
const enhancedAuth = new EnhancedRivenditoriAuth();

// Export for global access
window.rivenditoriAuth = enhancedAuth;
window.rivenditoriBackend = enhancedAuth.backend;