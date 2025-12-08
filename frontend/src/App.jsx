import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import CountryDetails from './pages/CountryDetails';
import AppLayout from './components/Layout/AppLayout';
import Comparison from './pages/Comparison';
import DashBoard from './pages/DashBoard';
import Login from './pages/Login';
import Loading from './components/Layout/Loading';
import Favorite from './pages/Favorite';
import Continent from './pages/Continent';
import TravelTracker from './pages/TravelTracker';
import { AIChatWidget } from './components/AI';

const App = () => {
	const CountryList = lazy(() => import('./pages/CountryList'));

	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<AppLayout />}>
					<Route index element={<DashBoard />} />
					<Route
						path='/countries'
						element={
							<Suspense fallback={<Loading />}>
								<CountryList />
							</Suspense>
						}
					/>
					<Route path='/country/:code' element={<CountryDetails />} />
					<Route path='/comparison' element={<Comparison />} />
					<Route path='/login' element={<Login />} />
					<Route path='/favorite' element={<Favorite />} />
					<Route path='/travel-tracker' element={<TravelTracker />} />
					<Route path='/continent/:region' element={<Continent />} />
				</Route>
			</Routes>
			{/* AI Chat Widget - Floating on all pages */}
			<AIChatWidget />
		</BrowserRouter>
	);
};
export default App;
