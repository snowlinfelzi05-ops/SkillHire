let listeners = new Set();
let idCounter = 0;

const inferType = (message) => {
  const text = String(message).toLowerCase();
  if (/error|failed|fail|invalid|unable|required|must|please|select|password/i.test(text)) {
    return "error";
  }
  if (/success|hired|created|updated|deleted|payment|game|welcome|✅|🎉|✨/i.test(text)) {
    return "success";
  }
  return "info";
};

export const toast = (message, type) => {
  const id = ++idCounter;
  const payload = { id, message: String(message ?? ""), type: type || inferType(message) };
  listeners.forEach((listener) => listener(payload));
  setTimeout(() => dismiss(id), 4200);
  return id;
};

export const dismiss = (id) => {
  listeners.forEach((listener) => listener({ type: "dismiss", id }));
};

export const subscribeToast = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};