document.addEventListener('DOMContentLoaded', function () {
    // Восстанавливаем данные из локального хранилища при загрузке страницы
    const storedData = JSON.parse(localStorage.getItem('budgetData')) || [];

    // Создаем объект для хранения сумм каждой категории
    const categorySum = {};

    // Создаем элементы списка для каждой сохраненной записи
    const budgetList = document.querySelector('.budgets');
    storedData.forEach(function (item) {
        addBudgetItem(item.category, item.amount);
        // Суммируем суммы по категориям
        categorySum[item.category] = (categorySum[item.category] || 0) + parseFloat(item.amount);
    });

    // Добавляем обработчик формы для добавления записей
    document.querySelector('.budget form').addEventListener('submit', function (event) {
        event.preventDefault();

        const selectedCategory = document.querySelector('.budget form .selected');
        const amount = document.getElementById('amount').value;

        if (selectedCategory && amount.trim() !== '') {
            // Очищаем поля формы и сбрасываем выбранную категорию
            document.getElementById('amount').value = '';
            selectedCategory.classList.remove('selected');

            // Сохраняем данные в локальное хранилище
            saveDataToLocal(selectedCategory.textContent, amount);

            // Суммируем суммы по категориям
            categorySum[selectedCategory.textContent] = (categorySum[selectedCategory.textContent] || 0) + parseFloat(amount);

            // Обновляем или добавляем элемент в список бюджета
            updateBudgetList(selectedCategory.textContent, categorySum[selectedCategory.textContent]);
        } else {
            alert('Выберите категорию и введите сумму перед добавлением.');
        }
    });

    // Функция для сохранения данных в локальное хранилище
    function saveDataToLocal(category, amount) {
        // Получаем текущие данные из локального хранилища
        const storedData = JSON.parse(localStorage.getItem('budgetData')) || [];

        // Добавляем новую запись
        storedData.push({
            category: category,
            amount: amount + ' грн'
        });

        // Сохраняем обновленные данные в локальное хранилище
        localStorage.setItem('budgetData', JSON.stringify(storedData));
    }

    // Функция для обновления списка бюджета
    function updateBudgetList(category, amount) {
        const existingItem = document.querySelector(`.budgets li .category:contains('${category}')`);

        if (existingItem) {
            // Обновляем существующий элемент
            existingItem.nextElementSibling.textContent = amount + ' грн';
        } else {
            // Создаем новый элемент
            addBudgetItem(category, amount);
        }
    }

    // Функция для создания элемента списка бюджета
    function addBudgetItem(category, amount) {
        const newItem = document.createElement('li');
        newItem.innerHTML = `<span class="category">${category}</span><span class="amount">${amount} грн</span>`;
        budgetList.appendChild(newItem);
    }
});

// Функция для переключения выбранной категории
function toggleSelection(button) {
    button.classList.toggle('selected');
}

// Расширение для поддержки :contains в поиске элементов
jQuery.expr[':'].contains = function (a, i, m) {
    return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};
