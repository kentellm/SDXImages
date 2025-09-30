import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import confetti from "canvas-confetti";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

    useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos(data.items.map(item => ({ ...item }))),
    });
    return () => subscription.unsubscribe();
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
        color: "#ff4d4d",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: "bold",
        padding: "0 8px",
        lineHeight: "1",
        ...props.style,
      }}
      {...props}
    >
      ×
    </button>
  );
}

 
    return (
    <main style={{
      maxWidth: "600px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    }}>
      <h1>My Todos</h1>
      <button
        onClick={createTodo}
      >
        + New
      </button>
      <ul>
        {todos.map((todo, idx) => (
          <li key={todo.id ?? idx}>
             <input
                type="checkbox"
                checked={!!todo.isDone}
                onChange={() => {
                toggleTodo(idx);
                  if (!todo.isDone) {
                  confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    zIndex: 1000
                  });
                  }
                }}
              />
            <span>
              {todo.content}
            </span>
            <CloseButton
              onClick={(e) => {
                e.stopPropagation();
                deleteTodo(todo.id);
              }}
            />
          </li>
        ))}
      </ul>
      <footer>
        Create a new todo item by clicking the "+ New" button.
      </footer>
    </main>
  );
}

export default App;


///  href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates" Review next step of this tutorial.