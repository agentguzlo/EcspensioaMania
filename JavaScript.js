document.addEventListener('DOMContentLoaded', function () {
    const categorySelect = document.getElementById('category');
    const expenseForm = document.getElementById('expenseForm');
    const expenseList = document.getElementById('expenseList');
    const totalSpent = document.getElementById('totalSpent');
    const categorySpending = document.getElementById('categorySpending');

    const request = indexedDB.open('expenseDB', 2);

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

    request.onsuccess = function (event) {
        const db = event.target.result;

        loadOrAddCategories(db);
        loadExpenses(db);
        updateTotalSpent(db);
        updateCategorySpending(db);

        expenseForm.addEventListener('submit', function (event) {
            event.preventDefault();
            addExpense(db);
        });
    };

    request.onerror = function (event) {
        console.error('Error opening database:', event.target.error);
    };
});

function loadOrAddCategories(db) {
    const transaction = db.transaction(['categories'], 'readonly');
    const categoryStore = transaction.objectStore('categories');

    const request = categoryStore.getAll();

    request.onsuccess = function (event) {
        const categories = event.target.result;

        if (categories.length === 0) {
            const defaultCategories = ['Развлечения', 'Еда'];

            const addCategoriesTransaction = db.transaction(['categories'], 'readwrite');
            const addCategoriesStore = addCategoriesTransaction.objectStore('categories');

            defaultCategories.forEach(name => {
                addCategoriesStore.add({ name });
            });

            addCategoriesTransaction.oncomplete = function () {
                loadCategories(db);
            };
        } else {
            loadCategories(db);
        }
    };
}

function loadCategories(db) {
    const transaction = db.transaction(['categories'], 'readonly');
    const categoryStore = transaction.objectStore('categories');

    const request = categoryStore.getAll();

    request.onsuccess = function (event) {
        const categories = event.target.result;

        categorySelect.innerHTML = '';

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

    const request = expenseStore.openCursor();

    request.onsuccess = function (event) {
        const cursor = event.target.result;

        if (cursor) {
            renderExpense(cursor.value);
            cursor.continue();
        }
    };
}

function addExpense(db) {
    const amountInput = document.getElementById('amount');
    const categorySelect = document.getElementById('category');

    const amount = parseFloat(amountInput.value);

    if (!isNaN(amount) && amount > 0) {
        const category = categorySelect.options[categorySelect.selectedIndex].text;

        const transaction = db.transaction(['expenses'], 'readwrite');
        const expenseStore = transaction.objectStore('expenses');

        const expense = {
            category,
            amount: amount.toFixed(2) + ' грн',
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
    listItem.innerHTML = `<span>${expense.category}</span><span>${expense.amount}</span>`;
    expenseList.appendChild(listItem);
}

function updateTotalSpent(db) {
    const transaction = db.transaction(['expenses'], 'readonly');
    const expenseStore = transaction.objectStore('expenses');

    const request = expenseStore.getAll();

    request.onsuccess = function (event) {
        const expenses = event.target.result;
        const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0).toFixed(2) + ' грн';

        totalSpent.textContent = `Total Spent: ${total}`;
    };
}

function updateCategorySpending(db) {
    const transaction = db.transaction(['expenses'], 'readonly');
    const expenseStore = transaction.objectStore('expenses');

    const request = expenseStore.getAll();

    request.onsuccess = function (event) {
        const expenses = event.target.result;

        const categoryMap = new Map();

        expenses.forEach(expense => {
            const category = expense.category;
            const amount = parseFloat(expense.amount);

            if (categoryMap.has(category)) {
                categoryMap.set(category, categoryMap.get(category) + amount);
            } else {
                categoryMap.set(category, amount);
            }
        });

        categorySpending.innerHTML = '';

        categoryMap.forEach((amount, category) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${category}: ${amount.toFixed(2)} грн`;
            categorySpending.appendChild(listItem);
        });
    };
}
