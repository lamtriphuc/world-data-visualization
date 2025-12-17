import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { translateCapital } from '../../scripts/capital_names_vi';

const CountryCard = ({ flag, name, population, region, capital, code }) => {
	const [imageSrc, setImageSrc] = useState(null);
	const imgRef = useRef();
	const currentLang = localStorage.getItem('lang');

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
		<div className='relative flex flex-col'>
			<div className='relative group'>
				<img
					ref={imgRef}
					src={imageSrc}
					alt={name}
					className='w-full h-40 object-cover'
				/>
			</div>
			<Link
				to={`/country/${code}`}
				className='block px-4 py-8 dark:bg-gray-800 shadow-[0_4px_20px_hsla(0,0%,0%,10%)] hover:shadow-lg transition'>
				<h2 className='pb-4 font-semibold text-xl'>{name}</h2>
				<div>
					<p className='pb-2'>
						{t('population')}: {population.toLocaleString()}
					</p>
					<p className='pb-2'>
						{t('region')}:{' '}
						{t(`main_region.${region === 'Antarctic' ? 'Antarctica' : region}`)}
					</p>
					<p>
						{t('capital')}:{' '}
						{currentLang === 'vi' ? translateCapital(capital) : capital}
					</p>
				</div>
			</Link>
		</div>
	);
};
export default CountryCard;
