import ReactDOM from 'react-dom/client'
import { useCallback } from 'react'
import { BeatLoader } from 'react-spinners'
import DatePicker from 'react-datepicker'
import { isBefore, startOfDay, subDays } from 'date-fns';
import debounce from "lodash/debounce"
import '../styles/datepicker.scss'

const headers = {
    "x-rapidapi-key": import.meta.env.VITE_API_KEY, 
    "x-rapidapi-host": 'sky-scrapper.p.rapidapi.com'
}

export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export function PriceCalendar({departOrReturn, departDate, returnDate, departPort, destPort, currency, setDate, disableBtnCondition}) {

  async function DisplayLoadersAndCalendarPrices(dateVariable, departPort, destPort, currency) {
    if (!(dateVariable instanceof Date)) {
      dateVariable = new Date(dateVariable);
    }

    //Put a loader under each date until the prices are retrieved.
    let isOnCurrentMonth = false;
    const month = dateVariable.getMonth() + 1;
    const year = dateVariable.getFullYear();

    const weeks = document.getElementsByClassName("react-datepicker__week");
    for (let week = 0; week < weeks.length; week++) {
      let days = weeks[week].getElementsByClassName("react-datepicker__day")
      Array.from(days).forEach((element) => {
        const dayNum = parseInt(element.textContent);

        //IF current month has not begun yet, get rid of this number.
        if (dayNum == 1) {
          isOnCurrentMonth = !isOnCurrentMonth;
        }

        let selectedDate = year + "-" + month.toString().padStart(2, '0') + "-" + dayNum.toString().trim().padStart(2, '0');


        let newDiv = document.createElement('div');
        element.appendChild(newDiv);
        let dateToCompare = new Date(startOfDay(subDays(new Date(), 1)));
        if (isOnCurrentMonth && !isBefore(new Date(selectedDate), dateToCompare)) {
          const root = ReactDOM.createRoot(newDiv);
          root.render(<BeatLoader size={5}/>);
        } else {
          newDiv.className = 'flight-price --not-available';
          newDiv.innerHTML = "--";
          const root = ReactDOM.createRoot(newDiv);
          root.render(<div height={27.2}>{'\u00A0'}</div>)
        }

      })
    }

    debouncedGetAndShowCalendarPrices(departPort, destPort, currency, month, year, weeks);
  }

  const debouncedGetAndShowCalendarPrices = useCallback(debounce(GetAndShowCalendarPrices, 500, true), []);

  async function GetAndShowCalendarPrices(departPort, destPort, currency, month, year, weeks) {
    let today = new Date();
    today.setDate(today.getDate() - 1);
    let fromDate = formatDate(today);

    const URL = "https://sky-scrapper.p.rapidapi.com/api/v1/flights/getPriceCalendar?originSkyId=" + departPort + "&destinationSkyId=" + destPort + "&fromDate=" + fromDate + "&currency=" + currency;
    const result = await fetch(URL, {
      method: 'GET',
      headers: headers,
    });
    const data = await result.json();
    const calendarPrices = data.data.flights.days;

    //BELOW: After fetching the calendar prices, display them one by one on their respective dates.

    for (let week = 0; week < weeks.length; week++) {
      let days = weeks[week].getElementsByClassName("react-datepicker__day")

      Array.from(days).forEach((element) => {
        let selectedDate = year + "-" + month.toString().padStart(2, '0') + "-" + element.textContent.toString().trim().padStart(2, '0');
        let dateToCompare = startOfDay(subDays(new Date(), 1));
        if (!isBefore(new Date(selectedDate), dateToCompare)) {
          let newDiv = document.createElement('div');
          const flightData = calendarPrices.find(item => item.day == selectedDate);

          if (flightData && element.childNodes[1].innerHTML !== '\u00A0') {
            //Now, show the price
            newDiv.className = 'flight-price --' + flightData.group;
            newDiv.innerHTML = flightData.price;
            element.replaceChild(newDiv, element.childNodes[1]);
          } else {
            newDiv.className = 'flight-price --not-available';
            newDiv.innerHTML = "--";
            element.replaceChild(newDiv, element.childNodes[1]);
          }
        }
      })

    }

    return data.data.flights.days;
  }

  return (<DatePicker 
    selected={departDate} 
    disabled={disableBtnCondition}
    className={disableBtnCondition && '--disabled'}
    minDate={departOrReturn === "depart" ? new Date() : new Date(returnDate)}
    showDisabledMonthNavigation
    startDate={departOrReturn === "return" && new Date(departDate)}
    endDate={departOrReturn === "depart" && new Date(returnDate)}
    onCalendarOpen={() => DisplayLoadersAndCalendarPrices(departDate, departPort.skyId, destPort.skyId, currency)}
    onMonthChange={date => DisplayLoadersAndCalendarPrices(date, departPort.skyId, destPort.skyId, currency)} 
    onChange={(date) => {
      setDate(date);
    }} 
  />)
}

