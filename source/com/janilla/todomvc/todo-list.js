/*
 * MIT License
 *
 * Copyright (c) 2024 Diego Schivo
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { UpdatableElement } from "./web-components.js";

export default class TodoList extends UpdatableElement {

	static get templateName() {
		return "todo-list";
	}

	static get observedAttributes() {
		return ["data-route", "data-total-items"];
	}

	items = [];

	constructor() {
		super();
	}

	async update() {
		// console.log("TodoItem.update");

		this.interpolator ??= (await this.interpolatorBuilders)[0]();
		this.appendChild(this.interpolator({
			style: `display:${parseInt(this.dataset.totalItems, 10) ? "block" : "none"}`,
			items: this.items.map(x => x[0]({
				...x[1],
				style: (() => {
					const cc = [];
					switch (this.dataset.route) {
						case "active":
							cc.push(false);
							break;
						case "completed":
							cc.push(true);
							break;
						default:
							cc.push(false, true);
							break;
					}
					return `display:${cc.includes(x[1].completed) ? "block" : "none"}`;
				})()
			}))
		}));
	}

	async addItem(entry) {
		console.log("TodoList.addItem", entry);

		this.items.push([(await this.interpolatorBuilders)[1](), entry]);
		this.requestUpdate();
	}

	clearCompletedItems() {
		console.log("TodoList.clearCompletedItems");

		for (let i = this.items.length - 1; i >= 0; i--)
			if (this.items[i][1].completed)
				this.items.splice(i, 1);
		this.requestUpdate();
	}
}
