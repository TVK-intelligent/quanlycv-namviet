# 🎨 Bản Đặc Tả Thiết Kế Giao Diện (Stitch UI Design Spec)
## Phụ trách: Trần Minh (Quản lý Nhân sự & Phòng ban, Phân quyền)

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

### 👥 5.4. Quản lý Nhân sự & Phòng ban

**👤 5.4.1. Danh sách Nhân viên**
- **Layout:** Breadcrumb → Toolbar → Data Table / Capacity Grid → Pagination
- **Toolbar Components:** Search Name/Email | Dept Filter | System Role Filter | View Switcher (Table / WSI Cards) | Primary Button + Thêm nhân viên.
- **Table Columns:** Avatar | Họ tên | Email | Phone | Phòng ban chính | Dept Role | System Role | WSI Capacity Bar (%) | Actions (Chi tiết, Sửa, Xóa).

**🏢 5.4.2. Danh sách Phòng ban**
- **Layout:** Breadcrumb → Toolbar → Tree Table / Org Chart
- **Toolbar Components:** Search Dept Code/Name, Primary Button + Thêm phòng ban.
- **Table Columns:** Mã phòng ban | Tên phòng ban | Phòng ban cha | Trưởng phòng (Head) | Số nhân sự | Task định kỳ | Actions (Sửa, Xóa).

**👥 5.4.3. Thành viên Phòng ban**
- **Layout:** Breadcrumb → Toolbar → Data Table → Pagination
- **Toolbar Components:** Dept Filter Dropdown, Search Member Name, Primary Button + Gán thành viên.
- **Table Columns:** Avatar | Họ tên | Email | Chức vụ trong phòng (HEAD, DEPUTY, MEMBER) | Danh sách dự án đang làm | Actions (Sửa chức vụ, Xóa khỏi phòng).

**🔑 5.4.4. Phân quyền & Vai trò (RBAC)**
- **Layout:** Breadcrumb → Role Selector → Permission Matrix Table
- **Toolbar Components:** Select Role (ADMIN, HEAD, PM, DEV, TESTER, CLIENT), Button Lưu cấu hình Quyền.
- **Table Columns:** Danh mục Chức năng | Quyền Xem (Read) | Quyền Tạo (Create) | Quyền Sửa (Update) | Quyền Xóa (Delete) | Quyền Phê duyệt (Approve) | Checkbox Matrix.

### 👤 07. HỒ SƠ CÁ NHÂN
**👤 5.7.1. Thông tin cá nhân**
- **Layout:** Breadcrumb → Two-Column Layout (Personal Details Card | Assigned Projects Card)
- **Fields Display:** Avatar, Full Name, Email, Phone, Dept, Dept Role, System Role, List of Participating Projects with Allocated Capacity %. Button Chỉnh sửa Profile.

**🔑 5.7.2. Đổi mật khẩu**
- **Layout:** Breadcrumb → Centered Form Card
- **Form Fields:** Current Password, New Password, Confirm New Password. Primary Button Đổi Mật khẩu.

---

## 6. MÔ TẢ TẤT CẢ CÁC MODAL HỆ THỐNG

**8. Modal: Create / Edit Employee**
- **Header:** Thêm mới / Chỉnh sửa Nhân viên
- **Form Fields:** Avatar Upload, Full Name, Email, Phone, Username, Password, Primary Dept ID, Dept Role (HEAD, DEPUTY, TEAM_LEAD, MEMBER), System Role (ADMIN, USER).
- **Footer:** Cancel, Save Employee

**9. Modal: Create / Edit Department**
- **Header:** Tạo mới / Chỉnh sửa Phòng ban
- **Form Fields:** Dept Code, Dept Name, Parent Dept ID (Select), Head User ID (Select).
- **Footer:** Cancel, Save Department
