import Layout from './components/Layout';
import { Routes, Route } from 'react-router-dom';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import RoadmapsPage from './pages/RoadmapsPage';
import RoadmapDetailPage from './pages/RoadmapDetailPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/roadmaps" element={<RoadmapsPage />} />
        <Route path="/roadmaps/:id" element={<RoadmapDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  );
}

export default App;