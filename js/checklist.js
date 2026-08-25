document.addEventListener("DOMContentLoaded", function () {
  /* ========================================= */
  /*            CHUYỂN TAB                     */
  /* ========================================= */

  const tabs = document.querySelectorAll(".workflow-tab");

  const checklistSection = document.getElementById("checklist-section");

  const recurringSection = document.getElementById("recurring-section");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const selectedTab = this.dataset.tab;

      // Bỏ active tất cả tab
      tabs.forEach((item) => {
        item.classList.remove("active");
      });

      // Active tab được chọn
      this.classList.add("active");

      // Ẩn tất cả section
      checklistSection.classList.remove("active");
      recurringSection.classList.remove("active");

      // Hiện section tương ứng
      if (selectedTab === "checklist") {
        checklistSection.classList.add("active");
      }

      if (selectedTab === "recurring") {
        recurringSection.classList.add("active");
      }
    });
  });

  /* ========================================= */
  /*          FILTER CHECKLIST                 */
  /* ========================================= */

  const typeFilter = document.getElementById("checklist-type");

  const departmentFilter = document.getElementById("department");

  const searchInput = document.getElementById("checklist-search");

  const checklistRows = document.querySelectorAll("#checklist-body tr");

  function filterChecklist() {
    const selectedType = typeFilter.value;

    const selectedDepartment = departmentFilter.value;

    const searchText = searchInput.value.toLowerCase().trim();

    checklistRows.forEach((row) => {
      const rowType = row.dataset.type;

      const rowDepartment = row.dataset.department;

      const rowText = row.innerText.toLowerCase();

      const matchType = selectedType === "all" || rowType === selectedType;

      const matchDepartment =
        selectedDepartment === "all" || rowDepartment === selectedDepartment;

      const matchSearch = rowText.includes(searchText);

      if (matchType && matchDepartment && matchSearch) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  typeFilter.addEventListener("change", filterChecklist);

  departmentFilter.addEventListener("change", filterChecklist);

  searchInput.addEventListener("input", filterChecklist);

  /* ========================================= */
  /*          FILTER TASK ĐỊNH KỲ              */
  /* ========================================= */

  const recurringSearch = document.getElementById("recurring-search");

  const recurringDepartment = document.getElementById("recurring-department");

  const recurringStatus = document.getElementById("recurring-status-filter");

  const recurringRows = document.querySelectorAll("#recurring-body tr");

  function filterRecurring() {
    const searchText = recurringSearch.value.toLowerCase().trim();

    const selectedDepartment = recurringDepartment.value;

    const selectedStatus = recurringStatus.value;

    recurringRows.forEach((row) => {
      const rowDepartment = row.dataset.department;

      const rowStatus = row.dataset.status;

      const taskName = row
        .querySelector(".recurring-task-name")
        .innerText.toLowerCase();

      const matchSearch = taskName.includes(searchText);

      const matchDepartment =
        selectedDepartment === "all" || rowDepartment === selectedDepartment;

      const matchStatus =
        selectedStatus === "all" || rowStatus === selectedStatus;

      if (matchSearch && matchDepartment && matchStatus) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  recurringSearch.addEventListener("input", filterRecurring);

  recurringDepartment.addEventListener("change", filterRecurring);

  recurringStatus.addEventListener("change", filterRecurring);

  /* ========================================= */
  /*      BẬT / TẮT TASK ĐỊNH KỲ               */
  /* ========================================= */

  const powerButtons = document.querySelectorAll(".recurring-power-btn");

  powerButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const row = this.closest("tr");

      const statusBadge = row.querySelector(".recurring-status");

      const currentStatus = row.dataset.status;

      if (currentStatus === "ACTIVE") {
        // Chuyển thành INACTIVE
        row.dataset.status = "INACTIVE";

        statusBadge.textContent = "INACTIVE";

        statusBadge.classList.remove("status-active");

        statusBadge.classList.add("status-inactive");

        this.classList.remove("active-power");

        this.classList.add("inactive-power");

        this.title = "Bật cấu hình";
      } else {
        // Chuyển thành ACTIVE
        row.dataset.status = "ACTIVE";

        statusBadge.textContent = "ACTIVE";

        statusBadge.classList.remove("status-inactive");

        statusBadge.classList.add("status-active");

        this.classList.remove("inactive-power");

        this.classList.add("active-power");

        this.title = "Tắt cấu hình";
      }

      // Áp dụng lại filter
      filterRecurring();
    });
  });
});
