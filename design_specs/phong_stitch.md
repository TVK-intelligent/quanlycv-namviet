# 🎨 Bản Đặc Tả Thiết Kế Giao Diện (Stitch UI Design Spec)
## Phụ trách: Phong (Quản lý Dự án)

### 1. Màn hình Danh sách Dự án (`pages/project/project-list.html`)
*   **Layout**: Kế thừa Standard Table, Search + Filter thống nhất, Pagination (10/20/50).
*   **Components**: Search Box (Tìm tên/mã), Bộ lọc (Theo trạng thái), Nút "Refresh".
*   **Empty State**: Nếu chưa có dự án, hiển thị icon 📁 "Chưa có Project nào" kèm nút `[+ Tạo Project]`.
*   **Table Columns**: Checkbox, STT, Mã dự án, Tên dự án, Trạng thái, Ngày tạo, Action (Xem, Sửa, Xóa).
*   **Thao tác Xóa**: Bắt buộc hiện **Confirm Modal** ("Bạn có chắc chắn muốn xóa Project này?"). Xóa xong hiện Toast "✅ Xóa thành công".

### 2. Màn hình Form Dự án (Thêm/Sửa) (`pages/project/project-form.html`)
*   **Fields & Validation (Bắt buộc) ⭐**:
    *   `Tên dự án`: Input text - Không được để trống.
    *   `Mã dự án (Code)`: Input text - Không được để trống.
    *   `Dự án cha`: Dropdown.
    *   `Mô tả dự án`: Textarea.
    *   `Ngày bắt đầu` & `Ngày kết thúc`: Datepicker - Validation: **Ngày kết thúc phải lớn hơn ngày bắt đầu**.
*   **Thao tác Lưu**: Bấm Lưu hiện Skeleton/Spinner. Lưu thành công hiện Toast "✅ Thêm/Cập nhật thành công".

### 3. Màn hình Chi tiết Dự án (`pages/project/project-detail.html`)
*   **Breadcrumb**: `Dashboard > Project > Tên dự án`.
*   **Nội dung**: Thông tin chung, Tiến độ (Progress Bar).

### 4. Màn hình Thành viên Dự án (`pages/project/project-member.html`)
*   **Layout**: Standard Table, Empty State.
*   **Modal Thêm**: Chọn User, set `Allocated Capacity` (%), Chọn Role.

### 5. Màn hình Yêu cầu Nhân lực (`pages/project/resource-request.html`)
*   **Layout**: Gồm Danh sách (Standard Table) và Modal tạo yêu cầu.
*   **Validation**: Chọn Dự án (Bắt buộc), Chọn Phòng ban (Bắt buộc), Số lượng (Bắt buộc > 0), Từ ngày -> Đến ngày (Hợp lệ).
