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

export default class TodoItem extends UpdatableElement {

	static get templateName() {
		return "todo-item";
	}

	constructor() {
		super();
	}

	async connectedCallback() {
		// console.log("TodoItem.connectedCallback");

		super.connectedCallback();
		this.addEventListener("change", this.handleChange);
	}

	disconnectedCallback() {
		// console.log("TodoItem.disconnectedCallback");

		this.removeEventListener("change", this.handleChange);
	}

	async update() {
		console.log("TodoItem.update");

		this.interpolator ??= (await this.interpolatorBuilders)[0]();
		this.appendChild(this.interpolator(this.dataset));
	}

	handleChange = event => {
		console.log("TodoItem.handleChange", event);

		this.dispatchEvent(new CustomEvent("toggle-item", {
			bubbles: true,
			detail: {
				id: this.dataset.id,
				completed: event.target.checked,
			}
		}));
	}
}
