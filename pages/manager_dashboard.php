<?php
require_once '../includes/auth_check.php';
require_once '../auth/dbconnect.php';

$page_title = "Manager Dashboard";

$manager_id = $_SESSION['employee_id'];
function fetchData($con, $manager_id) {
    $data = [];

    // Employees assigned to this manager
    $stmt = $con->prepare("
        SELECT e.employee_id, e.user_id, e.emp_job_title, e.emp_status, u.first_name, u.last_name, u.email 
        FROM Employees e 
        JOIN Users u ON e.user_id = u.user_id 
        WHERE e.manager_id = :manager_id AND e.emp_status != 'inactive' AND u.is_active = 1
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['employees'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Employees for manager_id $manager_id: " . print_r($data['employees'], true));

    // Feedback given by this manager
    $stmt = $con->prepare("
        SELECT f.feedback_id, f.employee_id, f.rating, f.feedback_type, f.feedback_text, f.date_submitted, 
               u.first_name, u.last_name 
        FROM Feedback f 
        JOIN Employees e ON f.employee_id = e.employee_id 
        JOIN Users u ON e.user_id = u.user_id 
        WHERE f.reviewer_id = :manager_id
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['feedback'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Report data: Average rating per employee
    $stmt = $con->prepare("
        SELECT e.employee_id, u.first_name, u.last_name, AVG(f.rating) as avg_rating, COUNT(f.feedback_id) as feedback_count
        FROM Feedback f 
        JOIN Employees e ON f.employee_id = e.employee_id 
        JOIN Users u ON e.user_id = u.user_id 
        WHERE f.reviewer_id = :manager_id
        GROUP BY e.employee_id, u.first_name, u.last_name
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['report_avg_ratings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Report data: Feedback type distribution
    $stmt = $con->prepare("
        SELECT f.feedback_type, COUNT(f.feedback_id) as type_count
        FROM Feedback f 
        JOIN Employees e ON f.employee_id = e.employee_id 
        WHERE f.reviewer_id = :manager_id
        GROUP BY f.feedback_type
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['report_feedback_types'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get manager's department_id
    $stmt = $con->prepare("
        SELECT department_id 
        FROM Employees 
        WHERE employee_id = :manager_id
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $manager_dept = $stmt->fetch(PDO::FETCH_ASSOC);
    $department_id = $manager_dept['department_id'];

    // Projects under the manager's department
    $stmt = $con->prepare("
        SELECT p.project_id, p.project_name, p.start_date, p.expected_end_date, p.actual_end_date, 
               p.client_name, p.client_contact_email, p.project_status, p.budget, p.actual_cost, p.department_id
        FROM Projects p
        WHERE p.department_id = :department_id AND p.project_status != 'Completed'
    ");
    $stmt->execute(['department_id' => $department_id]);
    $data['projects'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Tasks and their assignments for projects in the manager's department
    $stmt = $con->prepare("
        SELECT t.task_id, t.task_description, t.status, t.project_id, p.project_name,
               at.employee_id, at.due_date, u.first_name, u.last_name
        FROM Task t
        JOIN Projects p ON t.project_id = p.project_id
        LEFT JOIN Assignment_Task at ON t.task_id = at.task_id
        LEFT JOIN Employees e ON at.employee_id = e.employee_id
        LEFT JOIN Users u ON e.user_id = u.user_id
        WHERE p.department_id = :department_id
    ");
    $stmt->execute(['department_id' => $department_id]);
    $data['tasks'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return $data;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    $response = ['success' => false];

    if ($_POST['action'] === 'refresh_data') {
        $data = fetchData($con, $manager_id);
        $response['success'] = true;
        $response = array_merge($response, $data);
    }
    echo json_encode($response);
    exit();
}

$data = fetchData($con, $manager_id);
$employees = $data['employees'];
$feedback = $data['feedback'];
$report_avg_ratings = $data['report_avg_ratings'];
$report_feedback_types = $data['report_feedback_types'];
$projects = $data['projects'];
$tasks = $data['tasks'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manager Dashboard</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    </head>
<body>
<?php include '../includes/header.php'; ?>
<div class="dashboard-container">
    <?php include '../includes/sidebar_manager.php'; ?>
    <div class="content" id="content-area">
        <div id="main-content" class="card">
            <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Manager'); ?> (Manager)</h2>
            <p>Select an option from the menu on the left to get started.</p>
        </div>
        <div id="profile-update-form" style="display: none;"></div>
        <div id="reports-analytics" style="display: none;" class="card">
            <h2>Reports and Analytics</h2>
            <div class="report-filter">
                <div class="form-group">
                    <label for="employee-search">Search Employee:</label>
                    <select id="employee-search">
                        <option value="">Select an employee</option>
                        <?php foreach ($employees as $emp): ?>
                            <option value="<?php echo htmlspecialchars($emp['employee_id']); ?>">
                                <?php echo htmlspecialchars($emp['first_name'] . ' ' . $emp['last_name']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="button" id="generate-report-btn">Generate Report</button>
                </div>
            </div>
            <div class="report-section" id="report-content" style="display: none;">
                <div class="report-section">
                    <h3>Average Ratings per Employee</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Average Rating</th>
                                <th>Feedback Count</th>
                            </tr>
                        </thead>
                        <tbody id="avg-ratings-table"></tbody>
                    </table>
                </div>
                <div class="report-section">
                    <h3>Feedback Type Distribution</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Feedback Type</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody id="feedback-types-table"></tbody>
                    </table>
                </div>
                <div class="report-section">
                    <h3>Feedback Summary</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Rating</th>
                                <th>Feedback Type</th>
                                <th>Feedback Details</th>
                                <th>Date Submitted</th>
                            </tr>
                        </thead>
                        <tbody id="feedback-summary-table"></tbody>
                    </table>
                </div>
                <div class="form-group button-group">
                    <button type="button" id="download-pdf-btn">Download PDF</button>
                </div>
            </div>
        </div>
        <!-- Projects Section -->
        <div id="projects-section" style="display: none;" class="card">
            <h2>Project Status</h2>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Budget</th>
                        <th>Actual Cost</th>
                        <th>Start Date</th>
                        <th>Expected End</th>
                        <th>Actual End</th>
                        <th>Client</th>
                    </tr>
                </thead>
                <tbody id="projects-table"></tbody>
            </table>
            <div class="form-group button-group">
                <button type="button" onclick="showWelcomeMessage(event)">Back</button>
            </div>
        </div>
        <!-- Assign Employees Section -->
        <div id="assign-employees-section" style="display: none;" class="card">
            <h2>Assign Employees to Project</h2>
            <form id="assign-employees-form" method="POST">
                <div class="form-group">
                    <label for="project_id_assign">Project:</label>
                    <select id="project_id_assign" name="project_id" required>
                        <option value="">Select a project</option>
                        <?php foreach ($projects as $project): ?>
                            <option value="<?php echo htmlspecialchars($project['project_id']); ?>">
                                <?php echo htmlspecialchars($project['project_name']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="employee_id_assign">Employee:</label>
                    <select id="employee_id_assign" name="employee_id" required>
                        <option value="">Select an employee</option>
                        <?php foreach ($employees as $emp): ?>
                            <option value="<?php echo htmlspecialchars($emp['employee_id']); ?>">
                                <?php echo htmlspecialchars($emp['first_name'] . ' ' . $emp['last_name']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="role_in_project">Role in Project:</label>
                    <input type="text" id="role_in_project" name="role_in_project" required>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Assign Employee</button>
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            </form>
        </div>
        <!-- Subtasks Section -->
        <div id="subtasks-section" style="display: none;" class="card">
            <h2>Create/Update Subtasks</h2>
            <form id="subtask-form" method="POST">
                <div class="form-group">
                    <label for="project_id_subtask">Project:</label>
                    <select id="project_id_subtask" name="project_id" required onchange="loadTasks()">
                        <option value="">Select a project</option>
                        <?php foreach ($projects as $project): ?>
                            <option value="<?php echo htmlspecialchars($project['project_id']); ?>">
                                <?php echo htmlspecialchars($project['project_name']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="task_id">Task (Optional):</label>
                    <select id="task_id" name="task_id">
                        <option value="">Create new task</option>
                        <!-- Populated dynamically by JS -->
                    </select>
                </div>
                <div class="form-group">
                    <label for="task_description">Task Description:</label>
                    <input type="text" id="task_description" name="task_description" required>
                </div>
                <div class="form-group">
                    <label for="employee_id_subtask">Assignee:</label>
                    <select id="employee_id_subtask" name="employee_id">
                        <option value="">Unassigned</option>
                        <?php foreach ($employees as $emp): ?>
                            <option value="<?php echo htmlspecialchars($emp['employee_id']); ?>">
                                <?php echo htmlspecialchars($emp['first_name'] . ' ' . $emp['last_name']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="due_date">Due Date:</label>
                    <input type="date" id="due_date" name="due_date" required>
                </div>
                <div class="form-group">
                    <label for="task_status">Status:</label>
                    <select id="task_status" name="status" required>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="submit" id="save-task-btn">Save Task</button>
                    <button type="button" id="delete-task-btn" style="display: none;" onclick="deleteTask()">Delete Task</button>
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            </form>
            <h3>Existing Subtasks</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Project</th>
                        <th>Assignee</th>
                        <th>Due Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="tasks-table"></tbody>
            </table>
        </div>
        <?php
        if (isset($_SESSION['success'])) {
            echo '<div class="alert alert-success" onclick="this.style.display=\'none\'">' . htmlspecialchars($_SESSION['success']) . '</div>';
            unset($_SESSION['success']);
        }
        if (isset($_SESSION['error'])) {
            echo '<div class="alert alert-error" onclick="this.style.display=\'none\'">' . htmlspecialchars($_SESSION['error']) . '</div>';
            unset($_SESSION['error']);
        }
        ?>
    </div>
</div>
<script>
    const employees = <?php echo json_encode($employees); ?>;
    const feedback = <?php echo json_encode($feedback); ?>;
    const reportAvgRatings = <?php echo json_encode($report_avg_ratings); ?>;
    const reportFeedbackTypes = <?php echo json_encode($report_feedback_types); ?>;
    const projects = <?php echo json_encode($projects); ?>;
    const tasks = <?php echo json_encode($tasks); ?>;
    const userName = "<?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Manager'); ?>";
    const managerId = <?php echo json_encode($manager_id); ?>;

    document.addEventListener('DOMContentLoaded', function() {
        refreshData();
    });
</script>
<script src="../assets/js/dashboard.js"></script>
<script src="../assets/js/manager_dashboard.js"></script>
</body>
</html>