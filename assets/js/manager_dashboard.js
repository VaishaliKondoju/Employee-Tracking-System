// manager_dashboard.js
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
        console.log('Project Assignments:', window.projectAssignments);
        if (callback) callback();
      } else {
        showError(data.error || 'Failed to refresh data');
      }
    })
    .catch((error) => showError('Network error: ' + error.message));
}

document.addEventListener('DOMContentLoaded', function () {
  refreshData();
});

function showError(message, containerId = 'profile-update-form') {
  const container = document.getElementById(containerId);
  if (container) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.innerHTML = message;
    container.insertBefore(errorDiv, container.firstChild);

    // Remove after 10 seconds
    setTimeout(() => {
      if (errorDiv.parentElement) errorDiv.remove();
    }, 10000);

    // Remove on click anywhere on the page
    document.addEventListener('click', function handler(event) {
      if (errorDiv.parentElement) errorDiv.remove();
      document.removeEventListener('click', handler); // Remove listener after use
    });
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
    }, 1000);
  }
}

function showWelcomeMessage(event) {
  if (event) event.preventDefault();
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById(
    'project-assignments-section'
  );
  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'block';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'none';
    profileUpdateForm.innerHTML = '';
  }
}

function showProfileForm() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById(
    'project-assignments-section'
  );

  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'block';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'none';

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
}

function showFeedbackForm() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById(
    'project-assignments-section'
  );

  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'block';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'none';

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
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById(
    'project-assignments-section'
  );

  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'block';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'none';

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
}

function showReportsAnalytics() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const reportContent = document.getElementById('report-content');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById(
    'project-assignments-section'
  );

  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    reportContent &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'block';
    reportContent.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'none';

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
}

function loadScript(url, callback) {
  const script = document.createElement('script');
  script.src = url;
  script.onload = () => callback();
  script.onerror = () => callback(new Error(`Failed to load script: ${url}`));
  document.head.appendChild(script);
}

// Projects and Tasks Functions
function showProjects() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById(
    'project-assignments-section'
  );

  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'block';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'none';

    const projectsTable = document.getElementById('projects-table');
    projectsTable.innerHTML = '';
    if (projects.length === 0) {
      projectsTable.innerHTML = `<tr><td colspan="8">No active projects found.</td></tr>`;
    } else {
      projects.forEach((p) => {
        const row = document.createElement('tr');
        row.innerHTML = `
                  <td>${p.project_name}</td>
                  <td>${p.project_status}</td>
                  <td>$${parseFloat(p.budget).toFixed(2)}</td>
                  <td>${
                    p.actual_cost
                      ? '$' + parseFloat(p.actual_cost).toFixed(2)
                      : 'N/A'
                  }</td>
                  <td>${p.start_date}</td>
                  <td>${p.expected_end_date}</td>
                  <td>${p.actual_end_date || 'N/A'}</td>
                  <td>${p.client_name} (${p.client_contact_email})</td>
              `;
        projectsTable.appendChild(row);
      });
    }
  }
}

function showAssignEmployees() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById(
    'project-assignments-section'
  );

  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'block';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'none';

    const form = document.getElementById('assign-employees-form');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      fetch('../pages/features/manage_assignments.php', {
        method: 'POST',
        body: new FormData(this),
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
              'Employee assigned to project successfully!',
              'assign-employees-section'
            );
            form.reset();
            // Wait 1 second before redirecting
            setTimeout(() => {
              fetchUpdatedAssignmentsAfterAssignment();
            }, 1000);
          } else {
            showError(
              data.error || 'Failed to assign employee',
              'assign-employees-section'
            );
          }
        })
        .catch((error) =>
          showError(
            'Network error: ' + error.message,
            'assign-employees-section'
          )
        );
    });
  }
}

function fetchUpdatedAssignmentsAfterAssignment() {
  fetch('manager_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=refresh_data&section=project_assignments',
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
        console.log('Updated projectAssignments:', window.projectAssignments);
        showAssignedEmployeesSection();
        const projectSelect = document.getElementById('project_id_view');
        const selectedProjectId = projectSelect ? projectSelect.value : '';
        renderAssignmentsTable(selectedProjectId);
      } else {
        showError(
          data.error || 'Failed to fetch updated assignments',
          'project-assignments-section'
        );
      }
    })
    .catch((error) => {
      showError(
        'Network error: ' + error.message,
        'project-assignments-section'
      );
    });
}

function showSubtasksForm() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById(
    'project-assignments-section'
  );

  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'block';
    projectAssignmentsSection.style.display = 'none';

    const form = document.getElementById('subtask-form');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const formData = new FormData(this);
      formData.append('action', 'save_subtask');

      // Check if this is a new subtask or an update
      const taskId = formData.get('task_id');
      const isNewSubtask = !taskId || taskId === '';

      fetch('manager_dashboard.php', {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            // Show appropriate success message based on action
            const successMessage = isNewSubtask
              ? 'Subtask created successfully!'
              : 'Subtask updated successfully!';
            showSuccess(successMessage, 'subtasks-section');
            window.tasks = data.tasks || [];
            setTimeout(() => {
              form.reset();
              const employeeSelect = document.getElementById(
                'employee_id_subtask'
              );
              employeeSelect.innerHTML = '<option value="">Unassigned</option>';
              document.getElementById('delete-task-btn').style.display = 'none';
              loadTasks();
            }, 1000); // Show success message for 1 second
          } else {
            showError(
              data.error || 'Failed to save subtask',
              'subtasks-section'
            );
          }
        })
        .catch((error) =>
          showError('Network error: ' + error.message, 'subtasks-section')
        );
    });
  }
}

function showAssignedEmployeesSection() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById(
    'project-assignments-section'
  );

  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'block';

    loadAssignments();
  }
}

function loadAssignments() {
  const projectSelect = document.getElementById('project_id_view');
  if (!projectSelect) return;

  const assignmentsTable = document.getElementById('assignments-table');
  if (!assignmentsTable) {
    console.error('Assignments table not found!');
    return;
  }

  renderAssignmentsTable(projectSelect.value);
}

// Function to show the Edit Assignment section and populate the form
function editAssignment(assignmentId) {
  const row = document.querySelector(
    `tr[data-assignment-id="${assignmentId}"]`
  );
  if (!row) {
    showError('Assignment not found', 'project-assignments-section');
    return;
  }

  const roleCell = row.querySelector('.role-cell');
  const editButton = row.querySelector('.edit-btn');
  const currentRole =
    roleCell.textContent === 'N/A' ? '' : roleCell.textContent;

  roleCell.innerHTML = `<input type="text" class="role-input" value="${currentRole}" />`;
  editButton.textContent = 'Update';
  editButton.onclick = () => updateAssignment(assignmentId);
}

function deleteAssignment(assignmentId) {
  fetch('manager_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `action=remove_assignment&assignment_id=${assignmentId}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        fetchUpdatedAssignmentsAfterAssignment(); // Fetch fresh data
        showSuccess(
          'Assignment deleted successfully!',
          'project-assignments-section'
        );
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

function fetchUpdatedAssignments() {
  fetch('manager_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=refresh_data&section=project_assignments',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        // Update global projectAssignments with fresh data
        window.projectAssignments = data.project_assignments || [];
        // Ensure we're in the project assignments section
        showAssignedEmployeesSection();
        // Re-render the table with the updated data
        const projectSelect = document.getElementById('project_id_view');
        const selectedProjectId = projectSelect ? projectSelect.value : '';
        renderAssignmentsTable(selectedProjectId);
      } else {
        showError(
          data.error || 'Failed to fetch updated assignments',
          'project-assignments-section'
        );
      }
    })
    .catch((error) => {
      showError(
        'Network error: ' + error.message,
        'project-assignments-section'
      );
    });
}

// Helper function to render the assignments table
function renderAssignmentsTable(selectedProjectId) {
  const assignmentsTable = document.getElementById('assignments-table');
  if (!assignmentsTable) return;

  assignmentsTable.innerHTML = '';
  let filteredAssignments = window.projectAssignments;
  if (selectedProjectId) {
    filteredAssignments = window.projectAssignments.filter(
      (assignment) =>
        String(assignment.project_id) === String(selectedProjectId)
    );
  }

  if (filteredAssignments.length === 0) {
    assignmentsTable.innerHTML = `<tr><td colspan="4">No assignments found for this project.</td></tr>`;
  } else {
    filteredAssignments.forEach((assignment) => {
      const row = document.createElement('tr');
      row.setAttribute('data-assignment-id', assignment.assignment_id);
      row.innerHTML = `
              <td>${assignment.project_name}</td>
              <td>${assignment.first_name} ${assignment.last_name}</td>
              <td class="role-cell">${assignment.role_in_project || 'N/A'}</td>
              <td>
                  <button class="edit-btn" onclick="editAssignment(${
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

function updateAssignment(assignmentId) {
  const row = document.querySelector(
    `tr[data-assignment-id="${assignmentId}"]`
  );
  if (!row) return;

  const roleInput = row.querySelector('.role-input');
  const newRole = roleInput.value.trim();
  const roleCell = row.querySelector('.role-cell');
  const editButton = row.querySelector('.edit-btn');

  // Validate input
  if (!newRole) {
    showError('Role in project is required', 'project-assignments-section');
    return;
  }

  // Send update request to the server
  const formData = new FormData();
  formData.append('action', 'update_assignment');
  formData.append('assignment_id', assignmentId);
  formData.append('role_in_project', newRole);

  fetch('manager_dashboard.php', {
    method: 'POST',
    body: formData,
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        // Update the table cell
        roleCell.textContent = newRole || 'N/A';
        // Restore the Edit button
        editButton.textContent = 'Edit';
        editButton.onclick = () => editAssignment(assignmentId);
        // Refresh the table data
        fetchUpdatedAssignmentsAfterAssignment();
        showSuccess(
          'Assignment updated successfully!',
          'project-assignments-section'
        );
      } else {
        showError(
          data.error || 'Failed to update assignment',
          'project-assignments-section'
        );
      }
    })
    .catch((error) => {
      showError(
        'Network error: ' + error.message,
        'project-assignments-section'
      );
    });
}

function loadTasks() {
  const projectSelect = document.getElementById('project_id_subtask');
  const taskSelect = document.getElementById('task_id');
  const employeeSelect = document.getElementById('employee_id_subtask');
  const tasksTable = document.getElementById('tasks-table');

  if (!projectSelect || !taskSelect || !employeeSelect || !tasksTable) {
    console.error('Required DOM elements missing');
    return;
  }

  const projectId = projectSelect.value;
  tasksTable.innerHTML = '';
  taskSelect.innerHTML = '<option value="">Create new task</option>';
  employeeSelect.innerHTML = '<option value="">Unassigned</option>';

  if (!window.tasks) {
    tasksTable.innerHTML = '<tr><td colspan="6">No tasks available</td></tr>';
    return;
  }

  if (projectId) {
    const filteredTasks =
      window.tasks.filter((task) => task.project_id == projectId) || [];
    if (!filteredTasks.length) {
      tasksTable.innerHTML =
        '<tr><td colspan="6">No tasks for this project</td></tr>';
    }
    filteredTasks.forEach((task) => {
      const option = document.createElement('option');
      option.value = task.task_id || '';
      option.textContent = task.task_description || 'Untitled Task';
      taskSelect.appendChild(option);

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
          <button onclick="populateTaskForm(${task.task_id})">Edit</button>
          <button onclick="deleteTask(${task.task_id || ''}, '${
        task.employee_id || ''
      }')">Delete</button>
        </td>
      `;
      tasksTable.appendChild(row);
    });

    fetch('manager_dashboard.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `action=fetch_project_employees&project_id=${projectId}`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.employees) {
          data.employees.forEach((emp) => {
            const option = document.createElement('option');
            option.value = emp.employee_id;
            option.textContent = `${emp.first_name} ${emp.last_name}`;
            employeeSelect.appendChild(option);
          });
        }
      })
      .catch((error) => console.error('Fetch employees error:', error));
  }
}

function populateTaskForm(taskId) {
  const task = window.tasks.find((t) => t.task_id == taskId);
  if (!task) {
    showError('Task not found', 'subtasks-section');
    return;
  }

  document.getElementById('task_id').value = task.task_id || '';
  document.getElementById('task_description').value =
    task.task_description || '';
  document.getElementById('project_id_subtask').value = task.project_id || '';
  document.getElementById('employee_id_subtask').value = task.employee_id || '';
  document.getElementById('due_date').value = task.due_date || '';
  document.getElementById('task_status').value = task.status || '';
  // document.getElementById('delete-task-btn').style.display = 'block';

  // Ensure the employee dropdown is updated for the selected project
  loadTasks();
}

function resetSubtaskForm() {
  document.getElementById('subtask-form').reset();
  document.getElementById('task_id').value = '';
  document.getElementById('delete-task-btn').style.display = 'none';
  loadTasks();
}

function deleteTask(taskId) {
  if (!taskId) {
    showError('No task selected to delete', 'subtasks-section');
    return;
  }

  if (confirm('Are you sure you want to delete this task?')) {
    fetch('manager_dashboard.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `action=delete_subtask&task_id=${taskId}`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showSuccess('Subtask deleted successfully!', 'subtasks-section');
          window.tasks = data.tasks || [];
          setTimeout(() => {
            const projectSelect = document.getElementById('project_id_subtask');
            const selectedProjectId = projectSelect ? projectSelect.value : '';
            loadTasks();
          }, 1000);
        } else {
          showError(data.error || 'Failed to delete task', 'subtasks-section');
        }
      })
      .catch((error) =>
        showError('Network error: ' + error.message, 'subtasks-section')
      );
  }
}

function addexitinterview() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById(
    'project-assignments-section'
  );

  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'block';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'none';

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
                        <input type="number" id="manager_rating" name="manager_rating" readonly>
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
        event.preventDefault(); // Always prevent default submission

        const formData = new FormData(this);
        formData.append('action', 'save_subtask');

        const taskId = formData.get('task_id');
        const isNewSubtask = !taskId || taskId === '';

        fetch('manager_dashboard.php', {
          method: 'POST',
          body: formData,
        })
          .then((response) => {
            if (!response.ok)
              throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
          })
          .then((data) => {
            if (data.success) {
              const successMessage = isNewSubtask
                ? 'Subtask created successfully!'
                : 'Subtask updated successfully!';
              showSuccess(successMessage, 'subtasks-section');
              window.tasks = data.tasks || [];
              // Reset form immediately
              form.reset();
              const employeeSelect = document.getElementById(
                'employee_id_subtask'
              );
              employeeSelect.innerHTML = '<option value="">Unassigned</option>';
              document.getElementById('delete-task-btn').style.display = 'none';
              loadTasks(); // Refresh task list immediately
            } else {
              showError(
                data.error || 'Failed to save subtask',
                'subtasks-section'
              );
            }
          })
          .catch((error) =>
            showError('Network error: ' + error.message, 'subtasks-section')
          );
      });
    }
  }
}

function updateExitInterview(selectedInterviewId = null) {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById(
    'project-assignments-section'
  );

  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'block';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'none';

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
          return response.text();
        })
        .then((text) => {
          console.log('Raw response from fetch_exit_interviews.php:', text);
          try {
            const data = JSON.parse(text);
            console.log('Parsed data:', data);
            return data;
          } catch (error) {
            console.error('Invalid JSON response:', text);
            throw new Error('Failed to parse JSON: ' + error.message);
          }
        })
        .catch((error) => {
          console.error('Error fetching exit interviews:', error);
          throw error;
        });
    };

    (exitInterviews.length > 0
      ? Promise.resolve(exitInterviews)
      : fetchExitInterviews()
    )
      .then((data) => {
        if (!Array.isArray(data)) {
          if (data.error) {
            alert('Error: ' + data.error);
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
            throw new Error(
              'Response is not an array: ' + JSON.stringify(data)
            );
          }
        }

        exitInterviews = data;

        if (selectedInterviewId) {
          const interview = data.find(
            (ei) => ei.interview_id == selectedInterviewId
          );
          if (!interview) {
            alert('Exit interview request not found.');
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
                      interview.eligible_for_rehire === '1' ? 'selected' : ''
                    }>Yes</option>
                    <option value="0" ${
                      interview.eligible_for_rehire === '0' ? 'selected' : ''
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
                    alert('Exit interview request updated successfully!');
                    fetch('../pages/features/fetch_exit_interviews.php')
                      .then((response) => response.json())
                      .then((updatedData) => {
                        exitInterviews = updatedData;
                        updateExitInterview();
                      });
                  } else {
                    alert(
                      data.error || 'Failed to update exit interview request'
                    );
                  }
                })
                .catch((error) => alert('Network error: ' + error.message));
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
                                            <th style="padding: 12px 15px; text-align: left; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #ddd;">Action</th>
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
                                    <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd;">
                                        <button class="update-exit-interview-btn" data-interview-id="${
                                          ei.interview_id
                                        }">Update</button>
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

          const updateButtons = profileUpdateForm.querySelectorAll(
            '.update-exit-interview-btn'
          );
          updateButtons.forEach((button) => {
            button.addEventListener('click', function () {
              const interviewId = this.getAttribute('data-interview-id');
              updateExitInterview(interviewId);
            });
          });
        }
      })
      .catch((error) =>
        alert('Error fetching exit interviews: ' + error.message)
      );
  }
}
