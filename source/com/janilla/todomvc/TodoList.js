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
import TodoItem from './TodoItem.js';

class TodoList {

	selector;

	engine;

	todoItems;

	render = async engine => {
		switch (engine.key) {
			case undefined:
				this.engine = engine.clone();
				return await engine.render(null, 'TodoList');

			case 'todoItems':
				const a = this.engine.todoMVC;
				let t = a.todos;
				if (a.filter)
					t = t.filter(a.filter === 'active' ? (u => !u.completed) : (u => u.completed));
				this.todoItems = t.map((u, i) => {
					const j = new TodoItem();
					j.selector = () => this.selector().children[t.length - 1 - i];
					j.todo = u;
					return j;
				}).reverse();
				return this.todoItems;
		}
	}

	listen = () => {
		this.todoItems.forEach(i => i.listen());
	}

	refresh = async () => {
		this.selector().outerHTML = await this.engine.render(null, 'TodoList');
		this.listen();
	}
}

export default TodoList;
