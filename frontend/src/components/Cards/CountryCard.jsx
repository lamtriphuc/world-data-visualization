import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { IoIosHeart } from 'react-icons/io';
import { Link } from 'react-router-dom';

const CountryCard = ({
	flag,
	name,
	population,
	region,
	capital,
	code,
	isFavorite = false,
	onToggleFavorite,
}) => {
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

	const [favorite, setFavorite] = useState(isFavorite);

	const [user, setUser] = useState(null);

	useEffect(() => {
		const loadUser = () => {
			const avatar = localStorage.getItem('avatar');
			const name = localStorage.getItem('name');
			if (avatar && name) setUser({ avatar, name });
			else {
				setUser(null);
				setFavorite(favorite);
			}
		};

		loadUser(); // chạy lần đầu

		// Lắng nghe khi user thay đổi
		window.addEventListener('userChanged', loadUser);

		return () => window.removeEventListener('userChanged', loadUser);
	}, [favorite]);

	const handleFavoriteClick = (e) => {
		e.stopPropagation(); // ⛔ chặn event click lan ra ngoài
		e.preventDefault();
		setFavorite(!favorite);
		onToggleFavorite(name, !favorite);
	};

	return (
		<div className='relative flex flex-col'>
			<div className='relative'>
				<img
					ref={imgRef}
					src={imageSrc}
					alt={name}
					className='w-full h-40 object-cover'
				/>
				{/* Icon yêu thích */}
				{user && (
					<button
						onClick={handleFavoriteClick}
						className='absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition'>
						<IoIosHeart
							className={`w-6 h-6 cursor-pointer ${
								favorite ? 'fill-red-500 text-red-500' : 'text-gray-500'
							}`}
						/>
					</button>
				)}
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
						{t('region')}: {t(`main_region.${region}`)}
					</p>
					<p>
						{t('capital')}: {capital}
					</p>
				</div>
			</Link>
		</div>
	);
};
export default CountryCard;
