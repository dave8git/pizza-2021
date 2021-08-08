import {select, classNames, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import {utils} from '../utils.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    //console.log('new Product:', thisProduct);
  }
  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(
      select.menuProduct.clickable
    );
    thisProduct.form = thisProduct.element.querySelector(
      select.menuProduct.form
    );
    thisProduct.formInputs = thisProduct.form.querySelectorAll(
      select.all.formInputs
    );
    thisProduct.cartButton = thisProduct.element.querySelector(
      select.menuProduct.cartButton
    );
    thisProduct.priceElem = thisProduct.element.querySelector(
      select.menuProduct.priceElem
    );
    thisProduct.imageWrapper = thisProduct.element.querySelector(
      select.menuProduct.imageWrapper
    );
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(
      select.menuProduct.amountWidget
    );
  }
  renderInMenu() {
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data); /* generate HTML based on template */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML); /* create element using utils.createElementFromHTML */
    const menuContainer = document.querySelector(select.containerOf.menu); /* find menu cotainer */
    menuContainer.appendChild(thisProduct.element); /* add element to menu */
  }

  initAccordion() {
    const thisProduct = this;
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      event.preventDefault(); /* prevent default action form event */
      const activeProducts = document.querySelectorAll(
        select.all.menuProducts
      ); /* find active product (product that has active class) */
      for (let activeProduct of activeProducts) {
        if (activeProduct !== thisProduct.element) {
          /* if there is active product and it's not thisProduct.element, remove class active from it */
          activeProduct.classList.remove(
            classNames.menuProduct.wrapperActive
          ); /* toggle active class on thisProduct.element */
          //console.log('activeProduct', activeProduct);
        }
      }
      thisProduct.element.classList.toggle(
        classNames.menuProduct.wrapperActive
      );
    });
  }

  initOrderForm() {
    const thisProduct = this;
    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }
    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;
    // covert form to object structure e.g. {sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    // set price to default price
    let price = thisProduct.data.price;
    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'...}
      const param = thisProduct.data.params[paramId]; //param np. objekt z danymi np. labe: ...., type: ...., optioins: {...}
      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true}
        const option = param.options[optionId];
        if (formData[paramId] && formData[paramId].includes(optionId)) {
          if (!option.default) {
            price += option.price; // add option price to price variable
          }
        } else {
          if (option.default) {
            price -= option.price; // reduce price variable
          }
        }
        const optionImages = thisProduct.imageWrapper.querySelectorAll(
          '.' + paramId + '-' + optionId
        );
        if (formData[paramId] && formData[paramId].includes(optionId)) {
          for (let optionImage of optionImages) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          for (let optionImage of optionImages) {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    /* multiply price by amount */
    price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML
    thisProduct.price = price;
    thisProduct.priceElem.innerHTML = price;
  }
  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }
  addToCart() {
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    }); //

    thisProduct.element.dispatchEvent(event);
  }
  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle,
      params: thisProduct.prepareCartProductParams(),
    };

    return productSummary;
  }
  prepareCartProductParams() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};
    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'...}
      const param = thisProduct.data.params[paramId]; //param np. objekt z danymi np. labe: ...., type: ...., optioins: {...}
      // for every option in this category
      params[paramId] = {
        label: param.label,
        options: [],
      };
      for (let optionId in param.options) {
        //console.log('options', params[paramId].options);
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true}
        //const option = param.options[optionId];
        if (formData[paramId] && formData[paramId].includes(optionId)) {
          params[paramId].options.push(optionId);
        }
      }
    }
    return params;
  }
}

export default Product;
