/**
 * project-list.js
 * Logic for the Project List page.
 * Depends on: project-data.js (loaded first).
 * Source of truth: MASTER IMPLEMENTATION PLAN — PART-02, Task 02-02 (REVISED v2)
 *
 * Key responsibilities:
 *  - Render tree table with expand/collapse
 *  - Search (debounced) + status filter + pagination
 *  - Create Project modal (E10)
 *  - Edit Project modal (pre-filled, E10)
 *  - Delete Project (cascade handled by project-data.js)
 *  - Auto-open Edit modal when redirected from detail page (#edit=<id>)
 */

// ─────────────────────────────────────────────────────────────
// 1. State
// ─────────────────────────────────────────────────────────────
let currentPage = 1;
const PAGE_SIZE = 10;
let searchTerm = '';
let statusFilter = '';
const expandedNodes = new Set();

// ─────────────────────────────────────────────────────────────
// 2. Initialisation
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initProjectList();
});

function initProjectList() {
    // Search input — debounced 300 ms
    const searchInput = document.getElementById('project-search');
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchTerm = searchInput.value.trim().toLowerCase();
            currentPage = 1;
            renderProjectTable();
        }, 300);
    });

    // Status filter
    const statusSelect = document.getElementById('project-status-filter');
    statusSelect.addEventListener('change', () => {
        statusFilter = statusSelect.value;
        currentPage = 1;
        renderProjectTable();
    });

    // Add project button
    document.getElementById('btn-add-project').addEventListener('click', () => {
        openProjectModal(null);
    });

    // Select-all checkbox
    document.getElementById('select-all-projects').addEventListener('change', (e) => {
        document.querySelectorAll('#project-table-body .row-check').forEach(cb => {
            cb.checked = e.target.checked;
        });
    });

    // Initial render
    renderProjectTable();

    // Handle #edit=<id> hash from project-detail redirect (PART-06 Task 06-02)
    checkAndHandleEditHash();
}

function checkAndHandleEditHash() {
    const hash = window.location.hash;
    const match = hash.match(/^#edit=(.+)$/);
    if (match) {
        const projectId = decodeURIComponent(match[1]);
        window.location.hash = '';
        // Delay to ensure modal infrastructure is loaded
        setTimeout(() => openProjectModal(projectId), 400);
    }
}

// ─────────────────────────────────────────────────────────────
// 3. Filtering & Tree Building
// ─────────────────────────────────────────────────────────────
function getFilteredProjects() {
    let projects = getProjects();
    if (statusFilter) {
        projects = projects.filter(p => p.status === statusFilter);
    }
    if (searchTerm) {
        projects = projects.filter(p =>
            p.projectCode.toLowerCase().includes(searchTerm) ||
            p.projectName.toLowerCase().includes(searchTerm)
        );
    }
    return projects;
}

/**
 * Build a flat, ordered list for tree-table rendering.
 * Returns: { project, level, hasChildren }[]
 * Roots always shown; children only shown if parent is in expandedNodes.
 *
 * When a filter is active, we skip tree logic and return flat list
 * to avoid hiding filtered children.
 */
function buildFlatTree(filteredProjects) {
    const isFiltering = searchTerm !== '' || statusFilter !== '';

    if (isFiltering) {
        // Flat list — no expand/collapse when filtering
        return filteredProjects.map(p => ({ project: p, level: 0, hasChildren: false }));
    }

    // Build an id→project map and children map from ALL projects (unfiltered)
    const all = getProjects();
    const byId = {};
    const childrenMap = {};
    all.forEach(p => {
        byId[p.id] = p;
        if (!childrenMap[p.id]) childrenMap[p.id] = [];
        const parentId = p.parentProjectId;
        if (parentId) {
            if (!childrenMap[parentId]) childrenMap[parentId] = [];
            childrenMap[parentId].push(p);
        }
    });

    const result = [];
    function walk(projectId, level) {
        const p = byId[projectId];
        if (!p) return;
        const children = childrenMap[projectId] || [];
        result.push({ project: p, level, hasChildren: children.length > 0 });
        if (expandedNodes.has(projectId)) {
            children.forEach(child => walk(child.id, level + 1));
        }
    }

    // Walk roots
    all.filter(p => !p.parentProjectId).forEach(p => walk(p.id, 0));

    return result;
}

// ─────────────────────────────────────────────────────────────
// 4. Rendering
// ─────────────────────────────────────────────────────────────
function renderProjectTable() {
    const flatList = buildFlatTree(getFilteredProjects());
    const total = flatList.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const pageItems = flatList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const tbody = document.getElementById('project-table-body');
    const emptyState = document.getElementById('project-empty-state');
    const pagination = document.getElementById('project-pagination');

    if (total === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = '';
        pagination.innerHTML = '';
        return;
    }
    emptyState.style.display = 'none';

    tbody.innerHTML = pageItems.map(({ project: p, level, hasChildren }) => {
        const pm = getUserById(p.pmUserId);
        const pmName = pm ? pm.fullName : '—';
        const statusClass = getProjectStatusBadgeClass(p.status);
        const statusLabel = getProjectStatusLabel(p.status);

        // Progress bar colour
        const prog = p.progress || 0;
        const fillClass = prog >= 100 ? 'fill-success' : prog >= 60 ? '' : prog >= 30 ? 'fill-warning' : 'fill-danger';

        // Tree indent & toggle
        const indentClass = `tree-indent-${Math.min(level, 3)}`;
        let toggleHtml;
        if (hasChildren) {
            const isExpanded = expandedNodes.has(p.id);
            toggleHtml = `<button class="tree-toggle" data-toggle-id="${p.id}" title="${isExpanded ? 'Thu lại' : 'Mở rộng'}">
                <i class="fa fa-chevron-${isExpanded ? 'down' : 'right'}" style="font-size:11px;"></i>
            </button>`;
        } else {
            toggleHtml = `<span class="tree-spacer"></span>`;
        }

        return `<tr data-project-id="${p.id}">
            <td><input type="checkbox" class="row-check"></td>
            <td>
                <div class="tree-cell ${indentClass}">
                    ${toggleHtml}
                    <span style="font-size:13px; color:var(--text-muted);">${escHtml(p.projectCode)}</span>
                </div>
            </td>
            <td><strong>${escHtml(p.projectName)}</strong></td>
            <td>${escHtml(pmName)}</td>
            <td style="text-align:right;">${p.weightage ?? 0}%</td>
            <td>
                <div class="progress-cell">
                    <div class="progress-bar-wrap">
                        <div class="progress-bar-fill ${fillClass}" style="width:${prog}%;"></div>
                    </div>
                    <span class="progress-label">${prog}%</span>
                </div>
            </td>
            <td><span class="badge ${statusClass}">${statusLabel}</span></td>
            <td>${formatDate(p.startDate)}</td>
            <td>${formatDate(p.endDate)}</td>
            <td style="text-align:center;">
                <div style="display:flex; gap:6px; justify-content:center;">
                    <button class="btn-icon" title="Xem chi tiết" data-action="view" data-id="${p.id}">
                        <i class="fa fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Chỉnh sửa" data-action="edit" data-id="${p.id}">
                        <i class="fa fa-pen"></i>
                    </button>
                    <button class="btn-icon" title="Xóa" style="color:var(--danger-color);" data-action="delete" data-id="${p.id}">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');

    // Bind action buttons and tree toggles via delegation
    tbody.addEventListener('click', handleTableClick, { once: true });
    // Re-bind after each render via delegated listener (see handleTableClick)

    renderPagination(totalPages, total);
}

// Use a single delegated listener attached to tbody
document.addEventListener('click', (e) => {
    // Tree toggle
    const toggleBtn = e.target.closest('[data-toggle-id]');
    if (toggleBtn) {
        const id = toggleBtn.dataset.toggleId;
        if (expandedNodes.has(id)) expandedNodes.delete(id);
        else expandedNodes.add(id);
        renderProjectTable();
        return;
    }

    // Action buttons
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    const action = actionBtn.dataset.action;
    const id = actionBtn.dataset.id;
    if (action === 'view') window.location.href = `/pages/project/project-detail.html?id=${encodeURIComponent(id)}`;
    if (action === 'edit') openProjectModal(id);
    if (action === 'delete') handleDelete(id);
});

function renderPagination(totalPages, total) {
    const el = document.getElementById('project-pagination');
    if (totalPages <= 1) { el.innerHTML = `<span class="pagination-info">Tổng: ${total} dự án</span>`; return; }

    let html = `<button class="pagination-btn" id="pg-prev" ${currentPage === 1 ? 'disabled' : ''}>&#8249;</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `<button class="pagination-btn" id="pg-next" ${currentPage === totalPages ? 'disabled' : ''}>&#8250;</button>`;
    html += `<span class="pagination-info">Trang ${currentPage}/${totalPages} · ${total} dự án</span>`;
    el.innerHTML = html;

    el.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', () => { currentPage = +btn.dataset.page; renderProjectTable(); });
    });
    const prev = document.getElementById('pg-prev');
    const next = document.getElementById('pg-next');
    if (prev) prev.addEventListener('click', () => { currentPage--; renderProjectTable(); });
    if (next) next.addEventListener('click', () => { currentPage++; renderProjectTable(); });
}

// Prevent duplicate delegation
function handleTableClick() { /* delegated via document */ }

// ─────────────────────────────────────────────────────────────
// 5. Create / Edit Project Modal (E10)
// ─────────────────────────────────────────────────────────────
function openProjectModal(projectId) {
    const isEdit = !!projectId;
    const project = isEdit ? getProjectById(projectId) : null;
    const title = isEdit ? 'Chỉnh sửa Dự án' : 'Tạo Dự án Mới';

    // Build project options (parent select) — exclude self in edit mode
    const projectOptions = getProjects()
        .filter(p => p.id !== projectId)
        .map(p => `<option value="${p.id}" ${(isEdit && project.parentProjectId === p.id) ? 'selected' : ''}>${escHtml(p.projectName)}</option>`)
        .join('');

    // Build PM options (users with role PM or Head)
    const pmOptions = getMockUsers()
        .filter(u => u.role === 'PM' || u.role === 'Head')
        .map(u => `<option value="${u.id}" ${(isEdit && project.pmUserId === u.id) ? 'selected' : ''}>${escHtml(u.fullName)}</option>`)
        .join('');

    const statusOptions = [
        ['NOT_STARTED', 'Chưa bắt đầu'],
        ['IN_PROGRESS', 'Đang thực hiện'],
        ['COMPLETED', 'Hoàn thành'],
        ['ON_HOLD', 'Tạm dừng'],
        ['CANCELLED', 'Đã hủy']
    ].map(([val, label]) =>
        `<option value="${val}" ${(isEdit && project.status === val) ? 'selected' : (!isEdit && val === 'NOT_STARTED') ? 'selected' : ''}>${label}</option>`
    ).join('');

    const priorityOptions = [['P1', 'Khẩn cấp'], ['P2', 'Cao'], ['P3', 'Trung bình'], ['P4', 'Thấp']]
        .map(([val, label]) =>
            `<option value="${val}" ${(isEdit ? project.priority : 'P3') === val ? 'selected' : ''}>${label}</option>`)
        .join('');

    const v = (field, fallback = '') => isEdit ? (project[field] ?? fallback) : fallback;

    const formHtml = `
<div class="modal-form-grid" id="project-form-inner">

    <div class="form-group">
        <label class="form-label">Mã dự án <span style="color:var(--danger-color);">*</span></label>
        <input id="fm-code" type="text" class="form-control" value="${escHtml(v('projectCode'))}" placeholder="VD: PRJ-2024-001" maxlength="50">
        <span class="field-error" id="err-code"></span>
    </div>

    <div class="form-group">
        <label class="form-label">Tên dự án <span style="color:var(--danger-color);">*</span></label>
        <input id="fm-name" type="text" class="form-control" value="${escHtml(v('projectName'))}" placeholder="Nhập tên dự án" maxlength="120">
        <span class="field-error" id="err-name"></span>
    </div>

    <div class="form-group">
        <label class="form-label">Dự án cha</label>
        <select id="fm-parent" class="form-control">
            <option value="">— Không có (Dự án gốc) —</option>
            ${projectOptions}
        </select>
    </div>

    <div class="form-group">
        <label class="form-label">PM Phụ trách</label>
        <select id="fm-pm" class="form-control">
            <option value="">— Chưa phân công —</option>
            ${pmOptions}
        </select>
    </div>

    <div class="form-group">
        <label class="form-label">Khách hàng</label>
        <input id="fm-client" type="text" class="form-control" value="${escHtml(v('clientName'))}" placeholder="Tên khách hàng">
    </div>

    <div class="form-group">
        <label class="form-label">Ngân sách (VNĐ)</label>
        <input id="fm-budget" type="number" class="form-control" value="${v('budget', 0)}" min="0" step="1000000" placeholder="0">
    </div>

    <div class="form-group">
        <label class="form-label">Trọng số (%)</label>
        <input id="fm-weightage" type="number" class="form-control" value="${v('weightage', 0)}" min="0" max="100" step="1" placeholder="0">
        <span class="field-error" id="err-weightage"></span>
    </div>

    <div class="form-group">
        <label class="form-label">Tiến độ (%)</label>
        <input id="fm-progress" type="number" class="form-control" value="${v('progress', 0)}" min="0" max="100" step="1" placeholder="0">
    </div>

    <div class="form-group">
        <label class="form-label">Ngày bắt đầu</label>
        <input id="fm-start" type="date" class="form-control" value="${v('startDate')}">
    </div>

    <div class="form-group">
        <label class="form-label">Ngày kết thúc</label>
        <input id="fm-end" type="date" class="form-control" value="${v('endDate')}">
        <span class="field-error" id="err-date"></span>
    </div>

    <div class="form-group">
        <label class="form-label">Ưu tiên</label>
        <select id="fm-priority" class="form-control">${priorityOptions}</select>
    </div>

    ${isEdit ? `<div class="form-group">
        <label class="form-label">Trạng thái</label>
        <select id="fm-status" class="form-control">${statusOptions}</select>
    </div>` : ''}

    <div class="form-group modal-form-full">
        <label class="form-label">Mô tả</label>
        <textarea id="fm-desc" class="form-control" rows="3" placeholder="Mô tả chi tiết về dự án...">${escHtml(v('description'))}</textarea>
    </div>

</div>`;

    openModal(title, formHtml, () => handleSaveProject(projectId));
}

// ─────────────────────────────────────────────────────────────
// 6. Save Project (validate + persist)
// ─────────────────────────────────────────────────────────────
function handleSaveProject(projectId) {
    // Guard: disable confirm button to prevent double-submit
    const btn = document.getElementById('modal-confirm-btn');
    if (btn) btn.disabled = true;

    const code = document.getElementById('fm-code').value.trim();
    const name = document.getElementById('fm-name').value.trim();
    const parentId = document.getElementById('fm-parent').value || null;
    const pmId = document.getElementById('fm-pm').value || null;
    const client = document.getElementById('fm-client').value.trim();
    const budget = parseFloat(document.getElementById('fm-budget').value) || 0;
    const weightage = parseInt(document.getElementById('fm-weightage').value, 10);
    const progress = parseInt(document.getElementById('fm-progress').value, 10);
    const startDate = document.getElementById('fm-start').value;
    const endDate = document.getElementById('fm-end').value;
    const priority = document.getElementById('fm-priority').value;
    const statusEl = document.getElementById('fm-status');
    const status = statusEl ? statusEl.value : 'NOT_STARTED';
    const desc = document.getElementById('fm-desc').value.trim();

    // --- Validation ---
    let hasError = false;

    function showErr(id, msg) {
        const el = document.getElementById(id);
        if (el) { el.textContent = msg; el.classList.add('visible'); }
        hasError = true;
    }
    function clearErr(id) {
        const el = document.getElementById(id);
        if (el) { el.textContent = ''; el.classList.remove('visible'); }
    }

    clearErr('err-code'); clearErr('err-name'); clearErr('err-weightage'); clearErr('err-date');

    if (!code) showErr('err-code', 'Mã dự án là bắt buộc.');
    else if (!isProjectCodeUnique(code, projectId))
        showErr('err-code', 'Mã dự án này đã tồn tại.');

    if (!name) showErr('err-name', 'Tên dự án là bắt buộc.');

    const w = isNaN(weightage) ? -1 : weightage;
    if (w < 0 || w > 100) showErr('err-weightage', 'Trọng số phải từ 0 đến 100.');

    if (!isValidDateRange(startDate, endDate))
        showErr('err-date', 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');

    if (hasError) {
        if (btn) btn.disabled = false;
        return;
    }

    // --- Persist ---
    const project = {
        id: projectId || undefined,
        projectCode: code,
        projectName: name,
        parentProjectId: parentId,
        clientName: client,
        pmUserId: pmId,
        weightage: w,
        budget,
        progress: isNaN(progress) ? 0 : Math.min(100, Math.max(0, progress)),
        startDate,
        endDate,
        priority,
        status,
        description: desc
    };

    saveProject(project);
    closeModal();
    currentPage = 1;
    renderProjectTable();
}

// ─────────────────────────────────────────────────────────────
// 7. Delete Project
// ─────────────────────────────────────────────────────────────
function handleDelete(projectId) {
    const project = getProjectById(projectId);
    if (!project) return;

    const memberCount = getMembersByProjectId(projectId).length;
    const cascadeNote = memberCount > 0
        ? `<br><span style="color:var(--danger-color);font-size:12px;">⚠ Sẽ xóa ${memberCount} thành viên liên quan.</span>`
        : '';

    openModal(
        'Xác nhận xóa dự án',
        `<p>Bạn có chắc muốn xóa dự án <strong>${escHtml(project.projectName)}</strong>?${cascadeNote}</p>`,
        () => {
            deleteProject(projectId);
            closeModal();
            renderProjectTable();
        }
    );
}

// ─────────────────────────────────────────────────────────────
// 8. Utility
// ─────────────────────────────────────────────────────────────
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
