import { useState, useCallback } from 'react'
import '../styles/airportselector.scss'
import debounce from "lodash/debounce"
import { PuffLoader } from 'react-spinners'


export default function SearchAirports({placeholder, setAirportFunction}) {

    const [showDropdown, setShowDropdown] = useState(false);
    const [airportList, setAirportList] = useState([]);
    const [fieldText, setFieldText] = useState("");
    const [loadingAirports, setLoadingAirports] = useState(false);
    
    const headers = {
        "x-rapidapi-key": import.meta.env.VITE_API_KEY, 
        "x-rapidapi-host": 'sky-scrapper.p.rapidapi.com'
    }

    const debouncedFindAirports = useCallback(debounce(FindAirports, 500, true), []); 

    async function FindAirports(inputText) {
        const locale = 'en-US' 
        const URL = "https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=" + inputText + "&locale=" + locale;

        const result = await fetch(URL, {
            method: 'GET',
            headers: headers,
        });
        const data = await result.json();
        setLoadingAirports(false);

        if (data.data === undefined) {
            setAirportList([]);
        } else {
            setAirportList(data.data);
        }
    }
    
    return (
        <>
            <div className="airport-dropdown-parent">
                <input type="text" 
                    className="airport-dropdown-inputfield"
                    onFocus={() => {setShowDropdown(true)}}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    placeholder={placeholder} 
                    value={fieldText}
                    onChange={(event) => {
                        setFieldText(event.target.value);
                        setLoadingAirports(true);
                        debouncedFindAirports(event.target.value);
                    }} 
                />
                {loadingAirports && (<PuffLoader className="puffloader" size={30} color="white"/>)}
                {(showDropdown && airportList?.length > 0) && (
                <ul className="airport-dropdown">
                    {Array.from(airportList)?.map((airport, index) => {
                        let textToShow = airport.presentation.suggestionTitle + ", " + airport.presentation.subtitle;
                        if (airport.presentation && airport.skyId.length === 3) {
                        return (<li key={index} className="dropdown-item" onClick={() => {
                            setFieldText(textToShow);
                            setAirportFunction(airport);
                            setShowDropdown(false);
                        }}>
                            {textToShow}
                        </li>)              
                        }
                    })}
                </ul>)}
            </div>
        </>
    )
}