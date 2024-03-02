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
import Filters from './Filters.js';
import RenderEngine from './RenderEngine.js';
import TodoCount from './TodoCount.js';
import TodoList from './TodoList.js';
import ToggleAll from './ToggleAll.js';

class App {

	selector = () => document.body.firstElementChild;

	todos = [];

	uniqueID = 1;

	todoList;

	todoCount;

	filters;

	filter;

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
		const h = await e.render(this, 'app-App');
		document.body.insertAdjacentHTML('afterbegin', h);
		this.listen();
	}

	render = async engine => {
		if (engine.isRendering(this, 'toggleAll')) {
			this.toggleAll = new ToggleAll();
			this.toggleAll.selector = () => this.selector().querySelector('.toggle-all-container');
			return this.toggleAll;
		}

		if (engine.isRendering(this, 'todoList')) {
			this.todoList = new TodoList();
			this.todoList.selector = () => this.selector().querySelector('.todo-list');
			return this.todoList;
		}

		if (engine.isRendering(this, 'todoCount')) {
			this.todoCount = new TodoCount();
			this.todoCount.selector = () => this.selector().querySelector('.todo-count');
			return this.todoCount;
		}

		if (engine.isRendering(this, 'filters')) {
			this.filters = new Filters();
			this.filters.selector = () => this.selector().querySelector('.filters');
			return this.filters;
		}
	}

	listen = () => {
		addEventListener('hashchange', this.handleHashChange);

		const e = this.selector();
		e.querySelector('.new-todo').addEventListener('change', this.handleNewTodoChange);
		e.addEventListener('todotoggleall', this.handleTodoToggleAll);
		e.addEventListener('todotoggle', this.handleTodoToggle);
		e.addEventListener('tododestroy', this.handleTodoDestroy);
		e.addEventListener('todoedit', this.handleTodoEdit);
		e.querySelector('.clear-completed').addEventListener('click', this.handleClearCompletedClick);

		this.todoList.listen();
		this.todoCount.listen();
		this.filters.listen();
	}

	handleHashChange = () => {
		this.filter = location.hash.substring(2);
		this.toggleAll.refresh();
		this.todoList.refresh();
		this.todoCount.refresh();
		this.filters.refresh();
	}

	handleNewTodoChange = e => {
		const i = e.currentTarget;
		const t = i.value.trim();
		if (t === '')
			return;
		const u = {
			id: this.uniqueID++,
			title: t,
			completed: false
		}
		this.todos.push(u);
		i.value = '';
		this.toggleAll.refresh();
		this.todoList.refresh();
		this.todoCount.refresh();
		this.contentBlock();
	}

	handleTodoToggleAll = e => {
		const c = e.detail.completed;
		this.todos.forEach(u => u.completed = c);
		this.toggleAll.refresh();
		this.todoList.refresh();
		this.todoCount.refresh();
	}

	handleTodoToggle = e => {
		const t = e.detail.todo;
		t.completed = !t.completed;
		this.toggleAll.refresh();
		this.todoList.refresh();
		this.todoCount.refresh();
	}

	handleTodoDestroy = e => {
		const t = e.detail.todo;
		this.todos.splice(this.todos.indexOf(t), 1);
		this.toggleAll.refresh();
		this.todoList.refresh();
		this.todoCount.refresh();
		this.contentBlock();
	}

	handleTodoEdit = e => {
		const t = e.detail.todo;
		t.title = e.detail.title;
		this.todoList.refresh();
	}

	handleClearCompletedClick = e => {
		this.todos = this.todos.filter(t => !t.completed);
		this.toggleAll.refresh();
		this.todoList.refresh();
		this.contentBlock();
	}

	contentBlock = () => {
		const e = this.selector();
		const d = this.todos.length ? '' : 'none';
		for (let s of ['.main', '.footer'])
			e.querySelector(s).style.display = d;
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

const l = () => new App().run();
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', l) : l();
