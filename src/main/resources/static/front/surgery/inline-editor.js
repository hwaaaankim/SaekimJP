(() => {
  'use strict';
  const root = document.querySelector('[data-copy-page]');
  if (!root || root.dataset.copyEditable !== 'true') return;
  const active = new Set();
  const saveErrors = new Set(['다른 관리자가 수정했거나 초기 데이터가 없습니다. 입력 내용을 복사한 뒤 새로고침하여 확인해 주세요.', '로그인 상태 또는 관리자 권한을 확인할 수 없습니다. 입력 내용을 복사한 뒤 관리자 계정으로 다시 로그인해 주세요.', '저장하지 못했습니다. 입력 내용은 유지되어 있습니다. 다시 시도해 주세요.']);
  const notice = document.createElement('p');
  notice.className = 'sk-edit-notice'; notice.lang = 'ko';
  notice.textContent = '관리자 편집 모드: 각 항목의 ‘편집’ → ‘저장’을 누르면 공개 페이지에 바로 반영됩니다.';
  root.prepend(notice);
  // Keep each carousel card a direct rail child. Editing controls must not
  // wrap the flex item or nest buttons inside its navigation link.
  root.querySelectorAll('a.sk-slide-card').forEach(anchor => {
    if (!anchor.querySelector('[data-copy-key]')) return;
    const card = document.createElement('article');
    for (const attr of anchor.attributes) {
      if (!['href', 'target', 'rel', 'download'].includes(attr.name)) card.setAttribute(attr.name, attr.value);
    }
    card.classList.add('sk-copy-card');
    const link = document.createElement('a');
    link.className = 'sk-copy-card-link';
    link.href = anchor.getAttribute('href');
    for (const name of ['target', 'rel']) if (anchor.hasAttribute(name)) link.setAttribute(name, anchor.getAttribute(name));
    const label = () => link.setAttribute('aria-label', (card.querySelector('h4 sk-copy')?.textContent || '상세 보기').trim());
    while (anchor.firstChild) card.append(anchor.firstChild);
    card.append(link); anchor.replaceWith(card); label();
    new MutationObserver(label).observe(card.querySelector('h4') || card, {childList:true, subtree:true, characterData:true});
  });
  root.querySelectorAll('[data-copy-key]').forEach(node => {
    const controls = document.createElement('sk-controls');
    controls.className = 'sk-copy-controls'; controls.lang = 'ko';
    const edit = document.createElement('button');
    edit.type = 'button'; edit.textContent = '편집'; edit.className = 'sk-copy-button';
    edit.dataset.copyControl = node.dataset.copyKey;
    edit.setAttribute('aria-label', '편집: ' + node.textContent.slice(0, 60));
    controls.append(edit);
    const interactive = node.closest('a,button');
    if (interactive) {
      let wrapper = interactive.parentElement;
      if (!wrapper.classList.contains('sk-copy-link-wrap')) {
        wrapper = document.createElement('span'); wrapper.className = 'sk-copy-link-wrap';
        interactive.before(wrapper); wrapper.append(interactive);
      }
      wrapper.append(controls);
    } else node.after(controls);
    let input, cancel, status, original, saving = false;
    const finish = () => {
      input.remove(); cancel.remove(); status.remove(); node.hidden = false;
      active.delete(node); input = null; edit.textContent = '편집'; edit.disabled = false;
      edit.setAttribute('aria-expanded', 'false');
      window.dispatchEvent(new Event('resize'));
    };
    edit.addEventListener('click', async event => {
      event.preventDefault(); event.stopPropagation();
      if (saving) return;
      if (!input) {
        original = node.textContent;
        input = document.createElement('textarea'); input.className = 'sk-copy-input';
        input.id = 'copy-input-' + node.dataset.copyKey;
        edit.setAttribute('aria-controls', input.id);
        input.value = original; input.maxLength = 10000; input.rows = Math.min(8, Math.max(2, Math.ceil(original.length / 30)));
        input.setAttribute('aria-label', '본문 편집');
        cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'sk-copy-button'; cancel.textContent = '취소';
        status = document.createElement('span'); status.className = 'sk-copy-status'; status.setAttribute('role', 'status');
        controls.append(cancel, input, status); node.hidden = true;
        edit.textContent = '저장'; edit.setAttribute('aria-expanded', 'true'); active.add(node);
        cancel.addEventListener('click', e => {e.preventDefault(); e.stopPropagation(); if (!saving) {finish(); edit.focus();}});
        input.addEventListener('keydown', e => {
          e.stopPropagation();
          if (e.key === 'Escape' && !saving) { finish(); edit.focus(); }
          else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.isComposing) {e.preventDefault(); edit.click();}
        });
        input.focus(); return;
      }
      const content = input.value.trim();
      if (!content) {status.textContent = '내용을 입력해 주세요.'; input.focus(); return;}
      if (content === original) {finish(); return;}
      if (!node.dataset.copyVersion) {status.textContent = '초기 데이터가 없습니다. 해당 사이트 DB에 초기 데이터 SQL을 실행했는지 확인해 주세요.'; return;}
      saving = true; edit.disabled = true; cancel.disabled = true; input.readOnly = true; edit.textContent = '저장 중…'; status.textContent = '';
      const abort = new AbortController();
      const timeout = setTimeout(() => abort.abort(), 20000);
      try {
        const response = await fetch('/admin/api/surgery-page-copy/' + root.dataset.copyPage + '/' + node.dataset.copyKey, {
          method: 'PUT', credentials: 'same-origin', redirect: 'error', signal: abort.signal,
          headers: {'Content-Type': 'application/json', 'X-Surgery-Edit-Token': root.dataset.copyToken},
          body: JSON.stringify({content, version: Number(node.dataset.copyVersion)})
        });
        if (!response.ok) {
          if (response.status === 409) throw new Error('다른 관리자가 수정했거나 초기 데이터가 없습니다. 입력 내용을 복사한 뒤 새로고침하여 확인해 주세요.');
          if (response.status === 401 || response.status === 403) throw new Error('로그인 상태 또는 관리자 권한을 확인할 수 없습니다. 입력 내용을 복사한 뒤 관리자 계정으로 다시 로그인해 주세요.');
          throw new Error('저장하지 못했습니다. 입력 내용은 유지되어 있습니다. 다시 시도해 주세요.');
        }
        const saved = await response.json();
        node.textContent = saved.content; node.dataset.copyVersion = String(saved.version);
        finish(); edit.focus();
      } catch (error) {
        status.textContent = error.name === 'AbortError' ? '저장 요청 시간이 초과되었습니다. 입력 내용을 복사하고 실제 저장 여부를 확인한 뒤 다시 시도해 주세요.' : error.message === 'Failed to fetch' ? '네트워크 연결 또는 로그인 상태를 확인해 주세요. 입력 내용은 유지되어 있습니다.' : saveErrors.has(error.message) ? error.message : '저장 중 오류가 발생했습니다. 입력 내용은 유지되어 있습니다. 네트워크 연결과 로그인 상태를 확인한 뒤 다시 시도해 주세요.';
        edit.disabled = false; cancel.disabled = false; input.readOnly = false; edit.textContent = '저장';
      } finally {clearTimeout(timeout); saving = false;}
    });
  });
  window.addEventListener('beforeunload', event => {if (active.size) {event.preventDefault(); event.returnValue = '';}});
})();
