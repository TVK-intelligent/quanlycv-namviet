# 🎨 Bản Đặc Tả Thiết Kế Giao Diện (Stitch UI Design Spec)
## Phụ trách: Lê Gia Bách (Quy trình Công việc, Timesheet, Gia hạn, Lặp lại)

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

### 📝 5.5. Quy trình Công việc & Timesheet

**☑️ 5.5.1. Quality Checklist (DoR / DoD Templates)**
- **Layout:** Breadcrumb → Toolbar → Data Table
- **Toolbar Components:** Type Filter (DoR/DoD), Dept Filter, Search Template, Primary Button + Tạo Mẫu Checklist.
- **Table Columns:** Tên mẫu Checklist | Loại (DoR/DoD) | Phòng ban áp dụng | Số lượng mục tiêu chuẩn | Ngày tạo | Actions (Sửa, Xóa).

**⏱️ 5.5.2. Timesheet & Quản lý Log-time**
- **Layout:** Breadcrumb → Date Navigator Toolbar (Week/Month) → Timesheet Grid Table
- **Toolbar Components:** Select Staff, Select Month/Year, Filter Dept, Primary Button Duyệt Bảng công.
- **Grid Components:** Dòng Nhân sự vs Các Cột Ngày trong Tuần/Tháng. Ô hiển thị tổng số giờ Logged. Cảnh báo đỏ nếu = 0h hoặc > 16h/ngày.

**🔍 5.5.3. Review & Phê duyệt Công việc**
- **Layout:** Breadcrumb → Filter Toolbar → Data Table
- **Toolbar Components:** Search Task Title, Review Status Filter (Pending QA / Pending PM), Project Filter.
- **Table Columns:** Task Title | Assignee | Tester | Proof URL Link | DoD % (100%) | Lịch sử nộp | Actions (Pass, Reject - Kèm popup lý do, Internal Approve).

**📅 5.5.4. Gia hạn Công việc (Task Extension Requests)**
- **Layout:** Breadcrumb → Toolbar → Data Table
- **Toolbar Components:** Status Filter (PENDING, APPROVED, REJECTED), Search Task, Primary Button + Xin gia hạn.
- **Table Columns:** Task Title | Người xin | Hạn hiện tại | Hạn đề xuất mới | Lý do gia hạn | Trạng thái (PENDING, APPROVED, REJECTED) | Actions (Duyệt - Reset Overdue, Từ chối - Kèm popup lý do).

**🔄 5.5.5. Task Định kỳ (Recurring Scheduler)**
- **Layout:** Breadcrumb → Toolbar → Data Table
- **Toolbar Components:** Dept Filter, Status Filter (ACTIVE/INACTIVE), Search Title, Primary Button + Tạo Cấu hình Lặp.
- **Table Columns:** Tên Task định kỳ | Phòng ban | Người thực hiện mặc định | Chu kỳ (Daily, Weekly, Monthly) | Cron Time | Status (ACTIVE/INACTIVE) | Actions (Sửa, Bật/Tắt).

**🔀 5.5.6. Yêu cầu Thay đổi (Change Requests - CR)**
- **Layout:** Breadcrumb → Toolbar → Data Table
- **Toolbar Components:** Project Filter, Status Filter, Search CR Code, Primary Button + Tạo Yêu cầu CR.
- **Table Columns:** Mã CR | Khách hàng | Dự án | Mô tả | Đánh giá tác động (Extra Hours, Extra Cost, New Due Date) | Status | Actions (PM Đánh giá, Client Accept/Cancel).

---

## 6. MÔ TẢ TẤT CẢ CÁC MODAL HỆ THỐNG

**3. Modal: Log Time**
- **Header:** Khai báo giờ làm việc (Log Time)
- **Form Fields:** Select Task, Spent Date, Logged Hours (Max 16h/day), Work Description.
- **Footer:** Cancel, Save Log

**4. Modal: Reject Action (Dùng cho QA Review, Gia hạn, Resource Request)**
- **Header:** Xác nhận Từ chối (Reject)
- **Form Fields:** Rejection Reason / Bug Details (Textarea Input, Required - Minimum 10 Characters).
- **Footer:** Cancel, Confirm Reject (Danger Button)

**5. Modal: Submit Task (Chuyển sang IN_REVIEW)**
- **Header:** Nộp bài kiểm thử & Đóng Task
- **Form Fields:** DoD Checklist Verification (Tích chọn 100%), Proof URL (URL Input, Required - Must start with http:// or https://), Submission Note.
- **Footer:** Cancel, Submit for Review

**7. Modal: Task Extension Request**
- **Header:** Yêu cầu Gia hạn Deadline
- **Form Fields:** Select Task, Current Due Date (Read-only), Proposed Due Date (Must be after Current Due Date), Reason Category (Technical, Resource, Client Scope), Detailed Reason.
- **Footer:** Cancel, Send Request

**10. Modal: Create Recurring Task Config**
- **Header:** Tạo Cấu hình Task Định kỳ
- **Form Fields:** Task Title, Description, Dept ID, Default Assignee ID, Schedule Cron Expression (Daily, Weekly, Monthly, Specific Time), Estimated Hours, DoD Checklist.
- **Footer:** Cancel, Save Recurring Config

---

## 7. LUỒNG TRẠNG THÁI & WORKFLOWS

**7.3 Luồng Lùi Deadline & Overdue Flag**
1. Cron job quét thời gian thực: Nếu Current_Date > DueDate AND Status != DONE → IsOverdue = true (Badge đỏ).
2. Nhân viên tạo TaskExtensionRequest → PM/Head Approve → DueDate cập nhật ngày mới & IsOverdue tự động reset về false.
