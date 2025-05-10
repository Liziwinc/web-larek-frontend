import { createElement, ensureElement, formatNumber } from "../../utils/utils"; // Импорт утилитарных функций из модуля utils
import { Component } from "../base/Component"; // Импорт базового класса Component
import { EventEmitter } from "../base/events"; // Импорт класса EventEmitter для обработки событий

interface IBasket { // Интерфейс для данных корзины
  items: HTMLElement[]; // Список элементов корзины
  total: number; // Общая сумма корзины
}

export class Basket extends Component<IBasket> { // Класс Basket, наследующий Component с данными типа IBasket
  protected _list: HTMLElement; // Скрытое поле для списка элементов корзины
  protected _total: HTMLElement; // Скрытое поле для отображения общей суммы
  button: HTMLElement; // Кнопка для открытия заказа

  constructor(container: HTMLElement, protected events: EventEmitter) { // Конструктор принимает контейнер и объект событий
    super(container); // Вызов конструктора родительского класса

    this._list = ensureElement<HTMLElement>('.basket__list', this.container); // Инициализация списка корзины через ensureElement
    this._total = this.container.querySelector('.basket__price'); // Поиск элемента для отображения общей суммы
    this.button = this.container.querySelector('.basket__button'); // Поиск кнопки открытия заказа

    if (this.button) { // Проверка существования кнопки
      this.button.addEventListener('click', () => { // Добавление обработчика клика по кнопке
        events.emit('basket:submit'); // Отправка события "basket:submit" через EventEmitter
      });
    }

    this.items = []; // Инициализация списка элементов корзины пустым массивом
  }

  set items(items: HTMLElement[]) { // Сеттер для установки списка элементов корзины
    if (items.length) { // Если список не пустой
      this._list.replaceChildren(...items); // Заменяем содержимое списка новыми элементами
    } else { // Если список пуст
      this._list.replaceChildren(createElement<HTMLParagraphElement>('p', { // Добавляем элемент с текстом "Корзина пуста"
        textContent: 'Корзина пуста'
      }));
    }
  }

  set total(total: number) { // Сеттер для установки общей суммы
    this.setText(this._total, `${total} синапсов`); // Устанавливаем текст в элемент общей суммы
  }
}