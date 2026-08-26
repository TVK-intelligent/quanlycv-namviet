/**
 * WORK MANAGEMENT SYSTEM - AUTHENTICATION MODULE (js/auth.js)
 * Quản lý Đăng nhập, Đăng xuất, Phân quyền phiên và Bảo vệ tuyến đường (Route Guard)
 */

(function(global) {
    'use strict';

    const AUTH_KEYS = {
        CURRENT_USER: 'etrms-auth-user',
        ACCOUNTS: 'etrms-user-accounts',
        PROFILES: 'etrms-user-profiles',
        SIMULATED_ROLE: 'etrms-simulated-role',
        REMEMBER_EMAIL: 'etrms-remember-email'
    };

    // Danh sách tài khoản mặc định
    const DEFAULT_ACCOUNTS = [
        {
            id: 'head',
            email: 'khai.tran@namviet.vn',
            password: '123',
            role: 'head',
            systemRole: 'ADMIN',
            name: 'Khải Trần',
            title: 'Trưởng phòng',
            department: 'Phòng Công nghệ Thông tin',
            avatar: 'KT',
            avatarColor: '#1890FF'
        },
        {
            id: 'pm',
            email: 'khanh.phan@namviet.vn',
            password: '123',
            role: 'pm',
            systemRole: 'USER',
            name: 'Phan Văn Khánh',
            title: 'Quản lý dự án (PM)',
            department: 'Phòng Công nghệ Thông tin',
            avatar: 'PK',
            avatarColor: '#FA8C16'
        },
        {
            id: 'employee',
            email: 'bach.le@namviet.vn',
            password: '123',
            role: 'employee',
            systemRole: 'USER',
            name: 'Lê Gia Bách',
            title: 'Lập trình viên (Developer)',
            department: 'Phòng Công nghệ Thông tin',
            avatar: 'GB',
            avatarColor: '#52C41A'
        }
    ];

    // Khởi tạo tài khoản vào LocalStorage nếu chưa có
    function initAccounts() {
        if (!localStorage.getItem(AUTH_KEYS.ACCOUNTS)) {
            localStorage.setItem(AUTH_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
        }
    }

    // Lấy danh sách tài khoản
    function getAccounts() {
        initAccounts();
        try {
            return JSON.parse(localStorage.getItem(AUTH_KEYS.ACCOUNTS)) || DEFAULT_ACCOUNTS;
        } catch (e) {
            return DEFAULT_ACCOUNTS;
        }
    }

    // Lấy thông tin người dùng hiện tại đang đăng nhập
    function getCurrentUser() {
        const sessionStr = localStorage.getItem(AUTH_KEYS.CURRENT_USER);
        if (!sessionStr) return null;
        try {
            const user = JSON.parse(sessionStr);
            // Đồng bộ thêm với profile mới nhất nếu user đã chỉnh sửa hồ sơ
            const profilesStr = localStorage.getItem(AUTH_KEYS.PROFILES);
            if (profilesStr && user && user.role) {
                const profiles = JSON.parse(profilesStr);
                const roleKey = user.role === 'all' ? 'head' : user.role;
                if (profiles && profiles[roleKey]) {
                    const prof = profiles[roleKey];
                    user.name = prof.name || user.name;
                    user.avatar = prof.avatar || user.avatar;
                    user.avatarColor = prof.avatarColor || user.avatarColor;
                    user.title = prof.title || user.title;
                    user.department = prof.department || user.department;
                }
            }
            return user;
        } catch (e) {
            return null;
        }
    }

    // Kiểm tra đăng nhập (Route Guard)
    function checkAuth(isLoginPage = false) {
        const user = getCurrentUser();
        const currentPath = window.location.pathname;

        if (isLoginPage) {
            // Nếu đang ở trang login mà đã có phiên -> chuyển về index
            if (user) {
                window.location.href = '/index.html';
            }
        } else {
            // Nếu đang ở các trang hệ thống mà chưa đăng nhập -> chuyển về login
            if (!user) {
                const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
                window.location.href = `/login.html?redirect=${redirectUrl}`;
            }
        }
    }

    // Xử lý đăng nhập
    function login(email, password, rememberMe = false) {
        const accounts = getAccounts();
        const normalizedEmail = (email || '').trim().toLowerCase();
        const found = accounts.find(acc => acc.email.toLowerCase() === normalizedEmail && acc.password === password);

        if (!found) {
            return {
                success: false,
                message: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
            };
        }

        // Tạo phiên đăng nhập
        const sessionUser = {
            id: found.id,
            email: found.email,
            role: found.role,
            systemRole: found.systemRole,
            name: found.name,
            title: found.title,
            department: found.department,
            avatar: found.avatar,
            avatarColor: found.avatarColor,
            token: 'jwt_mock_' + Math.random().toString(36).substring(2) + Date.now(),
            loginAt: new Date().toISOString()
        };

        localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
        
        // Đồng bộ chế độ hiển thị vai trò với vai trò người đăng nhập
        localStorage.setItem(AUTH_KEYS.SIMULATED_ROLE, found.role);

        // Lưu / Xóa Ghi nhớ Email
        if (rememberMe) {
            localStorage.setItem(AUTH_KEYS.REMEMBER_EMAIL, normalizedEmail);
        } else {
            localStorage.removeItem(AUTH_KEYS.REMEMBER_EMAIL);
        }

        return {
            success: true,
            user: sessionUser
        };
    }

    // Cập nhật mật khẩu tài khoản (Dùng khi đổi mật khẩu ở Profile)
    function updatePassword(roleOrEmail, newPassword) {
        const accounts = getAccounts();
        const idx = accounts.findIndex(acc => acc.role === roleOrEmail || acc.email.toLowerCase() === roleOrEmail.toLowerCase());
        if (idx !== -1) {
            accounts[idx].password = newPassword;
            localStorage.setItem(AUTH_KEYS.ACCOUNTS, JSON.stringify(accounts));
            return true;
        }
        return false;
    }

    // Xử lý đăng xuất
    function logout(showConfirm = false) {
        if (showConfirm) {
            // Hiển thị modal hoặc popup xác nhận
            if (typeof window.openModal === 'function') {
                window.openModal(
                    '<i class="fa-solid fa-arrow-right-from-bracket" style="color: var(--danger-color); margin-right: 8px;"></i>Xác nhận Đăng xuất',
                    `<p style="font-size: 14px; color: #475569; margin: 8px 0;">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống <strong>Work Management</strong>?</p>`,
                    () => {
                        performLogout();
                    }
                );
                return;
            } else if (!confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
                return;
            }
        }
        performLogout();
    }

    function performLogout() {
        localStorage.removeItem(AUTH_KEYS.CURRENT_USER);
        if (typeof window.showToast === 'function') {
            window.showToast('Đã đăng xuất thành công. Đang chuyển hướng...', 'info');
        }
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 400);
    }

    // Hàm hiển thị Toast chuyên dụng cho trang Auth
    function showAuthToast(message, type = 'success') {
        let container = document.getElementById('auth-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'auth-toast-container';
            container.style.cssText = 'position: fixed; top: 24px; right: 24px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const borderColor = type === 'error' ? '#FF4D4F' : (type === 'info' ? '#1890FF' : '#52C41A');
        const iconClass = type === 'error' ? 'fa-solid fa-circle-exclamation' : (type === 'info' ? 'fa-solid fa-circle-info' : 'fa-solid fa-circle-check');
        const iconColor = borderColor;

        toast.style.cssText = `
            padding: 14px 20px;
            border-radius: 10px;
            background: #ffffff;
            color: #1e293b;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 13.5px;
            font-weight: 500;
            pointer-events: auto;
            transform: translateY(-20px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            border-left: 4px solid ${borderColor};
            max-width: 380px;
        `;

        toast.innerHTML = `
            <i class="${iconClass}" style="color: ${iconColor}; font-size: 17px; flex-shrink: 0;"></i>
            <span style="line-height: 1.4;">${message}</span>
        `;

        container.appendChild(toast);

        // Hiệu ứng animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        // Tự biến mất
        setTimeout(() => {
            toast.style.transform = 'translateY(-20px)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3500);
    }

    // Export ra toàn cục
    global.AuthService = {
        initAccounts,
        getAccounts,
        getCurrentUser,
        checkAuth,
        login,
        logout,
        updatePassword,
        showAuthToast,
        AUTH_KEYS
    };

    // Khởi tạo ngay khi script load
    if (typeof localStorage !== 'undefined') {
        initAccounts();
    }

})(typeof window !== 'undefined' ? window : globalThis);
