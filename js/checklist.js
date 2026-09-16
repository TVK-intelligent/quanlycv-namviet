/**
 * WORKFLOW: QUALITY CHECKLIST (DoR / DoD Templates)
 * js/checklist.js
 * Quản lý Mẫu Danh mục Kiểm tra Tiêu chuẩn (Definition of Ready / Definition of Done)
 */

document.addEventListener("DOMContentLoaded", function () {
  'use strict';

  /* ========================================= */
  /*          STORAGE KEYS & SEED DATA         */
  /* ========================================= */
  const CHECKLIST_KEY = 'etrms_checklists';

  const DEFAULT_CHECKLISTS = [
    {
      id: 'chk_001',
      name: 'Checklist Definition of Ready (DoR) - Mobile App',
      type: 'DoR',
      department: 'dev',
      departmentName: 'Phát triển Phần mềm',
      itemsCount: 12,
      createdAt: '15/10/2023',
      status: 'PENDING'
    },
    {
      id: 'chk_002',
      name: 'Checklist Definition of Done (DoD) - Backend API',
      type: 'DoD',
      department: 'dev',
      departmentName: 'Phát triển Phần mềm',
      itemsCount: 15,
      createdAt: '10/10/2023',
      status: 'PENDING'
    },
    {
      id: 'chk_003',
      name: 'Checklist Kiểm thử phần mềm',
      type: 'DoD',
      department: 'qa',
      departmentName: 'Kiểm thử (QA/QC)',
      itemsCount: 10,
      createdAt: '05/10/2023',
      status: 'COMPLETED'
    },
    {
      id: 'chk_004',
      name: 'Checklist Chuẩn bị thiết kế UI/UX',
      type: 'DoR',
      department: 'design',
      departmentName: 'Thiết kế (UI/UX)',
      itemsCount: 8,
      createdAt: '01/10/2023',
      status: 'PENDING'
    }
  ];

  function getChecklists() {
    try {
      const data = localStorage.getItem(CHECKLIST_KEY);
      if (!data) {
        saveChecklists(DEFAULT_CHECKLISTS);
        return DEFAULT_CHECKLISTS;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        saveChecklists(DEFAULT_CHECKLISTS);
        return DEFAULT_CHECKLISTS;
      }
      return parsed;
    } catch (e) {
      return DEFAULT_CHECKLISTS;
    }
  }

  function saveChecklists(list) {
    try {
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Lỗi lưu checklists:', e);
    }
  }

  function initDataIfEmpty() {
    try {
      const chk = localStorage.getItem(CHECKLIST_KEY);
      if (!chk || JSON.parse(chk).length === 0) {
        saveChecklists(DEFAULT_CHECKLISTS);
      }
    } catch (e) {
      saveChecklists(DEFAULT_CHECKLISTS);
    }
  }
  initDataIfEmpty();

  /* ========================================= */
  /*          RENDER CHECKLIST TABLE           */
  /* ========================================= */
  const checklistBody = document.getElementById("checklist-body");
  const typeFilter = document.getElementById("checklist-type");
  const departmentFilter = document.getElementById("department");
  const searchInput = document.getElementById("checklist-search");

  function renderChecklistTable() {
    if (!checklistBody) return;
    const all = getChecklists();

    const selectedType = typeFilter ? typeFilter.value : 'all';
    const selectedDept = departmentFilter ? departmentFilter.value : 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = all.filter((item) => {
      const matchType = selectedType === 'all' || item.type === selectedType;
      const matchDept = selectedDept === 'all' || item.department === selectedDept;
      const matchSearch = !query || item.name.toLowerCase().includes(query) || (item.departmentName && item.departmentName.toLowerCase().includes(query));
      return matchType && matchDept && matchSearch;
    });

    checklistBody.innerHTML = '';

    if (filtered.length === 0) {
      checklistBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: #8c8c8c; padding: 32px;">
            <i class="fa-solid fa-clipboard-question" style="font-size: 28px; margin-bottom: 8px; display: block; color: #bfbfbf;"></i>
            Không tìm thấy mẫu Checklist nào phù hợp
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach((item) => {
      const tr = document.createElement("tr");
      tr.dataset.id = item.id;
      tr.dataset.type = item.type;
      tr.dataset.department = item.department;

      const isCompleted = item.status === 'COMPLETED';
      const badgeClass = item.type === 'DoR' ? 'badge-dor' : 'badge-dod';
      const statusClass = isCompleted ? 'status-completed' : 'status-pending';
      const statusText = isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành';

      tr.innerHTML = `
        <td class="checklist-name">${escapeHtml(item.name)}</td>
        <td>
          <span class="badge ${badgeClass}">${item.type}</span>
        </td>
        <td>${escapeHtml(item.departmentName || getDeptName(item.department))}</td>
        <td>${item.itemsCount || 0}</td>
        <td>${item.createdAt || ''}</td>
        <td class="status-cell">
          <span class="status-badge ${statusClass}">
            ${statusText}
          </span>
        </td>
        <td class="action-column">
          <div class="action-buttons">
            <button
              type="button"
              class="btn-action btn-complete ${isCompleted ? 'is-done' : ''}"
              title="${isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}"
              onclick="window.toggleChecklistComplete('${item.id}')"
            >
              <i class="fa-solid fa-check"></i>
            </button>
            <button
              type="button"
              class="btn-action"
              title="Chỉnh sửa"
              onclick="window.openEditChecklistModal('${item.id}')"
            >
              <i class="fa-solid fa-pen"></i>
            </button>
            <button
              type="button"
              class="btn-action btn-delete"
              title="Xóa"
              onclick="window.deleteChecklist('${item.id}')"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      checklistBody.appendChild(tr);
    });
  }

  /* ========================================= */
  /*          CHECKLIST ACTIONS & MODALS       */
  /* ========================================= */

  // 1. Bật/Tắt trạng thái hoàn thành
  window.toggleChecklistComplete = function(id) {
    const list = getChecklists();
    const item = list.find(x => x.id === id);
    if (!item) return;

    item.status = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    saveChecklists(list);
    renderChecklistTable();

    if (window.showToast) {
      window.showToast(
        item.status === 'COMPLETED' 
          ? `Đã đánh dấu hoàn thành mẫu "${item.name}"!` 
          : `Đã chuyển mẫu "${item.name}" về trạng thái Chưa hoàn thành.`,
        'success'
      );
    }
  };

  // 2. Xóa mẫu Checklist
  window.deleteChecklist = function(id) {
    const list = getChecklists();
    const item = list.find(x => x.id === id);
    if (!item) return;

    if (typeof window.openModal === 'function') {
      window.openModal(
        '<i class="fa-solid fa-triangle-exclamation" style="color:#ff4d4f; margin-right:8px;"></i>Xác nhận xóa Mẫu Checklist',
        `<p style="font-size: 14px; color: #595959; line-height: 1.6;">
          Bạn có chắc chắn muốn xóa mẫu checklist <strong>"${escapeHtml(item.name)}"</strong> không?<br>
          <span style="font-size: 12px; color: #8c8c8c;">Thao tác này không thể khôi phục lại.</span>
        </p>`,
        function() {
          const updated = list.filter(x => x.id !== id);
          saveChecklists(updated);
          renderChecklistTable();
          if (typeof window.closeModal === 'function') window.closeModal();
          if (window.showToast) window.showToast(`Đã xóa mẫu "${item.name}" thành công!`, 'success');
        }
      );
    } else {
      if (confirm(`Bạn có chắc muốn xóa mẫu "${item.name}" không?`)) {
        const updated = list.filter(x => x.id !== id);
        saveChecklists(updated);
        renderChecklistTable();
      }
    }
  };

  // Helper chuyển đổi mã phòng ban sang tên hiển thị
  function getDeptName(deptKey) {
    const map = {
      dev: 'Phát triển Phần mềm',
      qa: 'Kiểm thử (QA/QC)',
      design: 'Thiết kế (UI/UX)',
      hr: 'Phòng Nhân sự',
      engineering: 'Phòng Kỹ thuật',
      marketing: 'Phòng Marketing'
    };
    return map[deptKey] || deptKey;
  }

  // 3. Mở Modal Tạo Mẫu Checklist Mới
  const createChecklistBtn = document.getElementById("create-checklist-btn") || document.querySelector(".btn-create-checklist");
  if (createChecklistBtn) {
    createChecklistBtn.addEventListener("click", function() {
      openChecklistFormModal();
    });
  }

  // 4. Mở Modal Chỉnh sửa Mẫu Checklist
  window.openEditChecklistModal = function(id) {
    const list = getChecklists();
    const item = list.find(x => x.id === id);
    if (!item) return;
    openChecklistFormModal(item);
  };

  function openChecklistFormModal(editingItem = null) {
    const isEdit = !!editingItem;
    const modalTitle = isEdit 
      ? '<i class="fa-solid fa-pen-to-square" style="color:#1677ff; margin-right:8px;"></i>Chỉnh sửa Danh mục Kiểm tra'
      : '<i class="fa-solid fa-plus" style="color:#1677ff; margin-right:8px;"></i>Tạo Danh mục Tiêu chuẩn Kiểm tra Mới';

    const formHtml = `
      <form id="checklist-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
          <label style="font-size: 13px; font-weight: 600; color: #262626;">Tên danh mục kiểm tra <span style="color: #ff4d4f;">*</span></label>
          <input type="text" id="modal-chk-name" class="form-control" placeholder="ví dụ: Tiêu chuẩn kiểm thử bảo mật API" value="${isEdit ? escapeHtml(editingItem.name) : ''}" required style="height: 38px; border: 1px solid #d9d9d9; border-radius: 6px; padding: 0 12px; font-size: 14px;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; font-weight: 600; color: #262626;">Loại tiêu chuẩn</label>
            <select id="modal-chk-type" class="form-control" style="height: 38px; border: 1px solid #d9d9d9; border-radius: 6px; padding: 0 12px; font-size: 14px; background: white;">
              <option value="DoR" ${isEdit && editingItem.type === 'DoR' ? 'selected' : ''}>DoR (Điều kiện bắt đầu)</option>
              <option value="DoD" ${isEdit && editingItem.type === 'DoD' ? 'selected' : ''}>DoD (Điều kiện hoàn thành)</option>
            </select>
          </div>

          <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; font-weight: 600; color: #262626;">Phòng ban áp dụng</label>
            <select id="modal-chk-dept" class="form-control" style="height: 38px; border: 1px solid #d9d9d9; border-radius: 6px; padding: 0 12px; font-size: 14px; background: white;">
              <option value="dev" ${isEdit && editingItem.department === 'dev' ? 'selected' : ''}>Phát triển Phần mềm</option>
              <option value="qa" ${isEdit && editingItem.department === 'qa' ? 'selected' : ''}>Kiểm thử (QA/QC)</option>
              <option value="design" ${isEdit && editingItem.department === 'design' ? 'selected' : ''}>Thiết kế (UI/UX)</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; font-weight: 600; color: #262626;">Số lượng mục kiểm tra</label>
            <input type="number" id="modal-chk-count" class="form-control" min="1" max="100" value="${isEdit ? editingItem.itemsCount : 10}" style="height: 38px; border: 1px solid #d9d9d9; border-radius: 6px; padding: 0 12px; font-size: 14px;">
          </div>

          <div class="form-group" style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 13px; font-weight: 600; color: #262626;">Trạng thái áp dụng</label>
            <select id="modal-chk-status" class="form-control" style="height: 38px; border: 1px solid #d9d9d9; border-radius: 6px; padding: 0 12px; font-size: 14px; background: white;">
              <option value="PENDING" ${isEdit && editingItem.status === 'PENDING' ? 'selected' : ''}>Chưa hoàn thành</option>
              <option value="COMPLETED" ${isEdit && editingItem.status === 'COMPLETED' ? 'selected' : ''}>Đã hoàn thành</option>
            </select>
          </div>
        </div>
      </form>
    `;

    window.openModal(modalTitle, formHtml, function() {
      const nameInput = document.getElementById("modal-chk-name");
      const nameVal = nameInput ? nameInput.value.trim() : '';

      if (!nameVal) {
        if (window.showToast) window.showToast('Vui lòng nhập tên mẫu Checklist!', 'warning');
        nameInput.focus();
        return;
      }

      const typeVal = document.getElementById("modal-chk-type").value;
      const deptVal = document.getElementById("modal-chk-dept").value;
      const countVal = parseInt(document.getElementById("modal-chk-count").value) || 1;
      const statusVal = document.getElementById("modal-chk-status").value;

      const list = getChecklists();

      if (isEdit) {
        const item = list.find(x => x.id === editingItem.id);
        if (item) {
          item.name = nameVal;
          item.type = typeVal;
          item.department = deptVal;
          item.departmentName = getDeptName(deptVal);
          item.itemsCount = countVal;
          item.status = statusVal;
        }
        saveChecklists(list);
        if (window.showToast) window.showToast(`Đã cập nhật mẫu "${nameVal}" thành công!`, 'success');
      } else {
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        const newItem = {
          id: 'chk_' + Date.now(),
          name: nameVal,
          type: typeVal,
          department: deptVal,
          departmentName: getDeptName(deptVal),
          itemsCount: countVal,
          createdAt: dateStr,
          status: statusVal
        };
        list.unshift(newItem);
        saveChecklists(list);
        if (window.showToast) window.showToast(`Đã tạo mới mẫu Checklist "${nameVal}" thành công!`, 'success');
      }

      renderChecklistTable();
      if (typeof window.closeModal === 'function') window.closeModal();
    });
  }

  /* ========================================= */
  /*          EVENT LISTENERS CHO FILTERS      */
  /* ========================================= */
  if (typeFilter) typeFilter.addEventListener("change", renderChecklistTable);
  if (departmentFilter) departmentFilter.addEventListener("change", renderChecklistTable);
  if (searchInput) searchInput.addEventListener("input", renderChecklistTable);

  // Helper escape HTML chống XSS
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ========================================= */
  /*          INITIAL RENDER                   */
  /* ========================================= */
  renderChecklistTable();
});
