// Funzione per caricare i componenti (header, footer, etc.)
function loadComponents() {
    // Carica l'header
    fetch('components/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('dynamic-header').innerHTML = data;
            initHeader(); // Inizializza le funzionalità dell'header dopo il caricamento
        });

    // Aggiusta l'opacità del logo nero
            const logoImage = document.querySelector('.logo-image');
            if (logoImage) {
                logoImage.style.filter = 'brightness(0) invert(1)'; // Trasforma logo nero in bianco
            }    
    
    // Carica il footer
    fetch('components/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('dynamic-footer').innerHTML = data;
        });
}

// Inizializza le funzionalità dell'header
function initHeader() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('.header');
    
    // Menu mobile
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Chiudi il menu quando si clicca su un link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Carica i componenti quando il DOM è pronto
document.addEventListener('DOMContentLoaded', loadComponents);