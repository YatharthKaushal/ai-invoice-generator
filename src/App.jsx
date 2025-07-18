import { Routes, Route } from "react-router-dom";
import ExtractDataPage from "./pages/ExtractDataPage";
import InvoicePage from "./pages/InvoicePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ExtractDataPage />} />
      <Route path="/Invoice" element={<InvoicePage />} />
    </Routes>
  );
}

export default App;
