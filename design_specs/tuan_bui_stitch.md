# 🎨 Bản Đặc Tả Thiết Kế Giao Diện (Stitch UI Design Spec)
## Phụ trách: Tuấn Bùi (Báo cáo & Thống kê)

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
- Tên dự án: ETRMS (Enterprise Task & Resource Management System).
- Công nghệ: HTML5 + CSS3 + JavaScript (ES6) (Frontend Single Page Application / Static HTML). Không Backend, Không API, Không Database.
- Lưu trữ dữ liệu: Mô phỏng hoàn toàn bằng LocalStorage (Mock Data & Client-side State Management).
- Phong cách thiết kế: Enterprise, hiện đại, tối giản, chuyên nghiệp, lấy cảm hứng từ Jira, Redmine và ClickUp.

## 2. DESIGN SYSTEM & ATOMIC COMPONENTS
*(Theo tài liệu chuẩn UI Baseline của dự án, xem mục 2 tài liệu gốc)*

## 3. LAYOUT CHUNG (APPLICATION LAYOUT)
*(Kế thừa cấu trúc Header, Sidebar, Content, Footer chung)*

---

## 5. ĐẶC TẢ CHI TIẾT TỪNG TRANG (PAGE SPECIFICATIONS)

### 📊 06. BÁO CÁO & THỐNG KÊ

**📈 5.6.1. Thống kê Tổng quan (Dashboard Analytics)**
- **Layout:** Breadcrumb → Filter Bar → Interactive Charts Grid
- **Toolbar Components:** Select Date Range (From Date - To Date), Select Project, Select Dept, Export Button (Export PDF / Excel).
- **Charts Display:** Donut Chart (Task Status Breakdown), Bar Chart (Dept WSI Workload Average), Line Chart (Milestone Completion Velocity).

**📁 5.6.2. Báo cáo Dự án**
- **Layout:** Breadcrumb → Filter Bar → Data Table
- **Table Columns:** Mã dự án | Tên dự án | PM | Tổng số Task | Task Hoàn thành | Task Trễ hạn | Tỷ lệ trễ % | Tong Est Hours | Tong Logged Hours | Roll-up Progress %.

**✅ 5.6.3. Báo cáo Công việc**
- **Layout:** Breadcrumb → Filter Bar → Data Table
- **Table Columns:** Phòng ban | Tổng Task | Task DONE | Task IN_PROGRESS | Task BLOCKED | Task Overdue | Tỷ lệ Hoàn thành đúng hạn %.

**👥 5.6.4. Báo cáo KPI Nhân sự (KPI Engine)**
- **Layout:** Breadcrumb → Filter Bar (Month/Year) → KPI Engine Data Table → Primary Action: Snapshot KPI Month
- **Table Columns:** Avatar & Họ tên | Phòng ban | Tháng/Năm | On-Time Rate (%) | First-Time Pass Rate - FTPR (%) | Logged Hours | Final Auto KPI Score | Actions (Xem Lịch sử, Chốt điểm KPI).
