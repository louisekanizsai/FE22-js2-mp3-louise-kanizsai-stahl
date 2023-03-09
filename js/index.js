import Cookie from "../node_modules/js-cookie/dist/js.cookie.mjs";
import anime from "../node_modules/animejs/lib/anime.es.js";

// nollställer cookies
// Cookie.remove("numberOfProductsInCart");
// Cookie.remove("cartArray");
// Cookie.remove("balanceArray");
// Cookie.remove("savedBalanceFromFirebase");

console.log(document.cookie);

class Products {
    #img;
    #name;
    #price;
    #baseUrl;
    #buyBtn;
    #balanceArray;
    #cartObj;
    #cartArray;
    #numberOfProductsInCart;
    constructor() {
        this.#baseUrl = 'https://mp3-webbshop-default-rtdb.europe-west1.firebasedatabase.app/';
        // Kollar om cookies finns sen tidigare. 
        // Om det inte finns så måste cart skapas
        if (Cookie.get("numberOfProductsInCart") == undefined) {
            this.#balanceArray = []; //är tom då dens innehåll skapas i currentBalance
            this.#numberOfProductsInCart = 0;
            this.createCart();
            this.currentBalance();
            this.getFirebase()
                .then(products => {
                    this.createProductCards(products);
                })
        }
        // Detta händer när köpet genomförts. Då finns alla cookies förutom balancearray, som ska skapas på nytt med det uppdaterade lagersaldot
        else if (Cookie.get("numberOfProductsInCart") !== undefined && Cookie.get("balanceArray") == undefined) {
            this.#balanceArray = [];
            this.#cartArray = JSON.parse(Cookie.get("cartArray"));
            this.#numberOfProductsInCart = Cookie.get("numberOfProductsInCart");
            this.currentBalance()
            this.displayNumberOfProductsInCart();
            this.getFirebase()
                .then(products => {
                    this.createProductCards(products);
                })
        }
        // Om alla cookies finns: skapa cart efter cookies. 
        else { 
            this.#cartArray = JSON.parse(Cookie.get("cartArray"));
            this.#numberOfProductsInCart = Cookie.get("numberOfProductsInCart");
            this.#balanceArray = JSON.parse(Cookie.get("balanceArray"));
            this.displayNumberOfProductsInCart();
            this.getFirebase()
                .then(products => {
                    this.createProductCards(products);
                })
        }
    }
    //cartArray ska innehålla varorna som användaren lägger till, detta ska sedan förvaras i en cookie
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
    //balanceArray tilldelas sitt värde baserat på saldot i firebase
    async currentBalance() {
        const productArray = await this.getFirebase();
        productArray.forEach(
            product => {
                this.#balanceArray.push(product.balance)
            }
        )
        Cookie.set("savedBalanceFromFirebase", JSON.stringify(this.#balanceArray), { expires: 1 });
    }
    async getFirebase() {
        const url = this.#baseUrl + '.json';
        const response = await fetch(url);
        const productArray = await response.json();
        return productArray;
    }
    createProductCards(arrayOfProducts) {
        arrayOfProducts.forEach((product, index) => {
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

            // Kollar om det finns varor kvar att sälja, om det finns så kan man lägga till varor i sin cart annars går inte knappen att trycka på 
            if (this.#balanceArray[index] > 0) {
                this.#buyBtn.addEventListener('click', () => {
                    this.checkBalance(index);
                    this.addToCart(index);
                    this.addCookies();
                    this.displayNumberOfProductsInCart();
                })
            } else if (this.#balanceArray[index] == 0) {
                this.#buyBtn.disabled = true;
            }
        });
    }
    //Kontrollerar vårt nedsparade saldo så att det inte kan bli mindre än noll.
    checkBalance(index) {
        // om index = 1 är det sista klicket, knappen ska då disable
        if (this.#balanceArray[index] == 1) {
            document.getElementById(index).disabled = true;
            this.#balanceArray[index]--;
        }
        else if (this.#balanceArray[index] > 0) {
            this.#balanceArray[index]--;
        }
    }
    //Lägger till vald vara på rätt key i cartArray
    addToCart(index) {
        this.#cartArray[index][1]++;
        this.#numberOfProductsInCart++;
    }
    addCookies() {
        Cookie.set("numberOfProductsInCart", this.#numberOfProductsInCart, { expires: 1 });
        Cookie.set("cartArray", JSON.stringify(this.#cartArray), { expires: 1 });
        Cookie.set("balanceArray", JSON.stringify(this.#balanceArray), { expires: 1 })
    }
    displayNumberOfProductsInCart() {
        const inCart = Cookie.get("numberOfProductsInCart");
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
const productSite = new Products();