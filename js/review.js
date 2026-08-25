document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("review-search");
  const statusFilter = document.getElementById("status-filter");
  const projectFilter = document.getElementById("project-filter");

  const rows = document.querySelectorAll("#review-body tr");
  const emptyReview = document.getElementById("empty-review");

  // ==========================================
  // CAP NHAT THONG KE
  // ==========================================

  function updateSummary() {
    const allRows = document.querySelectorAll("#review-body tr");

    let total = allRows.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    allRows.forEach((row) => {
      const status = row.dataset.status;

      if (status === "pending") {
        pending++;
      }

      if (status === "approved") {
        approved++;
      }

      if (status === "rejected") {
        rejected++;
      }
    });

    document.getElementById("total-count").textContent = total;
    document.getElementById("pending-count").textContent = pending;
    document.getElementById("approved-count").textContent = approved;
    document.getElementById("rejected-count").textContent = rejected;
  }

  // ==========================================
  // LOC TASK
  // ==========================================

  function filterReview() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedStatus = statusFilter.value;
    const selectedProject = projectFilter.value;

    let visibleCount = 0;

    rows.forEach((row) => {
      const rowText = row.innerText.toLowerCase();
      const rowStatus = row.dataset.status;
      const rowProject = row.dataset.project;

      const matchSearch = rowText.includes(searchText);

      const matchStatus =
        selectedStatus === "all" || rowStatus === selectedStatus;

      const matchProject =
        selectedProject === "all" || rowProject === selectedProject;

      if (matchSearch && matchStatus && matchProject) {
        row.style.display = "";
        visibleCount++;
      } else {
        row.style.display = "none";
      }
    });

    if (visibleCount === 0) {
      emptyReview.classList.remove("hidden");
    } else {
      emptyReview.classList.add("hidden");
    }
  }

  searchInput.addEventListener("input", filterReview);
  statusFilter.addEventListener("change", filterReview);
  projectFilter.addEventListener("change", filterReview);

  // ==========================================
  // CAP NHAT TRANG THAI TASK
  // ==========================================

  function updateStatus(row, status) {
    row.dataset.status = status;

    const statusCell = row.querySelector(".status-cell");

    if (status === "approved") {
      statusCell.innerHTML = `
        <span class="status-badge status-approved">
          Đã duyệt
        </span>
      `;
    }

    if (status === "rejected") {
      statusCell.innerHTML = `
        <span class="status-badge status-rejected">
          Từ chối
        </span>
      `;
    }

    if (status === "pending") {
      statusCell.innerHTML = `
        <span class="status-badge status-pending">
          Chờ duyệt
        </span>
      `;
    }

    updateSummary();
    filterReview();
  }

  // ==========================================
  // PASS
  // ==========================================

  document.querySelectorAll(".btn-pass").forEach((button) => {
    button.addEventListener("click", function () {
      const row = this.closest("tr");

      const confirmPass = confirm(
        "Bạn có chắc chắn muốn phê duyệt công việc này không?",
      );

      if (!confirmPass) {
        return;
      }

      updateStatus(row, "approved");

      const actionButtons = row.querySelector(".action-buttons");

      actionButtons.innerHTML = `
        <button
          class="btn-review btn-disabled"
          disabled
        >
          <i class="fa-solid fa-check"></i>
          Đã duyệt
        </button>
      `;
    });
  });

  // ==========================================
  // REJECT
  // ==========================================

  document.querySelectorAll(".btn-reject").forEach((button) => {
    button.addEventListener("click", function () {
      const row = this.closest("tr");

      const confirmReject = confirm(
        "Bạn có chắc chắn muốn từ chối công việc này không?",
      );

      if (!confirmReject) {
        return;
      }

      updateStatus(row, "rejected");

      const actionButtons = row.querySelector(".action-buttons");

      actionButtons.innerHTML = `
        <button
          class="btn-review btn-disabled"
          disabled
        >
          <i class="fa-solid fa-xmark"></i>
          Đã từ chối
        </button>
      `;
    });
  });

  // ==========================================
  // INTERNAL APPROVE
  // ==========================================

  document.querySelectorAll(".btn-internal").forEach((button) => {
    button.addEventListener("click", function () {
      const row = this.closest("tr");

      const confirmInternal = confirm(
        "Bạn có chắc chắn muốn phê duyệt nội bộ công việc này không?",
      );

      if (!confirmInternal) {
        return;
      }

      updateStatus(row, "approved");

      const actionButtons = row.querySelector(".action-buttons");

      actionButtons.innerHTML = `
        <button
          class="btn-review btn-disabled"
          disabled
        >
          <i class="fa-solid fa-shield-halved"></i>
          Đã phê duyệt nội bộ
        </button>
      `;
    });
  });

  // ==========================================
  // XEM BANG CHUNG
  // ==========================================

  document.querySelectorAll(".btn-proof").forEach((button) => {
    button.addEventListener("click", function () {
      alert("Chức năng xem bằng chứng đang được phát triển.");
    });
  });

  // ==========================================
  // XEM LICH SU
  // ==========================================

  document.querySelectorAll(".btn-history").forEach((button) => {
    button.addEventListener("click", function () {
      const row = this.closest("tr");
      const taskName = row.querySelector(".task-title").textContent.trim();

      alert(
        "Lịch sử nộp của công việc:\n\n" +
          taskName +
          "\n\n" +
          "• Đã tạo công việc\n" +
          "• Người thực hiện đã nộp kết quả\n" +
          "• Đang chờ Review & Phê duyệt",
      );
    });
  });

  // ==========================================
  // KHOI TAO
  // ==========================================

  updateSummary();
});
