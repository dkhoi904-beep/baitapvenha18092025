# ================================================================
# Hệ Thống Thanh Toán Khay Cơm Thông Minh (Giao diện Nâng cấp)
# ================================================================

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image, ImageTk, ImageDraw, ImageFont
import numpy as np
import tensorflow as tf
import os
import pygame  # để phát nhạc

# ---------------- CONFIG ----------------
# !!! QUAN TRỌNG: Hãy đảm bảo các đường dẫn này chính xác trên máy của bạn !!!
MODEL_PATH  = r"D:\AI\model.h5"
QR_CODE_URL = r"D:\AI\ảnh\QR.jpg"
BG_IMAGE = r"D:\AI\ảnh\background.png"   
MUSIC_BG = r"D:\AI\ảnh\nhạc nền.mp3"
TAB_BG_IMAGE = r"C:\Users\Khôi\Downloads\AI\ảnh\bg_tab.jpg" # Giữ lại ảnh nền cho các tab
MENU_PROMO_IMAGE = r"C:\Users\Khôi\Downloads\AI\ảnh\canteen ueh.jpg"

# --- Dữ liệu không đổi ---
MENU_DATA = {
    "Cơm trắng": {
        "price": 10000,
        "image_url": r"D:\AI\ảnh\Cơm trắng.jpg",
        "desc": "Cơm trắng nấu từ gạo thơm, hạt cơm dẻo mềm, nóng hổi, giữ trọn hương vị tự nhiên. Đây là nền tảng hoàn hảo để kết hợp với mọi món ăn khác."
    },
    "Rau xào": {
        "price": 10000,
        "image_url": r"D:\AI\ảnh\Rau xào.jpg",
        "desc": "Rau xanh tươi được chọn lọc kỹ, xào trên lửa lớn cùng tỏi phi thơm nức, giữ nguyên màu xanh mướt và vị giòn ngọt tự nhiên, thanh mát dễ ăn."
    },
    "Trứng chiên": {
        "price": 25000,
        "image_url": r"D:\AI\ảnh\Trứng chiên.jpg",
        "desc": "Trứng gà tươi đánh bông, nêm nếm vừa miệng, chiên vàng đều hai mặt. Lớp ngoài giòn nhẹ, bên trong xốp mềm, béo ngậy, thích hợp cho mọi lứa tuổi."
    },
    "Canh bí đao": {
        "price": 12000,
        "image_url": r"D:\AI\ảnh\Canh bí.jpg",
        "desc": "Bí đao tươi mát, nấu cùng xương hoặc tôm khô tạo vị ngọt thanh. Canh có tác dụng giải nhiệt, nhẹ bụng, là lựa chọn lý tưởng cho bữa trưa hè."
    },
    "Canh bí đỏ": {
        "price": 12000,
        "image_url": r"D:\AI\ảnh\Canh bí đỏ.jpg",
        "desc": "Canh bí đỏ ngọt bùi, màu sắc bắt mắt. Khi hầm nhừ, bí đỏ tan nhẹ trong miệng, vừa bổ dưỡng lại cung cấp vitamin A tốt cho thị lực và sức khỏe."
    },
    "Dưa leo": {
        "price": 5000,
        "image_url": r"D:\AI\ảnh\Dưa leo.jpg",
        "desc": "Dưa leo tươi, giòn mát, thái lát vừa ăn, dùng kèm giúp cân bằng vị giác, giảm ngấy và mang lại cảm giác sảng khoái cho bữa cơm."
    },
    "Lạp sưởng": {
        "price": 15000,
        "image_url": r"D:\AI\ảnh\Lạp xưởng.jpg",
        "desc": "Lạp sưởng thơm béo, chiên vàng đều, tỏa hương hấp dẫn. Món ăn quen thuộc, vừa ngọt, vừa béo nhẹ, rất đưa cơm và được nhiều người yêu thích."
    },
    "Nước chấm": {
        "price": 3000,
        "image_url": r"D:\AI\ảnh\Nước chấm.jpg",
        "desc": "Chén nước mắm chua ngọt pha chuẩn vị, thêm tỏi ớt cay nồng. Là gia vị không thể thiếu giúp làm dậy mùi và cân bằng vị giác cho mọi món ăn."
    },
    "Khay trống": {
        "price": 0,
        "image_url": r"D:\AI\ảnh\Khay trống.jpg",
        "desc": ""
    },
    "Đậu hũ sốt cà": {
        "price": 25000,
        "image_url": r"D:\AI\ảnh\Đậu hũ.jpg",
        "desc": "Đậu hũ non mềm mịn, chiên vàng giòn bên ngoài rồi rim cùng sốt cà chua chua ngọt. Món ăn vừa thanh đạm vừa đậm đà, dễ ăn cho mọi thực khách."
    },
    "Cá hú kho": {
        "price": 30000,
        "image_url": r"D:\AI\ảnh\Cá hú.jpg",
        "desc": "Cá hú tươi kho cùng nước màu, tiêu và ớt, hương vị mặn mà xen lẫn cay nhẹ. Thịt cá béo mềm, thấm đẫm gia vị, gợi nhớ bữa cơm gia đình truyền thống."
    },
    "Thịt kho trứng": {
        "price": 30000,
        "image_url": r"D:\AI\ảnh\Thịt kho trứng.jpg",
        "desc": "Thịt ba chỉ kho mềm nhừ cùng trứng cút, nước kho sánh đậm, mặn ngọt vừa miệng. Đây là món ăn gắn liền với mâm cơm ngày Tết của người Việt."
    },
    "Thịt kho": {
        "price": 25000,
        "image_url": r"D:\AI\ảnh\Thịt kho.jpg",
        "desc": "Thịt ba chỉ kho trong nước màu, nêm nếm hài hòa, thịt mềm tan, mỡ béo nhưng không ngấy. Món ăn dân dã nhưng đậm chất cơm nhà Việt Nam."
    },
    "Canh chua cá": {
        "price": 25000,
        "image_url": r"D:\AI\ảnh\Canh chua cá.jpg",
        "desc": "Canh chua cá nấu với me, thơm, cà chua và bạc hà. Vị chua thanh hòa quyện cùng vị ngọt từ cá, mang lại cảm giác nhẹ nhàng, dễ chịu cho bữa ăn."
    },
    "Canh chua": {
        "price": 10000,
        "image_url": r"D:\AI\ảnh\Canh chua.jpg",
        "desc": "Canh chua chay thanh đạm, nấu với dứa, cà chua và giá đỗ, vị chua ngọt dịu nhẹ, thích hợp cho những ngày ăn chay hoặc cần bữa ăn nhẹ bụng."
    },
    "Sườn nướng": {
        "price": 30000,
        "image_url": r"D:\AI\ảnh\Sườn nướng.jpg",
        "desc": "Sườn heo tẩm ướp gia vị đậm đà, nướng vàng  thơm trên bếp than. Thịt mềm, lớp ngoài hơi cháy cạnh, mang lại hương vị hấp dẫn khó cưỡng."
    },
}

dia_diem = ["CANTEEN UEH - Cơ sở A", "CANTEEN UEH - Cơ sở B", "CANTEEN UEH - Cơ sở N", "Cổng chính 279 Nguyễn Tri Phương", "Cổng sau 138 Trần Hưng Đạo", "Thư viện UEH", "Ký túc xá UEH", "Nhà văn hóa sinh viên", "Công viên Tao Đàn", "Công viên 23/9", "Bến xe buýt Sài Gòn", "Bến xe miền Tây", "Bến xe miền Đông", "Ga Sài Gòn", "Chợ Bến Thành", "Coopmart Nguyễn Tri Phương", "Big C Miền Đông", "Vincom Center Đồng Khởi", "Landmark 81", "AEON Mall Tân Phú"]
SHOP_NAME = "Canteen UEH - Cơ sở B"; SHOP_ADDRESS = "279 Nguyễn Tri Phương, P.5, Quận 10, TP.HCM"
DISTANCE_KM_FROM_B = {"CANTEEN UEH - Cơ sở A": 1.8, "CANTEEN UEH - Cơ sở B": 0.0, "CANTEEN UEH - Cơ sở N": 12.5, "Cổng chính 279 Nguyễn Tri Phương": 0.0, "Cổng sau 138 Trần Hưng Đạo": 3.5, "Thư viện UEH": 0.0, "Ký túc xá UEH": 3.4, "Nhà văn hóa sinh viên": 16.0, "Công viên Tao Đàn": 2.5, "Công viên 23/9": 3.7, "Bến xe buýt Sài Gòn": 3.7, "Bến xe miền Tây": 8.0, "Bến xe miền Đông": 6.7, "Ga Sài Gòn": 3.2, "Chợ Bến Thành": 3.9, "Coopmart Nguyễn Tri Phương": 1.2, "Big C Miền Đông": 1.3, "Vincom Center Đồng Khởi": 4.9, "Landmark 81": 6.8, "AEON Mall Tân Phú": 7.4}
def fee_from_distance_km(d):
    if d < 2: return 0
    if d <= 5: return 10000
    return 15000
VOUCHERS = {"LANDAUDATHANG": 0.30, "HSSV": 0.20, "KHACHQUEN": 0.15}
COMBO_DATA = {
    "Combo A": {
        "price": 87000,
        "items": ["Cơm trắng", "Canh chua", "Rau muống xào", "Trứng chiên", "Thịt kho"],
        "image_url": r"D:\AI\ảnh\combo_a.jpg"   # thêm ảnh
    },
    "Combo B": {
        "price": 85000,
        "items": ["Cơm trắng", "Canh bí đao", "Thịt kho trứng", "Nước chấm", "Sườn nướng"],
        "image_url": r"D:\AI\ảnh\combo_b.jpg"
    },
    "Combo C": {
        "price": 85000,
        "items": ["Cơm trắng", "Canh rau", "Cá hú kho", "Thịt kho", "Lạp sưởng"],
        "image_url": r"D:\AI\ảnh\combo_c.jpg"
    }
}

CLASS_NAMES = list(MENU_DATA.keys())
LAYOUT_KHAY5 = {"Ô 1": (0.00, 0.00, 0.58, 0.55), "Ô 2": (0.60, 0.00, 1.00, 0.55), "Ô 3": (0.00, 0.56, 0.32, 1.00), "Ô 4": (0.33, 0.56, 0.66, 1.00), "Ô 5": (0.67, 0.56, 1.00, 1.00)}

# ----------------- UI Constants -----------------
COLOR_BG = "#F5F5DC"  # Beige
COLOR_PRIMARY = "#E67E22" # Carrot Orange
COLOR_SECONDARY = "#2C3E50" # Midnight Blue
COLOR_TEXT = "#34495E" # Wet Asphalt
COLOR_LIGHT = "#ECF0F1" # Clouds
COLOR_SUCCESS = "#2ECC71" # Emerald Green
FONT_BOLD = ("Segoe UI", 12, "bold")
FONT_NORMAL = ("Segoe UI", 11)
FONT_LARGE_BOLD = ("Segoe UI", 16, "bold")


class ScrollableFrame(ttk.Frame):
    def __init__(self, container, *args, **kwargs):
        super().__init__(container, *args, **kwargs)
        self.custom_total = 0
        canvas = tk.Canvas(self, bg=COLOR_BG, highlightthickness=0)
        scrollbar = ttk.Scrollbar(self, orient="vertical", command=canvas.yview)
        self.scrollable_frame = ttk.Frame(canvas, style="App.TFrame") # Apply style
        self.scrollable_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

# ---------------- APP CLASS ----------------
class SmartCanteenApp:
    def __init__(self, root):
        self.root = root
        self.root.configure(bg=COLOR_BG)
        pygame.mixer.init()
        self.music_playing = False
        self.toggle_music()

        self.setup_styles() # CÀI ĐẶT STYLE TRUNG TÂM

        # --- Splash screen ---
        self.splash_frame = tk.Frame(root)
        self.splash_frame.pack(fill="both", expand=True)
        img = Image.open(BG_IMAGE).resize((1300, 700))
        self.bg_img = ImageTk.PhotoImage(img)

        canvas = tk.Canvas(self.splash_frame, width=1300, height=700)
        canvas.pack(fill="both", expand=True)
        canvas.create_image(0, 0, anchor="nw", image=self.bg_img)
        
        # Nút bấm custom thay thế
        self.create_styled_button(self.splash_frame, "🚀 BẮT ĐẦU", self.start_app, 
                                  font=FONT_LARGE_BOLD, place_x=650, place_y=590)

        self.root.state("zoomed")
        self.root.title("🍱 Hệ Thống Thanh Toán Khay Cơm Thông Minh")

        # Load model
        try:
            self.model = tf.keras.models.load_model(MODEL_PATH)
            self.input_h, self.input_w, _ = self.model.input_shape[1:4]
        except Exception as e:
            self.model = None
            messagebox.showerror("Lỗi", f"Không load được model: {e}")

        self._tab_bgs = {}
    def make_scrollable(self, parent):
        canvas = tk.Canvas(parent, bg=COLOR_BG, highlightthickness=0)
        canvas.pack(side="left", fill="both", expand=True)
        scroll_frame = ttk.Frame(canvas, style="App.TFrame")
        canvas.create_window((0,0), window=scroll_frame, anchor="nw")

        # cập nhật vùng scroll
        def update_scroll(event):
            canvas.configure(scrollregion=canvas.bbox("all"))
        scroll_frame.bind("<Configure>", update_scroll)

        # cho phép cuộn chuột
        def on_mousewheel(event):
            canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        canvas.bind_all("<MouseWheel>", on_mousewheel)

        return scroll_frame

    def create_styled_button(self, parent, text, command, font=FONT_BOLD, place_x=None, place_y=None):
        """Hàm trợ giúp tạo nút bấm đẹp hơn"""
        btn = tk.Button(parent, text=text, font=font,
                        fg=COLOR_LIGHT, bg=COLOR_PRIMARY,
                        relief="flat", pady=5, padx=15,
                        activebackground=COLOR_SECONDARY,
                        activeforeground=COLOR_LIGHT,
                        command=command)
        
        # Hiệu ứng bo góc và hover
        btn.bind("<Enter>", lambda e: btn.config(bg=COLOR_SECONDARY))
        btn.bind("<Leave>", lambda e: btn.config(bg=COLOR_PRIMARY))
        
        if place_x is not None and place_y is not None:
            btn.place(x=place_x, y=place_y, anchor="center")
        return btn

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use('clam') # Một theme tốt để tùy chỉnh

        # --- General Style ---
        style.configure(".", background=COLOR_BG, foreground=COLOR_TEXT, font=FONT_NORMAL)
        
        # --- Frame Style ---
        style.configure("App.TFrame", background=COLOR_BG)

        # --- Notebook (Tabs) Style ---
        style.configure("TNotebook", background=COLOR_BG, borderwidth=0)
        style.configure("TNotebook.Tab", background=COLOR_LIGHT, foreground=COLOR_SECONDARY,
                        font=FONT_BOLD, padding=[10, 5], borderwidth=0)
        style.map("TNotebook.Tab",
                  background=[("selected", COLOR_PRIMARY)],
                  foreground=[("selected", COLOR_LIGHT)])

        # --- Label Style ---
        style.configure("TLabel", background=COLOR_BG, foreground=COLOR_TEXT, font=FONT_NORMAL, padding=5)
        style.configure("Header.TLabel", font=FONT_BOLD, foreground=COLOR_SECONDARY)
        
        # --- Button Style ---
        style.configure("TButton", font=FONT_BOLD, padding=10,
                        background=COLOR_PRIMARY, foreground=COLOR_LIGHT,
                        relief="flat", borderwidth=0)
        style.map("TButton",
                  background=[('active', COLOR_SECONDARY), ('!disabled', COLOR_PRIMARY)],
                  foreground=[('active', COLOR_LIGHT)])

        # --- Combobox Style ---
        style.configure("TCombobox",
                        selectbackground=COLOR_PRIMARY,
                        fieldbackground="white",
                        background="white",
                        foreground=COLOR_TEXT,
                        arrowcolor=COLOR_PRIMARY,
                        font=FONT_NORMAL)
        
        # --- Radiobutton & Checkbutton ---
        style.configure("TRadiobutton", background=COLOR_BG, font=FONT_NORMAL)
        style.configure("TCheckbutton", background=COLOR_BG, font=FONT_NORMAL)


    def _apply_bg(self, frame, key):
        if not os.path.exists(TAB_BG_IMAGE): return
        lbl = tk.Label(frame); lbl.place(x=0, y=0, relwidth=1, relheight=1)
        pil = Image.open(TAB_BG_IMAGE)
        def _resize(ev):
            if ev.width <= 1 or ev.height <= 1: return
            im = pil.resize((ev.width, ev.height), Image.LANCZOS)
            self._tab_bgs[key] = ImageTk.PhotoImage(im)
            lbl.config(image=self._tab_bgs[key])
            lbl.lower()
        frame.bind("<Configure>", _resize)

    def start_app(self):
        self.splash_frame.destroy()
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(expand=1, fill="both")

        self.tab1 = ttk.Frame(self.notebook, style="App.TFrame", padding=10)
        self.tab2 = ttk.Frame(self.notebook, style="App.TFrame", padding=10)
        self.tab3 = ttk.Frame(self.notebook, style="App.TFrame", padding=10)

        self.notebook.add(self.tab1, text="Thanh Toán & Nhận Diện")
        self.notebook.add(self.tab2, text="📖 Thực Đơn")
        self.notebook.add(self.tab3, text="🍽️ Suất Ăn Tùy Chọn")

        if not hasattr(self, "home_btn_frame"):
            self.home_btn_frame = tk.Frame(self.root, bg=COLOR_BG)
            self.home_btn_frame.pack(side="bottom", fill="x", pady=5)
            self.create_styled_button(self.home_btn_frame, "🏠 Home", self.show_home).pack(side="right", padx=20)
            # Thêm nút bật/tắt nhạc
            self.music_btn = self.create_styled_button(self.home_btn_frame, "🎵 Tắt nhạc", self.toggle_music)
            self.music_btn.pack(side="left")


        self.setup_tab1()
        self.setup_tab2()
        self.setup_tab3()
        
    def toggle_music(self):
        if self.music_playing:
            pygame.mixer.music.stop()
            self.music_playing = False
            if hasattr(self, 'music_btn'): self.music_btn.config(text="🎵 Bật nhạc")
        else:
            if os.path.exists(MUSIC_BG):
                pygame.mixer.music.load(MUSIC_BG)
                pygame.mixer.music.play(-1)
            self.music_playing = True
            if hasattr(self, 'music_btn'): self.music_btn.config(text="🎵 Tắt nhạc")

    # =================================================================
    # CÁC HÀM SETUP TAB (Chỉ thay đổi cách tạo widget, giữ nguyên logic)
    # =================================================================
    
    def setup_tab1(self):
      
        self.tab1.columnconfigure(0, weight=2); self.tab1.columnconfigure(1, weight=1)
        
        # --- Left Frame ---
        left_frame = ttk.Frame(self.tab1, style="App.TFrame"); left_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 20))
        ttk.Button(left_frame, text="📂 Tải ảnh khay", command=self.upload_image).pack(pady=10, fill="x")
        self.canvas = tk.Canvas(left_frame, width=600, height=400, bg=COLOR_LIGHT, highlightthickness=0); self.canvas.pack(pady=5, expand=True, fill="both")
        ttk.Button(left_frame, text="✨ Nhận diện & Tính tiền", command=self.analyze_and_pay, style="Accent.TButton").pack(pady=10, fill="x")
        
        # --- Right Frame ---
        right_frame = ttk.Frame(self.tab1, style="App.TFrame"); right_frame.grid(row=0, column=1, sticky="nsew")
        ttk.Label(right_frame, text="Kết quả nhận diện:", style="Header.TLabel").pack(anchor="w")
        self.result_text = tk.Text(right_frame, width=40, height=18, font=FONT_NORMAL, relief="flat", bg="white", fg=COLOR_TEXT); self.result_text.pack(pady=5, expand=True, fill="both")
        
        self.qr_canvas = tk.Canvas(right_frame, width=200, height=200, bg="white", highlightthickness=0); self.qr_canvas.pack(pady=10)
        if os.path.exists(QR_CODE_URL):
            qr_img = Image.open(QR_CODE_URL).resize((200, 200))
            self.tk_qr = ImageTk.PhotoImage(qr_img)
            self.qr_canvas.create_image(0, 0, anchor="nw", image=self.tk_qr)

    def setup_tab2(self):
        # self._apply_bg(self.tab2, "tab2")
        scroll_frame = ScrollableFrame(self.tab2); scroll_frame.pack(fill="both", expand=True)
        frm = scroll_frame.scrollable_frame
        for i in range(5): frm.columnconfigure(i, weight=1)

        # --- Frame Món lẻ ---
        frame_menu = ttk.Frame(frm, style="App.TFrame"); frame_menu.grid(row=0, column=1, padx=20, pady=10, sticky="n")
        ttk.Label(frame_menu, text="Món ăn:", style="Header.TLabel").pack(pady=5)
        self.menu_combo = ttk.Combobox(frame_menu, values=list(MENU_DATA.keys()), width=30, font=FONT_NORMAL); self.menu_combo.pack(pady=5)
        ttk.Button(frame_menu, text="Xem chi tiết", command=self.show_menu_item).pack(pady=5, fill="x")
        self.menu_text = tk.Text(frame_menu, width=40, height=6, font=FONT_NORMAL, relief="flat"); self.menu_text.pack(pady=5)
        self.menu_canvas = tk.Canvas(frame_menu, width=250, height=180, bg=COLOR_LIGHT, highlightthickness=0); self.menu_canvas.pack(pady=5)
        
        # --- Frame Combo ---
        frame_combo = ttk.Frame(frm, style="App.TFrame"); frame_combo.grid(row=0, column=3, padx=20, pady=10, sticky="n")
        ttk.Label(frame_combo, text="Combo:", style="Header.TLabel").pack(pady=5)
        self.combo_combo = ttk.Combobox(frame_combo, values=list(COMBO_DATA.keys()), width=30, font=FONT_NORMAL); self.combo_combo.pack(pady=5)
        ttk.Button(frame_combo, text="Xem Combo", command=self.show_combo).pack(pady=5, fill="x")
        self.combo_text = tk.Text(frame_combo, width=40, height=10, font=FONT_NORMAL, relief="flat"); self.combo_text.pack(pady=5)
        self.combo_canvas = tk.Canvas(frame_combo, width=250, height=180, bg=COLOR_LIGHT, highlightthickness=0); self.combo_canvas.pack(pady=5)
        
        
    def setup_tab3(self):
        frm = self.make_scrollable(self.tab3)  
        frm.columnconfigure(0, weight=1); frm.columnconfigure(1, weight=1)
        
        # --- Left Frame ---
        left_frame = ttk.Frame(frm, style="App.TFrame"); left_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 20), pady=10)
        
        ttk.Label(left_frame, text="Chọn 1 canh:", style="Header.TLabel").pack(anchor="w", pady=(0, 5))
        self.canhs = tk.StringVar()
        for c in ["Canh chua cá","Canh chua","Canh bí đao","Canh bí đỏ"]:
            ttk.Radiobutton(left_frame, text=c, variable=self.canhs, value=c).pack(anchor="w")
        
        # --- TỐI ƯU HIỂN THỊ MÓN CHÍNH ---
        ttk.Label(left_frame, text="Chọn 2 món chính:", style="Header.TLabel").pack(anchor="w", pady=(15, 5))
        main_dishes_frame = ttk.Frame(left_frame, style="App.TFrame")
        main_dishes_frame.pack(fill="x")
        main_dishes_frame.columnconfigure(0, weight=1)
        main_dishes_frame.columnconfigure(1, weight=1)
        
        self.main_vars = {}
        main_dishes = ["Đậu hũ sốt cà","Cá hú kho","Thịt kho trứng","Thịt kho","Sườn nướng","Trứng chiên","Lạp sưởng"]
        for i, m in enumerate(main_dishes):
            var = tk.BooleanVar(); self.main_vars[m] = var
            # Chia thành 2 cột, i % 2 là cột (0 hoặc 1), i // 2 là hàng
            ttk.Checkbutton(main_dishes_frame, text=m, variable=var).grid(row=i//2, column=i%2, sticky="w")
        
        ttk.Label(left_frame, text="Chọn 1 ăn kèm:", style="Header.TLabel").pack(anchor="w", pady=(15, 5))
        self.side = tk.StringVar()
        for s in ["Rau xào","Dưa leo","Nước chấm"]:
            ttk.Radiobutton(left_frame, text=s, variable=self.side, value=s).pack(anchor="w")
            
        ttk.Button(left_frame, text="✅ Tổng hợp suất ăn", command=self.custom_meal).pack(pady=15, fill="x")
        self.custom_text = tk.Text(left_frame, width=50, height=12, font=FONT_NORMAL, relief="flat"); self.custom_text.pack(fill="both", expand=True)

        # --- Right Frame ---
        right_frame = ttk.Frame(frm, style="App.TFrame"); right_frame.grid(row=0, column=1, sticky="nsew", pady=10)
        
        # Các widget thông tin vẫn giữ nguyên...
        right_form_frame = ttk.Frame(right_frame, style="App.TFrame")
        right_form_frame.pack(fill="x")
        # (Giữ nguyên code tạo form nhập liệu ở đây)
        labels = ["🏪 Quán:", "👤 Tên người nhận:", "📞 SĐT người nhận:", "🏠 Địa chỉ giao hàng:", "🎟️ Voucher:", "💳 Phương thức:"]
        for i, label_text in enumerate(labels):
            ttk.Label(right_form_frame, text=label_text).grid(row=i, column=0, sticky="w", pady=4)
        ttk.Label(right_form_frame, text=f"{SHOP_NAME} – {SHOP_ADDRESS}", wraplength=350, justify="left").grid(row=0, column=1, columnspan=2, sticky="w")
        self.recipient_name_var = tk.StringVar(); ttk.Entry(right_form_frame, textvariable=self.recipient_name_var, width=42, font=FONT_NORMAL).grid(row=1, column=1, columnspan=2, padx=5, pady=4, sticky="w")
        self.recipient_phone_var = tk.StringVar(); ttk.Entry(right_form_frame, textvariable=self.recipient_phone_var, width=42, font=FONT_NORMAL).grid(row=2, column=1, columnspan=2, padx=5, pady=4, sticky="w")
        self.address_var = tk.StringVar(); self.address_combo = ttk.Combobox(right_form_frame, textvariable=self.address_var, values=dia_diem, width=40, font=FONT_NORMAL); self.address_combo.grid(row=3, column=1, padx=5, pady=4, sticky="w")
        self.voucher_var = tk.StringVar(); self.voucher_combo = ttk.Combobox(right_form_frame, textvariable=self.voucher_var, values=list(VOUCHERS.keys()), width=40, font=FONT_NORMAL); self.voucher_combo.grid(row=4, column=1, padx=5, pady=4, sticky="w")
        self.payment_var = tk.StringVar(value="Chuyển khoản"); payment_frame = ttk.Frame(right_form_frame, style="App.TFrame"); ttk.Radiobutton(payment_frame, text="Chuyển khoản", variable=self.payment_var, value="Chuyển khoản").pack(side="left", padx=(0, 10)); ttk.Radiobutton(payment_frame, text="Tiền mặt", variable=self.payment_var, value="Tiền mặt").pack(side="left"); payment_frame.grid(row=5, column=1, columnspan=2, sticky="w")

        ttk.Button(right_frame, text="✅ Xác nhận & Thanh toán", command=self.confirm_payment).pack(pady=15, fill="x")
        
        # --- TỐI ƯU HIỂN THỊ KẾT QUẢ VÀ QR ---
        result_frame = ttk.Frame(right_frame, style="App.TFrame")
        result_frame.pack(fill="both", expand=True)
        result_frame.columnconfigure(0, weight=1)
        
        self.payment_result = tk.Text(result_frame, width=40, height=12, font=FONT_NORMAL, relief="flat")
        self.payment_result.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        
        self.qr_payment_canvas = tk.Canvas(result_frame, width=180, height=180, bg="white", highlightthickness=0)
        self.qr_payment_canvas.grid(row=0, column=1, sticky="nw")
        result_frame.rowconfigure(0, weight=1)


    # =================================================================
    # CÁC HÀM LOGIC (KHÔNG THAY ĐỔI)
    # =================================================================
    def show_home(self):
        if hasattr(self, "notebook"): self.notebook.destroy()
        if hasattr(self, "home_btn_frame"): self.home_btn_frame.pack_forget()

        self.splash_frame = tk.Frame(self.root)
        self.splash_frame.pack(fill="both", expand=True)

        img = Image.open(BG_IMAGE).resize((self.root.winfo_width(), self.root.winfo_height()))
        self.bg_img = ImageTk.PhotoImage(img)

        canvas = tk.Canvas(self.splash_frame, width=self.root.winfo_width(), height=self.root.winfo_height())
        canvas.pack(fill="both", expand=True)
        canvas.create_image(0, 0, anchor="nw", image=self.bg_img)

        self.create_styled_button(self.splash_frame, "🚀 BẮT ĐẦU", self.start_app, 
                                  font=FONT_LARGE_BOLD, place_x=self.root.winfo_width()//2, place_y=550)

    def upload_image(self):
        file_path = filedialog.askopenfilename(filetypes=[("Image files", "*.jpg;*.png")])
        if file_path:
            self.tray_image = Image.open(file_path)
            # Resize to fit canvas while maintaining aspect ratio
            w, h = self.tray_image.size
            canvas_w = self.canvas.winfo_width()
            canvas_h = self.canvas.winfo_height()
            scale = min(canvas_w/w, canvas_h/h)
            new_w, new_h = int(w*scale), int(h*scale)
            
            self.tk_img = ImageTk.PhotoImage(self.tray_image.resize((new_w, new_h), Image.LANCZOS))
            self.canvas.delete("all")
            self.canvas.create_image(canvas_w//2, canvas_h//2, anchor="center", image=self.tk_img)

    def preprocess(self, pil_img):
        img = pil_img.convert("RGB").resize((self.input_w, self.input_h))
        arr = np.array(img, dtype=np.float32) / 255.0
        return arr[np.newaxis, ...]

    def segment_tray(self, pil_img):
        crops = []; w, h = pil_img.size
        for key in sorted(LAYOUT_KHAY5.keys()):
            x1, y1, x2, y2 = LAYOUT_KHAY5[key]
            box = (int(x1*w), int(y1*h), int(x2*w), int(y2*h))
            crops.append(pil_img.crop(box))
        return crops

    def analyze_and_pay(self):
        if not hasattr(self, "tray_image"):
            messagebox.showwarning("⚠️", "Vui lòng tải ảnh trước!")
            return
        if self.model is None:
            messagebox.showerror("❌", "Model chưa được load!")
            return

        tray_annotated = self.tray_image.copy()
        draw = ImageDraw.Draw(tray_annotated)

        crops = self.segment_tray(self.tray_image)
        total = 0; lines = []

        for i, crop in enumerate(crops):
            arr = self.preprocess(crop)
            raw = self.model.predict(arr, verbose=0)[0]
            idx = np.argmax(raw)
            pred_clean = CLASS_NAMES[idx]

            price = MENU_DATA.get(pred_clean, {}).get("price", 0)
            total += price
            lines.append(f"Ô {i+1}: {pred_clean} - {price:,} VND")

            w, h = self.tray_image.size
            x1, y1, x2, y2 = [int(a * (w if j % 2 == 0 else h)) for j, a in enumerate(LAYOUT_KHAY5[f"Ô {i+1}"])]
            draw.rectangle([x1, y1, x2, y2], outline="red", width=5)
            # Use a basic font if specific one isn't available
            try:
                font = ImageFont.truetype("arial.ttf", 20)
            except IOError:
                font = ImageFont.load_default()
            draw.text((x1+5, y1+5), pred_clean, fill="red", font=font)

        lines.append(f"\n💵 Tổng cộng: {total:,} VND")
        self.result_text.delete("1.0", tk.END); self.result_text.insert(tk.END, "\n".join(lines))
        
        # Display annotated image
        canvas_w = self.canvas.winfo_width()
        canvas_h = self.canvas.winfo_height()
        w, h = tray_annotated.size
        scale = min(canvas_w/w, canvas_h/h)
        new_w, new_h = int(w*scale), int(h*scale)
        self.tk_result_img = ImageTk.PhotoImage(tray_annotated.resize((new_w, new_h), Image.LANCZOS))
        self.canvas.delete("all")
        self.canvas.create_image(canvas_w//2, canvas_h//2, anchor="center", image=self.tk_result_img)

    def show_menu_item(self):
        item = self.menu_combo.get()
        if not item: return
        data = MENU_DATA[item]
        self.menu_text.delete("1.0", tk.END)
        self.menu_text.insert(tk.END, f"{item}\nGiá: {data['price']:,} VND\n{data['desc']}")
        if os.path.exists(data["image_url"]):
            img = Image.open(data["image_url"]).resize((250, 180), Image.LANCZOS)
            self.tk_menu_img = ImageTk.PhotoImage(img)
            self.menu_canvas.create_image(0, 0, anchor="nw", image=self.tk_menu_img)

    def show_combo(self):
        combo = self.combo_combo.get()
        if not combo: return
        data = COMBO_DATA[combo]

        lines = [f"{combo}", f"Giá combo: {data['price']:,} VND", "Món gồm:"]
        sum_items = sum(MENU_DATA.get(it, {}).get("price", 0) for it in data["items"])
        for it in data["items"]:
            p = MENU_DATA.get(it, {}).get("price", "N/A")
            lines.append(f"- {it}: {p:,} VND" if isinstance(p, int) else f"- {it}: —")
            
        lines.append(f"\nTổng giá lẻ tham chiếu: {sum_items:,} VND")
        self.combo_text.delete("1.0", tk.END)
        self.combo_text.insert(tk.END, "\n".join(lines))

        if "image_url" in data and os.path.exists(data["image_url"]):
            img = Image.open(data["image_url"]).resize((250, 180), Image.LANCZOS)
            self.tk_combo_img = ImageTk.PhotoImage(img)
            self.combo_canvas.create_image(0, 0, anchor="nw", image=self.tk_combo_img)

    def custom_meal(self):
        selections = [("Cơm trắng", MENU_DATA["Cơm trắng"]["price"])]
        canh = self.canhs.get()
        if not canh: return messagebox.showerror("❌", "Vui lòng chọn 1 loại canh!")
        selections.append((canh, MENU_DATA[canh]["price"]))

        mains = [m for m,v in self.main_vars.items() if v.get()]
        if len(mains) != 2: return messagebox.showerror("❌", "Vui lòng chọn đúng 2 món chính!")
        for m in mains: selections.append((m, MENU_DATA[m]["price"]))

        side = self.side.get()
        if not side: return messagebox.showerror("❌", "Vui lòng chọn 1 món ăn kèm!")
        selections.append((side, MENU_DATA[side]["price"]))
        
        total = sum(p for _, p in selections)
        lines = ["Bạn đã chọn:"] + [f"- {name}: {price:,} VND" for name, price in selections]
        lines.append(f"\n💵 Tổng cộng: {total:,} VND")
        
        self.custom_text.delete("1.0", tk.END)
        self.custom_text.insert(tk.END, "\n".join(lines))
        self.custom_total = total

    def confirm_payment(self):
        name = self.recipient_name_var.get().strip()
        phone = self.recipient_phone_var.get().strip()
        address = self.address_var.get().strip()
        
        if not name: return messagebox.showerror("❌", "Vui lòng nhập tên người nhận!")
        if not phone or not phone.isdigit() or len(phone) < 9: return messagebox.showerror("❌", "Vui lòng nhập SĐT hợp lệ!")
        if not address: return messagebox.showerror("❌", "Vui lòng chọn địa chỉ giao hàng!")
        
        code = (self.voucher_var.get() or "").strip().upper()
        discount_rate = VOUCHERS.get(code, 0.0)
        
        total_food = getattr(self, "custom_total", 0)
        if total_food == 0: return messagebox.showwarning("⚠️", "Bạn chưa chọn món ăn nào!")
        
        dist = DISTANCE_KM_FROM_B.get(address, 10) # Default distance if not found
        ship_fee = fee_from_distance_km(dist)
        dist_text = f"~{dist:.1f} km"

        discount = int(total_food * discount_rate)
        total = total_food + ship_fee - discount

        lines = [f"👤 Người nhận: {name}", f"📞 SĐT: {phone}",
                 f"🏪 Từ: {SHOP_NAME}", f"🏠 Giao tới: {address} ({dist_text})",
                 "-"*30,
                 f"🍲 Tiền món ăn: {total_food:,} VND",
                 f"🎟️ Voucher '{code if code else 'Không'}': -{discount:,} VND",
                 f"🚚 Phí ship: {ship_fee:,} VND",
                 "="*30,
                 f"💵 TỔNG CỘNG: {total:,} VND",
                 f"💳 Phương thức: {self.payment_var.get()}"]
                 
        self.payment_result.delete("1.0", tk.END)
        self.payment_result.insert(tk.END, "\n".join(lines))
        
        self.qr_payment_canvas.delete("all")
        if self.payment_var.get() == "Chuyển khoản" and os.path.exists(QR_CODE_URL):
            qr_img = Image.open(QR_CODE_URL).resize((200, 200), Image.LANCZOS)
            self.tk_qr_payment = ImageTk.PhotoImage(qr_img)
            self.qr_payment_canvas.create_image(100, 100, anchor="center", image=self.tk_qr_payment)


# ---------------- MAIN ----------------
if __name__ == "__main__":
    root = tk.Tk()
    app = SmartCanteenApp(root)
    root.mainloop()