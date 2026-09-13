// StyleIQ - My Products Overview

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const totalProducts =
    document.getElementById("totalProducts");

const totalCategories =
    document.getElementById("totalCategories");

const topCategory =
    document.getElementById("topCategory");

const topCategoryCount =
    document.getElementById("topCategoryCount");

const categoryList =
    document.getElementById("categoryList");

const emptyProducts =
    document.getElementById("emptyProducts");

const myProductsMessage =
    document.getElementById("myProductsMessage");


/*
    Check seller authentication
*/

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    await loadProductOverview(user.uid);

});


/*
    Load products from Firestore
*/

async function loadProductOverview(sellerId) {

    try {

        const productsQuery = query(
            collection(db, "clothing"),
            where("sellerId", "==", sellerId)
        );

        const snapshot =
            await getDocs(productsQuery);


        /*
            No products
        */

        if (snapshot.empty) {

            totalProducts.textContent = "0";
            totalCategories.textContent = "0";
            topCategory.textContent = "—";
            topCategoryCount.textContent =
                "No products available";

            categoryList.innerHTML = "";

            emptyProducts.style.display = "flex";

            return;
        }


        /*
            Total products
        */

        totalProducts.textContent =
            snapshot.size;


        /*
            Count products by category
        */

        const categoryCounts = {};


        snapshot.forEach((productDocument) => {

            const product =
                productDocument.data();

            const category =
                product.category || "Other";


            if (categoryCounts[category]) {

                categoryCounts[category]++;

            } else {

                categoryCounts[category] = 1;

            }

        });


        /*
            Total categories
        */

        const categories =
            Object.keys(categoryCounts);

        totalCategories.textContent =
            categories.length;


        /*
            Find top category
        */

        let highestCategory = "";
        let highestCount = 0;


        categories.forEach((category) => {

            if (
                categoryCounts[category] >
                highestCount
            ) {

                highestCategory = category;

                highestCount =
                    categoryCounts[category];

            }

        });


        topCategory.textContent =
            highestCategory;

        topCategoryCount.textContent =
            `${highestCount} product${highestCount === 1 ? "" : "s"}`;


        /*
            Display category list
        */

        categoryList.innerHTML = "";


        categories
            .sort((a, b) =>
                categoryCounts[b] -
                categoryCounts[a]
            )
            .forEach((category) => {

                const categoryItem =
                    document.createElement("div");

                categoryItem.className =
                    "category-item";


                categoryItem.innerHTML = `

                    <div class="category-name">
                        ${escapeHTML(category)}
                    </div>

                    <div class="category-product-count">
                        ${categoryCounts[category]}
                        product${categoryCounts[category] === 1 ? "" : "s"}
                    </div>

                `;


                categoryList.appendChild(
                    categoryItem
                );

            });


        emptyProducts.style.display = "none";


    } catch (error) {

        console.error(
            "Error loading product overview:",
            error
        );

        myProductsMessage.textContent =
            "Unable to load your product information. Please try again.";

    }

}


/*
    Protect against HTML injection
*/

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
