// =========================================================================
// 1. KHỞI TẠO ĐỐI TƯỢNG VÀ THIẾT LẬP WIDGET ĐIỀU KHIỂN GIAO DIỆN
// =========================================================================

// Định nghĩa chính xác tên các Virtual Pin từ cấu hình E-Ra
const VPIN_TEMP  = 'V0';
const VPIN_HUMID = 'V1';
const VPIN_FAN   = 'V2';
const VPIN_PUMP  = 'V3';
const VPIN_LUX   = 'V4';
const VPIN_AUTO  = 'V5';
// Giả định 2 chân Analog của bạn gửi về (Bạn kiểm tra lại trên ESP32 xem gửi về chân V nào nhé, ở đây mình tạm ví dụ V6 và V7)
const VPIN_SOIL  = 'V6'; 
const VPIN_WATER = 'V7';

const eraWidget = new EraWidget();
let config = null;

// --- Widget Quạt Thông Gió ---
const fanIcon = document.getElementById("fanIcon");
const fanStatus = document.getElementById("fanStatus");

fanIcon.addEventListener("click", () => {
  const currentStatus = fanStatus.textContent.trim();
  const nextState = (currentStatus === "OFF" || currentStatus === "TẮT") ? 1 : 0;
  
  // Kích hoạt Action dựa trên vị trí cấu hình 0 (ON) và 1 (OFF)
  if (config && config.actions) {
    const actionIndex = (nextState === 1) ? 0 : 1;
    if (config.actions[actionIndex]) {
        eraWidget.triggerAction(config.actions[actionIndex].actionCode || config.actions[actionIndex].action, null);
    }
  }
});

// --- Widget Máy Bơm Nước Slider ---
const pumpSlider = document.getElementById("pumpSlider");
const pumpValue = document.getElementById("pumpValue");
const sliderFill = document.querySelector(".slider-fill");

pumpSlider.addEventListener("input", function () {
  const val = parseInt(this.value);
  if (config && config.actions) {
    const actionIndex = (val === 1) ? 2 : 3; // Vị trí 2: ON Pump, Vị trí 3: OFF Pump
    if (config.actions[actionIndex]) {
        eraWidget.triggerAction(config.actions[actionIndex].actionCode || config.actions[actionIndex].action, null);
    }
  }
});

// --- Widget Chế Độ Hệ Thống Slider ---
const modeSlider = document.getElementById("modeSlider");
const modeStatus = document.getElementById("modeStatus");
const sliderFillMode = document.querySelector(".slider-fill-livingRoom");

modeSlider.addEventListener("input", function () {
  const val = parseInt(this.value);
  if (config && config.actions) {
    const actionIndex = (val === 1) ? 4 : 5; // Vị trí 4: ON Auto, Vị trí 5: OFF Auto
    if (config.actions[actionIndex]) {
        eraWidget.triggerAction(config.actions[actionIndex].actionCode || config.actions[actionIndex].action, null);
    }
  }
});

// =========================================================================
// 2. KHỞI TẠO VÀ XỬ LÝ ĐỒ THỊ THỜI GIAN THỰC (REALTIME CHART)
// =========================================================================
let myChart;
const maxDataPoints = 20;
let allChartData = [];

function initChart() {
  const ctx = document.getElementById("dataChart").getContext("2d");
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Độ ẩm (%)",
          data: [],
          borderColor: "#FF5500",
          backgroundColor: "rgba(255,85,0,0.1)",
          tension: 0.4,
          borderWidth: 2,
          spanGaps: true,
        },
        {
          label: "Nhiệt độ (°C)",
          data: [],
          borderColor: "#2196F3",
          backgroundColor: "rgba(33,150,243,0.1)",
          tension: 0.4,
          borderWidth: 2,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#fff", font: { size: 12 } } } },
      scales: {
        x: { grid: { color: "rgba(255,255,255,0.1)" }, ticks: { color: "#fff", size: 10 } },
        y: { grid: { color: "rgba(255,255,255,0.1)" }, ticks: { color: "#fff", font: { size: 11 } } },
      },
    },
  });
}

function updateChart(humidVal, tempVal) {
  if (!myChart) return;
  const now = new Date();
  const timestamp = now.getTime();
  const timeLabel = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

  const newData = {
    time: timeLabel,
    humidifier: typeof humidVal === "number" ? humidVal : NaN,
    temp: typeof tempVal === "number" ? tempVal : NaN,
    timestamp: timestamp,
  };

  allChartData.push(newData);

  // Cập nhật mảng hiển thị trực tiếp trên đồ thị
  myChart.data.labels.push(timeLabel);
  myChart.data.datasets[0].data.push(newData.humidifier);
  myChart.data.datasets[1].data.push(newData.temp);

  if (myChart.data.labels.length > maxDataPoints) {
    myChart.data.labels.shift();
    myChart.data.datasets[0].data.shift();
    myChart.data.datasets[1].data.shift();
  }
  myChart.update();
}

// Các hàm cập nhật giao diện trực quan và SỬA LỖI LÀM TRÒN SỐ (.toFixed)
function updateTempGauge(newVal) {
  const gauge = document.getElementById("gaugeTemp");
  const fixedVal = parseFloat(newVal).toFixed(1); // Ép gọn số thực quá dài
  if (gauge) {
    gauge.style.setProperty("--value", Math.round(newVal));
    document.getElementById("valTemp").textContent = fixedVal + "°C";
    document.getElementById("weatherBoxTemp").textContent = fixedVal + "°C";
  }
}

function updateHumidGauge(newVal) {
  const gauge = document.getElementById("gaugeHumid");
  const fixedVal = parseFloat(newVal).toFixed(1); // Sửa lỗi hiển thị 69.400002%
  if (gauge) {
    gauge.style.setProperty("--value", Math.round(newVal));
    document.getElementById("valHumid").textContent = fixedVal + "%";
  }
}

// Xử lý bộ lọc xem lịch sử
document.querySelectorAll(".time-range").forEach((button) => {
  button.addEventListener("click", function () {
    document.querySelectorAll(".time-range").forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");

    const minutes = parseInt(this.dataset.minutes);
    if (minutes !== 0) showStatsModal(minutes);
  });
});

function showStatsModal(minutes) {
  const modal = document.getElementById("statsModal");
  const cutoffTime = Date.now() - minutes * 60 * 1000;
  const filteredData = allChartData.filter((item) => item.timestamp >= cutoffTime);

  const tableBody = document.getElementById("statsTableBody");
  tableBody.innerHTML = filteredData
    .map((item) => `<tr><td>${item.time}</td><td>${isNaN(item.humidifier) ? '--' : item.humidifier}</td><td>${isNaN(item.temp) ? '--' : item.temp}</td></tr>`)
    .join("");

  modal.style.display = "block";
  document.querySelector(".close").onclick = () => (modal.style.display = "none");
}

document.addEventListener("DOMContentLoaded", () => {
  initChart();
});

// =========================================================================
// 3. KẾT NỐI VÀ ĐỒNG BỘ DỮ LIỆU QUA DỊCH VỤ E-RA PLATFORM
// =========================================================================

// Hàm tìm ID thực tế dựa trên tên Virtual Pin (V0, V1, V4,...)
function findConfigIdByPin(configs, pinName) {
    if (!configs) return null;
    const found = configs.find(c => c.name === pinName || c.vPin === pinName);
    return found ? found.id : null;
}

eraWidget.init({
  onConfiguration: (configuration) => {
    config = configuration; // Lưu cấu hình tổng thể bao gồm cả Actions
  },
  onValues: (values) => {
    if (!config || !config.realtime_configs) return;

    // Lấy ID động từ các chân Virtual Pin được mapping từ E-Ra
    const idTemp  = findConfigIdByPin(config.realtime_configs, VPIN_TEMP);
    const idHumid = findConfigIdByPin(config.realtime_configs, VPIN_HUMID);
    const idLux   = findConfigIdByPin(config.realtime_configs, VPIN_LUX);
    const idSoil  = findConfigIdByPin(config.realtime_configs, VPIN_SOIL);
    const idWater = findConfigIdByPin(config.realtime_configs, VPIN_WATER);
    
    const idFan   = findConfigIdByPin(config.realtime_configs, VPIN_FAN);
    const idPump  = findConfigIdByPin(config.realtime_configs, VPIN_PUMP);
    const idAuto  = findConfigIdByPin(config.realtime_configs, VPIN_AUTO);

    let currentTemp = NaN;
    let currentHum = NaN;
    let currentSoil = "--";
    let currentWater = "--";

    // A. Cập nhật dữ liệu Cảm biến
    if (idTemp && values[idTemp]) {
      currentTemp = parseFloat(values[idTemp].value);
      updateTempGauge(currentTemp);
    }

    if (idHumid && values[idHumid]) {
      currentHum = parseFloat(values[idHumid].value);
      updateHumidGauge(currentHum);
    }

    if (idLux && values[idLux]) {
      const luxValue = parseFloat(values[idLux].value).toFixed(0);
      const valLuxElement = document.getElementById("valLux");
      if (valLuxElement) valLuxElement.textContent = luxValue + " lx";
    }

    // Đọc thêm 2 chân Analog Đất và Nước
    if (idSoil && values[idSoil]) {
      currentSoil = values[idSoil].value;
      // Cập nhật số trực tiếp vào ô text Đất của bạn
      const soilElement = document.querySelector(".widget.apple-style .widget-title");
      if (soilElement && soilElement.innerText.includes("Độ Ẩm Đất")) {
         document.querySelector(".widget.apple-style .widget-value").textContent = currentSoil;
      }
    }
    
    if (idWater && values[idWater]) {
      currentWater = values[idWater].value;
    }

    // Gộp hiển thị text Đất | Nước dưới widget Ánh Sáng giống thiết kế HTML cũ
    const soilStatusEl = document.getElementById("soilStatus");
    if (soilStatusEl) {
        soilStatusEl.textContent = `Đất: ${currentSoil} | Nước: ${currentWater}`;
    }

    // Cập nhật dữ liệu vào đồ thị Chart.js
    if (!isNaN(currentTemp) || !isNaN(currentHum)) {
      updateChart(currentHum, currentTemp);
    }

    // B. Đồng bộ trạng thái thiết bị chấp hành ngược lại giao diện (khi thiết bị tự động bật/tắt)
    if (idFan && values[idFan]) {
      const fanState = parseInt(values[idFan].value);
      if (fanState === 1) {
        fanIcon.classList.add("active");
        fanStatus.textContent = "ON";
      } else {
        fanIcon.classList.remove("active");
        fanStatus.textContent = "OFF";
      }
    }

    if (idPump && values[idPump]) {
      const pumpState = parseInt(values[idPump].value);
      pumpSlider.value = pumpState;
      sliderFill.style.width = pumpState === 1 ? "100%" : "0%";
      pumpValue.textContent = pumpState === 1 ? "BẬT" : "TẮT";
    }

    if (idAuto && values[idAuto]) {
      const autoState = parseInt(values[idAuto].value);
      modeSlider.value = autoState;
      sliderFillMode.style.width = autoState === 1 ? "100%" : "0%";
      modeStatus.textContent = autoState === 1 ? "TỰ ĐỘNG" : "BẰNG TAY";
    }
  },
});

// =========================================================================
// 4. LOGIC CHUYỂN CÁC TAB ẨN / HIỆN WIDGET
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
            } 
            else if (tabName === "KHU TRỒNG TRỌT") {
                // Chỉ hiện Nhiệt độ, Độ ẩm, Ánh sáng & Đất
                if (widget.classList.contains('temp-widget') || 
                    widget.classList.contains('humidifier-widget') || 
                    widget.innerHTML.includes('BH1750') || 
                    widget.innerText.includes('Độ Ẩm Đất')) {
                    widget.style.display = 'block';
                } else {
                    widget.style.display = 'none';
                }
            } 
            else if (tabName === "HỆ THỐNG TƯỚI") {
                // Chỉ hiện Máy bơm nước, Quạt thông gió và Đồ thị
                if (widget.classList.contains('apple-style') && !widget.innerText.includes('Độ Ẩm Đất') || 
                    widget.classList.contains('bedLight-widget') || 
                    widget.classList.contains('chart-container')) {
                    widget.style.display = 'block';
                } else {
                    widget.style.display = 'none';
                }
            } 
            else if (tabName === "CẤU HÌNH HỆ THỐNG") {
                // Chỉ hiển thị Khối chọn Chế độ (Auto/Manual)
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
// 5. TÍNH NĂNG TOÀN MÀN HÌNH (FULLSCREEN FEATURE)
// =========================================================================
const fullscreenButton = document.createElement("button");
fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
fullscreenButton.className = "fullscreen-button";
document.body.appendChild(fullscreenButton);

let isFullscreen = false;
function toggleFullscreen() {
  if (!isFullscreen) {
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
  }
  isFullscreen = !isFullscreen;
}
fullscreenButton.addEventListener("click", toggleFullscreen);
