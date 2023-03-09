import Cookie from "../node_modules/js-cookie/dist/js.cookie.mjs"

console.log(document.cookie);

// Cookie.remove("cartArray");
// Cookie.remove("balanceArray");
// Cookie.remove("numberOfProductsInCart");
// Cookie.remove("savedBalanceFromFirebase");

class ShoppingCart {
    #balanceArray;
    #savedBalanceFromFirebase;
    #savedProductsFromCartArray;
    #savedNumberOfProductsInCart;
    #productNames;
    #productPrices;
    #productImgs;
    #numberOfSelectedProductArray;
    #totalAmount;
    constructor() {
        //Hämtar cookies
        this.#balanceArray = JSON.parse(Cookie.get("balanceArray"));
        this.#savedBalanceFromFirebase = JSON.parse(Cookie.get("savedBalanceFromFirebase"));
        this.#savedProductsFromCartArray = JSON.parse(Cookie.get("cartArray"));
        this.#savedNumberOfProductsInCart = Cookie.get("numberOfProductsInCart");
        //Är till en början tomma
        this.#productNames = [];
        this.#productPrices = [];
        this.#productImgs = [];
        this.#numberOfSelectedProductArray = [];

        this.#totalAmount = 0;
        this.createShoppingCart();
    }
    async createShoppingCart() {
        const shoppingCart = await this.getFirebase();
        shoppingCart.forEach(item => {
            this.#productNames.push(item.name);
            this.#productPrices.push(item.price);
            this.#productImgs.push(item.img);
        })
        const shoppingCartContainer = document.querySelector("#shoppingCartContainer");
        this.#savedProductsFromCartArray.forEach((product, index) => {
            // product[1] är antalet av vald produkt, alltså skrivs bara de produkter som användaren har valt ut
            if (product[1] !== 0) {
                this.#numberOfSelectedProductArray.push(product[1]);
                // Skapar alla element, ger de text, class och id mm
                const productInfo = document.createElement("div");
                productInfo.classList.add("productInfoCard");
                productInfo.id = "productInfoCard" + index;
                const productName = document.createElement("h3");
                const productImg = document.createElement("img");
                const removeOneBtn = document.createElement("button");
                const addOneBtn = document.createElement("button");
                const amountPerProduct = document.createElement("p");
                const productPrice = document.createElement("p");
                const totalPerItemEl = document.createElement("p");
                const trashCan = document.createElement("img");

                productName.innerText = this.#productNames[index];
                productImg.src = this.#productImgs[index];
                removeOneBtn.innerText = "-";
                addOneBtn.innerText = "+";
                amountPerProduct.innerText = "Antal: " + product[1];
                amountPerProduct.id = "amountText" + index;
                productPrice.innerText = "Pris per st: " + this.#productPrices[index] + " kr";
                let totalPerItem = (product[1] * this.#productPrices[index]);
                this.#totalAmount += totalPerItem;
                totalPerItemEl.innerText = "Totalt: " + totalPerItem + " kr";
                trashCan.src = "../images/trash-can-svgrepo-com.svg"
                productInfo.append(productName, productImg, removeOneBtn, addOneBtn, amountPerProduct, productPrice, totalPerItemEl, trashCan);
                shoppingCartContainer.append(productInfo);
                // Lägg till en produkt
                addOneBtn.addEventListener("click", () => {
                    if (product[1] >= this.#savedBalanceFromFirebase[index]) { // om antal produkter har nått så många som finns i saldot, kan man inte lägga till fler
                        alert("Det finns inga fler i lager av denna vara!");
                    }
                    else {
                        this.#savedProductsFromCartArray[index][1]++; //Öka antalet av vald produkt med 1
                        this.removeFromBalance(index);  //Ta sedan bort 1 från lagersaldot
                        amountPerProduct.innerText = "Antal: " + product[1];
                        totalPerItem = (product[1] * this.#productPrices[index]);
                        totalPerItemEl.innerText = "Totalt: " + totalPerItem + " kr";
                        this.#totalAmount += this.#productPrices[index];
                        document.getElementById('totalAmount').innerText = this.#totalAmount;
                        this.addCookies();//Uppdatera cookies
                    }
                }
                )
                //Ta bort en produkt
                removeOneBtn.addEventListener("click", () => {
                    if (product[1] <= 1) { // man kan inte ta bort den sista produkten genom att klicka på minus
                        alert("Klicka på papperskorgen för att ta bort denna vara.");
                    }
                    else {
                        this.#savedProductsFromCartArray[index][1]--; //Minska antalet av vald produkt med 1
                        this.addToBalance(this.#numberOfSelectedProductArray[index], index, 1); //Lägg sedan till 1 av vald produkt till lagersaldot
                        amountPerProduct.innerText = "Antal: " + product[1];
                        totalPerItem = (product[1] * this.#productPrices[index]);
                        totalPerItemEl.innerText = "Totalt: " + totalPerItem + " kr";
                        this.#totalAmount -= this.#productPrices[index];
                        document.getElementById('totalAmount').innerText = this.#totalAmount;
                        this.addCookies(); //Uppdatera cookies
                    }
                })
                //Ta bort produkten och antalet av vald produkt
                trashCan.addEventListener("click", () => {
                    this.addToBalance(this.#numberOfSelectedProductArray[index], index, product[1]); //Lägg till produkten och antalet till lagersaldot
                    this.#savedProductsFromCartArray[index][1] -= product[1]; //Ta bort produkten och antalet från kundvagnen
                    this.#totalAmount -= totalPerItem; //Minska totalpriset med det totala priset av varan som tas bort
                    document.getElementById('totalAmount').innerText = this.#totalAmount;
                    this.addCookies();
                    document.getElementById("productInfoCard" + index).remove();
                })
            }//If
        })//forEach

        //Visa det totala priset
        document.getElementById('totalAmount').innerText = this.#totalAmount;
        //Avbryt köpet
        const cancelBtn = document.querySelector("#cancel");
        cancelBtn.addEventListener("click", () => {
            //Loopa igenom kundvagnen för att kunna ta bort varje enskild produkt
            this.#savedProductsFromCartArray.forEach((product, index) => {
                if (product[1] !== 0) {
                    this.addToBalance(this.#numberOfSelectedProductArray[index], index, product[1]); //Lägg till produkten och antalet till lagersaldot
                    this.#savedProductsFromCartArray[index][1] -= product[1]; //Ta bort produkten och antalet från kundvagnen
                    document.getElementById("productInfoCard" + index).remove();//Ta bort produktens container
                    this.addCookies();//Uppdatera cookies
                    location.assign("../index.html")
                }
                else if (product[1] == 0) { //Om kunden tagit bort alla varor själv innan den har tryckt på cancel-knappen
                    this.#savedNumberOfProductsInCart = 0;
                    this.addCookies();
                    location.assign("../index.html")
                }
            })//forEach
        })//EventListener
        //Genomför köpet
        const confirmPurchaseBtn = document.querySelector("#buy");
        confirmPurchaseBtn.addEventListener("click", () => {
            this.patchFirebase() //uppdatera firebase
                .then(() => { //Efter det ta bort produkterna som kunden köpt
                    this.#savedProductsFromCartArray.forEach((product, index) => {
                        if (product[1] !== 0) {
                            this.addToBalance(this.#numberOfSelectedProductArray[index], index, product[1]); //Lägg till produkten och antalet till lagersaldot
                            this.#savedProductsFromCartArray[index][1] -= product[1]; //Ta bort produkten och antalet från kundvagnen
                            document.getElementById("productInfoCard" + index).remove();//Ta bort produktens container
                        }
                    })
                    this.#savedNumberOfProductsInCart = 0;
                    this.addCookies();//uppdatera cookies
                    //Ta bort balanceArray-cookien då den kommer att uppdateras när kunden kommer tillbaka till index.html
                    setTimeout(() => {
                        Cookie.remove("balanceArray");
                        location.assign("../index.html");
                    }, "500");
                })
        })

    }//createShoppingCart
    async getFirebase() {
        const url = 'https://mp3-webbshop-default-rtdb.europe-west1.firebasedatabase.app/' + '.json';
        const response = await fetch(url);
        const productArray = await response.json();
        return productArray;
    }
    //Ökar lagersaldot med antalet av vald produkt som tagits bort
    addToBalance(amount, index, amountDeletedFromCart) {
        if (amount <= this.#savedBalanceFromFirebase[index]) {
            this.#balanceArray[index] += amountDeletedFromCart; //Lägger till produkten i lagersaldot 
            //Tar sedan bort produkten från kundkorgen
            this.#numberOfSelectedProductArray[index] -= amountDeletedFromCart;
            this.#savedNumberOfProductsInCart -= amountDeletedFromCart;
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#numberOfSelectedProductArray[index];
        }
        else { //När amount är undefinned
            this.#balanceArray[index] += amountDeletedFromCart;//Lägger till produkten i lagersaldot 
            //Tar sedan bort produkten från kundkorgen
            this.#savedNumberOfProductsInCart -= amountDeletedFromCart;
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#numberOfSelectedProductArray[index];
        }
    }
    //Minskar lagersaldot för vald produkt med 1
    removeFromBalance(index) {
        this.#balanceArray[index]--; 
        //Lägger till vald produkt i kundkorgen
        this.#numberOfSelectedProductArray[index]++; 
        this.#savedNumberOfProductsInCart++;
        document.querySelector("#amountText" + index).innerText = "Antal: " + this.#numberOfSelectedProductArray[index];
    }
    //Uppdaterar lagersaldot produkt för produkt 
    async patchFirebase() {
        this.#savedProductsFromCartArray.forEach((product, index) => {
            const url = 'https://mp3-webbshop-default-rtdb.europe-west1.firebasedatabase.app/' + index + '.json';
            let newBalance = (this.#savedBalanceFromFirebase[index] - product[1]);
            const obj = {
                balance: newBalance
            }
            const init = {
                method: "PATCH",
                body: JSON.stringify(obj),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            };
            fetch(url, init).then(response => response.json());
        });
    }
    addCookies() {
        Cookie.set("cartArray", JSON.stringify(this.#savedProductsFromCartArray), { expires: 1 });
        Cookie.set("balanceArray", JSON.stringify(this.#balanceArray), { expires: 1 });
        Cookie.set("numberOfProductsInCart", this.#savedNumberOfProductsInCart, { expires: 1 });
    }
}

const cartSite = new ShoppingCart();