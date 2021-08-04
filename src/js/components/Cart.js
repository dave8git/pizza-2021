import {settings, select, classNames, templates} from '../settings.js';
import CartProduct from './CartProduct.js';
import {utils} from '../utils.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
    //thisCart.update();
    //console.log('new Cart', thisCart);
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );

    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.remove = thisCart.dom.wrapper.querySelector(
      select.cartProduct.remove
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder() {
    const thisCart = this;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.valuew,
      totalPrice: thisCart.totalPrice,
      subTotalPrice: thisCart.subTotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    console.log(payload);
    const url = settings.db.url + '/' + settings.db.orders;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }
  add(menuProduct) {
    //console.log(cartProduct);
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    const cartContainer = document.querySelector(select.cart.productList);
    cartContainer.appendChild(generatedDOM);
    //console.log('cartProduct', thisCart.products);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }
  update() {
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subTotalPrice = 0;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      console.log('product.amount', product.amount);
      thisCart.subTotalPrice += product.price;
      console.log('cartProduct', product);
      console.log('thisCart.totalNumber', thisCart.totalNumber);
    }

    if (thisCart.totalNumber) {
      thisCart.totalPrice = thisCart.subTotalPrice + thisCart.deliveryFee;
    } else {
      thisCart.totalPrice = 0;
    }
    //console.log('thisCart.totalPrice', thisCart.dom.totalPrice);
    for (let totalPrice of thisCart.dom.totalPrice) {
      totalPrice.innerHTML = thisCart.totalPrice;
    }
    console.log('thisCart', thisCart);
    //thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;

    thisCart.dom.subTotalPrice.innerHTML = thisCart.subTotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    console.log('thisCart.dom.totalNumber', thisCart.dom.totalNumber);
    console.log('thisCart.totalNumber', thisCart.totalNumber);
    console.log('thisCart', thisCart);
  }
  remove(cartProduct) {
    const thisCart = this;
    console.log('cartProduct', cartProduct);
    console.log('thisCart.products', thisCart.products);
    cartProduct.dom.wrapper.remove();
    const index = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(index, 1);

    this.update();
  }
}

export default Cart;