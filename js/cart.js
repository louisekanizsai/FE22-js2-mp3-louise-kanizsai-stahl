import Cookie from "../node_modules/js-cookie/dist/js.cookie.mjs"

console.log(document.cookie);

// Cookie.remove("cartArray");
// Cookie.remove("balanceArray");
// Cookie.remove("productsInCart");

class ShoppingCart {
    #productNames;
    #productPrices;
    #productImgs;
    #balanceArr;
    #savedProductsFromCookies;
    #savedBalanceArr;
    #savedProductsInCart;
    #product1;
    #totalAmountP;
    constructor() {
        this.#savedBalanceArr = JSON.parse(Cookie.get("savedBalanceArr"));
        this.#balanceArr = JSON.parse(Cookie.get("balanceArray"));
        this.#savedProductsInCart = Cookie.get("productsInCart");
        this.#savedProductsFromCookies = JSON.parse(Cookie.get("cartArray"));
        this.#totalAmountP = document.querySelector("#totalAmount");

        this.createShoppingCart();

        this.#product1 = [];
        this.#productNames = [];
        this.#productPrices = [];
        this.#productImgs = [];
    }
    async createShoppingCart() {
        const shoppingCartContainer = document.querySelector("#shoppingCartContainer");


        const shoppingCart = await this.getFirebase();

        shoppingCart.forEach(item => {
            this.#productNames.push(item.name);
            this.#productPrices.push(item.price);
            this.#productImgs.push(item.img);
        })

        this.#savedProductsFromCookies.forEach((product, index) => {
            if (product[1] !== 0) {
                const productInfo = document.createElement("div");
                productInfo.classList.add("productInfoCard");
                productInfo.id = "productInfoCard" + index;
                shoppingCartContainer.append(productInfo);
                const amountPerProduct = document.createElement("p");
                const productName = document.createElement("h3");
                const productPrice = document.createElement("p");
                const totalPerItemEl = document.createElement("p");
                const productImg = document.createElement("img");
                const addOneBtn = document.createElement("button");
                const removeOneBtn = document.createElement("button");
                addOneBtn.innerText = "+";
                removeOneBtn.innerText = "-";
                const trashCan = document.createElement("img");
                trashCan.src = "../images/trash-can-svgrepo-com.svg"
                productInfo.append(productName, productImg, removeOneBtn, addOneBtn, amountPerProduct, productPrice, totalPerItemEl, trashCan);
                amountPerProduct.id = "amountText" + index;
                amountPerProduct.innerText = "Antal: " + product[1];
                productName.innerText = this.#productNames[index];
                productPrice.innerText = "Pris per st: " + this.#productPrices[index] + " kr";
                let totalPerItem = (product[1] * this.#productPrices[index]);
                totalPerItemEl.innerText = "Totalt: " + totalPerItem + " kr";
                productImg.src = this.#productImgs[index];

                this.#product1.push(product[1]);

                addOneBtn.addEventListener("click", () => {
                    if (product[1] >= this.#savedBalanceArr[index]) { // om antal produkter har nått så många som finns i saldot, kan man inte lägga till fler
                        alert("Det finns inga fler i lager av denna vara!");
                    }
                    else {
                        this.#savedProductsFromCookies[index][1]++;
                        this.removeFromBalance(index);
                        amountPerProduct.innerText = "Antal: " + product[1];
                        this.addCookies();
                        totalPerItem = (product[1] * this.#productPrices[index]);
                        totalPerItemEl.innerText = "Totalt: " + totalPerItem + " kr";
                    }
                }
                )
                removeOneBtn.addEventListener("click", () => {
                    if (product[1] <= 1) { // man kan inte ta bort den sista produkten genom att klicka på minus
                        alert("Klicka på papperskorgen för att ta bort denna vara.");
                    }
                    else {
                        this.#savedProductsFromCookies[index][1]--;
                        this.addToBalance(this.#product1[index], index, 1);
                        this.addCookies();
                        totalPerItem = (product[1] * this.#productPrices[index]);
                        totalPerItemEl.innerText = "Totalt: " + totalPerItem + " kr";
                    }
                })
                trashCan.addEventListener("click", () => {
                    this.addToBalance(this.#product1[index], index, product[1]);
                    this.#savedProductsFromCookies[index][1] -= product[1];
                    console.log(this.#savedProductsFromCookies);
                    this.addCookies();
                    document.getElementById("productInfoCard" + index).remove();
                })
            }

        })
        this.#totalAmountP.innerText = "x"
        const cancelBtn = document.querySelector("#cancel");
        cancelBtn.addEventListener("click", () => {

            this.#savedProductsFromCookies.forEach((product, index) => {
                if (product[1] !== 0) {
                    this.addToBalance(this.#product1[index], index, product[1]);
                    this.#savedProductsFromCookies[index][1] -= product[1];
                    this.addCookies();
                    document.getElementById("productInfoCard" + index).remove();
                    location.assign("../index.html")
                }
            })
        })
        const confirmPurchaseBtn = document.querySelector("#buy");
        confirmPurchaseBtn.addEventListener("click", () => {
            this.patchFirebase()
                .then(() => {
                    this.#savedProductsFromCookies.forEach((product, index) => {
                        if (product[1] !== 0) {
                            this.addToBalance(this.#product1[index], index, product[1]);
                            this.#savedProductsFromCookies[index][1] -= product[1];
                            document.getElementById("productInfoCard" + index).remove();
                        }
                    })

                    this.#savedProductsInCart = 0;
                    this.addCookies();

                    setTimeout(() => {
                        Cookie.remove("balanceArray");
                        location.assign("../index.html");
                      }, "500");
                })
        })
        
    }
    async getFirebase() {
        const url = 'https://mp3-webbshop-default-rtdb.europe-west1.firebasedatabase.app/' + '.json';
        const response = await fetch(url);
        const productArray = await response.json();
        return productArray;
    }
    async patchFirebase() {
        // this.#savedBalanceArr = array som innehåller saldot på alla produkter i firebase
        // vad vi ska patcha: this.#savedBalanceArr[på ett index] - product[1] = antal kvar i saldot

        this.#savedProductsFromCookies.forEach((product, index) => {
            const url = 'https://mp3-webbshop-default-rtdb.europe-west1.firebasedatabase.app/' + index + '.json';
            let newBalance = (this.#savedBalanceArr[index] - product[1]);
            console.log("savedbalancearr", this.#savedBalanceArr)
            console.log("product[1]", product[1])
            const obj = {
                balance: newBalance
            }
            console.log(obj); 

            const init = {
                method: "PATCH",
                body: JSON.stringify(obj),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            };

            fetch(url, init)
                .then(response => response.json())
                .then(data => console.log(data));
        })
    }
    removeFromBalance(index) {
        if (this.#balanceArr[index] == 1) {
            this.#balanceArr[index]--;
            this.#product1[index]++;
            this.#savedProductsInCart++;
            console.log(this.#savedProductsInCart)
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#product1[index];
        }
        else if (this.#balanceArr[index] > 0) {
            this.#balanceArr[index]--;
            this.#product1[index]++;
            this.#savedProductsInCart++;
            console.log(this.#savedProductsInCart)
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#product1[index];
        }
    }
    addToBalance(amount, index, amountDeletedFromCart) {
        if (amount == 2) { // om antal är 1 => kan inte klicka på minus mer
            // document.getElementById("remove" + index).disabled = true;
            this.#balanceArr[index] += amountDeletedFromCart;
            this.#product1[index] -= amountDeletedFromCart;
            this.#savedProductsInCart -= amountDeletedFromCart;
            console.log(this.#savedProductsInCart)
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#product1[index];
        }
        else if (amount <= this.#savedBalanceArr[index]) {
            this.#product1[index] -= amountDeletedFromCart;
            this.#balanceArr[index] += amountDeletedFromCart;
            this.#savedProductsInCart -= amountDeletedFromCart;
            console.log(this.#savedProductsInCart)
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#product1[index];
        }
        else {
            console.log("else händer")
        }
    }
    addCookies() {
        Cookie.set("cartArray", JSON.stringify(this.#savedProductsFromCookies), { expires: 1 });
        Cookie.set("balanceArray", JSON.stringify(this.#balanceArr), { expires: 1 });
        Cookie.set("productsInCart", this.#savedProductsInCart, { expires: 1 });
    }
}

const hej = new ShoppingCart();