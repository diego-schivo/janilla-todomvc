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
import { nanoid } from "./nanoid.js";

export default class TodoTopbar extends UpdatableElement {

	static get templateName() {
		return "todo-topbar";
	}

	constructor() {
		super();
	}

	async connectedCallback() {
		// console.log("TodoTopbar.connectedCallback");

		super.connectedCallback();
		this.addEventListener("keyup", this.handleKeyup);
	}

	disconnectedCallback() {
		// console.log("TodoTopbar.disconnectedCallback");

		this.removeEventListener("keyup", this.handleKeyup);
	}

	async update() {
		// console.log("TodoTopbar.update");

		this.interpolator ??= (await this.interpolatorBuilders)[0]();
		this.appendChild(this.interpolator());
	}

	handleKeyup = event => {
		console.log("TodoTopbar.handleKeyup", event);

		if (event.key !== "Enter" || !event.target.value)
			return;

		this.dispatchEvent(new CustomEvent("add-item", {
			bubbles: true,
			detail: {
				id: nanoid(),
				title: event.target.value,
				completed: false,
			}
		}));

		event.target.value = "";
	}
}
