import Cookie from "../node_modules/js-cookie/dist/js.cookie.mjs"

// nollstället cookies
// Cookie.remove("productsInCart");
// Cookie.remove("cartArray");

// :)
const inCart = Cookie.get("productsInCart");
const savedArr = Cookie.get("cartArray");

console.log(document.cookie);

// console.log(Cookie.get("productsInCart"))

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
        else { // om cookies finns: skapa efter cookies
            // här vet vi att cartarray behöver vara något annat än om det inte finns cookies alls. cookie.getcartarray ger ett konstigt format :( måste parsea manuellt?
            this.#cartArray = Cookie.get("cartArray"); // FEL
            this.displayCookieInCart();
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
            productCard.append(this.#img, this.#name, this.#price, this.#buyBtn);

            // KLICK PÅ KÖPKNAPP 
            this.#buyBtn.addEventListener('click', () => {
                this.checkBalance(index);
                this.addToCart(index);
                this.addCookies();
                this.displayCookieInCart();
            })

            // disable button om saldo = 0
            this.#balance = product.balance;
            if (this.#balance == 0) {
                this.#buyBtn.disabled = true;
            }
        });
    }
    // skapar en array (balancearray) som bara innehåller saldot för varje produkt i dess index
    async currentBalance() {
        const productArray = await this.getFirebase();
        this.#balanceArray = [];
        productArray.forEach(
            product => { 
                this.#balanceArray.push(product.balance)
            }
        )
    }
    // uppdaterar vårt låtsassaldo, kollar så att det inte blir 0
    checkBalance(index) {
        if (this.#balanceArray[index] > 0) { // ok att få error här
            this.#balanceArray[index]--;

        }
        else {
            document.getElementById(index).disabled = true;
        }
        // console.log(this.#balanceArray, index);
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

        console.log("cartArr:", this.#cartArray);

        // uppdaterar productsincards
        this.#productsInCart++;
        console.log("products in cart:", this.#productsInCart);
    }
    addCookies() {
        Cookie.set("productsInCart", this.#productsInCart, { expires: 1 });
        Cookie.set("cartArray", this.#cartArray, { expires: 1 });
    }
    displayCookieInCart(){
        const inCart =  Cookie.get("productsInCart");
        document.querySelector("#amount").innerText = inCart;
    }
}

const el = new Products();
el.checkBalance();
// console.log(document.cookie);