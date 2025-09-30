import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import confetti from "canvas-confetti";
import { CfnSubnetRouteTableAssociation } from "aws-cdk-lib/aws-ec2";


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
      className="close-button"  
      aria-label="Close"
      {...props}
    >
      X
    </button>
  );
}

return (
    <main> 
      <h1>My Todos</h1>
      <button
        onClick={createTodo}
      >
        + New
      </button>
      <ul>
        {todos.map((todo, idx) => (
          <li key={todo.id ?? idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "left", // Optional: to vertically align items
              
            }}>
             <div style={{ flexGrow: 1, textAlign: "left", marginRight: "10px" }}>
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
                style={{ marginRight: "10px" }}
              />
            <span style={{ textDecoration: todo.isDone ? "line-through" : "none" }}>
              {todo.content}
            </span>
            </div>
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