import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const UserMenu = () => {
	const { t } = useTranslation();

	const [user, setUser] = useState(null);
	const [open, setOpen] = useState(false);
	const menuRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		const avatar = localStorage.getItem('avatar');
		const name = localStorage.getItem('name');
		if (avatar && name) {
			setUser({ avatar, name });
		}
	}, []);

	// Đóng menu khi click ra ngoài
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setOpen(false);
			}
		};
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, []);

	useEffect(() => {
		const loadUser = () => {
			const avatar = localStorage.getItem('avatar');
			const name = localStorage.getItem('name');
			if (avatar && name) setUser({ avatar, name });
			else setUser(null);
		};

		loadUser(); // chạy lần đầu
		window.addEventListener('userChanged', loadUser);
		return () => window.removeEventListener('userChanged', loadUser);
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('avatar');
		localStorage.removeItem('name');
		localStorage.removeItem('token');
		window.dispatchEvent(new Event('userChanged'));
		setUser(null);
		setOpen(false);
		navigate('/');
	};

	if (!user) {
		return (
			<Link to='/login' className=''>
				{t('login')}
			</Link>
		);
	}

	return (
		<div className='relative' ref={menuRef}>
			{/* Avatar */}
			<div
				className='w-10 h-10 cursor-pointer relative group'
				onClick={() => setOpen(!open)}>
				<img
					src={user.avatar}
					alt={user.name}
					className='w-10 h-10 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600'
					referrerPolicy='no-referrer'
				/>
				{/* Tooltip hiển thị tên */}
				<span
					onClick={() => navigate('/favorite')}
					className='absolute bottom-[-1.8rem] left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap max-w-[200px] truncate'>
					{user.name}
				</span>
			</div>

			{/* Menu đăng xuất */}
			{open && (
				<div className='absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 shadow-lg rounded-lg p-2 z-50'>
					<p className='text-center text-sm font-medium mb-2 text-gray-700 dark:text-gray-200'>
						{user.name}
					</p>
					<button
						onClick={() => navigate('/favorite')}
						className='cursor-pointer w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition'>
						{t('favorites')}
					</button>
					<button
						onClick={handleLogout}
						className='cursor-pointer w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition'>
						{t('logout')}
					</button>
				</div>
			)}
		</div>
	);
};

export default UserMenu;
