// MealMaster App - Main JavaScript Logic

// Initialize Firebase first
initFirebase();

// DOM Elements
// Authentication
const authContainer = document.getElementById('authContainer');
const onboardingContainer = document.getElementById('onboardingContainer');
const mainContainer = document.getElementById('mainContainer');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const googleSignIn = document.getElementById('googleSignIn');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const onboardingForm = document.getElementById('onboardingForm');
const progressSteps = document.querySelectorAll('.progress-step');
const onboardingSteps = document.querySelectorAll('.onboarding-step');
const nextButtons = document.querySelectorAll('.btn-next');
const backButtons = document.querySelectorAll('.btn-back');
const logoutButton = document.getElementById('logoutButton');

// Main UI
const sidebarToggle = document.getElementById('sidebarToggle');
const appSidebar = document.getElementById('appSidebar');
const themeToggle = document.getElementById('themeToggle');
const userMenuButton = document.getElementById('userMenuButton');
const userDropdown = document.getElementById('userDropdown');
const sidebarNavItems = document.querySelectorAll('.sidebar-nav li');
const pages = document.querySelectorAll('.page');
const userDisplayName = document.getElementById('userDisplayName');
const userEmail = document.getElementById('userEmail');

// Meal Plan Page
const weekNavButtons = document.querySelectorAll('.week-nav-btn');
const currentWeekDisplay = document.getElementById('currentWeek');
const placeholderSlots = document.querySelectorAll('.placeholder-slot');
const addMealModal = document.getElementById('addMealModal');
const modalClose = document.querySelector('.modal-close');
const modalCancel = document.querySelector('.modal-cancel');
const recipeSelectCards = document.querySelectorAll('.recipe-select-card');
const modalAddButton = document.querySelector('.modal-add');
const mealCardDraggables = document.querySelectorAll('.meal-card');
const mealSlots = document.querySelectorAll('.meal-slot');

// Nutrition Page
const dateNavButtons = document.querySelectorAll('.date-nav-btn');
const currentDateDisplay = document.getElementById('currentDate');

// Variables
let currentUser = null;
let selectedRecipes = new Set();
let currentMealSlot = null;
let isDragging = false;
let draggedElement = null;
let userPreferences = null;
let isLoading = false;

// Recipe Management Functions
let recipes = [];
let filteredRecipes = [];
let currentFilter = 'all';

// Add Recipe Modal HTML
const recipeModalHTML = `
<div id="addRecipeModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Add New Recipe</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <form id="addRecipeForm">
                <div class="form-group">
                    <label for="recipeName">Recipe Name</label>
                    <input type="text" id="recipeName" required>
                </div>
                <div class="form-group">
                    <label for="recipeCategory">Category</label>
                    <select id="recipeCategory" required>
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snacks">Snacks</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="prepTime">Prep Time (min)</label>
                        <input type="number" id="prepTime" required>
                    </div>
                    <div class="form-group">
                        <label for="servings">Servings</label>
                        <input type="number" id="servings" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="calories">Calories</label>
                        <input type="number" id="calories" required>
                    </div>
                    <div class="form-group">
                        <label for="protein">Protein (g)</label>
                        <input type="number" id="protein" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="carbs">Carbs (g)</label>
                        <input type="number" id="carbs" required>
                    </div>
                    <div class="form-group">
                        <label for="fat">Fat (g)</label>
                        <input type="number" id="fat" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="ingredients">Ingredients (one per line)</label>
                    <textarea id="ingredients" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label for="instructions">Instructions</label>
                    <textarea id="instructions" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label for="imageUrl">Image URL (optional)</label>
                    <input type="url" id="imageUrl">
                </div>
                <div class="form-group">
                    <label>Tags</label>
                    <div class="tag-options">
                        <label class="tag-checkbox">
                            <input type="checkbox" name="tags" value="vegetarian"> Vegetarian
                        </label>
                        <label class="tag-checkbox">
                            <input type="checkbox" name="tags" value="vegan"> Vegan
                        </label>
                        <label class="tag-checkbox">
                            <input type="checkbox" name="tags" value="gluten-free"> Gluten-free
                        </label>
                        <label class="tag-checkbox">
                            <input type="checkbox" name="tags" value="low-carb"> Low-carb
                        </label>
                        <label class="tag-checkbox">
                            <input type="checkbox" name="tags" value="high-protein"> High-protein
                        </label>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-cancel">Cancel</button>
            <button class="btn btn-primary" id="saveRecipe">Save Recipe</button>
        </div>
    </div>
</div>
`;

// Add the modal to the document
document.body.insertAdjacentHTML('beforeend', recipeModalHTML);

// Recipe Modal Functions
function showAddRecipeModal() {
    const modal = document.getElementById('addRecipeModal');
    modal.classList.add('open');
}

function closeAddRecipeModal() {
    const modal = document.getElementById('addRecipeModal');
    modal.classList.remove('open');
    document.getElementById('addRecipeForm').reset();
}

async function handleAddRecipe(e) {
    e.preventDefault();
    const form = document.getElementById('addRecipeForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    showLoading(true);

    try {
        const recipe = {
            name: document.getElementById('recipeName').value,
            category: document.getElementById('recipeCategory').value,
            prepTime: parseInt(document.getElementById('prepTime').value),
            servings: parseInt(document.getElementById('servings').value),
            calories: parseInt(document.getElementById('calories').value),
            protein: parseInt(document.getElementById('protein').value),
            carbs: parseInt(document.getElementById('carbs').value),
            fat: parseInt(document.getElementById('fat').value),
            ingredients: document.getElementById('ingredients').value.split('\n').filter(i => i.trim()),
            instructions: document.getElementById('instructions').value.split('\n').filter(i => i.trim()),
            imageUrl: document.getElementById('imageUrl').value || 'default-recipe.jpg',
            tags: Array.from(document.querySelectorAll('input[name="tags"]:checked')).map(input => input.value)
        };

        const recipeId = await db.saveRecipe(currentUser.uid, recipe);
        recipe.id = recipeId;
        recipes.push(recipe);
        
        updateRecipesList();
        closeAddRecipeModal();
        form.reset();
        showToast('Recipe added successfully!', 'success');
    } catch (error) {
        console.error('Error adding recipe:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Recipe Search and Filter Functions
function handleRecipeSearch(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm) ||
            recipe.ingredients.some(i => i.toLowerCase().includes(searchTerm)) ||
            recipe.tags.some(t => t.toLowerCase().includes(searchTerm));
        
        return matchesSearch && (currentFilter === 'all' || recipe.category === currentFilter);
    });
    
    updateRecipesList();
}

function handleRecipeFilter(category) {
    currentFilter = category;
    filteredRecipes = recipes.filter(recipe => 
        category === 'all' || recipe.category === category
    );
    
    // Update active filter button
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    updateRecipesList();
}

function updateRecipesList() {
    const container = document.querySelector('.recipes-container');
    if (!container) return;

    container.innerHTML = filteredRecipes.map(recipe => `
        <div class="recipe-full-card" data-recipe-id="${recipe.id}">
            <div class="recipe-image">
                <img src="${recipe.imageUrl}" alt="${recipe.name}">
                <button class="favorite-btn"><i class="far fa-heart"></i></button>
            </div>
            <div class="recipe-content">
                <h3>${recipe.name}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.prepTime} min</span>
                    <span><i class="fas fa-fire"></i> ${recipe.calories} cal</span>
                    <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
                </div>
                <div class="recipe-tags">
                    ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <p class="recipe-description">
                    ${recipe.ingredients.length} ingredients • ${recipe.protein}g protein • ${recipe.carbs}g carbs • ${recipe.fat}g fat
                </p>
                <div class="recipe-actions">
                    <button class="btn btn-outline view-recipe" onclick="viewRecipeDetails('${recipe.id}')">View Recipe</button>
                    <button class="btn btn-primary add-to-plan" onclick="addRecipeToPlan('${recipe.id}')">Add to Plan</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize Recipe Management
async function initializeRecipeManagement() {
    // Add event listeners
    document.querySelector('.btn.btn-primary[onclick="showAddRecipeModal()"]')?.addEventListener('click', showAddRecipeModal);
    document.querySelector('.modal-close')?.addEventListener('click', closeAddRecipeModal);
    document.querySelector('.modal-cancel')?.addEventListener('click', closeAddRecipeModal);
    document.getElementById('saveRecipe')?.addEventListener('click', handleAddRecipe);
    
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => handleRecipeSearch(e.target.value));
    }
    
    // Filter functionality
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => handleRecipeFilter(tab.dataset.category));
    });
    
    // Load existing recipes
    try {
        recipes = await db.getUserRecipes(currentUser.uid);
        filteredRecipes = [...recipes];
        updateRecipesList();
    } catch (error) {
        console.error('Error loading recipes:', error);
        showToast('Failed to load recipes', 'error');
    }
}

// Add styles
const recipeStyles = document.createElement('style');
recipeStyles.textContent = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
    }

    .modal.open {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-content {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
    }

    .modal-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-body {
        padding: 20px;
    }

    .modal-footer {
        padding: 20px;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .form-row {
        display: flex;
        gap: 15px;
    }

    .form-row .form-group {
        flex: 1;
    }

    .tag-options {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .tag-checkbox {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .recipe-full-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        overflow: hidden;
        margin-bottom: 20px;
    }

    .recipe-image {
        position: relative;
        height: 200px;
    }

    .recipe-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .recipe-content {
        padding: 20px;
    }

    .recipe-meta {
        display: flex;
        gap: 15px;
        margin: 10px 0;
        color: #666;
    }

    .recipe-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 10px 0;
    }

    .tag {
        background: #f0f0f0;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.9em;
    }

    .recipe-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }
`;
document.head.appendChild(recipeStyles);

// Initialize MealMaster App
async function initApp() {
    console.log('Initializing MealMaster App...');
    createToastContainer();
    createLoadingOverlay();
    setupEventListeners();
    checkAuthState();
    setupDarkModeToggle();
}

// Setup Event Listeners
function setupEventListeners() {
    // Authentication
    authTabs.forEach(tab => {
        tab.addEventListener('click', switchAuthTab);
    });
    
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    googleSignIn.addEventListener('click', handleGoogleSignIn);
    onboardingForm.addEventListener('submit', handlePreferencesSave);
    
    nextButtons.forEach(button => {
        button.addEventListener('click', goToNextStep);
    });
    
    backButtons.forEach(button => {
        button.addEventListener('click', goToPreviousStep);
    });
    
    logoutButton.addEventListener('click', handleLogout);
    
    // Main UI
    sidebarToggle.addEventListener('click', toggleSidebar);
    themeToggle.addEventListener('click', toggleTheme);
    userMenuButton.addEventListener('click', toggleUserDropdown);
    
    document.addEventListener('click', (e) => {
        if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.add('hidden');
        }
    });
    
    sidebarNavItems.forEach(item => {
        item.addEventListener('click', switchPage);
    });
    
    // Handle URL hash changes for navigation
    window.addEventListener('hashchange', handleHashChange);
    
    // Meal Plan Page
    weekNavButtons.forEach(button => {
        button.addEventListener('click', navigateWeek);
    });
    
    placeholderSlots.forEach(slot => {
        slot.addEventListener('click', openAddMealModal);
    });
    
    modalClose.addEventListener('click', closeAddMealModal);
    modalCancel.addEventListener('click', closeAddMealModal);
    
    recipeSelectCards.forEach(card => {
        card.addEventListener('click', toggleRecipeSelection);
    });
    
    modalAddButton.addEventListener('click', addSelectedMealToPlan);
    
    // Setup Drag and Drop
    setupDragAndDrop();
    
    // Nutrition Page
    dateNavButtons.forEach(button => {
        button.addEventListener('click', navigateDate);
    });
}

// Authentication Functions
function switchAuthTab(e) {
    const tabName = e.target.dataset.tab;
    
    authTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    authForms.forEach(form => {
        form.classList.remove('active');
    });
    
    e.target.classList.add('active');
    document.getElementById(`${tabName}Form`).classList.add('active');
}

async function checkAuthState() {
    console.log('Checking authentication state...');
    showLoading(true);
    
    try {
        // Listen for auth state changes
        firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log('User is authenticated:', user);
                currentUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    emailVerified: user.emailVerified
                };
                
                // Display user info
                userDisplayName.textContent = currentUser.displayName || currentUser.email;
                userEmail.textContent = currentUser.email;
                
                // Check if onboarding is complete
                try {
                    userPreferences = await db.getUserPreferences(user.uid);
                    if (userPreferences) {
                        showMainApp();
                    } else {
                        showOnboarding();
                    }
                } catch (error) {
                    console.error('Error checking user preferences:', error);
                    showOnboarding();
                }
            } else {
                showAuth();
            }
            showLoading(false);
        });
    } catch (error) {
        console.error('Error checking auth state:', error);
        showAuth();
        showLoading(false);
    }
}

// Toast Notification Utility
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = document.createElement('i');
    icon.className = `toast-icon fas ${
        type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' :
        type === 'warning' ? 'fa-exclamation-triangle' :
        'fa-info-circle'
    }`;
    
    const messageSpan = document.createElement('span');
    messageSpan.className = 'toast-message';
    messageSpan.textContent = message;
    
    const closeButton = document.createElement('span');
    closeButton.className = 'toast-close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => toast.remove();
    
    toast.appendChild(icon);
    toast.appendChild(messageSpan);
    toast.appendChild(closeButton);
    container.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Update error handling in existing functions
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        showLoading(true);
        const user = await signIn(email, password);
        currentUser = user;
        showMainApp();
    } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
    } finally {
        showLoading(false);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const displayName = document.getElementById('signupName').value;
    
    try {
        showLoading(true);
        const user = await signUp(email, password, displayName);
        currentUser = user;
        showOnboarding();
    } catch (error) {
        signupError.textContent = error.message;
        signupError.style.display = 'block';
    } finally {
        showLoading(false);
    }
}

async function handleGoogleSignIn() {
    try {
        showLoading(true);
        const user = await signInWithGoogle();
        currentUser = user;
        showMainApp();
    } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
    } finally {
        showLoading(false);
    }
}

async function handleLogout() {
    try {
        showLoading(true);
        await signOut();
        currentUser = null;
        showAuth();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Loading State Management
function showLoading(isLoading) {
    const loadingOverlay = document.getElementById('loadingOverlay') || createLoadingOverlay();
    loadingOverlay.style.display = isLoading ? 'flex' : 'none';
}

function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading...</div>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

// Onboarding Functions
function goToNextStep(e) {
    const currentStep = parseInt(e.target.dataset.next);
    
    // Validate current step
    if (currentStep === 1) {
        const age = document.getElementById('userAge').value;
        const gender = document.querySelector('input[name="gender"]:checked');
        
        if (!age || !gender) {
            alert('Please fill in all required fields.');
            return;
        }
    }
    
    progressSteps.forEach(step => {
        step.classList.remove('active');
    });
    
    onboardingSteps.forEach(step => {
        step.classList.remove('active');
    });
    
    document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');
    document.querySelector(`.onboarding-step[data-step="${currentStep}"]`).classList.add('active');
}

function goToPreviousStep(e) {
    const previousStep = parseInt(e.target.dataset.back);
    
    progressSteps.forEach(step => {
        step.classList.remove('active');
    });
    
    onboardingSteps.forEach(step => {
        step.classList.remove('active');
    });
    
    document.querySelector(`.progress-step[data-step="${previousStep}"]`).classList.add('active');
    document.querySelector(`.onboarding-step[data-step="${previousStep}"]`).classList.add('active');
}

// Data Validation Functions
function validateUserPreferences(preferences) {
    const requiredFields = ['age', 'gender', 'activityLevel', 'dietType'];
    const missingFields = requiredFields.filter(field => !preferences[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    if (preferences.age < 13 || preferences.age > 100) {
        throw new Error('Age must be between 13 and 100');
    }
    
    return true;
}

function validateMealPlan(mealPlan) {
    if (!mealPlan.week || !mealPlan.meals) {
        throw new Error('Invalid meal plan format');
    }
    
    // Validate each meal
    Object.values(mealPlan.meals).forEach(meal => {
        if (!meal.name || !meal.type || !meal.ingredients || !meal.nutrition) {
            throw new Error('Invalid meal format');
        }
    });
    
    return true;
}

// Data Management Functions
async function handlePreferencesSave(e) {
    e.preventDefault();
    showLoading(true);
    
    try {
        const preferences = {
            age: parseInt(document.getElementById('userAge').value),
            gender: document.querySelector('input[name="gender"]:checked').value,
            activityLevel: document.getElementById('activityLevel').value,
            dietType: document.getElementById('dietType').value,
            allergies: Array.from(document.querySelectorAll('input[name="allergies"]:checked')).map(input => input.value),
            fitnessGoal: document.getElementById('fitnessGoal').value,
            calorieGoal: parseInt(document.getElementById('calorieGoal').value) || null,
            focusAreas: Array.from(document.querySelectorAll('input[name="focus"]:checked')).map(input => input.value)
        };

        await db.saveUserPreferences(currentUser.uid, preferences);
        userPreferences = preferences;
        showToast('Preferences saved successfully!', 'success');
        showMainApp();
    } catch (error) {
        console.error('Error saving preferences:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function handleMealPlanSave(week, mealPlan) {
    showLoading(true);
    try {
        await db.saveMealPlan(currentUser.uid, week, mealPlan);
        showToast('Meal plan saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving meal plan:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function handleRecipeSave(recipe) {
    showLoading(true);
    try {
        const recipeId = await db.saveRecipe(currentUser.uid, recipe);
        showToast('Recipe saved successfully!', 'success');
        return recipeId;
    } catch (error) {
        console.error('Error saving recipe:', error);
        showToast(error.message, 'error');
        return null;
    } finally {
        showLoading(false);
    }
}

async function handleGroceryListSave(list) {
    showLoading(true);
    try {
        await db.saveGroceryList(currentUser.uid, list);
        showToast('Grocery list saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving grocery list:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function handleNutritionLogSave(date, log) {
    showLoading(true);
    try {
        await db.saveNutritionLog(currentUser.uid, date, log);
        showToast('Nutrition log saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving nutrition log:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// UI View Functions
function showAuth() {
    authContainer.classList.remove('hidden');
    onboardingContainer.classList.add('hidden');
    mainContainer.classList.add('hidden');
}

function showOnboarding() {
    authContainer.classList.add('hidden');
    onboardingContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
}

function showMainApp() {
    authContainer.classList.add('hidden');
    onboardingContainer.classList.add('hidden');
    mainContainer.classList.remove('hidden');
}

// Main App UI Functions
function toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
    document.body.classList.toggle('sidebar-visible');
}

function toggleUserDropdown() {
    userDropdown.classList.toggle('hidden');
}

function setupDarkModeToggle() {
    // Check for previously saved theme preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    
    if (darkMode) {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    if (document.body.classList.contains('dark-theme')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('darkMode', 'true');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('darkMode', 'false');
    }
}

function switchPage(e) {
    e.preventDefault();
    
    const pageId = e.currentTarget.dataset.page;
    window.location.hash = pageId;
}

function handleHashChange() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    
    // Update sidebar active state
    sidebarNavItems.forEach(item => {
        if (item.dataset.page === hash) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update page display
    pages.forEach(page => {
        if (page.id === `${hash}-page`) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
}

// Meal Plan Page Functions
function navigateWeek(e) {
    const direction = e.currentTarget.classList.contains('prev') ? -1 : 1;
    
    // In a real app, you would update the actual date and regenerate the meal plan
    // For demo, we'll just update the display text
    const currentText = currentWeekDisplay.textContent;
    
    // Example update (in a real app, use proper date manipulation)
    if (direction === -1) {
        currentWeekDisplay.textContent = 'April 8 - April 14, 2023';
    } else {
        currentWeekDisplay.textContent = 'April 22 - April 28, 2023';
    }
}

function openAddMealModal(e) {
    currentMealSlot = e.currentTarget.parentElement;
    addMealModal.classList.add('open');
}

function closeAddMealModal() {
    addMealModal.classList.remove('open');
    selectedRecipes.clear();
    
    // Reset selection state of recipe cards
    recipeSelectCards.forEach(card => {
        card.classList.remove('selected');
    });
}

function toggleRecipeSelection(e) {
    const card = e.currentTarget;
    const recipeId = card.dataset.id;
    
    if (card.classList.contains('selected')) {
        card.classList.remove('selected');
        selectedRecipes.delete(recipeId);
    } else {
        // For simplicity, let's only allow one selection at a time
        recipeSelectCards.forEach(c => c.classList.remove('selected'));
        selectedRecipes.clear();
        
        card.classList.add('selected');
        selectedRecipes.add(recipeId);
    }
}

function addSelectedMealToPlan() {
    if (selectedRecipes.size === 0 || !currentMealSlot) {
        return;
    }
    
    // Get the selected recipe ID
    const recipeId = Array.from(selectedRecipes)[0];
    
    // Find the recipe data
    const recipeCard = document.querySelector(`.recipe-select-card[data-id="${recipeId}"]`);
    
    if (!recipeCard) {
        return;
    }
    
    // Get recipe details
    const recipeName = recipeCard.querySelector('h4').textContent;
    const recipeInfo = recipeCard.querySelector('p').textContent;
    const recipeImg = recipeCard.querySelector('img').src;
    
    // Create the meal card
    const mealCardHTML = `
        <div class="meal-card" draggable="true">
            <div class="meal-info">
                <h4>${recipeName}</h4>
                <p>${recipeInfo}</p>
            </div>
            <div class="meal-actions">
                <button class="meal-btn edit"><i class="fas fa-edit"></i></button>
                <button class="meal-btn delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `;
    
    // Update the meal slot
    currentMealSlot.innerHTML = mealCardHTML;
    
    // Setup new drag and drop
    setupDragAndDrop();
    
    // Add event listeners to buttons
    const editButton = currentMealSlot.querySelector('.edit');
    const deleteButton = currentMealSlot.querySelector('.delete');
    
    if (editButton) {
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // In a real app, open edit modal
            alert('Edit meal - would open edit form');
        });
    }
    
    if (deleteButton) {
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            currentMealSlot.innerHTML = '<div class="placeholder-slot">Add meal</div>';
            
            // Re-attach event listener to new placeholder
            const newPlaceholder = currentMealSlot.querySelector('.placeholder-slot');
            if (newPlaceholder) {
                newPlaceholder.addEventListener('click', openAddMealModal);
            }
        });
    }
    
    // Close the modal
    closeAddMealModal();
}

// Drag and Drop for Meal Plan
function setupDragAndDrop() {
    const dragItems = document.querySelectorAll('.meal-card');
    const dropZones = document.querySelectorAll('.meal-slot');
    
    dragItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    isDragging = true;
    draggedElement = e.currentTarget;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    
    // Add dragging class
    this.classList.add('dragging');
}

function handleDragEnd(e) {
    isDragging = false;
    draggedElement = null;
    
    // Remove dragging class
    this.classList.remove('dragging');
    
    // Remove drop effect from all drop zones
    document.querySelectorAll('.meal-slot').forEach(zone => {
        zone.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Allows dropping
    }
    
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.stopPropagation();
    
    if (draggedElement !== this) {
        // Placeholder handling
        if (this.querySelector('.placeholder-slot')) {
            this.innerHTML = draggedElement.outerHTML;
            
            // Add new meal card event listeners
            const newMealCard = this.querySelector('.meal-card');
            if (newMealCard) {
                newMealCard.addEventListener('dragstart', handleDragStart);
                newMealCard.addEventListener('dragend', handleDragEnd);
                
                // Add button event listeners
                const editButton = newMealCard.querySelector('.edit');
                const deleteButton = newMealCard.querySelector('.delete');
                
                if (editButton) {
                    editButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        alert('Edit meal - would open edit form');
                    });
                }
                
                if (deleteButton) {
                    deleteButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.innerHTML = '<div class="placeholder-slot">Add meal</div>';
                        
                        // Re-attach event listener to new placeholder
                        const newPlaceholder = this.querySelector('.placeholder-slot');
                        if (newPlaceholder) {
                            newPlaceholder.addEventListener('click', openAddMealModal);
                        }
                    });
                }
            }
            
            // Replace source with placeholder
            draggedElement.parentNode.innerHTML = '<div class="placeholder-slot">Add meal</div>';
            
            // Re-attach event listener to source placeholder
            const sourcePlaceholder = draggedElement.parentNode.querySelector('.placeholder-slot');
            if (sourcePlaceholder) {
                sourcePlaceholder.addEventListener('click', openAddMealModal);
            }
        } else {
            // Swap between two meal cards
            const sourceContent = draggedElement.outerHTML;
            const targetContent = this.innerHTML;
            
            this.innerHTML = sourceContent;
            draggedElement.parentNode.innerHTML = targetContent;
            
            // Update event listeners for both cards
            setupDragAndDrop();
        }
    }
    
    this.classList.remove('drag-over');
    return false;
}

// Nutrition Page Functions
function navigateDate(e) {
    const direction = e.currentTarget.classList.contains('prev') ? -1 : 1;
    
    // In a real app, you would update the actual date and fetch nutrition log
    // For demo, we'll just update the display text
    const currentText = currentDateDisplay.textContent;
    
    // Example update (in a real app, use proper date manipulation)
    if (direction === -1) {
        currentDateDisplay.textContent = 'Yesterday, April 16, 2023';
    } else {
        currentDateDisplay.textContent = 'Tomorrow, April 18, 2023';
    }
}

// Meal Planning Functions
async function handleAddMealToPlan(mealSlot, recipeId) {
    showLoading(true);
    try {
        const recipe = await db.getUserRecipes(currentUser.uid).then(recipes => 
            recipes.find(r => r.id === recipeId)
        );

        if (!recipe) {
            throw new Error('Recipe not found');
        }

        const mealCard = createMealCard(recipe);
        mealSlot.innerHTML = '';
        mealSlot.appendChild(mealCard);

        // Update meal plan in Firebase
        const week = getCurrentWeek();
        const mealPlan = await db.getMealPlan(currentUser.uid, week) || { meals: {} };
        mealPlan.meals[mealSlot.dataset.meal] = recipe;
        await handleMealPlanSave(week, mealPlan);

        showToast('Meal added to plan!', 'success');
    } catch (error) {
        console.error('Error adding meal to plan:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function createMealCard(recipe) {
    const card = document.createElement('div');
    card.className = 'meal-card';
    card.draggable = true;
    card.dataset.recipeId = recipe.id;

    card.innerHTML = `
        <div class="meal-info">
            <h4>${recipe.name}</h4>
            <p>${recipe.calories} cal • ${recipe.protein}g protein</p>
        </div>
        <div class="meal-actions">
            <button class="meal-btn edit"><i class="fas fa-edit"></i></button>
            <button class="meal-btn delete"><i class="fas fa-trash"></i></button>
        </div>
    `;

    return card;
}

// Recipe Management Functions
async function handleAddRecipe(recipeData) {
    showLoading(true);
    try {
        const recipeId = await handleRecipeSave(recipeData);
        if (recipeId) {
            // Update UI with new recipe
            const recipeCard = createRecipeCard({ id: recipeId, ...recipeData });
            document.querySelector('.recipes-container').appendChild(recipeCard);
        }
    } catch (error) {
        console.error('Error adding recipe:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.recipeId = recipe.id;

    card.innerHTML = `
        <div class="recipe-image">
            <img src="${recipe.imageUrl || 'default-recipe.jpg'}" alt="${recipe.name}">
            <button class="favorite-btn"><i class="far fa-heart"></i></button>
        </div>
        <div class="recipe-content">
            <h3>${recipe.name}</h3>
            <div class="recipe-meta">
                <span><i class="fas fa-clock"></i> ${recipe.prepTime} min</span>
                <span><i class="fas fa-fire"></i> ${recipe.calories} cal</span>
                <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
            </div>
            <div class="recipe-tags">
                ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <p class="recipe-description">${recipe.description}</p>
            <div class="recipe-actions">
                <button class="btn btn-outline">View Recipe</button>
                <button class="btn btn-primary">Add to Plan</button>
            </div>
        </div>
    `;

    return card;
}

// Grocery List Functions
async function handleAddToGroceryList(ingredients) {
    showLoading(true);
    try {
        const currentList = await db.getGroceryList(currentUser.uid) || { items: [] };
        const newItems = ingredients.filter(ingredient => 
            !currentList.items.some(item => item.name === ingredient.name)
        );
        
        currentList.items = [...currentList.items, ...newItems];
        await handleGroceryListSave(currentList);
        
        // Update UI
        updateGroceryListUI(currentList.items);
        showToast('Items added to grocery list!', 'success');
    } catch (error) {
        console.error('Error adding to grocery list:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function updateGroceryListUI(items) {
    const container = document.querySelector('.grocery-items');
    container.innerHTML = items.map(item => `
        <li class="grocery-item">
            <label class="grocery-checkbox">
                <input type="checkbox" ${item.checked ? 'checked' : ''}>
                <span class="checkbox-custom"></span>
            </label>
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">${item.quantity}</span>
            </div>
            <div class="item-actions">
                <button class="item-action-btn"><i class="fas fa-edit"></i></button>
                <button class="item-action-btn"><i class="fas fa-trash"></i></button>
            </div>
        </li>
    `).join('');
}

// Nutrition Tracking Functions
async function handleAddNutritionEntry(entry) {
    showLoading(true);
    try {
        const date = new Date().toISOString().split('T')[0];
        const currentLog = await db.getNutritionLog(currentUser.uid, date) || { entries: [] };
        
        currentLog.entries.push(entry);
        await handleNutritionLogSave(date, currentLog);
        
        // Update UI
        updateNutritionLogUI(currentLog.entries);
        showToast('Nutrition entry added!', 'success');
    } catch (error) {
        console.error('Error adding nutrition entry:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function updateNutritionLogUI(entries) {
    const container = document.querySelector('.nutrition-entries');
    container.innerHTML = entries.map(entry => `
        <div class="nutrition-entry">
            <div class="entry-time">${entry.time}</div>
            <div class="entry-details">
                <h4>${entry.mealName}</h4>
                <div class="entry-macros">
                    <span>${entry.calories} cal</span>
                    <span>${entry.protein}g protein</span>
                    <span>${entry.carbs}g carbs</span>
                    <span>${entry.fat}g fat</span>
                </div>
            </div>
            <div class="entry-actions">
                <button class="entry-action-btn"><i class="fas fa-edit"></i></button>
                <button class="entry-action-btn"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// Meal Completion Functions
async function handleMealCompletion(mealType, isCompleted) {
    showLoading(true);
    try {
        const date = new Date().toISOString().split('T')[0];
        const currentLog = await db.getNutritionLog(currentUser.uid, date) || { 
            meals: {},
            completedMeals: {}
        };

        // Update completion status
        currentLog.completedMeals[mealType] = isCompleted;

        // Save to Firebase
        await handleNutritionLogSave(date, currentLog);

        // Update UI
        const button = document.querySelector(`[data-meal-type="${mealType}"] .meal-action`);
        if (button) {
            button.classList.toggle('completed', isCompleted);
            button.innerHTML = `<i class="fas fa-check"></i>`;
        }

        showToast(`${mealType} marked as ${isCompleted ? 'completed' : 'incomplete'}!`, 'success');
    } catch (error) {
        console.error('Error updating meal completion:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Update meal list initialization
async function initializeMealList() {
    const date = new Date().toISOString().split('T')[0];
    try {
        const nutritionLog = await db.getNutritionLog(currentUser.uid, date);
        const mealList = document.querySelector('.meal-list');
        
        if (!mealList) return;

        const meals = [
            {
                type: 'Breakfast',
                name: 'Greek Yogurt Parfait',
                calories: 350,
                protein: 15,
                carbs: 45,
                fat: 12
            },
            {
                type: 'Lunch',
                name: 'Quinoa Salad Bowl',
                calories: 420,
                protein: 18,
                carbs: 65,
                fat: 14
            },
            {
                type: 'Dinner',
                name: 'Baked Salmon with Roasted Vegetables',
                calories: 480,
                protein: 32,
                carbs: 35,
                fat: 22
            },
            {
                type: 'Snack',
                name: 'Apple with Almond Butter',
                calories: 200,
                protein: 5,
                carbs: 25,
                fat: 10
            }
        ];

        mealList.innerHTML = meals.map(meal => `
            <div class="meal-item" data-meal-type="${meal.type}">
                <div class="meal-time">${meal.type}</div>
                <div class="meal-content">
                    <div class="meal-name">${meal.name}</div>
                    <div class="meal-macros">${meal.calories} cal • ${meal.protein}g protein • ${meal.carbs}g carbs • ${meal.fat}g fat</div>
                </div>
                <button class="meal-action ${nutritionLog?.completedMeals?.[meal.type] ? 'completed' : ''}" 
                        onclick="handleMealCompletion('${meal.type}', ${!nutritionLog?.completedMeals?.[meal.type]})">
                    <i class="fas fa-check"></i>
                </button>
            </div>
        `).join('');

        // Add event listeners to meal action buttons
        document.querySelectorAll('.meal-action').forEach(button => {
            const mealType = button.closest('.meal-item').dataset.mealType;
            button.addEventListener('click', () => {
                const isCurrentlyCompleted = button.classList.contains('completed');
                handleMealCompletion(mealType, !isCurrentlyCompleted);
            });
        });

    } catch (error) {
        console.error('Error initializing meal list:', error);
        showToast('Failed to load meal completion status', 'error');
    }
}

// Add to the initialization code
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initializeMealList();
    initializeRecipeManagement();
});

// Update the styles
const style = document.createElement('style');
style.textContent = `
    .meal-action {
        background: none;
        border: 2px solid #e0e0e0;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .meal-action.completed {
        background-color: #4CAF50;
        border-color: #4CAF50;
        color: white;
    }

    .meal-action:hover {
        background-color: #f5f5f5;
        transform: scale(1.05);
    }

    .meal-action.completed:hover {
        background-color: #43A047;
    }

    .meal-item {
        display: flex;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #e0e0e0;
    }

    .meal-content {
        flex: 1;
        margin: 0 15px;
    }

    .meal-name {
        font-weight: 600;
        margin-bottom: 5px;
    }

    .meal-macros {
        color: #666;
        font-size: 0.9em;
    }

    .meal-time {
        width: 100px;
        font-weight: 500;
        color: #333;
    }
`;
document.head.appendChild(style);
