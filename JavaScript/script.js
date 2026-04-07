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

let employeeData = JSON.parse(localStorage.getItem("EmpData")) || [];
employeeData = employeeData.map((emp) => ({
  ...emp,
  selected: emp.selected || false,
  src: emp.src || "default-profile.png",
}));
let currentDisplayData = [];
let editingIndex = -1;
let nameAsc = true;
let salaryAsc = true;
let dateAsc = true;

// Display toast notification.
const showAcknowledgeToast = (message, bg) => {
  const toastContainer = document.getElementById("notificationToast");
  const toastBody = toastContainer.querySelector(".toast-message");
  toastContainer.classList.add(bg)
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
                            <td class="align-content-center px-sm-3 px-2">
                              <input type="checkbox" name="selectRow" class="selectRow cursor-pointer" onclick="return toggleRowSelection('${emp.email}')" ${emp.selected ? "checked" : ""} data-email="${emp.email}">
                            </td>
                            <td class="text-start px-sm-3 ps-1 pe-2 text-secondary-emphasis">
                              <div class="d-flex align-items-center">
                                <img src="${emp.src.startsWith("data:") ? emp.src : "../Images/" + emp.src}" id="imgPreview" width='40' height='40' alt='profile' class='employeeProfile align-content-center border border-0 rounded-circle me-2 my-2 object-fit-contain'><span class="text-ellipsis w-75 overflow-hidden cursor-default" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${emp.fullName}">${emp.fullName}</span>
                              </div>
                            </td>
                            <td class="align-content-center px-sm-3 ps-1 pe-2 text-secondary-emphasis">
                                <span class="d-inline-block text-ellipsis w-75 overflow-hidden cursor-default" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${emp.email}">${emp.email}</span>
                            </td>
                            <td class="align-content-center px-sm-3 ps-1 pe-2 text-secondary-emphasis">${emp.department}</td>
                            <td class="align-content-center px-sm-3 ps-1 pe-2 text-secondary-emphasis">${emp.role}</td>
                            <td class="align-content-center px-sm-3 ps-1 pe-2 text-secondary-emphasis">$ ${emp.salary}</td>
                            <td class="align-content-center px-sm-3 ps-1 pe-2 text-secondary-emphasis">${emp.joiningDate}</td>
                            <td class="align-content-center">
                              <div class="form-check form-switch d-flex justify-content-center">
                                <input onchange="return changeToggleStatus('${emp.email}')"
                                  class="form-check-input border border-1 ${emp.status === "Active" ? "bg-light-green" : ""} cursor-pointer statusColToggle" type="checkbox" role="switch" switch ${emp.status === "Active" ? "checked" : ""}>
                                  <p class="d-none">${emp.status}</p> <!-- Hidden text to show status in csv file -->
                              </div>
                            </td>
                            <td class="align-content-center">
                            <div class="d-flex justify-content-center gap-3">
                              <span class="cursor-pointer py-2" onclick="return onEditEmployee('${emp.email}')"><img src="../Icons/edit-btn.svg" alt="edit-button" width="18" height="18" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit"></span>
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

  [...tooltipTriggerList].map((tooltipTriggerEl) => {
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

  showAcknowledgeToast(
    `${totalSelected} of ${currentDisplayData.length} Row(s) selected.`, "text-bg-success"
  );
};

// logic to select or deselect all rows when selectAll checkbox is toggled
const selectAllRows = (checkBox) => {
  const isChecked = checkBox.querySelector("input").checked;
  currentDisplayData.forEach((emp) => (emp.selected = isChecked));

  if (isChecked && employeeData.length > 0) {
    showAcknowledgeToast(`${currentDisplayData.length} Row(s) selected.`, "text-bg-success");
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
  showAcknowledgeToast(`Selected records are deleted.`, "text-bg-success");
  filterEmpData();
  renderEmpTable(currentDisplayData);
};

// Update filter pills display based on current filters
const updateFilterPills = () => {
  let pillsContainer = document.getElementById("filterPills");
  pillsContainer.innerHTML = "";
  let selectedDept = document.getElementById("departmentDropDown");
  let selectedStatus = document.getElementById("statusDropDown");
  let minSalary = document.getElementById("minSal");
  let maxSalary = document.getElementById("maxSal");

  // Helper function to create individual pill
  const createPill = (text, field) => {
    const pill = document.createElement("span");
    pill.innerHTML = "";
    pill.className =
      "btn btn-sm rounded-4 ps-3 pe-2 btn-outline-secondary d-flex align-items-center cursor-pointer gap-1";
    pill.innerHTML = `${text} <button type="button" class="btn btn-close btn-sm ms-2" aria-label="Close"></button>`;
    pillsContainer.appendChild(pill);
    const closeBtn = pill.querySelector("button");

    closeBtn.addEventListener("click", () => {
      field.value = "";
      filterEmpData();
      updateFilterPills();
    });
  };

  const createClearPill = (text) => {
    const pill = document.createElement("span");
    pill.innerHTML = "";
    pill.className =
      "btn btn-sm btn-outline-danger rounded-4 d-flex align-items-center px-3 cursor-pointer";
    pill.innerHTML = `${text}`;
    pillsContainer.appendChild(pill);
    pill.addEventListener("click", () => {
      selectedDept.value = "";
      selectedStatus.value = "";
      minSalary.value = "";
      maxSalary.value = "";
      filterEmpData();
      updateFilterPills();
    });
  };

  // Create department pill
  if (selectedDept.value) {
    createPill(selectedDept.value, selectedDept);
  }

  // Create status pill
  if (selectedStatus.value) {
    createPill(selectedStatus.value, selectedStatus);
  }

  // Create minimum salary pill
  if (minSalary.value) {
    createPill(`Min Salary: ${minSalary.value}`, minSalary);
  }

  // Create maximum salary pill
  if (maxSalary.value) {
    createPill(`Max Salary: ${maxSalary.value}`, maxSalary);
  }

  // Check if any filter is active
  const hasActiveFilters =
    selectedDept.value ||
    selectedStatus.value ||
    minSalary.value ||
    maxSalary.value;

  // Create "Clear All" pill if any filter is active
  if (hasActiveFilters) {
    createClearPill("Clear All");
    document.getElementById("deleteSelectedRow").classList.remove("top-11");
    document.getElementById("deleteSelectedRow").classList.add("top-37");
  } else {
    document.getElementById("deleteSelectedRow").classList.add("top-11");
    document.getElementById("deleteSelectedRow").classList.remove("top-37");
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

  if (files) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(files);
  }
  renderEmpTable(currentDisplayData);
};

let currentProfileDataUrl = null;

// Preview Selected Profile Picture
const previewProfilePic = () => {
  const fileUpload = document.getElementById("fileUpload");
  const profilePreview = document.getElementById("profilePreview");

  if (fileUpload.files && fileUpload.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      currentProfileDataUrl = e.target.result;
      profilePreview.src = e.target.result;
      profilePreview.classList.remove("d-none");
    };
    reader.readAsDataURL(fileUpload.files[0]);
  }
};

// Delete Profile Picture
const deleteProfile = () => {
  const profilePreview = document.getElementById("profilePreview");

  profilePreview.src = "";
  currentProfileDataUrl = null;
  document.getElementById("deleteProfilePic").classList.add("d-none");
  document.getElementById("fileUpload").classList.remove("d-none");
  profilePreview.classList.add("d-none");
};

// Add new employee or update existing employee
const addOrUpdateEmployee = (e) => {
  e.preventDefault();

  const formObj = {
    fullName: empName.value,
    email: empMail.value,
    department: empDept.value,
    role: empRole.value,
    salary: empSalary.value,
    joiningDate: empJoinDate.value,
    status: statusMsg.textContent,
    src: currentProfileDataUrl || "default-profile.png",
  };

  if (editingIndex === -1) {
    // Adding new employee
    employeeData.push(formObj);
    showAcknowledgeToast(`Employee '${formObj.fullName}' Added Successfully.`, "text-bg-success");
  } else {
    // Updating existing employee
    employeeData[editingIndex] = formObj;
    editingIndex = -1;
    showAcknowledgeToast(
      `Employee '${formObj.fullName}' Updated Successfully.`, "text-bg-success"
    );
  }

  localStorage.setItem("EmpData", JSON.stringify(employeeData));

  submitBtn.disabled = true;
  submitBtn.textContent = "Submit";
  filterEmpData();
  executeUpload();
  empFormFields.reset();
  currentProfileDataUrl = null;
};

// Populate form for editing an employee
const onEditEmployee = (email) => {
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

  const profilePreview = document.getElementById("profilePreview");
  if (employee.src && employee.src !== "default-profile.png") {
    if (employee.src.startsWith("data")) {
      profilePreview.src = employee.src;
      currentProfileDataUrl = employee.src;
    } else {
      profilePreview.src = `../Images/${employee.src}`;
      currentProfileDataUrl = null;
    }

    document.getElementById("deleteProfilePic").classList.remove("d-none");
    document.getElementById("fileUpload").classList.add("d-none");
    profilePreview.classList.remove("d-none");
  } else {
    document.getElementById("deleteProfilePic").classList.add("d-none");
    document.getElementById("fileUpload").classList.remove("d-none");
    profilePreview.classList.add("d-none");
  }

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
  showAcknowledgeToast(`Employee ${employee.fullName} Deleted!`, "text-bg-success");
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

  showAcknowledgeToast(
    `Status of '${employeeMail.fullName}' changed to ${employeeMail.status}.`, "text-bg-success"
  );

  localStorage.setItem("EmpData", JSON.stringify(employeeData));

  filterEmpData();
};

// Filter employees by department, status, and salary range
const filterEmpData = () => {
  const selectedDept = document.getElementById("departmentDropDown").value;
  const selectedStatus = document.getElementById("statusDropDown").value;
  const min = document.getElementById("minSal").value
    ? Number(document.getElementById("minSal").value)
    : 0;
  const max = document.getElementById("maxSal").value
    ? Number(document.getElementById("maxSal").value)
    : Infinity;
  const maxSalInput = document.getElementById("maxSal");

  const searchBox = document.getElementById("searchBox");
  const searchValue = searchBox?.value?.toLowerCase() || "";

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

      const searchFilter =
        searchValue === "" ||
        emp.fullName.toLowerCase().includes(searchValue) ||
        emp.email.toLowerCase().includes(searchValue) ||
        emp.role.toLowerCase().includes(searchValue);

      return deptFilter && statusFilter && salaryFilter && searchFilter;
    });

    if (filteredData.length === 0) {
      document.getElementById("emptyMsg").textContent =
        "No matching Data Found!";
      document.getElementById("deleteRecords").classList.add("d-none");
    } else {
      document.getElementById("emptyMsg").textContent =
        "No Employee Data Available!";
    }

    currentDisplayData = filteredData;
    renderEmpTable(filteredData);

    updateFilterPills();
  }
};

// Sort employees by name (ascending/descending)
const sortEmpName = () => {
  const dataToSort = [...currentDisplayData];
  dataToSort.sort((a, b) => {
    if (nameAsc) {
      document.getElementById("sortByName").src = "../Icons/sort-down.svg";
      document.getElementById("sortBySalary").src = "../Icons/sort-arrow.svg";
      document.getElementById("sortByDate").src = "../Icons/sort-arrow.svg";
      return a.fullName.localeCompare(b.fullName);
    } else {
      document.getElementById("sortByName").src = "../Icons/sort-up.svg";
      document.getElementById("sortBySalary").src = "../Icons/sort-arrow.svg";
      document.getElementById("sortByDate").src = "../Icons/sort-arrow.svg";
      return b.fullName.localeCompare(a.fullName);
    }
  });
  nameAsc = !nameAsc;

  renderEmpTable(dataToSort);
};

// Sort employees by salary (ascending/descending)
const sortEmpSalary = () => {
  const dataToSort = [...currentDisplayData];
  dataToSort.sort((a, b) => {
    if (salaryAsc) {
      document.getElementById("sortBySalary").src = "../Icons/sort-down.svg";
      document.getElementById("sortByName").src = "../Icons/sort-arrow.svg";
      document.getElementById("sortByDate").src = "../Icons/sort-arrow.svg";
      return Number(a.salary) - Number(b.salary);
    } else {
      document.getElementById("sortBySalary").src = "../Icons/sort-up.svg";
      document.getElementById("sortByName").src = "../Icons/sort-arrow.svg";
      document.getElementById("sortByDate").src = "../Icons/sort-arrow.svg";
      return Number(b.salary) - Number(a.salary);
    }
  });
  salaryAsc = !salaryAsc;

  renderEmpTable(dataToSort);
};

// Sort employees by joining date (ascending/descending)
const sortEmpDate = () => {
  const dataToSort = [...currentDisplayData];
  dataToSort.sort((a, b) => {
    if (dateAsc) {
      document.getElementById("sortByDate").src = "../Icons/sort-down.svg";
      document.getElementById("sortBySalary").src = "../Icons/sort-arrow.svg";
      document.getElementById("sortByName").src = "../Icons/sort-arrow.svg";
      return new Date(a.joiningDate) - new Date(b.joiningDate);
    } else {
      document.getElementById("sortByDate").src = "../Icons/sort-up.svg";
      document.getElementById("sortBySalary").src = "../Icons/sort-arrow.svg";
      document.getElementById("sortByName").src = "../Icons/sort-arrow.svg";
      return new Date(b.joiningDate) - new Date(a.joiningDate);
    }
  });
  dateAsc = !dateAsc;

  renderEmpTable(dataToSort);
};

// Export employee data as CSV file
const exportToCsv = () => {
  if (employeeData.length !== 0) {
    const dataToExport = employeeData.map(({ selected, src, ...rest }) => rest);
    const csvData = json2csv.parse(dataToExport);
    let blob = new Blob([csvData], { type: "text/csv" });
    exportBtn.download = "Employee-Data.csv";
    exportBtn.href = URL.createObjectURL(blob);
    showAcknowledgeToast("Employee Data Downloaded Successfully.", "text-bg-success");
  } else {
    showAcknowledgeToast("No Employee Data Available!", "text-bg-danger");
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

// Validate Number Input (no "dash", "e", "+" allowed)
const validateNumberInput = (e) => {
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

  const profilePreview = document.getElementById("profilePreview");
  profilePreview.classList.add("d-none");

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

  document.getElementById("deleteProfilePic").classList.add("d-none");
  document.getElementById("fileUpload").classList.remove("d-none");
  profilePreview.classList.add("d-none");
});

const handleFieldChange = (field, event) => {
  document.getElementById(field).addEventListener(event, () => {
    filterEmpData();
    updateFilterPills();
  });
};

handleFieldChange("departmentDropDown", "change");
handleFieldChange("statusDropDown", "change");
handleFieldChange("minSal", "input");
handleFieldChange("maxSal", "input");

// Load and display initial data
currentDisplayData = [...employeeData];
renderEmpTable(employeeData);

// Validation to prevent future Dates.
const today = new Date().toISOString().split("T")[0];
empJoinDate.setAttribute("max", today);

// Welcome Toast
window.onload = () => {
  showAcknowledgeToast("Welcome to Employee Management System!", "text-bg-success");
};
