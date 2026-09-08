/**
 * WORK MANAGEMENT SYSTEM - DASHBOARD DATA & INTERACTIONS (js/dashboard.js)
 * Cung cấp dữ liệu động và giao diện tùy biến cho từng vai trò người dùng (Head, PM, Employee)
 */

(function() {    // ==========================================
    // 1. DỮ LIỆU ĐỘNG TỪ LOCALSTORAGE (DYNAMIC DATA GETTER)
    // ==========================================
    function getDynamicDashboardData() {
        let projects = [];
        let tasks = [];
        let employees = [];
        let notifications = { all: [], head: [], pm: [], employee: [] };

        try {
            projects = JSON.parse(localStorage.getItem('etrms-projects')) || [];
        } catch (e) {}
        if (projects.length === 0) {
            projects = [
                { id: 'proj_001', projectCode: 'PRJ-2024-001', projectName: 'Hệ thống Quản lý Nhân sự v2', pmUserId: 'user_001', pmUserName: 'Nguyễn Văn An', weightage: 40, budget: 500000000, startDate: '2024-01-15', endDate: '2026-09-30', priority: 'P1', status: 'IN_PROGRESS', progress: 65 },
                { id: 'proj_002', projectCode: 'PRJ-2024-001-A', projectName: 'Module Tuyển dụng', pmUserId: 'user_001', pmUserName: 'Nguyễn Văn An', weightage: 20, budget: 150000000, startDate: '2024-01-15', endDate: '2026-03-31', priority: 'P2', status: 'COMPLETED', progress: 100 },
                { id: 'proj_003', projectCode: 'PRJ-2024-001-B', projectName: 'Module Chấm công', pmUserId: 'user_005', pmUserName: 'Hoàng Văn Em', pmUserId: 'user_005', weightage: 20, budget: 150000000, startDate: '2026-04-01', endDate: '2026-08-30', priority: 'P2', status: 'IN_PROGRESS', progress: 40 },
                { id: 'proj_004', projectCode: 'PRJ-2024-002', projectName: 'Cổng thông tin Khách hàng', pmUserId: 'user_005', pmUserName: 'Hoàng Văn Em', pmUserId: 'user_005', weightage: 30, budget: 300000000, startDate: '2026-03-01', endDate: '2026-09-30', priority: 'P1', status: 'IN_PROGRESS', progress: 30 }
            ];
            localStorage.setItem('etrms-projects', JSON.stringify(projects));
        }

        try {
            employees = JSON.parse(localStorage.getItem('etrms_employees')) || [];
        } catch (e) {}
        if (employees.length === 0) {
            employees = [
                { id: "EMP_001", avatar: "TM", fullName: "Trần Văn Minh", email: "minh.tv@etrms.vn", phone: "0987654321", deptId: "DEPT_DEV", deptRole: "MEMBER", systemRole: "USER", wsiCapacity: 85, avatarColor: "#1890FF" },
                { id: "EMP_002", avatar: "GB", fullName: "Lê Gia Bách", email: "bach.lg@etrms.vn", phone: "0912345678", deptId: "DEPT_QA", deptRole: "HEAD", systemRole: "ADMIN", wsiCapacity: 100, avatarColor: "#52C41A" },
                { id: "EMP_003", avatar: "TB", fullName: "Nguyễn Tuấn Bùi", email: "bui.nt@etrms.vn", phone: "0909090909", deptId: "DEPT_DEV", deptRole: "TEAM_LEAD", systemRole: "USER", wsiCapacity: 125, avatarColor: "#722ED1" }
            ];
            localStorage.setItem('etrms_employees', JSON.stringify(employees));
        }

        try {
            tasks = JSON.parse(localStorage.getItem('etrms_tasks')) || [];
        } catch (e) {}
        if (tasks.length === 0) {
            tasks = [
                { id: 101, code: 'TASK-101', title: 'Dev Backend API Xác thực người dùng', project: 'Triển khai CRM', department: 'Phòng Kế toán', assignee: 'Khải Trần Văn', priority: 'P1', status: 'IN_PROGRESS', estHours: 8, dueDate: '2026-08-25' },
                { id: 102, code: 'TASK-102', title: 'Thiết kế Mockup UI Dashboard & Workspace', project: 'Thiết kế hệ thống ETRMS', department: 'Phòng CNTT', assignee: 'Hải Nam', priority: 'P2', status: 'DONE', estHours: 16, dueDate: '2026-08-05' },
                { id: 103, code: 'TASK-103', title: 'Khảo sát quy trình nghiệp vụ các phòng ban', project: 'Hệ thống Vận hành Nội bộ', department: 'Phòng Marketing', assignee: 'Lê Gia Bách', priority: 'P3', status: 'TO_DO', estHours: 16, dueDate: '2026-08-10' }
            ];
            localStorage.setItem('etrms_tasks', JSON.stringify(tasks));
        }

        try {
            notifications = JSON.parse(localStorage.getItem('etrms-notifications')) || notifications;
        } catch (e) {}

        // Lấy danh sách yêu cầu gia hạn thực tế để hiển thị lên Inbox của Head/PM
        let extRequests = [];
        try {
            extRequests = JSON.parse(localStorage.getItem('taskconnect_extensions')) || [];
        } catch(e) {}
        
        const dynamicInbox = [];
        extRequests.forEach(req => {
            if (req.status === 'Pending' || req.status === 'PENDING' || req.status === 'pending') {
                dynamicInbox.push({
                    id: req.id,
                    type: "extension",
                    icon: "fa-solid fa-clock-rotate-left",
                    title: `Yêu cầu gia hạn Task '${req.task}'`,
                    sender: `${req.requester} (${req.dept || 'IT Dept'})`,
                    time: "Hôm nay",
                    status: "Chờ duyệt"
                });
            }
        });

        // Nếu không có yêu cầu thực tế nào, thêm dữ liệu mock để giao diện không bị trống
        if (dynamicInbox.length === 0) {
            dynamicInbox.push(
                { id: "req-1", type: "extension", icon: "fa-solid fa-clock-rotate-left", title: "Yêu cầu gia hạn Task 'Tối ưu hoá API Timesheet'", sender: "Nguyễn Tuấn Bùi", time: "15 phút trước", status: "Chờ duyệt" },
                { id: "req-2", type: "timesheet", icon: "fa-solid fa-calendar-check", title: "Phê duyệt Timesheet tuần 34 của Tổ Dev", sender: "Phan Văn Khánh (PM)", time: "1 giờ trước", status: "Chờ chốt" },
                { id: "req-3", type: "qa", icon: "fa-solid fa-shield-halved", title: "Xác nhận kiểm thử Release Module Dashboard", sender: "Lê Gia Bách", time: "3 giờ trước", status: "Chờ nghiệm thu" }
            );
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const totalProjectsCount = projects.length;
        const totalTasksCount = tasks.length;
        const overloadedEmployees = employees.filter(emp => (emp.wsiCapacity || 0) > 100);
        const capacityAlertsCount = overloadedEmployees.length;

        // Tính tỷ lệ đúng hạn: Số task DONE không bị trễ hạn / Tổng số task DONE
        const doneTasks = tasks.filter(t => t.status === 'DONE');
        const onTimeDoneTasks = doneTasks.filter(t => !t.dueDate || t.dueDate >= todayStr);
        const onTimeRateVal = doneTasks.length > 0 ? ((onTimeDoneTasks.length / doneTasks.length) * 100).toFixed(1) : "100";

        // Tên của user đang đăng nhập
        const currentUser = JSON.parse(localStorage.getItem('etrms-auth-user')) || { name: 'Lê Gia Bách' };

        const employeeInbox = [];
        extRequests.forEach(req => {
            if (req.requester === currentUser.name) {
                let statusText = 'Đang chờ';
                if (req.status === 'Approved' || req.status === 'APPROVED' || req.status === 'approved') statusText = 'Đã duyệt';
                else if (req.status === 'Rejected' || req.status === 'REJECTED' || req.status === 'rejected') statusText = 'Từ chối';

                employeeInbox.push({
                    id: req.id,
                    type: "extension",
                    icon: req.status === 'Approved' || req.status === 'APPROVED' || req.status === 'approved' ? "fa-solid fa-circle-check" : "fa-solid fa-clock",
                    title: `Yêu cầu gia hạn Task '${req.task}'`,
                    sender: "Hệ thống",
                    time: "Hôm nay",
                    status: statusText
                });
            }
        });

        if (employeeInbox.length === 0) {
            employeeInbox.push(
                { id: "emp-req-1", type: "qa", icon: "fa-solid fa-circle-check", title: "Task 'Giao diện Hồ sơ cá nhân' đã được duyệt PASS", sender: "Hoàng Nam (QA)", time: "20 phút trước", status: "Đã duyệt" }
            );
        }

        const dynamicData = {
            head: {
                kpi: {
                    totalProjects: `${totalProjectsCount} Dự án`,
                    projectsTrend: `Hoạt động phòng ban`,
                    totalTasks: `${totalTasksCount} Tasks`,
                    tasksTrend: `${doneTasks.length} đã hoàn thành`,
                    capacityAlerts: `${capacityAlertsCount} Thành viên`,
                    capacityTrend: `Quá tải > 100% WSI`,
                    pendingApprovals: `${dynamicInbox.length} Yêu cầu`,
                    approvalsTrend: `Đang chờ xử lý`,
                    ontimeRate: `${onTimeRateVal}%`,
                    ontimeTrend: `Tính toán từ thực tế`
                },
                wsiList: employees.map(emp => {
                    const wsi = emp.wsiCapacity || 0;
                    let status = 'success';
                    let statusText = `Rảnh rỗi (${wsi}%)`;
                    if (wsi > 100) {
                        status = 'danger';
                        statusText = `Quá tải (${wsi}%)`;
                    } else if (wsi >= 90) {
                        status = 'warning';
                        statusText = `Đủ tải (${wsi}%)`;
                    } else {
                        statusText = `An toàn (${wsi}%)`;
                    }
                    let deptName = 'Tổ Phát triển (Dev)';
                    if (emp.deptId === 'DEPT_QA') deptName = 'Tổ Kiểm thử (QA)';
                    else if (emp.deptId === 'DEPT_HR') deptName = 'Tổ Nhân sự';

                    return {
                        name: emp.fullName,
                        avatar: emp.fullName.trim().split(' ').pop().substring(0, 2).toUpperCase(),
                        color: emp.avatarColor || '#1890FF',
                        role: emp.deptRole || 'Developer',
                        dept: deptName,
                        wsi: wsi,
                        status: status,
                        statusText: statusText
                    };
                }),
                performance: employees.map(emp => {
                    const empTasks = tasks.filter(t => t.assignee === emp.fullName);
                    const empDone = empTasks.filter(t => t.status === 'DONE');
                    const empBugs = tasks.filter(t => t.assignee === emp.fullName && t.title.toLowerCase().includes('bug')).length;
                    const empOnTime = empDone.length > 0 ? Math.round((empDone.filter(t => !t.dueDate || t.dueDate >= todayStr).length / empDone.length) * 100) : 100;
                    return {
                        name: emp.fullName,
                        role: emp.deptRole === 'HEAD' ? 'Lead' : 'Member',
                        completed: empDone.length,
                        bugs: empBugs > 0 ? empBugs : '-',
                        cases: emp.deptId === 'DEPT_QA' ? `${empTasks.length} cases` : '-',
                        ontime: `${empOnTime}%`,
                        kpi: (8.0 + (empOnTime / 100) * 2.0 - (empBugs * 0.2)).toFixed(1) + ' / 10'
                    };
                }),
                matrix: employees.map(emp => {
                    return {
                        name: emp.fullName,
                        crm: emp.fullName === 'Lê Gia Bách' ? '50%' : (emp.fullName === 'Trần Văn Minh' ? '20%' : '40%'),
                        workManagement: emp.fullName === 'Lê Gia Bách' ? '50%' : (emp.fullName === 'Trần Văn Minh' ? '30%' : '60%'),
                        mobile: emp.fullName === 'Lê Gia Bách' ? '0%' : (emp.fullName === 'Trần Văn Minh' ? '20%' : '25%'),
                        other: '0%',
                        total: `${emp.wsiCapacity || 100}%`,
                        isOver: (emp.wsiCapacity || 0) > 100
                    };
                }),
                inbox: dynamicInbox,
                timeline: [
                    { actor: "dev", title: "Nguyễn Tuấn Bùi đã đẩy bản vá Bug #104 lên nhánh staging", time: "10 phút trước" },
                    { actor: "dev", title: "Lê Gia Bách đã đóng Task 'Thiết kế Layout Hồ sơ cá nhân'", time: "2 giờ trước" },
                    { actor: "pm", title: "Phan Văn Khánh đã cập nhật tiến độ Dự án CRM lên 75%", time: "4 giờ trước" }
                ]
            },
            pm: {
                kpi: {
                    totalProjects: `${totalProjectsCount} Dự án`,
                    projectsTrend: `Tổng số dự án vận hành`,
                    totalTasks: `${totalTasksCount} Tasks`,
                    tasksTrend: `${tasks.filter(t => t.status === 'IN_PROGRESS').length} đang thực hiện`,
                    capacityAlerts: `${capacityAlertsCount} Cảnh báo`,
                    capacityTrend: `Nhân sự quá tải WSI`,
                    pendingApprovals: `${dynamicInbox.length} Yêu cầu`,
                    approvalsTrend: `Đang chờ PM duyệt`,
                    ontimeRate: `${onTimeRateVal}%`,
                    ontimeTrend: `Tính tự động`
                },
                projectsHealth: projects.map(p => {
                    let status = 'On-Track';
                    let statusClass = 'badge-success';
                    if (p.progress < 50 && p.status === 'IN_PROGRESS') {
                        status = 'At-Risk';
                        statusClass = 'badge-danger';
                    }
                    return {
                        name: p.projectName,
                        progress: p.progress || 0,
                        start: p.startDate,
                        end: p.endDate,
                        sla: '92%',
                        status: status,
                        statusClass: statusClass
                    };
                }),
                milestones: [
                    { name: "Sprint 1: Phân tích & UI Design", project: "Work Management", deadline: "10/08/2026", progress: 100, status: "Đã hoàn thành", statusClass: "badge-success" },
                    { name: "Sprint 2: Module Xác thực & Dashboard", project: "Work Management", deadline: "30/08/2026", progress: 80, status: "Đang thực hiện", statusClass: "badge-primary" },
                    { name: "Sprint 3: Quản lý Công việc & Kanban", project: "Work Management", deadline: "20/09/2026", progress: 15, status: "Sắp tới", statusClass: "badge-secondary" }
                ],
                teamWorkload: employees.map(emp => {
                    const empTasks = tasks.filter(t => t.assignee === emp.fullName);
                    const wsi = emp.wsiCapacity || 100;
                    let statusClass = 'badge-success';
                    let statusText = 'An toàn';
                    if (wsi > 100) {
                        statusClass = 'badge-danger';
                        statusText = `Quá tải (${wsi}%)`;
                    } else if (wsi >= 90) {
                        statusClass = 'badge-warning';
                        statusText = `Đủ tải (${wsi}%)`;
                    }
                    return {
                        name: emp.fullName,
                        avatar: emp.fullName.trim().split(' ').pop().substring(0, 2).toUpperCase(),
                        color: emp.avatarColor || '#1890FF',
                        role: emp.deptRole || 'Developer',
                        project: emp.fullName === 'Lê Gia Bách' ? 'Work Management' : 'Triển khai CRM',
                        tasks: empTasks.filter(t => t.status !== 'DONE').length,
                        wsi: wsi,
                        status: statusText,
                        statusClass: statusClass
                    };
                }),
                inbox: dynamicInbox,
                timeline: [
                    { actor: "dev", title: "Lê Gia Bách đã mở Pull Request: Feature Auth & Logout Flow", time: "25 phút trước" },
                    { actor: "dev", title: "Nguyễn Tuấn Bùi đã cập nhật schema cơ sở dữ liệu", time: "3 giờ trước" }
                ]
            },
            employee: {
                kpi: {
                    totalProjects: `2 Dự án`,
                    projectsTrend: `Đang tham gia thực hiện`,
                    totalTasks: `${tasks.filter(t => t.assignee === currentUser.name).length} Tasks`,
                    tasksTrend: `${tasks.filter(t => t.assignee === currentUser.name && t.status === 'DONE').length} đã xong`,
                    capacityAlerts: `0 Cảnh báo`,
                    capacityTrend: `Sức tải cá nhân ổn định`,
                    pendingApprovals: `${employeeInbox.length} Đơn`,
                    approvalsTrend: `Yêu cầu gia hạn của bạn`,
                    ontimeRate: `100%`,
                    ontimeTrend: `Đúng hạn tuyệt đối`
                },
                myTasks: tasks.filter(t => t.assignee === currentUser.name).map(t => {
                    return {
                        id: t.id,
                        title: t.title,
                        project: t.project || 'Dự án chung',
                        priority: t.priority ? t.priority.toLowerCase() : 'p3',
                        priorityText: t.priority === 'P1' ? 'Khẩn cấp (P1)' : t.priority === 'P2' ? 'Ưu tiên cao (P2)' : 'Bình thường (P3)',
                        isToday: t.priority === 'P1' || t.priority === 'P2',
                        isDone: t.status === 'DONE'
                    };
                }),
                devBugs: tasks.filter(t => t.assignee === currentUser.name && t.title.toLowerCase().includes('bug')).map(t => {
                    return {
                        id: 'BUG-' + t.id,
                        title: t.title,
                        project: t.project || 'Work Management',
                        tester: t.tester || 'Hoàng Nam',
                        priority: t.priority || 'P2',
                        priorityClass: 'tag-' + (t.priority ? t.priority.toLowerCase() : 'p2'),
                        isReopened: false
                    };
                }),
                testerTasks: tasks.filter(t => t.tester === currentUser.name || (t.title.toLowerCase().includes('kiểm thử') && t.status === 'IN_REVIEW')).map(t => {
                    return {
                        id: 'TEST-' + t.id,
                        title: t.title,
                        project: t.project || 'Work Management',
                        dev: t.assignee || 'Lập trình viên',
                        priority: t.priority || 'P1',
                        priorityClass: 'tag-' + (t.priority ? t.priority.toLowerCase() : 'p1')
                    };
                }),
                inbox: employeeInbox,
                timeline: [
                    { actor: "dev", title: "Bạn đã nộp mã nguồn hoàn thành Module Auth", time: "15 phút trước" }
                ]
            }
        };

        return dynamicData;
    }

    // Proxy động để tự động truy cập dữ liệu thực tế tại mọi thời điểm
    const DASHBOARD_DATA = new Proxy({}, {
        get: function(target, prop) {
            return getDynamicDashboardData()[prop];
        }
    });

    // ==========================================
    // 2. CÁC HÀM RENDER DỮ LIỆU RA GIAO DIỆN
    // ==========================================

    // Render chỉ số KPI Cards
    function renderKpiCards(kpiData) {
        if (!kpiData) return;
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

        setVal('kpi-total-projects', kpiData.totalProjects || '-');
        setVal('kpi-projects-trend', kpiData.projectsTrend || '-');
        setVal('kpi-total-tasks', kpiData.totalTasks || '-');
        setVal('kpi-tasks-trend', kpiData.tasksTrend || '-');
        setVal('kpi-capacity-alerts', kpiData.capacityAlerts || '-');
        setVal('kpi-capacity-trend', kpiData.capacityTrend || '-');
        setVal('kpi-pending-approvals', kpiData.pendingApprovals || '-');
        setVal('kpi-approvals-trend', kpiData.approvalsTrend || '-');
        setVal('kpi-ontime-rate', kpiData.ontimeRate || '-%');
        setVal('kpi-ontime-trend', kpiData.ontimeTrend || '-');
    }

    // Render danh sách công việc cá nhân của Nhân viên (Employee Focus To-Do)
    function renderEmployeeTasks(filter = 'all') {
        const tasks = DASHBOARD_DATA.employee.myTasks;
        const container = document.getElementById('task-checklist-container');
        if (!container) return;

        let filtered = tasks;
        if (filter === 'today') filtered = tasks.filter(t => t.isToday);
        else if (filter === 'p1') filtered = tasks.filter(t => t.priority === 'p1');
        else if (filter === 'overdue') filtered = tasks.filter(t => !t.isDone && t.priority === 'p1');

        container.innerHTML = '';

        if (filtered.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 13px;">Không có công việc nào trong danh mục này.</div>`;
        } else {
            filtered.forEach(task => {
                const item = document.createElement('div');
                item.className = 'task-checklist-item';
                item.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: ${task.isDone ? '#f8fafc' : '#ffffff'};
                    border: 1px solid #e2e8f0;
                    border-radius: var(--border-radius-md, 6px);
                    transition: all 0.2s;
                `;

                const priorityBadge = task.priority === 'p1' ? 'background: #fff1f0; color: #cf1322;' : (task.priority === 'p2' ? 'background: #fff7e6; color: #fa8c16;' : 'background: #f0f5ff; color: #1890ff;');

                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        <input type="checkbox" ${task.isDone ? 'checked' : ''} data-id="${task.id}" class="task-todo-chk" style="width: 17px; height: 17px; cursor: pointer; accent-color: var(--primary-color);">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 13.5px; font-weight: 500; color: ${task.isDone ? '#94a3b8' : 'var(--text-main)'}; ${task.isDone ? 'text-decoration: line-through;' : ''}">${task.title}</span>
                            <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                                <span style="font-size: 11px; color: var(--text-muted);"><i class="fa-solid fa-briefcase"></i> ${task.project}</span>
                                <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; ${priorityBadge}">${task.priorityText}</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn-icon" title="Chi tiết" onclick="alert('Xem chi tiết: ${task.title}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;">
                        <i class="fa-solid fa-chevron-right" style="font-size: 12px;"></i>
                    </button>
                `;

                // Bắt sự kiện check/uncheck to-do
                const chk = item.querySelector('.task-todo-chk');
                chk.addEventListener('change', (e) => {
                    task.isDone = e.target.checked;
                    updateEmployeeProgress();
                    renderEmployeeTasks(filter);
                    if (window.showToast) {
                        window.showToast(task.isDone ? `Đã hoàn thành: ${task.title}` : `Đã mở lại: ${task.title}`, 'info');
                    }
                });

                container.appendChild(item);
            });
        }

        updateEmployeeProgress();
    }

    function updateEmployeeProgress() {
        const tasks = DASHBOARD_DATA.employee.myTasks;
        const completed = tasks.filter(t => t.isDone).length;
        const total = tasks.length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        const pText = document.getElementById('focus-progress-text');
        const pBar = document.getElementById('focus-progress-bar');
        if (pText) pText.textContent = `${pct}% (Đã hoàn thành ${completed}/${total})`;
        if (pBar) pBar.style.width = `${pct}%`;
    }

    // Render Dev Bug Queue
    function renderDevBugs(filter = 'all') {
        const tbody = document.getElementById('dev-bug-queue-tbody');
        if (!tbody) return;
        const bugs = DASHBOARD_DATA.employee.devBugs;

        let filtered = bugs;
        if (filter === 'p1') filtered = bugs.filter(b => b.priority === 'P1');
        else if (filter === 'reopened') filtered = bugs.filter(b => b.isReopened);

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 16px;">Không có bug nào cần xử lý.</td></tr>`;
            return;
        }

        filtered.forEach(bug => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="pin-left"><strong style="color: var(--primary-color);">${bug.id}</strong></td>
                <td>${bug.title} ${bug.isReopened ? '<span class="badge" style="background:#fff1f0;color:#ff4d4f;font-size:10px;">Re-opened</span>' : ''}</td>
                <td>${bug.project}</td>
                <td>${bug.tester}</td>
                <td><span class="badge ${bug.priorityClass}">${bug.priority}</span></td>
                <td class="pin-right no-resize">
                    <button class="btn btn-sm btn-primary" onclick="alert('Đã nhận xử lý ${bug.id}')" style="padding: 2px 8px; font-size: 11px; height: 24px;">Sửa ngay</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Render Tester Test Queue
    function renderTesterTasks(filter = 'all') {
        const tbody = document.getElementById('tester-test-queue-tbody');
        if (!tbody) return;
        const tasks = DASHBOARD_DATA.employee.testerTasks;

        let filtered = tasks;
        if (filter === 'p1') filtered = tasks.filter(t => t.priority === 'P1');

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 16px;">Không có task nào chờ test.</td></tr>`;
            return;
        }

        filtered.forEach(task => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="pin-left"><strong style="color: var(--primary-color);">${task.id}</strong></td>
                <td>${task.title}</td>
                <td>${task.project}</td>
                <td>${task.dev}</td>
                <td><span class="badge ${task.priorityClass}">${task.priority}</span></td>
                <td class="pin-right no-resize" style="display: flex; gap: 4px;">
                    <button class="btn btn-sm btn-success" onclick="alert('Đã đánh dấu PASS cho ${task.id}')" style="padding: 2px 8px; font-size: 11px; height: 24px; background: var(--success-color); color: white; border: none; border-radius: 4px;">Pass</button>
                    <button class="btn btn-sm btn-danger" onclick="alert('Đã đánh dấu FAILED cho ${task.id}')" style="padding: 2px 8px; font-size: 11px; height: 24px; background: var(--danger-color); color: white; border: none; border-radius: 4px;">Fail</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Render Sức khỏe Dự án (PM - Project Health)
    function renderProjectHealth() {
        const tbody = document.getElementById('project-health-tbody');
        if (!tbody) return;
        const projects = DASHBOARD_DATA.pm.projectsHealth;

        tbody.innerHTML = '';
        projects.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="pin-left"><strong>${p.name}</strong></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; min-width: 60px;">
                            <div style="width: ${p.progress}%; height: 100%; background: ${p.progress >= 70 ? 'var(--success-color)' : (p.progress >= 40 ? 'var(--primary-color)' : 'var(--danger-color)')}; border-radius: 3px;"></div>
                        </div>
                        <span style="font-size: 12px; font-weight: 600;">${p.progress}%</span>
                    </div>
                </td>
                <td>${p.start}</td>
                <td>${p.end}</td>
                <td><strong style="color: var(--success-color);">${p.sla}</strong></td>
                <td class="pin-right no-resize">
                    <span class="badge ${p.statusClass}">${p.status}</span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Render Sprints / Milestones (PM)
    function renderPmMilestones() {
        const tbody = document.getElementById('pm-milestone-tbody');
        if (!tbody) return;
        const milestones = DASHBOARD_DATA.pm.milestones;

        tbody.innerHTML = '';
        milestones.forEach(m => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="pin-left"><strong>${m.name}</strong></td>
                <td>${m.project}</td>
                <td>${m.deadline}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 12px; font-weight: 600;">${m.progress}%</span>
                    </div>
                </td>
                <td class="pin-right no-resize"><span class="badge ${m.statusClass}">${m.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Render Tải nhân sự theo Dự án (PM Team Workload)
    function renderPmTeamWorkload() {
        const tbody = document.getElementById('pm-team-workload-tbody');
        if (!tbody) return;
        const team = DASHBOARD_DATA.pm.teamWorkload;

        tbody.innerHTML = '';
        team.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="pin-left">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 26px; height: 26px; border-radius: 50%; background: ${u.color}; color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;">${u.avatar}</div>
                        <span>${u.name}</span>
                    </div>
                </td>
                <td>${u.role}</td>
                <td>${u.project}</td>
                <td><strong>${u.tasks}</strong> tasks</td>
                <td><strong style="color: ${u.wsi > 100 ? 'var(--danger-color)' : 'var(--primary-color)'};">${u.wsi}%</strong></td>
                <td><span class="badge ${u.statusClass}">${u.status}</span></td>
                <td class="pin-right no-resize">
                    <button class="btn btn-sm btn-secondary" onclick="alert('Mở phân bổ việc cho ${u.name}')" style="padding: 2px 8px; font-size: 11px; height: 24px;">Phân việc</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Render Điểm nóng WSI Toàn phòng (Head WSI Hotspots)
    function renderHeadWsi(filter = 'all') {
        const tbody = document.getElementById('wsi-list-tbody');
        if (!tbody) return;
        const list = DASHBOARD_DATA.head.wsiList;

        let filtered = list;
        if (filter === 'dev') filtered = list.filter(u => u.dept.includes('Dev'));
        else if (filter === 'qa') filtered = list.filter(u => u.dept.includes('QA'));
        else if (filter === 'design') filtered = list.filter(u => u.dept.includes('Design'));

        tbody.innerHTML = '';
        filtered.forEach(u => {
            const tr = document.createElement('tr');
            const tagClass = u.status === 'danger' ? 'badge-danger' : (u.status === 'warning' ? 'badge-warning' : 'badge-success');

            tr.innerHTML = `
                <td class="pin-left">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 26px; height: 26px; border-radius: 50%; background: ${u.color}; color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;">${u.avatar}</div>
                        <span>${u.name}</span>
                    </div>
                </td>
                <td>${u.role}</td>
                <td>${u.dept}</td>
                <td><strong style="color: ${u.wsi > 100 ? 'var(--danger-color)' : (u.wsi === 100 ? 'var(--warning-color)' : 'var(--success-color)')};">${u.wsi}%</strong></td>
                <td><span class="badge ${tagClass}">${u.statusText}</span></td>
                <td class="pin-right no-resize">
                    <button class="btn btn-sm btn-primary" onclick="alert('Đã gửi thông báo điều phối giảm tải cho ${u.name}')" style="padding: 2px 8px; font-size: 11px; height: 24px;">Điều phối</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Render Báo cáo Hiệu suất Phòng ban (Head Performance Summary)
    function renderHeadPerformance() {
        const tbody = document.getElementById('head-performance-summary-tbody');
        if (!tbody) return;
        const perf = DASHBOARD_DATA.head.performance;

        tbody.innerHTML = '';
        perf.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="pin-left"><strong>${u.name}</strong></td>
                <td>${u.role}</td>
                <td><strong>${u.completed}</strong> tasks</td>
                <td>${u.bugs !== '-' ? `<span style="color: var(--danger-color); font-weight:600;">${u.bugs} bugs</span>` : '-'}</td>
                <td>${u.cases}</td>
                <td><span style="color: var(--success-color); font-weight:600;">${u.ontime}</span></td>
                <td class="pin-right no-resize"><strong style="color: var(--primary-color);">${u.kpi}</strong></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Render Ma trận Nguồn lực (Head Resource Matrix)
    function renderHeadMatrix() {
        const tbody = document.getElementById('head-resource-matrix-tbody');
        if (!tbody) return;
        const matrix = DASHBOARD_DATA.head.matrix;

        tbody.innerHTML = '';
        matrix.forEach(m => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="pin-left"><strong>${m.name}</strong></td>
                <td>${m.crm}</td>
                <td>${m.workManagement}</td>
                <td>${m.mobile}</td>
                <td>${m.other}</td>
                <td class="pin-right no-resize">
                    <span class="badge ${m.isOver ? 'badge-danger' : 'badge-success'}">${m.total}</span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Render Hòm thư Chờ duyệt & Cảnh báo (Shared Inbox)
    function renderInbox(role = 'all', filter = 'all') {
        const container = document.getElementById('inbox-container');
        if (!container) return;

        let roleKey = role === 'all' ? 'head' : role;
        const dataSet = DASHBOARD_DATA[roleKey] || DASHBOARD_DATA.head;
        let inboxItems = dataSet.inbox || [];

        if (filter !== 'all') {
            inboxItems = inboxItems.filter(item => item.type === filter);
        }

        container.innerHTML = '';
        if (inboxItems.length === 0) {
            container.innerHTML = `<li style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 13px;">Không có yêu cầu chờ xử lý nào.</li>`;
            return;
        }

        inboxItems.forEach(item => {
            const li = document.createElement('li');
            li.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                border-bottom: 1px solid var(--border-light);
                transition: background 0.2s;
            `;

            li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #e6f7ff; color: var(--primary-color); display: flex; align-items: center; justify-content: center; font-size: 14px;">
                        <i class="${item.icon}"></i>
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 13px; font-weight: 600; color: var(--text-main);">${item.title}</span>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                            <span><i class="fa-solid fa-user"></i> ${item.sender}</span>
                            <span>•</span>
                            <span>${item.time}</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge badge-warning" style="font-size: 11px;">${item.status}</span>
                    <button class="btn btn-sm btn-primary" onclick="alert('Đã duyệt yêu cầu: ${item.title}')" style="padding: 2px 10px; font-size: 11px; height: 26px;">Duyệt</button>
                </div>
            `;
            container.appendChild(li);
        });
    }

    // Render Timeline Hoạt động gần đây (Shared Timeline)
    function renderTimeline(role = 'all', filter = 'all') {
        const container = document.getElementById('timeline-container');
        if (!container) return;

        let roleKey = role === 'all' ? 'head' : role;
        const dataSet = DASHBOARD_DATA[roleKey] || DASHBOARD_DATA.head;
        let events = dataSet.timeline || [];

        if (filter !== 'all') {
            events = events.filter(e => e.actor === filter);
        }

        container.innerHTML = '';
        if (events.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 13px;">Không có hoạt động nào trong mốc này.</div>`;
            return;
        }

        events.forEach((ev, idx) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            const nodeClass = idx === 0 ? 'badge-node-blue' : (idx === 1 ? 'badge-node-yellow' : '');

            item.innerHTML = `
                <div class="timeline-badge-node ${nodeClass}"></div>
                <div class="timeline-content">
                    <span class="timeline-header">${ev.title}</span>
                    <span class="timeline-time">${ev.time}</span>
                </div>
            `;
            container.appendChild(item);
        });
    }

    // ==========================================
    // 3. ĐỒNG BỘ TOÀN BỘ DASHBOARD KHI ĐỔI ROLE
    // ==========================================
    function refreshDashboardData(role) {
        const targetRole = role || localStorage.getItem('etrms-simulated-role') || 'all';
        const roleKey = targetRole === 'all' ? 'head' : targetRole;
        const kpi = (DASHBOARD_DATA[roleKey] || DASHBOARD_DATA.head).kpi;

        // 1. KPI Cards
        renderKpiCards(kpi);

        // 2. Section Employee
        renderEmployeeTasks();
        renderDevBugs();
        renderTesterTasks();

        // 3. Section PM
        renderProjectHealth();
        renderPmMilestones();
        renderPmTeamWorkload();

        // 4. Section Head
        renderHeadWsi();
        renderHeadPerformance();
        renderHeadMatrix();

        // 5. Shared Widgets
        renderInbox(targetRole);
        renderTimeline(targetRole);
    }

    // ==========================================
    // 4. KHỞI TẠO BỘ LẮNG NGHE SỰ KIỆN (FILTERS & EVENTS)
    // ==========================================
    function initDashboardEventHandlers() {
        // Cập nhật ngày hôm nay trên banner
        const dateBadge = document.getElementById('current-date-badge');
        if (dateBadge) {
            const now = new Date();
            const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
            const dayName = days[now.getDay()];
            const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
            dateBadge.innerHTML = `<i class="fa-solid fa-calendar-days"></i> ${dayName}, ${dateFormatted}`;
        }

        // Filter Employee Tasks
        const filterMyTasks = document.getElementById('filter-my-tasks');
        if (filterMyTasks) {
            filterMyTasks.addEventListener('change', (e) => renderEmployeeTasks(e.target.value));
        }

        // Filter Dev Bugs
        const filterDevBugs = document.getElementById('filter-dev-bugs');
        if (filterDevBugs) {
            filterDevBugs.addEventListener('change', (e) => renderDevBugs(e.target.value));
        }

        // Filter Tester Tasks
        const filterTesterTasks = document.getElementById('filter-tester-tasks');
        if (filterTesterTasks) {
            filterTesterTasks.addEventListener('change', (e) => renderTesterTasks(e.target.value));
        }

        // Filter Head WSI
        const filterHeadWsi = document.getElementById('filter-head-wsi-dept');
        if (filterHeadWsi) {
            filterHeadWsi.addEventListener('change', (e) => renderHeadWsi(e.target.value));
        }

        // Filter Inbox
        const filterInbox = document.getElementById('filter-inbox-type');
        if (filterInbox) {
            filterInbox.addEventListener('change', (e) => {
                const currentRole = localStorage.getItem('etrms-simulated-role') || 'all';
                renderInbox(currentRole, e.target.value);
            });
        }

        // Filter Timeline
        const filterTimeline = document.getElementById('filter-timeline-actor');
        if (filterTimeline) {
            filterTimeline.addEventListener('change', (e) => {
                const currentRole = localStorage.getItem('etrms-simulated-role') || 'all';
                renderTimeline(currentRole, e.target.value);
            });
        }

        // Lắng nghe sự kiện chuyển đổi vai trò từ Header (etrms-role-changed)
        window.addEventListener('etrms-role-changed', (e) => {
            refreshDashboardData(e.detail.role);
        });
    }

    // ==========================================
    // 5. EXCEL-LIKE COLUMN RESIZING (GIỮ NGUYÊN TÍNH NĂNG CŨ)
    // ==========================================
    function initColumnResizing() {
        document.querySelectorAll('.data-table th').forEach(th => {
            if (th.classList.contains('pin-right') || th.classList.contains('no-resize')) return;
            if (th.querySelector('.resizer')) return;

            const resizer = document.createElement('div');
            resizer.classList.add('resizer');
            th.appendChild(resizer);

            let startX, startWidth;
            resizer.addEventListener('mousedown', function(e) {
                startX = e.pageX;
                startWidth = th.offsetWidth;
                
                resizer.classList.add('resizing');
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';

                function doResize(e) {
                    const width = startWidth + (e.pageX - startX);
                    if (width > 60) {
                        th.style.width = width + 'px';
                        th.style.minWidth = width + 'px';
                    }
                }

                function stopResize() {
                    document.removeEventListener('mousemove', doResize);
                    document.removeEventListener('mouseup', stopResize);
                    resizer.classList.remove('resizing');
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                }

                document.addEventListener('mousemove', doResize);
                document.addEventListener('mouseup', stopResize);
            });
        });
    }

    // Khởi chạy khi tài liệu sẵn sàng
    document.addEventListener('DOMContentLoaded', () => {
        const initialRole = localStorage.getItem('etrms-simulated-role') || 'all';
        refreshDashboardData(initialRole);
        initDashboardEventHandlers();
        initColumnResizing();
    });

})();
