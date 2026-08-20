document.addEventListener('DOMContentLoaded', () => {
    initCurrentUser();
    loadAndRenderMyTasks();
    initFilterEvents();
});

function initCurrentUser() {
    if (!localStorage.getItem('currentUser')) {
        const defaultUser = {
            id: 1,
            name: 'Hải Nam',
            role: 'employee',
            department: 'Phòng CNTT'
        };
        localStorage.setItem('currentUser', JSON.stringify(defaultUser));
    }
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser')) || { name: 'Hải Nam' };
    } catch (e) {
        return { name: 'Hải Nam' };
    }
}

function getStoredTasks() {
    try {
        return JSON.parse(localStorage.getItem('etrms_tasks')) || [];
    } catch (e) {
        return [];
    }
}

function saveTasks(tasks) {
    localStorage.setItem('etrms_tasks', JSON.stringify(tasks));
}

function renderMyTable(tasks) {
    const tbody = document.getElementById('my-task-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (tasks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; color: #6B7280; padding: 32px;">
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

        const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'DONE';
        const dueDateHtml = isOverdue 
            ? `<span style="color: #DC2626; font-weight: 600;">⚠️ ${task.dueDate}</span>`
            : `<span>${task.dueDate || '---'}</span>`;

        tbody.innerHTML += `
            <tr>
                <td><span class="badge-code">#${task.code || 'TASK-' + task.id}</span></td>
                <td title="${task.title}">
                    <a href="javascript:void(0)" onclick="openUpdateStatusModal(${task.id})" style="font-weight: 600; color: #1F2937; text-decoration: none;">
                        ${task.title}
                    </a>
                </td>
                <td style="color: #4B5563;" title="${task.project || ''}">${task.project || '---'}</td>
                <td style="color: #4B5563;" title="${task.department || ''}">${task.department || '---'}</td>
                <td style="text-align: center;"><span class="${priorityClass}">${task.priority || 'P3'}</span></td>
                <td style="text-align: center; font-weight: 500;">${task.estHours || 0}h</td>
                <td style="text-align: center;"><span class="badge-status ${statusClass}">${statusText}</span></td>
                <td style="text-align: center;">${dueDateHtml}</td>
                <td style="text-align: right;">
                    <div class="action-btns">
                        <button onclick="openUpdateStatusModal(${task.id})" title="Cập nhật tiến độ" style="color: #4B5563;"><i class="fa-solid fa-pen"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function loadAndRenderMyTasks() {
    const currentUser = getCurrentUser();
    const allTasks = getStoredTasks();
    const myTasks = allTasks.filter(t => t.assignee === currentUser.name);
    renderMyTable(myTasks);
}

function initFilterEvents() {
    const searchInput = document.getElementById('filter-search');
    const projSelect = document.getElementById('filter-project');
    const deptSelect = document.getElementById('filter-dept');
    const prioSelect = document.getElementById('filter-priority');
    const statSelect = document.getElementById('filter-status');
    const resetBtn = document.getElementById('btn-reset-filters');

    function applyFilters() {
        const currentUser = getCurrentUser();
        const kw = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const prj = projSelect ? projSelect.value : '';
        const dep = deptSelect ? deptSelect.value : '';
        const pri = prioSelect ? prioSelect.value : '';
        const sta = statSelect ? statSelect.value : '';

        const filtered = getStoredTasks().filter(t => {
            const isMine = t.assignee === currentUser.name;
            const matchKw = !kw || t.title.toLowerCase().includes(kw) || (t.code && t.code.toLowerCase().includes(kw));
            const matchPrj = !prj || t.project === prj;
            const matchDep = !dep || t.department === dep;
            const matchPri = !pri || t.priority === pri;
            const matchSta = !sta || t.status === sta;
            return isMine && matchKw && matchPrj && matchDep && matchPri && matchSta;
        });

        renderMyTable(filtered);
    }

    [searchInput, projSelect, deptSelect, prioSelect, statSelect].forEach(el => {
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
            if (prioSelect) prioSelect.value = '';
            if (statSelect) statSelect.value = '';
            loadAndRenderMyTasks();
        });
    }
}

window.openUpdateStatusModal = function(taskId) {
    const allTasks = getStoredTasks();
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    const modalTitle = `Cập nhật tiến độ: #${task.code || task.id}`;
    const formHtml = `
        <form id="clean-task-form" style="display: flex; flex-direction: column; gap: 14px; width: 100%; box-sizing: border-box;">
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 13px; font-weight: 600; color: #374151;">Tên công việc</label>
                <input type="text" value="${task.title}" disabled
                    style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 13px; color: #6B7280; background: #F9FAFB; box-sizing: border-box; outline: none;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%;">
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 600; color: #374151;">Dự án</label>
                    <input type="text" value="${task.project || '---'}" disabled
                        style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 13px; color: #6B7280; background: #F9FAFB; box-sizing: border-box; outline: none;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 600; color: #374151;">Phòng ban</label>
                    <input type="text" value="${task.department || '---'}" disabled
                        style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 13px; color: #6B7280; background: #F9FAFB; box-sizing: border-box; outline: none;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%;">
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 600; color: #374151;">Trạng thái</label>
                    <select id="m-status" style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; color: #1F2937; background: #FFFFFF; box-sizing: border-box; outline: none;">
                        <option value="TO_DO" ${task.status === 'TO_DO' ? 'selected' : ''}>TO_DO</option>
                        <option value="IN_PROGRESS" ${task.status === 'IN_PROGRESS' ? 'selected' : ''}>IN_PROGRESS</option>
                        <option value="BLOCKED" ${task.status === 'BLOCKED' ? 'selected' : ''}>BLOCKED</option>
                        <option value="IN_REVIEW" ${task.status === 'IN_REVIEW' ? 'selected' : ''}>IN_REVIEW</option>
                        <option value="DONE" ${task.status === 'DONE' ? 'selected' : ''}>DONE</option>
                    </select>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 600; color: #374151;">Thời hạn</label>
                    <input type="date" value="${task.dueDate || ''}" disabled
                        style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 13px; color: #6B7280; background: #F9FAFB; box-sizing: border-box; outline: none;">
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 13px; font-weight: 600; color: #374151;">Link kết quả (Proof URL)</label>
                <input type="url" id="m-proof" value="${task.proofUrl || ''}" placeholder="https://github.com/..."
                    style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; color: #1F2937; background: #FFFFFF; box-sizing: border-box; outline: none;">
            </div>
        </form>
    `;

    if (typeof openModal === 'function') {
        openModal(modalTitle, formHtml, () => {
            const newStatus = document.getElementById('m-status').value;
            const newProof = document.getElementById('m-proof').value.trim();

            const idx = allTasks.findIndex(t => t.id === taskId);
            if (idx !== -1) {
                allTasks[idx].status = newStatus;
                allTasks[idx].proofUrl = newProof;
                saveTasks(allTasks);
                loadAndRenderMyTasks();
                closeModal();
            }
        });
    }
};