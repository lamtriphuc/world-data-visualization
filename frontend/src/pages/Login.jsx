import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const Login = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [error, setError] = useState('');

	const handleGoogleLogin = async (credentialResponse) => {
		try {
			setError('');
			const response = await googleLogin(credentialResponse.credential);

			localStorage.setItem('token', response.accessToken);
			localStorage.setItem('name', response.user.name);
			localStorage.setItem('avatar', response.user.avatar);

			window.dispatchEvent(new Event('userChanged'));
			navigate('/');
		} catch (error) {
			console.log(error);
			setError(t('login_failed') || 'Đăng nhập thất bại');
		}
	};

	return (
		<div className='min-h-[400px] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4'>
			<div className='w-full max-w-md'>
				{/* Card */}
				<div className='bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-8'>
					{/* Header */}
					<div className='text-center space-y-2'>
						<h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
							{t('welcome')}
						</h1>
						<p className='text-slate-600 dark:text-slate-400 text-sm'>
							{t('login_description')}
						</p>
					</div>

					{/* Error Message */}
					{error && (
						<div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg'>
							{error}
						</div>
					)}

					{/* Google Login Button */}
					<div className='flex justify-center'>
						<div className='w-full'>
							<GoogleLogin
								onSuccess={handleGoogleLogin}
								onError={() => {
									setError(t('login_failed'));
								}}
								width='100%'
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
