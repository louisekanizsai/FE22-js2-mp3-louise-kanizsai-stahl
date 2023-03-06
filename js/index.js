class Products{
    #img;
    #name;
    #price;
    #balance;
    #baseUrl;
    #buyBtn;
    constructor(){
        this.#baseUrl = 'https://mp3-webbshop-default-rtdb.europe-west1.firebasedatabase.app/';
        this.getFirebase()
        .then(value => {
            this.createProductCards(value);
        })
    }
    async getFirebase() {
        const url = this.#baseUrl + '.json';
        const response = await fetch(url);
        const productArray = await response.json();
        return productArray;
    }
    createProductCards(array){
        console.log(array);
        array.forEach(product => {
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

            productCard.append(this.#img, this.#name, this.#price, this.#buyBtn);
        });
    }
}
const el = new Products();
