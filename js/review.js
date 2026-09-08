/**
 * REVIEW & QA GATEWAY WORKFLOW JAVASCRIPT (js/review.js)
 * Enterprise Acceptance Testing & QA Verification Engine
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. DATA ACCESS & STORAGE
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

    // Đảm bảo có dữ liệu mẫu cho review nếu chưa có
    function seedReviewMetadataIfEmpty() {
        const tasks = getTasks();
        let changed = false;

        tasks.forEach(t => {
            if (!t.reviewHistory) {
                t.reviewHistory = [
                    { action: 'Khởi tạo công việc', by: 'Hệ thống', time: t.dueDate ? `${t.dueDate} 08:00` : '2026-08-01 08:00' }
                ];
                changed = true;
            }

            // Gán proofUrl và reviewer cho task mẫu IN_REVIEW và DONE
            if (t.status === 'IN_REVIEW' && !t.proofUrl) {
                t.proofUrl = 'https://github.com/namviet-corp/etrms/pull/105';
                t.reviewer = 'Hoàng Nam (QA)';
                changed = true;
            }

            if (t.status === 'DONE' && !t.reviewStatus) {
                t.reviewStatus = 'APPROVED';
                t.reviewer = 'Phan Văn Khánh (PM)';
                t.proofUrl = t.proofUrl || 'https://figma.com/file/etrms-dashboard-spec';
                changed = true;
            }
        });

        if (changed) {
            saveTasks(tasks);
        }
    }

    seedReviewMetadataIfEmpty();

    // 2. DOM ELEMENTS
    const searchInput = document.getElementById('review-search');
    const statusFilter = document.getElementById('status-filter');
    const projectFilter = document.getElementById('project-filter');
    const tableBody = document.getElementById('review-body');
    const emptyReview = document.getElementById('empty-review');

    // 3. POPULATE PROJECT FILTER
    function populateProjectFilter(tasks) {
        if (!projectFilter) return;
        const currentVal = projectFilter.value;
        const projects = Array.from(new Set(tasks.map(t => t.project).filter(Boolean)));

        let optionsHtml = '<option value="all">Tất cả dự án</option>';
        projects.forEach(p => {
            optionsHtml += `<option value="${p}">${p}</option>`;
        });
        projectFilter.innerHTML = optionsHtml;
        if (projects.includes(currentVal)) {
            projectFilter.value = currentVal;
        }
    }

    // 4. RENDER REVIEW TABLE & STATS
    function renderReviewPage() {
        const allTasks = getTasks();

        // Lọc các task thuộc phạm vi Review: IN_REVIEW, hoặc đã từng review (APPROVED / REJECTED), hoặc DONE
        const reviewScopeTasks = allTasks.filter(t => {
            return t.status === 'IN_REVIEW' || t.reviewStatus === 'APPROVED' || t.reviewStatus === 'REJECTED' || t.status === 'DONE';
        });

        populateProjectFilter(reviewScopeTasks);

        const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedStatus = statusFilter ? statusFilter.value.toLowerCase() : 'all';
        const selectedProject = projectFilter ? projectFilter.value : 'all';

        let total = reviewScopeTasks.length;
        let pendingCount = 0;
        let approvedCount = 0;
        let rejectedCount = 0;

        tableBody.innerHTML = '';
        let visibleCount = 0;

        reviewScopeTasks.forEach(task => {
            // Xác định trạng thái chuẩn hóa: pending | approved | rejected
            let taskStatus = 'pending';
            if (task.reviewStatus === 'APPROVED' || task.status === 'DONE') {
                taskStatus = 'approved';
                approvedCount++;
            } else if (task.reviewStatus === 'REJECTED') {
                taskStatus = 'rejected';
                rejectedCount++;
            } else {
                taskStatus = 'pending';
                pendingCount++;
            }

            // Kiểm tra bộ lọc
            const matchStatus = selectedStatus === 'all' || taskStatus === selectedStatus;
            const matchProject = selectedProject === 'all' || task.project === selectedProject;
            const searchHaystack = `${task.title || ''} ${task.code || ''} ${task.assignee || ''} ${task.reviewer || ''} ${task.project || ''}`.toLowerCase();
            const matchSearch = !searchText || searchHaystack.includes(searchText);

            if (matchStatus && matchProject && matchSearch) {
                visibleCount++;

                // Tính toán DoD
                const dodTotal = task.dodTotal || 4;
                const dodDone = task.dodDone !== undefined ? task.dodDone : (task.status === 'DONE' ? dodTotal : 0);
                const dodPercent = Math.round((dodDone / dodTotal) * 100);
                const isDodComplete = dodPercent === 100;

                // Avatar initials
                const empInitials = (task.assignee || 'NV').split(' ').map(w => w[0]).join('').slice(-2).toUpperCase();
                const qaInitials = (task.reviewer || 'QA').split(' ').map(w => w[0]).join('').slice(-2).toUpperCase();

                // Status badge
                let badgeClass = 'status-pending';
                let badgeText = 'Chờ duyệt';
                if (taskStatus === 'approved') {
                    badgeClass = 'status-approved';
                    badgeText = 'Đã duyệt';
                } else if (taskStatus === 'rejected') {
                    badgeClass = 'status-rejected';
                    badgeText = 'Từ chối';
                }

                // Action buttons
                let actionBtnsHtml = '';
                if (taskStatus === 'pending') {
                    actionBtnsHtml = `
                        <button class="btn-review btn-pass" data-id="${task.id}" title="Phê duyệt hoàn thành">
                            <i class="fa-solid fa-check"></i> Pass
                        </button>
                        <button class="btn-review btn-reject" data-id="${task.id}" title="Từ chối / Trả về làm lại">
                            <i class="fa-solid fa-xmark"></i> Reject
                        </button>
                    `;
                } else if (taskStatus === 'approved') {
                    actionBtnsHtml = `
                        <button class="btn-review btn-disabled" disabled>
                            <i class="fa-solid fa-check"></i> Đã duyệt
                        </button>
                    `;
                } else {
                    actionBtnsHtml = `
                        <button class="btn-review btn-disabled" disabled>
                            <i class="fa-solid fa-xmark"></i> Đã từ chối
                        </button>
                    `;
                }

                const tr = document.createElement('tr');
                tr.dataset.id = task.id;
                tr.dataset.status = taskStatus;
                tr.dataset.project = task.project;

                tr.innerHTML = `
                    <td>
                        <div class="task-info">
                            <span class="task-title">${task.title || 'Công việc không tên'}</span>
                            <span class="task-code">${task.code || 'TASK-' + task.id}</span>
                        </div>
                    </td>
                    <td>${task.project || 'Chưa phân dự án'}</td>
                    <td>
                        <div class="user-info">
                            <div class="avatar avatar-dev">${empInitials}</div>
                            <span>${task.assignee || 'Chưa gán'}</span>
                        </div>
                    </td>
                    <td>
                        <div class="user-info">
                            <div class="avatar avatar-qa">${qaInitials}</div>
                            <span>${task.reviewer || 'QA Team'}</span>
                        </div>
                    </td>
                    <td class="text-center">
                        <button class="icon-btn btn-proof" data-id="${task.id}" title="Xem bằng chứng">
                            <i class="fa-solid ${task.proofUrl ? 'fa-link' : 'fa-paperclip'}" style="${task.proofUrl ? 'color: #1677ff;' : 'color: #8c8c8c;'}"></i>
                        </button>
                    </td>
                    <td class="text-center">
                        <span class="dod-badge ${isDodComplete ? 'dod-complete' : 'dod-incomplete'}">
                            ${dodPercent}%
                        </span>
                    </td>
                    <td class="status-cell">
                        <span class="status-badge ${badgeClass}">
                            ${badgeText}
                        </span>
                    </td>
                    <td class="text-center">
                        <button class="icon-btn btn-history" data-id="${task.id}" title="Xem lịch sử nghiệm thu">
                            <i class="fa-solid fa-clock-rotate-left"></i>
                        </button>
                    </td>
                    <td>
                        <div class="action-buttons">
                            ${actionBtnsHtml}
                        </div>
                    </td>
                `;

                tableBody.appendChild(tr);
            }
        });

        // Cập nhật thống kê
        document.getElementById('total-count').textContent = total;
        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('approved-count').textContent = approvedCount;
        document.getElementById('rejected-count').textContent = rejectedCount;

        // Xử lý thông báo rỗng
        if (visibleCount === 0) {
            emptyReview.classList.remove('hidden');
        } else {
            emptyReview.classList.add('hidden');
        }
    }

    // 5. EVENT LISTENERS FILTER
    if (searchInput) searchInput.addEventListener('input', renderReviewPage);
    if (statusFilter) statusFilter.addEventListener('change', renderReviewPage);
    if (projectFilter) projectFilter.addEventListener('change', renderReviewPage);

    // 6. ACTION DISPATCHER (PASS, REJECT, PROOF, HISTORY)
    tableBody.addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        const taskId = parseInt(btn.dataset.id, 10);
        if (!taskId) return;

        const tasks = getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // --- PHÊ DUYỆT (PASS) ---
        if (btn.classList.contains('btn-pass')) {
            const confirmPass = confirm(`Bạn có chắc chắn muốn PHÊ DUYỆT công việc [${task.code || task.id}]:\n"${task.title}"?\n\nTask sẽ chính thức chuyển sang trạng thái DONE.`);
            if (!confirmPass) return;

            task.status = 'DONE';
            task.reviewStatus = 'APPROVED';
            task.reviewedAt = new Date().toISOString();
            task.dodDone = task.dodTotal || 4;

            if (!task.reviewHistory) task.reviewHistory = [];
            task.reviewHistory.push({
                action: 'QA/PM nghiệm thu Đạt (Pass) - Chuyển sang DONE',
                by: 'Phan Văn Khánh (PM)',
                time: new Date().toLocaleString('vi-VN')
            });

            saveTasks(tasks);
            renderReviewPage();

            if (window.showToast) {
                window.showToast(`Đã phê duyệt hoàn thành công việc [${task.code}]!`, 'success');
            } else {
                alert(`Đã phê duyệt hoàn thành công việc [${task.code}]!`);
            }
            return;
        }

        // --- TỪ CHỐI (REJECT) ---
        if (btn.classList.contains('btn-reject')) {
            const formHtml = `
                <div style="text-align: left; display: flex; flex-direction: column; gap: 12px;">
                    <p style="font-size: 13px; color: #595959; margin: 0;">
                        Bạn đang từ chối nghiệm thu công việc: <strong>[${task.code || task.id}] ${task.title}</strong>.<br>
                        Vui lòng nhập chi tiết lỗi / yêu cầu chỉnh sửa để trả về cho người thực hiện (<strong>${task.assignee || 'Nhân sự'}</strong>):
                    </p>
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #262626;">
                            Nội dung lỗi (Defect Report) <span style="color: #ff4d4f;">*</span>
                        </label>
                        <textarea id="qa-reject-reason" rows="4" placeholder="Mô tả các tiêu chí DoD chưa đạt, bug phát hiện khi kiểm thử hoặc tài liệu chưa đầy đủ..."
                            style="width: 100%; padding: 8px 10px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 13px; box-sizing: border-box; outline: none;"></textarea>
                    </div>
                </div>
            `;

            if (typeof openModal === 'function') {
                openModal('Từ chối Nghiệm thu & Báo lỗi', formHtml, function () {
                    const reasonInput = document.getElementById('qa-reject-reason');
                    const reason = reasonInput ? reasonInput.value.trim() : '';

                    if (!reason) {
                        alert('Vui lòng nhập lý do từ chối để nhân sự có thông tin sửa chữa!');
                        return;
                    }

                    task.status = 'IN_PROGRESS'; // Trả về làm lại
                    task.reviewStatus = 'REJECTED';
                    task.defectCount = (task.defectCount || 0) + 1;
                    task.defectNote = reason;

                    if (!task.reviewHistory) task.reviewHistory = [];
                    task.reviewHistory.push({
                        action: `Từ chối nghiệm thu: "${reason}" - Trả về IN_PROGRESS`,
                        by: 'Hoàng Nam (QA)',
                        time: new Date().toLocaleString('vi-VN')
                    });

                    saveTasks(tasks);
                    if (typeof closeModal === 'function') closeModal();
                    renderReviewPage();

                    if (window.showToast) {
                        window.showToast(`Đã trả về task [${task.code}] để khắc phục lỗi.`, 'warning');
                    } else {
                        alert(`Đã trả về task [${task.code}] để khắc phục lỗi.`);
                    }
                });
            } else {
                const promptReason = prompt('Nhập lý do từ chối và báo lỗi:', 'DoD chưa đạt tiêu chuẩn kiểm thử.');
                if (promptReason !== null && promptReason.trim()) {
                    task.status = 'IN_PROGRESS';
                    task.reviewStatus = 'REJECTED';
                    task.defectNote = promptReason.trim();
                    saveTasks(tasks);
                    renderReviewPage();
                }
            }
            return;
        }

        // --- XEM BẰNG CHỨNG (PROOF) ---
        if (btn.classList.contains('btn-proof')) {
            const hasProof = !!task.proofUrl;
            const formHtml = `
                <div style="text-align: left; display: flex; flex-direction: column; gap: 14px;">
                    <div>
                        <div style="font-size: 12px; color: #8c8c8c; margin-bottom: 4px;">CÔNG VIỆC</div>
                        <div style="font-size: 14px; font-weight: 600; color: #262626;">[${task.code || task.id}] ${task.title}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #8c8c8c; margin-bottom: 4px;">TIÊU CHUẨN ĐÃ HOÀN THÀNH (DoD)</div>
                        <div style="font-size: 13px; font-weight: 600; color: #52c41a;">
                            <i class="fa-solid fa-circle-check"></i> ${task.dodDone || 0} / ${task.dodTotal || 4} tiêu chí hoàn thành
                        </div>
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #262626;">
                            Liên kết bằng chứng hoàn thành (GitHub PR, Figma, Staging Demo):
                        </label>
                        <div style="display: flex; gap: 8px;">
                            <input type="url" id="modal-proof-url" value="${task.proofUrl || ''}" placeholder="https://github.com/... hoặc https://figma.com/..."
                                style="flex: 1; height: 38px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 13px;" />
                            ${hasProof ? `
                                <a href="${task.proofUrl}" target="_blank" rel="noopener noreferrer"
                                    style="height: 38px; line-height: 38px; padding: 0 14px; background: #1677ff; color: #fff; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Mở link
                                </a>
                            ` : ''}
                        </div>
                    </div>
                    ${task.defectNote ? `
                        <div style="background: #fff1f0; border: 1px solid #ffa39e; padding: 10px 12px; border-radius: 6px; font-size: 12px; color: #cf1322;">
                            <strong><i class="fa-solid fa-triangle-exclamation"></i> Ghi chú lỗi trước đó:</strong><br>
                            ${task.defectNote}
                        </div>
                    ` : ''}
                </div>
            `;

            if (typeof openModal === 'function') {
                openModal('Bằng chứng Hoàn thành & Tiêu chuẩn DoD', formHtml, function () {
                    const newUrl = document.getElementById('modal-proof-url').value.trim();
                    if (newUrl && !newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
                        alert('URL bằng chứng phải bắt đầu bằng http:// hoặc https://');
                        return;
                    }
                    task.proofUrl = newUrl;
                    saveTasks(tasks);
                    if (typeof closeModal === 'function') closeModal();
                    renderReviewPage();
                    if (window.showToast) window.showToast('Đã cập nhật liên kết bằng chứng thành công!', 'success');
                });
            }
            return;
        }

        // --- XEM LỊCH SỬ (HISTORY) ---
        if (btn.classList.contains('btn-history')) {
            const history = task.reviewHistory || [
                { action: 'Tạo công việc', by: 'Hệ thống', time: task.dueDate || 'Hôm nay' }
            ];

            let historyItemsHtml = history.map(h => `
                <div style="display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: #1677ff; margin-top: 6px; flex-shrink: 0;"></div>
                    <div style="flex: 1;">
                        <div style="font-size: 13px; font-weight: 600; color: #262626;">${h.action}</div>
                        <div style="font-size: 12px; color: #8c8c8c; margin-top: 2px;">
                            Thực hiện bởi: <strong>${h.by}</strong> • <i class="fa-regular fa-clock"></i> ${h.time}
                        </div>
                    </div>
                </div>
            `).join('');

            const contentHtml = `
                <div style="text-align: left; max-height: 360px; overflow-y: auto;">
                    <div style="margin-bottom: 12px; font-size: 13px; color: #595959;">
                        Lịch sử luồng kiểm tra & phê duyệt của: <strong>[${task.code || task.id}] ${task.title}</strong>
                    </div>
                    <div>
                        ${historyItemsHtml}
                    </div>
                </div>
            `;

            if (typeof openModal === 'function') {
                openModal('Lịch sử Nghiệm thu & Phê duyệt', contentHtml, function () {
                    if (typeof closeModal === 'function') closeModal();
                });
            }
            return;
        }
    });

    // 7. INITIAL RENDER
    renderReviewPage();
});
