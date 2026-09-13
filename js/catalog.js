// StyleIQ - Clothing Catalog

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const emptyCatalog = document.getElementById("emptyCatalog");
const catalogMessage = document.getElementById("catalogMessage");

let currentUser = null;


// -----------------------------------
// Authentication
// -----------------------------------

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    await loadProducts();
});


// -----------------------------------
// Load Products
// -----------------------------------

async function loadProducts() {

    productGrid.innerHTML = "";
    emptyCatalog.style.display = "none";
    catalogMessage.textContent = "";

    productCount.textContent = "Loading products...";

    try {

        const productsQuery = query(
            collection(db, "clothing"),
            where("sellerId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(productsQuery);

        if (snapshot.empty) {

            productCount.textContent = "0 products";

            emptyCatalog.style.display = "flex";

            return;
        }

        productCount.textContent =
            `${snapshot.size} product${snapshot.size === 1 ? "" : "s"}`;


        snapshot.forEach((productDocument) => {

            const product = productDocument.data();

            const productCard =
                createProductCard(
                    productDocument.id,
                    product
                );

            productGrid.appendChild(productCard);

        });

    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );

        productCount.textContent = "";

        catalogMessage.textContent =
            "Unable to load your products. Please try again.";
    }
}


// -----------------------------------
// Create Product Card
// -----------------------------------

function createProductCard(productId, product) {

    const card = document.createElement("article");

    card.className = "product-card";


    const sizes =
        Array.isArray(product.sizes)
            ? product.sizes.join(", ")
            : "Not specified";


    // Image section
    const imageHTML = product.imageUrl
        ? `
            <div class="product-image-container">
                <img
                    src="${escapeHTML(product.imageUrl)}"
                    alt="${escapeHTML(product.name || "Clothing product")}"
                    class="product-image"
                    loading="lazy"
                >
            </div>
        `
        : `
            <div class="product-image-container product-image-placeholder">
                <span>No Image</span>
            </div>
        `;


    card.innerHTML = `

        ${imageHTML}

        <div class="product-card-content">

            <div class="product-card-top">

                <span class="product-category">
                    ${escapeHTML(product.category || "Other")}
                </span>

                <span class="product-price">
                    ₹${Number(product.price || 0).toLocaleString("en-IN")}
                </span>

            </div>


            <div class="product-card-body">

                <h2>
                    ${escapeHTML(product.name || "Unnamed Product")}
                </h2>

                <div class="product-details">

                    <p>
                        <strong>Color</strong>
                        ${escapeHTML(product.color || "Not specified")}
                    </p>

                    <p>
                        <strong>Material</strong>
                        ${escapeHTML(product.material || "Not specified")}
                    </p>

                    <p>
                        <strong>Sizes</strong>
                        ${escapeHTML(sizes)}
                    </p>

                </div>

            </div>


            <div class="product-card-actions">

                <button
                    type="button"
                    class="edit-product-button"
                    data-id="${productId}">
                    Edit
                </button>

                <button
                    type="button"
                    class="delete-product-button"
                    data-id="${productId}">
                    Delete
                </button>

            </div>

        </div>
    `;


    // Delete
    const deleteButton =
        card.querySelector(".delete-product-button");

    deleteButton.addEventListener(
        "click",
        () => deleteProduct(productId)
    );


    // Edit
    const editButton =
        card.querySelector(".edit-product-button");

    editButton.addEventListener(
        "click",
        () => {
            window.location.href =
                `edit-clothing.html?id=${productId}`;
        }
    );


    return card;
}


// -----------------------------------
// Delete Product
// -----------------------------------

async function deleteProduct(productId) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this product?"
        );

    if (!confirmed) return;


    try {

        await deleteDoc(
            doc(db, "clothing", productId)
        );

        await loadProducts();

    } catch (error) {

        console.error(
            "Error deleting product:",
            error
        );

        catalogMessage.textContent =
            "Unable to delete the product. Please try again.";
    }
}


// -----------------------------------
// Escape HTML
// -----------------------------------

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
