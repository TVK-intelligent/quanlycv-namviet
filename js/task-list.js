
document.addEventListener('DOMContentLoaded', () => {
    initDefaultTasks();
    loadAndRenderTasks();
    initFilterEvents();
    initCreateButton();
});
// 1. DATA SEEDING & PERSISTENCE LAYER (LOCALSTORAGE ADAPTER)
function initDefaultTasks() {
    if (!localStorage.getItem('etrms_tasks')) {
        const defaultTasks = [
            {
                id: 101,
                code: 'TASK-101',
                title: 'Dev Backend API Xác thực người dùng',
                project: 'Triển khai CRM',
                department: 'Phòng Kế toán',
                assignee: 'Khải Trần Văn',
                priority: 'P1',
                status: 'IN_PROGRESS',
                estHours: 8,
                dueDate: '2026-08-25'
            },
            {
                id: 102,
                code: 'TASK-102',
                title: 'Thiết kế Mockup UI Dashboard & Workspace',
                project: 'Thiết kế hệ thống ETRMS',
                department: 'Phòng CNTT',
                assignee: 'Hải Nam',
                priority: 'P2',
                status: 'DONE',
                estHours: 16,
                dueDate: '2026-08-05'
            },
            {
                id: 103,
                code: 'TASK-103',
                title: 'Khảo sát quy trình nghiệp vụ các phòng ban',
                project: 'Hệ thống Vận hành Nội bộ',
                department: 'Phòng Marketing',
                assignee: 'Lê Gia Bách',
                priority: 'P3',
                status: 'TO_DO',
                estHours: 12,
                dueDate: '2026-08-30'
            }
        ];
        localStorage.setItem('etrms_tasks', JSON.stringify(defaultTasks));
    }
}
function getStoredTasks() {
    try {
        return JSON.parse(localStorage.getItem('etrms_tasks')) || [];
    } catch (e) {
        console.error('[Storage Error] Failed to parse etrms_tasks:', e);
        return [];
    }
}
function saveTasks(tasks) {
    localStorage.setItem('etrms_tasks', JSON.stringify(tasks));
}
// 2. VIEW PRESENTATION & DOM RENDERING
function renderTable(tasks) {
    const tbody = document.getElementById('task-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (tasks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; color: #6B7280; padding: 32px;">
                    <i class="fa-solid fa-inbox" style="font-size: 20px; margin-bottom: 6px; display: block; color: #9CA3AF;"></i>
                    Không tìm thấy công việc nào phù hợp
                </td>
            </tr>
        `;
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    tasks.forEach(task => {
        const priorityClass = `badge-${(task.priority || 'p3').toLowerCase()}`;
        
        let statusClass = 'status-todo';
        let statusText = 'TO_DO';
        if (task.status === 'IN_PROGRESS') { statusClass = 'status-inprogress'; statusText = 'IN_PROGRESS'; }
        else if (task.status === 'BLOCKED') { statusClass = 'status-blocked'; statusText = 'BLOCKED'; }
        else if (task.status === 'IN_REVIEW') { statusClass = 'status-review'; statusText = 'IN_REVIEW'; }
        else if (task.status === 'DONE') { statusClass = 'status-done'; statusText = 'DONE'; }

        // Evaluation for SLA Overdue state
        const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'DONE';
        const dueDateHtml = isOverdue 
            ? `<span style="color: #DC2626; font-weight: 600;">⚠️ ${task.dueDate}</span>`
            : `<span>${task.dueDate || '---'}</span>`;

        const avatarText = (task.assignee || 'U').trim().split(' ').pop().substring(0, 2).toUpperCase();

        tbody.innerHTML += `
            <tr>
                <td style="text-align: center;"><input type="checkbox" value="${task.id}"></td>
                <td><span class="badge-code">#${task.code || 'TASK-' + task.id}</span></td>
                <td title="${task.title}">
                    <a href="javascript:void(0)" onclick="openTaskModal(${task.id})" style="font-weight: 600; color: #1F2937; text-decoration: none;">
                        ${task.title}
                    </a>
                    ${task.status === 'BLOCKED' && task.blockedReason ? `
                        <div style="font-size: 11px; color: #DC2626; margin-top: 3px;">
                            <i class="fa-solid fa-triangle-exclamation"></i> <strong>Nghẽn:</strong> ${task.blockedReason}
                        </div>
                    ` : ''}
                    ${task.proofUrl ? `
                        <div style="font-size: 11px; color: #2563EB; margin-top: 3px;">
                            <i class="fa-solid fa-link"></i> <a href="${task.proofUrl}" target="_blank" style="color: #2563EB; text-decoration: underline;">Bằng chứng nộp</a>
                        </div>
                    ` : ''}
                </td>
                <td style="color: #4B5563;" title="${task.project || ''}">${task.project || '---'}</td>
                <td style="color: #4B5563;" title="${task.department || ''}">${task.department || '---'}</td>
                <td>
                    <div class="user-tag" title="${task.assignee || ''}">
                        <span class="user-avatar">${avatarText}</span>
                        <span>${task.assignee || 'Chưa gán'}</span>
                    </div>
                </td>
                <td style="text-align: center;"><span class="${priorityClass}">${task.priority || 'P3'}</span></td>
                <td style="text-align: center; font-weight: 500;">${task.estHours || 0}h</td>
                <td style="text-align: center;"><span class="badge-status ${statusClass}">${statusText}</span></td>
                <td style="text-align: center;">${dueDateHtml}</td>
                <td style="text-align: center;">
                    <div class="action-btns">
                        <button onclick="openTaskModal(${task.id})" title="Sửa" style="color: #4B5563;"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteTask(${task.id})" title="Xóa" style="color: #DC2626;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function loadAndRenderTasks() {
    renderTable(getStoredTasks());
}

// 3. MULTI-CRITERIA REALTIME FILTERING ENGINE
function initFilterEvents() {
    const searchInput = document.getElementById('filter-search');
    const projSelect = document.getElementById('filter-project');
    const deptSelect = document.getElementById('filter-dept');
    const userSelect = document.getElementById('filter-assignee');
    const prioSelect = document.getElementById('filter-priority');
    const statSelect = document.getElementById('filter-status');
    const resetBtn = document.getElementById('btn-reset-filters');

    function applyFilters() {
        const kw = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const prj = projSelect ? projSelect.value : '';
        const dep = deptSelect ? deptSelect.value : '';
        const usr = userSelect ? userSelect.value : '';
        const pri = prioSelect ? prioSelect.value : '';
        const sta = statSelect ? statSelect.value : '';

        const filtered = getStoredTasks().filter(t => {
            const matchKw = !kw || t.title.toLowerCase().includes(kw) || (t.code && t.code.toLowerCase().includes(kw));
            const matchPrj = !prj || t.project === prj;
            const matchDep = !dep || t.department === dep;
            const matchUsr = !usr || t.assignee === usr;
            const matchPri = !pri || t.priority === pri;
            const matchSta = !sta || t.status === sta;
            return matchKw && matchPrj && matchDep && matchUsr && matchPri && matchSta;
        });

        renderTable(filtered);
    }

    [searchInput, projSelect, deptSelect, userSelect, prioSelect, statSelect].forEach(el => {
        if (el) {
            el.addEventListener('input', applyFilters);
            el.addEventListener('change', applyFilters);
        }
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (projSelect) projSelect.value = '';
            if (deptSelect) deptSelect.value = '';
            if (userSelect) userSelect.value = '';
            if (prioSelect) prioSelect.value = '';
            if (statSelect) statSelect.value = '';
            loadAndRenderTasks();
        });
    }
}


// 4. MODAL DIALOG & TASK FORM MUTATION CONTROLLER
function initCreateButton() {
    const btn = document.getElementById('btn-create-task');
    if (btn) btn.addEventListener('click', () => openTaskModal(null));
}

window.openTaskModal = function(taskId = null) {
    const isEdit = !!taskId;
    const task = isEdit ? getStoredTasks().find(t => t.id === taskId) : null;
    const modalTitle = isEdit ? `Chỉnh sửa Task: #${task.code || task.id}` : 'Tạo công việc mới';

    // Structured form with full-width inputs, consistent gutters, and unified tokens
    const formHtml = `
        <form id="clean-task-form" style="display: flex; flex-direction: column; gap: 14px; width: 100%; box-sizing: border-box;">
            <!-- Task Title (Full Span) -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 13px; font-weight: 600; color: #374151;">
                    Tên công việc <span style="color: #EF4444;">*</span>
                </label>
                <input type="text" id="m-title" value="${task?.title || ''}" placeholder="Nhập tên công việc..." required
                    style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; color: #1F2937; background: #FFFFFF; box-sizing: border-box; outline: none; transition: border-color 0.2s;">
            </div>

            <!-- Row 1: Project & Department -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%;">
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 600; color: #374151;">
                        Dự án <span style="color: #EF4444;">*</span>
                    </label>
                    <select id="m-project" style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; color: #1F2937; background: #FFFFFF; box-sizing: border-box; outline: none;">
                        <option value="Thiết kế hệ thống ETRMS" ${task?.project === 'Thiết kế hệ thống ETRMS' ? 'selected' : ''}>Thiết kế hệ thống ETRMS</option>
                        <option value="Triển khai CRM" ${task?.project === 'Triển khai CRM' ? 'selected' : ''}>Triển khai CRM</option>
                        <option value="Hệ thống Vận hành Nội bộ" ${task?.project === 'Hệ thống Vận hành Nội bộ' ? 'selected' : ''}>Hệ thống Vận hành Nội bộ</option>
                    </select>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 600; color: #374151;">Phòng ban</label>
                    <select id="m-dept" style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; color: #1F2937; background: #FFFFFF; box-sizing: border-box; outline: none;">
                        <option value="Phòng CNTT" ${task?.department === 'Phòng CNTT' ? 'selected' : ''}>Phòng CNTT</option>
                        <option value="Phòng Kế toán" ${task?.department === 'Phòng Kế toán' ? 'selected' : ''}>Phòng Kế toán</option>
                        <option value="Phòng Marketing" ${task?.department === 'Phòng Marketing' ? 'selected' : ''}>Phòng Marketing</option>
                        <option value="Phòng Kinh doanh" ${task?.department === 'Phòng Kinh doanh' ? 'selected' : ''}>Phòng Kinh doanh</option>
                    </select>
                </div>
            </div>

            <!-- Row 2: Assignee & Priority -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%;">
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 600; color: #374151;">
                        Người làm <span style="color: #EF4444;">*</span>
                    </label>
                    <select id="m-assignee" style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; color: #1F2937; background: #FFFFFF; box-sizing: border-box; outline: none;">
                        <option value="Hải Nam" ${task?.assignee === 'Hải Nam' ? 'selected' : ''}>Hải Nam</option>
                        <option value="Khải Trần Văn" ${task?.assignee === 'Khải Trần Văn' ? 'selected' : ''}>Khải Trần Văn</option>
                        <option value="Lê Gia Bách" ${task?.assignee === 'Lê Gia Bách' ? 'selected' : ''}>Lê Gia Bách</option>
                    </select>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 600; color: #374151;">Độ ưu tiên</label>
                    <select id="m-priority" style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; color: #1F2937; background: #FFFFFF; box-sizing: border-box; outline: none;">
                        <option value="P1" ${task?.priority === 'P1' ? 'selected' : ''}>P1 - Khẩn cấp</option>
                        <option value="P2" ${task?.priority === 'P2' ? 'selected' : ''}>P2 - Cao</option>
                        <option value="P3" ${task?.priority === 'P3' || !task ? 'selected' : ''}>P3 - Trung bình</option>
                        <option value="P4" ${task?.priority === 'P4' ? 'selected' : ''}>P4 - Thấp</option>
                    </select>
                </div>
            </div>

            <!-- Row 3: Status & Estimated Hours -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%;">
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 600; color: #374151;">Trạng thái</label>
                    <select id="m-status" style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; color: #1F2937; background: #FFFFFF; box-sizing: border-box; outline: none;">
                        <option value="TO_DO" ${task?.status === 'TO_DO' ? 'selected' : ''}>TO_DO</option>
                        <option value="IN_PROGRESS" ${task?.status === 'IN_PROGRESS' ? 'selected' : ''}>IN_PROGRESS</option>
                        <option value="BLOCKED" ${task?.status === 'BLOCKED' ? 'selected' : ''}>BLOCKED</option>
                        <option value="IN_REVIEW" ${task?.status === 'IN_REVIEW' ? 'selected' : ''}>IN_REVIEW</option>
                        <option value="DONE" ${task?.status === 'DONE' ? 'selected' : ''}>DONE</option>
                    </select>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 600; color: #374151;">Ước lượng (Giờ)</label>
                    <input type="number" id="m-est" value="${task?.estHours || 8}" min="1" max="500"
                        style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; color: #1F2937; background: #FFFFFF; box-sizing: border-box; outline: none;">
                </div>
            </div>

            <!-- Row 4: Due Date (Full Span) -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 13px; font-weight: 600; color: #374151;">
                    Hạn chót <span style="color: #EF4444;">*</span>
                </label>
                <input type="date" id="m-due" value="${task?.dueDate || ''}" required
                    style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; color: #1F2937; background: #FFFFFF; box-sizing: border-box; outline: none;">
            </div>

            <!-- Row 5: Blocker Reason (Conditionally shown if BLOCKED) -->
            <div id="m-blocker-container" style="display: ${task?.status === 'BLOCKED' ? 'flex' : 'none'}; flex-direction: column; gap: 6px;">
                <label style="font-size: 13px; font-weight: 600; color: #DC2626;">
                    Nguyên nhân bị nghẽn (Blocker Reason) <span style="color: #EF4444;">*</span>
                </label>
                <input type="text" id="m-blocker" value="${task?.blockedReason || ''}" placeholder="Nhập lý do khiến task bị nghẽn..."
                    style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid #FCA5A5; border-radius: 6px; font-size: 13px; color: #991B1B; background: #FEF2F2; box-sizing: border-box; outline: none;">
            </div>

            <!-- Row 6: Proof URL (Conditionally shown if IN_REVIEW or DONE) -->
            <div id="m-proof-container" style="display: ${(task?.status === 'IN_REVIEW' || task?.status === 'DONE') ? 'flex' : 'none'}; flex-direction: column; gap: 6px;">
                <label style="font-size: 13px; font-weight: 600; color: #2563EB;">
                    Liên kết bằng chứng hoàn thành (GitHub PR, Figma, Demo)
                </label>
                <input type="url" id="m-proof" value="${task?.proofUrl || ''}" placeholder="https://github.com/... hoặc https://figma.com/..."
                    style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid #93C5FD; border-radius: 6px; font-size: 13px; color: #1E40AF; background: #EFF6FF; box-sizing: border-box; outline: none;">
            </div>
        </form>
    `;

    if (typeof openModal === 'function') {
        openModal(modalTitle, formHtml, () => {
            const title = document.getElementById('m-title').value.trim();
            const dueDate = document.getElementById('m-due').value;
            const status = document.getElementById('m-status').value;
            const blockerReason = document.getElementById('m-blocker').value.trim();
            const proofUrl = document.getElementById('m-proof').value.trim();

            // Form Validation Gate
            if (!title || !dueDate) {
                alert('Vui lòng nhập đầy đủ tên công việc và hạn chót!');
                return;
            }

            if (status === 'BLOCKED' && !blockerReason) {
                alert('Khi chọn trạng thái BLOCKED, bạn bắt buộc phải nhập nguyên nhân bị nghẽn!');
                return;
            }

            if (status === 'IN_REVIEW' && proofUrl && !proofUrl.startsWith('http://') && !proofUrl.startsWith('https://')) {
                alert('URL bằng chứng phải bắt đầu bằng http:// hoặc https://');
                return;
            }

            const allTasks = getStoredTasks();

            if (isEdit) {
                // Update Path
                const idx = allTasks.findIndex(t => t.id === taskId);
                if (idx !== -1) {
                    allTasks[idx] = {
                        ...allTasks[idx],
                        title,
                        project: document.getElementById('m-project').value,
                        department: document.getElementById('m-dept').value,
                        assignee: document.getElementById('m-assignee').value,
                        priority: document.getElementById('m-priority').value,
                        status,
                        estHours: Number(document.getElementById('m-est').value) || 0,
                        dueDate,
                        blockedReason: status === 'BLOCKED' ? blockerReason : '',
                        proofUrl: proofUrl || allTasks[idx].proofUrl || '',
                        dodDone: status === 'DONE' ? (allTasks[idx].dodTotal || 4) : allTasks[idx].dodDone,
                        reviewStatus: status === 'DONE' ? 'APPROVED' : (status === 'IN_REVIEW' ? 'PENDING' : allTasks[idx].reviewStatus)
                    };
                }
            } else {
                // Create Path
                const nextId = allTasks.length > 0 ? Math.max(...allTasks.map(t => t.id)) + 1 : 101;
                allTasks.push({
                    id: nextId,
                    code: `TASK-${nextId}`,
                    title,
                    project: document.getElementById('m-project').value,
                    department: document.getElementById('m-dept').value,
                    assignee: document.getElementById('m-assignee').value,
                    priority: document.getElementById('m-priority').value,
                    status,
                    estHours: Number(document.getElementById('m-est').value) || 0,
                    dueDate,
                    blockedReason: status === 'BLOCKED' ? blockerReason : '',
                    proofUrl: proofUrl || '',
                    dodTotal: 4,
                    dodDone: status === 'DONE' ? 4 : 0,
                    reviewStatus: status === 'DONE' ? 'APPROVED' : (status === 'IN_REVIEW' ? 'PENDING' : null)
                });
            }

            saveTasks(allTasks);
            loadAndRenderTasks();
            closeModal();
            if (window.showToast) window.showToast('Đã lưu thông tin công việc thành công!', 'success');
        });

        // Dynamic toggle of Blocker & Proof containers based on status selection
        setTimeout(() => {
            const statusSelect = document.getElementById('m-status');
            const blockerBox = document.getElementById('m-blocker-container');
            const proofBox = document.getElementById('m-proof-container');

            if (statusSelect) {
                statusSelect.addEventListener('change', function() {
                    if (blockerBox) blockerBox.style.display = this.value === 'BLOCKED' ? 'flex' : 'none';
                    if (proofBox) proofBox.style.display = (this.value === 'IN_REVIEW' || this.value === 'DONE') ? 'flex' : 'none';
                });
            }
        }, 100);
    }
};

// 5. TASK DELETION HANDLER
window.deleteTask = function(taskId) {
    if (confirm(`Bạn có chắc chắn muốn xóa công việc #${taskId}?`)) {
        let tasks = getStoredTasks();
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks(tasks);
        loadAndRenderTasks();
    }
};