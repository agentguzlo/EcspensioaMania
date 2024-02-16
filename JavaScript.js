let db;

document.addEventListener('DOMContentLoaded', function () {
    const request = indexedDB.open('budgetDB', 1);

    request.onupgradeneeded = function (event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('budget')) {
            const budgetStore = db.createObjectStore('budget', { keyPath: 'id', autoIncrement: true });
            budgetStore.createIndex('category', 'category', { unique: false });
        }
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        // Вызываем функцию для обновления списка бюджета при успешном открытии базы данных
        updateBudgetList();
    };

    request.onerror = function (event) {
        console.error('Error opening database:', event.target.error);
    };

    // Добавляем обработчик формы для добавления записей
    document.querySelector('.budget form').addEventListener('submit', function (event) {
        event.preventDefault();

        const selectedCategory = document.querySelector('.budget form .selected');
        const amount = document.getElementById('amount').value;

        if (selectedCategory && amount.trim() !== '') {
            // Проверяем, существует ли уже запись с выбранной категорией
            const category = selectedCategory.textContent;
            getEntryByCategory(category).then(existingEntry => {
                if (existingEntry) {
                    // Если запись существует, обновляем ее
                    updateDataInDB(existingEntry.id, category, parseFloat(existingEntry.amount) + parseFloat(amount));
                } else {
                    // Если записи не существует, добавляем новую
                    saveDataToDB(category, amount);
                }
            }).catch(error => {
                console.error('Error:', error);
            });
        } else {
            alert('Выберите категорію та введіть суму перед додаванням.');
        }
    });
});

// Функция для поиска записи по категории
function getEntryByCategory(category) {
    const transaction = db.transaction(['budget'], 'readonly');
    const budgetStore = transaction.objectStore('budget');
    const categoryIndex = budgetStore.index('category');

    const request = categoryIndex.get(category);

    return new Promise((resolve, reject) => {
        request.onsuccess = function (event) {
            const entry = event.target.result;
            resolve(entry);
        };

        request.onerror = function (event) {
            console.error('Error retrieving data from database:', event.target.error);
            reject(null);
        };
    });
}

// Функция для обновления данных в базе данных
function updateDataInDB(id, category, amount) {
    const transaction = db.transaction(['budget'], 'readwrite');
    const budgetStore = transaction.objectStore('budget');

    const request = budgetStore.put({ id: id, category: category, amount: amount + ' грн' });

    request.onsuccess = function (event) {
        console.log('Data updated in database successfully');
        updateBudgetList();
    };

    request.onerror = function (event) {
        console.error('Error updating data in database:', event.target.error);
    };
}

// Функция для сохранения данных в базе данных
function saveDataToDB(category, amount) {
    const transaction = db.transaction(['budget'], 'readwrite');
    const budgetStore = transaction.objectStore('budget');

    const request = budgetStore.add({ category: category, amount: amount + ' грн' });

    request.onsuccess = function (event) {
        console.log('Data saved to database successfully');
        updateBudgetList();
    };

    request.onerror = function (event) {
        console.error('Error saving data to database:', event.target.error);
    };
}

// Функция для обновления списка бюджета в интерфейсе
function updateBudgetList() {
    // Ваш код для обновления списка бюджета в интерфейсе
}
