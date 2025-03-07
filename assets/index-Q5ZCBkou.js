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
function $(selector, scope = document) {
  if (!selector) throw "no selector";
  return scope.querySelector(selector);
}
const restaurants = [
  {
    category: "korean",
    categoryAlt: "한식",
    title: "피양콩할머니",
    distance: "10",
    description: "평양 출신의 할머니가 수십 년간 운영해온 비지 전문점 피양콩 할마니. 두부를 빼지 않은 되비지를 맛볼 수 있는 곳으로, '피양'은 평안도 사투리로 '평양'을 의미한다. 딸과 함께 운영하는 이곳에선 맷돌로 직접 간 콩만을 사용하며, 일체의 조미료를 넣지 않은 건강식을 선보인다. 콩비지와 피양 만두가 이곳의 대표 메뉴지만, 할머니가 옛날 방식을 고수하며 만들어내는 비지전골 또한 이 집의 역사를 느낄 수 있는 특별한 메뉴다. 반찬은 손님들이 먹고 싶은 만큼 덜어 먹을 수 있게 준비돼 있다."
  },
  {
    category: "chinese",
    categoryAlt: "중식",
    title: "친친",
    distance: "5",
    description: "Since 2004 편리한 교통과 주차, 그리고 관록만큼 깊은 맛과 정성으로 정통 중식의 세계를 펼쳐갑니다"
  },
  {
    category: "japanese",
    categoryAlt: "일식",
    title: "잇쇼우",
    distance: "10",
    description: "잇쇼우는 정통 자가제면 사누끼 우동이 대표메뉴입니다. 기술은 정성을 이길 수 없다는 신념으로 모든 음식에 최선을 다하는 잇쇼우는 고객 한분 한분께 최선을 다하겠습니다"
  },
  {
    category: "western",
    categoryAlt: "양식",
    title: "이태리키친",
    distance: "20",
    description: "늘 변화를 추구하는 이태리키친입니다."
  },
  {
    category: "asian",
    categoryAlt: "아시안",
    title: "호아빈 삼성점",
    distance: "15",
    description: "푸짐한 양에 국물이 일품인 쌀국수"
  },
  {
    category: "etc",
    categoryAlt: "기타",
    title: "도스타코스 선릉점",
    distance: "5",
    description: "멕시칸 캐주얼 그릴"
  }
];
const modalHandler = () => {
  const $modalOpenButton = $(".gnb__button");
  const $modalContainer = $("#restaurant-modal");
  const $closeButton = $(".button--secondary");
  const $modalBackdrop = $(".modal-backdrop");
  const toggleModal = () => {
    $modalContainer.classList.toggle("modal--open");
  };
  $modalOpenButton.addEventListener("click", toggleModal);
  $closeButton.addEventListener("click", toggleModal);
  $modalBackdrop.addEventListener("click", toggleModal);
};
const text = (props = {}) => {
  const {
    tag = "span",
    size = "medium",
    color = "black",
    children = "",
    className
  } = props;
  const sizeStyle = {
    large: "text-subtitle",
    medium: "text-body"
  };
  const colorStyle = {
    orange: "primary-color",
    red: ""
    //TODO: 에러메세지 추가 시 새로 추가
  };
  return `
       <${tag} class="${colorStyle[color] || ""} ${sizeStyle[size] || ""}">
         ${children}
       </${tag}>
    `;
};
const restaurantItem = (props) => {
  const { category, categoryAlt, title, distance, description: description2 } = props;
  return `
    <li class="restaurant">
      <div class="restaurant__category">
        <img
          src="/category-${category}.png"
          alt="${categoryAlt}"
          class="category-icon"
        />
      </div>
      
      <div class="restaurant__info">
        ${text({ tag: "h3", size: "large", children: title })}
        ${text({
    tag: "span",
    size: "medium",
    color: "orange",
    children: `캠퍼스부터 ${distance}분 내`
  })}
        <p class="restaurant__description text-body">
          ${description2}
        </p>
      </div>
    </li>
  `;
};
const restaurantList = () => {
  const $restaurantContainer = $(".restaurant-list");
  $restaurantContainer.innerHTML = restaurants.map((restaurant) => restaurantItem(restaurant)).join("");
  return $restaurantContainer;
};
const button = (props) => {
  const { type, onClick, id, className, children } = props;
  const style = {
    primary: "button--primary",
    secondary: "button--secondary"
  };
  return `<button
    type=${type}
    id=${id}
    class="button ${style[className]} text-caption"
  >
    ${children}
  </button>
  `;
};
const ERROR = Object.freeze({
  INVALID_INPUT_REQUIRED: "필수 입력값을 입력해주세요.",
  INVALID_EMPTY_INPUT: "공백은 입력할 수 없습니다.",
  INVALID_INPUT_LENGTH: (length) => `${length}자 이하로 입력해주세요.`
});
const buttonHandler = (event) => {
  event.preventDefault();
  const $form = event.target.closest("form");
  const $category = $("#category");
  const $name = $("#name");
  const $distance = $("#distance");
  const $description = $("#description");
  const $link = $("#link");
  const newRestaurant = {
    category: $category.value,
    title: $name.value,
    distance: $distance.value,
    description: $description.value,
    link: $link.value
  };
  if (!newRestaurant.category || !newRestaurant.title || !newRestaurant.distance) {
    alert(ERROR.INVALID_INPUT_REQUIRED);
    return;
  }
  restaurants.push(newRestaurant);
  const $restaurantModal = $("#restaurant-modal");
  $restaurantModal.classList.remove("modal--open");
  $form.reset();
  restaurantList();
};
const buttonContainer = () => {
  const $buttonContainer = $(".button-container");
  $buttonContainer.innerHTML = `
      ${button({
    type: "button",
    id: "cancel-button",
    className: "secondary",
    children: "취소하기"
  })}
      ${button({
    type: "button",
    id: "add-button",
    className: "primary",
    children: "추가하기"
  })}
    
  `;
  const $addButton = $("#add-button");
  $("#cancel-button");
  $addButton.addEventListener("click", buttonHandler);
};
const dropDown = (props) => {
  const { id, isRequired, labelText, options } = props;
  const required = isRequired ? "required" : "";
  return `
    <label for=${id} text-caption">${labelText}</label>
    <select name=${id} id=${id} ${required}>
     ${options.map((option) => {
    return `<option value=${option.value}>${option.text}</option>`;
  })}
    </select>
    `;
};
const distanceOptions = [
  {
    value: "",
    text: "선택해 주세요"
  },
  {
    value: "5",
    text: "5분 내"
  },
  {
    value: "10",
    text: "10분 내"
  },
  {
    value: "15",
    text: "15분 내"
  },
  {
    value: "20",
    text: "20분 내"
  },
  {
    value: "30",
    text: "30분 내"
  }
];
const categoryOptions = [
  {
    value: "",
    text: "선택해 주세요"
  },
  {
    value: "korean",
    text: "한식"
  },
  {
    value: "chinese",
    text: "중식"
  },
  {
    value: "japanese",
    text: "일식"
  },
  {
    value: "western",
    text: "양식"
  },
  {
    value: "asian",
    text: "아시안"
  },
  {
    value: "etc",
    text: "기타"
  }
];
const categorySelect = () => {
  const $categorySelectContainer = $(".category-select");
  $categorySelectContainer.innerHTML = `
    ${dropDown({
    id: "category",
    labelText: "카테고리",
    options: categoryOptions,
    isRequired: true
  })}
  `;
  return $categorySelectContainer;
};
const textArea = (props) => {
  const {
    labelText,
    id,
    cols = "30",
    rows = "5",
    spanText,
    isRequired = false
  } = props;
  const required = isRequired ? "required" : "";
  return `
    <label for=${id} text-caption">${labelText}</label>
    <textarea
    name=${id}
    id=${id}
    cols=${cols}
    rows=${rows}
    ${required}
    maxLength= "1000"
    ></textarea>
    <span class="help-text text-caption">${spanText}</span>
    `;
};
const description = () => {
  const $descriptionContainer = $(".description-area");
  $descriptionContainer.addEventListener("input", (event) => {
    if (event.target.value > 1e3) {
      alert(() => ERROR.INVALID_INPUT_LENGTH(1e3));
    }
  });
  $descriptionContainer.innerHTML = `
  ${textArea({
    labelText: "설명",
    id: "description",
    spanText: "메뉴 등 추가 정보를 입력해 주세요."
  })}
  `;
  return $descriptionContainer;
};
const distanceSelect = () => {
  const $distanceSelectContainer = $(".distance-select");
  $distanceSelectContainer.innerHTML = `
    ${dropDown({
    id: "distance",
    labelText: "거리(도보 이동 시간)",
    options: distanceOptions,
    isRequired: true
  })}
  `;
  return $distanceSelectContainer;
};
const input = (props) => {
  const { labelText, id, isRequired = false, spanText = "" } = props;
  const required = isRequired ? "required" : "";
  return `
        <label for="${id} text-caption">${labelText}</label>
        <input type="text" name=${id} id=${id} ${required} maxLength='20'/>
        <span class="help-text text-caption">${spanText}</span>
    `;
};
const linkInput = () => {
  const $linkInputContainer = $(".link-input");
  $linkInputContainer.addEventListener("input", (event) => {
    const inputValue = event.target.value;
    if (inputValue.length > 300) {
      alert(() => ERROR.INVALID_INPUT_LENGTH(300));
    }
  });
  $linkInputContainer.innerHTML = `
    ${input({
    id: "link",
    labelText: "참고 링크",
    spanText: "매장 정보를 확인할 수 있는 링크를 입력해 주세요."
  })}
  `;
  return $linkInputContainer;
};
const nameInput = () => {
  const $inputContainer = $(".name-input");
  $inputContainer.innerHTML = `
    ${input({
    id: "name",
    labelText: "이름",
    isRequired: true
  })}
`;
  $inputContainer.addEventListener("input", (event) => {
    if (event.target.value.length > 20) {
      alert(() => ERROR.INVALID_INPUT_LENGTH(20));
    }
  });
  $inputContainer.addEventListener("change", (event) => {
    if (event.target.value.trim() === "") {
      alert(ERROR.INVALID_EMPTY_INPUT);
      event.target.value = "";
    }
  });
  return $inputContainer;
};
const renderMainPage = () => {
  restaurantList();
  buttonContainer();
  nameInput();
  linkInput();
  distanceSelect();
  categorySelect();
  description();
};
const eventHandler = () => {
  modalHandler();
};
const render = () => {
  renderMainPage();
};
render();
eventHandler();
