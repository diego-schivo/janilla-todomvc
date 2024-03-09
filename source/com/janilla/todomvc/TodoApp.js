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
import ClearCompleted from './ClearCompleted.js';
import Filters from './Filters.js';
import RenderEngine from './RenderEngine.js';
import TodoCount from './TodoCount.js';
import TodoList from './TodoList.js';
import ToggleAll from './ToggleAll.js';

class TodoApp {

	selector = () => document.body.firstElementChild;

	todos = [];

	nextId = 1;

	toggleAll;

	todoList;

	todoCount;

	filters;

	clearCompleted;

	get count() {
		const t = this.todos.length;
		const c = this.todos.reduce((s, t) => t.completed ? s + 1 : s, 0);
		return {
			active: t - c,
			completed: c,
			total: t
		};
	}

	run = async () => {
		const e = new CustomRenderEngine();
		const h = await e.render(this, 'TodoApp');
		document.body.insertAdjacentHTML('afterbegin', h);
		this.listen();
	}

	render = async engine => {
		if (engine.isRendering(this, 'toggleAll')) {
			this.toggleAll = new ToggleAll();
			this.toggleAll.selector = () => this.selector().children[1].firstElementChild;
			return this.toggleAll;
		}

		if (engine.isRendering(this, 'todoList')) {
			this.todoList = new TodoList();
			this.todoList.selector = () => this.selector().children[1].lastElementChild;
			return this.todoList;
		}

		if (engine.isRendering(this, 'todoCount')) {
			this.todoCount = new TodoCount();
			this.todoCount.selector = () => this.selector().lastElementChild.firstElementChild;
			return this.todoCount;
		}

		if (engine.isRendering(this, 'filters')) {
			this.filters = new Filters();
			this.filters.selector = () => this.selector().lastElementChild.children[1];
			return this.filters;
		}

		if (engine.isRendering(this, 'clearCompleted')) {
			this.clearCompleted = new ClearCompleted();
			this.clearCompleted.selector = () => this.selector().lastElementChild.lastElementChild;
			return this.clearCompleted;
		}
	}

	listen = () => {
		addEventListener('hashchange', this.handleHashChange);

		const e = this.selector();
		e.querySelector('.new-todo').addEventListener('change', this.handleNewTodoChange);
		e.addEventListener('todotoggleall', this.handleToggleAll);
		e.addEventListener('todotoggle', this.handleToggle);
		e.addEventListener('tododestroy', this.handleDestroy);
		e.addEventListener('todoedit', this.handleEdit);
		e.addEventListener('todoclearcompleted', this.handleClearCompleted);
		e.addEventListener('todoschange', this.handleTodosChange);

		this.toggleAll.listen();
		this.todoList.listen();
		this.todoCount.listen();
		this.filters.listen();
		this.clearCompleted.listen();
	}

	handleHashChange = () => {
		this.selector().dispatchEvent(new CustomEvent('todofilterchange', {
			detail: { filter: location.hash.substring(2) }
		}));
	}

	handleNewTodoChange = e => {
		const i = e.currentTarget;
		const t = i.value.trim();
		if (t === '')
			return;
		const u = {
			id: this.nextId++,
			title: t,
			completed: false
		}
		this.todos.push(u);
		i.value = '';
		this.selector().dispatchEvent(new CustomEvent('todoschange', {
			detail: { count: this.count }
		}));
	}

	handleToggleAll = e => {
		const c = e.detail.completed;
		this.todos.forEach(u => u.completed = c);
		this.selector().dispatchEvent(new CustomEvent('todoschange', {
			detail: { count: this.count }
		}));
	}

	handleToggle = e => {
		const t = e.detail.todo;
		t.completed = !t.completed;
		this.selector().dispatchEvent(new CustomEvent('todoschange', {
			detail: { count: this.count }
		}));
	}

	handleDestroy = e => {
		const t = e.detail.todo;
		this.todos.splice(this.todos.indexOf(t), 1);
		this.selector().dispatchEvent(new CustomEvent('todoschange', {
			detail: { count: this.count }
		}));
	}

	handleEdit = e => {
		const t = e.detail.todo;
		t.title = e.detail.title;
		this.selector().dispatchEvent(new CustomEvent('todoschange', {
			detail: { count: this.count }
		}));
	}

	handleClearCompleted = () => {
		this.todos = this.todos.filter(t => !t.completed);
		this.selector().dispatchEvent(new CustomEvent('todoschange', {
			detail: { count: this.count }
		}));
	}

	handleTodosChange = () => {
		const d = this.todos.length ? '' : 'none';
		for (const e of Array.from(this.selector().children).slice(1))
			e.style.display = d;
	}
}

class CustomRenderEngine extends RenderEngine {

	get app() {
		return this.stack[0].target;
	}

	clone() {
		const e = new CustomRenderEngine();
		e.stack = [...this.stack];
		return e;
	}
}

export default TodoApp;
