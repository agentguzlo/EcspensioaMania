document.addEventListener('DOMContentLoaded', function () {
    // ... (ваш существующий код)

    // Добавляем обработчик формы для добавления записей
    document.querySelector('.budget form').addEventListener('submit', function (event) {
        event.preventDefault();

        const selectedCategory = document.querySelector('.budget form .selected');
        const amount = document.getElementById('amount').value;

        if (selectedCategory && amount.trim() !== '') {
            // Проверяем, существует ли уже запись с выбранной категорией
            const existingEntry = getEntryByCategory(selectedCategory.textContent);

            if (existingEntry) {
                // Если запись существует, обновляем ее
                updateDataInDB(existingEntry.id, selectedCategory.textContent, parseFloat(existingEntry.amount) + parseFloat(amount));
            } else {
                // Если записи не существует, добавляем новую
                saveDataToDB(selectedCategory.textContent, amount);
            }
        } else {
            alert('Выберите категорию и введите сумму перед добавлением.');
        }
    });

    // ... (ваш существующий код)

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
});
