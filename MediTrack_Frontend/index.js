import { registerRootComponent } from "expo";
import App from "./src/App";

if (process.env.NODE_ENV === "development") {
  console.log = () => {};
}

const suppressed = [
  'React Router will begin wrapping state updates',
  'Relative route resolution within Splat routes'
];
const realWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && suppressed.some(s => args[0].includes(s))) {
    return;
  }
  realWarn(...args);
};

registerRootComponent(App);
