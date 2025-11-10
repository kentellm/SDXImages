import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import  TodoItem  from "./TodoItem";
import { FileUploader } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import PaginatedImageGallery from "./ImageGallery";


const client = generateClient<Schema>();

function App() {
  // Image Gallery -- made a separate component for clarity


  //Todo App
  const { user, signOut } = useAuthenticator();
  
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

return (
    <main> 
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button
        onClick={createTodo}
      >
        + New
      </button>
      <ul>
            {todos.map((todo, idx) => (
                // Use the memoized component here
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
      <PaginatedImageGallery />
      <div>
        <FileUploader
          acceptedFileTypes={['image/*']}
          path="image-submissions/"
          maxFileCount={1}
          isResumable
        />
      </div>
      <footer>
        Upload a file above.
      </footer>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
