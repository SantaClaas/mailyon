// Add types for document.startViewTransition for use in this file. See https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types- for more info.
/// <reference types="view-transitions-api-types" />

import { TemplateResult, html, render } from "lit-html";
import "./style.css";
import { Command, Program } from "@claas.dev/framework";

// Remove Preload scripts loading
postMessage({ payload: "removeLoading" }, "*");

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});

type Message = "increment" | "sum";
type Model = {
  count: number;
};
function initialize(): [Model, Command.Command<Message>] {
  return [{ count: 0 }, Command.none];
}

function view(
  model: Model,
  dispatch: Command.Dispatch<Message>
): TemplateResult {
  console.log("view", model.count);
  return html`
    <h1>Counter</h1>
    <p>Count ${model.count}</p>
    <button @click=${() => dispatch("increment")}>Increment</button>
    <button @click=${() => dispatch("sum")}>Sum</button>
  `;
}

function update(
  message: Message,
  model: Model
): [Model, Command.Command<Message>] {
  switch (message) {
    case "increment":
      return [{ count: model.count + 1 }, Command.none];
    case "sum":
      window.ipcRenderer.send("sum", "sum");
      return [model, Command.none];
  }
}

function setState(model: Model, dispatch: Command.Dispatch<Message>) {
  const template = view(model, dispatch);

  if (!document.startViewTransition) {
    render(template, document.body);
    return;
  }

  document.startViewTransition(() => {
    render(template, document.body);
    return Promise.resolve();
  });
}

let program = Program.makeProgram(initialize, update, view);

program = Program.withSetState(setState, program);

Program.run(program);
