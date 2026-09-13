// StyleIQ - Seller Profile

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const sellerName =
    document.getElementById("sellerName");

const sellerEmail =
    document.getElementById("sellerEmail");

const sellerId =
    document.getElementById("sellerId");

const createdAt =
    document.getElementById("createdAt");

const profileAvatar =
    document.querySelector(".profile-avatar");

const profileMessage =
    document.getElementById("profileMessage");


/*
    Check authentication
*/

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }


    /*
        Show email and UID immediately
    */

    sellerEmail.textContent =
        user.email || "Not available";

    sellerId.textContent =
        user.uid;


    /*
        Get seller information
        from Firestore
    */

    try {

        const sellerRef =
            doc(
                db,
                "sellers",
                user.uid
            );

        const sellerSnapshot =
            await getDoc(sellerRef);


        if (!sellerSnapshot.exists()) {

            sellerName.textContent =
                "Seller";

            createdAt.textContent =
                "Not available";

            return;
        }


        const seller =
            sellerSnapshot.data();


        /*
            Seller name
        */

        const name =
            seller.name || "Seller";

        sellerName.textContent =
            name;


        /*
            Use first letter as avatar
        */

        profileAvatar.textContent =
            name.charAt(0).toUpperCase();


        /*
            Account creation date
        */

        if (
            seller.createdAt &&
            seller.createdAt.toDate
        ) {

            const date =
                seller.createdAt.toDate();


            createdAt.textContent =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                    }
                );

        } else {

            createdAt.textContent =
                "Not available";

        }


    } catch (error) {

        console.error(
            "Error loading seller profile:",
            error
        );

        profileMessage.textContent =
            "Unable to load your profile information.";

    }

});
