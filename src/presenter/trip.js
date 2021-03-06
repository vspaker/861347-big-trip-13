import SortView from "../view/sort/sort";
import FormListView from "../view/form-list/form-list";
import LoadingView from "../view/loading/loading";
import {remove, renderElement, RenderPosition} from "../utils/render";
import {filter} from "../utils/filter";
import {isEscKeyPressed, sortByDate, sortByPrice, sortByTime} from "../utils/common";
import Point, {State as PointPresenterViewState} from "./point.js";
import PointNew from "./point-new.js";
import {SortType, UserAction, UpdateType, Filters} from "../consts/consts";
import EmptyView from "../view/empty/empty";


export default class Trip {
  constructor(tripContainer, pointsModel, optionsModel, filterModel, destinationsModel, api) {
    this._tripContainer = tripContainer;
    this._filterModel = filterModel;
    this._destinationsModel = destinationsModel;

    this._pointsModel = pointsModel;
    this._optionsModel = optionsModel;
    this._api = api;

    this._isEscKeyPressed = isEscKeyPressed;

    this._pointPresenter = {};
    this._callback = {};

    this._currentSortType = SortType.DAY;
    this._isLoading = true;
    this._isOffersLoad = false;
    this._isDestinationLoad = false;

    this._siteMainElement = document.querySelector(`.page-body`);
    this._siteRouteElement = this._siteMainElement.querySelector(`.trip-main`);
    this._addNewEventButton = this._siteRouteElement.querySelector(`.trip-main__event-add-btn`);
    this._siteControlsElement = this._siteMainElement.querySelector(`.trip-main__trip-controls h2:first-child`);
    this._siteFiltersElement = this._siteMainElement.querySelector(`.trip-main__trip-controls h2:nth-child(2)`);
    this._siteSortElement = this._siteMainElement.querySelector(`.trip-events`);
    this._formListElement = this._siteMainElement.querySelector(`ul.trip-events__list`);

    this._formList = new FormListView();
    this._sortComponent = null;
    this._emptyComponent = null;
    this._filterPresenter = null;

    this._loadingComponent = new LoadingView();

    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);

    this._pointsModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);
    this._optionsModel.addObserver(this._handleModelEvent);
    this._destinationsModel.addObserver(this._handleModelEvent);

    this._pointNewPresenter = new PointNew(this._formList, this._handleViewAction, this._getOptions(), this._getPoints(), this._getDestinations());
  }

  init() {
    this._renderSort();
  }

  setAddPointButtonEnableHandler(callback) {
    this._callback.enableAddPointButton = callback;
  }

  _getPoints() {
    const filterType = this._filterModel.getFilter();
    const points = this._pointsModel.getPoints();
    const filteredPoints = filter[filterType](points);

    let pointsAfterFiltration = [];
    switch (this._currentSortType) {
      case SortType.TIME:
        pointsAfterFiltration = filteredPoints.sort(sortByTime);
        break;
      case SortType.PRICE:
        pointsAfterFiltration = filteredPoints.sort(sortByPrice);
        break;
      default:
        pointsAfterFiltration = filteredPoints.sort(sortByDate);
    }
    return pointsAfterFiltration;
  }

  resetSortType() {
    this._currentSortType = SortType.DAY;
    this._filterModel.setFilter(UpdateType.MAJOR, Filters.EVERYTHING);
  }

  _getOptions() {
    return this._optionsModel.getOptions();
  }

  _getDestinations() {
    return this._destinationsModel.getDestinations();
  }

  _render(where, what, position) {
    renderElement(where, what, position);
  }

  show(resetSort = true) {
    this._tripContainer.classList.remove(`visually-hidden`);

    if (resetSort) {
      this._clearRoute(true);
      this._renderSort();
    }
  }

  hide() {
    this._tripContainer.classList.add(`visually-hidden`);
  }

  _renderSort() {

    const points = this._getPoints();

    if (this._isLoading) {
      this._addNewEventButton.disabled = true;
      this._renderLoading();
      return;
    }
    if (this._sortComponent !== null) {
      this._sortComponent = null;
    }
    this._sortComponent = new SortView(this._currentSortType);

    if (points.length === 0) {
      this._renderEmpty();
      this._sortComponent.hide();
      return;
    }

    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);
    this._render(this._siteSortElement, this._sortComponent.getElement(), RenderPosition.BEFOREEND);
    this._renderFormList();
  }
  _renderLoading() {
    this._render(this._siteSortElement, this._loadingComponent, RenderPosition.BEFOREEND);
  }

  _renderFormList() {
    this._render(this._siteSortElement, this._formList.getElement(), RenderPosition.BEFOREEND);
    this._renderPointsList();
  }
  createPoint() {
    this._currentSortType = SortType.DAY;
    this._filterModel.setFilter(UpdateType.MAJOR, Filters.EVERYTHING);

    if (this._getPoints().length === 0) {
      remove(this._emptyComponent);
    }
    this._pointNewPresenter = new PointNew(this._formList, this._handleViewAction, this._getOptions(), this._getPoints(), this._getDestinations());
    this._pointNewPresenter.init();
  }
  _renderEmpty() {
    this._emptyComponent = new EmptyView();
    if (!this._formListElement) {
      this._render(this._siteSortElement, this._formList, RenderPosition.BEFOREEND);
    }
    this._render(this._formList, this._emptyComponent.getElement(), RenderPosition.BEFOREEND);
  }
  _renderPoint(point) {
    const pointPresenter = new Point(this._formList, this._handleViewAction, this._handleModeChange, this._getPoints(), this._getOptions(), this._getDestinations());
    const isDataLoaded = this._isOffersLoad && this._isDestinationLoad;
    pointPresenter._init(point, isDataLoaded);
    this._pointPresenter[point.id] = pointPresenter;
  }
  _renderPointsList() {
    this._getPoints().forEach((point) => {
      this._renderPoint(point);
    });
  }
  _clearRoute() {
    Object
      .values(this._pointPresenter)
      .forEach((presenter) => presenter.destroy());
    this._pointPresenter = {};

    if (this._sortComponent) {
      remove(this._sortComponent);
    }
    this._filterPresenter = null;
    remove(this._loadingComponent);
    if (this._emptyComponent) {
      remove(this._emptyComponent);
    }
  }

  _handleModeChange() {
    Object
      .values(this._pointPresenter)
      .forEach((presenter) => presenter._resetView());

    this._pointNewPresenter.destroy();
  }

  _handleViewAction(actionType, updateType, update) {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this._pointPresenter[update.id].setViewState(PointPresenterViewState.SAVING);
        this._api.updatePoint(update)
          .then((response) => {
            this._pointsModel.updatePoint(updateType, response);
          })
          .catch(() => {
            this._pointPresenter[update.id].setViewState(PointPresenterViewState.ABORTING);
          });
        break;
      case UserAction.ADD_POINT:
        this._pointNewPresenter.setSaving();
        this._api.addPoint(update)
          .then((response) => {
            this._pointsModel.addPoint(updateType, response);
            this._pointNewPresenter.destroy();
          })
          .catch(() => {
            this._pointNewPresenter.setAborting();
          });
        break;
      case UserAction.DELETE_POINT:
        this._pointPresenter[update.id].setViewState(PointPresenterViewState.DELETING);
        this._api.deletePoint(update).then(() => {
          this._pointsModel.deletePoint(updateType, update);
        })
        .catch(() => {
          this._pointPresenter[update.id].setViewState(PointPresenterViewState.ABORTING);
        });
        break;
    }
  }

  _handleModelEvent(updateType, data) {
    switch (updateType) {
      case UpdateType.PATCH:
        this._pointPresenter[data.id].init(data);
        break;
      case UpdateType.MINOR:
        this._clearRoute();
        this._currentSortType = SortType.DAY;
        this._renderSort();
        break;
      case UpdateType.MAJOR:
        this._clearRoute();
        this._currentSortType = SortType.DAY;
        this._renderSort();
        break;
      case UpdateType.INIT:
        this._isLoading = false;
        remove(this._loadingComponent);
        this._renderSort();
        break;
      case UpdateType.OFFERS_INIT:
        this._isOffersLoad = true;
        if (this._isDestinationLoad) {
          this._clearRoute();
          this._renderSort();
        }
        break;
      case UpdateType.DESTINATIONS_INIT:
        this._isDestinationLoad = true;
        if (this._isOffersLoad) {
          this._clearRoute();
          this._renderSort();
        }
        break;
      case UpdateType.OFFERS_FAILED:
        this._isOffersLoad = false;
        break;
      case UpdateType.DESTINATIONS_FAILED:
        this._isDestinationLoad = false;
        break;
    }
    this.restoreControls();
  }

  restoreControls() {
    if (this._isOffersLoad && this._isDestinationLoad) {
      this._callback.enableAddPointButton();
      Object
        .values(this._pointPresenter)
        .forEach((presenter) => presenter.enableEdit());
    }
  }

  _handleSortTypeChange(sortType) {
    if (this._currentSortType === sortType) {
      return;
    }
    this._currentSortType = sortType;
    this._getPoints();

    this._clearRoute();
    this._renderSort();
    this.restoreControls();
  }
}
