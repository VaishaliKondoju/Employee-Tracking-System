<?php
require_once '../includes/auth_check.php';
require_once '../auth/dbconnect.php';

$page_title = "Super Admin Dashboard";


try {
    $stmt = $con->query("
        SELECT 
            e.employee_id, e.user_id, u.first_name, u.last_name, u.email, u.role, 
            e.department_id, e.emp_hire_date, e.emp_status, e.manager_id, e.is_manager
        FROM Employees e
        JOIN Users u ON e.user_id = u.user_id 
        WHERE u.role != 'SuperAdmin' AND e.emp_status != 'Inactive'
    ");
    $employeesadmin = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $employeesadmin = [];
    $_SESSION['error'] = "Failed to fetch employees: " . $e->getMessage();
}


// Fetch departments with description and employee count
try {
    $stmt = $con->query("
        SELECT distinct
            d.department_id, 
            d.department_name, 
            d.department_description, 
            COUNT(e.employee_id) AS employee_count
        FROM Department d
        LEFT JOIN Employees e ON d.department_id = e.department_id  where  e.emp_status != 'Inactive' 
        GROUP BY d.department_id, d.department_name, d.department_description
    ");
    $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $departments = [];
    $_SESSION['error'] = "Failed to fetch department information: " . $e->getMessage();
}


// Function to fetch data for reports
function fetchData($con, $sections = ['all']) {
    $data = [];

    // Helper function to check if a section should be fetched
    $shouldFetch = function($section) use ($sections) {
        return in_array('all', $sections) || in_array($section, $sections);
    };

    // Fetch all active employees
    if ($shouldFetch('employees')) {
        $stmt = $con->prepare("
            SELECT e.employee_id, e.user_id, e.emp_job_title, e.emp_status, u.first_name, u.last_name, u.email 
            FROM Employees e 
            JOIN Users u ON e.user_id = u.user_id 
            WHERE e.emp_status != 'Inactive' AND u.is_active = 1
        ");
        $stmt->execute();
        $data['employees'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Feedback given across all employees
    if ($shouldFetch('feedback')) {
        $stmt = $con->prepare("
            SELECT f.feedback_id, f.employee_id, f.rating, f.feedback_type, f.feedback_text, f.date_submitted, 
                   u.first_name, u.last_name 
            FROM Feedback f 
            JOIN Employees e ON f.employee_id = e.employee_id 
            JOIN Users u ON e.user_id = u.user_id WHERE e.emp_status != 'Inactive' 
        ");
        $stmt->execute();
        $data['feedback'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Report data: Average rating per employee
    if ($shouldFetch('report_avg_ratings')) {
        $stmt = $con->prepare("
            SELECT e.employee_id, u.first_name, u.last_name, AVG(f.rating) as avg_rating, COUNT(f.feedback_id) as feedback_count
            FROM Feedback f 
            JOIN Employees e ON f.employee_id = e.employee_id 
            JOIN Users u ON e.user_id = u.user_id  where e.emp_status != 'Inactive' 
            GROUP BY e.employee_id, u.first_name, u.last_name
        ");
        $stmt->execute();
        $data['report_avg_ratings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Report data: Feedback type distribution
    if ($shouldFetch('report_feedback_types')) {
        $stmt = $con->prepare("
            SELECT f.feedback_type, COUNT(f.feedback_id) as type_count
            FROM Feedback f 
            JOIN Employees e ON f.employee_id = e.employee_id  where e.emp_status != 'Inactive' 
            GROUP BY f.feedback_type
        ");
        $stmt->execute();
        $data['report_feedback_types'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch project assignments
    if ($shouldFetch('project_assignments')) {
        $stmt = $con->prepare("
            SELECT a.assignment_id, a.project_id, a.employee_id, a.role_in_project, 
                   p.project_name, u.first_name, u.last_name
            FROM Assignment a
            JOIN Projects p ON a.project_id = p.project_id
            JOIN Employees e ON a.employee_id = e.employee_id
            JOIN Users u ON e.user_id = u.user_id
            WHERE p.project_status != 'Completed'
        ");
        $stmt->execute();
        $data['project_assignments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

        // Fetch project overview
    if ($shouldFetch('projects')) {
        $stmt = $con->prepare("
            SELECT p.project_id, p.project_name, p.project_status, p.budget, p.actual_cost, 
                p.start_date, p.expected_end_date, d.department_name
            FROM Projects p
            JOIN Department d ON p.department_id = d.department_id
        ");
        $stmt->execute();
        $data['projects'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch data from Employee_Task_Project_View for Excel download
    if ($shouldFetch('employee_task_project_view')) {
        $stmt = $con->prepare("
            SELECT 
                employee_id,
                employee_name,
                project_id,
                project_name,
                role_in_project,
                assignment_status,
                task_id,
                task_description,
                task_status,
                due_date
            FROM 
                Employee_Task_Project_View
            WHERE 
                project_id IS NOT NULL
        ");
        $stmt->execute();
        $data['employee_task_project_view'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch data from Training_Programs_View for Excel download
    if ($shouldFetch('training_programs_view')) {
        $stmt = $con->prepare("
            SELECT 
                training_id,
                training_name,
                department_name,
                training_date,
                end_date,
                duration_days,
                certificate,
                employee_id,
                employee_name,
                training_status,
                score,
                enrollment_date
            FROM 
                Training_Programs_View
        ");
        $stmt->execute();
        $data['training_programs_view'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    if ($shouldFetch('training_certificates')) {
        $stmt = $con->prepare("
            SELECT et.employee_training_id, et.employee_id, et.training_id, et.enrollment_date,
                   et.completion_status, et.score, t.training_name, t.certificate, t.training_date
            FROM Employee_Training et
            JOIN Employees e ON et.employee_id = e.employee_id
            JOIN Training t ON et.training_id = t.training_id
            JOIN Users u ON e.user_id = u.user_id
            WHERE et.completion_status = 'completed'
        ");
        $stmt->execute();
        $data['training_certificates'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    if ($shouldFetch('trainings')) {
        $stmt = $con->prepare("
            SELECT t.training_id, t.training_name, t.department_id, t.training_date, t.certificate,
                   t.end_date, d.department_name,
                   DATEDIFF(t.end_date, t.training_date) AS duration_days
            FROM Training t
            LEFT JOIN Department d ON t.department_id = d.department_id
        ");
        $stmt->execute();
        $data['trainings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    if ($shouldFetch('employee_trainings')) {
        $stmt = $con->prepare("
            SELECT et.employee_training_id, et.employee_id, et.training_id, et.enrollment_date,
                   et.completion_status, et.score, t.training_name, t.certificate,
                   CONCAT(u.first_name, ' ', u.last_name) AS employee_name
            FROM Employee_Training et
            JOIN Training t ON et.training_id = t.training_id
            JOIN Employees e ON et.employee_id = e.employee_id
            JOIN Users u ON e.user_id = u.user_id
        ");
        $stmt->execute();
        $data['employee_trainings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    return $data;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    $response = ['success' => false];

    try {
        if ($_POST['action'] === 'refresh_data') {
            $sections = isset($_POST['section']) && $_POST['section'] === 'reports'
                ? ['employees', 'feedback', 'report_avg_ratings', 'report_feedback_types', 'project_assignments', 'projects', 'employee_trainings', 'training_certificates']
                : ['all'];
            $data = fetchData($con, $sections);
            $response['success'] = true;
            $response = array_merge($response, $data);
            echo json_encode($response);
            exit();
        } elseif ($_POST['action'] === 'fetch_leave_applications') {
            $leave_filter = $_POST['leave_filter'] ?? 'ispending';
            $logged_in_employee_id = $_SESSION['employee_id'] ?? null;

            $query = "
                SELECT 
                    l.leave_id AS request_id, 
                    CONCAT(u.first_name, ' ', u.last_name) AS employee_name, 
                    l.leave_start_date, 
                    l.leave_end_date, 
                    l.status,
                    l.leave_reason
                FROM Leaves l
                JOIN Employees e ON l.employee_id = e.employee_id
                JOIN Users u ON e.user_id = u.user_id
                WHERE l.status = ?
            ";
            $params = [$leave_filter];

            if ($logged_in_employee_id) {
                $query .= " AND e.employee_id != ?";
                $params[] = $logged_in_employee_id;
            }

            $stmt = $con->prepare($query);
            $stmt->execute($params);
            $response['leave_applications'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response['success'] = true;
        } elseif ($_POST['action'] === 'fetch_attendance') {
            $employee_id = $_POST['employee_id'] ?? '';
            $start_date = $_POST['start_date'] ?? '';
            $end_date = $_POST['end_date'] ?? '';
            $logged_in_employee_id = $_SESSION['employee_id'] ?? null;

            $query = "
                SELECT 
                    a.employee_id, 
                    CONCAT(u.first_name, ' ', u.last_name) AS employee_name, 
                    d.department_name, 
                    a.check_in, 
                    a.check_out,
                    CASE 
                        WHEN a.status = 'present' THEN 'Present'
                        WHEN a.status = 'absent' THEN 'Absent'
                        ELSE a.status
                    END AS status
                FROM Attendance a
                JOIN Employees e ON a.employee_id = e.employee_id
                JOIN Users u ON e.user_id = u.user_id
                JOIN Department d ON e.department_id = d.department_id
                WHERE 1=1
            ";
            $params = [];

            // Exclude the logged-in Super Admin's own attendance records
            if ($logged_in_employee_id) {
                $query .= " AND a.employee_id != ?";
                $params[] = $logged_in_employee_id;
            }

            if ($employee_id) {
                $query .= " AND a.employee_id = ?";
                $params[] = $employee_id;
            }
            if ($start_date) {
                $query .= " AND DATE(a.check_in) >= ?";
                $params[] = $start_date;
            }
            if ($end_date) {
                $query .= " AND DATE(a.check_out) <= ?";
                $params[] = $end_date;
            }

            $stmt = $con->prepare($query);
            $stmt->execute($params);
            $response['attendance_records'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response['success'] = true;
        } elseif ($_POST['action'] === 'reconsider_leave') {
            $request_id = $_POST['request_id'];
            $stmt = $con->prepare("UPDATE Leaves SET status = 'ispending' WHERE leave_id = ?");
            $stmt->execute([$request_id]);
            $response['success'] = true;
            $response['message'] = "Leave application moved back to pending.";
        } elseif ($_POST['action'] === 'update_leave_status') {
            $request_id = $_POST['request_id'];
            $new_status = $_POST['status'];
            $stmt = $con->prepare("UPDATE Leaves SET status = ?, approved_by = ? WHERE leave_id = ?");
            $stmt->execute([$new_status, $_SESSION['user_id'], $request_id]);
            $response['success'] = true;
            $response['message'] = "Leave application status updated to " . $new_status . ".";
        } elseif ($_POST['action'] === 'fetch_department_metrics') {
            // Fetch all departments
            $stmt = $con->prepare("SELECT department_id, department_name FROM Department");
            $stmt->execute();
            $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $metrics = [];
            foreach ($departments as $dept) {
                $dept_id = $dept['department_id'];
                $metric = [
                    'department_name' => $dept['department_name'],
                    'employee_count' => 0,
                    'projects_completed' => 0,
                    'projects_in_progress' => 0,
                    'projects_assigned' => 0,
                    'tasks_completed' => 0,
                    'trainings_conducted' => 0,
                    'avg_feedback_rating' => 0,
                    'total_leaves_taken' => 0
                ];

                // Number of employees in the department
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Employees e
                    JOIN Users u ON e.user_id = u.user_id
                    WHERE e.department_id = ? AND e.emp_status != 'inactive' AND u.is_active = 1
                ");
                $stmt->execute([$dept_id]);
                $metric['employee_count'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

                // Projects completed
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Projects 
                    WHERE department_id = ? AND project_status = 'Completed'
                ");
                $stmt->execute([$dept_id]);
                $metric['projects_completed'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

                // Projects in progress
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Projects 
                    WHERE department_id = ? AND project_status = 'In Progress'
                ");
                $stmt->execute([$dept_id]);
                $metric['projects_in_progress'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

                // Projects assigned (not started)
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Projects 
                    WHERE department_id = ? AND project_status = 'Assigned'
                ");
                $stmt->execute([$dept_id]);
                $metric['projects_assigned'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

                // Total tasks completed successfully
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Task t
                    JOIN Projects p ON t.project_id = p.project_id
                    WHERE p.department_id = ? AND t.status = 'Completed'
                ");
                $stmt->execute([$dept_id]);
                $metric['tasks_completed'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

                // Trainings conducted
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Training 
                    WHERE department_id = ?
                ");
                $stmt->execute([$dept_id]);
                $metric['trainings_conducted'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

                // Average feedback rating
                $stmt = $con->prepare("
                    SELECT AVG(f.rating) as avg_rating 
                    FROM Feedback f
                    JOIN Employees e ON f.employee_id = e.employee_id
                    WHERE e.department_id = ?
                ");
                $stmt->execute([$dept_id]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                $metric['avg_feedback_rating'] = $result['avg_rating'] ? round($result['avg_rating'], 2) : 0;

                // Total leaves taken (approved)
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Leaves l
                    JOIN Employees e ON l.employee_id = e.employee_id
                    WHERE e.department_id = ? AND l.status = 'approved'
                ");
                $stmt->execute([$dept_id]);
                $metric['total_leaves_taken'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

                $metrics[] = $metric;
            }

            $response['department_metrics'] = $metrics;
            $response['success'] = true;
        } elseif ($_POST['action'] === 'fetch_tasks_status') {
            $stmt = $con->prepare("
                SELECT 
                    t.task_id, 
                    t.task_description, 
                    t.status, 
                    p.project_name,
                    GROUP_CONCAT(CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') AS assigned_employees
                FROM Task t
                JOIN Projects p ON t.project_id = p.project_id
                LEFT JOIN Assignment_Task at ON t.task_id = at.task_id
                LEFT JOIN Employees e ON at.employee_id = e.employee_id
                LEFT JOIN Users u ON e.user_id = u.user_id
                GROUP BY t.task_id, t.task_description, t.status, p.project_name
            ");
            $stmt->execute();
            $response['tasks'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response['success'] = true;
        } elseif ($_POST['action'] === 'fetch_trainings') {
            $data = fetchData($con, ['trainings']);
            $response['success'] = true;
            $response['trainings'] = $data['trainings'] ?? [];
        } elseif ($_POST['action'] === 'fetch_employee_trainings') {
            $training_id = filter_input(INPUT_POST, 'training_id', FILTER_VALIDATE_INT);
            $query = "
                SELECT et.employee_training_id, et.employee_id, et.training_id, et.enrollment_date,
                       et.completion_status, et.score, t.training_name, t.certificate,
                       CONCAT(u.first_name, ' ', u.last_name) AS employee_name
                FROM Employee_Training et
                JOIN Training t ON et.training_id = t.training_id
                JOIN Employees e ON et.employee_id = e.employee_id
                JOIN Users u ON e.user_id = u.user_id
            ";
            $params = [];
            if ($training_id) {
                $query .= " WHERE et.training_id = ?";
                $params[] = $training_id;
            }
            $stmt = $con->prepare($query);
            $stmt->execute($params);
            $response['employee_trainings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response['success'] = true;
        }
	elseif (isset($_POST['action']) && $_POST['action'] === 'fetch_performance_metrics') {
    $out = ['success' => true];

    try {
        // Get the month parameter (expected format: YYYY-MM)
        $month = isset($_POST['month']) ? $_POST['month'] : date('Y-m'); // Default to current month if not provided
        if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
            throw new Exception('Invalid month format. Expected YYYY-MM.');
        }

        // Top 10 trainings completed (Training Champions) - no month filter
        $sql = "
            SELECT e.employee_id, u.first_name, u.last_name,
                   SUM(et.completion_status='Completed') AS completed_trainings
            FROM Employee_Training et
            JOIN Employees e ON et.employee_id=e.employee_id
            JOIN Users u ON e.user_id=u.user_id
            GROUP BY e.employee_id
            ORDER BY completed_trainings DESC
            LIMIT 10
        ";
        $stmt = $con->query($sql);
        $out['training_champions'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate total days in the specified month
        $yearMonth = explode('-', $month);
        $year = (int)$yearMonth[0];
        $monthNum = (int)$yearMonth[1];
        $totalDays = cal_days_in_month(CAL_GREGORIAN, $monthNum, $year); // Total days in the month

        // Top 10 attendance rate for the specified month (Attendance Stars)
        $sql = "
            SELECT e.employee_id, u.first_name, u.last_name,
                   COALESCE(
                       ROUND(
                           SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / :totalDays, 3
                       ), 0
                   ) AS attendance_rate
            FROM Employees e
            LEFT JOIN Attendance a 
                ON e.employee_id = a.employee_id 
                AND DATE_FORMAT(a.check_in, '%Y-%m') = :month
            JOIN Users u ON e.user_id = u.user_id
            GROUP BY e.employee_id, u.first_name, u.last_name
            ORDER BY attendance_rate DESC
            LIMIT 10
        ";

        $stmt = $con->prepare($sql);
        $stmt->execute([
            ':totalDays' => $totalDays,
            ':month' => $month
        ]);
        $out['attendance_stars'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        header('Content-Type: application/json');
        echo json_encode($out);
        exit;
    } catch (Exception $e) {
        $out = ['success' => false, 'error' => 'Error: ' . $e->getMessage()];
        header('Content-Type: application/json');
        echo json_encode($out);
        exit;
    }
}

		// Handle fetch_top_performers (for Top Performers with filters)
		elseif (isset($_POST['action']) && $_POST['action'] === 'fetch_top_performers') {
			$out = ['success' => true];
			$filter = $_POST['filter'] ?? 'tasks_completed';

			try {
				// Base query for joining tables
				$sql = "
					SELECT
 				        e.employee_id,
  					u.first_name,
  					u.last_name,
  					-- count each completed task only once, even if it appears multiple times
  					COUNT(DISTINCT IF(t.status = 'completed', t.task_id, NULL)) AS tasks_completed,
  					-- average feedback is unaffected by the task join
  					AVG(f.rating) AS average_feedback,
  					-- re-use the distinct-count here for your weighted score
  					(
   					 COUNT(DISTINCT IF(t.status = 'completed', t.task_id, NULL)) * 0.6
    					+ AVG(f.rating) * 0.4
  					) AS combined_score
					FROM Employees e
					LEFT JOIN Users u
  						ON e.user_id = u.user_id
					LEFT JOIN Assignment_Task ast
  						ON ast.employee_id = e.employee_id
					LEFT JOIN Task t
  						ON t.task_id = ast.task_id
					LEFT JOIN Feedback f
  						ON f.employee_id = e.employee_id
					GROUP BY e.employee_id	";

				// Order by the selected filter
				if ($filter === 'tasks_completed') {
					$sql .= " ORDER BY tasks_completed DESC";
				} elseif ($filter === 'average_feedback') {
					$sql .= " ORDER BY average_feedback DESC";
				} elseif ($filter === 'combined_score') {
					$sql .= " ORDER BY combined_score DESC";
				}

				$sql .= " LIMIT 10";

				$stmt = $con->query($sql);
				$out['top_performers'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

				header('Content-Type: application/json');
				echo json_encode($out);
				exit;
			} catch (PDOException $e) {
				$out = ['success' => false, 'error' => 'Database error: ' . $e->getMessage()];
				header('Content-Type: application/json');
				echo json_encode($out);
				exit;
			}
		}

    } catch (PDOException $e) {
        $response['error'] = "Database error: " . $e->getMessage();
    }

    echo json_encode($response);
    exit();
}

$data = fetchData($con, ['employees', 'feedback', 'report_avg_ratings', 'report_feedback_types', 'project_assignments', 'projects', 'employee_trainings', 'trainings', 'training_certificates']);
$employees = $data['employees'] ?? [];
$feedback = $data['feedback'] ?? [];
$report_avg_ratings = $data['report_avg_ratings'] ?? [];
$report_feedback_types = $data['report_feedback_types'] ?? [];
$project_assignments = $data['project_assignments'] ?? [];
$projects = $data['projects'] ?? [];
$employee_trainings = $data['employee_trainings'] ?? [];
$trainings = $data['trainings'] ?? [];
$training_certificates = $data['training_certificates'] ?? [];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Admin Dashboard</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <style>
        .alert { padding: 10px; margin: 10px 0; border-radius: 5px; cursor: pointer; }
        .alert-success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .alert-error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #003087; color: #fff; }
        .content { padding: 20px; }
        .dropdown { display: none; opacity: 0; transition: opacity 0.2s; }
        .dropdown.show { display: block; opacity: 1; }
        .reconsider-btn {
            padding: 5px 10px;
            background-color: #ff9800;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        .reconsider-btn:hover { background-color: #e68900; }
        .action-form { display: inline; }
        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 12px;
            font-weight: bold;
            color: black;
            font-size: 12px;
            background-color: #ccc; /* Fallback background color for unknown statuses */
        }
        .status-pending { background-color: #ff9800; }
        .status-approved { background-color: #4caf50; }
        .status-rejected { background-color: #f44336; }
        .status-enrolled { background-color: #2196f3; }
        .status-in_progress { background-color: #ff9800; }
        .status-completed { background-color: #4caf50; }
        .back-btn {
            padding: 8px 15px;
            background-color: #003087;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            margin-top: 10px;
        }
        .back-btn:hover { background-color: #002766; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; }
        .form-group input, .form-group select { width: 100%; padding: 8px; box-sizing: border-box; }
        .button-group { text-align: right; }
        .button-group button { padding: 10px 20px; margin-left: 10px; }
        th i.fas {
            margin-left: 5px;
            vertical-align: middle;
            font-size: 0.9em;
            color: #999999;
        }
        th {
            cursor: pointer;
        }
        th:hover i.fas {
            color: #fff;
        }
        .fas.fa-sort-up, .fas.fa-sort-down {
            color: #fff;
        }
        .status-enrolled, .status-in_progress, .status-completed {
            min-width: 80px; /* Ensure badge is visible even if text is short */
            text-align: center;
        }
    </style>
</head>
<body>
<?php include '../includes/header.php'; ?>
<div class="dashboard-container">
    <?php include '../includes/sidebar_superadmin.php'; ?>
    <div class="content" id="content-area">
        <div id="main-content">
            <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Super Admin'); ?> (Super Admin)</h2>
            <p>You are in the Super Admin dashboard. Select an option from the menu on the left to get started.</p>
        </div>
        <div id="create-user-form" style="display: none;"></div>
        <div id="update-remove-user-section" style="display: none;"></div>
        <div id="profile-update-form" style="display: none;"></div>
        <div id="Department_content" style="display: none;"></div>
        <div id="department-management-section" style="display: none;"></div>
        <div id="audit-logs-section" style="display: none;"></div>

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
                    <h3>Work Summary</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody id="work-summary-table"></tbody>
                    </table>
                </div>
                <div class="report-section">
                    <h3>Training Certificates</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Training Name</th>
                                <th>Training Date</th>
                                <th>Certificate</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody id="training-certificates-table"></tbody>
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
        <div id="attendance-records" style="display: none;" class="card">
            <h2>Attendance Records</h2>
            <div class="form-group">
                <label for="attendance-employee-search">Search Employee:</label>
                <select id="attendance-employee-search">
                    <option value="">All Employees</option>
                    <?php foreach ($employees as $emp): ?>
                        <option value="<?php echo htmlspecialchars($emp['employee_id']); ?>">
                            <?php echo htmlspecialchars($emp['first_name'] . ' ' . $emp['last_name']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="form-group">
                <label for="start-date">Start Date:</label>
                <input type="date" id="start-date">
            </div>
            <div class="form-group">
                <label for="end-date">End Date:</label>
                <input type="date" id="end-date">
            </div>
            <div class="form-group button-group">
                <button type="button" id="fetch-attendance-btn">Fetch Attendance</button>
            </div>
            <table id="attendance-table">
                <thead>
                    <tr>
                        <th>Employee Name <i class="fas fa-sort"></i></th>
                        <th>Department <i class="fas fa-sort"></i></th>
                        <th>Check In <i class="fas fa-sort"></i></th>
                        <th>Check Out <i class="fas fa-sort"></i></th>
                        <th>Status <i class="fas fa-sort"></i></th>
                    </tr>
                </thead>
                <tbody id="attendance-table-body"></tbody>
            </table>
            <button class="back-btn" onclick="showWelcomeMessage()">Back</button>
            <button button type="button" id="downloadExcelBtn" style="padding: 8px 12px; margin-left: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;" 
                    onmouseover="this.style.backgroundColor='#218838'" 
                    onmouseout="this.style.backgroundColor='#28a745'"
onclick="downloadAttendanceAsExcel()">Download as Excel</button>
        </div>
        <div id="leave-requests" style="display: none;" class="card">
            <h2>Leave Requests</h2>
            <div class="form-group">
                <label for="leave-filter">Filter by Status:</label>
                <select id="leave-filter">
                    <option value="ispending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
            <div class="form-group button-group">
                <button type="button" id="fetch-leave-btn">Fetch Leave Requests</button>
            </div>
            <table id="leave-table">
                <thead>
                    <tr>
                        <th>Employee Name</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="leave-table-body"></tbody>
            </table>
            <button class="back-btn" onclick="showWelcomeMessage()">Back</button>
            <button button type="button" id="downloadExcelBtn" style="padding: 8px 12px; margin-left: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;" 
                    onmouseover="this.style.backgroundColor='#218838'" 
                    onmouseout="this.style.backgroundColor='#28a745'" onclick="downloadLeaveRequestsAsExcel()">Download as Excel</button>
        </div>
        <div id="department-metrics" style="display: none;" class="card">
    <h2>Department-wise Performance Metrics</h2>
    <div style="overflow-x: auto;">
        <table id="department-metrics-table" style="min-width: 1000px;">
            <thead>
                <tr>
                    <th>Department Name <i class="fas fa-sort"></i></th>
                    <th>Employee Count <i class="fas fa-sort"></i></th>
                    <th>Projects Completed <i class="fas fa-sort"></i></th>
                    <th>Projects In Progress <i class="fas fa-sort"></i></th>
                    <th>Projects Assigned <i class="fas fa-sort"></i></th>
                    <th>Tasks Completed <i class="fas fa-sort"></i></th>
                    <th>Trainings Conducted <i class="fas fa-sort"></i></th>
                    <th>Avg Feedback Rating <i class="fas fa-sort"></i></th>
                    <th>Total Leaves Taken <i class="fas fa-sort"></i></th>
                </tr>
            </thead>
            <tbody id="department-metrics-table-body"></tbody>
        </table>
    </div>
    <button class="back-btn" onclick="showWelcomeMessage()">Back</button>
</div>
        <div id="training-programs" style="display: none;" class="card">
            <h2>Training Programs</h2>
            <table id="training-table">
                <thead>
                    <tr>
                        <th>Training Name <i class="fas fa-sort"></i></th>
                        <th>Department <i class="fas fa-sort"></i></th>
                        <th>Start Date <i class="fas fa-sort"></i></th>
                        <th>End Date <i class="fas fa-sort"></i></th>
                        <th>Duration (Days) <i class="fas fa-sort"></i></th>
                        <th>Certificate <i class="fas fa-sort"></i></th>
                    </tr>
                </thead>
                <tbody id="training-table-body"></tbody>
            </table>
            <button class="back-btn" onclick="showWelcomeMessage()">Back</button>
            <button button type="button" id="downloadExcelBtn" style="padding: 8px 12px; margin-left: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;" 
                    onmouseover="this.style.backgroundColor='#218838'" 
                    onmouseout="this.style.backgroundColor='#28a745'" onclick="downloadTrainingProgramsAsExcel()" >Download Trainging data</button>
        </div>
        <div id="training-assignments" style="display: none;" class="card">
            <h2>Training Assignments</h2>
            <div class="form-group">
                <label for="training-assignments-filter">Filter by Training:</label>
                <select id="training-assignments-filter">
                    <option value="">All Trainings</option>
                    <?php foreach ($data['trainings'] ?? [] as $training): ?>
                        <option value="<?php echo htmlspecialchars($training['training_id']); ?>">
                            <?php echo htmlspecialchars($training['training_name']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="form-group button-group">
                <button type="button" id="fetch-training-assignments-btn">Fetch Assignments</button>
            </div>
            <table id="training-assignments-table">
                <thead>
                    <tr>
                        <th>Training Name <i class="fas fa-sort"></i></th>
                        <th>Employee Name <i class="fas fa-sort"></i></th>
                        <th>Enrollment Date <i class="fas fa-sort"></i></th>
                        <th>Status <i class="fas fa-sort"></i></th>
                        <th>Score <i class="fas fa-sort"></i></th>
                        <th>Certificate Name</th>
                    </tr>
                </thead>
                <tbody id="training-assignments-table-body"></tbody>
            </table>
            <button class="back-btn" onclick="showWelcomeMessage()">Back</button>
        </div>
        <div id="project-overview-section" class="report-section" style="display: none;">
                <h3>Track Project Status</h3>
                <div class="report-filter">
                    <div class="form-group">
                        <label for="project-status-filter">Filter by Status:</label>
                        <select id="project-status-filter">
                            <option value="">All</option>
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                        </select>
                    </div>
                </div>
                <div id="project-overview-summary" class="report-summary">
                    <p>Total Projects: <span id="total-projects">0</span></p>
                    <p>Overdue Projects: <span id="overdue-projects">0</span></p>
                </div>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Status</th>
                            <th>Start Date</th>
                            <th>Expected End Date</th>
                            <th>Department</th>
                        </tr>
                    </thead>
                    <tbody id="project-overview-table"></tbody>
                </table>
            </div>
	<div id="performance-metrics-section" style="display: none;">
  <h2>Performance Metrics</h2>
  <ul class="perf-tabs">
    <li class="active" data-target="top-performers-section">Top Performers</li>
    <li data-target="training-champions-section">Training Champions</li>
    <li data-target="attendance-stars-section">Attendance Stars</li>
  </ul>

  <div id="top-performers-section" class="perf-pane" style="display: block;">
    <h3>Top 10 Performers</h3>
    <label>Show top by: </label>
    <select id="top-performers-filter" onchange="updateTopPerformers()">
      <option value="tasks_completed">Tasks Completed</option>
      <option value="average_feedback">Average Feedback</option>
      <option value="combined_score">Combined Score</option>
    </select>
    <table id="top-performers-table">
      <thead>
        <tr>
          <th>Name</th>
          <th id="top-performers-metric">Tasks Completed</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>

  <div id="training-champions-section" class="perf-pane" style="display: none;">
    <h3>Training Champions</h3>
    <table id="training-champions-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Completed Trainings</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>

<div id="attendance-stars-section" class="perf-pane" style="display: none;">
  <h3>Attendance Stars</h3>
  <label>Select Month: </label>
  <select id="attendance-month-filter" onchange="fetchOtherMetrics()">
    <option value="2025-04">April 2025</option>
    <option value="2025-03">March 2025</option>
    <option value="2025-02">February 2025</option>
    <!-- Add more months as needed -->
  </select>
  <table id="attendance-stars-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Attendance Rate</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div>

  <button class="back-btn" onclick="showWelcomeMessage()">Back</button>
</div>
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
    const projectAssignments = <?php echo json_encode($project_assignments); ?>;
    const projects = <?php echo json_encode($projects); ?>;
    const employeeTrainings = <?php echo json_encode($data['employee_trainings'] ?? []); ?>;
    const trainings = <?php echo json_encode($data['trainings'] ?? []); ?>;
    const trainingCertificates = <?php echo json_encode($data['training_certificates'] ?? []); ?>;
    const departments = <?php echo json_encode($departments ?: []); ?>;
    const employeesadmin = <?php echo json_encode($employeesadmin ?: []); ?>;
    let filteredEmployees = [];
    console.log(employeesadmin);
</script>
<script src="../assets/js/superadmin_dashboard.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
</body>
</html>