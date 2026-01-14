// ================= API CONFIG =================
const BASE_URL = "https://rubber-backend.onrender.com";
const API_URL = `${BASE_URL}/api/prices`;
const HISTORY_URL = `${BASE_URL}/api/history`;

const lastPrices = {};
let chart = null;

// ================= LOAD PRICES =================
async function loadPrices() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API request failed");

    const data = await res.json();
    if (!data || !data.shreepur) return;

    // ---- last updated time ----
    const updatedEl = document.getElementById("updated-time");
    if (updatedEl && data.updatedAt) {
      updatedEl.innerText =
        "Last updated: " + new Date(data.updatedAt).toLocaleString();
    }

    const setPrice = (id, value) => {
      const el = document.getElementById(id);
      const arrowEl = document.getElementById(id + "-arrow");
      if (!el || value === undefined || value === null) return;

      // arrow logic
      if (lastPrices[id] !== undefined && arrowEl) {
        if (value > lastPrices[id]) {
          arrowEl.innerText = "↑";
          arrowEl.className = "arrow up";
        } else if (value < lastPrices[id]) {
          arrowEl.innerText = "↓";
          arrowEl.className = "arrow down";
        } else {
          arrowEl.innerText = "";
        }
      }

      lastPrices[id] = value;
      el.innerText = value;
      el.classList.remove("loading");
    };

    // -------- Sundry --------
    setPrice("shreepur-sundry", data.shreepur.sundry);
    setPrice("fatikroy-sundry", data.fatikroy.sundry);
    setPrice("sarda-sundry", data.sarda.sundry);
    setPrice("kumarghat-sundry", data.kumarghat.sundry);
    setPrice("kanchanbari-sundry", data.kanchanbari.sundry);

    // -------- Smoke --------
    setPrice("shreepur-smoke", data.shreepur.smoke);
    setPrice("fatikroy-smoke", data.fatikroy.smoke);
    setPrice("sarda-smoke", data.sarda.smoke);
    setPrice("kumarghat-smoke", data.kumarghat.smoke);
    setPrice("kanchanbari-smoke", data.kanchanbari.smoke);

  } catch (err) {
    console.error("❌ Failed to load prices:", err);
  }
}

// ================= DARK MODE =================
document.addEventListener("DOMContentLoaded", () => {
  const darkToggle = document.getElementById("darkToggle");

  if (localStorage.getItem("darkMode") === "on") {
    document.body.classList.add("dark");
  }

  if (darkToggle) {
    darkToggle.onclick = () => {
      document.body.classList.toggle("dark");
      localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark") ? "on" : "off"
      );
    };
  }
});

// ================= GRAPH MODAL =================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".city-card").forEach(card => {
    card.addEventListener("click", () => {
      openGraph(card.dataset.city, card.dataset.type);
    });
  });

  const closeBtn = document.getElementById("closeModal");
  if (closeBtn) {
    closeBtn.onclick = () => {
      document.getElementById("graphModal")?.classList.add("hidden");
    };
  }
});

async function openGraph(city, type) {
  try {
    const res = await fetch(`${HISTORY_URL}?city=${city}&type=${type}`);
    if (!res.ok) throw new Error("History API failed");

    const history = await res.json();
    if (!Array.isArray(history)) return;

    const labels = history.map(h =>
      new Date(h.date).toLocaleDateString()
    );
    const prices = history.map(h => h.price);

    document.getElementById("graphTitle").innerText =
      `${city.toUpperCase()} – ${type.toUpperCase()} Price History`;

    const ctx = document.getElementById("priceChart");
    if (!ctx) return;

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Price (₹)",
          data: prices,
          borderColor: "#43a047",
          backgroundColor: "rgba(67,160,71,0.2)",
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });

    document.getElementById("graphModal").classList.remove("hidden");

  } catch (err) {
    console.error("❌ Graph load failed:", err);
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  loadPrices();
  setInterval(loadPrices, 60000);
});
