/**
 * SUBTASK MANAGEMENT JAVASCRIPT (js/subtask.js)
 * Enterprise Work Management - Subtask Tracker
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'etrms_subtasks';

    function getSubtasks() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch(e) { return []; }
    }

    function saveSubtasks(subtasks) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(subtasks));
        } catch(e) {}
    }

    function getParentTasks() {
        try {
            return JSON.parse(localStorage.getItem('etrms_tasks')) || [];
        } catch(e) { return []; }
    }

    function initDefaultSubtasksIfEmpty() {
        const subtasks = getSubtasks();
        if (subtasks.length === 0) {
            const defaults = [
                {
                    id: 1,
                    code: 'SUB-101-1',
                    parentTaskId: 101,
                    parentTaskCode: 'TASK-101',
                    parentTaskTitle: 'Dev Backend API Xác thực người dùng',
                    title: 'Thiết kế Data Model User, Role, Permission',
                    assignee: 'Trần Văn Minh',
                    status: 'DONE',
                    estHours: 4,
                    dueDate: '2026-08-22'
                },
                {
                    id: 2,
                    code: 'SUB-101-2',
                    parentTaskId: 101,
                    parentTaskCode: 'TASK-101',
                    parentTaskTitle: 'Dev Backend API Xác thực người dùng',
                    title: 'Viết middleware verify JWT token & Refresh token',
                    assignee: 'Trần Văn Minh',
                    status: 'IN_PROGRESS',
                    estHours: 4,
                    dueDate: '2026-08-24'
                },
                {
                    id: 3,
                    code: 'SUB-102-1',
                    parentTaskId: 102,
                    parentTaskCode: 'TASK-102',
                    parentTaskTitle: 'Thiết kế Mockup UI Dashboard & Workspace',
                    title: 'Thiết kế Component Sidebar & Header',
                    assignee: 'Lê Gia Bách',
                    status: 'DONE',
                    estHours: 6,
                    dueDate: '2026-08-03'
                },
                {
                    id: 4,
                    code: 'SUB-103-1',
                    parentTaskId: 103,
                    parentTaskCode: 'TASK-103',
                    parentTaskTitle: 'Khảo sát quy trình DoR / DoD các phòng ban vận hành',
                    title: 'Lấy ý kiến tiêu chí nghiệm thu của Tổ Dev',
                    assignee: 'Nguyễn Tuấn Bùi',
                    status: 'TO_DO',
                    estHours: 4,
                    dueDate: '2026-09-12'
                },
                {
                    id: 5,
                    code: 'SUB-105-1',
                    parentTaskId: 105,
                    parentTaskCode: 'TASK-105',
                    parentTaskTitle: 'Kiểm thử Release Module Quản lý Nhân sự & WSI',
                    title: 'Viết Test Cases kiểm thử chức năng mượn nhân sự',
                    assignee: 'Hoàng Nam',
                    status: 'DONE',
                    estHours: 4,
                    dueDate: '2026-09-08'
                }
            ];
            saveSubtasks(defaults);
        }
    }

    let currentFilters = {
        search: '',
        parentTask: 'ALL',
        status: 'ALL',
        assignee: 'ALL'
    };

    function renderSubtasks() {
        const tbody = document.getElementById('subtask-table-body');
        if (!tbody) return;

        const allSubtasks = getSubtasks();
        const filtered = allSubtasks.filter(sub => {
            if (currentFilters.search) {
                const q = currentFilters.search.toLowerCase();
                const matchTitle = (sub.title || '').toLowerCase().includes(q);
                const matchCode = (sub.code || '').toLowerCase().includes(q);
                if (!matchTitle && !matchCode) return false;
            }
            if (currentFilters.parentTask !== 'ALL' && String(sub.parentTaskId) !== currentFilters.parentTask) {
                return false;
            }
            if (currentFilters.status !== 'ALL' && sub.status !== currentFilters.status) {
                return false;
            }
            if (currentFilters.assignee !== 'ALL' && sub.assignee !== currentFilters.assignee) {
                return false;
            }
            return true;
        });

        // Update KPI counters
        const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setVal('stat-total-sub', allSubtasks.length);
        setVal('stat-doing-sub', allSubtasks.filter(s => s.status === 'IN_PROGRESS').length);
        setVal('stat-done-sub', allSubtasks.filter(s => s.status === 'DONE').length);
        setVal('stat-todo-sub', allSubtasks.filter(s => s.status === 'TO_DO').length);

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted, #8c8c8c);">
                        <i class="fa-solid fa-list-check" style="font-size: 28px; margin-bottom: 8px; opacity: 0.5; display: block;"></i>
                        Không có công việc phụ nào phù hợp với bộ lọc.
                    </td>
                </tr>
            `;
            return;
        }

        const todayStr = new Date().toISOString().split('T')[0];

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            const isOverdue = item.dueDate && item.dueDate < todayStr && item.status !== 'DONE';

            let statusBadge = '';
            if (item.status === 'DONE') {
                statusBadge = '<span style="background:#f6ffed; color:#389e0d; border:1px solid #b7eb8f; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600;">Xong</span>';
            } else if (item.status === 'IN_PROGRESS') {
                statusBadge = '<span style="background:#e6f7ff; color:#096dd9; border:1px solid #91d5ff; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600;">Đang làm</span>';
            } else {
                statusBadge = '<span style="background:#f5f5f5; color:#595959; border:1px solid #d9d9d9; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600;">Cần làm</span>';
            }

            tr.innerHTML = `
                <td style="width: 40px; text-align: center;"><input type="checkbox" style="cursor: pointer;"></td>
                <td style="font-weight: 600; color: var(--primary-color, #1890ff);">${item.code}</td>
                <td style="font-weight: 600; color: var(--text-main, #262626);">${escapeHtml(item.title)}</td>
                <td>
                    <span style="background: #f0f5ff; color: #2f54eb; border: 1px solid #d6e4ff; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 500;">
                        ${item.parentTaskCode || 'TASK'}: ${escapeHtml(item.parentTaskTitle || '')}
                    </span>
                </td>
                <td><span style="font-size: 12px; font-weight: 500;">${escapeHtml(item.assignee || 'Chưa gán')}</span></td>
                <td>${statusBadge}</td>
                <td style="font-size: 12px; color: ${isOverdue ? '#ff4d4f; font-weight:600;' : '#8c8c8c;'}">${formatDate(item.dueDate)}</td>
                <td style="text-align: right; white-space: nowrap;">
                    <button class="btn btn-sm" onclick="window.toggleSubtaskStatus(${item.id})" style="padding: 3px 8px; font-size: 11px; margin-right: 4px; background: #fff; border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer;" title="Đổi trạng thái">
                        <i class="fa-solid fa-rotate"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.deleteSubtask(${item.id})" style="padding: 3px 8px; font-size: 11px; background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; border-radius: 4px; cursor: pointer;" title="Xóa">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        populateParentSelects();
    }

    function populateParentSelects() {
        const parentTasks = getParentTasks();
        const filterSelect = document.getElementById('subtask-filter-parent');
        const modalSelect = document.getElementById('new-sub-parent');

        if (filterSelect && filterSelect.children.length <= 1) {
            parentTasks.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.code || 'TASK-' + p.id}: ${p.title}`;
                filterSelect.appendChild(opt);
            });
        }

        if (modalSelect && modalSelect.children.length <= 1) {
            modalSelect.innerHTML = '<option value="">-- Chọn Task cha --</option>';
            parentTasks.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.code || 'TASK-' + p.id}: ${p.title}`;
                modalSelect.appendChild(opt);
            });
        }
    }

    window.toggleSubtaskStatus = function(id) {
        const subtasks = getSubtasks();
        const sub = subtasks.find(s => s.id === id);
        if (!sub) return;

        if (sub.status === 'TO_DO') sub.status = 'IN_PROGRESS';
        else if (sub.status === 'IN_PROGRESS') sub.status = 'DONE';
        else sub.status = 'TO_DO';

        saveSubtasks(subtasks);
        renderSubtasks();
        if (window.showToast) window.showToast(`Đã chuyển trạng thái [${sub.code}] sang ${sub.status}`, 'success');
    };

    window.deleteSubtask = function(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa công việc phụ này?')) return;
        let subtasks = getSubtasks();
        subtasks = subtasks.filter(s => s.id !== id);
        saveSubtasks(subtasks);
        renderSubtasks();
        if (window.showToast) window.showToast('Đã xóa công việc phụ thành công!', 'info');
    };

    function initEventHandlers() {
        // Search
        const searchInput = document.getElementById('subtask-search');
        if (searchInput) {
            let debounce;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                    currentFilters.search = e.target.value.trim();
                    renderSubtasks();
                }, 200);
            });
        }

        // Parent filter
        const parentFilter = document.getElementById('subtask-filter-parent');
        if (parentFilter) {
            parentFilter.addEventListener('change', (e) => {
                currentFilters.parentTask = e.target.value;
                renderSubtasks();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('subtask-filter-status');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                currentFilters.status = e.target.value;
                renderSubtasks();
            });
        }

        // Modal Create Subtask
        const btnAdd = document.getElementById('btn-add-subtask');
        const modal = document.getElementById('modal-create-subtask');
        const btnClose = document.getElementById('btn-close-subtask-modal');
        const btnCancel = document.getElementById('btn-cancel-subtask-modal');
        const form = document.getElementById('form-create-subtask');

        if (btnAdd && modal) {
            btnAdd.addEventListener('click', () => {
                modal.style.display = 'flex';
                const due = document.getElementById('new-sub-due');
                if (due) due.value = new Date().toISOString().split('T')[0];
            });
        }

        const close = () => { if (modal) modal.style.display = 'none'; };
        if (btnClose) btnClose.addEventListener('click', close);
        if (btnCancel) btnCancel.addEventListener('click', close);

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const parentTasks = getParentTasks();
                const subtasks = getSubtasks();

                const parentId = parseInt(document.getElementById('new-sub-parent').value, 10);
                const parent = parentTasks.find(p => p.id === parentId);

                const nextId = subtasks.length > 0 ? Math.max(...subtasks.map(s => s.id || 0)) + 1 : 1;
                const pCode = parent ? (parent.code || 'TASK-' + parent.id) : 'TASK';

                const newSub = {
                    id: nextId,
                    code: `SUB-${parent ? parent.id : '0'}-${nextId}`,
                    parentTaskId: parentId,
                    parentTaskCode: pCode,
                    parentTaskTitle: parent ? parent.title : 'Công việc',
                    title: document.getElementById('new-sub-title').value.trim(),
                    assignee: document.getElementById('new-sub-assignee').value.trim() || 'Trần Văn Minh',
                    status: document.getElementById('new-sub-status').value || 'TO_DO',
                    estHours: parseInt(document.getElementById('new-sub-hours').value, 10) || 4,
                    dueDate: document.getElementById('new-sub-due').value || ''
                };

                subtasks.unshift(newSub);
                saveSubtasks(subtasks);
                close();
                form.reset();
                renderSubtasks();

                if (window.showToast) window.showToast(`Đã tạo thành công [${newSub.code}]`, 'success');
            });
        }
    }

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

    document.addEventListener('DOMContentLoaded', () => {
        initDefaultSubtasksIfEmpty();
        renderSubtasks();
        initEventHandlers();
    });

})();
