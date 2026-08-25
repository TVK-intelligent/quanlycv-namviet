const TIMESHEET_KEY = "etrms_timesheet_data";
const SUBMISSION_KEY = "etrms_timesheet_submission";
const TARGET_HOURS = 40;

let currentWeek = getMonday(new Date());

const timesheetBody = document.getElementById("timesheet-body");

const emptyTimesheet = document.getElementById("empty-timesheet");

const weekRange = document.getElementById("week-range");

const weekNumber = document.getElementById("week-number");

const totalHours = document.getElementById("total-hours");

const missingHours = document.getElementById("missing-hours");

const modal = document.getElementById("timesheet-modal");

const form = document.getElementById("timesheet-form");

const editId = document.getElementById("edit-id");

const taskName = document.getElementById("task-name");

const workDate = document.getElementById("work-date");

const workHours = document.getElementById("work-hours");

const workDescription = document.getElementById("work-description");

const formError = document.getElementById("form-error");

const modalTitle = document.getElementById("modal-title");

function getMonday(date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  const day = result.getDay();

  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));

  return result;
}

function addDays(date, days) {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

function formatDateISO(date) {
  return date.toISOString().slice(0, 10);
}

function formatVietnameseDate(date) {
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getWeekDays() {
  return [0, 1, 2, 3, 4].map((index) => addDays(currentWeek, index));
}

function seedData() {
  const weekDays = getWeekDays();

  return [
    {
      id: Date.now() + 1,
      date: formatDateISO(weekDays[0]),
      task: "PRJ-042: Chuyển đổi cơ sở dữ liệu",
      hours: 8,
      description: "Thực hiện chuyển đổi và kiểm tra dữ liệu",
    },
    {
      id: Date.now() + 2,
      date: formatDateISO(weekDays[1]),
      task: "PRJ-045: Thiết kế lại giao diện",
      hours: 8,
      description: "Cập nhật giao diện trang quản lý",
    },
    {
      id: Date.now() + 3,
      date: formatDateISO(weekDays[3]),
      task: "INT-001: Họp nội bộ",
      hours: 6,
      description: "Họp nhóm và trao đổi tiến độ dự án",
    },
  ];
}

function getData() {
  const storedData = localStorage.getItem(TIMESHEET_KEY);

  if (!storedData) {
    const initialData = seedData();

    saveData(initialData);

    return initialData;
  }

  return JSON.parse(storedData);
}

function saveData(data) {
  localStorage.setItem(TIMESHEET_KEY, JSON.stringify(data));
}

function updateWeekInformation() {
  const weekEnd = addDays(currentWeek, 6);

  weekRange.textContent =
    `Tuần từ ${currentWeek.toLocaleDateString("vi-VN")} - ` +
    `${weekEnd.toLocaleDateString("vi-VN")}`;

  weekNumber.textContent = `Tuần ${getWeekOfYear(currentWeek)}`;
}

function getWeekOfYear(date) {
  const firstDay = new Date(date.getFullYear(), 0, 1);

  const days = Math.floor((date - firstDay) / 86400000);

  return Math.ceil((days + firstDay.getDay() + 1) / 7);
}

function renderTimesheet() {
  const data = getData();

  const weekDays = getWeekDays();

  const weekDates = weekDays.map(formatDateISO);

  const weekEntries = data.filter((entry) => weekDates.includes(entry.date));

  const total = weekEntries.reduce(
    (sum, entry) => sum + Number(entry.hours),
    0,
  );

  const missing = Math.max(0, TARGET_HOURS - total);

  updateWeekInformation();

  totalHours.textContent = `${total.toFixed(1)}h`;

  missingHours.textContent = `${missing.toFixed(1)}h`;

  renderRows(weekEntries);

  updateDateFilter(weekDays);
}

function renderRows(entries) {
  const searchText = document
    .getElementById("timesheet-search")
    .value.toLowerCase();

  const selectedDate = document.getElementById("timesheet-date-filter").value;

  const filteredEntries = entries.filter((entry) => {
    const text = `${entry.task} ${entry.description}`.toLowerCase();

    const matchSearch = text.includes(searchText);

    const matchDate = selectedDate === "all" || entry.date === selectedDate;

    return matchSearch && matchDate;
  });

  timesheetBody.innerHTML = "";

  if (filteredEntries.length === 0) {
    emptyTimesheet.style.display = "block";
    return;
  }

  emptyTimesheet.style.display = "none";

  filteredEntries.forEach((entry) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        ${new Date(entry.date + "T00:00:00").toLocaleDateString("vi-VN")}
      </td>

      <td>
        <strong>${entry.task}</strong>
      </td>

      <td>
        ${entry.description || "-"}
      </td>

      <td>
        ${Number(entry.hours).toFixed(1)} giờ
      </td>

      <td>
        <div class="action-buttons">

          <button
            class="btn-action"
            onclick="editEntry('${entry.id}')"
            title="Chỉnh sửa"
          >
            <i class="fa-solid fa-pen"></i>
          </button>

          <button
            class="btn-action btn-delete"
            onclick="deleteEntry('${entry.id}')"
            title="Xóa"
          >
            <i class="fa-solid fa-trash"></i>
          </button>

        </div>
      </td>
    `;

    timesheetBody.appendChild(row);
  });
}

function updateDateFilter(days) {
  const select = document.getElementById("timesheet-date-filter");

  const currentValue = select.value;

  select.innerHTML = `<option value="all">Tất cả ngày</option>`;

  days.forEach((day) => {
    const option = document.createElement("option");

    option.value = formatDateISO(day);

    option.textContent = formatVietnameseDate(day);

    select.appendChild(option);
  });

  if ([...select.options].some((option) => option.value === currentValue)) {
    select.value = currentValue;
  }
}

function openModal(date = "") {
  modal.classList.add("show");

  modalTitle.textContent = "Thêm thời gian làm việc";

  editId.value = "";

  form.reset();

  workDate.value = date || formatDateISO(currentWeek);

  formError.classList.remove("show");
}

function closeModal() {
  modal.classList.remove("show");

  form.reset();

  editId.value = "";

  formError.classList.remove("show");
}

function editEntry(id) {
  const entry = getData().find((item) => String(item.id) === String(id));

  if (!entry) {
    return;
  }

  modal.classList.add("show");

  modalTitle.textContent = "Chỉnh sửa thời gian làm việc";

  editId.value = entry.id;

  taskName.value = entry.task;

  workDate.value = entry.date;

  workHours.value = entry.hours;

  workDescription.value = entry.description || "";

  formError.classList.remove("show");
}

function deleteEntry(id) {
  const confirmDelete = confirm(
    "Bạn có chắc chắn muốn xóa thời gian làm việc này không?",
  );

  if (!confirmDelete) {
    return;
  }

  const newData = getData().filter((entry) => String(entry.id) !== String(id));

  saveData(newData);

  renderTimesheet();

  showToast("Đã xóa thời gian làm việc.");
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const task = taskName.value;

  const date = workDate.value;

  const hours = Number(workHours.value);

  const description = workDescription.value.trim();

  if (!task || !date || !hours || hours < 0.5 || hours > 16) {
    formError.textContent =
      "Vui lòng nhập đầy đủ thông tin. Số giờ phải từ 0.5 đến 16 giờ.";

    formError.classList.add("show");

    return;
  }

  const data = getData();

  const id = editId.value;

  const newEntry = {
    id: id || Date.now(),
    task,
    date,
    hours,
    description,
  };

  if (id) {
    const index = data.findIndex((entry) => String(entry.id) === String(id));

    if (index !== -1) {
      data[index] = newEntry;
    }
  } else {
    data.push(newEntry);
  }

  saveData(data);

  closeModal();

  renderTimesheet();

  showToast(
    id ? "Đã cập nhật thời gian làm việc." : "Đã thêm thời gian làm việc.",
  );
});

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* Event */

document.getElementById("prev-week").addEventListener("click", function () {
  currentWeek = addDays(currentWeek, -7);

  renderTimesheet();
});

document.getElementById("next-week").addEventListener("click", function () {
  currentWeek = addDays(currentWeek, 7);

  renderTimesheet();
});

document
  .getElementById("btn-open-modal")
  .addEventListener("click", function () {
    openModal();
  });

document.getElementById("close-modal").addEventListener("click", closeModal);

document.getElementById("cancel-modal").addEventListener("click", closeModal);

document.querySelector(".modal-overlay").addEventListener("click", closeModal);

document
  .getElementById("timesheet-search")
  .addEventListener("input", renderTimesheet);

document
  .getElementById("timesheet-date-filter")
  .addEventListener("change", renderTimesheet);

document
  .getElementById("submit-timesheet")
  .addEventListener("click", function () {
    const weekDays = getWeekDays().map(formatDateISO);

    const total = getData()
      .filter((entry) => weekDays.includes(entry.date))
      .reduce((sum, entry) => sum + Number(entry.hours), 0);

    localStorage.setItem(
      SUBMISSION_KEY,
      JSON.stringify({
        weekStart: formatDateISO(currentWeek),

        totalHours: total,

        status: "Chờ phê duyệt",

        submittedAt: new Date().toISOString(),
      }),
    );

    showToast("Đã gửi bảng chấm công để phê duyệt.");
  });

renderTimesheet();
