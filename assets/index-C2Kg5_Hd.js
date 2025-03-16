var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const debounce = (callback) => {
  let id = -1;
  return () => {
    cancelAnimationFrame(id);
    id = requestAnimationFrame(callback);
  };
};
function Core() {
  const options = {
    currentStateKey: 0,
    renderCount: 0,
    states: [],
    root: null,
    rootComponent: null
  };
  function useState2(initialState) {
    const { currentStateKey: key, states } = options;
    if (states.length === key) states.push(initialState);
    const state = states[key];
    const setState = (newState) => {
      if (newState === state) return;
      states[key] = newState;
      _render();
    };
    options.currentStateKey += 1;
    return [state, setState];
  }
  const _render = debounce(() => {
    const { root, rootComponent } = options;
    if (!root || !rootComponent) return;
    root.innerHTML = rootComponent();
    options.currentStateKey = 0;
    options.renderCount += 1;
  });
  function render2(rootComponent, root) {
    options.root = root;
    options.rootComponent = rootComponent;
    _render();
  }
  return { useState: useState2, render: render2 };
}
const { useState, render } = Core();
function $(selector, scope = document) {
  return scope.querySelector(selector);
}
function $$(selector, scope = document) {
  if (!selector) throw new Error("Selector is not selected");
  return scope.querySelectorAll(selector);
}
const parseAttribute = (attribute) => {
  return Object.entries(attribute).map(
    ([key, value]) => typeof value === "boolean" ? value === true ? `${key}` : "" : `${key}="${value}"`
  ).join(" ");
};
function Select(props) {
  const { attribute, children } = props;
  return `
    <select ${parseAttribute(attribute)}>
      ${children}
    </select>
  `;
}
function Option(props) {
  const { options, selectedValue } = props;
  return `
    ${options.map(
    (option) => `
        <option value="${option.value}" ${option.value === selectedValue ? "selected" : ""}>${option.label}</option>
      `
  ).join("")}
  `;
}
Select.Option = Option;
class EventManager {
  constructor(element) {
    __publicField(this, "element");
    this.element = element;
  }
  addEvent(eventType, selector, callback) {
    const children = [...$$(selector, this.element)];
    const isTarget = (element) => children.includes(element) || element.closest(selector);
    this.element.addEventListener(eventType, (event) => {
      if (isTarget(event.target)) callback(event);
    });
  }
}
const CATEGORIES = [
  { value: "전체", label: "전체" },
  { value: "한식", label: "한식" },
  { value: "중식", label: "중식" },
  { value: "일식", label: "일식" },
  { value: "양식", label: "양식" },
  { value: "아시안", label: "아시안" },
  { value: "기타", label: "기타" }
];
const DISTANCE_OPTIONS = [
  { value: "5", label: "5분 내" },
  { value: "10", label: "10분 내" },
  { value: "15", label: "15분 내" },
  { value: "20", label: "20분 내" },
  { value: "30", label: "30분 내" }
];
const CategorySelect = (props) => {
  const { handleCategoryChange, category } = props;
  const eventManager = new EventManager($("#app"));
  eventManager.addEvent("change", "#category-filter", (e) => {
    const target = e.target;
    handleCategoryChange(target.value);
  });
  return Select({
    attribute: {
      id: "category-filter",
      class: "restaurant-filter",
      name: "category",
      value: category
    },
    children: Select.Option({
      options: CATEGORIES,
      selectedValue: category
    })
  });
};
const SORTING_OPTIONS = [
  { value: "name", label: "이름순" },
  { value: "distance", label: "거리순" }
];
const SortingSelect = (props) => {
  const { handleSortChange, sorting } = props;
  const eventManager = new EventManager($("#app"));
  eventManager.addEvent("change", "#sorting-filter", (e) => {
    const target = e.target;
    handleSortChange(target.value);
  });
  return Select({
    attribute: {
      id: "sorting-filter",
      class: "restaurant-filter",
      name: "sorting"
    },
    children: Select.Option({
      options: SORTING_OPTIONS,
      selectedValue: sorting
    })
  });
};
const FilterSection = ({ setFilterOptions }) => {
  const [category, setCategory] = useState("전체");
  const [sorting, setSorting] = useState("name");
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setFilterOptions({ category: newCategory, sorting });
  };
  const handleSortChange = (newSorting) => {
    setSorting(newSorting);
    setFilterOptions({ category, sorting: newSorting });
  };
  return `
    <section class="restaurant-filter-container">
      ${CategorySelect({
    handleCategoryChange,
    category
  })}
      ${SortingSelect({
    handleSortChange,
    sorting
  })}
    </section>
  `;
};
function useBoolean(initialValue) {
  const [value, setValue] = useState(initialValue);
  const setTrue = () => {
    setValue(true);
  };
  const setFalse = () => {
    setValue(false);
  };
  return [value, setTrue, setFalse];
}
function useModal(initialValue) {
  const [isOpen, setIsOpen, setIsClose] = useBoolean(initialValue);
  const open = () => {
    setIsOpen();
  };
  const close = () => {
    setIsClose();
  };
  return [isOpen, open, close];
}
function Button(props) {
  const { children, attribute } = props;
  return `
    <button ${attribute ? parseAttribute(attribute) : ""}>${children}</button>
  `;
}
function Modal(props) {
  const { children, attribute } = props;
  return `
      <div ${attribute ? parseAttribute(attribute) : 'class="modal modal--open"'} >
        <div class="modal-backdrop"></div>
        <div class="modal-container">
          ${children}
        </div>
      </div>

  `;
}
const STORAGE_KEY = "restaurant";
const ERROR_MESSAGE = Object.freeze({
  SAVE_LOCAL_STORAGE: "로컬 스토리지에 데이터를 저장하는 중 오류가 발생했습니다.",
  GET_LOCAL_STORAGE: "로컬 스토리지에 데이터를 가져오는 중 오류가 발생했습니다."
});
const saveStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error(ERROR_MESSAGE.SAVE_LOCAL_STORAGE);
  }
};
const getStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error(ERROR_MESSAGE.GET_LOCAL_STORAGE);
    return null;
  }
};
function useRestaurantForm() {
  const addRestaurant = (formData) => {
    const existingRestaurants = getStorage() || [];
    const newRestaurant = {
      category: formData.get("category"),
      name: formData.get("name"),
      distance: formData.get("distance"),
      description: formData.get("description"),
      link: formData.get("link"),
      isFavorite: false
    };
    const updatedRestaurants = [...existingRestaurants, newRestaurant];
    saveStorage(updatedRestaurants);
  };
  return { addRestaurant };
}
function Input(props) {
  const { attribute } = props;
  return `
    <input ${attribute ? parseAttribute(attribute) : ""} />
  `;
}
function RestaurantForm(props) {
  const { closeModal } = props;
  const eventManager = new EventManager($("#app"));
  const { addRestaurant } = useRestaurantForm();
  eventManager.addEvent("submit", "form", (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    addRestaurant(formData);
    closeModal();
    window.location.reload();
  });
  return `
    <form>
      <div class="form-item form-item--required">
        <label for="category" class="text-caption">카테고리</label>
        ${Select({
    attribute: {
      id: "category",
      class: "category-select",
      name: "category",
      required: true
    },
    children: Select.Option({
      options: [{ value: "", label: "선택해 주세요" }, ...CATEGORIES],
      selectedValue: ""
    })
  })}
      </div>

      <div class="form-item form-item--required">
        <label for="name" class="text-caption">이름</label>
        ${Input({
    attribute: {
      type: "text",
      name: "name",
      id: "name",
      class: "form-item__input",
      required: true
    }
  })}
      </div>

      <div class="form-item form-item--required">
        <label for="distance" class="text-caption">거리(도보 이동 시간)</label>
        ${Select({
    attribute: {
      id: "distance",
      class: "distance-select",
      name: "distance",
      required: true
    },
    children: Select.Option({
      options: [
        { value: "", label: "선택해 주세요" },
        ...DISTANCE_OPTIONS
      ],
      selectedValue: ""
    })
  })}
      </div>

      <div class="form-item">
        <label for="description" class="text-caption">설명</label>
        <textarea name="description" id="description" cols="30" rows="5"></textarea>
        <span class="help-text text-caption">메뉴 등 추가 정보를 입력해 주세요.</span>
      </div>

      <div class="form-item">
        <label for="link" class="text-caption">참고 링크</label>
        ${Input({
    attribute: {
      type: "text",
      name: "link",
      id: "link",
      class: "form-item__input"
    }
  })}
        <span class="help-text text-caption">매장 정보를 확인할 수 있는 링크를 입력해 주세요.</span>
      </div>

      <div class="button-container">
        ${Button({
    children: "취소하기",
    attribute: {
      type: "button",
      class: "button button--secondary text-caption",
      id: "cancel-button"
    }
  })}
        ${Button({
    children: "추가하기",
    attribute: {
      type: "submit",
      class: "button button--primary text-caption"
    }
  })}
      </div>
    </form>
  `;
}
function Header() {
  const [isModalOpen, openModal, closeModal] = useModal(false);
  const eventManager = new EventManager($("#app"));
  eventManager.addEvent("click", ".gnb__button", () => {
    openModal();
  });
  eventManager.addEvent("click", "#cancel-button", () => {
    closeModal();
  });
  return `
    <header class="gnb">
      <h1 class="gnb__title text-title">점심 뭐 먹지</h1>
      ${Button({
    children: '<img src="./add-button.png" alt="음식점 추가" />',
    attribute: {
      type: "button",
      class: "gnb__button",
      "aria-label": "음식점 추가"
    }
  })}
    </header>
    ${isModalOpen ? Modal({
    children: `
              <h2 class="modal-title text-title">새로운 음식점</h2>
              ${RestaurantForm({
      closeModal
    })}
            `
  }) : ""}
  `;
}
const TAB = Object.freeze({
  ALL: "all",
  FAVORITE: "favorite"
});
function useTab(initialTab) {
  const [tab, setTab] = useState(initialTab);
  const setTabAll = () => {
    setTab(TAB.ALL);
  };
  const setTabFavorite = () => {
    setTab(TAB.FAVORITE);
  };
  return [tab, setTabAll, setTabFavorite];
}
const useTabChange = () => {
  const [tab, setTabAll, setTabFavorite] = useTab(TAB.ALL);
  const handleTabChange = (newTab) => {
    newTab === TAB.ALL ? setTabAll() : setTabFavorite();
  };
  return { tab, handleTabChange };
};
function NavTab({ setCurrentTab }) {
  const { tab, handleTabChange } = useTabChange();
  const eventManager = new EventManager($("#app"));
  eventManager.addEvent("click", "#nav-tab-1", () => {
    handleTabChange(TAB.ALL);
    setCurrentTab(TAB.ALL);
  });
  eventManager.addEvent("click", "#nav-tab-2", (e) => {
    e.stopPropagation();
    handleTabChange(TAB.FAVORITE);
    setCurrentTab(TAB.FAVORITE);
  });
  return `
    <nav class="nav-tab">
      <div class="nav-tab__container">
        <input id="nav-tab-1" class="nav-tab-item" name="nav-tab" type="radio" ${tab === TAB.ALL ? "checked" : ""}  />
        
        <label class="nav-tab-item-label" for="nav-tab-1">모든 음식점</label>
        <input id="nav-tab-2" class="nav-tab-item" name="nav-tab" type="radio" ${tab === TAB.FAVORITE ? "checked" : ""} />
        
        <label class="nav-tab-item-label" for="nav-tab-2">자주 가는 음식점</label>
      </div>
      <div class="nav-tab-item-underline" data-selected-tab=${tab === TAB.ALL ? "0" : "1"}></div>
    </nav>
  `;
}
const CATEGORY_IMAGES = {
  전체: "",
  한식: "./category-korean.png",
  중식: "./category-chinese.png",
  일식: "./category-japanese.png",
  양식: "./category-western.png",
  아시안: "./category-asian.png",
  기타: "./category-etc.png"
};
const ICON_IMAGES = {
  FAVORITE: "./Ic_favorite_filled.png",
  UNFAVORITE: "./Ic_favorite_lined.png"
};
const useFavorite = () => {
  const handleFavoriteToggle = (name, isFavorite, setFavorite) => {
    const storedRestaurants = getStorage() || [];
    const newFavoriteState = !isFavorite;
    const updatedRestaurants = storedRestaurants.map(
      (restaurant) => restaurant.name === name ? { ...restaurant, isFavorite: newFavoriteState } : restaurant
    );
    saveStorage(updatedRestaurants);
    setFavorite(newFavoriteState);
  };
  return {
    handleFavoriteToggle
  };
};
const BottomSheet = (props) => {
  const {
    category,
    name,
    distance,
    description,
    link,
    favorite,
    onClose,
    handleFavoriteToggle,
    buttonId,
    setFavorite
  } = props;
  const eventManager = new EventManager($("#app"));
  eventManager.addEvent("click", ".modal-backdrop", () => {
    onClose();
  });
  eventManager.addEvent(
    "click",
    "#bottom-sheet-restaurant-delete-button",
    () => {
      const storedRestaurants = getStorage() || [];
      const updatedRestaurants = storedRestaurants.filter(
        (restaurant) => restaurant.name !== name
      );
      saveStorage(updatedRestaurants);
      onClose();
    }
  );
  eventManager.addEvent(
    "click",
    "#bottom-sheet-restaurant-close-button",
    () => {
      onClose();
    }
  );
  eventManager.addEvent("click", `#${buttonId}`, () => {
    handleFavoriteToggle(name, favorite, setFavorite);
  });
  return `
    <div class="modal modal--open">
      <div class="modal-backdrop"></div>  
      <div class="modal-container">
        <div class="bottom-sheet-layout">
          <div class="bottom-sheet-restaurant-container">
            <div class="restaurant__category">
              <img
                src="${CATEGORY_IMAGES[category]}"
                alt="한식"
                class="bottom-sheet-restaurant-category-icon"
              />
            </div>
            <div class="bottom-sheet-restaurant-info">
              <h3 class="restaurant__name">${name}</h3>
              <span class="restaurant__distance">캠퍼스부터 ${distance}분 내</span>
            </div>
          </div>
          <div class="bottom-sheet-restaurant-favorite-button-container">
            ${Button({
    attribute: {
      id: buttonId,
      class: "restaurant__favorite-button"
    },
    children: `<img src="${favorite ? ICON_IMAGES.FAVORITE : ICON_IMAGES.UNFAVORITE}" alt="favorite" />`
  })}
          </div>
        </div>
        <div class="bottom-sheet-restaurant-description">
          <p class="bottom-sheet-restaurant__description">
            ${description}
          </p>
        </div>
        <div class="bottom-sheet-restaurant-link-container">
          <a href="${link}" class="bottom-sheet-restaurant__link">
            ${link || ""}
          </a>
        </div>
        <div class="bottom-sheet-restaurant-button-container">
          ${Button({
    attribute: {
      type: "button",
      id: "bottom-sheet-restaurant-delete-button",
      class: "button button--secondary text-caption"
    },
    children: "삭제하기"
  })}
          ${Button({
    attribute: {
      type: "button",
      id: "bottom-sheet-restaurant-close-button",
      class: "button button--primary text-caption"
    },
    children: "닫기"
  })}
        </div>
      </div>
    </div>
  `;
};
const Restaurant = (props) => {
  const { category, name, distance, description, link, isFavorite } = props;
  const [favorite, setFavorite] = useState(isFavorite);
  const [isBottomSheetOpen, openBottomSheet, closeBottomSheet] = useModal(false);
  const { handleFavoriteToggle } = useFavorite();
  const eventManager = new EventManager($("#app"));
  const buttonId = `favorite-${crypto.randomUUID()}`;
  const restaurantId = `restaurant-${crypto.randomUUID()}`;
  eventManager.addEvent("click", `#${restaurantId}`, () => {
    openBottomSheet();
  });
  eventManager.addEvent("click", `#${buttonId}`, () => {
    handleFavoriteToggle(name, isFavorite, setFavorite);
  });
  return `
    <li class="restaurant">
      <div id="${restaurantId}" class="restaurant__container">
      <div class="restaurant__category">
        <img
          src="${CATEGORY_IMAGES[category]}"
          alt="${category}"
          class="category-icon"
        />
      </div>
      <div class="restaurant__info">
        <div class="restaurant__favorite-container">
          <h3 class="restaurant__name text-subtitle">${name}</h3>
          
        </div>
        <span class="restaurant__distance text-body">
          캠퍼스부터 ${distance}분 내
        </span>
        <p class="restaurant__description text-body">
          ${description}
        </p>
      </div>
      </div>
      ${Button({
    attribute: {
      id: buttonId,
      class: "restaurant__favorite-button"
    },
    children: `<img src="${favorite ? ICON_IMAGES.FAVORITE : ICON_IMAGES.UNFAVORITE}" alt="favorite" />`
  })}
    </li>
    ${isBottomSheetOpen ? BottomSheet({
    favorite,
    category,
    name,
    distance,
    description,
    link,
    onClose: () => {
      closeBottomSheet();
    },
    handleFavoriteToggle: () => {
      handleFavoriteToggle(name, favorite, setFavorite);
    },
    buttonId,
    setFavorite
  }) : ""}
  `;
};
const RestaurantList = (props) => {
  const { restaurants } = props;
  return `
    <ul class="restaurant-list">
      ${restaurants == null ? void 0 : restaurants.map(
    (restaurant) => Restaurant({
      ...restaurant
    })
  ).join("")}
    </ul>
  `;
};
const useRestaurants = (category, sorting) => {
  const getFilteredRestaurants = () => {
    var _a;
    let filtered = category === "전체" ? getStorage() : (_a = getStorage()) == null ? void 0 : _a.filter(
      (restaurant) => restaurant.category === category
    );
    return filtered == null ? void 0 : filtered.sort((a, b) => {
      if (sorting === "name") {
        return a.name.localeCompare(b.name);
      }
      return a.distance - b.distance;
    });
  };
  return { getFilteredRestaurants };
};
function App() {
  var _a;
  const [currentTab, setCurrentTab] = useState(TAB.ALL);
  const [filterOptions, setFilterOptions] = useState({
    category: "전체",
    sorting: "name"
  });
  const { getFilteredRestaurants } = useRestaurants(
    filterOptions.category,
    filterOptions.sorting
  );
  return `
    <div>
      ${Header()}
      ${NavTab({ setCurrentTab })}
      ${currentTab === TAB.ALL ? `
            ${FilterSection({
    setFilterOptions
  })}
            ${RestaurantList({
    restaurants: getFilteredRestaurants() ?? []
  })}
          ` : `
            ${RestaurantList({
    restaurants: ((_a = getStorage()) == null ? void 0 : _a.filter((restaurant) => restaurant.isFavorite)) ?? []
  })}
          `}
    </div>
  `;
}
const RESTAURANT_INFO = [
  {
    category: "한식",
    name: "피양콩할마니",
    distance: 10,
    description: "평양 출신의 할머니가 수십 년간 운영해온 비지 전문점 피양콩 할마니. 두부를 빼지 않은 되비지를 맛볼 수 있는 곳으로, '피양'은 평안도 사투리로 '평양'을 의미한다. 딸과 함께 운영하는 이곳에선 맷돌로 직접 간 콩만을 사용하며, 일체의 조미료를 넣지 않은 건강식을 선보인다. 콩비지와 피양 만두가 이곳의 대표 메뉴지만, 할머니가 옛날 방식을 고수하며 만들어내는 비지전골 또한 이 집의 역사를 느낄 수 있는 특별한 메뉴다. 반찬은 손님들이 먹고 싶은 만큼 덜어 먹을 수 있게 준비돼 있다.",
    isFavorite: false
  },
  {
    category: "중식",
    name: "친친",
    distance: 5,
    description: "Since 2004 편리한 교통과 주차, 그리고 관록만큼 깊은 맛과 정성으로 정통 중식의 세계를 펼쳐갑니다",
    isFavorite: false
  },
  {
    category: "일식",
    name: "잇쇼우",
    distance: 10,
    description: "잇쇼우는 정통 자가제면 사누끼 우동이 대표메뉴입니다. 기술은 정성을 이길 수 없다는 신념으로 모든 음식에 최선을 다하는 잇쇼우는 고객 한분 한분께 최선을 다하겠습니다",
    isFavorite: false
  },
  {
    category: "양식",
    name: "이태리키친",
    distance: 20,
    description: "늘 변화를 추구하는 이태리키친입니다.",
    isFavorite: false
  },
  {
    category: "아시안",
    name: "호아빈 삼성점",
    distance: 15,
    description: "푸짐한 양에 국물이 일품인 쌀국수",
    isFavorite: true
  },
  {
    category: "기타",
    name: "도스타코스 선릉점",
    distance: 5,
    description: "멕시칸 캐주얼 그릴",
    isFavorite: false
  }
];
const initializeData = () => {
  const existingRestaurants = getStorage();
  if (!existingRestaurants) {
    saveStorage(RESTAURANT_INFO);
  }
};
const initialize = () => {
  initializeData();
  render(App, $("#app"));
};
initialize();
