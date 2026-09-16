// ==========================================
// 1. KHỞI TẠO DỮ LIỆU MẪU (MOCK DATA)
// ==========================================
const defaultDepartments = [
    { id: "DEPT_DEV", code: "DEV", name: "Phòng Phát triển", parentId: null },
    { id: "DEPT_QA", code: "QA", name: "Phòng Kiểm thử", parentId: null },
    { id: "DEPT_HR", code: "HR", name: "Phòng Nhân sự", parentId: null }
];

const defaultEmployees = [
    {
        id: "EMP_001",
        avatar: "https://tuanluupiano.com/wp-content/uploads/2026/01/meme-tuc-gian-15.jpg",
        fullName: "Trần Văn Minh",
        email: "minh.tv@etrms.vn",
        phone: "0987654321",
        deptId: "DEPT_DEV", 
        deptRole: "MEMBER",
        systemRole: "USER",
        wsiCapacity: 85
    },
    {
        id: "EMP_002",
        avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbP8XlDcZIwqPFC5Xa9K03gvVKHDpNsqi1CGaroWtjIrUkWXaQijOlo46N&s=10",
        fullName: "Lê Gia Bách",
        email: "bach.lg@etrms.vn",
        phone: "0912345678",
        deptId: "DEPT_QA",
        deptRole: "HEAD",
        systemRole: "ADMIN",
        wsiCapacity: 100
    },
    {
        id: "EMP_003",
        avatar: "https://tuanluupiano.com/wp-content/uploads/2026/01/meme-tuc-gian-6.jpg",
        fullName: "Nguyễn Tuấn Bùi",
        email: "bui.nt@etrms.vn",
        phone: "0909090909",
        deptId: "DEPT_DEV",
        deptRole: "TEAM_LEAD",
        systemRole: "USER",
        wsiCapacity: 125
    }
];

function initMockData() {
    if (!localStorage.getItem('etrms_departments')) {
        localStorage.setItem('etrms_departments', JSON.stringify(defaultDepartments));
    }
    if (!localStorage.getItem('etrms_employees')) {
        localStorage.setItem('etrms_employees', JSON.stringify(defaultEmployees));
    }
}
initMockData();

// ==========================================
// 2. BIẾN TOÀN CỤC & LẤY DỮ LIỆU
// ==========================================
let currentEmployees = JSON.parse(localStorage.getItem('etrms_employees')) || [];
let currentDepartments = JSON.parse(localStorage.getItem('etrms_departments')) || [];
let currentEditId = null; 

function getDeptName(deptId) {
    const dept = currentDepartments.find(d => d.id === deptId);
    return dept ? dept.name : "Chưa phân bổ";
}

// ==========================================
// 3. HÀM RENDER & TÌM KIẾM
// ==========================================
function renderEmployeeList(dataToRender) {
    const tbody = document.getElementById('employee-table-body');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    dataToRender.forEach(emp => {
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
            <td style="padding: 12px 16px; color: #262626;">${getDeptName(emp.deptId)}</td>
            <td style="padding: 12px 16px;">
                <span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; background: ${roleBadgeBg}; color: ${roleBadgeColor}; font-size: 11px; font-weight: 600;">${emp.deptRole}</span>
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
            <td style="padding: 12px 16px; text-align: right;">
                <div style="display: flex; justify-content: flex-end; gap: 6px;">
                    <button type="button" style="width: 30px; height: 30px; border-radius: 4px; border: 1px solid #d9d9d9; background: #fff; color: #1890ff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;" onclick="editEmployee('${emp.id}')" title="Sửa">
                        <i class="fa-solid fa-pen-to-square" style="font-size: 13px;"></i>
                    </button>
                    <button type="button" style="width: 30px; height: 30px; border-radius: 4px; border: 1px solid #ffccc7; background: #fff1f0; color: #ff4d4f; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;" onclick="deleteEmployee('${emp.id}')" title="Xóa">
                        <i class="fa-solid fa-trash-can" style="font-size: 13px;"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function handleSearchAndFilter() {
    const searchKeyword = document.getElementById('search-emp').value.toLowerCase();
    const selectedDept = document.getElementById('filter-dept').value;
    const filteredEmployees = currentEmployees.filter(emp => {
        const isMatchKeyword = emp.fullName.toLowerCase().includes(searchKeyword) || emp.email.toLowerCase().includes(searchKeyword);
        const isMatchDept = (selectedDept === 'ALL') || (emp.deptId === selectedDept);
        return isMatchKeyword && isMatchDept;
    });
    renderEmployeeList(filteredEmployees);
}

// ==========================================
// 4. XỬ LÝ MODAL (THÊM / SỬA)
// ==========================================
function populateDeptSelect() {
    const deptSelect = document.getElementById('emp-dept');
    if (!deptSelect) return;
    deptSelect.innerHTML = '<option value="">-- Chọn phòng ban --</option>';
    currentDepartments.forEach(dept => {
        deptSelect.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
    });
}

const closeModal = () => {
    document.getElementById('employee-modal')?.classList.add('hidden');
};

// ==========================================
// 5. CÁC HÀM TOÀN CỤC (SỬA & XÓA)
// ==========================================
window.deleteEmployee = function(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này không?")) return;
    currentEmployees = currentEmployees.filter(emp => emp.id !== id);
    localStorage.setItem('etrms_employees', JSON.stringify(currentEmployees));
    handleSearchAndFilter(); 
};

window.editEmployee = function(id) {
    const empToEdit = currentEmployees.find(emp => emp.id === id);
    if (!empToEdit) return;

    populateDeptSelect();
    document.getElementById('modal-title').innerText = "Chỉnh sửa Nhân viên";

    document.getElementById('emp-name').value = empToEdit.fullName;
    document.getElementById('emp-email').value = empToEdit.email;
    document.getElementById('emp-phone').value = empToEdit.phone || '';
    document.getElementById('emp-avatar').value = empToEdit.avatar || '';
    document.getElementById('emp-dept').value = empToEdit.deptId;
    document.getElementById('emp-role').value = empToEdit.deptRole || 'MEMBER';

    currentEditId = id;
    document.getElementById('employee-modal').classList.remove('hidden');
};

// ==========================================
// 6. GẮN SỰ KIỆN KHI TRANG LOAD XONG
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Render ban đầu
    renderEmployeeList(currentEmployees);

    // 2. Gắn sự kiện Tìm kiếm / Lọc
    document.getElementById('search-emp')?.addEventListener('input', handleSearchAndFilter);
    document.getElementById('filter-dept')?.addEventListener('change', handleSearchAndFilter);

    // 3. Gắn sự kiện Nút Thêm Mới
    document.getElementById('btn-add-emp')?.addEventListener('click', () => {
        populateDeptSelect(); 
        document.getElementById('employee-form')?.reset();
        document.getElementById('modal-title').innerText = "Thêm mới Nhân viên";
        currentEditId = null; 
        document.getElementById('employee-modal').classList.remove('hidden'); 
    });

    // 4. Gắn sự kiện Đóng Modal
    document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-modal')?.addEventListener('click', closeModal);

    // 5. Gắn sự kiện Lưu Modal
    document.getElementById('btn-save-emp')?.addEventListener('click', () => {
        const name = document.getElementById('emp-name').value.trim();
        const email = document.getElementById('emp-email').value.trim();
        const phone = document.getElementById('emp-phone').value.trim();
        const avatar = document.getElementById('emp-avatar').value.trim();
        const deptId = document.getElementById('emp-dept').value;
        const deptRole = document.getElementById('emp-role').value;
        
        if(!name || !email || !deptId) {
            if (window.showToast) window.showToast("Vui lòng nhập đầy đủ Họ tên, Email và Phòng ban!", "warning");
            return; 
        }

        if (currentEditId === null) {
            const newEmp = {
                id: "EMP_" + new Date().getTime(),
                avatar: avatar || "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70),
                fullName: name,
                email: email,
                phone: phone,
                deptId: deptId,
                deptRole: deptRole,
                systemRole: "USER",
                wsiCapacity: 0 
            };
            currentEmployees.unshift(newEmp); // Dùng unshift để thêm lên đầu bảng cho dễ nhìn
            if (window.showToast) window.showToast("Thêm nhân viên thành công!", "success");
        } else {
            const index = currentEmployees.findIndex(emp => emp.id === currentEditId);
            if (index !== -1) {
                currentEmployees[index].fullName = name;
                currentEmployees[index].email = email;
                currentEmployees[index].phone = phone;
                if (avatar) currentEmployees[index].avatar = avatar; 
                currentEmployees[index].deptId = deptId;
                currentEmployees[index].deptRole = deptRole;
                if (window.showToast) window.showToast("Cập nhật thông tin thành công!", "success");
            }
        }

        localStorage.setItem('etrms_employees', JSON.stringify(currentEmployees));
        closeModal();
        handleSearchAndFilter(); 
        currentEditId = null; 
    });
});