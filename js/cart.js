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
        // this.currentBalance()
        this.#savedBalanceArr = JSON.parse(Cookie.get("savedBalanceArr"));
        this.#balanceArr = JSON.parse(Cookie.get("balanceArray"));
        // .then(()=>{
        this.createShoppingCart();
        // })


        this.#product1 = [];
        this.#productNames = [];
        this.#productPrices = [];
        this.#productImgs = [];
        // this.#balanceArr = [];
    }
    async createShoppingCart() {
        const shoppingCartContainer = document.querySelector("#shoppingCartContainer");

        this.#savedProductsFromCookies = JSON.parse(Cookie.get("cartArray"));
        // this.#balanceArr = JSON.parse(Cookie.get("balanceArray"));

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

                this.#product1.push(product[1]);


                productInfo.append(productName, productImg, removeOneBtn, addOneBtn, amountPerProduct, productPrice, totalPerItemEl);
                amountPerProduct.id = "amountText" + index;
                amountPerProduct.innerText = "Antal: " + product[1];
                productName.innerText = this.#productNames[index];
                productPrice.innerText = "Pris per st: " + this.#productPrices[index] + " kr";
                const totalPerItem = (product[1] * this.#productPrices[index]);
                totalPerItemEl.innerText = "Totalt: " + totalPerItem + " kr";
                productImg.src = this.#productImgs[index];

                if (product[1] <= 1) {
                    removeOneBtn.disabled = true;
                }
                // } else {
                //     removeOneBtn.addEventListener("click", ()=>{
                //         // this.product1--;
                //         this.addToBalance(this.#product1,index);

                //         // ta bort vara från cart
                //     })
                // }

                if (product[1] >= this.#balanceArr[index]) {
                    addOneBtn.disabled = true;
                }
                else {
                    addOneBtn.addEventListener("click", () => {
                        removeOneBtn.disabled = false;
                        this.removeFromBalance(index);
                        this.#savedProductsFromCookies[index][1]++;
                        console.log(this.#savedProductsFromCookies);
                        amountPerProduct.innerText = "Antal: " + product[1];
                        this.addCookies();
                        console.log(this.#balanceArr)

                        // lägg till eventlistener igen på - om man klickar på +
                    })
                    removeOneBtn.addEventListener("click", () => {
                        // this.product1--;
                        this.#savedProductsFromCookies[index][1]--;
                        this.addToBalance(this.#product1[index], index);

                        // ta bort vara från cart
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
        // console.log(productArray)
    }
    // async currentBalance() {
    //     // const productArray = await this.getFirebase();
    //     this.#balanceArr = [];
    //     productArray.forEach(
    //         product => { 
    //             this.#balanceArr.push(product.balance)
    //         }
    //     )
    //     console.log(this.#balanceArr)
    // }
    removeFromBalance(index) {
        if (this.#balanceArr[index] == 1) {
            document.getElementById("add" + index).disabled = true;
            this.#balanceArr[index]--;
            this.#product1[index]++;
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#product1[index] + "ändrad i removefrombalance if";
            console.log(this.#product1[index]);
        }
        else if (this.#balanceArr[index] > 0) {
            this.#balanceArr[index]--;
            this.#product1[index]++;
            console.log(this.#product1[index]);
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#product1[index] + "ändrad i removefrombalance else if";
            console.log(this.#product1[index])

        }
    }
    addToBalance(amount, index) {
        if (amount == 2) { // om antal är 1 => kan inte klicka på minus mer
            document.getElementById("remove" + index).disabled = true;
            this.#balanceArr[index]++;
            console.log("if händer")
            this.#product1[index]--;
            console.log("amount: ", amount)
            console.log(this.#balanceArr);
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#product1[index] + "ändrad i addtobalance if";
        }
        else if (amount <= this.#savedBalanceArr[index])
        //if(x får inte vara större än get firebase) 
        {
            this.#product1[index]--;
            this.#balanceArr[index]++;
            console.log(this.#balanceArr)
            console.log("else if")
            console.log("amount: ", amount, "product1: ", this.#product1[index])
            document.querySelector("#amountText" + index).innerText = "Antal: " + this.#product1[index] + "ändrad i addtobalance else if";
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


// createShoppingCart();

