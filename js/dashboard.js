/**
 * WORK MANAGEMENT SYSTEM - DASHBOARD DATA & INTERACTIONS (js/dashboard.js)
 * Cung cấp dữ liệu động và giao diện tùy biến cho từng vai trò người dùng (Head, PM, Employee)
 */

(function() {
    'use strict';

    // ==========================================
    // 1. DỮ LIỆU GIẢ LẬP THEO TỪNG VAI TRÒ (MOCK DATA)
    // ==========================================
    const DASHBOARD_DATA = {
        // --- VAI TRÒ TRƯỞNG PHÒNG (HEAD) ---
        head: {
            kpi: {
                totalProjects: "8 Dự án",
                projectsTrend: "+2 dự án mới tháng này",
                totalTasks: "142 Tasks",
                tasksTrend: "86% đúng tiến độ",
                capacityAlerts: "3 Thành viên",
                capacityTrend: "Quá tải > 100% WSI",
                pendingApprovals: "5 Yêu cầu",
                approvalsTrend: "2 gia hạn, 3 duyệt Timesheet",
                ontimeRate: "94.5%",
                ontimeTrend: "+2.1% so với tháng trước"
            },
            wsiList: [
                { name: "Lê Gia Bách", avatar: "GB", color: "#52C41A", role: "Dev Frontend", dept: "Tổ Phát triển (Dev)", wsi: 110, status: "danger", statusText: "Quá tải (110%)" },
                { name: "Tuấn Bùi", avatar: "TB", color: "#722ED1", role: "Dev Backend", dept: "Tổ Phát triển (Dev)", wsi: 125, status: "danger", statusText: "Quá tải (125%)" },
                { name: "Hoàng Nam", avatar: "HN", color: "#13C2C2", role: "Tester QA", dept: "Tổ Kiểm thử (QA)", wsi: 95, status: "warning", statusText: "Đủ tải (95%)" },
                { name: "Trần Minh", avatar: "TM", color: "#FA8C16", role: "UI/UX Designer", dept: "Tổ UI/UX Design", wsi: 70, status: "success", statusText: "Rảnh rỗi (70%)" },
                { name: "Nguyễn Văn Phong", avatar: "NP", color: "#EB2F96", role: "Dev Fullstack", dept: "Tổ Phát triển (Dev)", wsi: 85, status: "success", statusText: "An toàn (85%)" }
            ],
            performance: [
                { name: "Lê Gia Bách", role: "Dev", completed: 18, bugs: 2, cases: "-", ontime: "96%", kpi: "9.2 / 10" },
                { name: "Tuấn Bùi", role: "Dev", completed: 15, bugs: 4, cases: "-", ontime: "88%", kpi: "8.5 / 10" },
                { name: "Hoàng Nam", role: "Tester", completed: 22, bugs: "-", cases: "78 cases", ontime: "98%", kpi: "9.5 / 10" },
                { name: "Trần Minh", role: "Designer", completed: 12, bugs: "-", cases: "-", ontime: "92%", kpi: "8.9 / 10" }
            ],
            matrix: [
                { name: "Lê Gia Bách", crm: "50%", workManagement: "50%", mobile: "10%", other: "0%", total: "110%", isOver: true },
                { name: "Tuấn Bùi", crm: "40%", workManagement: "60%", mobile: "25%", other: "0%", total: "125%", isOver: true },
                { name: "Hoàng Nam", crm: "30%", workManagement: "40%", mobile: "25%", other: "0%", total: "95%", isOver: false },
                { name: "Trần Minh", crm: "20%", workManagement: "30%", mobile: "20%", other: "0%", total: "70%", isOver: false },
                { name: "Nguyễn Văn Phong", crm: "35%", workManagement: "25%", mobile: "25%", other: "0%", total: "85%", isOver: false }
            ],
            inbox: [
                { id: "req-1", type: "extension", icon: "fa-solid fa-clock-rotate-left", title: "Yêu cầu gia hạn Task 'Tối ưu hoá API Timesheet'", sender: "Tuấn Bùi (Backend Dev)", time: "15 phút trước", status: "Chờ duyệt" },
                { id: "req-2", type: "timesheet", icon: "fa-solid fa-calendar-check", title: "Phê duyệt Timesheet tuần 34 của Tổ Dev", sender: "Phan Văn Khánh (PM)", time: "1 giờ trước", status: "Chờ chốt" },
                { id: "req-3", type: "qa", icon: "fa-solid fa-shield-halved", title: "Xác nhận kiểm thử Release Module Dashboard", sender: "Hoàng Nam (QA Lead)", time: "3 giờ trước", status: "Chờ nghiệm thu" }
            ],
            timeline: [
                { actor: "dev", title: "Tuấn Bùi đã đẩy bản vá Bug #104 lên nhánh staging", time: "10 phút trước" },
                { actor: "tester", title: "Hoàng Nam đã hoàn thành kiểm thử Regression Test v2.4", time: "45 phút trước" },
                { actor: "dev", title: "Lê Gia Bách đã đóng Task 'Thiết kế Layout Hồ sơ cá nhân'", time: "2 giờ trước" },
                { actor: "pm", title: "Phan Văn Khánh đã cập nhật tiến độ Dự án CRM lên 75%", time: "4 giờ trước" }
            ]
        },

        // --- VAI TRÒ QUẢN LÝ DỰ ÁN (PM) ---
        pm: {
            kpi: {
                totalProjects: "3 Dự án",
                projectsTrend: "2 On-track, 1 At-risk",
                totalTasks: "64 Tasks",
                tasksTrend: "24 đang làm, 40 xong",
                capacityAlerts: "1 Cảnh báo",
                capacityTrend: "Tuấn Bùi quá tải 125%",
                pendingApprovals: "4 Yêu cầu",
                approvalsTrend: "3 Review, 1 Gia hạn",
                ontimeRate: "91.8%",
                ontimeTrend: "+1.5% so với tuần trước"
            },
            projectsHealth: [
                { name: "Dự án CRM Doanh nghiệp", progress: 75, start: "01/06/2026", end: "30/09/2026", sla: "94%", status: "On-Track", statusClass: "badge-success" },
                { name: "Hệ thống Work Management", progress: 45, start: "15/07/2026", end: "15/11/2026", sla: "92%", status: "On-Track", statusClass: "badge-success" },
                { name: "Ứng dụng Mobile Quản lý", progress: 30, start: "01/08/2026", end: "30/10/2026", sla: "78%", status: "At-Risk", statusClass: "badge-danger" }
            ],
            milestones: [
                { name: "Sprint 1: Phân tích & UI Design", project: "Work Management", deadline: "10/08/2026", progress: 100, status: "Đã hoàn thành", statusClass: "badge-success" },
                { name: "Sprint 2: Module Xác thực & Dashboard", project: "Work Management", deadline: "30/08/2026", progress: 80, status: "Đang thực hiện", statusClass: "badge-primary" },
                { name: "Sprint 3: Quản lý Công việc & Kanban", project: "Work Management", deadline: "20/09/2026", progress: 15, status: "Sắp tới", statusClass: "badge-secondary" },
                { name: "Release Beta CRM v1.0", project: "CRM Doanh nghiệp", deadline: "15/09/2026", progress: 70, status: "Đang kiểm thử", statusClass: "badge-warning" }
            ],
            teamWorkload: [
                { name: "Lê Gia Bách", avatar: "GB", color: "#52C41A", role: "Dev Frontend", project: "Work Management, CRM", tasks: 5, wsi: 110, status: "Quá tải (110%)", statusClass: "badge-danger" },
                { name: "Tuấn Bùi", avatar: "TB", color: "#722ED1", role: "Dev Backend", project: "Work Management, Mobile", tasks: 6, wsi: 125, status: "Quá tải (125%)", statusClass: "badge-danger" },
                { name: "Hoàng Nam", avatar: "HN", color: "#13C2C2", role: "Tester", project: "CRM, Work Management", tasks: 4, wsi: 95, status: "Đủ tải (95%)", statusClass: "badge-warning" },
                { name: "Trần Minh", avatar: "TM", color: "#FA8C16", role: "UI Designer", project: "Mobile App", tasks: 2, wsi: 70, status: "An toàn (70%)", statusClass: "badge-success" }
            ],
            inbox: [
                { id: "pm-req-1", type: "extension", icon: "fa-solid fa-clock-rotate-left", title: "Xin gia hạn Task 'Tích hợp API Đăng nhập SSO' thêm 2 ngày", sender: "Lê Gia Bách", time: "30 phút trước", status: "Chờ duyệt" },
                { id: "pm-req-2", type: "qa", icon: "fa-solid fa-check-double", title: "Yêu cầu Review mã nguồn Pull Request #42", sender: "Tuấn Bùi", time: "2 giờ trước", status: "Cần review" },
                { id: "pm-req-3", type: "timesheet", icon: "fa-solid fa-user-clock", title: "Timesheet tuần 34 của Hoàng Nam đã gửi", sender: "Hoàng Nam", time: "5 giờ trước", status: "Chờ xác nhận" }
            ],
            timeline: [
                { actor: "dev", title: "Lê Gia Bách đã mở Pull Request: Feature Auth & Logout Flow", time: "25 phút trước" },
                { actor: "tester", title: "Hoàng Nam đã log 3 bugs trên Module Quản lý Dự án", time: "1 giờ trước" },
                { actor: "dev", title: "Tuấn Bùi đã cập nhật schema cơ sở dữ liệu cho Module Task", time: "3 giờ trước" }
            ]
        },

        // --- VAI TRÒ NHÂN VIÊN (EMPLOYEE - DEV/TESTER) ---
        employee: {
            kpi: {
                totalProjects: "2 Dự án",
                projectsTrend: "Work Management (60%), Mobile (40%)",
                totalTasks: "14 Tasks",
                tasksTrend: "10 hoàn thành, 3 đang làm, 1 trễ",
                capacityAlerts: "1 Cảnh báo",
                capacityTrend: "Sức tải tuần này 110% (Cần lưu ý)",
                pendingApprovals: "1 Yêu cầu",
                approvalsTrend: "Đã gửi xin gia hạn Task #48",
                ontimeRate: "96.2%",
                ontimeTrend: "Vượt chỉ tiêu cá nhân (+4.2%)"
            },
            myTasks: [
                { id: "t1", title: "Hoàn thiện giao diện Trang Đăng nhập & Đăng xuất (Auth Flow)", project: "Work Management", priority: "p1", priorityText: "Khẩn cấp (P1)", isToday: true, isDone: true },
                { id: "t2", title: "Fix lỗi hiển thị avatar trên Safari & Mobile viewport", project: "Work Management", priority: "p2", priorityText: "Ưu tiên cao (P2)", isToday: true, isDone: false },
                { id: "t3", title: "Viết kịch bản kiểm thử Checklist DoR/DoD", project: "Work Management", priority: "p3", priorityText: "Bình thường (P3)", isToday: true, isDone: false },
                { id: "t4", title: "Tối ưu hóa tốc độ tải CSS Dashboard", project: "Work Management", priority: "p4", priorityText: "Thấp (P4)", isToday: false, isDone: true },
                { id: "t5", title: "Cập nhật tài liệu hướng dẫn sử dụng hệ thống", project: "Mobile App", priority: "p3", priorityText: "Bình thường (P3)", isToday: false, isDone: false }
            ],
            devBugs: [
                { id: "BUG-101", title: "Nút Đăng xuất bị tràn lề trên màn hình iPad", project: "Work Management", tester: "Hoàng Nam", priority: "P1", priorityClass: "tag-p1", isReopened: false },
                { id: "BUG-102", title: "Chưa validate độ dài mật khẩu khi đổi mật khẩu", project: "Work Management", tester: "Hoàng Nam", priority: "P2", priorityClass: "tag-p2", isReopened: false },
                { id: "BUG-103", title: "Sai màu avatar mặc định khi chuyển đổi vai trò", project: "CRM", tester: "Đặng Linh", priority: "P3", priorityClass: "tag-p3", isReopened: true }
            ],
            testerTasks: [
                { id: "TEST-201", title: "Kiểm thử luồng Đăng nhập với tài khoản mẫu 1-chạm", project: "Work Management", dev: "Lê Gia Bách", priority: "P1", priorityClass: "tag-p1" },
                { id: "TEST-202", title: "Kiểm tra bảo mật Route Guard khi chưa đăng nhập", project: "Work Management", dev: "Lê Gia Bách", priority: "P1", priorityClass: "tag-p1" },
                { id: "TEST-203", title: "Kiểm thử hiển thị biểu đồ KPI và WSI trên Firefox", project: "CRM", dev: "Tuấn Bùi", priority: "P2", priorityClass: "tag-p2" }
            ],
            inbox: [
                { id: "emp-req-1", type: "qa", icon: "fa-solid fa-circle-check", title: "Task 'Giao diện Hồ sơ cá nhân' đã được Tester nghiệm thu PASS", sender: "Hoàng Nam (QA)", time: "20 phút trước", status: "Đã duyệt" },
                { id: "emp-req-2", type: "extension", icon: "fa-solid fa-clock", title: "Yêu cầu gia hạn Task #48 đang chờ Trưởng phòng phê duyệt", sender: "Hệ thống", time: "2 giờ trước", status: "Đang chờ" }
            ],
            timeline: [
                { actor: "dev", title: "Bạn đã nộp mã nguồn hoàn thành Module Auth", time: "15 phút trước" },
                { actor: "tester", title: "Hoàng Nam đã kiểm thử đạt chuẩn tính năng Đổi mật khẩu", time: "1 giờ trước" },
                { actor: "pm", title: "Phan Văn Khánh đã giao task mới 'Tối ưu UI Mobile' cho bạn", time: "1 ngày trước" }
            ]
        }
    };

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
