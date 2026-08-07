# 🎨 Bản Đặc Tả Thiết Kế Giao Diện (Stitch UI Design Spec)
## Phụ trách: Khai Trần Văn (Dashboard)

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
- Tên dự án: ETRMS (Enterprise Task & Resource Management System).
- Mục tiêu: Hệ thống Quản trị Dự án và Vận hành Phòng ban doanh nghiệp.
- Công nghệ: HTML5 + CSS3 + JavaScript (ES6) (Frontend Single Page Application / Static HTML). Không Backend, Không API, Không Database.
- Lưu trữ dữ liệu: Mô phỏng hoàn toàn bằng LocalStorage (Mock Data & Client-side State Management).
- Phong cách thiết kế: Enterprise, hiện đại, tối giản, chuyên nghiệp, lấy cảm hứng từ Jira, Redmine và ClickUp.

## 2. DESIGN SYSTEM & ATOMIC COMPONENTS
### 2.1 Bảng màu (Color Palette)
- Màu chủ đạo (Primary): Royal Blue (#1890FF / #096DD9), Pure White (#FFFFFF).
- Màu trung tính (Neutrals): Dark Gray Text (#262626), Gray Border (#D9D9D9), Background Light Gray (#F5F5F5).
- Màu trạng thái Sức tải (WSI Capacity): Rảnh rỗi (<100% WSI): Green (#52C41A), Đủ tải (100% WSI): Yellow (#FAAD14), Quá tải (>100% WSI - Alert): Red (#FF4D4F).
- Màu độ ưu tiên (Task Priority): P1_URGENT: Dark Red (#CF1322), P2_HIGH: Orange (#FA8C16), P3_MEDIUM: Blue (#1890FF), P4_LOW: Gray (#8C8C8C).

### 2.2 Quy chuẩn UI Baseline
- Typography: Font family Inter, -apple-system, Roboto. Font sizes: Title (20-24px Bold), Subtitle (16px Semi-bold), Body (14px Regular), Caption (12px Light).
- Border Radius: Default 6px (Buttons, Inputs, Cards), Pills 16px (Badges), Modal 8px.
- Buttons:
  - Primary Button: Nền Blue (#1890FF), chữ trắng (Lưu, Xác nhận, Start Working, Submit Task, Approve).
  - Secondary Button: Border Gray, nền trắng, chữ xám (Hủy, Quay lại, Log Time).
  - Danger Button: Nền Red (#FF4D4F), chữ trắng (Xóa, Reject - Kích hoạt Modal bắt buộc lý do).
- Cards: White bg, shadow 0 2px 8px rgba(0,0,0,0.06), border 1px solid #F0F0F0.
- Inputs & Selects: Height 32px/40px, border #D9D9D9, focus border #40A9FF with box-shadow ripple.
- Badges: Padding 2px 8px, border-radius 10px, font-size 12px (Dùng cho Priority, Status, Overdue Flag).
- Progress Bar: Height 8px, border-radius 4px, dynamic fill color (Xanh/Vàng/Đỏ tùy theo WSI % hoặc Progress %).
- Data Table: Header background #FAFAFA, row hover background #E6F7FF, cell padding 12px 16px, border-bottom 1px solid #F0F0F0.
- Modal: Overlay background rgba(0, 0, 0, 0.45), centered modal box, header with close X, sticky footer buttons.
- Toast / Notifications: Top-right floating banner (Success Green, Error Red, Info Blue).
- Charts: Canvas / SVG based lightweight graphs (Donut Chart, Bar Chart, Line Chart).

## 3. LAYOUT CHUNG (APPLICATION LAYOUT)
```text
+-----------------------------------------------------------------------------+
|                                    HEADER                                   |
| Logo ETRMS | Page Title | Global Search | Notifications | User Avatar Dropdown |
+--------------+--------------------------------------------------------------+
|              | BREADCRUMB: Home / Module / Current Page                      |
|              +--------------------------------------------------------------+
|   SIDEBAR    | TOOLBAR: Search Box | Filters | Grouping | Primary Action Btn |
|  (Left Fixed |+--------------------------------------------------------------+
| Collapsible  |                                                              |
|  Accordion)  |                         MAIN CONTENT                         |
|              |          (Data Tables / Cards / Kanban / Analytics)          |
|              |                                                              |
|              +--------------------------------------------------------------+
|              | FOOTER: © 2026 ETRMS System - LocalStorage Mode              |
+--------------+--------------------------------------------------------------+
```

## 4. CÂY MENU ĐẦY ĐỦ (SIDEBAR ACCORDION NAVIGATION)
- 🏠 Dashboard (Direct Link - Pure Read-only Monitoring Portal)
- 📁 Quản lý Dự án (Expandable Submenu)
- ✅ Quản lý Công việc (Expandable Submenu)
- 👥 Quản lý Nhân sự (Expandable Submenu)
- 📝 Quy trình Công việc (Expandable Submenu)
- 📊 Báo cáo & Thống kê (Expandable Submenu)
- 👤 Hồ sơ cá nhân (Expandable Submenu)

---

## 5. ĐẶC TẢ CHI TIẾT TỪNG TRANG (PAGE SPECIFICATIONS)

### 🏠 5.1. Dashboard (Trang chủ)
**Mục đích:** Màn hình giám sát và cảnh báo thời gian thực. HOÀN TOÀN KHÔNG CÓ ACTION/NÚT TẠO MỚI.
**Layout:** Breadcrumb → KPI Summary Grid → Main Monitoring Grid
**Nội dung hiển thị:**
- **KPI Cards Grid (4 Cards):** Total Projects, Total Tasks (Open/Closed), Total Employees, Company On-Time Rate %.
- **Thanh Cảnh báo Sức tải WSI (Capacity Alert List):** Danh sách nhân sự kèm thanh Progress Bar đổi màu (Xanh <100%, Vàng 100%, Đỏ >100%).
- **Công việc của tôi Table:** Task Title, Project, Status, Priority Badge, Due Date, DoR Status.
- **Hòm thư Yêu cầu & Cảnh báo (Pending Approvals Inbox):** Danh sách đơn chờ duyệt. Click vào item sẽ Navigate sang trang xử lý tương ứng.
