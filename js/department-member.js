document.addEventListener('DOMContentLoaded', () => {
    // 1. Kéo dữ liệu từ LocalStorage
    const currentEmployees = JSON.parse(localStorage.getItem('etrms_employees')) || [];
    const currentDepartments = JSON.parse(localStorage.getItem('etrms_departments')) || [];
    
    const selectDept = document.getElementById('select-dept-view');
    const tbody = document.getElementById('member-table-body');
    const emptyState = document.getElementById('empty-state');

    // 2. Khởi tạo dropdown Phòng ban
    function initDropdown() {
        if (currentDepartments.length === 0) {
            selectDept.innerHTML = '<option value="">Chưa có phòng ban nào</option>';
            return;
        }

        selectDept.innerHTML = ''; 
        currentDepartments.forEach(dept => {
            selectDept.innerHTML += `<option value="${dept.id}">${dept.name} (${dept.code})</option>`;
        });

        // --- ĐOẠN CODE MỚI THÊM VÀO ĐỂ ĐỌC URL ---
        const urlParams = new URLSearchParams(window.location.search);
        const deptIdFromUrl = urlParams.get('deptId');

        if (deptIdFromUrl && currentDepartments.some(d => d.id === deptIdFromUrl)) {
            // Nếu có ID trên URL, tự động chọn phòng ban đó
            selectDept.value = deptIdFromUrl;
            renderMembersByDept(deptIdFromUrl);
        } else {
            // Nếu không có, render mặc định phòng đầu tiên
            renderMembersByDept(currentDepartments[0].id);
        }
    }

    // 3. Hàm lọc và vẽ danh sách nhân viên
    function renderMembersByDept(deptId) {
        tbody.innerHTML = '';
        
        // Cốt lõi của Task 63: LỌC DỮ LIỆU
        const members = currentEmployees.filter(emp => emp.deptId === deptId);

        // Xử lý giao diện nếu không có ai
        if (members.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.style.display = 'flex';
            return;
        } else {
            emptyState.classList.add('hidden');
            emptyState.style.display = 'none';
        }

        // Vẽ từng người ra bảng
        members.forEach(emp => {
            let wsiColor = '#52c41a';
            let wsiLabel = 'Tối ưu';
            if (emp.wsiCapacity === 100) {
                wsiColor = '#faad14';
                wsiLabel = 'Đầy tải';
            } else if (emp.wsiCapacity > 100) {
                wsiColor = '#ff4d4f';
                wsiLabel = '<i class="fa-solid fa-triangle-exclamation" style="margin-right: 3px;"></i> Quá tải';
            }

            let roleBadgeBg = '#e6f7ff';
            let roleBadgeColor = '#1890ff';
            if (emp.deptRole === 'HEAD') {
                roleBadgeBg = '#fff7e6';
                roleBadgeColor = '#fa8c16';
            } else if (emp.deptRole === 'TEAM_LEAD') {
                roleBadgeBg = '#f6ffed';
                roleBadgeColor = '#52c41a';
            }
            
            const tr = document.createElement('tr');
            tr.style.cssText = 'border-bottom: 1px solid #f0f0f0; transition: background-color 0.2s;';
            tr.onmouseenter = () => tr.style.backgroundColor = '#fafafa';
            tr.onmouseleave = () => tr.style.backgroundColor = '#ffffff';
            tr.innerHTML = `
                <td style="padding: 12px 16px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #f0f0f0;" src="${emp.avatar}" alt="Avatar" onerror="this.src='https://ui-avatars.com/api/?name=' + encodeURIComponent('${emp.fullName}') + '&background=1890ff&color=fff'">
                        <span style="font-weight: 600; color: #262626;">${emp.fullName}</span>
                    </div>
                </td>
                <td style="padding: 12px 16px; color: #595959;">${emp.email}</td>
                <td style="padding: 12px 16px;">
                    <span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; background: ${roleBadgeBg}; color: ${roleBadgeColor}; font-size: 11px; font-weight: 600;">
                        ${emp.deptRole}
                    </span>
                </td>
                <td style="padding: 12px 16px; width: 220px;">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #8c8c8c;">
                            <span style="display: flex; align-items: center; ${emp.wsiCapacity > 100 ? 'color: #ff4d4f; font-weight: 600;' : ''}">${wsiLabel}</span>
                            <span style="font-weight: 600; color: ${wsiColor};">${emp.wsiCapacity}%</span>
                        </div>
                        <div style="width: 100%; background: #f0f0f0; border-radius: 99px; height: 6px; overflow: hidden;">
                            <div style="width: ${Math.min(emp.wsiCapacity, 100)}%; background: ${wsiColor}; height: 100%; border-radius: 99px; transition: width 0.4s ease;"></div>
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 4. Bắt sự kiện khi người dùng chọn phòng ban khác
    selectDept.addEventListener('change', (e) => {
        renderMembersByDept(e.target.value);
    });

    // Chạy hàm khởi tạo
    initDropdown();
});