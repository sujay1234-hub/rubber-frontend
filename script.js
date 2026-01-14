const BASE_URL = "https://rubber-backend.onrender.com";
const API_URL = `${BASE_URL}/api/prices`;
const HISTORY_URL = `${BASE_URL}/api/history`;

let pricesData = {};
let chart;

// ELEMENTS
const pricesSection = document.getElementById("pricesSection");
const calculatorSection = document.getElementById("calculatorSection");

const calcCity = document.getElementById("calc-city");
const calcType = document.getElementById("calc-type");
const calcKg = document.getElementById("calc-kg");
const calcResult = document.getElementById("calc-result");

const graphModal = document.getElementById("graphModal");
const closeModal = document.getElementById("closeModal");
const graphTitle = document.getElementById("graphTitle");
const priceChart = document.getElementById("priceChart");

// LOAD PRICES
async function loadPrices() {
  const res = await fetch(API_URL);
  const data = await res.json();
  pricesData = data;

  document.getElementById("updated-time").innerText =
    "Last updated: " + new Date(data.updatedAt).toLocaleString();

  for (let city in data) {
    if (data[city].sundry !== undefined) {
      document.getElementById(`${city}-sundry`).innerText = data[city].sundry;
      document.getElementById(`${city}-smoke`).innerText = data[city].smoke;
    }
  }
}

// CALCULATOR
function calculateAmount() {
  const city = calcCity.value;
  const type = calcType.value;
  const kg = Number(calcKg.value);

  if (!kg || kg <= 0) {
    calcResult.innerText = "❌ Enter valid KG";
    return;
  }

  const total = pricesData[city][type] * kg;
  calcResult.innerText = `💰 Total Amount: ₹ ${total.toLocaleString()}`;
}

// SECTION SWITCH
function showSection(section) {
  pricesSection.classList.add("hidden");
  calculatorSection.classList.add("hidden");

  document.querySelectorAll(".nav-btn")
    .forEach(btn => btn.classList.remove("active"));

  if (section === "prices") {
    pricesSection.classList.remove("hidden");
    document.querySelectorAll(".nav-btn")[0].classList.add("active");
  } else {
    calculatorSection.classList.remove("hidden");
    document.querySelectorAll(".nav-btn")[1].classList.add("active");
  }
}

// GRAPH CLICK
document.querySelectorAll(".city-card").forEach(card => {
  card.addEventListener("click", () => {
    openGraph(card.dataset.city, card.dataset.type);
  });
});

closeModal.onclick = () => graphModal.classList.add("hidden");

// GRAPH
async function openGraph(city, type) {
  const res = await fetch(`${HISTORY_URL}?city=${city}&type=${type}`);
  const history = await res.json();

  graphTitle.innerText =
    `${city.toUpperCase()} – ${type.toUpperCase()} Price History`;

  const labels = history.map(h =>
    new Date(h.date).toLocaleDateString()
  );

  const values = history.map(h => h.price);

  if (chart) chart.destroy();

  chart = new Chart(priceChart, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: "#16a34a",
        backgroundColor: "rgba(22,163,74,0.25)",
        fill: true,
        tension: 0.35
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      }
    }
  });

  graphModal.classList.remove("hidden");
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  showSection("prices");
  loadPrices();
  setInterval(loadPrices, 60000);
});
