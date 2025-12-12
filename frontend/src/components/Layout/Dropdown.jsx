import { useState, useRef, useEffect } from 'react';
import { FaAngleDown } from 'react-icons/fa6';

const Dropdown = ({ label = 'Menu', items = [], onSelect }) => {
	const [open, setOpen] = useState(false);
	const menuRef = useRef();

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
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
							<li key={index} className="px-2">
								{/* chọn cấp 1 */}
								<div
									onClick={() => {
										onSelect(item.value);
										setOpen(false);
									}}
									className="px-2 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
									{item.label}
								</div>


								{/* nếu có children → hiển thị */}
								{item.children && (
									<ul className="ml-4 pl-2 mt-1">
										{item.children.map((child, cIdx) => (
											<li
												key={cIdx}
												onClick={() => {
													onSelect(`${child.value}`);
													setOpen(false);
												}}
												className="px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
												{child.label}
											</li>
										))}
									</ul>
								)}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default Dropdown;
