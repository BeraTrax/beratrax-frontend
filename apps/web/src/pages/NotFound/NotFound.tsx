import React from "react";
import { useNavigate } from "react-router-dom";
import { RoutesPaths } from "@beratrax/core/src/config/constants";

const NotFound: React.FC = () => {
	const navigate = useNavigate();

	const handleGoHome = () => {
		navigate(RoutesPaths.Home);
	};

	const handleGoToEarn = () => {
		navigate(RoutesPaths.Farms);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-bgDark text-textWhite p-8 font-league-spartan">
			<div className="absolute inset-0 opacity-5">
				<div className="absolute top-20 right-20 w-96 h-96 bg-gradientPrimary rounded-full blur-3xl"></div>
				<div className="absolute bottom-20 left-20 w-64 h-64 bg-buttonPrimary rounded-full blur-2xl"></div>
			</div>

			{/* Main content */}
			<div className="relative z-10 text-center max-w-2xl mx-auto">
				<div className="mb-8">
					<h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-gradientPrimary via-buttonPrimary to-gradientPrimary bg-clip-text text-transparent animate-pulse-slow">
						404
					</h1>
				</div>

				<div className="mb-8 space-y-4">
					<h2 className="text-3xl md:text-4xl font-bold text-textWhite mb-4">Page Not Found</h2>
					<p className="text-lg text-textSecondary max-w-md mx-auto leading-relaxed">
						Oops! The page you're looking for doesn't exist or has been moved to a different location.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
					<button
						onClick={handleGoHome}
						className="group relative px-8 py-4 bg-gradient-to-r from-buttonPrimary to-gradientPrimary text-bgDark font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-buttonPrimary/20 min-w-[200px]"
					>
						<span className="relative z-10">Go Back Home</span>
						<div className="absolute inset-0 bg-gradient-to-r from-gradientPrimary to-buttonPrimary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
					</button>

					<button
						onClick={handleGoToEarn}
						className="px-8 py-4 bg-bgSecondary border-2 border-borderLight text-textWhite font-bold text-lg rounded-2xl transition-all duration-300 hover:bg-borderLight hover:text-bgDark hover:border-gradientPrimary min-w-[200px]"
					>
						Explore Farms
					</button>
				</div>

				<div className="mt-8 flex justify-center space-x-2">
					<div className="w-2 h-2 bg-gradientPrimary rounded-full animate-pulse"></div>
					<div className="w-2 h-2 bg-buttonPrimary rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
					<div className="w-2 h-2 bg-gradientPrimary rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
