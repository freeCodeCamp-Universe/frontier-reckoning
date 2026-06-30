export const focusableSelector =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

type FocusTrapEvent = {
  shiftKey: boolean;
  preventDefault: () => void;
};

export function supportsNativeModalDialog() {
  return (
    typeof HTMLDialogElement !== 'undefined' &&
    typeof HTMLDialogElement.prototype.showModal === 'function'
  );
}

export function openModalDialog(dialog: HTMLDialogElement) {
  if (!supportsNativeModalDialog() || dialog.open) {
    return;
  }

  dialog.showModal();
}

export function closeModalDialog(dialog: HTMLDialogElement) {
  if (!supportsNativeModalDialog() || !dialog.open) {
    return;
  }

  dialog.close();
}

export function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) =>
      !element.hasAttribute('disabled') && !element.hasAttribute('aria-hidden'),
  );
}

export function trapFocus(event: FocusTrapEvent, container: HTMLElement) {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (!firstElement || !lastElement) {
    event.preventDefault();
    container.focus();
    return;
  }

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}
