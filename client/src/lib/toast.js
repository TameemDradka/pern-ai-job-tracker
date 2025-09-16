// Tiny dependency-free toast helper using plain DOM + Tailwind classes
// Usage: showToast({ type: 'success'|'error', message: string })

let container = null;

function ensureContainer() {
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-root";
    container.className = "fixed top-4 right-4 z-[9999] flex flex-col gap-2";
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a toast message.
 * @param {{ type?: 'success'|'error', message: string, duration?: number }} opts
 */
export function showToast(opts) {
  const { type = "success", message = "", duration = 3000 } = opts || {};
  if (!message) return;

  const root = ensureContainer();

  const item = document.createElement("div");
  const base =
    "pointer-events-auto w-80 max-w-[90vw] rounded-lg shadow ring-1 ring-black/5 px-4 py-3 flex items-start gap-3";
  const color =
    type === "error"
      ? "bg-rose-50 text-rose-900 ring-rose-200"
      : "bg-emerald-50 text-emerald-900 ring-emerald-200";

  item.className = `${base} ${color}`;
  item.setAttribute("role", "status");

  const icon = document.createElement("span");
  icon.className = `mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full ${
    type === "error"
      ? "bg-rose-200 text-rose-800"
      : "bg-emerald-200 text-emerald-800"
  }`;
  icon.textContent = type === "error" ? "!" : "✓";

  const text = document.createElement("div");
  text.className = "text-sm";
  text.textContent = message;

  const closeBtn = document.createElement("button");
  closeBtn.className = "ml-auto text-sm text-gray-500 hover:text-gray-700";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "×";

  const remove = () => {
    if (!item) return;
    item.style.opacity = "0";
    item.style.transform = "translateY(-4px)";
    setTimeout(() => {
      if (item && item.parentNode) item.parentNode.removeChild(item);
      if (root && root.childElementCount === 0 && root.parentNode) {
        root.parentNode.removeChild(root);
        container = null;
      }
    }, 150);
  };

  closeBtn.addEventListener("click", remove);

  item.appendChild(icon);
  item.appendChild(text);
  item.appendChild(closeBtn);

  item.style.transition = "opacity 150ms ease, transform 150ms ease";
  item.style.opacity = "0";
  item.style.transform = "translateY(-4px)";

  root.appendChild(item);

  // animate in next frame
  requestAnimationFrame(() => {
    item.style.opacity = "1";
    item.style.transform = "translateY(0)";
  });

  if (duration > 0) {
    setTimeout(remove, duration);
  }

  return remove;
}

export default showToast;
