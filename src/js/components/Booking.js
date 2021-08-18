import {select, settings, templates, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import {utils} from '../utils.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this; //
    thisBooking.render(element);
    thisBooking.initWidgets(); 
    thisBooking.getData(); 
    thisBooking.selectedTable = null;
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    //console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
      
    };
    console.log('urls.booking:', urls.booking);
    console.log('urls.eventsCurrent:', urls.eventsCurrent);
    console.log('urls.eventsRepeat:', urls.eventsRepeat);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ]).then(function(allResponses) {
      const bookingsResponse = allResponses[0];
      const eventsCurrentResponse = allResponses[1];
      const eventsRepeatResponse = allResponses[2];
      return Promise.all([
        bookingsResponse.json(),
        eventsCurrentResponse.json(),
        eventsRepeatResponse.json(),
      ]);
    }).then(function([bookings, eventsCurrent, eventsRepeat]){
    //   console.log('bookings', bookings);
    //   console.log('eventsCurrent', eventsCurrent);
    //   console.log('eventsRepeat', eventsRepeat);
      thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
    });  
  }
  


  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this; //


    thisBooking.booked = {}; 

    for(let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table); 
    }

    for(let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat) {
      if(item.repeat == 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        } 
      }
    }
    //console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM(); 
  }
 
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    utils.hourToNumber(hour); 

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      // console.log('loop', hourBlock);
      
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
  
    }
  }

  updateDOM() {
    const thisBooking = this; 

    thisBooking.date = thisBooking.datePicker.value; 
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    console.log('thisBooking.hourPicker.value',thisBooking.hourPicker.value);
    let allAvailable = false; 

    if(typeof thisBooking.booked[thisBooking.date] == 'undefined' 
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if(
        !allAvailable 
          && 
          thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) 
      ) {
        table.classList.add(classNames.booking.tableBooked);
      }else {
        table.classList.remove(classNames.booking.tableBooked);
      }

    }
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
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector('.floor-plan');

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
    thisBooking.hourPicker = new HourPicker(
      thisBooking.dom.hourPickerInput
    );
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
      thisBooking.resetSelectedTable();
    });
    thisBooking.dom.tablesWrapper.addEventListener('click', function (event){
      thisBooking.initTables(event); 
    });
    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }
  initTables(e) {
    const thisBooking = this;
    if(e.target.classList.contains('table')) {
      if(e.target.classList.contains('booked')) {
        alert('stolik zajęty!');
      } else {
        for(let table of thisBooking.dom.tables) {
          table.classList.remove('selected');
        }
        if(e.target.getAttribute('data-table') == thisBooking.selectedTable) {
          thisBooking.selectedTable = null;
        } else {
          e.target.classList.add('selected');
          thisBooking.selectedTable = e.target.getAttribute('data-table'); 
        }
            
      }
      console.log('hurra!');
    }
  }
  resetSelectedTable() {
    const thisBooking = this;
    for(let table of thisBooking.dom.tables) {
      table.classList.remove('selected');
    }
    thisBooking.selectedTable = null; 
  }

  sendBooking() {

    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedTable,
      duration: parseInt(thisBooking.peopleAmount.value),
      ppl: parseInt(thisBooking.hoursAmount.value),
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    for (let starter of thisBooking.starters) {
      if (starter.checked == true) {
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }
}

export default Booking;