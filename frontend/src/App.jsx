import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import CountryDetails from './pages/CountryDetails';
import AppLayout from './components/Layout/AppLayout';
import Comparison from './pages/Comparison';
import DashBoard from './pages/DashBoard';
import Login from './pages/Login';
import Loading from './components/Layout/Loading';

const App = () => {
	const CountryList = lazy(() => import('./pages/CountryList'));

	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<AppLayout />}>
					<Route
						index
						element={
							<Suspense fallback={<Loading />}>
								<CountryList />
							</Suspense>
						}
					/>
					<Route path='/country/:code' element={<CountryDetails />} />
					<Route path='/comparison' element={<Comparison />} />
					<Route path='/dashboard' element={<DashBoard />} />
					<Route path='/login' element={<Login />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
};
export default App;
