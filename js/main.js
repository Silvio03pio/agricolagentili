// Funzioni generali per il sito

// Inizializza le animazioni quando gli elementi entrano nella viewport
function initAnimations() {
    const animatedElements = document.querySelectorAll('.text-content, .image-content, .prodotto-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 1s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Inizializza tutto quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
});