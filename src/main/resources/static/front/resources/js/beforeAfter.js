/* beforeAfter.js */
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const page = document.getElementById('before-after-page');
    if (!page) {
        return;
    }

    const listUrl = page.dataset.listUrl || '/api/beforeAfter';
    const initialLimit = parseInt(page.dataset.initialLimit || '20', 10);
    const appendLimit = parseInt(page.dataset.appendLimit || '8', 10);

    const categoryMap = {
        all: '전체',
        eye: '눈',
        young: '동안',
        contour: '윤곽',
        nose: '코'
    };

    const VIEW_SLOTS = [
        {
            key: 'front',
            label: '정면',
            beforeUrlField: 'beforeFrontImageUrl',
            afterUrlField: 'afterFrontImageUrl'
        },
        {
            key: 'angle45',
            label: '45도',
            beforeUrlField: 'beforeAngle45ImageUrl',
            afterUrlField: 'afterAngle45ImageUrl'
        },
        {
            key: 'angle90',
            label: '90도',
            beforeUrlField: 'beforeAngle90ImageUrl',
            afterUrlField: 'afterAngle90ImageUrl'
        }
    ];

    const grid = document.getElementById('before-after-grid');
    const totalCountEl = document.getElementById('before-after-total-count');
    const loadMoreBtn = document.getElementById('before-after-load-more-btn');
    const sentinel = document.getElementById('before-after-scroll-sentinel');
    const filterInputs = document.querySelectorAll('input[name="before-after-category"]');

    let currentCategory = 'all';
    let nextOffset = 0;
    let loading = false;
    let hasNext = true;
    let loadedItems = [];
    let currentLayoutCapacity = getLayoutCapacity();
    let revealObserver = null;
    let scrollObserver = null;
    let resizeTimer = null;

    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return '';
        }

        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function hasText(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }

    function getLayoutCapacity() {
        if (window.matchMedia('(max-width: 767.98px)').matches) {
            return 1;
        }

        if (window.matchMedia('(max-width: 991.98px)').matches) {
            return 3;
        }

        return 6;
    }

    async function request(url) {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json'
            }
        });

        let data;

        try {
            data = await response.json();
        } catch (error) {
            throw new Error('전후사진 응답을 확인하지 못했습니다.');
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || '전후사진 데이터를 불러오지 못했습니다.');
        }

        return data.data;
    }

    function getAvailableViews(item) {
        return VIEW_SLOTS.filter(function(view) {
            return hasText(item[view.beforeUrlField]) && hasText(item[view.afterUrlField]);
        });
    }

    function prepareItems(items) {
        return (Array.isArray(items) ? items : [])
            .map(function(item) {
                const views = getAvailableViews(item);

                return {
                    item: item,
                    views: views,
                    viewCount: views.length
                };
            })
            .filter(function(prepared) {
                if (prepared.viewCount < 1 || prepared.viewCount > 3) {
                    console.warn('표시 가능한 Before·After 이미지 쌍이 없는 항목을 제외했습니다.', prepared.item);
                    return false;
                }

                return true;
            });
    }

    function canTakePattern(buckets, pattern) {
        const required = {};

        pattern.forEach(function(size) {
            required[size] = (required[size] || 0) + 1;
        });

        return Object.keys(required).every(function(sizeText) {
            const size = Number(sizeText);
            return buckets[size] && buckets[size].length >= required[size];
        });
    }

    function takePattern(buckets, pattern) {
        return pattern.map(function(size) {
            return buckets[size].shift();
        });
    }

    /**
     * 데스크톱에서는 6칸을 기준으로 3+3, 2+2+2, 1×6을 우선 구성하고,
     * 남은 항목만 3+2+1 같은 혼합 조합으로 채웁니다.
     * 안내 제목이나 시점별 별도 섹션은 만들지 않고 하나의 연속 목록으로 렌더링합니다.
     */
    function packItemsIntoRows(preparedItems, capacity) {
        if (capacity <= 1) {
            return preparedItems.map(function(prepared) {
                return [prepared];
            });
        }

        const buckets = {
            1: [],
            2: [],
            3: []
        };

        preparedItems.forEach(function(prepared) {
            buckets[Math.min(prepared.viewCount, capacity)].push(prepared);
        });

        const rows = [];
        const preferredPatterns = capacity === 6
            ? [
                [3, 3],
                [2, 2, 2],
                [3, 2, 1],
                [3, 1, 1, 1],
                [2, 2, 1, 1],
                [2, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1]
            ]
            : [
                [3],
                [2, 1],
                [1, 1, 1]
            ];

        preferredPatterns.forEach(function(pattern) {
            while (canTakePattern(buckets, pattern)) {
                rows.push(takePattern(buckets, pattern));
            }
        });

        while (buckets[3].length || buckets[2].length || buckets[1].length) {
            const row = [];
            let remaining = capacity;

            [3, 2, 1].forEach(function(size) {
                while (buckets[size].length && size <= remaining) {
                    row.push(buckets[size].shift());
                    remaining -= size;
                }
            });

            if (row.length === 0) {
                const fallbackSize = [3, 2, 1].find(function(size) {
                    return buckets[size].length > 0;
                });

                if (!fallbackSize) {
                    break;
                }

                row.push(buckets[fallbackSize].shift());
            }

            rows.push(row);
        }

        return rows;
    }

    function createImagePanel(imageUrl, altText, label) {
        return `
            <div class="before-after-card-panel">
                <img src="${escapeHtml(imageUrl)}"
                    alt="${escapeHtml(altText)}"
                    loading="lazy"
                    decoding="async"
                    data-before-after-image>
                <div class="before-after-card-image-error" aria-hidden="true">
                    이미지를 불러올 수 없습니다.
                </div>
                <span class="before-after-card-label">${escapeHtml(label)}</span>
            </div>
        `;
    }

    function createViewBlock(item, view) {
        const beforeUrl = item[view.beforeUrlField];
        const afterUrl = item[view.afterUrlField];
        const title = item.title || '전후사진';
        const safeViewLabel = escapeHtml(view.label);

        return `
            <div class="before-after-view-block" data-view="${escapeHtml(view.key)}">
                <div class="before-after-view-title">${safeViewLabel}</div>

                <div class="before-after-card-toggle-wrap">
                    <button type="button"
                        class="before-after-card-toggle is-before"
                        aria-label="${safeViewLabel} 전후사진 전환"
                        aria-pressed="false">
                        <span class="before-after-card-toggle-indicator"></span>
                        <span class="before-after-card-toggle-text before-after-before-label">Before</span>
                        <span class="before-after-card-toggle-text before-after-after-label">After</span>
                    </button>
                </div>

                <div class="before-after-card-viewport">
                    <div class="before-after-card-track">
                        ${createImagePanel(beforeUrl, `${title} ${view.label} Before`, 'BEFORE')}
                        ${createImagePanel(afterUrl, `${title} ${view.label} After`, 'AFTER')}
                    </div>
                </div>
            </div>
        `;
    }

    function bindCardImageFallbacks(root) {
        root.querySelectorAll('[data-before-after-image]').forEach(function(image) {
            const panel = image.closest('.before-after-card-panel');

            function showError() {
                if (panel) {
                    panel.classList.add('is-image-error');
                }
            }

            function clearError() {
                if (panel) {
                    panel.classList.remove('is-image-error');
                }
            }

            image.addEventListener('error', showError);
            image.addEventListener('load', clearError);

            if (image.complete && image.naturalWidth === 0) {
                showError();
            }
        });
    }

    function bindCardToggleEvents(root) {
        root.querySelectorAll('.before-after-view-block').forEach(function(block) {
            const toggleBtn = block.querySelector('.before-after-card-toggle');
            const track = block.querySelector('.before-after-card-track');

            if (!toggleBtn || !track) {
                return;
            }

            toggleBtn.addEventListener('click', function() {
                const isNowAfter = track.classList.toggle('is-after');
                toggleBtn.classList.toggle('is-after', isNowAfter);
                toggleBtn.classList.toggle('is-before', !isNowAfter);
                toggleBtn.setAttribute('aria-pressed', isNowAfter ? 'true' : 'false');
            });
        });
    }

    function createCard(prepared, capacity) {
        const item = prepared.item;
        const views = prepared.views;
        const viewCount = prepared.viewCount;
        const span = Math.min(viewCount, capacity);
        const col = document.createElement('div');

        col.className = `before-after-col before-after-col-view-${viewCount}`;
        col.dataset.viewCount = String(viewCount);
        col.style.setProperty('--before-after-card-span', String(span));

        col.innerHTML = `
            <article class="before-after-card before-after-card-view-${viewCount} before-after-observe">
                <div class="before-after-card-media">
                    <div class="before-after-view-grid" style="--before-after-view-count: ${viewCount};">
                        ${views.map(function(view) {
                            return createViewBlock(item, view);
                        }).join('')}
                    </div>
                </div>

                <div class="before-after-card-body">
                    <span class="before-after-card-category">${escapeHtml(item.categoryLabel || categoryMap[item.categoryCode] || '')}</span>
                    <h3 class="before-after-card-title">${escapeHtml(item.title || '')}</h3>
                    <p class="before-after-card-sub">${escapeHtml(item.description || '')}</p>

                    <div class="before-after-card-meta">
                        <span>등록일 ${escapeHtml(item.createdDateText || '-')}</span>
                    </div>
                </div>
            </article>
        `;

        bindCardToggleEvents(col);
        bindCardImageFallbacks(col);

        return col;
    }

    function renderEmpty(message) {
        grid.innerHTML = `
            <div class="before-after-empty">${escapeHtml(message || '현재 선택한 분류의 전후사진이 없습니다.')}</div>
        `;
    }

    function renderLoadedItems() {
        const preparedItems = prepareItems(loadedItems);

        if (revealObserver) {
            revealObserver.disconnect();
        }

        grid.innerHTML = '';

        if (preparedItems.length === 0) {
            renderEmpty('현재 선택한 분류의 전후사진이 없습니다.');
            return;
        }

        currentLayoutCapacity = getLayoutCapacity();
        const rows = packItemsIntoRows(preparedItems, currentLayoutCapacity);

        rows.forEach(function(rowItems) {
            const row = document.createElement('div');
            row.className = 'before-after-layout-row';
            row.style.setProperty('--before-after-row-capacity', String(currentLayoutCapacity));

            rowItems.forEach(function(prepared) {
                row.appendChild(createCard(prepared, currentLayoutCapacity));
            });

            grid.appendChild(row);
        });

        bindRevealForNewCards();
    }

    function mergeLoadedItems(items) {
        const existingIds = new Set(loadedItems.map(function(item) {
            return String(item.id);
        }));

        (Array.isArray(items) ? items : []).forEach(function(item) {
            const key = String(item.id);

            if (!existingIds.has(key)) {
                loadedItems.push(item);
                existingIds.add(key);
            }
        });
    }

    function updateLoadMoreButton(totalCount) {
        if (!loadMoreBtn) {
            return;
        }

        if (hasNext) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = '다음 전후사진 더 보기';
        } else {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = totalCount > 0
                ? '모든 전후사진을 확인하셨습니다'
                : '표시할 전후사진이 없습니다';
        }
    }

    function bindRevealForNewCards() {
        const cards = grid.querySelectorAll('.before-after-observe:not([data-reveal-bound])');

        if (!('IntersectionObserver' in window)) {
            cards.forEach(function(card) {
                card.dataset.revealBound = 'true';
                card.classList.add('before-after-visible');
            });
            return;
        }

        if (!revealObserver) {
            revealObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('before-after-visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.12
            });
        }

        cards.forEach(function(card) {
            card.dataset.revealBound = 'true';
            revealObserver.observe(card);
        });
    }

    async function loadItems(reset) {
        if (loading) {
            return;
        }

        if (!reset && !hasNext) {
            return;
        }

        loading = true;

        if (loadMoreBtn) {
            loadMoreBtn.classList.add('is-loading');
        }

        try {
            if (reset) {
                nextOffset = 0;
                hasNext = true;
                loadedItems = [];
                grid.innerHTML = '';
            }

            const currentLimit = reset ? initialLimit : appendLimit;
            const url = `${listUrl}?category=${encodeURIComponent(currentCategory)}&offset=${nextOffset}&limit=${currentLimit}`;
            const data = await request(url);
            const items = Array.isArray(data.items) ? data.items : [];

            mergeLoadedItems(items);
            renderLoadedItems();

            if (totalCountEl) {
                totalCountEl.textContent = `총 ${data.totalCount || 0}건`;
            }

            nextOffset = data.nextOffset || 0;
            hasNext = Boolean(data.hasNext);
            updateLoadMoreButton(data.totalCount || 0);
        } catch (error) {
            console.error(error);

            if (reset) {
                renderEmpty(error.message || '전후사진을 불러오지 못했습니다.');
            }
        } finally {
            loading = false;

            if (loadMoreBtn) {
                loadMoreBtn.classList.remove('is-loading');
            }
        }
    }

    filterInputs.forEach(function(input) {
        input.addEventListener('change', function() {
            currentCategory = this.value;
            loadItems(true);
        });
    });

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadItems(false);
        });
    }

    if ('IntersectionObserver' in window && sentinel) {
        scrollObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    loadItems(false);
                }
            });
        }, {
            root: null,
            rootMargin: '240px 0px',
            threshold: 0
        });

        scrollObserver.observe(sentinel);
    }

    window.addEventListener('resize', function() {
        window.clearTimeout(resizeTimer);

        resizeTimer = window.setTimeout(function() {
            const nextCapacity = getLayoutCapacity();

            if (nextCapacity !== currentLayoutCapacity && loadedItems.length > 0) {
                renderLoadedItems();
            }
        }, 160);
    });

    loadItems(true);
});
