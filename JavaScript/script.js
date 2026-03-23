const statusMsg = document.getElementById("showStatus");
const statusToggle = document.getElementById("statusToggle");
const addDataBtn = document.getElementById("addBtn");
const empName = document.getElementById("fullName");
const empMail = document.getElementById("email");
const empDept = document.getElementById("department");
const empRole = document.getElementById("role");
const empSalary = document.getElementById("salary");
const empJoinDate = document.getElementById("joiningDate");
const tableBody = document.getElementById("tableBody");
const empForm = document.getElementById("empForm");
const empTable = document.getElementById("empTable");
const emptyDataMsg = document.querySelector(".emptyDataMsg");

const employeeData = JSON.parse(localStorage.getItem("EmpData")) || [];

let salaryAsc = true;
let dateAsc = true;
let currentDisplayData = [];

statusToggle.addEventListener("change", () => {
  statusMsg.textContent = statusToggle.checked ? "Active" : "Inactive";
  statusMsg.value = statusToggle.checked ? "active" : "inactive";
});

const submitForm = (e) => {
  e.preventDefault();
  const formObj = {
    fullName: empName.value,
    email: empMail.value,
    department: empDept.value,
    role: empRole.value,
    salary: empSalary.value,
    joiningDate: empJoinDate.value,
    status: statusMsg.textContent,
  };

  employeeData.push(formObj);
  localStorage.setItem("EmpData", JSON.stringify(employeeData));

  currentDisplayData = [...employeeData]; 
  renderEmpTable(currentDisplayData);
  empForm.reset();
  addDataBtn.disabled = true;
};

const renderEmpTable = (data) => {
  if (employeeData.length === 0) {
    emptyDataMsg.classList.remove("d-none");
  } else {
    emptyDataMsg.classList.add("d-none");
    empTable.classList.remove("d-none");
  }

  tableBody.innerHTML = data
    .map(
      (emp) => `
    <tr id="empDataRow">
    <td id="empFullName">${emp.fullName}</td>
    <td id="empMail">${emp.email}</td>
                            <td id="empDept">${emp.department}</td>
                            <td id="empRole">${emp.role}</td>
                            <td>${emp.salary}</td>
                            <td>${emp.joiningDate}</td>
                            <td>${emp.status}</td>
                            <td class="d-flex align-items-center justify-content-center gap-3">
                              <button type="button" class="btn btn-primary btn-sm"><img src="../Icons/edit-btn.svg"
                    alt="edit-button" width="16" height="14"></button>
                              <button type="button" class="btn btn-danger btn-sm"><img src="../Icons/delete-btn.svg"
                    alt="delete-button" width="16" height="14"></button>
                            </td>
                            </tr>`,
    )
    .join("");
};

if (
  document.getElementById("departmentDropDown").value === "" &&
  document.getElementById("statusDropDown").value === ""
) {
  currentDisplayData = [...employeeData];
  renderEmpTable(employeeData);
}

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

  renderEmpTable(filteredData);
};

const filterEmpData = () => {
  const selectedDept = document.getElementById("departmentDropDown").value;
  const selectedStatus = document.getElementById("statusDropDown").value;
  const minSalary = document.getElementById("minSal").value;
  const maxSalary = document.getElementById("maxSal").value;

  const filteredData = employeeData.filter((emp) => {
    const deptFilter = selectedDept === "" || emp.department === selectedDept;

    const statusFilter = selectedStatus === "" || emp.status === selectedStatus;

    const salaryFilter =
      (minSalary === "" && maxSalary === "") ||
      (Number(emp.salary) >= Number(minSalary) && Number(emp.salary) <= Number(maxSalary));

    return deptFilter && statusFilter && salaryFilter;
  });

  currentDisplayData = filteredData;
  renderEmpTable(filteredData);
};

const sortEmpSalary = () => {
  currentDisplayData.sort((a, b) => salaryAsc ? Number(a.salary) - Number(b.salary) : Number(b.salary) - Number(a.salary))
  salaryAsc = !salaryAsc
  
  renderEmpTable(currentDisplayData)
};

const sortEmpDate = () => {
  currentDisplayData.sort((a, b) => dateAsc ? new Date(a.joiningDate) - new Date(b.joiningDate) : new Date(b.joiningDate) - new Date(a.joiningDate))
  dateAsc = !dateAsc
  
  renderEmpTable(currentDisplayData)
}

const validateFormInput = () => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const isFormValid =
    empName.value.trim() !== "" &&
    empMail.value.trim() !== "" &&
    empDept.value.trim() !== "" &&
    empRole.value.trim() !== "" &&
    empSalary.value.trim() !== "" &&
    empJoinDate.value.trim() !== "" &&
    emailRegex.test(empMail.value);

  addDataBtn.disabled = !isFormValid;
};
