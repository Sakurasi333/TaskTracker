// Класс для управления задачами
class TaskManager {
    constructor() {
        this.categories = JSON.parse(localStorage.getItem('categories')) || [];
        this.currentCategory = null;
        this.theme = localStorage.getItem('theme') || 'light';
        this.setupEventListeners();
        this.setupTheme();
        this.renderCategories();
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeInputs = document.querySelectorAll('input[name="theme"]');
        themeInputs.forEach(input => {
            input.checked = input.value === this.theme;
        });
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    // Сохранение данных в localStorage
    saveToStorage() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    // Создание новой категории
    createCategory() {
        document.getElementById('categoryModal').style.display = 'block';
    }

    // Сохранение категории
    saveCategory() {
        const title = document.getElementById('categoryTitle').value;
        if (title) {
            this.categories.push({
                id: Date.now(),
                name: title,
                tasks: []
            });
            this.saveToStorage();
            this.renderCategories();
        }
        this.closeCategoryModal();
    }

    // Переименование категории
    renameCategory(categoryId, element) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = category.name;
            input.className = 'category-title-input';
            input.style.width = '100%';
            input.style.padding = '0.5rem';
            input.style.border = 'none';
            input.style.background = 'transparent';
            input.style.color = 'var(--primary)';
            input.style.fontSize = '1.5rem';
            input.style.fontWeight = 'bold';
            
            element.replaceWith(input);
            input.focus();
            
            const saveEdit = () => {
                const newName = input.value.trim();
                if (newName === '') {
                    this.showDeleteCategoryConfirmModal(categoryId, category.name, category.tasks.length);
                } else if (newName !== category.name) {
                    category.name = newName;
                    this.saveToStorage();
                    this.renderCategories();
                } else {
                    this.renderCategories();
                }
            };
            
            input.addEventListener('blur', saveEdit);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveEdit();
                }
            });
        }
    }

    // Закрытие модального окна категории
    closeCategoryModal() {
        document.getElementById('categoryModal').style.display = 'none';
        document.getElementById('categoryTitle').value = '';
    }

    // Создание новой задачи
    createTask(categoryId) {
        this.currentCategory = categoryId;
        document.getElementById('taskModal').style.display = 'block';
    }

    // Сохранение задачи
    saveTask() {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;

        if (title) {
            const category = this.categories.find(c => c.id === this.currentCategory);
            if (category) {
                category.tasks.push({
                    id: Date.now(),
                    title,
                    description
                });
                this.saveToStorage();
                this.renderCategories();
            }
        }

        this.closeTaskModal();
    }

    // Удаление задачи
    deleteTask(categoryId, taskId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
            category.tasks = category.tasks.filter(t => t.id !== taskId);
            this.saveToStorage();
            this.renderCategories();
        }
        this.closeDeleteConfirmModal();
    }

    // Закрытие модального окна задачи
    closeTaskModal() {
        document.getElementById('taskModal').style.display = 'none';
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        this.currentCategory = null;
    }

    // Отрисовка категорий
    renderCategories() {
        const container = document.querySelector('.categories-container');
        container.innerHTML = '';

        this.categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category';
            categoryElement.dataset.categoryId = category.id;

            const tasksList = document.createElement('div');
            tasksList.className = 'tasks-list';
            tasksList.dataset.categoryId = category.id;

            category.tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = 'task';
                taskElement.dataset.taskId = task.id;
                taskElement.draggable = true;
                
                taskElement.innerHTML = `
                    <div class="task-content">
                        <h3>${task.title}</h3>
                        <p>${task.description}</p>
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn move-btn" onclick="taskManager.showMoveTaskModal(${task.id}, ${category.id})">
                            <i class="fas fa-arrows-alt"></i>
                        </button>
                        <button class="task-action-btn delete-btn" onclick="taskManager.showDeleteConfirmModal(${category.id}, ${task.id}, '${task.title}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;

                tasksList.appendChild(taskElement);
            });

            categoryElement.innerHTML = `
                <div class="category-header">
                    <h3 class="category-title" onclick="taskManager.renameCategory(${category.id}, this)">${category.name}</h3>
                    <button class="add-task-btn" onclick="taskManager.createTask(${category.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;

            categoryElement.appendChild(tasksList);
            container.appendChild(categoryElement);
        });
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        document.querySelector('.add-category-btn').addEventListener('click', () => this.createCategory());
        
        // Обработчики для модального окна категории
        document.querySelector('#categoryModal .btn.cancel').addEventListener('click', () => this.closeCategoryModal());
        document.querySelector('#categoryModal .btn.save').addEventListener('click', () => this.saveCategory());
        
        // Обработчики для модального окна задачи
        document.querySelector('#taskModal .btn.cancel').addEventListener('click', () => this.closeTaskModal());
        document.querySelector('#taskModal .btn.save').addEventListener('click', () => this.saveTask());

        // Обработчики для модального окна перемещения задачи
        document.querySelector('#moveTaskModal .btn.cancel').addEventListener('click', () => this.closeMoveTaskModal());
        document.querySelector('#moveTaskModal .btn.save').addEventListener('click', () => this.moveTask());

        // Обработчики для модального окна подтверждения удаления задачи
        document.querySelector('#deleteConfirmModal .btn.cancel').addEventListener('click', () => this.closeDeleteConfirmModal());
        document.querySelector('#deleteConfirmModal .btn.delete').addEventListener('click', () => {
            const modal = document.getElementById('deleteConfirmModal');
            this.deleteTask(parseInt(modal.dataset.categoryId), parseInt(modal.dataset.taskId));
        });

        // Обработчики для модального окна подтверждения удаления категории
        document.querySelector('#deleteCategoryConfirmModal .btn.cancel').addEventListener('click', () => this.closeDeleteCategoryConfirmModal());
        document.querySelector('#deleteCategoryConfirmModal .btn.delete').addEventListener('click', () => {
            const modal = document.getElementById('deleteCategoryConfirmModal');
            this.deleteCategory(parseInt(modal.dataset.categoryId));
        });

        // Обработчики для модального окна настроек
        document.querySelector('.settings-btn').addEventListener('click', () => this.showSettingsModal());
        document.querySelector('#settingsModal .btn.cancel').addEventListener('click', () => this.closeSettingsModal());

        // Обработчики для выбора темы
        document.querySelectorAll('input[name="theme"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        });

        // Закрытие модальных окон при клике вне их области
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                if (e.target.id === 'categoryModal') {
                    this.closeCategoryModal();
                } else if (e.target.id === 'taskModal') {
                    this.closeTaskModal();
                } else if (e.target.id === 'moveTaskModal') {
                    this.closeMoveTaskModal();
                } else if (e.target.id === 'deleteConfirmModal') {
                    this.closeDeleteConfirmModal();
                } else if (e.target.id === 'deleteCategoryConfirmModal') {
                    this.closeDeleteCategoryConfirmModal();
                } else if (e.target.id === 'settingsModal') {
                    this.closeSettingsModal();
                }
            }
        });
    }

    // Настройка drag and drop
    setupDragAndDrop() {
        const tasksLists = document.querySelectorAll('.tasks-list');
        
        tasksLists.forEach(list => {
            list.addEventListener('dragover', e => {
                e.preventDefault();
                const draggingTask = document.querySelector('.task.dragging');
                if (draggingTask) {
                    const afterElement = this.getDragAfterElement(list, e.clientY);
                    if (afterElement) {
                        list.insertBefore(draggingTask, afterElement);
                    } else {
                        list.appendChild(draggingTask);
                    }
                }
            });

            list.addEventListener('drop', e => {
                e.preventDefault();
                const taskId = parseInt(e.dataTransfer.getData('text/plain'));
                const sourceCategoryId = parseInt(e.dataTransfer.getData('source-category'));
                const targetCategoryId = parseInt(list.dataset.categoryId);
                
                if (sourceCategoryId !== targetCategoryId) {
                    const sourceCategory = this.categories.find(c => c.id === sourceCategoryId);
                    const targetCategory = this.categories.find(c => c.id === targetCategoryId);
                    
                    if (sourceCategory && targetCategory) {
                        const taskData = sourceCategory.tasks.find(t => t.id === taskId);
                        if (taskData) {
                            sourceCategory.tasks = sourceCategory.tasks.filter(t => t.id !== taskId);
                            targetCategory.tasks.push(taskData);
                            this.saveToStorage();
                            this.renderCategories();
                        }
                    }
                } else {
                    // Обновление порядка задач в той же категории
                    const category = this.categories.find(c => c.id === sourceCategoryId);
                    if (category) {
                        const taskIndex = category.tasks.findIndex(t => t.id === taskId);
                        if (taskIndex !== -1) {
                            const taskData = category.tasks[taskIndex];
                            category.tasks.splice(taskIndex, 1);
                            
                            const afterElement = this.getDragAfterElement(list, e.clientY);
                            if (afterElement) {
                                const afterIndex = category.tasks.findIndex(t => t.id === parseInt(afterElement.dataset.taskId));
                                category.tasks.splice(afterIndex, 0, taskData);
                            } else {
                                category.tasks.push(taskData);
                            }
                            
                            this.saveToStorage();
                            this.renderCategories();
                        }
                    }
                }
            });
        });

        document.addEventListener('dragstart', e => {
            if (e.target.classList.contains('task')) {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
                e.dataTransfer.setData('source-category', e.target.closest('.tasks-list').dataset.categoryId);
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        document.addEventListener('dragend', e => {
            if (e.target.classList.contains('task')) {
                e.target.classList.remove('dragging');
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    showMoveTaskModal(taskId, currentCategoryId) {
        const modal = document.getElementById('moveTaskModal');
        const select = document.getElementById('targetCategory');
        
        // Очищаем и заполняем select категориями
        select.innerHTML = '<option value="">Выберите категорию</option>';
        this.categories.forEach(category => {
            if (category.id !== currentCategoryId) {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            }
        });

        modal.style.display = 'block';
        
        // Сохраняем ID задачи и текущей категории
        modal.dataset.taskId = taskId;
        modal.dataset.currentCategoryId = currentCategoryId;
    }

    moveTask() {
        const modal = document.getElementById('moveTaskModal');
        const select = document.getElementById('targetCategory');
        const taskId = parseInt(modal.dataset.taskId);
        const currentCategoryId = parseInt(modal.dataset.currentCategoryId);
        const targetCategoryId = parseInt(select.value);

        if (targetCategoryId) {
            const currentCategory = this.categories.find(c => c.id === currentCategoryId);
            const targetCategory = this.categories.find(c => c.id === targetCategoryId);
            
            if (currentCategory && targetCategory) {
                const task = currentCategory.tasks.find(t => t.id === taskId);
                if (task) {
                    // Удаляем задачу из текущей категории
                    currentCategory.tasks = currentCategory.tasks.filter(t => t.id !== taskId);
                    
                    // Добавляем задачу в новую категорию
                    targetCategory.tasks.push(task);
                    
                    // Сохраняем изменения
                    this.saveToStorage();
                    
                    // Закрываем модальное окно
                    this.closeMoveTaskModal();
                    
                    // Обновляем отображение с анимацией
                    this.renderCategories();
                    
                    // Находим перемещенную задачу и добавляем класс для анимации
                    setTimeout(() => {
                        const movedTask = document.querySelector(`[data-task-id="${taskId}"]`);
                        if (movedTask) {
                            movedTask.classList.add('moving');
                            setTimeout(() => {
                                movedTask.classList.remove('moving');
                            }, 500);
                        }
                    }, 100);
                }
            }
        }
    }

    closeMoveTaskModal() {
        const modal = document.getElementById('moveTaskModal');
        modal.style.display = 'none';
        document.getElementById('targetCategory').value = '';
    }

    showDeleteConfirmModal(categoryId, taskId, taskTitle) {
        const modal = document.getElementById('deleteConfirmModal');
        const text = document.getElementById('deleteConfirmText');
        text.textContent = `Вы уверены, что хотите удалить задачу "${taskTitle}"?`;
        
        modal.style.display = 'block';
        modal.dataset.categoryId = categoryId;
        modal.dataset.taskId = taskId;
    }

    showDeleteCategoryConfirmModal(categoryId, categoryName, tasksCount) {
        const modal = document.getElementById('deleteCategoryConfirmModal');
        const text = document.getElementById('deleteCategoryConfirmText');
        text.textContent = `Вы уверены, что хотите удалить категорию "${categoryName}"? В ней ${tasksCount} ${this.getTaskWord(tasksCount)}.`;
        
        modal.style.display = 'block';
        modal.dataset.categoryId = categoryId;
    }

    getTaskWord(count) {
        if (count % 10 === 1 && count % 100 !== 11) return 'задача';
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'задачи';
        return 'задач';
    }

    deleteCategory(categoryId) {
        this.categories = this.categories.filter(c => c.id !== categoryId);
        this.saveToStorage();
        this.renderCategories();
        this.closeDeleteCategoryConfirmModal();
    }

    closeDeleteConfirmModal() {
        const modal = document.getElementById('deleteConfirmModal');
        modal.style.display = 'none';
    }

    closeDeleteCategoryConfirmModal() {
        const modal = document.getElementById('deleteCategoryConfirmModal');
        modal.style.display = 'none';
    }

    showSettingsModal() {
        const modal = document.getElementById('settingsModal');
        modal.style.display = 'block';
    }

    closeSettingsModal() {
        const modal = document.getElementById('settingsModal');
        modal.style.display = 'none';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
}); 