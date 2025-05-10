import { IOrderRequest } from "../types"; // Импорт типа данных для формы заказа
import { ensureAllElements } from "../utils/utils"; // Импорт утилиты для обеспечения всех элементов
import { IEvents } from "./base/events"; // Импорт интерфейса событий
import { Form } from "./common/Form"; // Импорт класса формы

// Класс для обработки формы заказа
export class Order extends Form<IOrderRequest> {
  protected _buttons: HTMLButtonElement[]; // Массив кнопок выбора способа оплаты

  constructor(container: HTMLFormElement, events: IEvents) {
      super(container, events); // Вызов конструктора родительского класса для инициализации формы

      this._buttons = ensureAllElements<HTMLButtonElement>('.button_alt', container); // Получение всех кнопок с классом '.button_alt'

      // Привязка обработчиков событий к кнопкам выбора оплаты
      this._buttons.forEach(button => {
          button.addEventListener('click', () => {
            this.payment = button.name; // Установка значения оплаты на основе имени кнопки
            events.emit('payment:change', button); // Эмитирование события изменения способа оплаты
          });
      });
  }

  // Сеттер для установки активной кнопки оплаты
  set payment(name: string) {
    this._buttons.forEach(button => {
      this.toggleClass(button, 'button_alt-active', button.name === name); // Добавление/удаление класса активности на кнопках
    });
  }

  // Сеттер для установки значения поля "address" в форме
  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value = value; // Установка значения в input с именем 'address'
  }

  reset() {
    this._buttons.forEach(button => this.toggleClass(button, 'button_alt-active', false));
    const addressInput = this.container.elements.namedItem('address') as HTMLInputElement;
    if (addressInput) {
      addressInput.value = '';
    }
    this.valid = false;
    this._errors.textContent = '';
  }
  
}

// Класс для обработки формы с контактными данными
export class Сontacts extends Form<IOrderRequest> {
  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events); // Вызов конструктора родительского класса для инициализации формы
  }

  // Сеттер для установки значения поля "phone" в форме
  set phone(value: string) {
    (this.container.elements.namedItem('phone') as HTMLInputElement).value = value; // Установка значения в input с именем 'phone'
  }

  // Сеттер для установки значения поля "email" в форме
  set email(value: string) {
    (this.container.elements.namedItem('email') as HTMLInputElement).value = value; // Установка значения в input с именем 'email'
  }

  reset() {
    const emailInput = this.container.elements.namedItem('email') as HTMLInputElement;
    const phoneInput = this.container.elements.namedItem('phone') as HTMLInputElement;
  
    if (emailInput) emailInput.value = '';
    if (phoneInput) phoneInput.value = '';
  
    this.valid = false;
    this._errors.textContent = '';
  }
  
}