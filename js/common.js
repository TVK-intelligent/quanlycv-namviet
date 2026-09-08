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

    // Áp dụng theme giao diện (Light/Dark Mode) đã lưu từ cài đặt
    applySavedTheme();

    // Tự động quét hạn chót toàn hệ thống và gắn cờ Quá hạn (Overdue)
    scanAndFlagOverdueTasks();

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
            // header button
            const btnSetting = document.getElementById('btn-setting');
            const btnNotifications = document.getElementById('btn-notifications');
            const btnHelp = document.getElementById('btn-help');
            const notificationsMenu = document.getElementById('header-notifications-menu');

            if (btnSetting) {
                btnSetting.addEventListener('click', (e) => {
                    e.preventDefault();
                    openSettingsModal();
                });
            }

            if (btnHelp) {
                btnHelp.addEventListener('click', (e) => {
                    e.preventDefault();
                    openHelpModal();
                });
            }

            if (btnNotifications && notificationsMenu) {
                btnNotifications.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // Đóng dropdown của Profile nếu đang mở
                    const userDropdownMenu = document.getElementById('header-user-menu');
                    const dropdownArrow = document.getElementById('user-dropdown-arrow');
                    if (userDropdownMenu) {
                        userDropdownMenu.classList.remove('show');
                        if (dropdownArrow) dropdownArrow.style.transform = 'rotate(0deg)';
                    }

                    // Bật/Tắt dropdown thông báo
                    const isShown = notificationsMenu.classList.toggle('show');
                    if (isShown) {
                        renderHeaderNotifications();
                    }
                });

                // Đăng ký sự kiện nút đánh dấu đọc tất cả
                const btnClearNoti = document.getElementById('btn-clear-notifications');
                if (btnClearNoti) {
                    btnClearNoti.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markNotificationsAsRead();
                    });
                }
            }

            // Đóng dropdown thông báo khi click ra ngoài
            document.addEventListener('click', (e) => {
                if (notificationsMenu && !e.target.closest('#btn-notifications') && !e.target.closest('#header-notifications-menu')) {
                    notificationsMenu.classList.remove('show');
                }
            });


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
        
        // Cập nhật danh sách thông báo theo vai trò tương ứng
        if (typeof renderHeaderNotifications === 'function') {
            renderHeaderNotifications();
        }
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

    // 7.5. Helper functions for Settings & Notifications & Help
    function initNotifications() {
        if (!localStorage.getItem('etrms-notifications')) {
            const initialNotis = {
                all: [
                    { id: 1, sender: "Lê Gia Bách", desc: "Đã nộp bài kiểm thử cho công việc 'Thiết kế UI Profile'", time: "15 phút trước", icon: "fa-circle-check", color: "#52c41a", unread: true },
                    { id: 2, sender: "Phan Văn Khánh", desc: "Đã cập nhật tiến độ Dự án CRM lên 75%", time: "3 giờ trước", icon: "fa-chart-line", color: "#1890ff", unread: true },
                    { id: 3, sender: "Hệ thống", desc: "Sao lưu cơ sở dữ liệu định kỳ hoàn tất thành công", time: "1 ngày trước", icon: "fa-database", color: "#722ed1", unread: false }
                ],
                head: [
                    { id: 1, sender: "Lê Gia Bách", desc: "Đã nộp bài kiểm thử cho công việc 'Thiết kế UI Profile'", time: "15 phút trước", icon: "fa-circle-check", color: "#52c41a", unread: true },
                    { id: 2, sender: "Phan Văn Khánh", desc: "Đã cập nhật tiến độ Dự án CRM lên 75%", time: "3 giờ trước", icon: "fa-chart-line", color: "#1890ff", unread: true },
                    { id: 3, sender: "Hệ thống", desc: "Sao lưu cơ sở dữ liệu định kỳ hoàn tất thành công", time: "1 ngày trước", icon: "fa-database", color: "#722ed1", unread: false }
                ],
                pm: [
                    { id: 4, sender: "Khải Trần", desc: "Đã phê duyệt đề xuất mượn nhân sự cho Dự án CRM", time: "30 phút trước", icon: "fa-user-check", color: "#fa8c16", unread: true },
                    { id: 5, sender: "Lê Gia Bách", desc: "Đã cập nhật công việc 'Code layout Profile' lên 60%", time: "3 giờ trước", icon: "fa-code", color: "#13c2c2", unread: true },
                    { id: 6, sender: "Hệ thống", desc: "Nhắc nhở: Milestone 'Kiểm thử Alpha' sắp đến hạn (2 ngày nữa)", time: "1 ngày trước", icon: "fa-triangle-exclamation", color: "#f5222d", unread: false }
                ],
                employee: [
                    { id: 7, sender: "Phan Văn Khánh", desc: "Đã giao cho bạn công việc mới 'Sửa lỗi CSS trên Safari'", time: "15 phút trước", icon: "fa-tasks", color: "#1890ff", unread: true },
                    { id: 8, sender: "Hệ thống", desc: "Bảng chấm công Timesheet tuần 32 đã được duyệt", time: "4 giờ trước", icon: "fa-calendar-check", color: "#52c41a", unread: true },
                    { id: 9, sender: "Phan Văn Khánh", desc: "Đã bình luận vào công việc 'Thiết kế UI Profile'", time: "1 ngày trước", icon: "fa-comment", color: "#eb2f96", unread: false }
                ]
            };
            localStorage.setItem('etrms-notifications', JSON.stringify(initialNotis));
        }
    }

    function renderHeaderNotifications() {
        initNotifications();
        const role = localStorage.getItem('etrms-simulated-role') || 'all';
        const notiBadge = document.getElementById('noti-badge-count');
        const notiContainer = document.getElementById('notifications-list-container');
        if (!notiContainer) return;

        const allNotis = JSON.parse(localStorage.getItem('etrms-notifications')) || {};
        const list = allNotis[role] || allNotis['all'] || [];
        
        if (list.length === 0) {
            notiContainer.innerHTML = `
                <div style="padding: 24px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
                    <i class="fa-solid fa-bell-slash" style="font-size: 24px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
                    Không có thông báo nào
                </div>
            `;
            if (notiBadge) notiBadge.style.display = 'none';
            return;
        }

        let html = '';
        let unreadCount = 0;
        
        list.forEach(item => {
            if (item.unread) unreadCount++;
            
            html += `
                <div class="notification-item" style="padding: 10px 16px; border-bottom: 1px solid var(--border-light); font-size: 13px; cursor: pointer; transition: background 0.2s; display: flex; gap: 12px; align-items: flex-start; ${item.unread ? 'background-color: rgba(24, 144, 255, 0.05);' : ''}" onmouseover="this.style.backgroundColor='var(--bg-main)'" onmouseout="this.style.backgroundColor='${item.unread ? 'rgba(24, 144, 255, 0.05)' : 'transparent'}'">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${item.color}15; color: ${item.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                        <i class="fa-solid ${item.icon}" style="font-size: 14px;"></i>
                    </div>
                    <div style="flex-grow: 1; min-width: 0;">
                        <div style="font-weight: 600; color: var(--text-main); margin-bottom: 2px; font-size: 13px;">${item.sender}</div>
                        <div style="color: var(--text-muted); font-size: 12px; line-height: 1.4; margin-bottom: 4px; word-break: break-word;">${item.desc}</div>
                        <div style="color: #bfbfbf; font-size: 11px;"><i class="fa-regular fa-clock"></i> ${item.time}</div>
                    </div>
                    ${item.unread ? '<div style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--primary-color); margin-top: 6px; flex-shrink: 0;"></div>' : ''}
                </div>
            `;
        });
        
        notiContainer.innerHTML = html;
        
        if (notiBadge) {
            if (unreadCount > 0) {
                notiBadge.textContent = unreadCount;
                notiBadge.style.display = 'flex';
            } else {
                notiBadge.style.display = 'none';
            }
        }
    }

    function markNotificationsAsRead() {
        initNotifications();
        const role = localStorage.getItem('etrms-simulated-role') || 'all';
        const allNotis = JSON.parse(localStorage.getItem('etrms-notifications')) || {};
        const list = allNotis[role] || allNotis['all'] || [];
        
        list.forEach(item => {
            item.unread = false;
        });
        
        localStorage.setItem('etrms-notifications', JSON.stringify(allNotis));
        renderHeaderNotifications();
        
        if (typeof showToast === 'function') {
            showToast('Đã đánh dấu đọc tất cả thông báo.', 'success');
        }
    }

    function initAppSettings() {
        if (!localStorage.getItem('etrms-app-settings')) {
            const defaultSettings = {
                language: 'vi',
                theme: 'light',
                notifications: 'true',
                sound: 'true'
            };
            localStorage.setItem('etrms-app-settings', JSON.stringify(defaultSettings));
        }
    }

    function applySavedTheme() {
        initAppSettings();
        const settings = JSON.parse(localStorage.getItem('etrms-app-settings'));
        if (settings && settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    }

    function openSettingsModal() {
        if (typeof openModal === 'function') {
            initAppSettings();
            const settings = JSON.parse(localStorage.getItem('etrms-app-settings'));
            
            const formHtml = `
                <form id="settings-form" style="display: flex; flex-direction: column; gap: 16px; text-align: left;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-main);">Chủ đề giao diện</label>
                            <select id="settings-theme" class="form-control" style="height: 36px; padding: 4px 8px;">
                                <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Giao diện sáng</option>
                                <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Giao diện tối (Dark Mode)</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-main);">Ngôn ngữ hệ thống</label>
                            <select id="settings-lang" class="form-control" style="height: 36px; padding: 4px 8px;">
                                <option value="vi" ${settings.language === 'vi' ? 'selected' : ''}>Tiếng Việt</option>
                                <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid var(--border-light); padding-top: 12px; margin-top: 4px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: var(--text-main);">Cấu hình thông báo</h4>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: var(--text-main);">
                                <input type="checkbox" id="settings-push-noti" ${settings.notifications === 'true' ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px;">
                                Cho phép nhận thông báo đẩy (Push notifications)
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: var(--text-main);">
                                <input type="checkbox" id="settings-sound" ${settings.sound === 'true' ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px;">
                                Phát âm thanh cảnh báo khi có thông báo mới
                            </label>
                        </div>
                    </div>
                </form>
            `;
            
            openModal('Cài đặt giao diện & hệ thống', formHtml, () => {
                const theme = document.getElementById('settings-theme').value;
                const lang = document.getElementById('settings-lang').value;
                const noti = document.getElementById('settings-push-noti').checked ? 'true' : 'false';
                const sound = document.getElementById('settings-sound').checked ? 'true' : 'false';
                
                const newSettings = {
                    language: lang,
                    theme: theme,
                    notifications: noti,
                    sound: sound
                };
                
                localStorage.setItem('etrms-app-settings', JSON.stringify(newSettings));
                
                // Áp dụng theme ngay lập tức
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.body.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                    document.body.classList.remove('dark');
                }
                
                if (typeof showToast === 'function') {
                    showToast('Đã lưu cài đặt giao diện thành công!', 'success');
                }
                closeModal();
            });
        }
    }

    function openHelpModal() {
        if (typeof openModal === 'function') {
            const helpHtml = `
                <div style="font-size: 13px; line-height: 1.6; text-align: left; color: var(--text-main);">
                    <p>Chào mừng bạn đến với hệ thống quản lý công việc và dự án <strong>TaskConnect (ETRM)</strong>.</p>
                    <h4 style="margin: 12px 0 6px 0; font-size: 14px; font-weight: 600;">Các vai trò chính trong hệ thống:</h4>
                    <ul style="padding-left: 20px; margin-bottom: 12px; list-style-type: disc;">
                        <li><strong>Trưởng phòng:</strong> Xem tổng quan hiệu suất, duyệt Timesheet, phân bổ nhân sự phòng ban.</li>
                        <li><strong>Quản lý dự án (PM):</strong> Lập kế hoạch, quản lý Milestone, phê duyệt tài liệu và checklist bàn giao.</li>
                        <li><strong>Nhân viên:</strong> Nhận và log việc hàng ngày, sửa bug, nộp kết quả công việc kèm checklist DoR/DoD.</li>
                    </ul>
                    <p style="margin-top: 12px; background: var(--bg-main); padding: 8px 12px; border-radius: 6px; border-left: 3px solid var(--primary-color);">
                        <i class="fa-solid fa-circle-info" style="color: var(--primary-color);"></i> Sử dụng <strong>Chế độ xem (Role Switcher)</strong> ở thanh header để nhanh chóng chuyển đổi giao diện giả lập của các vai trò khác nhau.
                    </p>
                </div>
            `;
            openModal('Hướng dẫn & Trợ giúp', helpHtml, () => {
                closeModal();
            });
            // Thay đổi text nút confirm thành Đóng
            const confirmBtn = document.getElementById('modal-confirm-btn');
            if (confirmBtn) {
                confirmBtn.textContent = 'Đóng';
            }
        }
    }

    // 7.6. Helper function for Global Quick Search (Ctrl + K)
    function initGlobalSearch() {
        const searchInput = document.querySelector('.search-input');
        const searchWrapper = document.querySelector('.search-box');
        if (!searchInput || !searchWrapper) return;

        // Tạo container cho dropdown kết quả
        const dropdown = document.createElement('div');
        dropdown.className = 'global-search-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 38px;
            left: 0;
            width: 350px;
            max-height: 400px;
            background: #ffffff;
            border: 1px solid var(--border-color, #d9d9d9);
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            z-index: 10001;
            display: none;
            overflow-y: auto;
            padding: 8px 0;
        `;
        searchWrapper.style.position = 'relative';
        searchWrapper.appendChild(dropdown);

        // Đăng ký phím tắt Ctrl+K / Cmd+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });

        let debounceTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            const query = e.target.value.trim().toLowerCase();
            
            if (!query) {
                dropdown.style.display = 'none';
                return;
            }

            debounceTimeout = setTimeout(() => {
                performSearch(query);
            }, 200);
        });

        // Ẩn dropdown khi click ra ngoài
        document.addEventListener('click', (e) => {
            if (!searchWrapper.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        // Hiện lại dropdown khi focus vào input nếu đã có giá trị
        searchInput.addEventListener('focus', (e) => {
            if (e.target.value.trim()) {
                dropdown.style.display = 'block';
            }
        });

        function performSearch(query) {
            let projects = [];
            let tasks = [];
            let employees = [];

            try {
                projects = JSON.parse(localStorage.getItem('etrms-projects')) || [];
            } catch (e) { console.error('Lỗi đọc etrms-projects:', e); }
            try {
                tasks = JSON.parse(localStorage.getItem('etrms_tasks')) || [];
            } catch (e) { console.error('Lỗi đọc etrms_tasks:', e); }
            try {
                employees = JSON.parse(localStorage.getItem('etrms_employees')) || [];
            } catch (e) { console.error('Lỗi đọc etrms_employees:', e); }

            // Lọc dự án
            const matchedProjects = projects.filter(p => 
                (p.projectName && p.projectName.toLowerCase().includes(query)) || 
                (p.projectCode && p.projectCode.toLowerCase().includes(query))
            ).slice(0, 5);

            // Lọc công việc
            const matchedTasks = tasks.filter(t => 
                (t.title && t.title.toLowerCase().includes(query)) || 
                (t.code && t.code.toLowerCase().includes(query)) ||
                ('task-' + t.id).includes(query)
            ).slice(0, 5);

            // Lọc nhân sự
            const matchedEmployees = employees.filter(emp => 
                (emp.fullName && emp.fullName.toLowerCase().includes(query)) || 
                (emp.email && emp.email.toLowerCase().includes(query))
            ).slice(0, 5);

            const totalResults = matchedProjects.length + matchedTasks.length + matchedEmployees.length;

            if (totalResults === 0) {
                dropdown.innerHTML = `
                    <div style="padding: 16px; text-align: center; color: var(--text-muted, #8c8c8c); font-size: 13px;">
                        <i class="fa-solid fa-magnifying-glass-minus" style="font-size: 18px; margin-bottom: 6px; display: block; opacity: 0.7;"></i>
                        Không tìm thấy kết quả nào cho "${query}"
                    </div>
                `;
                dropdown.style.display = 'block';
                return;
            }

            let html = '';

            // Render danh mục Dự án
            if (matchedProjects.length > 0) {
                html += `<div style="padding: 6px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--primary-color, #1890ff); letter-spacing: 0.5px; background: var(--bg-main, #f5f5f5);">Dự án (${matchedProjects.length})</div>`;
                matchedProjects.forEach(p => {
                    html += `
                        <a href="/pages/project/project-list.html" class="search-result-item" style="display: flex; flex-direction: column; padding: 8px 16px; text-decoration: none; border-bottom: 1px solid var(--border-light, #f0f0f0); transition: background 0.15s;">
                            <span style="font-size: 13px; font-weight: 600; color: var(--text-main, #262626);">${p.projectName}</span>
                            <span style="font-size: 11px; color: var(--text-muted, #8c8c8c);">Mã: ${p.projectCode} · Tiến độ: ${p.progress || 0}%</span>
                        </a>
                    `;
                });
            }

            // Render danh mục Công việc
            if (matchedTasks.length > 0) {
                html += `<div style="padding: 6px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #fa8c16; letter-spacing: 0.5px; background: var(--bg-main, #f5f5f5);">Công việc (${matchedTasks.length})</div>`;
                matchedTasks.forEach(t => {
                    const code = t.code || 'TASK-' + t.id;
                    html += `
                        <a href="/pages/task/task-list.html" class="search-result-item" style="display: flex; flex-direction: column; padding: 8px 16px; text-decoration: none; border-bottom: 1px solid var(--border-light, #f0f0f0); transition: background 0.15s;">
                            <span style="font-size: 13px; font-weight: 600; color: var(--text-main, #262626);">${t.title}</span>
                            <span style="font-size: 11px; color: var(--text-muted, #8c8c8c);">Mã: ${code} · Trạng thái: ${t.status} · Gán cho: ${t.assignee || 'Chưa gán'}</span>
                        </a>
                    `;
                });
            }

            // Render danh mục Nhân sự
            if (matchedEmployees.length > 0) {
                html += `<div style="padding: 6px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #52c41a; letter-spacing: 0.5px; background: var(--bg-main, #f5f5f5);">Nhân sự (${matchedEmployees.length})</div>`;
                matchedEmployees.forEach(emp => {
                    const avatarUrl = emp.avatar || "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70);
                    html += `
                        <a href="/pages/employee/employee-list.html" class="search-result-item" style="display: flex; align-items: center; gap: 10px; padding: 8px 16px; text-decoration: none; border-bottom: 1px solid var(--border-light, #f0f0f0); transition: background 0.15s;">
                            <img src="${avatarUrl}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" onerror="this.src='https://i.pravatar.cc/150?img=65'">
                            <div style="display: flex; flex-direction: column;">
                                <span style="font-size: 13px; font-weight: 600; color: var(--text-main, #262626);">${emp.fullName}</span>
                                <span style="font-size: 11px; color: var(--text-muted, #8c8c8c);">Email: ${emp.email} · Sức tải WSI: ${emp.wsiCapacity || 0}%</span>
                            </div>
                        </a>
                    `;
                });
            }

            dropdown.innerHTML = html;
            dropdown.style.display = 'block';

            // Tiêm CSS hover vào trang
            if (!document.getElementById('search-hover-style')) {
                const style = document.createElement('style');
                style.id = 'search-hover-style';
                style.innerHTML = `
                    .search-result-item:hover {
                        background-color: var(--bg-main, #f5f5f5) !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    // 9. Bộ quét hạn chót và tự động gắn cờ Quá hạn (Realtime Overdue Scanner)
    function scanAndFlagOverdueTasks() {
        try {
            const raw = localStorage.getItem('etrms_tasks');
            if (!raw) return;
            const tasks = JSON.parse(raw);
            if (!Array.isArray(tasks) || tasks.length === 0) return;

            const todayStr = new Date().toISOString().split('T')[0];
            let hasChange = false;

            tasks.forEach(t => {
                const wasOverdue = !!t.isOverdue;
                const shouldBeOverdue = Boolean(t.dueDate && t.dueDate < todayStr && t.status !== 'DONE');
                if (wasOverdue !== shouldBeOverdue) {
                    t.isOverdue = shouldBeOverdue;
                    hasChange = true;
                }
            });

            if (hasChange) {
                localStorage.setItem('etrms_tasks', JSON.stringify(tasks));
            }
        } catch(e) {
            console.warn('[common] Lỗi quét overdue tasks:', e);
        }
    }
    window.scanAndFlagOverdueTasks = scanAndFlagOverdueTasks;

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
        // Khởi chạy tìm kiếm nhanh toàn cục
        initGlobalSearch();
    });
});
