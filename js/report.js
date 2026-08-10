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
        { date: '2026-08-01', completed: 2 },
        { date: '2026-08-05', completed: 4 },
        { date: '2026-08-10', completed: 6 },
        { date: '2026-08-15', completed: 5 }
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
        { key: 'TO_DO', label: 'Chưa bắt đầu', color: '#94a3b8' },
        { key: 'IN_PROGRESS', label: 'Đang thực hiện', color: '#3b82f6' },
        { key: 'BLOCKED', label: 'Bị chặn', color: '#ef4444' },
        { key: 'DONE', label: 'Hoàn thành', color: '#10b981' }
    ];

    const counts = {
        TO_DO: 0,
        IN_PROGRESS: 0,
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
                aria-label="Phân bố trạng thái công việc"
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

function getFilteredTasks(tasks, projects) {
    const projectFilter = document.getElementById('report-project-filter');
    const dateFromInput = document.getElementById('report-date-from');
    const dateToInput = document.getElementById('report-date-to');

    const selectedProjectId = projectFilter ? projectFilter.value : '';
    const dateFrom = dateFromInput ? dateFromInput.value : '';
    const dateTo = dateToInput ? dateToInput.value : '';

    const selectedProject = projects.find((project) => {
        return String(project.id) === selectedProjectId;
    });

    return tasks.filter((task) => {
        const taskDate = task.dueDate || '';

        if (!isDateInRange(taskDate, dateFrom, dateTo)) {
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
    const dateFromInput = document.getElementById('report-date-from');
    const dateToInput = document.getElementById('report-date-to');

    const dateFrom = dateFromInput ? dateFromInput.value : '';
    const dateTo = dateToInput ? dateToInput.value : '';

    return milestones.filter((milestone) => {
        return isDateInRange(milestone.date, dateFrom, dateTo);
    });
}

function renderWsiSummary(employeesWsi) {
    const container = document.getElementById('department-wsi-chart');

    if (!container) {
        return;
    }

    if (employeesWsi.length === 0) {
        renderEmptyState(
            'department-wsi-chart',
            'Chưa có dữ liệu sức tải nhân sự.'
        );
        return;
    }

    const groupedDepartments = {};

    employeesWsi.forEach((employee) => {
        const departmentName =
            employee.departmentName ||
            employee.department ||
            'Chưa phân phòng';

        if (!groupedDepartments[departmentName]) {
            groupedDepartments[departmentName] = {
                totalWsi: 0,
                employeeCount: 0
            };
        }

        groupedDepartments[departmentName].totalWsi += Number(employee.wsi) || 0;
        groupedDepartments[departmentName].employeeCount += 1;
    });

    const bars = Object.entries(groupedDepartments).map(([name, data]) => {
        const averageWsi = Math.round(data.totalWsi / data.employeeCount);
        const barWidth = Math.min(averageWsi, 100);

        let stateClass = 'is-safe';

        if (averageWsi === 100) {
            stateClass = 'is-warning';
        }

        if (averageWsi > 100) {
            stateClass = 'is-danger';
        }

        return `
            <div>
                <div class="report-bar-label">
                    <span>${name}</span>
                    <strong>${averageWsi}%</strong>
                </div>
                <div class="report-bar-track">
                    <div
                        class="report-bar-value ${stateClass}"
                        style="width: ${barWidth}%"
                    ></div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="report-bar-chart">
            ${bars}
        </div>
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

    const chartWidth = 640;
    const chartHeight = 240;
    const padding = {
        top: 24,
        right: 24,
        bottom: 42,
        left: 42
    };

    const values = milestones.map((milestone) => {
        return Number(milestone.completed) || 0;
    });

    const maxValue = Math.max(...values, 1);
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const points = milestones.map((milestone, index) => {
        const x = milestones.length === 1
            ? chartWidth / 2
            : padding.left + (plotWidth / (milestones.length - 1)) * index;

        const y = padding.top + plotHeight
            - ((Number(milestone.completed) || 0) / maxValue) * plotHeight;

        return {
            x,
            y,
            date: milestone.date,
            completed: Number(milestone.completed) || 0
        };
    });

    const polylinePoints = points
        .map((point) => `${point.x},${point.y}`)
        .join(' ');

    const horizontalGrid = [0, 0.5, 1].map((ratio) => {
        const y = padding.top + plotHeight - plotHeight * ratio;
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
            >${value}</text>
        `;
    }).join('');

    const pointElements = points.map((point) => {
        return `
            <circle
                class="report-line-point"
                cx="${point.x}"
                cy="${point.y}"
                r="5"
            >
                <title>${point.date}: ${point.completed} milestone</title>
            </circle>

            <text
                class="report-line-axis-label"
                x="${point.x}"
                y="${chartHeight - 14}"
                text-anchor="middle"
            >${point.date.slice(5)}</text>
        `;
    }).join('');

    container.innerHTML = `
        <svg
            class="report-line-chart"
            viewBox="0 0 ${chartWidth} ${chartHeight}"
            role="img"
            aria-label="Tốc độ hoàn thành milestone"
        >
            ${horizontalGrid}

            <polyline
                class="report-line-path"
                points="${polylinePoints}"
            ></polyline>

            ${pointElements}
        </svg>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const reportData = getReportData();
    const milestones = getMilestones();

    const projectFilter = document.getElementById('report-project-filter');
    const departmentFilter = document.getElementById('report-department-filter');
    const dateFromInput = document.getElementById('report-date-from');
    const dateToInput = document.getElementById('report-date-to');
    const resetFiltersButton = document.getElementById('reset-report-filters');

    populateProjectFilter(reportData.projects);

    if (departmentFilter) {
        departmentFilter.disabled = true;
        departmentFilter.title = 'Chờ dữ liệu phòng ban từ module Nhân sự';
        departmentFilter.innerHTML =
            '<option value="">Chưa có dữ liệu phòng ban</option>';
    }

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

    function resetAnalyticsFilters() {
        if (projectFilter) {
            projectFilter.value = '';
        }

        if (dateFromInput) {
            dateFromInput.value = '';
        }

        if (dateToInput) {
            dateToInput.value = '';
        }

        refreshAnalytics();
    }

    projectFilter?.addEventListener('change', refreshAnalytics);
    dateFromInput?.addEventListener('change', refreshAnalytics);
    dateToInput?.addEventListener('change', refreshAnalytics);
    resetFiltersButton?.addEventListener('click', resetAnalyticsFilters);

    refreshAnalytics();
});