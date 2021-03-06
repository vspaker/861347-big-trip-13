import FormEditView from "../view/form-edit/form-edit";
import {renderElement, RenderPosition, remove} from "../utils/render";
import {isEscKeyPressed} from "../utils/common";
import {UserAction, UpdateType} from "../consts/consts";
import dayjs from 'dayjs';

const DEFAULT_POINT_TYPE = `Flight`;

const EMPTY_POINT = {
  type: DEFAULT_POINT_TYPE,
  destination: ``,
  description: ``,
  options: {
    type: ``,
    offers: []
  },
  price: 0,
  date: {
    start: dayjs().toDate(),
    end: dayjs().add(1, `day`).toDate()
  },
  isFavourite: false
};


export default class PointNew {
  constructor(siteListElement, changeData, options, points, destinations) {
    this._siteListElement = siteListElement;
    this._changeData = changeData;

    this._options = options;
    this._points = points;
    this._destinations = destinations;

    this._pointEditComponent = null;
    this._handleFavouriteClick = this._handleFavouriteClick.bind(this);
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleDeleteClick = this._handleDeleteClick.bind(this);
    this._onEscKeyDown = this._onEscKeyDown.bind(this);

  }

  init() {
    if (this._pointEditComponent !== null) {
      return;
    }

    this._pointEditComponent = new FormEditView(EMPTY_POINT, this._options, this._points, this._destinations, true);
    this._pointEditComponent.setSubmitHandler(this._handleFormSubmit);
    this._pointEditComponent.setDeleteClickHandler(this._handleDeleteClick);
    this._pointEditComponent.setClickHandler(this._handleDeleteClick);

    renderElement(this._siteListElement, this._pointEditComponent, RenderPosition.AFTERBEGIN);

    document.addEventListener(`keydown`, this._onEscKeyDown);
  }

  destroy() {
    if (this._pointEditComponent === null) {
      return;
    }
    this._pointEditComponent.deleteDatePicker();
    remove(this._pointEditComponent);
    this._pointEditComponent = null;
    document.querySelector(`.trip-main__event-add-btn`).disabled = false;
  }

  _onEscKeyDown(evt) {
    if (isEscKeyPressed(evt)) {
      evt.preventDefault();
      this.destroy();
      document.removeEventListener(`keydown`, this._onEscKeyDown);
    }
  }

  _handleFavouriteClick() {
    this._changeData(
        UserAction.UPDATE_POINT,
        UpdateType.MINOR,
        Object.assign(
            {},
            this._point,
            {
              isFavourite: !this._point.isFavourite
            }
        )
    );
  }

  _handleFormSubmit(point) {
    this._changeData(
        UserAction.ADD_POINT,
        UpdateType.MINOR,
        point
    );
  }

  _handleDeleteClick() {
    this.destroy();
  }

  setSaving() {
    this._pointEditComponent.updateData({
      isDisabled: true,
      isSaving: true
    });
  }

  setAborting() {
    const resetFormState = () => {
      this._pointEditComponent.updateData({
        isDisabled: false,
        isSaving: false,
        isDeleting: false
      });
    };

    this._pointEditComponent.shake(resetFormState);
  }
}
