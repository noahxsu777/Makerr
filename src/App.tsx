import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";

const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Press = lazy(() => import("./pages/Press"));
const Careers = lazy(() => import("./pages/Careers"));
const Admin = lazy(() => import("./pages/Admin"));

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
}

function App() {
  // El dashboard de admin no es parte del sitio de marketing — sin navbar
  // ni footer, para que no se sienta como una página más de la app.
  const isAdminRoute = useLocation().pathname === "/rtx";

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre-nosotros" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/prensa" element={<Press />} />
          <Route path="/carreras" element={<Careers />} />
          <Route path="/rtx" element={<Admin />} />
        </Routes>
      </Suspense>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
