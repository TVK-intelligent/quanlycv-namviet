/**
 * project-detail.js
 * Logic for the Project Detail page.
 * Depends on: project-data.js (loaded first).
 * Source of truth: MASTER IMPLEMENTATION PLAN — PART-03, Tasks 03-01 & 03-02
 *
 * Reads:  ?id=<projectId> from URL params
 * Shows:  read-only detail view of all project fields
 * Actions: Sửa → project-list.html#edit=<id>
 *          Xóa → confirm modal → delete → redirect to list
 *          Xem thành viên → project-member.html?projectId=<id>
 *          Quay lại → project-list.html
 */

document.addEventListener('DOMContentLoaded', () => {
    initProjectDetail();
});

function initProjectDetail() {
    // Read id from URL
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    if (!projectId) {
        showNotFound();
        return;
    }

    const project = getProjectById(projectId);
    if (!project) {
        showNotFound();
        return;
    }

    renderDetail(project);
    bindActions(project);
}

// ─────────────────────────────────────────────────────────────
// Render
// ─────────────────────────────────────────────────────────────
function renderDetail(project) {
    // Show content, hide not-found
    document.getElementById('project-not-found').style.display = 'none';
    document.getElementById('project-detail-content').style.display = '';

    // Resolve references
    const pm = getUserById(project.pmUserId);
    const pmName = pm ? pm.fullName : '—';
    const parentProject = getProjectById(project.parentProjectId);
    const parentName = parentProject ? parentProject.projectName : '—';

    // Header
    document.getElementById('detail-project-name').textContent = project.projectName || '—';
    document.getElementById('breadcrumb-project-name').textContent = project.projectName || 'Chi tiết Dự án';
    document.getElementById('detail-project-code').textContent = project.projectCode || '';

    document.getElementById('detail-status').innerHTML =
        `<span class="badge ${getProjectStatusBadgeClass(project.status)}">${getProjectStatusLabel(project.status)}</span>`;

    document.getElementById('detail-priority').innerHTML =
        `<span class="badge badge-priority" style="${priorityStyle(project.priority)}">
            ${getPriorityLabel(project.priority)}
         </span>`;

    // Info grid
    document.getElementById('detail-info-container').innerHTML = `
        ${infoItem('Mã dự án', escHtml(project.projectCode))}
        ${infoItem('PM Phụ trách', escHtml(pmName))}
        ${infoItem('Dự án cha', escHtml(parentName))}
        ${infoItem('Khách hàng', escHtml(project.clientName) || '—')}
        ${infoItem('Ngày bắt đầu', formatDate(project.startDate))}
        ${infoItem('Ngày kết thúc', formatDate(project.endDate))}
        ${infoItem('Ưu tiên', getPriorityLabel(project.priority))}
        ${infoItem('Trạng thái', getProjectStatusLabel(project.status))}
    `;

    // Progress & budget
    const prog = project.progress ?? 0;
    const progBarHtml = `
        <div class="progress-cell" style="margin-top:4px;">
            <div class="progress-bar-wrap" style="height:8px;">
                <div class="progress-bar-fill ${progFillClass(prog)}" style="width:${prog}%;"></div>
            </div>
            <span class="progress-label">${prog}%</span>
        </div>`;

    document.getElementById('detail-progress-container').innerHTML = `
        ${infoItem('Tiến độ (%)', progBarHtml, true)}
        ${infoItem('Trọng số (%)', (project.weightage ?? 0) + '%')}
        ${infoItem('Ngân sách (VNĐ)', formatBudget(project.budget))}
        ${infoItem('Ngày tạo', formatDate((project.createdAt || '').substring(0, 10)))}
    `;

    // Description
    if (project.description && project.description.trim()) {
        document.getElementById('detail-desc-section').style.display = '';
        document.getElementById('detail-description').textContent = project.description;
    }

    // Update page title
    document.title = `${project.projectName} | ETRMS`;
}

// ─────────────────────────────────────────────────────────────
// Button Actions
// ─────────────────────────────────────────────────────────────
function bindActions(project) {
    const id = project.id;

    // Quay lại
    document.getElementById('btn-back').addEventListener('click', () => {
        window.location.href = '/pages/project/project-list.html';
    });

    // Xem thành viên — navigates to member page pre-filtered by this project
    document.getElementById('btn-view-members').addEventListener('click', () => {
        window.location.href = `/pages/project/project-member.html?projectId=${encodeURIComponent(id)}`;
    });

    // Sửa — redirect to project-list with #edit=<id> so list auto-opens edit modal (PART-06 Task 06-02)
    document.getElementById('btn-edit-from-detail').addEventListener('click', () => {
        window.location.href = `/pages/project/project-list.html#edit=${encodeURIComponent(id)}`;
    });

    // Xóa — confirmation modal → cascade delete → redirect
    document.getElementById('btn-delete-from-detail').addEventListener('click', () => {
        handleDeleteFromDetail(project);
    });
}

function handleDeleteFromDetail(project) {
    const memberCount = getMembersByProjectId(project.id).length;
    const cascadeNote = memberCount > 0
        ? `<br><span style="color:var(--danger-color);font-size:12px;">⚠ Sẽ xóa ${memberCount} thành viên liên quan.</span>`
        : '';

    openModal(
        'Xác nhận xóa dự án',
        `<p>Bạn có chắc muốn xóa dự án <strong>${escHtml(project.projectName)}</strong>?${cascadeNote}</p>`,
        () => {
            deleteProject(project.id);
            closeModal();
            window.location.href = '/pages/project/project-list.html';
        }
    );
}

// ─────────────────────────────────────────────────────────────
// Not-Found State
// ─────────────────────────────────────────────────────────────
function showNotFound() {
    document.getElementById('project-not-found').style.display = '';
    document.getElementById('project-detail-content').style.display = 'none';
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function infoItem(label, valueHtml, rawHtml = false) {
    const val = rawHtml ? valueHtml : `<span>${valueHtml || '—'}</span>`;
    return `
        <div class="detail-info-item">
            <span class="detail-info-label">${label}</span>
            <div class="detail-info-value">${val}</div>
        </div>`;
}

function progFillClass(prog) {
    if (prog >= 100) return 'fill-success';
    if (prog >= 60) return '';
    if (prog >= 30) return 'fill-warning';
    return 'fill-danger';
}

function priorityStyle(priority) {
    const colours = {
        P1: 'background:rgba(207,19,34,0.1);color:var(--priority-p1);border:1px solid rgba(207,19,34,0.3);',
        P2: 'background:rgba(250,140,22,0.1);color:var(--priority-p2);border:1px solid rgba(250,140,22,0.3);',
        P3: 'background:rgba(24,144,255,0.1);color:var(--priority-p3);border:1px solid rgba(24,144,255,0.3);',
        P4: 'background:rgba(140,140,140,0.1);color:var(--priority-p4);border:1px solid rgba(140,140,140,0.3);'
    };
    return colours[priority] || '';
}

function formatBudget(value) {
    if (!value && value !== 0) return '—';
    return Number(value).toLocaleString('vi-VN') + ' VNĐ';
}

function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
