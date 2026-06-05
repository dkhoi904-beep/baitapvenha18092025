// =========================================================================
// 1. KHỞI TẠO ERA WIDGET SDK & BIẾN TOÀN CỤC
// =========================================================================
const eraWidget = new EraWidget();
let eraActions = []; // Mảng lưu trữ các lệnh Action từ Cloud

// =========================================================================
// 2. LẮNG NGHE DỮ LIỆU TỪ CLOUD E-RA (ĐỌC THEO VIRTUAL PIN)
// =========================================================================
eraWidget.onConfiguration((configuration) => {
  // Lấy danh sách action để điều khiển thiết bị
  eraActions = configuration.actions || [];
});

eraWidget.onValues((values) => {
  // --- A. Cập nhật Cảm biến Môi trường ---
  // V0: Nhiệt độ
  if (values["V0"]) {
    const tempVal = parseFloat(values["V0"].value).toFixed(1);
    updateTempGauge(tempVal);
    updateChart(null, parseFloat(tempVal)); // Cập nhật đồ thị
  }

  // V1: Độ ẩm không khí
  if (values["V1"]) {
    const humidVal = parseFloat(values["V1"].value).toFixed(1);
    updateHumidGauge(humidVal);
    updateChart(parseFloat(humidVal), null);
  }

  // V4: Ánh sáng BH1750 (Làm tròn thành số nguyên)
  if (values["V4"]) {
    const luxVal = Math.round(values["V4"].value);
    const luxEl = document.getElementById("valLux");
    if (luxEl) luxEl.textContent = luxVal + " lx";
  }

  // Cập nhật Đất và Nước (Giả sử bạn sẽ cài đặt V6 cho Đất và V7 cho Nước trên E-Ra)
  const soilEl = document.getElementById("soilStatus");
  if (soilEl) {
    const soilVal = values["V6"] ? Math.round(values["V6"].value) : "--";
    const waterVal = values["V7"] ? Math.round(values["V7"].value) : "--";
    soilEl.textContent = `Đất: ${soilVal} | Nước: ${waterVal}`;
  }

  // --- B. Đồng bộ trạng thái Giao diện Điều khiển (Phản hồi 2 chiều) ---
  // V2: Quạt thông gió
  if (values["V2"]) {
    isFanOn = parseInt(values["V2"].value) === 1;
    if (isFanOn) {
      fanIcon.classList.add("active");
      fanStatus.textContent = "ON";
    } else {
      fanIcon.classList.remove("active");
      fanStatus.textContent = "OFF";
    }
  }

  // V3: Máy bơm nước
  if (values["V3"]) {
    const pumpState = parseInt(values["V3"].value);
    pumpSlider.value = pumpState;
    pumpValue.textContent = pumpState === 1 ? "BẬT" : "TẮT";
    sliderFill.style.width = pumpState === 1 ? "100%" : "0%";
  }

  // V5: Chế độ Hệ thống (Auto Mode)
  if (values["V5"]) {
    const modeState = parseInt(values["V5"].value);
    modeSlider.value = modeState;
    modeStatus.textContent = modeState === 1 ? "TỰ ĐỘNG" : "BẰNG TAY";
    sliderFillMode.style.width = modeState === 1 ? "100%" : "0%";
  }
});

// Yêu cầu SDK bắt đầu kết nối
eraWidget.init();

// =========================================================================
// 3. XỬ LÝ SỰ KIỆN NÚT NHẤN & THANH GẠT TRÊN GIAO DIỆN
// =========================================================================

// --- Hàm hỗ trợ gửi lệnh an toàn lên E-Ra ---
function triggerEraAction(index) {
  if (eraActions[index]) {
    eraWidget.triggerAction(eraActions[index].actionCode || eraActions[index].action, null);
  }
}

// --- Widget Quạt Thông Gió ---
const fanIcon = document.getElementById("fanIcon");
const fanStatus = document.getElementById("fanStatus");
let isFanOn = false;

fanIcon.addEventListener("click", () => {
  isFanOn = !isFanOn;
  if (isFanOn) {
    fanIcon.classList.add("active");
    fanStatus.textContent = "ON";
    triggerEraAction(0); // Action vị trí 0: Bật Quạt
  } else {
    fanIcon.classList.remove("active");
    fanStatus.textContent = "OFF";
    triggerEraAction(1); // Action vị trí 1: Tắt Quạt
  }
});

// --- Widget Máy Bơm Nước ---
const pumpSlider = document.getElementById("pumpSlider");
const pumpValue = document.getElementById("pumpValue");
const sliderFill = document.querySelector(".slider-fill");

pumpSlider.addEventListener("input", function () {
  const val = parseInt(this.value);
  if (val === 1) {
    sliderFill.style.width = "100%";
    pumpValue.textContent = "BẬT";
    triggerEraAction(2); // Action vị trí 2: Bật Bơm
  } else {
    sliderFill.style.width = "0%";
    pumpValue.textContent = "TẮT";
    triggerEraAction(3); // Action vị trí 3: Tắt Bơm
  }
});

// --- Widget Chế Độ Hệ Thống ---
const modeSlider = document.getElementById("modeSlider");
const modeStatus = document.getElementById("modeStatus");
const sliderFillMode = document.querySelector(".slider-fill-livingRoom");

modeSlider.addEventListener("input", function () {
  const val = parseInt(this.value);
  if (val === 1) {
    sliderFillMode.style.width = "100%";
    modeStatus.textContent = "TỰ ĐỘNG";
    triggerEraAction(4); // Action vị trí 4: Bật Auto
  } else {
    sliderFillMode.style.width = "0%";
    modeStatus.textContent = "BẰNG TAY";
    triggerEraAction(5); // Action vị trí 5: Tắt Auto
  }
});

// =========================================================================
// 4. LOGIC CHUYỂN TAB ẨN/HIỆN PHÂN KHU WIDGET
// =========================================================================
const navLinks = document.querySelectorAll('.nav a');
const allWidgets = document.querySelectorAll('.widgets .widget');

navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('.nav a.active').classList.remove('active');
    this.classList.add('active');
    
    const tabName = this.textContent.trim();
    
    allWidgets.forEach(widget => {
      if (tabName === "TRẠM TỔNG") {
        widget.style.display = 'block';
      } else if (tabName === "KHU TRỒNG TRỌT") {
        if (widget.classList.contains('temp-widget') || widget.classList.contains('humidifier-widget') || widget.innerHTML.includes('BH1750')) {
          widget.style.display = 'block';
        } else {
          widget.style.display = 'none';
        }
      } else if (tabName === "HỆ THỐNG TƯỚI") {
        if (widget.classList.contains('apple-style') || widget.classList.contains('bedLight-widget') || widget.classList.contains('chart-container')) {
          widget.style.display = 'block';
        } else {
          widget.style.display = 'none';
        }
      } else if (tabName === "CẤU HÌNH HỆ THỐNG") {
        if (widget.classList.contains('livingRoom-widget')) {
          widget.style.display = 'block';
        } else {
          widget.style.display = 'none';
        }
      }
    });
  });
});

// =========================================================================
// 5. KHỞI TẠO VÀ XỬ LÝ ĐỒ THỊ THỜI GIAN THỰC (REALTIME CHART)
// =========================================================================
let myChart;
let chartData = [];
const maxDataPoints = 20;
let allChartData = [];

function initChart() {
  const ctx = document.getElementById("dataChart");
  if (!ctx) return;
  myChart = new Chart(ctx.getContext("2d"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "Độ ẩm (%)", data: [], borderColor: "#FF5500", backgroundColor: "rgba(255,85,0,0.1)", tension: 0.4, borderWidth: 2, spanGaps: true },
        { label: "Nhiệt độ (°C)", data: [], borderColor: "#2196F3", backgroundColor: "rgba(33,150,243,0.1)", tension: 0.4, borderWidth: 2, spanGaps: true },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#fff", font: { size: 12 } } } },
      scales: {
        x: { grid: { color: "rgba(255,255,255,0.1)" }, ticks: { color: "#fff", size: 10 } },
        y: { grid: { color: "rgba(255,255,255,0.1)" }, ticks: { color: "#fff", font: { size: 11 } } },
      },
    },
  });
}

// Biến lưu trữ giá trị gần nhất để đồ thị không bị gãy nét
let lastHumid = null;
let lastTemp = null;

function updateChart(humidVal, tempVal) {
  if (!myChart) return;
  
  if (humidVal !== null) lastHumid = humidVal;
  if (tempVal !== null) lastTemp = tempVal;

  const now = new Date();
  const timeLabel = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  const newData = { time: timeLabel, humidifier: lastHumid, temp: lastTemp, timestamp: now.getTime() };

  chartData.push(newData);
  allChartData.push(newData);

  if (chartData.length > maxDataPoints) chartData.shift();

  myChart.data.labels = chartData.map((item) => item.time);
  myChart.data.datasets[0].data = chartData.map((item) => item.humidifier);
  myChart.data.datasets[1].data = chartData.map((item) => item.temp);
  myChart.update();
}

function updateTempGauge(newVal) {
  const gauge = document.getElementById("gaugeTemp");
  if (gauge) {
    gauge.style.setProperty("--value", Math.round(newVal));
    document.getElementById("valTemp").textContent = newVal + "°C";
    const boxTemp = document.getElementById("weatherBoxTemp");
    if(boxTemp) boxTemp.textContent = newVal + "°C";
  }
}

function updateHumidGauge(newVal) {
  const gauge = document.getElementById("gaugeHumid");
  if (gauge) {
    gauge.style.setProperty("--value", Math.round(newVal));
    document.getElementById("valHumid").textContent = newVal + "%";
  }
}

// Xử lý nút xem lịch sử Modal
document.querySelectorAll(".time-range").forEach((button) => {
  button.addEventListener("click", function () {
    document.querySelectorAll(".time-range").forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");

    const minutes = parseInt(this.dataset.minutes);
    if (minutes !== 0) {
      showStatsModal(minutes);
    }
  });
});

function showStatsModal(minutes) {
  const modal = document.getElementById("statsModal");
  if (!modal) return;
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  const filteredData = allChartData.filter((item) => new Date(item.timestamp) >= cutoffTime);

  const tableBody = document.getElementById("statsTableBody");
  tableBody.innerHTML = filteredData
    .map((item) => `<tr><td>${item.time}</td><td>${item.humidifier || "--"}</td><td>${item.temp || "--"}</td></tr>`)
    .join("");

  modal.style.display = "block";
  document.querySelector(".close").onclick = () => (modal.style.display = "none");
}

document.addEventListener("DOMContentLoaded", () => {
  initChart();
});

// =========================================================================
// 6. TÍNH NĂNG TOÀN MÀN HÌNH (FULLSCREEN FEATURE)
// =========================================================================
const fullscreenButton = document.createElement("button");
fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
fullscreenButton.className = "fullscreen-button";
document.body.appendChild(fullscreenButton);

let isFullscreen = false;
fullscreenButton.addEventListener("click", () => {
  if (!isFullscreen) {
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
  }
  isFullscreen = !isFullscreen;
});
