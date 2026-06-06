document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (mobileNav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
            mobileMenuBtn.querySelector('i').classList.remove('fa-xmark');
        });
    });

    // 2. Header Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // 3. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                // Once animate is complete, unobserve
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. Live Store Status Badge
    function updateStoreStatus() {
        const statusText = document.getElementById('store-status');
        const statusDot = document.querySelector('.status-dot');
        
        // Graz Coffee Lab Unjeong Hours:
        // Daily: 08:30 - 22:00
        // Last Order: 21:20
        
        const now = new Date();
        // Since we want standard behavior in the user's timezone:
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours * 60 + minutes;
        
        const openTime = 8 * 60 + 30; // 08:30
        const lastOrderTime = 21 * 60 + 20; // 21:20
        const closeTime = 22 * 60; // 22:00
        
        statusDot.className = 'status-dot'; // Reset classes
        
        if (currentTime >= openTime && currentTime < lastOrderTime) {
            statusDot.classList.add('open');
            statusText.innerHTML = '영업 중 <span style="opacity: 0.6; font-size: 0.75rem; margin-left: 4px;">(08:30 - 22:00)</span>';
        } else if (currentTime >= lastOrderTime && currentTime < closeTime) {
            statusDot.classList.add('open'); // Still open, but warn last order
            statusDot.style.backgroundColor = '#F59E0B'; // Amber
            statusDot.style.boxShadow = '0 0 10px #F59E0B';
            statusText.innerHTML = '<span style="color: #F59E0B; font-weight: 700;">주문 마감 중</span> <span style="opacity: 0.6; font-size: 0.75rem; margin-left: 4px;">(라스트 오더 21:20)</span>';
        } else {
            statusDot.classList.add('closed');
            statusText.innerHTML = '영업 종료 <span style="opacity: 0.6; font-size: 0.75rem; margin-left: 4px;">(오픈 08:30)</span>';
        }
    }
    
    updateStoreStatus();
    // Refresh status every minute
    setInterval(updateStoreStatus, 60000);

    // 5. Virtual Coffee Brewer Widget
    const recipeBtns = document.querySelectorAll('.recipe-btn');
    const brewBtn = document.getElementById('brew-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    const layerTop = document.getElementById('layer-top');
    const layerMiddle = document.getElementById('layer-middle');
    const layerBottom = document.getElementById('layer-bottom');
    
    const labelTop = document.getElementById('label-top');
    const labelMiddle = document.getElementById('label-middle');
    const labelBottom = document.getElementById('label-bottom');
    
    const liquidStream = document.getElementById('liquid-stream');
    const brewerStatus = document.getElementById('brewer-status-display');
    const recipeCardInfo = document.getElementById('recipe-card-info');
    
    let activeRecipe = 'nutty';
    let isBrewing = false;

    // Recipe config data
    const recipes = {
        nutty: {
            name: "너티드롭",
            topLabel: "너티 크림 (Peanut Cream)",
            midLabel: "에스프레소 (Espresso)",
            botLabel: "차가운 우유 (Cold Milk)",
            topClass: "nutty-top",
            midClass: "nutty-middle",
            botClass: "nutty-bottom",
            streamColors: ["#FFF5EA", "#3C2415", "#D2A679"], // bottom -> mid -> top colors
            notes: `
                <h4 class="recipe-card-title">너티드롭 레시피 노트</h4>
                <div class="recipe-notes-list">
                    <div class="recipe-note"><span class="note-lbl">아래층:</span> <span class="note-val">차가운 우유 (부드러운 바디)</span></div>
                    <div class="recipe-note"><span class="note-lbl">중간층:</span> <span class="note-val">진한 스페셜티 에스프레소 샷</span></div>
                    <div class="recipe-note"><span class="note-lbl">위층:</span> <span class="note-val">시그니처 고소한 땅콩 크림 토핑</span></div>
                    <div class="recipe-note"><span class="note-lbl">음용 팁:</span> <span class="note-val">빨대를 쓰지 않고 잔을 기울여 크림과 커피, 우유를 한 번에 들이켜세요.</span></div>
                </div>
            `
        },
        sesame: {
            name: "흑임자드롭",
            topLabel: "흑임자 크림 (Sesame Cream)",
            midLabel: "에스프레소 (Espresso)",
            botLabel: "차가운 우유 (Cold Milk)",
            topClass: "sesame-top",
            midClass: "sesame-middle",
            botClass: "sesame-bottom",
            streamColors: ["#FFF5EA", "#3C2415", "#4A4B4F"],
            notes: `
                <h4 class="recipe-card-title">흑임자드롭 레시피 노트</h4>
                <div class="recipe-notes-list">
                    <div class="recipe-note"><span class="note-lbl">아래층:</span> <span class="note-val">차가운 우유 (부드러운 바디)</span></div>
                    <div class="recipe-note"><span class="note-lbl">중간층:</span> <span class="note-val">진한 스페셜티 에스프레소 샷</span></div>
                    <div class="recipe-note"><span class="note-lbl">위층:</span> <span class="note-val">국산 흑임자의 극강 고소한 크림</span></div>
                    <div class="recipe-note"><span class="note-lbl">음용 팁:</span> <span class="note-val">첫 모금은 고소한 흑임자 크림 본연의 맛을 즐기고, 점차 커피와 섞어 드세요.</span></div>
                </div>
            `
        },
        matcha: {
            name: "말차드롭",
            topLabel: "퓨어 수제 크림 (Pure Cream)",
            midLabel: "부드러운 우유 (Milk Layer)",
            botLabel: "말차 베이스 (Matcha Base)",
            topClass: "matcha-top",
            midClass: "matcha-middle",
            botClass: "matcha-bottom",
            streamColors: ["#3A5F20", "#FFF5EA", "#FFFFFF"],
            notes: `
                <h4 class="recipe-card-title">말차드롭 레시피 노트</h4>
                <div class="recipe-notes-list">
                    <div class="recipe-note"><span class="note-lbl">아래층:</span> <span class="note-val">진한 정통 말차 시럽 베이스</span></div>
                    <div class="recipe-note"><span class="note-lbl">중간층:</span> <span class="note-val">부드럽고 고소한 우유 레이어</span></div>
                    <div class="recipe-note"><span class="note-lbl">위층:</span> <span class="note-val">달콤하고 쫀쫀한 수제 퓨어 크림</span></div>
                    <div class="recipe-note"><span class="note-lbl">음용 팁:</span> <span class="note-val">말차의 쌉쌀함과 크림의 단맛이 만나도록 잔을 크게 기울여 드세요.</span></div>
                </div>
            `
        }
    };

    // Handle Recipe Selector Click
    recipeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isBrewing) return;
            
            recipeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            activeRecipe = btn.dataset.recipe;
            
            // Clear current visuals for clean update
            resetVisuals();
            
            // Update Card Info
            recipeCardInfo.innerHTML = recipes[activeRecipe].notes;
            brewerStatus.textContent = `새 레시피 선택됨: ${recipes[activeRecipe].name}. 'Brew Coffee' 버튼을 눌러 추출을 시작하세요.`;
        });
    });

    function resetVisuals() {
        // Remove color theme classes
        const classesToRemove = [
            'nutty-bottom', 'nutty-middle', 'nutty-top',
            'sesame-bottom', 'sesame-middle', 'sesame-top',
            'matcha-bottom', 'matcha-middle', 'matcha-top',
            'filled'
        ];
        
        [layerBottom, layerMiddle, layerTop].forEach(layer => {
            classesToRemove.forEach(cls => layer.classList.remove(cls));
            layer.style.height = '0%';
        });
        
        liquidStream.className = 'liquid-stream';
        liquidStream.style.opacity = '0';
        liquidStream.style.height = '0';
        
        labelBottom.textContent = '';
        labelMiddle.textContent = '';
        labelTop.textContent = '';
    }

    // Reset button handler
    resetBtn.addEventListener('click', () => {
        if (isBrewing) return;
        resetVisuals();
        brewerStatus.textContent = "초기화되었습니다. 메뉴를 선택하고 브루잉 해보세요!";
    });

    // Coffee Layer Brewing Sequence Animation
    brewBtn.addEventListener('click', () => {
        if (isBrewing) return;
        
        isBrewing = true;
        brewBtn.disabled = true;
        resetBtn.disabled = true;
        recipeBtns.forEach(b => b.style.opacity = '0.6');
        
        resetVisuals();
        
        const config = recipes[activeRecipe];
        brewerStatus.textContent = `시그니처 ${config.name} 브루잉을 시작합니다...`;
        
        // Stage 1: Bottom Layer (Base)
        setTimeout(() => {
            // Setup Stream
            liquidStream.style.backgroundColor = config.streamColors[0];
            liquidStream.classList.add('pouring');
            liquidStream.style.opacity = '1';
            brewerStatus.textContent = `${config.botLabel} 따르는 중...`;
            
            // Fill Bottom
            setTimeout(() => {
                layerBottom.style.height = '33.3%';
                layerBottom.classList.add(config.botClass, 'filled');
                labelBottom.textContent = config.botLabel;
            }, 500);
            
        }, 300);
        
        // Stage 2: Middle Layer (Espresso / Milk)
        setTimeout(() => {
            // Update Stream Color
            liquidStream.style.backgroundColor = config.streamColors[1];
            brewerStatus.textContent = `${config.midLabel} 추출 중...`;
            
            // Fill Middle
            setTimeout(() => {
                layerMiddle.style.height = '33.3%';
                layerMiddle.classList.add(config.midClass, 'filled');
                labelMiddle.textContent = config.midLabel;
            }, 500);
            
        }, 2500);
        
        // Stage 3: Top Layer (Cream)
        setTimeout(() => {
            // Update Stream Color
            liquidStream.style.backgroundColor = config.streamColors[2];
            brewerStatus.textContent = `${config.topLabel} 얹는 중...`;
            
            // Fill Top
            setTimeout(() => {
                layerTop.style.height = '33.4%';
                layerTop.classList.add(config.topClass, 'filled');
                labelTop.textContent = config.topLabel;
            }, 500);
            
        }, 4700);

        // Stage 4: Brewing Complete
        setTimeout(() => {
            liquidStream.classList.remove('pouring');
            liquidStream.style.opacity = '0';
            liquidStream.style.height = '0';
            
            brewerStatus.innerHTML = `<span style="color: var(--brand-blue); font-weight: 700; font-size: 1.05rem;"><i class="fa-solid fa-circle-check"></i> ${config.name} 완성!</span><br><span style="font-size: 0.85rem;">빨대 없이 첫 모금부터 3가지 맛을 깊게 느껴보세요.</span>`;
            
            isBrewing = false;
            brewBtn.disabled = false;
            resetBtn.disabled = false;
            recipeBtns.forEach(b => b.style.opacity = '1');
            
        }, 6500);
    });

    // 6. Hero Slideshow (Every 5 seconds)
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 0) {
        let currentHeroSlide = 0;
        setInterval(() => {
            heroSlides[currentHeroSlide].classList.remove('active');
            currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
            heroSlides[currentHeroSlide].classList.add('active');
        }, 5000);
    }

    // 7. Story Image Slider (Arrows & dots navigation)
    const storyImages = document.querySelectorAll('.story-slider .story-img');
    const prevBtn = document.getElementById('story-prev');
    const nextBtn = document.getElementById('story-next');
    const dots = document.querySelectorAll('.slider-dots .dot');
    let currentStoryImage = 0;

    if (storyImages.length > 0 && prevBtn && nextBtn) {
        function showStoryImage(index) {
            storyImages[currentStoryImage].classList.remove('active');
            dots[currentStoryImage].classList.remove('active');
            
            currentStoryImage = index;
            
            storyImages[currentStoryImage].classList.add('active');
            dots[currentStoryImage].classList.add('active');
        }

        prevBtn.addEventListener('click', () => {
            let nextIndex = currentStoryImage - 1;
            if (nextIndex < 0) nextIndex = storyImages.length - 1;
            showStoryImage(nextIndex);
        });

        nextBtn.addEventListener('click', () => {
            let nextIndex = (currentStoryImage + 1) % storyImages.length;
            showStoryImage(nextIndex);
        });

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                showStoryImage(idx);
            });
        });
        
        // Auto rotate story image every 6s
        let storyInterval = setInterval(() => {
            let nextIndex = (currentStoryImage + 1) % storyImages.length;
            showStoryImage(nextIndex);
        }, 6000);

        // Pause auto-rotation when user clicks controls
        const pauseAuto = () => {
            clearInterval(storyInterval);
        };
        prevBtn.addEventListener('click', pauseAuto);
        nextBtn.addEventListener('click', pauseAuto);
        dots.forEach(d => d.addEventListener('click', pauseAuto));
    }
});
