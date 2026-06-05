// --- 1. KHỞI TẠO ERA WIDGET SDK ---
const eraWidget = new EraWidget();
let config = null;

// Khởi tạo mảng lưu dữ liệu biểu đồ (Chart.js)
let chartLabels = [];
let chartTempData = [];
let chartHumidData = [];

// Trạng thái các Virtual Pin
const VPIN_TEMP = 'V0';
const VPIN_HUMID = 'V1';
const VPIN_FAN = 'V2';
const VPIN_PUMP = 'V3';
const VPIN_LUX = 'V4';
const VPIN_AUTO_MODE = 'V5';

eraWidget.onConfiguration((configuration) => {
    config = configuration;
});

// Lắng nghe dữ liệu thay đổi từ Cloud E-Ra truyền xuống Dashboard
eraWidget.onValues((values) => {
    // A. CẬP NHẬT CẢM BIẾN & SỬA LỖI HIỂN THỊ SỐ THỰC QUÁ DÀI (.toFixed)
    if (values[VPIN_TEMP]) {
        const tempVal = parseFloat(values[VPIN_TEMP].value);
        const fixedTemp = tempVal.toFixed(1); // Làm tròn 1 chữ số thập phân (Ví dụ: 30.5)
        
        document.getElementById('valTemp').innerText = fixedTemp + '°C';
        document.getElementById('weatherBoxTemp').innerText = fixedTemp + '°C';
        
        // Cập nhật vòng Gauge tròn CSS
        document.querySelector('.temp-widget .gauge').style.setProperty('--value', Math.round(tempVal));
        
        // Lưu data vẽ chart
        updateChartData(fixedTemp, null);
    }

    if (values[VPIN_HUMID]) {
        const humidVal = parseFloat(values[VPIN_HUMID].value);
        const fixedHumid = humidVal.toFixed(1); // Khắc phục lỗi hiển thị 69.400002% -> 69.4%
        
        document.getElementById('valHumid').innerText = fixedHumid + '%';
        document.querySelector('.humidifier-widget .gauge').style.setProperty('--value', Math.round(humidVal));
        
        updateChartData(null, fixedHumid);
    }

    if (values[VPIN_LUX]) {
        const luxVal = parseFloat(values[VPIN_LUX].value).toFixed(0); // Ánh sáng chỉ cần số nguyên
        document.getElementById('valLux').innerText = luxVal + ' lx';
    }

    // B. ĐỒNG BỘ TRẠNG THÁI CÁC NÚT ĐIỀU KHIỂN TỪ ĐIỆN THOẠI/THIẾT BỊ LÊN WEB
    if (values[VPIN_FAN]) {
        const fanState = parseInt(values[VPIN_FAN].value);
        const fanIcon = document.getElementById('fanIcon');
        const fanStatus = document.getElementById('fanStatus');
        
        if (fanState === 1) {
            fanStatus.innerText = "BẬT";
            fanIcon.classList.add('fa-spin'); // Tạo hiệu ứng xoay cánh quạt nếu CSS có hỗ trợ
        } else {
            fanStatus.innerText = "TẮT";
            fanIcon.classList.remove('fa-spin');
        }
    }

    if (values[VPIN_PUMP]) {
        const pumpState = parseInt(values[VPIN_PUMP].value);
        document.getElementById('pumpSlider').value = pumpState;
        document.getElementById('pumpValue').innerText = (pumpState === 1) ? "BẬT" : "TẮT";
    }

    if (values[VPIN_AUTO_MODE]) {
        const autoState = parseInt(values[VPIN_AUTO_MODE].value);
        document.getElementById('modeSlider').value = autoState;
        document.getElementById('modeStatus').innerText = (autoState === 1) ? "TỰ ĐỘNG" : "THỦ CÔNG";
    }
});

// --- 2. SỰ KIỆN ĐIỀU KHIỂN TỪ WEB GỬI LÊN CLOUD E-RA ---
// Nhấn nút Quạt
document.getElementById('fanIcon').addEventListener('click', () => {
    const currentStatus = document.getElementById('fanStatus').innerText;
    const nextState = (currentStatus === "TẮT") ? 1 : 0;
    eraWidget.triggerAction(config.actions[nextState === 1 ? 0 : 1].actionCode); // Action Vị trí 0 (ON) & 1 (OFF)
});

// Kéo thanh Máy bơm
document.getElementById('pumpSlider').addEventListener('input', (e) => {
    const nextState = parseInt(e.target.value);
    eraWidget.triggerAction(config.actions[nextState === 1 ? 2 : 3].actionCode); // Action Vị trí 2 (ON) & 3 (OFF)
});

// Kéo thanh Chế độ Auto/Manual
document.getElementById('modeSlider').addEventListener('input', (e) => {
    const nextState = parseInt(e.target.value);
    eraWidget.triggerAction(config.actions[nextState === 1 ? 4 : 5].actionCode); // Action Vị trí 4 (ON) & 5 (OFF)
});


// --- 3. LOGIC SỬA LỖI CHUYỂN CÁC TAB ẨN / HIỆN WIDGET ---
const navLinks = document.querySelectorAll('.nav a');
const allWidgets = document.querySelectorAll('.widgets .widget');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // Ngăn hành vi cuộn trang mặc định của dấu #
        
        // 1. Đổi active class cho Tab được nhấn
        document.querySelector('.nav a.active').classList.remove('active');
        this.classList.add('active');
        
        // 2. Lấy tên Tab
        const tabName = this.textContent.trim();
        
        // 3. Thực hiện ẩn/hiện widget tương ứng theo phân khu
        allWidgets.forEach(widget => {
            if (tabName === "TRẠM TỔNG") {
                // Hiện toàn bộ mọi widget
                widget.style.display = 'block';
            } 
            else if (tabName === "KHU TRỒNG TRỌT") {
                // Chỉ hiện các thông số môi trường cảm biến (Nhiệt độ, Độ ẩm, Ánh sáng/Đất)
                if (widget.classList.contains('temp-widget') || 
                    widget.classList.contains('humidifier-widget') || 
                    widget.innerHTML.includes('BH1750')) {
                    widget.style.display = 'block';
                } else {
                    widget.style.display = 'none';
                }
            } 
            else if (tabName === "HỆ THỐNG TƯỚI") {
                // Chỉ hiện Máy bơm nước, Quạt thông gió và Đồ thị thống kê
                if (widget.classList.contains('apple-style') || 
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

// --- 4. HÀM PHỤ TRỢ CẬP NHẬT BIỂU ĐỒ REALTIME ---
function updateChartData(temp, humid) {
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    if (chartLabels.length > 10) {
        chartLabels.shift();
        if(temp) chartTempData.shift();
        if(humid) chartHumidData.shift();
    }
    
    if(temp || humid) chartLabels.push(now);
    if(temp) chartTempData.push(temp);
    if(humid) chartHumidData.push(humid);
    
    // Nếu biến myChart (Chart.js) đã được khởi tạo trong mã của bạn, hãy gọi lệnh update:
    if (typeof myChart !== 'undefined') {
        myChart.update();
    }
}

// Bắt buộc gọi lệnh ready để SDK thông báo widget đã sẵng sàng kết nối Cloud
eraWidget.init();
