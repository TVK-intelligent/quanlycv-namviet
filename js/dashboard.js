// Khởi tạo Mock Data cho Dashboard
function initMockData() {
    if (!localStorage.getItem('etrms_projects')) {
        localStorage.setItem('etrms_projects', JSON.stringify([
            { id: 1, name: 'Triển khai CRM', status: 'In Progress' },
            { id: 2, name: 'Thiết kế hệ thống ETRMS', status: 'In Progress' },
            { id: 3, name: 'Bảo trì hệ thống cũ', status: 'Done' }
        ]));
    }
    
    if (!localStorage.getItem('etrms_tasks')) {
        localStorage.setItem('etrms_tasks', JSON.stringify([
            { id: 101, title: 'Thiết kế UI Dashboard', project: 'Thiết kế hệ thống ETRMS', status: 'In Progress', priority: 'P2', priorityClass: 'badge-p2', dueDate: '2026-08-10' },
            { id: 102, title: 'Viết tài liệu SRS', project: 'Triển khai CRM', status: 'Done', priority: 'P1', priorityClass: 'badge-p1', dueDate: '2026-08-05' },
            { id: 103, title: 'Code logic Login', project: 'Thiết kế hệ thống ETRMS', status: 'To Do', priority: 'P3', priorityClass: 'badge-p3', dueDate: '2026-08-15' }
        ]));
    }

    if (!localStorage.getItem('etrms_employees_wsi')) {
        localStorage.setItem('etrms_employees_wsi', JSON.stringify([
            { name: 'Khải Trần Văn', wsi: 110 },
            { name: 'Lê Gia Bách', wsi: 80 },
            { name: 'Nguyễn Văn A', wsi: 100 },
            { name: 'Trần Thị B', wsi: 40 }
        ]));
    }

    if (!localStorage.getItem('etrms_inbox')) {
        localStorage.setItem('etrms_inbox', JSON.stringify([
            { id: 1, title: 'Xin gia hạn Task 103', desc: 'Nguyễn Văn A yêu cầu gia hạn 2 ngày', type: 'Request' },
            { id: 2, title: 'Cảnh báo chậm tiến độ', desc: 'Dự án CRM đang trễ hạn 15%', type: 'Alert' }
        ]));
    }
}

function renderDashboard() {
    // 1. KPI Cards
    const projects = JSON.parse(localStorage.getItem('etrms_projects')) || [];
    const tasks = JSON.parse(localStorage.getItem('etrms_tasks')) || [];
    const employees = JSON.parse(localStorage.getItem('etrms_employees_wsi')) || [];

    document.getElementById('kpi-total-projects').textContent = projects.length;
    document.getElementById('kpi-active-tasks').textContent = tasks.filter(t => t.status !== 'Done').length;
    document.getElementById('kpi-total-employees').textContent = employees.length;
    
    // Giả lập tỷ lệ đúng hạn
    document.getElementById('kpi-ontime-rate').textContent = '92%';

    // 2. Render WSI (Sức tải nhân sự)
    const wsiContainer = document.getElementById('wsi-list-container');
    wsiContainer.innerHTML = '';
    employees.forEach(emp => {
        let colorClass = 'wsi-safe';
        if (emp.wsi === 100) colorClass = 'wsi-warn';
        if (emp.wsi > 100) colorClass = 'wsi-danger';
        
        const displayWsi = emp.wsi > 100 ? 100 : emp.wsi; // Hiển thị max 100% trên bar, text có thể hơn
        
        wsiContainer.innerHTML += `
            <div class="wsi-item">
                <div class="wsi-header">
                    <span>${emp.name}</span>
                    <span style="color: var(${emp.wsi > 100 ? '--danger-color' : 'inherit'})">${emp.wsi}%</span>
                </div>
                <div class="wsi-bar-bg">
                    <div class="wsi-bar-fill ${colorClass}" style="width: ${displayWsi}%"></div>
                </div>
            </div>
        `;
    });

    // 3. Render My Tasks
    const tbody = document.getElementById('my-tasks-tbody');
    tbody.innerHTML = '';
    tasks.forEach(task => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${task.title}</strong></td>
                <td>${task.project}</td>
                <td><span class="badge ${task.status === 'Done' ? 'badge-done' : (task.status === 'To Do' ? 'badge-todo' : 'badge-progress')}">${task.status}</span></td>
                <td><span class="badge ${task.priorityClass}">${task.priority}</span></td>
                <td>${task.dueDate}</td>
            </tr>
        `;
    });

    // 4. Render Inbox
    const inboxContainer = document.getElementById('inbox-container');
    const inbox = JSON.parse(localStorage.getItem('etrms_inbox')) || [];
    inboxContainer.innerHTML = '';
    inbox.forEach(item => {
        inboxContainer.innerHTML += `
            <li class="inbox-item">
                <div>
                    <div class="inbox-title">${item.title}</div>
                    <div class="inbox-desc">${item.desc}</div>
                </div>
                <span style="color: var(--primary-color);">→</span>
            </li>
        `;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMockData();
    renderDashboard();
});
