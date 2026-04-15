(function() {
	class NoticeManagerUploadAdapter {
		constructor(loader) {
			this.loader = loader;
			this.xhr = null;
		}

		upload() {
			return this.loader.file.then(file => {
				return new Promise((resolve, reject) => {
					this.xhr = new XMLHttpRequest();
					this.xhr.open('POST', '/admin/api/notices/editor-image', true);
					this.xhr.responseType = 'json';

					const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
					const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

					if (csrfToken && csrfHeader) {
						this.xhr.setRequestHeader(csrfHeader, csrfToken);
					}

					this.xhr.addEventListener('error', () => {
						reject('이미지 업로드 중 오류가 발생했습니다.');
					});

					this.xhr.addEventListener('abort', () => {
						reject('이미지 업로드가 취소되었습니다.');
					});

					this.xhr.addEventListener('load', () => {
						const response = this.xhr.response;

						if (!response || !response.url) {
							reject((response && response.message) || '이미지 업로드에 실패했습니다.');
							return;
						}

						resolve({
							default: response.url
						});
					});

					if (this.xhr.upload) {
						this.xhr.upload.addEventListener('progress', evt => {
							if (evt.lengthComputable) {
								this.loader.uploadTotal = evt.total;
								this.loader.uploaded = evt.loaded;
							}
						});
					}

					const data = new FormData();
					data.append('upload', file);

					this.xhr.send(data);
				});
			});
		}

		abort() {
			if (this.xhr) {
				this.xhr.abort();
			}
		}
	}

	function NoticeManagerUploadAdapterPlugin(editor) {
		editor.plugins.get('FileRepository').createUploadAdapter = loader => {
			return new NoticeManagerUploadAdapter(loader);
		};
	}

	let noticeManagerCreateEditor = null;
	let noticeManagerEditEditor = null;
	let noticeManagerEditModal = null;

	let noticeManagerOriginalOrderKey = '';
	let noticeManagerOriginalEditState = {
		title: '',
		content: ''
	};

	document.addEventListener('DOMContentLoaded', async function() {
		await noticeManagerInitEditors();
		noticeManagerInitModal();
		noticeManagerInitSortable();
		noticeManagerBindCreateForm();
		noticeManagerBindTitleButtons();
		noticeManagerBindEditFormEvents();
		noticeManagerBindUpdateButton();
		noticeManagerBindDeleteButton();
		noticeManagerBindOrderSaveButton();
	});

	async function noticeManagerInitEditors() {
		noticeManagerCreateEditor = await ClassicEditor.create(
			document.querySelector('#notice-manager-create-content'),
			{
				extraPlugins: [NoticeManagerUploadAdapterPlugin]
			}
		);

		noticeManagerEditEditor = await ClassicEditor.create(
			document.querySelector('#notice-manager-edit-content'),
			{
				extraPlugins: [NoticeManagerUploadAdapterPlugin]
			}
		);
	}

	function noticeManagerInitModal() {
		const modalElement = document.getElementById('notice-manager-edit-modal');
		noticeManagerEditModal = new bootstrap.Modal(modalElement);
	}

	function noticeManagerInitSortable() {
		const sortableContainer = document.getElementById('notice-manager-sortable');
		const saveOrderBtn = document.getElementById('notice-manager-save-order-btn');

		noticeManagerOriginalOrderKey = noticeManagerGetCurrentOrderKey();

		new Sortable(sortableContainer, {
			animation: 180,
			handle: '.notice-manager-drag-handle',
			draggable: '.notice-manager-sort-item',
			onSort: function() {
				saveOrderBtn.disabled = noticeManagerOriginalOrderKey === noticeManagerGetCurrentOrderKey();
			}
		});
	}

	function noticeManagerBindCreateForm() {
		const form = document.getElementById('notice-manager-create-form');

		form.addEventListener('submit', async function(e) {
			e.preventDefault();

			const title = document.getElementById('notice-manager-create-title').value.trim();
			const content = noticeManagerCreateEditor.getData();

			if (!title) {
				alert('제목을 입력해주세요.');
				return;
			}

			if (noticeManagerIsEditorContentEmpty(content)) {
				alert('내용을 입력해주세요.');
				return;
			}

			try {
				const response = await fetch('/admin/api/notices', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						title: title,
						content: content
					})
				});

				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.message || '공지사항 등록에 실패했습니다.');
				}

				alert(result.message || '공지사항이 등록되었습니다.');
				window.location.reload();
			} catch (error) {
				alert(error.message || '공지사항 등록 중 오류가 발생했습니다.');
			}
		});
	}

	function noticeManagerBindTitleButtons() {
		document.querySelectorAll('.notice-manager-title-btn').forEach(function(button) {
			button.addEventListener('click', async function() {
				const noticeId = this.dataset.noticeId;
				await noticeManagerOpenEditModal(noticeId);
			});
		});
	}

	function noticeManagerBindEditFormEvents() {
		const editTitle = document.getElementById('notice-manager-edit-title');

		editTitle.addEventListener('input', noticeManagerToggleUpdateButton);
		noticeManagerEditEditor.model.document.on('change:data', noticeManagerToggleUpdateButton);
	}

	function noticeManagerBindUpdateButton() {
		const updateBtn = document.getElementById('notice-manager-update-btn');

		updateBtn.addEventListener('click', async function() {
			const id = document.getElementById('notice-manager-edit-id').value;
			const title = document.getElementById('notice-manager-edit-title').value.trim();
			const content = noticeManagerEditEditor.getData();

			if (!id) {
				alert('수정할 공지사항 ID가 없습니다.');
				return;
			}

			if (!title) {
				alert('제목을 입력해주세요.');
				return;
			}

			if (noticeManagerIsEditorContentEmpty(content)) {
				alert('내용을 입력해주세요.');
				return;
			}

			try {
				const response = await fetch(`/admin/api/notices/${id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						title: title,
						content: content
					})
				});

				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.message || '공지사항 수정에 실패했습니다.');
				}

				alert(result.message || '공지사항이 수정되었습니다.');
				window.location.reload();
			} catch (error) {
				alert(error.message || '공지사항 수정 중 오류가 발생했습니다.');
			}
		});
	}

	function noticeManagerBindDeleteButton() {
		const deleteBtn = document.getElementById('notice-manager-delete-btn');

		deleteBtn.addEventListener('click', async function() {
			const id = document.getElementById('notice-manager-edit-id').value;
			if (!id) {
				alert('삭제할 공지사항 ID가 없습니다.');
				return;
			}

			if (!confirm('정말 삭제하시겠습니까?')) {
				return;
			}

			try {
				const response = await fetch(`/admin/api/notices/${id}`, {
					method: 'DELETE'
				});

				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.message || '공지사항 삭제에 실패했습니다.');
				}

				alert(result.message || '공지사항이 삭제되었습니다.');
				window.location.reload();
			} catch (error) {
				alert(error.message || '공지사항 삭제 중 오류가 발생했습니다.');
			}
		});
	}

	function noticeManagerBindOrderSaveButton() {
		const saveOrderBtn = document.getElementById('notice-manager-save-order-btn');

		saveOrderBtn.addEventListener('click', async function() {
			const noticeIds = Array.from(document.querySelectorAll('.notice-manager-sort-item'))
				.map(item => Number(item.dataset.noticeId));

			if (!noticeIds.length) {
				alert('저장할 공지사항 순서가 없습니다.');
				return;
			}

			try {
				const response = await fetch('/admin/api/notices/order', {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						noticeIds: noticeIds
					})
				});

				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.message || '순서 저장에 실패했습니다.');
				}

				alert(result.message || '순서가 저장되었습니다.');
				window.location.reload();
			} catch (error) {
				alert(error.message || '순서 저장 중 오류가 발생했습니다.');
			}
		});
	}

	async function noticeManagerOpenEditModal(noticeId) {
		try {
			const response = await fetch(`/admin/api/notices/${noticeId}`);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || '공지사항 상세 조회에 실패했습니다.');
			}

			document.getElementById('notice-manager-edit-id').value = result.id;
			document.getElementById('notice-manager-edit-id-text').textContent = result.id;
			document.getElementById('notice-manager-edit-index-text').textContent = result.displayIndex;
			document.getElementById('notice-manager-edit-view-count-text').textContent = result.viewCount ?? 0;
			document.getElementById('notice-manager-edit-created-at-text').textContent = noticeManagerFormatDateTime(result.createdAt);
			document.getElementById('notice-manager-edit-updated-at-text').textContent = noticeManagerFormatDateTime(result.updatedAt);
			document.getElementById('notice-manager-edit-title').value = result.title ?? '';
			noticeManagerEditEditor.setData(result.content ?? '');

			noticeManagerOriginalEditState = {
				title: result.title ?? '',
				content: result.content ?? ''
			};

			noticeManagerToggleUpdateButton();
			noticeManagerEditModal.show();
		} catch (error) {
			alert(error.message || '공지사항 상세 조회 중 오류가 발생했습니다.');
		}
	}

	function noticeManagerToggleUpdateButton() {
		const currentTitle = document.getElementById('notice-manager-edit-title').value.trim();
		const currentContent = noticeManagerEditEditor.getData();
		const updateBtn = document.getElementById('notice-manager-update-btn');

		const changed = currentTitle !== noticeManagerOriginalEditState.title
			|| currentContent !== noticeManagerOriginalEditState.content;

		updateBtn.disabled = !changed;
	}

	function noticeManagerGetCurrentOrderKey() {
		return Array.from(document.querySelectorAll('.notice-manager-sort-item'))
			.map(item => item.dataset.noticeId)
			.join(',');
	}

	function noticeManagerIsEditorContentEmpty(html) {
		if (!html) {
			return true;
		}

		const plain = html
			.replace(/<br\s*\/?>/gi, '')
			.replace(/<\/p>/gi, '')
			.replace(/<p>/gi, '')
			.replace(/&nbsp;/gi, '')
			.replace(/<[^>]*>/g, '')
			.trim();

		return plain.length === 0;
	}

	function noticeManagerFormatDateTime(dateTimeString) {
		if (!dateTimeString) {
			return '-';
		}

		const date = new Date(dateTimeString);
		if (Number.isNaN(date.getTime())) {
			return dateTimeString;
		}

		const yyyy = date.getFullYear();
		const mm = String(date.getMonth() + 1).padStart(2, '0');
		const dd = String(date.getDate()).padStart(2, '0');
		const hh = String(date.getHours()).padStart(2, '0');
		const mi = String(date.getMinutes()).padStart(2, '0');

		return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
	}
})();