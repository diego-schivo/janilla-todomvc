/*
 * MIT License
 *
 * Copyright (c) 2024-2025 Diego Schivo
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
import WebComponent from "./web-component.js";

class TodoApp extends WebComponent {

	static get templateNames() {
		return ["todo-app"];
	}

	data = [];

	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();
		addEventListener("hashchange", this.handleHashChange);
		this.addEventListener("add-item", this.handleAddItem);
		this.addEventListener("clear-completed", this.handleClearCompleted);
		this.addEventListener("remove-item", this.handleRemoveItem);
		this.addEventListener("toggle-all", this.handleToggleAll);
		this.addEventListener("toggle-item", this.handleToggleItem);
		this.addEventListener("update-item", this.handleUpdateItem);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		removeEventListener("hashchange", this.handleHashChange);
		this.removeEventListener("add-item", this.handleAddItem);
		this.removeEventListener("clear-completed", this.handleClearCompleted);
		this.removeEventListener("remove-item", this.handleRemoveItem);
		this.removeEventListener("toggle-all", this.handleToggleAll);
		this.removeEventListener("toggle-item", this.handleToggleItem);
		this.removeEventListener("update-item", this.handleUpdateItem);
	}

	handleAddItem = event => {
		const { detail: item } = event;
		this.data.push(item);
		this.requestDisplay();
	}

	handleClearCompleted = _ => {
		for (let i = this.data.length - 1; i >= 0; i--)
			if (this.data[i].completed)
				this.data.splice(i, 1);
		this.requestDisplay();
	}

	handleHashChange = _ => {
		this.requestDisplay();
	}

	handleRemoveItem = event => {
		const { detail: { id } } = event;
		for (let i = this.data.length - 1; i >= 0; i--)
			if (this.data[i].id === id)
				this.data.splice(i, 1);
		this.requestDisplay();
	}

	handleToggleItem = event => {
		const { detail: item } = event;
		this.data.find(x => x.id === item.id).completed = item.completed;
		this.requestDisplay();
	}

	handleToggleAll = event => {
		const { detail: { completed } } = event;
		this.data.forEach(x => x.completed = completed);
		this.requestDisplay();
		this.querySelector("todo-list").requestDisplay();
	}

	handleUpdateItem = event => {
		const { detail: item } = event;
		this.data.find(x => x.id === item.id).title = item.title;
		this.querySelector("todo-list").requestDisplay();
	}

	async updateDisplay() {
		const t = this.data.length;
		const a = this.data.reduce((x, y) => y.completed ? x : x + 1, 0);
		const c = t - a;
		this.appendChild(this.interpolateDom({
			$template: "",
			totalItems: t,
			activeItems: a,
			completedItems: c,
			filter: location.hash.split("/")[1] || "all",
		}));
	}
}

export default TodoApp;
