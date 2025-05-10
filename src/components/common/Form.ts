import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { IFormState } from '../../types/index';

export class Form<T> extends Component<IFormState> {
	private emailPattern: RegExp =
		/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	private phonePattern: RegExp = /^\+7\d{10}$/;
	private phoneLength: number = 12;

	protected _submit: HTMLButtonElement;
	protected _errors: HTMLElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
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
				errorMessage =
					'Пожалуйста, введите правильный адрес электронной почты.';
			}
		} else if (field === 'phone') {
			if (!this.phonePattern.test(value)) {
				errorMessage =
					'Номер телефона должен начинаться с +7 и содержать 11 цифр.';
			}
		}

		if (errorMessage) {
			this.setErrorMessage(errorMessage);
		} else {
			this.clearErrorMessage();
		}

		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	// Валидация всей формы перед отправкой
	private validateForm(): boolean {
		const emailInput = this.container.querySelector(
			'[name="email"]'
		) as HTMLInputElement;
		const phoneInput = this.container.querySelector(
			'[name="phone"]'
		) as HTMLInputElement;

		if (emailInput && !this.emailPattern.test(emailInput.value)) {
			this.setErrorMessage(
				'Пожалуйста, введите правильный адрес электронной почты.'
			);
			return false;
		}

		if (phoneInput && !this.phonePattern.test(phoneInput.value)) {
			this.setErrorMessage(
				'Номер телефона должен начинаться с +7 и содержать 11 цифр.'
			);
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

// Статическая утилита для валидации email и телефона
export class FormValidator {
	static validateContacts(email: string, phone: string): boolean {
		const isValidEmail =
			/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
		const isValidPhone = /^\+7\d{10}$/.test(phone);
		return isValidEmail && isValidPhone;
	}
}
