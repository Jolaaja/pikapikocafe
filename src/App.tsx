import HomePage from "./HomePage";
import MenuPage from "./MenuPage";

export default function App() {
  const isMenuRoute = window.location.pathname === "/menu.html" || window.location.pathname === "/menu";
  return isMenuRoute ? <MenuPage /> : <HomePage />;
}
