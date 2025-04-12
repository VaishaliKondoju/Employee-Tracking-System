// user_dashboard.js

// Utility function to show a section and hide others
function showSection(sectionId) {
    const sections = [
        'main-content',
        'profile-update-form',
        'mark-attendance-section',
        'attendance-history-section',
        'apply-leave-section',
        'track-leave-section',
        'faqs-section',
        'hr-contact-section'
    ];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = id === sectionId ? 'block' : 'none';
        }
    });
}

// Show welcome message (default view)
function showWelcomeMessage() {
    showSection('main-content');
}

// Toggle dropdown visibility
function toggleDropdown(event, dropdownId) {
    event.preventDefault();
    const dropdown = document.getElementById(dropdownId);
    const isDisplayed = dropdown.style.display === 'block';
    document.querySelectorAll('.dropdown').forEach(d => {
        d.style.display = 'none';
        d.style.opacity = '0'; // Reset opacity when hidden
    });
    dropdown.style.display = isDisplayed ? 'none' : 'block';
    dropdown.style.opacity = isDisplayed ? '0' : '1'; // Sync opacity with display
}

// Show mark attendance form
function showMarkAttendanceForm() {
    showSection('mark-attendance-section');
    const form = document.getElementById('mark-attendance-form');
    form.reset(); // Reset the form when showing
    form.removeEventListener('submit', handleMarkAttendanceSubmit);
    form.addEventListener('submit', handleMarkAttendanceSubmit);
}

function handleMarkAttendanceSubmit(event) {
    event.preventDefault();
    const checkIn = document.getElementById('check_in').value;
    const checkOut = document.getElementById('check_out').value;
    const status = document.getElementById('status').value;

    fetch('', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'mark_attendance',
            check_in: checkIn,
            check_out: checkOut,
            status: status
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            form.reset();
        } else {
            alert('Error: ' + (data.error || 'Failed to mark attendance'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while marking attendance.');
    });
}

// Show attendance history
function showAttendanceHistory() {
    showSection('attendance-history-section');
    fetchAttendanceHistory();
}

// Fetch and display attendance history
function fetchAttendanceHistory() {
    const startDate = document.getElementById('attendance_start_date').value;
    const endDate = document.getElementById('attendance_end_date').value;
    const tableBody = document.getElementById('attendance-history-table');

    fetch('', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'fetch_attendance',
            start_date: startDate,
            end_date: endDate
        })
    })
    .then(response => response.json())
    .then(data => {
        tableBody.innerHTML = ''; // Clear existing rows
        if (data.success && data.attendance_records.length > 0) {
            data.attendance_records.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.check_in || 'N/A'}</td>
                    <td>${record.check_out || 'N/A'}</td>
                    <td>${record.status}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="3">No attendance records found.</td></tr>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        tableBody.innerHTML = '<tr><td colspan="3">Error fetching attendance history.</td></tr>';
    });
}

// Fetch and display leave balance
function fetchLeaveBalance() {
    fetch('', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'fetch_leave_balance'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.leave_balances) {
            // Update the leave type dropdown
            const leaveTypeSelect = document.getElementById('leave_type_id');
            const options = leaveTypeSelect.options;
            for (let i = 1; i < options.length; i++) { // Start from 1 to skip the "Select a leave type" option
                const leaveTypeId = options[i].value;
                const balance = data.leave_balances.find(b => b.leave_type_id == leaveTypeId);
                if (balance) {
                    options[i].text = `${balance.leave_name} (Remaining: ${balance.remaining_days} days)`;
                }
            }

            // Update the leave balance summary table
            const tableBody = document.getElementById('leave-balance-table-body');
            tableBody.innerHTML = ''; // Clear existing rows
            data.leave_balances.forEach(balance => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${balance.leave_name}</td>
                    <td>${balance.total_days_allocated}</td>
                    <td>${balance.days_used}</td>
                    <td>${balance.remaining_days}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            console.error('Failed to fetch leave balance:', data.error || 'Unknown error');
        }
    })
    .catch(error => {
        console.error('Error fetching leave balance:', error);
    });
}

// Show apply for leave form
function showApplyLeaveForm() {
    showSection('apply-leave-section');
    const form = document.getElementById('apply-leave-form');
    form.reset(); // Reset the form when showing
    form.removeEventListener('submit', handleApplyLeaveSubmit);
    form.addEventListener('submit', handleApplyLeaveSubmit);

    // Fetch the latest leave balance when showing the form
    fetchLeaveBalance();
}

function handleApplyLeaveSubmit(event) {
    event.preventDefault(); // Prevent default form submission
    const leaveTypeId = document.getElementById('leave_type_id').value;
    const startDate = document.getElementById('leave_start_date').value;
    const endDate = document.getElementById('leave_end_date').value;

    fetch('', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'apply_leave',
            leave_type_id: leaveTypeId,
            start_date: startDate,
            end_date: endDate
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            form.reset(); // Reset the form
            fetchLeaveBalance(); // Refresh leave balance after submission
            showTrackLeaveRequests(); // Redirect to Track Leave Requests section
        } else {
            alert('Error: ' + (data.error || 'Failed to apply for leave'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while applying for leave.');
    });
}

// Show track leave requests
function showTrackLeaveRequests() {
    showSection('track-leave-section');
    fetchLeaveRequests();
}

// Fetch and display leave requests
function fetchLeaveRequests() {
    const leaveFilter = document.getElementById('leave_filter').value;
    const tableBody = document.getElementById('leave-requests-table');

    fetch('', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'fetch_leave_requests',
            leave_filter: leaveFilter
        })
    })
    .then(response => response.json())
    .then(data => {
        tableBody.innerHTML = ''; // Clear existing rows
        if (data.success && data.leave_requests.length > 0) {
            data.leave_requests.forEach(request => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request.leave_name}</td>
                    <td>${request.leave_start_date}</td>
                    <td>${request.leave_end_date}</td>
                    <td><span class="status-badge status-${request.status.toLowerCase()}">${request.status}</span></td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="4">No leave requests found.</td></tr>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        tableBody.innerHTML = '<tr><td colspan="4">Error fetching leave requests.</td></tr>';
    });
}

// Show FAQs section
function showFAQs() {
    showSection('faqs-section');
}

// Show HR Contact section
function showHRContact() {
    showSection('hr-contact-section');
}

// Placeholder for showProfileForm
function showProfileForm() {
    showSection('profile-update-form');
}

// Ensure functions are globally accessible and add hover effects
document.addEventListener('DOMContentLoaded', function() {
    window.toggleDropdown = toggleDropdown;
    window.showWelcomeMessage = showWelcomeMessage;
    window.showMarkAttendanceForm = showMarkAttendanceForm;
    window.showAttendanceHistory = showAttendanceHistory;
    window.showApplyLeaveForm = showApplyLeaveForm;
    window.showTrackLeaveRequests = showTrackLeaveRequests;
    window.fetchAttendanceHistory = fetchAttendanceHistory;
    window.fetchLeaveRequests = fetchLeaveRequests;
    window.showProfileForm = showProfileForm;
    window.showFAQs = showFAQs;
    window.showHRContact = showHRContact;

    // Add hover effects for sidebar items (matching manager dashboard)
    const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
    sidebarLinks.forEach(link => {
        link.addEventListener('mouseover', () => link.style.background = '#00205b');
        link.addEventListener('mouseout', () => link.style.background = '');
    });
    const dropdownLinks = document.querySelectorAll('.dropdown a');
    dropdownLinks.forEach(link => {
        link.addEventListener('mouseover', () => link.style.color = '#fff');
        link.addEventListener('mouseout', () => link.style.color = '#ddd');
    });
});