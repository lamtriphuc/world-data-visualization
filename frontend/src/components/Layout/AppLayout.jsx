import Header from './Header';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
	return (
		<div className='min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100'>
			<Header />
			<main className='p-6 max-w-7xl mx-auto'>
				<Outlet />
			</main>
		</div>
	);
};

export default AppLayout;
