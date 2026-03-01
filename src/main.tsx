import { Fragment } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { SWRDevTools } from "swr-devtools";

import "./index.css";

// TODO: chrome 下 devtools 不被检测到, see: https://github.com/koba04/swr-devtools/issues/133
const SWRDevToolsProvider = import.meta.env.DEV ? SWRDevTools : Fragment;

createRoot(document.getElementById("root")!).render(
  <SWRDevToolsProvider>
    <App />
  </SWRDevToolsProvider>,
);
