const statusMsg = document.getElementById("showStatus");
const statusToggle = document.getElementById("statusToggle");
const submitBtn = document.getElementById("submitBtn");
const empName = document.getElementById("fullName");
const empMail = document.getElementById("email");
const empDept = document.getElementById("department");
const empRole = document.getElementById("role");
const empSalary = document.getElementById("salary");
const empJoinDate = document.getElementById("joiningDate");
const tableBody = document.getElementById("tableBody");
const empFormFields = document.getElementById("empForm");
const empTable = document.getElementById("empTable");
const emptyDataMsg = document.querySelector(".emptyDataMsgField");
const interactFields = document.querySelector(".interactFields");
const exportBtn = document.getElementById("exportBtn");
const employeeForm = document.getElementById("employeeForm");
const modalHeading = document.getElementById("employeeModalLabel");
const deleteConfirmModal = document.getElementById("deleteConfirmationModal");

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME_REGEX = /^[a-zA-Z][a-zA-Z\s]+$/;
const SALARY_REGEX = /^[0-9]*$/;

const employeeData = JSON.parse(localStorage.getItem("EmpData")) || [];

let salaryAsc = true;
let dateAsc = true;
let currentDisplayData = [];
let editingIndex = -1;

const showAcknowledgeToast = (message) => {
  const toastContainer = document.getElementById("notificationToast");
  const toastBody = toastContainer.querySelector(".toast-message");

  toastBody.textContent = message;

  const toast = new bootstrap.Toast(toastContainer);
  toast.show();
};

const showWarningToast = (message) => {
  const toastContainer = document.getElementById("deleteToast");
  const toastBody = toastContainer.querySelector(".delete-message");

  toastBody.textContent = message;

  const toast = new bootstrap.Toast(toastContainer);
  toast.show();
};

statusToggle.addEventListener("change", () => {
  statusMsg.innerHTML = statusToggle.checked ? "Active" : "Inactive";
});

const renderEmpTable = (data) => {
  if (data.length === 0) {
    emptyDataMsg.classList.remove("d-none");
  } else {
    emptyDataMsg.classList.add("d-none");
    empTable.classList.remove("d-none");
    exportBtn.classList.remove("d-none");
  }

  tableBody.innerHTML = data
    .map(
      (emp) => `
                          <tr id="empDataRow">
                            <td class="align-content-center">${emp.fullName}</td>
                            <td class="align-content-center">${emp.email}</td>
                            <td class="align-content-center">${emp.department}</td>
                            <td class="align-content-center">${emp.role}</td>
                            <td class="align-content-center">${emp.salary}</td>
                            <td class="align-content-center">${emp.joiningDate}</td>
                            <td class="align-content-center"><span class="badge rounded-pill statusBadge">${emp.status}</span></td>
                            <td class="d-flex align-items-center justify-content-center gap-3">
                              <button type="button" class="btn btn-primary btn-sm" onclick="return editEmployee('${emp.email}')"><img src="../Icons/edit-btn.svg" alt="edit-button" width="16" height="14"></button>
                              <button type="button" class="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#deleteConfirmationModal" onclick="confirmDelete('${emp.email}')"><img src="../Icons/delete-btn.svg" alt="delete-button" width="16" height="14"></button>
                            </td>
                          </tr>`,
    )
    .join("");

  const empStatus = document.querySelectorAll(".statusBadge");

  empStatus.forEach((val) => {
    if (val.textContent === "Active") {
      val.classList.add("text-bg-success");
      val.classList.remove("text-bg-danger");
    } else {
      val.classList.remove("text-bg-success");
      val.classList.add("text-bg-danger");
    }
  });
};

const addEmployee = (e) => {
  e.preventDefault();
  const formObj = {
    fullName: empName.value,
    email: empMail.value,
    department: empDept.value,
    role: empRole.value,
    salary: empSalary.value,
    joiningDate: empJoinDate.value,
    status: statusMsg.innerHTML,
  };

  if (editingIndex === -1) {
    employeeData.push(formObj);
    showAcknowledgeToast("Employee Added Successfully.");
  } else {
    employeeData[editingIndex] = formObj;
    editingIndex = -1;
    showAcknowledgeToast("Employee Updated Successfully.");
  }

  localStorage.setItem("EmpData", JSON.stringify(employeeData));

  submitBtn.disabled = true;
  submitBtn.textContent = "Submit";
  filterEmpData();
  empFormFields.reset();
};

const editEmployee = (email) => {
  modalHeading.textContent = "Update Employee";
  const employee = employeeData.find((emp) => emp.email === email);
  editingIndex = employeeData.indexOf(employee);

  empName.value = employee.fullName;
  empMail.value = employee.email;
  empDept.value = employee.department;
  empRole.value = employee.role;
  empSalary.value = employee.salary;
  empJoinDate.value = employee.joiningDate;
  statusToggle.checked = employee.status === "Active";
  statusMsg.textContent = statusToggle.checked ? "Active" : "Inactive";
  updateRequiredIndicators();

  submitBtn.disabled = false;
  submitBtn.textContent = "Update";

  const editModal = new bootstrap.Modal(employeeForm);
  editModal.show();
};

employeeForm.addEventListener("hidden.bs.modal", () => {
  modalHeading.textContent = "Add Employee";
  editingIndex = -1;
  submitBtn.textContent = "Submit";
  submitBtn.disabled = true;
  empFormFields.reset();
  empMail.classList.remove("is-invalid");
  document.querySelectorAll(".form-label.field-filled").forEach(label => {
    label.classList.remove("field-filled");
  });
});

const confirmDelete = (email) => {
  document.getElementById("deleteConfirm").innerHTML =
    `<button type="button" class="btn btn-secondary"
                                data-bs-dismiss="modal">No</button>
                                <button type="button" class="btn btn-danger" data-bs-dismiss="modal" onclick="return deleteEmployee('${email}')">Yes</button>`;
};

const deleteEmployee = (email) => {
  const employee = employeeData.find((emp) => emp.email === email);
  const position = employeeData.indexOf(employee);

  employeeData.splice(position, 1);

  localStorage.setItem("EmpData", JSON.stringify(employeeData));
  showWarningToast("Employee Deleted!");
  filterEmpData();

  if (employeeData.length === 0) {
    document.getElementById("emptyMsg").textContent =
      "No Employee Data Available!";
  }
};

currentDisplayData = [...employeeData];
renderEmpTable(employeeData);

const searchEmpData = () => {
  const searchBox = document.getElementById("searchBox");
  const searchValue = searchBox?.value?.toLowerCase() || "";

  const filteredData = currentDisplayData.filter((emp) => {
    return (
      emp.fullName.toLowerCase().includes(searchValue) ||
      emp.email.toLowerCase().includes(searchValue) ||
      emp.role.toLowerCase().includes(searchValue)
    );
  });
  if (filteredData.length === 0) {
    document.getElementById("emptyMsg").textContent = "No matching Data Found!";
  }

  renderEmpTable(filteredData);
};

const filterEmpData = () => {
  const selectedDept = document.getElementById("departmentDropDown").value;
  const selectedStatus = document.getElementById("statusDropDown").value;
  const minSalary = document.getElementById("minSal").value;
  const maxSalary = document.getElementById("maxSal").value;
  const min = minSalary ? Number(minSalary) : 0;
  const max = maxSalary ? Number(maxSalary) : Infinity;
  const maxSalInput = document.getElementById("maxSal");

  if (max < min) {
    maxSalInput.classList.add("is-invalid");
  } else {
    maxSalInput.classList.remove("is-invalid");

    const filteredData = employeeData.filter((emp) => {
      const deptFilter = selectedDept === "" || emp.department === selectedDept;

      const statusFilter =
        selectedStatus === "" || emp.status === selectedStatus;

      const salaryFilter =
        Number(emp.salary) >= min && Number(emp.salary) <= max;

      return deptFilter && statusFilter && salaryFilter;
    });

    if (filteredData.length === 0) {
      document.getElementById("emptyMsg").textContent =
        "No matching Data Found!";
    }

    currentDisplayData = filteredData;
    renderEmpTable(filteredData);
  }
};

const sortEmpSalary = () => {
  currentDisplayData.sort((a, b) => {
    if (salaryAsc) {
      document.getElementById("sortBySalary").src =
        "../Icons/filter-arrow-down.svg";
      return Number(a.salary) - Number(b.salary);
    } else {
      document.getElementById("sortBySalary").src =
        "../Icons/filter-arrow-up.svg";
      return Number(b.salary) - Number(a.salary);
    }
  });
  salaryAsc = !salaryAsc;

  renderEmpTable(currentDisplayData);
};

const sortEmpDate = () => {
  currentDisplayData.sort((a, b) => {
    if (dateAsc) {
      document.getElementById("sortByDate").src =
        "../Icons/filter-arrow-down.svg";
      return new Date(a.joiningDate) - new Date(b.joiningDate);
    } else {
      document.getElementById("sortByDate").src =
        "../Icons/filter-arrow-up.svg";
      return new Date(b.joiningDate) - new Date(a.joiningDate);
    }
  });
  dateAsc = !dateAsc;

  renderEmpTable(currentDisplayData);
};

const exportToCsv = () => {
  if (employeeData.length !== 0) {
    let csv = [];
    const rows = document.querySelectorAll("tr");

    rows.forEach((i) => {
      let cols = i.querySelectorAll("th, td");
      let csvRow = [];

      cols.forEach((j) => {
        csvRow.push(j.textContent);
      });
      csvRow.splice(7, 1);
      csv.push(csvRow.join(","));
    });

    let blob = new Blob([csv.join("\n")], { type: "text/csv" });
    exportBtn.download = "Employee-Data";
    exportBtn.href = URL.createObjectURL(blob);

    showAcknowledgeToast("Employee Data Downloaded Successfully.");
  } else {
    showWarningToast("No Employee Data Available!");
  }
};

const validateEmail = () => {
  const isDuplicateMail = employeeData.find(
    (val, idx) => val.email === empMail.value && idx !== editingIndex
  );
  const isValidFormat = EMAIL_REGEX.test(empMail.value);

  if (isValidFormat && !isDuplicateMail) {
    empMail.classList.remove("is-invalid");
  } else {
    empMail.classList.add("is-invalid");
  }
};

const validateFormInput = () => {
  const isDuplicateMail = employeeData.find(
    (val, idx) => val.email === empMail.value && idx !== editingIndex
  );

  const isFormValid =
    !isDuplicateMail &&
    empName.value.trim() !== "" &&
    empMail.value.trim() !== "" &&
    empDept.value.trim() !== "" &&
    empRole.value.trim() !== "" &&
    empSalary.value.trim() !== "" &&
    empJoinDate.value.trim() !== "" &&
    EMAIL_REGEX.test(empMail.value) &&
    NAME_REGEX.test(empName.value) &&
    SALARY_REGEX.test(empSalary.value);

  submitBtn.disabled = !isFormValid;
  updateRequiredIndicators();
};

const updateRequiredIndicators = () => {
  const fields = [empName, empMail, empDept, empRole, empSalary, empJoinDate];
  fields.forEach(field => {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
      if (field.value.trim() !== "") {
        label.classList.add("field-filled");
      } else {
        label.classList.remove("field-filled");
      }
    }
  });
};
