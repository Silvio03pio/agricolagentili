// About Page Specific JavaScript

// Snake Timeline Animation
function initSnakeTimeline() {
    const timelineItems = document.querySelectorAll('.snake-timeline-item');
    
    function checkTimeline() {
        const triggerBottom = window.innerHeight * 0.8;
        
        timelineItems.forEach(item => {
            const itemTop = item.getBoundingClientRect().top;
            
            if (itemTop < triggerBottom) {
                item.classList.add('visible');
            }
        });
    }
    
    // Check on load and scroll
    checkTimeline();
    window.addEventListener('scroll', checkTimeline);
}

// Image Lazy Loading for Snake Timeline
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('.snake-timeline-img');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // Assicurati che l'immagine sia caricata
                    if (img.getAttribute('data-src')) {
                        img.src = img.getAttribute('data-src');
                        img.removeAttribute('data-src');
                    }
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '0px 0px 100px 0px' // Carica le immagini 100px prima che entrino nella viewport
        });
        
        lazyImages.forEach(img => {
            // Usa data-src per il lazy loading
            if (!img.getAttribute('data-src') && img.src) {
                img.setAttribute('data-src', img.src);
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
            }
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
            img.classList.add('loaded');
        });
    }
}

// Smooth scrolling for internal links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Philosophy section animation
function animatePhilosophySection() {
    const philosophySection = document.querySelector('.philosophy');
    
    if (philosophySection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(philosophySection);
    }
}

// Story quote animation
function animateStoryQuote() {
    const storyQuote = document.querySelector('.story-quote');
    
    if (storyQuote) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(storyQuote);
    }
}

// Header scroll effect for about page
function initAboutHeaderScroll() {
    const header = document.querySelector('.header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSnakeTimeline();
    initLazyLoading();
    initSmoothScrolling();
    initAboutHeaderScroll();
    animateStoryQuote();
    
    console.log('About page initialized with snake timeline');
});

// Call the function when window is loaded
window.addEventListener('load', function() {
    animatePhilosophySection();
    
    // Forza il check della timeline dopo il caricamento completo
    setTimeout(() => {
        const timelineItems = document.querySelectorAll('.snake-timeline-item');
        const triggerBottom = window.innerHeight * 0.8;
        
        timelineItems.forEach(item => {
            const itemTop = item.getBoundingClientRect().top;
            
            if (itemTop < triggerBottom) {
                item.classList.add('visible');
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

// Re-init timeline on window resize (debounced)
window.addEventListener('resize', debounce(function() {
    const timelineItems = document.querySelectorAll('.snake-timeline-item');
    const triggerBottom = window.innerHeight * 0.8;
    
    timelineItems.forEach(item => {
        const itemTop = item.getBoundingClientRect().top;
        
        if (itemTop < triggerBottom) {
            item.classList.add('visible');
        }
    });
}, 250));