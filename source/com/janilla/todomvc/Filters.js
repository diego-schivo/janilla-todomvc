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
class Filters {

	selector;

	engine;
	
	currentFilter;

	get items() {
		return [
			{ text: 'All' },
			{ page: 'active', text: 'Active' },
			{ page: 'completed', text: 'Completed' }
		];
	}

	render = async e => {
		return await e.match([this], (i, o) => {
			this.engine = e.clone();
			o.template = 'Filters';
		}) || await e.match([this, 'items', 'number'], (i, o) => {
			o.template = 'Filters-item';
		}) || await e.match(['object', 'selected'], (i, o) => {
			o.value = x[0].page === this.currentFilter ? 'selected' : '';
		});
	}

	listen = () => {
		this.engine.app.selector().addEventListener('todofilterchange', this.handleFilterChange);
	}

	refresh = async () => {
		this.selector().outerHTML = await this.engine.render();
		this.listen();
	}
	
	handleFilterChange = async e => {
		this.currentFilter = e.detail.filter;
		await this.refresh();
	}
}

export default Filters;
