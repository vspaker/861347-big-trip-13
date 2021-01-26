import SortView from "../view/sort/sort";
import FormListView from "../view/form-list/form-list";
import {remove, renderElement, RenderPosition} from "../utils/render";
import {filter} from "../utils/filter";
import {isEscKeyPressed, sortByDate, sortByPrice, sortByTime} from "../utils/common";
import Point from "./point.js";
import PointNew from "./point-new.js";
import {SortType, UserAction, UpdateType, Filters} from "../consts/consts";
import EmptyView from "../view/empty/empty";


export default class Trip {
  constructor(tripContainer, pointsModel, optionsModel, filterModel) {
    this._tripContainer = tripContainer;
    this._pointsModel = pointsModel;
    this._optionsModel = optionsModel;
    this._filterModel = filterModel;

    this._pointsModel = pointsModel;
    this._optionsModel = optionsModel;

    this._isEscKeyPressed = isEscKeyPressed;

    this._pointPresenter = {};

    this._currentSortType = SortType.DAY;

    this._siteMainElement = document.querySelector(`.page-body`);
    this._siteRouteElement = this._siteMainElement.querySelector(`.trip-main`);
    this._siteControlsElement = this._siteMainElement.querySelector(`.trip-main__trip-controls h2:first-child`);
    this._siteFiltersElement = this._siteMainElement.querySelector(`.trip-main__trip-controls h2:nth-child(2)`);
    this._siteSortElement = this._siteMainElement.querySelector(`.trip-events`);

    this._formList = new FormListView();
    this._sortComponent = null;
    this._emptyComponent = null;
    this._filterPresenter = null;

    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);

    this._pointsModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);
    this._pointNewPresenter = new PointNew(this._formList, this._handleViewAction, this._getOptions(), this._getPoints());
  }

  _init() {
    if (this._pointsModel.getPoints().length === 0) {
      this._renderEmpty();
    } else {
      this._renderSort();
    }
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

  _getOptions() {
    return this._optionsModel.getOptions();
  }

  _render(where, what, position) {
    renderElement(where, what, position);
  }

  show(resetSort = true) {
    this._tripContainer.classList.remove(`visually-hidden`);

    if (resetSort) {
      this._clearRoute(true);
      this._init();
    }
  }

  hide() {
    this._tripContainer.classList.add(`visually-hidden`);
  }

  _renderSort() {
    if (this._sortComponent !== null) {
      this._sortComponent = null;
    }
    this._sortComponent = new SortView(this._currentSortType);
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);
    this._render(this._siteSortElement, this._sortComponent.getElement(), RenderPosition.BEFOREEND);
    this._renderFormList();
  }
  _renderFormList() {
    this._render(this._siteSortElement, this._formList.getElement(), RenderPosition.BEFOREEND);
    this._renderPointsList();
  }
  _createPoint() {
    this._currentSortType = SortType.DAY;
    this._filterModel.setFilter(UpdateType.MAJOR, Filters.EVERYTHING);
    this._pointNewPresenter.init();
  }
  _renderEmpty() {
    this._emptyComponent = new EmptyView();
    this._render(this._formList, this._emptyComponent, RenderPosition.BEFOREEND);
  }
  _renderPoint(point) {
    const pointPresenter = new Point(this._formList, this._handleViewAction, this._handleModeChange, this._getPoints(), this._getOptions());
    pointPresenter._init(point);
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

    remove(this._sortComponent);
    this._emptyComponent = null;
    this._filterPresenter = null;
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
        this._pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this._pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this._pointsModel.deletePoint(updateType, update);
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
        this._init();
        break;
      case UpdateType.MAJOR:
        this._clearRoute();
        this._currentSortType = SortType.DAY;
        this._init();
        break;
    }
  }

  _handleSortTypeChange(sortType) {
    if (this._currentSortType === sortType) {
      return;
    }
    this._currentSortType = sortType;
    this._getPoints();

    this._clearRoute();
    this._init();
  }
}
