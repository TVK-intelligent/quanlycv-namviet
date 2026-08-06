# 🎨 Bản Đặc Tả Thiết Kế Giao Diện (Stitch UI Design Spec)
## Phụ trách: Khải Trần Văn (Trang chủ & Hệ thống)

### 1. Tiêu chuẩn Giao diện Chung (Global UI Standards) ⭐⭐⭐⭐⭐
Vì Khải phụ trách Layout và Components dùng chung, bạn cần thiết kế sẵn các thành phần sau để cả team tái sử dụng:
*   **Responsive (Bắt buộc)**:
    *   **Desktop**: Hiển thị Sidebar cố định bên trái.
    *   **Tablet/Mobile**: Sidebar bị ẩn, hiển thị Menu Hamburger (☰) trên Header để bấm xổ ra. Table có thể cuộn ngang.
*   **Breadcrumb**: Mọi trang đều phải có luồng điều hướng ở Header. Ví dụ: `Dashboard > Project > Chi tiết`.
*   **Toast Notification (Thông báo góc màn hình)**: Hiển thị góc trên bên phải sau mỗi thao tác (Thêm/Sửa/Xóa).
    *   ✅ Thành công (Màu xanh).
    *   ❌ Thất bại/Lỗi (Màu đỏ).
*   **Loading State**:
    *   Sử dụng **Spinner** cho các nút bấm khi đang call API (VD: nút "Lưu đang quay quay").
    *   Sử dụng **Skeleton Card / Skeleton Table** khi lần đầu load trang (chưa có data).
*   **Confirm Modal (Xác nhận Xóa)**:
    *   Mẫu chung: "Bạn có chắc chắn muốn xóa [Tên đối tượng] này?" kèm 2 nút `[Hủy]` và `[Xóa]` (Nút xóa màu đỏ).
*   **Empty State (Trạng thái rỗng)**:
    *   Khi bảng chưa có dữ liệu, KHÔNG để trắng. Phải hiện Icon/Hình minh họa (VD: Hình folder trống) kèm Text "Chưa có dữ liệu" và nút `[+ Tạo mới]`.
*   **Standard Table & Pagination**:
    *   Table phải có: Cột STT, Checkbox (đầu hàng), Nút Sort ở header, và Cột Action (Sửa/Xóa) ở cuối.
    *   Pagination (Phân trang): Dropdown chọn số dòng `10 / 20 / 50 per page`.

### 2. Layout Tổng thể (Base Layout)
*   **Sidebar & Header**: Chứa Logo, Menu điều hướng, thanh Search tổng, Avatar.
*   **Main Content (Giữa)**: Khu vực render nội dung các trang con.

### 3. Màn hình Dashboard Tổng quan (`pages/dashboard/dashboard.html`)
*   **Thẻ thống kê (Cards)**: Tổng số Project, Task, Nhân viên, Phòng ban.
*   **Danh sách hiển thị nhanh**: Kế thừa Standard Table và Empty State.
    *   Công việc của tôi (My Tasks).
    *   Project gần đây.
    *   Task gần đây.
    *   Task sắp đến hạn (Hiển thị nổi bật/màu đỏ cảnh báo).

### 4. Màn hình Hồ sơ Cá nhân (`pages/profile/profile.html`)
*   **Fields**: Hiển thị Avatar, Họ tên, Email, Phòng ban, Vai trò.
*   **Đặc tả Mật khẩu (Password)**:
    *   KHÔNG hiển thị rõ mật khẩu, KHÔNG cần nút "Hiện mật khẩu".
    *   Chỉ hiển thị dòng chữ: `Mật khẩu: ••••••••` kèm nút `[Đổi mật khẩu]` kế bên.

### 5. Màn hình Đổi Mật khẩu (`pages/profile/change-password.html`)
*   **Form Validation**: Mật khẩu mới không được trùng mật khẩu cũ, Mật khẩu xác nhận phải khớp.
*   **Buttons**: `Lưu thay đổi` (Bấm vào hiện Toast), `Hủy`.
