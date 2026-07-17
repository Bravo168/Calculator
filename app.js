const expressionEl = document.getElementById("expression");
const currentEl = document.getElementById("current");
const keysEl = document.querySelector(".keys");
const themeToggleEl = document.getElementById("themeToggle");

const THEMES = ["dark", "light", "retro", "neon", "ocean"];
const THEME_ICONS = { dark: "🌙", light: "☀️", retro: "🖥️", neon: "🌈", ocean: "🌊" };
const THEME_STORAGE_KEY = "calculator-theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggleEl.textContent = THEME_ICONS[theme];
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function cycleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const next = THEMES[(THEMES.indexOf(currentTheme) + 1) % THEMES.length];
  applyTheme(next);
}

const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
applyTheme(THEMES.includes(storedTheme) ? storedTheme : "dark");
themeToggleEl.addEventListener("click", cycleTheme);

let current = "0";
let previous = null;
let operator = null;
let justEvaluated = false;
let startFresh = false;

function formatNumber(value) {
  if (value === "Error") return value;
  const num = Number(value);
  if (!isFinite(num)) return "Error";

  let str = num.toString();
  if (str.length > 12) {
    str = num.toPrecision(10).replace(/\.?0+$/, "").replace(/\.?0+e/, "e");
  }
  if (str.includes("e")) return str;

  const isNegative = str.startsWith("-");
  const abs = isNegative ? str.slice(1) : str;
  const [intPart, fracPart] = abs.split(".");
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const endsWithDot = typeof value === "string" && value.endsWith(".");
  let result = groupedInt;
  if (fracPart !== undefined) result += "," + fracPart;
  else if (endsWithDot) result += ",";

  return (isNegative ? "-" : "") + result;
}

let baseFontSizePx = null;

function getBaseFontSizePx() {
  if (baseFontSizePx === null) {
    currentEl.style.fontSize = "";
    baseFontSizePx = parseFloat(getComputedStyle(currentEl).fontSize);
  }
  return baseFontSizePx;
}

function fitCurrentFont() {
  const base = getBaseFontSizePx();
  const minSize = base * 0.4;
  const parentStyle = getComputedStyle(currentEl.parentElement);
  const paddingX = parseFloat(parentStyle.paddingLeft) + parseFloat(parentStyle.paddingRight);
  const available = currentEl.parentElement.clientWidth - paddingX;

  let size = base;
  currentEl.style.fontSize = size + "px";
  while (currentEl.scrollWidth > available && size > minSize) {
    size -= 1;
    currentEl.style.fontSize = size + "px";
  }
}

function render() {
  currentEl.textContent = formatNumber(current);
  expressionEl.textContent = previous !== null && operator ? `${formatNumber(previous)} ${operator}` : "";
  fitCurrentFont();
}

window.addEventListener("resize", fitCurrentFont);

function inputDigit(digit) {
  if (justEvaluated || startFresh) {
    current = digit;
    justEvaluated = false;
    startFresh = false;
    return;
  }
  if (current === "0" && digit !== ".") current = digit;
  else current += digit;
}

function inputDecimal() {
  if (justEvaluated || startFresh) {
    current = "0.";
    justEvaluated = false;
    startFresh = false;
    return;
  }
  if (!current.includes(".")) current += ".";
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  justEvaluated = false;
  startFresh = false;
}

function negate() {
  if (current === "0") return;
  current = current.startsWith("-") ? current.slice(1) : `-${current}`;
}

function percent() {
  current = String(Number(current) / 100);
}

function compute(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function chooseOperator(op) {
  if (operator && previous !== null && !startFresh) {
    const result = compute(previous, Number(current), operator);
    previous = isNaN(result) ? "Error" : result;
    current = String(previous);
  } else if (previous === null) {
    previous = Number(current);
  }
  operator = op;
  justEvaluated = false;
  startFresh = true;
}

function equals() {
  if (operator === null || previous === null) return;
  const result = compute(Number(previous), Number(current), operator);
  current = isNaN(result) ? "Error" : String(result);
  previous = null;
  operator = null;
  justEvaluated = true;
}

keysEl.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { digit, op, action } = button.dataset;

  if (digit !== undefined) {
    inputDigit(digit);
  } else if (op) {
    chooseOperator(op);
  } else if (action === "decimal") {
    inputDecimal();
  } else if (action === "clear") {
    clearAll();
  } else if (action === "negate") {
    negate();
  } else if (action === "percent") {
    percent();
  } else if (action === "equals") {
    equals();
  }

  render();
});

const KEY_MAP = {
  "+": "+", "-": "−", "*": "×", "/": "÷",
};

window.addEventListener("keydown", (event) => {
  if (event.key >= "0" && event.key <= "9") {
    inputDigit(event.key);
  } else if (event.key === "." || event.key === ",") {
    inputDecimal();
  } else if (event.key in KEY_MAP) {
    chooseOperator(KEY_MAP[event.key]);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    equals();
  } else if (event.key === "Escape") {
    clearAll();
  } else if (event.key === "Backspace") {
    current = current.length > 1 ? current.slice(0, -1) : "0";
  } else {
    return;
  }
  render();
});

render();

const installBannerEl = document.getElementById("installBanner");
const installBtnEl = document.getElementById("installBtn");
const installBannerCloseEl = document.getElementById("installBannerClose");

let deferredInstallPrompt = null;

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function showInstallBanner() {
  if (isStandalone()) return;
  installBannerEl.hidden = false;
}

function hideInstallBanner() {
  installBannerEl.hidden = true;
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  showInstallBanner();
});

installBtnEl.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    alert("Aplikasi sudah terinstall atau belum siap.");
    return;
  }
  hideInstallBanner();
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;

  if (outcome === "accepted") {
    window.location.href = "https://calculator.com/";
  }
});

installBannerCloseEl.addEventListener("click", hideInstallBanner);

window.addEventListener("appinstalled", hideInstallBanner);

if ("serviceWorker" in navigator) {
  const updateBannerEl = document.getElementById("updateBanner");
  let waitingWorker = null;

  function showUpdateBanner(worker) {
    waitingWorker = worker;
    updateBannerEl.hidden = false;
  }

  updateBannerEl.addEventListener("click", () => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    updateBannerEl.hidden = true;
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js", { updateViaCache: "none" })
      .then((reg) => {
        if (reg.waiting && navigator.serviceWorker.controller) {
          showUpdateBanner(reg.waiting);
        }
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              showUpdateBanner(newWorker);
            }
          });
        });
        reg.update();
      })
      .catch(() => {});
  });

  let reloadedForUpdate = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadedForUpdate) return;
    reloadedForUpdate = true;
    window.location.reload();
  });
}
