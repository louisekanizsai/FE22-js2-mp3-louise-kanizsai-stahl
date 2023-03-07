import Cookie from "../node_modules/js-cookie/dist/js.cookie.mjs"

console.log(document.cookie);

// Cookie.remove("cartArray");
// Cookie.remove("balanceArray");

class ShoppingCart {
    #productNames;
    #productPrices;
    #productImgs;
    #balanceArr;
    #savedProductsFromCookies;
    #savedBalanceArr;
    #product1;
    constructor() {
        this.#savedBalanceArr = JSON.parse(Cookie.get("savedBalanceArr"));
        this.#balanceArr = JSON.parse(Cookie.get("balanceArray"));
        this.createShoppingCart();

        this.#product1 = [];
        this.#productNames = [];
        this.#productPrices = [];
        this.#productImgs = [];
    }
    async createShoppingCart() {
        const shoppingCartContainer = document.querySelector("#shoppingCartContainer");

        this.#savedProductsFromCookies = JSON.parse(Cookie.get("cartArray"));

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
                shoppingCartContainer.append(productInfo);
                const amountPerProduct = document.createElement("p");
                const productName = document.createElement("h3");
                const productPrice = document.createElement("p");
                const totalPerItemEl = document.createElement("p");
                const productImg = document.createElement("img");
                const addOneBtn = document.createElement("button");
                addOneBtn.id = "add" + index;
                const removeOneBtn = document.createElement("button");
                removeOneBtn.id = "remove" + index;
                addOneBtn.innerText = "+";
                removeOneBtn.innerText = "-";
                productInfo.append(productName, productImg, removeOneBtn, addOneBtn, amountPerProduct, productPrice, totalPerItemEl);
                amountPerProduct.id = "amountText" + index;
                amountPerProduct.innerText = "Antal: " + product[1];
                productName.innerText = this.#productNames[index];
                productPrice.innerText = "Pris per st: " + this.#productPrices[index] + " kr";
                const totalPerItem = (product[1] * this.#productPrices[index]);
                totalPerItemEl.innerText = "Totalt: " + totalPerItem + " kr";
                productImg.src = this.#productImgs[index];
                
                this.#product1.push(product[1]);

                if (product[1] <= 1) {
                    removeOneBtn.disabled = true;
                }
                if (product[1] >= this.#balanceArr[index]) {
                    addOneBtn.disabled = true;
                }
                else {
                    addOneBtn.addEventListener("click", () => {
                        removeOneBtn.disabled = false;
                        this.removeFromBalance(index);
                        this.#savedProductsFromCookies[index][1]++;
                        amountPerProduct.innerText = "Antal: " + product[1];
                        this.addCookies();
                    })
                    removeOneBtn.addEventListener("click", () => {
                        addOneBtn.disabled = false;
                        this.#savedProductsFromCookies[index][1]--;
                        this.addToBalance(this.#product1[index], index);
                    })
                }
            }

        })
    }
    async getFirebase() {
        const url = 'https://mp3-webbshop-default-rtdb.europe-west1.firebasedatabase.app/' + '.json';
        const response = await fetch(url);
        const productArray = await response.json();
        return productArray;
    }
    removeFromBalance(index) {
        if (this.#balanceArr[index] == 1) {
            document.getElementById("add" + index).disabled = true;
            this.#balanceArr[index]--;
            this.#product1[index]++;
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#product1[index];
        }
        else if (this.#balanceArr[index] > 0) {
            this.#balanceArr[index]--;
            this.#product1[index]++;
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#product1[index];
        }
    }
    addToBalance(amount, index) {
        if (amount == 2) { // om antal är 1 => kan inte klicka på minus mer
            document.getElementById("remove" + index).disabled = true;
            this.#balanceArr[index]++;
            this.#product1[index]--;
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#product1[index];
        }
        else if (amount <= this.#savedBalanceArr[index])
        {
            this.#product1[index]--;
            this.#balanceArr[index]++;
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#product1[index];
        }
        else {
            console.log("else händer")
        }
    }
    addCookies() {
        Cookie.set("cartArray", JSON.stringify(this.#savedProductsFromCookies), { expires: 1 });
        Cookie.set("balanceArray", JSON.stringify(this.#balanceArr), { expires: 1 })
    }

}

const hej = new ShoppingCart();