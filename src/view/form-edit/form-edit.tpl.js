import dayjs from "dayjs";

const createTypeList = (types) => {

  return Array.from(types).map((type) => {
    const typeName = type.toLowerCase();
    return `<div class="event__type-item">
    <input id="event-type-${typeName}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${typeName}">
    <label class="event__type-label  event__type-label--${typeName}" for="event-type-${typeName}-1">${type}</label>
  </div>`;
  }).join(``);
};

const createDestinationList = (destinations) => {

  return destinations.map((elem) => {
    return `<option value="${elem.name}"></option>`;
  }).join(``);
};

const createOptionsList = (options, isDisabled) => {
  if (options.toString()) {
    return options.map(({type, offers}) => {

      return offers.map(({title, price, isIncluded}) => {

        const id = title.toLowerCase().split(` `).join(`-`);
        return `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${id}-1" type="checkbox" name="event-offer-${type}" ${isIncluded ? `checked` : ``} ${isDisabled ? `disabled` : ``}>
      <label class="event__offer-label" for="event-offer-${id}-1">
        <span class="event__offer-title">${title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${price}</span>
      </label>
    </div>`;
      }).join(``);

    });
  }
  return ``;
};

const createImagesBlock = (cityInfo) => {
  if (cityInfo) {
    return `<div class="event__photos-container">
  <div class="event__photos-tape">

  ${
  cityInfo.map((elem) => {
    const {pictures} = elem;

    return pictures.map((item) => {
      return `<img class="event__photo" src="${item.src}" alt="${item.description}"></img>`;
    }).join(``);
  })}

  </div>
</div>`;
  }
  return null;
};

export const createEditTemplate = (data = {}, types, destinations, options, isNewPoint) => {

  const {type, destination, date, price, description, images, isDisabled, isSaving, isDeleting} = data;
  const typeName = type.toLowerCase();
  const {start, end} = date;

  const typeList = createTypeList(types);
  const destinationList = createDestinationList(destinations);

  const startDate = dayjs(start).format(`DD/MM/YY HH:mm`);
  const endDate = dayjs(end).format(`DD/MM/YY HH:mm`);

  const currentCityInfo = destinations.filter((elem) => elem.name === destination);
  const currentTypeOffers = options.filter((elem) => elem.type === typeName);

  const optionsList = createOptionsList(currentTypeOffers, isDisabled);
  const imagesBlock = createImagesBlock(currentCityInfo);

  return `<li class="trip-events__item">
  <form class="event event--edit" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-1">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${typeName}.png" alt="Event type icon">
        </label>
        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox" ${isDisabled ? `disabled` : ``}>

        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
            ${typeList}

          </fieldset>
        </div>
      </div>

      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-1">
        ${type}
        </label>
        <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destination}" list="destination-list-1" ${isDisabled ? `disabled` : ``}>
        <datalist id="destination-list-1">
          ${destinationList}
        </datalist>
      </div>

      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-1">From</label>
        <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${startDate}" ${isDisabled ? `disabled` : ``}>
        &mdash;
        <label class="visually-hidden" for="event-end-time-1">To</label>
        <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${endDate}" ${isDisabled ? `disabled` : ``}>
      </div>

      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-1">
          <span class="visually-hidden">Price</span>
          &euro;
        </label>
        <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${price}" ${isDisabled ? `disabled` : ``}>
      </div>

      <button class="event__save-btn  btn  btn--blue" type="submit" ${isDisabled ? `disabled` : ``}>${isSaving ? `Saving...` : `Save`}</button>
      ${isNewPoint ? `<button class="event__reset-btn" type="reset" ${isDisabled ? `disabled` : ``}>Cancel</button>` : `<button class="event__reset-btn" type="reset" ${isDisabled ? `disabled` : ``}>${isDeleting ? `Deleting...` : `Delete`}</button>`}
      <button class="event__rollup-btn" type="button" ${isDisabled ? `disabled` : ``}>
        <span class="visually-hidden">Open event</span>
      </button>
    </header>
    <section class="event__details">
    ${optionsList.toString() ? `<section class="event__section  event__section--offers">
        <h3 class="event__section-title  event__section-title--offers">Offers</h3>

        <div class="event__available-offers">
          ${optionsList}
        </div>
      </section>` : ``}

      <section class="event__section  event__section--destination">
        ${description ? `<h3 class="event__section-title  event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${description}</p>` : ``}
        ${images ? `${imagesBlock}` : ``}
      </section>
    </section>
  </form>
</li>`;
};
