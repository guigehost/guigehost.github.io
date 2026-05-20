import { Routes, Route } from "react-router";
import Header from "@/components/Header";
import Footer from "@/sections/Footer";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import ArticleDetail from "./pages/ArticleDetail";
import Tools from "./pages/Tools";
import AppTool from "./pages/AppTool";
import ToolLanding from "./pages/ToolLanding";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserCenter from "./pages/UserCenter";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminArticles from "./pages/AdminArticles";
import AdminArticleEdit from "./pages/AdminArticleEdit";
import AdminTools from "./pages/AdminTools";
import AdminLinks from "./pages/AdminLinks";
import AdminSettings from "./pages/AdminSettings";
import AdminTutiantian from "./pages/AdminTutiantian";
import AdminUsers from "./pages/AdminUsers";
import AdminPackages from "./pages/AdminPackages";
import AdminOrders from "./pages/AdminOrders";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

function TutiantianRedirect() {
  if (typeof window !== "undefined") {
    window.location.href = "/apps/tutiantian/";
  }
  return null;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route
        path="/blog"
        element={
          <PublicLayout>
            <Blog />
          </PublicLayout>
        }
      />
      <Route
        path="/blog/:slug"
        element={
          <PublicLayout>
            <ArticleDetail />
          </PublicLayout>
        }
      />
      <Route
        path="/tools"
        element={
          <PublicLayout>
            <Tools />
          </PublicLayout>
        }
      />
      <Route
        path="/tools/:slug"
        element={
          <PublicLayout>
            <ToolLanding />
          </PublicLayout>
        }
      />
      {/* Tutiantian uses its own frontend served by Nginx alias */}
      <Route path="/apps/tutiantian" element={<TutiantianRedirect />} />
      <Route
        path="/apps/:slug"
        element={
          <PublicLayout>
            <AppTool />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User Center */}
      <Route
        path="/user"
        element={
          <UserLayout>
            <UserCenter />
          </UserLayout>
        }
      />

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="articles" element={<AdminArticles />} />
        <Route path="articles/new" element={<AdminArticleEdit />} />
        <Route path="articles/edit/:id" element={<AdminArticleEdit />} />
        <Route path="tools" element={<AdminTools />} />
        <Route path="links" element={<AdminLinks />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="tutiantian" element={<AdminTutiantian />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
