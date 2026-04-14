(function() {
	const apiBase = '/admin/api/popups';
	let sortableInstance = null;

	$(document).ready(function() {
		bindEvents();
		loadPopups();
	});

	function bindEvents() {
		$('#popup-manager-use-period').on('change', function() {
			toggleCreatePeriodFields($(this).is(':checked'));
		});

		$('#popup-manager-create-form').on('submit', function(e) {
			e.preventDefault();
			createPopup(this);
		});

		$(document).on('change', '.popup-manager-use-period', function() {
			const $card = $(this).closest('.popup-manager-sort-item');
			toggleCardPeriodFields($card, $(this).is(':checked'));
		});

		$(document).on('click', '.popup-manager-save-btn', function() {
			const id = $(this).data('id');
			updatePopup(id);
		});

		$(document).on('click', '.popup-manager-delete-btn', function() {
			const id = $(this).data('id');
			deletePopup(id);
		});
	}

	function loadPopups() {
		$.ajax({
			url: apiBase,
			type: 'GET',
			success: function(list) {
				renderPopupList(list || []);
			},
			error: handleAjaxError
		});
	}

	function renderPopupList(list) {
		const $list = $('#popup-manager-card-list');
		const $empty = $('#popup-manager-empty');
		const $count = $('#popup-manager-total-count');

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
			const usePeriod = !!item.useDisplayPeriod;
			const visibleClass = item.currentlyVisible ? 'is-visible' : 'is-hidden';
			const visibleText = item.currentlyVisible ? '현재 노출중' : '현재 비노출';

			html += `
            <div class="col-12 popup-manager-sort-item" data-id="${item.id}">
                <div class="popup-manager-card">
                    <div class="popup-manager-card-body">
                        <div class="row g-4 align-items-stretch">
                            <div class="col-lg-1">
                                <div class="popup-manager-handle-wrap">
                                    <div class="popup-manager-handle" title="드래그해서 순서 변경">☰</div>
                                    <div class="popup-manager-order-badge">#${index + 1}</div>
                                    <div class="popup-manager-visible-badge ${visibleClass}">${visibleText}</div>
                                </div>
                            </div>

                            <div class="col-lg-4">
                                <div class="popup-manager-preview-item">
                                    <label class="form-label popup-manager-preview-label">팝업 이미지</label>
                                    <div class="popup-manager-preview-frame">
                                        <img src="${escapeHtml(item.imageUrl)}" alt="popup image">
                                    </div>
                                    <input type="file" class="form-control mt-3 popup-manager-image" accept="image/*">
                                </div>
                            </div>

                            <div class="col-lg-5">
                                <div class="row g-3 h-100">
                                    <div class="col-12">
                                        <label class="form-label">링크</label>
                                        <input type="text"
                                               class="form-control popup-manager-link-url"
                                               value="${escapeHtml(item.linkUrl || '')}"
                                               placeholder="/event 또는 https://...">
                                    </div>

                                    <div class="col-md-4">
                                        <label class="form-label">노출 순서</label>
                                        <input type="number"
                                               class="form-control popup-manager-display-order"
                                               min="1"
                                               value="${item.displayOrder || (index + 1)}">
                                    </div>

                                    <div class="col-md-8">
									    <div class="popup-manager-period-switch-box">
									        <label class="form-label popup-manager-period-switch-label"
									               for="popupUsePeriod_${item.id}">
									            노출 날짜 지정
									        </label>
									
									        <div class="form-check form-switch popup-manager-switch-wrap">
									            <input class="form-check-input popup-manager-use-period"
									                   type="checkbox"
									                   id="popupUsePeriod_${item.id}"
									                   ${usePeriod ? 'checked' : ''}>
									        </div>
									    </div>
									</div>

                                    <div class="col-md-6">
                                        <label class="form-label">시작일</label>
                                        <input type="date"
                                               class="form-control popup-manager-start-date"
                                               value="${item.displayStartDate || ''}"
                                               ${usePeriod ? '' : 'disabled'}>
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label">종료일</label>
                                        <input type="date"
                                               class="form-control popup-manager-end-date"
                                               value="${item.displayEndDate || ''}"
                                               ${usePeriod ? '' : 'disabled'}>
                                    </div>
                                </div>
                            </div>

                            <div class="col-lg-2">
                                <div class="popup-manager-card-actions">
                                    <label class="form-label popup-manager-action-label">작업</label>
                                    <button type="button"
                                            class="btn btn-primary w-100 popup-manager-save-btn"
                                            data-id="${item.id}">
                                        수정 저장
                                    </button>
                                    <button type="button"
                                            class="btn btn-outline-danger w-100 popup-manager-delete-btn"
                                            data-id="${item.id}">
                                        삭제
                                    </button>
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

	function toggleCreatePeriodFields(enabled) {
		$('.popup-manager-create-period-field').prop('disabled', !enabled);
		if (!enabled) {
			$('.popup-manager-create-period-field').val('');
		}
	}

	function toggleCardPeriodFields($card, enabled) {
		$card.find('.popup-manager-start-date, .popup-manager-end-date').prop('disabled', !enabled);
		if (!enabled) {
			$card.find('.popup-manager-start-date, .popup-manager-end-date').val('');
		}
	}

	function createPopup(form) {
		const formData = new FormData(form);

		$.ajax({
			url: apiBase,
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: function() {
				alert('팝업이 등록되었습니다.');
				form.reset();
				toggleCreatePeriodFields(false);
				loadPopups();
			},
			error: handleAjaxError
		});
	}

	function updatePopup(id) {
		const $card = $(`.popup-manager-sort-item[data-id="${id}"]`);
		const formData = new FormData();

		const imageFile = $card.find('.popup-manager-image')[0].files[0];
		if (imageFile) formData.append('image', imageFile);

		const useDisplayPeriod = $card.find('.popup-manager-use-period').is(':checked');

		formData.append('linkUrl', $card.find('.popup-manager-link-url').val() || '');
		formData.append('displayOrder', $card.find('.popup-manager-display-order').val() || '');
		formData.append('useDisplayPeriod', useDisplayPeriod);

		if (useDisplayPeriod) {
			formData.append('displayStartDate', $card.find('.popup-manager-start-date').val() || '');
			formData.append('displayEndDate', $card.find('.popup-manager-end-date').val() || '');
		}

		$.ajax({
			url: `${apiBase}/${id}`,
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: function() {
				alert('팝업이 수정되었습니다.');
				loadPopups();
			},
			error: handleAjaxError
		});
	}

	function deletePopup(id) {
		if (!confirm('해당 팝업을 삭제하시겠습니까?')) {
			return;
		}

		$.ajax({
			url: `${apiBase}/${id}`,
			type: 'DELETE',
			success: function() {
				alert('팝업이 삭제되었습니다.');
				loadPopups();
			},
			error: handleAjaxError
		});
	}

	function initSortable() {
		destroySortable();

		const target = document.getElementById('popup-manager-card-list');
		if (!target) return;

		sortableInstance = new Sortable(target, {
			animation: 180,
			handle: '.popup-manager-handle',
			draggable: '.popup-manager-sort-item',
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

		$('#popup-manager-card-list .popup-manager-sort-item').each(function(index) {
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
				loadPopups();
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