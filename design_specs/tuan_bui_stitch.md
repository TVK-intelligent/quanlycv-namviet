# 🎨 Bản Đặc Tả Thiết Kế Giao Diện (Stitch UI Design Spec)
## Phụ trách: Tuấn Bùi (Báo cáo & Thống kê)

### 1. Giao diện Tổng quan Báo cáo (`pages/report/report.html`)
*   **Tiêu chuẩn chung**:
    *   **Loading State**: Khi đang tải số liệu/biểu đồ, phải hiển thị **Skeleton Layout** hoặc **Spinner** ở giữa các khung chart. Tuyệt đối không để trống màn hình gây cảm giác giật lag.
    *   **Breadcrumb**: `Dashboard > Báo cáo > Tổng quan`.
    *   **Responsive**: Trên Desktop chart hiển thị dàn ngang, trên Mobile/Tablet các chart tự động xếp dọc (stack) xuống dưới.
*   **Bộ lọc toàn cục (Global Filters)**:
    *   Lọc theo thời gian (Date Range Picker).
    *   Lọc theo Dự án & Phòng ban (Dropdown). Tích hợp nút `Refresh` để tải lại báo cáo.

### 2. Màn hình Biểu đồ (`pages/report/charts.html`)
*   **Empty State**: Nếu Project/Phòng ban được chọn chưa có dữ liệu để vẽ biểu đồ, render ra icon "Chưa có dữ liệu" ở giữa khung vẽ chart thay vì vẽ biểu đồ trống.
*   **Biểu đồ Sức tải Nhân sự (WSI - Workload Share Index)**:
    *   Dạng Horizontal Bar Chart (Thanh ngang).
    *   Màu Xanh lá (<100%), Màu Vàng (=100%), Màu Đỏ đậm (>100% - Quá tải).

### 3. Màn hình Thống kê chi tiết (`pages/report/statistics.html`)
*   **Layout Data Table**:
    *   Kế thừa **Standard Table**: Có STT, Sort các cột (như Sort theo % KPI).
    *   Kế thừa **Pagination thống nhất** (10/20/50).
    *   Sử dụng Checkbox nếu có tính năng Export báo cáo hàng loạt.
