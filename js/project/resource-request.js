/**
 * RESOURCE REQUEST JAVASCRIPT (js/project/resource-request.js)
 * Enterprise Resource Allocation & Head Approval Workflow
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'etrms-resource-requests';

    // 1. DATA ACCESS & INITIALIZATION
    function getResourceRequests() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            console.error('Lỗi đọc etrms-resource-requests:', e);
            return [];
        }
    }

    function saveResourceRequests(requests) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
        } catch (e) {
            console.error('Lỗi lưu etrms-resource-requests:', e);
        }
    }

    function getProjects() {
        try {
            return JSON.parse(localStorage.getItem('etrms-projects')) || [];
        } catch (e) { return []; }
    }

    function getDepartments() {
        try {
            return JSON.parse(localStorage.getItem('etrms_departments')) || [
                { id: 'DEPT_DEV', name: 'Phòng Phát triển' },
                { id: 'DEPT_QA', name: 'Phòng Kiểm thử' },
                { id: 'DEPT_HR', name: 'Phòng Nhân sự' }
            ];
        } catch (e) { return []; }
    }

    function getEmployees() {
        try {
            return JSON.parse(localStorage.getItem('etrms_employees')) || [];
        } catch (e) { return []; }
    }

    function initDefaultDataIfEmpty() {
        const requests = getResourceRequests();
        if (requests.length === 0) {
            const defaults = [
                {
                    id: 'rr_001',
                    requestCode: 'RR-001',
                    projectId: 'proj_001',
                    projectName: 'Hệ thống Quản lý Nhân sự v2',
                    targetDepartmentId: 'DEPT_DEV',
                    targetDepartmentName: 'Phòng Phát triển',
                    requiredRole: 'Backend Developer',
                    quantity: 1,
                    capacityRequested: 50,
                    startDate: '2026-09-01',
                    endDate: '2026-10-31',
                    status: 'PENDING',
                    note: 'Cần hỗ trợ xây dựng API Xác thực OAuth2 và phân quyền RBAC',
                    rejectionReason: '',
                    assignedUserIds: [],
                    createdAt: '2026-08-20T10:00:00Z'
                },
                {
                    id: 'rr_002',
                    requestCode: 'RR-002',
                    projectId: 'proj_002',
                    projectName: 'Module Tuyển dụng',
                    targetDepartmentId: 'DEPT_QA',
                    targetDepartmentName: 'Phòng Kiểm thử',
                    requiredRole: 'QA Tester',
                    quantity: 1,
                    capacityRequested: 30,
                    startDate: '2026-09-10',
                    endDate: '2026-11-15',
                    status: 'APPROVED',
                    note: 'Hỗ trợ kiểm thử luồng tuyển dụng',
                    rejectionReason: '',
                    assignedUserIds: ['EMP_002'],
                    createdAt: '2026-08-22T14:30:00Z'
                },
                {
                    id: 'rr_003',
                    requestCode: 'RR-003',
                    projectId: 'proj_003',
                    projectName: 'Module Chấm công',
                    targetDepartmentId: 'DEPT_DEV',
                    targetDepartmentName: 'Phòng Phát triển',
                    requiredRole: 'Frontend Developer',
                    quantity: 2,
                    capacityRequested: 80,
                    startDate: '2026-08-15',
                    endDate: '2026-09-30',
                    status: 'REJECTED',
                    note: 'Mượn 2 lập trình viên giao diện',
                    rejectionReason: 'Tổ Dev hiện tại đang quá tải >110% WSI, không thể điều động',
                    assignedUserIds: [],
                    createdAt: '2026-08-18T09:15:00Z'
                }
            ];
            saveResourceRequests(defaults);
        }
    }

    // 2. FILTER & STATE
    let currentFilterStatus = 'ALL';
    let searchQuery = '';

    // 3. RENDER TABLE
    function renderRequestsTable() {
        const tbody = document.getElementById('resource-request-tbody');
        if (!tbody) return;

        const requests = getResourceRequests();
        const filtered = requests.filter(r => {
            if (currentFilterStatus !== 'ALL' && r.status !== currentFilterStatus) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchProject = (r.projectName || '').toLowerCase().includes(q);
                const matchCode = (r.requestCode || '').toLowerCase().includes(q);
                const matchRole = (r.requiredRole || '').toLowerCase().includes(q);
                if (!matchProject && !matchCode && !matchRole) return false;
            }
            return true;
        });

        // Update stats
        const countPending = requests.filter(r => r.status === 'PENDING').length;
        const countApproved = requests.filter(r => r.status === 'APPROVED').length;
        const countRejected = requests.filter(r => r.status === 'REJECTED').length;

        const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setVal('stat-total-rr', requests.length);
        setVal('stat-pending-rr', countPending);
        setVal('stat-approved-rr', countApproved);
        setVal('stat-rejected-rr', countRejected);

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 32px; color: var(--text-muted, #8c8c8c);">
                        <i class="fa-solid fa-inbox" style="font-size: 28px; margin-bottom: 8px; opacity: 0.5; display: block;"></i>
                        Không tìm thấy yêu cầu nhân lực nào phù hợp.
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            
            let statusBadge = '';
            if (item.status === 'PENDING') {
                statusBadge = '<span class="badge badge-warning" style="background:#fff7e6; color:#d46b08; border:1px solid #ffd591; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:600;">Chờ duyệt</span>';
            } else if (item.status === 'APPROVED') {
                statusBadge = '<span class="badge badge-success" style="background:#f6ffed; color:#389e0d; border:1px solid #b7eb8f; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:600;">Đã duyệt</span>';
            } else {
                statusBadge = '<span class="badge badge-danger" style="background:#fff1f0; color:#cf1322; border:1px solid #ffa39e; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:600;">Từ chối</span>';
            }

            const startFormatted = formatDate(item.startDate);
            const endFormatted = formatDate(item.endDate);

            let actionBtns = '';
            if (item.status === 'PENDING') {
                actionBtns = `
                    <button class="btn btn-sm btn-primary" onclick="window.openApproveModal('${item.id}')" style="padding: 3px 10px; font-size: 11px; margin-right: 4px; background-color:#1890ff; color:#fff; border:none; border-radius:4px; cursor:pointer;" title="Chỉ định nhân sự & Duyệt">
                        <i class="fa-solid fa-check"></i> Duyệt
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.openRejectModal('${item.id}')" style="padding: 3px 10px; font-size: 11px; margin-right: 4px; background-color:#ff4d4f; color:#fff; border:none; border-radius:4px; cursor:pointer;" title="Từ chối yêu cầu">
                        <i class="fa-solid fa-xmark"></i> Từ chối
                    </button>
                `;
            }

            actionBtns += `
                <button class="btn btn-sm" onclick="window.viewRrDetails('${item.id}')" style="padding: 3px 10px; font-size: 11px; background:#f0f0f0; border:1px solid #d9d9d9; border-radius:4px; cursor:pointer;" title="Xem chi tiết">
                    <i class="fa-solid fa-eye"></i>
                </button>
            `;

            tr.innerHTML = `
                <td style="font-weight: 600; color: var(--primary-color, #1890ff);">${item.requestCode}</td>
                <td style="font-weight: 600; color: var(--text-main, #262626);">${escapeHtml(item.projectName)}</td>
                <td>${escapeHtml(item.targetDepartmentName)}</td>
                <td><span style="background: #e6f7ff; color: #096dd9; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;">${escapeHtml(item.requiredRole)}</span></td>
                <td style="text-align: center;"><strong>${item.quantity}</strong> người</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <div style="flex: 1; height: 6px; background: #e8e8e8; border-radius: 3px; overflow: hidden; width: 60px;">
                            <div style="height: 100%; width: ${item.capacityRequested}%; background: ${item.capacityRequested > 50 ? '#faad14' : '#1890ff'};"></div>
                        </div>
                        <span style="font-size: 11px; font-weight: 600;">${item.capacityRequested}%</span>
                    </div>
                </td>
                <td style="font-size: 12px; color: var(--text-muted, #8c8c8c);">${startFormatted} - ${endFormatted}</td>
                <td>${statusBadge}</td>
                <td style="text-align: right; white-space: nowrap;">${actionBtns}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 4. MODAL: CREATE RESOURCE REQUEST
    function initCreateModal() {
        const btnOpen = document.getElementById('btn-create-rr');
        const modal = document.getElementById('modal-create-rr');
        const btnClose = document.getElementById('btn-close-create-rr');
        const btnCancel = document.getElementById('btn-cancel-create-rr');
        const form = document.getElementById('form-create-rr');

        // Populate projects select
        const projectSelect = document.getElementById('rr-project-id');
        if (projectSelect) {
            const projects = getProjects();
            projectSelect.innerHTML = '<option value="">-- Chọn dự án cần nhân sự --</option>';
            projects.forEach(p => {
                projectSelect.innerHTML += `<option value="${p.id}" data-name="${escapeHtml(p.projectName)}">${escapeHtml(p.projectName)} (${p.projectCode || ''})</option>`;
            });
        }

        // Populate departments select
        const deptSelect = document.getElementById('rr-dept-id');
        if (deptSelect) {
            const depts = getDepartments();
            deptSelect.innerHTML = '<option value="">-- Chọn phòng ban điều phối --</option>';
            depts.forEach(d => {
                deptSelect.innerHTML += `<option value="${d.id}" data-name="${escapeHtml(d.name)}">${escapeHtml(d.name)}</option>`;
            });
        }

        if (btnOpen && modal) {
            btnOpen.addEventListener('click', () => {
                modal.style.display = 'flex';
                // Set default dates
                const now = new Date();
                const nextMonth = new Date();
                nextMonth.setMonth(nextMonth.getMonth() + 2);
                document.getElementById('rr-start-date').value = now.toISOString().split('T')[0];
                document.getElementById('rr-end-date').value = nextMonth.toISOString().split('T')[0];
            });
        }

        const close = () => { if (modal) modal.style.display = 'none'; };
        if (btnClose) btnClose.addEventListener('click', close);
        if (btnCancel) btnCancel.addEventListener('click', close);

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const requests = getResourceRequests();
                
                // Next RR-XXX code
                let maxNum = 0;
                requests.forEach(r => {
                    const match = (r.requestCode || '').match(/^RR-(\d+)$/);
                    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
                });
                const nextCode = 'RR-' + String(maxNum + 1).padStart(3, '0');

                const projOpt = projectSelect.options[projectSelect.selectedIndex];
                const deptOpt = deptSelect.options[deptSelect.selectedIndex];

                const newRequest = {
                    id: 'rr_' + Date.now(),
                    requestCode: nextCode,
                    projectId: projectSelect.value,
                    projectName: projOpt ? projOpt.getAttribute('data-name') : 'Dự án',
                    targetDepartmentId: deptSelect.value,
                    targetDepartmentName: deptOpt ? deptOpt.getAttribute('data-name') : 'Phòng ban',
                    requiredRole: document.getElementById('rr-required-role').value.trim(),
                    quantity: parseInt(document.getElementById('rr-quantity').value, 10) || 1,
                    capacityRequested: parseInt(document.getElementById('rr-capacity').value, 10) || 50,
                    startDate: document.getElementById('rr-start-date').value,
                    endDate: document.getElementById('rr-end-date').value,
                    status: 'PENDING',
                    note: document.getElementById('rr-note').value.trim(),
                    rejectionReason: '',
                    assignedUserIds: [],
                    createdAt: new Date().toISOString()
                };

                requests.unshift(newRequest);
                saveResourceRequests(requests);
                close();
                form.reset();
                renderRequestsTable();

                if (window.showToast) {
                    window.showToast(`Đã gửi yêu cầu ${newRequest.requestCode} thành công! Đang chờ Trưởng phòng duyệt.`, 'success');
                }
            });
        }
    }

    // 5. MODAL: APPROVE & ASSIGN EMPLOYEE
    let approvingRequestId = null;

    window.openApproveModal = function(id) {
        approvingRequestId = id;
        const requests = getResourceRequests();
        const req = requests.find(r => r.id === id);
        if (!req) return;

        const modal = document.getElementById('modal-approve-rr');
        if (!modal) return;

        document.getElementById('approve-rr-code').textContent = req.requestCode;
        document.getElementById('approve-rr-desc').textContent = `${req.projectName} mượn ${req.quantity} nhân sự (${req.requiredRole}) từ ${req.targetDepartmentName} - Tải ${req.capacityRequested}%`;

        // Load employees from target department
        const empContainer = document.getElementById('approve-emp-list-container');
        if (empContainer) {
            const employees = getEmployees();
            const deptEmps = employees.filter(e => e.deptId === req.targetDepartmentId || !e.deptId);

            if (deptEmps.length === 0) {
                empContainer.innerHTML = `<div style="color: var(--text-muted); padding: 12px; font-size: 13px;">Không tìm thấy nhân viên nào trong phòng ban này.</div>`;
            } else {
                let html = '';
                deptEmps.forEach(emp => {
                    const wsi = emp.wsiCapacity || 80;
                    const isOver = (wsi + req.capacityRequested) > 100;
                    html += `
                        <label style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 1px solid #e8e8e8; border-radius: 6px; cursor: pointer; margin-bottom: 8px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" name="assign-emp-cb" value="${emp.id}" style="cursor: pointer;">
                                <div>
                                    <div style="font-size: 13px; font-weight: 600; color: #262626;">${escapeHtml(emp.fullName)}</div>
                                    <div style="font-size: 11px; color: #8c8c8c;">${escapeHtml(emp.email)} · ${emp.deptRole || 'Member'}</div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <span style="font-size: 11px; font-weight: 600; color: ${isOver ? '#ff4d4f' : '#52c41a'};">
                                    WSI hiện tại: ${wsi}% ${isOver ? '⚠️ (Sau gán: ' + (wsi + req.capacityRequested) + '%)' : ''}
                                </span>
                            </div>
                        </label>
                    `;
                });
                empContainer.innerHTML = html;
            }
        }

        modal.style.display = 'flex';
    };

    function initApproveModal() {
        const modal = document.getElementById('modal-approve-rr');
        const btnClose = document.getElementById('btn-close-approve-rr');
        const btnCancel = document.getElementById('btn-cancel-approve-rr');
        const btnConfirm = document.getElementById('btn-confirm-approve-rr');

        const close = () => { if (modal) modal.style.display = 'none'; approvingRequestId = null; };
        if (btnClose) btnClose.addEventListener('click', close);
        if (btnCancel) btnCancel.addEventListener('click', close);

        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                if (!approvingRequestId) return;
                const requests = getResourceRequests();
                const req = requests.find(r => r.id === approvingRequestId);
                if (!req) return;

                const selectedEmpIds = Array.from(document.querySelectorAll('input[name="assign-emp-cb"]:checked')).map(cb => cb.value);
                if (selectedEmpIds.length === 0) {
                    alert('Vui lòng tích chọn ít nhất 1 nhân sự để chỉ định vào dự án!');
                    return;
                }

                req.status = 'APPROVED';
                req.assignedUserIds = selectedEmpIds;
                req.updatedAt = new Date().toISOString();

                // Tạo mới Project Member trong etrms-project-members
                try {
                    let members = JSON.parse(localStorage.getItem('etrms-project-members')) || [];
                    const employees = getEmployees();

                    selectedEmpIds.forEach(empId => {
                        const emp = employees.find(e => e.id === empId);
                        members.push({
                            id: 'pm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
                            projectId: req.projectId,
                            projectName: req.projectName,
                            userId: empId,
                            userName: emp ? emp.fullName : 'Thành viên',
                            userEmail: emp ? emp.email : '',
                            role: req.requiredRole,
                            allocatedCapacity: req.capacityRequested,
                            joinedDate: req.startDate || new Date().toISOString().split('T')[0]
                        });

                        // Cập nhật tăng WSI của nhân viên
                        if (emp) {
                            emp.wsiCapacity = (emp.wsiCapacity || 80) + req.capacityRequested;
                        }
                    });

                    localStorage.setItem('etrms-project-members', JSON.stringify(members));
                    localStorage.setItem('etrms_employees', JSON.stringify(employees));
                } catch(e) { console.error('Lỗi cập nhật project members:', e); }

                saveResourceRequests(requests);
                close();
                renderRequestsTable();

                if (window.showToast) {
                    window.showToast(`Đã duyệt đơn ${req.requestCode} và điều động nhân sự thành công!`, 'success');
                }
            });
        }
    }

    // 6. MODAL: REJECT REQUEST
    let rejectingRequestId = null;

    window.openRejectModal = function(id) {
        rejectingRequestId = id;
        const requests = getResourceRequests();
        const req = requests.find(r => r.id === id);
        if (!req) return;

        const modal = document.getElementById('modal-reject-rr');
        if (!modal) return;

        document.getElementById('reject-rr-code').textContent = req.requestCode;
        document.getElementById('reject-rr-reason').value = '';
        modal.style.display = 'flex';
    };

    function initRejectModal() {
        const modal = document.getElementById('modal-reject-rr');
        const btnClose = document.getElementById('btn-close-reject-rr');
        const btnCancel = document.getElementById('btn-cancel-reject-rr');
        const btnConfirm = document.getElementById('btn-confirm-reject-rr');

        const close = () => { if (modal) modal.style.display = 'none'; rejectingRequestId = null; };
        if (btnClose) btnClose.addEventListener('click', close);
        if (btnCancel) btnCancel.addEventListener('click', close);

        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                if (!rejectingRequestId) return;
                const reason = document.getElementById('reject-rr-reason').value.trim();
                if (!reason || reason.length < 10) {
                    alert('Vui lòng nhập lý do từ chối rõ ràng (tối thiểu 10 ký tự)!');
                    return;
                }

                const requests = getResourceRequests();
                const req = requests.find(r => r.id === rejectingRequestId);
                if (!req) return;

                req.status = 'REJECTED';
                req.rejectionReason = reason;
                req.updatedAt = new Date().toISOString();

                saveResourceRequests(requests);
                close();
                renderRequestsTable();

                if (window.showToast) {
                    window.showToast(`Đã từ chối đơn ${req.requestCode}.`, 'info');
                }
            });
        }
    }

    // 7. MODAL: VIEW DETAILS
    window.viewRrDetails = function(id) {
        const requests = getResourceRequests();
        const req = requests.find(r => r.id === id);
        if (!req) return;

        let details = `Mã đơn: ${req.requestCode}\nDự án: ${req.projectName}\nPhòng ban: ${req.targetDepartmentName}\nVai trò: ${req.requiredRole}\nSố lượng: ${req.quantity} người (Tải: ${req.capacityRequested}%)\nThời gian: ${req.startDate} đến ${req.endDate}\nTrạng thái: ${req.status}\nGhi chú: ${req.note || 'Không có'}`;
        if (req.rejectionReason) {
            details += `\nLý do từ chối: ${req.rejectionReason}`;
        }
        alert(details);
    };

    // 8. TOOLBAR SEARCH & FILTER LISTENERS
    function initToolbarFilters() {
        const searchInput = document.getElementById('rr-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim();
                renderRequestsTable();
            });
        }

        const filterBtns = document.querySelectorAll('.rr-filter-tab');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilterStatus = this.getAttribute('data-status') || 'ALL';
                renderRequestsTable();
            });
        });
    }

    // HELPERS
    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const parts = dateStr.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dateStr;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // BOOTSTRAP
    document.addEventListener('DOMContentLoaded', () => {
        initDefaultDataIfEmpty();
        renderRequestsTable();
        initCreateModal();
        initApproveModal();
        initRejectModal();
        initToolbarFilters();
    });

})();
