import { IAppState, IOrderRequest, IProduct } from '../types';
import { Model } from './base/Model';

export type CatalogChangeEvent = {
	catalog: Product[];
};

export class AppState extends Model<IAppState> {
	catalog: Product[] = [];
	preview: string;
	basket: Product[] = [];
	order: Partial<IOrderRequest> = {
		address: '',
		payment: null,
		email: '',
		phone: '',
	};

	private _total = 0;

	setCatalog(items: IProduct[]) {
		this.catalog = items.map((item) => new Product(item, this.events));
		this.emitChanges('cards:changed', { catalog: this.catalog });
	}

	setPreview(item: Product) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	setProductToBasket(item: Product) {
		if (!this.basket.some((existingItem) => existingItem.id === item.id)) {
			this.basket.push(item);
		}
	}

	removeProductToBasket(item: Product) {
		const index = this.basket.indexOf(item);
		if (index >= 0) {
			this.basket.splice(index, 1);
		}
	}

	get statusBasket(): boolean {
		return this.basket.length === 0;
	}

	get bskt(): Product[] {
		return this.basket;
	}

	set total(value: number) {
		this._total = value;
	}

	get total(): number {
		return this._total;
	}

	getTotal(): number {
		return this.basket.reduce((sum, item) => sum + (item.price ?? 0), 0);
	}

	//Методы установки данных заказа
	setEmail(value: string) {
		this.order.email = value;
		this.validateContacts();
	}

	setPhone(value: string) {
		this.order.phone = value;
		this.validateContacts();
	}

	setAddress(value: string) {
		this.order.address = value;
		this.validateOrder();
	}

	setPayment(method: 'cash' | 'online') {
		this.order.payment = method;
		this.validateOrder();
	}

  private runValidation(
    checks: Array<{ condition: boolean; message: string }>,
    eventName: string
  ) {
    const errors = checks
      .filter(c => c.condition)
      .map(c => c.message);
  
    this.emitChanges(eventName, {
      errors,
      valid:  errors.length === 0,
    });
  }
  validateContacts() {
    this.runValidation([
      {
        condition: !this.order.email || !/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(this.order.email),
        message: 'Некорректный email',
      },
      {
        condition: !this.order.phone || !/^\+7\d{10}$/.test(this.order.phone),
        message: 'Телефон должен начинаться с +7 и содержать 11 цифр',
      },
    ], 'contacts:validation');
  }
  
  validateOrder() {
    this.runValidation([
      {
        condition: !this.order.address || !this.order.address.trim(),
        message: 'Адрес не может быть пустым',
      },
      {
        condition: !this.order.payment,
        message: 'Выберите способ оплаты',
      },
    ], 'order:validation');
  }

	//Создание финального запроса для API
	createOrderToPost(): IOrderRequest {
		return {
			email: this.order.email!,
			phone: this.order.phone!,
			address: this.order.address!,
			payment: this.order.payment!,
			total: this.getTotal(),
			items: this.basket
				.filter((item) => item.price !== null)
				.map((item) => item.id),
		};
	}

	resetOrder() {
		this.order = {
			email: '',
			phone: '',
			address: '',
			payment: null,
		};
		this.emitChanges('order:validation', { errors: [], valid: false });
	}
}

export class Product extends Model<IProduct> {
	id: string;
	title: string;
	description: string;
	category: string;
	image: string;
	price: number | null;
}
