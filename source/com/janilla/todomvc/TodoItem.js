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
class TodoItem {

	selector;

	todo;

	engine;

	editing = false;

	render = async engine => {
		switch (engine.key) {
			case undefined:
				this.engine = engine.clone();
				return await engine.render(null, 'TodoItem');

			case 'completed':
			case 'checked':
				return this.todo.completed ? engine.key : '';

			case 'editing':
				return this.editing ? 'editing' : '';

			case 'edit':
				return this.editing ? await engine.render(null, 'TodoItem-edit') : '';
		}
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
		this.selector().outerHTML = await this.engine.render(null, 'TodoItem');
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

export default TodoItem;
