# 🚀 Work Management - Enterprise Task & Resource Management System

![Work Management Cover](https://img.shields.io/badge/Status-In%20Development-blue?style=for-the-badge) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**Work Management** là hệ thống Quản trị Dự án và Vận hành Phòng ban doanh nghiệp được thiết kế theo chuẩn giao diện Enterprise hiện đại (lấy cảm hứng từ Jira, Redmine, ClickUp).

Hệ thống hoạt động hoàn toàn ở phía Client-side (Frontend Only) dưới dạng một Single Page Application giả lập, sử dụng **LocalStorage** để mô phỏng cơ sở dữ liệu. Không yêu cầu Backend, API hay Database bên ngoài.

---

## 🎨 Giao diện & Trải nghiệm (UI/UX)
- **Thiết kế Premium:** Hệ thống màu sắc chuẩn mực (Royal Blue `#1890FF`), Layout rõ ràng, nút bấm và badge bo góc tinh tế kèm hiệu ứng mượt mà (shadow, hover, micro-animations).
- **Kiến trúc Layout tĩnh động:** Sử dụng Javascript để render tự động các khối Layout chung (`Header`, `Sidebar`, `Footer`, `Modal`) vào mọi trang web, giúp tối ưu hóa code và tăng tốc độ phát triển.

## 📁 Cấu trúc Thư mục

Dự án được tổ chức khoa học để dễ dàng bảo trì và mở rộng:

```text
📂 project-management/
├── 📄 index.html             # Trang chủ (Dashboard)
├── 📄 login.html             # Trang Đăng nhập (Authentication)
├── 📄 README.md              # Tài liệu dự án (File này)
│
├── 📂 components/            # Các khối UI dùng chung (Sẽ được JS tự nhúng)
│   ├── header.html           # Thanh công cụ trên cùng & User Dropdown
│   ├── sidebar.html          # Menu điều hướng bên trái & Nút Đăng xuất
│   ├── footer.html           # Chân trang
│   ├── loading.html          # Màn hình chờ (Spinner)
│   └── modal.html            # Khung Pop-up dùng chung
│
├── 📂 css/                   # Thư mục chứa Style
│   ├── style.css             # Biến màu, CSS toàn cục, Atomic Components
│   ├── layout.css            # Khung sườn Flexbox, Header Dropdown
│   ├── auth.css              # Giao diện Đăng nhập Split-Screen hiện đại
│   └── dashboard.css         # CSS đặc thù cho trang chủ
│
├── 📂 js/                    # Thư mục chứa Logic Javascript
│   ├── auth.js               # Quản lý phiên, Đăng nhập, Đăng xuất, Route Guard
│   ├── common.js             # Hàm fetch HTML components & Tiện ích chung
│   ├── dashboard.js          # Xử lý logic cho màn hình Dashboard
│   └── profile.js            # Xử lý hồ sơ cá nhân & Đổi mật khẩu
│
├── 📂 pages/                 # Thư mục chứa các module chức năng chính
│   ├── project/              # Quản lý Dự án
│   ├── task/                 # Work Management
│   ├── employee/             # Quản lý Nhân sự & Phòng ban
│   ├── workflow/             # Quy trình công việc
│   ├── report/               # Báo cáo & Thống kê
│   └── profile/              # Hồ sơ cá nhân
│
└── 📂 design_specs/          # Chứa các tài liệu Đặc tả thiết kế (Markdown)
```

## 🔐 Danh sách Tài khoản Thử nghiệm (Demo Accounts)

Hệ thống cung cấp sẵn 3 tài khoản trải nghiệm với đầy đủ phân quyền:

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **👑 Trưởng phòng** | `khai.tran@namviet.vn` | `123456` | Toàn quyền Quản trị, duyệt nhân sự, giám sát WSI phòng ban |
| **💼 Quản lý Dự án (PM)** | `khanh.phan@namviet.vn` | `123456` | Quản lý dự án, phân bổ task, duyệt review & timesheet |
| **💻 Nhân viên (Developer)** | `bach.le@namviet.vn` | `123456` | Quản lý công việc cá nhân, Checklist DoR/DoD, Log timesheet |

*(Tại màn hình Đăng nhập `login.html`, bạn có thể bấm trực tiếp vào nút **Vào ngay** ở danh sách tài khoản mẫu để đăng nhập 1-chạm mà không cần nhập phím).*

## 🚀 Hướng dẫn Cài đặt & Chạy dự án

Vì dự án thuần HTML/CSS/JS nên việc chạy cực kỳ đơn giản:

1. **Clone/Download** mã nguồn về máy tính.
2. Mở thư mục gốc `project-management` bằng một IDE (Khuyên dùng **Visual Studio Code**).
3. Cài đặt tiện ích mở rộng (Extension) **Live Server** trong VS Code.
4. Click chuột phải vào file `login.html` hoặc `index.html` và chọn **"Open with Live Server"**.
5. Hệ thống sẽ tự động mở trình duyệt (Mặc định: `http://localhost:5500` hoặc `127.0.0.1:5500`) để bạn có thể trải nghiệm ngay lập tức.

*(Lưu ý: Bạn bắt buộc phải chạy qua một local server như Live Server để Javascript có thể sử dụng hàm `fetch()` lấy các file HTML trong thư mục `components/`. Nếu click đúp mở trực tiếp file `index.html` dưới dạng `file://`, tính năng nhúng giao diện sẽ bị lỗi bảo mật CORS của trình duyệt).*

## 🧩 Các Module Chính (Theo Đặc tả)
1. **🔐 Xác thực (Auth):** Trang đăng nhập Enterprise Split-Screen, bảo vệ phiên (Route Guard), ghi nhớ đăng nhập, tài khoản mẫu 1-chạm, quên mật khẩu và đăng xuất an toàn kèm modal xác nhận.
2. **🏠 Dashboard:** Bảng điều hành tổng hợp cấp cao, giám sát sức khỏe dự án (Project Health), trung tâm cảnh báo rủi ro (Alerts), tiêu điểm công việc cá nhân trong ngày (My Focus) và dòng thời gian hoạt động nhóm (Activity Timeline).
3. **📁 Quản lý Dự án:** Danh sách dự án, yêu cầu nhân lực.
4. **✅ Work Management:** Task list, bảng Kanban, công việc con (Sub-task).
5. **👥 Quản lý Nhân sự:** Danh sách nhân viên, cơ cấu phòng ban, phân quyền (RBAC).
6. **📝 Quy trình:** Chất lượng công việc (DoR/DoD checklist), Timesheet, Review.
7. **📊 Báo cáo:** Thống kê biểu đồ, hiệu suất, tính điểm KPI tự động.
8. **👤 Hồ sơ cá nhân:** Trang thông tin, chỉnh sửa hồ sơ và đổi mật khẩu.

---
*© 2026 Work Management System - Phát triển theo chuẩn Enterprise.*