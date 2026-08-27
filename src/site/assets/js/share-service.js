export function buildShareText({ text = '', url = '' } = {}) {
  return [String(text).trim(), String(url).trim()].filter(Boolean).join('\n\n');
}

function canUseNativeShare(shareData) {
  if (typeof navigator.share !== 'function') return false;
  return typeof navigator.canShare !== 'function' || navigator.canShare(shareData);
}

async function copyWithClipboard(text) {
  if (!window.isSecureContext || !navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function copyWithSelection(text) {
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.setAttribute('aria-hidden', 'true');
  field.style.position = 'fixed';
  field.style.inset = '-9999px auto auto -9999px';
  document.body.append(field);
  field.focus();
  field.select();
  field.setSelectionRange(0, field.value.length);
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  field.remove();
  return copied;
}

export async function shareOrCopy(shareData) {
  const normalizedData = {
    title: String(shareData?.title || '').trim(),
    text: String(shareData?.text || '').trim(),
    url: String(shareData?.url || location.href).trim()
  };

  if (canUseNativeShare(normalizedData)) {
    try {
      await navigator.share(normalizedData);
      return { ok: true, method: 'shared' };
    } catch (error) {
      if (error?.name === 'AbortError') return { ok: false, method: 'cancelled' };
    }
  }

  const copyText = buildShareText(normalizedData);
  if (await copyWithClipboard(copyText) || copyWithSelection(copyText)) {
    return { ok: true, method: 'copied' };
  }

  window.prompt('아래 내용을 복사해 원하는 곳에 붙여넣으세요.', copyText);
  return { ok: false, method: 'manual' };
}

