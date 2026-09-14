/**
 * resource-request.js
 * Logic for the Resource Request page.
 * Depends on: project-data.js (loaded first).
 * Source of truth: MASTER IMPLEMENTATION PLAN — PART-05, Tasks 05-01 & 05-02
 *
 * Flows:
 *  1. Table display & filtering (E09)
 *  2. Create RR modal (E11) — saveResourceRequest()
 *  3. Approval flow — approveRequest() — PENDING only
 *  4. Rejection flow — rejectRequest() — PENDING only
 *  5. Detail view — read-only modal, all RR fields
 *  6. Double-submit guard across all modals
 */

// ─────────────────────────────────────────────────────────────
// 1. State
// ─────────────────────────────────────────────────────────────
let currentPage = 1;
const PAGE_SIZE = 10;
let searchTerm = '';
let statusFilter = '';

// ─────────────────────────────────────────────────────────────
// 2. Initialisation
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Status filter
    document.getElementById('rr-status-filter').addEventListener('change', (e) => {
        statusFilter = e.target.value;
        currentPage = 1;
        renderTable();
    });

    // Search — debounced 300 ms, matches project name
    const searchInput = document.getElementById('rr-search');
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchTerm = searchInput.value.trim().toLowerCase();
            currentPage = 1;
            renderTable();
        }, 300);
    });

    // Create RR button
    document.getElementById('btn-create-rr').addEventListener('click', openCreateModal);

    // Delegated action buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-rr-action]');
        if (!btn) return;
        const action = btn.dataset.rrAction;
        const id = btn.dataset.rrId;
        if (action === 'detail') openDetailModal(id);
        if (action === 'approve') openApprovalModal(id);
        if (action === 'reject') openRejectModal(id);
    });

    renderTable();
});

// ─────────────────────────────────────────────────────────────
// 3. Filtering
// ─────────────────────────────────────────────────────────────
function getFiltered() {
    let rrs = getResourceRequests();

    if (statusFilter) {
        rrs = rrs.filter(r => r.status === statusFilter);
    }

    if (searchTerm) {
        rrs = rrs.filter(r => {
            const project = getProjectById(r.projectId);
            return project && project.projectName.toLowerCase().includes(searchTerm);
        });
    }

    return rrs;
}

// ─────────────────────────────────────────────────────────────
// 4. Render Table (E09)
// ─────────────────────────────────────────────────────────────
function renderTable() {
    const filtered = getFiltered();
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const tbody = document.getElementById('rr-table-body');
    const emptyState = document.getElementById('rr-empty-state');
    const pagination = document.getElementById('rr-pagination');

    if (total === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = '';
        pagination.innerHTML = '';
        return;
    }
    emptyState.style.display = 'none';

    tbody.innerHTML = pageItems.map(rr => {
        const project = getProjectById(rr.projectId);
        const dept = getDepartmentById(rr.targetDepartmentId);

        const projectName = project ? escHtml(project.projectName) : '<span class="text-deleted">[Đã xóa]</span>';
        const deptName = dept ? escHtml(dept.name) : escHtml(rr.targetDepartmentId);
        const dateRange = (rr.startDate || rr.endDate)
            ? `${formatDate(rr.startDate)} → ${formatDate(rr.endDate)}`
            : '—';

        const statusBadge = `<span class="badge ${getRRStatusBadgeClass(rr.status)}">${getRRStatusLabel(rr.status)}</span>`;

        // Action buttons — Duyệt & Từ chối only for PENDING
        const pendingActions = rr.status === 'PENDING'
            ? `<button class="btn-icon" title="Duyệt" style="color:var(--success-color);"
                       data-rr-action="approve" data-rr-id="${rr.id}">
                   <i class="fa fa-check"></i>
               </button>
               <button class="btn-icon" title="Từ chối" style="color:var(--danger-color);"
                       data-rr-action="reject" data-rr-id="${rr.id}">
                   <i class="fa fa-times"></i>
               </button>`
            : '';

        return `<tr>
            <td style="font-weight:600; font-size:13px;">${escHtml(rr.requestCode)}</td>
            <td>${projectName}</td>
            <td>${deptName}</td>
            <td><span class="badge badge-role">${escHtml(rr.requiredRole)}</span></td>
            <td style="text-align:right;">${rr.quantity}</td>
            <td style="text-align:right;">${rr.capacityPercent}%</td>
            <td style="font-size:13px;">${dateRange}</td>
            <td>${statusBadge}</td>
            <td style="text-align:center;">
                <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap;">
                    <button class="btn-icon" title="Chi tiết"
                            data-rr-action="detail" data-rr-id="${rr.id}">
                        <i class="fa fa-eye"></i>
                    </button>
                    ${pendingActions}
                </div>
            </td>
        </tr>`;
    }).join('');

    renderPagination(totalPages, total);
}

function renderPagination(totalPages, total) {
    const el = document.getElementById('rr-pagination');
    if (totalPages <= 1) {
        el.innerHTML = `<span class="pagination-info">Tổng: ${total} yêu cầu</span>`;
        return;
    }
    let html = `<button class="pagination-btn" id="rr-pg-prev" ${currentPage === 1 ? 'disabled' : ''}>&#8249;</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-rrpage="${i}">${i}</button>`;
    }
    html += `<button class="pagination-btn" id="rr-pg-next" ${currentPage === totalPages ? 'disabled' : ''}>&#8250;</button>`;
    html += `<span class="pagination-info">Trang ${currentPage}/${totalPages} · ${total} yêu cầu</span>`;
    el.innerHTML = html;

    el.querySelectorAll('[data-rrpage]').forEach(btn => {
        btn.addEventListener('click', () => { currentPage = +btn.dataset.rrpage; renderTable(); });
    });
    const prev = document.getElementById('rr-pg-prev');
    const next = document.getElementById('rr-pg-next');
    if (prev) prev.addEventListener('click', () => { currentPage--; renderTable(); });
    if (next) next.addEventListener('click', () => { currentPage++; renderTable(); });
}

// ─────────────────────────────────────────────────────────────
// 5. Create RR Modal (E11)
// ─────────────────────────────────────────────────────────────
function openCreateModal() {
    const projectOptions = getProjects()
        .map(p => `<option value="${p.id}">${escHtml(p.projectName)}</option>`)
        .join('');

    const deptOptions = getMockDepartments()
        .map(d => `<option value="${d.id}">${escHtml(d.name)}</option>`)
        .join('');

    const formHtml = `
<div class="modal-form-grid" id="rr-form-inner">

    <div class="form-group modal-form-full">
        <label class="form-label">Dự án <span style="color:var(--danger-color);">*</span></label>
        <select id="rrf-project" class="form-control">
            <option value="">— Chọn dự án —</option>
            ${projectOptions}
        </select>
        <span class="field-error" id="rrerr-project"></span>
    </div>

    <div class="form-group modal-form-full">
        <label class="form-label">Phòng ban cần mượn <span style="color:var(--danger-color);">*</span></label>
        <select id="rrf-dept" class="form-control">
            <option value="">— Chọn phòng ban —</option>
            ${deptOptions}
        </select>
        <span class="field-error" id="rrerr-dept"></span>
    </div>

    <div class="form-group">
        <label class="form-label">Vai trò cần <span style="color:var(--danger-color);">*</span></label>
        <select id="rrf-role" class="form-control">
            <option value="PM">PM</option>
            <option value="Dev" selected>Dev</option>
            <option value="Tester">Tester</option>
            <option value="Client">Client</option>
        </select>
    </div>

    <div class="form-group">
        <label class="form-label">Số lượng <span style="color:var(--danger-color);">*</span></label>
        <input id="rrf-qty" type="number" class="form-control" value="1" min="1" step="1">
        <span class="field-error" id="rrerr-qty"></span>
    </div>

    <div class="form-group">
        <label class="form-label">Capacity % <span style="color:var(--danger-color);">*</span></label>
        <input id="rrf-cap" type="number" class="form-control" value="100" min="0" max="100" step="5">
        <span class="field-error" id="rrerr-cap"></span>
    </div>

    <div class="form-group">
        <label class="form-label">Ngày bắt đầu</label>
        <input id="rrf-start" type="date" class="form-control">
    </div>

    <div class="form-group">
        <label class="form-label">Ngày kết thúc</label>
        <input id="rrf-end" type="date" class="form-control">
        <span class="field-error" id="rrerr-date"></span>
    </div>

    <div class="form-group modal-form-full">
        <label class="form-label">Ghi chú</label>
        <textarea id="rrf-note" class="form-control" rows="3" placeholder="Mô tả yêu cầu..."></textarea>
    </div>

</div>`;

    openModal('Tạo Yêu cầu mượn Nhân sự', formHtml, handleCreateRR);
}

function handleCreateRR() {
    const btn = document.getElementById('modal-confirm-btn');
    if (btn) btn.disabled = true;

    const projectId = document.getElementById('rrf-project').value;
    const deptId = document.getElementById('rrf-dept').value;
    const role = document.getElementById('rrf-role').value;
    const qty = parseInt(document.getElementById('rrf-qty').value, 10);
    const cap = parseInt(document.getElementById('rrf-cap').value, 10);
    const startDate = document.getElementById('rrf-start').value;
    const endDate = document.getElementById('rrf-end').value;
    const note = document.getElementById('rrf-note').value.trim();

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

    clearErr('rrerr-project'); clearErr('rrerr-dept');
    clearErr('rrerr-qty'); clearErr('rrerr-cap'); clearErr('rrerr-date');

    if (!projectId) showErr('rrerr-project', 'Vui lòng chọn dự án.');
    if (!deptId) showErr('rrerr-dept', 'Vui lòng chọn phòng ban.');
    if (isNaN(qty) || qty < 1) showErr('rrerr-qty', 'Số lượng phải từ 1 trở lên.');
    if (isNaN(cap) || cap < 0 || cap > 100)
        showErr('rrerr-cap', 'Capacity phải từ 0 đến 100.');
    if (!isValidDateRange(startDate, endDate))
        showErr('rrerr-date', 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');

    if (hasError) { if (btn) btn.disabled = false; return; }

    saveResourceRequest({
        projectId,
        targetDepartmentId: deptId,
        requiredRole: role,
        quantity: qty,
        capacityPercent: cap,
        startDate,
        endDate,
        note
    });

    closeModal();
    renderTable();
}

// ─────────────────────────────────────────────────────────────
// 6. Approval Flow (PENDING only)
// ─────────────────────────────────────────────────────────────
function openApprovalModal(rrId) {
    const rr = getResourceRequests().find(r => r.id === rrId);
    if (!rr || rr.status !== 'PENDING') return;

    const project = getProjectById(rr.projectId);
    const dept = getDepartmentById(rr.targetDepartmentId);

    // Eligible users: from target department
    // Per plan Part A §5.3 — no additional eligibility rules invented
    const candidates = getUsersByDepartment(rr.targetDepartmentId);

    const candidateRows = candidates.length > 0
        ? candidates.map(u => `
            <label class="approval-user-item">
                <input type="checkbox" class="approval-check" value="${u.id}">
                <div class="approval-user-info">
                    <span class="approval-user-name">${escHtml(u.fullName)}</span>
                    <span class="approval-user-email">${escHtml(u.role || '')} · ${escHtml(u.email || '')}</span>
                </div>
            </label>`).join('')
        : `<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:12px 0;">
                Phòng ban này hiện không có nhân sự.
           </p>`;

    const formHtml = `
<div id="approval-form-inner">
    <div class="approval-summary">
        <div style="display:flex; justify-content:space-between; padding:3px 0;">
            <span style="color:var(--text-muted); font-size:12px;">Dự án</span>
            <span style="font-size:13px;">${escHtml(project ? project.projectName : rr.projectId)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:3px 0;">
            <span style="color:var(--text-muted); font-size:12px;">Phòng ban</span>
            <span style="font-size:13px;">${escHtml(dept ? dept.name : rr.targetDepartmentId)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:3px 0;">
            <span style="color:var(--text-muted); font-size:12px;">Vai trò cần</span>
            <span style="font-size:13px; font-weight:600;">${escHtml(rr.requiredRole)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:3px 0;">
            <span style="color:var(--text-muted); font-size:12px;">Số lượng</span>
            <span style="font-size:13px; font-weight:600;">${rr.quantity}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:3px 0;">
            <span style="color:var(--text-muted); font-size:12px;">Capacity %</span>
            <span style="font-size:13px;">${rr.capacityPercent}%</span>
        </div>
    </div>

    <div style="font-size:13px; font-weight:600; color:var(--text-main);
                display:flex; align-items:center; justify-content:space-between;
                margin-bottom:8px;">
        <span>Chọn nhân sự</span>
        <span style="font-size:12px; color:var(--text-muted); font-weight:400;">
            Chọn đúng <strong>${rr.quantity}</strong> nhân sự
        </span>
    </div>

    <div class="approval-user-list" id="approval-candidates">
        ${candidateRows}
    </div>

    <span class="field-error" id="approval-err" style="margin-top:8px; display:none;"></span>
</div>`;

    openModal(`Duyệt Yêu cầu ${escHtml(rr.requestCode)}`, formHtml, () => handleApprove(rrId, rr.quantity));
}

function handleApprove(rrId, requiredQty) {
    const btn = document.getElementById('modal-confirm-btn');
    if (btn) btn.disabled = true;

    const errEl = document.getElementById('approval-err');

    const checked = [...document.querySelectorAll('.approval-check:checked')].map(cb => cb.value);

    // Invariant R08: exactly requiredQty users selected
    if (checked.length !== requiredQty) {
        if (errEl) {
            errEl.textContent = `Phải chọn đúng ${requiredQty} nhân sự. Hiện đang chọn ${checked.length}.`;
            errEl.style.display = 'block';
            errEl.style.color = 'var(--danger-color)';
        }
        if (btn) btn.disabled = false;
        return;
    }

    const result = approveRequest(rrId, checked);
    if (!result.success) {
        if (errEl) {
            errEl.textContent = result.error;
            errEl.style.display = 'block';
            errEl.style.color = 'var(--danger-color)';
        }
        if (btn) btn.disabled = false;
        return;
    }

    closeModal();
    renderTable();
}

// ─────────────────────────────────────────────────────────────
// 7. Rejection Flow (PENDING only)
// ─────────────────────────────────────────────────────────────
function openRejectModal(rrId) {
    const rr = getResourceRequests().find(r => r.id === rrId);
    if (!rr || rr.status !== 'PENDING') return;

    const formHtml = `
<div id="reject-form-inner">
    <p style="margin-bottom:12px; font-size:14px;">
        Từ chối yêu cầu <strong>${escHtml(rr.requestCode)}</strong>?
    </p>
    <div class="form-group">
        <label class="form-label">Lý do từ chối <span style="color:var(--danger-color);">*</span></label>
        <textarea id="rr-reject-reason" class="form-control" rows="4"
                  placeholder="Nhập lý do không duyệt yêu cầu này..."></textarea>
        <span class="field-error" id="rr-reject-err"></span>
    </div>
</div>`;

    openModal(`Từ chối Yêu cầu ${escHtml(rr.requestCode)}`, formHtml, () => handleReject(rrId));
}

function handleReject(rrId) {
    const btn = document.getElementById('modal-confirm-btn');
    if (btn) btn.disabled = true;

    const reason = (document.getElementById('rr-reject-reason').value || '').trim();
    const errEl = document.getElementById('rr-reject-err');

    // Invariant R03: reason must be non-empty
    if (!reason) {
        if (errEl) { errEl.textContent = 'Lý do từ chối là bắt buộc.'; errEl.classList.add('visible'); }
        if (btn) btn.disabled = false;
        return;
    }

    const result = rejectRequest(rrId, reason);
    if (!result.success) {
        if (errEl) { errEl.textContent = result.error; errEl.classList.add('visible'); }
        if (btn) btn.disabled = false;
        return;
    }

    closeModal();
    renderTable();
}

// ─────────────────────────────────────────────────────────────
// 8. Detail View (read-only)
// ─────────────────────────────────────────────────────────────
function openDetailModal(rrId) {
    const rr = getResourceRequests().find(r => r.id === rrId);
    if (!rr) return;

    const project = getProjectById(rr.projectId);
    const dept = getDepartmentById(rr.targetDepartmentId);

    // Extra info based on status
    let statusExtra = '';
    if (rr.status === 'APPROVED' && rr.assignedUserIds && rr.assignedUserIds.length > 0) {
        const names = rr.assignedUserIds
            .map(uid => { const u = getUserById(uid); return u ? escHtml(u.fullName) : uid; })
            .join(', ');
        statusExtra = `
            <div class="detail-info-item">
                <span class="detail-info-label">Nhân sự được duyệt</span>
                <div class="detail-info-value" style="color:var(--success-color);">${names}</div>
            </div>`;
    } else if (rr.status === 'REJECTED' && rr.rejectionReason) {
        statusExtra = `
            <div class="detail-info-item">
                <span class="detail-info-label">Lý do từ chối</span>
                <div class="detail-info-value" style="color:var(--danger-color);">
                    ${escHtml(rr.rejectionReason)}
                </div>
            </div>`;
    }

    const formHtml = `
<div class="detail-info-grid" id="rr-detail-inner">
    <div class="detail-info-item">
        <span class="detail-info-label">Mã đơn</span>
        <div class="detail-info-value"><strong>${escHtml(rr.requestCode)}</strong></div>
    </div>
    <div class="detail-info-item">
        <span class="detail-info-label">Trạng thái</span>
        <div class="detail-info-value">
            <span class="badge ${getRRStatusBadgeClass(rr.status)}">${getRRStatusLabel(rr.status)}</span>
        </div>
    </div>
    <div class="detail-info-item">
        <span class="detail-info-label">Dự án</span>
        <div class="detail-info-value">${escHtml(project ? project.projectName : rr.projectId)}</div>
    </div>
    <div class="detail-info-item">
        <span class="detail-info-label">Phòng ban bị mượn</span>
        <div class="detail-info-value">${escHtml(dept ? dept.name : rr.targetDepartmentId)}</div>
    </div>
    <div class="detail-info-item">
        <span class="detail-info-label">Vai trò cần</span>
        <div class="detail-info-value"><span class="badge badge-role">${escHtml(rr.requiredRole)}</span></div>
    </div>
    <div class="detail-info-item">
        <span class="detail-info-label">Số lượng</span>
        <div class="detail-info-value">${rr.quantity}</div>
    </div>
    <div class="detail-info-item">
        <span class="detail-info-label">Capacity %</span>
        <div class="detail-info-value">${rr.capacityPercent}%</div>
    </div>
    <div class="detail-info-item">
        <span class="detail-info-label">Ngày bắt đầu</span>
        <div class="detail-info-value">${formatDate(rr.startDate)}</div>
    </div>
    <div class="detail-info-item">
        <span class="detail-info-label">Ngày kết thúc</span>
        <div class="detail-info-value">${formatDate(rr.endDate)}</div>
    </div>
    ${rr.note ? `<div class="detail-info-item modal-form-full">
        <span class="detail-info-label">Ghi chú</span>
        <div class="detail-info-value">${escHtml(rr.note)}</div>
    </div>` : ''}
    ${statusExtra}
</div>`;

    // Detail modal: replace footer so only "Đóng" button appears — no confirm action
    openModal(`Chi tiết ${escHtml(rr.requestCode)}`, formHtml, null);

    // Override modal footer: show only Đóng, hide the confirm button
    const confirmBtn = document.getElementById('modal-confirm-btn');
    if (confirmBtn) confirmBtn.style.display = 'none';
}

// ─────────────────────────────────────────────────────────────
// 9. Utilities
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
