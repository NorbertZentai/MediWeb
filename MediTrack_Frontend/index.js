// index.js
import { registerRootComponent } from "expo";
import App from "./App";

if (process.env.NODE_ENV === "development") {
  console.log = () => {};
}

registerRootComponent(App);
