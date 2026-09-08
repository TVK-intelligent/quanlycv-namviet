/**
 * RBAC PERMISSION MATRIX JAVASCRIPT (js/permission.js)
 * Enterprise Role-Based Access Control
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'etrms_rbac_permissions';

    const DEFAULT_MODULES = [
        { id: 'mod_dashboard', name: 'Dashboard & Giám sát Hệ thống' },
        { id: 'mod_project', name: 'Quản lý Dự án & Tiến độ' },
        { id: 'mod_resource', name: 'Yêu cầu Mượn Nhân lực (Resource Request)' },
        { id: 'mod_task', name: 'Quản lý Công việc & Bảng Kanban' },
        { id: 'mod_subtask', name: 'Công việc phụ (Subtask)' },
        { id: 'mod_employee', name: 'Quản lý Nhân sự & Phòng ban' },
        { id: 'mod_checklist', name: 'Quy trình Tiêu chuẩn (DoR / DoD Checklist)' },
        { id: 'mod_timesheet', name: 'Chấm công & Khai báo giờ (Timesheet)' },
        { id: 'mod_review', name: 'Nghiệm thu & Đánh giá Công việc (Review)' },
        { id: 'mod_extension', name: 'Gia hạn Công việc (Extension Request)' },
        { id: 'mod_report', name: 'Báo cáo Thống kê & KPI Engine' }
    ];

    const DEFAULT_ROLES = [
        { key: 'ADMIN', name: 'Quản trị viên (Admin)' },
        { key: 'HEAD', name: 'Trưởng phòng (Head of Dept)' },
        { key: 'PM', name: 'Quản lý Dự án (Project Manager)' },
        { key: 'DEV', name: 'Lập trình viên (Developer)' },
        { key: 'TESTER', name: 'Kiểm thử viên (QA Tester)' },
        { key: 'CLIENT', name: 'Khách hàng (Client/Stakeholder)' }
    ];

    function getAllPermissions() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch(e) { return {}; }
    }

    function saveAllPermissions(perms) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(perms));
        } catch(e) {}
    }

    function initDefaultPermissionsIfEmpty() {
        const perms = getAllPermissions();
        if (Object.keys(perms).length === 0) {
            const initial = {};

            DEFAULT_ROLES.forEach(r => {
                initial[r.key] = {};
                DEFAULT_MODULES.forEach(m => {
                    if (r.key === 'ADMIN') {
                        initial[r.key][m.id] = { read: true, create: true, update: true, delete: true, approve: true };
                    } else if (r.key === 'HEAD') {
                        initial[r.key][m.id] = {
                            read: true,
                            create: true,
                            update: true,
                            delete: m.id === 'mod_employee' || m.id === 'mod_checklist',
                            approve: true
                        };
                    } else if (r.key === 'PM') {
                        initial[r.key][m.id] = {
                            read: true,
                            create: m.id !== 'mod_employee',
                            update: m.id !== 'mod_employee',
                            delete: m.id === 'mod_task' || m.id === 'mod_subtask',
                            approve: m.id === 'mod_review' || m.id === 'mod_extension' || m.id === 'mod_timesheet'
                        };
                    } else if (r.key === 'DEV') {
                        initial[r.key][m.id] = {
                            read: m.id !== 'mod_employee',
                            create: m.id === 'mod_task' || m.id === 'mod_subtask' || m.id === 'mod_timesheet' || m.id === 'mod_extension',
                            update: m.id === 'mod_task' || m.id === 'mod_subtask' || m.id === 'mod_timesheet',
                            delete: false,
                            approve: false
                        };
                    } else if (r.key === 'TESTER') {
                        initial[r.key][m.id] = {
                            read: m.id !== 'mod_employee',
                            create: m.id === 'mod_task' || m.id === 'mod_timesheet',
                            update: m.id === 'mod_task' || m.id === 'mod_timesheet',
                            delete: false,
                            approve: m.id === 'mod_review' // QA Pass / Reject
                        };
                    } else if (r.key === 'CLIENT') {
                        initial[r.key][m.id] = {
                            read: m.id === 'mod_project' || m.id === 'mod_report' || m.id === 'mod_dashboard',
                            create: false,
                            update: false,
                            delete: false,
                            approve: m.id === 'mod_review'
                        };
                    }
                });
            });

            saveAllPermissions(initial);
        }
    }

    let currentRole = 'HEAD';

    function renderMatrix() {
        const tbody = document.getElementById('permission-matrix-body');
        if (!tbody) return;

        const allPerms = getAllPermissions();
        const rolePerms = allPerms[currentRole] || {};

        tbody.innerHTML = '';

        DEFAULT_MODULES.forEach((mod, idx) => {
            const tr = document.createElement('tr');
            const p = rolePerms[mod.id] || { read: false, create: false, update: false, delete: false, approve: false };

            tr.innerHTML = `
                <td style="font-weight: 600; color: #262626; padding: 12px 16px;">
                    <i class="fa-solid fa-layer-group" style="color: #1890ff; margin-right: 8px; font-size: 12px;"></i>
                    ${mod.name}
                </td>
                <td style="text-align: center; padding: 12px 16px;">
                    <input type="checkbox" class="perm-cb" data-mod="${mod.id}" data-action="read" ${p.read ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                </td>
                <td style="text-align: center; padding: 12px 16px;">
                    <input type="checkbox" class="perm-cb" data-mod="${mod.id}" data-action="create" ${p.create ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                </td>
                <td style="text-align: center; padding: 12px 16px;">
                    <input type="checkbox" class="perm-cb" data-mod="${mod.id}" data-action="update" ${p.update ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                </td>
                <td style="text-align: center; padding: 12px 16px;">
                    <input type="checkbox" class="perm-cb" data-mod="${mod.id}" data-action="delete" ${p.delete ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                </td>
                <td style="text-align: center; padding: 12px 16px;">
                    <input type="checkbox" class="perm-cb" data-mod="${mod.id}" data-action="approve" ${p.approve ? 'checked' : ''} style="transform: scale(1.2); cursor: pointer;">
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update active role badge
        const badge = document.getElementById('current-role-badge');
        if (badge) {
            const rObj = DEFAULT_ROLES.find(r => r.key === currentRole);
            badge.textContent = rObj ? rObj.name : currentRole;
        }
    }

    function saveCurrentMatrix() {
        const allPerms = getAllPermissions();
        if (!allPerms[currentRole]) allPerms[currentRole] = {};

        const checkboxes = document.querySelectorAll('.perm-cb');
        checkboxes.forEach(cb => {
            const modId = cb.getAttribute('data-mod');
            const action = cb.getAttribute('data-action');
            if (!allPerms[currentRole][modId]) allPerms[currentRole][modId] = {};
            allPerms[currentRole][modId][action] = cb.checked;
        });

        saveAllPermissions(allPerms);
        if (window.showToast) {
            window.showToast(`Đã lưu thành công cấu hình phân quyền cho vai trò [${currentRole}]!`, 'success');
        } else {
            alert(`Đã lưu thành công cấu hình phân quyền cho vai trò [${currentRole}]!`);
        }
    }

    function initEventHandlers() {
        const roleSelect = document.getElementById('select-rbac-role');
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                currentRole = e.target.value;
                renderMatrix();
            });
        }

        const btnSave = document.getElementById('btn-save-permission');
        if (btnSave) {
            btnSave.addEventListener('click', saveCurrentMatrix);
        }

        // Toggle all checkboxes in a column
        const checkAllBtns = document.querySelectorAll('.btn-check-all');
        checkAllBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                const cbs = document.querySelectorAll(`.perm-cb[data-action="${action}"]`);
                const allChecked = Array.from(cbs).every(cb => cb.checked);
                cbs.forEach(cb => cb.checked = !allChecked);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initDefaultPermissionsIfEmpty();
        renderMatrix();
        initEventHandlers();
    });

})();
