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
abstract class Components { 
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
Назначение: Каталог товаров. Хранит список всех Product и выбранный для подробного просмотра товар.
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
Назначение: хранит локальную корзину IBasketItem[], обеспечивает добавление/удаление.

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
Назначение: хранит данные введенные на шагах оформления и проверяет их.

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

1. class BaseComponent
Назначение: Базовый класс для всех UI-компонентов.

Методы:
```
/** отрисовать разметку. */
render(container: HTMLElement): void 

/** показать/скрыть компонент. */
show(): void 
hide(): void 

/** привязать DOM-события. */
bindEvents(): void 
```

2. class CardComponent
Назначение: Отвечает за отрисовку карточки товара.

Методы:
```
Constructor: (product: IProduct, template: HTMLTemplateElement)

/** вставляет шаблон карточки (catalog / preview / basket). */
render(container: HTMLElement): void 

/** обновить данные (сменить кнопку при добавлении в корзину). */
update(product: IProduct): void 

/** на кнопку "Купить". */
bindEvents(): click 
```
3. class ModalComponent
Назначение: Универсальный модальный класс.

Методы:
```
Constructor: (template: HTMLTemplateElement)

/** добавить класс modal_active. */
open(): void

/** убрать modal_active. */
close(): void 

/** вставить в .modal__content. */
setContent(element: HTMLElement): void 

/** закрытие по клику вне или по кресту. */
bindCloseEvents(): void 
```
4. class ProductModalComponent extends ModalComponent
Назначение: Детальный просмотр товара.

Методы:
```
Constructor: (template: HTMLTemplateElement)

/** рендер через CardComponent и открыть. */
open(product: IProduct): void 

/** кнопки добавления в корзину. */
bindAdd(): void 
```
5. class BasketModalComponent extends ModalComponent
Назначение: Просмотр и управление корзиной.

Методы:
```
Constructor: (template: HTMLTemplateElement)

/** рендер списка компактных карточек. */
open(items: IBasketItem[]): void 

/** удаление товара из корзины. */
bindRemove(): void

/** обновление суммы. */
updateTotal(total: number): void 
```
6. class CheckoutStepComponent extends ModalComponent
Назначение: Шаги оформления заказа.

Методы:
```
Constructor: (template: HTMLTemplateElement, step: 1|2)

/** вставить форму и открыть. */
open(): void 

/** ввод полей, переключение кнопок. */
bindFormEvents(): void 

/** активация кнопки "Далее" или "Оплатить". */
validate(): void 
```
7. class SuccessModalComponent extends ModalComponent
Назначение: Сообщение об успешном заказе.

Методы:
```
Constructor: (template: HTMLTemplateElement)

/** подставить сумму и открыть. */
open(total: number): void 

/** кнопка "За новыми покупками!". */
bindClose(): void
```
## Описание событий
Для управления взаимодействием между данными и представлениями используется централизованный EventEmitter. 

### События от моделей данных

1. products:changed

Источник: ProductsModel
Данные события: обновлённый массив товаров items: IProduct[]
Действия: Очистить и заново отрисовать галерею товаров через GalleryComponent.render(items)

2. product:selected

Источник: ProductsModel
Данные события: выбранный товар product: IProduct
Действия: Вызвать ProductModalComponent.open(product) для показа детального попапа

3. basket:changed

Источник: BasketModel
Данные события: текущие элементы корзины items: IBasketItem[] и сумма total: number
Действия:
Обновить счётчик в шапке через HeaderComponent.updateCounter(items.length)
Если открыт попап корзины, вызвать BasketModalComponent.update(items, total)

4. checkout:step1:validated

Источник: CheckoutFormModel
Данные события: результат валидации valid: boolean
Действия: Активировать или деактивировать кнопку "Далее" на шаге 1 через CheckoutStepComponent.toggleNext(valid)

5. checkout:step2:validated

Источник: CheckoutFormModel
Данные события: результат валидации valid: boolean
Действия: Активировать или деактивировать кнопку "Оплатить" на шаге 2 через CheckoutStepComponent.togglePay(valid)

6. order:created

Источник: ответ API
Данные события: объект заказа и итоговая сумма { order: IOrderRequest, id: string, total: number }
Действия:
Вызвать SuccessModalComponent.open(total) для показа подтверждения
Очищать корзину через BasketModel.clear() и  запустить basket:changed

### События от компонентов представления

1. card:click

Источник: CardComponent (при клике на карточку)
Данные события: идентификатор товара productId: string
Действия: Вызвать ProductsModel.select(productId)

2. card:add

Источник: CardComponent (при клике "Купить")
Данные события: объект товара product: IProduct
Действия: Вызвать BasketModel.add(product)

3. basket:basketItem:remove

Источник: BasketModalComponent (при клике Удалить)
Данные события: идентификатор товара productId: string
Действия: Вызвать BasketModel.remove(productId)

4. header:basket:click

Источник: HeaderComponent (при клике на иконку корзины)
Действия: Вызвать BasketModalComponent.open(BasketModel.getItems(), BasketModel.getTotal())

5. checkout:step1:next

Источник: CheckoutStepComponent (шаг 1 — кнопка «Далее»)
Действия: Вызвать CheckoutFormModel.validateStep1()

6. checkout:step2:submit

Источник: CheckoutStepComponent (шаг 2 — кнопка «Оплатить»)
Действия: Вызвать CheckoutFormModel.validateStep2(). При true инициировать создание заказа через OrderAPI.create()

7. modal:close

Источник: любой ModalComponent (кнопка крестика или клик вне окна)
Действия: Вызвать ModalComponent.close() для текущего модального.


