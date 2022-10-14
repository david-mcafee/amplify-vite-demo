import { useEffect, useState } from "react";
import "./App.css";

import { Amplify, API, DataStore, Predicates } from "aws-amplify";
import { Todo } from "./models";
import * as queries from "./graphql/queries";

//@ts-ignore
import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);

function App() {
  const [todos, setTodos] = useState([]);

  async function createTodo() {
    await DataStore.save(
      new Todo({
        name: `name ${Date.now()}`,
      })
    );
  }

  async function deleteTodo() {
    const [todo] = await DataStore.query(Todo);
    console.log(todo);
    if (!todo) return;
    const result = await DataStore.delete(Todo, todo.id);
    console.log(result);
  }

  async function onDeleteAll() {
    await DataStore.delete(Todo, Predicates.ALL);
  }

  async function getTodos() {
    const _todos = await DataStore.query(Todo);
    //@ts-ignore
    setTodos(_todos);
    console.log("Todos", _todos);
    const allRecords = await API.graphql({ query: queries.listTodos });
    console.log("everything in the table:", allRecords);
  }

  // Update
  async function updateTodo() {
    const [originalTodo] = await DataStore.query(Todo);
    console.log("Original Todo:", originalTodo);

    try {
      const todo = await DataStore.save(
        Todo.copyOf(originalTodo, (updated) => {
          updated.name = `name ${Date.now()}`;
        })
      );

      console.log("Todo updated:", todo);
    } catch (error) {
      console.error("Save failed:", error);
    }
  }

  useEffect(() => {
    const subscription = DataStore.observe(Todo).subscribe(() => {
      getTodos();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <button onClick={getTodos}>Query</button>
          <button onClick={createTodo}>New</button>
          <button onClick={deleteTodo}>Delete</button>
          <button onClick={updateTodo}>Update</button>
          <button onClick={onDeleteAll}>Delete All</button>
          <br />
          <button onClick={() => DataStore.start()}>Start</button>
          <button onClick={() => DataStore.stop()}>Stop</button>
          <button onClick={() => DataStore.clear()}>Clear</button>
          <pre>todos: {JSON.stringify(todos, null, 2)}</pre>
        </div>
      </header>
    </div>
  );
}

export default App;
