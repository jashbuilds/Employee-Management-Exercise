const statusMsg = document.getElementById("showStatus");
const statusToggle = document.getElementById("status");
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

  renderEmpTable();
  empForm.reset();
  addDataBtn.disabled = true;
};

const renderEmpTable = () => {
  if (employeeData.length === 0) {
    emptyDataMsg.classList.remove("d-none");
  } else {
    emptyDataMsg.classList.add("d-none");
    empTable.classList.remove("d-none");
  }

  tableBody.innerHTML = employeeData
    .map(
      (emp) => `
    <tr id="empDataRow">
    <td id="empFullName">${emp.fullName}</td>
    <td id="empMail">${emp.email}</td>
                            <td>${emp.department}</td>
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

renderEmpTable();

const searchEmpData = () => {
  const dataRow = document.querySelectorAll("#empDataRow");
  const searchBox = document.getElementById("searchBox");

  const filter = searchBox.value.toLowerCase();

  for (let i = 0; i < dataRow.length; i++) {
    const empName = dataRow[i].getElementsByTagName("td")[0];
    const empMail = dataRow[i].getElementsByTagName("td")[1];
    const empRole = dataRow[i].getElementsByTagName("td")[3];

    if (empName && empMail && empRole) {
      const empNameValue = empName.textContent;
      const empMailValue = empMail.textContent;
      const empRoleValue = empRole.textContent;

      dataRow[i].style.display = (empNameValue.toLowerCase().indexOf(filter) > -1 || empMailValue.toLowerCase().indexOf(filter) > -1 || empRoleValue.toLowerCase().indexOf(filter) > -1) ? "" : "none"

    }
  }
};

const validateFormInput = () => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  addDataBtn.disabled =
    empName.value.trim() === "" ||
    empMail.value.trim() === "" ||
    empDept.value.trim() === "" ||
    empRole.value.trim() === "" ||
    empSalary.value.trim() === "" ||
    empJoinDate.value.trim() === "" ||
    !emailRegex.test(empMail.value)
      ? true
      : false;
};
