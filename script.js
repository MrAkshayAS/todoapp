document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    let db;

    // Open (or create) the database
    const request = indexedDB.open('todoDB', 1);

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const objectStore = db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('task', 'task', { unique: false });
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        loadTodos();
    };

    request.onerror = function(event) {
        console.log('Error opening database:', event.target.errorCode);
    };

    // Load todos from the database
    function loadTodos() {
        const transaction = db.transaction(['todos'], 'readonly');
        const objectStore = transaction.objectStore('todos');
        const request = objectStore.getAll();

        request.onsuccess = function(event) {
            const todos = event.target.result;
            todos.forEach(todo => {
                addTodoToList(todo);
            });
        };
    }

    // Add todo to the DOM
    function addTodoToList(todo) {
        const li = document.createElement('li');
        li.textContent = todo.task;

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="ri-delete-bin-line"></i>';
        deleteButton.addEventListener('click', () => {
            deleteTodoFromDB(todo.id);
            todoList.removeChild(li);
        });

        li.appendChild(deleteButton);
        todoList.appendChild(li);
    }

    // Delete todo from the database
    function deleteTodoFromDB(id) {
        const transaction = db.transaction(['todos'], 'readwrite');
        const objectStore = transaction.objectStore('todos');
        objectStore.delete(id);
    }

    // Add new todo to the database
    todoForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const newTodo = {
            task: todoInput.value,
        };

        const transaction = db.transaction(['todos'], 'readwrite');
        const objectStore = transaction.objectStore('todos');
        const request = objectStore.add(newTodo);

        request.onsuccess = function(event) {
            newTodo.id = event.target.result;
            addTodoToList(newTodo);
        };

        todoInput.value = '';
    });
});
