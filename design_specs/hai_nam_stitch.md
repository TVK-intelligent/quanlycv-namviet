# 🎨 Bản Đặc Tả Thiết Kế Giao Diện (Stitch UI Design Spec)
## Phụ trách: Hải Nam (Quản lý Công việc)

### 1. Màn hình Danh sách Task (`pages/task/task-list.html`) & Công việc của tôi (`my-task.html`)
*   **Layout**: Kế thừa Standard Table, Search + Filter thống nhất, Pagination (10/20/50).
*   **Components**: Search Box (Tìm tên Task), Bộ lọc (Theo Status, Priority, Project), Nút "Refresh".
*   **Empty State**: Nếu chưa có Task, hiển thị hình minh họa "Chưa có công việc nào" kèm nút `[+ Tạo Task]`.
*   **Table Columns**: Checkbox, STT, Tên Task, Project, Assignee, Status, Priority, Due Date, Action.
*   **Thao tác Xóa**: Bấm xóa phải hiện **Confirm Modal** ("Bạn có chắc chắn muốn xóa Task này?"). Thành công báo Toast xanh.

### 2. Màn hình Form Task (Thêm/Sửa) (`pages/task/task-form.html`)
*   **Fields & Validation (Bắt buộc) ⭐**:
    *   `Tiêu đề Task`: Input text - Không được để trống.
    *   `Dự án` hoặc `Phòng ban`: Radio/Dropdown - Dự án bắt buộc chọn (nếu là task dự án).
    *   `Người thực hiện (Assignee)`: Dropdown - Bắt buộc chọn.
    *   `Số giờ ước tính (Estimated Hours)`: Input number - Bắt buộc phải lớn hơn 0.
    *   `Mức độ ưu tiên`: Dropdown.
    *   `Ngày bắt đầu` & `Hạn chót`: Datepicker (Hạn chót > Ngày bắt đầu).
    *   `Mô tả chi tiết`: Rich Text Editor.
*   **Thao tác Lưu**: Bấm Lưu hiện Spinner. Khi thành công hiện Toast "✅ Thêm/Cập nhật thành công".

### 3. Màn hình Chi tiết Task (`pages/task/task-detail.html`)
*   **Breadcrumb**: `Dashboard > Task > Chi tiết Task`.
*   **Layout**: Modal hoặc Trang rời.
    *   Khu vực Checkbox **DoR** & **DoD**.
    *   `Proof URL` (Input text yêu cầu bắt đầu bằng http:// hoặc https://).

### 4. Màn hình Quản lý Subtask (`pages/task/subtask.html`)
*   Kế thừa Standard Table. Nút xóa Subtask cũng phải có Confirm Modal.
