(() => {
  'use strict';
  const root = document.querySelector('[data-copy-page]');
  if (!root || root.dataset.copyEditable !== 'true') return;
  const active = new Set();
  const notice = document.createElement('p');
  notice.className = 'sk-edit-notice';
  notice.textContent = '管理者編集モード：各項目の「編集」→「保存」で公開ページに反映されます。';
  root.prepend(notice);
  root.querySelectorAll('[data-copy-key]').forEach(node => {
    const controls = document.createElement('sk-controls');
    controls.className = 'sk-copy-controls';
    const edit = document.createElement('button');
    edit.type = 'button'; edit.textContent = '編集'; edit.className = 'sk-copy-button';
    edit.dataset.copyControl = node.dataset.copyKey;
    edit.setAttribute('aria-label', '編集：' + node.textContent.slice(0, 60));
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
      active.delete(node); input = null; edit.textContent = '編集'; edit.disabled = false;
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
        input.setAttribute('aria-label', '本文の編集');
        cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'sk-copy-button'; cancel.textContent = '取消';
        status = document.createElement('span'); status.className = 'sk-copy-status'; status.setAttribute('role', 'status');
        controls.append(cancel, input, status); node.hidden = true;
        edit.textContent = '保存'; edit.setAttribute('aria-expanded', 'true'); active.add(node);
        cancel.addEventListener('click', e => {e.preventDefault(); e.stopPropagation(); if (!saving) {finish(); edit.focus();}});
        input.addEventListener('keydown', e => {
          e.stopPropagation();
          if (e.key === 'Escape' && !saving) { finish(); edit.focus(); }
          else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.isComposing) {e.preventDefault(); edit.click();}
        });
        input.focus(); return;
      }
      const content = input.value.trim();
      if (!content) {status.textContent = '本文を入力してください。'; input.focus(); return;}
      if (content === original) {finish(); return;}
      if (!node.dataset.copyVersion) {status.textContent = '初期データがありません。管理者にSQLの実行を依頼してください。'; return;}
      saving = true; edit.disabled = true; cancel.disabled = true; input.readOnly = true; edit.textContent = '保存中…'; status.textContent = '';
      const abort = new AbortController();
      const timeout = setTimeout(() => abort.abort(), 20000);
      try {
        const response = await fetch('/admin/api/surgery-page-copy/' + root.dataset.copyPage + '/' + node.dataset.copyKey, {
          method: 'PUT', credentials: 'same-origin', redirect: 'error', signal: abort.signal,
          headers: {'Content-Type': 'application/json', 'X-Surgery-Edit-Token': root.dataset.copyToken},
          body: JSON.stringify({content, version: Number(node.dataset.copyVersion)})
        });
        if (!response.ok) {
          if (response.status === 409) throw new Error('他の編集者が更新しました。入力内容をコピーしてから再読み込みしてください。');
          if (response.status === 401 || response.status === 403) throw new Error('ログインの有効期限が切れました。入力内容をコピーして再ログインしてください。');
          throw new Error('保存できませんでした。入力内容は保持されています。再度お試しください。');
        }
        const saved = await response.json();
        node.textContent = saved.content; node.dataset.copyVersion = String(saved.version);
        finish(); edit.focus();
      } catch (error) {
        status.textContent = error.name === 'AbortError' ? '通信がタイムアウトしました。入力内容をコピーし、保存結果を確認してから再度お試しください。' : error.message === 'Failed to fetch' ? '通信またはログインを確認してください。入力内容は保持されています。' : error.message;
        edit.disabled = false; cancel.disabled = false; input.readOnly = false; edit.textContent = '保存';
      } finally {clearTimeout(timeout); saving = false;}
    });
  });
  window.addEventListener('beforeunload', event => {if (active.size) {event.preventDefault(); event.returnValue = '';}});
})();
