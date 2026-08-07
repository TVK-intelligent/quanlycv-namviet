# 🎨 Bản Đặc Tả Thiết Kế Giao Diện (Stitch UI Design Spec)
## Phụ trách: Hải Nam (Quản lý Công việc)

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

### ✅ 5.3. Quản lý Công việc

**📋 5.3.1. Danh sách Công việc (Task List)**
- **Layout:** Breadcrumb → Toolbar → Data Table → Pagination
- **Toolbar Components:** Search Title | Project Filter | Priority Filter | Status Filter | Overdue Filter Badge | Primary Button + Tạo Task mới.
- **Table Columns:** Checkbox | Task Code | Title | Category (Project/Dept) | Assignee Avatar | Priority Badge (P1-P4) | SLA | Status Badge | Due Date | Overdue Flag (Gia hạn/Cảnh báo đỏ) | Proof URL Badge | Actions (Xem, Log Time, Sửa, Xóa).

**📌 5.3.2. Bảng Kanban (Kanban Workspace)**
- **Layout:** Breadcrumb → Filter Toolbar → Kanban 5 Columns Board
- **Kanban Columns:** TO_DO | IN_PROGRESS | BLOCKED | IN_REVIEW | DONE
- **Card Components:** Task Title | Project Badge | Priority Badge | Assignee Avatar | DoD Checklist Counter (e.g., 3/5) | Due Date (Đổi đỏ nếu Overdue) | Action Options (...).

**🎯 5.3.3. Sub Task (Công việc con)**
- **Layout:** Breadcrumb → Toolbar → Data Table → Pagination
- **Toolbar Components:** Parent Task Select Filter, Search Sub-task, Primary Button + Thêm Sub Task.
- **Table Columns:** Sub-task Code | Title | Parent Task Name | Assignee | Status | Due Date | Actions (Sửa, Xóa).

---

## 6. MÔ TẢ TẤT CẢ CÁC MODAL HỆ THỐNG

**2. Modal: Create / Edit Task**
- **Header:** Tạo công việc mới / Chỉnh sửa công việc
- **Form Fields:** Title, Description, Task Type (Project/Dept), Project ID / Dept ID, Assignee ID, Tester ID, Priority (P1-P4), Estimated Hours, Start Date, Due Date, DoR Checklist Section (Addable inputs), DoD Checklist Section (Addable inputs).
- **Footer:** Cancel, Save Task

---

## 7. LUỒNG TRẠNG THÁI & WORKFLOWS

**7.1 Luồng Vòng đời Công việc (Task Lifecycle Gateway Workflow)**
```text
       [  TO_DO  ]  <---- (Initial State)
            |
            |--- [Check Gate 1: DoR Checklist == 100%] 
            |    (Nút "Start Working" được mở khóa)
            v
     [ IN_PROGRESS ] <---> [ BLOCKED ] (Nghẽn - Bắt buộc nhập lý do)
            |
            |--- [Check Gate 2: DoD Checklist == 100% AND Proof URL valid]
            |    (Nút "Submit Task" được mở khóa)
            v
      [ IN_REVIEW ] 
            |
            +---> [ QA Tester Reject ] -------> (Trở lại IN_PROGRESS + Bắt buộc nhập lỗi + Trừ điểm FTPR)
            |
            +---> [ QA Tester Pass ] ---------> (Chờ PM Approve)
                                                    |
                                                    v
                                                [  DONE  ] (Khóa dữ liệu Log-time & Chốt điểm KPI On-time)
```
