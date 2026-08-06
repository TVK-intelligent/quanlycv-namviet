# 🎨 Bản Đặc Tả Thiết Kế Giao Diện (Stitch UI Design Spec)
## Phụ trách: Lê Gia Bách (Quy trình Công việc)

### 1. Tất cả Màn hình Danh sách (Checklist, Timesheet, Review, Extension)
*   **Tiêu chuẩn chung**:
    *   Phải có **Search Box**, **Filter**, nút **Refresh**.
    *   Dùng **Standard Table**: Cột STT, Sort, Action, Checkbox.
    *   Dùng **Pagination** đồng nhất (10/20/50 dòng 1 trang).
    *   **Empty State**: Trống dữ liệu phải hiện hình minh họa thay vì bảng trắng.
    *   **Thao tác Xóa**: Bất kỳ hành động Xóa log, Xóa checklist nào đều phải qua **Confirm Modal**.
    *   **Thông báo**: Mọi hành động thao tác dữ liệu đều kết thúc bằng **Toast Notification** (✅ hoặc ❌).

### 2. Màn hình Checklist (`pages/workflow/checklist.html`)
*   Quản lý bộ thư viện Checklist mẫu. Validation: Tên checklist không được trống.

### 3. Màn hình Khai báo Timesheet (`pages/workflow/timesheet.html`)
*   **Form Validation**:
    *   `Ngày làm việc`: Datepicker (Mặc định hôm nay).
    *   `Số giờ làm`: Bắt buộc lớn hơn 0 và Max = 16h/ngày.
    *   `Ghi chú công việc`: Textarea (Bắt buộc không được để trống).

### 4. Màn hình Duyệt Task (`pages/workflow/review.html`)
*   **Breadcrumb**: `Dashboard > Quy trình > Duyệt Task`.
*   **Trường hợp Reject**: Bắt buộc nhập `Lý do từ chối` (Validation: Không được để trống). Bấm duyệt/từ chối phải hiện loading Spinner và Toast xanh/đỏ báo kết quả.

### 5. Màn hình Yêu cầu Gia hạn (`pages/workflow/extension-request.html`)
*   **Form Validation**:
    *   `Hạn mới đề xuất`: Phải lớn hơn Hạn hiện tại.
    *   `Chi tiết lý do`: Bắt buộc nhập.
