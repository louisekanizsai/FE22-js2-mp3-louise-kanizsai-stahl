import Cookie from "../node_modules/js-cookie/dist/js.cookie.mjs"

console.log(document.cookie);

class ShoppingCart {
    #productNames;
    #productPrices;
    #productImgs;
    #balanceArr;
    constructor() {
        this.createShoppingCart()
        .then( ()=>  {
            this.currentBalance()
        })
        
        this.#productNames = [];
        this.#productPrices = [];
        this.#productImgs = [];
        // this.#balanceArr = [];
    }
    async createShoppingCart() {
        const shoppingCartContainer = document.querySelector("#shoppingCartContainer");

        const savedProductsFromCookies = JSON.parse(Cookie.get("cartArray"));
        const shoppingCart = await this.getFirebase();

        shoppingCart.forEach(item => {
            this.#productNames.push(item.name); 
            this.#productPrices.push(item.price); 
            this.#productImgs.push(item.img); 
        })

        savedProductsFromCookies.forEach((product, index) => {
            if (product[1] !== 0) {
                const productInfo = document.createElement("div");
                productInfo.classList.add("productInfoCard");
                shoppingCartContainer.append(productInfo);
                const amountPerProduct = document.createElement("p");
                const productName = document.createElement("h3");
                const productPrice = document.createElement("p");
                const totalPerItemEl = document.createElement("p");
                const productImg = document.createElement("img");

                productInfo.append(productName,productImg,amountPerProduct,productPrice,totalPerItemEl);
                amountPerProduct.innerText = "Antal: "+product[1];
                productName.innerText = this.#productNames[index];
                productPrice.innerText = "Pris per st: " + this.#productPrices[index] + " kr";
                const totalPerItem = (product[1] * this.#productPrices[index]);
                totalPerItemEl.innerText = "Totalt: " + totalPerItem + " kr";
                productImg.src = this.#productImgs[index];
            }

        })
    }
    async getFirebase() {
        const url = 'https://mp3-webbshop-default-rtdb.europe-west1.firebasedatabase.app/' + '.json';
        const response = await fetch(url);
        const productArray = await response.json();
        return productArray;
        // console.log(productArray)
    }
    async currentBalance() {
        const productArray = await this.getFirebase();
        this.#balanceArr = [];
        productArray.forEach(
            product => { 
                this.#balanceArr.push(product.balance)
            }
        )
        console.log(this.#balanceArr)
    }

}

const hej = new ShoppingCart();


// createShoppingCart();

