(function () {
  "use strict";
  const o = {
      WIDGET_URL: "https://sure-ai-widget.vercel.app",
      DEFAULT_POSITION: "bottom-right",
    },
    b = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`,
    p = `<svg data-logo="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 41">
        <g id="logogram" transform="translate(0, 0) rotate(0) "><path d="M20 0.889954C31.0457 0.889954 40 9.84426 40 20.89V34.89C40 38.2037 37.3137 40.89 34 40.89H21V32.1161C21 30.114 21.1224 28.0404 22.1725 26.3357C23.6625 23.9168 26.1515 22.1871 29.0764 21.7093L29.4595 21.6467C29.7828 21.5358 30 21.2318 30 20.89C30 20.5481 29.7828 20.2441 29.4595 20.1332L29.0764 20.0706C24.836 19.378 21.512 16.054 20.8193 11.8135L20.7568 11.4305C20.6459 11.1071 20.3418 10.89 20 10.89C19.6582 10.89 19.3541 11.1071 19.2432 11.4305L19.1807 11.8135C18.7029 14.7385 16.9731 17.2274 14.5542 18.7175C12.8496 19.7676 10.7759 19.89 8.77382 19.89H0.0245667C0.545597 9.30884 9.28963 0.889954 20 0.889954Z" fill="#9A83D0"/><path d="M0 21.89H8.77382C10.7759 21.89 12.8495 22.0123 14.5541 23.0624C15.8852 23.8823 17.0076 25.0047 17.8276 26.3358C18.8776 28.0405 19 30.114 19 32.1161V40.89H6C2.68629 40.89 0 38.2037 0 34.89V21.89Z" fill="#625DA5"/></g>
        <g id="logotype" transform="translate(40, 20.5)"></g>
        
      </svg>`;
  (function () {
    let n = null,
      t = null,
      e = null,
      l = !1,
      r = null,
      a = o.DEFAULT_POSITION;
    const c = document.currentScript;
    if (c)
      ((r = c.getAttribute("data-agent-id")),
        (a = c.getAttribute("data-position") || o.DEFAULT_POSITION));
    else {
      const i = document.querySelectorAll('script[src*="embed"]'),
        s = Array.from(i).find((d) => d.hasAttribute("data-agent-id"));
      s &&
        ((r = s.getAttribute("data-agent-id")),
        (a = s.getAttribute("data-position") || o.DEFAULT_POSITION));
    }
    if (!r) {
      console.error("Sure Widget: data-agent-id attribute is required");
      return;
    }
    function f() {
      document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", g)
        : g();
    }
    function g() {
      ((e = document.createElement("button")),
        (e.id = "sure-widget-button"),
        (e.innerHTML = p),
        (e.style.cssText = `
      position: fixed;
      ${a === "bottom-right" ? "right: 20px;" : "left: 20px;"}
      bottom: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #ffffff;
      color: white;
      border: none;
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(59, 130, 246, 0.35);
      transition: all 0.2s ease;
    `),
        e.addEventListener("click", w),
        e.addEventListener("mouseenter", () => {
          e && (e.style.transform = "scale(1.05)");
        }),
        e.addEventListener("mouseleave", () => {
          e && (e.style.transform = "scale(1)");
        }),
        document.body.appendChild(e),
        (t = document.createElement("div")),
        (t.id = "sure-widget-container"),
        (t.style.cssText = `
      position: fixed;
      ${a === "bottom-right" ? "right: 20px;" : "left: 20px;"}
      bottom: 90px;
      width: 400px;
      height: 600px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 110px);
      z-index: 999998;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      display: none;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `),
        (n = document.createElement("iframe")),
        (n.src = y()),
        (n.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `),
        (n.allow = "microphone; clipboard-read; clipboard-write"),
        t.appendChild(n),
        document.body.appendChild(t),
        window.addEventListener("message", h));
    }
    function y() {
      const i = new URLSearchParams();
      return (i.append("agentId", r), `${o.WIDGET_URL}?${i.toString()}`);
    }
    function h(i) {
      if (i.origin !== new URL(o.WIDGET_URL).origin) return;
      const { type: s, payload: d } = i.data;
      switch (s) {
        case "close":
          u();
          break;
        case "resize":
          d.height && t && (t.style.height = `${d.height}px`);
          break;
      }
    }
    function w() {
      l ? u() : m();
    }
    function m() {
      t &&
        e &&
        ((l = !0),
        (t.style.display = "block"),
        setTimeout(() => {
          t && ((t.style.opacity = "1"), (t.style.transform = "translateY(0)"));
        }, 10),
        (e.innerHTML = b));
    }
    function u() {
      t &&
        e &&
        ((l = !1),
        (t.style.opacity = "0"),
        (t.style.transform = "translateY(10px)"),
        setTimeout(() => {
          t && (t.style.display = "none");
        }, 300),
        (e.innerHTML = p),
        (e.style.background = "#ffffff"));
    }
    function x() {
      (window.removeEventListener("message", h),
        t && (t.remove(), (t = null), (n = null)),
        e && (e.remove(), (e = null)),
        (l = !1));
    }
    function L(i) {
      (x(), i.agentId && (r = i.agentId), i.position && (a = i.position), f());
    }
    ((window.SureWidget = { init: L, show: m, hide: u, destroy: x }), f());
  })();
})();
