// Firebase Configuration & Services
// This file handles all Firebase-related functionality

// Initialize Firebase
let firebaseApp;
let firebaseAuth;
let firestoreDb;

function initFirebase() {
    try {
        // Check if Firebase is already initialized
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp({
                apiKey: "AIzaSyDljL-e4ilLlrqJKFjhjckltBiQYhEMyrI",
                authDomain: "meal-app01.firebaseapp.com",
                projectId: "meal-app01",
                storageBucket: "meal-app01.firebasestorage.app",
                messagingSenderId: "907078686224",
                appId: "1:907078686224:web:a20b5d291cd2985d4edc95",
                measurementId: "G-KJM6VWD588"
            });
            
            // Initialize services
            firebaseAuth = firebaseApp.auth();
            firestoreDb = firebaseApp.firestore();
            
            // Enable offline persistence
            firestoreDb.enablePersistence()
                .catch((err) => {
                    if (err.code === 'failed-precondition') {
                        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
                    } else if (err.code === 'unimplemented') {
                        console.warn('The current browser does not support persistence.');
                    }
                });
            
            console.log('Firebase initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw new Error('Failed to initialize Firebase. Please check your configuration.');
    }
}

// Auth Functions
// In a real app implementation, you would replace the mock implementations in script.js
// with these Firebase implementations

// Listen for auth state changes
function onAuthStateChanged(callback) {
    return firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            callback({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified
            });
        } else {
            // User is signed out
            callback(null);
        }
    }, (error) => {
        console.error('Auth state change error:', error);
        callback(null);
    });
}

// Sign up with email and password
async function signUp(email, password, displayName) {
    try {
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        
        // Update user profile with display name
        await userCredential.user.updateProfile({
            displayName: displayName
        });
        
        // Send email verification
        await userCredential.user.sendEmailVerification();
        
        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            emailVerified: userCredential.user.emailVerified
        };
    } catch (error) {
        console.error('Sign up error:', error);
        throw handleAuthError(error);
    }
}

// Sign in with email and password
async function signIn(email, password) {
    try {
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            emailVerified: userCredential.user.emailVerified
        };
    } catch (error) {
        console.error('Sign in error:', error);
        throw handleAuthError(error);
    }
}

// Sign in with Google
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const userCredential = await firebaseAuth.signInWithPopup(provider);
        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            emailVerified: userCredential.user.emailVerified
        };
    } catch (error) {
        console.error('Google sign in error:', error);
        throw handleAuthError(error);
    }
}

// Sign out
async function signOut() {
    try {
        await firebaseAuth.signOut();
    } catch (error) {
        console.error('Sign out error:', error);
        throw handleAuthError(error);
    }
}

// Reset password
async function resetPassword(email) {
    try {
        await firebaseAuth.sendPasswordResetEmail(email);
    } catch (error) {
        console.error('Password reset error:', error);
        throw handleAuthError(error);
    }
}

// Helper function to handle authentication errors
function handleAuthError(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return new Error('This email is already registered. Please try logging in.');
        case 'auth/invalid-email':
            return new Error('Please enter a valid email address.');
        case 'auth/operation-not-allowed':
            return new Error('This operation is not allowed. Please contact support.');
        case 'auth/weak-password':
            return new Error('Password should be at least 6 characters long.');
        case 'auth/user-disabled':
            return new Error('This account has been disabled. Please contact support.');
        case 'auth/user-not-found':
            return new Error('No account found with this email.');
        case 'auth/wrong-password':
            return new Error('Incorrect password. Please try again.');
        case 'auth/too-many-requests':
            return new Error('Too many failed attempts. Please try again later.');
        default:
            return new Error('An error occurred. Please try again.');
    }
}

// Firestore Functions
// These functions handle database operations

// Get a document from Firestore
function getDocument(collection, docId) {
    return firestoreDb.collection(collection).doc(docId).get();
}

// Add a document to Firestore
function addDocument(collection, data) {
    return firestoreDb.collection(collection).add(data);
}

// Update a document in Firestore
function updateDocument(collection, docId, data) {
    return firestoreDb.collection(collection).doc(docId).update(data);
}

// Set a document in Firestore (create or overwrite)
function setDocument(collection, docId, data) {
    return firestoreDb.collection(collection).doc(docId).set(data);
}

// Delete a document from Firestore
function deleteDocument(collection, docId) {
    return firestoreDb.collection(collection).doc(docId).delete();
}

// Query documents from Firestore
function queryDocuments(collection, field, operator, value) {
    return firestoreDb.collection(collection).where(field, operator, value).get();
}

// User Data Functions
// These functions manage user-specific data

// Save user preferences
function saveUserPreferences(userId, preferences) {
    return setDocument('userPreferences', userId, preferences);
}

// Get user preferences
function getUserPreferences(userId) {
    return getDocument('userPreferences', userId);
}

// Save meal plan
function saveMealPlan(userId, week, mealPlan) {
    return setDocument('mealPlans', `${userId}_${week}`, mealPlan);
}

// Get meal plan
function getMealPlan(userId, week) {
    return getDocument('mealPlans', `${userId}_${week}`);
}

// Save nutrition log
function saveNutritionLog(userId, date, nutritionData) {
    return setDocument('nutritionLogs', `${userId}_${date}`, nutritionData);
}

// Get nutrition log
function getNutritionLog(userId, date) {
    return getDocument('nutritionLogs', `${userId}_${date}`);
}

// Save recipe
function saveRecipe(userId, recipe) {
    // Add a timestamp
    recipe.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    return addDocument('recipes', {
        ...recipe,
        userId
    });
}

// Get user recipes
function getUserRecipes(userId) {
    return queryDocuments('recipes', 'userId', '==', userId);
}

// Toggle recipe favorite status
function toggleFavoriteRecipe(recipeId, isFavorite) {
    return updateDocument('recipes', recipeId, { isFavorite });
}

// Initialize Firebase when the script loads
initFirebase();

// Export functions for use in script.js
// In a real module-based setup, you'd use export statements
// For this demo, we'll make them global
window.firebaseAuth = {
    onAuthStateChanged,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword
};

window.firebaseDb = {
    getDocument,
    addDocument,
    updateDocument,
    setDocument,
    deleteDocument,
    queryDocuments,
    saveUserPreferences,
    getUserPreferences,
    saveMealPlan,
    getMealPlan,
    saveNutritionLog,
    getNutritionLog,
    saveRecipe,
    getUserRecipes,
    toggleFavoriteRecipe
};

// Firestore Data Management Functions
const db = {
    // User Preferences
    async saveUserPreferences(userId, preferences) {
        try {
            await firebase.firestore().collection('userPreferences').doc(userId).set({
                ...preferences,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error saving preferences:', error);
            throw error;
        }
    },

    async getUserPreferences(userId) {
        try {
            const doc = await firebase.firestore().collection('userPreferences').doc(userId).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting preferences:', error);
            throw error;
        }
    },

    // Meal Plans
    async saveMealPlan(userId, week, mealPlan) {
        try {
            await firebase.firestore().collection('mealPlans').doc(`${userId}_${week}`).set({
                ...mealPlan,
                userId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error saving meal plan:', error);
            throw error;
        }
    },

    async getMealPlan(userId, week) {
        try {
            const doc = await firebase.firestore().collection('mealPlans').doc(`${userId}_${week}`).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting meal plan:', error);
            throw error;
        }
    },

    // Recipes
    async saveRecipe(userId, recipe) {
        try {
            const docRef = await firebase.firestore().collection('recipes').add({
                ...recipe,
                userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error saving recipe:', error);
            throw error;
        }
    },

    async getUserRecipes(userId) {
        try {
            const snapshot = await firebase.firestore()
                .collection('recipes')
                .where('userId', '==', userId)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting recipes:', error);
            throw error;
        }
    },

    // Grocery Lists
    async saveGroceryList(userId, list) {
        try {
            await firebase.firestore().collection('groceryLists').doc(userId).set({
                ...list,
                userId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error saving grocery list:', error);
            throw error;
        }
    },

    async getGroceryList(userId) {
        try {
            const doc = await firebase.firestore().collection('groceryLists').doc(userId).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting grocery list:', error);
            throw error;
        }
    },

    // Nutrition Logs
    async saveNutritionLog(userId, date, log) {
        try {
            await firebase.firestore().collection('nutritionLogs').doc(`${userId}_${date}`).set({
                ...log,
                userId,
                date,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error saving nutrition log:', error);
            throw error;
        }
    },

    async getNutritionLog(userId, date) {
        try {
            const doc = await firebase.firestore().collection('nutritionLogs').doc(`${userId}_${date}`).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting nutrition log:', error);
            throw error;
        }
    }
};

// Export the db object
window.db = db;
