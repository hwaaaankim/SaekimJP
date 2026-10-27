/* event.js */

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
                throw new Error('イベント一覧を読み込めませんでした。');
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

            countEl.textContent = '全 ' + state.totalCount + '件';
            bindReveal();
        } catch (error) {
            if (!state.initialized) {
                grid.innerHTML = `
                    <div class="col-12">
                        <div class="event-added-card event-added-visible">
                            <div class="event-added-card-body">
                                <h3 class="event-added-title">イベントを読み込めませんでした。</h3>
                                <p class="event-added-summary">しばらくしてから、もう一度お試しください。</p>
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
                            <h3 class="event-added-title">登録済みのイベントがありません。</h3>
                            <p class="event-added-summary">条件に一致するイベントがありません。</p>
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
        const badgeText = isEnded ? '終了' : '開催中';

        const contentHtml = escapeHtml(item.content || '').replace(/\n/g, '<br>');
        const detailUrl = item.detailPageUrl || ('/eventDetailPage/' + item.id);

        const linkHtml = item.hasLink
            ? `<a href="${escapeAttribute(item.linkUrl)}" class="event-page-second-action-btn event-page-second-link-btn">リンク先へ</a>`
            : `<span class="event-page-second-action-empty">リンクなし</span>`;

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
                        <p class="event-added-date">${escapeHtml(item.periodText)} · 登録 ${escapeHtml(item.createdAtText)}</p>
                        <p class="event-added-summary">${contentHtml}</p>

                        <div class="event-added-action event-page-second-action-wrap">
                            <div class="event-page-second-action-grid">
                                ${linkHtml}
                                <a href="${escapeAttribute(detailUrl)}" class="event-page-second-action-btn event-page-second-detail-btn">
                                    詳しく見る
                                </a>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        `;
    }

    function updateLoadMoreButton() {
        if (state.loading) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = '読み込み中...';
            return;
        }

        if (!state.hasNext) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'すべてのイベントを表示しました';
            return;
        }

        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'イベントをさらに見る';
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