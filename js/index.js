import Cookie from "../node_modules/js-cookie/dist/js.cookie.mjs";
import anime from "../node_modules/animejs/lib/anime.es.js";

// nollställer cookies
// Cookie.remove("productsInCart");
// Cookie.remove("cartArray");
// Cookie.remove("balanceArray");
// Cookie.remove("savedBalanceArr");

console.log(document.cookie);

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
        // kollar om cookies finns. om inte: skapa cart
        if (Cookie.get("productsInCart") == undefined) {
            this.#balanceArray = [];
            this.#productsInCart = 0;
            this.createCart();
            this.currentBalance();
            this.getFirebase()
                .then(products => {
                    this.createProductCards(products);
                })
        }
        // detta ska hända när köpets genomförts. Då finns alla cookies förutom balancearray, som ska skapas på nytt
        else if (Cookie.get("productsInCart") !== undefined && Cookie.get("balanceArray") == undefined){ 
            this.#balanceArray = [];
            console.log("else if händer")
            this.#cartArray = JSON.parse(Cookie.get("cartArray"));
            this.#productsInCart = Cookie.get("productsInCart");
            this.currentBalance()
            this.displayCookieInCart();
            this.getFirebase()
                .then(products => {
                    console.log(products)
                    this.createProductCards(products);
                })
        }
        else { // om alla cookies finns: skapa cart efter cookies. 
            this.#cartArray = JSON.parse(Cookie.get("cartArray"));
            this.#productsInCart = Cookie.get("productsInCart");
            this.#balanceArray = JSON.parse(Cookie.get("balanceArray"));

            this.displayCookieInCart();
            this.getFirebase()
                .then(products => {
                    this.createProductCards(products);
                })
        }

    }
    async getFirebase() {
        const url = this.#baseUrl + '.json';
        const response = await fetch(url);
        const productArray = await response.json();
        return productArray;
    }
    createProductCards(array) {
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
            productCard.append(this.#img, this.#name, this.#price, this.#buyBtn);

            // KLICK PÅ KÖPKNAPP 
            if (this.#balanceArray[index] > 0) {
                this.#buyBtn.addEventListener('click', () => {
                    this.checkBalance(index);
                    this.addToCart(index);
                    this.addCookies();
                    this.displayCookieInCart();
                })
            } else if (this.#balanceArray[index] == 0) {
                this.#buyBtn.disabled = true;
            }

            // disable button om saldo = 0 i firebase
            this.#balance = product.balance;
            if (this.#balance == 0) {
                this.#buyBtn.disabled = true;
            }
        });
    }
    // skapar en array (balancearray) som bara innehåller saldot för varje produkt i dess index
    async currentBalance() {
        const productArray = await this.getFirebase();

        productArray.forEach(
            product => {
                this.#balanceArray.push(product.balance)
            }
        )
        Cookie.set("savedBalanceArr", JSON.stringify(this.#balanceArray), { expires: 1 });
    }
    // uppdaterar vårt låtsassaldo, kollar så att det inte blir 0
    checkBalance(index) {
        // om = 1 är det sista klicket, ska disable knappen
        if (this.#balanceArray[index] == 1) {
            document.getElementById(index).disabled = true;
            this.#balanceArray[index]--;
        }
        else if (this.#balanceArray[index] > 0) {
            this.#balanceArray[index]--;

        }

    }
    // händer om det inte finns cookies. skapar objekt som ska läggas till i cookies. cartarray: varje index har key value pair
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
    // anropas på eventlistener knapp. lägger till +1 på rätt "keys" värde 
    addToCart(index) {
        this.#cartArray[index][1]++;
        this.#productsInCart++;
    }
    addCookies() {
        Cookie.set("productsInCart", this.#productsInCart, { expires: 1 });
        Cookie.set("cartArray", JSON.stringify(this.#cartArray), { expires: 1 });
        Cookie.set("balanceArray", JSON.stringify(this.#balanceArray), { expires: 1 })
    }
    displayCookieInCart() {
        const inCart = Cookie.get("productsInCart");
        document.querySelector("#amount").innerText = inCart;
    }
}

const cartIcon = document.querySelector("#cart");

anime({
    targets: cartIcon,
    scale: 0.7,
    easing: 'linear',
    loop: true,
    direction: 'alternate',
    duration: 1000
})

cartIcon.addEventListener("click", () => {
    location.assign("../html/cart.html");
})

const el = new Products();
el.checkBalance();
