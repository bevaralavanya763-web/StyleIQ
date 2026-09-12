// StyleIQ - Seller Login

import { auth } from "./firebase-config.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    loginMessage.textContent = "";


    try {

        // Sign in seller with Firebase Authentication
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        loginMessage.textContent =
            "Login successful!";


        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);


    } catch (error) {

        console.error("Login error:", error);

        switch (error.code) {

            case "auth/invalid-credential":
                loginMessage.textContent =
                    "Invalid email or password.";
                break;

            case "auth/user-not-found":
                loginMessage.textContent =
                    "No account found with this email.";
                break;

            case "auth/wrong-password":
                loginMessage.textContent =
                    "Incorrect password.";
                break;

            case "auth/invalid-email":
                loginMessage.textContent =
                    "Please enter a valid email address.";
                break;

            case "auth/network-request-failed":
                loginMessage.textContent =
                    "Network error. Please check your internet connection.";
                break;

            default:
                loginMessage.textContent =
                    "Unable to login. Please try again.";
        }

        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }

});
