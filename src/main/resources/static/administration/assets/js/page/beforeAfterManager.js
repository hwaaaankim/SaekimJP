document.addEventListener('DOMContentLoaded', function() {
	const page = document.getElementById('before-after-manager-page');
	if (!page) {
		return;
	}

	const LIST_URL = page.dataset.listUrl;
	const CREATE_URL = page.dataset.createUrl;

	const TARGET_WIDTH = 420;
	const TARGET_HEIGHT = 500;
	const MIN_ZOOM_FACTOR = 0.1;
	const MAX_ZOOM_FACTOR = 10;

	const IMAGE_SLOTS = [
		{
			key: 'beforeFront',
			label: 'Before 정면',
			requestName: 'beforeFrontImageFile',
			urlField: 'beforeFrontImageUrl',
			originalNameField: 'beforeFrontImageOriginalName',
			filePrefix: 'before-front'
		},
		{
			key: 'beforeAngle45',
			label: 'Before 45도',
			requestName: 'beforeAngle45ImageFile',
			urlField: 'beforeAngle45ImageUrl',
			originalNameField: 'beforeAngle45ImageOriginalName',
			filePrefix: 'before-angle45'
		},
		{
			key: 'beforeAngle90',
			label: 'Before 90도',
			requestName: 'beforeAngle90ImageFile',
			urlField: 'beforeAngle90ImageUrl',
			originalNameField: 'beforeAngle90ImageOriginalName',
			filePrefix: 'before-angle90'
		},
		{
			key: 'afterFront',
			label: 'After 정면',
			requestName: 'afterFrontImageFile',
			urlField: 'afterFrontImageUrl',
			originalNameField: 'afterFrontImageOriginalName',
			filePrefix: 'after-front'
		},
		{
			key: 'afterAngle45',
			label: 'After 45도',
			requestName: 'afterAngle45ImageFile',
			urlField: 'afterAngle45ImageUrl',
			originalNameField: 'afterAngle45ImageOriginalName',
			filePrefix: 'after-angle45'
		},
		{
			key: 'afterAngle90',
			label: 'After 90도',
			requestName: 'afterAngle90ImageFile',
			urlField: 'afterAngle90ImageUrl',
			originalNameField: 'afterAngle90ImageOriginalName',
			filePrefix: 'after-angle90'
		}
	];

	const createForm = document.getElementById('before-after-manager-create-form');
	const listEl = document.getElementById('before-after-manager-list');
	const totalCountEl = document.getElementById('before-after-manager-total-count');
	const refreshBtn = document.getElementById('before-after-manager-refresh-btn');
	const categoryFilterEl = document.getElementById('before-after-manager-list-category-filter');

	const detailModalEl = document.getElementById('before-after-manager-detail-modal');
	const detailModal = new bootstrap.Modal(detailModalEl);

	const cropModalEl = document.getElementById('before-after-manager-crop-modal');
	const cropModal = new bootstrap.Modal(cropModalEl, {
		backdrop: 'static',
		keyboard: false
	});

	const detailIdEl = document.getElementById('before-after-manager-detail-id');
	const detailTitleEl = document.getElementById('before-after-manager-detail-title');
	const detailCategoryEl = document.getElementById('before-after-manager-detail-category');
	const detailDescriptionEl = document.getElementById('before-after-manager-detail-description');
	const detailCreatedAtEl = document.getElementById('before-after-manager-detail-created-at');
	const detailUpdatedAtEl = document.getElementById('before-after-manager-detail-updated-at');
	const detailViewCountEl = document.getElementById('before-after-manager-detail-view-count');
	const updateBtn = document.getElementById('before-after-manager-update-btn');
	const deleteBtn = document.getElementById('before-after-manager-delete-btn');

	const cropTitleEl = document.getElementById('before-after-manager-crop-title');
	const cropGuideEl = document.getElementById('before-after-manager-crop-guide');
	const cropStage = document.getElementById('before-after-manager-crop-stage');
	const cropImage = document.getElementById('before-after-manager-crop-image');
	const cropSelectBtn = document.getElementById('before-after-manager-crop-select-btn');
	const cropCancelBtn = document.getElementById('before-after-manager-crop-cancel-btn');
	const cropZoomInBtn = document.getElementById('before-after-manager-crop-zoom-in-btn');
	const cropZoomOutBtn = document.getElementById('before-after-manager-crop-zoom-out-btn');
	const cropResetBtn = document.getElementById('before-after-manager-crop-reset-btn');
	const cropFitContainBtn = document.getElementById('before-after-manager-crop-fit-contain-btn');
	const cropFitCoverBtn = document.getElementById('before-after-manager-crop-fit-cover-btn');
	const cropOriginalBtn = document.getElementById('before-after-manager-crop-original-btn');
	const cropZoomRange = document.getElementById('before-after-manager-crop-zoom-range');
	const cropZoomValue = document.getElementById('before-after-manager-crop-zoom-value');

	let selectedCreateFiles = {};
	let selectedDetailFiles = {};
	let detailCurrentItem = null;
	let originalDetailSnapshot = '';

	let cropState = null;

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

	function findSlot(slotKey) {
		return IMAGE_SLOTS.find(function(slot) {
			return slot.key === slotKey;
		});
	}

	function getSlotElements(context, slotKey) {
		const root = document.querySelector(`[data-image-slot-card][data-context="${context}"][data-slot="${slotKey}"]`);

		if (!root) {
			return {};
		}

		return {
			root: root,
			input: root.querySelector('[data-image-input]'),
			img: root.querySelector('[data-image-preview]'),
			empty: root.querySelector('[data-image-empty]'),
			removeBtn: root.querySelector('[data-image-remove]'),
			fileName: root.querySelector('[data-image-file-name]')
		};
	}

	function setSlotPreview(context, slotKey, src, fileName, removable) {
		const els = getSlotElements(context, slotKey);

		if (!els.root || !els.img || !els.empty || !els.fileName || !els.removeBtn) {
			return;
		}

		els.fileName.textContent = fileName || '-';
		els.removeBtn.classList.toggle('d-none', !removable);

		if (!src) {
			els.img.removeAttribute('src');
			els.img.classList.add('d-none');
			els.img.style.display = 'none';

			els.empty.classList.remove('d-none');
			els.empty.style.display = 'flex';
			return;
		}

		els.img.onload = function() {
			els.img.classList.remove('d-none');
			els.img.style.display = 'block';

			els.empty.classList.add('d-none');
			els.empty.style.display = 'none';
		};

		els.img.onerror = function() {
			els.img.removeAttribute('src');
			els.img.classList.add('d-none');
			els.img.style.display = 'none';

			els.empty.classList.remove('d-none');
			els.empty.style.display = 'flex';
			els.empty.innerHTML = '이미지 미리보기를<br>불러오지 못했습니다.';
		};

		els.img.src = src;
	}

	function clearCreateSlot(slotKey) {
		const els = getSlotElements('create', slotKey);

		if (els.input) {
			els.input.value = '';
		}

		delete selectedCreateFiles[slotKey];
		setSlotPreview('create', slotKey, '', '-', false);
	}

	function clearDetailSlot(slotKey) {
		const els = getSlotElements('detail', slotKey);

		if (els.input) {
			els.input.value = '';
		}

		delete selectedDetailFiles[slotKey];

		const slot = findSlot(slotKey);
		const src = detailCurrentItem && slot ? detailCurrentItem[slot.urlField] : '';
		const fileName = detailCurrentItem && slot ? detailCurrentItem[slot.originalNameField] : '-';

		setSlotPreview('detail', slotKey, src || '', fileName || '-', false);
		syncUpdateButtonState();
	}

	function resetCreateForm() {
		createForm.reset();
		selectedCreateFiles = {};

		IMAGE_SLOTS.forEach(function(slot) {
			clearCreateSlot(slot.key);
		});
	}

	function renderDetailImages(item) {
		IMAGE_SLOTS.forEach(function(slot) {
			const src = item[slot.urlField] || '';
			const fileName = item[slot.originalNameField] || '-';

			setSlotPreview('detail', slot.key, src, fileName, false);

			const els = getSlotElements('detail', slot.key);
			if (els.input) {
				els.input.value = '';
			}
		});

		selectedDetailFiles = {};
	}

	function appendCroppedFileToPreview(context, slotKey, file) {
		if (!file) {
			return;
		}

		if (context === 'create') {
			selectedCreateFiles[slotKey] = file;
		} else {
			selectedDetailFiles[slotKey] = file;
		}

		const reader = new FileReader();

		reader.onload = function(e) {
			const previewSrc = e.target.result;

			setSlotPreview(context, slotKey, previewSrc, file.name, true);

			if (context === 'detail') {
				syncUpdateButtonState();
			}
		};

		reader.onerror = function() {
			alert('미리보기 이미지를 생성하지 못했습니다.');
		};

		reader.readAsDataURL(file);
	}

	function buildCroppedFileName(originalName, filePrefix) {
		const safeOriginalName = originalName || 'image.jpg';
		const dotIndex = safeOriginalName.lastIndexOf('.');
		const baseName = dotIndex > -1 ? safeOriginalName.substring(0, dotIndex) : safeOriginalName;

		return `${filePrefix}-${baseName}-420x500.jpg`;
	}

	function openCropEditor(context, slotKey, file, inputEl) {
		const slot = findSlot(slotKey);

		if (!slot || !file) {
			return;
		}

		if (!file.type || !file.type.startsWith('image/')) {
			alert('이미지 파일만 등록할 수 있습니다.');
			inputEl.value = '';
			return;
		}

		const reader = new FileReader();

		reader.onload = function(e) {
			const image = new Image();

			image.onload = function() {
				cropState = {
					context: context,
					slotKey: slotKey,
					slot: slot,
					originalFile: file,
					image: image,
					naturalWidth: image.naturalWidth,
					naturalHeight: image.naturalHeight,
					stageWidth: 0,
					stageHeight: 0,
					containScale: 1,
					coverScale: 1,
					minScale: 0.1,
					maxScale: 10,
					scale: 1,
					offsetX: 0,
					offsetY: 0,
					dragging: false,
					startX: 0,
					startY: 0,
					startOffsetX: 0,
					startOffsetY: 0
				};

				cropTitleEl.textContent = `${slot.label} 이미지 편집`;
				cropGuideEl.textContent = `원본 ${image.naturalWidth}×${image.naturalHeight}px → 저장 ${TARGET_WIDTH}×${TARGET_HEIGHT}px. 축소/확대 후 흰색 배경까지 포함해 그대로 저장됩니다.`;
				cropImage.src = image.src;

				cropModal.show();

				setTimeout(function() {
					initCropScale('contain');
				}, 150);
			};

			image.onerror = function() {
				alert('이미지를 불러오지 못했습니다.');
				inputEl.value = '';
			};

			image.src = e.target.result;
		};

		reader.readAsDataURL(file);
	}

	function refreshCropStageMetrics() {
		if (!cropState) {
			return;
		}

		cropState.stageWidth = cropStage.clientWidth;
		cropState.stageHeight = cropStage.clientHeight;

		cropState.containScale = Math.min(
			cropState.stageWidth / cropState.naturalWidth,
			cropState.stageHeight / cropState.naturalHeight
		);

		cropState.coverScale = Math.max(
			cropState.stageWidth / cropState.naturalWidth,
			cropState.stageHeight / cropState.naturalHeight
		);

		cropState.minScale = Math.max(0.0001, Math.min(cropState.containScale, 1) * MIN_ZOOM_FACTOR);
		cropState.maxScale = Math.max(cropState.coverScale, 1) * MAX_ZOOM_FACTOR;

		if (cropZoomRange) {
			cropZoomRange.min = cropState.minScale;
			cropZoomRange.max = cropState.maxScale;
			cropZoomRange.step = Math.max((cropState.maxScale - cropState.minScale) / 1000, 0.0001);
		}
	}

	function initCropScale(mode) {
		if (!cropState) {
			return;
		}

		refreshCropStageMetrics();

		if (mode === 'cover') {
			cropState.scale = cropState.coverScale;
		} else if (mode === 'original') {
			cropState.scale = Math.min(cropState.maxScale, Math.max(cropState.minScale, 1));
		} else {
			cropState.scale = cropState.containScale;
		}

		cropState.offsetX = 0;
		cropState.offsetY = 0;

		applyCropImageTransform();
	}

	function getDisplaySize() {
		const stageWidth = cropState.stageWidth || cropStage.clientWidth;
		const stageHeight = cropState.stageHeight || cropStage.clientHeight;
		const displayWidth = cropState.naturalWidth * cropState.scale;
		const displayHeight = cropState.naturalHeight * cropState.scale;

		return {
			stageWidth: stageWidth,
			stageHeight: stageHeight,
			displayWidth: displayWidth,
			displayHeight: displayHeight
		};
	}

	function clampCropOffset() {
		if (!cropState) {
			return;
		}

		const size = getDisplaySize();

		/*
		 * 기존 방식은 이미지가 crop 영역보다 작아지는 순간 offset 범위가 0으로 고정되어
		 * 흰 배경 위에 작은 이미지를 원하는 위치로 배치할 수 없었습니다.
		 *
		 * 아래 방식은 이미지가 작아져도 이동을 허용합니다.
		 * 단, 완전히 화면 밖으로 사라져 조작이 어려워지는 것을 줄이기 위해
		 * stage + image 크기 기준까지만 이동을 제한합니다.
		 */
		const maxOffsetX = (size.stageWidth + size.displayWidth) / 2;
		const maxOffsetY = (size.stageHeight + size.displayHeight) / 2;

		cropState.offsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, cropState.offsetX));
		cropState.offsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, cropState.offsetY));
	}

	function syncCropZoomUi() {
		if (!cropState) {
			return;
		}

		if (cropZoomRange) {
			cropZoomRange.value = cropState.scale;
		}

		if (cropZoomValue) {
			const percent = cropState.containScale > 0 ? Math.round((cropState.scale / cropState.containScale) * 100) : 100;
			cropZoomValue.textContent = `${percent}%`;
		}
	}

	function applyCropImageTransform() {
		if (!cropState) {
			return;
		}

		refreshCropStageMetrics();

		cropState.scale = Math.min(cropState.maxScale, Math.max(cropState.minScale, cropState.scale));

		clampCropOffset();

		const size = getDisplaySize();

		cropImage.style.width = `${size.displayWidth}px`;
		cropImage.style.height = `${size.displayHeight}px`;
		cropImage.style.left = `${size.stageWidth / 2 + cropState.offsetX}px`;
		cropImage.style.top = `${size.stageHeight / 2 + cropState.offsetY}px`;

		syncCropZoomUi();
	}

	function zoomCrop(factor) {
		if (!cropState) {
			return;
		}

		const nextScale = cropState.scale * factor;
		cropState.scale = Math.min(cropState.maxScale, Math.max(cropState.minScale, nextScale));

		applyCropImageTransform();
	}

	cropStage.addEventListener('pointerdown', function(e) {
		if (!cropState) {
			return;
		}

		cropState.dragging = true;
		cropState.startX = e.clientX;
		cropState.startY = e.clientY;
		cropState.startOffsetX = cropState.offsetX;
		cropState.startOffsetY = cropState.offsetY;

		cropStage.setPointerCapture(e.pointerId);
	});

	cropStage.addEventListener('pointermove', function(e) {
		if (!cropState || !cropState.dragging) {
			return;
		}

		cropState.offsetX = cropState.startOffsetX + (e.clientX - cropState.startX);
		cropState.offsetY = cropState.startOffsetY + (e.clientY - cropState.startY);

		applyCropImageTransform();
	});

	cropStage.addEventListener('pointerup', function(e) {
		if (!cropState) {
			return;
		}

		cropState.dragging = false;

		try {
			cropStage.releasePointerCapture(e.pointerId);
		} catch (ignored) {
		}
	});

	cropStage.addEventListener('pointercancel', function() {
		if (!cropState) {
			return;
		}

		cropState.dragging = false;
	});

	cropStage.addEventListener('wheel', function(e) {
		e.preventDefault();

		if (!cropState) {
			return;
		}

		zoomCrop(e.deltaY < 0 ? 1.08 : 0.92);
	}, {
		passive: false
	});

	cropZoomInBtn.addEventListener('click', function() {
		zoomCrop(1.12);
	});

	cropZoomOutBtn.addEventListener('click', function() {
		zoomCrop(0.88);
	});

	cropResetBtn.addEventListener('click', function() {
		initCropScale('contain');
	});

	cropFitContainBtn.addEventListener('click', function() {
		initCropScale('contain');
	});

	cropFitCoverBtn.addEventListener('click', function() {
		initCropScale('cover');
	});

	cropOriginalBtn.addEventListener('click', function() {
		initCropScale('original');
	});

	if (cropZoomRange) {
		cropZoomRange.addEventListener('input', function() {
			if (!cropState) {
				return;
			}

			cropState.scale = Number(this.value);
			applyCropImageTransform();
		});
	}

	window.addEventListener('resize', function() {
		if (!cropState) {
			return;
		}

		applyCropImageTransform();
	});

	cropCancelBtn.addEventListener('click', function() {
		if (cropState) {
			const els = getSlotElements(cropState.context, cropState.slotKey);
			if (els.input) {
				els.input.value = '';
			}
		}

		if (document.activeElement && typeof document.activeElement.blur === 'function') {
			document.activeElement.blur();
		}

		cropState = null;
		cropModal.hide();
	});

	cropSelectBtn.addEventListener('click', function() {
		if (!cropState) {
			return;
		}

		const size = getDisplaySize();

		const canvas = document.createElement('canvas');
		canvas.width = TARGET_WIDTH;
		canvas.height = TARGET_HEIGHT;

		const ctx = canvas.getContext('2d');

		const ratioX = canvas.width / size.stageWidth;
		const ratioY = canvas.height / size.stageHeight;

		const displayLeft = (size.stageWidth / 2 + cropState.offsetX) - (size.displayWidth / 2);
		const displayTop = (size.stageHeight / 2 + cropState.offsetY) - (size.displayHeight / 2);

		const drawX = displayLeft * ratioX;
		const drawY = displayTop * ratioY;
		const drawWidth = size.displayWidth * ratioX;
		const drawHeight = size.displayHeight * ratioY;

		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';
		ctx.drawImage(cropState.image, drawX, drawY, drawWidth, drawHeight);

		canvas.toBlob(function(blob) {
			if (!blob) {
				alert('이미지 처리에 실패했습니다.');
				return;
			}

			const fileName = buildCroppedFileName(cropState.originalFile.name, cropState.slot.filePrefix);
			const croppedFile = new File([blob], fileName, {
				type: 'image/jpeg',
				lastModified: Date.now()
			});

			appendCroppedFileToPreview(cropState.context, cropState.slotKey, croppedFile);

			const els = getSlotElements(cropState.context, cropState.slotKey);

			if (els.input) {
				els.input.value = '';
			}

			if (document.activeElement && typeof document.activeElement.blur === 'function') {
				document.activeElement.blur();
			}

			cropState = null;
			cropModal.hide();
		}, 'image/jpeg', 0.92);
	});

	document.querySelectorAll('[data-image-input]').forEach(function(input) {
		input.addEventListener('change', function() {
			const context = this.dataset.context;
			const slotKey = this.dataset.slot;
			const file = this.files && this.files[0];

			if (!file) {
				return;
			}

			openCropEditor(context, slotKey, file, this);
		});
	});

	document.querySelectorAll('[data-image-remove]').forEach(function(btn) {
		btn.addEventListener('click', function() {
			const context = this.dataset.context;
			const slotKey = this.dataset.slot;

			if (context === 'create') {
				clearCreateSlot(slotKey);
			} else {
				clearDetailSlot(slotKey);
			}
		});
	});

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
				<div class="col-12 col-xl-6 before-after-manager-list-item">
					<div class="before-after-manager-list-card">
						<div class="before-after-manager-list-card-image-grid">
							${renderAdminListPair('정면', item.beforeFrontImageUrl, item.afterFrontImageUrl, item.title)}
							${renderAdminListPair('45도', item.beforeAngle45ImageUrl, item.afterAngle45ImageUrl, item.title)}
							${renderAdminListPair('90도', item.beforeAngle90ImageUrl, item.afterAngle90ImageUrl, item.title)}
						</div>

						<div class="before-after-manager-list-card-body">
							<span class="badge bg-light text-dark border mb-2">${escapeHtml(item.categoryLabel || '-')}</span>

							<div>
								<button type="button"
									class="before-after-manager-list-card-title-btn"
									data-before-after-id="${item.id}">
									${escapeHtml(item.title || '-')}
								</button>
							</div>

							<p class="before-after-manager-list-card-desc">${escapeHtml(item.description || '-')}</p>

							<div class="before-after-manager-list-card-meta">
								<span>등록일 ${escapeHtml(item.createdAtText || '-')}</span>
								<span>수정일 ${escapeHtml(item.updatedAtText || '-')}</span>
							</div>
						</div>
					</div>
				</div>
			`;
		}).join('');
	}

	function renderAdminListPair(label, beforeUrl, afterUrl, title) {
		return `
			<div class="before-after-manager-list-card-pair">
				<div class="before-after-manager-list-card-pair-title">${escapeHtml(label)}</div>
				<div class="before-after-manager-list-card-pair-images">
					<div class="before-after-manager-list-card-image-col">
						${beforeUrl ? `<img src="${escapeHtml(beforeUrl)}" alt="${escapeHtml(title || '')} ${escapeHtml(label)} before">` : `<div class="before-after-manager-list-card-image-empty">Before 없음</div>`}
						<span class="before-after-manager-list-card-label">BEFORE</span>
					</div>
					<div class="before-after-manager-list-card-image-col">
						${afterUrl ? `<img src="${escapeHtml(afterUrl)}" alt="${escapeHtml(title || '')} ${escapeHtml(label)} after">` : `<div class="before-after-manager-list-card-image-empty">After 없음</div>`}
						<span class="before-after-manager-list-card-label">AFTER</span>
					</div>
				</div>
			</div>
		`;
	}

	async function loadList() {
		try {
			const category = categoryFilterEl.value || 'all';
			const res = await request(`${LIST_URL}?category=${encodeURIComponent(category)}&offset=0&limit=100`);
			const listData = res.data || {};

			renderList(listData.items || []);
			totalCountEl.textContent = `총 ${listData.totalCount || 0}건`;
		} catch (e) {
			alert(e.message);
		}
	}

	createForm.addEventListener('submit', async function(e) {
		e.preventDefault();

		const title = document.getElementById('before-after-manager-create-title').value;
		const category = document.getElementById('before-after-manager-create-category').value;
		const description = document.getElementById('before-after-manager-create-description').value;

		if (!title || !title.trim()) {
			alert('수술명을 입력해 주세요.');
			return;
		}

		if (!category) {
			alert('분류를 선택해 주세요.');
			return;
		}

		for (const slot of IMAGE_SLOTS) {
			if (!selectedCreateFiles[slot.key]) {
				alert(`${slot.label} 이미지를 등록해 주세요.`);
				return;
			}
		}

		const formData = new FormData();
		formData.append('title', title);
		formData.append('category', category);
		formData.append('description', description);

		IMAGE_SLOTS.forEach(function(slot) {
			const file = selectedCreateFiles[slot.key];
			formData.append(slot.requestName, file, file.name);
		});

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

			detailCurrentItem = item;

			detailIdEl.value = item.id;
			detailTitleEl.value = item.title || '';
			detailCategoryEl.value = item.categoryCode || '';
			detailDescriptionEl.value = item.description || '';
			detailCreatedAtEl.textContent = `등록일 ${item.createdAtText || '-'}`;
			detailUpdatedAtEl.textContent = `수정일 ${item.updatedAtText || '-'}`;

			if (detailViewCountEl) {
				detailViewCountEl.textContent = `조회수 ${item.viewCount || 0}`;
			}

			renderDetailImages(item);

			originalDetailSnapshot = getDetailSnapshot();
			updateBtn.disabled = true;

			detailModal.show();
		} catch (error) {
			alert(error.message);
		}
	});

	function getSelectedDetailFileSnapshot() {
		const result = {};

		IMAGE_SLOTS.forEach(function(slot) {
			const file = selectedDetailFiles[slot.key];

			if (file) {
				result[slot.key] = {
					name: file.name,
					size: file.size,
					lastModified: file.lastModified
				};
			}
		});

		return result;
	}

	function getDetailSnapshot() {
		return JSON.stringify({
			title: detailTitleEl.value || '',
			category: detailCategoryEl.value || '',
			description: detailDescriptionEl.value || '',
			files: getSelectedDetailFileSnapshot()
		});
	}

	function syncUpdateButtonState() {
		updateBtn.disabled = originalDetailSnapshot === getDetailSnapshot();
	}

	[detailTitleEl, detailCategoryEl, detailDescriptionEl].forEach(function(el) {
		el.addEventListener('input', syncUpdateButtonState);
		el.addEventListener('change', syncUpdateButtonState);
	});

	updateBtn.addEventListener('click', async function() {
		const id = detailIdEl.value;

		if (!id) {
			return;
		}

		if (!detailTitleEl.value || !detailTitleEl.value.trim()) {
			alert('수술명을 입력해 주세요.');
			return;
		}

		if (!detailCategoryEl.value) {
			alert('분류를 선택해 주세요.');
			return;
		}

		const formData = new FormData();
		formData.append('title', detailTitleEl.value);
		formData.append('description', detailDescriptionEl.value);
		formData.append('category', detailCategoryEl.value);

		IMAGE_SLOTS.forEach(function(slot) {
			const file = selectedDetailFiles[slot.key];

			if (file) {
				formData.append(slot.requestName, file, file.name);
			}
		});

		try {
			const res = await request(`${LIST_URL}/${id}/update`, {
				method: 'POST',
				body: formData
			});

			const item = res.data;
			detailCurrentItem = item;

			detailTitleEl.value = item.title || '';
			detailCategoryEl.value = item.categoryCode || '';
			detailDescriptionEl.value = item.description || '';

			renderDetailImages(item);

			detailCreatedAtEl.textContent = `등록일 ${item.createdAtText || '-'}`;
			detailUpdatedAtEl.textContent = `수정일 ${item.updatedAtText || '-'}`;

			if (detailViewCountEl) {
				detailViewCountEl.textContent = `조회수 ${item.viewCount || 0}`;
			}

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