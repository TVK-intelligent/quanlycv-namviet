document.addEventListener("DOMContentLoaded", function () {
  // ==========================
  // LẤY CÁC PHẦN TỬ
  // ==========================

  const statusFilter = document.getElementById("status-filter");

  const searchInput = document.getElementById("extension-search");

  const tableBody = document.getElementById("extension-body");

  const visibleCount = document.getElementById("visible-count");

  const createButton = document.getElementById("btn-create-extension");

  // ==========================
  // HÀM LỌC YÊU CẦU
  // ==========================

  function filterExtensions() {
    const selectedStatus = statusFilter.value;

    const searchText = searchInput.value.toLowerCase().trim();

    const rows = tableBody.querySelectorAll("tr");

    let count = 0;

    rows.forEach(function (row) {
      const rowStatus = row.dataset.status;

      const rowText = row.innerText.toLowerCase();

      // Kiểm tra trạng thái
      const matchStatus =
        selectedStatus === "all" || rowStatus === selectedStatus;

      // Kiểm tra tìm kiếm
      const matchSearch = rowText.includes(searchText);

      // Hiển thị hoặc ẩn
      if (matchStatus && matchSearch) {
        row.style.display = "";
        count++;
      } else {
        row.style.display = "none";
      }
    });

    // Cập nhật số lượng hiển thị
    visibleCount.textContent = count;
  }

  // ==========================
  // EVENT FILTER
  // ==========================

  statusFilter.addEventListener("change", filterExtensions);

  searchInput.addEventListener("input", filterExtensions);

  // ==========================
  // XỬ LÝ DUYỆT
  // ==========================

  tableBody.addEventListener("click", function (event) {
    const button = event.target.closest("button");

    if (!button) return;

    const row = button.closest("tr");

    // --------------------------
    // DUYỆT YÊU CẦU
    // --------------------------

    if (button.classList.contains("btn-approve")) {
      const confirmApprove = confirm(
        "Bạn có chắc muốn duyệt yêu cầu gia hạn này?",
      );

      if (!confirmApprove) return;

      row.dataset.status = "approved";

      const statusBadge = row.querySelector(".status-badge");

      statusBadge.textContent = "Đã duyệt";

      statusBadge.className = "status-badge status-approved";

      // Xóa nút duyệt và từ chối
      const approveButton = row.querySelector(".btn-approve");

      const rejectButton = row.querySelector(".btn-reject");

      if (approveButton) {
        approveButton.remove();
      }

      if (rejectButton) {
        rejectButton.remove();
      }

      filterExtensions();

      alert("Đã duyệt yêu cầu gia hạn thành công!");
    }

    // --------------------------
    // TỪ CHỐI YÊU CẦU
    // --------------------------

    if (button.classList.contains("btn-reject")) {
      const confirmReject = confirm("Bạn có chắc muốn từ chối yêu cầu này?");

      if (!confirmReject) return;

      row.dataset.status = "rejected";

      const statusBadge = row.querySelector(".status-badge");

      statusBadge.textContent = "Từ chối";

      statusBadge.className = "status-badge status-rejected";

      // Xóa nút duyệt và từ chối
      const approveButton = row.querySelector(".btn-approve");

      const rejectButton = row.querySelector(".btn-reject");

      if (approveButton) {
        approveButton.remove();
      }

      if (rejectButton) {
        rejectButton.remove();
      }

      filterExtensions();

      alert("Đã từ chối yêu cầu gia hạn!");
    }

    // --------------------------
    // XÓA
    // --------------------------

    if (button.classList.contains("btn-delete")) {
      const confirmDelete = confirm("Bạn có chắc muốn xóa yêu cầu này?");

      if (!confirmDelete) return;

      row.remove();

      filterExtensions();

      alert("Đã xóa yêu cầu!");
    }

    // --------------------------
    // CHỈNH SỬA
    // --------------------------

    if (button.classList.contains("btn-edit")) {
      const taskName = row.querySelector(".task-name").innerText;

      alert('Chức năng chỉnh sửa yêu cầu "' + taskName + '" sẽ được thêm sau.');
    }
  });

  // ==========================
  // NÚT XIN GIA HẠN
  // ==========================

  createButton.addEventListener("click", function () {
    alert("Chức năng tạo yêu cầu gia hạn mới sẽ được thêm sau.");
  });

  // ==========================
  // TAB CHUYỂN CHỨC NĂNG
  // ==========================

  const tabs = document.querySelectorAll(".workflow-tab");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (item) {
        item.classList.remove("active");
      });

      tab.classList.add("active");

      const tabName = tab.dataset.tab;

      if (tabName === "change-request") {
        alert("Chức năng Yêu cầu Thay đổi (CR) sẽ được chuyển sang trang CR.");
      }
    });
  });

  // ==========================
  // CHẠY LẦN ĐẦU
  // ==========================

  filterExtensions();
});
