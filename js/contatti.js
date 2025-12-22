// Contatti Page Specific JavaScript

// Form submission handling
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = contactForm.querySelector('.btn-submit');
    const btnText = contactForm.querySelector('.btn-text');
    const btnLoading = contactForm.querySelector('.btn-loading');
    const formSuccess = document.getElementById('form-success');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        try {
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                privacy: document.getElementById('privacy').checked
            };
            
            // Here you would normally send the data to your server
            // For now, we'll simulate a successful submission
            await simulateFormSubmission(formData);
            
            // Show success message
            contactForm.style.display = 'none';
            formSuccess.style.display = 'block';
            
            // Reset form
            contactForm.reset();
            
        } catch (error) {
            alert('Si è verificato un errore durante l\'invio del messaggio. Riprova più tardi.');
            console.error('Form submission error:', error);
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}

// Simulate form submission (replace with actual API call)
function simulateFormSubmission(formData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate random success/failure for demo purposes
            const success = Math.random() > 0.2; // 80% success rate for demo
            if (success) {
                resolve({ success: true, message: 'Message sent successfully' });
            } else {
                reject(new Error('Network error'));
            }
        }, 2000); // Simulate 2 second delay
    });
}

// Team member animation
function initTeamAnimation() {
    const teamMembers = document.querySelectorAll('.team-member');
    
    function checkTeam() {
        const triggerBottom = window.innerHeight * 0.8;
        
        teamMembers.forEach((member, index) => {
            const memberTop = member.getBoundingClientRect().top;
            
            if (memberTop < triggerBottom) {
                // Staggered animation
                setTimeout(() => {
                    member.style.opacity = '1';
                    member.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }
    
    // Set initial styles for animation
    teamMembers.forEach(member => {
        member.style.opacity = '0';
        member.style.transform = 'translateY(30px)';
        member.style.transition = 'all 0.6s ease';
    });
    
    // Check on load and scroll
    checkTeam();
    window.addEventListener('scroll', checkTeam);
}

// Smooth scrolling for contact links
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

// Initialize email client
function initEmailClient() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // You can add tracking or analytics here
            console.log('Email link clicked:', this.href);
        });
    });
}

// Initialize phone functionality
function initPhoneFunctionality() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    
    phoneLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // You can add tracking or analytics here
            console.log('Phone link clicked:', this.href);
        });
    });
}

// Initialize all functions
document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initTeamAnimation();
    initSmoothScrolling();
    initEmailClient();
    initPhoneFunctionality();
    
    console.log('Contatti page initialized');
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .team-member {
        animation: fadeInUp 0.6s ease forwards;
    }
`;
document.head.appendChild(style);