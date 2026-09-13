// StyleIQ - Add Clothing

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const clothingForm =
    document.getElementById("clothingForm");

const saveProductButton =
    document.getElementById("saveProductButton");

const productMessage =
    document.getElementById("productMessage");


let currentUser = null;


// Check seller login
onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }

    currentUser = user;

});


// Save clothing product
clothingForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    if (!currentUser) {

        productMessage.textContent =
            "Please login before adding a product.";

        return;
    }


    const productName =
        document.getElementById("productName")
            .value
            .trim();


    const category =
        document.getElementById("category")
            .value;


    const price =
        Number(
            document.getElementById("price")
                .value
        );


    const color =
        document.getElementById("color")
            .value
            .trim();


    const material =
        document.getElementById("material")
            .value
            .trim();


    // Get selected sizes
    const selectedSizes =
        Array.from(
            document.querySelectorAll(
                'input[name="sizes"]:checked'
            )
        ).map(
            (checkbox) => checkbox.value
        );


    // Validate sizes
    if (selectedSizes.length === 0) {

        productMessage.textContent =
            "Please select at least one available size.";

        return;
    }


    // Validate price
    if (price < 0 || Number.isNaN(price)) {

        productMessage.textContent =
            "Please enter a valid price.";

        return;
    }


    saveProductButton.disabled = true;

    saveProductButton.textContent =
        "Saving product...";

    productMessage.textContent = "";


    try {

        // Create clothing document
        await addDoc(
            collection(db, "clothing"),
            {
                sellerId: currentUser.uid,

                name: productName,

                category: category,

                price: price,

                color: color,

                material: material,

                sizes: selectedSizes,

                createdAt: serverTimestamp()
            }
        );


        productMessage.textContent =
            "Product added successfully!";


        // Clear form
        clothingForm.reset();


        saveProductButton.textContent =
            "Product Saved";


        // Return to dashboard
        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 1200);


    } catch (error) {

        console.error(
            "Error adding product:",
            error
        );


        productMessage.textContent =
            "Unable to save product. Please try again.";


        saveProductButton.disabled = false;

        saveProductButton.textContent =
            "Save Product";

    }

}); 
