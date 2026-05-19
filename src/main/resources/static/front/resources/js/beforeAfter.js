document.addEventListener('DOMContentLoaded', function() {
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
	const metaBadge = document.getElementById('before-after-meta-badge');

	let currentCategory = 'all';
	let nextOffset = 0;
	let loading = false;
	let hasNext = true;
	let revealObserver = null;
	let scrollObserver = null;

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

	async function request(url) {
		const response = await fetch(url, {
			method: 'GET'
		});

		const data = await response.json();

		if (!response.ok || !data.success) {
			throw new Error(data.message || '전후사진 데이터를 불러오지 못했습니다.');
		}

		return data.data;
	}

	function getImageUrl(item, field, fallbackField) {
		return item[field] || item[fallbackField] || '';
	}

	function createViewBlock(item, view) {
		const beforeUrl = getImageUrl(item, view.beforeUrlField, 'beforeFrontImageUrl');
		const afterUrl = getImageUrl(item, view.afterUrlField, 'afterFrontImageUrl');

		return `
            <div class="before-after-view-block" data-view="${escapeHtml(view.key)}">
                <div class="before-after-view-title">${escapeHtml(view.label)}</div>

                <div class="before-after-card-toggle-wrap">
                    <button type="button" class="before-after-card-toggle is-before" aria-label="${escapeHtml(view.label)} 전후사진 전환">
                        <span class="before-after-card-toggle-indicator"></span>
                        <span class="before-after-card-toggle-text before-after-before-label">Before</span>
                        <span class="before-after-card-toggle-text before-after-after-label">After</span>
                    </button>
                </div>

                <div class="before-after-card-viewport">
                    <div class="before-after-card-track">
                        <div class="before-after-card-panel before-after-card-panel-before">
                            <img src="${escapeHtml(beforeUrl)}" alt="${escapeHtml(item.title)} ${escapeHtml(view.label)} Before">
                            <span class="before-after-card-label">BEFORE</span>
                        </div>
                        <div class="before-after-card-panel before-after-card-panel-after">
                            <img src="${escapeHtml(afterUrl)}" alt="${escapeHtml(item.title)} ${escapeHtml(view.label)} After">
                            <span class="before-after-card-label">AFTER</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
	}

	function createCard(item) {
		const col = document.createElement('div');
		col.className = 'col-12 col-lg-6 before-after-col';

		col.innerHTML = `
            <article class="before-after-card before-after-observe">
                <div class="before-after-card-media">
                    <div class="before-after-view-grid">
                        ${VIEW_SLOTS.map(function(view) {
			return createViewBlock(item, view);
		}).join('')}
                    </div>
                </div>

                <div class="before-after-card-body">
                    <span class="before-after-card-category">${escapeHtml(item.categoryLabel || categoryMap[item.categoryCode] || '')}</span>
                    <h3 class="before-after-card-title">${escapeHtml(item.title)}</h3>
                    <p class="before-after-card-sub">${escapeHtml(item.description || '')}</p>

                    <div class="before-after-card-meta">
                        <span>등록일 ${escapeHtml(item.createdDateText || '-')}</span>
                    </div>
                </div>
            </article>
        `;

		col.querySelectorAll('.before-after-view-block').forEach(function(block) {
			const toggleBtn = block.querySelector('.before-after-card-toggle');
			const track = block.querySelector('.before-after-card-track');

			toggleBtn.addEventListener('click', function() {
				const isNowAfter = track.classList.toggle('is-after');
				toggleBtn.classList.toggle('is-after', isNowAfter);
				toggleBtn.classList.toggle('is-before', !isNowAfter);
			});
		});

		return col;
	}

	function renderEmpty() {
		grid.innerHTML = `
            <div class="col-12">
                <div class="before-after-empty">현재 선택한 분류의 전후사진이 없습니다.</div>
            </div>
        `;
	}

	function updateLoadMoreButton(totalCount) {
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
		const cards = grid.querySelectorAll('.before-after-observe');

		if (revealObserver) {
			cards.forEach(function(card) {
				revealObserver.observe(card);
			});
			return;
		}

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

		cards.forEach(function(card) {
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

		try {
			if (reset) {
				nextOffset = 0;
				hasNext = true;
				grid.innerHTML = '';
				metaBadge.textContent = `기본 ${initialLimit}개 노출`;
			}

			const currentLimit = reset ? initialLimit : appendLimit;
			const url = `${listUrl}?category=${encodeURIComponent(currentCategory)}&offset=${nextOffset}&limit=${currentLimit}`;
			const data = await request(url);

			if (reset && (!data.items || data.items.length === 0)) {
				renderEmpty();
				totalCountEl.textContent = `총 ${data.totalCount || 0}건`;
				nextOffset = data.nextOffset || 0;
				hasNext = !!data.hasNext;
				updateLoadMoreButton(data.totalCount || 0);
				return;
			}

			(data.items || []).forEach(function(item) {
				grid.appendChild(createCard(item));
			});

			totalCountEl.textContent = `총 ${data.totalCount || 0}건`;
			nextOffset = data.nextOffset || 0;
			hasNext = !!data.hasNext;
			updateLoadMoreButton(data.totalCount || 0);
			bindRevealForNewCards();
		} catch (error) {
			console.error(error);

			if (reset) {
				renderEmpty();
			}
		} finally {
			loading = false;
		}
	}

	filterInputs.forEach(function(input) {
		input.addEventListener('change', function() {
			currentCategory = this.value;
			loadItems(true);
		});
	});

	loadMoreBtn.addEventListener('click', function() {
		loadItems(false);
	});

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

	if (sentinel) {
		scrollObserver.observe(sentinel);
	}

	loadItems(true);
});