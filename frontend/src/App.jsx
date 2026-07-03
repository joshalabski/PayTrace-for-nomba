import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ActivityPage from "./pages/ActivityPage";
import DisputesPage from "./pages/DisputesPage";
import LoginPage from "./pages/LoginPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/disputes" element={<DisputesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
