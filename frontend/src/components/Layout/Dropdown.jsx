import { useState, useRef, useEffect } from 'react';
import { FaAngleDown } from 'react-icons/fa6';

const Dropdown = ({ label = 'Menu', items = [] }) => {
	const [open, setOpen] = useState(false);
	const menuRef = useRef();

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div className='relative inline-block text-left' ref={menuRef}>
			<button
				onClick={() => setOpen(!open)}
				className='flex gap-2 items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md shadow transition'>
				{label}
				<FaAngleDown />
			</button>

			{open && (
				<div className='absolute mt-1 left-0 w-40 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-lg border border-gray-200 animate-fadeIn z-10'>
					<ul className='py-2'>
						{items.map((item, index) => (
							<li
								key={index}
								onClick={() => {
									item.onClick && item.onClick();
									setOpen(false);
								}}
								className='px-4 py-2 cursor-pointer hover:bg-gray-100 transition'>
								{item.label}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default Dropdown;
