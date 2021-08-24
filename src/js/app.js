import {settings, select, classNames, templates} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';

const app = {
  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    console.log(thisApp.pages);
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    console.log('thisApp.navLinks', thisApp.navLinks);
    const idFromHash = window.location.hash.replace('#/', '');
    console.log('idFromHash', idFromHash);

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages) {
      if(page.id === idFromHash) {
        pageMatchingHash = page.id;
        console.log('pageMatchingHash', pageMatchingHash);
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash); 
    for(let link of thisApp.navLinks) {
      console.log('navLinks link', link);
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', ''); /* get page id from href attribute */

        thisApp.activatePage(id); /* run thisApp.activatePage with that id */

        window.location.hash = '#/' + id; /* change URL hash */
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;
    for(let page of thisApp.pages) {
      // if(page.id == pageId) {
      //   page.classList.add(classNames.pages.active); /* add class "active" to matching pages, remove from non-matching */
      // } else {
      //   page.classList.remove(classNames.pages.active);  /* add class "active" to matching links, remove from non-matching */
      // }
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    for(let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initMenu: function () {
    const thisApp = this;
    // console.log('thisApp.data:', thisApp.data);
    // const testProduct = new Product();
    // console.log('testProduct:', testProduct);
    //console.log('thisApp.data', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);

        thisApp.data.products =
          parsedResponse; /* save parsedResponse as thisApp.data.products */

        thisApp.initMenu(); /* execute initMenu method */
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
  initHome: function () {
    const thisApp = this;
    const homeElem = document.querySelector(select.containerOf.home);

    thisApp.home = new Home(homeElem);
  },

  initBooking: function () {
    const thisApp = this; 
    const bookingElem = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(bookingElem);
  },
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initData();
    thisApp.initMenu();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initHome(); 
    thisApp.initPages();
  },
};

app.init();
