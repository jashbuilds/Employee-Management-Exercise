const statusMsg = document.getElementById("showStatus");
const statusToggle = document.getElementById("status");

statusToggle.addEventListener("change", () => {
  statusMsg.textContent = statusToggle.checked ? "Active" : "Inactive";
});

const addDataBtn = document.getElementById("addBtn");

const formData = [];

const empName = document.getElementById("fullName");
const empMail = document.getElementById("email");
const empDept = document.getElementById("department");
const empRole = document.getElementById("role");
const empSalary = document.getElementById("salary");
const empJoinDate = document.getElementById("joiningDate");
const statusLabel = document.getElementById("showStatus");

const addFormData = (name, mail, department, role, salary, date, status) => {
  const formObj = {
    fullName: name,
    email: mail,
    department: department,
    role: role,
    salary: salary,
    date: date,
    status: status,
  };
  formData.push(formObj);
};

addDataBtn.addEventListener("click", (e) => {
  e.preventDefault();

  addFormData(
    empName.value,
    empMail.value,
    empDept.value,
    empRole.value,
    empSalary.value,
    empJoinDate.value,
    statusLabel.textContent,
  );

  localStorage.setItem("FormData", JSON.stringify(formData));
});

const validateFormInput = () => {
  addDataBtn.disabled =
    empName.value.trim() === "" ||
    empMail.value.trim() === "" ||
    empDept.value.trim() === "" ||
    empRole.value.trim() === "" ||
    empSalary.value.trim() === "" ||
    empJoinDate.value.trim() === ""
      ? true
      : false;
};

const formInputFields = [
  empName,
  empMail,
  empDept,
  empRole,
  empSalary,
  empJoinDate,
];

formInputFields.forEach((a) => a.addEventListener("input", validateFormInput));
