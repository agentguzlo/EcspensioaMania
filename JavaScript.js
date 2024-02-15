document.addEventListener('DOMContentLoaded', function () {
    // Восстанавливаем данные из локального хранилища при загрузке страницы
    const storedData = JSON.parse(localStorage.getItem('budgetData')) || [];

    // Создаем объект для хранения сумм каждой категории
    const categorySum = {};

    // Создаем элементы списка для каждой сохраненной записи
    const budgetList = document.querySelector('.budgets');
    storedData.forEach(function (item) {
        const newItem = createBudgetItem(item.category, item.amount);
        budgetList.appendChild(newItem);

        // Суммируем суммы по категориям
        categorySum[item.category] = (categorySum[item.category] || 0) + parseFloat(item.amount);
    });

    // Добавляем обработчик формы для добавления записей
    document.querySelector('.budget form').addEventListener('submit', function (event) {
        event.preventDefault();

        const selectedCategory = document.querySelector('.budget form .selected');
        const amount = document.getElementById('amount').value;

        if (selectedCategory && amount.trim() !== '') {
            // Создаем новый элемент списка бюджета
            const newItem = createBudgetItem(selectedCategory.textContent, amount);
            budgetList.appendChild(newItem);

            // Очищаем поля формы и сбрасываем выбранную категорию
            document.getElementById('amount').value = '';
            selectedCategory.classList.remove('selected');

            // Сохраняем данные в локальное хранилище
            saveDataToLocal(newItem);

            // Суммируем суммы по категориям
            categorySum[selectedCategory.textContent] = (categorySum[selectedCategory.textContent] || 0) + parseFloat(amount);
        } else {
            alert('Выберите категорию и введите сумму перед добавлением.');
        }
    });

    // Функция для создания элемента списка бюджета
    function createBudgetItem(category, amount) {
        const newItem = document.createElement('li');
        newItem.innerHTML = `<span class="category">${category}</span><span class="amount">${amount} грн</span>`;
        return newItem;
    }

    // Функция для сохранения данных в локальное хранилище
    function saveDataToLocal(item) {
        // Получаем текущие данные из локального хранилища
        const storedData = JSON.parse(localStorage.getItem('budgetData')) || [];

        // Добавляем новую запись
        storedData.push({
            category: item.querySelector('.category').textContent,
            amount: item.querySelector('.amount').textContent
        });

        // Сохраняем обновленные данные в локальное хранилище
        localStorage.setItem('budgetData', JSON.stringify(storedData));
    }
});

// Функция для переключения выбранной категории
function toggleSelection(button) {
    button.classList.toggle('selected');
}
