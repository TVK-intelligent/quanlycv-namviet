const PROJECT_REPORT_STORAGE_KEYS = {
    projects: 'etrms_projects',
    tasks: 'etrms_tasks',
    mockProjects: 'etrms_report_mock_projects',
    mockTasks: 'etrms_report_mock_tasks'
};

const PROJECT_REPORT_STATE = {
    projects: [],
    tasks: [],
    filteredProjects: [],
    currentPage: 1,
    pageSize: 5
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

function getMockProjects() {
    const storedProjects = readStoredArray(PROJECT_REPORT_STORAGE_KEYS.mockProjects);

    if (storedProjects.length > 0) {
        return storedProjects;
    }

    const projects = [
        { id: 'project-01', code: 'PJ-2024-01', name: 'Nâng cấp Hệ thống ERP', managerName: 'Nguyễn Văn A', status: 'IN_PROGRESS', estimatedHours: 1200, loggedHours: 980 },
        { id: 'project-05', code: 'PJ-2024-05', name: 'Triển khai CRM cho Khối Kinh doanh', managerName: 'Trần Thị B', status: 'IN_PROGRESS', estimatedHours: 850, loggedHours: 410 },
        { id: 'project-42', code: 'PJ-2023-42', name: 'Tái cấu trúc Hạ tầng Cloud', managerName: 'Lê Văn C', status: 'DONE', estimatedHours: 2500, loggedHours: 2460 },
        { id: 'project-11', code: 'PJ-2024-11', name: 'Phát triển Ứng dụng Mobile', managerName: 'Phạm Đức D', status: 'IN_PROGRESS', estimatedHours: 1600, loggedHours: 840 },
        { id: 'project-18', code: 'PJ-2024-18', name: 'Cổng thông tin nhân sự', managerName: 'Mai Ngọc N', status: 'IN_PROGRESS', estimatedHours: 720, loggedHours: 205 }
    ];

    localStorage.setItem(
        PROJECT_REPORT_STORAGE_KEYS.mockProjects,
        JSON.stringify(projects)
    );

    return projects;
}

function getMockTasks() {
    const storedTasks = readStoredArray(PROJECT_REPORT_STORAGE_KEYS.mockTasks);

    if (storedTasks.length > 0) {
        return storedTasks;
    }

    const groups = [
        { projectId: 'project-01', total: 150, done: 120, overdue: 5 },
        { projectId: 'project-05', total: 85, done: 40, overdue: 12 },
        { projectId: 'project-42', total: 210, done: 210, overdue: 0 },
        { projectId: 'project-11', total: 180, done: 95, overdue: 2 },
        { projectId: 'project-18', total: 72, done: 18, overdue: 8 }
    ];

    const tasks = groups.flatMap((group) => {
        return Array.from({ length: group.total }, (_, index) => {
            const isDone = index < group.done;
            const isOverdue = !isDone && index < group.done + group.overdue;

            return {
                id: `${group.projectId}-task-${index + 1}`,
                projectId: group.projectId,
                status: isDone ? 'DONE' : 'IN_PROGRESS',
                dueDate: isOverdue ? '2026-01-01' : '2026-12-31'
            };
        });
    });

    localStorage.setItem(
        PROJECT_REPORT_STORAGE_KEYS.mockTasks,
        JSON.stringify(tasks)
    );

    return tasks;
}

function getProjectReportData() {
    const storedProjects = readStoredArray(PROJECT_REPORT_STORAGE_KEYS.projects);
    const storedTasks = readStoredArray(PROJECT_REPORT_STORAGE_KEYS.tasks);

    if (storedProjects.length > 0 && storedTasks.length > 0) {
        return { projects: storedProjects, tasks: storedTasks };
    }

    return { projects: getMockProjects(), tasks: getMockTasks() };
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

function getProjectId(project) {
    return String(project.id || project.projectId || project.project_id || '');
}

function getTaskProjectId(task) {
    return String(task.projectId || task.project_id || '');
}

function getProjectName(project) {
    return project.name || project.projectName || 'Chưa đặt tên dự án';
}

function getProjectCode(project) {
    return project.code || project.projectCode || getProjectId(project);
}

function getProjectManagerName(project) {
    return project.managerName || project.pmName || project.projectManager || 'Chưa phân công';
}

function getProjectStatus(project) {
    return normalizeStatus(project.status || project.projectStatus);
}

function getStatusLabel(status) {
    const labels = {
        TO_DO: 'Chưa bắt đầu',
        IN_PROGRESS: 'Đang thực hiện',
        IN_REVIEW: 'Đang đánh giá',
        BLOCKED: 'Tạm dừng',
        DONE: 'Hoàn thành'
    };

    return labels[status] || labels.TO_DO;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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

function formatHours(value) {
    return `${Number(value || 0).toLocaleString('en-US')}h`;
}

function isOverdueTask(task) {
    const dueDate = task.dueDate || task.deadline || task.endDate;

    if (normalizeStatus(task.status) === 'DONE' || !dueDate) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(dueDate);
    deadline.setHours(0, 0, 0, 0);

    return !Number.isNaN(deadline.getTime()) && deadline < today;
}

function calculateProjectMetrics(project, tasks) {
    const projectTasks = tasks.filter((task) => {
        return getTaskProjectId(task) === getProjectId(project);
    });

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((task) => {
        return normalizeStatus(task.status) === 'DONE';
    }).length;
    const overdueTasks = projectTasks.filter(isOverdueTask).length;

    return {
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
        overdueRate: totalTasks
            ? Number(((overdueTasks / totalTasks) * 100).toFixed(1))
            : 0,
        estimatedHours: Number(project.estimatedHours || project.estHours || 0),
        loggedHours: Number(project.loggedHours || project.actualHours || 0)
    };
}

function getOverdueRateClass(rate) {
    if (rate === 0) return 'project-overdue-rate--none';
    if (rate >= 10) return 'project-overdue-rate--high';

    return 'project-overdue-rate--low';
}

function getProgressClass(rate) {
    if (rate >= 100) return 'project-progress--done';
    if (rate < 50) return 'project-progress--warning';

    return '';
}

function getPeriodRange(period) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    if (period === 'all') return null;

    if (period === 'current-year') {
        return { from: new Date(year, 0, 1), to: new Date(year, 11, 31) };
    }

    if (period === 'current-quarter') {
        const quarterStart = Math.floor(month / 3) * 3;

        return {
            from: new Date(year, quarterStart, 1),
            to: new Date(year, quarterStart + 3, 0)
        };
    }

    return { from: new Date(year, month, 1), to: new Date(year, month + 1, 0) };
}

function isProjectInPeriod(project, range) {
    if (!range) return true;

    const dateValue = project.startDate || project.createdAt || project.createdDate;

    
    if (!dateValue) return true;

    const projectDate = new Date(dateValue);

    return (
        !Number.isNaN(projectDate.getTime()) &&
        projectDate >= range.from &&
        projectDate <= range.to
    );
}

function populateFilters() {
    const pmFilter = document.getElementById('project-report-pm-filter');
    const statusFilter = document.getElementById('project-report-status-filter');

    if (pmFilter) {
        const managers = [...new Set(
            PROJECT_REPORT_STATE.projects.map(getProjectManagerName)
        )].sort();

        pmFilter.innerHTML = '<option value="all">Tất cả PM</option>';

        managers.forEach((manager) => {
            pmFilter.insertAdjacentHTML(
                'beforeend',
                `<option value="${escapeHtml(manager)}">${escapeHtml(manager)}</option>`
            );
        });
    }

    if (statusFilter) {
        const statuses = [...new Set(
            PROJECT_REPORT_STATE.projects.map(getProjectStatus)
        )];

        statusFilter.innerHTML = '<option value="all">Tất cả trạng thái</option>';

        statuses.forEach((status) => {
            statusFilter.insertAdjacentHTML(
                'beforeend',
                `<option value="${status}">${getStatusLabel(status)}</option>`
            );
        });
    }
}

function getFilteredProjects() {
    const period = document.getElementById('project-report-period')?.value || 'all';
    const manager = document.getElementById('project-report-pm-filter')?.value || 'all';
    const status = document.getElementById('project-report-status-filter')?.value || 'all';
    const range = getPeriodRange(period);

    return PROJECT_REPORT_STATE.projects.filter((project) => {
        return (
            isProjectInPeriod(project, range) &&
            (manager === 'all' || getProjectManagerName(project) === manager) &&
            (status === 'all' || getProjectStatus(project) === status)
        );
    });
}

function renderProjectRows(projects) {
    const tableBody = document.getElementById('project-report-tbody');

    if (!tableBody) return;

    if (projects.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="project-report-empty">
                    Không tìm thấy dự án phù hợp bộ lọc.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = projects.map((project) => {
        const metrics = calculateProjectMetrics(project, PROJECT_REPORT_STATE.tasks);
        const manager = getProjectManagerName(project);

        return `
            <tr>
                <td class="project-code"><a href="#">${escapeHtml(getProjectCode(project))}</a></td>
                <td class="project-name">${escapeHtml(getProjectName(project))}</td>
                <td>
                    <div class="project-manager">
                        <span class="project-manager-avatar">${escapeHtml(getInitials(manager))}</span>
                        <span>${escapeHtml(manager)}</span>
                    </div>
                </td>
                <td>${metrics.totalTasks}</td>
                <td class="project-completed">${metrics.completedTasks}</td>
                <td class="project-overdue">${metrics.overdueTasks}</td>
                <td><span class="project-overdue-rate ${getOverdueRateClass(metrics.overdueRate)}">${metrics.overdueRate}%</span></td>
                <td>${formatHours(metrics.estimatedHours)}</td>
                <td>${formatHours(metrics.loggedHours)}</td>
                <td>
                    <div class="project-progress-cell">
                        <span>${metrics.completionRate}%</span>
                        <div class="project-progress ${getProgressClass(metrics.completionRate)}">
                            <span style="width: ${metrics.completionRate}%"></span>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPagination() {
    const total = PROJECT_REPORT_STATE.filteredProjects.length;
    const totalPages = Math.max(1, Math.ceil(total / PROJECT_REPORT_STATE.pageSize));
    const currentPage = Math.min(PROJECT_REPORT_STATE.currentPage, totalPages);
    const summary = document.getElementById('project-report-summary');
    const pageNumbers = document.getElementById('project-report-page-numbers');
    const previousButton = document.getElementById('project-report-prev-page');
    const nextButton = document.getElementById('project-report-next-page');

    PROJECT_REPORT_STATE.currentPage = currentPage;

    if (summary) {
        const from = total === 0 ? 0 : (currentPage - 1) * PROJECT_REPORT_STATE.pageSize + 1;
        const to = Math.min(currentPage * PROJECT_REPORT_STATE.pageSize, total);

        summary.textContent = `Hiển thị ${from} đến ${to} của ${total} dự án`;
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

function renderReport() {
    PROJECT_REPORT_STATE.filteredProjects = getFilteredProjects();

    const startIndex = (PROJECT_REPORT_STATE.currentPage - 1) * PROJECT_REPORT_STATE.pageSize;
    const currentProjects = PROJECT_REPORT_STATE.filteredProjects.slice(
        startIndex,
        startIndex + PROJECT_REPORT_STATE.pageSize
    );

    renderProjectRows(currentProjects);
    renderPagination();
}

function handleFilterChange() {
    PROJECT_REPORT_STATE.currentPage = 1;
    renderReport();
}

function changePage(nextPage) {
    const totalPages = Math.max(
        1,
        Math.ceil(PROJECT_REPORT_STATE.filteredProjects.length / PROJECT_REPORT_STATE.pageSize)
    );

    PROJECT_REPORT_STATE.currentPage = Math.max(1, Math.min(nextPage, totalPages));
    renderReport();
}

function createCsvContent(projects) {
    const headers = [
        'Mã DA', 'Tên dự án', 'Quản lý (PM)', 'Tổng task', 'Hoàn thành',
        'Trễ hạn', 'Tỷ lệ trễ %', 'Est. Hours', 'Logged Hours', 'Tiến độ %'
    ];

    const rows = projects.map((project) => {
        const metrics = calculateProjectMetrics(project, PROJECT_REPORT_STATE.tasks);

        return [
            getProjectCode(project), getProjectName(project), getProjectManagerName(project),
            metrics.totalTasks, metrics.completedTasks, metrics.overdueTasks,
            metrics.overdueRate, metrics.estimatedHours, metrics.loggedHours,
            metrics.completionRate
        ];
    });

    return [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
}

function exportReport() {
    const content = `\uFEFF${createCsvContent(PROJECT_REPORT_STATE.filteredProjects)}`;
    const file = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(file);
    const downloadLink = document.createElement('a');

    downloadLink.href = url;
    downloadLink.download = 'bao-cao-du-an.csv';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(url);
}

function bindEvents() {
    ['project-report-period', 'project-report-pm-filter', 'project-report-status-filter']
        .forEach((id) => {
            document.getElementById(id)?.addEventListener('change', handleFilterChange);
        });

    document.getElementById('project-report-prev-page')?.addEventListener('click', () => {
        changePage(PROJECT_REPORT_STATE.currentPage - 1);
    });

    document.getElementById('project-report-next-page')?.addEventListener('click', () => {
        changePage(PROJECT_REPORT_STATE.currentPage + 1);
    });

    document.getElementById('project-report-page-numbers')?.addEventListener('click', (event) => {
        const page = Number(event.target.dataset.page);

        if (page) changePage(page);
    });

    document.getElementById('project-report-export-button')?.addEventListener('click', exportReport);

    document.getElementById('project-report-create-button')?.addEventListener('click', () => {
        alert('Chức năng tạo báo cáo mới sẽ được kết nối khi có data contract báo cáo.');
    });

    document.getElementById('project-report-advanced-filter')?.addEventListener('click', () => {
        alert('Bộ lọc nâng cao sẽ được bổ sung khi schema dự án thống nhất.');
    });
}

function initializeProjectReport() {
    const data = getProjectReportData();

    PROJECT_REPORT_STATE.projects = data.projects;
    PROJECT_REPORT_STATE.tasks = data.tasks;

    populateFilters();
    bindEvents();
    renderReport();
}

document.addEventListener('DOMContentLoaded', initializeProjectReport);
