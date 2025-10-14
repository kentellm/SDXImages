import { memo } from "react";
import type { Schema } from "../amplify/data/resource";
import confetti from "canvas-confetti";

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

interface TodoItemProps {
  todo: Schema["Todo"]["type"];
  idx: number;
  toggleTodo: (idx: number) => void;
  deleteTodo: (id: string) => void;
}

function TodoItem({ todo, idx, toggleTodo, deleteTodo }: TodoItemProps) {
  return (
    <li
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ flexGrow: 1, textAlign: "left", marginRight: "10px" }}>
        <input
          type="checkbox"
          checked={!!todo.isDone}
          onChange={() => {toggleTodo(idx);
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
        <span>{todo.content}</span>
      </div>
      <CloseButton
        onClick={(e) => {
          e.stopPropagation();
          deleteTodo(todo.id);
        }}
      />
    </li>
  );
}

export default memo(TodoItem);