// Vini Page Specific JavaScript

// Animation for process steps
function initProcessStepsAnimation() {
    const processSteps = document.querySelectorAll('.process-step');
    
    function checkSteps() {
        const triggerBottom = window.innerHeight * 0.8;
        
        processSteps.forEach(step => {
            const stepTop = step.getBoundingClientRect().top;
            
            if (stepTop < triggerBottom) {
                step.classList.add('visible');
            }
        });
    }
    
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
                card.classList.add('visible');
            }
        });
    }
    
    // Check on load and scroll
    checkCards();
    window.addEventListener('scroll', checkCards);
}

// Animation for feature items
function initFeatureItemsAnimation() {
    const featureItems = document.querySelectorAll('.feature-item');
    
    function checkFeatures() {
        const triggerBottom = window.innerHeight * 0.8;
        
        featureItems.forEach((item, index) => {
            const itemTop = item.getBoundingClientRect().top;
            
            if (itemTop < triggerBottom) {
                // Staggered animation
                setTimeout(() => {
                    item.classList.add('visible');
                }, index * 150);
            }
        });
    }
    
    // Check on load and scroll
    checkFeatures();
    window.addEventListener('scroll', checkFeatures);
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
        }, {
            rootMargin: '0px 0px 100px 0px'
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
    initFeatureItemsAnimation();
    initLazyLoading();
    
    console.log('Vini page initialized');
});

// Parallax effect for CTA section
function initParallax() {
    const ctaSection = document.querySelector('.vini-cta');
    
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
    
    // Force check animations after load
    setTimeout(() => {
        const triggerBottom = window.innerHeight * 0.8;
        
        document.querySelectorAll('.process-step, .variety-card, .feature-item').forEach(item => {
            const itemTop = item.getBoundingClientRect().top;
            if (itemTop < triggerBottom) {
                if (item.classList.contains('process-step')) {
                    item.classList.add('visible');
                } else if (item.classList.contains('variety-card')) {
                    item.classList.add('visible');
                } else if (item.classList.contains('feature-item')) {
                    item.classList.add('visible');
                }
            }
        });
    }, 500);
});

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Re-init animations on window resize
window.addEventListener('resize', debounce(function() {
    const triggerBottom = window.innerHeight * 0.8;
    
    document.querySelectorAll('.process-step, .variety-card, .feature-item').forEach(item => {
        const itemTop = item.getBoundingClientRect().top;
        if (itemTop < triggerBottom) {
            if (item.classList.contains('process-step')) {
                item.classList.add('visible');
            } else if (item.classList.contains('variety-card')) {
                item.classList.add('visible');
            } else if (item.classList.contains('feature-item')) {
                item.classList.add('visible');
            }
        }
    });
}, 250));