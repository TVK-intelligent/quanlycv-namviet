/**
 * CHANGE REQUEST JAVASCRIPT (js/change-request.js)
 * Enterprise Workflow - Scope Change Request Management
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'etrms_change_requests';

    function getChangeRequests() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch(e) { return []; }
    }

    function saveChangeRequests(crs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(crs));
        } catch(e) {}
    }

    function getProjects() {
        try {
            return JSON.parse(localStorage.getItem('etrms-projects')) || [];
        } catch(e) { return []; }
    }

    function initDefaultCRsIfEmpty() {
        const crs = getChangeRequests();
        if (crs.length === 0) {
            const defaults = [
                {
                    id: 1,
                    code: 'CR-001',
                    clientName: 'Công ty Cổ phần Nam Việt',
                    projectId: 'proj_001',
                    projectName: 'Hệ thống Quản lý Nhân sự v2',
                    title: 'Bổ sung tính năng Quét mã QR Chấm công di động',
                    description: 'Khách hàng yêu cầu tích hợp thêm module camera quét QR code chống gian lận vị trí GPS',
                    extraHours: 40,
                    extraCost: 15000000,
                    newDueDate: '2026-10-15',
                    status: 'PENDING',
                    impactNote: 'Cần 1 Mobile Dev và 1 Backend Dev trong 1 tuần',
                    createdAt: '2026-08-25'
                },
                {
                    id: 2,
                    code: 'CR-002',
                    clientName: 'Tập đoàn Bất động sản Á Châu',
                    projectId: 'proj_002',
                    projectName: 'Module Tuyển dụng',
                    title: 'Thêm giao diện Báo cáo xuất ra tệp PDF có ký số',
                    description: 'Tích hợp thư viện PDF ký số điện tử của ban giám đốc phê duyệt ứng viên',
                    extraHours: 24,
                    extraCost: 10000000,
                    newDueDate: '2026-09-30',
                    status: 'ACCEPTED',
                    impactNote: 'Đã hoàn thành đánh giá tác động và khách hàng đã chốt hợp đồng bổ sung',
                    createdAt: '2026-08-15'
                },
                {
                    id: 3,
                    code: 'CR-003',
                    clientName: 'Chuỗi Bán lẻ MegaMart',
                    projectId: 'proj_003',
                    projectName: 'Module Chấm công',
                    title: 'Tích hợp máy quét vân tay hãng ZKTeco cũ',
                    description: 'Yêu cầu kết nối với thiết bị đời cũ qua giao thức TCP/IP raw socket',
                    extraHours: 60,
                    extraCost: 25000000,
                    newDueDate: '2026-11-20',
                    status: 'REJECTED',
                    impactNote: 'Thiết bị quá cũ không hỗ trợ SDK Web API hiện đại, chi phí quá cao so với giá trị',
                    createdAt: '2026-08-10'
                }
            ];
            saveChangeRequests(defaults);
        }
    }

    let currentFilters = {
        search: '',
        project: 'ALL',
        status: 'ALL'
    };

    function renderCRTable() {
        const tbody = document.getElementById('cr-table-body');
        if (!tbody) return;

        const allCRs = getChangeRequests();
        const filtered = allCRs.filter(cr => {
            if (currentFilters.search) {
                const q = currentFilters.search.toLowerCase();
                const matchCode = (cr.code || '').toLowerCase().includes(q);
                const matchTitle = (cr.title || '').toLowerCase().includes(q);
                const matchClient = (cr.clientName || '').toLowerCase().includes(q);
                if (!matchCode && !matchTitle && !matchClient) return false;
            }
            if (currentFilters.project !== 'ALL' && cr.projectId !== currentFilters.project) {
                return false;
            }
            if (currentFilters.status !== 'ALL' && cr.status !== currentFilters.status) {
                return false;
            }
            return true;
        });

        // Update stats
        const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setVal('stat-total-cr', allCRs.length);
        setVal('stat-pending-cr', allCRs.filter(c => c.status === 'PENDING').length);
        setVal('stat-accepted-cr', allCRs.filter(c => c.status === 'ACCEPTED').length);
        setVal('stat-rejected-cr', allCRs.filter(c => c.status === 'REJECTED').length);

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted, #8c8c8c);">
                        <i class="fa-solid fa-code-compare" style="font-size: 28px; margin-bottom: 8px; opacity: 0.5; display: block;"></i>
                        Không tìm thấy yêu cầu thay đổi (CR) nào.
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(item => {
            const tr = document.createElement('tr');

            let statusBadge = '';
            if (item.status === 'ACCEPTED') {
                statusBadge = '<span style="background:#f6ffed; color:#389e0d; border:1px solid #b7eb8f; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600;">Đã chấp thuận</span>';
            } else if (item.status === 'PENDING') {
                statusBadge = '<span style="background:#fff7e6; color:#d46b08; border:1px solid #ffd591; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600;">Chờ đánh giá</span>';
            } else {
                statusBadge = '<span style="background:#fff1f0; color:#cf1322; border:1px solid #ffa39e; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600;">Từ chối / Hủy</span>';
            }

            const costFormatted = item.extraCost ? Number(item.extraCost).toLocaleString('vi-VN') + ' ₫' : 'Chưa tính';

            let actionBtns = '';
            if (item.status === 'PENDING') {
                actionBtns = `
                    <button class="btn btn-sm btn-primary" onclick="window.openAssessModal(${item.id})" style="padding: 3px 8px; font-size: 11px; margin-right: 4px; background: #1890ff; color: #fff; border: none; border-radius: 4px; cursor: pointer;" title="Đánh giá & Duyệt">
                        <i class="fa-solid fa-clipboard-check"></i> Đánh giá
                    </button>
                `;
            }

            actionBtns += `
                <button class="btn btn-sm" onclick="window.viewCRDetail(${item.id})" style="padding: 3px 8px; font-size: 11px; background: #f0f0f0; border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer;" title="Chi tiết">
                    <i class="fa-solid fa-eye"></i>
                </button>
            `;

            tr.innerHTML = `
                <td style="font-weight: 600; color: var(--primary-color, #1890ff);">${item.code}</td>
                <td style="font-weight: 600; color: #262626;">${escapeHtml(item.title)}</td>
                <td><span style="font-size: 12px; color: #595959;">${escapeHtml(item.clientName || 'N/A')}</span></td>
                <td><span style="background: #e6f7ff; color: #096dd9; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 500;">${escapeHtml(item.projectName || '')}</span></td>
                <td>
                    <div style="font-size: 11px; line-height: 1.5;">
                        <div>⏱️ +<strong>${item.extraHours || 0}</strong> giờ</div>
                        <div style="color: #cf1322;">💰 <strong>${costFormatted}</strong></div>
                    </div>
                </td>
                <td style="font-size: 12px; color: #8c8c8c;">${formatDate(item.newDueDate)}</td>
                <td>${statusBadge}</td>
                <td style="text-align: right; white-space: nowrap;">${actionBtns}</td>
            `;
            tbody.appendChild(tr);
        });

        populateProjectSelects();
    }

    function populateProjectSelects() {
        const projects = getProjects();
        const filterSelect = document.getElementById('cr-filter-project');
        const modalSelect = document.getElementById('new-cr-project');

        if (filterSelect && filterSelect.children.length <= 1) {
            projects.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.projectName;
                filterSelect.appendChild(opt);
            });
        }

        if (modalSelect && modalSelect.children.length <= 1) {
            modalSelect.innerHTML = '<option value="">-- Chọn dự án --</option>';
            projects.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.projectName;
                opt.setAttribute('data-name', p.projectName);
                modalSelect.appendChild(opt);
            });
        }
    }

    // Modal Create CR
    function initCreateCRModal() {
        const btnAdd = document.getElementById('btn-create-cr');
        const modal = document.getElementById('modal-create-cr');
        const btnClose = document.getElementById('btn-close-cr-modal');
        const btnCancel = document.getElementById('btn-cancel-cr-modal');
        const form = document.getElementById('form-create-cr');

        if (btnAdd && modal) {
            btnAdd.addEventListener('click', () => {
                modal.style.display = 'flex';
                const due = document.getElementById('new-cr-due');
                if (due) {
                    const d = new Date();
                    d.setMonth(d.getMonth() + 1);
                    due.value = d.toISOString().split('T')[0];
                }
            });
        }

        const close = () => { if (modal) modal.style.display = 'none'; };
        if (btnClose) btnClose.addEventListener('click', close);
        if (btnCancel) btnCancel.addEventListener('click', close);

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const crs = getChangeRequests();
                const projects = getProjects();
                const projSelect = document.getElementById('new-cr-project');
                const projId = projSelect.value;
                const proj = projects.find(p => p.id === projId);

                let maxNum = 0;
                crs.forEach(c => {
                    const match = (c.code || '').match(/^CR-(\d+)$/);
                    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
                });
                const nextCode = 'CR-' + String(maxNum + 1).padStart(3, '0');

                const newCR = {
                    id: Date.now(),
                    code: nextCode,
                    clientName: document.getElementById('new-cr-client').value.trim(),
                    projectId: projId,
                    projectName: proj ? proj.projectName : 'Dự án',
                    title: document.getElementById('new-cr-title').value.trim(),
                    description: document.getElementById('new-cr-desc').value.trim(),
                    extraHours: parseInt(document.getElementById('new-cr-hours').value, 10) || 0,
                    extraCost: parseInt(document.getElementById('new-cr-cost').value, 10) || 0,
                    newDueDate: document.getElementById('new-cr-due').value || '',
                    status: 'PENDING',
                    impactNote: '',
                    createdAt: new Date().toISOString().split('T')[0]
                };

                crs.unshift(newCR);
                saveChangeRequests(crs);
                close();
                form.reset();
                renderCRTable();

                if (window.showToast) window.showToast(`Đã tạo yêu cầu thay đổi [${newCR.code}]`, 'success');
            });
        }
    }

    // Modal Assess CR (PM Approval)
    let assessingCRId = null;

    window.openAssessModal = function(id) {
        assessingCRId = id;
        const crs = getChangeRequests();
        const cr = crs.find(c => c.id === id);
        if (!cr) return;

        const modal = document.getElementById('modal-assess-cr');
        if (!modal) return;

        document.getElementById('assess-cr-code').textContent = cr.code;
        document.getElementById('assess-cr-title').textContent = cr.title;
        document.getElementById('assess-cr-hours').value = cr.extraHours || 20;
        document.getElementById('assess-cr-cost').value = cr.extraCost || 5000000;
        document.getElementById('assess-cr-due').value = cr.newDueDate || '';
        document.getElementById('assess-cr-note').value = cr.impactNote || '';

        modal.style.display = 'flex';
    };

    function initAssessModal() {
        const modal = document.getElementById('modal-assess-cr');
        const btnClose = document.getElementById('btn-close-assess-modal');
        const btnCancel = document.getElementById('btn-cancel-assess-modal');
        const btnApprove = document.getElementById('btn-approve-cr');
        const btnReject = document.getElementById('btn-reject-cr');

        const close = () => { if (modal) modal.style.display = 'none'; assessingCRId = null; };
        if (btnClose) btnClose.addEventListener('click', close);
        if (btnCancel) btnCancel.addEventListener('click', close);

        if (btnApprove) {
            btnApprove.addEventListener('click', () => {
                if (!assessingCRId) return;
                const crs = getChangeRequests();
                const cr = crs.find(c => c.id === assessingCRId);
                if (!cr) return;

                cr.status = 'ACCEPTED';
                cr.extraHours = parseInt(document.getElementById('assess-cr-hours').value, 10) || cr.extraHours;
                cr.extraCost = parseInt(document.getElementById('assess-cr-cost').value, 10) || cr.extraCost;
                cr.newDueDate = document.getElementById('assess-cr-due').value || cr.newDueDate;
                cr.impactNote = document.getElementById('assess-cr-note').value.trim();

                saveChangeRequests(crs);
                close();
                renderCRTable();

                if (window.showToast) window.showToast(`Đã chấp thuận yêu cầu thay đổi [${cr.code}]!`, 'success');
            });
        }

        if (btnReject) {
            btnReject.addEventListener('click', () => {
                if (!assessingCRId) return;
                const crs = getChangeRequests();
                const cr = crs.find(c => c.id === assessingCRId);
                if (!cr) return;

                cr.status = 'REJECTED';
                cr.impactNote = document.getElementById('assess-cr-note').value.trim();

                saveChangeRequests(crs);
                close();
                renderCRTable();

                if (window.showToast) window.showToast(`Đã từ chối yêu cầu [${cr.code}].`, 'info');
            });
        }
    }

    window.viewCRDetail = function(id) {
        const crs = getChangeRequests();
        const cr = crs.find(c => c.id === id);
        if (!cr) return;

        alert(`Mã CR: ${cr.code}\nTiêu đề: ${cr.title}\nKhách hàng: ${cr.clientName}\nDự án: ${cr.projectName}\nPhát sinh: +${cr.extraHours || 0} giờ / ${cr.extraCost ? Number(cr.extraCost).toLocaleString('vi-VN') + ' ₫' : '0 ₫'}\nHạn mới: ${cr.newDueDate}\nTrạng thái: ${cr.status}\nMô tả: ${cr.description}\nĐánh giá: ${cr.impactNote || 'Chưa có'}`);
    };

    function initFilterEvents() {
        const search = document.getElementById('cr-search');
        if (search) {
            let debounce;
            search.addEventListener('input', (e) => {
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                    currentFilters.search = e.target.value.trim();
                    renderCRTable();
                }, 200);
            });
        }

        const projectSelect = document.getElementById('cr-filter-project');
        if (projectSelect) {
            projectSelect.addEventListener('change', (e) => {
                currentFilters.project = e.target.value;
                renderCRTable();
            });
        }

        const statusSelect = document.getElementById('cr-filter-status');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                currentFilters.status = e.target.value;
                renderCRTable();
            });
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const parts = dateStr.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dateStr;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    document.addEventListener('DOMContentLoaded', () => {
        initDefaultCRsIfEmpty();
        renderCRTable();
        initCreateCRModal();
        initAssessModal();
        initFilterEvents();
    });

})();
