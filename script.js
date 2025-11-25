// Обработчики для ссылок меню
document.getElementById('profileLink').addEventListener('click', function(e) {
    e.preventDefault();
    toggleMenu(); // Закрываем меню
    setTimeout(() => {
        window.location.href = 'register.html';
    }, 300);
});

document.getElementById('helpLink').addEventListener('click', function(e) {
    e.preventDefault();
    toggleMenu(); // Закрываем меню
    setTimeout(() => {
        window.location.href = 'help.html';
    }, 300);
});

// Функция переключения меню
function toggleMenu() {
    dropdownMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = dropdownMenu.classList.contains('active') ? 'hidden' : '';
}