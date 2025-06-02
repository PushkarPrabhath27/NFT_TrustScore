import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/ui/LoadingScreen';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { useDarkMode } from './store/store';
import InputPage from './pages/InputPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [loading, setLoading] = React.useState(true);
  const darkMode = useDarkMode();

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'} min-h-screen bg-gradient-to-br from-cyber-black to-cyber-dark text-white`}>
      <Header />
      <motion.main 
        className="container mx-auto px-4 py-20 md:py-24 min-h-[calc(100vh-180px)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<InputPage />} />
            <Route path="/dashboard/:contractAddress" element={<DashboardPage />} />
          </Routes>
        </AnimatePresence>
      </motion.main>
      <Footer />
    </div>
  );
}

export default App;