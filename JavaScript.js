document.addEventListener('DOMContentLoaded', function () {
    let db;

    // Открываем (или создаем) базу данных
    const request = indexedDB.open('BudgetAppDB', 1);

    // Обработчик события успешного открытия/создания базы данных
    request.onsuccess = function (event) {
        db = event.target.result;
        console.log('Database opened successfully');
    };

    // Обработчик события обновления базы данных (например, если ее версия изменилась)
    request.onupgradeneeded = function (event) {
        db = event.target.result;

        // Создаем объектное хранилище для бюджетных данных
        const budgetStore = db.createObjectStore('budget', { keyPath: 'id', autoIncrement: true });

        // Создаем индекс для поиска по категории
        budgetStore.createIndex('category', 'category', { unique: false });

        console.log('Database upgrade complete');
    };

    // Обработчик события ошибки при открытии/создании базы данных
    request.onerror = function (event) {
        console.error('Error opening database:', event.target.error);
    };

    // Добавляем обработчик формы для добавления записей
    document.querySelector('.budget form').addEventListener('submit', function (event) {
        event.preventDefault();

        const selectedCategory = document.querySelector('.budget form .selected');
        const amount = document.getElementById('amount').value;

        if (selectedCategory && amount.trim() !== '') {
            // Сохраняем данные в базу данных
            saveDataToDB(selectedCategory.textContent, amount);
        } else {
            alert('Выберите категорию и введите сумму перед добавлением.');
        }
    });

    // Функция для сохранения данных в базу данных
    function saveDataToDB(category, amount) {
        // Создаем транзакцию для записи данных
        const transaction = db.transaction(['budget'], 'readwrite');
        const budgetStore = transaction.objectStore('budget');

        // Добавляем запись в базу данных
        const request = budgetStore.add({ category: category, amount: amount + ' грн' });

        // Обработчик события успешного добавления записи
        request.onsuccess = function (event) {
            console.log('Data added to database successfully');
            // Вызываем функцию для обновления интерфейса
            updateBudgetList();
        };

        // Обработчик события ошибки при добавлении записи
        request.onerror = function (event) {
            console.error('Error adding data to database:', event.target.error);
        };
    }

    // Функция для обновления списка бюджета из базы данных
    function updateBudgetList() {
        const transaction = db.transaction(['budget'], 'readonly');
        const budgetStore = transaction.objectStore('budget');

        const request = budgetStore.getAll();

        request.onsuccess = function (event) {
            const data = event.target.result;
            const budgetList = document.querySelector('.budgets');

            // Очищаем текущий список бюджета
            budgetList.innerHTML = '';

            // Вставляем новые записи
            data.forEach(function (item) {
                const newItem = document.createElement('li');
                newItem.innerHTML = `<span class="category">${item.category}</span><span class="amount">${item.amount}</span>`;
                budgetList.appendChild(newItem);
            });
        };

        request.onerror = function (event) {
            console.error('Error retrieving data from database:', event.target.error);
        };
    }
});

// Функция для переключения выбранной категории
function toggleSelection(button) {
    button.classList.toggle('selected');
}
