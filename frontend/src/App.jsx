import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CountryList from './pages/CountryList';
import CountryDetails from './pages/CountryDetails';
import AppLayout from './components/Layout/AppLayout';
import Comparison from './pages/Comparison';
import DashBoard from './pages/DashBoard';
import Login from './pages/Login';
import Favorite from './pages/Favorite';

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<AppLayout />}>
					<Route index element={<CountryList />} />
					<Route path='/country/:code' element={<CountryDetails />} />
					<Route path='/comparison' element={<Comparison />} />
					<Route path='/dashboard' element={<DashBoard />} />
					<Route path='/login' element={<Login />} />
					<Route path='/favorite' element={<Favorite />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
};
export default App;
