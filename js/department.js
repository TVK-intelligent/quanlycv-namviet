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
        tr.className = 'border-b border-gray-100 hover:bg-gray-50 transition-colors group';
        tr.innerHTML = `
            <td class="py-3 px-4 font-semibold text-[#005daa]">${dept.code}</td>
            <td class="py-3 px-4 font-medium">${dept.name}</td>
            <td class="py-3 px-4">${getParentName(dept.parentId)}</td>
            <td class="py-3 px-4 text-center">
                <a href="department-member.html?deptId=${dept.id}" title="Xem danh sách thành viên" class="inline-flex items-center justify-center bg-blue-100 text-blue-800 rounded-full h-6 px-3 text-xs font-bold hover:bg-blue-200 transition-colors cursor-pointer">
                    ${empCount}
                </a>
            </td>
            <td class="py-3 px-4 text-right">
                <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-[#005daa]" onclick="editDepartment('${dept.id}')" title="Sửa">
                        <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button class="w-8 h-8 rounded hover:bg-red-100 flex items-center justify-center text-red-500" onclick="deleteDepartment('${dept.id}')" title="Xóa">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
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
        alert("Vui lòng nhập đủ Mã và Tên phòng ban!");
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
        alert(`Không thể xóa! Phòng ban này đang có ${empCount} nhân sự. Vui lòng chuyển nhân sự sang phòng khác trước.`);
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