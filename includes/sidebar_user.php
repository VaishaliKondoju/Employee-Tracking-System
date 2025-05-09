<div class="sidebar">
    <ul>
        <li><a href="#" onclick="toggleDropdown(event, 'profile-dropdown')"><i class="fas fa-user"></i> Profile Management</a>
            <ul id="profile-dropdown" class="dropdown">
                <li><a href="#" onclick="showProfileForm()">View and update personal details</a></li>
                <li><a href="#" onclick="updateaddress()">Update my address</a></li>
                <li><a href="#" onclick="showUpdatePasswordForm()">Change password</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'attendance-dropdown')"><i class="fas fa-clock"></i> Attendance & Leaves</a>
            <ul id="attendance-dropdown" class="dropdown">
                <li><a href="#" onclick="showMarkAttendanceForm()">Mark daily attendance</a></li>
                <li><a href="#" onclick="showAttendanceHistory()">View attendance history</a></li>
                <li><a href="#" onclick="showApplyLeaveForm()">Apply for leave</a></li>
                <li><a href="#" onclick="showTrackLeaveRequests()">Track leave requests</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="showSalaryDetails()" style="display: flex; align-items: center; padding: 15px; color: #fff; text-decoration: none; border-radius: 6px; transition: background 0.3s;"><i class="fas fa-chart-bar" style="margin-right: 10px;"></i> View salary details</a></li>
        <li>
            <a href="#" onclick="showProjectsTasks()"><i class="fas fa-tasks"></i> Projects and Tasks</a>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'training-dropdown')"><i class="fas fa-graduation-cap"></i> Training and Performance</a>
            <ul id="training-dropdown" class="dropdown">
                <li><a href="#" onclick="event.preventDefault(); console.log('Enroll in training programs clicked'); showEnrollTraining()">Enroll in training programs</a></li>
                <li><a href="#" onclick="event.preventDefault(); console.log('Update training status clicked'); showUpdateTrainingStatus()">Update training status</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'feedback-dropdown')"><i class="fas fa-comment"></i> Feedback and Exit Interviews</a>
            <ul id="feedback-dropdown" class="dropdown">
                <li><a href="#" onclick="showFeedback()">View My Feedback</a></li>
                <li><a href="#" onclick="showSubmitExitInterviewForm()">Submit Exit Interview Details</a></li>
                <li><a href="#" onclick="showExitInterviewDetails()">View Exit Interview Details</a></li>            
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'help-dropdown')"><i class="fas fa-question-circle"></i> Help & Support</a>
            <ul id="help-dropdown" class="dropdown">
                <li><a href="#" onclick="showFAQs()">FAQs</a></li>
                <li><a href="#" onclick="showHRContact()">HR Contact</a></li>
            </ul>
        </li>
    </ul>
</div>