<div class="sidebar">
    <ul>
        <li><a href="#" onclick="toggleDropdown(event, 'manage-dropdown')"><i class="fas fa-users"></i> Manage Users</a>
            <ul id="manage-dropdown" class="dropdown">
                <li><a href="#" onclick="showProfileForm()">Employees assigned to me</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'attendance-dropdown')"><i class="fas fa-clock"></i> Attendance and Leave</a>
            <ul id="attendance-dropdown" class="dropdown">
                <li><a href="#">View attendance records</a></li>
                <li><a href="#">Approve/reject leave requests</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'department-dropdown')"><i class="fas fa-building"></i> Department Management</a>
            <ul id="department-dropdown" class="dropdown">
                <li><a href="#">Track department information</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'project-dropdown')"><i class="fas fa-tasks"></i> Projects and Tasks</a>
            <ul id="project-dropdown" class="dropdown">
                <li><a href="#">Assign project to employees</a></li>
                <li><a href="#">Assign tasks to employee</a></li>
                <li><a href="#">Track project status</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'feedback-dropdown')"><i class="fas fa-comment"></i> Feedback and Review</a>
            <ul id="feedback-dropdown" class="dropdown">
                <li><a href="#">Give feedback to employees </a></li>
                <li><a href="#">View employee feedback history</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'reports-dropdown')"><i class="fas fa-chart-bar"></i> Reports & Analytics</a>
            <ul id="reports-dropdown" class="dropdown">
                <li><a href="#">Generate reports of an employee</a></li>
            </ul>
        </li>
    </ul>
</div>