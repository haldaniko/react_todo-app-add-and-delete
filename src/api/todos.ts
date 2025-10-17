import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

export const USER_ID = 3582;

export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

export const setTodo = (title: string) => {
  const data = {
    title,
    userId: USER_ID,
    completed: false,
  };

  return client.post<Todo>(`/todos?userId=${USER_ID}`, data);
};
