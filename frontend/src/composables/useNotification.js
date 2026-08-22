import { useUiStore } from '../stores/ui';

export function useNotification() {
  const uiStore = useUiStore();

  function notify(messageKey, type = 'success') {
    uiStore.pushToast(uiStore.t(messageKey), type);
  }

  function notifyRaw(message, type = 'success') {
    uiStore.pushToast(message, type);
  }

  return { notify, notifyRaw, toasts: uiStore.toasts };
}
