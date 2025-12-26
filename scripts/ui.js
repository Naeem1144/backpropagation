/**
 * UI Module - Navigation, Theme, Progress, and UX enhancements
 */

// ==========================================================================
// Theme Management
// ==========================================================================
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'dark'); // Default to dark
        this.setTheme(theme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    },
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    },
    
    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        this.setTheme(current === 'dark' ? 'light' : 'dark');
    }
};

// ==========================================================================
// Mobile Navigation
// ==========================================================================
const MobileNav = {
    init() {
        this.toggle = document.querySelector('.mobile-menu-toggle');
        this.nav = document.querySelector('.mobile-nav');
        this.overlay = document.querySelector('.mobile-nav-overlay');
        this.links = document.querySelectorAll('.mobile-nav-links a');
        
        if (!this.toggle) return;
        
        this.toggle.addEventListener('click', () => this.toggleMenu());
        this.overlay?.addEventListener('click', () => this.close());
        
        this.links.forEach(link => {
            link.addEventListener('click', () => this.close());
        });
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    },
    
    isOpen() {
        return this.nav?.classList.contains('active');
    },
    
    toggleMenu() {
        this.toggle?.classList.toggle('active');
        this.nav?.classList.toggle('active');
        this.overlay?.classList.toggle('active');
        document.body.style.overflow = this.isOpen() ? 'hidden' : '';
    },
    
    close() {
        this.toggle?.classList.remove('active');
        this.nav?.classList.remove('active');
        this.overlay?.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// ==========================================================================
// Progress Bar
// ==========================================================================
const ProgressBar = {
    init() {
        this.bar = document.querySelector('.progress-bar');
        if (!this.bar) return;
        
        window.addEventListener('scroll', () => this.update(), { passive: true });
        this.update();
    },
    
    update() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        this.bar.style.width = `${Math.min(100, progress)}%`;
    }
};

// ==========================================================================
// Active Navigation State
// ==========================================================================
const ActiveNav = {
    init() {
        this.sections = document.querySelectorAll('section[id]');
        this.navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a, .toc-list a');
        
        if (this.sections.length === 0) return;
        
        // Intersection Observer for section visibility
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActive(entry.target.id);
                }
            });
        }, {
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        });
        
        this.sections.forEach(section => observer.observe(section));
    },
    
    setActive(sectionId) {
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
};

// ==========================================================================
// Back to Top Button
// ==========================================================================
const BackToTop = {
    init() {
        this.button = document.querySelector('.back-to-top');
        if (!this.button) return;
        
        window.addEventListener('scroll', () => this.toggleVisibility(), { passive: true });
        this.button.addEventListener('click', () => this.scrollToTop());
    },
    
    toggleVisibility() {
        if (window.scrollY > 500) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    },
    
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// ==========================================================================
// Code Copy Buttons
// ==========================================================================
const CodeCopy = {
    init() {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const codeBlock = btn.closest('.code-block');
                const code = codeBlock?.querySelector('pre')?.textContent;
                
                if (code) {
                    try {
                        await navigator.clipboard.writeText(code);
                        btn.classList.add('copied');
                        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied!';
                        
                        setTimeout(() => {
                            btn.classList.remove('copied');
                            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy';
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy:', err);
                    }
                }
            });
        });
    }
};

// ==========================================================================
// Scroll Reveal Animation
// ==========================================================================
const ScrollReveal = {
    init() {
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
            return;
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        });
        
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
};

// ==========================================================================
// Collapsible Sections
// ==========================================================================
const Collapsibles = {
    init() {
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', () => {
                const collapsible = header.closest('.collapsible');
                collapsible?.classList.toggle('open');
            });
            
            // Keyboard support
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                }
            });
        });
    }
};

// ==========================================================================
// Smooth Scroll for Anchor Links
// ==========================================================================
const SmoothScroll = {
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
};

// ==========================================================================
// Section Completion Tracking
// ==========================================================================
const SectionTracker = {
    completedSections: new Set(),
    
    init() {
        // Load from localStorage
        const saved = localStorage.getItem('completedSections');
        if (saved) {
            this.completedSections = new Set(JSON.parse(saved));
            this.updateUI();
        }
        
        // Track when user scrolls past sections
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.8) {
                    this.markComplete(entry.target.id);
                }
            });
        }, {
            threshold: 0.8
        });
        
        document.querySelectorAll('section[id]').forEach(section => {
            observer.observe(section);
        });
    },
    
    markComplete(sectionId) {
        if (!sectionId) return;
        this.completedSections.add(sectionId);
        this.save();
        this.updateUI();
    },
    
    save() {
        localStorage.setItem('completedSections', JSON.stringify([...this.completedSections]));
    },
    
    updateUI() {
        document.querySelectorAll('.toc-list a').forEach(link => {
            const href = link.getAttribute('href');
            const sectionId = href?.replace('#', '');
            if (sectionId && this.completedSections.has(sectionId)) {
                link.classList.add('completed');
            }
        });
    }
};

// ==========================================================================
// Initialize All UI Components
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    MobileNav.init();
    ProgressBar.init();
    ActiveNav.init();
    BackToTop.init();
    CodeCopy.init();
    ScrollReveal.init();
    Collapsibles.init();
    SmoothScroll.init();
    SectionTracker.init();
});

// Export for use in other modules
window.ThemeManager = ThemeManager;
window.SectionTracker = SectionTracker;

