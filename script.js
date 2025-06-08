// Project tracking app - Main JavaScript file

// DOM Elements
const projectForm = document.getElementById('project-form');
const projectNameInput = document.getElementById('project-name');
const projectDescInput = document.getElementById('project-desc');
const projectStatusInput = document.getElementById('project-status');
const projectDeadlineInput = document.getElementById('project-deadline');
const projectPriorityInput = document.getElementById('project-priority');
const notStartedContainer = document.getElementById('not-started-projects');
const inProgressContainer = document.getElementById('in-progress-projects');
const completedContainer = document.getElementById('completed-projects');
const searchInput = document.getElementById('project-search');
const clearSearchButton = document.getElementById('clear-search');
const themeSwitch = document.getElementById('theme-switch');

// Get current user
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const username = currentUser ? currentUser.username : null;

// Project data array - user specific
let projects = [];

// Initialize the app
function init() {
    // Check authentication
    if (!username) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user's projects
    loadUserProjects();
    
    // Set up event listeners
    projectForm.addEventListener('submit', addProject);
    searchInput.addEventListener('input', filterProjects);
    clearSearchButton.addEventListener('click', clearSearch);
    
    // Set up theme toggle
    setupThemeToggle();
}

// Get user-specific storage key
function getUserProjectsKey() {
    return `projects_${username}`;
}

// Save projects to localStorage (user specific)
function saveProjects() {
    localStorage.setItem(getUserProjectsKey(), JSON.stringify(projects));
}

// Load user's projects from localStorage
function loadUserProjects() {
    projects = JSON.parse(localStorage.getItem(getUserProjectsKey())) || [];
    loadProjects();
}

// Load and display projects
function loadProjects() {
    // Clear containers
    notStartedContainer.innerHTML = '';
    inProgressContainer.innerHTML = '';
    completedContainer.innerHTML = '';
    
    // Display projects based on status
    projects.forEach((project, index) => {
        const projectCard = createProjectCard(project, index);
        
        switch (project.status) {
            case 'not-started':
                notStartedContainer.appendChild(projectCard);
                break;
            case 'in-progress':
                inProgressContainer.appendChild(projectCard);
                break;
            case 'completed':
                completedContainer.appendChild(projectCard);
                break;
        }
    });
}

// Create project card element
function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.classList.add('project-card');
    
    const statusLabels = {
        'not-started': 'لم يبدأ بعد',
        'in-progress': 'في طور الإنجاز',
        'completed': 'تم الإنجاز'
    };
    
    const priorityLabels = {
        'low': 'منخفضة',
        'medium': 'متوسطة',
        'high': 'عالية'
    };
    
    let deadlineText = '';
    if (project.deadline) {
        const deadlineDate = new Date(project.deadline);
        deadlineText = `<p class="deadline">الموعد النهائي: ${deadlineDate.toLocaleDateString()}</p>`;
    }
    
    let priorityText = '';
    if (project.priority) {
        priorityText = `<span class="priority ${project.priority}">الأولوية: ${priorityLabels[project.priority]}</span>`;
    }
    
    // Calculate days remaining if there's a deadline
    let daysRemainingText = '';
    if (project.deadline && project.status !== 'completed') {
        const today = new Date();
        const deadlineDate = new Date(project.deadline);
        const timeDiff = deadlineDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysRemaining > 0) {
            daysRemainingText = `<p class="days-remaining">متبقي ${daysRemaining} يوم</p>`;
        } else if (daysRemaining === 0) {
            daysRemainingText = `<p class="days-remaining overdue">يستحق اليوم!</p>`;
        } else {
            daysRemainingText = `<p class="days-remaining overdue">متأخر بـ ${Math.abs(daysRemaining)} يوم</p>`;
        }
    }
    
    card.innerHTML = `
        <h3>${project.name}</h3>
        <p>${project.description || 'لا يوجد وصف'}</p>
        ${deadlineText}
        ${daysRemainingText}
        ${priorityText}
        <div class="project-actions">
            <select class="status-change" data-index="${index}">
                <option value="not-started" ${project.status === 'not-started' ? 'selected' : ''}>لم يبدأ بعد</option>
                <option value="in-progress" ${project.status === 'in-progress' ? 'selected' : ''}>في طور الإنجاز</option>
                <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>تم الإنجاز</option>
            </select>
            <button class="delete-btn" data-index="${index}">حذف</button>
        </div>
    `;
    
    // Add event listeners to the card elements
    setTimeout(() => {
        const statusSelect = card.querySelector('.status-change');
        const deleteBtn = card.querySelector('.delete-btn');
        
        statusSelect.addEventListener('change', (e) => {
            changeProjectStatus(index, e.target.value);
        });
        
        deleteBtn.addEventListener('click', () => {
            deleteProject(index);
        });
    }, 0);
    
    return card;
}

// Add a new project
function addProject(e) {
    e.preventDefault();
    
    // Validate input
    if (!projectNameInput.value.trim()) {
        alert('الرجاء إدخال اسم المشروع');
        return;
    }
    
    // Create new project object
    const newProject = {
        name: projectNameInput.value.trim(),
        description: projectDescInput.value.trim(),
        status: projectStatusInput.value,
        deadline: projectDeadlineInput.value,
        priority: projectPriorityInput.value,
        createdAt: new Date().toISOString(),
        username: username // Associate with current user
    };
    
    // Add to projects array
    projects.push(newProject);
    
    // Save and reload
    saveProjects();
    loadProjects();
    
    // Reset form
    projectForm.reset();
    
    // Show success message
    showNotification('تمت إضافة المشروع بنجاح');
}

// Display notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Change project status
function changeProjectStatus(index, newStatus) {
    projects[index].status = newStatus;
    saveProjects();
    loadProjects();
}

// Delete a project
function deleteProject(index) {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
        projects.splice(index, 1);
        saveProjects();
        loadProjects();
    }
}

// Filter projects based on search input
function filterProjects() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        loadProjects(); // Reset to show all projects
        return;
    }
    
    const filteredProjects = projects.filter(project => {
        return (
            project.name.toLowerCase().includes(searchTerm) ||
            (project.description && project.description.toLowerCase().includes(searchTerm))
        );
    });
    
    renderFilteredProjects(filteredProjects);
}

// Render only filtered projects
function renderFilteredProjects(filteredProjects) {
    // Clear containers
    notStartedContainer.innerHTML = '';
    inProgressContainer.innerHTML = '';
    completedContainer.innerHTML = '';
    
    // Display filtered projects
    filteredProjects.forEach((project, index) => {
        const projectIndex = projects.findIndex(p => p.name === project.name && p.createdAt === project.createdAt);
        const projectCard = createProjectCard(project, projectIndex);
        
        switch (project.status) {
            case 'not-started':
                notStartedContainer.appendChild(projectCard);
                break;
            case 'in-progress':
                inProgressContainer.appendChild(projectCard);
                break;
            case 'completed':
                completedContainer.appendChild(projectCard);
                break;
        }
    });
}

// Clear search
function clearSearch() {
    searchInput.value = '';
    loadProjects();
}

// Setup theme toggle
function setupThemeToggle() {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem(`theme_${username}`);
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeSwitch.checked = true;
    }
    
    // Add event listener for theme toggle
    themeSwitch.addEventListener('change', function() {
        document.body.classList.toggle('dark-theme');
        
        // Save user preference
        const isDarkMode = document.body.classList.contains('dark-theme');
        localStorage.setItem(`theme_${username}`, isDarkMode ? 'dark' : 'light');
    });
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);