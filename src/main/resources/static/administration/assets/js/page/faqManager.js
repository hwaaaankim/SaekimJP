(function () {
    'use strict';

    const faqManagerState = {
        page: 0,
        size: 12,
        keyword: '',
        editOriginal: null
    };

    let faqManagerEditModalInstance = null;

    $(document).ready(function () {
        const modalElement = document.getElementById('faq-manager-edit-modal');
        faqManagerEditModalInstance = new bootstrap.Modal(modalElement);

        bindFaqManagerEvents();
        toggleFaqManagerCreateLinkInput();
        toggleFaqManagerEditLinkInput();
        loadFaqManagerList();
    });

    function bindFaqManagerEvents() {
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
            faqManagerState.page = 0;
            loadFaqManagerList();
        });

        $(document).on('click', '.faq-manager-edit-open-btn', function () {
            const faqId = $(this).data('faq-id');
            openFaqManagerEditModal(faqId);
        });

        $('#faq-manager-update-btn').on('click', function () {
            updateFaqManagerFaq();
        });

        $('#faq-manager-delete-btn').on('click', function () {
            deleteFaqManagerFaq();
        });

        $('#faq-manager-edit-title, #faq-manager-edit-answer, #faq-manager-edit-link-url').on('input', function () {
            checkFaqManagerEditChanged();
        });

        $(document).on('click', '.faq-manager-page-link', function (e) {
            e.preventDefault();

            const page = $(this).data('page');
            if (page === undefined || page === null) {
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
            loadFaqManagerList();
        }).fail(function (xhr) {
            alert(extractFaqManagerErrorMessage(xhr, 'FAQ 등록 중 오류가 발생했습니다.'));
        });
    }

    function loadFaqManagerList() {
        $.ajax({
            url: '/admin/api/faqs',
            type: 'GET',
            data: {
                page: faqManagerState.page,
                size: faqManagerState.size,
                keyword: faqManagerState.keyword
            }
        }).done(function (response) {
            const pageData = response.data;
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
        const totalPages = pageData.totalPages || 0;
        const currentPage = pageData.number || 0;

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
            loadFaqManagerList();
        }).fail(function (xhr) {
            alert(extractFaqManagerErrorMessage(xhr, 'FAQ 삭제 중 오류가 발생했습니다.'));
        });
    }

    function getFaqManagerCreatePayload() {
        return {
            title: ($('#faq-manager-create-title').val() || '').trim(),
            answer: ($('#faq-manager-create-answer').val() || '').trim(),
            linkEnabled: $('#faq-manager-create-link-enabled').is(':checked'),
            linkUrl: ($('#faq-manager-create-link-url').val() || '').trim()
        };
    }

    function getFaqManagerEditPayload() {
        return {
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
    }

    function validateFaqManagerPayload(payload) {
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