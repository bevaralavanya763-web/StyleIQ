// StyleIQ - Seller Registration

import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const registerForm = document.getElementById("registerForm");
const registerButton = document.getElementById("registerButton");
const registerMessage = document.getElementById("registerMessage");


registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const sellerName =
        document.getElementById("sellerName").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    // Basic validation
    if (!sellerName || !email || !password) {
        registerMessage.textContent =
            "Please fill in all fields.";
        return;
    }


    registerButton.disabled = true;
    registerButton.textContent = "Creating account...";

    registerMessage.textContent = "";


    try {

        // Create Firebase Authentication account
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;


        // Create seller document in Firestore
        await setDoc(
            doc(db, "sellers", user.uid),
            {
                sellerId: user.uid,
                name: sellerName,
                email: user.email,
                createdAt: serverTimestamp()
            }
        );


        registerMessage.textContent =
            "Account created successfully!";


        // Redirect after successful registration
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);


    } catch (error) {

        console.error("Registration error:", error);

        switch (error.code) {

            case "auth/email-already-in-use":
                registerMessage.textContent =
                    "This email is already registered.";
                break;

            case "auth/invalid-email":
                registerMessage.textContent =
                    "Please enter a valid email address.";
                break;

            case "auth/weak-password":
                registerMessage.textContent =
                    "Password must be at least 6 characters.";
                break;

            case "auth/network-request-failed":
                registerMessage.textContent =
                    "Network error. Please check your internet connection.";
                break;

            default:
                registerMessage.textContent =
                    "Unable to create account. Please try again.";
        }

        registerButton.disabled = false;
        registerButton.textContent =
            "Create Seller Account";
    }

});
