(function () {
    'use strict';

    const faqManagerState = {
        page: 0,
        size: 12,
        keyword: '',
        topicId: '',
        topics: [],
        editOriginal: null
    };

    let faqManagerEditModalInstance = null;
    let faqManagerTopicEditModalInstance = null;

    $(document).ready(function () {
        faqManagerEditModalInstance = new bootstrap.Modal(document.getElementById('faq-manager-edit-modal'));
        faqManagerTopicEditModalInstance = new bootstrap.Modal(document.getElementById('faq-manager-topic-edit-modal'));

        bindFaqManagerEvents();
        toggleFaqManagerCreateLinkInput();
        toggleFaqManagerEditLinkInput();

        loadFaqManagerTopics()
            .always(function () {
                loadFaqManagerList();
            });
    });

    function bindFaqManagerEvents() {
        $('#faq-manager-topic-create-form').on('submit', function (e) {
            e.preventDefault();
            createFaqManagerTopic();
        });

        $(document).on('click', '.faq-manager-topic-edit-open-btn', function () {
            openFaqManagerTopicEditModal($(this).data('topic-id'));
        });

        $('#faq-manager-topic-update-btn').on('click', function () {
            updateFaqManagerTopic();
        });

        $('#faq-manager-topic-delete-btn').on('click', function () {
            deleteFaqManagerTopic();
        });

        $('#faq-manager-create-link-enabled').on('change', function () {
            toggleFaqManagerCreateLinkInput();
        });

        $('#faq-manager-edit-link-enabled').on('change', function () {
            toggleFaqManagerEditLinkInput();
            checkFaqManagerEditChanged();
        });

        $('#faq-manager-create-form').on('submit', function (e) {
            e.preventDefault();
            createFaqManagerFaq();
        });

        $('#faq-manager-search-form').on('submit', function (e) {
            e.preventDefault();
            faqManagerState.keyword = ($('#faq-manager-search-keyword').val() || '').trim();
            faqManagerState.topicId = $('#faq-manager-search-topic-id').val() || '';
            faqManagerState.page = 0;
            loadFaqManagerList();
        });

        $('#faq-manager-search-topic-id').on('change', function () {
            faqManagerState.topicId = $(this).val() || '';
            faqManagerState.keyword = ($('#faq-manager-search-keyword').val() || '').trim();
            faqManagerState.page = 0;
            loadFaqManagerList();
        });

        $(document).on('click', '.faq-manager-edit-open-btn', function () {
            openFaqManagerEditModal($(this).data('faq-id'));
        });

        $('#faq-manager-update-btn').on('click', function () {
            updateFaqManagerFaq();
        });

        $('#faq-manager-delete-btn').on('click', function () {
            deleteFaqManagerFaq();
        });

        $('#faq-manager-edit-topic-id, #faq-manager-edit-title, #faq-manager-edit-answer, #faq-manager-edit-link-url').on('input change', function () {
            checkFaqManagerEditChanged();
        });

        $(document).on('click', '.faq-manager-page-link', function (e) {
            e.preventDefault();

            const $link = $(this);
            if ($link.closest('.page-item').hasClass('disabled')) {
                return;
            }

            const page = Number($link.data('page'));
            if (!Number.isFinite(page) || page < 0) {
                return;
            }

            faqManagerState.page = page;
            loadFaqManagerList();
        });
    }

    function getFaqManagerCsrfHeaders() {
        const token = $('meta[name="_csrf"]').attr('content');
        const header = $('meta[name="_csrf_header"]').attr('content');

        if (token && header) {
            return { [header]: token };
        }
        return {};
    }

    function loadFaqManagerTopics() {
        return $.ajax({
            url: '/admin/api/faq-topics',
            type: 'GET'
        }).done(function (response) {
            faqManagerState.topics = Array.isArray(response.data) ? response.data : [];
            renderFaqManagerTopicList();
            renderFaqManagerTopicOptions();
        }).fail(function (xhr) {
            faqManagerState.topics = [];
            renderFaqManagerTopicList();
            renderFaqManagerTopicOptions();
            alert(extractFaqManagerErrorMessage(xhr, 'FAQ 주제 목록 조회 중 오류가 발생했습니다.'));
        });
    }

    function renderFaqManagerTopicList() {
        const $tbody = $('#faq-manager-topic-list');
        const $empty = $('#faq-manager-topic-empty');
        const topics = faqManagerState.topics;

        if (!topics.length) {
            $tbody.empty();
            $empty.removeClass('d-none');
            return;
        }

        $empty.addClass('d-none');
        $tbody.html(topics.map(function (topic) {
            return `
                <tr>
                    <td>
                        <strong class="faq-manager-topic-name">${escapeFaqManagerHtml(topic.name)}</strong>
                    </td>
                    <td class="text-center">
                        <span class="badge bg-light text-dark border">${topic.displayOrder}</span>
                    </td>
                    <td class="text-center">
                        <span class="badge bg-primary-subtle text-primary">${topic.faqCount || 0}</span>
                    </td>
                    <td class="text-end">
                        <button type="button"
                                class="btn btn-sm btn-outline-secondary faq-manager-topic-edit-open-btn"
                                data-topic-id="${topic.id}">
                            수정
                        </button>
                    </td>
                </tr>
            `;
        }).join(''));
    }

    function renderFaqManagerTopicOptions() {
        const topics = faqManagerState.topics;
        const previousCreateValue = $('#faq-manager-create-topic-id').val() || '';
        const previousEditValue = $('#faq-manager-edit-topic-id').val() || '';
        const previousFilterValue = faqManagerState.topicId || $('#faq-manager-search-topic-id').val() || '';

        const optionHtml = topics.map(function (topic) {
            return `<option value="${topic.id}">${escapeFaqManagerHtml(topic.name)}</option>`;
        }).join('');

        const $create = $('#faq-manager-create-topic-id');
        const $edit = $('#faq-manager-edit-topic-id');
        const $filter = $('#faq-manager-search-topic-id');

        if (!topics.length) {
            $create.html('<option value="">주제를 먼저 등록해주세요.</option>').prop('disabled', true);
            $edit.html('<option value="">등록된 주제가 없습니다.</option>').prop('disabled', true);
            $filter.html('<option value="">전체 주제</option>').prop('disabled', true);
            return;
        }

        $create.html('<option value="">주제 선택</option>' + optionHtml).prop('disabled', false);
        $edit.html('<option value="">주제 선택</option>' + optionHtml).prop('disabled', false);
        $filter.html('<option value="">전체 주제</option>' + optionHtml).prop('disabled', false);

        setSelectValueIfExists($create, previousCreateValue || String(topics[0].id));
        setSelectValueIfExists($edit, previousEditValue);
        setSelectValueIfExists($filter, previousFilterValue);

        faqManagerState.topicId = $filter.val() || '';
    }

    function setSelectValueIfExists($select, value) {
        if (!value) {
            $select.val('');
            return;
        }

        const exists = $select.find(`option[value="${String(value)}"]`).length > 0;
        $select.val(exists ? String(value) : '');
    }

    function createFaqManagerTopic() {
        const name = ($('#faq-manager-topic-create-name').val() || '').trim();
        const orderRaw = ($('#faq-manager-topic-create-order').val() || '').trim();

        if (!name) {
            alert('주제명을 입력해주세요.');
            $('#faq-manager-topic-create-name').focus();
            return;
        }

        const payload = {
            name: name,
            displayOrder: orderRaw === '' ? null : Number(orderRaw)
        };

        if (payload.displayOrder !== null && (!Number.isInteger(payload.displayOrder) || payload.displayOrder < 0)) {
            alert('노출 순서는 0 이상의 정수로 입력해주세요.');
            return;
        }

        $.ajax({
            url: '/admin/api/faq-topics',
            type: 'POST',
            contentType: 'application/json',
            headers: getFaqManagerCsrfHeaders(),
            data: JSON.stringify(payload)
        }).done(function (response) {
            alert(response.message || 'FAQ 주제가 등록되었습니다.');
            $('#faq-manager-topic-create-name').val('');
            $('#faq-manager-topic-create-order').val('');
            loadFaqManagerTopics();
        }).fail(function (xhr) {
            alert(extractFaqManagerErrorMessage(xhr, 'FAQ 주제 등록 중 오류가 발생했습니다.'));
        });
    }

    function openFaqManagerTopicEditModal(topicId) {
        const topic = faqManagerState.topics.find(function (item) {
            return String(item.id) === String(topicId);
        });

        if (!topic) {
            alert('FAQ 주제 정보를 찾을 수 없습니다. 목록을 새로고침해주세요.');
            return;
        }

        $('#faq-manager-topic-edit-id').val(topic.id);
        $('#faq-manager-topic-edit-name').val(topic.name);
        $('#faq-manager-topic-edit-order').val(topic.displayOrder);
        faqManagerTopicEditModalInstance.show();
    }

    function updateFaqManagerTopic() {
        const topicId = $('#faq-manager-topic-edit-id').val();
        const name = ($('#faq-manager-topic-edit-name').val() || '').trim();
        const orderRaw = ($('#faq-manager-topic-edit-order').val() || '').trim();

        if (!name) {
            alert('주제명을 입력해주세요.');
            return;
        }

        const displayOrder = Number(orderRaw);
        if (orderRaw === '' || !Number.isInteger(displayOrder) || displayOrder < 0) {
            alert('노출 순서는 0 이상의 정수로 입력해주세요.');
            return;
        }

        $.ajax({
            url: '/admin/api/faq-topics/' + topicId,
            type: 'PUT',
            contentType: 'application/json',
            headers: getFaqManagerCsrfHeaders(),
            data: JSON.stringify({
                name: name,
                displayOrder: displayOrder
            })
        }).done(function (response) {
            alert(response.message || 'FAQ 주제가 수정되었습니다.');
            faqManagerTopicEditModalInstance.hide();
            loadFaqManagerTopics().done(function () {
                loadFaqManagerList();
            });
        }).fail(function (xhr) {
            alert(extractFaqManagerErrorMessage(xhr, 'FAQ 주제 수정 중 오류가 발생했습니다.'));
        });
    }

    function deleteFaqManagerTopic() {
        const topicId = $('#faq-manager-topic-edit-id').val();
        const topicName = ($('#faq-manager-topic-edit-name').val() || '').trim();

        if (!confirm(`'${topicName}' 주제를 삭제하시겠습니까?\n이 주제를 사용하는 FAQ가 있으면 삭제되지 않습니다.`)) {
            return;
        }

        $.ajax({
            url: '/admin/api/faq-topics/' + topicId,
            type: 'DELETE',
            headers: getFaqManagerCsrfHeaders()
        }).done(function (response) {
            alert(response.message || 'FAQ 주제가 삭제되었습니다.');
            faqManagerTopicEditModalInstance.hide();

            if (String(faqManagerState.topicId) === String(topicId)) {
                faqManagerState.topicId = '';
                faqManagerState.page = 0;
            }

            loadFaqManagerTopics().done(function () {
                loadFaqManagerList();
            });
        }).fail(function (xhr) {
            alert(extractFaqManagerErrorMessage(xhr, 'FAQ 주제 삭제 중 오류가 발생했습니다.'));
        });
    }

    function toggleFaqManagerCreateLinkInput() {
        const enabled = $('#faq-manager-create-link-enabled').is(':checked');
        $('#faq-manager-create-link-url').prop('disabled', !enabled);

        if (!enabled) {
            $('#faq-manager-create-link-url').val('');
        }
    }

    function toggleFaqManagerEditLinkInput() {
        const enabled = $('#faq-manager-edit-link-enabled').is(':checked');
        $('#faq-manager-edit-link-url').prop('disabled', !enabled);

        if (!enabled) {
            $('#faq-manager-edit-link-url').val('');
        }
    }

    function createFaqManagerFaq() {
        const payload = getFaqManagerCreatePayload();
        const validationMessage = validateFaqManagerPayload(payload);

        if (validationMessage) {
            alert(validationMessage);
            return;
        }

        $.ajax({
            url: '/admin/api/faqs',
            type: 'POST',
            contentType: 'application/json',
            headers: getFaqManagerCsrfHeaders(),
            data: JSON.stringify(payload)
        }).done(function (response) {
            alert(response.message || 'FAQ가 등록되었습니다.');
            resetFaqManagerCreateForm();
            faqManagerState.page = 0;
            loadFaqManagerTopics();
            loadFaqManagerList();
        }).fail(function (xhr) {
            alert(extractFaqManagerErrorMessage(xhr, 'FAQ 등록 중 오류가 발생했습니다.'));
        });
    }

    function loadFaqManagerList() {
        const requestData = {
            page: faqManagerState.page,
            size: faqManagerState.size,
            keyword: faqManagerState.keyword
        };

        if (faqManagerState.topicId) {
            requestData.topicId = faqManagerState.topicId;
        }

        $.ajax({
            url: '/admin/api/faqs',
            type: 'GET',
            data: requestData
        }).done(function (response) {
            const pageData = response.data || {};
            const totalPages = Number(pageData.totalPages || 0);

            if (totalPages > 0 && faqManagerState.page >= totalPages) {
                faqManagerState.page = totalPages - 1;
                loadFaqManagerList();
                return;
            }

            renderFaqManagerList(pageData.content || []);
            renderFaqManagerPagination(pageData);
        }).fail(function (xhr) {
            alert(extractFaqManagerErrorMessage(xhr, 'FAQ 목록 조회 중 오류가 발생했습니다.'));
        });
    }

    function renderFaqManagerList(items) {
        const $wrap = $('#faq-manager-list-wrap');
        const $empty = $('#faq-manager-empty-box');

        if (!items || items.length === 0) {
            $wrap.empty();
            $empty.removeClass('d-none');
            return;
        }

        $empty.addClass('d-none');

        const html = items.map(function (item) {
            return `
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="card faq-manager-card-item shadow-sm">
                        <div class="card-body">
                            <div class="faq-manager-card-topic-row">
                                <span class="badge bg-primary-subtle text-primary faq-manager-topic-badge">
                                    ${escapeFaqManagerHtml(item.topicName || '미지정')}
                                </span>
                            </div>

                            <h5 class="faq-manager-card-title">${escapeFaqManagerHtml(item.title)}</h5>

                            <div class="faq-manager-answer-preview">
                                ${escapeFaqManagerHtml(item.answerPreview || '')}
                            </div>

                            <div class="faq-manager-badge-wrap">
                                <span class="badge ${item.linkEnabled ? 'bg-success-subtle text-success' : 'bg-light text-dark'}">
                                    ${item.linkEnabled ? '링크 사용' : '링크 없음'}
                                </span>
                            </div>

                            <div class="faq-manager-meta-list">
                                <div class="faq-manager-meta-item">
                                    <span>ID</span>
                                    <strong>${item.id}</strong>
                                </div>
                                <div class="faq-manager-meta-item">
                                    <span>조회수</span>
                                    <strong>${item.viewCount}</strong>
                                </div>
                                <div class="faq-manager-meta-item">
                                    <span>등록일</span>
                                    <strong>${formatFaqManagerDate(item.createdAt)}</strong>
                                </div>
                                <div class="faq-manager-meta-item">
                                    <span>수정일</span>
                                    <strong>${formatFaqManagerDate(item.updatedAt)}</strong>
                                </div>
                            </div>

                            <div class="faq-manager-card-footer">
                                <button type="button"
                                        class="btn btn-primary faq-manager-edit-open-btn"
                                        data-faq-id="${item.id}">
                                    수정
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $wrap.html(html);
    }

    function renderFaqManagerPagination(pageData) {
        const $pagination = $('#faq-manager-pagination');
        const totalPages = Number(pageData.totalPages || 0);
        const currentPage = Number(pageData.number || 0);

        if (totalPages === 0) {
            $pagination.empty();
            return;
        }

        const groupStart = Math.floor(currentPage / 4) * 4;
        const groupEnd = Math.min(groupStart + 4, totalPages);

        let html = '';

        html += `
            <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                <a href="#" class="page-link faq-manager-page-link" data-page="0">처음</a>
            </li>
        `;

        html += `
            <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                <a href="#" class="page-link faq-manager-page-link" data-page="${Math.max(currentPage - 1, 0)}">이전</a>
            </li>
        `;

        for (let i = groupStart; i < groupEnd; i++) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a href="#" class="page-link faq-manager-page-link" data-page="${i}">${i + 1}</a>
                </li>
            `;
        }

        html += `
            <li class="page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}">
                <a href="#" class="page-link faq-manager-page-link" data-page="${Math.min(currentPage + 1, totalPages - 1)}">다음</a>
            </li>
        `;

        html += `
            <li class="page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}">
                <a href="#" class="page-link faq-manager-page-link" data-page="${totalPages - 1}">마지막</a>
            </li>
        `;

        $pagination.html(html);
    }

    function openFaqManagerEditModal(faqId) {
        $.ajax({
            url: '/admin/api/faqs/' + faqId,
            type: 'GET'
        }).done(function (response) {
            const faq = response.data;

            $('#faq-manager-edit-id').val(faq.id);
            $('#faq-manager-edit-topic-id').val(String(faq.topicId));
            $('#faq-manager-edit-title').val(faq.title);
            $('#faq-manager-edit-answer').val(faq.answer);
            $('#faq-manager-edit-link-enabled').prop('checked', faq.linkEnabled);
            $('#faq-manager-edit-link-url').val(faq.linkUrl || '');
            $('#faq-manager-edit-created-at').text(formatFaqManagerDate(faq.createdAt));
            $('#faq-manager-edit-updated-at').text(formatFaqManagerDate(faq.updatedAt));
            $('#faq-manager-edit-view-count').text(faq.viewCount);

            toggleFaqManagerEditLinkInput();

            faqManagerState.editOriginal = getFaqManagerEditPayload();
            $('#faq-manager-update-btn').prop('disabled', true);

            faqManagerEditModalInstance.show();
        }).fail(function (xhr) {
            alert(extractFaqManagerErrorMessage(xhr, 'FAQ 상세 조회 중 오류가 발생했습니다.'));
        });
    }

    function updateFaqManagerFaq() {
        const faqId = $('#faq-manager-edit-id').val();
        const payload = getFaqManagerEditPayload();
        const validationMessage = validateFaqManagerPayload(payload);

        if (validationMessage) {
            alert(validationMessage);
            return;
        }

        $.ajax({
            url: '/admin/api/faqs/' + faqId,
            type: 'PUT',
            contentType: 'application/json',
            headers: getFaqManagerCsrfHeaders(),
            data: JSON.stringify(payload)
        }).done(function (response) {
            alert(response.message || 'FAQ가 수정되었습니다.');
            faqManagerEditModalInstance.hide();
            loadFaqManagerTopics();
            loadFaqManagerList();
        }).fail(function (xhr) {
            alert(extractFaqManagerErrorMessage(xhr, 'FAQ 수정 중 오류가 발생했습니다.'));
        });
    }

    function deleteFaqManagerFaq() {
        const faqId = $('#faq-manager-edit-id').val();

        if (!confirm('해당 FAQ를 삭제하시겠습니까?')) {
            return;
        }

        $.ajax({
            url: '/admin/api/faqs/' + faqId,
            type: 'DELETE',
            headers: getFaqManagerCsrfHeaders()
        }).done(function (response) {
            alert(response.message || 'FAQ가 삭제되었습니다.');
            faqManagerEditModalInstance.hide();
            loadFaqManagerTopics();
            loadFaqManagerList();
        }).fail(function (xhr) {
            alert(extractFaqManagerErrorMessage(xhr, 'FAQ 삭제 중 오류가 발생했습니다.'));
        });
    }

    function getFaqManagerCreatePayload() {
        const topicValue = $('#faq-manager-create-topic-id').val();
        return {
            topicId: topicValue ? Number(topicValue) : null,
            title: ($('#faq-manager-create-title').val() || '').trim(),
            answer: ($('#faq-manager-create-answer').val() || '').trim(),
            linkEnabled: $('#faq-manager-create-link-enabled').is(':checked'),
            linkUrl: ($('#faq-manager-create-link-url').val() || '').trim()
        };
    }

    function getFaqManagerEditPayload() {
        const topicValue = $('#faq-manager-edit-topic-id').val();
        return {
            topicId: topicValue ? Number(topicValue) : null,
            title: ($('#faq-manager-edit-title').val() || '').trim(),
            answer: ($('#faq-manager-edit-answer').val() || '').trim(),
            linkEnabled: $('#faq-manager-edit-link-enabled').is(':checked'),
            linkUrl: ($('#faq-manager-edit-link-url').val() || '').trim()
        };
    }

    function resetFaqManagerCreateForm() {
        $('#faq-manager-create-title').val('');
        $('#faq-manager-create-answer').val('');
        $('#faq-manager-create-link-enabled').prop('checked', false);
        $('#faq-manager-create-link-url').val('').prop('disabled', true);

        if (faqManagerState.topics.length) {
            $('#faq-manager-create-topic-id').val(String(faqManagerState.topics[0].id));
        } else {
            $('#faq-manager-create-topic-id').val('');
        }
    }

    function validateFaqManagerPayload(payload) {
        if (!payload.topicId) {
            return 'FAQ 주제를 선택해주세요.';
        }
        if (!payload.title) {
            return '제목을 입력해주세요.';
        }
        if (!payload.answer) {
            return '답변을 입력해주세요.';
        }
        if (payload.linkEnabled && !payload.linkUrl) {
            return '링크 사용 시 링크를 반드시 입력해주세요.';
        }
        return null;
    }

    function checkFaqManagerEditChanged() {
        const current = getFaqManagerEditPayload();
        const original = faqManagerState.editOriginal;

        if (!original) {
            $('#faq-manager-update-btn').prop('disabled', true);
            return;
        }

        const changed =
            current.topicId !== original.topicId ||
            current.title !== original.title ||
            current.answer !== original.answer ||
            current.linkEnabled !== original.linkEnabled ||
            current.linkUrl !== original.linkUrl;

        $('#faq-manager-update-btn').prop('disabled', !changed);
    }

    function formatFaqManagerDate(value) {
        if (!value) {
            return '-';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function escapeFaqManagerHtml(value) {
        if (value === null || value === undefined) {
            return '';
        }

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function extractFaqManagerErrorMessage(xhr, defaultMessage) {
        if (xhr && xhr.responseJSON && xhr.responseJSON.message) {
            return xhr.responseJSON.message;
        }
        return defaultMessage;
    }
})();
