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
            emptyState.classList.add('flex');
            return;
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');
        }

        // Vẽ từng người ra bảng
        members.forEach(emp => {
            // Xử lý màu sắc WSI
            let wsiColor = emp.wsiCapacity > 100 ? 'text-red-500' : (emp.wsiCapacity === 100 ? 'text-yellow-500' : 'text-green-500');
            
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-100 hover:bg-gray-50 transition-colors';
            tr.innerHTML = `
                <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                        <img class="w-8 h-8 rounded-full object-cover shadow-sm" src="${emp.avatar}" alt="Avatar">
                        <span class="font-semibold text-gray-800">${emp.fullName}</span>
                    </div>
                </td>
                <td class="py-3 px-4 text-gray-500">${emp.email}</td>
                <td class="py-3 px-4">
                    <span class="inline-flex bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-bold">
                        ${emp.deptRole}
                    </span>
                </td>
                <td class="py-3 px-4 font-semibold ${wsiColor}">
                    ${emp.wsiCapacity}%
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