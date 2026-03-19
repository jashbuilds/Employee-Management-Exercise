const statusMsg = document.getElementById("showStatus")
const statusToggle = document.getElementById("status")

statusToggle.addEventListener('change', () => {
    statusMsg.textContent = statusToggle.checked ? "Active" : "Inactive"
})

