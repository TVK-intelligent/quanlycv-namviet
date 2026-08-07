# 🎨 Bản Đặc Tả Thiết Kế Giao Diện (Stitch UI Design Spec)
## Phụ trách: Phong (Quản lý Dự án)

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

### 📁 5.2. Quản lý Dự án

**📄 5.2.1. Danh sách Dự án**
- **Layout:** Breadcrumb → Toolbar → Tree Table → Pagination
- **Toolbar Components:** Search Box (Mã/Tên dự án), Status Filter Dropdown, Primary Button + Thêm dự án.
- **Table Columns:** Checkbox | Mã dự án | Tên dự án | PM Phụ trách | Trọng số (%) | Tiến độ Roll-up (%) | Trạng thái | Start Date | End Date | Actions (Xem, Sửa, Xóa).

**👥 5.2.2. Thành viên Dự án**
- **Layout:** Breadcrumb → Toolbar → Data Table → Pagination
- **Toolbar Components:** Project Filter Dropdown, Search Member Name, Primary Button + Thêm thành viên.
- **Table Columns:** Avatar | Họ tên | Email | Dự án | Vai trò (PM/Dev/Tester/Client) | Allocated Capacity (%) | Joined Date | Actions (Sửa Capacity, Gỡ).

**🤝 5.2.3. Yêu cầu Nhân lực (Resource Requests)**
- **Layout:** Breadcrumb → Toolbar → Data Table → Pagination
- **Toolbar Components:** Status Filter (PENDING, APPROVED, REJECTED), Search Project, Primary Button + Tạo yêu cầu.
- **Table Columns:** Mã đơn | Dự án | Phòng ban bị mượn | Vai trò cần | Số lượng | Capacity % | Thời gian mượn | Trạng thái Badge | Actions (Chi tiết, Duyệt/Từ chối).

---

## 6. MÔ TẢ TẤT CẢ CÁC MODAL HỆ THỐNG

**1. Modal: Create / Edit Project**
- **Header:** Tạo dự án mới / Chỉnh sửa dự án
- **Form Fields:** Project Code, Project Name, Parent Project ID (Select), Client Name, PM User ID (Select), Weightage %, Budget, Start Date, End Date, Priority, Description.
- **Footer:** Cancel, Save Project

**6. Modal: Create Resource Request**
- **Header:** Tạo Yêu cầu mượn Nhân sự
- **Form Fields:** Select Project, Select Target Department, Required Role, Quantity, % Capacity Requested, Start Date, End Date, Note.
- **Footer:** Cancel, Submit Request

---

## 7. LUỒNG TRẠNG THÁI & WORKFLOWS

**7.2 Luồng Duyệt Cấp Nhân sự (Resource Request Workflow)**
1. PM tạo ResourceRequest (% Capacity, Target Dept) → Status = PENDING.
2. Trưởng phòng (Head) mở Dashboard Sức tải → Xem chỉ số WSI dự kiến của nhân viên.
3. Head chọn Approve (Chỉ định nhân sự) → Status = APPROVED, tạo ProjectMember | Hoặc chọn Reject → Kích hoạt Modal nhập lý do từ chối → Status = REJECTED.
