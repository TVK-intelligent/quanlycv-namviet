const EMPLOYEE_KPI_STORAGE_KEYS = {
    employees: 'etrms_employees',
    employeesWsi: 'etrms_employees_wsi',
    tasks: 'etrms_tasks',
    mockEmployees: 'etrms_report_mock_kpi_employees',
    mockTasks: 'etrms_report_mock_kpi_tasks',
    snapshots: 'etrms_employee_kpi_snapshots'
};

const EMPLOYEE_KPI_STATE = {
    employees: [],
    tasks: [],
    filteredRows: [],
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

function formatDateToIso(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getMockEmployees() {
    const storedEmployees = readStoredArray(EMPLOYEE_KPI_STORAGE_KEYS.mockEmployees);

    if (storedEmployees.length > 0) return storedEmployees;

    const employees = [
        { id: 'emp-01', fullName: 'Nguyễn Văn An', position: 'Senior Backend Dev', departmentName: 'Engineering', previousOnTimeRate: 92 },
        { id: 'emp-02', fullName: 'Trần Thị Bích', position: 'Product Designer', departmentName: 'Design', previousOnTimeRate: 88 },
        { id: 'emp-03', fullName: 'Lê Minh Cường', position: 'QA Specialist', departmentName: 'Engineering', previousOnTimeRate: 81 },
        { id: 'emp-04', fullName: 'Phạm Thu Dung', position: 'Data Analyst', departmentName: 'Data Science', previousOnTimeRate: 91 }
    ];

    localStorage.setItem(
        EMPLOYEE_KPI_STORAGE_KEYS.mockEmployees,
        JSON.stringify(employees)
    );

    return employees;
}

function createMockTasksForEmployee(group) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const createdAt = formatDateToIso(new Date(year, month, 3));

    return Array.from({ length: group.total }, (_, index) => {
        const isDone = index < group.done;
        const isOnTime = index < group.onTimeDone;
        const isFirstTimePassed = index < group.firstTimePassed;
        const dueDate = formatDateToIso(new Date(year, month, 12 + (index % 8)));
        const completedAt = isDone
            ? formatDateToIso(new Date(year, month, isOnTime ? 11 : 22))
            : null;

        return {
            id: `${group.employeeId}-task-${index + 1}`,
            assigneeId: group.employeeId,
            status: isDone ? 'DONE' : 'IN_PROGRESS',
            dueDate,
            completedAt,
            createdAt,
            loggedHours: group.loggedHours / group.total,
            firstTimePassed: isDone ? isFirstTimePassed : undefined
        };
    });
}

function getMockTasks() {
    const storedTasks = readStoredArray(EMPLOYEE_KPI_STORAGE_KEYS.mockTasks);

    if (storedTasks.length > 0) return storedTasks;

    const groups = [
        { employeeId: 'emp-01', total: 20, done: 16, onTimeDone: 15, firstTimePassed: 15, loggedHours: 164.5 },
        { employeeId: 'emp-02', total: 20, done: 15, onTimeDone: 13, firstTimePassed: 13, loggedHours: 158 },
        { employeeId: 'emp-03', total: 20, done: 16, onTimeDone: 12, firstTimePassed: 13, loggedHours: 160 },
        { employeeId: 'emp-04', total: 20, done: 18, onTimeDone: 17, firstTimePassed: 17, loggedHours: 168 }
    ];

    const tasks = groups.flatMap(createMockTasksForEmployee);

    localStorage.setItem(
        EMPLOYEE_KPI_STORAGE_KEYS.mockTasks,
        JSON.stringify(tasks)
    );

    return tasks;
}

function getEmployeeKpiData() {
    const storedEmployees = readStoredArray(EMPLOYEE_KPI_STORAGE_KEYS.employees);
    const storedEmployeesWsi = readStoredArray(EMPLOYEE_KPI_STORAGE_KEYS.employeesWsi);
    const storedTasks = readStoredArray(EMPLOYEE_KPI_STORAGE_KEYS.tasks);
    const employees = storedEmployees.length > 0 ? storedEmployees : storedEmployeesWsi;

    if (employees.length > 0 && storedTasks.length > 0) {
        return { employees, tasks: storedTasks };
    }

    return { employees: getMockEmployees(), tasks: getMockTasks() };
}

function normalizeStatus(status) {
    const value = String(status || '')
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, '_');

    if (value === 'DONE' || value === 'COMPLETED') return 'DONE';

    return value;
}

function getEmployeeObject(employee) {
    return employee.employee || employee;
}

function getEmployeeId(employee) {
    const source = getEmployeeObject(employee);

    return String(source.id || source.employeeId || source.userId || '');
}

function getEmployeeName(employee) {
    const source = getEmployeeObject(employee);

    return source.fullName || source.name || source.employeeName || 'Chưa có tên';
}

function getEmployeePosition(employee) {
    const source = getEmployeeObject(employee);

    return source.position || source.jobTitle || source.title || 'Nhân sự';
}

function getEmployeeDepartment(employee) {
    const source = getEmployeeObject(employee);

    return source.departmentName || source.department || source.teamName || 'Chưa phân phòng';
}

function getTaskAssigneeId(task) {
    return String(
        task.assigneeId ||
        task.employeeId ||
        task.assignee_id ||
        task.ownerId ||
        task.assignedToId ||
        ''
    );
}

function getTaskLoggedHours(task) {
    return Number(task.loggedHours || task.actualHours || task.workedHours || 0);
}

function getInitials(fullName) {
    return String(fullName || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(-2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase() || '--';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getPeriodRange(period) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    if (period === 'current-year') {
        return { from: new Date(year, 0, 1), to: new Date(year, 11, 31) };
    }

    if (period === 'current-quarter') {
        const startMonth = Math.floor(month / 3) * 3;

        return {
            from: new Date(year, startMonth, 1),
            to: new Date(year, startMonth + 3, 0)
        };
    }

    return { from: new Date(year, month, 1), to: new Date(year, month + 1, 0) };
}

function isTaskInPeriod(task, range) {
    const value = task.completedAt || task.updatedAt || task.createdAt || task.dueDate;

    // Giữ task thiếu ngày, vì schema hiện tại chưa bắt buộc các field ngày.
    if (!value) return true;

    const taskDate = new Date(value);

    return (
        !Number.isNaN(taskDate.getTime()) &&
        taskDate >= range.from &&
        taskDate <= range.to
    );
}

function isTaskCompletedOnTime(task) {
    const dueDate = task.dueDate || task.deadline || task.endDate;
    const completedAt = task.completedAt || task.completedDate;

    if (normalizeStatus(task.status) !== 'DONE' || !dueDate || !completedAt) {
        return false;
    }

    const due = new Date(dueDate);
    const completed = new Date(completedAt);

    return (
        !Number.isNaN(due.getTime()) &&
        !Number.isNaN(completed.getTime()) &&
        completed <= due
    );
}

function getFirstTimePassed(task) {
    if (typeof task.firstTimePassed === 'boolean') {
        return task.firstTimePassed;
    }

    if (task.reworkCount !== undefined && task.reworkCount !== null) {
        return Number(task.reworkCount) === 0;
    }

    return null;
}

function formatPercent(value) {
    return value === null ? 'N/A' : `${value.toFixed(1)}%`;
}

function formatHours(value) {
    return `${Number(value || 0).toFixed(1)}h`;
}

function getPeriodLabel() {
    const now = new Date();

    return `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
}

function calculateEmployeeKpi(employee, tasks) {
    const employeeId = getEmployeeId(employee);
    const employeeTasks = tasks.filter((task) => {
        return getTaskAssigneeId(task) === employeeId;
    });
    const completedTasks = employeeTasks.filter((task) => {
        return normalizeStatus(task.status) === 'DONE';
    });
    const onTimeTasks = completedTasks.filter(isTaskCompletedOnTime);
    const firstTimeTasks = completedTasks
        .map((task) => getFirstTimePassed(task))
        .filter((result) => result !== null);
    const onTimeRate = completedTasks.length > 0
        ? (onTimeTasks.length / completedTasks.length) * 100
        : 0;
    const ftpr = firstTimeTasks.length > 0
        ? (firstTimeTasks.filter(Boolean).length / firstTimeTasks.length) * 100
        : null;
    const finalScore = ftpr === null
        ? Math.round(onTimeRate)
        : Math.round((onTimeRate * 0.6) + (ftpr * 0.4));

    return {
        id: employeeId,
        name: getEmployeeName(employee),
        position: getEmployeePosition(employee),
        department: getEmployeeDepartment(employee),
        previousOnTimeRate: Number(getEmployeeObject(employee).previousOnTimeRate),
        totalTasks: employeeTasks.length,
        completedTasks: completedTasks.length,
        onTimeRate,
        ftpr,
        loggedHours: employeeTasks.reduce((total, task) => {
            return total + getTaskLoggedHours(task);
        }, 0),
        finalScore
    };
}

function getTrend(row) {
    if (Number.isNaN(row.previousOnTimeRate)) return 'stable';
    if (row.onTimeRate > row.previousOnTimeRate) return 'positive';
    if (row.onTimeRate < row.previousOnTimeRate) return 'negative';

    return 'stable';
}

function getScoreClass(score) {
    if (score >= 95) return 'is-excellent';
    if (score < 80) return 'is-low';

    return '';
}

function getKpiRows() {
    const period = document.getElementById('employee-kpi-period-filter')?.value || 'current-month';
    const range = getPeriodRange(period);
    const query = String(
        document.getElementById('employee-kpi-search-input')?.value || ''
    ).trim().toLocaleLowerCase('vi');
    const periodTasks = EMPLOYEE_KPI_STATE.tasks.filter((task) => {
        return isTaskInPeriod(task, range);
    });

    return EMPLOYEE_KPI_STATE.employees
        .map((employee) => calculateEmployeeKpi(employee, periodTasks))
        .filter((row) => {
            if (!query) return true;

            return [row.name, row.position, row.department]
                .join(' ')
                .toLocaleLowerCase('vi')
                .includes(query);
        })
        .sort((first, second) => second.finalScore - first.finalScore);
}

function renderSummaryCards(rows) {
    const totalElement = document.getElementById('employee-kpi-total-evaluated');
    const onTimeElement = document.getElementById('employee-kpi-average-on-time');
    const ftprElement = document.getElementById('employee-kpi-average-ftpr');
    const averageOnTime = rows.length
        ? rows.reduce((total, row) => total + row.onTimeRate, 0) / rows.length
        : 0;
    const rowsWithFtpr = rows.filter((row) => row.ftpr !== null);
    const averageFtpr = rowsWithFtpr.length
        ? rowsWithFtpr.reduce((total, row) => total + row.ftpr, 0) / rowsWithFtpr.length
        : null;

    if (totalElement) totalElement.textContent = rows.length;
    if (onTimeElement) onTimeElement.innerHTML = `${averageOnTime.toFixed(1)}<span>%</span>`;
    if (ftprElement) ftprElement.innerHTML = averageFtpr === null
        ? 'N/A'
        : `${averageFtpr.toFixed(1)}<span>%</span>`;
}

function createEmployeeRow(row) {
    const trend = getTrend(row);
    const trendSymbol = trend === 'positive' ? '↗' : trend === 'negative' ? '↓' : '→';
    const rateClass = trend === 'negative'
        ? 'is-danger'
        : trend === 'stable'
            ? 'is-warning'
            : '';

    return `
        <tr>
            <td>
                <div class="employee-kpi-person">
                    <span class="employee-kpi-avatar">${escapeHtml(getInitials(row.name))}</span>
                    <span>
                        <strong>${escapeHtml(row.name)}</strong>
                        <small>${escapeHtml(row.position)}</small>
                    </span>
                </div>
            </td>
            <td><span class="employee-kpi-department-badge">${escapeHtml(row.department)}</span></td>
            <td>${getPeriodLabel()}</td>
            <td>
                <div class="employee-kpi-rate ${rateClass}">
                    <span>${formatPercent(row.onTimeRate)} ${trendSymbol}</span>
                    <div class="employee-kpi-progress"><span style="width: ${row.onTimeRate}%"></span></div>
                </div>
            </td>
            <td>${formatPercent(row.ftpr)}</td>
            <td>${formatHours(row.loggedHours)}</td>
            <td><span class="employee-kpi-score ${getScoreClass(row.finalScore)}">${row.finalScore}</span></td>
            <td><button class="employee-kpi-detail-button" type="button" data-employee-id="${escapeHtml(row.id)}">Xem</button></td>
        </tr>
    `;
}

function renderEmployeeRows(rows) {
    const tableBody = document.getElementById('employee-kpi-tbody');

    if (!tableBody) return;

    tableBody.innerHTML = rows.length > 0
        ? rows.map(createEmployeeRow).join('')
        : '<tr><td colspan="8" class="employee-kpi-empty">Không tìm thấy nhân sự phù hợp.</td></tr>';
}

function renderPagination() {
    const total = EMPLOYEE_KPI_STATE.filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(total / EMPLOYEE_KPI_STATE.pageSize));
    const currentPage = Math.min(EMPLOYEE_KPI_STATE.currentPage, totalPages);
    const summary = document.getElementById('employee-kpi-summary');
    const pageNumbers = document.getElementById('employee-kpi-page-numbers');
    const previousButton = document.getElementById('employee-kpi-prev-page');
    const nextButton = document.getElementById('employee-kpi-next-page');

    EMPLOYEE_KPI_STATE.currentPage = currentPage;

    if (summary) {
        const from = total === 0 ? 0 : ((currentPage - 1) * EMPLOYEE_KPI_STATE.pageSize) + 1;
        const to = Math.min(currentPage * EMPLOYEE_KPI_STATE.pageSize, total);

        summary.textContent = `Hiển thị ${from} đến ${to} của ${total} nhân sự`;
    }

    if (previousButton) previousButton.disabled = currentPage === 1;
    if (nextButton) nextButton.disabled = currentPage === totalPages;

    if (pageNumbers) {
        pageNumbers.innerHTML = Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            const activeClass = page === currentPage ? 'is-active' : '';

            return `<button class="${activeClass}" type="button" data-page="${page}">${page}</button>`;
        }).join('');
    }
}

function renderEmployeeKpiReport() {
    const rows = getKpiRows();

    EMPLOYEE_KPI_STATE.filteredRows = rows;
    EMPLOYEE_KPI_STATE.currentPage = Math.min(
        EMPLOYEE_KPI_STATE.currentPage,
        Math.max(1, Math.ceil(rows.length / EMPLOYEE_KPI_STATE.pageSize))
    );

    const start = (EMPLOYEE_KPI_STATE.currentPage - 1) * EMPLOYEE_KPI_STATE.pageSize;

    renderSummaryCards(rows);
    renderEmployeeRows(rows.slice(start, start + EMPLOYEE_KPI_STATE.pageSize));
    renderPagination();
}

function handleFilterChange() {
    EMPLOYEE_KPI_STATE.currentPage = 1;
    renderEmployeeKpiReport();
}

function changePage(page) {
    const totalPages = Math.max(
        1,
        Math.ceil(EMPLOYEE_KPI_STATE.filteredRows.length / EMPLOYEE_KPI_STATE.pageSize)
    );

    EMPLOYEE_KPI_STATE.currentPage = Math.max(1, Math.min(page, totalPages));
    renderEmployeeKpiReport();
}

function createCsvContent(rows) {
    const headers = ['Nhân sự', 'Chức danh', 'Phòng ban', 'Kỳ', 'On-time rate', 'FTPR', 'Logged hours', 'Final score'];
    const data = rows.map((row) => {
        return [row.name, row.position, row.department, getPeriodLabel(), formatPercent(row.onTimeRate), formatPercent(row.ftpr), formatHours(row.loggedHours), row.finalScore];
    });

    return [headers, ...data]
        .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
}

function exportEmployeeKpiCsv() {
    const csv = `\uFEFF${createCsvContent(EMPLOYEE_KPI_STATE.filteredRows)}`;
    const file = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'bao-cao-kpi-nhan-su.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function saveSnapshot() {
    const snapshots = readStoredArray(EMPLOYEE_KPI_STORAGE_KEYS.snapshots);
    const period = getPeriodLabel();
    const snapshot = {
        id: `kpi-${Date.now()}`,
        period,
        createdAt: new Date().toISOString(),
        rows: EMPLOYEE_KPI_STATE.filteredRows
    };

    const nextSnapshots = [snapshot, ...snapshots].slice(0, 24);

    localStorage.setItem(
        EMPLOYEE_KPI_STORAGE_KEYS.snapshots,
        JSON.stringify(nextSnapshots)
    );

    alert(`Đã lưu Snapshot KPI cho kỳ ${period}.`);
}

function showEmployeeDetail(employeeId) {
    const row = EMPLOYEE_KPI_STATE.filteredRows.find((item) => item.id === employeeId);

    if (!row) return;

    alert(
        `${row.name}\n` +
        `On-time rate: ${formatPercent(row.onTimeRate)}\n` +
        `FTPR: ${formatPercent(row.ftpr)}\n` +
        `Logged hours: ${formatHours(row.loggedHours)}\n` +
        `Final score: ${row.finalScore}`
    );
}

function bindEvents() {
    document.getElementById('employee-kpi-period-filter')?.addEventListener('change', handleFilterChange);
    document.getElementById('employee-kpi-search-input')?.addEventListener('input', handleFilterChange);
    document.getElementById('employee-kpi-prev-page')?.addEventListener('click', () => changePage(EMPLOYEE_KPI_STATE.currentPage - 1));
    document.getElementById('employee-kpi-next-page')?.addEventListener('click', () => changePage(EMPLOYEE_KPI_STATE.currentPage + 1));
    document.getElementById('employee-kpi-page-numbers')?.addEventListener('click', (event) => {
        const page = Number(event.target.dataset.page);

        if (page) changePage(page);
    });
    document.getElementById('employee-kpi-export-button')?.addEventListener('click', exportEmployeeKpiCsv);
    document.getElementById('employee-kpi-snapshot-button')?.addEventListener('click', saveSnapshot);
    document.getElementById('employee-kpi-advanced-filter-button')?.addEventListener('click', () => {
        alert('Bộ lọc nâng cao sẽ được bổ sung khi schema KPI được thống nhất.');
    });
    document.getElementById('employee-kpi-tbody')?.addEventListener('click', (event) => {
        const employeeId = event.target.dataset.employeeId;

        if (employeeId) showEmployeeDetail(employeeId);
    });
}

function initializeEmployeeKpiReport() {
    const data = getEmployeeKpiData();

    EMPLOYEE_KPI_STATE.employees = data.employees;
    EMPLOYEE_KPI_STATE.tasks = data.tasks;

    bindEvents();
    renderEmployeeKpiReport();
}

document.addEventListener('DOMContentLoaded', initializeEmployeeKpiReport);
