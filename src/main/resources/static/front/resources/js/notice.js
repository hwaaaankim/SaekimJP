(function() {
	document.addEventListener('DOMContentLoaded', function() {
		const UL = document.getElementById('noticeList');
		if (!UL) return;

		const OPEN_ABOVE = UL.dataset.panelPosition === 'above';

		let animating = false;
		let hostLi = null;

		const fly = document.createElement('li');
		fly.className = 'notice-list-flypanel';
		fly.setAttribute('aria-hidden', 'true');
		fly.innerHTML = `
            <div class="notice-list-panel__inner">
                <div class="notice-text-wrap">
                    <div class="notice-list-meta">
                        <span class="notice-list-meta__date">
                            등록일 : <span data-field="date">-</span>
                        </span> |
                        <span class="notice-list-meta__date">
                            조회수 : <span data-field="viewCount">0</span> 회
                        </span>
                    </div>
                    <h3 class="notice-list-panel__title" data-field="title">제목</h3>
                    <div class="notice-list-panel__content" data-field="content"></div>
                </div>
            </div>
        `;
		UL.appendChild(fly);

		function setPanelData(data) {
			fly.querySelector('[data-field="title"]').textContent = data.title || '';
			fly.querySelector('[data-field="date"]').textContent = data.createdAt || '-';
			fly.querySelector('[data-field="viewCount"]').textContent = data.viewCount ?? 0;
			fly.querySelector('[data-field="content"]').innerHTML = data.content || '';
		}

		function placePanel(refLi) {
			if (OPEN_ABOVE) {
				UL.insertBefore(fly, refLi);
			} else {
				refLi.after(fly);
			}
		}

		function openPanel(refLi) {
			placePanel(refLi);
			hostLi = refLi;
			hostLi.classList.add('notice-list-active');

			fly.style.height = 'auto';
			const target = fly.scrollHeight;
			fly.style.height = '0px';
			fly.getBoundingClientRect();
			fly.setAttribute('aria-hidden', 'false');

			requestAnimationFrame(() => {
				fly.style.height = target + 'px';
			});

			fly.addEventListener('transitionend', function handler() {
				fly.removeEventListener('transitionend', handler);
				fly.style.height = 'auto';
				animating = false;
			}, { once: true });
		}

		function closePanel() {
			if (!hostLi) return;

			hostLi.classList.remove('notice-list-active');

			const current = fly.scrollHeight;
			fly.style.height = current + 'px';
			fly.getBoundingClientRect();

			requestAnimationFrame(() => {
				fly.style.height = '0px';
			});

			fly.setAttribute('aria-hidden', 'true');

			fly.addEventListener('transitionend', function handler() {
				fly.removeEventListener('transitionend', handler);
				animating = false;
				hostLi = null;
			}, { once: true });
		}

		UL.addEventListener('click', async function(e) {
			const titleAnchor = e.target.closest('.notice-title');
			if (!titleAnchor) return;

			e.preventDefault();

			const li = e.target.closest('.notice-list__item');
			if (!li || !UL.contains(li)) return;

			if (animating) return;
			animating = true;

			const noticeId = titleAnchor.dataset.id;
			if (!noticeId) {
				animating = false;
				return;
			}

			if (hostLi === li && fly.getAttribute('aria-hidden') === 'false') {
				closePanel();
				return;
			}

			try {
				const response = await fetch(`/api/notices/${noticeId}`);
				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.message || '공지사항 상세를 불러오지 못했습니다.');
				}

				setPanelData({
					title: result.title,
					createdAt: formatDate(result.createdAt),
					viewCount: result.viewCount,
					content: result.content
				});

				if (hostLi && fly.getAttribute('aria-hidden') === 'false') {
					fly.addEventListener('transitionend', function afterClose() {
						fly.removeEventListener('transitionend', afterClose);
						animating = true;
						openPanel(li);
					}, { once: true });

					closePanel();
					return;
				}

				openPanel(li);
			} catch (error) {
				animating = false;
				alert(error.message || '공지사항 상세 조회 중 오류가 발생했습니다.');
			}
		});

		function formatDate(dateTimeString) {
			if (!dateTimeString) return '-';

			const date = new Date(dateTimeString);
			if (Number.isNaN(date.getTime())) {
				return dateTimeString;
			}

			const yyyy = date.getFullYear();
			const mm = String(date.getMonth() + 1).padStart(2, '0');
			const dd = String(date.getDate()).padStart(2, '0');

			return `${yyyy}-${mm}-${dd}`;
		}
	});
})();