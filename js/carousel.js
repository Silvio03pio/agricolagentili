// Funzione per inizializzare il carosello semplificato
function initCarousel() {
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const carouselIndicators = document.querySelector('.carousel-indicators');
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    
    let currentSlide = 0;
    let slideInterval;
    
    // Crea gli indicatori
    carouselSlides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('carousel-indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToSlide(index));
        carouselIndicators.appendChild(indicator);
    });
    
    // Funzione per andare a uno slide specifico
    function goToSlide(index) {
        carouselSlides[currentSlide].classList.remove('active');
        document.querySelectorAll('.carousel-indicator')[currentSlide].classList.remove('active');
        
        currentSlide = index;
        
        if (currentSlide >= carouselSlides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = carouselSlides.length - 1;
        
        carouselSlides[currentSlide].classList.add('active');
        document.querySelectorAll('.carousel-indicator')[currentSlide].classList.add('active');
        
        // Riavvia l'intervallo
        restartInterval();
    }
    
    // Funzione per lo slide successivo
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    // Funzione per lo slide precedente
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    // Avvia l'intervallo automatico
    function startInterval() {
        slideInterval = setInterval(nextSlide, 3000); // Cambia slide ogni 3 secondi
    }
    
    // Riavvia l'intervallo
    function restartInterval() {
        clearInterval(slideInterval);
        startInterval();
    }
    
    // Aggiungi event listeners per i controlli
    if (prevButton) prevButton.addEventListener('click', prevSlide);
    if (nextButton) nextButton.addEventListener('click', nextSlide);
    
    // Pausa al passaggio del mouse
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => clearInterval(slideInterval));
        carousel.addEventListener('mouseleave', startInterval);
    }
    
    // Avvia il carosello
    startInterval();
}

// Inizializza il carosello quando il DOM è pronto
document.addEventListener('DOMContentLoaded', initCarousel);