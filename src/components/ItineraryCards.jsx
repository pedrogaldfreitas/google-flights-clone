import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { format } from "date-fns";
import '../styles/itineraries.scss'

export default function ItineraryCards({itinerary, whichTrip, onChooseItinerary}) {
    let legId = 0;
    if (whichTrip === "return") {
        legId = 1;
    }

    return (
        <div className="itinerary-cards" onClick={() => {onChooseItinerary()}}>
            <div className="itinerary-card">
                <img src={itinerary?.legs[legId]?.carriers?.marketing[0]?.logoUrl} className="flight-logo"/>
            </div>
            <div className="itinerary-card">
                <div className="flight-detail--1">
                    {format(new Date(itinerary?.legs[legId]?.departure), "hh:mm a") + " - " + format(new Date(itinerary?.legs[legId]?.arrival), "hh:mm a")}
                </div>
                <div className="flight-detail--2">
                    {itinerary?.legs[legId]?.carriers?.marketing[0]?.name}
                </div>
            </div>
            <div className="itinerary-card">
                <div className="flight-detail--1">
                    {(Math.floor(itinerary?.legs[legId]?.durationInMinutes / 60)) + " hr " + itinerary?.legs[legId]?.durationInMinutes % 60 + " min"}
                </div>
                <div className="flight-detail--2">
                    {itinerary?.legs[legId]?.origin.id} <FontAwesomeIcon icon={faArrowRight}/> {itinerary?.legs[legId]?.destination.id}
                </div>
            </div>
            <div className="itinerary-card">
                <div className="flight-detail--1">
                    {`${itinerary?.legs[legId]?.stopCount} stop${itinerary?.legs[legId]?.stopCount !== 1 ? "s" : ""}`}
                </div>
            </div>
            <div className="itinerary-card">
                <div className="flight-detail--1 price">
                    {itinerary?.price?.formatted}
                </div>
                <div className="flight-detail--2">
                    round trip {/** PLACEHOLDER VALUE: either round trip of one-way */}
                </div>
            </div>
        </div>
    );
}
