// userManager.js
class UserManager {
    constructor() {
        this.currentUser = null;
        this.loadUserData();
        this.checkAuthStatus();
    }

    // Загрузка данных пользователя из LocalStorage
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

    // Сохранение данных пользователя в LocalStorage
    saveUserData(userData) {
        this.currentUser = {...this.currentUser, ...userData};
        localStorage.setItem('bsk_user', JSON.stringify(this.currentUser));
        console.log('Пользователь сохранен:', this.currentUser);
    }

    // Регистрация пользователя
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

    // Вход пользователя
    loginUser(email, password) {
        // В реальном приложении здесь была бы проверка с сервером
        const userData = {
            email: email,
            isLoggedIn: true,
            lastLogin: new Date().toISOString()
        };
        
        this.saveUserData(userData);
        return true;
    }

    // Настройка профиля
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

    // Определение уровня сложности на основе класса и экзамена
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

    // Проверка настроен ли профиль
    isProfileSetup() {
        return this.currentUser?.setupCompleted || false;
    }

    // Проверка авторизован ли пользователь
    isLoggedIn() {
        return this.currentUser?.isLoggedIn || false;
    }

    // Получение данных для фильтрации заданий
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

    // Получение информации о пользователе для отображения
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

    // Проверка статуса авторизации и перенаправление
    checkAuthStatus() {
        const userInfo = this.getUserInfo();
        const currentPage = window.location.pathname.split('/').pop();
        
        // Список публичных страниц (доступны без авторизации)
        const publicPages = ['index.html', 'register.html', 'login.html', ''];
        
        // Список защищенных страниц (требуют авторизации)
        const protectedPages = ['dashboard.html', 'tasks.html', 'profile.html', 'profile-setup.html'];
        
        // Если пользователь авторизован и пытается зайти на публичные страницы
        if (userInfo.isLoggedIn && publicPages.includes(currentPage)) {
            if (userInfo.setupCompleted) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'profile-setup.html';
            }
        }
        
        // Если пользователь не авторизован и пытается зайти на защищенные страницы
        if (!userInfo.isLoggedIn && protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
        
        // Если профиль не настроен, но пользователь пытается зайти на дашборд
        if (userInfo.isLoggedIn && !userInfo.setupCompleted && currentPage === 'dashboard.html') {
            window.location.href = 'profile-setup.html';
        }
        
        // Если профиль настроен, но пользователь на странице настройки
        if (userInfo.isLoggedIn && userInfo.setupCompleted && currentPage === 'profile-setup.html') {
            window.location.href = 'dashboard.html';
        }
    }

    // Перенаправление после успешной настройки профиля
    redirectAfterProfileSetup() {
        window.location.href = 'dashboard.html';
    }

    // Перенаправление после успешного входа
    redirectAfterLogin() {
        const userInfo = this.getUserInfo();
        if (userInfo.setupCompleted) {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'profile-setup.html';
        }
    }

    // Выход из системы
    logout() {
        // Сохраняем некоторые данные перед выходом
        const userDataToKeep = {
            name: this.currentUser?.name,
            email: this.currentUser?.email,
            grade: this.currentUser?.grade,
            exam: this.currentUser?.exam,
            subjects: this.currentUser?.subjects,
            setupCompleted: this.currentUser?.setupCompleted,
            registeredAt: this.currentUser?.registeredAt
        };
        
        // Устанавливаем флаг выхода
        userDataToKeep.isLoggedIn = false;
        
        // Сохраняем данные и перенаправляем
        localStorage.setItem('bsk_user', JSON.stringify(userDataToKeep));
        this.currentUser = userDataToKeep;
        
        window.location.href = 'index.html';
    }

    // Показать уведомление (утилитарный метод)
    showNotification(message, type = 'info') {
        // Создаем элемент уведомления если его нет
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
        
        // Устанавливаем цвет в зависимости от типа
        const colors = {
            'info': '#ff1493',
            'success': '#4CAF50',
            'warning': '#FF9800',
            'error': '#f44336'
        };
        
        notification.style.borderLeftColor = colors[type] || colors.info;
        notification.textContent = message;
        notification.classList.add('show');
        
        // Показываем уведомление
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Скрываем через 3 секунды
        setTimeout(() => {
            notification.style.transform = 'translateX(150%)';
        }, 3000);
    }

    // Получение инициалов для аватара
    getUserInitials() {
        if (!this.currentUser?.name) return 'У';
        return this.currentUser.name.charAt(0).toUpperCase();
    }

    // Получение приветственного сообщения
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

// Создаем глобальный экземпляр
const userManager = new UserManager();