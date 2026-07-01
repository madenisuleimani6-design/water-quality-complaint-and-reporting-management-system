import { BrowserRouter } from "react-router-dom";

import { ProfileProvider } from "@/contexts/ProfileContext";
import { AppRouter } from "@/routes/AppRouter";

export function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <AppRouter />
      </ProfileProvider>
    </BrowserRouter>
  );
}
