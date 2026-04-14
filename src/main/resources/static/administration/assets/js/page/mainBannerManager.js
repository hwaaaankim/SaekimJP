(function() {
	const apiBase = '/admin/api/main-banners';
	let sortableInstance = null;

	$(document).ready(function() {
		bindEvents();
		loadMainBanners();
	});

	function bindEvents() {
		$('#main-banner-manager-create-form').on('submit', function(e) {
			e.preventDefault();
			createMainBanner(this);
		});

		$(document).on('click', '.main-banner-manager-save-btn', function() {
			const id = $(this).data('id');
			updateMainBanner(id);
		});

		$(document).on('click', '.main-banner-manager-delete-btn', function() {
			const id = $(this).data('id');
			deleteMainBanner(id);
		});
	}

	function loadMainBanners() {
		$.ajax({
			url: apiBase,
			type: 'GET',
			success: function(list) {
				renderMainBannerList(list || []);
			},
			error: handleAjaxError
		});
	}

	function renderMainBannerList(list) {
		const $list = $('#main-banner-manager-card-list');
		const $empty = $('#main-banner-manager-empty');
		const $count = $('#main-banner-manager-total-count');

		$count.text((list.length || 0) + '개');

		if (!list.length) {
			$list.empty();
			$empty.removeClass('d-none');
			destroySortable();
			return;
		}

		$empty.addClass('d-none');

		let html = '';
		list.forEach(function(item, index) {
			const pcPreviewUrl = item.pcImageUrl || '';
			const mobilePreviewUrl = item.mobileImageUrl || item.pcImageUrl || '';

			html += `
                <div class="col-12 main-banner-manager-sort-item" data-id="${item.id}">
                    <div class="main-banner-manager-card">
                        <div class="main-banner-manager-card-body">
                            <div class="row g-4 align-items-stretch">
                                <div class="col-lg-1">
                                    <div class="main-banner-manager-handle-wrap">
                                        <div class="main-banner-manager-handle" title="드래그해서 순서 변경">☰</div>
                                        <div class="main-banner-manager-order-badge">#${index + 1}</div>
                                    </div>
                                </div>

                                <div class="col-lg-4">
                                    <div class="main-banner-manager-preview-grid">
                                        <div class="main-banner-manager-preview-item">
                                            <div class="main-banner-manager-preview-label">PC 이미지</div>
                                            <div class="main-banner-manager-preview-frame">
                                                ${buildPreviewMarkup(pcPreviewUrl, 'pc banner')}
                                            </div>
                                            <input type="file" class="form-control mt-3 main-banner-manager-pc-image" accept="image/*">
                                        </div>

                                        <div class="main-banner-manager-preview-item">
                                            <div class="main-banner-manager-preview-label">모바일 이미지</div>
                                            <div class="main-banner-manager-preview-frame">
                                                ${buildPreviewMarkup(mobilePreviewUrl, 'mobile banner')}
                                            </div>
                                            <input type="file" class="form-control mt-3 main-banner-manager-mobile-image" accept="image/*">
                                            <div class="form-check mt-2">
                                                <input class="form-check-input main-banner-manager-remove-mobile-image" type="checkbox" id="removeMobileImage_${item.id}">
                                                <label class="form-check-label" for="removeMobileImage_${item.id}">
                                                    모바일 이미지 제거
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-5">
                                    <div class="row g-3 h-100">
                                        <div class="col-12">
                                            <label class="form-label">일반 문구</label>
                                            <input type="text" class="form-control main-banner-manager-general-text" value="${escapeHtml(item.generalText || '')}">
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label">강조 문구</label>
                                            <input type="text" class="form-control main-banner-manager-strong-text" value="${escapeHtml(item.strongText || '')}">
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label">노출 순서</label>
                                            <input type="number" class="form-control main-banner-manager-display-order" min="1" value="${item.displayOrder || (index + 1)}">
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-2">
                                    <div class="main-banner-manager-card-actions">
                                        <button type="button" class="btn btn-primary w-100 main-banner-manager-save-btn" data-id="${item.id}">수정 저장</button>
                                        <button type="button" class="btn btn-outline-danger w-100 main-banner-manager-delete-btn" data-id="${item.id}">삭제</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
		});

		$list.html(html);
		initSortable();
	}

	function buildPreviewMarkup(url, alt) {
		if (!url) {
			return `<div class="main-banner-manager-preview-empty">이미지 없음</div>`;
		}

		return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}">`;
	}

	function createMainBanner(form) {
		const formData = new FormData(form);

		$.ajax({
			url: apiBase,
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: function() {
				alert('메인배너가 등록되었습니다.');
				form.reset();
				loadMainBanners();
			},
			error: handleAjaxError
		});
	}

	function updateMainBanner(id) {
		const $card = $(`.main-banner-manager-sort-item[data-id="${id}"]`);
		const formData = new FormData();

		const pcFile = $card.find('.main-banner-manager-pc-image')[0].files[0];
		const mobileFile = $card.find('.main-banner-manager-mobile-image')[0].files[0];

		if (pcFile) formData.append('pcImage', pcFile);
		if (mobileFile) formData.append('mobileImage', mobileFile);

		formData.append('generalText', $card.find('.main-banner-manager-general-text').val() || '');
		formData.append('strongText', $card.find('.main-banner-manager-strong-text').val() || '');
		formData.append('displayOrder', $card.find('.main-banner-manager-display-order').val() || '');
		formData.append('removeMobileImage', $card.find('.main-banner-manager-remove-mobile-image').is(':checked'));

		$.ajax({
			url: `${apiBase}/${id}`,
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: function() {
				alert('메인배너가 수정되었습니다.');
				loadMainBanners();
			},
			error: handleAjaxError
		});
	}

	function deleteMainBanner(id) {
		if (!confirm('해당 메인배너를 삭제하시겠습니까?')) {
			return;
		}

		$.ajax({
			url: `${apiBase}/${id}`,
			type: 'DELETE',
			success: function() {
				alert('메인배너가 삭제되었습니다.');
				loadMainBanners();
			},
			error: handleAjaxError
		});
	}

	function initSortable() {
		destroySortable();

		const target = document.getElementById('main-banner-manager-card-list');
		if (!target) return;

		sortableInstance = new Sortable(target, {
			animation: 180,
			handle: '.main-banner-manager-handle',
			draggable: '.main-banner-manager-sort-item',
			onEnd: function() {
				saveDisplayOrders();
			}
		});
	}

	function destroySortable() {
		if (sortableInstance) {
			sortableInstance.destroy();
			sortableInstance = null;
		}
	}

	function saveDisplayOrders() {
		const payload = [];

		$('#main-banner-manager-card-list .main-banner-manager-sort-item').each(function(index) {
			payload.push({
				id: Number($(this).data('id')),
				displayOrder: index + 1
			});
		});

		$.ajax({
			url: `${apiBase}/display-order`,
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(payload),
			success: function() {
				loadMainBanners();
			},
			error: handleAjaxError
		});
	}

	function handleAjaxError(xhr) {
		const message = xhr?.responseJSON?.message || '처리 중 오류가 발생했습니다.';
		alert(message);
	}

	function escapeHtml(value) {
		return String(value ?? '')
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}
})();