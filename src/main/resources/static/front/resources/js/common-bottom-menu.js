(function () {
	'use strict';

	function initCommonBottomMenu() {
		var modal = document.getElementById('common-bottom-menu-modal');
		var dialog = document.getElementById('common-bottom-menu-dialog');
		var title = document.getElementById('common-bottom-menu-title');
		var eyebrow = document.getElementById('common-bottom-menu-eyebrow');
		var content = document.getElementById('common-bottom-menu-content');
		var scrollArea = document.getElementById('common-bottom-menu-scroll');
		var closeButton = document.getElementById('common-bottom-menu-close');

		if (!modal || !dialog || !title || !eyebrow || !content || !scrollArea || !closeButton) {
			return;
		}

		/*
		 * footer 또는 #container에 transform / overflow가 적용되어 있어도
		 * fixed 팝업이 잘리지 않도록 실행 시 body 직속으로 이동합니다.
		 */
		if (modal.parentNode !== document.body) {
			document.body.appendChild(modal);
		}

		var config = {
			ko: {
				terms: { title: '이용약관', eyebrow: 'GUIDE', templateId: 'common-bottom-menu-template-terms' },
				privacy: { title: '개인정보처리방침', eyebrow: 'PRIVACY POLICY', templateId: 'common-bottom-menu-template-privacy' },
				nonpayment: { title: '비급여항목수가표', eyebrow: 'NON-COVERED MEDICAL FEES', templateId: 'common-bottom-menu-template-nonpayment' }
			},
			ja: {
				terms: { title: '利用規約', eyebrow: 'GUIDE', templateId: 'common-bottom-menu-template-terms-ja' },
				privacy: { title: 'プライバシーポリシー', eyebrow: 'PRIVACY POLICY', templateId: 'common-bottom-menu-template-privacy-ja' },
				nonpayment: { title: '自由診療料金表', eyebrow: 'NON-COVERED MEDICAL FEES', templateId: 'common-bottom-menu-template-nonpayment-ja' }
			}
		};

		var lastFocusedElement = null;
		var openFrame = null;
		var closeTimer = null;
		var isOpen = false;
		var activeLanguage = 'ko';


		function getLanguage(trigger) {
			var forced = trigger ? trigger.getAttribute('data-common-bottom-menu-lang') : '';
			var htmlLang = document.documentElement.getAttribute('lang') || 'ko';
			var language = (forced || htmlLang).toLowerCase();

			return language.indexOf('ja') === 0 ? 'ja' : 'ko';
		}

		function getFocusableElements() {
			return Array.prototype.slice.call(
				dialog.querySelectorAll(
					'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
					'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
				)
			).filter(function (element) {
				return element.offsetParent !== null;
			});
		}

		function renderTemplate(templateId) {
			var template = document.getElementById(templateId);

			content.replaceChildren();

			if (!template || !template.content) {
				var errorBox = document.createElement('div');
				errorBox.className = 'common-bottom-menu-note';
				errorBox.textContent = activeLanguage === 'ja' ? '表示する内容が見つかりません。' : '표시할 내용을 찾을 수 없습니다.';
				content.appendChild(errorBox);
				return;
			}

			content.appendChild(template.content.cloneNode(true));
			bindImageErrors();
		}

		function bindImageErrors() {
			var images = content.querySelectorAll('.common-bottom-menu-fee-image');

			Array.prototype.forEach.call(images, function (image) {
				image.addEventListener('error', function () {
					var wrapper = image.closest('.common-bottom-menu-image-scroll');
					if (!wrapper) {
						return;
					}

					var message = document.createElement('p');
					message.className = 'common-bottom-menu-note';
					message.textContent = activeLanguage === 'ja'
						? '料金表の画像が見つかりません。画像パスを確認してください: ' + image.getAttribute('src')
						: '수가표 이미지를 찾을 수 없습니다. 이미지 경로를 확인해 주세요: ' + image.getAttribute('src');
					wrapper.replaceChildren(message);
				}, { once: true });
			});
		}

		function openModal(type, trigger) {
			activeLanguage = getLanguage(trigger);
			var selected = config[activeLanguage] && config[activeLanguage][type];
			if (!selected) {
				return;
			}

			if (closeTimer) {
				window.clearTimeout(closeTimer);
				closeTimer = null;
			}

			lastFocusedElement = trigger || document.activeElement;
			title.textContent = selected.title;
			eyebrow.textContent = selected.eyebrow;
			closeButton.setAttribute('aria-label', activeLanguage === 'ja' ? 'ポップアップを閉じる' : '팝업 닫기');
			dialog.setAttribute('lang', activeLanguage);
			renderTemplate(selected.templateId);
			scrollArea.scrollTop = 0;

			modal.hidden = false;
			modal.setAttribute('aria-hidden', 'false');
			document.body.classList.add('common-bottom-menu-open');
			isOpen = true;

			if (openFrame) {
				window.cancelAnimationFrame(openFrame);
			}

			openFrame = window.requestAnimationFrame(function () {
				modal.classList.add('common-bottom-menu-is-open');
				closeButton.focus({ preventScroll: true });
				openFrame = null;
			});
		}

		function closeModal() {
			if (!isOpen) {
				return;
			}

			isOpen = false;

			if (openFrame) {
				window.cancelAnimationFrame(openFrame);
				openFrame = null;
			}

			modal.classList.remove('common-bottom-menu-is-open');
			modal.setAttribute('aria-hidden', 'true');
			document.body.classList.remove('common-bottom-menu-open');

			if (closeTimer) {
				window.clearTimeout(closeTimer);
			}

			closeTimer = window.setTimeout(function () {
				modal.hidden = true;
				content.replaceChildren();
				closeTimer = null;
			}, 280);

			if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
				lastFocusedElement.focus({ preventScroll: true });
			}
		}

		function trapFocus(event) {
			if (!isOpen || event.key !== 'Tab') {
				return;
			}

			var focusable = getFocusableElements();
			if (!focusable.length) {
				event.preventDefault();
				dialog.focus();
				return;
			}

			var first = focusable[0];
			var last = focusable[focusable.length - 1];

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}

		document.addEventListener('click', function (event) {
			var clickTarget = event.target;
			if (!clickTarget || typeof clickTarget.closest !== 'function') {
				return;
			}

			var trigger = clickTarget.closest('.common-bottom-menu-trigger');
			if (trigger) {
				event.preventDefault();
				openModal(trigger.getAttribute('data-common-bottom-menu-type'), trigger);
				return;
			}

			if (clickTarget.closest('[data-common-bottom-menu-close]')) {
				event.preventDefault();
				closeModal();
			}
		});

		document.addEventListener('keydown', function (event) {
			if (!isOpen) {
				return;
			}

			if (event.key === 'Escape') {
				event.preventDefault();
				closeModal();
				return;
			}

			trapFocus(event);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initCommonBottomMenu, { once: true });
	} else {
		initCommonBottomMenu();
	}
})();
