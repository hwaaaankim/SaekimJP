/* beforeAfterManager.js */
document.addEventListener('DOMContentLoaded', function() {
	'use strict';

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

	const VIEW_DEFINITIONS = [
		{
			key: 'front',
			label: '정면',
			beforeSlotKey: 'beforeFront',
			afterSlotKey: 'afterFront',
			removeRequestName: 'removeFrontView'
		},
		{
			key: 'angle45',
			label: '45도',
			beforeSlotKey: 'beforeAngle45',
			afterSlotKey: 'afterAngle45',
			removeRequestName: 'removeAngle45View'
		},
		{
			key: 'angle90',
			label: '90도',
			beforeSlotKey: 'beforeAngle90',
			afterSlotKey: 'afterAngle90',
			removeRequestName: 'removeAngle90View'
		}
	];

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
	const cropStepOneTab = document.getElementById('before-after-manager-crop-step-one-tab');
	const cropStepTwoTab = document.getElementById('before-after-manager-crop-step-two-tab');
	const cropStepOnePanel = document.getElementById('before-after-manager-crop-step-one-panel');
	const cropStepTwoPanel = document.getElementById('before-after-manager-crop-step-two-panel');
	const cropEditorFooter = document.getElementById('before-after-manager-editor-footer');

	const cropSourceStageWrap = document.getElementById('before-after-manager-crop-source-stage-wrap');
	const cropSourceStage = document.getElementById('before-after-manager-crop-source-stage');
	const cropSourceImage = document.getElementById('before-after-manager-crop-source-image');
	const cropSelection = document.getElementById('before-after-manager-crop-selection');
	const cropXInput = document.getElementById('before-after-manager-crop-x');
	const cropYInput = document.getElementById('before-after-manager-crop-y');
	const cropWidthInput = document.getElementById('before-after-manager-crop-width');
	const cropHeightInput = document.getElementById('before-after-manager-crop-height');
	const cropFullImageBtn = document.getElementById('before-after-manager-crop-full-image-btn');
	const cropCenterAreaBtn = document.getElementById('before-after-manager-crop-center-area-btn');
	const cropDrawAreaBtn = document.getElementById('before-after-manager-crop-draw-area-btn');
	const cropNextBtn = document.getElementById('before-after-manager-crop-next-btn');

	const placementStage = document.getElementById('before-after-manager-placement-stage');
	const placementImage = document.getElementById('before-after-manager-placement-image');
	const placementZoomOutBtn = document.getElementById('before-after-manager-placement-zoom-out-btn');
	const placementZoomInBtn = document.getElementById('before-after-manager-placement-zoom-in-btn');
	const placementZoomRange = document.getElementById('before-after-manager-placement-zoom-range');
	const placementZoomValue = document.getElementById('before-after-manager-placement-zoom-value');
	const placementXInput = document.getElementById('before-after-manager-placement-x');
	const placementYInput = document.getElementById('before-after-manager-placement-y');
	const placementWidthInput = document.getElementById('before-after-manager-placement-width');
	const placementHeightInput = document.getElementById('before-after-manager-placement-height');
	const placementBackgroundColor = document.getElementById('before-after-manager-placement-background-color');
	const placementBackgroundHex = document.getElementById('before-after-manager-placement-background-hex');
	const placementFitContainBtn = document.getElementById('before-after-manager-placement-fit-contain-btn');
	const placementFitCoverBtn = document.getElementById('before-after-manager-placement-fit-cover-btn');
	const placementOriginalBtn = document.getElementById('before-after-manager-placement-original-btn');
	const cropBackBtn = document.getElementById('before-after-manager-crop-back-btn');
	const cropSelectBtn = document.getElementById('before-after-manager-crop-select-btn');
	const cropCancelBtn = document.getElementById('before-after-manager-crop-cancel-btn');

	let selectedCreateFiles = {};
	let selectedDetailFiles = {};
	let removedDetailSlots = new Set();
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

	function hasText(value) {
		return typeof value === 'string' && value.trim().length > 0;
	}

	async function request(url, options) {
		const response = await fetch(url, options || {});
		let data;

		try {
			data = await response.json();
		} catch (error) {
			throw new Error('서버 응답을 확인하지 못했습니다.');
		}

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
			els.img.onload = null;
			els.img.onerror = null;
			els.img.removeAttribute('src');
			els.img.classList.add('d-none');
			els.img.style.display = 'none';
			els.empty.classList.remove('d-none');
			els.empty.style.display = 'flex';
			els.empty.innerHTML = `${escapeHtml(findSlot(slotKey)?.label || '이미지')}<br>420×500`;
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
			els.empty.innerHTML = '이미지 파일을<br>불러오지 못했습니다.';
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

	function getExistingDetailSlotValue(slotKey) {
		const slot = findSlot(slotKey);
		if (!slot || !detailCurrentItem) {
			return { src: '', fileName: '-' };
		}

		return {
			src: detailCurrentItem[slot.urlField] || '',
			fileName: detailCurrentItem[slot.originalNameField] || '-'
		};
	}

	function clearDetailSlot(slotKey) {
		const els = getSlotElements('detail', slotKey);
		if (els.input) {
			els.input.value = '';
		}

		if (selectedDetailFiles[slotKey]) {
			delete selectedDetailFiles[slotKey];
			const existing = getExistingDetailSlotValue(slotKey);

			if (existing.src && !removedDetailSlots.has(slotKey)) {
				setSlotPreview('detail', slotKey, existing.src, existing.fileName, true);
			} else {
				setSlotPreview('detail', slotKey, '', '-', false);
			}
		} else {
			const existing = getExistingDetailSlotValue(slotKey);

			if (existing.src && !removedDetailSlots.has(slotKey)) {
				removedDetailSlots.add(slotKey);
				setSlotPreview('detail', slotKey, '', '삭제 예정', false);
			} else {
				removedDetailSlots.delete(slotKey);
				setSlotPreview('detail', slotKey, existing.src, existing.fileName, Boolean(existing.src));
			}
		}

		syncDetailViewCount();
		syncUpdateButtonState();
	}

	function resetCreateForm() {
		createForm.reset();
		selectedCreateFiles = {};

		IMAGE_SLOTS.forEach(function(slot) {
			setSlotPreview('create', slot.key, '', '-', false);
			const els = getSlotElements('create', slot.key);
			if (els.input) {
				els.input.value = '';
			}
		});
	}

	function renderDetailImages(item) {
		selectedDetailFiles = {};
		removedDetailSlots = new Set();

		IMAGE_SLOTS.forEach(function(slot) {
			const src = item[slot.urlField] || '';
			const fileName = item[slot.originalNameField] || '-';
			setSlotPreview('detail', slot.key, src, fileName, Boolean(src));

			const els = getSlotElements('detail', slot.key);
			if (els.input) {
				els.input.value = '';
			}
		});

		syncDetailViewCount();
	}

	function appendCroppedFileToPreview(context, slotKey, file) {
		if (!file) {
			return;
		}

		if (context === 'create') {
			selectedCreateFiles[slotKey] = file;
		} else {
			selectedDetailFiles[slotKey] = file;
			removedDetailSlots.delete(slotKey);
		}

		const reader = new FileReader();

		reader.onload = function(event) {
			setSlotPreview(context, slotKey, event.target.result, file.name, true);

			if (context === 'detail') {
				syncDetailViewCount();
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

	function clampNumber(value, min, max) {
		const numeric = Number(value);
		if (!Number.isFinite(numeric)) {
			return min;
		}
		return Math.min(max, Math.max(min, numeric));
	}

	function roundEditorNumber(value) {
		return Math.round(Number(value) || 0);
	}

	function normalizeHexColor(value) {
		const normalized = String(value || '').trim().toLowerCase();
		if (/^#[0-9a-f]{6}$/.test(normalized)) {
			return normalized;
		}
		if (/^[0-9a-f]{6}$/.test(normalized)) {
			return `#${normalized}`;
		}
		return null;
	}

	function setCropEditorStep(step) {
		if (!cropState) {
			return;
		}

		cropState.step = step === 2 ? 2 : 1;
		const isStepOne = cropState.step === 1;

		cropStepOnePanel.classList.toggle('d-none', !isStepOne);
		cropStepTwoPanel.classList.toggle('d-none', isStepOne);
		cropStepOneTab.classList.toggle('is-active', isStepOne);
		cropStepOneTab.classList.toggle('is-complete', !isStepOne);
		cropStepTwoTab.classList.toggle('is-active', !isStepOne);
		cropStepTwoTab.classList.toggle('is-disabled', isStepOne);
		cropBackBtn.classList.toggle('d-none', isStepOne);
		cropSelectBtn.classList.toggle('d-none', isStepOne);
		cropEditorFooter.classList.toggle('d-none', isStepOne);

		cropGuideEl.textContent = isStepOne
			? `1단계: 원본 ${cropState.naturalWidth}×${cropState.naturalHeight}px에서 사용할 영역을 자릅니다. 테두리와 모서리를 드래그하거나 X·Y·너비·높이를 픽셀 단위로 입력하세요.`
			: `2단계: 잘라낸 이미지를 ${TARGET_WIDTH}×${TARGET_HEIGHT}px 안에 배치합니다. 드래그, 정렬 버튼, 수치 입력으로 위치를 맞추고 배경색을 선택하세요.`;

		if (isStepOne) {
			requestAnimationFrame(function() {
				refreshCropSourceStageMetrics();
				renderCropSelection();
			});
		} else {
			requestAnimationFrame(function() {
				renderPlacement();
			});
		}
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
					step: 1,
					crop: {
						x: 0,
						y: 0,
						width: image.naturalWidth,
						height: image.naturalHeight
					},
					sourceDisplayScale: 1,
					sourcePointer: null,
					forceCreateNext: false,
					placementPointer: null,
					placement: {
						x: 0,
						y: 0,
						width: 0,
						height: 0,
						containWidth: 0,
						containHeight: 0,
						zoomPercent: 100,
						backgroundColor: '#ffffff',
						previewUrl: ''
					}
				};

				cropTitleEl.textContent = `${slot.label} 이미지 편집`;
				cropSourceImage.src = image.src;
				placementBackgroundColor.value = '#ffffff';
				placementBackgroundHex.value = '#ffffff';
				cropModal.show();

				setTimeout(function() {
					setCropEditorStep(1);
				}, 120);
			};

			image.onerror = function() {
				alert('이미지를 불러오지 못했습니다.');
				inputEl.value = '';
			};

			image.src = e.target.result;
		};

		reader.onerror = function() {
			alert('이미지 파일을 읽지 못했습니다.');
			inputEl.value = '';
		};

		reader.readAsDataURL(file);
	}

	function refreshCropSourceStageMetrics() {
		if (!cropState || !cropSourceStageWrap) {
			return;
		}

		const availableWidth = Math.max(280, Math.min(820, cropSourceStageWrap.clientWidth - 4));
		const availableHeight = Math.max(280, Math.min(580, window.innerHeight * 0.52));
		const scale = Math.min(
			availableWidth / cropState.naturalWidth,
			availableHeight / cropState.naturalHeight
		);

		cropState.sourceDisplayScale = Math.max(scale, 0.0001);
		cropSourceStage.style.width = `${cropState.naturalWidth * cropState.sourceDisplayScale}px`;
		cropSourceStage.style.height = `${cropState.naturalHeight * cropState.sourceDisplayScale}px`;
	}

	function normalizeCropRect() {
		if (!cropState) {
			return;
		}

		const minCropSize = Math.min(10, cropState.naturalWidth, cropState.naturalHeight);
		const crop = cropState.crop;

		crop.width = clampNumber(crop.width, minCropSize, cropState.naturalWidth);
		crop.height = clampNumber(crop.height, minCropSize, cropState.naturalHeight);
		crop.x = clampNumber(crop.x, 0, cropState.naturalWidth - crop.width);
		crop.y = clampNumber(crop.y, 0, cropState.naturalHeight - crop.height);
	}

	function syncCropNumericInputs() {
		if (!cropState) {
			return;
		}

		cropXInput.value = roundEditorNumber(cropState.crop.x);
		cropYInput.value = roundEditorNumber(cropState.crop.y);
		cropWidthInput.value = roundEditorNumber(cropState.crop.width);
		cropHeightInput.value = roundEditorNumber(cropState.crop.height);
	}

	function renderCropSelection() {
		if (!cropState) {
			return;
		}

		normalizeCropRect();
		const scale = cropState.sourceDisplayScale;
		cropSelection.style.left = `${cropState.crop.x * scale}px`;
		cropSelection.style.top = `${cropState.crop.y * scale}px`;
		cropSelection.style.width = `${cropState.crop.width * scale}px`;
		cropSelection.style.height = `${cropState.crop.height * scale}px`;
		syncCropNumericInputs();
	}

	function getSourceNaturalPoint(event) {
		const rect = cropSourceStage.getBoundingClientRect();
		return {
			x: clampNumber((event.clientX - rect.left) / cropState.sourceDisplayScale, 0, cropState.naturalWidth),
			y: clampNumber((event.clientY - rect.top) / cropState.sourceDisplayScale, 0, cropState.naturalHeight)
		};
	}

	function beginCropPointer(event) {
		if (!cropState || cropState.step !== 1) {
			return;
		}

		const point = getSourceNaturalPoint(event);
		const handle = event.target.closest('[data-crop-handle]');
		const insideSelection = event.target.closest('#before-after-manager-crop-selection');
		let mode = 'create';

		if (cropState.forceCreateNext) {
			cropState.forceCreateNext = false;
			cropSourceStage.classList.remove('is-draw-mode');
			cropDrawAreaBtn.classList.remove('active');
		} else if (handle) {
			mode = `resize-${handle.dataset.cropHandle}`;
		} else if (insideSelection) {
			mode = 'move';
		}

		cropState.sourcePointer = {
			pointerId: event.pointerId,
			mode: mode,
			startPoint: point,
			startCrop: { ...cropState.crop }
		};

		if (mode === 'create') {
			cropState.crop = {
				x: point.x,
				y: point.y,
				width: 1,
				height: 1
			};
			renderCropSelection();
		}

		cropSourceStage.setPointerCapture(event.pointerId);
		event.preventDefault();
	}

	function moveCropPointer(event) {
		if (!cropState || !cropState.sourcePointer || cropState.sourcePointer.pointerId !== event.pointerId) {
			return;
		}

		const pointer = cropState.sourcePointer;
		const point = getSourceNaturalPoint(event);
		const start = pointer.startCrop;
		const dx = point.x - pointer.startPoint.x;
		const dy = point.y - pointer.startPoint.y;
		const minSize = Math.min(10, cropState.naturalWidth, cropState.naturalHeight);

		if (pointer.mode === 'move') {
			cropState.crop.x = clampNumber(start.x + dx, 0, cropState.naturalWidth - start.width);
			cropState.crop.y = clampNumber(start.y + dy, 0, cropState.naturalHeight - start.height);
		} else if (pointer.mode === 'create') {
			cropState.crop.x = Math.min(pointer.startPoint.x, point.x);
			cropState.crop.y = Math.min(pointer.startPoint.y, point.y);
			cropState.crop.width = Math.max(1, Math.abs(point.x - pointer.startPoint.x));
			cropState.crop.height = Math.max(1, Math.abs(point.y - pointer.startPoint.y));
		} else if (pointer.mode.startsWith('resize-')) {
			const handle = pointer.mode.replace('resize-', '');
			let left = start.x;
			let top = start.y;
			let right = start.x + start.width;
			let bottom = start.y + start.height;

			if (handle.includes('w')) {
				left = clampNumber(start.x + dx, 0, right - minSize);
			}
			if (handle.includes('e')) {
				right = clampNumber(start.x + start.width + dx, left + minSize, cropState.naturalWidth);
			}
			if (handle.includes('n')) {
				top = clampNumber(start.y + dy, 0, bottom - minSize);
			}
			if (handle.includes('s')) {
				bottom = clampNumber(start.y + start.height + dy, top + minSize, cropState.naturalHeight);
			}

			cropState.crop = {
				x: left,
				y: top,
				width: right - left,
				height: bottom - top
			};
		}

		renderCropSelection();
		event.preventDefault();
	}

	function endCropPointer(event) {
		if (!cropState || !cropState.sourcePointer || cropState.sourcePointer.pointerId !== event.pointerId) {
			return;
		}

		cropState.sourcePointer = null;
		normalizeCropRect();
		renderCropSelection();

		try {
			cropSourceStage.releasePointerCapture(event.pointerId);
		} catch (ignored) {
		}
	}

	function applyCropNumericInputs() {
		if (!cropState) {
			return;
		}

		cropState.crop.x = Number(cropXInput.value);
		cropState.crop.y = Number(cropYInput.value);
		cropState.crop.width = Number(cropWidthInput.value);
		cropState.crop.height = Number(cropHeightInput.value);
		normalizeCropRect();
		renderCropSelection();
	}

	function setFullImageCrop() {
		if (!cropState) {
			return;
		}

		cropState.forceCreateNext = false;
		cropSourceStage.classList.remove('is-draw-mode');
		cropDrawAreaBtn.classList.remove('active');
		cropState.crop = {
			x: 0,
			y: 0,
			width: cropState.naturalWidth,
			height: cropState.naturalHeight
		};
		renderCropSelection();
	}

	function setCenteredCropArea() {
		if (!cropState) {
			return;
		}

		cropState.forceCreateNext = false;
		cropSourceStage.classList.remove('is-draw-mode');
		cropDrawAreaBtn.classList.remove('active');
		const width = Math.max(10, cropState.naturalWidth * 0.6);
		const height = Math.max(10, cropState.naturalHeight * 0.6);
		cropState.crop = {
			x: (cropState.naturalWidth - width) / 2,
			y: (cropState.naturalHeight - height) / 2,
			width: width,
			height: height
		};
		renderCropSelection();
	}

	function buildCroppedPreview() {
		if (!cropState) {
			return;
		}

		normalizeCropRect();
		const crop = cropState.crop;
		const previewCanvas = document.createElement('canvas');
		previewCanvas.width = Math.max(1, roundEditorNumber(crop.width));
		previewCanvas.height = Math.max(1, roundEditorNumber(crop.height));
		const previewContext = previewCanvas.getContext('2d');

		previewContext.imageSmoothingEnabled = true;
		previewContext.imageSmoothingQuality = 'high';
		previewContext.drawImage(
			cropState.image,
			crop.x,
			crop.y,
			crop.width,
			crop.height,
			0,
			0,
			previewCanvas.width,
			previewCanvas.height
		);

		cropState.placement.previewUrl = previewCanvas.toDataURL('image/png');
		placementImage.src = cropState.placement.previewUrl;
		setPlacementSizeMode('contain');
	}

	function normalizePlacement() {
		if (!cropState) {
			return;
		}

		const placement = cropState.placement;
		const minVisible = 10;
		placement.width = Math.max(1, Number(placement.width) || 1);
		placement.height = Math.max(1, Number(placement.height) || 1);
		placement.x = clampNumber(placement.x, -placement.width + minVisible, TARGET_WIDTH - minVisible);
		placement.y = clampNumber(placement.y, -placement.height + minVisible, TARGET_HEIGHT - minVisible);
	}

	function syncPlacementNumericInputs() {
		if (!cropState) {
			return;
		}

		const placement = cropState.placement;
		placementXInput.value = roundEditorNumber(placement.x);
		placementYInput.value = roundEditorNumber(placement.y);
		placementWidthInput.value = roundEditorNumber(placement.width);
		placementHeightInput.value = roundEditorNumber(placement.height);
		placementZoomRange.value = clampNumber(placement.zoomPercent, 10, 1000);
		placementZoomValue.textContent = `${roundEditorNumber(placement.zoomPercent)}%`;
	}

	function renderPlacement() {
		if (!cropState) {
			return;
		}

		normalizePlacement();
		const stageWidth = placementStage.clientWidth || TARGET_WIDTH;
		const stageHeight = placementStage.clientHeight || TARGET_HEIGHT;
		const ratioX = stageWidth / TARGET_WIDTH;
		const ratioY = stageHeight / TARGET_HEIGHT;
		const placement = cropState.placement;

		placementStage.style.backgroundColor = placement.backgroundColor;
		placementImage.style.left = `${placement.x * ratioX}px`;
		placementImage.style.top = `${placement.y * ratioY}px`;
		placementImage.style.width = `${placement.width * ratioX}px`;
		placementImage.style.height = `${placement.height * ratioY}px`;
		syncPlacementNumericInputs();
	}

	function updatePlacementZoomFromSize() {
		if (!cropState || cropState.placement.containWidth <= 0) {
			return;
		}

		cropState.placement.zoomPercent = (cropState.placement.width / cropState.placement.containWidth) * 100;
	}

	function setPlacementSize(width, height, align) {
		if (!cropState) {
			return;
		}

		cropState.placement.width = Math.max(1, width);
		cropState.placement.height = Math.max(1, height);
		updatePlacementZoomFromSize();
		alignPlacement(align || 'center');
	}

	function setPlacementSizeMode(mode) {
		if (!cropState) {
			return;
		}

		const crop = cropState.crop;
		const containScale = Math.min(TARGET_WIDTH / crop.width, TARGET_HEIGHT / crop.height);
		const coverScale = Math.max(TARGET_WIDTH / crop.width, TARGET_HEIGHT / crop.height);
		cropState.placement.containWidth = crop.width * containScale;
		cropState.placement.containHeight = crop.height * containScale;

		if (mode === 'cover') {
			setPlacementSize(crop.width * coverScale, crop.height * coverScale, 'center');
		} else if (mode === 'original') {
			setPlacementSize(crop.width, crop.height, 'center');
		} else {
			setPlacementSize(cropState.placement.containWidth, cropState.placement.containHeight, 'center');
		}
	}

	function alignPlacement(position) {
		if (!cropState) {
			return;
		}

		const placement = cropState.placement;
		const centeredX = (TARGET_WIDTH - placement.width) / 2;
		const centeredY = (TARGET_HEIGHT - placement.height) / 2;

		switch (position) {
			case 'top':
				placement.x = centeredX;
				placement.y = 0;
				break;
			case 'left':
				placement.x = 0;
				placement.y = centeredY;
				break;
			case 'right':
				placement.x = TARGET_WIDTH - placement.width;
				placement.y = centeredY;
				break;
			case 'bottom':
				placement.x = centeredX;
				placement.y = TARGET_HEIGHT - placement.height;
				break;
			default:
				placement.x = centeredX;
				placement.y = centeredY;
				break;
		}

		renderPlacement();
	}

	function setPlacementZoom(percent) {
		if (!cropState) {
			return;
		}

		const placement = cropState.placement;
		const previousCenterX = placement.x + placement.width / 2;
		const previousCenterY = placement.y + placement.height / 2;
		const safePercent = clampNumber(percent, 10, 1000);
		const aspectRatio = cropState.crop.width / cropState.crop.height;

		placement.zoomPercent = safePercent;
		placement.width = placement.containWidth * safePercent / 100;
		placement.height = placement.width / aspectRatio;
		placement.x = previousCenterX - placement.width / 2;
		placement.y = previousCenterY - placement.height / 2;
		renderPlacement();
	}

	function applyPlacementNumericInputs(changedField) {
		if (!cropState) {
			return;
		}

		const placement = cropState.placement;
		const aspectRatio = cropState.crop.width / cropState.crop.height;
		placement.x = Number(placementXInput.value);
		placement.y = Number(placementYInput.value);

		if (changedField === 'height') {
			placement.height = Math.max(1, Number(placementHeightInput.value) || 1);
			placement.width = placement.height * aspectRatio;
		} else if (changedField === 'width') {
			placement.width = Math.max(1, Number(placementWidthInput.value) || 1);
			placement.height = placement.width / aspectRatio;
		}

		updatePlacementZoomFromSize();
		renderPlacement();
	}

	function beginPlacementPointer(event) {
		if (!cropState || cropState.step !== 2 || event.target !== placementImage) {
			return;
		}

		cropState.placementPointer = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			startPlacementX: cropState.placement.x,
			startPlacementY: cropState.placement.y
		};
		placementStage.setPointerCapture(event.pointerId);
		event.preventDefault();
	}

	function movePlacementPointer(event) {
		if (!cropState || !cropState.placementPointer || cropState.placementPointer.pointerId !== event.pointerId) {
			return;
		}

		const pointer = cropState.placementPointer;
		const ratioX = TARGET_WIDTH / placementStage.clientWidth;
		const ratioY = TARGET_HEIGHT / placementStage.clientHeight;
		cropState.placement.x = pointer.startPlacementX + (event.clientX - pointer.startX) * ratioX;
		cropState.placement.y = pointer.startPlacementY + (event.clientY - pointer.startY) * ratioY;
		renderPlacement();
		event.preventDefault();
	}

	function endPlacementPointer(event) {
		if (!cropState || !cropState.placementPointer || cropState.placementPointer.pointerId !== event.pointerId) {
			return;
		}

		cropState.placementPointer = null;
		try {
			placementStage.releasePointerCapture(event.pointerId);
		} catch (ignored) {
		}
	}

	function closeCropEditor(clearInput) {
		if (cropState && clearInput) {
			const els = getSlotElements(cropState.context, cropState.slotKey);
			if (els.input) {
				els.input.value = '';
			}
		}

		if (document.activeElement && typeof document.activeElement.blur === 'function') {
			document.activeElement.blur();
		}

		cropSelectBtn.disabled = false;
		cropSourceStage.classList.remove('is-draw-mode');
		cropDrawAreaBtn.classList.remove('active');
		cropState = null;
		cropSourceImage.removeAttribute('src');
		placementImage.removeAttribute('src');
		cropModal.hide();
	}

	cropSourceStage.addEventListener('pointerdown', beginCropPointer);
	cropSourceStage.addEventListener('pointermove', moveCropPointer);
	cropSourceStage.addEventListener('pointerup', endCropPointer);
	cropSourceStage.addEventListener('pointercancel', endCropPointer);

	[cropXInput, cropYInput, cropWidthInput, cropHeightInput].forEach(function(input) {
		input.addEventListener('change', applyCropNumericInputs);
		input.addEventListener('blur', applyCropNumericInputs);
	});

	cropFullImageBtn.addEventListener('click', setFullImageCrop);
	cropCenterAreaBtn.addEventListener('click', setCenteredCropArea);
	cropDrawAreaBtn.addEventListener('click', function() {
		if (!cropState) {
			return;
		}

		cropState.forceCreateNext = true;
		cropSourceStage.classList.add('is-draw-mode');
		cropDrawAreaBtn.classList.add('active');
	});

	cropNextBtn.addEventListener('click', function() {
		if (!cropState) {
			return;
		}

		cropState.forceCreateNext = false;
		cropSourceStage.classList.remove('is-draw-mode');
		cropDrawAreaBtn.classList.remove('active');
		buildCroppedPreview();
		setCropEditorStep(2);
	});

	cropBackBtn.addEventListener('click', function() {
		setCropEditorStep(1);
	});

	placementStage.addEventListener('pointerdown', beginPlacementPointer);
	placementStage.addEventListener('pointermove', movePlacementPointer);
	placementStage.addEventListener('pointerup', endPlacementPointer);
	placementStage.addEventListener('pointercancel', endPlacementPointer);

	document.querySelectorAll('[data-placement-align]').forEach(function(button) {
		button.addEventListener('click', function() {
			alignPlacement(this.dataset.placementAlign);
		});
	});

	placementFitContainBtn.addEventListener('click', function() {
		setPlacementSizeMode('contain');
	});

	placementFitCoverBtn.addEventListener('click', function() {
		setPlacementSizeMode('cover');
	});

	placementOriginalBtn.addEventListener('click', function() {
		setPlacementSizeMode('original');
	});

	placementZoomOutBtn.addEventListener('click', function() {
		setPlacementZoom(cropState ? cropState.placement.zoomPercent - 10 : 100);
	});

	placementZoomInBtn.addEventListener('click', function() {
		setPlacementZoom(cropState ? cropState.placement.zoomPercent + 10 : 100);
	});

	placementZoomRange.addEventListener('input', function() {
		setPlacementZoom(Number(this.value));
	});

	placementXInput.addEventListener('change', function() {
		applyPlacementNumericInputs('position');
	});
	placementYInput.addEventListener('change', function() {
		applyPlacementNumericInputs('position');
	});
	placementWidthInput.addEventListener('change', function() {
		applyPlacementNumericInputs('width');
	});
	placementHeightInput.addEventListener('change', function() {
		applyPlacementNumericInputs('height');
	});

	placementBackgroundColor.addEventListener('input', function() {
		if (!cropState) {
			return;
		}
		cropState.placement.backgroundColor = this.value;
		placementBackgroundHex.value = this.value;
		renderPlacement();
	});

	placementBackgroundHex.addEventListener('change', function() {
		if (!cropState) {
			return;
		}
		const color = normalizeHexColor(this.value);
		if (!color) {
			alert('배경색은 #RRGGBB 형식으로 입력해 주세요.');
			this.value = cropState.placement.backgroundColor;
			return;
		}
		cropState.placement.backgroundColor = color;
		placementBackgroundColor.value = color;
		this.value = color;
		renderPlacement();
	});

	window.addEventListener('resize', function() {
		if (!cropState) {
			return;
		}

		if (cropState.step === 1) {
			refreshCropSourceStageMetrics();
			renderCropSelection();
		} else {
			renderPlacement();
		}
	});

	cropCancelBtn.addEventListener('click', function() {
		closeCropEditor(true);
	});

	cropSelectBtn.addEventListener('click', function() {
		if (!cropState || cropState.step !== 2) {
			return;
		}

		const currentState = cropState;
		cropSelectBtn.disabled = true;

		const canvas = document.createElement('canvas');
		canvas.width = TARGET_WIDTH;
		canvas.height = TARGET_HEIGHT;
		const ctx = canvas.getContext('2d');
		const crop = cropState.crop;
		const placement = cropState.placement;

		ctx.fillStyle = placement.backgroundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';
		ctx.drawImage(
			cropState.image,
			crop.x,
			crop.y,
			crop.width,
			crop.height,
			placement.x,
			placement.y,
			placement.width,
			placement.height
		);

		canvas.toBlob(function(blob) {
			if (!blob) {
				cropSelectBtn.disabled = false;
				alert('이미지 처리에 실패했습니다.');
				return;
			}

			const fileName = buildCroppedFileName(currentState.originalFile.name, currentState.slot.filePrefix);
			const croppedFile = new File([blob], fileName, {
				type: 'image/jpeg',
				lastModified: Date.now()
			});

			appendCroppedFileToPreview(currentState.context, currentState.slotKey, croppedFile);
			const els = getSlotElements(currentState.context, currentState.slotKey);
			if (els.input) {
				els.input.value = '';
			}
			closeCropEditor(false);
		}, 'image/jpeg', 0.94);
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

	function getCompleteCreateViewKeys() {
		const complete = [];

		for (const view of VIEW_DEFINITIONS) {
			const hasBefore = Boolean(selectedCreateFiles[view.beforeSlotKey]);
			const hasAfter = Boolean(selectedCreateFiles[view.afterSlotKey]);

			if (hasBefore !== hasAfter) {
				alert(`${view.label} 이미지는 Before와 After를 모두 등록해 주세요.`);
				return null;
			}

			if (hasBefore && hasAfter) {
				complete.push(view.key);
			}
		}

		return complete;
	}

	function getItemCompleteViews(item) {
		return VIEW_DEFINITIONS.filter(function(view) {
			const beforeSlot = findSlot(view.beforeSlotKey);
			const afterSlot = findSlot(view.afterSlotKey);
			return Boolean(
				beforeSlot &&
				afterSlot &&
				hasText(item[beforeSlot.urlField]) &&
				hasText(item[afterSlot.urlField])
			);
		});
	}

	function renderAdminListPair(view, item) {
		const beforeSlot = findSlot(view.beforeSlotKey);
		const afterSlot = findSlot(view.afterSlotKey);
		const beforeUrl = beforeSlot ? item[beforeSlot.urlField] : '';
		const afterUrl = afterSlot ? item[afterSlot.urlField] : '';
		const title = item.title || '';

		return `
			<div class="before-after-manager-list-card-pair">
				<div class="before-after-manager-list-card-pair-title">${escapeHtml(view.label)}</div>
				<div class="before-after-manager-list-card-pair-images">
					<div class="before-after-manager-list-card-image-col">
						<img src="${escapeHtml(beforeUrl)}"
							alt="${escapeHtml(title)} ${escapeHtml(view.label)} before"
							loading="lazy"
							data-admin-list-image>
						<div class="before-after-manager-list-card-image-empty d-none" data-admin-list-image-error>이미지 파일 없음</div>
						<span class="before-after-manager-list-card-label">BEFORE</span>
					</div>
					<div class="before-after-manager-list-card-image-col">
						<img src="${escapeHtml(afterUrl)}"
							alt="${escapeHtml(title)} ${escapeHtml(view.label)} after"
							loading="lazy"
							data-admin-list-image>
						<div class="before-after-manager-list-card-image-empty d-none" data-admin-list-image-error>이미지 파일 없음</div>
						<span class="before-after-manager-list-card-label">AFTER</span>
					</div>
				</div>
			</div>
		`;
	}

	function bindAdminListImageFallbacks() {
		listEl.querySelectorAll('[data-admin-list-image]').forEach(function(image) {
			const errorEl = image.parentElement.querySelector('[data-admin-list-image-error]');

			function showError() {
				image.classList.add('d-none');
				if (errorEl) {
					errorEl.classList.remove('d-none');
				}
			}

			image.addEventListener('error', showError);
			if (image.complete && image.naturalWidth === 0) {
				showError();
			}
		});
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
			const views = getItemCompleteViews(item);
			const pairsHtml = views.map(function(view) {
				return renderAdminListPair(view, item);
			}).join('');

			return `
				<div class="col-12 col-xl-6 before-after-manager-list-item">
					<div class="before-after-manager-list-card">
						<div class="before-after-manager-list-card-image-grid">
							${pairsHtml || '<div class="before-after-manager-empty">완성된 전후사진 쌍이 없습니다.</div>'}
						</div>

						<div class="before-after-manager-list-card-body">
							<div class="d-flex align-items-center gap-2 flex-wrap mb-2">
								<span class="badge bg-light text-dark border">${escapeHtml(item.categoryLabel || '-')}</span>
								<span class="badge bg-dark-subtle text-dark">촬영 시점 ${views.length}개</span>
							</div>

							<div>
								<button type="button"
									class="before-after-manager-list-card-title-btn"
									data-before-after-id="${escapeHtml(item.id)}">
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

		bindAdminListImageFallbacks();
	}

	async function loadList() {
		try {
			const category = categoryFilterEl.value || 'all';
			const response = await request(`${LIST_URL}?category=${encodeURIComponent(category)}&offset=0&limit=100`);
			const listData = response.data || {};

			renderList(listData.items || []);
			totalCountEl.textContent = `총 ${listData.totalCount || 0}건`;
		} catch (error) {
			alert(error.message);
		}
	}

	createForm.addEventListener('submit', async function(event) {
		event.preventDefault();

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

		if (!description || !description.trim()) {
			alert('간단한 설명문구를 입력해 주세요.');
			return;
		}

		const completeViewKeys = getCompleteCreateViewKeys();
		if (completeViewKeys === null) {
			return;
		}

		if (completeViewKeys.length < 1) {
			alert('정면, 45도, 90도 중 하나 이상의 Before·After 이미지 쌍을 등록해 주세요.');
			return;
		}

		const formData = new FormData();
		formData.append('title', title.trim());
		formData.append('category', category);
		formData.append('description', description.trim());

		IMAGE_SLOTS.forEach(function(slot) {
			const file = selectedCreateFiles[slot.key];
			if (file) {
				formData.append(slot.requestName, file, file.name);
			}
		});

		try {
			await request(CREATE_URL, {
				method: 'POST',
				body: formData
			});

			alert('전후사진이 등록되었습니다.');
			resetCreateForm();
			await loadList();
		} catch (error) {
			alert(error.message);
		}
	});

	function getFinalDetailSlotExists(slotKey) {
		if (selectedDetailFiles[slotKey]) {
			return true;
		}

		if (removedDetailSlots.has(slotKey)) {
			return false;
		}

		const existing = getExistingDetailSlotValue(slotKey);
		return hasText(existing.src);
	}

	function getFinalDetailCompleteViews(showAlert) {
		const complete = [];

		for (const view of VIEW_DEFINITIONS) {
			const hasBefore = getFinalDetailSlotExists(view.beforeSlotKey);
			const hasAfter = getFinalDetailSlotExists(view.afterSlotKey);

			if (hasBefore !== hasAfter) {
				if (showAlert) {
					alert(`${view.label} 이미지는 Before와 After가 모두 있어야 합니다.`);
				}
				return null;
			}

			if (hasBefore && hasAfter) {
				complete.push(view.key);
			}
		}

		return complete;
	}

	function syncDetailViewCount() {
		if (!detailViewCountEl) {
			return;
		}

		const complete = getFinalDetailCompleteViews(false);
		detailViewCountEl.textContent = `촬영 시점 ${complete ? complete.length : 0}개`;
	}

	function openDetail(item) {
		detailCurrentItem = item;
		detailIdEl.value = item.id;
		detailTitleEl.value = item.title || '';
		detailCategoryEl.value = item.categoryCode || '';
		detailDescriptionEl.value = item.description || '';
		detailCreatedAtEl.textContent = `등록일 ${item.createdAtText || '-'}`;
		detailUpdatedAtEl.textContent = `수정일 ${item.updatedAtText || '-'}`;

		renderDetailImages(item);
		originalDetailSnapshot = getDetailSnapshot();
		updateBtn.disabled = true;
		detailModal.show();
	}

	listEl.addEventListener('click', async function(event) {
		const button = event.target.closest('[data-before-after-id]');
		if (!button) {
			return;
		}

		try {
			const response = await request(`${LIST_URL}/${button.getAttribute('data-before-after-id')}`);
			openDetail(response.data);
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
			files: getSelectedDetailFileSnapshot(),
			removedSlots: Array.from(removedDetailSlots).sort()
		});
	}

	function syncUpdateButtonState() {
		if (!detailCurrentItem) {
			updateBtn.disabled = true;
			return;
		}

		updateBtn.disabled = originalDetailSnapshot === getDetailSnapshot();
	}

	[detailTitleEl, detailCategoryEl, detailDescriptionEl].forEach(function(element) {
		element.addEventListener('input', syncUpdateButtonState);
		element.addEventListener('change', syncUpdateButtonState);
	});

	updateBtn.addEventListener('click', async function() {
		const id = detailIdEl.value;
		if (!id || !detailCurrentItem) {
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

		if (!detailDescriptionEl.value || !detailDescriptionEl.value.trim()) {
			alert('간단한 설명문구를 입력해 주세요.');
			return;
		}

		const completeViewKeys = getFinalDetailCompleteViews(true);
		if (completeViewKeys === null) {
			return;
		}

		if (completeViewKeys.length < 1) {
			alert('하나 이상의 Before·After 이미지 쌍은 반드시 유지해야 합니다.');
			return;
		}

		const completeViewSet = new Set(completeViewKeys);
		const formData = new FormData();
		formData.append('title', detailTitleEl.value.trim());
		formData.append('description', detailDescriptionEl.value.trim());
		formData.append('category', detailCategoryEl.value);

		VIEW_DEFINITIONS.forEach(function(view) {
			if (!completeViewSet.has(view.key)) {
				const beforeExisting = getExistingDetailSlotValue(view.beforeSlotKey).src;
				const afterExisting = getExistingDetailSlotValue(view.afterSlotKey).src;

				if (hasText(beforeExisting) || hasText(afterExisting)) {
					formData.append(view.removeRequestName, 'true');
				}
				return;
			}

			[view.beforeSlotKey, view.afterSlotKey].forEach(function(slotKey) {
				const slot = findSlot(slotKey);
				const file = selectedDetailFiles[slotKey];
				if (slot && file) {
					formData.append(slot.requestName, file, file.name);
				}
			});
		});

		try {
			const response = await request(`${LIST_URL}/${id}/update`, {
				method: 'POST',
				body: formData
			});
			const item = response.data;

			detailCurrentItem = item;
			detailTitleEl.value = item.title || '';
			detailCategoryEl.value = item.categoryCode || '';
			detailDescriptionEl.value = item.description || '';
			detailCreatedAtEl.textContent = `등록일 ${item.createdAtText || '-'}`;
			detailUpdatedAtEl.textContent = `수정일 ${item.updatedAtText || '-'}`;

			renderDetailImages(item);
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
			detailCurrentItem = null;
			await loadList();
		} catch (error) {
			alert(error.message);
		}
	});

	refreshBtn.addEventListener('click', loadList);
	categoryFilterEl.addEventListener('change', loadList);

	resetCreateForm();
	loadList();
});
