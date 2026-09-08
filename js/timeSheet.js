/**
 * TIMESHEET WORKSPACE JAVASCRIPT (js/timeSheet.js)
 * Enterprise Daily Work Logging & Weekly Submission Engine
 */

(function () {
    'use strict';

    const TIMESHEET_KEY = 'etrms_timesheet_data';
    const SUBMISSION_KEY = 'etrms_timesheet_submissions';
    const TARGET_HOURS = 40.0;

    let currentWeekMonday = getMonday(new Date());

    // 1. DATE UTILITIES
    function getMonday(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Thứ 2 là ngày bắt đầu tuần
        return new Date(d.setDate(diff));
    }

    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    function formatDateISO(date) {
        return date.toISOString().split('T')[0];
    }

    function formatVietnameseDate(date) {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function getWeekNumber(date) {
        const firstDay = new Date(date.getFullYear(), 0, 1);
        const pastDays = (date - firstDay) / 86400000;
        return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
    }

    function getWeekKey(date) {
        return `${date.getFullYear()}-W${getWeekNumber(date)}`;
    }

    function getWeekDays() {
        return [0, 1, 2, 3, 4, 5, 6].map(offset => addDays(currentWeekMonday, offset));
    }

    // 2. DATA LAYER & SEEDING
    function getTasks() {
        try {
            return JSON.parse(localStorage.getItem('etrms_tasks')) || [];
        } catch (e) {
            return [];
        }
    }

    function getTimesheetData() {
        try {
            const raw = localStorage.getItem(TIMESHEET_KEY);
            if (!raw) {
                const initial = seedInitialTimesheet();
                saveTimesheetData(initial);
                return initial;
            }
            return JSON.parse(raw) || [];
        } catch (e) {
            return [];
        }
    }

    function saveTimesheetData(data) {
        try {
            localStorage.setItem(TIMESHEET_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Lỗi lưu timesheet data:', e);
        }
    }

    function getSubmissions() {
        try {
            return JSON.parse(localStorage.getItem(SUBMISSION_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function saveSubmissions(subs) {
        try {
            localStorage.setItem(SUBMISSION_KEY, JSON.stringify(subs));
        } catch (e) {
            console.error('Lỗi lưu submissions:', e);
        }
    }

    function seedInitialTimesheet() {
        const days = getWeekDays();
        const tasks = getTasks();
        const task1 = tasks[0] || { id: 101, code: 'TASK-101', title: 'Dev Backend API Xác thực', project: 'Triển khai CRM', assignee: 'Trần Văn Minh' };
        const task2 = tasks[1] || { id: 102, code: 'TASK-102', title: 'Thiết kế Mockup UI Dashboard', project: 'Hệ thống ETRMS', assignee: 'Lê Gia Bách' };

        return [
            {
                id: 1,
                taskId: task1.id,
                taskCode: task1.code || 'TASK-101',
                taskTitle: task1.title,
                project: task1.project || 'Triển khai CRM',
                assignee: task1.assignee || 'Khải Trần Văn',
                date: formatDateISO(days[0]), // Thứ 2
                hours: 8,
                description: 'Triển khai module xác thực OAuth2 và phân quyền JWT access token.'
            },
            {
                id: 2,
                taskId: task1.id,
                taskCode: task1.code || 'TASK-101',
                taskTitle: task1.title,
                project: task1.project || 'Triển khai CRM',
                assignee: task1.assignee || 'Khải Trần Văn',
                date: formatDateISO(days[1]), // Thứ 3
                hours: 8,
                description: 'Viết unit test cho các endpoint /auth/login, /auth/refresh và fix bug CORS.'
            },
            {
                id: 3,
                taskId: task2.id,
                taskCode: task2.code || 'TASK-102',
                taskTitle: task2.title,
                project: task2.project || 'Hệ thống ETRMS',
                assignee: task2.assignee || 'Lê Gia Bách',
                date: formatDateISO(days[2]), // Thứ 4
                hours: 8,
                description: 'Hoàn thiện layout chuẩn Kanban Board, tối ưu drag & drop trên mobile.'
            },
            {
                id: 4,
                taskId: task2.id,
                taskCode: task2.code || 'TASK-102',
                taskTitle: task2.title,
                project: task2.project || 'Hệ thống ETRMS',
                assignee: task2.assignee || 'Lê Gia Bách',
                date: formatDateISO(days[3]), // Thứ 5
                hours: 8.5,
                description: 'Họp rà soát tiến độ với PM và kết nối API Timesheet.'
            }
        ];
    }

    // 3. RENDER FUNCTION
    function renderTimesheet() {
        const weekDays = getWeekDays();
        const weekDates = weekDays.map(formatDateISO);
        const weekSunday = weekDays[6];

        // Cập nhật thông tin tiêu đề tuần
        const weekRangeEl = document.getElementById('week-range');
        const weekNumberEl = document.getElementById('week-number');
        if (weekRangeEl) {
            weekRangeEl.textContent = `Tuần từ ${currentWeekMonday.toLocaleDateString('vi-VN')} - ${weekSunday.toLocaleDateString('vi-VN')}`;
        }
        if (weekNumberEl) {
            weekNumberEl.textContent = `Tuần ${getWeekNumber(currentWeekMonday)} / ${currentWeekMonday.getFullYear()}`;
        }

        // Đọc dữ liệu tuần hiện tại
        const allData = getTimesheetData();
        const weekEntries = allData.filter(item => weekDates.includes(item.date));

        // Tính toán KPI
        const totalHours = weekEntries.reduce((sum, item) => sum + (parseFloat(item.hours) || 0), 0);
        const missing = TARGET_HOURS - totalHours;

        const totalHoursEl = document.getElementById('total-hours');
        const missingHoursEl = document.getElementById('missing-hours');
        const missingLabelEl = document.getElementById('missing-label');

        if (totalHoursEl) totalHoursEl.textContent = `${totalHours.toFixed(1)}h`;

        if (missingHoursEl) {
            if (missing > 0) {
                missingHoursEl.textContent = `${missing.toFixed(1)}h`;
                missingHoursEl.style.color = '#d97706'; // amber
                if (missingLabelEl) missingLabelEl.textContent = 'Cần log thêm để đủ chỉ tiêu 40h';
            } else {
                missingHoursEl.textContent = `+${Math.abs(missing).toFixed(1)}h`;
                missingHoursEl.style.color = '#16a34a'; // green
                if (missingLabelEl) missingLabelEl.textContent = 'Đã đạt và vượt chỉ tiêu tuần!';
            }
        }

        // Trạng thái nộp tuần
        const weekKey = getWeekKey(currentWeekMonday);
        const submissions = getSubmissions();
        const subStatusEl = document.getElementById('submission-status');
        const subTimeEl = document.getElementById('submission-time');

        if (submissions[weekKey] && submissions[weekKey].status === 'SUBMITTED') {
            if (subStatusEl) {
                subStatusEl.textContent = 'Đã gửi duyệt';
                subStatusEl.style.color = '#1677ff';
            }
            if (subTimeEl) subTimeEl.textContent = `Nộp lúc: ${submissions[weekKey].submittedAt}`;
        } else {
            if (subStatusEl) {
                subStatusEl.textContent = 'Bản nháp';
                subStatusEl.style.color = '#374151';
            }
            if (subTimeEl) subTimeEl.textContent = 'Chưa nộp phê duyệt';
        }

        // Cập nhật bộ lọc ngày
        updateDateFilterDropdown(weekDays);

        // Cập nhật bộ lọc dự án
        updateProjectFilterDropdown(allData);

        // Render danh sách dòng trong bảng
        renderTableRows(weekEntries);
    }

    function updateDateFilterDropdown(weekDays) {
        const select = document.getElementById('timesheet-date-filter');
        if (!select) return;

        const curVal = select.value;
        let html = '<option value="all">Tất cả ngày trong tuần</option>';

        weekDays.forEach(day => {
            const iso = formatDateISO(day);
            const vnDate = formatVietnameseDate(day);
            html += `<option value="${iso}">${vnDate}</option>`;
        });

        select.innerHTML = html;
        if ([...select.options].some(o => o.value === curVal)) {
            select.value = curVal;
        }
    }

    function updateProjectFilterDropdown(entries) {
        const select = document.getElementById('timesheet-project-filter');
        if (!select) return;

        const curVal = select.value;
        const projects = Array.from(new Set(entries.map(e => e.project).filter(Boolean)));

        let html = '<option value="all">Tất cả dự án</option>';
        projects.forEach(p => {
            html += `<option value="${p}">${p}</option>`;
        });

        select.innerHTML = html;
        if (projects.includes(curVal)) {
            select.value = curVal;
        }
    }

    function renderTableRows(weekEntries) {
        const tbody = document.getElementById('timesheet-body');
        const emptyState = document.getElementById('empty-timesheet');
        if (!tbody) return;

        const searchInput = document.getElementById('timesheet-search');
        const dateFilter = document.getElementById('timesheet-date-filter');
        const projFilter = document.getElementById('timesheet-project-filter');

        const kw = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedDate = dateFilter ? dateFilter.value : 'all';
        const selectedProj = projFilter ? projFilter.value : 'all';

        const filtered = weekEntries.filter(item => {
            const matchKw = !kw ||
                (item.taskTitle || '').toLowerCase().includes(kw) ||
                (item.taskCode || '').toLowerCase().includes(kw) ||
                (item.description || '').toLowerCase().includes(kw) ||
                (item.project || '').toLowerCase().includes(kw);

            const matchDate = selectedDate === 'all' || item.date === selectedDate;
            const matchProj = selectedProj === 'all' || item.project === selectedProj;

            return matchKw && matchDate && matchProj;
        });

        tbody.innerHTML = '';

        if (filtered.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        // Sắp xếp theo ngày tăng dần
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

        filtered.forEach(item => {
            const itemDate = new Date(item.date + 'T00:00:00');
            const dateStr = itemDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const weekdayStr = itemDate.toLocaleDateString('vi-VN', { weekday: 'long' });

            const avatarLetter = (item.assignee || 'U').trim().split(' ').pop().substring(0, 2).toUpperCase();

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="ts-date-cell">${dateStr}</div>
                    <div class="ts-date-sub">${weekdayStr}</div>
                </td>
                <td>
                    <div class="ts-task-cell">
                        <span class="ts-task-code">#${item.taskCode || 'TASK-' + item.taskId}</span>
                        <span class="ts-task-title">${escapeHtml(item.taskTitle || 'Công việc')}</span>
                        <span class="ts-task-project"><i class="fa-solid fa-folder" style="margin-right: 4px;"></i>${escapeHtml(item.project || 'Chung')}</span>
                    </div>
                </td>
                <td>
                    <div class="ts-user-badge">
                        <div class="ts-avatar-circle">${avatarLetter}</div>
                        <span>${escapeHtml(item.assignee || 'Khải Trần')}</span>
                    </div>
                </td>
                <td>
                    <div class="ts-desc-cell">${escapeHtml(item.description || 'Không có mô tả')}</div>
                </td>
                <td style="text-align: center;">
                    <span class="ts-hours-badge">${parseFloat(item.hours).toFixed(1)}h</span>
                </td>
                <td style="text-align: right; padding-right: 20px;">
                    <div class="ts-actions" style="justify-content: flex-end;">
                        <button class="btn-ts-action btn-ts-edit" onclick="window.editTimesheetEntry(${item.id})" title="Chỉnh sửa">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-ts-action btn-ts-delete" onclick="window.deleteTimesheetEntry(${item.id})" title="Xóa">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // 4. MODAL FORM: GHI NHẬN / SỬA THỜI GIAN
    function openTimesheetModal(entryId = null) {
        const isEdit = !!entryId;
        const allData = getTimesheetData();
        const entry = isEdit ? allData.find(e => e.id === entryId) : null;
        const modalTitle = isEdit ? 'Chỉnh sửa Thời gian Làm việc' : 'Ghi nhận Thời gian Làm việc';

        const tasks = getTasks();
        const activeTasks = tasks.length > 0 ? tasks : [
            { id: 101, code: 'TASK-101', title: 'Dev Backend API Xác thực', project: 'Triển khai CRM', assignee: 'Trần Văn Minh' },
            { id: 102, code: 'TASK-102', title: 'Thiết kế Mockup UI Dashboard', project: 'Hệ thống ETRMS', assignee: 'Lê Gia Bách' },
            { id: 103, code: 'TASK-103', title: 'Khảo sát DoR/DoD các phòng ban', project: 'Hệ thống Nội bộ', assignee: 'Nguyễn Tuấn Bùi' }
        ];

        let taskOptionsHtml = activeTasks.map(t => {
            const isSelected = entry ? (entry.taskId === t.id || entry.taskTitle === t.title) : false;
            return `
                <option value="${t.id}" data-code="${t.code || 'TASK-' + t.id}" data-project="${t.project || ''}" data-assignee="${t.assignee || ''}" ${isSelected ? 'selected' : ''}>
                    [${t.code || t.id}] ${t.title} (${t.project || 'Dự án'})
                </option>
            `;
        }).join('');

        const defaultDate = entry ? entry.date : formatDateISO(new Date());

        const formHtml = `
            <form id="ts-entry-form" style="display: flex; flex-direction: column; gap: 14px; text-align: left;">
                <div>
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #262626;">
                        Công việc thực hiện <span style="color: #ff4d4f;">*</span>
                    </label>
                    <select id="ts-task-select" class="form-control" style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 13px;">
                        ${taskOptionsHtml}
                    </select>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #262626;">
                            Ngày làm việc <span style="color: #ff4d4f;">*</span>
                        </label>
                        <input type="date" id="ts-date" value="${defaultDate}" required
                            style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 13px;" />
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #262626;">
                            Số giờ ghi nhận (Hours) <span style="color: #ff4d4f;">*</span>
                        </label>
                        <input type="number" id="ts-hours" value="${entry ? entry.hours : 8}" min="0.5" max="24" step="0.5" required
                            style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 13px;" />
                    </div>
                </div>

                <div>
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #262626;">
                        Nội dung công việc chi tiết <span style="color: #ff4d4f;">*</span>
                    </label>
                    <textarea id="ts-desc" rows="3" placeholder="Mô tả cụ thể các module đã hoàn thành, lỗi đã fix, hoặc nội dung buổi họp..." required
                        style="width: 100%; padding: 8px 10px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 13px; box-sizing: border-box; font-family: inherit;">${entry ? escapeHtml(entry.description) : ''}</textarea>
                </div>
            </form>
        `;

        if (typeof openModal === 'function') {
            openModal(modalTitle, formHtml, function () {
                const taskSelect = document.getElementById('ts-task-select');
                const selectedTaskId = parseInt(taskSelect.value, 10);
                const selectedOpt = taskSelect.options[taskSelect.selectedIndex];

                const dateVal = document.getElementById('ts-date').value;
                const hoursVal = parseFloat(document.getElementById('ts-hours').value);
                const descVal = document.getElementById('ts-desc').value.trim();

                if (!dateVal || isNaN(hoursVal) || hoursVal <= 0 || !descVal) {
                    alert('Vui lòng điền đầy đủ ngày làm việc, số giờ hợp lệ (> 0) và mô tả công việc!');
                    return;
                }

                const rawTitle = selectedOpt ? selectedOpt.text.split('] ')[1] || selectedOpt.text : '';
                const taskTitle = rawTitle.split(' (')[0] || rawTitle;
                const taskCode = selectedOpt ? selectedOpt.dataset.code : 'TASK-' + selectedTaskId;
                const project = selectedOpt ? selectedOpt.dataset.project : 'Triển khai CRM';
                const assignee = selectedOpt ? selectedOpt.dataset.assignee : 'Khải Trần Văn';

                const data = getTimesheetData();

                if (isEdit) {
                    const idx = data.findIndex(e => e.id === entryId);
                    if (idx !== -1) {
                        data[idx] = {
                            ...data[idx],
                            taskId: selectedTaskId,
                            taskCode,
                            taskTitle,
                            project,
                            assignee: assignee || data[idx].assignee,
                            date: dateVal,
                            hours: hoursVal,
                            description: descVal
                        };
                    }
                } else {
                    const nextId = data.length > 0 ? Math.max(...data.map(e => e.id)) + 1 : 1;
                    data.push({
                        id: nextId,
                        taskId: selectedTaskId,
                        taskCode,
                        taskTitle,
                        project,
                        assignee: assignee || 'Khải Trần Văn',
                        date: dateVal,
                        hours: hoursVal,
                        description: descVal
                    });
                }

                saveTimesheetData(data);
                if (typeof closeModal === 'function') closeModal();
                renderTimesheet();

                if (window.showToast) {
                    window.showToast(isEdit ? 'Đã cập nhật nhật ký thời gian thành công!' : 'Đã ghi nhận thời gian làm việc thành công!', 'success');
                } else {
                    alert('Đã lưu thời gian làm việc thành công!');
                }
            });
        } else {
            alert('Không tìm thấy modal component. Vui lòng tải lại trang!');
        }
    }

    // 5. GLOBAL ACTIONS
    window.editTimesheetEntry = function (id) {
        openTimesheetModal(id);
    };

    window.deleteTimesheetEntry = function (id) {
        if (!confirm('Bạn có chắc chắn muốn xóa dòng nhật ký thời gian này?')) return;
        let data = getTimesheetData();
        data = data.filter(e => e.id !== id);
        saveTimesheetData(data);
        renderTimesheet();
        if (window.showToast) window.showToast('Đã xóa dòng nhật ký thời gian thành công.', 'info');
    };

    // 6. EVENT BINDINGS
    document.addEventListener('DOMContentLoaded', function () {
        renderTimesheet();

        // Nút mở modal thêm thời gian
        const btnOpenModal = document.getElementById('btn-open-modal');
        if (btnOpenModal) {
            btnOpenModal.addEventListener('click', () => openTimesheetModal(null));
        }

        // Tuần trước
        const btnPrev = document.getElementById('prev-week');
        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                currentWeekMonday = addDays(currentWeekMonday, -7);
                renderTimesheet();
            });
        }

        // Tuần sau
        const btnNext = document.getElementById('next-week');
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                currentWeekMonday = addDays(currentWeekMonday, 7);
                renderTimesheet();
            });
        }

        // Về tuần hiện tại
        const btnToday = document.getElementById('btn-today');
        if (btnToday) {
            btnToday.addEventListener('click', () => {
                currentWeekMonday = getMonday(new Date());
                renderTimesheet();
            });
        }

        // Filter events
        const searchInput = document.getElementById('timesheet-search');
        const dateFilter = document.getElementById('timesheet-date-filter');
        const projFilter = document.getElementById('timesheet-project-filter');

        if (searchInput) searchInput.addEventListener('input', () => renderTableRows(getTimesheetData().filter(i => getWeekDays().map(formatDateISO).includes(i.date))));
        if (dateFilter) dateFilter.addEventListener('change', () => renderTableRows(getTimesheetData().filter(i => getWeekDays().map(formatDateISO).includes(i.date))));
        if (projFilter) projFilter.addEventListener('change', () => renderTableRows(getTimesheetData().filter(i => getWeekDays().map(formatDateISO).includes(i.date))));

        // Gửi duyệt tuần
        const btnSubmit = document.getElementById('btn-submit-timesheet');
        if (btnSubmit) {
            btnSubmit.addEventListener('click', () => {
                const weekKey = getWeekKey(currentWeekMonday);
                const confirmMsg = `Bạn có chắc chắn muốn gửi duyệt Bảng chấm công cho ${document.getElementById('week-number')?.textContent || 'tuần này'}?\n\nTổng thời gian: ${document.getElementById('total-hours')?.textContent || '0h'}`;
                if (!confirm(confirmMsg)) return;

                const subs = getSubmissions();
                subs[weekKey] = {
                    status: 'SUBMITTED',
                    submittedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                };
                saveSubmissions(subs);
                renderTimesheet();

                if (window.showToast) {
                    window.showToast('Đã gửi bảng chấm công tuần này lên cấp Quản lý phê duyệt!', 'success');
                } else {
                    alert('Đã gửi bảng chấm công tuần này lên cấp Quản lý phê duyệt!');
                }
            });
        }
    });
})();
