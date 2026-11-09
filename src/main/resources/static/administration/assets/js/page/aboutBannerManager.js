(() => {
  'use strict';
  const form = document.getElementById('about-banner-form');
  if (!form) return;
  const fields = document.getElementById('about-banner-fields');
  const title = document.getElementById('about-banner-title');
  const body = document.getElementById('about-banner-body');
  const file = document.getElementById('about-banner-image');
  const remove = document.getElementById('about-banner-remove');
  const picture = document.getElementById('about-banner-preview-image');
  const status = document.getElementById('about-banner-status');
  const fallback = '/front/images/main/6.png';
  let saved, token, objectUrl, dirty = false, busy = false;
  function message(text, error = false) {
    status.textContent = text;
    status.className = 'alert ' + (error ? 'alert-danger' : 'alert-info');
  }
  async function api(options) {
    const response = await fetch('/admin/api/about-banner', { credentials:'same-origin', cache:'no-store', ...options });
    if (response.status === 401 || response.status === 403 || response.redirected) throw new Error('로그인이 만료되었거나 권한이 없습니다. 관리자 로그인 후 다시 조회해 주세요.');
    if (!(response.headers.get('content-type') || '').includes('application/json')) throw new Error('서버 응답을 확인할 수 없습니다. 로그인 상태와 업로드 제한을 확인해 주세요.');
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || '처리하지 못했습니다. 입력 내용은 유지됩니다.');
    return data;
  }
  function preview() {
    document.getElementById('about-banner-preview-title').textContent = title.value;
    document.getElementById('about-banner-preview-body').textContent = body.value;
    picture.src = remove.checked ? fallback : (objectUrl || (saved && saved.imageUrl) || fallback);
  }
  function fill(banner) {
    saved = banner;
    title.value = banner.titleText;
    body.value = banner.bodyText;
    file.value = ''; remove.checked = false; remove.disabled = !banner.customImage;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    document.getElementById('about-banner-image-info').textContent = banner.customImage ? '현재 등록 이미지: ' + (banner.imageOriginalName || '등록 이미지') : '등록 이미지 없음: 기존 기본 이미지가 적용됩니다.';
    dirty = false; preview();
  }
  async function load() {
    if (busy) return;
    busy = true; fields.disabled = true; message('불러오는 중입니다.');
    try { const data = await api(); token = data.token; fill(data.banner); message('저장된 내용을 불러왔습니다.'); }
    catch (error) { message(error.message, true); }
    finally { busy = false; fields.disabled = !saved; }
  }
  title.addEventListener('input', () => { dirty = true; preview(); });
  body.addEventListener('input', () => { dirty = true; preview(); });
  file.addEventListener('change', () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    const selected = file.files[0];
    if (selected) {
      if (!['image/jpeg','image/png','image/webp'].includes(selected.type) || selected.size > 10 * 1024 * 1024) {
        file.value = ''; message('JPG·PNG·WEBP 이미지를 10MB 이하로 선택해 주세요.', true); preview(); return;
      }
      objectUrl = URL.createObjectURL(selected); remove.checked = false;
    }
    dirty = true; preview();
  });
  remove.addEventListener('change', () => {
    if (remove.checked) { file.value = ''; if (objectUrl) URL.revokeObjectURL(objectUrl); objectUrl = null; }
    dirty = true; preview();
  });
  picture.addEventListener('error', () => { if (picture.getAttribute('src') !== fallback) { picture.src = fallback; message('선택한 이미지를 표시할 수 없어 기본 이미지를 표시합니다.', true); } });
  document.getElementById('about-banner-reload').addEventListener('click', () => {
    if (!dirty || confirm('저장하지 않은 변경사항을 버리고 다시 조회하시겠습니까?')) load();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy || !saved) return;
    if (remove.checked && !confirm('등록 이미지를 삭제하고 기본 이미지로 변경하시겠습니까? 문구는 입력한 내용으로 저장됩니다.')) return;
    const data = new FormData(form);
    data.set('version', String(saved.version));
    data.set('removeImage', String(remove.checked));
    busy = true; fields.disabled = true; message('저장 중입니다.');
    try { fill(await api({method:'POST',headers:{'X-About-Banner-Token':token},body:data})); message('저장했습니다. 실제 about 페이지에 반영되었습니다.'); }
    catch (error) { message(error.message, true); }
    finally { busy = false; fields.disabled = false; }
  });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  load();
})();
