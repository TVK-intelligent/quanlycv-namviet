document.addEventListener('DOMContentLoaded', () => {
    // Component Loader
    async function loadComponent(elementId, filePath) {
        const element = document.getElementById(elementId);
        if (element) {
            try {
                const response = await fetch(filePath);
                if (response.ok) {
                    element.innerHTML = await response.text();
                    initComponentEvents(elementId);
                    
                    // Xử lý đặc biệt cho loading component (vì thẻ div bọc ngoài bị đè display: none)
                    if(elementId === 'loading-container') {
                         const originalLoading = element.querySelector('#global-loading');
                         if(originalLoading) {
                             element.replaceWith(originalLoading);
                         }
                    }
                    if(elementId === 'modal-container') {
                         const originalModal = element.querySelector('#global-modal');
                         if(originalModal) {
                             // Kéo các script từ component ra để thực thi
                             const scripts = element.querySelectorAll('script');
                             scripts.forEach(script => {
                                 const newScript = document.createElement('script');
                                 newScript.textContent = script.textContent;
                                 document.body.appendChild(newScript);
                             });
                             element.replaceWith(originalModal);
                         }
                    }
                } else {
                    console.error(`Lỗi tải component ${filePath}:`, response.status);
                }
            } catch (error) {
                console.error(`Lỗi tải component ${filePath}:`, error);
            }
        }
    }

    // Khởi tạo các event sau khi component render xong
    function initComponentEvents(elementId) {
        if (elementId === 'header-container') {
            const toggleBtn = document.getElementById('menu-toggle');
            const sidebar = document.querySelector('.sidebar');
            
            if (toggleBtn && sidebar) {
                toggleBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('open');
                });
            }

        } else if (elementId === 'sidebar-container') {
            // Tự động kích hoạt trạng thái active cho menu dựa trên URL của trang hiện tại
            const currentPath = window.location.pathname;
            const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
            
            sidebarLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (!href || href === '#') return;
                
                // Chuẩn hóa đường dẫn để so sánh chính xác
                const normPath = currentPath === '/' || currentPath === '' ? '/index.html' : currentPath;
                const normHref = href.startsWith('/') ? href : '/' + href;
                
                if (normPath === normHref || normPath.endsWith(href)) {
                    link.classList.add('active');
                    
                    // Tự động mở rộng Submenu chứa trang con đang xem (nếu có)
                    const submenu = link.closest('.submenu');
                    if (submenu) {
                        submenu.classList.add('open');
                        const toggleLink = submenu.previousElementSibling;
                        if (toggleLink && toggleLink.classList.contains('submenu-toggle')) {
                            const arrow = toggleLink.querySelector('.arrow');
                            if (arrow) arrow.textContent = '▴';
                        }
                    }
                } else {
                    link.classList.remove('active');
                }
            });

            const toggleLinks = document.querySelectorAll('.submenu-toggle');
            toggleLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const submenu = link.nextElementSibling;
                    const arrow = link.querySelector('.arrow');
                    
                    // Đóng các submenu khác
                    document.querySelectorAll('.submenu').forEach(sub => {
                        if (sub !== submenu) {
                            sub.classList.remove('open');
                            const otherArrow = sub.previousElementSibling.querySelector('.arrow');
                            if (otherArrow) otherArrow.textContent = '▾';
                        }
                    });

                    if (submenu && submenu.classList.contains('submenu')) {
                        submenu.classList.toggle('open');
                        if(arrow) arrow.textContent = submenu.classList.contains('open') ? '▴' : '▾';
                    }
                });
            });
        }
    }

    // Khởi tạo dữ liệu người dùng giả lập
    function initUserProfiles() {
        if (!localStorage.getItem('etrms-user-profiles')) {
            const defaultProfiles = {
                head: {
                    name: "Khải Trần",
                    avatar: "KT",
                    avatarColor: "#1890FF",
                    email: "khai.tran@namviet.vn",
                    phone: "0987.654.321",
                    dob: "1985-05-15",
                    department: "Phòng Công nghệ Thông tin",
                    title: "Trưởng phòng",
                    joinedDate: "2018-03-01",
                    systemRole: "ADMIN",
                    stats: { total: 48, completed: 42, active: 5, overdue: 1 },
                    projects: [
                        { name: "Quản lý chung Phòng ban", capacity: 100, progress: 95 }
                    ],
                    activities: [
                        { desc: "Đã phê duyệt yêu cầu gia hạn của Lê Gia Bách", time: "10 phút trước" },
                        { desc: "Đã chốt bảng Timesheet tuần 32", time: "2 giờ trước" },
                        { desc: "Đã giao việc 'Thiết kế module Profile' cho Lê Gia Bách", time: "1 ngày trước" }
                    ]
                },
                pm: {
                    name: "Phan Văn Khánh",
                    avatar: "PK",
                    avatarColor: "#FA8C16",
                    email: "khanh.phan@namviet.vn",
                    phone: "0912.345.678",
                    dob: "1990-10-22",
                    department: "Phòng Công nghệ Thông tin",
                    title: "Quản lý dự án (PM)",
                    joinedDate: "2020-07-15",
                    systemRole: "USER",
                    stats: { total: 25, completed: 20, active: 4, overdue: 1 },
                    projects: [
                        { name: "Dự án CRM", capacity: 50, progress: 75 },
                        { name: "Work Management", capacity: 50, progress: 45 }
                    ],
                    activities: [
                        { desc: "Đã phân bổ thêm 10% lực lượng cho Dự án CRM", time: "30 phút trước" },
                        { desc: "Cập nhật tiến độ dự án Work Management lên 45%", time: "3 giờ trước" },
                        { desc: "Tạo yêu cầu mượn nhân sự cho Dự án CRM", time: "2 ngày trước" }
                    ]
                },
                employee: {
                    name: "Lê Gia Bách",
                    avatar: "GB",
                    avatarColor: "#52C41A",
                    email: "bach.le@namviet.vn",
                    phone: "0909.888.777",
                    dob: "1998-12-05",
                    department: "Phòng Công nghệ Thông tin",
                    title: "Lập trình viên (Developer)",
                    joinedDate: "2022-02-10",
                    systemRole: "USER",
                    stats: { total: 14, completed: 10, active: 3, overdue: 1 },
                    projects: [
                        { name: "Work Management", capacity: 60, progress: 45 },
                        { name: "Mobile App", capacity: 40, progress: 80 }
                    ],
                    activities: [
                        { desc: "Đã nộp bài kiểm thử cho công việc 'Thiết kế UI Profile'", time: "15 phút trước" },
                        { desc: "Log 4h vào công việc 'Code layout Profile'", time: "4 giờ trước" },
                        { desc: "Đã nhận việc 'Sửa lỗi CSS trên Safari'", time: "1 ngày trước" }
                    ]
                }
            };
            localStorage.setItem('etrms-user-profiles', JSON.stringify(defaultProfiles));
        }
    }

    // Đồng bộ thông tin user lên Header và Welcome Banner
    window.syncUserHeaderAndWelcome = function() {
        initUserProfiles();
        let simulatedRole = localStorage.getItem('etrms-simulated-role') || 'all';
        let profileKey = simulatedRole;
        if (simulatedRole === 'all') {
            profileKey = 'head'; // Mặc định lấy Trưởng phòng khi ở chế độ xem tất cả
        }
        
        const profiles = JSON.parse(localStorage.getItem('etrms-user-profiles'));
        if (!profiles || !profiles[profileKey]) return;
        
        const user = profiles[profileKey];
        
        // Cập nhật Header
        const avatarEl = document.getElementById('header-user-avatar');
        const nameEl = document.getElementById('header-user-name');
        const roleEl = document.getElementById('header-user-role');
        
        if (avatarEl) {
            avatarEl.textContent = user.avatar;
            avatarEl.style.backgroundColor = user.avatarColor;
        }
        if (nameEl) nameEl.textContent = user.name;
        if (roleEl) roleEl.textContent = user.title;
        
        // Cập nhật Welcome Banner (nếu có trên trang hiện tại)
        const welcomeNameEl = document.getElementById('user-welcome-name');
        const welcomeDeptEl = document.getElementById('user-welcome-dept');
        
        if (welcomeNameEl) welcomeNameEl.textContent = `Xin chào, ${user.name} 👋`;
        if (welcomeDeptEl) welcomeDeptEl.textContent = `Chúc bạn một ngày làm việc hiệu quả! (${user.department} - ${user.title})`;
    };

    // Bộ lọc vai trò giả lập toàn hệ thống (Global Role Switcher)
    function initGlobalRoleSwitcher() {
        const roleSelector = document.getElementById('role-selector');
        if (!roleSelector) return;

        // Đọc vai trò giả lập được lưu trong localStorage để đồng bộ khi chuyển trang
        const savedRole = localStorage.getItem('etrms-simulated-role') || 'all';
        roleSelector.value = savedRole;
        applyRoleFiltering(savedRole);
        window.syncUserHeaderAndWelcome();

        roleSelector.addEventListener('change', function(e) {
            const selectedRole = e.target.value;
            localStorage.setItem('etrms-simulated-role', selectedRole);
            applyRoleFiltering(selectedRole);
            window.syncUserHeaderAndWelcome();
            
            // Dispatch custom event để các trang khác tự cập nhật nếu cần
            window.dispatchEvent(new CustomEvent('etrms-role-changed', { detail: { role: selectedRole } }));
        });
    }

    // Hàm thực hiện ẩn/hiện các phần tử theo vai trò được chọn
    function applyRoleFiltering(selectedRole) {
        // 1. Lọc các thẻ KPI Cards
        document.querySelectorAll('.kpi-card[data-roles]').forEach(el => {
            const rolesAllowed = el.getAttribute('data-roles').split(',');
            if (selectedRole === 'all' || rolesAllowed.includes(selectedRole)) {
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        });

        // 2. Lọc các khu vực Widget riêng của từng Actor (.actor-section-wrapper)
        document.querySelectorAll('.actor-section-wrapper[data-roles]').forEach(el => {
            const rolesAllowed = el.getAttribute('data-roles').split(',');
            if (selectedRole === 'all' || rolesAllowed.includes(selectedRole)) {
                el.style.display = 'grid';
            } else {
                el.style.display = 'none';
            }
        });

        // 3. Lọc các widget dùng chung có data-roles
        document.querySelectorAll('[data-roles]:not(.kpi-card):not(.actor-section-wrapper):not(.sidebar *):not(.sidebar-menu *)').forEach(el => {
            const rolesAllowed = el.getAttribute('data-roles').split(',');
            if (selectedRole === 'all' || rolesAllowed.includes(selectedRole)) {
                if (el.id === 'inbox-section' || el.id === 'timeline-section') {
                    el.style.display = 'block';
                } else {
                    el.style.display = '';
                }
            } else {
                el.style.display = 'none';
            }
        });

        // 4. Lọc các mục menu và submenu trong Sidebar
        document.querySelectorAll('.sidebar [data-roles], .sidebar-menu [data-roles]').forEach(el => {
            const rolesAllowed = el.getAttribute('data-roles').split(',');
            if (selectedRole === 'all' || rolesAllowed.includes(selectedRole)) {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
    }

    // Load các component layout chung
    Promise.all([
        loadComponent('sidebar-container', '/components/sidebar.html'),
        loadComponent('header-container', '/components/header.html'),
        loadComponent('footer-container', '/components/footer.html'),
        loadComponent('modal-container', '/components/modal.html'),
        loadComponent('loading-container', '/components/loading.html')
    ]).then(() => {
        console.log("All components loaded successfully!");
        // Khởi chạy bộ chuyển đổi vai trò toàn cục
        initGlobalRoleSwitcher();
    });
});
