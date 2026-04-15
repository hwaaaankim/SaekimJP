document.addEventListener('DOMContentLoaded', function () {
    const root = document.getElementById('event-page-root');
    if (!root) return;

    const firstSize = Number(root.dataset.firstSize || 15);
    const nextSize = Number(root.dataset.nextSize || 6);

    const grid = document.getElementById('event-added-grid');
    const countEl = document.getElementById('event-added-total-count');
    const loadMoreBtn = document.getElementById('event-added-load-more-btn');
    const sentinel = document.getElementById('event-added-scroll-sentinel');
    const statusInputs = document.querySelectorAll('input[name="event-added-status"]');

    const state = {
        status: 'all',
        cursorId: null,
        totalCount: 0,
        hasNext: true,
        loading: false,
        initialized: false
    };

    init();

    function init() {
        statusInputs.forEach(function (input) {
            input.addEventListener('change', function () {
                state.status = this.value;
                resetAndLoad();
            });
        });

        loadMoreBtn.addEventListener('click', function () {
            fetchEvents(state.initialized ? nextSize : firstSize);
        });

        window.addEventListener('scroll', throttleScroll);

        resetAndLoad();
    }

    function resetAndLoad() {
        state.cursorId = null;
        state.hasNext = true;
        state.loading = false;
        state.initialized = false;
        grid.innerHTML = '';
        fetchEvents(firstSize);
    }

    async function fetchEvents(size) {
        if (state.loading || !state.hasNext) {
            updateLoadMoreButton();
            return;
        }

        state.loading = true;
        updateLoadMoreButton();

        try {
            const params = new URLSearchParams();
            params.set('status', state.status);
            params.set('size', String(size));
            if (state.cursorId) {
                params.set('cursorId', String(state.cursorId));
            }

            const response = await fetch('/api/events?' + params.toString());
            const result = await response.json();

            if (!response.ok) {
                throw new Error('이벤트 목록을 불러오지 못했습니다.');
            }

            const items = Array.isArray(result.items) ? result.items : [];

            if (!state.initialized) {
                grid.innerHTML = '';
            }

            appendCards(items);
            state.totalCount = result.totalCount || 0;
            state.hasNext = !!result.hasNext;
            state.cursorId = result.nextCursor || null;
            state.initialized = true;

            countEl.textContent = '총 ' + state.totalCount + '건';
            bindReveal();
        } catch (error) {
            if (!state.initialized) {
                grid.innerHTML = `
                    <div class="col-12">
                        <div class="event-added-card event-added-visible">
                            <div class="event-added-card-body">
                                <h3 class="event-added-title">이벤트를 불러오지 못했습니다.</h3>
                                <p class="event-added-summary">잠시 후 다시 시도해 주세요.</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        } finally {
            state.loading = false;
            updateLoadMoreButton();
        }
    }

    function appendCards(items) {
        if (!items.length && !grid.children.length) {
            grid.innerHTML = `
                <div class="col-12">
                    <article class="event-added-card event-added-visible">
                        <div class="event-added-card-body">
                            <h3 class="event-added-title">등록된 이벤트가 없습니다.</h3>
                            <p class="event-added-summary">현재 선택한 조건에 해당하는 이벤트가 없습니다.</p>
                        </div>
                    </article>
                </div>
            `;
            return;
        }

        const html = items.map(createCardHtml).join('');
        grid.insertAdjacentHTML('beforeend', html);
    }

    function createCardHtml(item) {
        const isEnded = item.displayStatus === 'ended';
        const badgeClass = isEnded ? 'event-added-ended' : 'event-added-ongoing';
        const badgeText = isEnded ? '종료' : '진행중';

        const contentHtml = escapeHtml(item.content || '').replace(/\n/g, '<br>');
        const linkHtml = item.hasLink
            ? `<a href="${escapeAttribute(item.linkUrl)}" class="event-added-action-btn">링크 이동</a>`
            : `<span class="event-added-action-empty">링크 없음</span>`;

        return `
            <div class="col-12 col-md-6 col-lg-4 event-added-col">
                <article class="event-added-card event-added-observe">
                    <div class="event-added-thumb-wrap ${isEnded ? 'event-added-ended' : ''}">
                        <img src="${escapeAttribute(item.imageUrl)}" alt="${escapeAttribute(item.title)}">
                        <span class="event-added-number">NO. ${String(item.id).padStart(2, '0')}</span>
                        <span class="event-added-state-badge ${badgeClass}">${badgeText}</span>
                        ${isEnded ? '<span class="event-added-ended-label">EVENT END</span>' : ''}
                    </div>

                    <div class="event-added-card-body">
                        <h3 class="event-added-title">${escapeHtml(item.title)}</h3>
                        <p class="event-added-date">${escapeHtml(item.periodText)} · 등록 ${escapeHtml(item.createdAtText)}</p>
                        <p class="event-added-summary">${contentHtml}</p>

                        <div class="event-added-action">
                            ${linkHtml}
                        </div>
                    </div>
                </article>
            </div>
        `;
    }

    function updateLoadMoreButton() {
        if (state.loading) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = '불러오는 중...';
            return;
        }

        if (!state.hasNext) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = '모든 이벤트를 확인하셨습니다';
            return;
        }

        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = '다음 이벤트 더 보기';
    }

    function bindReveal() {
        const targets = document.querySelectorAll('.event-added-observe:not(.event-added-visible)');
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('event-added-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        targets.forEach(function (target) {
            observer.observe(target);
        });
    }

    let ticking = false;
    function throttleScroll() {
        if (ticking) return;

        ticking = true;
        window.requestAnimationFrame(function () {
            const rect = sentinel.getBoundingClientRect();
            if (rect.top < window.innerHeight + 180) {
                fetchEvents(state.initialized ? nextSize : firstSize);
            }
            ticking = false;
        });
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }
});