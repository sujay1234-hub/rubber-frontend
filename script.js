const API_URL = "http://127.0.0.1:5000/api/prices";
const HISTORY_URL = "http://127.0.0.1:5000/api/history";

const lastPrices = {}; // for arrow comparison
let chart; // chart.js instance

// ================= LOAD PRICES =================
async function loadPrices() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API request failed");

    const data = await res.json();
    if (!data || !data.shreepur) return;

    // ---- last updated time ----
    if (data.updatedAt) {
      const t = new Date(data.updatedAt);
      document.getElementById("updated-time").innerText =
        "Last updated: " + t.toLocaleString();
    }

    const setPrice = (id, value) => {
      const el = document.getElementById(id);
      const arrowEl = document.getElementById(id + "-arrow");
      if (!el) return;

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
    console.error("Failed to load prices:", err);
  }
}

// ================= DARK MODE =================
const darkToggle = document.getElementById("darkToggle");

if (localStorage.getItem("darkMode") === "on") {
  document.body.classList.add("dark");
}

darkToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark") ? "on" : "off"
  );
};

// ================= GRAPH MODAL =================
document.querySelectorAll(".city-card").forEach(card => {
  card.addEventListener("click", () => {
    const city = card.dataset.city;
    const type = card.dataset.type;
    openGraph(city, type);
  });
});

document.getElementById("closeModal").onclick = () => {
  document.getElementById("graphModal").classList.add("hidden");
};

async function openGraph(city, type) {
  try {
    const res = await fetch(`${HISTORY_URL}?city=${city}&type=${type}`);
    const history = await res.json();

    const labels = history.map(h =>
      new Date(h.date).toLocaleDateString()
    );
    const prices = history.map(h => h.price);

    document.getElementById("graphTitle").innerText =
      `${city.toUpperCase()} – ${type.toUpperCase()} Price History`;

    const ctx = document.getElementById("priceChart");

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
    console.error("Graph load failed", err);
  }
}

// ================= INIT =================
loadPrices();
setInterval(loadPrices, 60000);
