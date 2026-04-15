(function() {
	'use strict';

	const pageEl = document.getElementById('eye-surgery-manager-page');
	if (!pageEl) {
		return;
	}

	const state = {
		groupType: pageEl.dataset.groupType,
		groupLabel: pageEl.dataset.groupLabel,
		pageData: null,
		previewSortable: null,
		middleSortable: null,
		detailSortables: new Map()
	};

	const el = {
		previewForm: document.getElementById('eye-surgery-manager-preview-form'),
		previewFiles: document.getElementById('eye-surgery-manager-preview-files'),
		previewSortable: document.getElementById('eye-surgery-manager-preview-sortable'),
		previewOrderSaveBtn: document.getElementById('eye-surgery-manager-preview-order-save-btn'),

		middleForm: document.getElementById('eye-surgery-manager-middle-form'),
		middleSortable: document.getElementById('eye-surgery-manager-middle-sortable'),
		middleOrderSaveBtn: document.getElementById('eye-surgery-manager-middle-order-save-btn'),

		detailForm: document.getElementById('eye-surgery-manager-detail-form'),
		detailMiddleSelect: document.getElementById('eye-surgery-manager-detail-middle'),
		detailStepList: document.getElementById('eye-surgery-manager-step-list'),
		detailIconList: document.getElementById('eye-surgery-manager-icon-list'),
		addStepBtn: document.getElementById('eye-surgery-manager-add-step-btn'),
		clearStepBtn: document.getElementById('eye-surgery-manager-clear-step-btn'),
		addIconBtn: document.getElementById('eye-surgery-manager-add-icon-btn'),
		clearIconBtn: document.getElementById('eye-surgery-manager-clear-icon-btn'),

		detailGroupList: document.getElementById('eye-surgery-manager-detail-group-list'),

		middleModalEl: document.getElementById('eye-surgery-manager-middle-modal'),
		middleEditForm: document.getElementById('eye-surgery-manager-middle-edit-form'),

		detailModalEl: document.getElementById('eye-surgery-manager-detail-modal'),
		detailEditForm: document.getElementById('eye-surgery-manager-detail-edit-form'),
		detailDeleteBtn: document.getElementById('eye-surgery-manager-detail-delete-btn'),
		editStepList: document.getElementById('eye-surgery-manager-edit-step-list'),
		editIconList: document.getElementById('eye-surgery-manager-edit-icon-list'),
		editAddStepBtn: document.getElementById('eye-surgery-manager-edit-add-step-btn'),
		editClearStepBtn: document.getElementById('eye-surgery-manager-edit-clear-step-btn'),
		editAddIconBtn: document.getElementById('eye-surgery-manager-edit-add-icon-btn'),
		editClearIconBtn: document.getElementById('eye-surgery-manager-edit-clear-icon-btn')
	};

	const middleModal = window.bootstrap && el.middleModalEl ? new bootstrap.Modal(el.middleModalEl) : null;
	const detailModal = window.bootstrap && el.detailModalEl ? new bootstrap.Modal(el.detailModalEl) : null;

	init();

	async function init() {
		bindEvents();
		resetCreateDetailForm();
		await loadPageData();
	}

	function bindEvents() {
		el.previewForm.addEventListener('submit', onSubmitPreviewImages);
		el.previewOrderSaveBtn.addEventListener('click', onSavePreviewOrder);

		el.previewSortable.addEventListener('click', async function(e) {
			const btn = e.target.closest('[data-action="delete-preview"]');
			if (!btn) return;

			const previewId = btn.dataset.id;
			if (!previewId) return;

			if (!confirm('미리보기 이미지를 삭제하시겠습니까?')) {
				return;
			}

			try {
				await apiRequest(`/admin/api/surgery/preview-images/${previewId}`, {
					method: 'DELETE'
				});
				await loadPageData();
				alert('미리보기 이미지가 삭제되었습니다.');
			} catch (error) {
				handleError(error);
			}
		});

		el.middleForm.addEventListener('submit', onSubmitMiddleCreate);
		el.middleOrderSaveBtn.addEventListener('click', onSaveMiddleOrder);

		el.middleSortable.addEventListener('click', async function(e) {
			const editBtn = e.target.closest('[data-action="edit-middle"]');
			const deleteBtn = e.target.closest('[data-action="delete-middle"]');

			if (editBtn) {
				openMiddleEditModal(Number(editBtn.dataset.id));
				return;
			}

			if (deleteBtn) {
				const middleId = Number(deleteBtn.dataset.id);
				if (!confirm('중분류를 삭제하시겠습니까?')) {
					return;
				}

				try {
					await apiRequest(`/admin/api/surgery/middles/${middleId}`, {
						method: 'DELETE'
					});
					await loadPageData();
					alert('중분류가 삭제되었습니다.');
				} catch (error) {
					handleError(error);
				}
			}
		});

		el.middleEditForm.addEventListener('submit', async function(e) {
			e.preventDefault();

			const formData = new FormData(el.middleEditForm);
			const middleId = formData.get('middleCategoryId');

			const payload = {
				name: stringValue(formData.get('name')),
				introText: stringValue(formData.get('introText')),
				active: formData.get('active') === 'true'
			};

			try {
				await apiRequest(`/admin/api/surgery/middles/${middleId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				});

				if (middleModal) {
					middleModal.hide();
				}

				await loadPageData();
				alert('중분류가 수정되었습니다.');
			} catch (error) {
				handleError(error);
			}
		});

		el.addStepBtn.addEventListener('click', function() {
			appendCreateItemCard('step');
		});

		el.clearStepBtn.addEventListener('click', function() {
			el.detailStepList.innerHTML = '';
		});

		el.addIconBtn.addEventListener('click', function() {
			appendCreateItemCard('icon');
		});

		el.clearIconBtn.addEventListener('click', function() {
			el.detailIconList.innerHTML = '';
		});

		bindItemListEvents(el.detailStepList);
		bindItemListEvents(el.detailIconList);
		bindItemListEvents(el.editStepList);
		bindItemListEvents(el.editIconList);

		el.detailForm.addEventListener('submit', onSubmitDetailCreate);

		el.detailGroupList.addEventListener('click', async function(e) {
			const detailBtn = e.target.closest('[data-action="open-detail-modal"]');
			const saveOrderBtn = e.target.closest('[data-action="save-detail-order"]');

			if (detailBtn) {
				const detailId = Number(detailBtn.dataset.id);
				await openDetailEditModal(detailId);
				return;
			}

			if (saveOrderBtn) {
				const middleId = Number(saveOrderBtn.dataset.middleId);
				const groupCard = saveOrderBtn.closest('.eye-surgery-manager-detail-middle-card');
				const list = groupCard ? groupCard.querySelector('.eye-surgery-manager-detail-sortable') : null;

				if (!list) return;

				const ids = Array.from(list.querySelectorAll('.eye-surgery-manager-detail-item'))
					.map(item => Number(item.dataset.id));

				try {
					await apiRequest(`/admin/api/surgery/middles/${middleId}/details/reorder`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ ids: ids })
					});
					saveOrderBtn.disabled = true;
					alert('소분류 순서가 저장되었습니다.');
					await loadPageData();
				} catch (error) {
					handleError(error);
				}
			}
		});

		el.editAddStepBtn.addEventListener('click', function() {
			appendEditItemCard('step');
		});

		el.editClearStepBtn.addEventListener('click', function() {
			markAllEditItemsDeleted(el.editStepList);
		});

		el.editAddIconBtn.addEventListener('click', function() {
			appendEditItemCard('icon');
		});

		el.editClearIconBtn.addEventListener('click', function() {
			markAllEditItemsDeleted(el.editIconList);
		});

		el.detailEditForm.addEventListener('submit', onSubmitDetailUpdate);

		el.detailDeleteBtn.addEventListener('click', async function() {
			const detailId = el.detailDeleteBtn.dataset.detailId;
			if (!detailId) return;

			if (!confirm('소분류를 삭제하시겠습니까? 연결된 step/icon 이미지도 함께 삭제됩니다.')) {
				return;
			}

			try {
				await apiRequest(`/admin/api/surgery/details/${detailId}`, {
					method: 'DELETE'
				});

				if (detailModal) {
					detailModal.hide();
				}

				await loadPageData();
				alert('소분류가 삭제되었습니다.');
			} catch (error) {
				handleError(error);
			}
		});
	}

	function bindItemListEvents(container) {
		container.addEventListener('click', function(e) {
			const btn = e.target.closest('[data-action="toggle-remove-item"]');
			if (!btn) return;

			const itemCol = btn.closest('.eye-surgery-manager-item-col');
			if (!itemCol) return;

			const isPersisted = itemCol.dataset.persisted === 'true';
			const isDeleted = itemCol.dataset.deleted === 'true';

			if (!isPersisted) {
				itemCol.remove();
				return;
			}

			itemCol.dataset.deleted = isDeleted ? 'false' : 'true';
			renderDeleteState(itemCol);
		});

		container.addEventListener('change', function(e) {
			const input = e.target.closest('.eye-surgery-manager-image-input');
			if (!input) return;

			const file = input.files && input.files[0];
			const itemCol = input.closest('.eye-surgery-manager-item-col');
			if (!itemCol) return;

			const previewImg = itemCol.querySelector('.eye-surgery-manager-preview-image');
			const emptyText = itemCol.querySelector('.eye-surgery-manager-preview-empty');

			if (!previewImg) return;

			if (!file) {
				return;
			}

			const reader = new FileReader();
			reader.onload = function(event) {
				previewImg.src = event.target.result;
				previewImg.classList.remove('d-none');
				if (emptyText) {
					emptyText.classList.add('d-none');
				}
			};
			reader.readAsDataURL(file);
		});
	}

	async function loadPageData() {
		const data = await apiRequest(`/admin/api/surgery/${state.groupType}/page-data`);
		state.pageData = data;

		renderPreviewImages();
		renderMiddleSelects();
		renderMiddleList();
		renderDetailGroupList();
	}

	function renderPreviewImages() {
		const items = state.pageData.previewImages || [];
		el.previewSortable.innerHTML = '';

		if (items.length === 0) {
			el.previewSortable.innerHTML = `
                <div class="col-12">
                    <div class="border rounded-3 text-center text-muted py-5">
                        등록된 미리보기 이미지가 없습니다.
                    </div>
                </div>
            `;
			el.previewOrderSaveBtn.disabled = true;
			return;
		}

		items.forEach(function(item) {
			const card = document.createElement('div');
			card.className = 'col-12 col-md-6 col-xl-3 eye-surgery-manager-preview-item';
			card.dataset.id = item.id;
			card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        <span class="fw-semibold">☰ 이미지 ${item.displayOrder + 1}</span>
                        <button type="button"
                                class="btn btn-sm btn-outline-danger"
                                data-action="delete-preview"
                                data-id="${item.id}">삭제</button>
                    </div>
                    <div class="card-body">
                        <div class="border rounded-3 overflow-hidden bg-light"
                             style="aspect-ratio: 77 / 53;">
                            <img src="${escapeHtml(item.imageUrl)}"
                                 alt="${escapeHtml(item.altText || '')}"
                                 style="width:100%;height:100%;object-fit:cover;">
                        </div>
                    </div>
                </div>
            `;
			el.previewSortable.appendChild(card);
		});

		if (state.previewSortable) {
			state.previewSortable.destroy();
		}

		if (window.Sortable) {
			state.previewSortable = Sortable.create(el.previewSortable, {
				animation: 150,
				draggable: '.eye-surgery-manager-preview-item',
				onEnd: function() {
					el.previewOrderSaveBtn.disabled = false;
				}
			});
		}

		el.previewOrderSaveBtn.disabled = true;
	}

	function renderMiddleSelects() {
		const options = (state.pageData.middleCategories || [])
			.map(item => `<option value="${item.id}">${escapeHtml(item.name)}</option>`)
			.join('');

		const createSelect = el.detailMiddleSelect;
		const editSelect = el.detailEditForm.querySelector('select[name="middleCategoryId"]');

		createSelect.innerHTML = options || `<option value="">중분류를 먼저 등록해 주세요.</option>`;
		editSelect.innerHTML = options || `<option value="">중분류를 먼저 등록해 주세요.</option>`;

		const disabled = !options;
		createSelect.disabled = disabled;
		editSelect.disabled = disabled;
		el.detailForm.querySelector('button[type="submit"]').disabled = disabled;
	}

	function renderMiddleList() {
		const items = state.pageData.middleCategories || [];
		el.middleSortable.innerHTML = '';

		if (items.length === 0) {
			el.middleSortable.innerHTML = `
                <div class="border rounded-3 text-center text-muted py-5">
                    등록된 중분류가 없습니다.
                </div>
            `;
			el.middleOrderSaveBtn.disabled = true;
			return;
		}

		items.forEach(function(item) {
			const row = document.createElement('div');
			row.className = 'list-group-item eye-surgery-manager-middle-item';
			row.dataset.id = item.id;
			row.innerHTML = `
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div class="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                        <span class="fs-5 text-muted" style="cursor:grab;">☰</span>
                        <div class="min-w-0">
                            <div class="d-flex align-items-center gap-2 flex-wrap">
                                <h6 class="mb-0">${escapeHtml(item.name)}</h6>
                                <span class="badge bg-primary-subtle text-primary">${item.detailCount}개 소분류</span>
                            </div>
                            <p class="mb-0 text-muted text-truncate">${escapeHtml(item.introText)}</p>
                        </div>
                    </div>
                    <div class="d-flex gap-2">
                        <button type="button"
                                class="btn btn-sm btn-outline-primary"
                                data-action="edit-middle"
                                data-id="${item.id}">수정</button>
                        <button type="button"
                                class="btn btn-sm btn-outline-danger"
                                data-action="delete-middle"
                                data-id="${item.id}"
                                ${item.detailCount > 0 ? 'disabled' : ''}>삭제</button>
                    </div>
                </div>
            `;
			el.middleSortable.appendChild(row);
		});

		if (state.middleSortable) {
			state.middleSortable.destroy();
		}

		if (window.Sortable) {
			state.middleSortable = Sortable.create(el.middleSortable, {
				animation: 150,
				draggable: '.eye-surgery-manager-middle-item',
				onEnd: function() {
					el.middleOrderSaveBtn.disabled = false;
				}
			});
		}

		el.middleOrderSaveBtn.disabled = true;
	}

	function renderDetailGroupList() {
		const middleList = state.pageData.middleCategories || [];
		el.detailGroupList.innerHTML = '';
		state.detailSortables.forEach(sortable => sortable.destroy());
		state.detailSortables.clear();

		if (middleList.length === 0) {
			el.detailGroupList.innerHTML = `
                <div class="col-12">
                    <div class="border rounded-3 text-center text-muted py-5">
                        중분류를 먼저 등록해 주세요.
                    </div>
                </div>
            `;
			return;
		}

		middleList.forEach(function(middle) {
			const wrapper = document.createElement('div');
			wrapper.className = 'col-12 col-xl-6';

			const detailItems = middle.details || [];
			const detailListHtml = detailItems.length > 0
				? detailItems.map(function(detail) {
					return `
                        <div class="list-group-item eye-surgery-manager-detail-item"
                             data-id="${detail.id}">
                            <div class="d-flex align-items-center justify-content-between gap-3">
                                <div class="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                                    <span class="fs-6 text-muted" style="cursor:grab;">☰</span>
                                    <button type="button"
                                            class="btn btn-link p-0 text-decoration-none text-start text-truncate"
                                            data-action="open-detail-modal"
                                            data-id="${detail.id}">
                                        ${escapeHtml(detail.name)}
                                    </button>
                                </div>
                                <span class="badge bg-light text-dark">#${detail.displayOrder + 1}</span>
                            </div>
                        </div>
                    `;
				}).join('')
				: `
                    <div class="list-group-item text-center text-muted py-4">
                        등록된 소분류가 없습니다.
                    </div>
                `;

			wrapper.innerHTML = `
                <div class="card h-100 eye-surgery-manager-detail-middle-card">
                    <div class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div>
                            <h6 class="mb-1">${escapeHtml(middle.name)}</h6>
                            <p class="mb-0 text-muted">${escapeHtml(middle.introText)}</p>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-primary">${middle.detailCount}개</span>
                            <button type="button"
                                    class="btn btn-sm btn-primary"
                                    data-action="save-detail-order"
                                    data-middle-id="${middle.id}"
                                    ${detailItems.length > 1 ? 'disabled' : 'disabled'}>순서저장</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="list-group eye-surgery-manager-detail-sortable" data-middle-id="${middle.id}">
                            ${detailListHtml}
                        </div>
                    </div>
                </div>
            `;

			el.detailGroupList.appendChild(wrapper);

			const listEl = wrapper.querySelector('.eye-surgery-manager-detail-sortable');
			const saveBtn = wrapper.querySelector('[data-action="save-detail-order"]');

			if (window.Sortable && listEl && detailItems.length > 1) {
				const sortable = Sortable.create(listEl, {
					animation: 150,
					draggable: '.eye-surgery-manager-detail-item',
					onEnd: function() {
						saveBtn.disabled = false;
					}
				});
				state.detailSortables.set(middle.id, sortable);
			}
		});
	}

	function openMiddleEditModal(middleId) {
		const target = (state.pageData.middleCategories || []).find(item => item.id === middleId);
		if (!target) {
			alert('중분류 정보를 찾을 수 없습니다.');
			return;
		}

		el.middleEditForm.querySelector('input[name="middleCategoryId"]').value = target.id;
		el.middleEditForm.querySelector('input[name="name"]').value = target.name || '';
		el.middleEditForm.querySelector('input[name="introText"]').value = target.introText || '';
		el.middleEditForm.querySelector('select[name="active"]').value = 'true';

		if (middleModal) {
			middleModal.show();
		}
	}

	async function openDetailEditModal(detailId) {
		try {
			const data = await apiRequest(`/admin/api/surgery/details/${detailId}`);

			const form = el.detailEditForm;
			form.querySelector('input[name="detailId"]').value = data.id;
			form.querySelector('select[name="middleCategoryId"]').value = String(data.middleCategoryId);
			form.querySelector('input[name="name"]').value = data.name || '';
			form.querySelector('textarea[name="introText"]').value = data.introText || '';
			form.querySelector('select[name="active"]').value = String(data.active);

			el.detailDeleteBtn.dataset.detailId = data.id;

			el.editStepList.innerHTML = '';
			el.editIconList.innerHTML = '';

			(data.steps || []).forEach(function(item) {
				appendEditItemCard('step', item);
			});

			(data.icons || []).forEach(function(item) {
				appendEditItemCard('icon', item);
			});

			if (detailModal) {
				detailModal.show();
			}
		} catch (error) {
			handleError(error);
		}
	}

	async function onSubmitPreviewImages(e) {
		e.preventDefault();

		const files = el.previewFiles.files;
		if (!files || files.length === 0) {
			alert('미리보기 이미지를 선택해 주세요.');
			return;
		}

		const formData = new FormData();
		Array.from(files).forEach(file => formData.append('files', file));

		try {
			await apiRequest(`/admin/api/surgery/${state.groupType}/preview-images`, {
				method: 'POST',
				body: formData
			});

			el.previewForm.reset();
			await loadPageData();
			alert('미리보기 이미지가 등록되었습니다.');
		} catch (error) {
			handleError(error);
		}
	}

	async function onSavePreviewOrder() {
		const ids = Array.from(el.previewSortable.querySelectorAll('.eye-surgery-manager-preview-item'))
			.map(item => Number(item.dataset.id));

		try {
			await apiRequest(`/admin/api/surgery/${state.groupType}/preview-images/reorder`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ ids: ids })
			});

			el.previewOrderSaveBtn.disabled = true;
			await loadPageData();
			alert('미리보기 이미지 순서가 저장되었습니다.');
		} catch (error) {
			handleError(error);
		}
	}

	async function onSubmitMiddleCreate(e) {
		e.preventDefault();

		const formData = new FormData(el.middleForm);
		const payload = {
			name: stringValue(formData.get('name')),
			introText: stringValue(formData.get('introText'))
		};

		try {
			await apiRequest(`/admin/api/surgery/${state.groupType}/middles`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			el.middleForm.reset();
			await loadPageData();
			alert('중분류가 등록되었습니다.');
		} catch (error) {
			handleError(error);
		}
	}

	async function onSaveMiddleOrder() {
		const ids = Array.from(el.middleSortable.querySelectorAll('.eye-surgery-manager-middle-item'))
			.map(item => Number(item.dataset.id));

		try {
			await apiRequest(`/admin/api/surgery/${state.groupType}/middles/reorder`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ ids: ids })
			});

			el.middleOrderSaveBtn.disabled = true;
			await loadPageData();
			alert('중분류 순서가 저장되었습니다.');
		} catch (error) {
			handleError(error);
		}
	}

	async function onSubmitDetailCreate(e) {
		e.preventDefault();

		if (!el.detailMiddleSelect.value) {
			alert('중분류를 선택해 주세요.');
			return;
		}

		try {
			const formData = buildDetailMultipartFormData(el.detailForm, el.detailStepList, el.detailIconList);
			await apiRequest(`/admin/api/surgery/${state.groupType}/details`, {
				method: 'POST',
				body: formData
			});

			resetCreateDetailForm();
			await loadPageData();
			alert('소분류가 등록되었습니다.');
		} catch (error) {
			handleError(error);
		}
	}

	async function onSubmitDetailUpdate(e) {
		e.preventDefault();

		const detailId = el.detailEditForm.querySelector('input[name="detailId"]').value;
		if (!detailId) {
			alert('수정할 소분류 ID 가 없습니다.');
			return;
		}

		try {
			const formData = buildDetailMultipartFormData(el.detailEditForm, el.editStepList, el.editIconList);
			await apiRequest(`/admin/api/surgery/${state.groupType}/details/${detailId}`, {
				method: 'PUT',
				body: formData
			});

			if (detailModal) {
				detailModal.hide();
			}

			await loadPageData();
			alert('소분류가 수정되었습니다.');
		} catch (error) {
			handleError(error);
		}
	}

	function buildDetailMultipartFormData(form, stepListEl, iconListEl) {
		const rawFormData = new FormData(form);

		const payload = {
			middleCategoryId: Number(rawFormData.get('middleCategoryId')),
			name: stringValue(rawFormData.get('name')),
			introText: stringValue(rawFormData.get('introText')),
			active: rawFormData.get('active') === 'true',
			steps: collectItemPayload(stepListEl, 'step'),
			icons: collectItemPayload(iconListEl, 'icon')
		};

		const formData = new FormData();
		formData.append('payload', JSON.stringify(payload));

		appendFiles(formData, stepListEl, 'step');
		appendFiles(formData, iconListEl, 'icon');

		return formData;
	}

	function collectItemPayload(listEl, type) {
		const result = [];
		let displayOrder = 0;

		Array.from(listEl.querySelectorAll('.eye-surgery-manager-item-col')).forEach(function(itemCol) {
			const deleted = itemCol.dataset.deleted === 'true';
			const id = numberOrNull(itemCol.dataset.id);
			const clientKey = itemCol.dataset.clientKey;

			const titleInput = itemCol.querySelector('[name="title"]');
			const descInput = itemCol.querySelector('[name="descriptionText"]');

			const title = titleInput ? stringValue(titleInput.value) : '';
			const descriptionText = descInput ? stringValue(descInput.value) : '';

			if (!deleted) {
				if (type === 'icon' && !title) {
					throw new Error('아이콘 제목을 입력해 주세요.');
				}
				if (!descriptionText) {
					throw new Error(type === 'step' ? 'step 설명을 입력해 주세요.' : 'icon 설명을 입력해 주세요.');
				}
			}

			result.push({
				id: id,
				clientKey: clientKey,
				title: title || null,
				descriptionText: descriptionText,
				displayOrder: deleted ? result.length : displayOrder,
				deleted: deleted
			});

			if (!deleted) {
				displayOrder++;
			}
		});

		return result;
	}

	function appendFiles(formData, listEl, type) {
		Array.from(listEl.querySelectorAll('.eye-surgery-manager-item-col')).forEach(function(itemCol) {
			if (itemCol.dataset.deleted === 'true') {
				return;
			}

			const input = itemCol.querySelector('.eye-surgery-manager-image-input');
			const file = input && input.files ? input.files[0] : null;
			const clientKey = itemCol.dataset.clientKey;

			if (file && clientKey) {
				formData.append(`${type}File__${clientKey}`, file);
			}
		});
	}

	function appendCreateItemCard(type) {
		const itemCol = createItemCardElement(type, null);
		if (type === 'step') {
			el.detailStepList.appendChild(itemCol);
		} else {
			el.detailIconList.appendChild(itemCol);
		}
	}

	function appendEditItemCard(type, data) {
		const itemCol = createItemCardElement(type, data || null);
		if (type === 'step') {
			el.editStepList.appendChild(itemCol);
		} else {
			el.editIconList.appendChild(itemCol);
		}
	}

	function createItemCardElement(type, data) {
		const clientKey = data && data.id
			? `${type}-existing-${data.id}`
			: `${type}-new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

		const persisted = !!(data && data.id);
		const title = data && data.title ? data.title : '';
		const descriptionText = data && data.descriptionText ? data.descriptionText : '';
		const imageUrl = data && data.imageUrl ? data.imageUrl : '';
		const deleted = false;

		const itemCol = document.createElement('div');
		itemCol.className = 'col-12 col-md-6 col-xxl-4 eye-surgery-manager-item-col';
		itemCol.dataset.id = data && data.id ? data.id : '';
		itemCol.dataset.clientKey = clientKey;
		itemCol.dataset.persisted = persisted ? 'true' : 'false';
		itemCol.dataset.deleted = deleted ? 'true' : 'false';

		itemCol.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="card-header d-flex align-items-center justify-content-between">
                    <span class="fw-semibold">${type === 'step' ? 'Step' : 'Icon'} 항목</span>
                    <button type="button"
                            class="btn btn-sm ${persisted ? 'btn-outline-danger' : 'btn-outline-secondary'}"
                            data-action="toggle-remove-item">
                        ${persisted ? '삭제표시' : '제거'}
                    </button>
                </div>
                <div class="card-body">
                    <div class="alert alert-danger py-2 px-3 mb-3 d-none eye-surgery-manager-delete-alert">
                        삭제 예정 상태입니다. 다시 누르면 복구됩니다.
                    </div>

                    <div class="mb-3">
                        <label class="form-label">${type === 'step' ? '타이틀(선택)' : '타이틀'}</label>
                        <input type="text"
                               class="form-control"
                               name="title"
                               maxlength="100"
                               value="${escapeAttribute(title)}"
                               placeholder="${type === 'step' ? '예: Step 01' : '예: 수술시간'}">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">${type === 'step' ? '설명 텍스트' : '설명 한 줄'}</label>
                        <textarea class="form-control"
                                  name="descriptionText"
                                  rows="3"
                                  placeholder="${type === 'step' ? 'step 소개 텍스트를 입력하세요.' : 'icon 소개 텍스트를 입력하세요.'}">${escapeHtml(descriptionText)}</textarea>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">이미지</label>
                        <input type="file"
                               class="form-control eye-surgery-manager-image-input"
                               accept="image/*">
                    </div>

                    <div class="border rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center"
                         style="aspect-ratio:${type === 'step' ? '16 / 10' : '1 / 1'};">
                        <img src="${escapeAttribute(imageUrl)}"
                             alt=""
                             class="eye-surgery-manager-preview-image ${imageUrl ? '' : 'd-none'}"
                             style="width:100%;height:100%;object-fit:cover;">
                        <span class="text-muted eye-surgery-manager-preview-empty ${imageUrl ? 'd-none' : ''}">
                            미리보기 없음
                        </span>
                    </div>
                </div>
            </div>
        `;

		return itemCol;
	}

	function renderDeleteState(itemCol) {
		const deleted = itemCol.dataset.deleted === 'true';
		const alertEl = itemCol.querySelector('.eye-surgery-manager-delete-alert');
		const btn = itemCol.querySelector('[data-action="toggle-remove-item"]');
		const inputs = itemCol.querySelectorAll('input, textarea');

		if (deleted) {
			itemCol.classList.add('opacity-50');
			if (alertEl) alertEl.classList.remove('d-none');
			if (btn) {
				btn.textContent = '복구';
				btn.classList.remove('btn-outline-danger');
				btn.classList.add('btn-outline-success');
			}
			inputs.forEach(input => input.disabled = true);
		} else {
			itemCol.classList.remove('opacity-50');
			if (alertEl) alertEl.classList.add('d-none');
			if (btn) {
				btn.textContent = itemCol.dataset.persisted === 'true' ? '삭제표시' : '제거';
				btn.classList.remove('btn-outline-success');
				btn.classList.add(itemCol.dataset.persisted === 'true' ? 'btn-outline-danger' : 'btn-outline-secondary');
			}
			inputs.forEach(input => input.disabled = false);
		}
	}

	function markAllEditItemsDeleted(listEl) {
		Array.from(listEl.querySelectorAll('.eye-surgery-manager-item-col')).forEach(function(itemCol) {
			if (itemCol.dataset.persisted === 'true') {
				itemCol.dataset.deleted = 'true';
				renderDeleteState(itemCol);
			} else {
				itemCol.remove();
			}
		});
	}

	function resetCreateDetailForm() {
		el.detailForm.reset();
		el.detailStepList.innerHTML = '';
		el.detailIconList.innerHTML = '';

		appendCreateItemCard('step');
		appendCreateItemCard('icon');
	}

	async function apiRequest(url, options) {
		const requestOptions = options || {};
		const headers = new Headers(requestOptions.headers || {});
		const csrf = getCsrfHeader();
		Object.keys(csrf).forEach(key => headers.set(key, csrf[key]));

		const response = await fetch(url, {
			...requestOptions,
			headers: headers
		});

		const text = await response.text();
		let data = null;

		try {
			data = text ? JSON.parse(text) : null;
		} catch (e) {
			data = text;
		}

		if (!response.ok) {
			throw new Error(data && data.message ? data.message : '요청 처리 중 오류가 발생했습니다.');
		}

		return data;
	}

	function getCsrfHeader() {
		const token = document.querySelector('meta[name="_csrf"]')?.content
			|| document.querySelector('input[name="_csrf"]')?.value;
		const headerName = document.querySelector('meta[name="_csrf_header"]')?.content || 'X-CSRF-TOKEN';

		if (!token) {
			return {};
		}

		return {
			[headerName]: token
		};
	}

	function handleError(error) {
		console.error(error);
		alert(error && error.message ? error.message : '처리 중 오류가 발생했습니다.');
	}

	function numberOrNull(value) {
		if (value === null || value === undefined || value === '') {
			return null;
		}
		return Number(value);
	}

	function stringValue(value) {
		if (value === null || value === undefined) {
			return '';
		}
		return String(value).trim();
	}

	function escapeHtml(value) {
		return String(value || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	function escapeAttribute(value) {
		return String(value || '')
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}
})();