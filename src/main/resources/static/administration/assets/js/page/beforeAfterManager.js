document.addEventListener('DOMContentLoaded', function() {
	const page = document.getElementById('before-after-manager-page');
	if (!page) {
		return;
	}

	const LIST_URL = page.dataset.listUrl;
	const CREATE_URL = page.dataset.createUrl;

	const CATEGORY_LABELS = {
		eye: '눈',
		young: '동안',
		nose: '코',
		contour: '윤곽'
	};

	const createForm = document.getElementById('before-after-manager-create-form');
	const listEl = document.getElementById('before-after-manager-list');
	const totalCountEl = document.getElementById('before-after-manager-total-count');
	const refreshBtn = document.getElementById('before-after-manager-refresh-btn');
	const categoryFilterEl = document.getElementById('before-after-manager-list-category-filter');

	const createBeforeInput = document.getElementById('before-after-manager-create-before-image');
	const createAfterInput = document.getElementById('before-after-manager-create-after-image');
	const createBeforePreview = document.getElementById('before-after-manager-create-before-preview');
	const createAfterPreview = document.getElementById('before-after-manager-create-after-preview');
	const createBeforeEmpty = document.getElementById('before-after-manager-create-before-empty');
	const createAfterEmpty = document.getElementById('before-after-manager-create-after-empty');

	const detailModalEl = document.getElementById('before-after-manager-detail-modal');
	const detailModal = new bootstrap.Modal(detailModalEl);

	const detailIdEl = document.getElementById('before-after-manager-detail-id');
	const detailTitleEl = document.getElementById('before-after-manager-detail-title');
	const detailCategoryEl = document.getElementById('before-after-manager-detail-category');
	const detailDescriptionEl = document.getElementById('before-after-manager-detail-description');
	const detailBeforeInput = document.getElementById('before-after-manager-detail-before-image');
	const detailAfterInput = document.getElementById('before-after-manager-detail-after-image');
	const detailBeforePreview = document.getElementById('before-after-manager-detail-before-preview');
	const detailAfterPreview = document.getElementById('before-after-manager-detail-after-preview');
	const detailBeforeFileName = document.getElementById('before-after-manager-detail-before-file-name');
	const detailAfterFileName = document.getElementById('before-after-manager-detail-after-file-name');
	const detailCreatedAtEl = document.getElementById('before-after-manager-detail-created-at');
	const detailUpdatedAtEl = document.getElementById('before-after-manager-detail-updated-at');
	const detailViewCountEl = document.getElementById('before-after-manager-detail-view-count');
	const updateBtn = document.getElementById('before-after-manager-update-btn');
	const deleteBtn = document.getElementById('before-after-manager-delete-btn');

	let originalDetailSnapshot = '';

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

	async function request(url, options) {
		const response = await fetch(url, options || {});
		const data = await response.json();

		if (!response.ok || !data.success) {
			throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
		}

		return data;
	}

	function readFilePreview(file, imageEl, emptyEl) {
		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.onload = function(e) {
			imageEl.src = e.target.result;
			imageEl.classList.remove('d-none');
			if (emptyEl) {
				emptyEl.classList.add('d-none');
			}
		};
		reader.readAsDataURL(file);
	}

	function renderList(items) {
		if (!Array.isArray(items) || items.length === 0) {
			listEl.innerHTML = `
                <div class="col-12">
                    <div class="before-after-manager-empty">등록된 전후사진이 없습니다.</div>
                </div>
            `;
			return;
		}

		listEl.innerHTML = items.map(function(item) {
			return `
                <div class="col-12 col-md-6 col-xxl-4 before-after-manager-list-item">
                    <div class="before-after-manager-list-card">
                        <div class="before-after-manager-list-card-image-row">
                            <div class="before-after-manager-list-card-image-col">
                                <img src="${escapeHtml(item.beforeImageUrl)}" alt="${escapeHtml(item.title)} before">
                                <span class="before-after-manager-list-card-label">BEFORE</span>
                            </div>
                            <div class="before-after-manager-list-card-image-col">
                                <img src="${escapeHtml(item.afterImageUrl)}" alt="${escapeHtml(item.title)} after">
                                <span class="before-after-manager-list-card-label">AFTER</span>
                            </div>
                        </div>

                        <div class="before-after-manager-list-card-body">
                            <span class="badge bg-light text-dark border mb-2">${escapeHtml(item.categoryLabel)}</span>

                            <div>
                                <button type="button"
                                    class="before-after-manager-list-card-title-btn"
                                    data-before-after-id="${item.id}">
                                    ${escapeHtml(item.title)}
                                </button>
                            </div>

                            <p class="before-after-manager-list-card-desc">${escapeHtml(item.description)}</p>

                            <div class="before-after-manager-list-card-meta">
                                <span>등록일 ${escapeHtml(item.createdAtText || '-')}</span>
                                <span>수정일 ${escapeHtml(item.updatedAtText || '-')}</span>
                                <span>조회수 ${item.viewCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
		}).join('');
	}

	async function loadList() {
		try {
			const category = categoryFilterEl.value || 'all';
			const res = await request(`${LIST_URL}?category=${encodeURIComponent(category)}&offset=0&limit=100`);
			const listData = res.data;

			renderList(listData.items || []);
			totalCountEl.textContent = `총 ${listData.totalCount || 0}건`;
		} catch (e) {
			alert(e.message);
		}
	}

	function resetCreateForm() {
		createForm.reset();

		createBeforePreview.removeAttribute('src');
		createAfterPreview.removeAttribute('src');
		createBeforePreview.classList.add('d-none');
		createAfterPreview.classList.add('d-none');
		createBeforeEmpty.classList.remove('d-none');
		createAfterEmpty.classList.remove('d-none');
	}

	createBeforeInput.addEventListener('change', function() {
		const file = this.files && this.files[0];
		if (!file) {
			createBeforePreview.removeAttribute('src');
			createBeforePreview.classList.add('d-none');
			createBeforeEmpty.classList.remove('d-none');
			return;
		}
		readFilePreview(file, createBeforePreview, createBeforeEmpty);
	});

	createAfterInput.addEventListener('change', function() {
		const file = this.files && this.files[0];
		if (!file) {
			createAfterPreview.removeAttribute('src');
			createAfterPreview.classList.add('d-none');
			createAfterEmpty.classList.remove('d-none');
			return;
		}
		readFilePreview(file, createAfterPreview, createAfterEmpty);
	});

	createForm.addEventListener('submit', async function(e) {
		e.preventDefault();

		const formData = new FormData(createForm);

		try {
			await request(CREATE_URL, {
				method: 'POST',
				body: formData
			});

			alert('전후사진이 등록되었습니다.');
			resetCreateForm();
			await loadList();
		} catch (e2) {
			alert(e2.message);
		}
	});

	listEl.addEventListener('click', async function(e) {
		const btn = e.target.closest('[data-before-after-id]');
		if (!btn) {
			return;
		}

		const id = btn.getAttribute('data-before-after-id');

		try {
			const res = await request(`${LIST_URL}/${id}`);
			const item = res.data;

			detailIdEl.value = item.id;
			detailTitleEl.value = item.title || '';
			detailCategoryEl.value = item.categoryCode || '';
			detailDescriptionEl.value = item.description || '';

			detailBeforePreview.src = item.beforeImageUrl || '';
			detailAfterPreview.src = item.afterImageUrl || '';

			detailBeforeFileName.textContent = item.beforeImageOriginalName || '-';
			detailAfterFileName.textContent = item.afterImageOriginalName || '-';

			detailCreatedAtEl.textContent = `등록일 ${item.createdAtText || '-'}`;
			detailUpdatedAtEl.textContent = `수정일 ${item.updatedAtText || '-'}`;
			detailViewCountEl.textContent = `조회수 ${item.viewCount || 0}`;

			detailBeforeInput.value = '';
			detailAfterInput.value = '';

			originalDetailSnapshot = getDetailSnapshot();
			updateBtn.disabled = true;

			detailModal.show();
		} catch (error) {
			alert(error.message);
		}
	});

	function getDetailSnapshot() {
		return JSON.stringify({
			title: detailTitleEl.value || '',
			category: detailCategoryEl.value || '',
			description: detailDescriptionEl.value || '',
			beforeChanged: detailBeforeInput.files && detailBeforeInput.files.length > 0,
			afterChanged: detailAfterInput.files && detailAfterInput.files.length > 0
		});
	}

	function syncUpdateButtonState() {
		updateBtn.disabled = originalDetailSnapshot === getDetailSnapshot();
	}

	[detailTitleEl, detailCategoryEl, detailDescriptionEl].forEach(function(el) {
		el.addEventListener('input', syncUpdateButtonState);
		el.addEventListener('change', syncUpdateButtonState);
	});

	detailBeforeInput.addEventListener('change', function() {
		const file = this.files && this.files[0];
		if (file) {
			readFilePreview(file, detailBeforePreview, null);
			detailBeforeFileName.textContent = file.name;
		}
		syncUpdateButtonState();
	});

	detailAfterInput.addEventListener('change', function() {
		const file = this.files && this.files[0];
		if (file) {
			readFilePreview(file, detailAfterPreview, null);
			detailAfterFileName.textContent = file.name;
		}
		syncUpdateButtonState();
	});

	updateBtn.addEventListener('click', async function() {
		const id = detailIdEl.value;
		if (!id) {
			return;
		}

		const formData = new FormData();
		formData.append('title', detailTitleEl.value);
		formData.append('description', detailDescriptionEl.value);
		formData.append('category', detailCategoryEl.value);

		if (detailBeforeInput.files && detailBeforeInput.files[0]) {
			formData.append('beforeImageFile', detailBeforeInput.files[0]);
		}

		if (detailAfterInput.files && detailAfterInput.files[0]) {
			formData.append('afterImageFile', detailAfterInput.files[0]);
		}

		try {
			const res = await request(`${LIST_URL}/${id}/update`, {
				method: 'POST',
				body: formData
			});

			const item = res.data;

			detailBeforePreview.src = item.beforeImageUrl || '';
			detailAfterPreview.src = item.afterImageUrl || '';
			detailBeforeFileName.textContent = item.beforeImageOriginalName || '-';
			detailAfterFileName.textContent = item.afterImageOriginalName || '-';
			detailCreatedAtEl.textContent = `등록일 ${item.createdAtText || '-'}`;
			detailUpdatedAtEl.textContent = `수정일 ${item.updatedAtText || '-'}`;
			detailViewCountEl.textContent = `조회수 ${item.viewCount || 0}`;

			detailBeforeInput.value = '';
			detailAfterInput.value = '';
			originalDetailSnapshot = getDetailSnapshot();
			updateBtn.disabled = true;

			alert('전후사진이 수정되었습니다.');
			await loadList();
		} catch (error) {
			alert(error.message);
		}
	});

	deleteBtn.addEventListener('click', async function() {
		const id = detailIdEl.value;
		if (!id) {
			return;
		}

		if (!confirm('해당 전후사진을 삭제하시겠습니까?')) {
			return;
		}

		try {
			await request(`${LIST_URL}/${id}`, {
				method: 'DELETE'
			});

			alert('전후사진이 삭제되었습니다.');
			detailModal.hide();
			await loadList();
		} catch (error) {
			alert(error.message);
		}
	});

	refreshBtn.addEventListener('click', loadList);
	categoryFilterEl.addEventListener('change', loadList);

	loadList();
});