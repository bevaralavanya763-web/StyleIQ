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

const clothingForm = document.getElementById("clothingForm");
const saveProductButton = document.getElementById("saveProductButton");
const productMessage = document.getElementById("productMessage");

let currentUser = null;

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "jphwxtgg";
const CLOUDINARY_UPLOAD_PRESET = "styleiq_products";

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;
});

// Submit clothing form
clothingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) {
        productMessage.textContent = "Please login before adding a product.";
        return;
    }

    const productName = document.getElementById("productName").value.trim();
    const category = document.getElementById("category").value;
    const price = Number(document.getElementById("price").value);
    const color = document.getElementById("color").value.trim();
    const material = document.getElementById("material").value.trim();

    const imageInput = document.getElementById("productImage");
    const imageFile = imageInput.files[0];

    const selectedSizes =
        Array.from(
            document.querySelectorAll('input[name="sizes"]:checked')
        ).map((checkbox) => checkbox.value);

    // Validation
    if (!productName) {
        productMessage.textContent = "Please enter the product name.";
        return;
    }

    if (!category) {
        productMessage.textContent = "Please select a category.";
        return;
    }

    if (price < 0 || Number.isNaN(price)) {
        productMessage.textContent = "Please enter a valid price.";
        return;
    }

    if (selectedSizes.length === 0) {
        productMessage.textContent =
            "Please select at least one available size.";
        return;
    }

    if (!imageFile) {
        productMessage.textContent =
            "Please select a clothing image.";
        return;
    }

    if (!imageFile.type.startsWith("image/")) {
        productMessage.textContent =
            "Please select a valid image file.";
        return;
    }

    saveProductButton.disabled = true;
    saveProductButton.textContent = "Uploading image...";
    productMessage.textContent = "";

    try {
        // -----------------------------------
        // 1. Upload image to Cloudinary
        // -----------------------------------

        const cloudinaryUrl =
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

        const formData = new FormData();

        formData.append("file", imageFile);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const cloudinaryResponse = await fetch(
            cloudinaryUrl,
            {
                method: "POST",
                body: formData
            }
        );

        if (!cloudinaryResponse.ok) {
            throw new Error("Cloudinary upload failed.");
        }

        const cloudinaryData =
            await cloudinaryResponse.json();

        const imageUrl = cloudinaryData.secure_url;
        const imagePublicId = cloudinaryData.public_id;

        // -----------------------------------
        // 2. Save product + image URL
        //    to Firestore
        // -----------------------------------

        saveProductButton.textContent = "Saving product...";

        await addDoc(collection(db, "clothing"), {
            sellerId: currentUser.uid,

            name: productName,
            category: category,
            price: price,
            color: color,
            material: material,
            sizes: selectedSizes,

            // Cloudinary image information
            imageUrl: imageUrl,
            imagePublicId: imagePublicId,

            createdAt: serverTimestamp()
        });

        // -----------------------------------
        // 3. Success
        // -----------------------------------

        productMessage.textContent =
            "Product and image added successfully!";

        clothingForm.reset();

        saveProductButton.textContent = "Product Saved";

        setTimeout(() => {
            window.location.href = "catalog.html";
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
