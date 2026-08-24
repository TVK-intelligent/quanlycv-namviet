/**
 * project-data.js
 * Shared data access layer for the Project Management module.
 * All project pages load this file BEFORE their own page JS.
 * Source of truth: MASTER IMPLEMENTATION PLAN — PART-01, Task 01-01
 */

// ─────────────────────────────────────────────────────────────
// 1. LocalStorage Key Constants
// ─────────────────────────────────────────────────────────────
const LS_KEYS = {
    PROJECTS: 'etrms-projects',
    MEMBERS: 'etrms-project-members',
    RESOURCE_REQUESTS: 'etrms-resource-requests',
    MOCK_USERS: 'etrms-mock-users',
    MOCK_DEPARTMENTS: 'etrms-mock-departments'
};

// ─────────────────────────────────────────────────────────────
// 2. Generic LocalStorage Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Read and parse a JSON array from localStorage.
 * Returns [] on missing key, null value, or parse error.
 */
function getFromLS(key) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null || raw === undefined) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.warn('[project-data] Corrupted LS key:', key, e);
        return [];
    }
}

/**
 * Save data as JSON to localStorage.
 */
function saveToLS(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('[project-data] Failed to save LS key:', key, e);
    }
}

/**
 * Generate a unique ID with a given prefix.
 * Example: generateId('proj') → 'proj_1692345678901_ab3f2'
 */
function generateId(prefix) {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// ─────────────────────────────────────────────────────────────
// 3. Mock Data Seeder
// ─────────────────────────────────────────────────────────────

function seedMockData() {
    // --- Departments ---
    if (getFromLS(LS_KEYS.MOCK_DEPARTMENTS).length === 0) {
        const departments = [
            { id: 'dept_001', name: 'Phòng Phát triển' },
            { id: 'dept_002', name: 'Phòng Kiểm thử' },
            { id: 'dept_003', name: 'Phòng Thiết kế' },
            { id: 'dept_004', name: 'Phòng BA' }
        ];
        saveToLS(LS_KEYS.MOCK_DEPARTMENTS, departments);
    }

    // --- Users ---
    if (getFromLS(LS_KEYS.MOCK_USERS).length === 0) {
        const users = [
            { id: 'user_001', fullName: 'Nguyễn Văn An', email: 'an.nguyen@etrms.vn', role: 'PM', departmentId: 'dept_001' },
            { id: 'user_002', fullName: 'Trần Thị Bình', email: 'binh.tran@etrms.vn', role: 'Head', departmentId: 'dept_001' },
            { id: 'user_003', fullName: 'Lê Minh Cường', email: 'cuong.le@etrms.vn', role: 'Dev', departmentId: 'dept_001' },
            { id: 'user_004', fullName: 'Phạm Thị Dung', email: 'dung.pham@etrms.vn', role: 'Dev', departmentId: 'dept_001' },
            { id: 'user_005', fullName: 'Hoàng Văn Em', email: 'em.hoang@etrms.vn', role: 'PM', departmentId: 'dept_002' },
            { id: 'user_006', fullName: 'Vũ Thị Phương', email: 'phuong.vu@etrms.vn', role: 'Head', departmentId: 'dept_002' },
            { id: 'user_007', fullName: 'Đặng Văn Giang', email: 'giang.dang@etrms.vn', role: 'Tester', departmentId: 'dept_002' },
            { id: 'user_008', fullName: 'Bùi Thị Hoa', email: 'hoa.bui@etrms.vn', role: 'Tester', departmentId: 'dept_002' },
            { id: 'user_009', fullName: 'Trịnh Văn Ích', email: 'ich.trinh@etrms.vn', role: 'Dev', departmentId: 'dept_003' },
            { id: 'user_010', fullName: 'Lý Thị Kim', email: 'kim.ly@etrms.vn', role: 'Client', departmentId: 'dept_004' }
        ];
        saveToLS(LS_KEYS.MOCK_USERS, users);
    }

    // --- Projects ---
    if (getFromLS(LS_KEYS.PROJECTS).length === 0) {
        const now = new Date().toISOString();
        const projects = [
            {
                id: 'proj_001', projectCode: 'PRJ-2024-001', projectName: 'Hệ thống Quản lý Nhân sự v2',
                parentProjectId: null, clientName: 'Công ty ABC', pmUserId: 'user_001',
                weightage: 40, budget: 500000000, startDate: '2024-01-15', endDate: '2024-06-30',
                priority: 'P1', status: 'IN_PROGRESS', progress: 65, description: 'Nâng cấp hệ thống HRM lên phiên bản 2.0',
                createdAt: now, updatedAt: now
            },
            {
                id: 'proj_002', projectCode: 'PRJ-2024-001-A', projectName: 'Module Tuyển dụng',
                parentProjectId: 'proj_001', clientName: 'Công ty ABC', pmUserId: 'user_001',
                weightage: 20, budget: 150000000, startDate: '2024-01-15', endDate: '2024-03-31',
                priority: 'P2', status: 'COMPLETED', progress: 100, description: 'Module quản lý tuyển dụng',
                createdAt: now, updatedAt: now
            },
            {
                id: 'proj_003', projectCode: 'PRJ-2024-001-B', projectName: 'Module Chấm công',
                parentProjectId: 'proj_001', clientName: 'Công ty ABC', pmUserId: 'user_005',
                weightage: 20, budget: 150000000, startDate: '2024-04-01', endDate: '2024-06-30',
                priority: 'P2', status: 'IN_PROGRESS', progress: 40, description: 'Module chấm công và tính lương',
                createdAt: now, updatedAt: now
            },
            {
                id: 'proj_004', projectCode: 'PRJ-2024-002', projectName: 'Cổng thông tin Khách hàng',
                parentProjectId: null, clientName: 'Tập đoàn XYZ', pmUserId: 'user_005',
                weightage: 30, budget: 300000000, startDate: '2024-03-01', endDate: '2024-09-30',
                priority: 'P1', status: 'IN_PROGRESS', progress: 30, description: 'Cổng tương tác khách hàng trực tuyến',
                createdAt: now, updatedAt: now
            },
            {
                id: 'proj_005', projectCode: 'PRJ-2024-003', projectName: 'Ứng dụng Di động Nội bộ',
                parentProjectId: null, clientName: 'Nội bộ công ty', pmUserId: 'user_001',
                weightage: 30, budget: 200000000, startDate: '2024-06-01', endDate: '2024-12-31',
                priority: 'P3', status: 'NOT_STARTED', progress: 0, description: 'Ứng dụng mobile cho nhân viên',
                createdAt: now, updatedAt: now
            },
            {
                id: 'proj_006', projectCode: 'PRJ-2023-010', projectName: 'Hệ thống Báo cáo BI',
                parentProjectId: null, clientName: 'Tập đoàn MNO', pmUserId: 'user_005',
                weightage: 0, budget: 120000000, startDate: '2023-01-01', endDate: '2023-12-31',
                priority: 'P4', status: 'CANCELLED', progress: 20, description: 'Hệ thống BI đã bị hủy',
                createdAt: now, updatedAt: now
            }
        ];
        saveToLS(LS_KEYS.PROJECTS, projects);
    }

    // --- Project Members ---
    if (getFromLS(LS_KEYS.MEMBERS).length === 0) {
        const now = new Date().toISOString();
        const members = [
            { id: 'mem_001', projectId: 'proj_001', userId: 'user_001', fullName: 'Nguyễn Văn An', email: 'an.nguyen@etrms.vn', role: 'PM', allocatedCapacity: 80, joinedDate: '2024-01-15', createdAt: now },
            { id: 'mem_002', projectId: 'proj_001', userId: 'user_003', fullName: 'Lê Minh Cường', email: 'cuong.le@etrms.vn', role: 'Dev', allocatedCapacity: 100, joinedDate: '2024-01-15', createdAt: now },
            { id: 'mem_003', projectId: 'proj_001', userId: 'user_004', fullName: 'Phạm Thị Dung', email: 'dung.pham@etrms.vn', role: 'Dev', allocatedCapacity: 100, joinedDate: '2024-01-15', createdAt: now },
            { id: 'mem_004', projectId: 'proj_002', userId: 'user_007', fullName: 'Đặng Văn Giang', email: 'giang.dang@etrms.vn', role: 'Tester', allocatedCapacity: 60, joinedDate: '2024-01-15', createdAt: now },
            { id: 'mem_005', projectId: 'proj_004', userId: 'user_005', fullName: 'Hoàng Văn Em', email: 'em.hoang@etrms.vn', role: 'PM', allocatedCapacity: 80, joinedDate: '2024-03-01', createdAt: now },
            { id: 'mem_006', projectId: 'proj_004', userId: 'user_009', fullName: 'Trịnh Văn Ích', email: 'ich.trinh@etrms.vn', role: 'Dev', allocatedCapacity: 100, joinedDate: '2024-03-01', createdAt: now }
        ];
        saveToLS(LS_KEYS.MEMBERS, members);
    }

    // --- Resource Requests ---
    if (getFromLS(LS_KEYS.RESOURCE_REQUESTS).length === 0) {
        const now = new Date().toISOString();
        const requests = [
            {
                id: 'rr_001', requestCode: 'RR-001', projectId: 'proj_003',
                targetDepartmentId: 'dept_002', requiredRole: 'Tester', quantity: 2,
                capacityPercent: 80, startDate: '2024-04-01', endDate: '2024-06-30',
                note: 'Cần 2 tester cho module chấm công', status: 'PENDING',
                rejectionReason: '', assignedUserIds: [], createdAt: now, updatedAt: now
            },
            {
                id: 'rr_002', requestCode: 'RR-002', projectId: 'proj_004',
                targetDepartmentId: 'dept_001', requiredRole: 'Dev', quantity: 1,
                capacityPercent: 100, startDate: '2024-03-01', endDate: '2024-09-30',
                note: 'Cần 1 dev full-stack cho cổng khách hàng', status: 'APPROVED',
                rejectionReason: '', assignedUserIds: ['user_004'], createdAt: now, updatedAt: now
            },
            {
                id: 'rr_003', requestCode: 'RR-003', projectId: 'proj_005',
                targetDepartmentId: 'dept_003', requiredRole: 'Dev', quantity: 2,
                capacityPercent: 50, startDate: '2024-06-01', endDate: '2024-12-31',
                note: '', status: 'REJECTED',
                rejectionReason: 'Phòng Thiết kế hiện không có nhân sự Dev phù hợp.',
                assignedUserIds: [], createdAt: now, updatedAt: now
            },
            {
                id: 'rr_004', requestCode: 'RR-004', projectId: 'proj_001',
                targetDepartmentId: 'dept_002', requiredRole: 'Tester', quantity: 1,
                capacityPercent: 60, startDate: '2024-05-01', endDate: '2024-06-30',
                note: 'Cần thêm 1 tester giai đoạn UAT', status: 'PENDING',
                rejectionReason: '', assignedUserIds: [], createdAt: now, updatedAt: now
            }
        ];
        saveToLS(LS_KEYS.RESOURCE_REQUESTS, requests);
    }
}

// Run seeder immediately on script load
seedMockData();

// ─────────────────────────────────────────────────────────────
// 4. Project CRUD
// ─────────────────────────────────────────────────────────────

function getProjects() {
    return getFromLS(LS_KEYS.PROJECTS);
}

function getProjectById(id) {
    return getProjects().find(p => p.id === id);
}

/**
 * Create or update a project.
 * If project.id exists in LS → update (preserve createdAt, update updatedAt).
 * If project.id is absent or not found → create (generate id, set both timestamps).
 */
function saveProject(project) {
    const projects = getProjects();
    const now = new Date().toISOString();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx !== -1) {
        // Update
        projects[idx] = { ...projects[idx], ...project, updatedAt: now };
    } else {
        // Create
        const newProject = {
            ...project,
            id: project.id || generateId('proj'),
            createdAt: now,
            updatedAt: now
        };
        projects.push(newProject);
    }
    saveToLS(LS_KEYS.PROJECTS, projects);
}

/**
 * Delete a project by id.
 * Side effect: also removes all ProjectMembers whose projectId === id.
 */
function deleteProject(id) {
    const projects = getProjects().filter(p => p.id !== id);
    saveToLS(LS_KEYS.PROJECTS, projects);

    // Cascade delete members
    const members = getFromLS(LS_KEYS.MEMBERS).filter(m => m.projectId !== id);
    saveToLS(LS_KEYS.MEMBERS, members);
}

/**
 * Check if a projectCode is unique.
 * Pass excludeId to allow the current project's own code in edit mode.
 */
function isProjectCodeUnique(code, excludeId) {
    return !getProjects().some(p => p.projectCode === code && p.id !== excludeId);
}

// ─────────────────────────────────────────────────────────────
// 5. ProjectMember CRUD
// ─────────────────────────────────────────────────────────────

function getProjectMembers(filterObj) {
    let members = getFromLS(LS_KEYS.MEMBERS);
    if (filterObj && filterObj.projectId) {
        members = members.filter(m => m.projectId === filterObj.projectId);
    }
    return members;
}

function getMembersByProjectId(projectId) {
    return getProjectMembers({ projectId });
}

/**
 * Create or update a ProjectMember.
 * If member.id exists → update. Else → create with generated id and createdAt.
 */
function saveMember(member) {
    const members = getFromLS(LS_KEYS.MEMBERS);
    const now = new Date().toISOString();
    const idx = members.findIndex(m => m.id === member.id);
    if (idx !== -1) {
        members[idx] = { ...members[idx], ...member };
    } else {
        members.push({
            ...member,
            id: member.id || generateId('mem'),
            createdAt: now
        });
    }
    saveToLS(LS_KEYS.MEMBERS, members);
}

function deleteMember(id) {
    const members = getFromLS(LS_KEYS.MEMBERS).filter(m => m.id !== id);
    saveToLS(LS_KEYS.MEMBERS, members);
}

// ─────────────────────────────────────────────────────────────
// 6. ResourceRequest CRUD & Workflow
// ─────────────────────────────────────────────────────────────

function getResourceRequests() {
    return getFromLS(LS_KEYS.RESOURCE_REQUESTS);
}

/**
 * Create a new ResourceRequest.
 * Always creates (never updates — status transitions use approveRequest/rejectRequest).
 * Auto-generates requestCode as 'RR-XXX'.
 */
function saveResourceRequest(rr) {
    const requests = getResourceRequests();
    const now = new Date().toISOString();

    // Generate requestCode: find max numeric suffix, increment
    let maxNum = 0;
    requests.forEach(r => {
        const match = r.requestCode.match(/^RR-(\d+)$/);
        if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
    });
    const nextCode = 'RR-' + String(maxNum + 1).padStart(3, '0');

    const newRR = {
        ...rr,
        id: generateId('rr'),
        requestCode: nextCode,
        status: 'PENDING',
        rejectionReason: '',
        assignedUserIds: [],
        createdAt: now,
        updatedAt: now
    };
    requests.push(newRR);
    saveToLS(LS_KEYS.RESOURCE_REQUESTS, requests);
}

/**
 * Approve a ResourceRequest.
 * Validates:
 *   1. RR exists and is PENDING.
 *   2. assignedUserIds.length === rr.quantity.
 * Side effects:
 *   - Sets rr.status = 'APPROVED', rr.assignedUserIds = assignedUserIds
 *   - Creates one ProjectMember per userId in assignedUserIds
 * Returns { success: true } or { success: false, error: string }
 */
function approveRequest(id, assignedUserIds) {
    const requests = getResourceRequests();
    const idx = requests.findIndex(r => r.id === id);

    if (idx === -1) return { success: false, error: 'Không tìm thấy yêu cầu.' };
    const rr = requests[idx];

    if (rr.status !== 'PENDING') {
        return { success: false, error: 'Chỉ có thể duyệt yêu cầu đang ở trạng thái PENDING.' };
    }
    if (!Array.isArray(assignedUserIds) || assignedUserIds.length !== rr.quantity) {
        return { success: false, error: `Phải chọn đúng ${rr.quantity} nhân sự.` };
    }

    const now = new Date().toISOString();
    requests[idx] = { ...rr, status: 'APPROVED', assignedUserIds, updatedAt: now };
    saveToLS(LS_KEYS.RESOURCE_REQUESTS, requests);

    // Create one ProjectMember per assigned user
    const members = getFromLS(LS_KEYS.MEMBERS);
    assignedUserIds.forEach(userId => {
        const user = getUserById(userId);
        if (!user) return;
        members.push({
            id: generateId('mem'),
            projectId: rr.projectId,
            userId,
            fullName: user.fullName,
            email: user.email,
            role: rr.requiredRole,
            allocatedCapacity: rr.capacityPercent,
            joinedDate: rr.startDate,
            createdAt: now
        });
    });
    saveToLS(LS_KEYS.MEMBERS, members);

    return { success: true };
}

/**
 * Reject a ResourceRequest.
 * Validates:
 *   1. RR exists and is PENDING.
 *   2. reason is non-empty string.
 * Returns { success: true } or { success: false, error: string }
 */
function rejectRequest(id, reason) {
    const requests = getResourceRequests();
    const idx = requests.findIndex(r => r.id === id);

    if (idx === -1) return { success: false, error: 'Không tìm thấy yêu cầu.' };
    const rr = requests[idx];

    if (rr.status !== 'PENDING') {
        return { success: false, error: 'Chỉ có thể từ chối yêu cầu đang ở trạng thái PENDING.' };
    }
    if (!reason || reason.trim() === '') {
        return { success: false, error: 'Lý do từ chối không được để trống.' };
    }

    const now = new Date().toISOString();
    requests[idx] = { ...rr, status: 'REJECTED', rejectionReason: reason.trim(), updatedAt: now };
    saveToLS(LS_KEYS.RESOURCE_REQUESTS, requests);

    return { success: true };
}

// ─────────────────────────────────────────────────────────────
// 7. Reference Data Getters
// ─────────────────────────────────────────────────────────────

function getMockUsers() {
    return getFromLS(LS_KEYS.MOCK_USERS);
}

function getMockDepartments() {
    return getFromLS(LS_KEYS.MOCK_DEPARTMENTS);
}

function getUserById(id) {
    return getMockUsers().find(u => u.id === id);
}

function getDepartmentById(id) {
    return getMockDepartments().find(d => d.id === id);
}

function getUsersByDepartment(departmentId) {
    return getMockUsers().filter(u => u.departmentId === departmentId);
}

// ─────────────────────────────────────────────────────────────
// 8. Validation & Display Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Returns true if date range is valid (start ≤ end, or either is empty/null).
 */
function isValidDateRange(startDate, endDate) {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
}

/**
 * Format a YYYY-MM-DD date string to DD/MM/YYYY for display.
 * Returns '—' for empty/null input.
 */
function formatDate(dateString) {
    if (!dateString) return '—';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
}

/**
 * Map project status to CSS badge class.
 */
function getProjectStatusBadgeClass(status) {
    const map = {
        'NOT_STARTED': 'badge-not-started',
        'IN_PROGRESS': 'badge-in-progress',
        'COMPLETED': 'badge-completed',
        'ON_HOLD': 'badge-on-hold',
        'CANCELLED': 'badge-cancelled'
    };
    return map[status] || 'badge-default';
}

/**
 * Map project status to Vietnamese label.
 */
function getProjectStatusLabel(status) {
    const map = {
        'NOT_STARTED': 'Chưa bắt đầu',
        'IN_PROGRESS': 'Đang thực hiện',
        'COMPLETED': 'Hoàn thành',
        'ON_HOLD': 'Tạm dừng',
        'CANCELLED': 'Đã hủy'
    };
    return map[status] || status;
}

/**
 * Map RR status to CSS badge class.
 */
function getRRStatusBadgeClass(status) {
    const map = {
        'PENDING': 'badge-warning',
        'APPROVED': 'badge-success',
        'REJECTED': 'badge-error'
    };
    return map[status] || 'badge-default';
}

/**
 * Map RR status to Vietnamese label.
 */
function getRRStatusLabel(status) {
    const map = {
        'PENDING': 'Chờ duyệt',
        'APPROVED': 'Đã duyệt',
        'REJECTED': 'Từ chối'
    };
    return map[status] || status;
}

/**
 * Map priority to Vietnamese label.
 */
function getPriorityLabel(priority) {
    const map = { 'P1': 'Khẩn cấp', 'P2': 'Cao', 'P3': 'Trung bình', 'P4': 'Thấp' };
    return map[priority] || priority;
}
