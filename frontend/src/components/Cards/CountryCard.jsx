import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';

const CountryCard = ({ flag, name, population, region, capital }) => {
	const [imageSrc, setImageSrc] = useState(null);
	const imgRef = useRef();

	useEffect(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setImageSrc(flag);
					observer.unobserve(entry.target);
				}
			});
		});

		if (imgRef.current) {
			observer.observe(imgRef.current);
		}

		return () => observer.disconnect();
	}, [flag]);

	const { t } = useTranslation();

	return (
		<div className='flex flex-col'>
			<div>
				<img
					ref={imgRef}
					src={imageSrc}
					alt={name}
					className='w-full h-40 object-cover'
				/>
			</div>
			<div className='px-4 py-8 dark:bg-gray-800 shadow-[0_4px_20px_hsla(0,0%,0%,10%)]'>
				<h2 className='pb-4 font-semibold text-xl'>{name}</h2>
				<div>
					<p className='pb-2'>
						{t('population')}: {population.toLocaleString()}
					</p>
					<p className='pb-2'>
						{t('region')}: {t(`main_region.${region}`)}
					</p>
					<p>
						{t('capital')}: {capital}
					</p>
				</div>
			</div>
		</div>
	);
};
export default CountryCard;
