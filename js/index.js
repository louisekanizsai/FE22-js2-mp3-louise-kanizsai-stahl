import Cookie from "../node_modules/js-cookie/dist/js.cookie.mjs"

// Cookie.remove("productsInCart");
const inCart = Cookie.get("productsInCart");
const savedArr = Cookie.get("cartArray");

document.querySelector("#amount").innerText = inCart;

console.log(document.cookie);

console.log(Cookie.get("productsInCart"))

class Products {
    #img;
    #name;
    #price;
    #balance;
    #baseUrl;
    #buyBtn;
    #balanceArray;
    #cartObj;
    #cartArray;
    #productsInCart;
    constructor() {
        this.#baseUrl = 'https://mp3-webbshop-default-rtdb.europe-west1.firebasedatabase.app/';
        if (Cookie.get("productsInCart") == undefined) {
            this.#productsInCart = 0;
            this.createCart();
            this.getFirebase()
                .then(value => {
                    this.createProductCards(value);
                })
                .then(
                    () => {
                        this.currentBalance();
                    }
                )
        }
        else {
            this.getFirebase()
            .then(value => {
                this.createProductCards(value);
            })
            .then(
                () => {
                    this.currentBalance();
                }
            )
        }

    }
    async getFirebase() {
        const url = this.#baseUrl + '.json';
        const response = await fetch(url);
        const productArray = await response.json();
        return productArray;
    }
    createProductCards(array) {
        console.log(array);
        array.forEach((product, index) => {
            const productCard = document.createElement('div');
            document.getElementById('productContainer').append(productCard);
            this.#img = document.createElement('img');
            this.#img.src = product.img;
            this.#name = document.createElement('h2');
            this.#name.innerText = product.name;
            this.#price = document.createElement('p');
            this.#price.innerText = product.price + ' kr';
            this.#buyBtn = document.createElement('button');
            this.#buyBtn.innerText = 'Add to cart';
            this.#buyBtn.id = index;
            console.log(index);
            productCard.append(this.#img, this.#name, this.#price, this.#buyBtn);

            this.#buyBtn.addEventListener('click', () => {
                this.checkBalance(index);
                this.addToCart(index);
                this.addCookies();
            })
            this.#balance = product.balance;
            if (this.#balance == 0) {
                this.#buyBtn.disabled = true;
            }
        });
        const buttons = document.querySelectorAll('buttons');
    }
    async currentBalance() {
        const productArray = await this.getFirebase();
        this.#balanceArray = [];
        productArray.forEach(
            product => {
                this.#balanceArray.push(product.balance)
            }
        )
    }
    checkBalance(index) {
        if (this.#balanceArray[index] > 0) {
            this.#balanceArray[index]--;

        }
        else {
            document.getElementById(index).disabled = true;
        }
        console.log(this.#balanceArray, index);
    }
    createCart() {
        this.#cartObj = {
            crystals4: 0,
            incense: 0,
            witchkit: 0,
            dreamcatcher: 0,
            crystals15: 0
        }
        this.#cartArray = Object.entries(this.#cartObj);
    }
    addToCart(index) {
        this.#cartArray[index][1]++;

        console.log("cartArr:", this.#cartArray);

        this.#productsInCart++;
        console.log("products in cart:", this.#productsInCart);
    }
    addCookies() {
        Cookie.remove("procuctsInCart");
        Cookie.set("productsInCart", this.#productsInCart, { expires: 1 });
        Cookie.set("cartArray",this.#cartArray, {expires: 1});
    }
}

const el = new Products();
el.checkBalance();
// console.log(document.cookie);