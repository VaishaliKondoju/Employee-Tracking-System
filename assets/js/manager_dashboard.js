// manager_dashboard.js

// Centralized function to manage section visibility
function showSection(sectionToShowId) {
  const sections = [
    'main-content',
    'profile-update-form',
    'Department_content',
    'reports-analytics',
    'projects-section',
    'assign-employees-section',
    'subtasks-section',
    'project-assignments-section',
    'edit-assignment-section',
  ];

  const mainContent = document.getElementById('content-area');
  if (!mainContent) {
    console.error('content-area not found');
    return false;
  }

  // Hide all sections
  sections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = 'none';
    }
  });

  // Show the content-area and the specified section
  mainContent.style.display = 'block';
  const sectionToShow = document.getElementById(sectionToShowId);
  if (sectionToShow) {
    sectionToShow.style.display = 'block';
  } else {
    console.error(`${sectionToShowId} not found`);
    return false;
  }

  return true;
}

function refreshData(callback) {
  fetch('manager_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=refresh_data',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.employees = data.employees || employees;
        window.feedback = data.feedback || feedback;
        window.reportAvgRatings = data.report_avg_ratings || reportAvgRatings;
        window.reportFeedbackTypes =
          data.report_feedback_types || reportFeedbackTypes;
        window.projects = data.projects || projects;
        window.tasks = data.tasks || tasks;
        window.projectAssignments =
          data.project_assignments || projectAssignments;
        window.employeeTrainings = data.employee_trainings || employeeTrainings;
        console.log('Project Assignments:', window.projectAssignments);
        console.log('Employee Trainings:', window.employeeTrainings);
        if (callback) callback();
      } else {
        showError(data.error || 'Failed to refresh data');
      }
    })
    .catch((error) => showError('Network error: ' + error.message));
}

function refreshTasksData(projectId, callback) {
  // Ensure the request body uses the correct separator
  const requestBody = 'action=refresh_data&section=tasks';

  console.log('refreshTasksData - Request body:', requestBody);

  fetch('manager_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: requestBody,
  })
    .then((response) => {
      console.log('refreshTasksData - Response status:', response.status);
      if (!response.ok) {
        response.text().then((text) => {
          console.error('refreshTasksData - Response text:', text);
        });
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('refreshTasksData - Server response:', data);
      if (data.success) {
        window.tasks = data.tasks || [];
        window.projectAssignments = data.project_assignments || [];
        console.log('refreshTasksData - Updated tasks:', window.tasks);
        console.log(
          'refreshTasksData - Updated projectAssignments:',
          window.projectAssignments
        );
        if (callback) callback(projectId);
      } else {
        showError(
          data.error || 'Failed to refresh tasks data',
          'subtasks-section'
        );
      }
    })
    .catch((error) => {
      console.error('refreshTasksData - Fetch error:', error);
      showError('Network error: ' + error.message, 'subtasks-section');
    });
}

document.addEventListener('DOMContentLoaded', function () {
  refreshData();
});

function showError(message, containerId = 'profile-update-form') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML =
      `<div class="alert alert-error">${message}</div>` + container.innerHTML;
  }
}

function showSuccess(message, containerId = 'profile-update-form') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML =
      `<div class="alert alert-success">${message}</div>` + container.innerHTML;
    setTimeout(() => {
      const successDiv = container.querySelector('.alert-success');
      if (successDiv) successDiv.remove();
    }, 3000);
  }
}

function showProfileForm() {
  if (!showSection('profile-update-form')) return;

  const profileUpdateForm = document.getElementById('profile-update-form');

  if (employees.length === 0) {
    profileUpdateForm.innerHTML = `
            <div class="card">
                <h2>Employees Assigned to Me</h2>
                <p>No employees are currently assigned to you.</p>
                <div class="form-group button-group">
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            </div>
        `;
    return;
  }

  let employeesTableHTML = `
        <div class="card">
            <h2>Employees Assigned to Me</h2>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Employee Name</th>
                        <th>Job Title</th>
                        <th>Email</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;

  employees.forEach((emp) => {
    employeesTableHTML += `
            <tr>
                <td>${emp.first_name} ${emp.last_name}</td>
                <td>${emp.emp_job_title || 'N/A'}</td>
                <td>${emp.email || 'N/A'}</td>
                <td>${emp.emp_status || 'N/A'}</td>
            </tr>
        `;
  });

  employeesTableHTML += `
                </tbody>
            </table>
            <div class="form-group button-group">
                <button type="button" onclick="showWelcomeMessage(event)">Back</button>
            </div>
        </div>
    `;

  profileUpdateForm.innerHTML = employeesTableHTML;
}

function showFeedbackForm() {
  if (!showSection('profile-update-form')) return;

  const profileUpdateForm = document.getElementById('profile-update-form');

  if (employees.length === 0) {
    profileUpdateForm.innerHTML = `
            <div class="card">
                <h2>Give Feedback to Employee</h2>
                <p>No employees assigned to you.</p>
                <div class="form-group button-group">
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            </div>
        `;
    return;
  }

  profileUpdateForm.innerHTML = `
        <div class="card">
            <h2>Give Feedback to Employee</h2>
            <form id="feedbackForm" method="POST">
                <div class="form-group">
                    <label for="employee_id">Employee:</label>
                    <select id="employee_id" name="employee_id" required>
                        <option value="">Select an employee</option>
                        ${employees
                          .filter(
                            (emp) =>
                              emp.manager_id ==
                              sessionStorage.getItem('employee_id')
                          )
                          .map(
                            (emp) =>
                              `<option value="${emp.employee_id}">${emp.first_name} ${emp.last_name} (${emp.emp_job_title})</option>`
                          )
                          .join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="rating">Rating (1-5):</label>
                    <input type="number" id="rating" name="rating" min="1" max="5" required>
                </div>
                <div class="form-group">
                    <label for="feedback_type">Feedback Type:</label>
                    <select id="feedback_type" name="feedback_type" required>
                        <option value="Performance">Performance</option>
                        <option value="Behavior">Behavior</option>
                        <option value="Project">Project</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="feedback_text">Feedback Details:</label>
                    <textarea id="feedback_text" name="feedback_text" rows="4" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;"></textarea>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Submit Feedback</button>
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            </form>
        </div>
    `;

  const form = document.getElementById('feedbackForm');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validateFeedbackForm(this)) return;

      fetch('../pages/features/manage_feedback.php', {
        method: 'POST',
        body: new FormData(this),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            fetch('../pages/features/fetch_feedback.php')
              .then((response) => response.json())
              .then((updatedFeedback) => {
                feedback.length = 0;
                updatedFeedback.forEach((fb) => feedback.push(fb));
                if (
                  confirm(
                    'Feedback submitted successfully! Would you like to view the feedback history?'
                  )
                ) {
                  showFeedbackHistory();
                } else {
                  form.reset();
                }
              })
              .catch((error) =>
                showError('Error updating feedback data: ' + error.message)
              );
          } else {
            showError(data.error || 'Failed to submit feedback');
          }
        })
        .catch((error) => showError('Network error: ' + error.message));
    });
  }
}

function validateFeedbackForm(form) {
  const rating = form.querySelector('#rating').value;
  if (rating < 1 || rating > 5) {
    alert('Rating must be between 1 and 5.');
    return false;
  }
  return true;
}

function renderFeedbackTable(selectedEmployeeId) {
  const selectedId = selectedEmployeeId ? String(selectedEmployeeId) : '';
  let filteredFeedback = feedback;
  if (selectedId) {
    filteredFeedback = feedback.filter(
      (f) => String(f.employee_id) === selectedId
    );
  }

  let tableHTML = `
      <table class="report-table">
          <thead>
              <tr>
                  <th>Employee</th>
                  <th>Rating</th>
                  <th>Type</th>
                  <th>Feedback</th>
                  <th>Date Submitted</th>
              </tr>
          </thead>
          <tbody>
  `;

  if (filteredFeedback.length === 0) {
    tableHTML += `
          <tr>
              <td colspan="5">No feedback available.</td>
          </tr>
      `;
  } else {
    filteredFeedback.forEach((f) => {
      tableHTML += `
              <tr>
                  <td>${f.first_name} ${f.last_name}</td>
                  <td>${f.rating || 'N/A'}</td>
                  <td>${f.feedback_type || 'N/A'}</td>
                  <td>${f.feedback_text || 'N/A'}</td>
                  <td>${f.date_submitted || 'N/A'}</td>
              </tr>
          `;
    });
  }

  tableHTML += `</tbody></table>`;
  return tableHTML;
}

function showFeedbackHistory() {
  if (!showSection('profile-update-form')) return;

  const profileUpdateForm = document.getElementById('profile-update-form');

  let feedbackTableHTML = `
        <div class="card">
            <h2>Feedback History</h2>
            <div class="form-group">
                <label for="employee-filter">Filter by Employee:</label>
                <select id="employee-filter">
                    <option value="">All Employees</option>
                    ${employees
                      .filter(
                        (emp) =>
                          emp.manager_id ==
                          sessionStorage.getItem('employee_id')
                      )
                      .map(
                        (emp) =>
                          `<option value="${emp.employee_id}">${emp.first_name} ${emp.last_name}</option>`
                      )
                      .join('')}
                </select>
            </div>
            <div id="feedback-table-container">
                ${renderFeedbackTable('')}
            </div>
            <div class="form-group button-group">
                <button type="button" onclick="showWelcomeMessage(event)">Back</button>
            </div>
        </div>
    `;

  profileUpdateForm.innerHTML = feedbackTableHTML;

  const employeeFilter = document.getElementById('employee-filter');
  const tableContainer = document.getElementById('feedback-table-container');
  if (employeeFilter && tableContainer) {
    employeeFilter.addEventListener('change', function () {
      tableContainer.innerHTML = renderFeedbackTable(this.value);
    });
  }
}

function showReportsAnalytics() {
  const reportContent = document.getElementById('report-content');
  if (!reportContent || !showSection('reports-analytics')) return;

  reportContent.style.display = 'none';

  const generateReportBtn = document.getElementById('generate-report-btn');
  const employeeSearch = document.getElementById('employee-search');
  if (generateReportBtn && employeeSearch) {
    generateReportBtn.addEventListener('click', function () {
      const selectedEmployeeId = employeeSearch.value;
      if (!selectedEmployeeId) {
        alert('Please select an employee to generate the report.');
        return;
      }

      const filteredAvgRatings = reportAvgRatings.filter(
        (report) => String(report.employee_id) === selectedEmployeeId
      );
      const filteredFeedback = feedback.filter(
        (fb) => String(fb.employee_id) === selectedEmployeeId
      );
      const filteredFeedbackTypes = reportFeedbackTypes
        .filter((type) => {
          const typeFeedback = filteredFeedback.filter(
            (fb) => fb.feedback_type === type.feedback_type
          );
          return typeFeedback.length > 0;
        })
        .map((type) => ({
          feedback_type: type.feedback_type,
          type_count: filteredFeedback.filter(
            (fb) => fb.feedback_type === type.feedback_type
          ).length,
        }));
      const filteredAssignments = projectAssignments.filter(
        (assignment) => String(assignment.employee_id) === selectedEmployeeId
      );
      const filteredTrainings = employeeTrainings.filter(
        (training) => String(training.employee_id) === selectedEmployeeId
      );

      const avgRatingsTable = document.getElementById('avg-ratings-table');
      avgRatingsTable.innerHTML = '';
      if (filteredAvgRatings.length === 0) {
        avgRatingsTable.innerHTML = `<tr><td colspan="3">No feedback data available for this employee.</td></tr>`;
      } else {
        filteredAvgRatings.forEach((report) => {
          const row = document.createElement('tr');
          row.innerHTML = `
                        <td>${report.first_name} ${report.last_name}</td>
                        <td>${parseFloat(report.avg_rating).toFixed(2)}</td>
                        <td>${report.feedback_count}</td>
                    `;
          avgRatingsTable.appendChild(row);
        });
      }

      const feedbackTypesTable = document.getElementById(
        'feedback-types-table'
      );
      feedbackTypesTable.innerHTML = '';
      if (filteredFeedbackTypes.length === 0) {
        feedbackTypesTable.innerHTML = `<tr><td colspan="2">No feedback data available for this employee.</td></tr>`;
      } else {
        filteredFeedbackTypes.forEach((report) => {
          const row = document.createElement('tr');
          row.innerHTML = `
                        <td>${report.feedback_type}</td>
                        <td>${report.type_count}</td>
                    `;
          feedbackTypesTable.appendChild(row);
        });
      }

      const workSummaryTable = document.getElementById('work-summary-table');
      workSummaryTable.innerHTML = '';
      if (filteredFeedback.length === 0 && filteredAssignments.length === 0) {
        workSummaryTable.innerHTML = `<tr><td colspan="2">No work summary available for this employee.</td></tr>`;
      } else {
        if (filteredFeedback.length > 0) {
          const feedbackSummary = filteredFeedback
            .map(
              (fb) =>
                `${fb.feedback_type}: ${fb.feedback_text} (Rating: ${fb.rating}, Date: ${fb.date_submitted})`
            )
            .join('; ');
          const row = document.createElement('tr');
          row.innerHTML = `
                        <td>Feedback</td>
                        <td>${feedbackSummary}</td>
                    `;
          workSummaryTable.appendChild(row);
        }
        if (filteredAssignments.length > 0) {
          const projectSummary = filteredAssignments
            .map(
              (assignment) =>
                `${assignment.project_name} (Role: ${assignment.role_in_project})`
            )
            .join('; ');
          const row = document.createElement('tr');
          row.innerHTML = `
                        <td>Projects</td>
                        <td>${projectSummary}</td>
                    `;
          workSummaryTable.appendChild(row);
        }
      }

      const trainingTable = document.getElementById(
        'training-certificates-table'
      );
      trainingTable.innerHTML = '';
      if (filteredTrainings.length === 0) {
        trainingTable.innerHTML = `<tr><td colspan="4">No training certificates available for this employee.</td></tr>`;
      } else {
        filteredTrainings.forEach((training) => {
          const row = document.createElement('tr');
          row.innerHTML = `
                        <td>${training.training_name}</td>
                        <td>${training.training_date || 'N/A'}</td>
                        <td>${training.certificate || 'N/A'}</td>
                        <td>${training.score || 'N/A'}</td>
                    `;
          trainingTable.appendChild(row);
        });
      }

      const feedbackSummaryTable = document.getElementById(
        'feedback-summary-table'
      );
      feedbackSummaryTable.innerHTML = '';
      if (filteredFeedback.length === 0) {
        feedbackSummaryTable.innerHTML = `<tr><td colspan="5">No feedback data available for this employee.</td></tr>`;
      } else {
        filteredFeedback.forEach((fb) => {
          const row = document.createElement('tr');
          row.innerHTML = `
                        <td>${fb.first_name} ${fb.last_name}</td>
                        <td>${fb.rating}</td>
                        <td>${fb.feedback_type}</td>
                        <td>${fb.feedback_text}</td>
                        <td>${fb.date_submitted}</td>
                    `;
          feedbackSummaryTable.appendChild(row);
        });
      }

      reportContent.style.display = 'block';
    });
  }

  const initializeDownloadPdf = () => {
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', function () {
        const reportContent = document.getElementById('report-content');
        if (!reportContent) {
          showError(
            'Report content not found. Please generate the report first.'
          );
          return;
        }

        if (
          typeof html2canvas === 'undefined' ||
          typeof window.jspdf === 'undefined'
        ) {
          showError('PDF libraries not loaded.');
          return;
        }

        downloadPdfBtn.style.display = 'none';
        html2canvas(reportContent, { scale: 2 })
          .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let position = 10;
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            let remainingHeight = imgHeight;
            while (remainingHeight > pageHeight - 20) {
              pdf.addPage();
              position = 10;
              remainingHeight -= pageHeight - 20;
              pdf.addImage(
                imgData,
                'PNG',
                10,
                position - remainingHeight,
                imgWidth,
                imgHeight
              );
            }

            const selectedEmployee =
              employeeSearch.options[employeeSearch.selectedIndex].text;
            pdf.save(
              `Employee_Report_${selectedEmployee}_${
                new Date().toISOString().split('T')[0]
              }.pdf`
            );
            downloadPdfBtn.style.display = 'block';
          })
          .catch((error) => {
            showError('Failed to generate PDF: ' + error.message);
            downloadPdfBtn.style.display = 'block';
          });
      });
    }
  };

  if (
    typeof html2canvas !== 'undefined' &&
    typeof window.jspdf !== 'undefined'
  ) {
    initializeDownloadPdf();
  } else {
    const loadHtml2Canvas = new Promise((resolve, reject) => {
      if (typeof html2canvas !== 'undefined') return resolve();
      loadScript('../assets/js/html2canvas.min.js', (error) =>
        error ? reject(error) : resolve()
      );
    });
    const loadJsPDF = new Promise((resolve, reject) => {
      if (typeof window.jspdf !== 'undefined') return resolve();
      loadScript('../assets/js/jspdf.umd.min.js', (error) =>
        error ? reject(error) : resolve()
      );
    });
    Promise.all([loadHtml2Canvas, loadJsPDF])
      .then(initializeDownloadPdf)
      .catch((error) =>
        showError('Failed to load PDF libraries: ' + error.message)
      );
  }
}

// Show Assign Employees Form
function showAssignEmployees() {
  if (!showSection('assign-employees-section')) return;

  const form = document.getElementById('assign-employees-form');
  const projectSelect = document.getElementById('project_id');
  const employeeSelect = document.getElementById('employee_id');

  if (!form || !projectSelect || !employeeSelect) {
    console.error('Assign employees form elements not found');
    showError('Form setup error', 'assign-employees-section');
    return;
  }

  // Reset form
  form.reset();

  // Populate project dropdown
  projectSelect.innerHTML = '<option value="">Select a project</option>';
  if (window.projects && window.projects.length > 0) {
    window.projects.forEach((project) => {
      projectSelect.innerHTML += `<option value="${project.project_id}">${project.project_name}</option>`;
    });
  }

  // Function to populate employee dropdown based on selected project
  function populateEmployeeDropdown(selectedProjectId = '') {
    employeeSelect.innerHTML = '<option value="">Select an employee</option>';

    // Filter employees under the manager who are not assigned to the selected project
    const managerId = sessionStorage.getItem('employee_id');
    const assignedEmployeeIds = selectedProjectId
      ? (window.projectAssignments || [])
          .filter((assignment) => assignment.project_id == selectedProjectId)
          .map((assignment) => assignment.employee_id)
      : [];

    const availableEmployees = (window.employees || []).filter(
      (emp) =>
        emp.manager_id == managerId && // Employees under the manager
        !assignedEmployeeIds.includes(emp.employee_id) // Not already assigned to the project
    );

    if (availableEmployees.length === 0) {
      employeeSelect.innerHTML +=
        '<option value="">No available employees</option>';
      employeeSelect.disabled = true;
    } else {
      availableEmployees.forEach((emp) => {
        employeeSelect.innerHTML += `<option value="${emp.employee_id}">${emp.first_name} ${emp.last_name}</option>`;
      });
      employeeSelect.disabled = false;
    }
  }

  // Initial employee dropdown population
  populateEmployeeDropdown();

  // Update employee dropdown when project changes
  projectSelect.addEventListener('change', () => {
    populateEmployeeDropdown(projectSelect.value);
  });

  // Handle form submission
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    fetch('../pages/features/manage_assignments.php', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showSuccess(
            'Employee assigned to project successfully!',
            'assign-employees-section'
          );
          refreshData(() => {
            form.reset();
            populateEmployeeDropdown(); // Ensure this is called after refresh
            const projectSelectView =
              document.getElementById('project_id_view');
            if (projectSelectView) {
              renderAssignmentsTable(projectSelectView.value);
            }
          });
        } else {
          showError(
            data.error || 'Failed to assign employee',
            'assign-employees-section'
          );
        }
      })
      .catch((error) =>
        showError('Network error: ' + error.message, 'assign-employees-section')
      );
  });
}

// Show Assigned Employees Section (View/Edit Project Assignments)
function showAssignedEmployeesSection() {
  if (!showSection('project-assignments-section')) return;

  const projectSelect = document.getElementById('project_id_view');
  const assignmentsTable = document.getElementById('assignments-table');

  if (!projectSelect || !assignmentsTable) {
    console.error('Project assignments elements not found');
    showError('Section setup error', 'project-assignments-section');
    return;
  }

  // Ensure data is loaded before proceeding
  refreshData(() => {
    // Store the current selected value (if any) to maintain state
    const selectedProjectId = projectSelect.value || '';

    // Populate project dropdown
    projectSelect.innerHTML = '<option value="">Select a project</option>';
    if (window.projects && window.projects.length > 0) {
      window.projects.forEach((project) => {
        const option = document.createElement('option');
        option.value = project.project_id;
        option.textContent = project.project_name;
        if (project.project_id === selectedProjectId) {
          option.selected = true;
        }
        projectSelect.appendChild(option);
      });
    }

    // Remove any existing change event listeners to prevent duplicates
    const newProjectSelect = projectSelect.cloneNode(true);
    projectSelect.parentNode.replaceChild(newProjectSelect, projectSelect);

    // Update reference to the new projectSelect
    const updatedProjectSelect = document.getElementById('project_id_view');

    // Add a single change event listener
    updatedProjectSelect.addEventListener('change', () => {
      renderAssignmentsTable(updatedProjectSelect.value);
    });

    // Initial table render with the maintained selected project ID
    renderAssignmentsTable(selectedProjectId);
  });
}

// Edit Assignment
function editAssignment(assignmentId) {
  if (!showSection('edit-assignment-section')) return;

  const assignment = window.projectAssignments.find(
    (a) => a.assignment_id == assignmentId
  );
  if (!assignment) {
    showError('Assignment not found', 'edit-assignment-section');
    return;
  }

  // Populate the edit form
  document.getElementById('assignment_id').value = assignment.assignment_id;
  document.getElementById('edit_project_id').value =
    assignment.project_name || 'N/A';
  document.getElementById('edit_employee_id').value =
    `${assignment.first_name} ${assignment.last_name}` || 'N/A';
  document.getElementById('edit_role_in_project').value =
    assignment.role_in_project || '';

  // Handle form submission
  const form = document.getElementById('edit-assignment-form');
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    formData.append('action', 'update');
    formData.append('assignment_id', assignmentId);

    fetch('../pages/features/manage_assignments.php', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showSuccess(
            'Assignment updated successfully!',
            'edit-assignment-section'
          );
          refreshData(() => {
            showAssignedEmployeesSection(); // Go back to the assignments table
          });
        } else {
          showError(
            data.error || 'Failed to update assignment',
            'edit-assignment-section'
          );
        }
      })
      .catch((error) =>
        showError('Network error: ' + error.message, 'edit-assignment-section')
      );
  });
}

// Delete Assignment
function deleteAssignment(assignmentId) {
  if (
    !confirm('Are you sure you want to remove this employee from the project?')
  )
    return;

  const formData = new FormData();
  formData.append('action', 'delete');
  formData.append('assignment_id', assignmentId);

  fetch('../pages/features/manage_assignments.php', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showSuccess(
          'Employee removed from project successfully!',
          'project-assignments-section'
        );
        refreshData(() => {
          // Reinitialize the entire section to ensure dropdown and table are in sync
          showAssignedEmployeesSection();
          // Refresh the employee dropdown in the assign form
          const assignProjectSelect = document.getElementById('project_id');
          if (assignProjectSelect) {
            const populateEmployeeDropdown = () => {
              const employeeSelect = document.getElementById('employee_id');
              employeeSelect.innerHTML =
                '<option value="">Select an employee</option>';
              const managerId = sessionStorage.getItem('employee_id');
              const assignedEmployeeIds = assignProjectSelect.value
                ? (window.projectAssignments || [])
                    .filter(
                      (assignment) =>
                        assignment.project_id == assignProjectSelect.value
                    )
                    .map((assignment) => assignment.employee_id)
                : [];
              const availableEmployees = (window.employees || []).filter(
                (emp) =>
                  emp.manager_id == managerId &&
                  !assignedEmployeeIds.includes(emp.employee_id)
              );
              if (availableEmployees.length === 0) {
                employeeSelect.innerHTML +=
                  '<option value="">No available employees</option>';
                employeeSelect.disabled = true;
              } else {
                availableEmployees.forEach((emp) => {
                  employeeSelect.innerHTML += `<option value="${emp.employee_id}">${emp.first_name} ${emp.last_name}</option>`;
                });
                employeeSelect.disabled = false;
              }
            };
            populateEmployeeDropdown();
          }
        });
      } else {
        showError(
          data.error || 'Failed to delete assignment',
          'project-assignments-section'
        );
      }
    })
    .catch((error) =>
      showError(
        'Network error: ' + error.message,
        'project-assignments-section'
      )
    );
}

// Fetch updated assignments after an action (e.g., assign, edit, delete)
function fetchUpdatedAssignments(successMessage = '') {
  fetch('manager_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=refresh_data',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        window.projectAssignments = data.project_assignments || [];
        showAssignedEmployeesSection();
        const projectSelect = document.getElementById('project_id_view');
        const selectedProjectId = projectSelect ? projectSelect.value : '';
        renderAssignmentsTable(selectedProjectId);
        if (!!successMessage) {
          showSuccess(successMessage, 'project-assignments-section');
        }
      } else {
        showError(
          data.error || 'Failed to fetch updated assignments',
          'project-assignments-section'
        );
      }
    })
    .catch((error) =>
      showError(
        'Network error: ' + error.message,
        'project-assignments-section'
      )
    );
}

function loadScript(url, callback) {
  const script = document.createElement('script');
  script.src = url;
  script.onload = () => callback();
  script.onerror = () => callback(new Error(`Failed to load script: ${url}`));
  document.head.appendChild(script);
}

function renderAssignmentsTable(selectedProjectId) {
  const assignmentsTable = document.getElementById('assignments-table');
  if (!assignmentsTable) return;

  assignmentsTable.innerHTML = '';

  // Ensure projectAssignments is defined, fallback to empty array if undefined
  let filteredAssignments = window.projectAssignments || [];

  // Log for debugging
  console.log(
    'renderAssignmentsTable - selectedProjectId:',
    selectedProjectId,
    'Type:',
    typeof selectedProjectId
  );
  console.log(
    'renderAssignmentsTable - projectAssignments:',
    filteredAssignments
  );

  // If no project is selected, show all assignments
  if (selectedProjectId) {
    filteredAssignments = filteredAssignments.filter((assignment) => {
      const projectIdMatch =
        String(assignment.project_id) === String(selectedProjectId);
      console.log(
        `Comparing assignment.project_id (${
          assignment.project_id
        }, type: ${typeof assignment.project_id}) ` +
          `with selectedProjectId (${selectedProjectId}, type: ${typeof selectedProjectId}) ` +
          `Result: ${projectIdMatch}`
      );
      return projectIdMatch;
    });
  }

  // Check if filteredAssignments is empty or undefined
  if (!filteredAssignments || filteredAssignments.length === 0) {
    assignmentsTable.innerHTML = `<tr><td colspan="4">No assignments found for this project.</td></tr>`;
  } else {
    filteredAssignments.forEach((assignment) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${assignment.project_name || 'N/A'}</td>
        <td>${assignment.first_name} ${assignment.last_name}</td>
        <td>${assignment.role_in_project || 'N/A'}</td>
        <td>
          <button onclick="editAssignment(${
            assignment.assignment_id
          })">Edit</button>
          <button onclick="deleteAssignment(${
            assignment.assignment_id
          })">Delete</button>
        </td>
      `;
      assignmentsTable.appendChild(row);
    });
  }
}

// Show Projects Section
function showProjects() {
  if (!showSection('projects-section')) return;

  const projectsTable = document.getElementById('projects-table');
  if (!projectsTable) {
    console.error('projects-table not found');
    return;
  }

  projectsTable.innerHTML = '';
  if (!window.projects || window.projects.length === 0) {
    projectsTable.innerHTML = `<tr><td colspan="6">No active projects found.</td></tr>`;
  } else {
    window.projects.forEach((project) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${project.project_name || 'N/A'}</td>
        <td>${project.project_status || 'N/A'}</td>
        <td>$${parseFloat(project.budget || 0).toFixed(2)}</td>
        <td>${project.start_date || 'N/A'}</td>
        <td>${project.expected_end_date || 'N/A'}</td>
        <td>${project.client_name || 'N/A'}</td>
      `;
      projectsTable.appendChild(row);
    });
  }
}

function addexitinterview() {
  if (!showSection('profile-update-form')) return;

  const profileUpdateForm = document.getElementById('profile-update-form');

  const managerId = sessionStorage.getItem('employee_id');
  const assignedEmployees = employees.filter(
    (emp) => emp.manager_id == managerId
  );

  if (assignedEmployees.length === 0) {
    profileUpdateForm.innerHTML = `
            <div class="card">
                <h2>Request Exit Interview</h2>
                <p>No employees assigned to you.</p>
                <div class="form-group button-group">
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            </div>
        `;
    return;
  }

  profileUpdateForm.innerHTML = `
        <div class="card">
            <h2>Request Exit Interview</h2>
            <form id="exitInterviewForm" method="POST">
                <div class="form-group">
                    <label for="employee_id">Employee:</label>
                    <select id="employee_id" name="employee_id" required>
                        <option value="">Select an employee</option>
                        ${assignedEmployees
                          .map(
                            (emp) =>
                              `<option value="${emp.employee_id}">${emp.first_name} ${emp.last_name} (${emp.emp_job_title})</option>`
                          )
                          .join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="last_working_date">Last Working Date:</label>
                    <input type="date" id="last_working_date" name="last_working_date" required>
                </div>
                <div class="form-group">
                    <label for="manager_rating">Manager Rating (calculated):</label>
                    <input type="number" id="manager_rating" name="manager_rating" min="1" max="5" readonly>
                </div>
                <div class="form-group">
                    <label for="eligible_for_rehire">Eligible for Rehire:</label>
                    <select id="eligible_for_rehire" name="eligible_for_rehire">
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Submit Request</button>
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            </form>
        </div>
    `;

  const form = document.getElementById('exitInterviewForm');
  const employeeSelect = document.getElementById('employee_id');
  const managerRatingInput = document.getElementById('manager_rating');
  if (form && employeeSelect && managerRatingInput) {
    employeeSelect.addEventListener('change', function () {
      const selectedEmployeeId = this.value;
      const ratingData = reportAvgRatings.find(
        (r) => r.employee_id == selectedEmployeeId
      );
      managerRatingInput.value =
        ratingData && ratingData.avg_rating
          ? parseFloat(ratingData.avg_rating).toFixed(1)
          : 'N/A';
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const lastWorkingDate = form.querySelector('#last_working_date').value;
      const today = new Date().toISOString().split('T')[0];
      if (lastWorkingDate < today) {
        alert('Last working date cannot be in the past.');
        return;
      }

      const managerRating =
        managerRatingInput.value === 'N/A' ? null : managerRatingInput.value;
      const formData = new FormData(this);
      if (managerRating !== null) {
        formData.set('manager_rating', managerRating);
      }

      fetch('../pages/features/request_exit_interview.php', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert('Requested exit interview successfully!');
            form.reset();
            managerRatingInput.value = '';
          } else {
            showError(
              data.error || 'Failed to submit exit interview request',
              'profile-update-form'
            );
          }
        })
        .catch((error) =>
          showError('Network error: ' + error.message, 'profile-update-form')
        );
    });
  }
}

function updateExitInterview(selectedInterviewId = null) {
  if (!showSection('profile-update-form')) return;

  const profileUpdateForm = document.getElementById('profile-update-form');

  profileUpdateForm.style.width = '100%';
  profileUpdateForm.style.margin = '0';
  profileUpdateForm.style.padding = '20px';
  profileUpdateForm.style.boxShadow = 'none';
  profileUpdateForm.style.borderRadius = '0';

  let exitInterviews = [];

  const fetchExitInterviews = () => {
    return fetch('../pages/features/fetch_exit_interviews.php')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error fetching exit interviews:', error);
        throw error;
      });
  };

  fetchExitInterviews()
    .then((data) => {
      if (!Array.isArray(data)) {
        if (data.error) {
          showError('Error: ' + data.error, 'profile-update-form');
          profileUpdateForm.innerHTML = `
                        <div style="padding: 20px;">
                            <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Exit Interview Requests</h2>
                            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">${data.error}</p>
                            <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
                                <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                            </div>
                        </div>
                    `;
          return;
        } else {
          throw new Error('Response is not an array: ' + JSON.stringify(data));
        }
      }

      exitInterviews = data;

      if (selectedInterviewId) {
        const interview = data.find(
          (ei) => ei.interview_id == selectedInterviewId
        );
        if (!interview) {
          showError('Exit interview request not found.', 'profile-update-form');
          return;
        }

        profileUpdateForm.innerHTML = `
          <div class="card">
              <h2>Update Exit Interview Request</h2>
              <form id="updateExitInterviewForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                  <input type="hidden" name="interview_id" value="${
                    interview.interview_id
                  }">
                  <div class="form-group">
                      <label for="employee_id">Employee:</label>
                      <input type="text" value="${interview.first_name} ${
          interview.last_name
        }" readonly>
                      <input type="hidden" name="employee_id" value="${
                        interview.employee_id
                      }">
                  </div>
                  <div class="form-group">
                      <label for="last_working_date">Last Working Date:</label>
                      <input type="date" id="last_working_date" name="last_working_date" value="${
                        interview.last_working_date
                      }" required>
                  </div>
                  <div class="form-group">
                      <label for="manager_rating">Manager Rating:</label>
                      <input type="number" id="manager_rating" name="manager_rating" value="${
                        interview.manager_rating || ''
                      }" step="0.1" min="1" max="5">
                  </div>
                  <div class="form-group">
                      <label for="eligible_for_rehire">Eligible for Rehire:</label>
                      <select id="eligible_for_rehire" name="eligible_for_rehire" required>
                          <option value="1" ${
                            interview.eligible_for_rehire === '1'
                              ? 'selected'
                              : ''
                          }>Yes</option>
                          <option value="0" ${
                            interview.eligible_for_rehire === '0'
                              ? 'selected'
                              : ''
                          }>No</option>
                      </select>
                  </div>
                  <div class="form-group button-group" style="grid-column: span 2;">
                      <button type="submit">Update Request</button>
                      <button type="button" onclick="updateExitInterview()">Back to List</button>
                  </div>
              </form>
          </div>
        `;

        const form = document.getElementById('updateExitInterviewForm');
        if (form) {
          form.addEventListener('submit', function (event) {
            event.preventDefault();

            const lastWorkingDate =
              form.querySelector('#last_working_date').value;
            const today = new Date().toISOString().split('T')[0];
            if (lastWorkingDate < today) {
              alert('Last working date cannot be in the past.');
              return;
            }

            const managerRating = form.querySelector('#manager_rating').value;
            if (managerRating && (managerRating < 1 || managerRating > 5)) {
              alert('Manager rating must be between 1 and 5.');
              return;
            }

            const formData = new FormData(this);
            fetch('../pages/features/update_exit_interview.php', {
              method: 'POST',
              body: formData,
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success) {
                  showSuccess(
                    'Exit interview request updated successfully!',
                    'profile-update-form'
                  );
                  fetchExitInterviews().then((updatedData) => {
                    exitInterviews = updatedData;
                    updateExitInterview();
                  });
                } else {
                  showError(
                    data.error || 'Failed to update exit interview request',
                    'profile-update-form'
                  );
                }
              })
              .catch((error) =>
                showError(
                  'Network error: ' + error.message,
                  'profile-update-form'
                )
              );
          });
        }
      } else {
        let tableHTML = `
                    <div style="width: 100%;">
                        <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Exit Interview Requests</h2>
                        <div style="overflow-x: auto;">
                            <table class="exit-interview-table" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 16px;">
                                <thead style="background-color: #f4f4f4; color: #333;">
                                    <tr>
                                        <th style="padding: 12px 15px; text-align: left; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #ddd;">Employee</th>
                                        <th style="padding: 12px 15px; text-align: left; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #ddd;">Interview Date</th>
                                        <th style="padding: 12px 15px; text-align: left; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #ddd;">Last Working Date</th>
                                        <th style="padding: 12px 15px; text-align: left; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #ddd;">Manager Rating</th>
                                        <th style="padding: 12px 15px; text-align: left; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #ddd;">Eligible for Rehire</th>
                                        <th style="padding: 12px 15px; text-align: left; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #ddd;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;

        if (data.length === 0) {
          tableHTML += `
                        <tr>
                            <td colspan="6" style="padding: 12px 15px; text-align: left; color: #555; border-bottom: 1px solid #ddd;">No exit interview requests found.</td>
                        </tr>
                    `;
        } else {
          data.forEach((ei) => {
            tableHTML += `
                            <tr style="transition: background-color 0.3s;"
                                onmouseover="this.style.backgroundColor='#f9f9f9'"
                                onmouseout="this.style.backgroundColor='transparent'">
                                <td style="padding: 12px 15px; text-align: left; color: #555; border-bottom: 1px solid #ddd;">${
                                  ei.first_name
                                } ${ei.last_name}</td>
                                <td style="padding: 12px 15px; text-align: left; color: #555; border-bottom: 1px solid #ddd;">${
                                  ei.interview_date || 'N/A'
                                }</td>
                                <td style="padding: 12px 15px; text-align: left; color: #555; border-bottom: 1px solid #ddd;">${
                                  ei.last_working_date || 'N/A'
                                }</td>
                                <td style="padding: 12px 15px; text-align: left; color: #555; border-bottom: 1px solid #ddd;">${
                                  ei.manager_rating || 'N/A'
                                }</td>
                                <td style="padding: 12px 15px; text-align: left; color: #555; border-bottom: 1px solid #ddd;">${
                                  ei.eligible_for_rehire == 1 ? 'Yes' : 'No'
                                }</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">
                                    <button class="update-btn" data-interview-id="${
                                      ei.interview_id
                                    }" style="margin-bottom: 5px;">Update</button>
                                    <button class="remove-btn" data-interview-id="${
                                      ei.interview_id
                                    }" style="background-color: #dc3545; color: white;">Delete</button>
                                </td>
                            </tr>
                        `;
          });
        }

        tableHTML += `
                                </tbody>
                            </table>
                        </div>
                        <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
                            <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                        </div>
                    </div>
                `;

        profileUpdateForm.innerHTML = tableHTML;

        // Add event listeners for Update buttons
        const updateButtons = profileUpdateForm.querySelectorAll('.update-btn');
        updateButtons.forEach((button) => {
          button.addEventListener('click', function () {
            const interviewId = this.getAttribute('data-interview-id');
            updateExitInterview(interviewId);
          });
        });

        // Add event listeners for Delete buttons
        const deleteButtons = profileUpdateForm.querySelectorAll('.remove-btn');
        deleteButtons.forEach((button) => {
          button.addEventListener('click', function () {
            const interviewId = this.getAttribute('data-interview-id');
            if (
              confirm(
                'Are you sure you want to delete this exit interview request?'
              )
            ) {
              fetch('../pages/features/delete_exit_interview.php', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ interview_id: interviewId }),
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  return response.json();
                })
                .then((data) => {
                  if (data.success) {
                    showSuccess(
                      'Exit interview request deleted successfully!',
                      'profile-update-form'
                    );
                    fetchExitInterviews().then((updatedData) => {
                      exitInterviews = updatedData;
                      updateExitInterview();
                    });
                  } else {
                    showError(
                      data.error || 'Failed to delete exit interview request',
                      'profile-update-form'
                    );
                  }
                })
                .catch((error) => {
                  console.error('Delete error:', error);
                  showError(
                    'Network error: ' + error.message,
                    'profile-update-form'
                  );
                });
            }
          });
        });
      }
    })
    .catch((error) =>
      showError(
        'Error fetching exit interviews: ' + error.message,
        'profile-update-form'
      )
    );
}

document.querySelectorAll('.sidebar-menu a').forEach((link) => {
  link.addEventListener('click', function (event) {
    event.preventDefault();
    const action = this.getAttribute('onclick');
    if (action && typeof window[action] === 'function') {
      window[action]();
    }
  });
});
function showDepartment() {
  console.log('showDepartmentInfo called');
  if (!showSection('Department_content')) return;

  const mainContent = document.getElementById('Department_content');

  let html = `
        <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Department Information</h2>
        <table style="width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <thead>
                <tr style="background-color: #003087; color: #FFFFFF;">
                    <th style="border: 1px solid #ddd; padding: 8px;">Department ID</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Employee Count</th>
                </tr>
            </thead>
            <tbody>
    `;
  if (departments.length > 0) {
    departments.forEach((dept) => {
      html += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${
                      dept.department_id
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${
                      dept.department_name
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${
                      dept.department_description || 'No description'
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${
                      dept.employee_count
                    }</td>
                </tr>
            `;
    });
  } else {
    html += `
            <tr>
                <td colspan="4" style="padding: 20px; text-align: center; color: #666;">No departments found.</td>
            </tr>
        `;
  }
  html += `
            </tbody>
        </table>
        <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
            <button type="button" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                    onmouseover="this.style.backgroundColor='#5a6268'" 
                    onmouseout="this.style.backgroundColor='#6c757d'"
                    onclick="showWelcomeMessage(event)">Back</button>
        </div>
    `;
  mainContent.innerHTML = html;
}

// Function to populate employee dropdown (filters employees by project assignments)
function updateEmployeeDropdown(employeeSelect, projectId = '') {
  employeeSelect.innerHTML = '<option value="">Unassigned</option>';

  console.log(
    'updateEmployeeDropdown - projectId:',
    projectId,
    'Type:',
    typeof projectId
  );
  console.log(
    'updateEmployeeDropdown - projectAssignments:',
    window.projectAssignments
  );
  console.log('updateEmployeeDropdown - employees:', window.employees);

  const managerId = sessionStorage.getItem('employee_id');
  let availableEmployees;

  if (!projectId || projectId <= 0) {
    // If projectId is invalid, show all employees under the manager
    availableEmployees = (window.employees || []).filter(
      (emp) => emp.manager_id == managerId
    );
    console.log(
      'updateEmployeeDropdown - availableEmployees (no project):',
      availableEmployees
    );
  } else {
    // Filter employees assigned to the selected project
    const assignedEmployeeIds = (window.projectAssignments || [])
      .filter(
        (assignment) => String(assignment.project_id) === String(projectId)
      )
      .map((assignment) => assignment.employee_id);

    console.log(
      'updateEmployeeDropdown - assignedEmployeeIds:',
      assignedEmployeeIds
    );

    availableEmployees = (window.employees || []).filter((emp) =>
      assignedEmployeeIds.includes(emp.employee_id)
    );

    // If no employees are assigned to the project, fall back to showing all employees under the manager
    if (availableEmployees.length === 0) {
      availableEmployees = (window.employees || []).filter(
        (emp) => emp.manager_id == managerId
      );
      console.log(
        'updateEmployeeDropdown - No employees assigned to project, falling back to all employees under manager:',
        availableEmployees
      );
    } else {
      console.log(
        'updateEmployeeDropdown - availableEmployees (with project):',
        availableEmployees
      );
    }
  }

  availableEmployees.forEach((emp) => {
    employeeSelect.innerHTML += `<option value="${emp.employee_id}">${emp.first_name} ${emp.last_name}</option>`;
  });
}

// Show subtask section and initialize form
function showSubtasks() {
  showSection('subtasks-section');
  resetSubtaskForm();
  populateSubtaskForm();
  // Delay rendering to ensure data is fetched
  setTimeout(() => {
    renderTasksTable();
  }, 500);
}

// Reset subtask form
function resetSubtaskForm() {
  const form = document.getElementById('subtask-form');
  form.reset();
  document.getElementById('task_id').value = '';
  document.getElementById('delete-task-btn').style.display = 'none';
  document.getElementById('form-message').textContent = '';
  document.getElementById('filter_project').innerHTML =
    '<option value="">All Projects</option>';
}

// Populate subtask form dropdowns
function populateSubtaskForm() {
  const projectSelect = document.getElementById('project_id_subtask');
  const filterSelect = document.getElementById('filter_project');
  const employeeSelect = document.getElementById('employee_id_subtask');

  // Populate projects
  projectSelect.innerHTML = '<option value="">Select a project</option>';
  filterSelect.innerHTML = '<option value="">All Projects</option>';
  window.projects.forEach((project) => {
    const option = `<option value="${project.project_id}">${project.project_name}</option>`;
    projectSelect.insertAdjacentHTML('beforeend', option);
    filterSelect.insertAdjacentHTML('beforeend', option);
  });

  // Initial employee dropdown population (no project selected yet)
  updateEmployeeDropdown(employeeSelect);

  // Update employee dropdown when project changes
  projectSelect.addEventListener('change', () => {
    updateEmployeeDropdown(employeeSelect, projectSelect.value);
  });

  // Update tasks table when filter changes
  filterSelect.addEventListener('change', () => {
    renderTasksTable();
  });
}

// Render tasks table with optional project filter
function renderTasksTable() {
  const projectId = document.getElementById('filter_project').value;
  const tbody = document.getElementById('tasks-table');
  tbody.innerHTML = '';

  const filteredTasks = projectId
    ? window.tasks.filter((task) => task.project_id == projectId)
    : window.tasks;

  if (filteredTasks.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center;">No tasks found.</td></tr>';
    return;
  }

  filteredTasks.forEach((task) => {
    const row = document.createElement('tr');
    row.innerHTML = `
          <td>${task.task_description || 'N/A'}</td>
          <td>${task.project_name || 'N/A'}</td>
          <td>${
            task.first_name
              ? task.first_name + ' ' + task.last_name
              : 'Unassigned'
          }</td>
          <td>${task.due_date || 'N/A'}</td>
          <td>${task.status || 'N/A'}</td>
          <td>
              <button onclick="editSubtask(${
                task.task_id
              })" style="color: #007bff; background: none; border: none;">Edit</button>
              <button onclick="confirmDeleteSubtask(${
                task.task_id
              })" style="color: #dc3545; background: none; border: none;">Delete</button>
          </td>
      `;
    tbody.appendChild(row);
  });
}

// Save task (create or update)
function saveTask() {
  const taskId = document.getElementById('task_id').value;
  const taskData = {
    action: taskId ? 'update_task' : 'create_task',
    task_id: taskId || '', // Ensure task_id is an empty string if not present
    project_id: document.getElementById('project_id_subtask').value,
    task_description: document.getElementById('task_description').value.trim(),
    employee_id: document.getElementById('employee_id_subtask').value || null,
    due_date: document.getElementById('due_date').value,
    status: document.getElementById('task_status').value,
  };

  // Client-side validation
  if (
    !taskData.project_id ||
    !taskData.task_description ||
    !taskData.due_date ||
    !taskData.status
  ) {
    showError('Please fill all required fields.', 'subtasks-section');
    return;
  }

  // Validate due_date format (YYYY-MM-DD)
  const dueDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dueDateRegex.test(taskData.due_date)) {
    showError('Due date must be in YYYY-MM-DD format.', 'subtasks-section');
    return;
  }

  // Log task data for debugging
  console.log('saveTask - Task data being sent:', taskData);
  console.log('saveTask - Current tasks in window.tasks:', window.tasks);

  // Send the request to the server
  fetch('../pages/manager_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(taskData),
  })
    .then((response) => {
      console.log('saveTask - Fetch response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('saveTask - Server response:', data);
      if (data.success) {
        // Delay the refresh to avoid race conditions
        setTimeout(() => {
          refreshTasksData(null, () => {
            showSuccess(
              taskId
                ? 'Task updated successfully!'
                : 'Task created successfully!',
              'subtasks-section'
            );
            resetSubtaskForm();
            populateSubtaskForm();
            renderTasksTable();
          });
        }, 500);
      } else {
        // Provide more specific error messages based on server response
        const errorMessage = data.error || 'Failed to save task.';
        if (errorMessage.includes('Task not found')) {
          showError(
            'Task not found on server. It may have been deleted.',
            'subtasks-section'
          );
        } else if (errorMessage.includes('Invalid project ID')) {
          showError(
            'Invalid project selected. Please refresh and try again.',
            'subtasks-section'
          );
        } else {
          showError(errorMessage, 'subtasks-section');
        }
      }
    })
    .catch((error) => {
      console.error('saveTask - Fetch error:', error);
      showError('Error saving task: ' + error.message, 'subtasks-section');
    });
}

// Edit subtask
function editSubtask(taskId) {
  const task = window.tasks.find((t) => t.task_id == taskId);
  if (!task) {
    showError('Task not found.', 'subtasks-section');
    return;
  }

  const employeeSelect = document.getElementById('employee_id_subtask');
  const projectSelect = document.getElementById('project_id_subtask');
  const dueDateInput = document.getElementById('due_date'); // Get the due date input

  console.log('editSubtask - Task data:', task);
  console.log('editSubtask - Project ID:', task.project_id);
  console.log('editSubtask - Employee ID:', task.employee_id);

  // Validate project_id
  const project = window.projects.find((p) => p.project_id == task.project_id);
  if (!project) {
    showError(
      'Invalid project ID for this task. Please refresh the page.',
      'subtasks-section'
    );
    return;
  }

  document.getElementById('task_id').value = task.task_id;
  projectSelect.value = task.project_id;
  projectSelect.disabled = true;
  document.getElementById('task_description').value = task.task_description;
  dueDateInput.value = task.due_date;
  dueDateInput.disabled = true; // Disable the due date field
  document.getElementById('task_status').value = task.status;
  document.getElementById('delete-task-btn').style.display = 'inline-block';
  document.getElementById('filter_project').value = task.project_id;

  // Refresh project assignments data to ensure employee dropdown is populated correctly
  refreshTasksData(task.project_id, () => {
    // Ensure the employee dropdown is populated
    updateEmployeeDropdown(employeeSelect, task.project_id);

    // Set the employee dropdown value after ensuring options are populated
    setTimeout(() => {
      const validEmployee = window.employees.find(
        (emp) => emp.employee_id == task.employee_id
      );
      employeeSelect.value = validEmployee ? task.employee_id : '';
      employeeSelect.disabled = true; // Disable the employee dropdown
      console.log(
        'editSubtask - Employee dropdown set to:',
        employeeSelect.value
      );
    }, 500);
  });

  renderTasksTable();
}

// Confirm and delete subtask
function confirmDeleteSubtask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  console.log('Deleting task with ID:', taskId); // Debugging log

  fetch('../pages/manager_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ action: 'delete_task', task_id: taskId }),
  })
    .then((response) => {
      console.log('Delete response status:', response.status); // Debugging log
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('Delete server response:', data); // Debugging log
      if (data.success) {
        // Delay the refresh to avoid race conditions
        setTimeout(() => {
          refreshTasksData(null, () => {
            showSuccess('Task deleted successfully!', 'subtasks-section');
            resetSubtaskForm();
            populateSubtaskForm();
            renderTasksTable();
          });
        }, 500);
      } else {
        showError(data.error || 'Failed to delete task.', 'subtasks-section');
      }
    })
    .catch((error) => {
      console.error('Delete fetch error:', error); // Debugging log
      showError('Error deleting task: ' + error.message, 'subtasks-section');
    });
}

// Show welcome message (default view)
function showWelcomeMessage() {
  showSection('main-content');
}
