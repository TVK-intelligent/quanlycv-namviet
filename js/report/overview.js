/**
 * Overview Analytics Report (js/report/overview.js)
 * Synchronized with etrms-projects, etrms_tasks, and etrms_employees
 */

const REPORT_STORAGE_KEYS = {
    projectsPrimary: 'etrms-projects',
    projectsSecondary: 'etrms_projects',
    tasks: 'etrms_tasks',
    employees: 'etrms_employees',
    employeesWsi: 'etrms_employees_wsi',
    timesheets: 'etrms_timesheet_entries',
    milestones: 'etrms_report_mock_milestones'
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

function getDefaultProjects() {
    return [
        { id: 'proj_001', code: 'PRJ-2024-001', name: 'Hệ thống Quản lý Nhân sự v2', status: 'IN_PROGRESS', pmUserName: 'Nguyễn Văn An', progress: 65 },
        { id: 'proj_002', code: 'PRJ-2024-001-A', name: 'Module Tuyển dụng', status: 'COMPLETED', pmUserName: 'Nguyễn Văn An', progress: 100 },
        { id: 'proj_003', code: 'PRJ-2024-001-B', name: 'Module Chấm công & Phê duyệt', status: 'IN_PROGRESS', pmUserName: 'Hoàng Văn Em', progress: 40 },
        { id: 'proj_004', code: 'PRJ-2024-002', name: 'Cổng thông tin Khách hàng', status: 'IN_PROGRESS', pmUserName: 'Hoàng Văn Em', progress: 30 },
        { id: 'proj_005', code: 'PRJ-2024-003', name: 'Hạ tầng Cloud & CI/CD Microservices', status: 'IN_PROGRESS', pmUserName: 'Trần Văn Minh', progress: 85 }
    ];
}

function getDefaultTasks() {
    return [
        { id: 101, code: 'TASK-101', title: 'Dev Backend API Xác thực người dùng', project: 'Triển khai CRM', department: 'Phát triển Phần mềm', assignee: 'Khải Trần Văn', priority: 'P1', status: 'IN_PROGRESS', estHours: 16, loggedHours: 12, dueDate: '2026-09-15', isOverdue: false },
        { id: 102, code: 'TASK-102', title: 'Thiết kế Mockup UI Dashboard & Workspace', project: 'Thiết kế hệ thống ETRMS', department: 'Thiết kế UI/UX', assignee: 'Hải Nam', priority: 'P2', status: 'DONE', estHours: 24, loggedHours: 22, dueDate: '2026-08-20', isOverdue: false },
        { id: 103, code: 'TASK-103', title: 'Khảo sát quy trình nghiệp vụ các phòng ban', project: 'Hệ thống Vận hành Nội bộ', department: 'QA & Đảm bảo Chất lượng', assignee: 'Lê Gia Bách', priority: 'P3', status: 'TO_DO', estHours: 16, loggedHours: 0, dueDate: '2026-09-25', isOverdue: false },
        { id: 104, code: 'TASK-104', title: 'Thiết lập Gateway DoR và Review Defect Gate', project: 'Hệ thống Quản lý Nhân sự v2', department: 'Phát triển Phần mềm', assignee: 'Trần Minh', priority: 'P1', status: 'DONE', estHours: 32, loggedHours: 30, dueDate: '2026-08-28', isOverdue: false },
        { id: 105, code: 'TASK-105', title: 'Kiểm thử hộp đen API Chấm công', project: 'Module Chấm công & Phê duyệt', department: 'QA & Đảm bảo Chất lượng', assignee: 'Nguyễn Tuấn Bùi', priority: 'P2', status: 'IN_REVIEW', estHours: 20, loggedHours: 18, dueDate: '2026-09-02', isOverdue: false },
        { id: 106, code: 'TASK-106', title: 'Tối ưu hiệu năng Database & Replication', project: 'Hạ tầng Cloud & CI/CD Microservices', department: 'Vận hành Hạ tầng & Cloud', assignee: 'Hoàng Văn Em', priority: 'P1', status: 'BLOCKED', estHours: 40, loggedHours: 14, dueDate: '2026-08-10', isOverdue: true },
        { id: 107, code: 'TASK-107', title: 'Viết tài liệu User Guide cho module Dự án', project: 'Hệ thống Quản lý Nhân sự v2', department: 'Phát triển Sản phẩm', assignee: 'Hải Nam', priority: 'P3', status: 'DONE', estHours: 12, loggedHours: 12, dueDate: '2026-08-15', isOverdue: false },
        { id: 108, code: 'TASK-108', title: 'Báo cáo tài chính và ngân sách quý', project: 'Cổng thông tin Khách hàng', department: 'Tài chính - Kế toán', assignee: 'Nguyễn Văn An', priority: 'P2', status: 'IN_PROGRESS', estHours: 18, loggedHours: 10, dueDate: '2026-09-30', isOverdue: false }
    ];
}

function getMilestones() {
    const stored = readStoredArray(REPORT_STORAGE_KEYS.milestones);
    if (stored.length > 0) return stored;

    const defaultMilestones = [
        { date: '2026-08-01', label: 'Tuần 1', planned: 20, completed: 18 },
        { date: '2026-08-08', label: 'Tuần 2', planned: 40, completed: 38 },
        { date: '2026-08-15', label: 'Tuần 3', planned: 60, completed: 55 },
        { date: '2026-08-22', label: 'Tuần 4', planned: 75, completed: 72 },
        { date: '2026-08-29', label: 'Tuần 5', planned: 90, completed: 86 },
        { date: '2026-09-05', label: 'Hiện tại', planned: 100, completed: 94 }
    ];

    try {
        localStorage.setItem(REPORT_STORAGE_KEYS.milestones, JSON.stringify(defaultMilestones));
    } catch(e) {}
    return defaultMilestones;
}

function getReportData() {
    let projects = readStoredArray(REPORT_STORAGE_KEYS.projectsPrimary);
    if (!projects || projects.length === 0) {
        projects = readStoredArray(REPORT_STORAGE_KEYS.projectsSecondary);
    }
    if (!projects || projects.length === 0) {
        projects = getDefaultProjects();
    }

    // Normalize project properties (name, code)
    projects = projects.map(p => ({
        id: p.id || p.projectCode || p.code,
        code: p.projectCode || p.code || p.id,
        name: p.projectName || p.name || 'Dự án',
        status: p.status || 'IN_PROGRESS',
        pmUserName: p.pmUserName || p.pm || 'PM',
        progress: p.progress || 0
    }));

    let tasks = readStoredArray(REPORT_STORAGE_KEYS.tasks);
    if (!tasks || tasks.length === 0) {
        tasks = getDefaultTasks();
    }

    let employees = readStoredArray(REPORT_STORAGE_KEYS.employees);
    let employeesWsi = readStoredArray(REPORT_STORAGE_KEYS.employeesWsi);

    let timesheets = readStoredArray(REPORT_STORAGE_KEYS.timesheets);

    return { projects, tasks, employees, employeesWsi, timesheets };
}

function normalizeTaskStatus(status) {
    const s = String(status || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
    if (s === 'DONE' || s === 'COMPLETED') return 'DONE';
    if (s === 'IN_PROGRESS') return 'IN_PROGRESS';
    if (s === 'IN_REVIEW') return 'IN_REVIEW';
    if (s === 'BLOCKED') return 'BLOCKED';
    return 'TO_DO';
}

function getTaskDepartment(task) {
    return task.department || task.departmentName || task.teamName || 'Phát triển Phần mềm';
}

function updateKpiCards(data, filteredTasks) {
    const totalProjects = data.projects.length;
    const activeProjects = data.projects.filter(p => p.status !== 'COMPLETED').length;
    
    const kpiProjectsEl = document.getElementById('kpi-total-projects');
    const kpiProjectsStatusEl = document.getElementById('kpi-projects-status');
    if (kpiProjectsEl) kpiProjectsEl.textContent = activeProjects;
    if (kpiProjectsStatusEl) {
        kpiProjectsStatusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${activeProjects}/${totalProjects} dự án đang chạy`;
    }

    const totalTasks = filteredTasks.length;
    const doneTasks = filteredTasks.filter(t => normalizeTaskStatus(t.status) === 'DONE').length;
    
    const kpiTasksEl = document.getElementById('kpi-total-tasks');
    const kpiTasksDoneEl = document.getElementById('kpi-tasks-done');
    if (kpiTasksEl) kpiTasksEl.textContent = totalTasks;
    if (kpiTasksDoneEl) {
        const pctDone = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
        kpiTasksDoneEl.textContent = `${doneTasks} đã hoàn thành (${pctDone}%)`;
    }

    // On-Time Rate: Done tasks that were not overdue
    const overdueTasks = filteredTasks.filter(t => t.isOverdue || (normalizeTaskStatus(t.status) !== 'DONE' && t.dueDate && new Date(t.dueDate) < new Date()));
    let onTimeRate = 92.5;
    if (totalTasks > 0) {
        const onTimeCount = totalTasks - overdueTasks.length;
        onTimeRate = Math.max(0, Math.min(100, Math.round((onTimeCount / totalTasks) * 100 * 10) / 10));
    }
    const kpiOnTimeEl = document.getElementById('kpi-on-time-rate');
    const kpiOnTimeBadgeEl = document.getElementById('kpi-on-time-badge');
    if (kpiOnTimeEl) kpiOnTimeEl.textContent = `${onTimeRate}%`;
    if (kpiOnTimeBadgeEl) {
        if (onTimeRate >= 85) {
            kpiOnTimeBadgeEl.className = 'trend-up';
            kpiOnTimeBadgeEl.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> Đạt mục tiêu SLA`;
        } else {
            kpiOnTimeBadgeEl.className = 'trend-down';
            kpiOnTimeBadgeEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Có ${overdueTasks.length} task trễ hạn`;
        }
    }

    // Total Logged Hours
    let totalHours = 0;
    if (data.timesheets && data.timesheets.length > 0) {
        totalHours = data.timesheets.reduce((acc, cur) => acc + (Number(cur.hours) || 0), 0);
    }
    if (totalHours === 0) {
        totalHours = filteredTasks.reduce((acc, cur) => acc + (Number(cur.loggedHours) || Number(cur.estHours) || 8), 0);
    }
    const kpiHoursEl = document.getElementById('kpi-logged-hours');
    if (kpiHoursEl) kpiHoursEl.textContent = `${Math.round(totalHours)}h`;
}

function renderTaskStatusChart(tasks) {
    const container = document.getElementById('task-status-chart');
    if (!container) return;

    const statusItems = [
        { key: 'DONE', label: 'Hoàn thành (Done)', color: '#1677ff' },
        { key: 'IN_PROGRESS', label: 'Đang làm (In Progress)', color: '#52c41a' },
        { key: 'IN_REVIEW', label: 'Chờ duyệt (In Review)', color: '#fa8c16' },
        { key: 'BLOCKED', label: 'Bị chặn (Blocked)', color: '#f5222d' },
        { key: 'TO_DO', label: 'Chưa làm (To Do)', color: '#8c8c8c' }
    ];

    const counts = { DONE: 0, IN_PROGRESS: 0, IN_REVIEW: 0, BLOCKED: 0, TO_DO: 0 };
    tasks.forEach(task => {
        const s = normalizeTaskStatus(task.status);
        if (counts[s] !== undefined) counts[s] += 1;
        else counts['TO_DO'] += 1;
    });

    const total = tasks.length;
    if (total === 0) {
        container.innerHTML = `<p style="padding: 40px; color: #8c8c8c;">Không có công việc nào trong bộ lọc này.</p>`;
        return;
    }

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    const segments = statusItems.map(item => {
        const count = counts[item.key];
        const segLen = (count / total) * circumference;
        const strokeDasharray = `${segLen} ${circumference - segLen}`;
        const strokeDashoffset = -offset;
        offset += segLen;

        return `
            <circle
                class="report-donut-segment"
                cx="90"
                cy="90"
                r="${radius}"
                stroke="${item.color}"
                stroke-dasharray="${strokeDasharray}"
                stroke-dashoffset="${strokeDashoffset}"
                transform="rotate(-90 90 90)"
            ></circle>
        `;
    }).join('');

    const legend = statusItems.map(item => {
        const count = counts[item.key];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
            <li>
                <span class="report-legend-label">
                    <span class="report-legend-dot" style="background-color: ${item.color};"></span>
                    ${item.label}
                </span>
                <strong>${count} <span style="font-weight: normal; color: #8c8c8c;">(${pct}%)</span></strong>
            </li>
        `;
    }).join('');

    container.innerHTML = `
        <div class="report-donut-layout">
            <svg class="report-donut-chart" viewBox="0 0 180 180" role="img" aria-label="Biểu đồ trạng thái công việc">
                <circle class="report-donut-track" cx="90" cy="90" r="${radius}"></circle>
                ${segments}
                <text class="report-donut-center" x="90" y="86">${total}</text>
                <text x="90" y="106" text-anchor="middle" fill="#64748b" font-size="12">Công việc</text>
            </svg>
            <ul class="report-chart-legend">
                ${legend}
            </ul>
        </div>
    `;
}

function renderDepartmentWsiChart(data, selectedDept) {
    const container = document.getElementById('department-wsi-chart');
    if (!container) return;

    // Build department WSI averages
    const deptMap = {
        'Phát triển Phần mềm': { count: 6, totalWsi: 580 },
        'QA & Đảm bảo Chất lượng': { count: 4, totalWsi: 380 },
        'Thiết kế UI/UX': { count: 3, totalWsi: 285 },
        'Vận hành Hạ tầng & Cloud': { count: 3, totalWsi: 330 },
        'Tài chính - Kế toán': { count: 2, totalWsi: 170 }
    };

    // If employees data available, enrich
    if (data.employees && data.employees.length > 0) {
        data.employees.forEach(emp => {
            const deptName = emp.deptName || emp.departmentName || (emp.deptId === 'DEPT_DEV' ? 'Phát triển Phần mềm' : emp.deptId === 'DEPT_QA' ? 'QA & Đảm bảo Chất lượng' : 'Phát triển Sản phẩm');
            const wsi = Number(emp.wsiCapacity) || 95;
            if (!deptMap[deptName]) deptMap[deptName] = { count: 0, totalWsi: 0 };
            deptMap[deptName].count += 1;
            deptMap[deptName].totalWsi += wsi;
        });
    }

    let stats = Object.keys(deptMap).map(dept => ({
        name: dept,
        avgWsi: Math.round(deptMap[dept].totalWsi / deptMap[dept].count)
    }));

    if (selectedDept) {
        stats = stats.filter(s => s.name === selectedDept);
    }

    if (stats.length === 0) {
        container.innerHTML = `<p style="padding: 40px; color: #8c8c8c;">Không có dữ liệu sức tải phòng ban.</p>`;
        return;
    }

    const chartWidth = 640;
    const chartHeight = 280;
    const padding = { top: 25, right: 20, bottom: 45, left: 45 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;
    const maxWsi = 140;

    const gridLines = [0, 50, 100, 125].map(val => {
        const y = padding.top + plotHeight - (val / maxWsi) * plotHeight;
        return `
            <line class="report-line-grid" x1="${padding.left}" y1="${y}" x2="${chartWidth - padding.right}" y2="${y}"></line>
            <text class="report-line-axis-label" x="${padding.left - 8}" y="${y + 4}" text-anchor="end">${val}%</text>
        `;
    }).join('');

    const slotWidth = plotWidth / stats.length;
    const barWidth = Math.min(48, slotWidth * 0.55);

    const bars = stats.map((item, idx) => {
        const barHeight = (item.avgWsi / maxWsi) * plotHeight;
        const x = padding.left + idx * slotWidth + (slotWidth - barWidth) / 2;
        const y = padding.top + plotHeight - barHeight;

        let barColor = '#1677ff'; // Normal
        if (item.avgWsi > 115) barColor = '#f5222d'; // Overload
        else if (item.avgWsi < 75) barColor = '#faad14'; // Low load

        // Shorten long department names for X axis
        let shortName = item.name;
        if (shortName.length > 14) {
            shortName = shortName.substring(0, 12) + '...';
        }

        return `
            <g class="report-wsi-bar-group">
                <rect class="report-wsi-bar" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${barColor}"></rect>
                <text class="report-wsi-value" x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="12" font-weight="600" fill="#1f2937">${item.avgWsi}%</text>
                <text class="report-line-axis-label" x="${x + barWidth / 2}" y="${chartHeight - 12}" text-anchor="middle" font-size="11" fill="#4b5563" title="${item.name}">${shortName}</text>
            </g>
        `;
    }).join('');

    container.innerHTML = `
        <svg class="report-wsi-svg" viewBox="0 0 ${chartWidth} ${chartHeight}" style="width: 100%; height: auto;">
            ${gridLines}
            ${bars}
        </svg>
    `;
}

function renderMilestoneChart(milestones) {
    const container = document.getElementById('milestone-chart');
    if (!container) return;

    if (!milestones || milestones.length === 0) {
        container.innerHTML = `<p style="padding: 40px; color: #8c8c8c;">Chưa có dữ liệu mốc tiến độ.</p>`;
        return;
    }

    const chartWidth = 720;
    const chartHeight = 280;
    const padding = { top: 25, right: 30, bottom: 40, left: 45 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;
    const maxVal = 100;

    const gridLines = [0, 25, 50, 75, 100].map(val => {
        const y = padding.top + plotHeight - (val / maxVal) * plotHeight;
        return `
            <line class="report-line-grid" x1="${padding.left}" y1="${y}" x2="${chartWidth - padding.right}" y2="${y}"></line>
            <text class="report-line-axis-label" x="${padding.left - 8}" y="${y + 4}" text-anchor="end">${val}%</text>
        `;
    }).join('');

    const stepX = plotWidth / (milestones.length - 1);
    const plannedPoints = [];
    const actualPoints = [];

    milestones.forEach((m, idx) => {
        const x = padding.left + idx * stepX;
        const plannedY = padding.top + plotHeight - (m.planned / maxVal) * plotHeight;
        const actualY = padding.top + plotHeight - (m.completed / maxVal) * plotHeight;
        plannedPoints.push(`${x},${plannedY}`);
        actualPoints.push(`${x},${actualY}`);
    });

    const plannedPolyline = plannedPoints.join(' ');
    const actualPolyline = actualPoints.join(' ');

    const actualAreaPoints = [
        `${padding.left},${padding.top + plotHeight}`,
        ...actualPoints,
        `${padding.left + plotWidth},${padding.top + plotHeight}`
    ].join(' ');

    const actualDots = milestones.map((m, idx) => {
        const x = padding.left + idx * stepX;
        const actualY = padding.top + plotHeight - (m.completed / maxVal) * plotHeight;
        return `
            <circle cx="${x}" cy="${actualY}" r="5" fill="#1677ff" stroke="#ffffff" stroke-width="2"></circle>
            <text class="report-line-axis-label" x="${x}" y="${chartHeight - 12}" text-anchor="middle" font-size="12" fill="#4b5563">${m.label}</text>
            <text x="${x}" y="${actualY - 10}" text-anchor="middle" font-size="11" font-weight="600" fill="#1677ff">${m.completed}%</text>
        `;
    }).join('');

    container.innerHTML = `
        <svg class="report-line-svg" viewBox="0 0 ${chartWidth} ${chartHeight}" style="width: 100%; height: auto;">
            <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#1677ff" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#1677ff" stop-opacity="0.0"/>
                </linearGradient>
            </defs>
            ${gridLines}
            <polygon points="${actualAreaPoints}" fill="url(#areaGradient)"></polygon>
            <polyline points="${plannedPolyline}" fill="none" stroke="#b7c3d5" stroke-width="2.5" stroke-dasharray="6 6"></polyline>
            <polyline points="${actualPolyline}" fill="none" stroke="#1677ff" stroke-width="3"></polyline>
            ${actualDots}
        </svg>
    `;
}

function exportCsvData(data, filteredTasks) {
    const headers = ['Mã Task', 'Tiêu đề', 'Dự án', 'Phòng ban', 'Người thực hiện', 'Độ ưu tiên', 'Trạng thái', 'Hạn hoàn thành', 'Giờ ước tính', 'Giờ thực tế'];
    const rows = filteredTasks.map(t => [
        t.code || `TASK-${t.id}`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${(t.project || '').replace(/"/g, '""')}"`,
        `"${(getTaskDepartment(t)).replace(/"/g, '""')}"`,
        `"${(t.assignee || '').replace(/"/g, '""')}"`,
        t.priority || 'P2',
        normalizeTaskStatus(t.status),
        t.dueDate || '',
        t.estHours || 0,
        t.loggedHours || 0
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ETRMS-Thong-ke-tong-quan-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Đã xuất dữ liệu tổng quan ra file CSV thành công!');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'report-toast success';
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #34d399;"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3500);
}

document.addEventListener('DOMContentLoaded', () => {
    const reportData = getReportData();
    const milestones = getMilestones();

    const projectFilter = document.getElementById('report-project-filter');
    const departmentFilter = document.getElementById('report-department-filter');
    const periodFilter = document.getElementById('report-period-filter');
    const resetFilterBtn = document.getElementById('report-reset-filter-btn');
    const exportButton = document.getElementById('report-export-button');
    const exportCsvButton = document.getElementById('report-export-csv-button');

    // Populate Projects dropdown
    if (projectFilter) {
        projectFilter.innerHTML = '<option value="">Tất cả dự án</option>';
        reportData.projects.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.name;
            opt.textContent = `${p.code} - ${p.name}`;
            projectFilter.appendChild(opt);
        });
    }

    // Populate Departments dropdown
    if (departmentFilter) {
        const departments = [...new Set(reportData.tasks.map(getTaskDepartment))].sort();
        departmentFilter.innerHTML = '<option value="">Tất cả phòng ban</option>';
        departments.forEach(dept => {
            const opt = document.createElement('option');
            opt.value = dept;
            opt.textContent = dept;
            departmentFilter.appendChild(opt);
        });
    }

    function refreshView() {
        const selectedProject = projectFilter ? projectFilter.value : '';
        const selectedDept = departmentFilter ? departmentFilter.value : '';

        let filteredTasks = reportData.tasks;
        if (selectedProject) {
            filteredTasks = filteredTasks.filter(t => t.project === selectedProject);
        }
        if (selectedDept) {
            filteredTasks = filteredTasks.filter(t => getTaskDepartment(t) === selectedDept);
        }

        updateKpiCards(reportData, filteredTasks);
        renderTaskStatusChart(filteredTasks);
        renderDepartmentWsiChart(reportData, selectedDept);
        renderMilestoneChart(milestones);
    }

    projectFilter?.addEventListener('change', refreshView);
    departmentFilter?.addEventListener('change', refreshView);
    periodFilter?.addEventListener('change', refreshView);

    resetFilterBtn?.addEventListener('click', () => {
        if (projectFilter) projectFilter.value = '';
        if (departmentFilter) departmentFilter.value = '';
        if (periodFilter) periodFilter.value = 'all';
        refreshView();
    });

    exportButton?.addEventListener('click', () => {
        window.print();
    });

    exportCsvButton?.addEventListener('click', () => {
        const selectedProject = projectFilter ? projectFilter.value : '';
        const selectedDept = departmentFilter ? departmentFilter.value : '';
        let filteredTasks = reportData.tasks;
        if (selectedProject) filteredTasks = filteredTasks.filter(t => t.project === selectedProject);
        if (selectedDept) filteredTasks = filteredTasks.filter(t => getTaskDepartment(t) === selectedDept);
        exportCsvData(reportData, filteredTasks);
    });

    // Initial render
    refreshView();
});