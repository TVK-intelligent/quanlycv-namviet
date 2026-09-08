/**
 * project-member.js
 * Logic for the Project Member management page.
 * Depends on: project-data.js (loaded first).
 * Source of truth: MASTER IMPLEMENTATION PLAN — PART-04
 *
 * Key responsibilities:
 *  - Populate project filter from all projects
 *  - Render member table with E06 columns (avatar, name, email, project, role, capacity, joined)
 *  - Search by member name (debounced)
 *  - Filter by project (via URL ?projectId= or dropdown)
 *  - Pagination (10/page)
 *  - Add Member modal: select project + user, set capacity
 *  - Edit Capacity modal (pre-filled): update allocatedCapacity
 *  - Remove Member: confirmation modal → delete member record
 */

// ─────────────────────────────────────────────────────────────
// 1. State
// ─────────────────────────────────────────────────────────────
let currentPage = 1;
const PAGE_SIZE = 10;
let searchTerm = '';
let projectFilter = '';

// ─────────────────────────────────────────────────────────────
// 2. Initialisation
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    populateProjectFilter();

    // Read ?projectId= from URL
    const params = new URLSearchParams(window.location.search);
    const urlProjectId = params.get('projectId');
    if (urlProjectId) {
        projectFilter = urlProjectId;
        const sel = document.getElementById('member-project-filter');
        if (sel) sel.value = urlProjectId;
    }

    // Project filter dropdown
    document.getElementById('member-project-filter').addEventListener('change', (e) => {
        projectFilter = e.target.value;
        currentPage = 1;
        renderMemberTable();
    });

    // Search — debounced 300 ms
    const searchInput = document.getElementById('member-search');
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchTerm = searchInput.value.trim().toLowerCase();
            currentPage = 1;
            renderMemberTable();
        }, 300);
    });

    // Add Member button
    document.getElementById('btn-add-member').addEventListener('click', () => {
        openAddMemberModal();
    });

    // Delegated action buttons
    document.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-member-action]');
        if (!actionBtn) return;
        const action = actionBtn.dataset.memberAction;
        const memberId = actionBtn.dataset.memberId;
        if (action === 'edit-capacity') openEditCapacityModal(memberId);
        if (action === 'remove') handleRemoveMember(memberId);
    });

    renderMemberTable();
});

// ─────────────────────────────────────────────────────────────
// 3. Populate Project Filter
// ─────────────────────────────────────────────────────────────
function populateProjectFilter() {
    const sel = document.getElementById('member-project-filter');
    const projects = getProjects();
    projects.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.projectName;
        sel.appendChild(opt);
    });
}

// ─────────────────────────────────────────────────────────────
// 4. Filtering
// ─────────────────────────────────────────────────────────────
function getFilteredMembers() {
    let members = getProjectMembers();

    if (projectFilter) {
        members = members.filter(m => m.projectId === projectFilter);
    }

    if (searchTerm) {
        members = members.filter(m => {
            const user = getUserById(m.userId);
            return user && user.fullName.toLowerCase().includes(searchTerm);
        });
    }

    return members;
}

// ─────────────────────────────────────────────────────────────
// 5. Render Table
// ─────────────────────────────────────────────────────────────
function renderMemberTable() {
    const filtered = getFilteredMembers();
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const tbody = document.getElementById('member-table-body');
    const emptyState = document.getElementById('member-empty-state');
    const pagination = document.getElementById('member-pagination');

    if (total === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = '';
        pagination.innerHTML = '';
        return;
    }
    emptyState.style.display = 'none';

    tbody.innerHTML = pageItems.map(m => {
        const user = getUserById(m.userId);
        const project = getProjectById(m.projectId);

        const displayName = user ? user.fullName : 'Người dùng không xác định';
        const email = user ? (user.email || '—') : '—';
        const projectName = project ? project.projectName : 'Dự án không xác định';

        // Capacity colour indicator
        const cap = m.allocatedCapacity ?? 0;
        const capClass = cap > 100 ? 'text-danger' : cap >= 80 ? 'text-warning' : 'text-success';

        // Avatar initials
        const initials = buildInitials(displayName);
        const avatarBg = stringToColor(displayName);

        return `<tr data-member-id="${m.id}">
            <td>
                <div class="member-avatar" style="background:${avatarBg};" title="${escHtml(displayName)}">
                    ${escHtml(initials)}
                </div>
            </td>
            <td><strong>${escHtml(displayName)}</strong></td>
            <td style="font-size:13px; color:var(--text-muted);">${escHtml(email)}</td>
            <td>
                <a href="/pages/project/project-detail.html?id=${encodeURIComponent(m.projectId)}"
                   style="color:var(--primary-color); text-decoration:none; font-size:13px;">
                   ${escHtml(projectName)}
                </a>
            </td>
            <td><span class="badge badge-role">${escHtml(m.role || '—')}</span></td>
            <td style="text-align:right;">
                <span class="${capClass}" style="font-weight:600;">${cap}%</span>
            </td>
            <td style="font-size:13px;">${formatDate(m.joinedDate)}</td>
            <td style="text-align:center;">
                <div style="display:flex; gap:6px; justify-content:center;">
                    <button class="btn-icon" title="Sửa capacity"
                            data-member-action="edit-capacity" data-member-id="${m.id}">
                        <i class="fa fa-pen"></i>
                    </button>
                    <button class="btn-icon" title="Gỡ thành viên"
                            style="color:var(--danger-color);"
                            data-member-action="remove" data-member-id="${m.id}">
                        <i class="fa fa-user-minus"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');

    renderPagination(totalPages, total);
}

function renderPagination(totalPages, total) {
    const el = document.getElementById('member-pagination');
    if (totalPages <= 1) {
        el.innerHTML = `<span class="pagination-info">Tổng: ${total} thành viên</span>`;
        return;
    }
    let html = `<button class="pagination-btn" id="mpg-prev" ${currentPage === 1 ? 'disabled' : ''}>&#8249;</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-mpage="${i}">${i}</button>`;
    }
    html += `<button class="pagination-btn" id="mpg-next" ${currentPage === totalPages ? 'disabled' : ''}>&#8250;</button>`;
    html += `<span class="pagination-info">Trang ${currentPage}/${totalPages} · ${total} thành viên</span>`;
    el.innerHTML = html;

    el.querySelectorAll('[data-mpage]').forEach(btn => {
        btn.addEventListener('click', () => { currentPage = +btn.dataset.mpage; renderMemberTable(); });
    });
    const prev = document.getElementById('mpg-prev');
    const next = document.getElementById('mpg-next');
    if (prev) prev.addEventListener('click', () => { currentPage--; renderMemberTable(); });
    if (next) next.addEventListener('click', () => { currentPage++; renderMemberTable(); });
}

// ─────────────────────────────────────────────────────────────
// 6. Add Member Modal
// ─────────────────────────────────────────────────────────────
function openAddMemberModal() {
    // Build project options
    const projectOptions = getProjects()
        .map(p => `<option value="${p.id}" ${p.id === projectFilter ? 'selected' : ''}>${escHtml(p.projectName)}</option>`)
        .join('');

    // Build user options (all users not yet a member of any project — JS will re-filter on project change)
    const allUsers = getMockUsers();
    const userOptions = allUsers
        .map(u => `<option value="${u.id}">${escHtml(u.fullName)} (${escHtml(u.departmentId || u.role)})</option>`)
        .join('');

    const formHtml = `
<div class="modal-form-grid" id="member-form-inner">

    <div class="form-group modal-form-full">
        <label class="form-label">Dự án <span style="color:var(--danger-color);">*</span></label>
        <select id="mfm-project" class="form-control">
            <option value="">— Chọn dự án —</option>
            ${projectOptions}
        </select>
        <span class="field-error" id="merr-project"></span>
    </div>

    <div class="form-group modal-form-full">
        <label class="form-label">Thành viên <span style="color:var(--danger-color);">*</span></label>
        <select id="mfm-user" class="form-control">
            <option value="">— Chọn người dùng —</option>
            ${userOptions}
        </select>
        <span class="field-error" id="merr-user"></span>
    </div>

    <div class="form-group">
        <label class="form-label">Vai trò trong dự án</label>
        <input id="mfm-role" type="text" class="form-control" placeholder="VD: Developer, Tester..." maxlength="80">
    </div>

    <div class="form-group">
        <label class="form-label">Allocated Capacity (%)</label>
        <input id="mfm-capacity" type="number" class="form-control" value="100" min="0" max="200" step="5">
        <span class="field-error" id="merr-capacity"></span>
    </div>

    <div class="form-group">
        <label class="form-label">Ngày tham gia</label>
        <input id="mfm-joined" type="date" class="form-control" value="${todayIso()}">
    </div>

</div>`;

    openModal('Thêm Thành viên', formHtml, handleSaveAddMember);
}

function handleSaveAddMember() {
    const btn = document.getElementById('modal-confirm-btn');
    if (btn) btn.disabled = true;

    const projectId = document.getElementById('mfm-project').value;
    const userId = document.getElementById('mfm-user').value;
    const role = document.getElementById('mfm-role').value.trim();
    const capacity = parseInt(document.getElementById('mfm-capacity').value, 10);
    const joined = document.getElementById('mfm-joined').value;

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

    clearErr('merr-project'); clearErr('merr-user'); clearErr('merr-capacity');

    if (!projectId) showErr('merr-project', 'Vui lòng chọn dự án.');
    if (!userId) showErr('merr-user', 'Vui lòng chọn thành viên.');

    // Duplicate guard: same user in same project
    if (projectId && userId) {
        const existing = getMembersByProjectId(projectId).find(m => m.userId === userId);
        if (existing) showErr('merr-user', 'Người dùng này đã là thành viên của dự án.');
    }

    if (isNaN(capacity) || capacity < 0)
        showErr('merr-capacity', 'Capacity phải từ 0 trở lên.');

    if (hasError) { if (btn) btn.disabled = false; return; }

    addProjectMember({
        projectId,
        userId,
        role,
        allocatedCapacity: capacity,
        joinedDate: joined
    });

    closeModal();
    renderMemberTable();
}

// ─────────────────────────────────────────────────────────────
// 7. Edit Capacity Modal
// ─────────────────────────────────────────────────────────────
function openEditCapacityModal(memberId) {
    const member = getProjectMemberById(memberId);
    if (!member) return;
    const user = getUserById(member.userId);
    const project = getProjectById(member.projectId);

    const formHtml = `
<div class="modal-form-grid" id="edit-cap-inner">
    <div class="form-group modal-form-full">
        <label class="form-label">Thành viên</label>
        <div style="font-weight:600; padding:8px 0;">${escHtml(user ? user.fullName : '—')}</div>
    </div>
    <div class="form-group modal-form-full">
        <label class="form-label">Dự án</label>
        <div style="font-size:13px; color:var(--text-muted); padding:4px 0 8px;">
            ${escHtml(project ? project.projectName : '—')}
        </div>
    </div>
    <div class="form-group">
        <label class="form-label">Vai trò</label>
        <input id="ecm-role" type="text" class="form-control" value="${escHtml(member.role || '')}" maxlength="80">
    </div>
    <div class="form-group">
        <label class="form-label">Allocated Capacity (%)</label>
        <input id="ecm-capacity" type="number" class="form-control"
               value="${member.allocatedCapacity ?? 100}" min="0" max="200" step="5">
        <span class="field-error" id="ecm-err-cap"></span>
    </div>
</div>`;

    openModal('Sửa Thông tin Thành viên', formHtml, () => handleSaveCapacity(memberId));
}

function handleSaveCapacity(memberId) {
    const btn = document.getElementById('modal-confirm-btn');
    if (btn) btn.disabled = true;

    const capacity = parseInt(document.getElementById('ecm-capacity').value, 10);
    const role = document.getElementById('ecm-role').value.trim();

    const errEl = document.getElementById('ecm-err-cap');
    if (isNaN(capacity) || capacity < 0) {
        if (errEl) { errEl.textContent = 'Capacity phải từ 0 trở lên.'; errEl.classList.add('visible'); }
        if (btn) btn.disabled = false;
        return;
    }

    updateMemberCapacity(memberId, capacity, role);
    closeModal();
    renderMemberTable();
}

// ─────────────────────────────────────────────────────────────
// 8. Remove Member
// ─────────────────────────────────────────────────────────────
function handleRemoveMember(memberId) {
    const member = getProjectMemberById(memberId);
    if (!member) return;
    const user = getUserById(member.userId);
    const project = getProjectById(member.projectId);
    const name = user ? user.fullName : 'thành viên này';
    const proj = project ? project.projectName : 'dự án';

    openModal(
        'Xác nhận gỡ thành viên',
        `<p>Bạn có chắc muốn gỡ <strong>${escHtml(name)}</strong> khỏi dự án <strong>${escHtml(proj)}</strong>?</p>`,
        () => {
            removeProjectMember(memberId);
            closeModal();
            renderMemberTable();
        }
    );
}

// ─────────────────────────────────────────────────────────────
// 9. Utilities
// ─────────────────────────────────────────────────────────────
function buildInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function stringToColor(str) {
    if (!str) return '#888';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 55%, 45%)`;
}

function todayIso() {
    return new Date().toISOString().substring(0, 10);
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
