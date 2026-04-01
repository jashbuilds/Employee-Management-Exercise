const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME_REGEX = /^[a-zA-Z][a-zA-Z\s]+$/;
const SALARY_REGEX = /^[0-9]*$/;

const empName = document.getElementById("fullName");
const empMail = document.getElementById("email");
const empDept = document.getElementById("department");
const empRole = document.getElementById("role");
const empSalary = document.getElementById("salary");
const empJoinDate = document.getElementById("joiningDate");
const statusToggle = document.getElementById("statusToggle");
const statusMsg = document.getElementById("showStatus");

const submitBtn = document.getElementById("submitBtn");
const exportBtn = document.getElementById("exportBtn");

const tableBody = document.getElementById("tableBody");
const empTable = document.getElementById("empTable");
const emptyDataMsg = document.querySelector(".emptyDataMsgField");

const employeeForm = document.getElementById("employeeForm");
const empFormFields = document.getElementById("empForm");
const modalHeading = document.getElementById("employeeModalLabel");
const deleteConfirmModal = document.getElementById("deleteConfirmationModal");

const interactFields = document.querySelector(".interactFields");
const statusColToggle = document.querySelectorAll(".statusColToggle");

let employeeData = JSON.parse(localStorage.getItem("EmpData")) || [];
employeeData = employeeData.map((emp) => ({
  ...emp,
  selected: emp.selected || false,
}));
let currentDisplayData = [];
let editingIndex = -1;
let salaryAsc = true;
let dateAsc = true;

// Display toast notification for successful add/edit operations
const showAcknowledgeToast = (message) => {
  const toastContainer = document.getElementById("notificationToast");
  const toastBody = toastContainer.querySelector(".toast-message");

  toastBody.textContent = message;

  const toast = new bootstrap.Toast(toastContainer);
  toast.show();
};

// Display toast notification for delete operations
const showWarningToast = (message) => {
  const toastContainer = document.getElementById("deleteToast");
  const toastBody = toastContainer.querySelector(".delete-message");

  toastBody.textContent = message;

  const toast = new bootstrap.Toast(toastContainer);
  toast.show();
};

// Render employee table with given data
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
                            <td class="align-content-center px-3">
                              <input type=checkbox name="selectRow" class="selectRow" onclick="return toggleRowSelection('${emp.email}')" ${emp.selected ? "checked" : ""} data-email="${emp.email}">
                            </td>
                            <td class="text-start px-3"><img src="../Images/${emp.src}" id="imgPreview" width='35' height='35' alt='profile' class='align-content-center border border-0 rounded-circle me-3 my-2 object-fit-fill'>${emp.fullName}</td>
                            <td class="align-content-center px-3">${emp.email}</td>
                            <td class="align-content-center px-3">${emp.department}</td>
                            <td class="align-content-center px-3">${emp.role}</td>
                            <td class="align-content-center px-3">${emp.salary}</td>
                            <td class="align-content-center px-3">${emp.joiningDate}</td>
                            <td class="align-content-center">
                              <div class="form-check form-switch d-flex justify-content-center">
                                <input onchange="return changeToggleStatus('${emp.email}')"
                                  class="form-check-input border border-1 ${emp.status === "Active" ? "bg-light-green" : ""} cursor-pointer statusColToggle" type="checkbox" role="switch" switch ${emp.status === "Active" ? "checked" : ""}>
                                  <p class="d-none">${emp.status}</p> <!-- Hidden text to show status in csv file -->
                              </div>
                            </td>
                            <td class="align-content-center">
                            <div class="d-flex justify-content-center gap-3">
                              <span class="cursor-pointer py-2" onclick="return editEmployee('${emp.email}')"><img src="../Icons/edit-btn.svg" alt="edit-button" width="18" height="18" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit"></span>
                              <span class="cursor-pointer py-2" data-bs-toggle="modal" data-bs-target="#deleteConfirmationModal" onclick="return confirmDelete('${emp.email}')"><img src="../Icons/delete-btn.svg" alt="delete-button" width="18" height="18" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Delete"></span>
                            </div>
                            </td>
                          </tr>`,
    )
    .join("");

  // Re-initialize tooltips after rendering new content
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]',
  );
  const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
};

// Toggle selection of individual row and update selectAll checkbox state
const toggleRowSelection = (email) => {
  const employee = employeeData.find((emp) => emp.email === email);
  if (employee) {
    employee.selected = !employee.selected;
  }
  const totalSelected = employeeData.filter((emp) => emp.selected).length;

  const selectAllCheckBox = document.querySelector(".selectAllRows");
  selectAllCheckBox.checked =
    totalSelected === employeeData.length && employeeData.length > 0;

  if (totalSelected > 0) {
    document.getElementById("deleteRecords").classList.remove("d-none");
  } else {
    document.getElementById("deleteRecords").classList.add("d-none");
  }

  if (selectAllCheckBox.checked) {
    selectAllCheckBox.indeterminate = false;
  } else if (totalSelected > 0 && totalSelected < employeeData.length) {
    selectAllCheckBox.indeterminate = true;
  } else {
    selectAllCheckBox.indeterminate = false;
  }

  showAcknowledgeToast(
    `${totalSelected} of ${employeeData.length} Row(s) selected.`,
  );
};

// logic to select or deselect all rows when selectAll checkbox is toggled
const selectAllRows = (checkBox) => {
  const isChecked = checkBox.querySelector("input").checked;
  currentDisplayData.forEach((emp) => (emp.selected = isChecked));

  if (isChecked && employeeData.length > 0) {
    showAcknowledgeToast(`${currentDisplayData.length} Row(s) selected.`);
    document.getElementById("deleteRecords").classList.remove("d-none");
  } else {
    document.getElementById("deleteRecords").classList.add("d-none");
  }
  filterEmpData();
  renderEmpTable(currentDisplayData);
};

// logic to delete selcted records
const deleteRecords = () => {
  document.getElementById("deleteRecords").classList.add("d-none");
  employeeData = employeeData.filter((emp) => !emp.selected);
  localStorage.setItem("EmpData", JSON.stringify(employeeData));
  currentDisplayData = [...employeeData];
  showWarningToast(`Selected records are deleted.`);
  filterEmpData();
  renderEmpTable(currentDisplayData);
};

// Update filter pills display based on current filters
const updateFilterPills = () => {
  let pillsContainer = document.getElementById("filterPills");
  pillsContainer.innerHTML = "";
  let selectedDept = document.getElementById("departmentDropDown").value;
  let selectedStatus = document.getElementById("statusDropDown").value;
  let minSalary = document.getElementById("minSal").value;
  let maxSalary = document.getElementById("maxSal").value;

  // Helper function to create individual pill
  const createPill = (text, removeFn) => {
    const pill = document.createElement("span");
    pill.innerHTML = "";
    pill.className =
      "badge text-bg-secondary d-flex align-items-center cursor-pointer";
    pill.innerHTML = `${text} <button type="button" class="btn-close btn-close-white btn-sm ms-2 pillClose" aria-label="Close"></button>`;
    pillsContainer.appendChild(pill);
    pill.querySelector("button").onclick = removeFn;
  };

  // Create department pill
  if (selectedDept) {
    createPill(selectedDept, () => {
      document.getElementById("departmentDropDown").value = "";
      filterEmpData();
      updateFilterPills();
    });
  }

  // Create status pill
  if (selectedStatus) {
    createPill(selectedStatus, () => {
      document.getElementById("statusDropDown").value = "";
      filterEmpData();
      updateFilterPills();
    });
  }

  // Create minimum salary pill
  if (minSalary) {
    createPill(`Min Salary: ${minSalary}`, () => {
      document.getElementById("minSal").value = "";
      filterEmpData();
      updateFilterPills();
    });
  }

  // Create maximum salary pill
  if (maxSalary) {
    createPill(`Max Salary: ${maxSalary}`, () => {
      document.getElementById("maxSal").value = "";
      filterEmpData();
      updateFilterPills();
    });
  }

  // Check if any filter is active
  const hasActiveFilters =
    selectedDept || selectedStatus || minSalary || maxSalary;

  // Create "Clear All" pill if any filter is active
  if (hasActiveFilters) {
    createPill("Clear All", () => {
      document.getElementById("departmentDropDown").value = "";
      document.getElementById("statusDropDown").value = "";
      document.getElementById("minSal").value = "";
      document.getElementById("maxSal").value = "";
      filterEmpData();
      updateFilterPills();
    });
  }
};

// Update required field indicators (asterisks on labels)
const updateRequiredIndicators = () => {
  const fields = [empName, empMail, empDept, empRole, empSalary, empJoinDate];
  fields.forEach((field) => {
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

// Upload and preview profile picture on table
const executeUpload = () => {
  const fileUpload = document.getElementById("fileUpload");
  const files = fileUpload.files[0];
  // console.log(files.name);

  if (files) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(files);
  }
  renderEmpTable(currentDisplayData);
};

// Add new employee or update existing employee
const addEmployee = (e) => {
  e.preventDefault();
  const fileUpload = document.getElementById("fileUpload");
  const files = fileUpload.files[0];
  
  const formObj = {
    fullName: empName.value,
    email: empMail.value,
    department: empDept.value,
    role: empRole.value,
    salary: empSalary.value,
    joiningDate: empJoinDate.value,
    status: statusMsg.textContent,
    src: files ? files?.name : "default-profile.png",
  };

  if (editingIndex === -1) {
    // Adding new employee
    employeeData.push(formObj);
    showAcknowledgeToast("Employee Added Successfully.");
  } else {
    // Updating existing employee
    employeeData[editingIndex] = formObj;
    editingIndex = -1;
    showAcknowledgeToast("Employee Updated Successfully.");
  }

  localStorage.setItem("EmpData", JSON.stringify(employeeData));

  submitBtn.disabled = true;
  submitBtn.textContent = "Submit";
  filterEmpData();
  executeUpload();
  empFormFields.reset();
};

// Populate form for editing an employee
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

  if (!statusToggle.checked) {
    statusToggle.classList.remove("bg-light-green");
  } else {
    statusToggle.classList.add("bg-light-green");
  }

  const editModal = new bootstrap.Modal(employeeForm);
  editModal.show();
};

// Delete employee from data and update display
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

// Setup delete confirmation modal with callback
const confirmDelete = (email) => {
  document.getElementById("deleteConfirm").innerHTML =
    `<button type="button" class="btn btn-outline-secondary"
                                data-bs-dismiss="modal">No</button>
                                <button type="button" class="btn btn-danger" data-bs-dismiss="modal" onclick="return deleteEmployee('${email}')">Yes</button>`;
};

// Toggle employee status (Active/Inactive)
const changeToggleStatus = (email) => {
  const employeeMail = employeeData.find((emp) => emp.email === email);

  employeeMail.status =
    employeeMail.status === "Active" ? "Inactive" : "Active";

  localStorage.setItem("EmpData", JSON.stringify(employeeData));

  filterEmpData();
};

// Search employees by name, email, or role
const searchEmpData = () => {
  const searchBox = document.getElementById("searchBox");
  const searchValue = searchBox?.value?.toLowerCase() || "";

  const filteredDataSearch = currentDisplayData.filter((emp) => {
    return (
      emp.fullName.toLowerCase().includes(searchValue) ||
      emp.email.toLowerCase().includes(searchValue) ||
      emp.role.toLowerCase().includes(searchValue)
    );
  });
  if (filteredDataSearch.length === 0) {
    document.getElementById("emptyMsg").textContent = "No matching Data Found!";
  }
  renderEmpTable(filteredDataSearch);
};

// Filter employees by department, status, and salary range
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

    updateFilterPills();
  }
};

// Sort employees by salary (ascending/descending)
const sortEmpSalary = () => {
  currentDisplayData.sort((a, b) => {
    if (salaryAsc) {
      document.getElementById("sortBySalary").src = "../Icons/sort-down.svg";
      return Number(a.salary) - Number(b.salary);
    } else {
      document.getElementById("sortBySalary").src = "../Icons/sort-up.svg";
      return Number(b.salary) - Number(a.salary);
    }
  });
  salaryAsc = !salaryAsc;

  renderEmpTable(currentDisplayData);
};

// Sort employees by joining date (ascending/descending)
const sortEmpDate = () => {
  currentDisplayData.sort((a, b) => {
    if (dateAsc) {
      document.getElementById("sortByDate").src = "../Icons/sort-down.svg";
      return new Date(a.joiningDate) - new Date(b.joiningDate);
    } else {
      document.getElementById("sortByDate").src = "../Icons/sort-up.svg";
      return new Date(b.joiningDate) - new Date(a.joiningDate);
    }
  });
  dateAsc = !dateAsc;

  renderEmpTable(currentDisplayData);
};

// Export employee data as CSV file
const exportToCsv = () => {
  if (employeeData.length !== 0) {
    const dataToExport = employeeData.map(({ selected, src, ...rest }) => rest);
    const csvData = json2csv.parse(dataToExport);
    let blob = new Blob([csvData], { type: "text/csv" });
    exportBtn.download = "Employee-Data.csv";
    exportBtn.href = URL.createObjectURL(blob);
    showAcknowledgeToast("Employee Data Downloaded Successfully.");
  } else {
    showWarningToast("No Employee Data Available!");
  }
};

// Validate email format and check for duplicates
const validateEmail = () => {
  const isDuplicateMail = employeeData.find(
    (val, idx) => val.email === empMail.value && idx !== editingIndex,
  );
  const isValidFormat = EMAIL_REGEX.test(empMail.value);

  if ((isValidFormat && !isDuplicateMail) || empMail.value.trim() === "") {
    empMail.classList.remove("is-invalid");
  } else {
    empMail.classList.add("is-invalid");
    submitBtn.disabled = true;
  }
};

// Validate name format (no leading spaces, no numbers)
const validateName = () => {
  if (/^\s|\d+/.test(empName.value)) {
    empName.classList.add("is-invalid");
    submitBtn.disabled = true;
  } else {
    empName.classList.remove("is-invalid");
  }
};

// Validate salary (no "dash", "e", "+" allowed)
const validateSalary = (e) => {
  if (e.key === "-" || e.key === "e" || e.key === "+") e.preventDefault();
};

// Validate all form input fields
const validateFormInput = () => {
  const isDuplicateMail = employeeData.find(
    (val, idx) => val.email === empMail.value && idx !== editingIndex,
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

// Handle status toggle change in form
statusToggle.addEventListener("change", () => {
  statusMsg.innerHTML = statusToggle.checked ? "Active" : "Inactive";

  if (statusToggle.checked) {
    statusToggle.classList.add("bg-light-green");
    statusMsg.value = "Active";
  } else {
    statusToggle.classList.remove("bg-light-green");
    statusMsg.value = "Inactive";
  }
});

// Reset form when modal closes
employeeForm.addEventListener("hidden.bs.modal", () => {
  modalHeading.textContent = "Add Employee";
  editingIndex = -1;
  submitBtn.textContent = "Submit";
  submitBtn.disabled = true;
  empFormFields.reset();
  empMail.classList.remove("is-invalid");
  document.querySelectorAll(".form-label.field-filled").forEach((label) => {
    label.classList.remove("field-filled");
  });
  if (statusToggle.checked) {
    statusToggle.classList.add("bg-light-green");
    statusMsg.value = "Active";
  } else {
    statusToggle.classList.remove("bg-light-green");
    statusMsg.value = "Inactive";
  }
});

// Handle department filter change
document.getElementById("departmentDropDown").addEventListener("change", () => {
  filterEmpData();
  updateFilterPills();
});

// Handle status filter change
document.getElementById("statusDropDown").addEventListener("change", () => {
  filterEmpData();
  updateFilterPills();
});

// Handle minimum salary filter change
document.getElementById("minSal").addEventListener("input", () => {
  filterEmpData();
  updateFilterPills();
});

// Handle maximum salary filter change
document.getElementById("maxSal").addEventListener("input", () => {
  filterEmpData();
  updateFilterPills();
});

// Load and display initial data
currentDisplayData = [...employeeData];
renderEmpTable(employeeData);
