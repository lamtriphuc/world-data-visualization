import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CountryList from './pages/CountryList';
import CountryDetails from './pages/CountryDetails';
import AppLayout from './components/Layout/AppLayout';
import Comparison from './pages/Comparison';
import DashBoard from './pages/DashBoard';

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<AppLayout />}>
					<Route index element={<CountryList />} />
					<Route path='/country' element={<CountryDetails />} />
					<Route path='/comparison' element={<Comparison />} />
					<Route path='/dashboard' element={<DashBoard />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
};
export default App;
