document.addEventListener('DOMContentLoaded', () => {

    // 1. ローディング画面の制御 & ヒーローアニメーション
    const loader = document.getElementById('loader');
    const hero = document.getElementById('hero');
    const fixedCta = document.getElementById('fixedCta');

    setTimeout(() => {
        if(loader) {
            loader.classList.add('hidden');
        }
        
        // ローディング後、コピー表示 -> コピー消失 -> ロゴ表示の順にCSSで再生
        setTimeout(() => {
            if(hero) hero.classList.add('revealed');
            
            setTimeout(() => {
                if(fixedCta) fixedCta.classList.add('visible');
            }, 4500);
            
        }, 350);
    }, 1500);

    // 2. キラキラ粒子の生成
    const particlesContainer = document.getElementById('particles-container');
    const particleCount = 20; // 放射線状の光なので少し数を抑えめに

    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }

    function createParticle() {
        if(!particlesContainer) return;
        const particle = document.createElement('div');
        particle.classList.add('sparkle');
        
        // 大きめのサイズ
        const size = Math.random() * 8 + 8; // 8px ~ 16px
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 3 + 2;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}vw`;
        particle.style.top = `${posY}vh`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;

        particlesContainer.appendChild(particle);
    }

    // 3. セクションのフェードイン（金色の波は削除）
    const sections = document.querySelectorAll('.section-target');
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('revealed') && !entry.target.classList.contains('hero')) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(sec => {
        if(!sec.classList.contains('hero')) {
            sectionObserver.observe(sec);
        }
    });

    // 4. FAQアコーディオン
    const faqQuestions = document.querySelectorAll('.faq-q');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            question.classList.toggle('active');
            const answer = question.nextElementSibling;
            if (question.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = "0px";
            }
        });
    });

    // 5. 選ばれる理由のモーダル制御
    const reasonItems = document.querySelectorAll('.reason-item');
    const reasonModal = document.getElementById('reason-modal');
    if (reasonModal) {
        const modalTitle = document.getElementById('reason-modal-title');
        const modalDetail = document.getElementById('reason-modal-detail');
        const closeBtns = document.querySelectorAll('[data-reason-close]');

        reasonItems.forEach(item => {
            item.addEventListener('click', () => {
                const title = item.getAttribute('data-reason-title');
                const detail = item.getAttribute('data-reason-detail');
                if (modalTitle) modalTitle.textContent = title;
                if (modalDetail) modalDetail.textContent = detail;
                
                reasonModal.classList.add('is-open');
                reasonModal.setAttribute('aria-hidden', 'false');
                document.body.classList.add('modal-open');
            });
        });

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                reasonModal.classList.remove('is-open');
                reasonModal.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('modal-open');
            });
        });
    }

});
