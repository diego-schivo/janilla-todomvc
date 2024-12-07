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

export default class TodoApp extends UpdatableElement {

	static get templateName() {
		return "todo-app";
	}

	data = [];

	constructor() {
		super();
	}

	get bottombar() {
		return this.querySelector("todo-bottombar");
	}

	get list() {
		return this.querySelector("todo-list");
	}

	connectedCallback() {
		// console.log("TodoApp.connectedCallback");

		super.connectedCallback();
		addEventListener("hashchange", this.handleHashChange);
		this.addEventListener("add-item", this.handleAddItem);
		this.addEventListener("clear-completed-items", this.handleClearCompletedItems);
		this.addEventListener("toggle-item", this.handleToggleItem);
	}

	disconnectedCallback() {
		// console.log("TodoApp.disconnectedCallback");

		removeEventListener("hashchange", this.handleHashChange);
		this.removeEventListener("add-item", this.handleAddItem);
		this.removeEventListener("clear-completed-items", this.handleClearCompletedItems);
		this.removeEventListener("toggle-item", this.handleToggleItem);
	}

	async update() {
		// console.log("TodoApp.update");

		this.interpolator ??= (await this.interpolatorBuilders)[0]();
		const totalItems = this.data.length;
		const activeItems = this.data.filter(entry => !entry.completed).length;
		this.appendChild(this.interpolator({
			route: location.hash.split("/")[1] || "all",
			totalItems,
			activeItems,
			completedItems: totalItems - activeItems
		}));
	}

	handleAddItem = async event => {
		console.log("TodoApp.handleAddItem", event);

		const { detail: item } = event;
		this.data.push(item);
		await this.list.addItem(item);
		await this.update();
	}

	handleClearCompletedItems = event => {
		console.log("TodoApp.handleClearCompletedItems", event);

		for (let i = this.data.length - 1; i >= 0; i--)
			if (this.data[i].completed)
				this.data.splice(i, 1);
		this.list.clearCompletedItems();
		this.requestUpdate();
	}

	handleHashChange = event => {
		console.log("TodoApp.handleHashChange", event);

		this.requestUpdate();
	}

	handleToggleItem = event => {
		console.log("TodoApp.handleToggleItem", event);

		const { detail: item } = event;
		this.data.find(x => x.id === item.id).completed = item.completed;
		this.requestUpdate();
	}
}
