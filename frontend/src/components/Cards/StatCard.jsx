import React from 'react';

const StatCard = ({
	title,
	subtitle,
	value,
	icon: Icon,
	iconColor,
	bgColor,
}) => {
	return (
		<div>
			<div className='p-6 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow rounded-xl'>
				<div className='flex flex-wrap items-center justify-between'>
					<div>
						<p className='text-gray-600 dark:text-gray-300 mb-2'>{title}</p>
						<div className='flex gap-2'>
							<p className='text-gray-900 dark:text-white text-2xl font-medium'>
								{value?.toLocaleString()}
							</p>
							{subtitle && (
								<p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
									{subtitle}
								</p>
							)}
						</div>
					</div>
					<div className={`${bgColor} p-3 rounded-lg`}>
						<Icon className={`w-8 h-8 ${iconColor}`}></Icon>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StatCard;
