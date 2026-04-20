import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import ContactDetailsPage from "./pages/ContactDetailsPage";
import Layout from "./layout";
import ProfileCard from "./pages/ProfilePage";
import TasksPage from "./pages/TasksPage";
import { RoleProvider } from "./contexts/RoleContext";
import TaskDetails from "./pages/TaskDetails";
import AssignTaskPage from "./pages/AssignTaskPage";
import ContactsPage from "./pages/ContactsPage";

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/contacts/:id" element={<ContactDetailsPage />} />
              <Route path="/profile/:id" element={<ProfileCard />} />
              <Route path="/tasks/my-tasks" element={<TasksPage />} />
              <Route path="/tasks/:id/details" element={<TaskDetails />} />
              <Route path="/assign-task" element={<AssignTaskPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}