// Khởi tạo danh sách Phòng ban mẫu (Task 57)
const defaultDepartments = [
    { id: "DEPT_DEV", code: "DEV", name: "Phòng Phát triển", parentId: null },
    { id: "DEPT_QA", code: "QA", name: "Phòng Kiểm thử", parentId: null },
    { id: "DEPT_HR", code: "HR", name: "Phòng Nhân sự", parentId: null }
];

// Khởi tạo danh sách Nhân viên mẫu (Task 50)
// Chú ý: deptId được liên kết với id của bảng Phòng ban ở trên
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

// Hàm nạp dữ liệu vào LocalStorage khi trang web vừa chạy
function initMockData() {
    if (!localStorage.getItem('etrms_departments')) {
        localStorage.setItem('etrms_departments', JSON.stringify(defaultDepartments));
    }
    if (!localStorage.getItem('etrms_employees')) {
        localStorage.setItem('etrms_employees', JSON.stringify(defaultEmployees));
    }
    console.log("Đã khởi tạo Database ảo thành công!");
}

// Chạy hàm
initMockData();

// ==========================================
// PHẦN LOGIC XỬ LÝ GIAO DIỆN & TƯƠNG TÁC
// ==========================================

// 1. Lấy dữ liệu từ LocalStorage ra để sử dụng
let currentEmployees = JSON.parse(localStorage.getItem('etrms_employees')) || [];
let currentDepartments = JSON.parse(localStorage.getItem('etrms_departments')) || [];

// Hàm phụ trợ: Lấy tên phòng ban từ bảng Departments dựa vào deptId
function getDeptName(deptId) {
    const dept = currentDepartments.find(d => d.id === deptId);
    return dept ? dept.name : "Chưa phân bổ";
}

// 2. Hàm Render danh sách nhân viên (Task 50)
function renderEmployeeList(dataToRender) {
    const tbody = document.getElementById('employee-table-body');
    if (!tbody) return;

    tbody.innerHTML = ''; // Xóa dữ liệu cũ trên bảng

    dataToRender.forEach(emp => {
        // Xử lý Logic hiển thị WSI Capacity
        let wsiColorClass = 'bg-[#52C41A]'; // Xanh mặc định
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

        // Lấy tên phòng ban thực tế
        const departmentName = getDeptName(emp.deptId);

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
            <td class="p-4">${departmentName}</td>
            <td class="p-4">
                <span class="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold">
                    ${emp.deptRole}
                </span>
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
                    <button class="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-primary transition-colors" title="Sửa">
                        <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button class="w-8 h-8 rounded hover:bg-red-100 flex items-center justify-center text-[#FF4D4F] transition-colors" title="Xóa">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 3. Hàm xử lý Tìm kiếm (Task 55) & Lọc (Task 56) kết hợp
function handleSearchAndFilter() {
    const searchKeyword = document.getElementById('search-emp').value.toLowerCase();
    const selectedDept = document.getElementById('filter-dept').value;

    // Dùng hàm .filter() của Array để lọc dữ liệu
    const filteredEmployees = currentEmployees.filter(emp => {
        // Kiểm tra xem tên hoặc email có chứa từ khóa không
        const isMatchKeyword = emp.fullName.toLowerCase().includes(searchKeyword) || 
                               emp.email.toLowerCase().includes(searchKeyword);
        
        // Kiểm tra xem phòng ban có khớp không (Nếu chọn ALL thì luôn đúng)
        const isMatchDept = (selectedDept === 'ALL') || (emp.deptId === selectedDept);

        // Phải thỏa mãn cả 2 điều kiện thì mới giữ lại
        return isMatchKeyword && isMatchDept;
    });

    // Vẽ lại bảng với dữ liệu đã lọc
    renderEmployeeList(filteredEmployees);
}

// 4. Khởi chạy khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    // Render lần đầu tiên với toàn bộ dữ liệu
    renderEmployeeList(currentEmployees);

    // Gắn sự kiện "gõ phím" (input) cho ô Tìm kiếm
    document.getElementById('search-emp')?.addEventListener('input', handleSearchAndFilter);

    // Gắn sự kiện "thay đổi" (change) cho dropdown Lọc phòng ban
    document.getElementById('filter-dept')?.addEventListener('change', handleSearchAndFilter);
});