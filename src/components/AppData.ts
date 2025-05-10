import { IAppState, IOrder, IOrderRequest, IProduct } from '../types';
import { Model } from './base/Model';

export type CatalogChangeEvent = {
	catalog: Product[];
};

export class AppState extends Model<IAppState> {
	catalog: Product[];
	preview: string;
	basket: Product[] = [];
	order: IOrder = {
		address: '',
		payment: 'cash',
		email: '',
		total: 0,
		phone: '',
		items: [],
	};
	private _total = 0;

	setCatalog(items: IProduct[]) {
		this.catalog = items.map((item) => new Product(item, this.events));
		this.emitChanges('cards:changed', { catalog: this.catalog });
	}
	addToOrder(item: Product) {
		this.order.items.push(item.id);
	}

	removeFromOrder(item: Product) {
		const index = this.order.items.indexOf(item.id);
		if (index >= 0) {
			this.order.items.splice(index, 1);
		}
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
		this.order.total = value;
	}

	get total(): number {
		return this._total;
	}

	getTotal(): number {
		return this.basket.reduce((sum, item) => sum + (item.price ?? 0), 0);
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
