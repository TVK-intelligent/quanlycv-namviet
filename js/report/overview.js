const REPORT_STORAGE_KEYS = {
    projects: 'etrms_projects',
    tasks: 'etrms_tasks',
    employeesWsi: 'etrms_employees_wsi',
    mockMilestones: 'etrms_report_mock_milestones'
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

function getReportData() {
    return {
        projects: readStoredArray(REPORT_STORAGE_KEYS.projects),
        tasks: readStoredArray(REPORT_STORAGE_KEYS.tasks),
        employeesWsi: readStoredArray(REPORT_STORAGE_KEYS.employeesWsi)
    };
}

function getMilestones() {
    const storedMilestones = readStoredArray(REPORT_STORAGE_KEYS.mockMilestones);

    if (storedMilestones.length > 0) {
        return storedMilestones;
    }

    const mockMilestones = [
        { date: '2026-08-01', label: 'Tuần 1', planned: 15, completed: 8 },
        { date: '2026-08-05', label: 'Tuần 2', planned: 30, completed: 24 },
        { date: '2026-08-10', label: 'Tuần 3', planned: 45, completed: 39 },
        { date: '2026-08-15', label: 'Tuần 4', planned: 60, completed: 55 },
        { date: '2026-08-20', label: 'Tuần 5', planned: 72, completed: 61 },
        { date: '2026-08-25', label: 'Tuần 6', planned: 88, completed: 82 },
        { date: '2026-08-30', label: 'Hiện tại', planned: 100, completed: 88 }
    ];

    localStorage.setItem(
        REPORT_STORAGE_KEYS.mockMilestones,
        JSON.stringify(mockMilestones)
    );

    return mockMilestones;
}

function renderEmptyState(containerId, message) {
    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="report-empty-state">
            ${message}
        </div>
    `;
}

function renderSummaryList(containerId, items, emptyMessage) {
    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    if (items.length === 0) {
        container.innerHTML = `<p>${emptyMessage}</p>`;
        return;
    }

    const listItems = items.map((item) => {
        return `
            <li>
                <span>${item.label}</span>
                <strong>${item.value}</strong>
            </li>
        `;
    }).join('');

    container.innerHTML = `
        <ul class="report-summary-list">
            ${listItems}
        </ul>
    `;
}

function normalizeTaskStatus(status) {
    const normalizedStatus = String(status || '')
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, '_');

    if (normalizedStatus === 'DONE' || normalizedStatus === 'COMPLETED') {
        return 'DONE';
    }

    if (normalizedStatus === 'IN_PROGRESS') {
        return 'IN_PROGRESS';
    }

    if (normalizedStatus === 'IN_REVIEW') {
        return 'IN_REVIEW';
    }

    if (normalizedStatus === 'BLOCKED') {
        return 'BLOCKED';
    }

    return 'TO_DO';
}

function renderTaskStatusSummary(tasks) {
    const container = document.getElementById('task-status-chart');

    if (!container) {
        return;
    }

    const statusItems = [
        { key: 'TO_DO', label: 'To Do', color: '#B9C4D8' },
        { key: 'IN_PROGRESS', label: 'In Progress', color: '#3157C8' },
        { key: 'IN_REVIEW', label: 'In Review', color: '#A85B00' },
        { key: 'BLOCKED', label: 'Blocked', color: '#C71920' },
        { key: 'DONE', label: 'Done', color: '#0B69B3' }
    ];

    const counts = {
        TO_DO: 0,
        IN_PROGRESS: 0,
        IN_REVIEW: 0,
        BLOCKED: 0,
        DONE: 0
    };

    tasks.forEach((task) => {
        const status = normalizeTaskStatus(task.status);
        counts[status] += 1;
    });

    const totalTasks = tasks.length;

    if (totalTasks === 0) {
        renderEmptyState('task-status-chart', 'Không có công việc phù hợp bộ lọc.');
        return;
    }

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    const segments = statusItems.map((item) => {
        const count = counts[item.key];
        const segmentLength = (count / totalTasks) * circumference;

        const segment = `
            <circle
                class="report-donut-segment"
                cx="90"
                cy="90"
                r="${radius}"
                stroke="${item.color}"
                stroke-dasharray="${segmentLength} ${circumference - segmentLength}"
                stroke-dashoffset="${-offset}"
                transform="rotate(-90 90 90)"
            ></circle>
        `;

        offset += segmentLength;
        return segment;
    }).join('');

    const legend = statusItems.map((item) => {
        const count = counts[item.key];
        const percentage = ((count / totalTasks) * 100).toFixed(0);

        return `
            <li>
                <span class="report-legend-label">
                    <span
                        class="report-legend-dot"
                        style="background-color: ${item.color};"
                    ></span>
                    ${item.label}
                </span>
                <strong>${count} (${percentage}%)</strong>
            </li>
        `;
    }).join('');

    container.innerHTML = `
        <div class="report-donut-layout">
            <svg
                class="report-donut-chart"
                viewBox="0 0 180 180"
                role="img"
                aria-label="Trạng thái công việc"
            >
                <circle
                    class="report-donut-track"
                    cx="90"
                    cy="90"
                    r="${radius}"
                ></circle>

                ${segments}

                <text class="report-donut-center" x="90" y="86">
                    ${totalTasks}
                </text>
                <text x="90" y="106" text-anchor="middle" fill="#64748b">
                    Tasks
                </text>
            </svg>

            <ul class="report-chart-legend">
                ${legend}
            </ul>
        </div>
    `;
}

function populateProjectFilter(projects) {
    const projectFilter = document.getElementById('report-project-filter');

    if (!projectFilter) {
        return;
    }

    projectFilter.innerHTML = '<option value="">Tất cả dự án</option>';

    projects.forEach((project) => {
        const option = document.createElement('option');

        option.value = project.id;
        option.textContent = project.name;

        projectFilter.appendChild(option);
    });
}

function isDateInRange(dateValue, dateFrom, dateTo) {
    if (!dateValue) {
        return false;
    }

    if (dateFrom && dateValue < dateFrom) {
        return false;
    }

    if (dateTo && dateValue > dateTo) {
        return false;
    }

    return true;
}

function formatDateToIso(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getPeriodRange(period) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    let fromDate;
    let toDate;

    if (period === 'current-quarter') {
        const quarterStartMonth = Math.floor(month / 3) * 3;

        fromDate = new Date(year, quarterStartMonth, 1);
        toDate = new Date(year, quarterStartMonth + 3, 0);
    } else if (period === 'current-year') {
        fromDate = new Date(year, 0, 1);
        toDate = new Date(year, 11, 31);
    } else {
        fromDate = new Date(year, month, 1);
        toDate = new Date(year, month + 1, 0);
    }

    return {
        from: formatDateToIso(fromDate),
        to: formatDateToIso(toDate)
    };
}

function getFilteredTasks(tasks, projects) {
    const projectFilter = document.getElementById('report-project-filter');
    const periodFilter = document.getElementById('report-period-filter');

    const selectedProjectId = projectFilter ? projectFilter.value : '';
    const selectedPeriod = periodFilter
        ? periodFilter.value
        : 'current-month';

    const periodRange = getPeriodRange(selectedPeriod);

    const selectedProject = projects.find((project) => {
        return String(project.id) === selectedProjectId;
    });

    return tasks.filter((task) => {
        const taskDate = task.dueDate || task.completedAt || '';

        if (!isDateInRange(taskDate, periodRange.from, periodRange.to)) {
            return false;
        }

        if (!selectedProjectId) {
            return true;
        }

        const taskProjectId = String(task.projectId || task.project_id || '');
        const taskProjectName = task.projectName || task.project || '';

        return (
            taskProjectId === selectedProjectId ||
            taskProjectName === selectedProject?.name
        );
    });
}

function getFilteredMilestones(milestones) {
    const periodFilter = document.getElementById('report-period-filter');

    const selectedPeriod = periodFilter
        ? periodFilter.value
        : 'current-month';

    const periodRange = getPeriodRange(selectedPeriod);

    return milestones.filter((milestone) => {
        return isDateInRange(
            milestone.date,
            periodRange.from,
            periodRange.to
        );
    });
}

function getEmployeeDepartment(employee) {
    return (
        employee.departmentName ||
        employee.department ||
        'Chưa phân phòng'
    );
}

function populateDepartmentFilter(employeesWsi) {
    const departmentFilter = document.getElementById(
        'report-department-filter'
    );

    if (!departmentFilter) {
        return;
    }

    const departments = [...new Set(
        employeesWsi.map(getEmployeeDepartment)
    )].sort();

    departmentFilter.innerHTML =
        '<option value="">▦ Tất cả phòng ban</option>';

    departments.forEach((departmentName) => {
        const option = document.createElement('option');

        option.value = departmentName;
        option.textContent = `▦ ${departmentName}`;

        departmentFilter.appendChild(option);
    });

    departmentFilter.disabled = departments.length === 0;

    if (departments.length === 0) {
        departmentFilter.title = 'Chưa có dữ liệu phòng ban';
    } else {
        departmentFilter.removeAttribute('title');
    }
}

function renderWsiSummary(employeesWsi) {
    const container = document.getElementById('department-wsi-chart');

    if (!container) {
        return;
    }

    const departmentFilter = document.getElementById(
        'report-department-filter'
    );

    const selectedDepartment = departmentFilter
        ? departmentFilter.value
        : '';

    const filteredEmployees = selectedDepartment
        ? employeesWsi.filter((employee) => {
            return getEmployeeDepartment(employee) === selectedDepartment;
        })
        : employeesWsi;

    if (filteredEmployees.length === 0) {
        renderEmptyState(
            'department-wsi-chart',
            'Chưa có dữ liệu sức tải nhân sự.'
        );
        return;
    }

    const groupedDepartments = {};

    filteredEmployees.forEach((employee) => {
        const departmentName = getEmployeeDepartment(employee);

        if (!groupedDepartments[departmentName]) {
            groupedDepartments[departmentName] = {
                totalWsi: 0,
                employeeCount: 0
            };
        }

        groupedDepartments[departmentName].totalWsi +=
            Number(employee.wsi) || 0;

        groupedDepartments[departmentName].employeeCount += 1;
    });

    const departmentStats = Object.entries(groupedDepartments).map(
        ([name, data]) => {
            return {
                name,
                averageWsi: Math.round(
                    data.totalWsi / data.employeeCount
                )
            };
        }
    );

    const chartWidth = 720;
    const chartHeight = 320;

    const padding = {
        top: 20,
        right: 20,
        bottom: 52,
        left: 48
    };

    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const highestWsi = Math.max(
        ...departmentStats.map((item) => item.averageWsi),
        100
    );

    const maxWsi = Math.ceil(highestWsi / 25) * 25;
    const slotWidth = plotWidth / departmentStats.length;
    const barWidth = Math.min(58, slotWidth * 0.55);

    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padding.top + plotHeight - plotHeight * ratio;
        const value = Math.round(maxWsi * ratio);

        return `
            <line
                class="report-line-grid"
                x1="${padding.left}"
                y1="${y}"
                x2="${chartWidth - padding.right}"
                y2="${y}"
            ></line>

            <text
                class="report-line-axis-label"
                x="${padding.left - 10}"
                y="${y + 4}"
                text-anchor="end"
            >${value}</text>
        `;
    }).join('');

    const bars = departmentStats.map((department, index) => {
        const barHeight =
            (department.averageWsi / maxWsi) * plotHeight;

        const x =
            padding.left +
            slotWidth * index +
            (slotWidth - barWidth) / 2;

        const y = padding.top + plotHeight - barHeight;
        const labelX = padding.left + slotWidth * index + slotWidth / 2;

        let barColor = '#1677c8';

        if (department.averageWsi === 100) {
            barColor = '#e8a317';
        }

        if (department.averageWsi > 100) {
            barColor = '#c71920';
        }

        return `
            <rect
                x="${x}"
                y="${y}"
                width="${barWidth}"
                height="${barHeight}"
                rx="4"
                fill="${barColor}"
            >
                <title>${department.name}: ${department.averageWsi}%</title>
            </rect>

            <text
                class="report-line-axis-label"
                x="${labelX}"
                y="${chartHeight - 16}"
                text-anchor="middle"
            >${department.name}</text>
        `;
    }).join('');

    container.innerHTML = `
        <svg
            width="100%"
            height="320"
            viewBox="0 0 ${chartWidth} ${chartHeight}"
            role="img"
            aria-label="Khối lượng công việc trung bình theo phòng ban"
        >
            ${gridLines}
            ${bars}
        </svg>
    `;
}

function renderMilestoneSummary(milestones) {
    const container = document.getElementById('milestone-chart');

    if (!container) {
        return;
    }

    if (milestones.length === 0) {
        renderEmptyState(
            'milestone-chart',
            'Không có milestone phù hợp khoảng thời gian đã chọn.'
        );
        return;
    }

    const chartWidth = 960;
    const chartHeight = 360;

    const padding = {
        top: 24,
        right: 28,
        bottom: 54,
        left: 50
    };

    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;
    const baseY = padding.top + plotHeight;

    const plannedValues = milestones.map((milestone) => {
        return Number(milestone.planned) || 0;
    });

    const actualValues = milestones.map((milestone) => {
        return Number(milestone.completed) || 0;
    });

    const maxValue = Math.max(
        ...plannedValues,
        ...actualValues,
        100
    );

    function createPoints(values) {
        return values.map((value, index) => {
            const x = milestones.length === 1
                ? chartWidth / 2
                : padding.left + (plotWidth / (milestones.length - 1)) * index;

            const y = baseY - (value / maxValue) * plotHeight;

            return {
                x,
                y,
                value,
                milestone: milestones[index]
            };
        });
    }

    const plannedPoints = createPoints(plannedValues);
    const actualPoints = createPoints(actualValues);

    const plannedPolylinePoints = plannedPoints
        .map((point) => `${point.x},${point.y}`)
        .join(' ');

    const actualPolylinePoints = actualPoints
        .map((point) => `${point.x},${point.y}`)
        .join(' ');

    const actualAreaPoints = `
        ${actualPolylinePoints}
        ${actualPoints[actualPoints.length - 1].x},${baseY}
        ${actualPoints[0].x},${baseY}
    `;

    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = baseY - plotHeight * ratio;
        const value = Math.round(maxValue * ratio);

        return `
            <line
                class="report-line-grid"
                x1="${padding.left}"
                y1="${y}"
                x2="${chartWidth - padding.right}"
                y2="${y}"
            ></line>

            <text
                class="report-line-axis-label"
                x="${padding.left - 10}"
                y="${y + 4}"
                text-anchor="end"
            >${value}%</text>
        `;
    }).join('');

    const labels = actualPoints.map((point) => {
        const label = point.milestone.label || point.milestone.date;

        return `
            <text
                class="report-line-axis-label"
                x="${point.x}"
                y="${chartHeight - 16}"
                text-anchor="middle"
            >${label}</text>
        `;
    }).join('');

    const actualPointElements = actualPoints.map((point) => {
        return `
            <circle
                class="report-line-point"
                cx="${point.x}"
                cy="${point.y}"
                r="6"
            >
                <title>
                    ${point.milestone.label}: Planned ${point.milestone.planned}%,
                    Actual ${point.value}%
                </title>
            </circle>
        `;
    }).join('');

    container.innerHTML = `
        <svg
            class="report-line-chart"
            viewBox="0 0 ${chartWidth} ${chartHeight}"
            role="img"
            aria-label="Kế hoạch và tiến độ thực tế theo tuần"
        >
            <defs>
                <linearGradient id="actual-progress-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#0874c9" stop-opacity="0.18"></stop>
                    <stop offset="100%" stop-color="#0874c9" stop-opacity="0"></stop>
                </linearGradient>
            </defs>

            ${gridLines}

            <polygon
                points="${actualAreaPoints}"
                fill="url(#actual-progress-area)"
            ></polygon>

            <polyline
                points="${plannedPolylinePoints}"
                fill="none"
                stroke="#b7c3d5"
                stroke-width="4"
                stroke-dasharray="8 6"
            ></polyline>

            <polyline
                class="report-line-path"
                points="${actualPolylinePoints}"
            ></polyline>

            ${actualPointElements}
            ${labels}
        </svg>
    `;
}

function exportAnalyticsReport() {
    const originalTitle = document.title;

    const exportDate = new Date().toISOString().slice(0, 10);

    document.title = `ETRMS-Thong-ke-tong-quan-${exportDate}`;

    window.print();

    window.setTimeout(() => {
        document.title = originalTitle;
    }, 0);
}

document.addEventListener('DOMContentLoaded', () => {
    const reportData = getReportData();
    const milestones = getMilestones();

    const projectFilter = document.getElementById('report-project-filter');
    const departmentFilter = document.getElementById('report-department-filter');
    const periodFilter = document.getElementById('report-period-filter');
    const exportButton = document.getElementById('report-export-button');

    populateProjectFilter(reportData.projects);
    populateDepartmentFilter(reportData.employeesWsi);

    function refreshAnalytics() {
        const filteredTasks = getFilteredTasks(
            reportData.tasks,
            reportData.projects
        );

        const filteredMilestones = getFilteredMilestones(milestones);

        renderTaskStatusSummary(filteredTasks);
        renderWsiSummary(reportData.employeesWsi);
        renderMilestoneSummary(filteredMilestones);
    }

    projectFilter?.addEventListener('change', refreshAnalytics);
    periodFilter?.addEventListener('change', refreshAnalytics);
    departmentFilter?.addEventListener('change', refreshAnalytics);
    exportButton?.addEventListener('click', exportAnalyticsReport);
    
    refreshAnalytics();
});