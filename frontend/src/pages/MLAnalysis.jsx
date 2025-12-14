// MLAnalysis.jsx - Component hiển thị ML analysis (với Tailwind CSS)
import { useState, useEffect } from 'react';
import { FiBarChart2, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { FaNetworkWired } from 'react-icons/fa';
import Loading from '../components/Layout/Loading';

const MLAnalysis = () => {
	const [activeTab, setActiveTab] = useState('clusters');
	const [clustersData, setClustersData] = useState(null);
	const [similarCountries, setSimilarCountries] = useState(null);
	const [networkData, setNetworkData] = useState(null);
	const [modelInfo, setModelInfo] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedCountry, setSelectedCountry] = useState('USA');
	const [retraining, setRetraining] = useState(false);

	const API_BASE = 'http://localhost:3001/api/ml';

	useEffect(() => {
		fetchMLData();
	}, []);

	const fetchMLData = async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch all data in parallel
			const [clusters, network, modelInfo] = await Promise.all([
				fetch(`${API_BASE}/clusters`).then((r) => r.json()),
				fetch(`${API_BASE}/network-analysis`).then((r) => r.json()),
				fetch(`${API_BASE}/model-info`).then((r) => r.json()),
			]);

			if (clusters.success) {
				setClustersData(clusters.data);
			}
			if (network.success) {
				setNetworkData(network.data);
			}
			if (modelInfo.success) {
				setModelInfo(modelInfo.data);
			}

			// Fetch similar countries for default country
			await fetchSimilarCountries('USA');
		} catch (err) {
			setError(err.message);
			console.error('Error fetching ML data:', err);
		} finally {
			setLoading(false);
		}
	};

	const fetchSimilarCountries = async (countryCode) => {
		try {
			const response = await fetch(
				`${API_BASE}/similar/${countryCode}?top_n=5`
			);
			const data = await response.json();
			if (data.success) {
				setSimilarCountries(data.data);
				setSelectedCountry(countryCode);
			}
		} catch (err) {
			console.error('Error fetching similar countries:', err);
		}
	};

	const handleRetrain = async () => {
		try {
			setRetraining(true);
			const response = await fetch(`${API_BASE}/retrain`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ async: true }),
			});
			const data = await response.json();
			if (data.success) {
				alert('Model retraining started in background');
			}
		} catch (err) {
			console.error('Error triggering retrain:', err);
			alert('Failed to start retraining');
		} finally {
			setRetraining(false);
		}
	};

	if (loading) {
		return <Loading />;
	}

	if (error) {
		return (
			<div className='min-h-screen flex flex-col justify-center items-center text-center gap-5 bg-gray-100 dark:bg-gray-900 p-4'>
				<h2 className='text-3xl font-bold text-red-500'>
					⚠️ Error Loading ML Data
				</h2>
				<p className='text-lg text-gray-600 dark:text-gray-400 max-w-md'>
					{error}
				</p>
				<button
					onClick={fetchMLData}
					className='px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition'>
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-100 dark:bg-gray-900 p-4 lg:p-8'>
			{/* Header */}
			<div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8'>
				<h1 className='text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'>
					🤖 ML Analysis Dashboard
				</h1>
				<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
					{modelInfo && (
						<div className='px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 rounded-lg text-sm text-gray-700 dark:text-gray-300'>
							<span className='font-semibold'>Model:</span>{' '}
							{modelInfo.best_gdp_model} •
							<span className='font-semibold ml-2'>Samples:</span>{' '}
							{modelInfo.num_samples}
						</div>
					)}
					<button
						onClick={handleRetrain}
						disabled={retraining}
						className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-semibold transition'>
						<FiRefreshCw className={retraining ? 'animate-spin' : ''} />
						{retraining ? 'Retraining...' : 'Retrain Models'}
					</button>
				</div>
			</div>

			{/* Tabs */}
			<div className='flex gap-2 mb-6 border-b border-gray-300 dark:border-gray-700 overflow-x-auto'>
				{[
					{ id: 'clusters', label: 'Clusters', icon: FiBarChart2 },
					{ id: 'similar', label: 'Similar Countries', icon: FiTrendingUp },
					{ id: 'network', label: 'Network Analysis', icon: FaNetworkWired },
				].map(({ id, label, icon: Icon }) => (
					<button
						key={id}
						onClick={() => setActiveTab(id)}
						className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
							activeTab === id
								? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
								: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
						}`}>
						<Icon size={18} />
						{label}
					</button>
				))}
			</div>

			{/* Content */}
			<div className='space-y-6'>
				{/* Clusters Tab */}
				{activeTab === 'clusters' && clustersData && (
					<div>
						<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
							Country Clustering Analysis
						</h2>
						<p className='text-gray-600 dark:text-gray-400 mb-6'>
							Countries grouped by economic and geographical similarity
						</p>

						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{clustersData.map((cluster) => (
								<div
									key={cluster.cluster_id}
									className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition'>
									<div className='flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700'>
										<h3 className='text-xl font-bold text-indigo-600'>
											Cluster {cluster.cluster_id}
										</h3>
										<span className='px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm rounded-full font-semibold'>
											{cluster.count} countries
										</span>
									</div>

									<div className='grid grid-cols-3 gap-4 mb-4'>
										<div className='text-center'>
											<p className='text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2'>
												Avg GDP
											</p>
											<p className='text-lg font-bold text-gray-900 dark:text-white'>
												${(cluster.avg_gdp / 1e12).toFixed(2)}T
											</p>
										</div>
										<div className='text-center'>
											<p className='text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2'>
												Avg Pop
											</p>
											<p className='text-lg font-bold text-gray-900 dark:text-white'>
												{(cluster.avg_population / 1e6).toFixed(1)}M
											</p>
										</div>
										<div className='text-center'>
											<p className='text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2'>
												Avg Area
											</p>
											<p className='text-lg font-bold text-gray-900 dark:text-white'>
												{(cluster.avg_area / 1e6).toFixed(2)}M
											</p>
										</div>
									</div>

									<div>
										<p className='text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2'>
											Sample Countries
										</p>
										<div className='flex flex-wrap gap-2'>
											{cluster.countries.slice(0, 6).map((country, idx) => (
												<span
													key={idx}
													className='px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded font-medium'>
													{country}
												</span>
											))}
											{cluster.countries.length > 6 && (
												<span className='px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded font-medium'>
													+{cluster.countries.length - 6}
												</span>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Similar Countries Tab */}
				{activeTab === 'similar' && (
					<div>
						<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
							Find Similar Countries
						</h2>

						<div className='flex gap-3 mb-6'>
							<input
								type='text'
								placeholder='Enter country code (e.g., USA, CHN, GBR)'
								defaultValue={selectedCountry}
								onKeyPress={(e) => {
									if (e.key === 'Enter') {
										fetchSimilarCountries(e.target.value.toUpperCase());
									}
								}}
								className='flex-1 max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'
							/>
							<button
								onClick={() => {
									const input = document.querySelector(
										'input[placeholder*="country code"]'
									);
									fetchSimilarCountries(input.value.toUpperCase());
								}}
								className='px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition'>
								Search
							</button>
						</div>

						{similarCountries && (
							<div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
								<h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
									Countries similar to{' '}
									<span className='text-indigo-600'>
										{similarCountries.country}
									</span>
								</h3>
								<div className='space-y-3'>
									{similarCountries.similar_countries.map((country, idx) => (
										<div
											key={idx}
											className='flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition'>
											<div className='text-2xl font-bold text-purple-600'>
												{idx + 1}
											</div>
											<div className='flex-1'>
												<h4 className='font-semibold text-gray-900 dark:text-white'>
													{country.country}
												</h4>
												<p className='text-sm text-gray-600 dark:text-gray-400'>
													{country.code}
												</p>
											</div>
											<div className='text-center'>
												<span className='px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-semibold'>
													{(country.similarity_score * 100).toFixed(1)}%
												</span>
											</div>
											<div className='text-right text-sm text-gray-600 dark:text-gray-400'>
												<div>GDP: ${(country.gdp / 1e12).toFixed(2)}T</div>
												<div>Pop: {(country.population / 1e6).toFixed(1)}M</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Network Analysis Tab */}
				{activeTab === 'network' && networkData && (
					<div>
						<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
							Geopolitical Network Analysis
						</h2>

						{/* Stats Grid */}
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
							{[
								{
									label: 'Total Countries',
									value: networkData.total_countries,
								},
								{ label: 'Total Borders', value: networkData.total_borders },
								{
									label: 'Global GDP',
									value: `$${(networkData.global_gdp / 1e12).toFixed(1)}T`,
								},
								{
									label: 'Global Population',
									value: `${(networkData.global_population / 1e9).toFixed(2)}B`,
								},
							].map((stat, idx) => (
								<div
									key={idx}
									className='bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
									<p className='text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2'>
										{stat.label}
									</p>
									<p className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'>
										{stat.value}
									</p>
								</div>
							))}
						</div>

						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							{/* Top Borders */}
							<div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
								<h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>
									🌍 Countries with Most Borders
								</h3>
								<div className='space-y-2'>
									{networkData.top_countries_by_borders
										.slice(0, 10)
										.map((country, idx) => (
											<div
												key={idx}
												className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
												<div className='flex items-center gap-3'>
													<span className='font-bold text-indigo-600'>
														{idx + 1}
													</span>
													<span className='font-medium text-gray-900 dark:text-white'>
														{country.name}
													</span>
												</div>
												<span className='text-sm font-semibold text-purple-600'>
													{country.num_borders} borders
												</span>
											</div>
										))}
								</div>
							</div>

							{/* Regional Stats */}
							<div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
								<h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>
									📊 Regional Statistics
								</h3>
								<div className='space-y-3'>
									{Object.entries(networkData.regional_stats).map(
										([region, stats]) => (
											<div
												key={region}
												className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
												<h4 className='font-semibold text-indigo-600 mb-2'>
													{region}
												</h4>
												<div className='grid grid-cols-2 gap-2 text-sm'>
													<div>
														<p className='text-gray-600 dark:text-gray-400'>
															Countries
														</p>
														<p className='font-bold text-gray-900 dark:text-white'>
															{stats.count}
														</p>
													</div>
													<div>
														<p className='text-gray-600 dark:text-gray-400'>
															Total GDP
														</p>
														<p className='font-bold text-gray-900 dark:text-white'>
															${(stats.total_gdp / 1e12).toFixed(2)}T
														</p>
													</div>
													<div>
														<p className='text-gray-600 dark:text-gray-400'>
															Avg Pop
														</p>
														<p className='font-bold text-gray-900 dark:text-white'>
															{(stats.avg_population / 1e6).toFixed(1)}M
														</p>
													</div>
													<div>
														<p className='text-gray-600 dark:text-gray-400'>
															Area
														</p>
														<p className='font-bold text-gray-900 dark:text-white'>
															{(stats.total_area / 1e6).toFixed(1)}M
														</p>
													</div>
												</div>
											</div>
										)
									)}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Footer */}
			{modelInfo && (
				<div className='mt-8 pt-6 border-t border-gray-300 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400'>
					<small>
						Model Version:{' '}
						<span className='font-semibold'>{modelInfo.version}</span> •
						Created:{' '}
						<span className='font-semibold'>
							{new Date(modelInfo.created_at).toLocaleDateString()}
						</span>{' '}
						• Best Model:{' '}
						<span className='font-semibold'>{modelInfo.best_gdp_model}</span>
					</small>
				</div>
			)}
		</div>
	);
};

export default MLAnalysis;
