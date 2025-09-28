/**
 * Portfólio Juliane Conceicao - Main JavaScript
 * Funcionalidades: Smooth scroll, animações, navegação ativa, formulários
 */

// ===== CONFIGURAÇÕES E UTILITÁRIOS =====
const CONFIG = {
    animationOffset: 100, // Offset para animações de scroll
    navOffset: 80, // Offset para navegação ativa
    toastDuration: 4000, // Duração do toast em ms
    scrollThrottle: 16, // Throttle para scroll events (60fps)
};

// Função para throttle de eventos
function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
        const currentTime = Date.now();
        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
}

// Função para debounce de eventos
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// ===== DOM ELEMENTS =====
const elements = {
    nav: document.getElementById('nav'),
    navLinks: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('section'),
    contactForm: document.getElementById('contactForm'),
    toast: document.getElementById('toast'),
    toastClose: document.querySelector('.toast-close'),
    aboutText: document.querySelector('.about-text'),
    animatedElements: document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right'),
};

// ===== CLASSE PRINCIPAL DA APLICAÇÃO =====
class PortfolioApp {
    constructor() {
        this.currentSection = '';
        this.isScrolling = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupSmoothScroll();
        this.setupFormValidation();
        this.setupToast();
        this.initializeAnimations();
        this.setupAccessibility();
        
        // Log de inicialização
        console.log('🚀 Portfólio Juliane Conceicao carregado com sucesso!');
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Scroll events
        window.addEventListener('scroll', throttle(this.handleScroll.bind(this), CONFIG.scrollThrottle));
        
        // Resize events
        window.addEventListener('resize', debounce(this.handleResize.bind(this), 250));
        
        // Navigation clicks
        elements.navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });

        // Form submission
        if (elements.contactForm) {
            elements.contactForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Toast close
        if (elements.toastClose) {
            elements.toastClose.addEventListener('click', this.hideToast.bind(this));
        }

        // About text placeholder handling
        if (elements.aboutText) {
            elements.aboutText.addEventListener('focus', this.handleAboutTextFocus.bind(this));
            elements.aboutText.addEventListener('blur', this.handleAboutTextBlur.bind(this));
            elements.aboutText.addEventListener('input', this.handleAboutTextInput.bind(this));
        }

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    // ===== NAVEGAÇÃO E SCROLL =====
    setupSmoothScroll() {
        // Smooth scroll para links internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#' || href === '') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offsetTop = target.offsetTop - CONFIG.navOffset;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    handleNavClick(e) {
        const href = e.target.getAttribute('href');
        if (href && href.startsWith('#') && href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                this.scrollToSection(target);
            }
        }
    }

    scrollToSection(target) {
        const offsetTop = target.offsetTop - CONFIG.navOffset;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }

    handleScroll() {
        this.updateActiveNavigation();
        this.updateNavbarBackground();
    }

    updateActiveNavigation() {
        const scrollPosition = window.scrollY + CONFIG.navOffset;
        
        elements.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                if (this.currentSection !== sectionId) {
                    this.currentSection = sectionId;
                    this.updateNavLinks(sectionId);
                }
            }
        });
    }

    updateNavLinks(activeId) {
        elements.navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            link.classList.toggle('active', href === activeId);
        });
    }

    updateNavbarBackground() {
        const scrolled = window.scrollY > 50;
        elements.nav.style.background = scrolled 
            ? 'rgba(11, 11, 12, 0.95)' 
            : 'rgba(11, 11, 12, 0.9)';
    }

    // ===== INTERSECTION OBSERVER PARA ANIMAÇÕES =====
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: `0px 0px -${CONFIG.animationOffset}px 0px`
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observar elementos animados
        this.observeAnimatedElements();
    }

    observeAnimatedElements() {
        // Adicionar classes de animação aos elementos
        document.querySelectorAll('.project-card').forEach((card, index) => {
            card.classList.add('fade-in');
            card.style.transitionDelay = `${index * 0.1}s`;
            this.intersectionObserver.observe(card);
        });

        document.querySelectorAll('.hero-content, .section-title, .contact-form').forEach(element => {
            element.classList.add('fade-in');
            this.intersectionObserver.observe(element);
        });

        // Observar elementos já marcados com classes de animação
        if (elements.animatedElements) {
            elements.animatedElements.forEach(element => {
                this.intersectionObserver.observe(element);
            });
        }
    }

    // ===== FORMULÁRIO DE CONTATO =====
    setupFormValidation() {
        if (!elements.contactForm) return;

        const inputs = elements.contactForm.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remover erros anteriores
        this.clearFieldError(field);

        // Validações específicas por tipo
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Por favor, insira um e-mail válido';
                }
                break;
            case 'text':
                if (field.hasAttribute('required') && value.length < 2) {
                    isValid = false;
                    errorMessage = 'Este campo deve ter pelo menos 2 caracteres';
                }
                break;
            default:
                if (field.hasAttribute('required') && !value) {
                    isValid = false;
                    errorMessage = 'Este campo é obrigatório';
                }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remover mensagem de erro anterior
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Adicionar nova mensagem de erro
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        field.parentNode.appendChild(errorElement);

        // Estilizar erro
        const style = document.createElement('style');
        style.textContent = `
            .error { border-color: #ff6b6b !important; }
            .error-message { 
                color: #ff6b6b; 
                font-size: 0.875rem; 
                margin-top: 0.25rem; 
                display: block;