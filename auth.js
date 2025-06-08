// Authentication related functions

// Check if on login page
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        const loginError = document.getElementById('login-error');
        
        // Check if already logged in
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            // Already logged in, redirect to app
            window.location.href = 'index.html';
            return;
        }
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (!username || !password) {
                loginError.textContent = 'الرجاء إدخال اسم المستخدم وكلمة المرور';
                return;
            }
            
            try {
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
            } catch (error) {
                console.error('حدث خطأ أثناء تسجيل الدخول:', error);
                loginError.textContent = 'حدث خطأ أثناء محاولة تسجيل الدخول. حاول مرة أخرى.';
            }
        });
    }
}

// Check if on register page
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        const passwordError = document.getElementById('password-error');
        
        // Check if already logged in
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            // Already logged in, redirect to app
            window.location.href = 'index.html';
            return;
        }
        
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
            
            try {
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
            } catch (error) {
                console.error('حدث خطأ أثناء إنشاء الحساب:', error);
                passwordError.textContent = 'حدث خطأ أثناء محاولة إنشاء الحساب. حاول مرة أخرى.';
            }
        });
    }
});

// Check authentication on protected pages
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // If not logged in
    if (!currentUser) {
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
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're not on login or register page
    const isLoginPage = window.location.href.includes('login.html');
    const isRegisterPage = window.location.href.includes('register.html');
    
    if (!isLoginPage && !isRegisterPage) {
        if (checkAuth()) {
            addLogoutButton();
        }
    }
});