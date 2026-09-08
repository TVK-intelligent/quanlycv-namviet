/**
 * KANBAN WORKSPACE JAVASCRIPT (js/kanban.js)
 * Enterprise Task Management & Realtime Drag-Drop Board
 */

(function() {
    'use strict';

    // 1. DATA INITIALIZATION & LOCALSTORAGE ACCESS
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

    function initDefaultTasksIfEmpty() {
        const tasks = getTasks();
        if (tasks.length === 0) {
            const defaultTasks = [
                {
                    id: 101,
                    code: 'TASK-101',
                    title: 'Dev Backend API Xác thực người dùng (JWT, OAuth2)',
                    project: 'Triển khai CRM',
                    department: 'Phòng Phát triển',
                    assignee: 'Trần Văn Minh',
                    priority: 'P1',
                    status: 'IN_PROGRESS',
                    estHours: 8,
                    dueDate: '2026-08-25',
                    dodTotal: 4,
                    dodDone: 2
                },
                {
                    id: 102,
                    code: 'TASK-102',
                    title: 'Thiết kế Mockup UI Dashboard & Workspace Jira-like',
                    project: 'Hệ thống ETRMS',
                    department: 'Phòng CNTT',
                    assignee: 'Lê Gia Bách',
                    priority: 'P2',
                    status: 'DONE',
                    estHours: 16,
                    dueDate: '2026-08-05',
                    dodTotal: 5,
                    dodDone: 5
                },
                {
                    id: 103,
                    code: 'TASK-103',
                    title: 'Khảo sát quy trình DoR / DoD các phòng ban vận hành',
                    project: 'Hệ thống Nội bộ',
                    department: 'Phòng Marketing',
                    assignee: 'Nguyễn Tuấn Bùi',
                    priority: 'P3',
                    status: 'TO_DO',
                    estHours: 12,
                    dueDate: '2026-09-15',
                    dodTotal: 3,
                    dodDone: 0
                },
                {
                    id: 104,
                    code: 'TASK-104',
                    title: 'Fix Bug #104: Lỗi timeout API khi export báo cáo Excel',
                    project: 'Triển khai CRM',
                    department: 'Phòng Phát triển',
                    assignee: 'Trần Văn Minh',
                    priority: 'P1',
                    status: 'BLOCKED',
                    estHours: 4,
                    dueDate: '2026-08-20',
                    dodTotal: 2,
                    dodDone: 1
                },
                {
                    id: 105,
                    code: 'TASK-105',
                    title: 'Kiểm thử Release Module Quản lý Nhân sự & WSI',
                    project: 'Hệ thống ETRMS',
                    department: 'Phòng Kiểm thử',
                    assignee: 'Hoàng Nam',
                    priority: 'P2',
                    status: 'IN_REVIEW',
                    estHours: 10,
                    dueDate: '2026-09-10',
                    dodTotal: 4,
                    dodDone: 4
                },
                {
                    id: 106,
                    code: 'TASK-106',
                    title: 'Xây dựng trang Yêu cầu Mượn Nhân lực Resource Request',
                    project: 'Hệ thống ETRMS',
                    department: 'Phòng Phát triển',
                    assignee: 'Lê Gia Bách',
                    priority: 'P2',
                    status: 'TO_DO',
                    estHours: 14,
                    dueDate: '2026-09-18',
                    dodTotal: 4,
                    dodDone: 1
                }
            ];
            saveTasks(defaultTasks);
        }
    }

    // 2. STATE & FILTERS
    let currentFilters = {
        search: '',
        project: 'ALL',
        priority: 'ALL',
        assignee: 'ALL'
    };

    const STATUS_MAP = {
        'TO_DO': { colId: 'col-cards-todo', countId: 'count-todo', label: 'Cần làm' },
        'IN_PROGRESS': { colId: 'col-cards-inprogress', countId: 'count-inprogress', label: 'Đang làm' },
        'BLOCKED': { colId: 'col-cards-blocked', countId: 'count-blocked', label: 'Bị nghẽn' },
        'IN_REVIEW': { colId: 'col-cards-inreview', countId: 'count-inreview', label: 'Nghiệm thu' },
        'DONE': { colId: 'col-cards-done', countId: 'count-done', label: 'Hoàn thành' }
    };

    // 3. RENDER FUNCTION
    function renderBoard() {
        const allTasks = getTasks();
        const todayStr = new Date().toISOString().split('T')[0];

        // Lọc danh sách theo currentFilters
        const filteredTasks = allTasks.filter(task => {
            if (currentFilters.search) {
                const q = currentFilters.search.toLowerCase();
                const matchTitle = (task.title || '').toLowerCase().includes(q);
                const matchCode = (task.code || '').toLowerCase().includes(q);
                if (!matchTitle && !matchCode) return false;
            }
            if (currentFilters.project !== 'ALL' && task.project !== currentFilters.project) {
                return false;
            }
            if (currentFilters.priority !== 'ALL' && task.priority !== currentFilters.priority) {
                return false;
            }
            if (currentFilters.assignee !== 'ALL' && task.assignee !== currentFilters.assignee) {
                return false;
            }
            return true;
        });

        // Reset all columns
        Object.keys(STATUS_MAP).forEach(statusKey => {
            const container = document.getElementById(STATUS_MAP[statusKey].colId);
            const countEl = document.getElementById(STATUS_MAP[statusKey].countId);
            if (container) container.innerHTML = '';
            if (countEl) countEl.textContent = '0';
        });

        // Group tasks by status
        const counts = { TO_DO: 0, IN_PROGRESS: 0, BLOCKED: 0, IN_REVIEW: 0, DONE: 0 };

        filteredTasks.forEach(task => {
            const statusKey = task.status || 'TO_DO';
            const statusConfig = STATUS_MAP[statusKey] || STATUS_MAP.TO_DO;
            counts[statusKey] = (counts[statusKey] || 0) + 1;

            const container = document.getElementById(statusConfig.colId);
            if (container) {
                const card = createCardElement(task, todayStr);
                container.appendChild(card);
            }
        });

        // Update counts
        Object.keys(counts).forEach(statusKey => {
            const countEl = document.getElementById(STATUS_MAP[statusKey]?.countId);
            if (countEl) countEl.textContent = counts[statusKey];
        });

        // Populate dynamic filter dropdowns
        populateFilterDropdowns(allTasks);
    }

    function createCardElement(task, todayStr) {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.draggable = true;
        card.dataset.taskId = task.id;

        const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'DONE';
        const priorityClass = 'p-' + (task.priority || 'p3').toLowerCase();
        const initial = (task.assignee || 'U').trim().split(' ').pop().substring(0, 2).toUpperCase();

        const dodTotal = task.dodTotal || 4;
        const dodDone = task.dodDone !== undefined ? task.dodDone : (task.status === 'DONE' ? dodTotal : 1);

        card.innerHTML = `
            <div class="kanban-card-top">
                <span class="kanban-card-code">${task.code || 'TASK-' + task.id}</span>
                <span class="priority-badge ${priorityClass}">${task.priority || 'P3'}</span>
            </div>
            <div class="kanban-card-title">${escapeHtml(task.title || 'Công việc không tên')}</div>
            <div class="kanban-card-project" title="${escapeHtml(task.project || 'Chung')}">
                <i class="fa-solid fa-folder" style="margin-right: 4px; font-size: 10px;"></i>${escapeHtml(task.project || 'Dự án chung')}
            </div>
            ${task.status === 'BLOCKED' && task.blockedReason ? `
                <div style="margin-top: 6px; padding: 4px 8px; background: #fff1f0; border: 1px solid #ffa39e; border-radius: 4px; font-size: 11px; color: #cf1322; line-height: 1.3;">
                    <i class="fa-solid fa-triangle-exclamation"></i> <strong>Nghẽn:</strong> ${escapeHtml(task.blockedReason)}
                </div>
            ` : ''}
            <div class="kanban-card-footer">
                <div class="kanban-card-meta">
                    <span class="kanban-dod-badge" title="Tiêu chí DoD hoàn thành: ${dodDone}/${dodTotal}">
                        <i class="fa-solid fa-list-check"></i> ${dodDone}/${dodTotal}
                    </span>
                    ${task.proofUrl ? `
                        <span style="color: #1677ff; font-size: 11px;" title="Bằng chứng: ${escapeHtml(task.proofUrl)}">
                            <i class="fa-solid fa-link"></i>
                        </span>
                    ` : ''}
                    <span class="kanban-date-badge ${isOverdue ? 'overdue' : ''}" title="${isOverdue ? 'Đã quá hạn!' : 'Hạn hoàn thành'}">
                        <i class="fa-regular fa-clock"></i> ${formatDate(task.dueDate)}
                    </span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <div class="kanban-avatar" title="${escapeHtml(task.assignee || 'Chưa gán')}">${initial}</div>
                    <button class="kanban-card-menu-btn" title="Tùy chọn" onclick="window.handleCardAction(event, ${task.id})">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                </div>
            </div>
        `;

        // Drag events on card
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);

        return card;
    }

    // 4. DRAG AND DROP HANDLERS
    let draggedTaskId = null;

    function handleDragStart(e) {
        draggedTaskId = this.dataset.taskId;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedTaskId);
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedTaskId = null;
        document.querySelectorAll('.kanban-col').forEach(col => col.classList.remove('drag-over'));
    }

    function initDragDropListeners() {
        const columns = document.querySelectorAll('.kanban-col');

        columns.forEach(col => {
            col.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                this.classList.add('drag-over');
            });

            col.addEventListener('dragleave', function() {
                this.classList.remove('drag-over');
            });

            col.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');

                const targetStatus = this.dataset.status;
                const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;

                if (taskId && targetStatus) {
                    updateTaskStatus(parseInt(taskId, 10), targetStatus);
                }
            });
        });
    }

    function commitStatusChange(task, newStatus, tasks) {
        task.status = newStatus;

        if (newStatus === 'DONE') {
            task.dodDone = task.dodTotal || 4;
            task.isOverdue = false;
            task.reviewStatus = 'APPROVED';
        }

        saveTasks(tasks);
        renderBoard();

        if (window.showToast) {
            window.showToast(`Đã chuyển [${task.code || 'Task'}] sang [${STATUS_MAP[newStatus]?.label || newStatus}]`, 'success');
        }
    }

    function updateTaskStatus(taskId, newStatus) {
        const tasks = getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        if (task.status === newStatus) return;

        // ==========================================
        // CỔNG 1: TO_DO -> IN_PROGRESS (DoR GATE)
        // ==========================================
        if (newStatus === 'IN_PROGRESS' && task.status === 'TO_DO' && !task.dorReady) {
            const formHtml = `
                <div style="text-align: left; display: flex; flex-direction: column; gap: 14px;">
                    <div style="font-size: 13px; color: #595959;">
                        Để bắt đầu thực hiện (<strong>IN_PROGRESS</strong>), công việc <strong>[${task.code || task.id}] ${escapeHtml(task.title)}</strong> cần thỏa mãn các tiêu chuẩn sẵn sàng (Definition of Ready - DoR):
                    </div>
                    <div style="background: #f6ffed; border: 1px solid #b7eb8f; padding: 12px; border-radius: 6px; display: flex; flex-direction: column; gap: 10px;">
                        <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #262626; cursor: pointer;">
                            <input type="checkbox" id="dor-cb-1" checked style="margin-top: 2px;" />
                            <span><strong>Mục tiêu & Nghiệp vụ (Acceptance Criteria):</strong> Đã có mô tả chi tiết, tiêu chí nghiệm thu rõ ràng.</span>
                        </label>
                        <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #262626; cursor: pointer;">
                            <input type="checkbox" id="dor-cb-2" checked style="margin-top: 2px;" />
                            <span><strong>Tài nguyên & Môi trường:</strong> Đã có tài liệu API/Mockup, quyền truy cập hệ thống đã được cấp.</span>
                        </label>
                        <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #262626; cursor: pointer;">
                            <input type="checkbox" id="dor-cb-3" checked style="margin-top: 2px;" />
                            <span><strong>Ước lượng thời gian:</strong> Đã chốt số giờ dự kiến (${task.estHours || 8}h) và hạn hoàn thành khả thi.</span>
                        </label>
                    </div>
                </div>
            `;

            if (typeof openModal === 'function') {
                openModal('Cổng Nghiệm thu Đầu vào (DoR Gateway)', formHtml, function() {
                    const cb1 = document.getElementById('dor-cb-1')?.checked;
                    const cb2 = document.getElementById('dor-cb-2')?.checked;
                    const cb3 = document.getElementById('dor-cb-3')?.checked;
                    if (!cb1 || !cb2 || !cb3) {
                        alert('Vui lòng tích xác nhận đủ 3 điều kiện DoR để bắt đầu công việc!');
                        return;
                    }

                    task.dorReady = true;
                    commitStatusChange(task, 'IN_PROGRESS', tasks);
                    if (typeof closeModal === 'function') closeModal();
                });
                return;
            } else {
                task.dorReady = true;
                commitStatusChange(task, 'IN_PROGRESS', tasks);
                return;
            }
        }

        // ==========================================
        // CỔNG NGHẼN: ANY -> BLOCKED (BLOCKER GATE)
        // ==========================================
        if (newStatus === 'BLOCKED') {
            const formHtml = `
                <div style="text-align: left; display: flex; flex-direction: column; gap: 12px;">
                    <div style="font-size: 13px; color: #595959;">
                        Báo nghẽn cho công việc <strong>[${task.code || task.id}] ${escapeHtml(task.title)}</strong> để PM và các bên liên quan cùng hỗ trợ xử lý:
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #cf1322;">
                            Nguyên nhân bị nghẽn (Blocker Reason) <span style="color: #ff4d4f;">*</span>
                        </label>
                        <textarea id="modal-blocker-reason" rows="3" placeholder="Ví dụ: Chờ bên thứ ba cấp API key, Database server staging bị treo, Thiếu tài liệu spec..."
                            style="width: 100%; padding: 8px 10px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 13px; box-sizing: border-box; outline: none;"></textarea>
                    </div>
                </div>
            `;

            if (typeof openModal === 'function') {
                openModal('Báo cáo Nghẽn tiến độ (Blocked)', formHtml, function() {
                    const reason = document.getElementById('modal-blocker-reason')?.value.trim();
                    if (!reason) {
                        alert('Vui lòng nhập nguyên nhân bị nghẽn!');
                        return;
                    }

                    task.blockedReason = reason;
                    commitStatusChange(task, 'BLOCKED', tasks);
                    if (typeof closeModal === 'function') closeModal();
                });
                return;
            } else {
                const promptReason = prompt('Nhập nguyên nhân bị nghẽn (Blocker Reason):', 'Đang chờ phụ thuộc từ team đối tác');
                if (promptReason !== null && promptReason.trim()) {
                    task.blockedReason = promptReason.trim();
                    commitStatusChange(task, 'BLOCKED', tasks);
                } else {
                    renderBoard();
                }
                return;
            }
        }

        // ==========================================
        // CỔNG 2: IN_PROGRESS -> IN_REVIEW (DoD & PROOF GATE)
        // ==========================================
        if (newStatus === 'IN_REVIEW') {
            const dodTotal = task.dodTotal || 4;
            const dodDone = task.dodDone !== undefined ? task.dodDone : 0;
            const formHtml = `
                <div style="text-align: left; display: flex; flex-direction: column; gap: 14px;">
                    <div style="font-size: 13px; color: #595959;">
                        Nộp nghiệm thu công việc <strong>[${task.code || task.id}] ${escapeHtml(task.title)}</strong> lên cổng Kiểm tra & Đánh giá (Review / QA):
                    </div>
                    <div style="background: #e6f4ff; border: 1px solid #91caff; padding: 12px; border-radius: 6px;">
                        <div style="font-weight: 600; font-size: 13px; color: #0958d9; margin-bottom: 4px;">
                            <i class="fa-solid fa-list-check"></i> Tiêu chuẩn nghiệm thu DoD:
                        </div>
                        <div style="font-size: 13px; color: #262626;">
                            Đã đạt: <strong>${dodDone} / ${dodTotal} tiêu chí</strong>
                        </div>
                        <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #595959; margin-top: 8px; cursor: pointer;">
                            <input type="checkbox" id="modal-dod-confirm" checked />
                            <span>Xác nhận đã hoàn thành 100% các tiêu chí DoD theo yêu cầu</span>
                        </label>
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #262626;">
                            Liên kết bằng chứng hoàn thành (GitHub PR, Figma, Staging Demo) <span style="color: #ff4d4f;">*</span>
                        </label>
                        <input type="url" id="modal-proof-link" value="${task.proofUrl || ''}" placeholder="https://github.com/... hoặc https://figma.com/..." required
                            style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 13px; box-sizing: border-box;" />
                        <small style="color: #8c8c8c; margin-top: 4px; display: block;">Liên kết phải bắt đầu bằng http:// hoặc https://</small>
                    </div>
                </div>
            `;

            if (typeof openModal === 'function') {
                openModal('Cổng Nghiệm thu (DoD & Proof Gateway)', formHtml, function() {
                    const proofUrl = document.getElementById('modal-proof-link')?.value.trim();
                    const isDodChecked = document.getElementById('modal-dod-confirm')?.checked;

                    if (!proofUrl || (!proofUrl.startsWith('http://') && !proofUrl.startsWith('https://'))) {
                        alert('Vui lòng nhập liên kết bằng chứng hoàn thành hợp lệ (bắt đầu bằng http:// hoặc https://)!');
                        return;
                    }
                    if (!isDodChecked) {
                        alert('Vui lòng hoàn thành các tiêu chí DoD trước khi nộp nghiệm thu!');
                        return;
                    }

                    task.proofUrl = proofUrl;
                    task.dodDone = dodTotal;
                    task.reviewStatus = 'PENDING';
                    commitStatusChange(task, 'IN_REVIEW', tasks);
                    if (typeof closeModal === 'function') closeModal();
                });
                return;
            } else {
                task.proofUrl = task.proofUrl || 'https://github.com/namviet-corp/etrms/pull/' + task.id;
                task.dodDone = dodTotal;
                commitStatusChange(task, 'IN_REVIEW', tasks);
                return;
            }
        }

        // ==========================================
        // CỔNG HOÀN THÀNH: -> DONE
        // ==========================================
        if (newStatus === 'DONE') {
            if (task.status === 'IN_REVIEW') {
                const confirmDone = confirm(`Bạn có chắc chắn muốn đánh dấu hoàn tất và phê duyệt Xong (DONE) cho task [${task.code}]?`);
                if (!confirmDone) {
                    renderBoard();
                    return;
                }
            }
            commitStatusChange(task, 'DONE', tasks);
            return;
        }

        // Chuyển về TO_DO thông thường
        commitStatusChange(task, newStatus, tasks);
    }

    // 5. QUICK ACTIONS POPUP
    window.handleCardAction = function(e, taskId) {
        e.stopPropagation();
        const tasks = getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const actions = [
            { label: 'Chuyển sang Cần làm (TO_DO)', status: 'TO_DO' },
            { label: 'Chuyển sang Đang làm (IN_PROGRESS)', status: 'IN_PROGRESS' },
            { label: 'Báo nghẽn (BLOCKED)', status: 'BLOCKED' },
            { label: 'Nộp nghiệm thu (IN_REVIEW)', status: 'IN_REVIEW' },
            { label: 'Đánh dấu Xong (DONE)', status: 'DONE' }
        ];

        let menuHtml = `<div style="font-weight: 600; margin-bottom: 8px; font-size: 12px; color: #595959;">Chuyển trạng thái:</div>`;
        actions.forEach(a => {
            if (a.status !== task.status) {
                menuHtml += `<div class="kanban-action-opt" onclick="window.quickMoveStatus(${taskId}, '${a.status}')" style="padding: 6px 10px; cursor: pointer; border-radius: 4px; font-size: 12px;">${a.label}</div>`;
            }
        });

        showQuickMenu(e.clientX, e.clientY, menuHtml);
    };

    window.quickMoveStatus = function(taskId, status) {
        closeQuickMenu();
        updateTaskStatus(taskId, status);
    };

    function showQuickMenu(x, y, contentHtml) {
        closeQuickMenu();
        const menu = document.createElement('div');
        menu.id = 'kanban-quick-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${Math.min(x, window.innerWidth - 220)}px;
            top: ${Math.min(y, window.innerHeight - 200)}px;
            background: #ffffff;
            border: 1px solid #d9d9d9;
            box-shadow: 0 4px 14px rgba(0,0,0,0.12);
            border-radius: 6px;
            padding: 8px;
            z-index: 9999;
            min-width: 200px;
        `;
        menu.innerHTML = contentHtml;
        document.body.appendChild(menu);

        // Inject hover style
        menu.querySelectorAll('.kanban-action-opt').forEach(el => {
            el.addEventListener('mouseenter', () => el.style.backgroundColor = '#f0f0f0');
            el.addEventListener('mouseleave', () => el.style.backgroundColor = 'transparent');
        });

        setTimeout(() => {
            document.addEventListener('click', closeQuickMenu, { once: true });
        }, 10);
    }

    function closeQuickMenu() {
        const menu = document.getElementById('kanban-quick-menu');
        if (menu) menu.remove();
    }

    // 6. POPULATE DYNAMIC FILTER DROPDOWNS
    function populateFilterDropdowns(tasks) {
        const projectSelect = document.getElementById('kanban-filter-project');
        const assigneeSelect = document.getElementById('kanban-filter-assignee');

        if (projectSelect && projectSelect.children.length <= 1) {
            const projects = [...new Set(tasks.map(t => t.project).filter(Boolean))];
            projects.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p;
                opt.textContent = p;
                projectSelect.appendChild(opt);
            });
        }

        if (assigneeSelect && assigneeSelect.children.length <= 1) {
            const assignees = [...new Set(tasks.map(t => t.assignee).filter(Boolean))];
            assignees.forEach(a => {
                const opt = document.createElement('option');
                opt.value = a;
                opt.textContent = a;
                assigneeSelect.appendChild(opt);
            });
        }
    }

    // 7. EVENT HANDLERS (SEARCH, FILTERS, MODAL)
    function initEventHandlers() {
        // Search
        const searchInput = document.getElementById('kanban-search');
        if (searchInput) {
            let debounceTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    currentFilters.search = e.target.value.trim();
                    renderBoard();
                }, 200);
            });
        }

        // Project filter
        const projectSelect = document.getElementById('kanban-filter-project');
        if (projectSelect) {
            projectSelect.addEventListener('change', (e) => {
                currentFilters.project = e.target.value;
                renderBoard();
            });
        }

        // Priority filter
        const prioritySelect = document.getElementById('kanban-filter-priority');
        if (prioritySelect) {
            prioritySelect.addEventListener('change', (e) => {
                currentFilters.priority = e.target.value;
                renderBoard();
            });
        }

        // Assignee filter
        const assigneeSelect = document.getElementById('kanban-filter-assignee');
        if (assigneeSelect) {
            assigneeSelect.addEventListener('change', (e) => {
                currentFilters.assignee = e.target.value;
                renderBoard();
            });
        }

        // Modal: Add new Task
        const btnAdd = document.getElementById('btn-add-kanban-task');
        const modal = document.getElementById('modal-create-task');
        const btnClose = document.getElementById('btn-close-task-modal');
        const btnCancel = document.getElementById('btn-cancel-task-modal');
        const form = document.getElementById('form-create-task');

        if (btnAdd && modal) {
            btnAdd.addEventListener('click', () => {
                modal.style.display = 'flex';
                // Set default due date to 7 days ahead
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                const dueInput = document.getElementById('new-task-due');
                if (dueInput) dueInput.value = nextWeek.toISOString().split('T')[0];
            });
        }

        const closeModal = () => { if (modal) modal.style.display = 'none'; };
        if (btnClose) btnClose.addEventListener('click', closeModal);
        if (btnCancel) btnCancel.addEventListener('click', closeModal);

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const tasks = getTasks();
                const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id || 0)) + 1 : 101;

                const newTask = {
                    id: nextId,
                    code: 'TASK-' + nextId,
                    title: document.getElementById('new-task-title').value.trim(),
                    project: document.getElementById('new-task-project').value || 'Dự án chung',
                    department: 'Phòng Phát triển',
                    assignee: document.getElementById('new-task-assignee').value.trim() || 'Lê Gia Bách',
                    priority: document.getElementById('new-task-priority').value || 'P2',
                    status: document.getElementById('new-task-status').value || 'TO_DO',
                    estHours: parseInt(document.getElementById('new-task-hours').value, 10) || 8,
                    dueDate: document.getElementById('new-task-due').value || '',
                    dodTotal: 4,
                    dodDone: 0
                };

                tasks.unshift(newTask);
                saveTasks(tasks);
                closeModal();
                form.reset();
                renderBoard();

                if (window.showToast) {
                    window.showToast(`Đã tạo thành công [${newTask.code}]: ${newTask.title}`, 'success');
                }
            });
        }
    }

    // 8. HELPERS
    function formatDate(dateStr) {
        if (!dateStr) return 'Chưa có hạn';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}`;
        }
        return dateStr;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }

    // BOOTSTRAP
    document.addEventListener('DOMContentLoaded', () => {
        initDefaultTasksIfEmpty();
        renderBoard();
        initDragDropListeners();
        initEventHandlers();
    });

})();
