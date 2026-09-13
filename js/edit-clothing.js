// StyleIQ - Edit Clothing

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const editForm =
    document.getElementById("editClothingForm");

const updateButton =
    document.getElementById("updateProductButton");

const message =
    document.getElementById("editProductMessage");


/*
    Get product ID from URL

    Example:
    edit-clothing.html?id=ABC123
*/

const urlParams =
    new URLSearchParams(window.location.search);

const productId =
    urlParams.get("id");


let currentUser = null;


/*
    Check authentication
*/

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }

    currentUser = user;


    if (!productId) {

        message.textContent =
            "Product could not be found.";

        updateButton.disabled = true;

        return;
    }


    await loadProduct();

});


/*
    Load product from Firestore
*/

async function loadProduct() {

    try {

        const productRef =
            doc(db, "clothing", productId);

        const productSnapshot =
            await getDoc(productRef);


        if (!productSnapshot.exists()) {

            message.textContent =
                "This product does not exist.";

            updateButton.disabled = true;

            return;
        }


        const product =
            productSnapshot.data();


        /*
            Security check

            Make sure the product belongs
            to the logged-in seller.
        */

        if (
            product.sellerId !==
            currentUser.uid
        ) {

            message.textContent =
                "You are not allowed to edit this product.";

            updateButton.disabled = true;

            return;
        }


        /*
            Fill form with existing data
        */

        document.getElementById(
            "editProductName"
        ).value = product.name || "";


        document.getElementById(
            "editCategory"
        ).value = product.category || "";


        document.getElementById(
            "editPrice"
        ).value = product.price ?? "";


        document.getElementById(
            "editColor"
        ).value = product.color || "";


        document.getElementById(
            "editMaterial"
        ).value = product.material || "";


        /*
            Select existing sizes
        */

        const sizes =
            Array.isArray(product.sizes)
                ? product.sizes
                : [];


        document
            .querySelectorAll(
                'input[name="editSizes"]'
            )
            .forEach((checkbox) => {

                checkbox.checked =
                    sizes.includes(
                        checkbox.value
                    );

            });


    } catch (error) {

        console.error(
            "Error loading product:",
            error
        );

        message.textContent =
            "Unable to load the product.";

    }

}


/*
    Update product
*/

editForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!currentUser || !productId) {

            message.textContent =
                "Unable to update this product.";

            return;
        }


        const productName =
            document
                .getElementById("editProductName")
                .value
                .trim();


        const category =
            document
                .getElementById("editCategory")
                .value;


        const price =
            Number(
                document
                    .getElementById("editPrice")
                    .value
            );


        const color =
            document
                .getElementById("editColor")
                .value
                .trim();


        const material =
            document
                .getElementById("editMaterial")
                .value
                .trim();


        const selectedSizes =
            Array.from(
                document.querySelectorAll(
                    'input[name="editSizes"]:checked'
                )
            ).map(
                (checkbox) =>
                    checkbox.value
            );


        /*
            Validation
        */

        if (
            !productName ||
            !category ||
            !color ||
            !material
        ) {

            message.textContent =
                "Please fill in all required fields.";

            return;
        }


        if (
            Number.isNaN(price) ||
            price < 0
        ) {

            message.textContent =
                "Please enter a valid price.";

            return;
        }


        if (
            selectedSizes.length === 0
        ) {

            message.textContent =
                "Please select at least one available size.";

            return;
        }


        updateButton.disabled = true;

        updateButton.textContent =
            "Updating product...";

        message.textContent = "";


        try {

            const productRef =
                doc(
                    db,
                    "clothing",
                    productId
                );


            await updateDoc(
                productRef,
                {
                    name: productName,
                    category: category,
                    price: price,
                    color: color,
                    material: material,
                    sizes: selectedSizes
                }
            );


            message.textContent =
                "Product updated successfully!";


            updateButton.textContent =
                "Product Updated";


            /*
                Return to catalog
            */

            setTimeout(() => {

                window.location.href =
                    "catalog.html";

            }, 1000);


        } catch (error) {

            console.error(
                "Error updating product:",
                error
            );


            message.textContent =
                "Unable to update the product. Please try again.";


            updateButton.disabled = false;

            updateButton.textContent =
                "Update Product";

        }

    }
);
