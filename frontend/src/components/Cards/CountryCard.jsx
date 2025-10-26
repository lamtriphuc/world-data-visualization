import { useTranslation } from 'react-i18next';

const CountryCard = ({ name, population, region, capital, flag }) => {
	const { t } = useTranslation();

	return (
		<div className='flex flex-col'>
			<div>
				<img className='object-cover' src={flag} alt={name} />
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
