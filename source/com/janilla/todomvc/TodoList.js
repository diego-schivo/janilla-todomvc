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
class TodoList {

	selector;

	engine;

	items;

	currentFilter;

	render = async e => {
		return await e.match([this], (_, o) => {
			this.engine = e.clone();
			o.template = 'TodoList';
		}) || await e.match([this, 'items'], (_, o) => {
			const a = this.engine.app;
			let t = a.todos;
			const f = this.currentFilter;
			if (f)
				t = t.filter(f === 'active' ? (u => !u.completed) : (u => u.completed));
			this.items = t.map((u, i) => {
				const j = new Item();
				j.selector = () => this.selector().children[t.length - 1 - i];
				j.todo = u;
				return j;
			}).reverse();
			o.value = this.items;
		});
	}

	listen = () => {
		const e = this.engine.app.selector();
		e.addEventListener('todoschange', this.handleTodosChange);
		e.addEventListener('todofilterchange', this.handleFilterChange);
		this.items.forEach(i => i.listen());
	}

	refresh = async () => {
		this.selector().outerHTML = await this.engine.render();
		this.listen();
	}

	handleTodosChange = async () => {
		await this.refresh();
	}

	handleFilterChange = async e => {
		this.currentFilter = e.detail.filter;
		await this.refresh();
	}
}

class Item {

	selector;

	todo;

	engine;

	editing = false;

	render = async e => {
		return await e.match([this], (_, o) => {
			this.engine = e.clone();
			o.template = 'TodoList-Item';
		}) || await e.match([this, 'completed'], (_, o) => {
			o.value = this.todo.completed ? 'completed' : '';
		}) || await e.match([this, 'checked'], (_, o) => {
			o.value = this.todo.completed ? 'checked' : '';
		}) || await e.match([this, 'editing'], (_, o) => {
			o.value = this.editing ? 'editing' : '';
		}) || await e.match([this, 'edit'], (_, o) => {
			if (this.editing)
				o.template = 'TodoList-Item-edit';
		});
	}

	listen = () => {
		this.selector().querySelector('.toggle').addEventListener('click', this.handleToggleClick);
		this.selector().querySelector('.destroy').addEventListener('click', this.handleDestroyClick);
		this.selector().querySelector('label').addEventListener('dblclick', this.handleLabelDoubleClick);
		this.selector().querySelector('.edit')?.addEventListener('blur', this.handleEditBlur);
		this.selector().querySelector('.edit')?.addEventListener('keypress', this.handleEditKeyPress);
		this.selector().querySelector('.edit')?.addEventListener('keyup', this.handleEditKeyUp);
	}

	refresh = async () => {
		this.selector().outerHTML = await this.engine.render();
		this.listen();
	}

	handleToggleClick = () => {
		this.selector().dispatchEvent(new CustomEvent('todotoggle', {
			bubbles: true,
			detail: { todo: this.todo }
		}));
	}

	handleDestroyClick = () => {
		this.selector().dispatchEvent(new CustomEvent('tododestroy', {
			bubbles: true,
			detail: { todo: this.todo }
		}));
	}

	handleLabelDoubleClick = async () => {
		this.editing = true;
		await this.refresh();
		const i = this.selector().querySelector('.edit');
		const l = i.value.length;
		i.setSelectionRange(l, l);
		i.focus();
	}

	handleEditBlur = async e => {
		this.editing = false;
		const t = e.currentTarget.value.trim();
		if (t === this.todo.title)
			await this.refresh();
		else
			this.selector().dispatchEvent(new CustomEvent('todoedit', {
				bubbles: true,
				detail: {
					todo: this.todo,
					title: t
				}
			}));
	}

	handleEditKeyPress = async e => {
		if (e.key === 'Enter')
			e.currentTarget.blur();
	}

	handleEditKeyUp = async e => {
		if (e.key === 'Escape') {
			const i = e.currentTarget;
			i.value = this.todo.title;
			i.blur();
		}
	}
}

export default TodoList;
