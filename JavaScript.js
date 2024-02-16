document.addEventListener('DOMContentLoaded', function () {
    const categoryList = document.getElementById('categoryList');
    const expenseForm = document.getElementById('expenseForm');
    const categorySelect = document.getElementById('category');
    const expenseList = document.getElementById('expenseList');

    // Открываем или создаем базу данных 'expenseDB' и версию 1
    const request = indexedDB.open('expenseDB', 1);

    // Обработчик события обновления базы данных
    request.onupgradeneeded = function (event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('categories')) {
            db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('expenses')) {
            const expensesStore = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
            expensesStore.createIndex('category', 'category', { unique: false });
        }
    };

    // Обработчик события открытия базы данных
    request.onsuccess = function (event) {
        const db = event.target.result;

        // Заполняем список категорий из базы данных
        loadCategories(db);

        // Загружаем сохраненные расходы из базы данных
        loadExpenses(db);

        // Добавляем обработчик события подтверждения формы для добавления расходов
        expenseForm.addEventListener('submit', function (event) {
            event.preventDefault();
            addExpense(db);
        });
    };

    request.onerror = function (event) {
        console.error('Error opening database:', event.target.error);
    };
});

function loadCategories(db) {
    const transaction = db.transaction(['categories'], 'readonly');
    const categoryStore = transaction.objectStore('categories');

    const request = categoryStore.getAll();

    request.onsuccess = function (event) {
        const categories = event.target.result;

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    };
}

function loadExpenses(db) {
    const transaction = db.transaction(['expenses'], 'readonly');
    const expenseStore = transaction.objectStore('expenses');

    const request = expenseStore.getAll();

    request.onsuccess = function (event) {
        const expenses = event.target.result;

        expenses.forEach(expense => {
            renderExpense(expense);
        });
    };
}

function addExpense(db) {
    const categoryIndex = categorySelect.selectedIndex;
    const selectedCategory = categorySelect.options[categoryIndex].text;
    const amount = parseFloat(document.getElementById('amount').value);

    if (!isNaN(amount) && amount > 0) {
        const transaction = db.transaction(['expenses'], 'readwrite');
        const expenseStore = transaction.objectStore('expenses');

        const expense = {
            category: selectedCategory,
            amount: amount.toFixed(2), // Округляем до двух знаков после запятой
            timestamp: new Date().getTime()
        };

        const request = expenseStore.add(expense);

        request.onsuccess = function () {
            renderExpense(expense);
        };

        request.onerror = function (event) {
            console.error('Error adding expense to database:', event.target.error);
        };
    } else {
        alert('Please enter a valid amount greater than zero.');
    }
}

function renderExpense(expense) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<span>${expense.category}</span><span>${expense.amount} грн</span>`;
    expenseList.appendChild(listItem);
}
