/**
 * EXTENSION REQUEST JAVASCRIPT (js/extension-request.js)
 * Enterprise Workflow: Dynamic Task Extension Management & SLA Sync
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. DATA ACCESS & SEEDING
    function getExtensions() {
        try {
            return JSON.parse(localStorage.getItem('taskconnect_extensions')) || [];
        } catch (e) {
            console.error('Lỗi đọc taskconnect_extensions:', e);
            return [];
        }
    }

    function saveExtensions(extensions) {
        try {
            localStorage.setItem('taskconnect_extensions', JSON.stringify(extensions));
        } catch (e) {
            console.error('Lỗi lưu taskconnect_extensions:', e);
        }
    }

    function getTasks() {
        try {
            return JSON.parse(localStorage.getItem('etrms_tasks')) || [];
        } catch (e) {
            console.error('Lỗi đọc etrms_tasks:', e);
            return [];
        }
    }

    function saveTasks(tasks) {
        try {
            localStorage.setItem('etrms_tasks', JSON.stringify(tasks));
        } catch (e) {
            console.error('Lỗi lưu etrms_tasks:', e);
        }
    }

    function initDefaultExtensions() {
        const existing = getExtensions();
        if (existing.length === 0) {
            const defaults = [
                {
                    id: 1,
                    taskId: 101,
                    task: 'Dev Backend API Xác thực người dùng (JWT, OAuth2)',
                    requester: 'Khải Trần Văn',
                    dept: 'Phòng Phát triển',
                    currentDueDate: '2026-08-25',
                    newDueDate: '2026-08-30',
                    reason: 'Chờ phản hồi từ team Backend về database schema mới và API Gateway bên thứ 3.',
                    status: 'Pending',
                    createdAt: '2026-08-24'
                },
                {
                    id: 2,
                    taskId: 104,
                    task: 'Fix Bug #104: Lỗi timeout API khi export báo cáo Excel',
                    requester: 'Trần Văn Minh',
                    dept: 'Phòng Phát triển',
                    currentDueDate: '2026-08-20',
                    newDueDate: '2026-08-28',
                    reason: 'Database server bị khóa index, cần phối hợp DBA tối ưu lại câu query aggregation.',
                    status: 'Approved',
                    createdAt: '2026-08-19'
                },
                {
                    id: 3,
                    taskId: 103,
                    task: 'Khảo sát quy trình DoR / DoD các phòng ban vận hành',
                    requester: 'Nguyễn Tuấn Bùi',
                    dept: 'Phòng Marketing',
                    currentDueDate: '2026-09-15',
                    newDueDate: '2026-09-22',
                    reason: 'Bận công tác đột xuất 2 ngày.',
                    status: 'Rejected',
                    rejectReason: 'Cần bàn giao lại cho nhân sự dự phòng, không lùi tiến độ dự án.',
                    createdAt: '2026-09-02'
                }
            ];
            saveExtensions(defaults);
        }
    }

    initDefaultExtensions();

    // 2. DOM ELEMENTS
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('extension-search');
    const tableBody = document.getElementById('extension-body');
    const visibleCount = document.getElementById('visible-count');
    const createButton = document.getElementById('btn-create-extension');

    // 3. RENDER FUNCTION
    function renderExtensions() {
        const extensions = getExtensions();
        const selectedStatus = statusFilter ? statusFilter.value.toLowerCase() : 'all';
        const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';

        tableBody.innerHTML = '';
        let count = 0;

        const filtered = extensions.filter(item => {
            const itemStatus = (item.status || 'pending').toLowerCase();
            const matchStatus = selectedStatus === 'all' || itemStatus === selectedStatus;

            const textToSearch = `${item.task || ''} ${item.requester || ''} ${item.reason || ''} ${item.dept || ''}`.toLowerCase();
            const matchSearch = !searchText || textToSearch.includes(searchText);

            return matchStatus && matchSearch;
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #8c8c8c;">
                        <i class="fa-solid fa-inbox" style="font-size: 24px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
                        Không tìm thấy yêu cầu gia hạn nào phù hợp.
                    </td>
                </tr>
            `;
            if (visibleCount) visibleCount.textContent = '0';
            return;
        }

        filtered.forEach(item => {
            count++;
            const tr = document.createElement('tr');
            tr.dataset.status = (item.status || 'pending').toLowerCase();
            tr.dataset.id = item.id;

            // Status Badge Formatter
            let badgeClass = 'status-pending';
            let badgeText = 'Chờ duyệt';
            const sLower = (item.status || '').toLowerCase();
            if (sLower === 'approved') {
                badgeClass = 'status-approved';
                badgeText = 'Đã duyệt';
            } else if (sLower === 'rejected') {
                badgeClass = 'status-rejected';
                badgeText = 'Từ chối';
            }

            // Action Buttons Formatter
            let actionBtnsHtml = '';
            if (sLower === 'pending') {
                actionBtnsHtml += `
                    <button class="btn-action btn-approve" data-id="${item.id}" title="Duyệt yêu cầu (Cập nhật hạn chót & xóa cờ Overdue)">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button class="btn-action btn-reject" data-id="${item.id}" title="Từ chối yêu cầu">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                `;
            }

            actionBtnsHtml += `
                <button class="btn-action btn-delete" data-id="${item.id}" title="Xóa yêu cầu">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            // Reason cell with rejectReason note if available
            let reasonDisplay = item.reason || '---';
            if (sLower === 'rejected' && item.rejectReason) {
                reasonDisplay += `<br><small style="color: #cf1322; font-style: italic;"><i class="fa-solid fa-circle-exclamation"></i> Lý do từ chối: ${item.rejectReason}</small>`;
            }

            tr.innerHTML = `
                <td class="task-name">
                    <div>${item.task || 'Chưa đặt tên'}</div>
                    <small style="color: #8c8c8c;">Mã YC: #EXT-${item.id}</small>
                </td>
                <td>
                    <strong>${item.requester || '---'}</strong>
                    <div style="font-size: 12px; color: #8c8c8c;">${item.dept || 'Phòng ban'}</div>
                </td>
                <td style="white-space: nowrap;">${item.currentDueDate || '---'}</td>
                <td class="new-deadline">${item.newDueDate || '---'}</td>
                <td class="reason-cell">${reasonDisplay}</td>
                <td>
                    <span class="status-badge ${badgeClass}">${badgeText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${actionBtnsHtml}
                    </div>
                </td>
            `;

            tableBody.appendChild(tr);
        });

        if (visibleCount) visibleCount.textContent = count;
    }

    // 4. FILTER LISTENERS
    if (statusFilter) statusFilter.addEventListener('change', renderExtensions);
    if (searchInput) searchInput.addEventListener('input', renderExtensions);

    // 5. TABLE ACTIONS HANDLER (APPROVE, REJECT, DELETE)
    tableBody.addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        const id = parseInt(btn.dataset.id, 10);
        if (!id) return;

        const extensions = getExtensions();
        const ext = extensions.find(x => x.id === id);
        if (!ext) return;

        // --- DUYỆT YÊU CẦU ---
        if (btn.classList.contains('btn-approve')) {
            const confirmMsg = `Bạn có chắc chắn muốn DUYỆT yêu cầu gia hạn cho:\n"${ext.task}"\n\nHạn mới: ${ext.newDueDate}\n(Hệ thống sẽ tự động cập nhật hạn chót và hủy cờ Quá hạn trên Task)?`;
            if (!confirm(confirmMsg)) return;

            ext.status = 'Approved';
            ext.approvedAt = new Date().toISOString();

            // Cập nhật ngày dueDate trong etrms_tasks & reset isOverdue
            const tasks = getTasks();
            const task = tasks.find(t => t.id === ext.taskId || t.title === ext.task);
            if (task) {
                task.dueDate = ext.newDueDate;
                task.isOverdue = false;
                saveTasks(tasks);
            }

            saveExtensions(extensions);
            renderExtensions();

            if (window.showToast) {
                window.showToast(`Đã duyệt gia hạn thành công! Hạn chót của task đã dời sang ${ext.newDueDate}.`, 'success');
            } else {
                alert(`Đã duyệt gia hạn thành công! Hạn chót của task đã dời sang ${ext.newDueDate}.`);
            }
        }

        // --- TỪ CHỐI YÊU CẦU ---
        if (btn.classList.contains('btn-reject')) {
            const reason = prompt(`Nhập lý do từ chối gia hạn cho task:\n"${ext.task}"`, 'Yêu cầu ưu tiên bàn giao đúng tiến độ cam kết.');
            if (reason === null) return; // Bấm Cancel

            ext.status = 'Rejected';
            ext.rejectReason = reason.trim() || 'Không chấp thuận gia hạn';
            ext.rejectedAt = new Date().toISOString();

            saveExtensions(extensions);
            renderExtensions();

            if (window.showToast) {
                window.showToast('Đã từ chối yêu cầu gia hạn.', 'warning');
            } else {
                alert('Đã từ chối yêu cầu gia hạn.');
            }
        }

        // --- XÓA YÊU CẦU ---
        if (btn.classList.contains('btn-delete')) {
            if (!confirm(`Bạn có chắc chắn muốn xóa yêu cầu gia hạn #${ext.id}?`)) return;

            const updated = extensions.filter(x => x.id !== id);
            saveExtensions(updated);
            renderExtensions();

            if (window.showToast) {
                window.showToast('Đã xóa yêu cầu gia hạn thành công.', 'info');
            }
        }
    });

    // 6. XIN GIA HẠN MODAL CONTROLLER
    if (createButton) {
        createButton.addEventListener('click', function () {
            const tasks = getTasks();
            const activeTasks = tasks.filter(t => t.status !== 'DONE');

            if (activeTasks.length === 0) {
                alert('Hiện không có công việc nào đang thực hiện cần gia hạn!');
                return;
            }

            let taskOptionsHtml = activeTasks.map(t => `
                <option value="${t.id}" data-due="${t.dueDate || ''}" data-assignee="${t.assignee || ''}" data-dept="${t.department || ''}">
                    [${t.code || t.id}] ${t.title} (${t.assignee || 'Chưa gán'})
                </option>
            `).join('');

            const firstTask = activeTasks[0];
            const formHtml = `
                <form id="form-create-extension" style="display: flex; flex-direction: column; gap: 14px; text-align: left;">
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #262626;">
                            Công việc cần gia hạn <span style="color: #ff4d4f;">*</span>
                        </label>
                        <select id="ext-task-select" class="form-control" style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 6px;">
                            ${taskOptionsHtml}
                        </select>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #262626;">
                                Người yêu cầu
                            </label>
                            <input type="text" id="ext-requester" value="${firstTask.assignee || 'Khải Trần Văn'}" class="form-control"
                                style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fafafa;" />
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #262626;">
                                Phòng ban
                            </label>
                            <input type="text" id="ext-dept" value="${firstTask.department || 'Phòng CNTT'}" class="form-control"
                                style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fafafa;" />
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #262626;">
                                Hạn chót hiện tại
                            </label>
                            <input type="text" id="ext-cur-due" value="${firstTask.dueDate || 'Chưa đặt'}" readonly
                                style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 6px; background: #f5f5f5; color: #595959;" />
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #262626;">
                                Hạn đề xuất mới <span style="color: #ff4d4f;">*</span>
                            </label>
                            <input type="date" id="ext-new-due" class="form-control" required
                                style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 6px;" />
                        </div>
                    </div>

                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #262626;">
                            Lý do xin gia hạn <span style="color: #ff4d4f;">*</span>
                        </label>
                        <textarea id="ext-reason" rows="3" placeholder="Nêu rõ nguyên nhân phát sinh, phụ thuộc kỹ thuật hoặc thay đổi yêu cầu..." required
                            style="width: 100%; padding: 8px 10px; border: 1px solid #d9d9d9; border-radius: 6px; font-family: inherit; font-size: 13px; box-sizing: border-box;"></textarea>
                    </div>
                </form>
            `;

            if (typeof openModal === 'function') {
                openModal('Tạo Yêu cầu Xin gia hạn Công việc', formHtml, function () {
                    const taskSelect = document.getElementById('ext-task-select');
                    const selectedTaskId = parseInt(taskSelect.value, 10);
                    const selectedOption = taskSelect.options[taskSelect.selectedIndex];
                    const taskTitle = selectedOption ? selectedOption.text.split('] ')[1] || selectedOption.text : '';

                    const requester = document.getElementById('ext-requester').value.trim();
                    const dept = document.getElementById('ext-dept').value.trim();
                    const curDue = document.getElementById('ext-cur-due').value;
                    const newDue = document.getElementById('ext-new-due').value;
                    const reason = document.getElementById('ext-reason').value.trim();

                    if (!newDue || !reason) {
                        alert('Vui lòng nhập ngày gia hạn mới và lý do xin gia hạn!');
                        return;
                    }

                    if (curDue && curDue !== 'Chưa đặt' && newDue <= curDue) {
                        alert('Hạn đề xuất mới phải sau ngày hạn chót hiện tại (' + curDue + ')!');
                        return;
                    }

                    const extensions = getExtensions();
                    const nextId = extensions.length > 0 ? Math.max(...extensions.map(x => x.id)) + 1 : 1;

                    const newExt = {
                        id: nextId,
                        taskId: selectedTaskId,
                        task: taskTitle,
                        requester: requester || 'Nhân sự phụ trách',
                        dept: dept || 'Phòng ban',
                        currentDueDate: curDue,
                        newDueDate: newDue,
                        reason: reason,
                        status: 'Pending',
                        createdAt: new Date().toISOString().split('T')[0]
                    };

                    extensions.unshift(newExt);
                    saveExtensions(extensions);

                    if (typeof closeModal === 'function') closeModal();
                    renderExtensions();

                    if (window.showToast) {
                        window.showToast(`Đã gửi yêu cầu gia hạn cho task "${taskTitle}" thành công!`, 'success');
                    } else {
                        alert('Đã gửi yêu cầu gia hạn thành công!');
                    }
                });

                // Auto-sync Task fields on select change
                setTimeout(() => {
                    const taskSelect = document.getElementById('ext-task-select');
                    if (taskSelect) {
                        taskSelect.addEventListener('change', function () {
                            const opt = this.options[this.selectedIndex];
                            const curDueInput = document.getElementById('ext-cur-due');
                            const reqInput = document.getElementById('ext-requester');
                            const deptInput = document.getElementById('ext-dept');

                            if (curDueInput) curDueInput.value = opt.dataset.due || 'Chưa đặt';
                            if (reqInput && opt.dataset.assignee) reqInput.value = opt.dataset.assignee;
                            if (deptInput && opt.dataset.dept) deptInput.value = opt.dataset.dept;
                        });
                    }
                }, 100);
            } else {
                alert('Không thể mở modal. Vui lòng tải lại trang!');
            }
        });
    }

    // 7. INITIAL RENDER
    renderExtensions();
});
