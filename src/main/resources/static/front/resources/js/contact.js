document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('regiForm');
    if (!form) {
        return;
    }

    const nameEl = document.getElementById('contact-name');
    const phoneEl = document.getElementById('contact-phone');
    const emailEl = document.getElementById('contact-email');
    const preferredDateEl = document.getElementById('contact-preferred-date');
    const preferredTimeEl = document.getElementById('contact-preferred-time');
    const customerMemoEl = document.getElementById('contact-customer-memo');
    const agree1El = document.getElementById('agree_1');
    const agree2El = document.getElementById('agree_2');
    const agree3El = document.getElementById('agree_3');

    phoneEl.addEventListener('input', function () {
        phoneEl.value = formatPhone(phoneEl.value);
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const validationMessage = validateForm();
        if (validationMessage) {
            alert(validationMessage);
            return;
        }

        const payload = {
            name: nameEl.value.trim(),
            phone: phoneEl.value.trim(),
            preferredDate: preferredDateEl.value || '',
            preferredTime: preferredTimeEl.value || '',
            email: emailEl.value.trim(),
            surgeryExperience: getRadioBooleanValue('surgeryExperience'),
            revisionSurgery: getRadioBooleanValue('revisionSurgery'),
            customerMemo: customerMemoEl.value.trim(),
            privacyAgreementRequired: agree1El.checked,
            thirdPartyAgreementRequired: agree2El.checked,
            privacyAgreementOptional: agree3El.checked
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await parseResponse(response);

            alert(data.message || 'お問い合わせを受け付けました。順次ご連絡いたします。');
            location.href = '/index';
        } catch (error) {
            alert(error.message || 'お問い合わせの送信中にエラーが発生しました。');
        }
    });

    function validateForm() {
        if (!nameEl.value.trim()) {
            nameEl.focus();
            return '氏名を入力してください。';
        }

        const digits = phoneEl.value.replace(/\D/g, '');
        if (!digits) {
            phoneEl.focus();
            return '電話番号を入力してください。';
        }

        if (!(digits.length === 9 || digits.length === 10 || digits.length === 11)) {
            phoneEl.focus();
            return '電話番号の形式が正しくありません。';
        }

        if (emailEl.value.trim() && !isValidEmail(emailEl.value.trim())) {
            emailEl.focus();
            return 'メールアドレスの形式が正しくありません。';
        }

        if (!agree1El.checked) {
            agree1El.focus();
            return '個人情報の収集・利用への同意（必須）にチェックを入れてください。';
        }

        if (!agree2El.checked) {
            agree2El.focus();
            return '個人情報の第三者提供への同意（必須）にチェックを入れてください。';
        }

        return '';
    }

    function getRadioBooleanValue(name) {
        const checked = document.querySelector('input[name="' + name + '"]:checked');
        return checked ? checked.value === 'true' : false;
    }

    function isValidEmail(email) {
        return /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
    }

    function formatPhone(value) {
        const digits = (value || '').replace(/\D/g, '');

        if (digits.startsWith('02')) {
            if (digits.length < 3) return digits;
            if (digits.length < 6) return digits.replace(/(\d{2})(\d+)/, '$1-$2');
            if (digits.length < 10) return digits.replace(/(\d{2})(\d{3,4})(\d+)/, '$1-$2-$3');
            return digits.substring(0, 10).replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
        }

        if (digits.length < 4) return digits;
        if (digits.length < 8) return digits.replace(/(\d{3})(\d+)/, '$1-$2');
        if (digits.length < 11) return digits.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');

        return digits.substring(0, 11).replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }

    async function parseResponse(response) {
        let data = {};

        try {
            data = await response.json();
        } catch (e) {
            data = {};
        }

        if (!response.ok) {
            throw new Error(data.message || '処理中にエラーが発生しました。');
        }

        return data;
    }

    window.goRegi = function () {
        form.requestSubmit();
    };

    window.openPrivate = function (anchorEl) {
        const item = anchorEl.closest('.check-item');
        if (!item) {
            return;
        }

        const content = item.querySelector('.checkbox-cont');
        if (!content) {
            return;
        }

        const expanded = content.style.display === 'none' || !content.style.display;
        content.style.display = expanded ? 'block' : 'none';
        item.classList.toggle('active', expanded);
        anchorEl.setAttribute('aria-expanded', String(expanded));
    };
});