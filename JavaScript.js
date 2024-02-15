function toggleSelection(button) {
    button.classList.toggle('selected');
}

document.querySelector('.budget form').addEventListener('submit', function (event) {
    event.preventDefault();
    
    // Получаем значения из формы
    const category = document.querySelector('.budget form .selected').textContent;
    const amount = document.getElementById('amount').value;

    // Проверка, чтобы не добавить пустую запись
    if (category && amount) {
        // Создаем новый элемент списка бюджета
        const newItem = document.createElement('li');
        newItem.innerHTML = `<span class="category">${category}</span><span class="amount">${amount} грн</span>`;
        
        // Добавляем элемент в список бюджета
        document.querySelector('.budgets').appendChild(newItem);

        // Очищаем поля формы
        document.getElementById('amount').value = '';
        document.querySelector('.budget form .selected').classList.remove('selected');
    }
});

