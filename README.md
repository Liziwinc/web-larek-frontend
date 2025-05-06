# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Архитектура

Проект реализован на основе паттерна MVP (Model-View-Presenter)
Model  - хранит данные и управляет бизнес-логикой приложения
View  - отвечает за отображение данных на интерфейсе пользователя
Presenter - осуществляет взаимодействие между Model и View

## Описание данных
Тип оплаты: онлайн или при получении
```ts
type PaymentMethod = 'online' | 'cash';
```

Интерфейс товара
```ts
interface IProduct {
  id: string;
  /** Название товара */
  title: string;
  /** Описание товара */
  description: string;
  /** Ссылка на изображение */
  image: string;
  /** Категория товара */
  category: string;
  /** Цена товара или null, если «бесценный» */
  price: number | null;
}
```
Используется во всех компонентах, где нужно отобразить данные о товаре
— для карточек каталога и детальной карточки в попапе.

Интерфейс элемента корзины 
```ts
interface IBasketItem {
  /** Продукт */
  product: IProduct;
}
```
Используется для хранения локальной корзины пользователя


Интерфейс запроса создания заказа
```ts
interface IOrderRequest {
  /** Способ оплаты */
  payment: PaymentMethod;
  /** Почта покупателя */
  email: string;
  /** Телефон покупателя */
  phone: string;
  /** Адрес доставки */
  address: string;
  /** Общая сумма заказа (бесценные товары не учитываются) */
  total: number;
  /** Массив 'id' товаров */
  items: string[];
}
```
Используется при отправке POST /order на сервер.
## Базовый код 
1. **Класс EventEmitter**
Реализует паттерн «Наблюдатель» и позволяет подписываться на события и уведомлять подписчиков
о наступлении события.

```ts
export interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}

class EventEmitter implements IEvents {
    /** Установить обработчик на событие*/
    on<T extends object>(eventName: EventName, callback: (event: T) => void) {}

    /** Снять обработчик с события*/
    off(eventName: EventName, callback: Subscriber) {}

    /**Инициировать событие с данными*/
    emit<T extends object>(eventName: string, data?: T) {}

    /**Слушать все события*/
    onAll(callback: (event: EmitterEvent) => void) {}

    /** Сбросить все обработчики*/
    offAll() {}
    /** Сделать коллбек триггер, генерирующий событие при вызове*/
    trigger<T extends object>(eventName: string, context?: Partial<T>) {}
}
```
2. **Класс Api**
Класс, который реализует логику взаимодействия с API сервера.

```ts
 class Api {
    readonly baseUrl: string;
    protected options: RequestInit;
    constructor(baseUrl: string, options: RequestInit = {}) {}
    get(uri: string) {}
    post(uri: string, data: object, method: ApiPostMethods = 'POST') {}
    protected handleResponse(response: Response): Promise<object> {}
}
```
3. **Класс Component**
Абстрактный класс, который реализует логику взаимодействия с компонентами отображения.
```ts
abstract class Component<T> { 
    protected constructor(protected readonly container: HTMLElement) {}
    // Инструментарий для работы с DOM в дочерних компонентах

    // Переключить класс
    toggleClass(element: HTMLElement, className: string, force?: boolean) {}

    // Установить текстовое содержимое
    protected setText(element: HTMLElement, value: unknown) {}

    // Сменить статус блокировки
    setDisabled(element: HTMLElement, state: boolean) {}

    // Скрыть
    protected setHidden(element: HTMLElement) {}

    // Показать
    protected setVisible(element: HTMLElement) {}

    // Установить изображение с алтернативным текстом
    protected setImage(element: HTMLImageElement, src: string, alt?: string) {}

    // Вернуть корневой DOM-элемент
    render(data?: Partial<T>): HTMLElement {}
}
```
4. **Класс Model**
Абстрактный класс, который реализует основу чтобы можно было отличить ее от простых объектов с данными.
```ts
abstract class Model<T> {
    constructor(data: Partial<T>, protected events: IEvents) {}

    // Сообщить всем что модель поменялась
    emitChanges(event: string, payload?: object) {}
}
```

## Модели данных

1. **Класс ProductsModel**
Каталог товаров. Хранит список всех Product и выбранный для подробного просмотра товар.
Свойства:
```ts
/** Массив всех загруженных товаров. */
products: IProduct[]

/** Текущая карточка, открытая в попапе. */
selectedProduct: IProduct | null
```
Методы:
```ts
constructor(private emitter: EventEmitter) {}

/** Инициализация массива при загрузке с сервера. */
init(items: IProduct[]): void

/** Получить текущий список товаров. */
getAll(): IProduct[]

/** Отметить товар как selectedProduct (открыть попап). */
select(id: string): void

/** Сбросить selectedProduct (закрыть попап). */
clearSelection(): void
```

2. **Класс BasketModel**
Хранит локальную корзину IBasketItem[], обеспечивает добавление/удаление.

Свойства:
```ts
/** Массив товаров в корзине. */
items: IBasketItem[]
```
Методы:
```ts
constructor(private emitter: EventEmitter) {}

/** Инициализация */
init(items: IBasketItem[]): void

/** Добавить товар, если его там ещё нет.
Для price === null — не добавляем, кнопка должна быть заблокирована. */
add(product: IProduct): void

/** Удалить товар из корзины. */
remove(productId: string): void

/** Очистить корзину полностью. */
clear(): void

/** Вернуть копию текущего массива. */
getItems(): IBasketItem[]

/** Посчитать сумму всех цен. */
getTotal(): number
```

3. **Класс CheckoutFormModel**
Хранит данные введенные на шагах оформления и проверяет их.

Свойства:
```ts
payment: PaymentMethod | null /** (если не выбрал еще) */
email: string
phone: string
address: string
```
Методы:
``` ts
constructor(private emitter: EventEmitter) {}

/** меняет способ оплаты и валидирует что не null. */
setPayment(method: PaymentMethod): boolean 

/** Обновляет поле почта и валидирует. */
setEmail(email: string): boolean

/** обновляет поле телефон, валидирует. */
setPhone(phone: string): boolean

/** обновляет поле адрес, валидирует. */
setAddress(address: string): boolean

/** Сброс всех полей. */
reset(): void
```
## Компоненты представления 
1. **Page**
Компонент главной страницы: отображает счётчик товаров, каталог карточек и кнопку открытия корзины.

Конструктор:
```ts
container: HTMLElement //корневой контейнер страницы.
events: IEvents //объект для работы с событиями.
```
Атрибуты:
```ts
counter: HTMLElement //элемент для отображения количества товаров в корзине.
catalog: HTMLElement //контейнер для списка карточек.
basketBtn: HTMLButtonElement //кнопка открытия корзины.
wrapper: HTMLElement //обёртка всей страницы.
```
Сеттеры:
```ts
- `set count(value: number)` — обновляет текст счётчика.
- `set items(products: IProduct[])` — рендерит список товаров в каталоге.
```
События:
- По клику на `basketBtn` эмиттится событие `basket:open`.

2. **Modal**

**Описание:**
Управляет модальным окном: открытие, закрытие, вставка контента.

**Конструктор:**
- `container: HTMLElement` — контейнер модального окна.
- `events: IEvents` — объект для событий.

**Атрибуты:**
- `closeButton: HTMLButtonElement` — кнопка закрытия окна.
- `content: HTMLElement` — контейнер для вставки содержимого.

**Сеттеры:**
- `set body(data: IModal)` — устанавливает и рендерит переданный элемент.

**Методы:**
- `open()` — показывает модальное окно.
- `close()` — скрывает окно, очищает контент и эмиттит `modal:closed`.
- `render(data: IModal): HTMLElement` — возвращает переданный элемент для вставки.

---

## 3. Basket

**Описание:**
Отображает содержимое корзины внутри модального окна: список товаров, сумму и кнопку оформления.

**Конструктор:**
- `container: HTMLElement` — контейнер корзины.
- `events: IEvents` — объект для событий.

**Атрибуты:**
- `list: HTMLElement` — список товаров в корзине.
- `total: HTMLElement` — элемент показа общей суммы.
- `button: HTMLButtonElement` — кнопка начала оформления заказа.

**Сеттеры:**
- `set items(items: IBasketItem[])` — рендерит элементы корзины.
- `set totalSum(value: number)` — обновляет текст с общей суммой.
- `set disabled(state: boolean)` — блокирует/разблокирует кнопку оформления.

**События:**
- По клику на `button` эмиттится `order:start`.
- При рендере каждого товара эмиттится `basket:item:render`.

---

## 4. Form<T>

**Описание:**
Базовый класс для форм: валидация, отображение ошибок, управление кнопкой отправки.

**Конструктор:**
- `container: HTMLFormElement` — корневой элемент формы.
- `events: IEvents` — объект для событий.

**Атрибуты:**
- `error: HTMLElement` — элемент для вывода текстовых ошибок.
- `valid: boolean` — флаг валидности формы.
- `submitBtn: HTMLButtonElement` — кнопка отправки/далее.

**Методы:**
- `reset()` — сброс полей, ошибок и состояния кнопки.
- `render(data?: Partial<T>): HTMLFormElement` — возвращает форму.

**Сеттер:**
- `protected set validState(state: boolean)` — переключает состояние кнопки отправки.

---

## 5. Order

**Описание:**
Форма выбора способа оплаты и ввода адреса доставки.
Наследуется от `Form<{ payment: string; address: string }>`.

**Конструктор:**
- `container: HTMLFormElement` — шаблон формы.
- `events: IEvents` — объект для событий.

**Атрибуты:**
- `cashBtn: HTMLButtonElement` — кнопка «При получении».
- `cardBtn: HTMLButtonElement` — кнопка «Онлайн».
- `addressInput: HTMLInputElement` — поле ввода адреса.

**Сеттеры:**
- `set payment(method: 'cash' | 'online')` — визуально отмечает выбранный метод.
- `set address(value: string)` — заполняет поле адреса.

**Методы:**
- `selectPayment(method)` — эмиттит `order:setPayment` и обновляет UI.
- `validate()` — проверяет наличие непустого адреса, показывает ошибку и включает кнопку.

---

## 6. Contacts

**Описание:**
Форма ввода контактных данных (email и телефон).
Наследуется от `Form<{ email: string; phone: string }>`.

**Конструктор:**
- `container: HTMLFormElement` — шаблон формы.
- `events: IEvents` — объект для событий.

**Атрибуты:**
- `emailInput: HTMLInputElement` — поле ввода email.
- `phoneInput: HTMLInputElement` — поле ввода телефона.

**Сеттеры:**
- `set email(value: string)` — заполняет поле email.
- `set phone(value: string)` — заполняет поле телефона.

**Методы:**
- `validateEmail()` — проверка формата email.
- `validatePhone()` — проверка формата телефона.

---

## 7. Success

**Описание:**
Окно с сообщением об успешном оформлении заказа.

**Конструктор:**
- `container: HTMLElement` — шаблон содержимого.
- `events: IEvents` — объект для событий.

**Атрибуты:**
- `closeBtn: HTMLElement` — кнопка закрытия.
- `total: HTMLElement` — элемент для отображения суммы заказа.

**Сеттер:**
- `set orderTotal(value: number)` — устанавливает сумму в тексте.

**Метод:**
- `render(): HTMLElement` — возвращает готовый элемент.

---

## 8. Card

**Описание:**
Карточка товара для каталога или списка в корзине.

**Конструктор:**
- `container: HTMLElement` — шаблон карточки.
- `events: IEvents` — объект для событий.
- `action?: ICardAction` — опциональные колбэки для кнопок.

**Атрибуты:**
- `image: HTMLImageElement`
- `category: HTMLElement`
- `title: HTMLElement`
- `description: HTMLElement`
- `price: HTMLElement`
- `buyBtn: HTMLButtonElement`
- `deleteBtn?: HTMLButtonElement`

**Сеттеры:**
- `set data(product: IProduct)` — заполняет все поля (изображение, текст, цена), блокирует кнопку «Купить» если цена отсутствует.

**Геттер:**
- `get id(): string` — возвращает `dataset.id` контейнера.

**Метод:**
- `render(data: IProduct): HTMLElement` — заполняет данные и возвращает контейнер.

---

## 9. CardPreview

**Описание:**
Компонент предварительного просмотра карточки, используется в модальном всплывающем окне подробностей товара.

**Конструктор:**
- `container: HTMLElement` — корневой контейнер превью.
- `events: IEvents` — объект для событий.

**Атрибуты:**
- `image: HTMLImageElement` — крупное изображение товара.
- `title: HTMLElement` — заголовок товара.
- `description: HTMLElement` — полное описание товара.
- `price: HTMLElement` — отображение цены или текста «Бесценно».
- `closeBtn: HTMLButtonElement` — кнопка закрытия превью.
- `buyBtn: HTMLButtonElement` — кнопка добавления в корзину.

**Сеттеры:**
- `set data(product: IProduct)` — заполняет все поля данными товара.
- `set disabled(state: boolean)` — блокирует/разблокирует кнопку покупки.

**Методы:**
- `render(data: IProduct): HTMLElement` — возвращает заполненный элемент превью.
- `open(): void` — отображает превью (если скрыто).
- `close(): void` — скрывает превью.

**События:**
- По клику на `buyBtn` эмиттится `card:buy`.
- По клику на `closeBtn` эмиттится `modal:closed`.
