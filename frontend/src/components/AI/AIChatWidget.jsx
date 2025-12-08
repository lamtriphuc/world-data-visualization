import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
	HiSparkles,
	HiXMark,
	HiPaperAirplane,
	HiChevronDown,
} from 'react-icons/hi2';
import { aiChat } from '../../services/ai.service';
import { Link } from 'react-router-dom';

const AIChatWidget = () => {
	const { t, i18n } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);

	const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en';

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	const handleSend = async () => {
		if (!input.trim() || loading) return;

		const userMessage = { role: 'user', content: input };
		setMessages((prev) => [...prev, userMessage]);
		setInput('');
		setLoading(true);

		try {
			const history = messages.slice(-6); // Last 6 messages for context
			const result = await aiChat(input, history, currentLang);

			const aiMessage = {
				role: 'assistant',
				content: result.answer,
				countries: result.countriesData || [],
				followUp: result.followUpQuestions || [],
			};
			setMessages((prev) => [...prev, aiMessage]);
		} catch {
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content:
						t('chat_error') || 'Sorry, something went wrong. Please try again.',
					isError: true,
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleFollowUp = (question) => {
		setInput(question);
		inputRef.current?.focus();
	};

	return (
		<>
			{/* Chat Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-50 ${
					isOpen
						? 'bg-gray-600 hover:bg-gray-700'
						: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
				}`}>
				{isOpen ? (
					<HiChevronDown className='w-6 h-6 text-white' />
				) : (
					<HiSparkles className='w-6 h-6 text-white' />
				)}
			</button>

			{/* Chat Window */}
			{isOpen && (
				<div className='fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200 dark:border-gray-700'>
					{/* Header */}
					<div className='bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<HiSparkles className='w-5 h-5 text-white' />
							<span className='text-white font-medium'>
								{t('ai_assistant') || 'AI Assistant'}
							</span>
						</div>
						<button
							onClick={() => setIsOpen(false)}
							className='text-white/80 hover:text-white'>
							<HiXMark className='w-5 h-5' />
						</button>
					</div>

					{/* Messages */}
					<div className='flex-1 overflow-y-auto p-4 space-y-4'>
						{messages.length === 0 && (
							<div className='text-center text-gray-500 dark:text-gray-400 mt-8'>
								<HiSparkles className='w-12 h-12 mx-auto mb-3 text-indigo-400' />
								<p className='font-medium'>
									{t('chat_welcome') || 'Ask me anything about countries!'}
								</p>
								<p className='text-sm mt-2'>
									{t('chat_examples') ||
										'Try: "Which country has the highest population?" or "Tell me about Japan"'}
								</p>
							</div>
						)}

						{messages.map((msg, idx) => (
							<div
								key={idx}
								className={`flex ${
									msg.role === 'user' ? 'justify-end' : 'justify-start'
								}`}>
								<div
									className={`max-w-[80%] rounded-2xl px-4 py-2 ${
										msg.role === 'user'
											? 'bg-indigo-500 text-white'
											: msg.isError
											? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
											: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
									}`}>
									<p className='whitespace-pre-wrap'>{msg.content}</p>

									{/* Related Countries */}
									{msg.countries?.length > 0 && (
										<div className='mt-2 flex flex-wrap gap-2'>
											{msg.countries.map((c) => (
												<Link
													key={c.code}
													to={`/country/${c.code}`}
													className='inline-flex items-center gap-1 px-2 py-1 bg-white/20 dark:bg-black/20 rounded-lg text-xs hover:bg-white/30 dark:hover:bg-black/30'>
													<img
														src={c.flag}
														alt=''
														className='w-4 h-3 object-cover rounded'
													/>
													{c.name}
												</Link>
											))}
										</div>
									)}

									{/* Follow-up Questions */}
									{msg.followUp?.length > 0 && (
										<div className='mt-3 space-y-1'>
											{msg.followUp.map((q, i) => (
												<button
													key={i}
													onClick={() => handleFollowUp(q)}
													className='block w-full text-left text-xs px-2 py-1 bg-white/10 dark:bg-black/10 rounded hover:bg-white/20 dark:hover:bg-black/20'>
													{q}
												</button>
											))}
										</div>
									)}
								</div>
							</div>
						))}

						{loading && (
							<div className='flex justify-start'>
								<div className='bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2'>
									<div className='flex gap-1'>
										<span
											className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
											style={{ animationDelay: '0ms' }}
										/>
										<span
											className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
											style={{ animationDelay: '150ms' }}
										/>
										<span
											className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
											style={{ animationDelay: '300ms' }}
										/>
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>

					{/* Input */}
					<div className='p-3 border-t border-gray-200 dark:border-gray-700'>
						<div className='flex gap-2'>
							<input
								ref={inputRef}
								type='text'
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder={
									t('chat_placeholder') || 'Ask about any country...'
								}
								className='flex-1 px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
								disabled={loading}
							/>
							<button
								onClick={handleSend}
								disabled={!input.trim() || loading}
								className='w-10 h-10 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white'>
								<HiPaperAirplane className='w-5 h-5' />
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default AIChatWidget;
