/**
 * WORKFLOW: RECURRING TASK SCHEDULER (Công việc định kỳ)
 * Quản lý lịch trình tự động giao task định kỳ (Cron Scheduler)
 */
document.addEventListener("DOMContentLoaded", function () {
  const RECURRING_KEY = 'etrms_recurring_tasks';

  const DEFAULT_RECURRING = [
    {
      id: 'rec_001',
      name: 'Báo cáo chấm công tuần',
      department: 'hr',
      departmentName: 'Phòng Nhân sự',
      assigneeName: 'Lê Gia Bách',
      assigneeAvatar: 'GB',
      cycle: 'Hàng tuần',
      cronTime: '0 17 * * 5',
      status: 'ACTIVE'
    },
    {
      id: 'rec_002',
      name: 'Kiểm tra log & sao lưu Database Staging',
      department: 'engineering',
      departmentName: 'Phòng Kỹ thuật & Hạ tầng',
      assigneeName: 'Trần Minh',
      assigneeAvatar: 'TM',
      cycle: 'Hàng ngày',
      cronTime: '0 0 * * *',
      status: 'ACTIVE'
    },
    {
      id: 'rec_003',
      name: 'Chạy bộ kiểm thử tự động (Automation Suite)',
      department: 'qa',
      departmentName: 'Kiểm thử (QA/QC)',
      assigneeName: 'Hoàng Nam',
      assigneeAvatar: 'HN',
      cycle: 'Hàng ngày',
      cronTime: '0 2 * * *',
      status: 'ACTIVE'
    },
    {
      id: 'rec_004',
      name: 'Họp Sprint Review & Kế hoạch tuần mới',
      department: 'dev',
      departmentName: 'Phát triển Phần mềm (DEV)',
      assigneeName: 'Khải Trần Văn',
      assigneeAvatar: 'KT',
      cycle: 'Hàng tuần',
      cronTime: '0 9 * * 1',
      status: 'ACTIVE'
    },
    {
      id: 'rec_005',
      name: 'Rà soát Design Tokens & UI Guidelines',
      department: 'design',
      departmentName: 'Thiết kế (UI/UX)',
      assigneeName: 'Bùi Tuấn',
      assigneeAvatar: 'BT',
      cycle: 'Hàng tháng',
      cronTime: '0 10 1 * *',
      status: 'ACTIVE'
    },
    {
      id: 'rec_006',
      name: 'Lên lịch xuất bản bài truyền thông kỹ thuật',
      department: 'marketing',
      departmentName: 'Phòng Marketing',
      assigneeName: 'Lê Thị Cẩm',
      assigneeAvatar: 'LC',
      cycle: 'Hàng tháng',
      cronTime: '0 9 1 * *',
      status: 'INACTIVE'
    }
  ];

  function getRecurringTasks() {
    try {
      const data = localStorage.getItem(RECURRING_KEY);
      if (!data) {
        saveRecurringTasks(DEFAULT_RECURRING);
        return DEFAULT_RECURRING;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        saveRecurringTasks(DEFAULT_RECURRING);
        return DEFAULT_RECURRING;
      }
      return parsed;
    } catch (e) {
      return DEFAULT_RECURRING;
    }
  }

  function saveRecurringTasks(list) {
    try {
      localStorage.setItem(RECURRING_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Lỗi lưu recurring tasks:', e);
    }
  }

  function getDeptName(deptKey) {
    const map = {
      dev: 'Phát triển Phần mềm (DEV)',
      qa: 'Kiểm thử (QA/QC)',
      design: 'Thiết kế (UI/UX)',
      hr: 'Phòng Nhân sự',
      engineering: 'Phòng Kỹ thuật & Hạ tầng',
      marketing: 'Phòng Marketing'
    };
    return map[deptKey] || deptKey;
  }

  /* ========================================= */
  /*          RENDER RECURRING TABLE           */
  /* ========================================= */
  const recurringBody = document.getElementById("recurring-body");
  const recurringSearch = document.getElementById("recurring-search");
  const recurringDepartment = document.getElementById("recurring-department");
  const recurringStatus = document.getElementById("recurring-status-filter");

  function updateKPIStats(list) {
    const totalEl = document.getElementById("stat-total-recurring");
    const activeEl = document.getElementById("stat-active-recurring");
    const inactiveEl = document.getElementById("stat-inactive-recurring");

    const total = list.length;
    const active = list.filter(t => t.status === 'ACTIVE').length;
    const inactive = total - active;

    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (inactiveEl) inactiveEl.textContent = inactive;
  }

  function renderRecurringTable() {
    if (!recurringBody) return;
    const all = getRecurringTasks();
    updateKPIStats(all);

    const selectedDept = recurringDepartment ? recurringDepartment.value : 'all';
    const selectedStatus = recurringStatus ? recurringStatus.value : 'all';
    const query = recurringSearch ? recurringSearch.value.toLowerCase().trim() : '';

    const filtered = all.filter((item) => {
      const matchDept = selectedDept === 'all' || item.department === selectedDept;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchSearch = !query || item.name.toLowerCase().includes(query) || (item.assigneeName && item.assigneeName.toLowerCase().includes(query));
      return matchDept && matchStatus && matchSearch;
    });

    recurringBody.innerHTML = '';

    if (filtered.length === 0) {
      recurringBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: #8c8c8c; padding: 36px 16px;">
            <i class="fa-solid fa-rotate" style="font-size: 32px; margin-bottom: 10px; display: block; color: #bfbfbf;"></i>
            <div style="font-weight: 500;">Không tìm thấy công việc định kỳ nào phù hợp</div>
            <div style="font-size: 12px; color: #a6a6a6; margin-top: 4px;">Thử điều chỉnh bộ lọc hoặc bấm "Tạo Cấu hình Lặp" để thêm mới.</div>
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach((item) => {
      const tr = document.createElement("tr");
      tr.dataset.id = item.id;
      tr.dataset.department = item.department;
      tr.dataset.status = item.status;

      const isActive = item.status === 'ACTIVE';
      const statusClass = isActive ? 'status-active' : 'status-inactive';
      const powerClass = isActive ? 'active-power' : 'inactive-power';
      const powerTitle = isActive ? 'Tắt cấu hình' : 'Bật cấu hình';

      tr.innerHTML = `
        <td class="recurring-task-name">
          <strong>${escapeHtml(item.name)}</strong>
        </td>
        <td>${escapeHtml(item.departmentName || getDeptName(item.department))}</td>
        <td>
          <div class="user-info">
            <div class="user-avatar">${escapeHtml(item.assigneeAvatar || 'US')}</div>
            <span>${escapeHtml(item.assigneeName || 'Chưa gán')}</span>
          </div>
        </td>
        <td><strong>${escapeHtml(item.cycle || 'Hàng tuần')}</strong></td>
        <td class="cron-time" style="font-family: monospace; color: #0958d9;">${escapeHtml(item.cronTime || '0 0 * * *')}</td>
        <td>
          <span class="recurring-status ${statusClass}">
            ${item.status}
          </span>
        </td>
        <td class="action-column">
          <div class="recurring-actions">
            <button
              type="button"
              class="recurring-action-btn"
              title="Kích hoạt tạo Task ngay vào Danh sách công việc"
              style="color: #52c41a;"
              onclick="window.triggerRecurringTaskNow('${item.id}')"
            >
              <i class="fa-solid fa-play"></i>
            </button>
            <button
              type="button"
              class="recurring-action-btn"
              title="Chỉnh sửa cấu hình"
              onclick="window.openEditRecurringModal('${item.id}')"
            >
              <i class="fa-solid fa-pen"></i>
            </button>
            <button
              type="button"
              class="recurring-action-btn recurring-power-btn ${powerClass}"
              title="${powerTitle}"
              onclick="window.toggleRecurringPower('${item.id}')"
            >
              <i class="fa-solid fa-power-off"></i>
            </button>
            <button
              type="button"
              class="recurring-action-btn btn-delete"
              title="Xóa cấu hình"
              onclick="window.deleteRecurringTask('${item.id}')"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      recurringBody.appendChild(tr);
    });
  }

  /* ========================================= */
  /*      RECURRING TASK ACTIONS & MODALS      */
  /* ========================================= */

  // 1. Kích hoạt tạo Task ngay vào etrms-tasks
  window.triggerRecurringTaskNow = function(id) {
    const list = getRecurringTasks();
    const item = list.find(r => r.id === id);
    if (!item) return;

    try {
      const tasksKey = 'etrms-tasks';
      let tasks = JSON.parse(localStorage.getItem(tasksKey)) || [];
      const nextNum = tasks.length + 1;
      const taskCode = `REC-${String(nextNum).padStart(3, '0')}`;
      const now = new Date();
      const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const newTask = {
        id: Date.now(),
        code: taskCode,
        title: `[Định kỳ] ${item.name}`,
        project: item.departmentName || 'Hệ thống Doanh nghiệp',
        department: item.departmentName || 'Phòng ban',
        assignee: item.assigneeName || 'Lê Gia Bách',
        priority: 'P2',
        status: 'IN_PROGRESS',
        dueDate: dueDate,
        isRecurring: true,
        createdAt: now.toISOString()
      };

      tasks.unshift(newTask);
      localStorage.setItem(tasksKey, JSON.stringify(tasks));

      if (window.showToast) {
        window.showToast(`Đã kích hoạt tạo Task [${taskCode}] "${item.name}" vào Danh sách công việc!`, 'success');
      }
    } catch (e) {
      console.error('Lỗi tạo task từ recurring:', e);
      if (window.showToast) window.showToast('Không thể tạo task tự động lúc này.', 'error');
    }
  };

  // 2. Bật/Tắt Task định kỳ (Power toggle)
  window.toggleRecurringPower = function(id) {
    const list = getRecurringTasks();
    const item = list.find(x => x.id === id);
    if (!item) return;

    item.status = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    saveRecurringTasks(list);
    renderRecurringTable();

    if (window.showToast) {
      window.showToast(
        item.status === 'ACTIVE'
          ? `Đã BẬT cấu hình task định kỳ "${item.name}"!`
          : `Đã TẮT cấu hình task định kỳ "${item.name}".`,
        item.status === 'ACTIVE' ? 'success' : 'info'
      );
    }
  };

  // 3. Xóa Task định kỳ
  window.deleteRecurringTask = function(id) {
    const list = getRecurringTasks();
    const item = list.find(x => x.id === id);
    if (!item) return;

    if (typeof window.openModal === 'function') {
      const confirmHtml = `
        <div style="font-size: 14px; line-height: 1.6; color: #262626;">
          Bạn có chắc chắn muốn xóa cấu hình công việc định kỳ: <strong>"${escapeHtml(item.name)}"</strong>?<br>
          <span style="font-size: 12px; color: #8c8c8c;">Hệ thống sẽ không còn tự động khởi tạo công việc này theo lịch trình nữa.</span>
        </div>
      `;
      window.openModal(
        '<i class="fa-solid fa-triangle-exclamation" style="color:#ff4d4f; margin-right:8px;"></i>Xác nhận xóa Cấu hình',
        confirmHtml,
        function() {
          const updated = list.filter(x => x.id !== id);
          saveRecurringTasks(updated);
          renderRecurringTable();
          if (typeof window.closeModal === 'function') window.closeModal();
          if (window.showToast) window.showToast(`Đã xóa cấu hình "${item.name}" thành công!`, 'info');
        },
        { confirmText: 'Xóa ngay', confirmClass: 'btn btn-danger', showCancel: true }
      );
    } else {
      if (confirm(`Bạn có chắc muốn xóa task định kỳ "${item.name}" không?`)) {
        const updated = list.filter(x => x.id !== id);
        saveRecurringTasks(updated);
        renderRecurringTable();
        if (window.showToast) window.showToast(`Đã xóa cấu hình "${item.name}" thành công!`, 'info');
      }
    }
  };

  // 4. Mở Modal Tạo & Chỉnh sửa Task Định kỳ
  window.openEditRecurringModal = function(id) {
    openRecurringFormModal(id);
  };

  const createRecurringBtn = document.getElementById("create-recurring-btn");
  if (createRecurringBtn) {
    createRecurringBtn.addEventListener("click", function() {
      openRecurringFormModal();
    });
  }

  function openRecurringFormModal(editId = null) {
    const isEdit = editId !== null;
    const list = getRecurringTasks();
    const editingItem = isEdit ? list.find(x => x.id === editId) : null;

    const modalTitle = isEdit
      ? '<i class="fa-solid fa-pen-to-square" style="color:#1677ff; margin-right:8px;"></i>Chỉnh sửa Cấu hình Công việc định kỳ'
      : '<i class="fa-solid fa-rotate" style="color:#1677ff; margin-right:8px;"></i>Tạo Cấu hình Công việc định kỳ Mới';

    const formHtml = `
      <form id="recurring-form" style="display: flex; flex-direction: column; gap: 14px; text-align: left;">
        <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
          <label style="font-size: 13px; font-weight: 600; color: #262626;">Tên công việc định kỳ <span style="color: #ff4d4f;">*</span></label>
          <input type="text" id="modal-rec-name" class="form-control" placeholder="ví dụ: Báo cáo chấm công tuần" value="${isEdit ? escapeHtml(editingItem.name) : ''}" required style="height: 38px; border: 1px solid #d9d9d9; border-radius: 6px; padding: 0 12px; font-size: 14px; box-sizing: border-box;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; font-weight: 600; color: #262626;">Phòng ban</label>
            <select id="modal-rec-dept" class="form-control" style="height: 38px; border: 1px solid #d9d9d9; border-radius: 6px; padding: 0 12px; font-size: 14px; background: white; box-sizing: border-box;">
              <option value="dev" ${isEdit && editingItem.department === 'dev' ? 'selected' : ''}>Phát triển Phần mềm (DEV)</option>
              <option value="qa" ${isEdit && editingItem.department === 'qa' ? 'selected' : ''}>Kiểm thử (QA/QC)</option>
              <option value="design" ${isEdit && editingItem.department === 'design' ? 'selected' : ''}>Thiết kế (UI/UX)</option>
              <option value="engineering" ${isEdit && editingItem.department === 'engineering' ? 'selected' : ''}>Phòng Kỹ thuật & Hạ tầng</option>
              <option value="hr" ${isEdit && editingItem.department === 'hr' ? 'selected' : ''}>Phòng Nhân sự</option>
              <option value="marketing" ${isEdit && editingItem.department === 'marketing' ? 'selected' : ''}>Phòng Marketing</option>
            </select>
          </div>

          <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; font-weight: 600; color: #262626;">Người thực hiện</label>
            <input type="text" id="modal-rec-assignee" class="form-control" placeholder="ví dụ: Lê Gia Bách" value="${isEdit ? escapeHtml(editingItem.assigneeName) : 'Lê Gia Bách'}" style="height: 38px; border: 1px solid #d9d9d9; border-radius: 6px; padding: 0 12px; font-size: 14px; box-sizing: border-box;">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; font-weight: 600; color: #262626;">Chu kỳ lặp</label>
            <select id="modal-rec-cycle" class="form-control" style="height: 38px; border: 1px solid #d9d9d9; border-radius: 6px; padding: 0 12px; font-size: 14px; background: white; box-sizing: border-box;">
              <option value="Hàng ngày" ${isEdit && (editingItem.cycle === 'Hàng ngày' || editingItem.cycle === 'Daily') ? 'selected' : ''}>Hàng ngày (Daily)</option>
              <option value="Hàng tuần" ${!isEdit || (editingItem && (editingItem.cycle === 'Hàng tuần' || editingItem.cycle === 'Weekly')) ? 'selected' : ''}>Hàng tuần (Weekly)</option>
              <option value="Hàng tháng" ${isEdit && (editingItem.cycle === 'Hàng tháng' || editingItem.cycle === 'Monthly') ? 'selected' : ''}>Hàng tháng (Monthly)</option>
            </select>
          </div>

          <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; font-weight: 600; color: #262626;">Thời gian chạy (Cron)</label>
            <input type="text" id="modal-rec-cron" class="form-control" placeholder="0 17 * * 5" value="${isEdit ? escapeHtml(editingItem.cronTime) : '0 17 * * 5'}" style="height: 38px; border: 1px solid #d9d9d9; border-radius: 6px; padding: 0 12px; font-size: 14px; font-family: monospace; box-sizing: border-box;">
          </div>
        </div>

        <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
          <label style="font-size: 13px; font-weight: 600; color: #262626;">Trạng thái kích hoạt</label>
          <select id="modal-rec-status" class="form-control" style="height: 38px; border: 1px solid #d9d9d9; border-radius: 6px; padding: 0 12px; font-size: 14px; background: white; box-sizing: border-box;">
            <option value="ACTIVE" ${!isEdit || (editingItem && editingItem.status === 'ACTIVE') ? 'selected' : ''}>Đang kích hoạt (ACTIVE)</option>
            <option value="INACTIVE" ${isEdit && editingItem && editingItem.status === 'INACTIVE' ? 'selected' : ''}>Tạm ngưng (INACTIVE)</option>
          </select>
        </div>
      </form>
    `;

    window.openModal(modalTitle, formHtml, function() {
      const nameInput = document.getElementById("modal-rec-name");
      const nameVal = nameInput ? nameInput.value.trim() : '';

      if (!nameVal) {
        if (window.showToast) window.showToast('Vui lòng nhập tên task định kỳ!', 'warning');
        nameInput.focus();
        return;
      }

      const deptVal = document.getElementById("modal-rec-dept").value;
      const assigneeVal = document.getElementById("modal-rec-assignee").value.trim() || 'Lê Gia Bách';
      const cycleVal = document.getElementById("modal-rec-cycle").value;
      const cronVal = document.getElementById("modal-rec-cron").value.trim() || '0 0 * * *';
      const statusVal = document.getElementById("modal-rec-status").value;

      const avatarParts = assigneeVal.split(' ');
      const avatarLetters = avatarParts.length > 1
        ? (avatarParts[0][0] + avatarParts[avatarParts.length - 1][0]).toUpperCase()
        : assigneeVal.substring(0, 2).toUpperCase();

      if (isEdit) {
        const itemIdx = list.findIndex(x => x.id === editId);
        if (itemIdx !== -1) {
          list[itemIdx].name = nameVal;
          list[itemIdx].department = deptVal;
          list[itemIdx].departmentName = getDeptName(deptVal);
          list[itemIdx].assigneeName = assigneeVal;
          list[itemIdx].assigneeAvatar = avatarLetters;
          list[itemIdx].cycle = cycleVal;
          list[itemIdx].cronTime = cronVal;
          list[itemIdx].status = statusVal;

          saveRecurringTasks(list);
          if (window.showToast) window.showToast(`Đã cập nhật cấu hình "${nameVal}"!`, 'success');
        }
      } else {
        const newItem = {
          id: 'rec_' + Date.now(),
          name: nameVal,
          department: deptVal,
          departmentName: getDeptName(deptVal),
          assigneeName: assigneeVal,
          assigneeAvatar: avatarLetters,
          cycle: cycleVal,
          cronTime: cronVal,
          status: statusVal
        };
        list.unshift(newItem);
        saveRecurringTasks(list);
        if (window.showToast) window.showToast(`Đã tạo cấu hình lặp "${nameVal}" thành công!`, 'success');
      }

      renderRecurringTable();
      if (typeof window.closeModal === 'function') window.closeModal();
    });
  }

  /* ========================================= */
  /*          EVENT LISTENERS CHO FILTERS      */
  /* ========================================= */
  if (recurringSearch) recurringSearch.addEventListener("input", renderRecurringTable);
  if (recurringDepartment) recurringDepartment.addEventListener("change", renderRecurringTable);
  if (recurringStatus) recurringStatus.addEventListener("change", renderRecurringTable);

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Khởi chạy render ngay khi tải trang
  renderRecurringTable();
});
