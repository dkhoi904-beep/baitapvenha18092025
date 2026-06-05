// 1. KHỞI TẠO ERA WIDGET SDK
const eraWidget = new EraWidget();
let config = null;

// Khởi tạo biểu đồ Realtime (Chart.js)
const ctx = document.getElementById('dataChart').getContext('2d');
const dataChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Thời gian thực
        datasets: [
            {
                label: 'Nhiệt độ (°C)',
                data: [],
                borderColor: '#ff5e62',
                backgroundColor: 'rgba(255, 94, 98, 0.1)',
                borderWidth: 2,
                tension: 0.4
            },
            {
                label: 'Độ ẩm (%)',
                data: [],
                borderColor: '#00c6ff',
                backgroundColor: 'rgba(0, 198, 255, 0.1)',
                borderWidth: 2,
                tension: 0.4
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { beginAtZero: true }
        }
    }
});

// Mảng lưu trữ dữ liệu lịch sử để phục vụ Modal "Phân Tích Dữ Liệu"
let historyData = [];

// 2. LẮNG NGHE CẤU HÌNH VÀ CẬP NHẬT DỮ LIỆU TỪ E-RA
eraWidget.onConfiguration((configuration) => {
    config = configuration;
});

eraWidget.onValues((values) => {
    if (!config) return;

    // --- XỬ LÝ LỖI HIỂN THỊ QUÁ NHIỀU SỐ 0 (Dùng .toFixed(1) để làm tròn 1 chữ số thập phân) ---
    
    // V0: Nhiệt độ
    if (values[config.configuration.sensors[0].id]) {
        const rawTemp = values[config.configuration.sensors[0].id].value;
        const tempVal = parseFloat(rawTemp).toFixed(1);
        document.getElementById('valTemp').innerText = tempVal + '°C';
        document.querySelector('.temp-widget .gauge').style.setProperty('--value', tempVal);
    }

    // V1: Độ ẩm không khí
    if (values[config.configuration.sensors[1].id]) {
        const rawHumid = values[config.configuration.sensors[1].id].value;
        const humidVal = parseFloat(rawHumid).toFixed(1);
        document.getElementById('valHumid').innerText = humidVal + '%';
        document.querySelector('.humidifier-widget .gauge').style.setProperty('--value', humidVal);
        
        // Cập nhật biểu đồ Realtime và mảng lịch sử khi có độ ẩm/nhiệt độ mới
        updateChartAndHistory(tempVal || 0, humidVal);
    }

    // V4: Cường độ ánh sáng Lux
    if (values[config.configuration.sensors[4].id]) {
        const rawLux = values[config.configuration.sensors[4].id].value;
        document.getElementById('valLux').innerText = parseFloat(rawLux).toFixed(0) + ' lx'; 
    }

    // --- ĐỒNG BỘ TRẠNG THÁI THIẾT BỊ TỪ CLOUD VỀ DASHBOARD ---
    
    // V2: Quạt Thông Gió
    if (values[config.configuration.sensors[2].id]) {
        const fanState = parseInt(values[config.configuration.sensors[2].id].value);
        const fanIcon = document.getElementById('fanIcon');
        const fanStatus = document.getElementById('fanStatus');
        if (fanState === 1) {
            fanStatus.innerText = 'BẬT';
            fanIcon.classList.add('spinning'); // Thêm hiệu ứng xoay nếu CSS có hỗ trợ
        } else {
            fanStatus.innerText = 'TẮT';
            fanIcon.classList.remove('spinning');
        }
    }

    // V3: Máy Bơm Nước
    if (values[config.configuration.sensors[3].id]) {
        const pumpState = parseInt(values[config.configuration.sensors[3].id].value);
        document.getElementById('pumpValue').innerText = pumpState === 1 ? 'BẬT' : 'TẮT';
        document.getElementById('pumpSlider').value = pumpState;
    }

    // V5: Chế độ Hệ thống (Auto / Manual)
    if (values[config.configuration.sensors[5].id]) {
        const modeState = parseInt(values[config.configuration.sensors[5].id].value);
        document.getElementById('modeStatus').innerText = modeState === 1 ? 'TỰ ĐỘNG' : 'THỦ CÔNG';
        document.getElementById('modeSlider').value = modeState;
    }
});

// 3. GỬI LỆNH ĐIỀU KHIỂN TỪ DASHBOARD LÊN CLOUDk (Gửi giá trị 0 hoặc 1)
document.getElementById('fanIcon').addEventListener('click', () => {
    const currentStatus = document.getElementById('fanStatus').innerText;
    const nextAction = currentStatus === 'TẮT' ? 1 : 0;
    eraWidget.triggerAction(config.configuration.actions[0].id, nextAction); // Action Bật/Tắt Quạt
});

document.getElementById('pumpSlider').addEventListener('input', (e) => {
    const nextAction = parseInt(e.target.value);
    eraWidget.triggerAction(config.configuration.actions[2].id, nextAction); // Action Bật/Tắt Bơm
});

document.getElementById('modeSlider').addEventListener('input', (e) => {
    const nextAction = parseInt(e.target.value);
    eraWidget.triggerAction(config.configuration.actions[4].id, nextAction); // Action Bật/Tắt Auto Mode
});


// 4. KHẮC PHỤC LỖI CHUYỂN TAB (Ẩn/Hiện phân khu tương ứng trực quan)
const navLinks = document.querySelectorAll('.nav a');
const widgets = document.querySelectorAll('.widgets .widget');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // Ngăn chặn nhảy trang do dấu '#'
        
        // Đổi class Active cho Tab được nhấn
        document.querySelector('.nav a.active').classList.remove('active');
        this.classList.add('active');

        const tabName = this.textContent.trim();

        // Thuật toán lọc Widget theo Tab điều hướng
        widgets.forEach(widget => {
            if (tabName === "TRẠM TỔNG") {
                widget.style.display = 'block'; // Trạm tổng hiển thị tất cả
            } 
            else if (tabName === "KHU TRỒNG TRỌT") {
                // Chỉ hiển thị Nhiệt độ, Độ ẩm, Ánh sáng BH1750 và Đồ thị
                if (widget.classList.contains('temp-widget') || 
                    widget.classList.contains('humidifier-widget') || 
                    widget.classList.contains('weather-widget') ||
                    widget.classList.contains('chart-container')) {
                    widget.style.display = 'block';
                } else {
                    widget.style.display = 'none';
                }
            } 
            else if (tabName === "HỆ THỐNG TƯỚI") {
                // Chỉ hiện Máy bơm nước, Quạt thông gió và Đồ thị
                if (widget.classList.contains('bedLight-widget') || 
                    widget.classList.contains('apple-style') ||
                    widget.classList.contains('chart-container')) {
                    widget.style.display = 'block';
                } else {
                    widget.style.display = 'none';
                }
            } 
            else if (tabName === "CẤU HÌNH HỆ THỐNG") {
                // Chỉ hiện Widget điều chỉnh Chế độ hệ thống (Auto Mode)
                if (widget.classList.contains('livingRoom-widget')) {
                    widget.style.display = 'block';
                } else {
                    widget.style.display = 'none';
                }
            }
        });
    });
});

// 5. CÁC HÀM HỖ TRỢ BIỂU ĐỒ & POPUP DỮ LIỆU LỊCH SỬ
function updateChartAndHistory(temp, humid) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Cập nhật Chart (Giới hạn tối đa 10 điểm hiển thị trực tiếp)
    if (dataChart.data.labels.length > 10) {
        dataChart.data.labels.shift();
        dataChart.data.datasets[0].data.shift();
        dataChart.data.datasets[1].data.shift();
    }
    dataChart.data.labels.push(timeStr);
    dataChart.data.datasets[0].data.push(temp);
    dataChart.data.datasets[1].data.push(humid);
    dataChart.update();

    // Lưu vào mảng lịch sử
    historyData.unshift({ time: timeStr, temp: temp, humid: humid });
}

// Điều khiển Modal Xem Bảng Dữ Liệu 
const modal = document.getElementById('statsModal');
const closeBtn = document.querySelector('.close');

document.querySelectorAll('.time-range').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelector('.time-range.active').classList.remove('active');
        this.classList.add('active');

        if (this.getAttribute('data-minutes') === "5") {
            // Hiển thị Modal và đổ dữ liệu vào bảng
            modal.style.display = "block";
            const tbody = document.getElementById('statsTableBody');
            tbody.innerHTML = ''; // Reset bảng
            
            historyData.forEach(row => {
                tbody.innerHTML += `<tr><td>${row.time}</td><td>${row.humid}%</td><td>${row.temp}°C</td></tr>`;
            });
        }
    });
});

closeBtn.onclick = function() { modal.style.display = "none"; }
window.onclick = function(event) { if (event.target == modal) modal.style.display = "none"; }

// Bắt đầu khởi tạo kết nối widget
eraWidget.init();
