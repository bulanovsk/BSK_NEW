class UserManager {
    constructor() {
        this.currentUser = null;
        this.loadUserData();
        this.checkAuthStatus();
    }

    loadUserData() {
        const savedUser = localStorage.getItem('bsk_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log('Пользователь загружен:', this.currentUser);
            } catch (error) {
                console.error('Ошибка загрузки пользователя:', error);
                this.currentUser = null;
            }
        } else {
            console.log('Пользователь не найден в LocalStorage');
        }
    }

    saveUserData(userData) {
        this.currentUser = {...this.currentUser, ...userData};
        localStorage.setItem('bsk_user', JSON.stringify(this.currentUser));
        console.log('Пользователь сохранен:', this.currentUser);
    }

    registerUser(name, email, password) {
        const userData = {
            name: name,
            email: email,
            isLoggedIn: true,
            registeredAt: new Date().toISOString()
        };
        
        this.saveUserData(userData);
        return true;
    }

    loginUser(email, password) {
        const userData = {
            email: email,
            isLoggedIn: true,
            lastLogin: new Date().toISOString()
        };
        
        this.saveUserData(userData);
        return true;
    }

    setupProfile(grade, exam, subjects) {
        const profile = {
            grade: grade,
            exam: exam,
            subjects: subjects,
            level: this.determineLevel(grade, exam),
            setupCompleted: true,
            profileCompletedAt: new Date().toISOString()
        };
        
        this.saveUserData(profile);
        return true;
    }

    determineLevel(grade, exam) {
        const levels = {
            '11': {
                'ege': 'advanced',
                'oge': 'basic'
            },
            '10': {
                'ege': 'intermediate',
                'oge': 'basic'
            },
            '9': {
                'oge': 'basic'
            }
        };
        
        return levels[grade]?.[exam] || 'basic';
    }

    isProfileSetup() {
        return this.currentUser?.setupCompleted || false;
    }

    isLoggedIn() {
        return this.currentUser?.isLoggedIn || false;
    }

    getUserPreferences() {
        if (!this.currentUser) {
            return null;
        }
        
        return {
            grade: this.currentUser.grade,
            exam: this.currentUser.exam,
            level: this.currentUser.level,
            subjects: this.currentUser.subjects || []
        };
    }

    getUserInfo() {
        if (!this.currentUser) {
            return { 
                isLoggedIn: false,
                setupCompleted: false 
            };
        }

        return {
            isLoggedIn: this.currentUser.isLoggedIn || false,
            setupCompleted: this.currentUser.setupCompleted || false,
            grade: this.currentUser.grade,
            exam: this.currentUser.exam,
            level: this.currentUser.level,
            subjects: this.currentUser.subjects || [],
            name: this.currentUser.name,
            email: this.currentUser.email
        };
    }

    checkAuthStatus() {
        const userInfo = this.getUserInfo();
        const currentPage = window.location.pathname.split('/').pop();
        
        const publicPages = ['index.html', 'register.html', 'login.html', ''];
        
        const protectedPages = ['dashboard.html', 'tasks.html', 'profile.html', 'profile-setup.html'];
        
        if (userInfo.isLoggedIn && publicPages.includes(currentPage)) {
            if (userInfo.setupCompleted) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'profile-setup.html';
            }
        }
        
        if (!userInfo.isLoggedIn && protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
        
        if (userInfo.isLoggedIn && !userInfo.setupCompleted && currentPage === 'dashboard.html') {
            window.location.href = 'profile-setup.html';
        }
        
        if (userInfo.isLoggedIn && userInfo.setupCompleted && currentPage === 'profile-setup.html') {
            window.location.href = 'dashboard.html';
        }
    }

    redirectAfterProfileSetup() {
        window.location.href = 'dashboard.html';
    }

    redirectAfterLogin() {
        const userInfo = this.getUserInfo();
        if (userInfo.setupCompleted) {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'profile-setup.html';
        }
    }

    logout() {
        const userDataToKeep = {
            name: this.currentUser?.name,
            email: this.currentUser?.email,
            grade: this.currentUser?.grade,
            exam: this.currentUser?.exam,
            subjects: this.currentUser?.subjects,
            setupCompleted: this.currentUser?.setupCompleted,
            registeredAt: this.currentUser?.registeredAt
        };
        
        userDataToKeep.isLoggedIn = false;
        
        localStorage.setItem('bsk_user', JSON.stringify(userDataToKeep));
        this.currentUser = userDataToKeep;
        
        window.location.href = 'index.html';
    }

    showNotification(message, type = 'info') {
        let notification = document.getElementById('bsk-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'bsk-notification';
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                border-left: 4px solid #ff1493;
                z-index: 1002;
                transform: translateX(150%);
                transition: transform 0.3s ease;
                max-width: 300px;
            `;
            document.body.appendChild(notification);
        }
        
        const colors = {
            'info': '#ff1493',
            'success': '#4CAF50',
            'warning': '#FF9800',
            'error': '#f44336'
        };
        
        notification.style.borderLeftColor = colors[type] || colors.info;
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(150%)';
        }, 3000);
    }

    getUserInitials() {
        if (!this.currentUser?.name) return 'У';
        return this.currentUser.name.charAt(0).toUpperCase();
    }

    getWelcomeMessage() {
        const hour = new Date().getHours();
        let greeting = 'Добро пожаловать';
        
        if (hour < 12) greeting = 'Доброе утро';
        else if (hour < 18) greeting = 'Добрый день';
        else greeting = 'Добрый вечер';
        
        const userName = this.currentUser?.name || 'Ученик';
        return `${greeting}, ${userName}!`;
    }
}

const userManager = new UserManager();
