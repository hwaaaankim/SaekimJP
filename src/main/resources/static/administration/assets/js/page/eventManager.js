document.addEventListener('DOMContentLoaded', function () {
    const createForm = document.getElementById('event-manager-create-form');
    const detailForm = document.getElementById('event-manager-detail-form');
    const cardList = document.getElementById('event-manager-card-list');
    const totalText = document.getElementById('event-manager-total-text');

    const createPeriodToggle = document.getElementById('event-manager-create-period-limited');
    const createPeriodWraps = document.querySelectorAll('.event-manager-create-period-wrap');

    const detailPeriodToggle = document.getElementById('event-manager-detail-period-limited');
    const detailPeriodWraps = document.querySelectorAll('.event-manager-detail-period-wrap');

    const createImageInput = createForm.querySelector('input[name="imageFile"]');
    const detailImageInput = detailForm.querySelector('input[name="imageFile"]');

    const createThumbnailList = document.getElementById('event-manager-create-thumbnail-list');
    const detailThumbnailList = document.getElementById('event-manager-detail-thumbnail-list');

    const detailCreatedAt = document.getElementById('event-manager-detail-created-at');
    const detailUpdatedAt = document.getElementById('event-manager-detail-updated-at');
    const detailResolvedStatus = document.getElementById('event-manager-detail-resolved-status');

    const updateBtn = document.getElementById('event-manager-update-btn');
    const deleteBtn = document.getElementById('event-manager-delete-btn');

    const modalEl = document.getElementById('event-manager-detail-modal');
    const detailModal = new bootstrap.Modal(modalEl);

    let currentDetailId = null;
    let detailOriginalSnapshot = '';
    let createEditor = null;
    let detailEditor = null;
    let detailCurrentImageUrl = '';

    init();

    async function init() {
        bindCreatePeriodToggle();
        bindDetailPeriodToggle();
        bindCreateForm();
        bindDetailFormChangeTracking();
        bindUpdateButton();
        bindDeleteButton();
        bindThumbnailControls();

        await initEditors();

        renderEmptyThumbnail(createThumbnailList, '대표 이미지를 선택하면 썸네일이 표시됩니다.');
        renderEmptyThumbnail(detailThumbnailList, '대표 이미지가 없습니다.');

        loadList();
    }

    async function initEditors() {
        if (!window.ClassicEditor) {
            console.warn('ClassicEditor가 로드되지 않았습니다. 일반 textarea로 동작합니다.');
            return;
        }

        const createEditorEl = document.getElementById('event-manager-second-create-detail-html');
        const detailEditorEl = document.getElementById('event-manager-second-detail-detail-html');

        if (createEditorEl) {
            createEditor = await ClassicEditor
                .create(createEditorEl, {
                    extraPlugins: [eventManagerSecondUploadAdapterPlugin],
                    toolbar: [
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'link',
                        'bulletedList',
                        'numberedList',
                        '|',
                        'imageUpload',
                        'blockQuote',
                        'insertTable',
                        'undo',
                        'redo'
                    ]
                })
                .catch(function (error) {
                    console.error(error);
                    return null;
                });
        }

        if (detailEditorEl) {
            detailEditor = await ClassicEditor
                .create(detailEditorEl, {
                    extraPlugins: [eventManagerSecondUploadAdapterPlugin],
                    toolbar: [
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'link',
                        'bulletedList',
                        'numberedList',
                        '|',
                        'imageUpload',
                        'blockQuote',
                        'insertTable',
                        'undo',
                        'redo'
                    ]
                })
                .catch(function (error) {
                    console.error(error);
                    return null;
                });

            if (detailEditor) {
                detailEditor.model.document.on('change:data', function () {
                    updateDetailButtonState();
                });
            }
        }
    }

    function eventManagerSecondUploadAdapterPlugin(editor) {
        editor.plugins.get('FileRepository').createUploadAdapter = function (loader) {
            return new EventManagerSecondUploadAdapter(loader);
        };
    }

    class EventManagerSecondUploadAdapter {
        constructor(loader) {
            this.loader = loader;
        }

        upload() {
            return this.loader.file.then(function (file) {
                const formData = new FormData();
                formData.append('upload', file);

                return fetch('/admin/api/events/editor-images/temp', {
                    method: 'POST',
                    body: formData
                })
                    .then(function (response) {
                        if (!response.ok) {
                            throw new Error('이미지 업로드에 실패했습니다.');
                        }
                        return response.json();
                    })
                    .then(function (result) {
                        if (!result.url) {
                            throw new Error('이미지 URL 응답이 없습니다.');
                        }

                        return {
                            default: result.url
                        };
                    });
            });
        }

        abort() {
        }
    }

    function bindCreatePeriodToggle() {
        createPeriodToggle.addEventListener('change', function () {
            togglePeriodWrap(createPeriodToggle.checked, createPeriodWraps, createForm);
        });
    }

    function bindDetailPeriodToggle() {
        detailPeriodToggle.addEventListener('change', function () {
            togglePeriodWrap(detailPeriodToggle.checked, detailPeriodWraps, detailForm);
            updateDetailButtonState();
        });
    }

    function togglePeriodWrap(checked, wraps, form) {
        wraps.forEach(function (wrap) {
            wrap.classList.toggle('d-none', !checked);
        });

        if (!checked && form) {
            const start = form.querySelector('input[name="startDate"]');
            const end = form.querySelector('input[name="endDate"]');

            if (start) {
                start.value = '';
            }

            if (end) {
                end.value = '';
            }
        }
    }

    function bindThumbnailControls() {
        createImageInput.addEventListener('change', function () {
            handleCreateImageChange();
        });

        detailImageInput.addEventListener('change', function () {
            handleDetailImageChange();
        });

        createThumbnailList.addEventListener('click', function (e) {
            const removeBtn = e.target.closest('[data-thumbnail-action="clear-create-image"]');

            if (!removeBtn) {
                return;
            }

            clearCreateImageSelection();
        });

        detailThumbnailList.addEventListener('click', function (e) {
            const removeBtn = e.target.closest('[data-thumbnail-action="clear-detail-new-image"]');

            if (!removeBtn) {
                return;
            }

            clearDetailNewImageSelection();
        });
    }

    function handleCreateImageChange() {
        const file = createImageInput.files && createImageInput.files[0];

        if (!file) {
            renderEmptyThumbnail(createThumbnailList, '대표 이미지를 선택하면 썸네일이 표시됩니다.');
            return;
        }

        if (!isImageFile(file)) {
            alert('이미지 파일만 등록할 수 있습니다.');
            clearCreateImageSelection();
            return;
        }

        renderSelectedFileThumbnail({
            file: file,
            listEl: createThumbnailList,
            statusText: '등록 예정 이미지',
            removeAction: 'clear-create-image'
        });
    }

    function handleDetailImageChange() {
        const file = detailImageInput.files && detailImageInput.files[0];

        if (!file) {
            renderDetailCurrentThumbnail();
            updateDetailButtonState();
            return;
        }

        if (!isImageFile(file)) {
            alert('이미지 파일만 등록할 수 있습니다.');
            clearDetailNewImageSelection();
            return;
        }

        renderSelectedFileThumbnail({
            file: file,
            listEl: detailThumbnailList,
            statusText: '수정 예정 이미지',
            removeAction: 'clear-detail-new-image'
        });

        updateDetailButtonState();
    }

    function renderSelectedFileThumbnail(options) {
        const file = options.file;
        const listEl = options.listEl;
        const statusText = options.statusText;
        const removeAction = options.removeAction;

        const reader = new FileReader();

        reader.onload = function (e) {
            renderThumbnail({
                listEl: listEl,
                imageUrl: e.target.result,
                fileName: file.name,
                statusText: statusText,
                removeAction: removeAction,
                removable: true
            });
        };

        reader.readAsDataURL(file);
    }

    function renderDetailCurrentThumbnail() {
        if (!detailCurrentImageUrl) {
            renderEmptyThumbnail(detailThumbnailList, '대표 이미지가 없습니다.');
            return;
        }

        renderThumbnail({
            listEl: detailThumbnailList,
            imageUrl: detailCurrentImageUrl,
            fileName: '현재 대표 이미지',
            statusText: '현재 저장된 이미지',
            removeAction: '',
            removable: false
        });
    }

    function renderThumbnail(options) {
        const listEl = options.listEl;
        const imageUrl = options.imageUrl || '';
        const fileName = options.fileName || '대표 이미지';
        const statusText = options.statusText || '';
        const removeAction = options.removeAction || '';
        const removable = options.removable === true;

        if (!listEl || !imageUrl) {
            return;
        }

        listEl.innerHTML = `
            <div class="event-manager-thumbnail-card">
                ${removable ? `
                    <button type="button"
                            class="event-manager-thumbnail-remove-btn"
                            data-thumbnail-action="${escapeHtml(removeAction)}"
                            aria-label="선택 이미지 삭제">
                        ×
                    </button>
                ` : ''}

                <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(fileName)}">

                <div class="event-manager-thumbnail-meta">
                    <span class="event-manager-thumbnail-name">${escapeHtml(fileName)}</span>
                    <span class="event-manager-thumbnail-status">${escapeHtml(statusText)}</span>
                </div>
            </div>
        `;
    }

    function renderEmptyThumbnail(listEl, message) {
        if (!listEl) {
            return;
        }

        listEl.innerHTML = `
            <div class="event-manager-thumbnail-empty">
                ${escapeHtml(message || '대표 이미지를 선택해 주세요.')}
            </div>
        `;
    }

    function clearCreateImageSelection() {
        createImageInput.value = '';
        renderEmptyThumbnail(createThumbnailList, '대표 이미지를 선택하면 썸네일이 표시됩니다.');
    }

    function clearDetailNewImageSelection() {
        detailImageInput.value = '';
        renderDetailCurrentThumbnail();
        updateDetailButtonState();
    }

    function isImageFile(file) {
        return file && typeof file.type === 'string' && file.type.startsWith('image/');
    }

    function bindCreateForm() {
        createForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            try {
                if (!createImageInput.files || !createImageInput.files[0]) {
                    alert('대표 이미지를 등록해 주세요.');
                    createImageInput.focus();
                    return;
                }

                syncEditorToTextarea(createForm);

                const formData = buildFormData(createForm);
                const response = await fetch('/admin/api/events', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || '이벤트 등록에 실패했습니다.');
                }

                alert(result.message || '이벤트가 등록되었습니다.');

                createForm.reset();
                renderEmptyThumbnail(createThumbnailList, '대표 이미지를 선택하면 썸네일이 표시됩니다.');

                if (createEditor) {
                    createEditor.setData('');
                }

                togglePeriodWrap(false, createPeriodWraps, createForm);
                await loadList();
            } catch (error) {
                alert(error.message || '이벤트 등록 중 오류가 발생했습니다.');
            }
        });
    }

    function bindDetailFormChangeTracking() {
        detailForm.addEventListener('input', updateDetailButtonState);
        detailForm.addEventListener('change', updateDetailButtonState);
    }

    function bindUpdateButton() {
        updateBtn.addEventListener('click', async function () {
            if (!currentDetailId) {
                return;
            }

            try {
                syncEditorToTextarea(detailForm);

                const formData = buildFormData(detailForm);
                const response = await fetch('/admin/api/events/' + currentDetailId, {
                    method: 'PUT',
                    body: formData
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || '이벤트 수정에 실패했습니다.');
                }

                alert(result.message || '이벤트가 수정되었습니다.');
                detailModal.hide();
                await loadList();
            } catch (error) {
                alert(error.message || '이벤트 수정 중 오류가 발생했습니다.');
            }
        });
    }

    function bindDeleteButton() {
        deleteBtn.addEventListener('click', async function () {
            if (!currentDetailId) {
                return;
            }

            if (!confirm('해당 이벤트를 삭제하시겠습니까?')) {
                return;
            }

            try {
                const response = await fetch('/admin/api/events/' + currentDetailId, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || '이벤트 삭제에 실패했습니다.');
                }

                alert(result.message || '이벤트가 삭제되었습니다.');
                detailModal.hide();
                await loadList();
            } catch (error) {
                alert(error.message || '이벤트 삭제 중 오류가 발생했습니다.');
            }
        });
    }

    async function loadList() {
        try {
            const response = await fetch('/admin/api/events');
            const list = await response.json();

            if (!response.ok) {
                throw new Error('이벤트 목록을 불러오지 못했습니다.');
            }

            renderCards(Array.isArray(list) ? list : []);
        } catch (error) {
            cardList.innerHTML = `
                <div class="col-12">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body event-manager-empty-box d-flex align-items-center justify-content-center text-muted">
                            이벤트 목록을 불러오지 못했습니다.
                        </div>
                    </div>
                </div>
            `;
        }
    }

    function renderCards(items) {
        totalText.textContent = '총 ' + items.length + '건';

        if (!items.length) {
            cardList.innerHTML = `
                <div class="col-12">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body event-manager-empty-box d-flex align-items-center justify-content-center text-muted">
                            등록된 이벤트가 없습니다.
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        cardList.innerHTML = items.map(function (item) {
            const resolvedBadge = item.resolvedProgressStatus === 'ONGOING'
                ? '<span class="badge bg-success-subtle text-success event-manager-status-badge">진행중</span>'
                : '<span class="badge bg-secondary-subtle text-secondary event-manager-status-badge">종료</span>';

            const manualBadge = item.manualProgressStatus === 'ONGOING'
                ? '<span class="badge bg-dark-subtle text-dark event-manager-status-badge">수동 진행중</span>'
                : '<span class="badge bg-danger-subtle text-danger event-manager-status-badge">수동 종료</span>';

            return `
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="card border-0 shadow-sm h-100">
                        <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" class="event-manager-card-thumb">

                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                                <button type="button"
                                        class="event-manager-card-title-btn"
                                        data-id="${item.id}">
                                    ${escapeHtml(item.title)}
                                </button>
                                <span class="badge bg-light text-dark border">ID ${item.id}</span>
                            </div>

                            <div class="d-flex flex-wrap gap-2 mb-3">
                                ${resolvedBadge}
                                ${manualBadge}
                                ${item.hasLink ? '<span class="badge bg-info-subtle text-info">링크있음</span>' : '<span class="badge bg-light text-muted border">링크없음</span>'}
                            </div>

                            <div class="small text-muted mb-2">기간 : ${escapeHtml(item.periodText)}</div>
                            <div class="small text-muted mb-1">등록일 : ${escapeHtml(item.createdAtText)}</div>
                            <div class="small text-muted">수정일 : ${escapeHtml(item.updatedAtText)}</div>

                            <div class="event-manager-second-card-action-row">
                                <button type="button"
                                        class="btn btn-sm btn-dark"
                                        data-id="${item.id}">
                                    수정
                                </button>
                                <a class="btn btn-sm btn-outline-secondary"
                                   href="/eventDetailPage/${item.id}"
                                   target="_blank"
                                   rel="noopener">
                                    상세 미리보기
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        cardList.querySelectorAll('button[data-id]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                openDetailModal(this.dataset.id);
            });
        });
    }

    async function openDetailModal(id) {
        try {
            const response = await fetch('/admin/api/events/' + id);
            const detail = await response.json();

            if (!response.ok) {
                throw new Error('이벤트 상세정보를 불러오지 못했습니다.');
            }

            currentDetailId = detail.id;
            fillDetailForm(detail);
            detailModal.show();
        } catch (error) {
            alert(error.message || '이벤트 상세정보 조회 중 오류가 발생했습니다.');
        }
    }

    function fillDetailForm(detail) {
        detailForm.querySelector('input[name="id"]').value = detail.id;
        detailForm.querySelector('input[name="title"]').value = detail.title || '';
        detailForm.querySelector('textarea[name="content"]').value = detail.content || '';
        detailForm.querySelector('textarea[name="detailHtml"]').value = detail.detailHtml || '';
        detailForm.querySelector('input[name="linkUrl"]').value = detail.linkUrl || '';
        detailForm.querySelector('select[name="manualProgressStatus"]').value = detail.manualProgressStatus || 'ONGOING';
        detailForm.querySelector('input[name="startDate"]').value = detail.startDate || '';
        detailForm.querySelector('input[name="endDate"]').value = detail.endDate || '';
        detailImageInput.value = '';

        if (detailEditor) {
            detailEditor.setData(detail.detailHtml || '');
        }

        detailPeriodToggle.checked = !!detail.periodLimited;
        togglePeriodWrap(detail.periodLimited, detailPeriodWraps, null);

        detailCurrentImageUrl = detail.imageUrl || '';
        renderDetailCurrentThumbnail();

        detailCreatedAt.textContent = detail.createdAtText || '-';
        detailUpdatedAt.textContent = detail.updatedAtText || '-';
        detailResolvedStatus.textContent = detail.resolvedProgressStatus === 'ONGOING' ? '진행중' : '종료';

        detailOriginalSnapshot = getFormSnapshot(detailForm);
        updateBtn.disabled = true;
    }

    function updateDetailButtonState() {
        if (!currentDetailId) {
            updateBtn.disabled = true;
            return;
        }

        updateBtn.disabled = getFormSnapshot(detailForm) === detailOriginalSnapshot;
    }

    function getFormSnapshot(form) {
        const snapshot = [];
        const formData = new FormData(form);

        for (const [key, value] of formData.entries()) {
            if (key === 'detailHtml') {
                continue;
            }

            if (key === 'imageFile') {
                const fileName = value && value.name ? value.name : '';
                snapshot.push(key + '=' + fileName);
                continue;
            }

            snapshot.push(key + '=' + value);
        }

        snapshot.push('detailHtml=' + getEditorData(form));
        snapshot.push('periodLimited=' + form.querySelector('input[name="periodLimited"]').checked);

        snapshot.sort();
        return snapshot.join('&');
    }

    function buildFormData(form) {
        const formData = new FormData();

        const title = form.querySelector('input[name="title"]').value || '';
        const content = form.querySelector('textarea[name="content"]').value || '';
        const detailHtml = getEditorData(form);
        const linkUrl = form.querySelector('input[name="linkUrl"]').value || '';
        const manualProgressStatus = form.querySelector('select[name="manualProgressStatus"]').value || 'ONGOING';
        const periodLimited = form.querySelector('input[name="periodLimited"]').checked;
        const startDate = form.querySelector('input[name="startDate"]').value || '';
        const endDate = form.querySelector('input[name="endDate"]').value || '';
        const imageFileInput = form.querySelector('input[name="imageFile"]');

        formData.append('title', title);
        formData.append('content', content);
        formData.append('detailHtml', detailHtml);
        formData.append('linkUrl', linkUrl);
        formData.append('manualProgressStatus', manualProgressStatus);
        formData.append('periodLimited', periodLimited);

        if (periodLimited) {
            formData.append('startDate', startDate);
            formData.append('endDate', endDate);
        }

        if (imageFileInput && imageFileInput.files && imageFileInput.files[0]) {
            formData.append('imageFile', imageFileInput.files[0]);
        }

        return formData;
    }

    function syncEditorToTextarea(form) {
        const textarea = form.querySelector('textarea[name="detailHtml"]');

        if (!textarea) {
            return;
        }

        textarea.value = getEditorData(form);
    }

    function getEditorData(form) {
        if (form === createForm && createEditor) {
            return createEditor.getData();
        }

        if (form === detailForm && detailEditor) {
            return detailEditor.getData();
        }

        const textarea = form.querySelector('textarea[name="detailHtml"]');
        return textarea ? textarea.value : '';
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }
});