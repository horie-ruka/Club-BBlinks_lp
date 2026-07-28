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

    // 1-2. ファーストビュー動画背景の自然なループ
    const heroBgVideos = document.querySelectorAll('.hero-bg-video');
    if (heroBgVideos.length) {
        heroBgVideos.forEach(video => {
            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
            video.loop = false;
        });

        if (heroBgVideos.length === 1) {
            heroBgVideos[0].loop = true;
            heroBgVideos[0].play().catch(() => {});
        } else {
            let activeVideoIndex = 0;
            let isCrossFading = false;
            const fadeDurationMs = 1200;
            const fadeBeforeEndSec = 1.35;

            const playFromStart = (video) => {
                try {
                    video.currentTime = 0;
                } catch (error) {
                    // Some mobile browsers block seeking until metadata is ready.
                }
                video.play().catch(() => {});
            };

            const crossFadeToNext = () => {
                if (isCrossFading) return;
                isCrossFading = true;

                const currentVideo = heroBgVideos[activeVideoIndex];
                const nextVideoIndex = activeVideoIndex === 0 ? 1 : 0;
                const nextVideo = heroBgVideos[nextVideoIndex];

                playFromStart(nextVideo);
                nextVideo.classList.add('is-active');

                setTimeout(() => {
                    currentVideo.classList.remove('is-active');
                    currentVideo.pause();
                    activeVideoIndex = nextVideoIndex;
                    isCrossFading = false;
                }, fadeDurationMs);
            };

            heroBgVideos.forEach((video, index) => {
                video.addEventListener('timeupdate', () => {
                    if (index !== activeVideoIndex || isCrossFading || !Number.isFinite(video.duration)) return;
                    if (video.duration > 2 && video.duration - video.currentTime <= fadeBeforeEndSec) {
                        crossFadeToNext();
                    }
                });

                video.addEventListener('ended', () => {
                    if (index === activeVideoIndex && !isCrossFading) {
                        crossFadeToNext();
                    }
                });
            });

            heroBgVideos[0].classList.add('is-active');
            playFromStart(heroBgVideos[0]);
        }
    }

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

    // 3-2. 応募セクション表示中は下部固定CTAを隠す
    const contactSection = document.getElementById('contact');
    if (fixedCta && contactSection) {
        const contactCtaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                fixedCta.classList.toggle('is-contact-hidden', entry.isIntersecting);
            });
        }, {
            root: null,
            threshold: 0.08
        });

        contactCtaObserver.observe(contactSection);
    }

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

    // 5. Web応募フォーム（Web3Forms）
    const applyForm = document.getElementById('applyForm');
    const formStatus = document.getElementById('formStatus');
    if (applyForm) {
        applyForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const submitButton = applyForm.querySelector('.btn-submit');
            const formData = new FormData(applyForm);
            const applicantName = String(formData.get('お名前') || '').trim();
            if (applicantName) {
                formData.set('subject', `【Club BBlinks求人LP】${applicantName}様よりWEB応募がありました`);
            }
            const payload = Object.fromEntries(formData);

            if (formStatus) {
                formStatus.textContent = '送信中です。少々お待ちください。';
                formStatus.className = 'form-status is-sending';
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = '送信中...';
            }

            try {
                const response = await fetch(applyForm.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    applyForm.reset();
                    if (formStatus) {
                        formStatus.textContent = '送信が完了しました。確認後、担当者よりご連絡いたします。';
                        formStatus.className = 'form-status is-success';
                    }
                } else {
                    throw new Error(result.message || '送信に失敗しました。');
                }
            } catch (error) {
                if (formStatus) {
                    formStatus.textContent = '送信できませんでした。時間をおいて再度お試しいただくか、LINEからご連絡ください。';
                    formStatus.className = 'form-status is-error';
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = '送信する';
                }
            }
        });
    }

});
