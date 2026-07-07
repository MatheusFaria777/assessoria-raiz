let setToastFn = null

export function registerToast(fn) { setToastFn = fn }

export function toast(message, type = 'success') {
  if (setToastFn) setToastFn({ message, type, id: Date.now() })
}
