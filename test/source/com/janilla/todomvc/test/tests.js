/*
 * MIT License
 *
 * Copyright (c) 2024-2026 Diego Schivo
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
import { matchNode } from "./dom-utils.js";

const delay = () => new Promise(x => setTimeout(x, 1000));

const untilFormControl = placeholder => async context => await matchNode(`//*[contains(@placeholder,"${placeholder}")]`, context, false);

const untilElement = (tag, text) => async context => await matchNode(`//text()[contains(.,"${text}")]/ancestor::${tag}`, context, false);

const whileElement = (tag, text) => async context => await matchNode(`//text()[contains(.,"${text}")]/ancestor::${tag}`, context, true);

const create = (text) => {
	return async content => {
		const c = await untilFormControl("What")(content.body);
		c.value = text;
		c.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, cancelable: true, key: "Enter" }));
	};
}

const addItem = async content => {
	await create("redesign website")(content);
	await delay();
	await untilElement("li", "redesign website")(content.body);
}

const toggleItem = async content => {
	await create("redesign website")(content);
	await delay();
	const b = content.body;
	await untilElement("div", "1 item left!")(b);
	await delay();
	(await untilElement("label", "Toggle")(b)).click();
	await delay();
	await untilElement("li", "redesign website")(content.body);
	await untilElement("div", "0 items left!")(b);
}

const removeItem = async content => {
	await create("redesign website")(content);
	await delay();
	const b = content.body;
	(await untilElement("li", "redesign website")(b)).querySelector("button").click();
	await delay();
	await whileElement("li", "redesign website")(b);
}

export default {
	"Add item": addItem,
	"Toggle item": toggleItem,
	"Remove item": removeItem
};
