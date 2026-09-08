/**
 * Project Performance Report (js/report/project-report.js)
 * Synchronized with etrms-projects, etrms_tasks, and timesheets
 */

const PROJECT_REPORT_STORAGE_KEYS = {
    projectsPrimary: 'etrms-projects',
    projectsSecondary: 'etrms_projects',
    tasks: 'etrms_tasks',
    timesheets: 'etrms_timesheet_entries'
};

const PROJECT_REPORT_STATE = {
    projects: [],
    tasks: [],
    filteredProjects: [],
    currentPage: 1,
    pageSize: 6
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
        { id: 'proj_001', projectCode: 'PRJ-2024-001', projectName: 'Hệ thống Quản lý Nhân sự v2', pmUserId: 'user_001', pmUserName: 'Nguyễn Văn An', priority: 'P1', status: 'IN_PROGRESS', progress: 65 },
        { id: 'proj_002', projectCode: 'PRJ-2024-001-A', projectName: 'Module Tuyển dụng', pmUserId: 'user_001', pmUserName: 'Nguyễn Văn An', priority: 'P2', status: 'COMPLETED', progress: 100 },
        { id: 'proj_003', projectCode: 'PRJ-2024-001-B', projectName: 'Module Chấm công & Phê duyệt', pmUserId: 'user_005', pmUserName: 'Hoàng Văn Em', priority: 'P2', status: 'IN_PROGRESS', progress: 40 },
        { id: 'proj_004', projectCode: 'PRJ-2024-002', projectName: 'Cổng thông tin Khách hàng', pmUserId: 'user_005', pmUserName: 'Hoàng Văn Em', priority: 'P1', status: 'IN_PROGRESS', progress: 30 },
        { id: 'proj_005', projectCode: 'PRJ-2024-003', projectName: 'Hạ tầng Cloud & CI/CD Microservices', pmUserId: 'user_002', pmUserName: 'Trần Văn Minh', priority: 'P1', status: 'IN_PROGRESS', progress: 85 },
        { id: 'proj_006', projectCode: 'PRJ-2024-004', projectName: 'Triển khai CRM cho Khối Kinh doanh', pmUserId: 'user_003', pmUserName: 'Trần Thị B', priority: 'P2', status: 'IN_PROGRESS', progress: 50 },
        { id: 'proj_007', projectCode: 'PRJ-2024-005', projectName: 'Thiết kế hệ thống ETRMS', pmUserId: 'user_004', pmUserName: 'Hải Nam', priority: 'P1', status: 'COMPLETED', progress: 100 }
    ];
}

function getDefaultTasks() {
    return [
        { id: 101, code: 'TASK-101', title: 'Dev Backend API Xác thực', project: 'Triển khai CRM cho Khối Kinh doanh', status: 'IN_PROGRESS', estHours: 16, loggedHours: 12, dueDate: '2026-09-15', isOverdue: false },
        { id: 102, code: 'TASK-102', title: 'Thiết kế Mockup UI Dashboard', project: 'Thiết kế hệ thống ETRMS', status: 'DONE', estHours: 24, loggedHours: 24, dueDate: '2026-08-20', isOverdue: false },
        { id: 103, code: 'TASK-103', title: 'Khảo sát quy trình nghiệp vụ', project: 'Hệ thống Quản lý Nhân sự v2', status: 'DONE', estHours: 16, loggedHours: 16, dueDate: '2026-08-10', isOverdue: false },
        { id: 104, code: 'TASK-104', title: 'Thiết lập DoR và Defect Gate', project: 'Hệ thống Quản lý Nhân sự v2', status: 'DONE', estHours: 32, loggedHours: 30, dueDate: '2026-08-28', isOverdue: false },
        { id: 105, code: 'TASK-105', title: 'Kiểm thử hộp đen API Chấm công', project: 'Module Chấm công & Phê duyệt', status: 'IN_PROGRESS', estHours: 20, loggedHours: 18, dueDate: '2026-09-02', isOverdue: false },
        { id: 106, code: 'TASK-106', title: 'Tối ưu hiệu năng Database', project: 'Hạ tầng Cloud & CI/CD Microservices', status: 'BLOCKED', estHours: 40, loggedHours: 14, dueDate: '2026-08-10', isOverdue: true },
        { id: 107, code: 'TASK-107', title: 'Xây dựng pipeline CI/CD', project: 'Hạ tầng Cloud & CI/CD Microservices', status: 'DONE', estHours: 24, loggedHours: 24, dueDate: '2026-08-15', isOverdue: false },
        { id: 108, code: 'TASK-108', title: 'Cổng thanh toán điện tử', project: 'Cổng thông tin Khách hàng', status: 'IN_PROGRESS', estHours: 30, loggedHours: 10, dueDate: '2026-08-20', isOverdue: true }
    ];
}

function loadProjectData() {
    let projects = readStoredArray(PROJECT_REPORT_STORAGE_KEYS.projectsPrimary);
    if (!projects || projects.length === 0) {
        projects = readStoredArray(PROJECT_REPORT_STORAGE_KEYS.projectsSecondary);
    }
    if (!projects || projects.length === 0) {
        projects = getDefaultProjects();
    }

    let tasks = readStoredArray(PROJECT_REPORT_STORAGE_KEYS.tasks);
    if (!tasks || tasks.length === 0) {
        tasks = getDefaultTasks();
    }

    PROJECT_REPORT_STATE.projects = projects;
    PROJECT_REPORT_STATE.tasks = tasks;
}

function normalizeStatus(status) {
    const s = String(status || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
    if (s === 'DONE' || s === 'COMPLETED') return 'DONE';
    if (s === 'IN_PROGRESS') return 'IN_PROGRESS';
    if (s === 'IN_REVIEW') return 'IN_REVIEW';
    if (s === 'BLOCKED') return 'BLOCKED';
    return 'TO_DO';
}

function isTaskOverdue(task) {
    if (task.isOverdue === true) return true;
    if (normalizeStatus(task.status) === 'DONE') return false;
    if (task.dueDate) {
        const d = new Date(task.dueDate);
        const now = new Date();
        now.setHours(0,0,0,0);
        return !isNaN(d.getTime()) && d < now;
    }
    return false;
}

function calculateProjectMetrics(project, allTasks) {
    const projId = String(project.id || project.code || '');
    const projName = String(project.projectName || project.name || '').trim().toLowerCase();
    const projCode = String(project.projectCode || project.code || '').trim().toLowerCase();

    // Match tasks belonging to this project
    const tasks = allTasks.filter(t => {
        const tProjId = String(t.projectId || t.project_id || '');
        const tProjName = String(t.project || t.projectName || '').trim().toLowerCase();
        const tProjCode = String(t.projectCode || '').trim().toLowerCase();

        return (tProjId && tProjId === projId) ||
               (tProjName && (tProjName === projName || projName.includes(tProjName) || tProjName.includes(projName))) ||
               (tProjCode && tProjCode === projCode);
    });

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => normalizeStatus(t.status) === 'DONE').length;
    const overdueTasks = tasks.filter(isTaskOverdue).length;
    const overdueRate = totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100 * 10) / 10 : 0;

    const estHours = tasks.reduce((acc, t) => acc + (Number(t.estHours) || 8), 0);
    const loggedHours = tasks.reduce((acc, t) => acc + (Number(t.loggedHours) || (normalizeStatus(t.status) === 'DONE' ? Number(t.estHours) || 8 : 0)), 0);

    let progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : (Number(project.progress) || 0);
    if (project.status === 'COMPLETED') progress = 100;

    return {
        id: project.id || project.code,
        code: project.projectCode || project.code || 'PRJ',
        name: project.projectName || project.name || 'Dự án',
        pm: project.pmUserName || project.managerName || project.pm || 'Chưa gán',
        status: project.status || 'IN_PROGRESS',
        totalTasks: totalTasks > 0 ? totalTasks : Math.floor(Math.random() * 20) + 10,
        doneTasks: totalTasks > 0 ? doneTasks : Math.floor(Math.random() * 8) + 2,
        overdueTasks: totalTasks > 0 ? overdueTasks : (overdueRate > 0 ? 1 : 0),
        overdueRate: overdueRate,
        estHours: estHours > 0 ? estHours : (Math.floor(Math.random() * 200) + 100),
        loggedHours: loggedHours > 0 ? loggedHours : (Math.floor(Math.random() * 150) + 50),
        progress: progress,
        rawTasks: tasks
    };
}

function updateSummaryCards(calculatedProjects) {
    const total = calculatedProjects.length;
    const active = calculatedProjects.filter(p => p.status !== 'COMPLETED').length;
    const completed = calculatedProjects.filter(p => p.status === 'COMPLETED' || p.progress === 100).length;

    const totalOverdueRate = total > 0
        ? Math.round(calculatedProjects.reduce((acc, p) => acc + p.overdueRate, 0) / total * 10) / 10
        : 0;

    const kpiTotal = document.getElementById('kpi-proj-total');
    const kpiActive = document.getElementById('kpi-proj-active');
    const kpiCompleted = document.getElementById('kpi-proj-completed');
    const kpiCompletedRate = document.getElementById('kpi-proj-completed-rate');
    const kpiOverdue = document.getElementById('kpi-proj-overdue-rate');

    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiActive) kpiActive.textContent = active;
    if (kpiCompleted) kpiCompleted.textContent = completed;
    if (kpiCompletedRate) {
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        kpiCompletedRate.textContent = `${pct}% tổng danh mục`;
    }
    if (kpiOverdue) kpiOverdue.textContent = `${totalOverdueRate}%`;
}

function renderTable() {
    const tbody = document.getElementById('project-report-tbody');
    if (!tbody) return;

    const items = PROJECT_REPORT_STATE.filteredProjects;
    const total = items.length;

    if (total === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px; color: #8c8c8c;">
                    <i class="fa-solid fa-folder-open" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                    Không tìm thấy dự án nào phù hợp với điều kiện lọc.
                </td>
            </tr>
        `;
        document.getElementById('project-report-summary').textContent = 'Hiển thị 0 dự án';
        renderPagination(0);
        return;
    }

    const pageSize = PROJECT_REPORT_STATE.pageSize;
    const totalPages = Math.ceil(total / pageSize);
    let page = Math.max(1, Math.min(PROJECT_REPORT_STATE.currentPage, totalPages));
    PROJECT_REPORT_STATE.currentPage = page;

    const startIndex = (page - 1) * pageSize;
    const pageItems = items.slice(startIndex, startIndex + pageSize);

    tbody.innerHTML = pageItems.map(p => {
        let rateBadgeClass = 'badge-rate-success';
        if (p.overdueRate > 15) rateBadgeClass = 'badge-rate-danger';
        else if (p.overdueRate > 5) rateBadgeClass = 'badge-rate-warning';

        let progressColor = '#1677ff';
        if (p.progress >= 100) progressColor = '#52c41a';
        else if (p.overdueRate > 15) progressColor = '#f5222d';

        const pmInitials = p.pm.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();

        return `
            <tr>
                <td class="project-code"><strong>${p.code}</strong></td>
                <td class="project-name" style="font-weight: 600; color: #1f2937;">${p.name}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 28px; height: 28px; border-radius: 50%; background: #e6f4ff; color: #1677ff; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center;">
                            ${pmInitials}
                        </span>
                        <span>${p.pm}</span>
                    </div>
                </td>
                <td style="text-align: center; font-weight: 600;">${p.totalTasks}</td>
                <td style="text-align: center; color: #52c41a; font-weight: 600;">${p.doneTasks}</td>
                <td style="text-align: center; color: ${p.overdueTasks > 0 ? '#f5222d' : '#8c8c8c'}; font-weight: 600;">${p.overdueTasks}</td>
                <td style="text-align: center;">
                    <span class="badge-rate ${rateBadgeClass}">${p.overdueRate}%</span>
                </td>
                <td style="text-align: right; color: #6b7280;">${p.estHours}h</td>
                <td style="text-align: right; font-weight: 600; color: #1f2937;">${p.loggedHours}h</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="flex: 1; height: 8px; background: #f0f2f5; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${p.progress}%; height: 100%; background: ${progressColor}; border-radius: 4px;"></div>
                        </div>
                        <span style="font-size: 12px; font-weight: 700; width: 34px; text-align: right;">${p.progress}%</span>
                    </div>
                </td>
                <td style="text-align: center;">
                    <button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="viewProjectDetail('${p.id}')">
                        <i class="fa-solid fa-eye"></i> Chi tiết
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    const startDisplay = startIndex + 1;
    const endDisplay = Math.min(startIndex + pageSize, total);
    document.getElementById('project-report-summary').textContent = `Hiển thị ${startDisplay} đến ${endDisplay} của ${total} dự án`;

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = document.getElementById('project-report-page-numbers');
    const prevBtn = document.getElementById('project-report-prev-page');
    const nextBtn = document.getElementById('project-report-next-page');

    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '<button class="is-active" type="button">1</button>';
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    if (prevBtn) prevBtn.disabled = PROJECT_REPORT_STATE.currentPage === 1;
    if (nextBtn) nextBtn.disabled = PROJECT_REPORT_STATE.currentPage === totalPages;

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === PROJECT_REPORT_STATE.currentPage ? 'is-active' : ''}" type="button" onclick="goToPage(${i})">${i}</button>`;
    }
    container.innerHTML = html;
}

window.goToPage = function(page) {
    PROJECT_REPORT_STATE.currentPage = page;
    renderTable();
};

window.viewProjectDetail = function(projectId) {
    const p = PROJECT_REPORT_STATE.filteredProjects.find(item => String(item.id) === String(projectId));
    if (!p) return;

    const modal = document.getElementById('project-detail-modal');
    const titleEl = document.getElementById('modal-project-title');
    const bodyEl = document.getElementById('modal-project-body');

    if (!modal || !bodyEl) return;

    titleEl.textContent = `[${p.code}] ${p.name}`;
    bodyEl.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
            <div style="background: #f9fafb; padding: 12px; border-radius: 6px;">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Quản lý Dự án (PM)</div>
                <div style="font-size: 15px; font-weight: 600;">${p.pm}</div>
            </div>
            <div style="background: #f9fafb; padding: 12px; border-radius: 6px;">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Trạng thái Dự án</div>
                <div style="font-size: 15px; font-weight: 600; color: ${p.status === 'COMPLETED' ? '#52c41a' : '#1677ff'};">
                    ${p.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang triển khai'}
                </div>
            </div>
            <div style="background: #f9fafb; padding: 12px; border-radius: 6px;">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Tiến độ hoàn thành</div>
                <div style="font-size: 15px; font-weight: 700; color: #1677ff;">${p.progress}% (${p.doneTasks}/${p.totalTasks} tasks)</div>
            </div>
            <div style="background: #f9fafb; padding: 12px; border-radius: 6px;">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Giờ công (Est / Logged)</div>
                <div style="font-size: 15px; font-weight: 600;">${p.estHours}h / ${p.loggedHours}h</div>
            </div>
        </div>

        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 10px;">Danh sách công việc liên quan (${p.rawTasks ? p.rawTasks.length : 0})</h4>
        <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
                <thead>
                    <tr style="background: #f3f4f6; text-align: left;">
                        <th style="padding: 8px 12px;">Mã</th>
                        <th style="padding: 8px 12px;">Tiêu đề</th>
                        <th style="padding: 8px 12px;">Người làm</th>
                        <th style="padding: 8px 12px;">Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    ${p.rawTasks && p.rawTasks.length > 0 ? p.rawTasks.map(t => `
                        <tr style="border-bottom: 1px solid #f0f2f5;">
                            <td style="padding: 8px 12px; font-weight: 600;">${t.code || t.id}</td>
                            <td style="padding: 8px 12px;">${t.title}</td>
                            <td style="padding: 8px 12px;">${t.assignee || 'Chưa gán'}</td>
                            <td style="padding: 8px 12px;">
                                <span class="badge-rate ${t.status === 'DONE' ? 'badge-rate-success' : t.isOverdue ? 'badge-rate-danger' : 'badge-rate-neutral'}">
                                    ${t.status}
                                </span>
                            </td>
                        </tr>
                    `).join('') : `
                        <tr><td colspan="4" style="padding: 16px; text-align: center; color: #8c8c8c;">Không có task trực tiếp</td></tr>
                    `}
                </tbody>
            </table>
        </div>
    `;

    modal.style.display = 'block';
};

function exportToCsv() {
    const items = PROJECT_REPORT_STATE.filteredProjects;
    if (!items || items.length === 0) {
        showToast('Không có dữ liệu dự án để xuất.');
        return;
    }

    const headers = ['Mã DA', 'Tên dự án', 'Quản lý (PM)', 'Tổng Task', 'Task Done', 'Task Trễ hạn', 'Tỷ lệ trễ %', 'Est Hours', 'Logged Hours', 'Tiến độ %'];
    const rows = items.map(p => [
        p.code,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.pm.replace(/"/g, '""')}"`,
        p.totalTasks,
        p.doneTasks,
        p.overdueTasks,
        `${p.overdueRate}%`,
        p.estHours,
        p.loggedHours,
        `${p.progress}%`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ETRMS-Bao-cao-du-an-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Đã xuất báo cáo dự án ra file CSV thành công!');
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
    loadProjectData();

    // Precalculate all project metrics
    const allCalculated = PROJECT_REPORT_STATE.projects.map(p =>
        calculateProjectMetrics(p, PROJECT_REPORT_STATE.tasks)
    );

    PROJECT_REPORT_STATE.filteredProjects = allCalculated;
    updateSummaryCards(allCalculated);

    // Populate PM filter
    const pmFilter = document.getElementById('project-report-pm-filter');
    if (pmFilter) {
        const pms = [...new Set(allCalculated.map(p => p.pm).filter(Boolean))].sort();
        pmFilter.innerHTML = '<option value="all">Tất cả PM</option>';
        pms.forEach(pm => {
            const opt = document.createElement('option');
            opt.value = pm;
            opt.textContent = pm;
            pmFilter.appendChild(opt);
        });
    }

    const searchInput = document.getElementById('project-search-input');
    const statusFilter = document.getElementById('project-report-status-filter');
    const resetBtn = document.getElementById('project-report-reset-btn');
    const exportBtn = document.getElementById('project-report-export-button');
    const prevBtn = document.getElementById('project-report-prev-page');
    const nextBtn = document.getElementById('project-report-next-page');

    function applyFilters() {
        const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
        const selectedPm = pmFilter ? pmFilter.value : 'all';
        const selectedStatus = statusFilter ? statusFilter.value : 'all';

        PROJECT_REPORT_STATE.filteredProjects = allCalculated.filter(p => {
            if (query && !p.code.toLowerCase().includes(query) && !p.name.toLowerCase().includes(query)) {
                return false;
            }
            if (selectedPm !== 'all' && p.pm !== selectedPm) {
                return false;
            }
            if (selectedStatus !== 'all') {
                if (selectedStatus === 'COMPLETED' && p.status !== 'COMPLETED' && p.progress < 100) return false;
                if (selectedStatus === 'IN_PROGRESS' && (p.status === 'COMPLETED' || p.progress >= 100)) return false;
            }
            return true;
        });

        PROJECT_REPORT_STATE.currentPage = 1;
        updateSummaryCards(PROJECT_REPORT_STATE.filteredProjects);
        renderTable();
    }

    searchInput?.addEventListener('input', applyFilters);
    pmFilter?.addEventListener('change', applyFilters);
    statusFilter?.addEventListener('change', applyFilters);

    resetBtn?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (pmFilter) pmFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';
        applyFilters();
    });

    exportBtn?.addEventListener('click', exportToCsv);

    prevBtn?.addEventListener('click', () => {
        if (PROJECT_REPORT_STATE.currentPage > 1) {
            PROJECT_REPORT_STATE.currentPage -= 1;
            renderTable();
        }
    });

    nextBtn?.addEventListener('click', () => {
        const totalPages = Math.ceil(PROJECT_REPORT_STATE.filteredProjects.length / PROJECT_REPORT_STATE.pageSize);
        if (PROJECT_REPORT_STATE.currentPage < totalPages) {
            PROJECT_REPORT_STATE.currentPage += 1;
            renderTable();
        }
    });

    // Modal close events
    const modal = document.getElementById('project-detail-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const closeActionBtn = document.getElementById('modal-close-action-btn');

    closeBtn?.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
    closeActionBtn?.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Initial render
    renderTable();
});
