// Olio Page Specific JavaScript

// Animation for process steps
function initProcessStepsAnimation() {
    const processSteps = document.querySelectorAll('.process-step');
    
    function checkSteps() {
        const triggerBottom = window.innerHeight * 0.8;
        
        processSteps.forEach(step => {
            const stepTop = step.getBoundingClientRect().top;
            
            if (stepTop < triggerBottom) {
                step.style.opacity = '1';
                step.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Set initial styles
    processSteps.forEach(step => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(30px)';
        step.style.transition = 'all 0.8s ease';
    });
    
    // Check on load and scroll
    checkSteps();
    window.addEventListener('scroll', checkSteps);
}

// Animation for variety cards
function initVarietyCardsAnimation() {
    const varietyCards = document.querySelectorAll('.variety-card');
    
    function checkCards() {
        const triggerBottom = window.innerHeight * 0.8;
        
        varietyCards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            
            if (cardTop < triggerBottom) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Set initial styles
    varietyCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
    });
    
    // Check on load and scroll
    checkCards();
    window.addEventListener('scroll', checkCards);
}

// Lazy loading for images
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Initialize all functions
document.addEventListener('DOMContentLoaded', function() {
    initProcessStepsAnimation();
    initVarietyCardsAnimation();
    initLazyLoading();
    
    console.log('Olio page initialized');
});

// Parallax effect for CTA section
function initParallax() {
    const ctaSection = document.querySelector('.olio-cta');
    
    if (ctaSection) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            ctaSection.style.backgroundPosition = `center ${rate}px`;
        });
    }
}

// Initialize parallax on load
window.addEventListener('load', function() {
    initParallax();
});