import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
//import {utils} from '../utils.js';

class Booking {
  constructor(element) {
    const thisBooking = this; //
    thisBooking.render(element);
    thisBooking.initWidgets(); 
  }
  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    //thisBooking.dom.elem = utils.createDOMFromHTML(generatedHTML);
    //thisBooking.dom.wrapper = thisBooking.dom.element.querySelector(element);
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePickerInput = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPickerInput = element.querySelector(select.widgets.hourPicker.wrapper);
  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(
      thisBooking.dom.peopleAmount
    );
    thisBooking.hoursAmount = new AmountWidget(
      thisBooking.dom.hoursAmount
    );
    thisBooking.datePicker = new DatePicker(
      thisBooking.dom.datePickerInput
    );
    // thisBooking.hourPicker = new HourPicker(
    //   thisBooking.dom.hourPickerInput
    // );
  }
}

export default Booking;