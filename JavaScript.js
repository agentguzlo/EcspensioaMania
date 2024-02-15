document.addEventListener('DOMContentLoaded', function () {
    // Восстанавливаем данные из локального хранилища при загрузке страницы
    const storedData = JSON.parse(localStorage.getItem('budgetData')) || [];

    // Создаем элементы списка для каждой сохраненной записи
    const budgetList = document.querySelector('.budgets');
    storedData.forEach(function (item) {
        const newItem = document.createElement('li');
        newItem.innerHTML = `<span class="category">${item.category}</span><span class="amount">${item.amount}</span>`;
        budgetList.appendChild(newItem);
    });

    // Добавляем обработчик формы для добавления записей
    document.querySelector('.budget form').addEventListener('submit', function (event) {
        event.preventDefault();

        const selectedCategory = document.querySelector('.budget form .selected');
        const amount = document.getElementById('amount').value;

        if (selectedCategory && amount.trim() !== '') {
            // Создаем новый элемент списка бюджета
            const newItem = document.createElement('li');
            newItem.innerHTML = `<span class="category">${selectedCategory.textContent}</span><span class="amount">${amount} грн</span>`;

            // Добавляем элемент в список бюджета
            budgetList.appendChild(newItem);

            // Очищаем поля формы и сбрасываем выбранную категорию
            document.getElementById('amount').value = '';
            selectedCategory.classList.remove('selected');

            // Сохраняем данные в локальное хранилище
            saveDataToLocal(newItem);
        } else {
            alert('Выберите категорию и введите сумму перед добавлением.');
        }
    });

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
