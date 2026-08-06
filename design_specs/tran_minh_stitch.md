# 🎨 Bản Đặc Tả Thiết Kế Giao Diện (Stitch UI Design Spec)
## Phụ trách: Trần Minh (Quản lý Nhân sự)

### 1. Màn hình Danh sách Nhân viên (`pages/employee/employee-list.html`)
*   **Layout**: Standard Table (Checkbox, STT, Action), Search Box (Tìm tên), Filter (Theo phòng ban/vai trò), Pagination, Refresh.
*   **Empty State**: Minh họa "Chưa có nhân viên" kèm nút `[+ Thêm nhân viên]`.
*   **Table Columns**: Họ và Tên, Email, Quyền hệ thống, Trạng thái.
*   **Thao tác Xóa**: Bắt buộc hiện **Confirm Modal** ("Bạn có chắc chắn muốn xóa Employee này?").

### 2. Màn hình Form Nhân viên (Thêm/Sửa) (`pages/employee/employee-form.html`)
*   **Fields & Validation (Bắt buộc) ⭐**:
    *   `Họ và Tên`: Input text - Không được để trống.
    *   `Email`: Input email - Phải đúng định dạng email (VD: abc@domain.com).
    *   `Mật khẩu tạm`: Input password.
    *   `Quyền Hệ thống` (ADMIN/USER).
    *   Khu vực gán Phòng ban: Chọn phòng ban, Chọn Role.
*   **Thao tác Lưu**: Hiện Toast "✅ Thêm/Cập nhật thành công" hoặc Toast đỏ nếu lỗi Email trùng lặp.

### 3. Màn hình Chi tiết Nhân viên (`pages/employee/employee-detail.html`)
*   **Breadcrumb**: `Dashboard > Nhân sự > Hồ sơ nhân viên`.

### 4. Màn hình Phòng ban (`pages/employee/department.html`)
*   **Layout**: Danh sách Department (Standard Table, Pagination, Empty State, Confirm Modal khi xóa).
*   **Form Validation**: Tên phòng ban và Mã phòng ban không được để trống.

### 5. Màn hình Thành viên Phòng ban (`pages/employee/department-member.html`)
*   Kế thừa Standard Table và Search Filter.
