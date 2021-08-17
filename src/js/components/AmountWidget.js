import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue); 
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.dom.input.value || settings.amountWidget.defaultValue); // aby właściwość thisWidget.setValue miała wartość początkową, i aby mógł wykonać się if
    thisWidget.initActions();
    // console.log('AmountWidget:', thisWidget);
    // console.log('constructor arguments', element);
  }
  getElements() {
    const thisWidget = this;

    //thisWidget.element = element;
    //console.log('thisWidget.element', thisWidget.element);
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    //console.log('thisWidget.input', thisWidget.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  parseValue(value){
    return parseInt(value);
  }

  isValid(value){
    return !isNaN(value)
      && value >= settings.amountWidget.defaultMin 
      && value <= settings.amountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function (event) {
      event.preventDefault();
      thisWidget.value = thisWidget.dom.input.value;
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;