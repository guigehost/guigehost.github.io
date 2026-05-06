import { Routes, Route } from "react-router";
import Header from "@/components/Header";
import Footer from "@/sections/Footer";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import ArticleDetail from "./pages/ArticleDetail";
import Tools from "./pages/Tools";
import Apps from "./pages/Apps";
import Duanju from "./pages/Duanju";
import AppTool from "./pages/AppTool";
import About from "./pages/About";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminArticles from "./pages/AdminArticles";
import AdminArticleEdit from "./pages/AdminArticleEdit";
import AdminTools from "./pages/AdminTools";
import AdminLinks from "./pages/AdminLinks";
import AdminSettings from "./pages/AdminSettings";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
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
        path="/apps"
        element={
          <PublicLayout>
            <Apps />
          </PublicLayout>
        }
      />
      <Route
        path="/apps/duanju"
        element={
          <PublicLayout>
            <Duanju />
          </PublicLayout>
        }
      />
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

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="articles" element={<AdminArticles />} />
        <Route path="articles/new" element={<AdminArticleEdit />} />
        <Route path="articles/edit/:id" element={<AdminArticleEdit />} />
        <Route path="tools" element={<AdminTools />} />
        <Route path="links" element={<AdminLinks />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
