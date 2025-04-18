<div class="sidebar">
    <ul>
        <li><a href="#" onclick="toggleDropdown(event, 'manage-dropdown')"><i class="fas fa-users"></i> Manage Users</a>
            <ul id="manage-dropdown" class="dropdown">
                <li><a href="#" onclick="showCreateUserForm()">Create new profile</a></li>
                <li><a href="#" onclick="showUpdateRemoveUserForm()">Update / remove user</a></li>
                <li><a href="#" onclick="showAllEmployees()">View all employees/managers</a></li>

            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'attendance-dropdown')"><i class="fas fa-clock"></i> Attendance and Leave</a>
            <ul id="attendance-dropdown" class="dropdown">
                <li><a href="#" onclick="showAttendanceRecords()">View attendance records</a></li>
                <li><a href="#" onclick="showLeaveRequests()">Approve or reject leave requests</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="showDepartmentInfo()" style="display: flex; align-items: center; padding: 15px; color: #fff; text-decoration: none; border-radius: 6px; transition: background 0.3s;"><i class="fas fa-chart-bar" style="margin-right: 10px;"></i> Track Department Information</a></li>
        <li><a href="#" onclick="toggleDropdown(event, 'project-dropdown')"><i class="fas fa-tasks"></i> Projects and Tasks</a>
            <ul id="project-dropdown" class="dropdown">
                <li><a href="#" onclick="showAddProjectForm()">Add New Project to Department</a></li>
                <li><a href="#" onclick="showProjectStatus()">Track or Edit Project Status</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'training-dropdown')"><i class="fas fa-graduation-cap"></i> Training Management</a>
            <ul id="training-dropdown" class="dropdown">
                <li><a href="#" onclick="showAddTrainingForm()">Add or manage training programs</a></li>
                <li><a href="#" onclick="showAssignTraining()">Assign training to employees</a></li>
                <li><a href="#" onclick="showTrainingStatus()">View training status</a></li>
            </ul>
        </li>
        <!--       <li><a href="#" onclick="toggleDropdown(event, 'reports-dropdown')"><i class="fas fa-chart-bar"></i> Reports & Analytics</a>
             <ul id="reports-dropdown" class="dropdown">
                 <li><a href="#">Generate report for an employee</a></li>
                 <li><a href="#">View department-wise performance metrics</a></li>
             </ul>
         </li> -->
    </ul>
</div>