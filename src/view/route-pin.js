import dayjs from "dayjs";
import {getRouteDuration} from "../utils.js";
import {createElement} from "../utils.js";

const renderOptions = (points) => {
  return `<h4 class="visually-hidden">Offers:</h4>
  <ul class="event__selected-offers">
    ${points.options.map(({name, price}) => {
    return `<li class="event__offer">
        <span class="event__offer-title">${name}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${price}</span>
      </li>`;
  }).join(``)}
  </ul>`;
};


const createRoutePinTemplate = (points) => {
  const {type, destination, options, date, price} = points;
  const {start, end} = date;
  const startDateDay = dayjs(start).format(`MMM DD`);
  const startDateTime = dayjs(start).format(`HH:MM`);
  const endDateTime = dayjs(end).format(`HH:MM`);
  const difference = getRouteDuration(start, end);
  const optionNode = options === null ? `` : renderOptions(points);
  const iconName = type.toLowerCase();


  return `<li class="trip-events__item">
  <div class="event">
    <time class="event__date" datetime="2019-03-18">${startDateDay}</time>
    <div class="event__type">
      <img class="event__type-icon" width="42" height="42" src="img/icons/${iconName}.png" alt="Event type icon">
    </div>
    <h3 class="event__title">${type} ${destination}</h3>
    <div class="event__schedule">
      <p class="event__time">
        <time class="event__start-time" datetime="2019-03-18T10:30">${startDateTime}</time>
        &mdash;
        <time class="event__end-time" datetime="2019-03-18T11:00">${endDateTime}</time>
      </p>
      <p class="event__duration">${difference}</p>
    </div>
    <p class="event__price">
      &euro;&nbsp;<span class="event__price-value">${price}</span>
    </p>
    <h4 class="visually-hidden">Offers:</h4>
    ${optionNode}
    <button class="event__favorite-btn event__favorite-btn--active" type="button">
      <span class="visually-hidden">Add to favorite</span>
      <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
        <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
      </svg>
    </button>
    <button class="event__rollup-btn" type="button">
      <span class="visually-hidden">Open event</span>
    </button>
  </div>
</li>`;
};


export default class RoutePinView {
  constructor(points) {
    this._element = null;
    this._points = points;
  }
  getTemplate() {
    return createRoutePinTemplate(this._points);
  }
  getElement() {
    if (!this._element) {
      this._element = createElement(this.getTemplate());
    }
    return this._element;
  }
  removeElement() {
    this._element = null;
  }
}
