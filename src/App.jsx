import { useState } from 'react'
import { formatDate, PriceCalendar } from './components/PriceCalendar'
import SearchAirports from './components/SearchAirports'
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ItineraryCards from './components/ItineraryCards';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { CircleLoader } from 'react-spinners'
import 'react-datepicker/dist/react-datepicker.css'
import './styles/datepicker.scss'
import './styles/itineraries.scss'
import './styles/searchquerybar.scss'
import './styles/App.scss'

const headers = {
  "x-rapidapi-key": import.meta.env.VITE_API_KEY, 
  "x-rapidapi-host": 'sky-scrapper.p.rapidapi.com'
}


function App() {
  const [departPort, setDepartPort] = useState();
  const [destPort, setDestPort] = useState();
  const currency = 'USD';  
  const [departDate, setDepartDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());
  const [cabinClass, setCabinClass] = useState('economy');
  const [numOfAdults, setNumOfAdults] = useState(1);
  const [sortBy, setSortBy] = useState('best');
  const [isRoundTrip, toggleRoundTrip] = useState(true);
  const [loadingItineraries, setLoadingItineraries] = useState(false);
  const [itineraries, setItineraries] = useState([]);
  const [whichTrip, setWhichTrip] = useState('depart');
  const [searched, setSearched] = useState(false);
  let needsRefresh = true;
        
  function AdultCounter() {
    return (
      <>
        <div className="numofadults">
          <FontAwesomeIcon icon={faUser} className="adult-icon"/>
          <button className="plus-minus-btn" onClick={() => {
            if (numOfAdults > 1) {
              setNumOfAdults(numOfAdults - 1)
            }
          }}>-</button>
          <div className="adultcount-box">
            {numOfAdults}
          </div>
          <button className="plus-minus-btn" onClick={() => {
            if (numOfAdults < 9) {
              setNumOfAdults(numOfAdults + 1)
            }
          }}>+</button>
        </div>
      </>
    )
  }

  async function SearchFlights() {
    setLoadingItineraries(true);
    setWhichTrip('depart');
    const returnDateQuery = isRoundTrip ? "&returnDate=" + formatDate(returnDate) : "";

    //NOTE: Set 'market' and 'locale' values at the end later. For now its ok.
    const URL = "https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlights?originSkyId=" + departPort.skyId + "&destinationSkyId=" + destPort.skyId + "&originEntityId=" + departPort.entityId + "&destinationEntityId=" + destPort.entityId + "&date=" + formatDate(departDate) + returnDateQuery + "&cabinClass=" + cabinClass + "&adults=" + numOfAdults + "&sortBy=" + sortBy + "&currency=" + currency + "&market=en-US&countryCode=US";
    const result = await fetch(URL, {
        method: 'GET',
        headers: headers,
    });

    const data = await result.json();

    needsRefresh = false;
    setLoadingItineraries(false);
    setItineraries(data.data.itineraries);
  }

  //END of SearchFlights area

  return (
    <>
      <div className="search-queries-top">
        <div className="round-trip">
          Round trip
          <Checkbox checked={isRoundTrip} value={isRoundTrip} onChange={() => toggleRoundTrip(!isRoundTrip)}/>
        </div>
        <AdultCounter />
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <Select
            value={cabinClass}
            onChange={(event) => {
              setCabinClass(event.target.value);
              needsRefresh = true;
            }}
            displayEmpty
          >
            <MenuItem value={'economy'}>Economy</MenuItem>
            <MenuItem value={'premium_economy'}>Premium Economy</MenuItem>
            <MenuItem value={'business'}>Business</MenuItem>
            <MenuItem value={'first'}>First</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className="flight-details">
        <SearchAirports placeholder="Departing From..." setAirportFunction={(arg) => {
          needsRefresh = true;
          setDepartPort(arg);
        }}/>
        <SearchAirports placeholder="Destination In..." setAirportFunction={setDestPort}/>
        <div className="price-calendar-parent">
          Departure date
          <PriceCalendar 
            departOrReturn="depart" 
            departDate={departDate} 
            returnDate={returnDate}
            departPort={departPort} 
            destPort={destPort} 
            currency={currency} 
            setDate={(arg) => {
              setDepartDate(arg);
              setReturnDate(arg+1);
            }}
            disableBtnCondition={!departPort || !destPort}/>
        </div>
        <div className="price-calendar-parent">
          Return date
          <PriceCalendar 
            departOrReturn="return" 
            departDate={returnDate} 
            returnDate={departDate}
            departPort={destPort} 
            destPort={departPort} 
            currency={currency} 
            setDate={(arg) => {
              setReturnDate(arg);
            }} 
            disableBtnCondition={!departPort || !destPort || !isRoundTrip}/>
        </div>
        <button disabled={!departPort || !destPort} className={"search-button " + ((!departPort || !destPort) && "--disabled")} onClick={() => SearchFlights()}>
          Search
        </button>
      </div>
      <div className="search-queries-bottom">
        <div className="filter-text">
          Sort By 
        </div>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <Select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              if (!needsRefresh) {
                SearchFlights();
                setSearched(true);
              }
            }}
            displayEmpty
          >
            <MenuItem value={'best'}>Best</MenuItem>
            <MenuItem value={'price_low'}>Cheapest</MenuItem>
            <MenuItem value={'fastest'}>Fastest</MenuItem>
            <MenuItem value={'outbound_take_off_time'}>Outbound Takeoff Time</MenuItem>
            <MenuItem value={'outbound_landing_time'}>Outbound Landing Time</MenuItem>
            <MenuItem value={'return_take_off_time'}>Return Takeoff Time</MenuItem>
            <MenuItem value={'return_landing_time'}>Return Landing Time</MenuItem>
          </Select>
        </FormControl>
      </div>
      {loadingItineraries && (
        <div className="circle-loader">
          <CircleLoader color="white" size="80px"/>
        </div>
      )}
      { searched && 
        <div className="itineraries-header">
          {whichTrip === "depart" ? "Choose an outbound flight" : "Choose a return flight"}
        </div>}
      {(whichTrip == "depart") && (
        <div className="itineraries">
          {itineraries.map((itinerary, index) => (<ItineraryCards key={index} itinerary={itinerary} whichTrip={whichTrip} onChooseItinerary={() => {
            setWhichTrip('return')
          }}/>))}
        </div>)}
      {(whichTrip == "return") && (
        <div className="itineraries">
          {itineraries.map((itinerary, index) => (<ItineraryCards key={index} itinerary={itinerary} whichTrip={whichTrip} onChooseItinerary={() => {
            console.log("Done.")
          }}/>))}
        </div>)}
    </>
  )
}

export default App
