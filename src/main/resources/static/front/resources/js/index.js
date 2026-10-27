/* Main banner: one Swiper owns the fade, progress and Ken Burns effects. */
(function () {
    'use strict';
    const el = document.getElementById('index-main-banner-swiper');
    if (!el || typeof Swiper === 'undefined' || el.swiper) return;
    const count = el.querySelectorAll('.swiper-slide').length;
    const fill = document.querySelector('#main .progress-topbar__fill');
    const circle = el.querySelector('.autoplay-progress svg');
    const number = el.querySelector('.autoplay-progress span');
    const progressWrap = el.querySelector('.autoplay-progress');
    const duration = 5000;
    if (count <= 1) {
        if (progressWrap) progressWrap.hidden = true;
        if (fill) fill.style.width = '100%';
    }
    function update(swiper, time) {
        const ratio = Math.max(0, Math.min(1, (duration - time) / duration));
        if (fill) fill.style.width = (ratio * 100) + '%';
        if (circle) circle.style.setProperty('--progress', ratio);
        if (number) number.textContent = String(Math.max(1, Math.ceil(time / 1000)));
        const active = swiper.slides[swiper.activeIndex];
        const bg = active && active.querySelector('.kb-bg');
        if (bg) bg.style.setProperty('--kb', String(ratio));
    }
    new Swiper(el, {
        slidesPerView: 1,
        loop: count > 1,
        effect: 'fade',
        fadeEffect: { crossFade: true },
        speed: 800,
        allowTouchMove: count > 1,
        autoplay: count > 1 ? { delay: duration, disableOnInteraction: false } : false,
        on: {
            init(swiper) { update(swiper, count > 1 ? duration : 0); },
            slideChangeTransitionStart(swiper) {
                swiper.slides.forEach(slide => {
                    const bg = slide.querySelector('.kb-bg');
                    if (bg) bg.style.setProperty('--kb', '0');
                });
                update(swiper, duration);
            },
            autoplayTimeLeft(swiper, time) { update(swiper, time); }
        }
    });
})();

/* Pause one shared clock when hidden; resume without overlapping intervals. */
(function () {
    'use strict';
    const root = document.querySelector('.system_cnt02 .timeline-wrap');
    if (!root) return;
    const bar = root.querySelector('.circle_progress .bar');
    const value = root.querySelector('.value');
    const backgrounds = root.querySelector('.bg-list_item');
    const control = root.querySelector('#control');
    if (!bar || !value || !backgrounds) return;

    const stages = [
        { label: '担当医による1:1カウンセリング', lines: ['担当医による', '1:1カウンセリング'] },
        { label: '一人ひとりに合わせた治療計画', lines: ['一人ひとりに合わせた', '治療計画'] },
        { label: '手術の実施', lines: ['手術の実施'] },
        { label: '回復期のケア', lines: ['回復期のケア'] },
        { label: 'アフターケア', lines: ['アフターケア'] }
    ];
    const circumference = 2 * Math.PI * 170;
    const activeDuration = 8000;
    const cycleDuration = 9000;
    let elapsed = 0;
    let lastTime = null;
    let frame = null;
    let currentStage = -1;
    bar.style.strokeDasharray = String(circumference);

    function render() {
        const ratio = Math.min(elapsed / activeDuration, 1);
        const stage = Math.min(stages.length - 1, Math.floor(ratio * stages.length));
        bar.style.strokeDashoffset = String(circumference * (1 - ratio));
        if (control) control.value = String(Math.round(ratio * 100));
        if (stage === currentStage) return;
        currentStage = stage;
        root.dataset.timelineStage = String(stage + 1);
        backgrounds.dataset.stage = String(stage + 1);
        backgrounds.classList.remove('tl-bg2', 'tl-bg3', 'tl-bg4', 'tl-bg5');
        for (let i = 2; i <= stage + 1; i++) backgrounds.classList.add('tl-bg' + i);
        backgrounds.querySelectorAll('.bg-pic').forEach((pic, i) => {
            pic.setAttribute('aria-hidden', i === stage ? 'false' : 'true');
        });
        value.setAttribute('aria-label', stages[stage].label);
        value.replaceChildren(...stages[stage].lines.map(line => {
            const span = document.createElement('span');
            span.textContent = line;
            return span;
        }));
        if (value.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            value.getAnimations().forEach(animation => animation.cancel());
            value.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
                { duration: 400, easing: 'ease-out' });
        }
    }
    function tick(now) {
        frame = null;
        if (document.hidden) { lastTime = null; return; }
        if (lastTime !== null) elapsed = (elapsed + now - lastTime) % cycleDuration;
        lastTime = now;
        render();
        frame = requestAnimationFrame(tick);
    }
    function resume() {
        lastTime = null;
        if (frame === null && !document.hidden) frame = requestAnimationFrame(tick);
    }
    function pause() {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        lastTime = null;
    }
    if (control) {
        function seek() {
            const percent = Math.max(0, Math.min(100, control.valueAsNumber || 0));
            elapsed = percent / 100 * activeDuration;
            lastTime = null;
            render();
        }
        control.addEventListener('input', seek);
        control.addEventListener('change', seek);
    }
    document.addEventListener('visibilitychange', () => document.hidden ? pause() : resume());
    window.addEventListener('pagehide', pause);
    window.addEventListener('pageshow', resume);
    render();
    resume();
})();

/* 원본에 있던 도우미 함수들 필요 시 그대로 사용 */
function sampleMessage() { alert('リンク先のページを指定できます。'); }

