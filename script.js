// --- DOM Elements ---
const loginPage = document.getElementById('login-page');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const loginMessage = document.getElementById('login-message');

const appContainer = document.getElementById('app-container');
const currentUsernameSpan = document.getElementById('current-username');
const logoutBtn = document.getElementById('logout-btn');
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const category = document.getElementById('category');
const dateInput = document.getElementById('date');
const filterDateInput = document.getElementById('filter-date');
const filterCategoryInput = document.getElementById('filter-category');
const filterTypeInput = document.getElementById('filter-type');
const filterMinAmountInput = document.getElementById('filter-min-amount');
const filterMaxAmountInput = document.getElementById('filter-max-amount');
const searchInput = document.getElementById('search-input');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const downloadReportBtn = document.getElementById('download-report-btn');
const downloadPdfReportBtn = document.getElementById('download-pdf-report-btn');
const lineChartCanvas = document.getElementById('line-chart');
const budgetInput = document.getElementById('budget-input');
const setBudgetBtn = document.getElementById('set-budget-btn');
const budgetDisplay = document.getElementById('budget-display');
const budgetRemaining = document.getElementById('budget-remaining').querySelector('span');
const savingsInput = document.getElementById('savings-input');
const setSavingsBtn = document.getElementById('set-savings-btn');
const savingsGoalDisplay = document.getElementById('savings-goal-display');
const savingsProgress = document.getElementById('savings-progress').querySelector('span');
const tipsAlerts = document.getElementById('tips-alerts');

// Category Modal Elements
const categoryModal = document.getElementById('category-modal');
const closeCategoryModalBtn = categoryModal.querySelector('.close-button');
const manageCategoriesBtn = document.getElementById('manage-categories-btn');
const newCategoryInput = document.getElementById('new-category-input');
const addCategoryBtn = document.getElementById('add-category-btn');
const categoryList = document.getElementById('category-list');


// --- Global Variables ---
let currentUser = null;
let transactions = [];
let monthlyBudget = 0;
let savingsGoal = 0;
let lineChart = null; // To store the Chart.js instance for line chart
let customCategories = ['Income', 'Food', 'Transport', 'Shopping', 'Utilities', 'Rent', 'Entertainment', 'Healthcare', 'Education', 'Savings', 'Other']; // Default categories

// --- Utility Functions ---

// Show a message box
function showMessage(element, message, type = 'info') {
    element.textContent = message;
    element.className = `message-box ${type}`; // Reset classes and add new ones
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000); // Hide after 3 seconds
}

// Generate a unique ID for transactions
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Format currency
function formatCurrency(amount) {
    return `₹${Math.abs(amount).toFixed(2)}`;
}

// --- Local Storage Management ---

// Save current user's data to localStorage
function saveUserData() {
    if (currentUser) {
        const userData = {
            transactions: transactions,
            monthlyBudget: monthlyBudget,
            savingsGoal: savingsGoal,
            darkMode: document.body.classList.contains('dark-mode'),
            categories: customCategories // Save custom categories
        };
        localStorage.setItem(`expenseTracker_data_${currentUser}`, JSON.stringify(userData));
    }
}

// Load current user's data from localStorage
function loadUserData() {
    if (currentUser) {
        const storedData = localStorage.getItem(`expenseTracker_data_${currentUser}`);
        if (storedData) {
            const userData = JSON.parse(storedData);
            transactions = userData.transactions || [];
            monthlyBudget = userData.monthlyBudget || 0;
            savingsGoal = userData.savingsGoal || 0;
            if (userData.darkMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            customCategories = userData.categories || ['Income', 'Food', 'Transport', 'Shopping', 'Utilities', 'Rent', 'Entertainment', 'Healthcare', 'Education', 'Savings', 'Other'];
        } else {
            // Reset if no data found for the user
            transactions = [];
            monthlyBudget = 0;
            savingsGoal = 0;
            document.body.classList.remove('dark-mode');
            customCategories = ['Income', 'Food', 'Transport', 'Shopping', 'Utilities', 'Rent', 'Entertainment', 'Healthcare', 'Education', 'Savings', 'Other'];
        }
    }
}

// --- Login/Logout Functionality ---

function loginUser() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showMessage(loginMessage, 'Please enter both username and password.', 'error');
        return;
    }

    const storedUser = localStorage.getItem(`expenseTracker_user_${username}`);

    if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.password === password) {
            currentUser = username;
            localStorage.setItem('expenseTracker_currentUser', currentUser);
            currentUsernameSpan.textContent = currentUser;
            loadUserData(); // Load data for the logged-in user
            appContainer.classList.remove('hidden');
            loginPage.classList.add('hidden');
            init(); // Initialize the app with loaded data
            showMessage(loginMessage, `Welcome, ${currentUser}!`, 'success');
        } else {
            showMessage(loginMessage, 'Incorrect password.', 'error');
        }
    } else {
        // New user, register them
        const newUser = { username: username, password: password };
        localStorage.setItem(`expenseTracker_user_${username}`, JSON.stringify(newUser));
        currentUser = username;
        localStorage.setItem('expenseTracker_currentUser', currentUser);
        currentUsernameSpan.textContent = currentUser;
        loadUserData(); // Load data (will be empty for new user)
        appContainer.classList.remove('hidden');
        loginPage.classList.add('hidden');
        init(); // Initialize the app
        showMessage(loginMessage, `Welcome, ${currentUser}! Your account has been created.`, 'success');
    }
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('expenseTracker_currentUser');
    appContainer.classList.add('hidden');
    loginPage.classList.remove('hidden');
    usernameInput.value = ''; // Clear username input
    passwordInput.value = ''; // Clear password input
    showMessage(loginMessage, 'Logged out successfully.', 'info');
}

// --- Transaction Management ---

// Add transaction to DOM list
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');

    item.classList.add(transaction.amount < 0 ? 'expense' : 'income', 'list-item');

    item.innerHTML = `
        <div>
            ${transaction.text} <br>
            <span class="text-xs text-gray-500 dark:text-gray-400">${transaction.category} - ${transaction.date}</span>
        </div>
        <span>${sign}${formatCurrency(transaction.amount)}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    `;

    list.appendChild(item);
}

// Update the balance, income, expense, budget, and savings totals
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);

    const total = amounts.reduce((acc, item) => (acc += item), 0);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
    const expense = amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1;

    balance.innerText = `${formatCurrency(total)}`;
    money_plus.innerText = `${formatCurrency(income)}`;
    money_minus.innerText = `${formatCurrency(expense)}`;

    // Update Budget
    budgetDisplay.innerText = `${formatCurrency(monthlyBudget)}`;
    const currentMonthExpenses = transactions
        .filter(t => t.amount < 0 && new Date(t.date).getMonth() === new Date().getMonth() && new Date(t.date).getFullYear() === new Date().getFullYear())
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const remainingBudget = monthlyBudget - currentMonthExpenses;
    budgetRemaining.innerText = `${formatCurrency(remainingBudget)}`;
    budgetRemaining.classList.remove('text-green-500', 'text-red-500');
    if (remainingBudget >= 0) {
        budgetRemaining.classList.add('text-green-500');
    } else {
        budgetRemaining.classList.add('text-red-500');
    }


    // Update Savings Goal
    savingsGoalDisplay.innerText = `${formatCurrency(savingsGoal)}`;
    const totalSavings = transactions
        .filter(t => t.category === 'Savings' && t.amount > 0)
        .reduce((acc, t) => acc + t.amount, 0);
    const savingsPercentage = savingsGoal > 0 ? ((totalSavings / savingsGoal) * 100).toFixed(2) : 0;
    savingsProgress.innerText = `${savingsPercentage}%`;
    savingsProgress.classList.remove('text-green-500', 'text-red-500');
    if (savingsPercentage >= 100) {
        savingsProgress.classList.add('text-green-500');
    } else {
        savingsProgress.classList.add('text-red-500');
    }


    saveUserData(); // Save data after every update
    renderLineChart(); // Update line chart
    displayTips(); // Update tips
}

// Add a new transaction
function addTransaction(e) {
    e.preventDefault();

    if (text.value.trim() === '' || amount.value.trim() === '' || category.value.trim() === '' || dateInput.value.trim() === '') {
        showMessage(tipsAlerts, 'Please fill in all fields (description, amount, category, date).', 'error');
    } else {
        const transaction = {
            id: generateID(),
            text: text.value,
            amount: +amount.value, // Convert string to number
            category: category.value,
            date: dateInput.value
        };

        transactions.push(transaction);

        // Filter and display transactions based on the current filter date
        filterTransactions();

        updateValues();

        // Clear form fields
        text.value = '';
        amount.value = '';
        category.value = 'Income'; // Reset to default
        dateInput.value = ''; // Clear date
    }
}

// Remove transaction by ID
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    filterTransactions(); // Re-filter and display
    updateValues(); // Update totals
}

// Filter transactions by date, category, amount range, type, and search term
function filterTransactions() {
    const filterDate = filterDateInput.value;
    const filterCategory = filterCategoryInput.value;
    const filterType = filterTypeInput.value;
    const filterMinAmount = parseFloat(filterMinAmountInput.value);
    const filterMaxAmount = parseFloat(filterMaxAmountInput.value);
    const searchTerm = searchInput.value.trim().toLowerCase();

    list.innerHTML = ''; // Clear existing list items

    let filtered = transactions;

    // Apply date filter
    if (filterDate) {
        filtered = filtered.filter(transaction => transaction.date === filterDate);
    }

    // Apply category filter
    if (filterCategory) {
        filtered = filtered.filter(transaction => transaction.category === filterCategory);
    }

    // Apply type filter
    if (filterType) {
        filtered = filtered.filter(transaction => {
            if (filterType === 'income') return transaction.amount > 0;
            if (filterType === 'expense') return transaction.amount < 0;
            return true;
        });
    }

    // Apply amount range filter
    if (!isNaN(filterMinAmount)) {
        filtered = filtered.filter(transaction => Math.abs(transaction.amount) >= filterMinAmount);
    }
    if (!isNaN(filterMaxAmount)) {
        filtered = filtered.filter(transaction => Math.abs(transaction.amount) <= filterMaxAmount);
    }

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(transaction =>
            transaction.text.toLowerCase().includes(searchTerm)
        );
    }

    // Sort transactions by date in descending order
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
        list.innerHTML = '<li class="text-center text-gray-500 dark:text-gray-400">No transactions found for the selected filters.</li>';
    } else {
        filtered.forEach(addTransactionDOM);
    }
}

// --- Budget & Savings Goals ---
function setBudget() {
    const newBudget = parseFloat(budgetInput.value);
    if (!isNaN(newBudget) && newBudget >= 0) {
        monthlyBudget = newBudget;
        updateValues();
        showMessage(tipsAlerts, 'Monthly budget updated successfully!', 'success');
    } else {
        showMessage(tipsAlerts, 'Please enter a valid positive number for budget.', 'error');
    }
    budgetInput.value = '';
}

function setSavingsGoal() {
    const newGoal = parseFloat(savingsInput.value);
    if (!isNaN(newGoal) && newGoal >= 0) {
        savingsGoal = newGoal;
        updateValues();
        showMessage(tipsAlerts, 'Savings goal updated successfully!', 'success');
    } else {
        showMessage(tipsAlerts, 'Please enter a valid positive number for savings goal.', 'error');
    }
    savingsInput.value = '';
}

// --- Visual Analytics (Chart.js) ---
// Render line chart for trends over time
function renderLineChart() {
    const monthlyData = {}; // { 'YYYY-MM': { income: 0, expense: 0 } }

    transactions.forEach(t => {
        const date = new Date(t.date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { income: 0, expense: 0 };
        }

        if (t.amount > 0) {
            monthlyData[monthYear].income += t.amount;
        } else {
            monthlyData[monthYear].expense += Math.abs(t.amount);
        }
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();

    const incomeData = sortedMonths.map(month => monthlyData[month].income);
    const expenseData = sortedMonths.map(month => monthlyData[month].expense);

    if (lineChart) {
        lineChart.destroy(); // Destroy previous chart instance
    }

    lineChart = new Chart(lineChartCanvas, {
        type: 'line',
        data: {
            labels: sortedMonths,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#28a745', // Green
                    backgroundColor: 'rgba(40, 167, 69, 0.2)',
                    fill: true,
                    tension: 0.1
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#dc3545', // Red
                    backgroundColor: 'rgba(220, 53, 69, 0.2)',
                    fill: true,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#e2e8f0' : '#4a5568'
                    }
                },
                title: {
                    display: false,
                    text: 'Financial Trends Over Time'
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#cbd5e0' : '#4a5568'
                    },
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#cbd5e0' : '#4a5568'
                    },
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}


// --- Savings Tips & Budget Alerts ---
function displayTips() {
    const currentMonthExpenses = transactions
        .filter(t => t.amount < 0 && new Date(t.date).getMonth() === new Date().getMonth() && new Date(t.date).getFullYear() === new Date().getFullYear())
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const remainingBudget = monthlyBudget - currentMonthExpenses;

    const totalSavings = transactions
        .filter(t => t.category === 'Savings' && t.amount > 0)
        .reduce((acc, t) => acc + t.amount, 0);

    tipsAlerts.style.display = 'none'; // Hide by default

    const tips = [
        "Create a budget and stick to it! Knowing where your money goes is the first step.",
        "Track every expense, no matter how small. Little leaks can sink a big ship.",
        "Set clear financial goals: a new car, a down payment, or an emergency fund.",
        "Automate your savings. Set up a recurring transfer to your savings account.",
        "Review your subscriptions regularly. Cancel what you don't use.",
        "Cook at home more often. Eating out can be a significant expense.",
        "Compare prices before buying. Use online tools to find the best deals.",
        "Avoid impulse purchases. Give yourself a 24-hour rule before buying non-essentials.",
        "Pay off high-interest debt first. The interest can eat into your savings.",
        "Build an emergency fund. Aim for 3-6 months of living expenses.",
        "Invest in yourself through education or skills that can increase your income.",
        "Negotiate bills: call your internet, cable, or insurance providers for better rates.",
        "Use public transport or carpool to save on fuel and maintenance.",
        "Sell unused items around your home. Declutter and earn some extra cash.",
        "Plan your meals to reduce food waste and grocery costs."
    ];

    let tipMessage = '';
    let tipType = 'info';

    if (monthlyBudget > 0 && remainingBudget < 0) {
        tipMessage = `Budget Alert: You are over budget by ${formatCurrency(Math.abs(remainingBudget))} this month! Review your spending in high-expense categories.`;
        tipType = 'error';
    } else if (monthlyBudget > 0 && remainingBudget < monthlyBudget * 0.2 && remainingBudget >= 0) {
        tipMessage = `Budget Tip: You're close to your budget limit! Track your spending closely for the rest of the month. Consider a "no-spend" day.`;
        tipType = 'info';
    } else if (savingsGoal > 0 && totalSavings < savingsGoal * 0.5) {
        tipMessage = `Savings Tip: You've saved ${formatCurrency(totalSavings)} towards your goal of ${formatCurrency(savingsGoal)}. Try setting up an automatic transfer to your savings account.`;
        tipType = 'info';
    } else if (savingsGoal > 0 && totalSavings >= savingsGoal) {
         tipMessage = `Congratulations! You've reached your savings goal of ${formatCurrency(savingsGoal)}! What's your next financial milestone?`;
         tipType = 'success';
    } else {
        // Display a random generic tip if no specific alerts
        tipMessage = tips[Math.floor(Math.random() * tips.length)];
        tipType = 'info';
    }

    if (tipMessage) {
        showMessage(tipsAlerts, tipMessage, tipType);
    }
}

// --- Dark Mode Toggle ---
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    saveUserData(); // Save dark mode preference
    renderLineChart(); // Re-render line chart to update colors
}

// --- Download Report ---
function downloadReport() {
    let reportContent = `Expense Tracker Report for ${currentUser}\n\n`;
    reportContent += `Date: ${new Date().toLocaleDateString()}\n\n`;
    reportContent += `--- Summary ---\n`;
    reportContent += `Total Balance: ${balance.innerText}\n`;
    reportContent += `Total Income: ${money_plus.innerText}\n`;
    reportContent += `Total Expenses: ${money_minus.innerText}\n`;
    reportContent += `Monthly Budget: ${formatCurrency(monthlyBudget)}\n`;
    reportContent += `Budget Remaining: ${budgetRemaining.innerText}\n`;
    reportContent += `Savings Goal: ${formatCurrency(savingsGoal)}\n`;
    reportContent += `Savings Progress: ${savingsProgress.innerText}\n\n`;

    reportContent += `--- Transactions ---\n`;
    if (transactions.length === 0) {
        reportContent += "No transactions recorded.\n";
    } else {
        transactions.forEach(t => {
            const sign = t.amount < 0 ? '-' : '+';
            reportContent += `${t.date} | ${t.text} (${t.category}): ${sign}${formatCurrency(t.amount)}\n`;
        });
    }

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense_report_${currentUser}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage(tipsAlerts, 'Report downloaded successfully!', 'success');
}

// Download PDF Report
async function downloadPdfReport() {
    showMessage(tipsAlerts, 'Generating PDF report...', 'info');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'letter');
    const margin = 20;
    let y = margin;

    // Add title
    pdf.setFontSize(22);
    pdf.text(`Expense Tracker Report for ${currentUser}`, margin, y);
    y += 30;

    pdf.setFontSize(12);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 20;

    // Add Summary
    pdf.setFontSize(14);
    pdf.text('--- Summary ---', margin, y);
    y += 20;
    pdf.setFontSize(12);
    pdf.text(`Total Balance: ${balance.innerText}`, margin, y); y += 15;
    pdf.text(`Total Income: ${money_plus.innerText}`, margin, y); y += 15;
    pdf.text(`Total Expenses: ${money_minus.innerText}`, margin, y); y += 15;
    pdf.text(`Monthly Budget: ${formatCurrency(monthlyBudget)}`, margin, y); y += 15;
    pdf.text(`Budget Remaining: ${budgetRemaining.innerText}`, margin, y); y += 15;
    pdf.text(`Savings Goal: ${formatCurrency(savingsGoal)}`, margin, y); y += 15;
    pdf.text(`Savings Progress: ${savingsProgress.innerText}`, margin, y); y += 25;

    // Add Transactions
    pdf.setFontSize(14);
    pdf.text('--- Transactions ---', margin, y);
    y += 20;
    pdf.setFontSize(10);

    if (transactions.length === 0) {
        pdf.text("No transactions recorded.", margin, y);
        y += 15;
    } else {
        transactions.forEach(t => {
            const sign = t.amount < 0 ? '-' : '+';
            const transactionLine = `${t.date} | ${t.text} (${t.category}): ${sign}${formatCurrency(t.amount)}`;
            if (y + 15 > pdf.internal.pageSize.height - margin) { // Check for page break
                pdf.addPage();
                y = margin;
            }
            pdf.text(transactionLine, margin, y);
            y += 15;
        });
    }

    // Line Chart
    if (lineChartCanvas && lineChart) {
        if (y + 200 > pdf.internal.pageSize.height - margin) { // Check if enough space for line chart on current page
            pdf.addPage();
            y = margin;
        }
        pdf.setFontSize(14);
        pdf.text('Financial Trends Over Time', margin, y);
        y += 20;

        const lineChartImg = await html2canvas(lineChartCanvas);
        const lineChartDataUrl = lineChartImg.toDataURL('image/png');
        const imgWidth = 500; // Adjust as needed
        const imgHeight = (lineChartImg.height * imgWidth) / lineChartImg.width;
        pdf.addImage(lineChartDataUrl, 'PNG', margin, y, imgWidth, imgHeight);
    }

    pdf.save(`expense_report_${currentUser}_${new Date().toISOString().slice(0,10)}.pdf`);
    showMessage(tipsAlerts, 'PDF report downloaded successfully!', 'success');
}

// --- Category Management Functions ---
function renderCategoryDropdowns() {
    // Clear existing options
    category.innerHTML = '';
    filterCategoryInput.innerHTML = '<option value="">All Categories</option>';

    // Populate from customCategories
    customCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        category.appendChild(option);

        const filterOption = option.cloneNode(true);
        filterCategoryInput.appendChild(filterOption);
    });
}

function renderCategoryList() {
    categoryList.innerHTML = '';
    customCategories.forEach(cat => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center py-1 px-2 border-b last:border-b-0 dark:border-gray-600';
        li.innerHTML = `
            <span>${cat}</span>
            <button class="text-red-500 hover:text-red-700 text-sm" onclick="deleteCategory('${cat}')">Delete</button>
        `;
        categoryList.appendChild(li);
    });
}

function addCategory() {
    const newCat = newCategoryInput.value.trim();
    if (newCat && !customCategories.includes(newCat)) {
        customCategories.push(newCat);
        customCategories.sort(); // Keep categories sorted
        saveUserData();
        renderCategoryDropdowns();
        renderCategoryList();
        newCategoryInput.value = '';
        showMessage(tipsAlerts, `Category "${newCat}" added!`, 'success');
    } else if (newCat) {
        showMessage(tipsAlerts, `Category "${newCat}" already exists.`, 'info');
    } else {
        showMessage(tipsAlerts, 'Please enter a category name.', 'error');
    }
}

function deleteCategory(catToDelete) {
    if (['Income', 'Food', 'Transport', 'Shopping', 'Utilities', 'Rent', 'Entertainment', 'Healthcare', 'Education', 'Savings', 'Other'].includes(catToDelete)) {
        showMessage(tipsAlerts, `Cannot delete default category "${catToDelete}".`, 'error');
        return;
    }
    customCategories = customCategories.filter(cat => cat !== catToDelete);
    saveUserData();
    renderCategoryDropdowns();
    renderCategoryList();
    showMessage(tipsAlerts, `Category "${catToDelete}" deleted!`, 'success');
}


// --- Initialization ---
function init() {
    // Set today's date as default for new transactions
    const today = new Date().toISOString().slice(0, 10);
    dateInput.value = today;
    filterDateInput.value = ''; // Clear filter date on init
    filterCategoryInput.value = ''; // Clear category filter
    filterTypeInput.value = ''; // Clear type filter
    filterMinAmountInput.value = ''; // Clear min amount filter
    filterMaxAmountInput.value = ''; // Clear max amount filter
    searchInput.value = ''; // Clear search input

    renderCategoryDropdowns(); // Populate category dropdowns
    filterTransactions(); // Display all transactions initially
    updateValues(); // Calculate and display all values
}

// --- Event Listeners ---
loginBtn.addEventListener('click', loginUser);
logoutBtn.addEventListener('click', logoutUser);
form.addEventListener('submit', addTransaction);
filterDateInput.addEventListener('change', filterTransactions);
filterCategoryInput.addEventListener('change', filterTransactions);
filterTypeInput.addEventListener('change', filterTransactions);
filterMinAmountInput.addEventListener('input', filterTransactions); // Use 'input' for real-time filtering
filterMaxAmountInput.addEventListener('input', filterTransactions); // Use 'input' for real-time filtering
searchInput.addEventListener('input', filterTransactions); // New search input listener
darkModeToggle.addEventListener('click', toggleDarkMode);
downloadReportBtn.addEventListener('click', downloadReport);
downloadPdfReportBtn.addEventListener('click', downloadPdfReport);
setBudgetBtn.addEventListener('click', setBudget);
setSavingsBtn.addEventListener('click', setSavingsGoal);

// Category Modal Event Listeners
manageCategoriesBtn.addEventListener('click', () => {
    renderCategoryList(); // Render list when opening modal
    categoryModal.style.display = 'flex'; // Show modal
});
closeCategoryModalBtn.addEventListener('click', () => {
    categoryModal.style.display = 'none'; // Hide modal
});
addCategoryBtn.addEventListener('click', addCategory);
// Close modal if clicked outside content
window.addEventListener('click', (event) => {
    if (event.target === categoryModal) {
        categoryModal.style.display = 'none';
    }
});


// --- Initial Load Check ---
document.addEventListener('DOMContentLoaded', () => {
    currentUser = localStorage.getItem('expenseTracker_currentUser');
    if (currentUser) {
        usernameInput.value = currentUser; // Pre-fill username if exists
        currentUsernameSpan.textContent = currentUser;
        appContainer.classList.remove('hidden');
        loginPage.classList.add('hidden');
        loadUserData(); // Load data for the logged-in user
        init(); // Initialize the app
    } else {
        loginPage.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
});
