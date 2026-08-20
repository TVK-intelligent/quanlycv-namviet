// JS xử lý logic cho Hồ sơ cá nhân & Đổi mật khẩu
document.addEventListener('DOMContentLoaded', () => {
    // Xác định chế độ trang hiện tại
    if (document.getElementById('user-avatar-display') || document.querySelector('.profile-grid')) {
        initProfilePage();
    } else if (document.getElementById('change-password-form')) {
        initChangePasswordPage();
    }
});

// Helper định dạng ngày tháng dd/mm/yyyy
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Helper lấy ký tự viết tắt từ họ tên
function getInitials(name) {
    if (!name) return "KT";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    const lastWord = words[words.length - 1];
    const firstWord = words[0];
    return (firstWord[0] + lastWord[0]).toUpperCase();
}

// Hàm hiển thị Toast thông báo nổi góc trên phải
window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        padding: 12px 20px;
        border-radius: var(--border-radius-md);
        background: #ffffff;
        color: var(--text-main);
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
        border-left: 4px solid var(--primary-color);
    `;
    
    let icon = '<i class="fa-solid fa-circle-info" style="color: var(--primary-color);"></i>';
    if (type === 'success') {
        toast.style.borderLeftColor = 'var(--success-color)';
        icon = '<i class="fa-solid fa-circle-check" style="color: var(--success-color);"></i>';
    } else if (type === 'error') {
        toast.style.borderLeftColor = 'var(--danger-color)';
        icon = '<i class="fa-solid fa-circle-xmark" style="color: var(--danger-color);"></i>';
    } else if (type === 'warning') {
        toast.style.borderLeftColor = 'var(--warning-color)';
        icon = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--warning-color);"></i>';
    }
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    
    // Kích hoạt animation slide-down & fade-in
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Tự động tắt sau 3 giây
    setTimeout(() => {
        toast.style.transform = 'translateY(-20px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
};

// ==========================================
// LOGIC TRANG HỒ SƠ CÁ NHÂN (profile.html)
// ==========================================
function initProfilePage() {
    let currentRole = localStorage.getItem('etrms-simulated-role') || 'all';
    
    function renderProfile() {
        let profileKey = currentRole;
        if (currentRole === 'all') {
            profileKey = 'head'; // Mặc định lấy Trưởng phòng khi chọn chế độ Tất cả
        }
        
        const profiles = JSON.parse(localStorage.getItem('etrms-user-profiles'));
        const user = profiles ? profiles[profileKey] : null;
        if (!user) return;
        
        // 1. Cập nhật thông tin hiển thị cá nhân & công việc
        document.getElementById('user-avatar-display').textContent = user.avatar;
        document.getElementById('user-avatar-display').style.backgroundColor = user.avatarColor;
        document.getElementById('user-name-display').textContent = user.name;
        document.getElementById('user-title-display').textContent = user.title;
        
        document.getElementById('info-fullname').textContent = user.name;
        document.getElementById('info-dob').textContent = user.dob ? formatDate(user.dob) : '--';
        document.getElementById('info-email').textContent = user.email;
        document.getElementById('info-phone').textContent = user.phone || '--';
        
        document.getElementById('info-department').textContent = user.department;
        document.getElementById('info-title').textContent = user.title;
        document.getElementById('info-joined').textContent = user.joinedDate ? formatDate(user.joinedDate) : '--';
        document.getElementById('info-sysrole').textContent = user.systemRole;
        
        // 4. Thống kê công việc
        document.getElementById('stat-total').textContent = user.stats.total;
        document.getElementById('stat-completed').textContent = user.stats.completed;
        document.getElementById('stat-active').textContent = user.stats.active;
        document.getElementById('stat-overdue').textContent = user.stats.overdue;
        
        // 5 & 6. Dự án tham gia & Tiến độ/Phân bổ
        let overallWsi = 0;
        const projectContainer = document.getElementById('projects-list-container');
        projectContainer.innerHTML = '';
        
        user.projects.forEach(proj => {
            overallWsi += proj.capacity;
            
            const projCard = document.createElement('div');
            projCard.className = 'profile-project-card';
            
            // Màu sắc cho WSI của từng dự án
            let capacityColor = 'var(--success-color)';
            if (proj.capacity === 100) capacityColor = 'var(--warning-color)';
            else if (proj.capacity > 100) capacityColor = 'var(--danger-color)';
            
            projCard.innerHTML = `
                <div class="project-card-header">
                    <span class="project-card-name"><i class="fa-solid fa-folder" style="color: var(--primary-color); margin-right: 8px;"></i>${proj.name}</span>
                    <span class="project-card-allocation" style="color: ${capacityColor}">${proj.capacity}% lực lượng</span>
                </div>
                <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                    <div style="width: ${Math.min(proj.capacity, 100)}%; height: 100%; background-color: ${capacityColor}; border-radius: 4px;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
                    <span>Tiến độ chung dự án:</span>
                    <span style="font-weight: 600; color: var(--text-main);">${proj.progress}%</span>
                </div>
            `;
            projectContainer.appendChild(projCard);
        });
        
        // Cập nhật Sức tải tổng quan (WSI)
        document.getElementById('overall-wsi-text').textContent = `${overallWsi}%`;
        const overallWsiBar = document.getElementById('overall-wsi-bar');
        overallWsiBar.style.width = `${Math.min(overallWsi, 100)}%`;
        
        let overallColor = 'var(--success-color)';
        let descText = 'Trạng thái tải công việc an toàn. Bạn có thể đảm nhiệm thêm các công việc khác.';
        if (overallWsi === 100) {
            overallColor = 'var(--warning-color)';
            descText = 'Sức tải công việc đạt mức tối ưu (100% công suất phân bổ).';
        } else if (overallWsi > 100) {
            overallColor = 'var(--danger-color)';
            descText = 'Cảnh báo: Bạn đang bị quá tải phân bổ! Vui lòng thảo luận với PM để giảm tải.';
        }
        overallWsiBar.style.backgroundColor = overallColor;
        document.getElementById('overall-wsi-text').style.color = overallColor;
        document.getElementById('overall-wsi-desc').textContent = descText;
        
        // 7. Hoạt động gần đây
        const timelineContainer = document.getElementById('profile-timeline');
        timelineContainer.innerHTML = '';
        
        user.activities.forEach((act, idx) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            let nodeClass = '';
            if (idx === 0) nodeClass = 'badge-node-blue';
            else if (idx === 1) nodeClass = 'badge-node-yellow';
            
            item.innerHTML = `
                <div class="timeline-badge-node ${nodeClass}"></div>
                <div class="timeline-content">
                    <span class="timeline-header">${act.desc}</span>
                    <span class="timeline-time">${act.time}</span>
                </div>
            `;
            timelineContainer.appendChild(item);
        });
    }
    
    // Khởi tạo hiển thị ban đầu
    renderProfile();
    
    // Lắng nghe sự kiện chuyển đổi vai trò ở Header để cập nhật lại Profile tức thì
    window.addEventListener('etrms-role-changed', (e) => {
        currentRole = e.detail.role;
        renderProfile();
    });
    
    // Điều khiển Modal Chỉnh sửa hồ sơ (Mục 3)
    const modal = document.getElementById('edit-profile-modal');
    const btnEdit = document.getElementById('btn-edit-profile');
    const btnCancel = document.getElementById('btn-cancel-edit');
    const closeX = document.getElementById('modal-close-x');
    const form = document.getElementById('edit-profile-form');
    
    let selectedColor = '#1890FF';
    
    btnEdit.addEventListener('click', () => {
        let profileKey = currentRole;
        if (currentRole === 'all') {
            profileKey = 'head';
        }
        
        const profiles = JSON.parse(localStorage.getItem('etrms-user-profiles'));
        const user = profiles[profileKey];
        
        // Load thông tin hiện tại vào form
        document.getElementById('edit-name').value = user.name;
        document.getElementById('edit-email').value = user.email;
        document.getElementById('edit-phone').value = user.phone || '';
        document.getElementById('edit-dob').value = user.dob || '';
        
        // Avatar preview trong modal
        const preview = document.getElementById('modal-avatar-preview');
        preview.textContent = user.avatar;
        preview.style.backgroundColor = user.avatarColor;
        selectedColor = user.avatarColor;
        
        // Chọn màu active tương ứng
        document.querySelectorAll('.color-option').forEach(opt => {
            if (opt.getAttribute('data-color').toLowerCase() === user.avatarColor.toLowerCase()) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
        
        modal.classList.add('open');
    });
    
    const closeModal = () => modal.classList.remove('open');
    btnCancel.addEventListener('click', closeModal);
    closeX.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Đổi màu nền Avatar
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            selectedColor = opt.getAttribute('data-color');
            
            const preview = document.getElementById('modal-avatar-preview');
            preview.style.backgroundColor = selectedColor;
            
            // Đồng bộ lại chữ cái viết tắt khi đổi màu
            const nameInput = document.getElementById('edit-name').value;
            preview.textContent = getInitials(nameInput);
        });
    });
    
    // Cập nhật avatar preview tự động khi gõ tên
    document.getElementById('edit-name').addEventListener('input', (e) => {
        const preview = document.getElementById('modal-avatar-preview');
        preview.textContent = getInitials(e.target.value);
    });
    
    // Submit lưu thay đổi hồ sơ
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let profileKey = currentRole;
        if (currentRole === 'all') {
            profileKey = 'head';
        }
        
        const profiles = JSON.parse(localStorage.getItem('etrms-user-profiles'));
        const user = profiles[profileKey];
        
        const nameVal = document.getElementById('edit-name').value.trim();
        const emailVal = document.getElementById('edit-email').value.trim();
        const phoneVal = document.getElementById('edit-phone').value.trim();
        const dobVal = document.getElementById('edit-dob').value;
        
        // Cập nhật dữ liệu người dùng
        user.name = nameVal;
        user.email = emailVal;
        user.phone = phoneVal;
        user.dob = dobVal;
        user.avatar = getInitials(nameVal);
        user.avatarColor = selectedColor;
        
        // Lưu lịch sử hoạt động (Mục 7)
        user.activities.unshift({
            desc: "Đã cập nhật thông tin hồ sơ cá nhân",
            time: "Vừa xong"
        });
        if (user.activities.length > 5) user.activities.pop();
        
        localStorage.setItem('etrms-user-profiles', JSON.stringify(profiles));
        
        // Đóng modal, re-render trang, cập nhật header
        closeModal();
        renderProfile();
        window.syncUserHeaderAndWelcome();
        window.showToast("Cập nhật hồ sơ cá nhân thành công!");
    });
}

// ==========================================
// LOGIC TRANG ĐỔI MẬT KHẨU (change-password.html)
// ==========================================
function initChangePasswordPage() {
    const form = document.getElementById('change-password-form');
    if (!form) return;
    
    // Toggle ẩn/hiện mật khẩu
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const icon = btn.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fa-regular fa-eye';
            } else {
                input.type = 'password';
                icon.className = 'fa-regular fa-eye-slash';
            }
        });
    });
    
    // Kiểm tra độ mạnh mật khẩu mới
    const newPasswordInput = document.getElementById('new-password');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const feedback = document.getElementById('password-feedback');
    
    newPasswordInput.addEventListener('input', (e) => {
        const val = e.target.value;
        let score = 0;
        
        if (val.length >= 6) score++;
        if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;
        
        strengthBars.forEach(bar => bar.style.backgroundColor = '#e2e8f0');
        
        if (val.length === 0) {
            feedback.textContent = 'Nhập mật khẩu mới...';
            feedback.style.color = 'var(--text-muted)';
            return;
        }
        
        if (val.length < 6) {
            strengthBars[0].style.backgroundColor = 'var(--danger-color)';
            feedback.textContent = 'Mật khẩu quá ngắn (Tối thiểu 6 ký tự)';
            feedback.style.color = 'var(--danger-color)';
            return;
        }
        
        if (score === 1) {
            strengthBars[0].style.backgroundColor = 'var(--danger-color)';
            feedback.textContent = 'Yếu';
            feedback.style.color = 'var(--danger-color)';
        } else if (score === 2) {
            strengthBars[0].style.backgroundColor = 'var(--warning-color)';
            strengthBars[1].style.backgroundColor = 'var(--warning-color)';
            feedback.textContent = 'Trung bình (Nên thêm ký tự đặc biệt)';
            feedback.style.color = 'var(--warning-color)';
        } else if (score === 3) {
            strengthBars[0].style.backgroundColor = 'var(--success-color)';
            strengthBars[1].style.backgroundColor = 'var(--success-color)';
            strengthBars[2].style.backgroundColor = 'var(--success-color)';
            feedback.textContent = 'Mật khẩu mạnh & An toàn';
            feedback.style.color = 'var(--success-color)';
        }
    });
    
    // Submit form đổi mật khẩu
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentPass = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;
        
        if (newPass.length < 6) {
            window.showToast("Mật khẩu mới phải có tối thiểu 6 ký tự!", "error");
            return;
        }
        
        if (newPass !== confirmPass) {
            window.showToast("Mật khẩu xác nhận mới không trùng khớp!", "error");
            return;
        }
        
        if (currentPass === newPass) {
            window.showToast("Mật khẩu mới không được trùng mật khẩu cũ!", "error");
            return;
        }
        
        // Lưu lịch sử hoạt động vào vai trò đang chọn
        const currentRole = localStorage.getItem('etrms-simulated-role') || 'all';
        let profileKey = currentRole;
        if (currentRole === 'all') {
            profileKey = 'head';
        }
        
        const profiles = JSON.parse(localStorage.getItem('etrms-user-profiles'));
        if (profiles && profiles[profileKey]) {
            profiles[profileKey].activities.unshift({
                desc: "Đã thực hiện đổi mật khẩu tài khoản",
                time: "Vừa xong"
            });
            if (profiles[profileKey].activities.length > 5) {
                profiles[profileKey].activities.pop();
            }
            localStorage.setItem('etrms-user-profiles', JSON.stringify(profiles));
        }
        
        window.showToast("Đổi mật khẩu tài khoản thành công!");
        
        // Quay lại trang profile sau 1.5 giây
        setTimeout(() => {
            window.location.href = '/pages/profile/profile.html';
        }, 1500);
    });
}
