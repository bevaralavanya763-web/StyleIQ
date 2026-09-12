// StyleIQ - Seller Dashboard

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const sellerEmail = document.getElementById("sellerEmail");
const logoutButton = document.getElementById("logoutButton");


// Check authentication status
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        // No logged-in seller
        window.location.href = "login.html";
        return;
    }


    // Display logged-in email
    sellerEmail.textContent = user.email;


    // Load seller information from Firestore
    try {

        const sellerRef =
            doc(db, "sellers", user.uid);

        const sellerSnapshot =
            await getDoc(sellerRef);


        if (sellerSnapshot.exists()) {

            const sellerData =
                sellerSnapshot.data();

            sellerEmail.textContent =
                sellerData.email || user.email;
        }

    } catch (error) {

        console.error(
            "Unable to load seller information:",
            error
        );

    }

});


// Logout
logoutButton.addEventListener("click", async () => {

    logoutButton.disabled = true;
    logoutButton.textContent = "Logging out...";


    try {

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {

        console.error("Logout error:", error);

        logoutButton.disabled = false;
        logoutButton.textContent = "Logout";
    }

});
