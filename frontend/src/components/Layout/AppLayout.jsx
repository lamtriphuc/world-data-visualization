import Header from './Header';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
	return (
		<div className='min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100'>
			<Header />
			<main className='px-6 py-8 lg:px-28 lg:pt-10 lg:pb-24'>
				<Outlet />
			</main>
		</div>
	);
};

export default AppLayout;
