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
        let wsiColorClass = 'bg-[#52C41A]'; 
        let wsiTextClass = 'text-on-surface-variant';
        let wsiLabel = 'Tối ưu';
        
        if (emp.wsiCapacity === 100) {
            wsiColorClass = 'bg-[#FAAD14]'; 
            wsiTextClass = 'text-[#FAAD14]';
            wsiLabel = 'Đầy tải';
        } else if (emp.wsiCapacity > 100) {
            wsiColorClass = 'bg-[#FF4D4F]'; 
            wsiTextClass = 'text-[#FF4D4F]';
            wsiLabel = '<span class="material-symbols-outlined text-[14px] align-middle">warning</span> Quá tải';
        }

        const tr = document.createElement('tr');
        tr.className = 'group transition-colors hover:bg-surface-bright cursor-pointer border-b border-gray-100 last:border-none';
        
        tr.innerHTML = `
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <img class="w-8 h-8 rounded-full object-cover shadow-sm" src="${emp.avatar}" alt="Avatar">
                    <span class="font-semibold text-on-surface">${emp.fullName}</span>
                </div>
            </td>
            <td class="p-4 text-on-surface-variant">${emp.email}</td>
            <td class="p-4">${getDeptName(emp.deptId)}</td>
            <td class="p-4">
                <span class="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold">${emp.deptRole}</span>
            </td>
            <td class="p-4 w-48">
                <div class="flex flex-col gap-1">
                    <div class="flex justify-between text-xs text-on-surface-variant">
                        <span class="flex items-center gap-1 ${emp.wsiCapacity > 100 ? 'text-[#FF4D4F]' : ''}">${wsiLabel}</span>
                        <span class="font-semibold ${wsiTextClass}">${emp.wsiCapacity}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-[6px] overflow-hidden">
                        <div class="${wsiColorClass} h-full rounded-full transition-all duration-1000" style="width: ${Math.min(emp.wsiCapacity, 100)}%"></div>
                    </div>
                </div>
            </td>
            <td class="p-4 text-right">
                <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-primary transition-colors" onclick="editEmployee('${emp.id}')" title="Sửa">
                        <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button class="w-8 h-8 rounded hover:bg-red-100 flex items-center justify-center text-[#FF4D4F] transition-colors" onclick="deleteEmployee('${emp.id}')" title="Xóa">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
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
            alert("Vui lòng nhập đầy đủ Họ tên, Email và Phòng ban!");
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
            alert("Thêm nhân viên thành công!");
        } else {
            const index = currentEmployees.findIndex(emp => emp.id === currentEditId);
            if (index !== -1) {
                currentEmployees[index].fullName = name;
                currentEmployees[index].email = email;
                currentEmployees[index].phone = phone;
                if (avatar) currentEmployees[index].avatar = avatar; 
                currentEmployees[index].deptId = deptId;
                currentEmployees[index].deptRole = deptRole;
                alert("Cập nhật thông tin thành công!");
            }
        }

        localStorage.setItem('etrms_employees', JSON.stringify(currentEmployees));
        closeModal();
        handleSearchAndFilter(); 
        currentEditId = null; 
    });
});