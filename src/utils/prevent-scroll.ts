// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = { 33: 1, 34: 1, 35: 1, 36: 1 };

function preventDefault(e: Event) {
  e.preventDefault();
}
function stopPropagation(e: Event) {
  e.stopPropagation();
  e.stopImmediatePropagation();
}

function stopPropagationForScrollKeys(e: KeyboardEvent) {
  if (keys[e.keyCode as keyof typeof keys]) {
    preventDefault(e);
    return false;
  }
}

function preventDefaultForScrollKeys(e: KeyboardEvent) {
  if (keys[e.keyCode as keyof typeof keys]) {
    preventDefault(e);
    return false;
  }
}
export function disableScroll(windowOnly?: boolean) {
  window.addEventListener("DOMMouseScroll", preventDefault, false); // older FF
  window.addEventListener("wheel", preventDefault, { passive: false }); // modern desktop
  window.addEventListener("touchmove", preventDefault, { passive: false }); // mobile
  window.addEventListener("keydown", preventDefaultForScrollKeys, false);
}

export function enableScroll(windowOnly?: boolean) {
  if (windowOnly) {
    document.removeEventListener("DOMMouseScroll", stopPropagation, false); // older FF
    document.removeEventListener("wheel", stopPropagation); // modern desktop
    document.removeEventListener("touchmove", stopPropagation); // mobile
    document.removeEventListener(
      "keydown",
      stopPropagationForScrollKeys,
      false
    );
  }

  window.removeEventListener("DOMMouseScroll", preventDefault, false);
  window.removeEventListener("wheel", preventDefault);
  window.removeEventListener("touchmove", preventDefault);
  window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
}
