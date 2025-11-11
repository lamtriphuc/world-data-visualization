import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './i18n';
import { GoogleOAuthProvider } from '@react-oauth/google';

const gooleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<GoogleOAuthProvider clientId={gooleClientId}>
			<ThemeProvider>
				<App />
			</ThemeProvider>
		</GoogleOAuthProvider>
	</StrictMode>
);
