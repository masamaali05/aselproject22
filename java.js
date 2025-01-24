document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const todoList = document.getElementById('todoList');
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const deleteDoneBtn = document.getElementById('deleteDoneBtn');
    const filterAll = document.getElementById('filterAll');
    const filterDone = document.getElementById('filterDone');
    const filterTodo = document.getElementById('filterTodo');

    const validationError = document.createElement('div');
    validationError.className = 'error';
    taskInput.parentElement.appendChild(validationError);

    const createModal = (message, onConfirm) => {
        const modal = document.createElement('div');
        modal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const modalMessage = document.createElement('p');
        modalMessage.textContent = message;

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Confirm';
        confirmBtn.className = 'modal-confirm';
        confirmBtn.addEventListener('click', () => {
            onConfirm();
            document.body.removeChild(modal);
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'modal-cancel';
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modalContent.appendChild(modalMessage);
        modalContent.appendChild(confirmBtn);
        modalContent.appendChild(cancelBtn);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    };

    const loadTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        if (tasks.length === 0) showNoTasksMessage();
        tasks.forEach(task => renderTask(task));
    };

    const saveTasks = () => {
        const tasks = Array.from(todoList.children).map(item => ({
            text: item.querySelector('span').textContent,
            done: item.classList.contains('done')
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTask = (task) => {
        const li = document.createElement('li');
        li.className = task.done ? 'done' : '';

        const span = document.createElement('span');
        span.textContent = task.text;
        li.appendChild(span);

        const actions = document.createElement('div');
        actions.className = 'actions';

        const doneCheckbox = document.createElement('input');
        doneCheckbox.type = 'checkbox';
        doneCheckbox.checked = task.done;
        doneCheckbox.className = 'done';
        doneCheckbox.addEventListener('click', () => {
            li.classList.toggle('done');
            saveTasks();
        });

        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.className = 'edit';
        editBtn.addEventListener('click', () => {
            const newText = prompt('Edit task:', span.textContent);
            if (newText && newText.length >= 5 && !/^[0-9]/.test(newText)) {
                span.textContent = newText;
                saveTasks();
            } else {
                alert('Task must be at least 5 characters long and not start with a number.');
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.className = 'delete';
        deleteBtn.addEventListener('click', () => {
            createModal('Are you sure you want to delete this task?', () => {
                li.remove();
                saveTasks();
                checkEmptyList();
            });
        });

        actions.appendChild(doneCheckbox);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(actions);
        todoList.appendChild(li);
    };

    const showNoTasksMessage = () => {
        const li = document.createElement('li');
        li.textContent = 'No tasks';
        li.className = 'no-tasks-message';
        todoList.appendChild(li);
    };

    const checkEmptyList = () => {
        if (todoList.children.length === 0) {
            showNoTasksMessage();
        }
    };

    addTaskBtn.addEventListener('click', () => {
        const text = taskInput.value.trim();
        validationError.textContent = '';
        if (!text) {
            validationError.textContent = 'Task cannot be empty.';
            return;
        } else if (text.length < 5) {
            validationError.textContent = 'Task must be at least 5 characters long.';
            return;
        } else if (/^[0-9]/.test(text)) {
            validationError.textContent = 'Task cannot start with a number.';
            return;
        } else if (/^[\u0600-\u06FF\u0750-\u077F]/.test(text)) {
            validationError.textContent = 'Task cannot be in Arabic.';
            return;
        }

        const noTasksMessage = document.querySelector('.no-tasks-message');
        if (noTasksMessage) noTasksMessage.remove();

        renderTask({ text, done: false });
        saveTasks();
        taskInput.value = '';
    });

    deleteAllBtn.addEventListener('click', () => {
        const tasks = todoList.children;

        if (tasks.length === 0 || (tasks.length === 1 && tasks[0].classList.contains('no-tasks-message'))) {
            alert('No tasks to delete.');
            return;
        }

        createModal('Are you sure you want to delete all tasks?', () => {
            todoList.innerHTML = '';
            saveTasks();
            showNoTasksMessage();
        });
    });

    deleteDoneBtn.addEventListener('click', () => {
        let hasDoneTasks = false;
        const doneTasks = Array.from(todoList.children).filter(item => item.classList.contains('done'));

        if (doneTasks.length === 0) {
            alert('No done tasks to delete.');
            return;
        }

        createModal('Are you sure you want to delete all done tasks?', () => {
            doneTasks.forEach(item => item.remove());
            saveTasks();
            checkEmptyList();
        });
    });

    filterAll.addEventListener('click', () => {
        Array.from(todoList.children).forEach(item => {
            item.style.display = '';
        });
    });

    filterDone.addEventListener('click', () => {
        let hasDoneTasks = false;
        Array.from(todoList.children).forEach(item => {
            if (item.classList.contains('done')) {
                item.style.display = '';
                hasDoneTasks = true;
            } else {
                item.style.display = 'none';
            }
        });

        if (!hasDoneTasks) {
            alert('No done tasks.');
        }
    });

    filterTodo.addEventListener('click', () => {
        Array.from(todoList.children).forEach(item => {
            item.style.display = item.classList.contains('done') ? 'none' : '';
        });
    });

    loadTasks();
});
