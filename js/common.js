// =========================================
// WORK MANAGEMENT - COMMON CORE JS (js/common.js)
// =========================================

// Khởi tạo Toast Container dùng chung nếu chưa có
window.showToast = function(message, type = 'success') {
    if (window.AuthService && typeof window.AuthService.showAuthToast === 'function') {
        window.AuthService.showAuthToast(message, type);
        return;
    }
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    const borderCol = type === 'error' ? '#FF4D4F' : (type === 'info' ? '#1890FF' : '#52C41A');
    toast.style.cssText = `
        padding: 12px 20px;
        border-radius: var(--border-radius-md, 6px);
        background: #ffffff;
        color: var(--text-main, #262626);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        font-weight: 500;
        pointer-events: auto;
        transform: translateY(-20px);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        border-left: 4px solid ${borderCol};
    `;
    
    toast.textContent = message;
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });
    
    setTimeout(() => {
        toast.style.transform = 'translateY(-20px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra quyền truy cập (Route Guard)
    if (window.AuthService && typeof window.AuthService.checkAuth === 'function') {
        window.AuthService.checkAuth(false);
    }

    // 2. Component Loader
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

    // 3. Khởi tạo các event sau khi component render xong
    function initComponentEvents(elementId) {
        if (elementId === 'header-container') {
            const breadcrumb = document.querySelector('.breadcrumb');
            const breadcrumbParent = document.body.dataset.breadcrumbParent;
            const breadcrumbCurrent = document.body.dataset.breadcrumbCurrent;

            if (breadcrumb && breadcrumbParent && breadcrumbCurrent) {
                const parentItem = document.createElement('span');
                parentItem.className = 'breadcrumb-item';
                parentItem.textContent = breadcrumbParent;

                const separator = document.createElement('span');
                separator.className = 'breadcrumb-item';
                separator.textContent = '/';

                const currentItem = document.createElement('span');
                currentItem.className = 'breadcrumb-item active';
                currentItem.textContent = breadcrumbCurrent;

                breadcrumb.replaceChildren(parentItem, separator, currentItem);
            }

            const toggleBtn = document.getElementById('menu-toggle');
            const sidebar = document.querySelector('.sidebar');
            
            if (toggleBtn && sidebar) {
                toggleBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('open');
                });
            }

            // User Profile Dropdown Toggle
            const userAvatarTrigger = document.getElementById('user-avatar-trigger');
            const userDropdownMenu = document.getElementById('header-user-menu');
            const dropdownArrow = document.getElementById('user-dropdown-arrow');
            
            if (userAvatarTrigger && userDropdownMenu) {
                userAvatarTrigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = userDropdownMenu.classList.toggle('show');
                    if (dropdownArrow) {
                        dropdownArrow.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
                    }
                });

                // Đóng dropdown khi click ra ngoài
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('#user-profile-dropdown')) {
                        userDropdownMenu.classList.remove('show');
                        if (dropdownArrow) {
                            dropdownArrow.style.transform = 'rotate(0deg)';
                        }
                    }
                });
            }

            // Header Logout Button
            const headerLogoutBtn = document.getElementById('header-logout-btn');
            if (headerLogoutBtn) {
                headerLogoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.AuthService && typeof window.AuthService.logout === 'function') {
                        window.AuthService.logout(true);
                    }
                });
            }

            // Đồng bộ thông tin người dùng ngay sau khi load Header
            window.syncUserHeaderAndWelcome();

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

            // Submenu Toggle Events
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

            // Sidebar Logout Button
            const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
            if (sidebarLogoutBtn) {
                sidebarLogoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.AuthService && typeof window.AuthService.logout === 'function') {
                        window.AuthService.logout(true);
                    }
                });
            }
        }
    }

    // 4. Khởi tạo dữ liệu người dùng giả lập
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

    // 5. Đồng bộ thông tin user lên Header, Dropdown Menu và Welcome Banner
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
        
        // Cập nhật Header Avatar & Name
        const avatarEl = document.getElementById('header-user-avatar');
        const nameEl = document.getElementById('header-user-name');
        const roleEl = document.getElementById('header-user-role');
        
        if (avatarEl) {
            avatarEl.textContent = user.avatar;
            avatarEl.style.backgroundColor = user.avatarColor;
        }
        if (nameEl) nameEl.textContent = user.name;
        if (roleEl) roleEl.textContent = user.title;

        // Cập nhật Header Dropdown Menu Items
        const ddAvatar = document.getElementById('dropdown-user-avatar');
        const ddName = document.getElementById('dropdown-user-name');
        const ddEmail = document.getElementById('dropdown-user-email');
        const ddBadge = document.getElementById('dropdown-user-badge');

        if (ddAvatar) {
            ddAvatar.textContent = user.avatar;
            ddAvatar.style.backgroundColor = user.avatarColor;
        }
        if (ddName) ddName.textContent = user.name;
        if (ddEmail) ddEmail.textContent = user.email;
        if (ddBadge) ddBadge.textContent = user.title;
        
        // Cập nhật Welcome Banner (nếu có trên trang hiện tại)
        const welcomeNameEl = document.getElementById('user-welcome-name');
        const welcomeDeptEl = document.getElementById('user-welcome-dept');
        
        if (welcomeNameEl) welcomeNameEl.textContent = `Xin chào, ${user.name} 👋`;
        if (welcomeDeptEl) welcomeDeptEl.textContent = `Chúc bạn một ngày làm việc hiệu quả! (${user.department} - ${user.title})`;
    };

    // 6. Bộ lọc vai trò giả lập toàn hệ thống (Global Role Switcher)
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

    // 7. Hàm thực hiện ẩn/hiện các phần tử theo vai trò được chọn
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

    // 8. Load các component layout chung
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
