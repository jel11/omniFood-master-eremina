///////////////////////////////////////////////////////////
// Set current year
const yearEl = document.querySelector(".year");
const currentYear = new Date().getFullYear();
yearEl.textContent = currentYear;

///////////////////////////////////////////////////////////
// Make mobile navigation work

const btnNavEl = document.querySelector(".btn-mobile-nav");
const headerEl = document.querySelector(".header");

btnNavEl.addEventListener("click", function () {
  headerEl.classList.toggle("nav-open");
});

///////////////////////////////////////////////////////////
// Smooth scrolling animation

const allLinks = document.querySelectorAll("a:link");

allLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const href = link.getAttribute("href");

    // Scroll back to top
    if (href === "#")
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    // Scroll to other links
    if (href !== "#" && href.startsWith("#")) {
      const sectionEl = document.querySelector(href);
      sectionEl.scrollIntoView({ behavior: "smooth" });
    }

    // Close mobile navigation
    if (link.classList.contains("main-nav-link"))
      headerEl.classList.toggle("nav-open");
  });
});

///////////////////////////////////////////////////////////
// Sticky navigation

const sectionHeroEl = document.querySelector(".section-hero");

const obs = new IntersectionObserver(
  function (entries) {
    const ent = entries[0];

    if (ent.isIntersecting === false) {
      document.body.classList.add("sticky");
    }

    if (ent.isIntersecting === true) {
      document.body.classList.remove("sticky");
    }
  },
  {
    root: null,
    threshold: 0,
    rootMargin: "-80px",
  }
);
obs.observe(sectionHeroEl);

///////////////////////////////////////////////////////////
// Fixing flexbox gap property missing in some Safari versions
function checkFlexGap() {
  var flex = document.createElement("div");
  flex.style.display = "flex";
  flex.style.flexDirection = "column";
  flex.style.rowGap = "1px";

  flex.appendChild(document.createElement("div"));
  flex.appendChild(document.createElement("div"));

  document.body.appendChild(flex);
  var isSupported = flex.scrollHeight === 1;
  flex.parentNode.removeChild(flex);

  if (!isSupported) document.body.classList.add("no-flexbox-gap");
}
checkFlexGap();

///////////////////////////////////////////////////////////
// Service Worker — регистрация для PWA и офлайн-работы
// УП 09.02 — День 4

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js")
      .then(function (registration) {
        console.log("Service Worker зарегистрирован:", registration.scope);
      })
      .catch(function (error) {
        console.log("Ошибка регистрации Service Worker:", error);
      });
  });
}

///////////////////////////////////////////////////////////
// Оптимизация для медленных сетей
// УП 09.02 — День 4

if (navigator.connection) {
  const connection = navigator.connection;

  if (connection.saveData === true) {
    // Режим экономии трафика — скрываем галерею
    document.querySelectorAll(".gallery-item img").forEach((img) => {
      img.removeAttribute("src");
      img.setAttribute("alt", "Изображение скрыто в режиме экономии трафика");
    });
  }
}

///////////////////////////////////////////////////////////
// Real User Monitoring (RUM) — сбор метрик производительности
// УП 09.02 — День 5

const collectMetrics = () => {
  const metrics = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    connection: navigator.connection ? navigator.connection.effectiveType : "unknown",
    fcp: null,
    lcp: null,
    cls: 0,
    tbt: null,
  };

  // FCP — First Contentful Paint
  const fcpEntry = performance
    .getEntriesByType("paint")
    .find((e) => e.name === "first-contentful-paint");
  if (fcpEntry) metrics.fcp = Math.round(fcpEntry.startTime);

  // CLS — Cumulative Layout Shift
  let clsValue = 0;
  if ("PerformanceObserver" in window) {
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) clsValue += entry.value;
        }
        metrics.cls = Math.round(clsValue * 1000) / 1000;
      }).observe({ type: "layout-shift", buffered: true });
    } catch (e) {}

    // LCP — Largest Contentful Paint
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.lcp = Math.round(lastEntry.startTime);
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {}
  }

  // Выводим метрики в консоль для отчёта
  window.addEventListener("load", () => {
    setTimeout(() => {
      console.group("📊 RUM Метрики производительности — Omnifood");
      console.log("FCP (First Contentful Paint):", metrics.fcp ? metrics.fcp + "ms" : "н/д");
      console.log("LCP (Largest Contentful Paint):", metrics.lcp ? metrics.lcp + "ms" : "н/д");
      console.log("CLS (Cumulative Layout Shift):", metrics.cls);
      console.log("Тип соединения:", metrics.connection);
      console.log("Полные метрики:", metrics);
      console.groupEnd();
    }, 3000);
  });
};

collectMetrics();
