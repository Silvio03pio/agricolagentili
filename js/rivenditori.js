// Rivenditori Page Specific JavaScript

class RivenditoriAuth {
    constructor() {
        this.currentUser = null;
        this.usersKey = 'rivenditori_users';
        this.currentUserKey = 'current_rivenditore';
        this.productsKey = 'rivenditori_products';
        this.init();
    }

    init() {
        this.loadUsers();
        this.loadCurrentUser();
        this.setupEventListeners();
        this.checkAuthState();
    }

    loadUsers() {
        const usersJSON = localStorage.getItem(this.usersKey);
        this.users = usersJSON ? JSON.parse(usersJSON) : [];
    }

    saveUsers() {
        localStorage.setItem(this.usersKey, JSON.stringify(this.users));
    }

    loadCurrentUser() {
        const userJSON = localStorage.getItem(this.currentUserKey);
        this.currentUser = userJSON ? JSON.parse(userJSON) : null;
    }

    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem(this.currentUserKey, JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem(this.currentUserKey);
        }
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Password toggle
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.togglePassword(e.target);
            });
        });

        // Modal handling
        this.setupModal();
    }

    switchTab(tabName) {
        // Update tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabName}-form`).classList.add('active');
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

            this.currentUser = user;
            this.saveCurrentUser();
            this.showSuccess('Login effettuato con successo!');
            this.checkAuthState();

        } catch (error) {
            this.showError(error.message);
        }
    }

    async handleRegister() {
        const formData = new FormData(document.getElementById('registerForm'));
        const userData = {
            company: formData.get('company'),
            vat: formData.get('vat'),
            name: formData.get('name'),
            surname: formData.get('surname'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            address: formData.get('address'),
            city: formData.get('city'),
            zip: formData.get('zip'),
            privacy: formData.get('privacy') === 'on'
        };

        try {
            this.validateRegistration(userData);

            // Check if user already exists
            if (this.users.find(u => u.email === userData.email)) {
                throw new Error('Email già registrata');
            }

            if (this.users.find(u => u.vat === userData.vat)) {
                throw new Error('Partita IVA già registrata');
            }

            // Create user object (in a real app, you'd hash the password)
            const newUser = {
                id: Date.now().toString(),
                ...userData,
                createdAt: new Date().toISOString(),
                status: 'pending' // In attesa di verifica
            };

            delete newUser.confirmPassword;
            delete newUser.privacy;

            this.users.push(newUser);
            this.saveUsers();

            this.showSuccess('Registrazione effettuata! In attesa di verifica.');
            this.switchTab('login');

        } catch (error) {
            this.showError(error.message);
        }
    }

    validateRegistration(userData) {
        if (!userData.company || userData.company.length < 2) {
            throw new Error('Nome azienda non valido');
        }

        if (!userData.vat || !/^[0-9]{11}$/.test(userData.vat)) {
            throw new Error('Partita IVA non valida');
        }

        if (!userData.name || userData.name.length < 2) {
            throw new Error('Nome non valido');
        }

        if (!userData.surname || userData.surname.length < 2) {
            throw new Error('Cognome non valido');
        }

        this.validateEmail(userData.email);

        if (!userData.phone || userData.phone.length < 9) {
            throw new Error('Telefono non valido');
        }

        this.validatePassword(userData.password);

        if (userData.password !== userData.confirmPassword) {
            throw new Error('Le password non coincidono');
        }

        if (!userData.address || userData.address.length < 5) {
            throw new Error('Indirizzo non valido');
        }

        if (!userData.city || userData.city.length < 2) {
            throw new Error('Città non valida');
        }

        if (!userData.zip || !/^[0-9]{5}$/.test(userData.zip)) {
            throw new Error('CAP non valido');
        }

        if (!userData.privacy) {
            throw new Error('Devi accettare i termini e condizioni');
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new Error('Email non valida');
        }
    }

    validatePassword(password) {
        if (!password || password.length < 8) {
            throw new Error('La password deve essere di almeno 8 caratteri');
        }
    }

    handleLogout() {
        this.currentUser = null;
        this.saveCurrentUser();
        this.showSuccess('Logout effettuato con successo');
        this.checkAuthState();
    }

    checkAuthState() {
        const authSection = document.querySelector('.auth-section');
        const benefitsSection = document.querySelector('.benefits-section');
        const dashboardSection = document.getElementById('dashboard-section');

        if (this.currentUser) {
            authSection.style.display = 'none';
            benefitsSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            
            // Update user info
            document.getElementById('user-name').textContent = `${this.currentUser.name} ${this.currentUser.surname}`;
            
            // Load products for rivenditori
            this.loadRivenditoriProducts();
        } else {
            authSection.style.display = 'block';
            benefitsSection.style.display = 'block';
            dashboardSection.style.display = 'none';
        }
    }

    loadRivenditoriProducts() {
        // In a real app, you'd fetch this from a server
        const rivenditoriProducts = [
            {
                id: 1001,
                nome: "Vino Riserva Privata",
                descrizione: "Riserva speciale esclusiva per rivenditori",
                prezzo: 28.90,
                prezzoOriginale: 35.90,
                immagine: "https://placehold.co/300x400/cccccc/333333/png?text=Riserva+Privata",
                categoria: "Rosso"
            },
            {
                id: 1002,
                nome: "Olio Extra Vergine Premium",
                descrizione: "Olio di altissima qualità per clienti esigenti",
                prezzo: 22.50,
                prezzoOriginale: 28.00,
                immagine: "https://placehold.co/300x400/cccccc/333333/png?text=Olio+Premium",
                formato: "500ml"
            }
        ];

        const grid = document.getElementById('rivenditori-grid');
        grid.innerHTML = '';

        rivenditoriProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            grid.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const isWine = product.categoria;
        const badgeText = isWine ? 'Vino' : 'Olio';
        const formatText = isWine ? product.categoria : product.formato;
        const discount = product.prezzoOriginale ? 
            Math.round((1 - product.prezzo / product.prezzoOriginale) * 100) : 0;

        card.innerHTML = `
            <div class="product-image">
                <img src="${product.immagine}" alt="${product.nome}" loading="lazy">
                <span class="product-badge">${badgeText}</span>
                ${discount > 0 ? `<span class="product-discount">-${discount}%</span>` : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${isWine ? product.categoria : 'Olio EVO'}</div>
                <h3 class="product-title">${product.nome}</h3>
                <p class="product-description">${product.descrizione}</p>
                <div class="product-details">
                    <div class="product-pricing">
                        <span class="product-price">€${product.prezzo.toFixed(2)}</span>
                        ${product.prezzoOriginale ? 
                            `<span class="product-original-price">€${product.prezzoOriginale.toFixed(2)}</span>` : ''}
                    </div>
                    <span class="product-format">${formatText}</span>
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="rivenditoriAuth.addToCart(${product.id})">
                        Aggiungi al carrello
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    addToCart(productId) {
        // Implement cart functionality for rivenditori
        this.showSuccess('Prodotto aggiunto al carrello!');
    }

    togglePassword(button) {
        const input = button.previousElementSibling;
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        button.textContent = type === 'password' ? '👁️' : '🔒';
    }

    setupModal() {
        const modal = document.getElementById('password-recovery');
        const closeBtn = document.querySelector('.close-modal');
        const recoveryForm = document.getElementById('recoveryForm');

        // Open modal
        document.querySelector('.forgot-password').addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
        });

        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Recovery form
        recoveryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('recovery-email').value;
            this.handlePasswordRecovery(email);
        });
    }

    handlePasswordRecovery(email) {
        this.validateEmail(email);
        
        const user = this.users.find(u => u.email === email);
        if (!user) {
            throw new Error('Email non trovata');
        }

        // In a real app, you'd send a recovery email
        this.showSuccess('Email di recupero inviata!');
        document.getElementById('password-recovery').style.display = 'none';
    }

    showError(message) {
        alert(`Errore: ${message}`);
    }

    showSuccess(message) {
        alert(`Successo: ${message}`);
    }
}

// Initialize the auth system
const rivenditoriAuth = new RivenditoriAuth();

// Additional initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Area Rivenditori page initialized');
});