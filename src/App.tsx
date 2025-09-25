import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
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
    client.models.Todo.delete({ id })
  }

    function toggleTodo(idx: number) {
    const todo = todos[idx];
    if (!todo.id) return;
    client.models.Todo.update({
      id: todo.id,
      isDone: !todo.isDone,
    });
  }

type CloseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function CloseButton(props: CloseButtonProps) {
  return (
    <button
      aria-label="Close"
      style={{
        background: "none",
        border: "none",
        color: "red",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "1rem",
        ...props.style,
      }}
      {...props}
    >
      ×
    </button>
  );
}
  
  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo, idx) => (
          <li key={todo.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{todo.content}</span>
            <CloseButton 
              onClick={(e) => {
          e.stopPropagation();
          deleteTodo(todo.id);
              }}
              aria-label="Delete todo"
            >
            </CloseButton>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;


///  href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates" Review next step of this tutorial.