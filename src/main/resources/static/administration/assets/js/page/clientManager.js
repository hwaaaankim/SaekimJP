document.addEventListener('DOMContentLoaded', function () {
    const page = document.getElementById('client-manager-page');
    if (!page) {
        return;
    }

    const apiUrl = page.dataset.apiUrl;
    const searchForm = document.getElementById('client-manager-search-form');
    const pageSizeEl = document.getElementById('client-manager-page-size');
    const searchTypeEl = document.getElementById('client-manager-search-type');
    const keywordEl = document.getElementById('client-manager-keyword');
    const tableBody = document.getElementById('client-manager-table-body');
    const totalCountEl = document.getElementById('client-manager-total-count');
    const paginationEl = document.getElementById('client-manager-pagination');

    const modalElement = document.getElementById('client-manager-detail-modal');
    const detailModal = bootstrap.Modal.getOrCreateInstance(modalElement);

    const detailIdEl = document.getElementById('client-manager-detail-id');
    const detailNameEl = document.getElementById('client-manager-detail-name');
    const detailPhoneEl = document.getElementById('client-manager-detail-phone');
    const detailEmailEl = document.getElementById('client-manager-detail-email');
    const detailPreferredDateEl = document.getElementById('client-manager-detail-preferred-date');
    const detailPreferredTimeEl = document.getElementById('client-manager-detail-preferred-time');
    const detailCustomerMemoEl = document.getElementById('client-manager-detail-customer-memo');
    const detailAdminMemoEl = document.getElementById('client-manager-detail-admin-memo');
    const detailInquiryAtEl = document.getElementById('client-manager-detail-inquiry-at');
    const detailUpdatedAtEl = document.getElementById('client-manager-detail-updated-at');

    const saveBtn = document.getElementById('client-manager-save-btn');
    const deleteBtn = document.getElementById('client-manager-delete-btn');

    let currentPage = 0;
    let currentSize = 10;
    let currentDetailId = null;

    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        loadList(0);
    });

    pageSizeEl.addEventListener('change', function () {
        loadList(0);
    });

    detailPhoneEl.addEventListener('input', function () {
        detailPhoneEl.value = formatPhone(detailPhoneEl.value);
    });

    tableBody.addEventListener('click', function (e) {
        const button = e.target.closest('.client-manager-name-button');
        if (!button) {
            return;
        }

        const id = button.dataset.id;
        openDetail(id);
    });

    saveBtn.addEventListener('click', async function () {
        if (!currentDetailId) {
            return;
        }

        try {
            const payload = {
                name: detailNameEl.value,
                phone: detailPhoneEl.value,
                preferredDate: detailPreferredDateEl.value,
                preferredTime: detailPreferredTimeEl.value,
                email: detailEmailEl.value,
                surgeryExperience: getCheckedBoolean('client-manager-detail-surgery-experience'),
                revisionSurgery: getCheckedBoolean('client-manager-detail-revision-surgery'),
                customerMemo: detailCustomerMemoEl.value,
                adminMemo: detailAdminMemoEl.value,
                confirmed: getCheckedBoolean('client-manager-detail-confirmed')
            };

            const response = await fetch(apiUrl + '/' + currentDetailId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await parseResponse(response);

            fillDetailForm(data);
            detailModal.hide();
            await loadList(currentPage);
            alert('문의가 수정되었습니다.');
        } catch (error) {
            alert(error.message || '수정 중 오류가 발생했습니다.');
        }
    });

    deleteBtn.addEventListener('click', async function () {
        if (!currentDetailId) {
            return;
        }

        if (!confirm('해당 문의를 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch(apiUrl + '/' + currentDetailId, {
                method: 'DELETE'
            });

            const data = await parseResponse(response);

            detailModal.hide();
            currentDetailId = null;
            await loadList(currentPage);
            alert(data.message || '문의가 삭제되었습니다.');
        } catch (error) {
            alert(error.message || '삭제 중 오류가 발생했습니다.');
        }
    });

    async function loadList(pageNo) {
        currentPage = Math.max(pageNo, 0);
        currentSize = parseInt(pageSizeEl.value || '10', 10);

        const params = new URLSearchParams();
        params.set('page', currentPage);
        params.set('size', currentSize);
        params.set('searchType', searchTypeEl.value || 'name');
        params.set('keyword', keywordEl.value || '');

        try {
            const response = await fetch(apiUrl + '?' + params.toString(), {
                method: 'GET'
            });

            const data = await parseResponse(response);

            renderTable(data);
            renderPagination(data);
            totalCountEl.textContent = data.totalElements || 0;
        } catch (error) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger py-5">
                        ${escapeHtml(error.message || '목록을 불러오지 못했습니다.')}
                    </td>
                </tr>
            `;
            paginationEl.innerHTML = '';
            totalCountEl.textContent = '0';
        }
    }

    function renderTable(data) {
        const content = data.content || [];

        if (content.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-5">
                        조회된 문의가 없습니다.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';

        content.forEach(function (item, index) {
            const rowNumber = (data.totalElements || 0) - (data.number * data.size) - index;
            const confirmedBadge = item.confirmed
                ? '<span class="badge bg-success client-manager-badge">확인</span>'
                : '<span class="badge bg-secondary client-manager-badge">미확인</span>';

            html += `
                <tr>
                    <td>${rowNumber}</td>
                    <td>
                        <button type="button"
                                class="btn btn-link p-0 client-manager-name-button"
                                data-id="${item.id}">
                            ${escapeHtml(item.name)}
                        </button>
                    </td>
                    <td>${escapeHtml(item.phone || '-')}</td>
                    <td>${escapeHtml(item.inquiryAt || '-')}</td>
                    <td>${escapeHtml(item.updatedAt || '-')}</td>
                    <td>${confirmedBadge}</td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    }

    function renderPagination(data) {
        const totalPages = data.totalPages || 0;

        if (totalPages <= 1) {
            paginationEl.innerHTML = '';
            return;
        }

        const current = data.number || 0;
        const start = Math.max(0, current - 2);
        const end = Math.min(totalPages - 1, current + 2);

        let html = '';

        html += `
            <li class="page-item ${current === 0 ? 'disabled' : ''}">
                <a class="page-link client-manager-page-link" href="#" data-page="${current - 1}">이전</a>
            </li>
        `;

        for (let i = start; i <= end; i++) {
            html += `
                <li class="page-item ${i === current ? 'active' : ''}">
                    <a class="page-link client-manager-page-link" href="#" data-page="${i}">${i + 1}</a>
                </li>
            `;
        }

        html += `
            <li class="page-item ${current >= totalPages - 1 ? 'disabled' : ''}">
                <a class="page-link client-manager-page-link" href="#" data-page="${current + 1}">다음</a>
            </li>
        `;

        paginationEl.innerHTML = html;
    }

    paginationEl.addEventListener('click', function (e) {
        e.preventDefault();

        const link = e.target.closest('.client-manager-page-link');
        if (!link) {
            return;
        }

        const parent = link.closest('.page-item');
        if (parent.classList.contains('disabled') || parent.classList.contains('active')) {
            return;
        }

        const page = parseInt(link.dataset.page, 10);
        if (Number.isNaN(page) || page < 0) {
            return;
        }

        loadList(page);
    });

    async function openDetail(id) {
        try {
            const response = await fetch(apiUrl + '/' + id, {
                method: 'GET'
            });

            const data = await parseResponse(response);

            currentDetailId = id;
            fillDetailForm(data);
            detailModal.show();

            await loadList(currentPage);
        } catch (error) {
            alert(error.message || '상세 정보를 불러오지 못했습니다.');
        }
    }

    function fillDetailForm(data) {
        detailIdEl.value = data.id || '';
        detailNameEl.value = data.name || '';
        detailPhoneEl.value = data.phone || '';
        detailEmailEl.value = normalizeDashToBlank(data.email);
        detailPreferredDateEl.value = normalizeDashToBlank(data.preferredDate);
        detailPreferredTimeEl.value = normalizeDashToBlank(data.preferredTime);
        detailCustomerMemoEl.value = normalizeDashToBlank(data.customerMemo);
        detailAdminMemoEl.value = normalizeDashToBlank(data.adminMemo);
        detailInquiryAtEl.value = data.inquiryAt || '-';
        detailUpdatedAtEl.value = data.updatedAt || '-';

        setCheckedBoolean('client-manager-detail-surgery-experience', !!data.surgeryExperience);
        setCheckedBoolean('client-manager-detail-revision-surgery', !!data.revisionSurgery);
        setCheckedBoolean('client-manager-detail-confirmed', !!data.confirmed);
    }

    function setCheckedBoolean(name, value) {
        const target = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (target) {
            target.checked = true;
        }
    }

    function getCheckedBoolean(name) {
        const target = document.querySelector(`input[name="${name}"]:checked`);
        return target ? target.value === 'true' : false;
    }

    function normalizeDashToBlank(value) {
        return value === '-' ? '' : (value || '');
    }

    async function parseResponse(response) {
        let data = {};
        try {
            data = await response.json();
        } catch (e) {
            data = {};
        }

        if (!response.ok) {
            throw new Error(data.message || '처리 중 오류가 발생했습니다.');
        }

        return data;
    }

    function formatPhone(value) {
        const digits = (value || '').replace(/\D/g, '');

        if (digits.length < 4) {
            return digits;
        }

        if (digits.startsWith('02')) {
            if (digits.length < 6) {
                return digits;
            }
            if (digits.length < 10) {
                return digits.replace(/(\d{2})(\d+)/, '$1-$2');
            }
            if (digits.length === 10) {
                return digits.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
            }
            return digits.substring(0, 10).replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
        }

        if (digits.length < 8) {
            return digits.replace(/(\d{3})(\d+)/, '$1-$2');
        }

        if (digits.length < 11) {
            return digits.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
        }

        return digits.substring(0, 11).replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    loadList(0);
});