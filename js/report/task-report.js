const TASK_REPORT_STORAGE_KEYS = {
    tasks: 'etrms_tasks',
    mockTasks: 'etrms_report_mock_tasks_by_department'
};

const TASK_REPORT_STATE = {
    tasks: [],
    filteredDepartments: [],
    currentPage: 1,
    pageSize: 4
};

function readStoredArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || '[]');

        return Array.isArray(value) ? value : [];
    } catch (error) {
        console.warn(`Không thể đọc LocalStorage key "${key}"`, error);

        return [];
    }
}

function normalizeStatus(status) {
    const value = String(status || '')
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, '_');

    if (value === 'DONE' || value === 'COMPLETED') return 'DONE';

    if (value === 'IN_PROGRESS') return 'IN_PROGRESS';

    if (value === 'IN_REVIEW') return 'IN_REVIEW';
    
    if (value === 'BLOCKED') return 'BLOCKED';

    return 'TO_DO';
}

function getTaskDepartment(task) {
    return (
        task.departmentName ||
        task.department ||
        task.assigneeDepartment ||
        task.teamName ||
        'Chưa phân phòng'
    );
}

function createMockTasksForDepartment(group) {
    return Array.from({ length: group.total }, (_, index) => {
        let status = 'TO_DO';
        let dueDate = '2026-12-31';

        if (index < group.done) {
            status = 'DONE';
            dueDate = '2026-08-10';
        } else if (index < group.done + group.inProgress) {
            status = 'IN_PROGRESS';

            if (index < group.done + group.overdue) {
                dueDate = '2026-01-01';
            }
        } else if (
            index < group.done + group.inProgress + group.blocked
        ) {
            status = 'BLOCKED';
        }

        return {
            id: `${group.department}-${index + 1}`,
            department: group.department,
            status,
            dueDate,
            completedAt: status === 'DONE' ? '2026-08-10' : null
        };
    });
}

function getMockTasks() {
    const storedTasks = readStoredArray(TASK_REPORT_STORAGE_KEYS.mockTasks);

    if (storedTasks.length > 0) {
        return storedTasks;
    }

    const taskGroups = [
        {
            department: 'Phát triển Sản phẩm',
            total: 452,
            done: 310,
            inProgress: 98,
            blocked: 22,
            overdue: 22
        },
        {
            department: 'Marketing & Truyền thông',
            total: 215,
            done: 180,
            inProgress: 25,
            blocked: 5,
            overdue: 5
        },
        {
            department: 'Thiết kế (UI/UX)',
            total: 148,
            done: 85,
            inProgress: 40,
            blocked: 8,
            overdue: 15
        },
        {
            department: 'Nhân sự',
            total: 85,
            done: 78,
            inProgress: 5,
            blocked: 0,
            overdue: 2
        }
    ];

    const mockTasks = taskGroups.flatMap(createMockTasksForDepartment);

    localStorage.setItem(
        TASK_REPORT_STORAGE_KEYS.mockTasks,
        JSON.stringify(mockTasks)
    );

    return mockTasks;
}

function getTaskReportData() {
    const storedTasks = readStoredArray(TASK_REPORT_STORAGE_KEYS.tasks);

    return storedTasks.length > 0 ? storedTasks : getMockTasks();
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function isOverdueTask(task) {
    const dueDate = task.dueDate || task.deadline || task.endDate;

    if (normalizeStatus(task.status) === 'DONE' || !dueDate) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);

    return (
        !Number.isNaN(taskDueDate.getTime()) &&
        taskDueDate < today
    );
}

function isCompletedOnTime(task) {
    const dueDate = task.dueDate || task.deadline || task.endDate;
    const completedAt = task.completedAt || task.completedDate;

    if (
        normalizeStatus(task.status) !== 'DONE' ||
        !dueDate ||
        !completedAt
    ) {
        return false;
    }

    const taskDueDate = new Date(dueDate);
    const taskCompletedDate = new Date(completedAt);

    return (
        !Number.isNaN(taskDueDate.getTime()) &&
        !Number.isNaN(taskCompletedDate.getTime()) &&
        taskCompletedDate <= taskDueDate
    );
}

function createDepartmentSummary(department) {
    return {
        department,
        totalTasks: 0,
        done: 0,
        inProgress: 0,
        blocked: 0,
        overdue: 0,
        completedOnTime: 0,
        onTimeRate: 0
    };
}

function summarizeTasksByDepartment(tasks) {
    const summaryMap = new Map();

    tasks.forEach((task) => {
        const department = getTaskDepartment(task);

        if (!summaryMap.has(department)) {
            summaryMap.set(
                department,
                createDepartmentSummary(department)
            );
        }

        const summary = summaryMap.get(department);
        const status = normalizeStatus(task.status);

        summary.totalTasks += 1;

        if (status === 'DONE') {
            summary.done += 1;
        }

        // Bảng không có cột In Review riêng,
        // nên gộp In Review vào In Progress.
        if (status === 'IN_PROGRESS' || status === 'IN_REVIEW') {
            summary.inProgress += 1;
        }

        if (status === 'BLOCKED') {
            summary.blocked += 1;
        }

        if (isOverdueTask(task)) {
            summary.overdue += 1;
        }

        if (isCompletedOnTime(task)) {
            summary.completedOnTime += 1;
        }
    });

    return [...summaryMap.values()]
        .map((summary) => {
            return {
                ...summary,
                onTimeRate: summary.done > 0
                    ? Math.round(
                        (summary.completedOnTime / summary.done) * 100
                    )
                    : 0
            };
        })
        .sort((first, second) => {
            return second.totalTasks - first.totalTasks;
        });
}

function createTotalSummary(departmentSummaries) {
    const total = departmentSummaries.reduce((result, summary) => {
        result.totalTasks += summary.totalTasks;
        result.done += summary.done;
        result.inProgress += summary.inProgress;
        result.blocked += summary.blocked;
        result.overdue += summary.overdue;
        result.completedOnTime += summary.completedOnTime;

        return result;
    }, createDepartmentSummary('Tổng cộng'));

    total.onTimeRate = total.done > 0
        ? Math.round((total.completedOnTime / total.done) * 100)
        : 0;

    return total;
}

function createSummaryRow(summary, isTotal = false) {
    const totalClass = isTotal ? 'task-report-total-row' : '';

    return `
        <tr class="${totalClass}">
            <td>${escapeHtml(summary.department)}</td>
            <td>${summary.totalTasks}</td>
            <td class="task-report-done">${summary.done}</td>
            <td class="task-report-in-progress">${summary.inProgress}</td>
            <td class="task-report-blocked">${summary.blocked}</td>
            <td class="task-report-overdue">${summary.overdue}</td>
            <td>
                <div class="task-report-progress-cell">
                    <span>${summary.onTimeRate}%</span>
                    <div class="task-report-progress">
                        <span style="width: ${summary.onTimeRate}%"></span>
                    </div>
                </div>
            </td>
        </tr>
    `;
}

function renderTaskReportRows(
    departmentSummaries,
    totalSummary = createTotalSummary(departmentSummaries)
) {
    const tableBody = document.getElementById('task-report-tbody');

    if (!tableBody) {
        return;
    }

    if (departmentSummaries.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="task-report-empty">
                    Không có công việc phù hợp.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = `
        ${departmentSummaries.map((summary) => {
            return createSummaryRow(summary);
        }).join('')}

        ${createSummaryRow(totalSummary, true)}
    `;
}

function getPeriodRange(period) {
    if (period === 'all') {
        return null;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    if (period === 'current-year') {
        return {
            from: new Date(year, 0, 1),
            to: new Date(year, 11, 31)
        };
    }

    if (period === 'current-quarter') {
        const quarterStartMonth = Math.floor(month / 3) * 3;

        return {
            from: new Date(year, quarterStartMonth, 1),
            to: new Date(year, quarterStartMonth + 3, 0)
        };
    }

    return {
        from: new Date(year, month, 1),
        to: new Date(year, month + 1, 0)
    };
}

function isTaskInPeriod(task, range) {
    if (!range) {
        return true;
    }

    const dateValue =
        task.createdAt ||
        task.updatedAt ||
        task.completedAt ||
        task.dueDate ||
        task.deadline;

    // Schema task hiện tại chưa chắc có ngày.
    // Nếu không có ngày, vẫn giữ task để không làm mất dữ liệu.
    if (!dateValue) {
        return true;
    }

    const taskDate = new Date(dateValue);

    return (
        !Number.isNaN(taskDate.getTime()) &&
        taskDate >= range.from &&
        taskDate <= range.to
    );
}

function populateDepartmentFilter(departmentSummaries) {
    const departmentFilter = document.getElementById(
        'task-report-department-filter'
    );

    if (!departmentFilter) {
        return;
    }

    departmentFilter.innerHTML =
        '<option value="all">▦ Tất cả Phòng ban</option>';

    departmentSummaries.forEach((summary) => {
        const option = document.createElement('option');

        option.value = summary.department;
        option.textContent = summary.department;

        departmentFilter.appendChild(option);
    });
}

function getFilteredTasks() {
    const departmentFilter = document.getElementById(
        'task-report-department-filter'
    );

    const periodFilter = document.getElementById(
        'task-report-period-filter'
    );

    const selectedDepartment = departmentFilter?.value || 'all';
    const selectedPeriod = periodFilter?.value || 'all';
    const periodRange = getPeriodRange(selectedPeriod);

    return TASK_REPORT_STATE.tasks.filter((task) => {
        const belongsToDepartment =
            selectedDepartment === 'all' ||
            getTaskDepartment(task) === selectedDepartment;

        return belongsToDepartment && isTaskInPeriod(task, periodRange);
    });
}

function renderTaskPagination() {
    const totalDepartments = TASK_REPORT_STATE.filteredDepartments.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalDepartments / TASK_REPORT_STATE.pageSize)
    );

    TASK_REPORT_STATE.currentPage = Math.min(
        TASK_REPORT_STATE.currentPage,
        totalPages
    );

    const summaryElement = document.getElementById(
        'task-report-summary'
    );

    const pageNumbers = document.getElementById(
        'task-report-page-numbers'
    );

    const previousButton = document.getElementById(
        'task-report-prev-page'
    );

    const nextButton = document.getElementById(
        'task-report-next-page'
    );

    if (summaryElement) {
        const from = totalDepartments === 0
            ? 0
            : (
                (TASK_REPORT_STATE.currentPage - 1) *
                TASK_REPORT_STATE.pageSize
            ) + 1;

        const to = Math.min(
            TASK_REPORT_STATE.currentPage * TASK_REPORT_STATE.pageSize,
            totalDepartments
        );

        summaryElement.textContent =
            `Hiển thị ${from} đến ${to} của ${totalDepartments} phòng ban`;
    }

    if (previousButton) {
        previousButton.disabled = TASK_REPORT_STATE.currentPage === 1;
    }

    if (nextButton) {
        nextButton.disabled =
            TASK_REPORT_STATE.currentPage === totalPages;
    }

    if (pageNumbers) {
        pageNumbers.innerHTML = Array.from(
            { length: totalPages },
            (_, index) => {
                const page = index + 1;
                const activeClass = page === TASK_REPORT_STATE.currentPage
                    ? 'is-active'
                    : '';

                return `
                    <button
                        class="${activeClass}"
                        type="button"
                        data-page="${page}"
                    >
                        ${page}
                    </button>
                `;
            }
        ).join('');
    }
}

function renderTaskReport() {
    const filteredTasks = getFilteredTasks();

    const allDepartmentSummaries = summarizeTasksByDepartment(
        filteredTasks
    );

    TASK_REPORT_STATE.filteredDepartments = allDepartmentSummaries;

    const totalPages = Math.max(
        1,
        Math.ceil(
            allDepartmentSummaries.length /
            TASK_REPORT_STATE.pageSize
        )
    );

    TASK_REPORT_STATE.currentPage = Math.min(
        TASK_REPORT_STATE.currentPage,
        totalPages
    );

    const startIndex =
        (TASK_REPORT_STATE.currentPage - 1) *
        TASK_REPORT_STATE.pageSize;

    const currentDepartmentSummaries = allDepartmentSummaries.slice(
        startIndex,
        startIndex + TASK_REPORT_STATE.pageSize
    );

    renderTaskReportRows(
        currentDepartmentSummaries,
        createTotalSummary(allDepartmentSummaries)
    );

    renderTaskPagination();
}

function handleTaskFilterChange() {
    TASK_REPORT_STATE.currentPage = 1;
    renderTaskReport();
}

function changeTaskReportPage(nextPage) {
    const totalPages = Math.max(
        1,
        Math.ceil(
            TASK_REPORT_STATE.filteredDepartments.length /
            TASK_REPORT_STATE.pageSize
        )
    );

    TASK_REPORT_STATE.currentPage = Math.max(
        1,
        Math.min(nextPage, totalPages)
    );

    renderTaskReport();
}

function createTaskReportCsvContent(departmentSummaries) {
    const headers = [
        'Phòng ban',
        'Tổng task',
        'Done',
        'In Progress',
        'Blocked',
        'Overdue',
        'Tỷ lệ hoàn thành đúng hạn %'
    ];

    const rows = departmentSummaries.map((summary) => {
        return [
            summary.department,
            summary.totalTasks,
            summary.done,
            summary.inProgress,
            summary.blocked,
            summary.overdue,
            summary.onTimeRate
        ];
    });

    const totalSummary = createTotalSummary(departmentSummaries);

    rows.push([
        totalSummary.department,
        totalSummary.totalTasks,
        totalSummary.done,
        totalSummary.inProgress,
        totalSummary.blocked,
        totalSummary.overdue,
        totalSummary.onTimeRate
    ]);

    return [headers, ...rows]
        .map((row) => {
            return row
                .map((cell) => {
                    const escapedCell = String(cell).replace(/"/g, '""');

                    return `"${escapedCell}"`;
                })
                .join(',');
        })
        .join('\n');
}

function exportTaskReportCsv() {
    const csvContent = createTaskReportCsvContent(
        TASK_REPORT_STATE.filteredDepartments
    );

    // BOM giúp Excel mở CSV tiếng Việt đúng ký tự.
    const file = new Blob(
        [`\uFEFF${csvContent}`],
        { type: 'text/csv;charset=utf-8;' }
    );

    const fileUrl = URL.createObjectURL(file);
    const downloadLink = document.createElement('a');

    downloadLink.href = fileUrl;
    downloadLink.download = 'bao-cao-cong-viec.csv';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(fileUrl);
}

function handleTaskReportAdvancedFilter() {
    alert(
        'Bộ lọc nâng cao sẽ được bổ sung khi schema task và phòng ban được thống nhất.'
    );
}

function bindTaskReportEvents() {
    document.getElementById(
        'task-report-department-filter'
    )?.addEventListener('change', handleTaskFilterChange);

    document.getElementById(
        'task-report-period-filter'
    )?.addEventListener('change', handleTaskFilterChange);

    document.getElementById(
        'task-report-prev-page'
    )?.addEventListener('click', () => {
        changeTaskReportPage(TASK_REPORT_STATE.currentPage - 1);
    });

    document.getElementById(
        'task-report-next-page'
    )?.addEventListener('click', () => {
        changeTaskReportPage(TASK_REPORT_STATE.currentPage + 1);
    });

    document.getElementById(
        'task-report-page-numbers'
    )?.addEventListener('click', (event) => {
        const selectedPage = Number(event.target.dataset.page);

        if (selectedPage) {
            changeTaskReportPage(selectedPage);
        }
    });

    document.getElementById(
        'task-report-export-button'
    )?.addEventListener('click', exportTaskReportCsv);

    document.getElementById(
        'task-report-advanced-filter'
    )?.addEventListener('click', handleTaskReportAdvancedFilter);
}

function initializeTaskReport() {
    TASK_REPORT_STATE.tasks = getTaskReportData();

    const departmentSummaries = summarizeTasksByDepartment(
        TASK_REPORT_STATE.tasks
    );

    populateDepartmentFilter(departmentSummaries);
    bindTaskReportEvents();
    renderTaskReport();
}

document.addEventListener('DOMContentLoaded', initializeTaskReport);