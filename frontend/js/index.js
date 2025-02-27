// var server = 'https://onetechzquad.tech/etryc';
var server = 'http://localhost/trackify/backend';

var user_id = getDataWithExpiryCheck('user_id');

// Live password validation
document.addEventListener('input', function (e) {
  if (e.target.id === 'register_password') {
    const password = e.target.value;
    const validationTarget = document.getElementById(e.target.dataset.validationTarget);

    const checks = {
      length: password.length > 8,
      capital: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      underscore: /_/.test(password),
    };

    validationTarget.innerHTML = `
      <li>Password must:</li>
      <li style="color: ${checks.length ? 'green' : 'red'}">
        ${checks.length ? '✓' : '✗'} Contains more than 8 characters.
      </li>
      <li style="color: ${checks.capital ? 'green' : 'red'}">
        ${checks.capital ? '✓' : '✗'} Contains a capital letter.
      </li>
      <li style="color: ${checks.lowercase ? 'green' : 'red'}">
        ${checks.lowercase ? '✓' : '✗'} Contains a lowercase letter.
      </li>
      <li style="color: ${checks.number ? 'green' : 'red'}">
        ${checks.number ? '✓' : '✗'} Contains a number.
      </li>
      <li style="color: ${checks.underscore ? 'green' : 'red'}">
        ${checks.underscore ? '✓' : '✗'} Contains an underscore.
      </li>
    `;
  }
});

// Function to show snackbar
function showSnackbar(message, time = 3, textColor = 'var(--blue)') {
  const snackbar = document.getElementById('snackbar');
  snackbar.textContent = message;
  snackbar.className = 'show';

  snackbar.style.color = textColor;

  // Hide snackbar after 3 seconds
  setTimeout(function () {
    snackbar.className = snackbar.className.replace('show', '');
  }, time * 1000);
}

// Account Registration
document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const firstname = document.getElementById('firstname').value;
  const lastname = document.getElementById('lastname').value;
  const email = document.getElementById('register_email').value;
  const password = document.getElementById('register_password').value;

  // Password validation
  const isValidPassword = password.length > 8 &&
                          /[A-Z]/.test(password) &&
                          /[a-z]/.test(password) &&
                          /[0-9]/.test(password) &&
                          /_/.test(password);

  if (!isValidPassword) {
    return;
  }

  try {
    const response = await fetch(`${server}/register_account.php?step=1`, {
      method: 'POST',
      body: new URLSearchParams({ firstname, lastname, email, password }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const result = await response.json();

    if (result.status === 200) {

      document.getElementById('logo-wrapper').style.display = 'none';
      document.getElementById('register').classList.remove('active');

      if(setDataWithExpiry('user_id', result.user_id)) {
        showSnackbar(result.message, 5);
        login(email, password);
      }

    } else if (result.status === 400) {
      document.getElementById('register_email_validation').innerHTML = result.message;
      return;

    } else {
      showSnackbar(result.message, 5);
    }
  } catch (error) {
    console.log(error);
    showSnackbar('An unexpected error occurred. Please try again.', 3);
  }
});

// Account Login
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('login_email').value;
  const password = document.getElementById('login_password').value;

  login(email, password); // Proceed to login
  
});

// Check Login
async function login(email, password) {
  const response = await fetch(`${server}/login.php`, {
    method: 'POST',
    body: new URLSearchParams({ email, password }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  document.getElementById('login_email_validation').innerHTML = '';
  document.getElementById('login_password_validation').innerHTML = '';

  const result = await response.json();

  if (result.status === 200) {
    setDataWithExpiry('user_id', result.user_id);
    setDataWithExpiry('role', result.role);
    location.reload();
  } else if (result.status === 404) {
    document.getElementById('login_email_validation').innerHTML = result.message;
    return;
  } else if (result.status === 401) {
    document.getElementById('login_password_validation').innerHTML = result.message;
    return;
  } else {
    showSnackbar(result.message, 5);
  }
}

// Account Logout
function logout() {
  localStorage.removeItem('user_id');
  localStorage.removeItem('role');
  resetAllForms();
  location.reload();
}

// Activity Registration
document.getElementById('registerActivity').addEventListener('submit', async function (e) {
  e.preventDefault();

  const description = document.getElementById("activity-description").value;
  const amount = parseFloat(document.getElementById("activity-amount").value);
  const category = document.getElementById("activity-category").value;
  const type = document.getElementById("activity-type").value;

  try {
    const response = await fetch(`${server}/register_activity.php`, {
      method: 'POST',
      body: new URLSearchParams({ description, amount, category, type, user_id }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const result = await response.json();

    if (result.status === 200) {
      showSnackbar(result.message, 5);
      setRecent('activity', 'Add Activity');
      fetchActivities(); // Refresh the list and update balances
      resetAllForms();

      if(result.type == 'income') {
        document.getElementById('budget-progress').style.display = 'none';
      } else {
        document.getElementById('budget-progress').style.display = 'block';
        // track budget progress
        const progress = result.remaining_budget;
        document.getElementById('category-name').textContent = category;
        document.getElementById('remaining-budget').textContent = `₱ ${formatAmount(progress)}`;

        // update progress bar
        const progressBar = document.getElementById('progress-bar');
        const progressPercentage = (1 - (progress / result.budget_limit)) * 100;
        progressBar.style.width = `${progressPercentage}%`;
      }

      if (result.remaining_budget <= 0) {
        showSnackbar("Warning: You've exceeded your budget for this category!", 6, 'red');
      }

    } else {
      showSnackbar(result.message, 3);
    }
  } catch (error) {
    console.log(error);
    showSnackbar('An unexpected error occurred. Please try again.', 3);
  }
});

const activityList = document.getElementById("activity-list");
const balanceDisplay = document.getElementById("current-balance");
const incomeDisplay = document.getElementById("total-income");
const expenseDisplay = document.getElementById("total-expense");
const categorizedDisplay = document.getElementById("categorized-spending");

async function fetchDashboardDetails() {
  const dashboardTotalIncome = document.getElementById("dashboard-total-income");
  const dashboardTotalExpenses = document.getElementById("dashboard-total-expenses");
  
  try {
    const response = await fetch(`${server}/get_activities.php?user_id=${user_id}`);

    const result = await response.json();

    if (result.status === 200) {
      dashboardTotalIncome.textContent = `₱ ${formatAmount(result.total_income)}`;
      dashboardTotalExpenses.textContent = `₱ ${formatAmount(result.total_expense)}`;
    }
  } catch (error) {
      console.log("Error fetching activities:", error);
  }
}

async function fetchActivityDetails() {
  const activityTotalExpenses = document.getElementById("activity-total-expenses");
  const activityTotalIncome = document.getElementById("activity-total-income");
  
  try {
    const response = await fetch(`${server}/get_activities.php?user_id=${user_id}`);

    const result = await response.json();

    if (result.status === 200) {
      activityTotalExpenses.textContent = `₱ ${formatAmount(result.total_expense)}`;
      activityTotalIncome.textContent = `₱ ${formatAmount(result.total_income)}`;
    }
  } catch (error) {
      console.log("Error fetching activities:", error);
  }
}

function formatTimestamp(timestamp, showTime = true) {
  const dateObj = new Date(timestamp);
  
  const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
  };

  if (showTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.hour12 = true;
  }

  return dateObj.toLocaleString("en-US", options);
}

async function fetchReportsIncomeExpenseDetails() {
  const currentWeekRange = document.getElementById("current-week");
  const weeklyReportTotalIncome = document.getElementById("weekly-total-income");
  const weeklyReportTotalExpenses = document.getElementById("weekly-total-expenses");

  const currentMonth = document.getElementById("current-month");
  const monthlyReportTotalIncome = document.getElementById("monthly-total-income");
  const monthlyReportTotalExpenses = document.getElementById("monthly-total-expenses");
  
  try {
    const response = await fetch(`${server}/get_activities.php?user_id=${user_id}`);

    const result = await response.json();

    if (result.status === 200) {
      currentWeekRange.textContent = formatTimestamp(result.current_week_start, false) + ' - ' + formatTimestamp(result.current_week_end, false);
      weeklyReportTotalIncome.textContent = `₱ ${result.weekly_income}`;
      weeklyReportTotalExpenses.textContent = `₱ ${result.weekly_expense}`;
      currentMonth.textContent = result.current_month;
      monthlyReportTotalIncome.textContent = `₱ ${result.monthly_income}`;
      monthlyReportTotalExpenses.textContent = `₱ ${result.monthly_expense}`;
    }
  } catch (error) {
      console.log("Error fetching activities:", error);
  }
}

// Fetch and display activities when the page loads
async function fetchActivities() {
  try {
    const response = await fetch(`${server}/get_activities.php?user_id=${user_id}`);

    const result = await response.json();

    if (result.status === 200) {
      activityList.innerHTML = ""; // Clear list

      // Update balance, income, expense
      balanceDisplay.textContent = `₱ ${formatAmount(result.current_balance)}`;
      incomeDisplay.textContent = `₱ ${formatAmount(result.total_income)}`;
      expenseDisplay.textContent = `₱ ${formatAmount(result.total_expense)}`;

      // Categorized spending
      categorizedDisplay.innerHTML = "";

      for (const [category, amount] of Object.entries(result.categorized_spending)) {
          categorizedDisplay.innerHTML += `<div class="spent flex ai-center gap-10 p-10">
                                              <label>${category}: </label>
                                              <p>-₱ ${formatAmount(amount)}</p>
                                          </div>`;
      }

      // Append activities
      result.data.forEach(activity => appendActivity(activity));
    }
  } catch (error) {
      console.log("Error fetching activities:", error);
  }
}

function formatAmount(amount) {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Append activity to the list
function appendActivity(activity) {
  const li = document.createElement("li");

  li.innerHTML = `
        <div class="flex w-100 jc-space-between">
          <div class="w-70">
            <label>${activity.description}</label>
            <p><span class="category">${activity.category}</span> | <span class="date">${formatTimestamp(activity.timestamp)}</span></p> 
            <h5 class="${activity.type === "expense" ? "red" : "green"}">${activity.type === "income" ? "+" : "-"}₱ ${formatAmount(parseFloat(activity.amount))}</h5>
          </div>
          <div class="w-30 flex gap-5 jc-end ai-center">
            <button class="activity-action edit flex ai-center" data-id="${activity.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                </svg>
            </button>
            <button class="activity-action delete flex ai-center" data-id="${activity.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M8 6v14"></path>
                    <path d="M16 6v14"></path>
                    <path d="M10 6v14"></path>
                    <path d="M14 6v14"></path>
                    <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"></path>
                    <path d="M9 6V3h6v3"></path>
                </svg>
            </button>
          </div>
        </div>
  `;

  activityList.prepend(li); // Add to top
}

// Activity Actions
document.addEventListener('click', async function (event) {

  const actionBtn = event.target.closest(".activity-action.edit");

  if (!actionBtn) return;

  const activityId = actionBtn.getAttribute("data-id");

  try {
    const url = `${server}/get_activities.php?activity_id=${activityId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result = await response.json();
    console.log(result); // Debug API response

    if (result.status === 200 && result.data) { // Ensure result contains data
      const activity = result.data; // Assuming API returns data in `result.data`

      // Populate fields
      document.getElementById('update-activity-id').value = activityId;
      document.getElementById('update-activity-description').value = activity.description || '';
      document.getElementById('update-activity-amount').value = activity.amount || '';
      document.getElementById('update-activity-category').value = activity.category || '';
      document.getElementById('update-activity-type').value = activity.type || '';

      // Open edit panel
      document.getElementById('activity')?.classList.remove('active'); // Use optional chaining
      document.getElementById('edit-activity').classList.add('active');

    } else {
      showSnackbar('Activity not found.');
    }
  } catch (error) {
    console.error("Error fetching Activity data:", error);
    showSnackbar('An unexpected error occurred. Please try again.');
  }
});

// Activity Update
document.getElementById('updateActivity').addEventListener('submit', async function (e) {
  e.preventDefault();

  const budget_id = document.getElementById('update-budget-id').value;
  const budget_limit = document.getElementById('update-budget-limit').value;

  if (budget_id) {
    try {
      const response = await fetch(`${server}/update_budget.php`, {
        method: 'POST',
        body: new URLSearchParams({ budget_id, budget_limit }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const result = await response.json();

      if (result.status === 200) {
        showSnackbar(result.message);

        fetchBudgets();

        // Reset form and switch views
        resetAllForms();
        document.getElementById('edit-budget').classList.remove('active');
        document.getElementById('set-budget').classList.add('active');
      } else {
        showSnackbar(result.message);
      }
    } catch (error) {
      showSnackbar('An unexpected error occurred. Please try again.');
    }
  } else {
    showSnackbar('Invalid Budget ID.');
  }
});

// Activity Delete
document.addEventListener('click', async function (event) {
  const actionBtn = event.target.closest(".activity-action.delete");

  if (!actionBtn) return;

  const activityId = actionBtn.getAttribute("data-id");

  if (!confirm("Are you sure you want to delete this activity?")) return;

  try {
    const response = await fetch(`${server}/delete_activity.php`, {
      method: "POST", // Change to POST (or GET if you want to keep the original)
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ activity_id: activityId }),
    });

    const result = await response.json();
    console.log(result); // Debug API response

    if (result.status === 200) {
      showSnackbar("Activity deleted successfully.", 3);
      fetchActivities(); // Refresh the list
    } else {
      showSnackbar(result.message || "Failed to delete activity.", 3);
    }
  } catch (error) {
    showSnackbar("An unexpected error occurred. Please try again.", 3);
  }
});

// Fetch Users
const usersList = document.getElementById("users-list");

async function fetchUsers() {
  try {
    const response = await fetch(`${server}/get_users.php`);

    const result = await response.json();

    if (result.status === 200) {
      usersList.innerHTML = ""; // Clear list

      // Append users
      result.data.forEach(user => {
        if (user.id != user_id) {
          appendUser(user);
        }
      });
    
    }
  } catch (error) {
      console.log("Error fetching users:", error);
  }
}

// Append user to the list
function appendUser(user) {
  const li = document.createElement("li");

  li.innerHTML = `
    <div class="user flex ai-center gap-10 p-10">
      <label>${user.first_name} ${user.last_name}</label>
    </div>
  `;

  usersList.prepend(li); // Add to top
}

document.getElementById('setBudget').addEventListener('submit', async function (e) {
  e.preventDefault();

  const category = document.getElementById("category").value;
  const budgetLimit = document.getElementById("budget-limit").value;

  try {
      const response = await fetch(`${server}/set_budget.php`, {
          method: 'POST',
          body: new URLSearchParams({ user_id: user_id, category, budget_limit: budgetLimit }),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const result = await response.json();
      if (result.status === 200) {
          showSnackbar(result.message, 5);
          setRecent('set-budget', 'Set a Budget');
          // Live update the budget list
          fetchBudgets(); 
      } else {
          showSnackbar(result.message, 3);
      }
  } catch (error) {
      showSnackbar('An error occurred while setting the budget.', 3);
  }
});

async function fetchBudgets() {
  const response = await fetch(`${server}/get_budgets.php?user_id=${user_id}`);
  const result = await response.json();

  const totalBudgets = document.getElementById('total-budgets');
  const budgetList = document.getElementById('budget-list');
  budgetList.innerHTML = ''; // Clear the list before updating

  let totalBudgetAmount = 0;

  if (result.status === 200 && result.budgets.length > 0) {
    result.budgets.forEach(budget => {
      totalBudgetAmount += parseFloat(budget.budget_limit); // Sum up budget limits

      const budgetItem = document.createElement('div');
      budgetItem.classList.add('budget', 'flex', 'ai-center', 'gap-10', 'p-10');

      budgetItem.innerHTML = `
        <div class="flex w-100 jc-space-between">
          <div class="w-70">
            <label>${budget.category}: </label>
            <p>₱ ${formatAmount(parseFloat(budget.budget_limit))}</p>
          </div>
          <div class="w-30 flex gap-5 jc-end ai-center">
            <button class="budget-action edit flex ai-center" data-id="${budget.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                </svg>
            </button>
            
          </div>
        </div>
      `;

      budgetList.appendChild(budgetItem);
    });

    

    totalBudgets.textContent = `₱ ${formatAmount(totalBudgetAmount)}`;

  } else {
    totalBudgets.textContent = 'N/A';
    budgetList.innerHTML = '<p>No budgets set yet.</p>';
  }
}

// Budget Actions
document.addEventListener('click', async function (event) {

  const actionBtn = event.target.closest(".budget-action.edit");

  if (!actionBtn) return; // Exit if not found

  const budgetId = actionBtn.getAttribute("data-id");

  try {
    const url = `${server}/get_budgets.php?budget_id=${budgetId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result = await response.json();
    console.log(result); // Debug API response

    if (result.status === 200 && result.data) { // Ensure result contains data
      const budget = result.data; // Assuming API returns data in `result.data`

      // Populate fields
      document.getElementById('update-budget-id').value = budgetId;
      document.getElementById('update-category').value = budget.category || '';
      document.getElementById('update-budget-limit').value = budget.budget_limit || '';

      // Open edit panel
      document.getElementById('set-budget')?.classList.remove('active'); // Use optional chaining
      document.getElementById('edit-budget').classList.add('active');

    } else {
      showSnackbar('Budget not found.');
    }
  } catch (error) {
    console.error("Error fetching budget data:", error);
    showSnackbar('An unexpected error occurred. Please try again.');
  }
});

// Budget Update
document.getElementById('updateBudget').addEventListener('submit', async function (e) {
  e.preventDefault();

  const budget_id = document.getElementById('update-budget-id').value;
  const budget_limit = document.getElementById('update-budget-limit').value;

  if (budget_id) {
    try {
      const response = await fetch(`${server}/update_budget.php`, {
        method: 'POST',
        body: new URLSearchParams({ budget_id, budget_limit }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const result = await response.json();

      if (result.status === 200) {
        showSnackbar(result.message);

        fetchBudgets();

        // Reset form and switch views
        resetAllForms();
        document.getElementById('edit-budget').classList.remove('active');
        document.getElementById('set-budget').classList.add('active');
      } else {
        showSnackbar(result.message);
      }
    } catch (error) {
      showSnackbar('An unexpected error occurred. Please try again.');
    }
  } else {
    showSnackbar('Invalid Budget ID.');
  }
});

async function populateProfile() {
  
  const profileObject = await fetchAccounts(user_id);

  const profile = profileObject[0];

  if(user_id == profile.id) {
    const profileWrapper = document.getElementById('profile-wrapper');
    profileWrapper.innerHTML = `

      <div class="flex col">
        <div class="form-group flex col mb-10">
          <label>Name</label>
          <h4>${profile.first_name} ${profile.last_name}</h4>
        </div>

      </div>

      <div class="flex col">
        <div class="form-group flex col">
          <label>Email</label>
          <h4>${profile.email}</h4>
        </div>

      </div>
    `;
  }
  
}

document.getElementById('setSavingsGoal').addEventListener('submit', async function (e) {
  e.preventDefault();

  const goalName = document.getElementById("goal-name").value;
  const targetAmount = parseFloat(document.getElementById("goal-amount").value);
  const goalEndDate = document.getElementById('goal-end-date').value;

  try {
    const response = await fetch(`${server}/set_savings_goal.php`, {
      method: 'POST',
      body: new URLSearchParams({ user_id: user_id, goal_name: goalName, target_amount: targetAmount, saved_amount: 0, end_date: goalEndDate }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const result = await response.json();
    if (result.status === 200) {
      showSnackbar(result.message, 5);
      setRecent('set-savings-goal', 'Set a Savings Goal');
      fetchSavingsGoals(); // Update the UI live
    } else {
      showSnackbar(result.message, 3);
    }
  } catch (error) {
    showSnackbar('An error occurred while setting the savings goal.', 3);
  }
});

async function fetchSavingsGoals() {
  const response = await fetch(`${server}/get_savings_goals.php?user_id=${user_id}`);
  const result = await response.json();

  const goalList = document.getElementById('savings-goals-list');
  goalList.innerHTML = ''; // Clear previous goals

  if (result.status === 200 && result.goals.length > 0) {
    result.goals.forEach(goal => {
      const goalItem = document.createElement('div');
      goalItem.classList.add('goal', 'flex', 'col', 'gap-10','p-10');

      const progress = (goal.saved_amount / goal.target_amount) * 100;

      goalItem.innerHTML = `
        <div class="flex ai-center gap-10">
          <div class="flex w-100 jc-space-between">
            <div class="w-70">
              <label>${goal.goal_name}: </label>
              <p>₱ ${formatAmount(parseFloat(goal.saved_amount))} / ₱ ${formatAmount(parseFloat(goal.target_amount))}</p>
            </div>
            <div class="w-30 flex gap-5 jc-end ai-center">
              <button class="savings-goal-action edit flex ai-center" data-id="${goal.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                </svg>
              </button>
              <button class="savings-goal-action delete flex ai-center" data-id="${goal.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M8 6v14"></path>
                  <path d="M16 6v14"></path>
                  <path d="M10 6v14"></path>
                  <path d="M14 6v14"></path>
                  <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"></path>
                  <path d="M9 6V3h6v3"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="progress-container">
            <div class="progress-bar" style="width: ${progress}%;"></div>
        </div>
        <div class="flex jc-space-between gap-10">
          <input type="number" class="amount-input" placeholder="₱ Amount" min="1">
          <button class="btn primary" onclick="addToSavings(${goal.id}, this)">Save</button>
        </div>
      `;

      goalList.appendChild(goalItem);
    });
  } else {
      goalList.innerHTML = '<p>No savings goals set yet.</p>';
  }
}

// Savings Goal Actions
document.addEventListener('click', async function (event) {

  const actionBtn = event.target.closest(".savings-goal-action.edit");

  if (!actionBtn) return;

  const savingsGoalId = actionBtn.getAttribute("data-id");

  try {
    const url = `${server}/get_savings_goals.php?savings_goal_id=${savingsGoalId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result = await response.json();
    console.log(result); // Debug API response

    if (result.status === 200 && result.data) { // Ensure result contains data
      const savingsGoal = result.data; // Assuming API returns data in `result.data`

      // Populate fields
      document.getElementById('update-savings-goal-id').value = savingsGoalId;
      document.getElementById('update-savings-goal-name').value = savingsGoal.goal_name || '';
      document.getElementById('update-savings-goal-amount').value = savingsGoal.target_amount || '';
      document.getElementById('update-savings-goal-end-date').value = savingsGoal.end_date || '';

      // Open edit panel
      document.getElementById('set-savings-goal')?.classList.remove('active'); // Use optional chaining
      document.getElementById('edit-savings-goal').classList.add('active');

    } else {
      showSnackbar('Savings Goal not found.');
    }
  } catch (error) {
    console.error("Error fetching Savings Goal data:", error);
    showSnackbar('An unexpected error occurred. Please try again.');
  }
});

// Savings Goal Update
document.getElementById('supdateSavingsGoal').addEventListener('submit', async function (e) {
  e.preventDefault();

  const savings_goal_id = document.getElementById('update-savings-goal-id').value;
  const goal_name = document.getElementById('update-savings-goal-name').value;
  const goal_amount = document.getElementById('update-savings-goal-amount').value;
  const goal_end_date = document.getElementById('update-savings-goal-end-date').value;

  if (savings_goal_id) {
    try {
      const response = await fetch(`${server}/update_savings_goal.php`, {
        method: 'POST',
        body: new URLSearchParams({ savings_goal_id, goal_name, goal_amount, goal_end_date }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const result = await response.json();

      if (result.status === 200) {
        showSnackbar(result.message);

        fetchSavingsGoals();

        // Reset form and switch views
        resetAllForms();
        document.getElementById('edit-savings-goal').classList.remove('active');
        document.getElementById('set-savings-goal').classList.add('active');
      } else {
        showSnackbar(result.message);
      }
    } catch (error) {
      showSnackbar('An unexpected error occurred. Please try again.');
    }
  } else {
    showSnackbar('Invalid Budget ID.');
  }
});

// Savings Goal Delete
document.addEventListener('click', async function (event) {
  const actionBtn = event.target.closest(".savings-goal-action.delete");

  if (!actionBtn) return;

  const savings_goal_id = actionBtn.getAttribute("data-id");

  if (!confirm("Are you sure you want to delete this Savings Goal?")) return;

  try {
    const response = await fetch(`${server}/delete_savings_goal.php`, {
      method: "POST", // Change to POST (or GET if you want to keep the original)
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ savings_goal_id: savings_goal_id }),
    });

    const result = await response.json();
    console.log(result); // Debug API response

    if (result.status === 200) {
      showSnackbar("Savings Goal deleted successfully.", 3);
      fetchSavingsGoals(); // Refresh the list
    } else {
      showSnackbar(result.message || "Failed to delete Savings Goal.", 3);
    }
  } catch (error) {
    showSnackbar("An unexpected error occurred. Please try again.", 3);
  }
});

// Get Accounts
async function fetchAccounts(userId = '') {
  try {
    const url = `${server}/get_accounts.php${userId ? '?user_id=' + userId : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }

    const result = await response.json();

    if (result.status === 200) {
      return result.data;
    } else {
      showSnackbar(result.message || 'No vehicles found', 3);
    }
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    showSnackbar('An error occurred while fetching data.', 3);
  }
}

function setDataWithExpiry(key, value, ttl = 60 * 60 * 1000) {
  const now = new Date();

  // Create an item object with the value and expiry timestamp
  const item = {
    value: value,
    expiry: now.getTime() + ttl, // ttl is in milliseconds
  };

  try {

    localStorage.setItem(key, JSON.stringify(item));

    // Verify the item was successfully set
    const storedItem = localStorage.getItem(key);
    return storedItem !== null && storedItem === JSON.stringify(item);

  } catch (error) {

    console.error("Error setting item in localStorage:", error);
    return false;
  }
}

function getDataWithExpiryCheck(key) {

  const itemStr = localStorage.getItem(key);

  if (!itemStr) {
    return null;
  }

  try {
    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      location.reload();
    }

    return item.value;

  } catch (error) {
    console.error(`Error parsing LocalStorage key "${key}":`, error);
    return null;
  }
}


function openPanel(evt, panel) {

  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("panel");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].classList.remove('active');
  }

  tablinks = document.getElementsByClassName("link");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(panel).classList.add('active');
  evt.currentTarget.className += " active";
}

function resetAllForms() {
  // Get all the forms on the page
  const forms = document.querySelectorAll('form');
  
  // Loop through each form and reset it
  forms.forEach(form => form.reset());
}

function initializeElements() {

  const user_id = getDataWithExpiryCheck('user_id');
  const role = getDataWithExpiryCheck('role');

  if(role != 1) {
    document.getElementById('all-users-btn').style.display = 'none';
  }

  if (!user_id) {
    document.getElementById('defaultOpenAuth').click();
    document.getElementById('logo-wrapper').style.display = 'block';
    document.getElementById('auth-wrapper').style.display = 'block';
    document.getElementById('transction-wrapper').style.display = 'none';
  } else {
    populateProfile();
    document.getElementById('logo-wrapper').style.display = 'none';
    document.getElementById('auth-wrapper').style.display = 'none';
    document.getElementById('transction-wrapper').style.display = 'block';
    document.getElementById('home').classList.add('active');
    document.getElementById('logout-btn').style.display = 'block';
    document.getElementById('add-activity').style.display = 'flex';
  }
}

function initializeButtons() {

  const buttonNavigations = document.querySelectorAll('button');

  buttonNavigations.forEach((button) => {
    button.addEventListener('click', () => {

      
      const activePanel = document.querySelector('.panel.active');

      switch(activePanel.id) {
        case 'home':
          fetchDashboardDetails();
          getRecent();
          break;

        case 'activity':
          fetchActivities();
          break;

        case 'activity-history':
          fetchActivityDetails();
          break;

        case 'set-savings-goal':
          fetchSavingsGoals();
          break;

        case 'set-budget':
          fetchBudgets();
          break;

        case 'reports':
          fetchReportsIncomeExpenseDetails();
          break;

        case 'all-users':
          fetchUsers();
          break;

        default:
          break;
      }
    });
  });
}

async function init() {
  if (getDataWithExpiryCheck('user_id')) {
    document.getElementById('logo-wrapper').style.display = 'none';
  }
  initializeElements();
  initializeButtons();
  fetchDashboardDetails();
  getRecent();
}

init();

document.querySelectorAll(".toggle-password").forEach(toggle => {
  toggle.addEventListener("click", function() {
    const passwordInput = this.previousElementSibling;

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      this.innerHTML = `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.92 10.92 0 0 1 12 20c-6.07 0-11-8-11-8a18.72 18.72 0 0 1 3.23-3.92M8.24 8.24A4 4 0 0 1 15.76 15.76M3 3l18 18"/>
      </svg>`; // Eye-off SVG
    } else {
      passwordInput.type = "password";
      this.innerHTML = `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z"/>
          <circle cx="12" cy="12" r="3"/>
      </svg>`; // Eye SVG
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("dark-mode-toggle");
  const body = document.body;

  // Load dark mode preference
  if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
  }

  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", body.classList.contains("dark-mode") ? "enabled" : "disabled");
  });
});

async function addToSavings(goalId, button) {

  const inputField = button.previousElementSibling;
  const amount = parseFloat(inputField.value);

  if (!amount || amount <= 0) {
    showSnackbar("Enter a valid amount.", 5);
    return;
  }

  const response = await fetch(`${server}/update_savings.php`, {
    method: "POST",
    body: new URLSearchParams({ user_id, goal_id: goalId, amount }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const result = await response.json();

  if (result.status === 200) {
    showSnackbar(result.message, 5);
    fetchSavingsGoals(); // Refresh goals
  } else {
    showSnackbar("Failed to add savings: " + result.message, 5);
  }

  inputField.value = ''; // Clear input
}

function setRecent(key, recent) {
  
  const obj = {
    key: key,
    value: recent
  };

  const recentArr = getDataWithExpiryCheck('recent');

  if(recentArr == null) {
    setDataWithExpiry('recent', [obj]);
  } else {
    recentArr.forEach(checkRecent);

    function checkRecent(recent) {
      if(obj.key == recent.key) {
        return;
      } else {
        setDataWithExpiry('recent', [...recentArr, obj]);
      }
    }
  }
}

function getRecent() {
  const recents = getDataWithExpiryCheck('recent');

  const recentList = document.getElementById('recent-list');

  recentList.innerHTML = '';

  if(recents) {
    recents.forEach(recent => {

      const box = document.createElement("div");
      box.classList.add("w-40");
    
      box.innerHTML = `
        <div class="box br-rounded-lg p-10" onclick="openPanel(event, '${recent.key}')">
          <h6>${recent.value}</h6>
        </div>
      `;
    
      recentList.prepend(box); 
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const startTourBtn = document.getElementById("startTour");

  const user_id = getDataWithExpiryCheck('user_id');

  if (!localStorage.getItem("hasSeenTour") && user_id) {
    startTourBtn.style.display = "block";
    document.body.classList.add("tour-show");
  } else {
    startTourBtn.style.display = "none";
  }

  startTourBtn.addEventListener("click", function () {
    introJs().setOptions({
      showProgress: true,
      showBullets: false,
      exitOnOverlayClick: false,
      steps: [
        {
          element: "#profile-box",
          intro: "Here is your profile details."
        },
        {
          element: ".dashboard-total-savings.box",
          intro: "Here is the Total Savings calculation"
        },
        {
          element: ".dashboard-total-expenses.box",
          intro: "Here is the Total Expenses calculation"
        },
        {
          element: "#add-activity",
          intro: "Click here to begin adding activity."
        },
        {
          element: ".recent-wrapper",
          intro: "Here's a section for your recent activities."
        }
      ]
    })
      .oncomplete(function () {
        localStorage.setItem("hasSeenTour", "true");
        startTourBtn.style.display = "none";
        document.body.classList.remove("tour-show");
      })
      .start();
  });
});

function showForgotPassword() {
  document.getElementById('forgotPassword').classList.add('active');
  document.getElementById('login').classList.remove('active');
}

function hideForgotPassword() {
  document.getElementById('login').classList.add('active');
  document.getElementById('forgotPassword').classList.remove('active');
}

function sendOTP() {

  const email = document.getElementById("forgot_email").value;

  if (!email) {
    showSnackbar("Please enter your email", 3, 'red');
    return;
  }

  fetch(`${server}/send_otp.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "email=" + encodeURIComponent(email)
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === "success") {
      showSnackbar("OTP sent to your email!");
      document.getElementById('forgotPassword').classList.remove('active');
      document.getElementById('otpPanel').classList.add('active');
      localStorage.setItem("reset_email", email);
    } else {
      showSnackbar(data.message);
    }
  })
  .catch(error => showSnackbar("Error: " + error));
}

function verifyOTP() {

  const otp = document.getElementById("otp_code").value;
  const newPassword = document.getElementById("new_password").value;

  const email = localStorage.getItem("reset_email");

  if (!otp || !newPassword) {
    showSnackbar("Please enter OTP and new password", 3, 'red');
    return;
  }

  fetch(`${server}/verify_otp.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "email=" + encodeURIComponent(email) + "&otp=" + encodeURIComponent(otp) + "&password=" + encodeURIComponent(newPassword)
  })
  .then(response => response.json())
  .then(data => {

    const color = data.message == 'Invalid OTP!' ? 'red' : '';
    showSnackbar(data.message, 5, color);

    if (data.status === "success") {
      document.getElementById('otpPanel').classList.remove('active');
      document.getElementById('login').classList.add('active');
    }
  })
  .catch(error => showSnackbar("Error: " + error));
}