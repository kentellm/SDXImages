import { useEffect, useState } from "react";
import type { Schema } from "/workspaces/SDXImages/amplify/data/resource.ts";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import TodoItem from "./TodoItem";
import '@aws-amplify/ui-react/styles.css';

const client = generateClient<Schema>();

function TodoList() {
  const { user } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }
  
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  function toggleTodo(idx: number) {
    const todo = todos[idx];
    if (!todo.id) return;
    client.models.Todo.update({
      id: todo.id,
      isDone: !todo.isDone,
    });
  }

  return (
    <div className="todo-list-container">
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>
        + New
      </button>
      <ul>
        {todos.map((todo, idx) => (
          <TodoItem
            key={todo.id ?? idx}
            todo={todo}
            idx={idx}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
          />
        ))}
      </ul>
      <footer>
        Create a new todo item by clicking the "+ New" button.
      </footer>
    </div>
  );
}

export default TodoList;