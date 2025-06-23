import React, { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FarmOriginPlatform } from "@beratrax/core/src/types/enums";
import pools_json from "@beratrax/core/src/config/constants/pools_json";
import { isStagging } from "@beratrax/core/src/config/constants";
import { backendApi } from "@beratrax/core/src/api";

interface APRValues {
	feeApr: string;
	rewardsApr: string;
	pointsApr: string;
}

interface BurrBearVault {
	id: number;
	name: string;
	lp_address: string;
	vault_addr: string;
	currentAprs?: APRValues;
}

const BurrBearAdmin: React.FC = () => {
	const navigate = useNavigate();
	const [vaults, setVaults] = useState<BurrBearVault[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [loadingVaultId, setLoadingVaultId] = useState<number | null>(null);
	const [message, setMessage] = useState({ text: "", type: "" });
	const [password, setPassword] = useState("");

	// Check if domain is localhost or staging
	const isLocalOrStaging = window.location.hostname === "localhost" || window.location.hostname.includes("127.0.0.1") || isStagging;

	useEffect(() => {
		// Redirect if not on localhost or staging
		if (!isLocalOrStaging) {
			navigate("/");
			return;
		}

		// Get BurrBear vaults from pools_json
		const burrbearVaults = pools_json
			.filter((pool) => pool.originPlatform === FarmOriginPlatform.Burrbear.name)
			.map((pool) => ({
				id: pool.id,
				name: pool.name,
				lp_address: pool.lp_address,
				vault_addr: pool.vault_addr,
				currentAprs: {
					feeApr: "0",
					rewardsApr: "0",
					pointsApr: "0",
				},
			}));

		setVaults(burrbearVaults);
	}, [isLocalOrStaging, navigate]);

	const handleSubmit = async (vaultIndex: number) => {
		if (!password) {
			setMessage({
				text: "Password is required for authentication",
				type: "error",
			});
			return;
		}

		const vault = vaults[vaultIndex];
		setLoadingVaultId(vault.id);
		setIsLoading(true);

		try {
			// Example API call (commented out)
			const response = await backendApi.post(
				"vault/update-apy",
				{
					farmId: vault.id,
					rewardsApr: vault.currentAprs?.rewardsApr,
					feeApr: vault.currentAprs?.feeApr,
					pointsApr: vault.currentAprs?.pointsApr,
				},
				{
					headers: {
						"x-api-key": password,
					},
				}
			);
			if (response.status !== 200) {
				throw new Error("Authentication failed or API error");
			}

			setMessage({
				text: `Successfully updated APRs for ${vault.name}`,
				type: "success",
			});

			// Reset message after 3 seconds
			setTimeout(() => setMessage({ text: "", type: "" }), 3000);
		} catch (error) {
			console.error("Error updating APRs:", error);
			setMessage({
				text: "Failed to update APRs. Please check your password and try again.",
				type: "error",
			});
		} finally {
			setIsLoading(false);
			setLoadingVaultId(null);
		}
	};

	const handleInputChange = (vaultIndex: number, field: keyof APRValues, value: string) => {
		const updatedVaults = [...vaults];
		if (!updatedVaults[vaultIndex].currentAprs) {
			updatedVaults[vaultIndex].currentAprs = {
				feeApr: "0",
				rewardsApr: "0",
				pointsApr: "0",
			};
		}

		// Ensure only numbers and decimals are entered
		if (value === "" || /^(\d+)?\.?\d*$/.test(value)) {
			// If current value is "0" and new value isn't empty or a decimal point,
			// replace the 0 instead of appending to it
			if (updatedVaults[vaultIndex].currentAprs![field] === "0" && value !== "" && value !== "0" && value !== "0.") {
				updatedVaults[vaultIndex].currentAprs![field] = value.replace(/^0+/, "");
			} else {
				updatedVaults[vaultIndex].currentAprs![field] = value;
			}
			setVaults(updatedVaults);
		}
	};

	const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	if (!isLocalOrStaging) {
		return null; // Don't render anything if not on localhost or staging
	}

	return (
		<div className="max-w-7xl mx-auto p-8 text-white">
			<h1 className="text-4xl font-bold mb-4 text-center text-textPrimary">BurrBear Vaults APR Management</h1>
			<p className="text-base mb-8 text-center text-gray-400">Update APR values for BurrBear vaults.</p>

			{message.text && (
				<div
					className={`p-4 mb-6 rounded-lg text-center animate-fade-in ${
						message.type === "success"
							? "bg-green-900/20 border border-green-500/30 text-textPrimary"
							: "bg-red-900/20 border border-red-500/30 text-red-400"
					}`}
				>
					{message.text}
				</div>
			)}

			{/* Password Input Field */}
			<div className="mb-8 max-w-md mx-auto">
				<label htmlFor="admin-password" className="block mb-2 font-medium">
					Admin Password
				</label>
				<input
					id="admin-password"
					type="password"
					value={password}
					onChange={handlePasswordChange}
					placeholder="Enter admin password"
					className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-textPrimary bg-bgSecondary text-white"
				/>
				<p className="mt-2 text-xs text-gray-400">Password is required for updating APR values</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
				{vaults.map((vault, index) => (
					<div
						key={vault.id}
						className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 hover:translate-y-[-2px] transition-all hover:shadow-xl"
					>
						<h2 className="text-xl font-bold mb-4 text-textPrimary">{vault.name}</h2>
						<p className="text-xs text-gray-400 break-all mb-2">
							<span className="font-bold text-white">LP Address:</span> {vault.lp_address}
						</p>
						<p className="text-xs text-gray-400 break-all mb-2">
							<span className="font-bold text-white">Vault Address:</span> {vault.vault_addr}
						</p>

						<form className="mt-6">
							<div className="mb-4">
								<label htmlFor={`feeApr-${vault.id}`} className="block mb-2 font-medium">
									Fee APR (%)
								</label>
								<input
									id={`feeApr-${vault.id}`}
									type="text"
									value={vault.currentAprs?.feeApr || ""}
									onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(index, "feeApr", e.target.value)}
									placeholder="e.g. 12.5"
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-textPrimary bg-bgSecondary text-white"
								/>
							</div>

							<div className="mb-4">
								<label htmlFor={`rewardsApr-${vault.id}`} className="block mb-2 font-medium">
									Rewards APR (%)
								</label>
								<input
									id={`rewardsApr-${vault.id}`}
									type="text"
									value={vault.currentAprs?.rewardsApr || ""}
									onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(index, "rewardsApr", e.target.value)}
									placeholder="e.g. 8.3"
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-textPrimary bg-bgSecondary text-white"
								/>
							</div>

							<div className="mb-4">
								<label htmlFor={`pointsApr-${vault.id}`} className="block mb-2 font-medium">
									Points APR (%)
								</label>
								<input
									id={`pointsApr-${vault.id}`}
									type="text"
									value={vault.currentAprs?.pointsApr || ""}
									onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(index, "pointsApr", e.target.value)}
									placeholder="e.g. 15.0"
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-textPrimary bg-bgSecondary text-white"
								/>
							</div>

							<button
								onClick={() => handleSubmit(index)}
								disabled={isLoading && loadingVaultId === vault.id}
								type="button"
								className={`w-full py-2 px-4 rounded font-bold mt-4 transition-all ${
									isLoading && loadingVaultId === vault.id
										? "bg-gray-500 opacity-70 cursor-not-allowed"
										: "bg-buttonPrimaryLight hover:bg-buttonPrimaryLight/80 text-black"
								}`}
							>
								{isLoading && loadingVaultId === vault.id ? "Updating..." : "Update APRs"}
							</button>
						</form>
					</div>
				))}
			</div>
		</div>
	);
};

export default BurrBearAdmin;
