// Authentication related functions

// Check if on login page
if (document.getElementById('login-form')) {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!username || !password) {
            loginError.textContent = 'الرجاء إدخال اسم المستخدم وكلمة المرور';
            return;
        }
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check credentials
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Set session
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                loginTime: new Date().getTime()
            }));
            
            // Redirect to app
            window.location.href = 'index.html';
        } else {
            loginError.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
        }
    });
}

// Check if on register page
if (document.getElementById('register-form')) {
    const registerForm = document.getElementById('register-form');
    const passwordError = document.getElementById('password-error');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Basic validation
        if (!username || !password) {
            passwordError.textContent = 'الرجاء إدخال جميع البيانات المطلوبة';
            return;
        }
        
        // Check password match
        if (password !== confirmPassword) {
            passwordError.textContent = 'كلمة المرور غير متطابقة';
            return;
        }
        
        // Minimum password length
        if (password.length < 6) {
            passwordError.textContent = 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل';
            return;
        }
        
        // Get existing users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if username exists
        if (users.some(user => user.username === username)) {
            passwordError.textContent = 'اسم المستخدم موجود بالفعل';
            return;
        }
        
        // Add new user
        users.push({
            username: username,
            password: password, // In a real app, this should be hashed
            registeredAt: new Date().toISOString()
        });
        
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        // Set session for auto login
        localStorage.setItem('currentUser', JSON.stringify({
            username: username,
            loginTime: new Date().getTime()
        }));
        
        // Redirect to app
        window.location.href = 'index.html';
    });
}

// Check authentication on protected pages
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // If not logged in and not on login/register page
    if (!currentUser && 
        !window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html')) {
        
        // Redirect to login
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Add logout functionality
function addLogoutButton() {
    if (!document.querySelector('.logout-btn')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser) {
            const header = document.querySelector('header');
            
            // Create user info and logout section
            const userSection = document.createElement('div');
            userSection.className = 'user-section';
            userSection.innerHTML = `
                <span class="username">مرحباً، ${currentUser.username}</span>
                <button class="logout-btn">تسجيل الخروج</button>
            `;
            
            header.appendChild(userSection);
            
            // Add logout event listener
            document.querySelector('.logout-btn').addEventListener('click', function() {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            });
        }
    }
}

// Execute auth check if on a protected page
if (!window.location.pathname.includes('login.html') && 
    !window.location.pathname.includes('register.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        if (checkAuth()) {
            addLogoutButton();
        }
    });
}