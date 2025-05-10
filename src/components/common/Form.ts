import { ensureElement } from "../../utils/utils"; // Импорт утилиты ensureElement для поиска элементов в DOM
import { Component } from "../base/Component"; // Импорт базового класса Component
import { IEvents } from "../base/events"; // Импорт интерфейса IEvents для управления событиями

interface IFormState { // Интерфейс состояния формы
  valid: boolean; // Флаг валидности формы
  errors: string[]; // Список ошибок формы
}

export class Form<T> extends Component<IFormState> {
    // Регулярные выражения для валидации email и телефона
    private emailPattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    private phonePattern: RegExp = /^\+7\d{10}$/; // Номер телефона должен начинаться с +7 и содержать 10 цифр после
  
    // Стандартное количество цифр в номере (для России)
    private phoneLength: number = 12; // Должно быть 12 символов (включая +7)
  
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;
  
    constructor(protected container: HTMLFormElement, protected events: IEvents) {
      super(container);
  
      this._submit = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);
      this._errors = ensureElement<HTMLElement>('.form__errors', this.container);
  
      this.container.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const field = target.name as keyof T;
        const value = target.value;
        this.onInputChange(field, value);
      });
  
      this.container.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        if (this.validateForm()) {
          this.events.emit(`${this.container.name}:submit`);
        } else {
          this.events.emit(`${this.container.name}:error`);
        }
      });
    }
  
    protected onInputChange(field: keyof T, value: string) {
      let errorMessage = '';
  
      if (field === 'email') {
        if (!this.emailPattern.test(value)) {
          errorMessage = 'Пожалуйста, введите правильный адрес электронной почты.';
        }
      } else if (field === 'phone') {
        if (!this.phonePattern.test(value)) {
          errorMessage = 'Номер телефона должен начинаться с +7 и содержать 11 цифр.';
        }
      }
  
      if (errorMessage) {
        this.setErrorMessage(errorMessage);
      } else {
        this.clearErrorMessage();
      }
  
      this.events.emit(`${this.container.name}.${String(field)}:change`, {
        field,
        value
      });
    }
  
    // Валидация всей формы перед отправкой
    private validateForm(): boolean {
      const emailInput = this.container.querySelector('[name="email"]') as HTMLInputElement;
      const phoneInput = this.container.querySelector('[name="phone"]') as HTMLInputElement;
  
      if (emailInput && !this.emailPattern.test(emailInput.value)) {
        this.setErrorMessage('Пожалуйста, введите правильный адрес электронной почты.');
        return false;
      }
  
      if (phoneInput && !this.phonePattern.test(phoneInput.value)) {
        this.setErrorMessage('Номер телефона должен начинаться с +7 и содержать 11 цифр.');
        return false;
      }
  
      return true;
    }
  
    private setErrorMessage(message: string) {
      this._errors.innerHTML = message;
      this._errors.classList.add('form__errors--active');
    }
  
    private clearErrorMessage() {
      this._errors.innerHTML = '';
      this._errors.classList.remove('form__errors--active');
    }
  
    set valid(value: boolean) {
      this._submit.disabled = !value;
    }
  
    disableBuyButton() {
      if (this._submit) {
        this._submit.disabled = true;
      }
    }
  
    enableBuyButton() {
      if (this._submit) {
        this._submit.disabled = false;
      }
    }
  
    set errors(value: string) {
      this.setText(this._errors, value);
    }
  
    render(state: Partial<T> & IFormState) {
      const { valid, errors, ...inputs } = state;
      super.render({ valid, errors });
      Object.assign(this, inputs);
      return this.container;
    }
  }
  