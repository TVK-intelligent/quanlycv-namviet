// ==========================================
// 1. BIẾN TOÀN CỤC & LẤY DỮ LIỆU
// ==========================================
let currentDepartments = JSON.parse(localStorage.getItem('etrms_departments')) || [];
let currentEmployees = JSON.parse(localStorage.getItem('etrms_employees')) || [];
let currentEditDeptId = null;

// Hàm đếm số nhân sự của một phòng ban (Task 63, 64 - Liên kết dữ liệu)
function getEmployeeCount(deptId) {
    // Lọc những nhân viên có deptId khớp với mã phòng ban hiện tại
    const employeesInDept = currentEmployees.filter(emp => emp.deptId === deptId);
    return employeesInDept.length;
}

// Lấy tên phòng ban cha
function getParentName(parentId) {
    if (!parentId) return `<span class="text-gray-400 italic">Không có (Cấp cao nhất)</span>`;
    const parent = currentDepartments.find(d => d.id === parentId);
    return parent ? parent.name : "Không xác định";
}

// ==========================================
// 2. RENDER & TÌM KIẾM
// ==========================================
function renderDepartmentList(dataToRender) {
    const tbody = document.getElementById('department-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    dataToRender.forEach(dept => {
        const empCount = getEmployeeCount(dept.id);
        
        const tr = document.createElement('tr');
        tr.style.cssText = 'border-bottom: 1px solid #f0f0f0; transition: background-color 0.2s;';
        tr.onmouseenter = () => tr.style.backgroundColor = '#fafafa';
        tr.onmouseleave = () => tr.style.backgroundColor = '#ffffff';
        tr.innerHTML = `
            <td style="padding: 12px 16px; font-weight: 700; color: #1890ff;">${dept.code}</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #262626;">${dept.name}</td>
            <td style="padding: 12px 16px; color: #595959;">${getParentName(dept.parentId)}</td>
            <td style="padding: 12px 16px; text-align: center;">
                <a href="department-member.html?deptId=${dept.id}" title="Xem danh sách thành viên" style="display: inline-flex; align-items: center; justify-content: center; background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; border-radius: 12px; height: 24px; padding: 0 10px; font-size: 12px; font-weight: 700; text-decoration: none; cursor: pointer; transition: all 0.2s;">
                    <i class="fa-solid fa-users" style="font-size: 10px; margin-right: 4px;"></i> ${empCount}
                </a>
            </td>
            <td style="padding: 12px 16px; text-align: right;">
                <div style="display: flex; justify-content: flex-end; gap: 6px;">
                    <button type="button" style="width: 30px; height: 30px; border-radius: 4px; border: 1px solid #d9d9d9; background: #fff; color: #1890ff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;" onclick="editDepartment('${dept.id}')" title="Sửa">
                        <i class="fa-solid fa-pen-to-square" style="font-size: 13px;"></i>
                    </button>
                    <button type="button" style="width: 30px; height: 30px; border-radius: 4px; border: 1px solid #ffccc7; background: #fff1f0; color: #ff4d4f; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;" onclick="deleteDepartment('${dept.id}')" title="Xóa">
                        <i class="fa-solid fa-trash-can" style="font-size: 13px;"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Hàm Tìm kiếm
document.getElementById('search-dept')?.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = currentDepartments.filter(d => 
        d.code.toLowerCase().includes(keyword) || 
        d.name.toLowerCase().includes(keyword)
    );
    renderDepartmentList(filtered);
});

// ==========================================
// 3. XỬ LÝ MODAL (THÊM / SỬA)
// ==========================================
function populateParentSelect(excludeId = null) {
    const select = document.getElementById('dept-parent');
    select.innerHTML = '<option value="">-- Cấp cao nhất (Không có phòng cha) --</option>';
    
    currentDepartments.forEach(dept => {
        // Không cho phép phòng ban tự chọn chính nó làm cha (tránh lỗi vòng lặp)
        if (dept.id !== excludeId) {
            select.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
        }
    });
}

const closeDeptModal = () => document.getElementById('dept-modal').classList.add('hidden');
document.getElementById('btn-close-dept')?.addEventListener('click', closeDeptModal);
document.getElementById('btn-cancel-dept')?.addEventListener('click', closeDeptModal);

// Bấm nút Thêm mới
document.getElementById('btn-add-dept')?.addEventListener('click', () => {
    currentEditDeptId = null;
    document.getElementById('dept-form').reset();
    document.getElementById('dept-modal-title').innerText = "Thêm mới Phòng ban";
    populateParentSelect();
    document.getElementById('dept-modal').classList.remove('hidden');
});

// Bấm nút Lưu
document.getElementById('btn-save-dept')?.addEventListener('click', () => {
    const code = document.getElementById('dept-code').value.trim();
    const name = document.getElementById('dept-name').value.trim();
    const parentId = document.getElementById('dept-parent').value || null;

    if (!code || !name) {
        if (window.showToast) window.showToast("Vui lòng nhập đủ Mã và Tên phòng ban!", "warning");
        return;
    }

    if (currentEditDeptId === null) {
        // Thêm mới
        const newDept = { id: code, code, name, parentId };
        currentDepartments.push(newDept);
    } else {
        // Cập nhật
        const index = currentDepartments.findIndex(d => d.id === currentEditDeptId);
        if (index !== -1) {
            currentDepartments[index].code = code;
            currentDepartments[index].name = name;
            currentDepartments[index].parentId = parentId;
        }
    }

    localStorage.setItem('etrms_departments', JSON.stringify(currentDepartments));
    closeDeptModal();
    renderDepartmentList(currentDepartments);
});

// ==========================================
// 4. SỬA VÀ XÓA (Gắn vào Window)
// ==========================================
window.editDepartment = function(id) {
    const dept = currentDepartments.find(d => d.id === id);
    if (!dept) return;

    currentEditDeptId = id;
    document.getElementById('dept-modal-title').innerText = "Cập nhật Phòng ban";
    document.getElementById('dept-code').value = dept.code;
    document.getElementById('dept-name').value = dept.name;
    
    populateParentSelect(id);
    document.getElementById('dept-parent').value = dept.parentId || "";
    
    document.getElementById('dept-modal').classList.remove('hidden');
};

window.deleteDepartment = function(id) {
    // Ràng buộc bảo vệ dữ liệu: Nếu phòng đang có người thì không cho xóa
    const empCount = getEmployeeCount(id);
    if (empCount > 0) {
        if (window.showToast) window.showToast(`Không thể xóa! Phòng ban này đang có ${empCount} nhân sự. Vui lòng chuyển nhân sự sang phòng khác trước.`, "error");
        return;
    }

    if (confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) {
        currentDepartments = currentDepartments.filter(d => d.id !== id);
        localStorage.setItem('etrms_departments', JSON.stringify(currentDepartments));
        renderDepartmentList(currentDepartments);
    }
};

// Khởi chạy khi load
document.addEventListener('DOMContentLoaded', () => {
    renderDepartmentList(currentDepartments);
});