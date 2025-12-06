import React, { useEffect, useState } from 'react';
import {
	addFavorite,
	getFavoriteCodes,
	getFavoriteCountries,
	removeFavorite,
} from '../services/auth.service';
import CountryCard from '../components/Cards/CountryCard';

const Favorite = () => {
	const [countries, setCountries] = useState([]);
	const [favorites, setFavorites] = useState([]);

	useEffect(() => {
		const fetchFavorites = async () => {
			const token = localStorage.getItem('token');
			if (!token) return;

			try {
				const data = await getFavoriteCodes();
				setFavorites(data);
			} catch (error) {
				console.log('Get favorite fail: ', error);
			}
		};

		const fetchFavoriteCountries = async () => {
			const token = localStorage.getItem('token');
			if (!token) return;

			try {
				const data = await getFavoriteCountries();
				setCountries(data);
			} catch (error) {
				console.log('Get favorite fail: ', error);
			}
		};

		fetchFavorites();
		fetchFavoriteCountries();
	}, []);

	const handleToggleFavorite = async (countryCode, newState) => {
		try {
			if (newState) {
				await addFavorite(countryCode);
				console.log('Đã thêm yêu thích:', countryCode);
			} else {
				await removeFavorite(countryCode);
				console.log('Đã bỏ yêu thích:', countryCode);
			}
		} catch (error) {
			console.log('Favorite err: ', error);
		}
	};

	return (
		<div>
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8'>
				{countries.map((country) => (
					<CountryCard
						key={country.cca3}
						name={country.name}
						population={country.population.value.toLocaleString()}
						region={country.region}
						capital={country.capital}
						flag={country.flag}
						code={country.cca3}
						isFavorite={favorites.includes(country.cca3)}
						onToggleFavorite={(name, newState) =>
							handleToggleFavorite(country.cca3, newState)
						}
					/>
				))}
			</div>
		</div>
	);
};

export default Favorite;
