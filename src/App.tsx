/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { deleteTodo, getTodos, setTodo, USER_ID } from './api/todos';
import { Todo } from './types/Todo';

export const App: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage('Unable to load todos');

        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      });
  }, []);

  const visibleTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const handleAddTodo = () => {
    if (title.trim() === '') {
      setErrorMessage('Field cannot be empty');

      return;
    }

    const newTempTodo: Todo = {
      id: 0,
      title: title.trim(),
      completed: false,
      userId: USER_ID,
    };

    setTempTodo(newTempTodo);
    setIsLoading(true);
    setErrorMessage('');

    setTodo(title.trim())
      .then(realTodo => {
        setTodos(prev => [...prev, realTodo]);
        setTitle('');
      })
      .catch(() => {
        setErrorMessage('Unable to add a todo');
      })
      .finally(() => {
        setIsLoading(false);
        setTempTodo(null);
      });
  };

  const handleDeleteTodo = (id: number) => {
    setDeletingTodoId(id);

    deleteTodo(id)
      .then(() => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
      })
      .finally(() => {
        setDeletingTodoId(null);
      });
  };

  const handleClearCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    if (completedTodos.length === 0) {
      return;
    }

    setIsLoading(true);

    Promise.allSettled(completedTodos.map(todo => deleteTodo(todo.id)))
      .then(results => {
        const successfulIds = completedTodos
          .filter((_, i) => results[i].status === 'fulfilled')
          .map(todo => todo.id);

        setTodos(prev => prev.filter(todo => !successfulIds.includes(todo.id)));

        const hasErrors = results.some(r => r.status === 'rejected');

        if (hasErrors) {
          setErrorMessage('Unable to delete some todos');
          setTimeout(() => setErrorMessage(''), 3000);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            className={`todoapp__toggle-all ${
              todos.length > 0 && todos.every(todo => todo.completed)
                ? 'active'
                : ''
            }`}
            data-cy="ToggleAllButton"
          />

          <input
            key={isLoading ? 'loading' : 'ready'}
            data-cy="NewTodoField"
            type="text"
            className="todoapp__new-todo"
            placeholder="What needs to be done?"
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleAddTodo();
              }
            }}
            disabled={isLoading}
          />
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {visibleTodos.map(todo => (
            <div
              key={todo.id}
              data-cy="Todo"
              className={todo.completed ? 'todo completed' : 'todo'}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={todo.completed}
                />
              </label>

              <span data-cy="TodoTitle" className="todo__title">
                {todo.title}
              </span>

              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
                onClick={() => handleDeleteTodo(todo.id)}
                disabled={deletingTodoId === todo.id}
              >
                ×
              </button>

              {deletingTodoId === todo.id && (
                <div data-cy="TodoLoader" className="modal overlay is-active">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              )}
            </div>
          ))}

          {tempTodo && (
            <div
              key={tempTodo.id}
              data-cy="Todo"
              className={tempTodo.completed ? 'todo completed' : 'todo'}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={tempTodo.completed}
                />
              </label>

              <span data-cy="TodoTitle" className="todo__title">
                {tempTodo.title}
              </span>

              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
              >
                ×
              </button>

              <div data-cy="TodoLoader" className="modal overlay is-active">
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          )}
        </section>

        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todos.filter(todo => !todo.completed).length} items left
            </span>

            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${filter === 'all' ? 'selected' : ''}`}
                data-cy="FilterLinkAll"
                onClick={() => setFilter('all')}
              >
                All
              </a>

              <a
                href="#/active"
                className={`filter__link ${filter === 'active' ? 'selected' : ''}`}
                data-cy="FilterLinkActive"
                onClick={() => setFilter('active')}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={`filter__link ${filter === 'completed' ? 'selected' : ''}`}
                data-cy="FilterLinkCompleted"
                onClick={() => setFilter('completed')}
              >
                Completed
              </a>
            </nav>

            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled={todos.every(todo => !todo.completed) || isLoading}
              onClick={handleClearCompleted}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${!errorMessage ? 'hidden' : ''}`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {errorMessage}
      </div>
    </div>
  );
};
