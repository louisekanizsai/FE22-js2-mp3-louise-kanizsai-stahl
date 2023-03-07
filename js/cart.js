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
    #addOneBtn;
    constructor() {
        // this.currentBalance()
        this.#balanceArr = JSON.parse(Cookie.get("balanceArray"));
        // .then(()=>{
            this.createShoppingCart();
        // })
        
        
        
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
                this.#addOneBtn = document.createElement("button");
                this.#addOneBtn.id = "add"+index;
                const removeOneBtn = document.createElement("button");
                this.#addOneBtn.innerText = "+";
                removeOneBtn.innerText = "-";

                productInfo.append(productName,productImg,removeOneBtn,this.#addOneBtn,amountPerProduct,productPrice,totalPerItemEl);
                amountPerProduct.innerText = "Antal: "+product[1];
                productName.innerText = this.#productNames[index];
                productPrice.innerText = "Pris per st: " + this.#productPrices[index] + " kr";
                const totalPerItem = (product[1] * this.#productPrices[index]);
                totalPerItemEl.innerText = "Totalt: " + totalPerItem + " kr";
                productImg.src = this.#productImgs[index];

                if(product[1] >= this.#balanceArr[index]){
                    this.#addOneBtn.disabled = true;
                }
                else {
                    this.#addOneBtn.addEventListener("click", ()=>{
                        this.balance(index);
                        this.#savedProductsFromCookies[index][1]++;
                        console.log(this.#savedProductsFromCookies);
                        amountPerProduct.innerText = "Antal: "+product[1];
                        this.addCookies();
                        console.log(this.#balanceArr)
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
    balance(index){
        if (this.#balanceArr[index] == 1) {
            document.getElementById("add"+index).disabled = true;
            this.#balanceArr[index]--;
        }
        else if (this.#balanceArr[index] > 0) {
            this.#balanceArr[index]--;

        }
    }
    addCookies(){
        Cookie.set("cartArray", JSON.stringify(this.#savedProductsFromCookies), { expires: 1 });
    }

}

const hej = new ShoppingCart();


// createShoppingCart();

