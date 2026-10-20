import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testConnection } from './lib/firebase';

// Verify connection to provisioned Firestore on app startup
testConnection();

createRoot(document.getElementById('root')!).render(<App />);

