function analyzeReport() {
	const fileInput = document.getElementById("reportFile");
	const file = fileInput.files[0];
	if (!file) {
		alert("Please upload a file.");
		return;
	}

	const reader = new FileReader();
	reader.onload = function (event) {
		const content = event.target.result;

		// Parse the HTML content
		const parser = new DOMParser();
		const doc = parser.parseFromString(content, "text/html");

		// Initialize variables to store the values
		let totalNetProfit = null;
		let grossProfit = null;
		let grossLoss = null;

		// Example extracted values from the report (to be adjusted based on actual report content)
		const maxDrawdownPercent = 26.44; // Max Drawdown (%)
		const profitFactor = 1.34; // Profit Factor
		const sharpeRatio = 0.56; // Sharpe Ratio
		const recoveryFactor = 0.52; // Recovery Factor
		const lossTradesPercent = 30.61; // Loss Trades (%)

		// Extract Total Net Profit, Gross Profit, and Gross Loss
		const rows = doc.querySelectorAll("tr");
		rows.forEach((row) => {
			const cells = row.querySelectorAll("td");
			cells.forEach((cell, index) => {
				if (cell.textContent.includes("Total Net Profit:")) {
					totalNetProfit = parseFloat(cells[index + 1].querySelector("b").textContent.replace(/[^0-9.-]+/g, ""));
				} else if (cell.textContent.includes("Gross Profit:")) {
					grossProfit = parseFloat(cells[index + 1].querySelector("b").textContent.replace(/[^0-9.-]+/g, ""));
				} else if (cell.textContent.includes("Gross Loss:")) {
					grossLoss = parseFloat(cells[index + 1].querySelector("b").textContent.replace(/[^0-9.-]+/g, ""));
				}
			});
		});

		// Log the extracted data for debugging
		console.log("Total Net Profit:", totalNetProfit);
		console.log("Gross Profit:", grossProfit);
		console.log("Gross Loss:", grossLoss);

		// Create the summary chart
		const summaryCtx = document.getElementById("netProfitChart").getContext("2d");
		const summaryChart = new Chart(summaryCtx, {
			type: "bar",
			data: {
				labels: ["Total Net Profit", "Gross Profit", "Gross Loss"],
				datasets: [
					{
						label: "Amount",
						data: [totalNetProfit, grossProfit, grossLoss],
						backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 99, 132, 0.2)"],
						borderColor: ["rgba(75, 192, 192, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
						borderWidth: 1,
					},
				],
			},
			options: {
				scales: {
					y: {
						beginAtZero: true,
					},
				},
			},
		});

		// Set the height of the indicator charts explicitly
		document.getElementById("riskIndicator").height = 30;
		document.getElementById("burnProbabilityIndicator").height = 30;

		// Calculate the Risk Indicator
		const riskScore = (maxDrawdownPercent / 100) * 0.5 + (1 / profitFactor) * 0.3 + (1 - sharpeRatio) * 0.2;

		// Calculate the Burn Probability Indicator
		const burnProbability = (maxDrawdownPercent / 100) * 0.6 + (1 / recoveryFactor) * 0.3 + (lossTradesPercent / 100) * 0.1;

		// Dynamic Insights
		const riskInsights = generateRiskInsights(riskScore, maxDrawdownPercent, profitFactor, sharpeRatio);
		const burnInsights = generateBurnInsights(burnProbability, maxDrawdownPercent, recoveryFactor, lossTradesPercent);

		document.getElementById("risk-insights").innerHTML = riskInsights;
		document.getElementById("burn-insights").innerHTML = burnInsights;

		// Create the Risk Indicator visualization
		const ctxRisk = document.getElementById("riskIndicator").getContext("2d");
		const riskChart = new Chart(ctxRisk, {
			type: "bar",
			data: {
				labels: ["Risk Score"],
				datasets: [
					{
						label: "Risk Level",
						data: [riskScore],
						backgroundColor: ["rgba(255, 99, 132, 0.6)"],
						borderColor: ["rgba(255, 99, 132, 1)"],
						borderWidth: 1,
					},
				],
			},
			options: {
				indexAxis: "y",
				scales: {
					x: {
						beginAtZero: true,
						max: 1,
					},
				},
				plugins: {
					tooltip: { enabled: true },
					legend: { display: false },
					annotation: {
						annotations: [
							{
								type: "box",
								xMin: 0,
								xMax: 0.3,
								backgroundColor: "rgba(75, 192, 192, 0.2)",
								borderColor: "rgba(75, 192, 192, 1)",
								label: {
									content: "Low Risk",
									enabled: true,
									position: "top",
								},
							},
							{
								type: "box",
								xMin: 0.3,
								xMax: 0.7,
								backgroundColor: "rgba(255, 205, 86, 0.2)",
								borderColor: "rgba(255, 205, 86, 1)",
								label: {
									content: "Moderate Risk",
									enabled: true,
									position: "top",
								},
							},
							{
								type: "box",
								xMin: 0.7,
								xMax: 1,
								backgroundColor: "rgba(255, 99, 132, 0.2)",
								borderColor: "rgba(255, 99, 132, 1)",
								label: {
									content: "High Risk",
									enabled: true,
									position: "top",
								},
							},
						],
					},
				},
			},
		});

		// Create the Burn Probability Indicator visualization
		const ctxBurn = document.getElementById("burnProbabilityIndicator").getContext("2d");
		const burnChart = new Chart(ctxBurn, {
			type: "bar",
			data: {
				labels: ["Burn Probability"],
				datasets: [
					{
						label: "Probability Level",
						data: [burnProbability * 100], // Convert to percentage
						backgroundColor: ["rgba(255, 159, 64, 0.6)"],
						borderColor: ["rgba(255, 159, 64, 1)"],
						borderWidth: 1,
					},
				],
			},
			options: {
				indexAxis: "y",
				scales: {
					x: {
						beginAtZero: true,
						max: 100, // Adjusted for percentage
					},
				},
				plugins: {
					tooltip: { enabled: true },
					legend: { display: false },
					annotation: {
						annotations: [
							{
								type: "box",
								xMin: 0,
								xMax: 20,
								backgroundColor: "rgba(75, 192, 192, 0.2)",
								borderColor: "rgba(75, 192, 192, 1)",
								label: {
									content: "Low Probability",
									enabled: true,
									position: "top",
								},
							},
							{
								type: "box",
								xMin: 20,
								xMax: 50,
								backgroundColor: "rgba(255, 205, 86, 0.2)",
								borderColor: "rgba(255, 205, 86, 1)",
								label: {
									content: "Moderate Probability",
									enabled: true,
									position: "top",
								},
							},
							{
								type: "box",
								xMin: 50,
								xMax: 100,
								backgroundColor: "rgba(255, 99, 132, 0.2)",
								borderColor: "rgba(255, 99, 132, 1)",
								label: {
									content: "High Probability",
									enabled: true,
									position: "top",
								},
							},
						],
					},
				},
			},
		});

		// Show the results section
		document.getElementById("results").style.display = "block";
	};

	reader.readAsText(file);
}

// Generate dynamic insights for risk
function generateRiskInsights(riskScore, maxDrawdownPercent, profitFactor, sharpeRatio) {
	let insights = `Risk Score: ${(riskScore * 100).toFixed(2)}%. `;

	if (riskScore < 0.3) {
		insights += `The EA is considered low risk. With a Max Drawdown of ${maxDrawdownPercent}%, a Profit Factor of ${profitFactor}, and a Sharpe Ratio of ${sharpeRatio}, the EA seems to have a balanced approach with less volatility.`;
	} else if (riskScore < 0.7) {
		insights += `The EA is at a moderate risk level. The Max Drawdown of ${maxDrawdownPercent}% is noticeable, and with a Profit Factor of ${profitFactor}, the returns are justifying the risks, but the Sharpe Ratio of ${sharpeRatio} suggests that the returns might not be consistent.`;
	} else {
		insights += `The EA is considered high risk. With a Max Drawdown of ${maxDrawdownPercent}%, the EA exposes the account to significant potential losses. The Profit Factor of ${profitFactor} and a Sharpe Ratio of ${sharpeRatio} indicate a volatile strategy with inconsistent returns.`;
	}

	return insights;
}

// Generate dynamic insights for burn probability
function generateBurnInsights(burnProbability, maxDrawdownPercent, recoveryFactor, lossTradesPercent) {
	let insights = `Burn Probability: ${(burnProbability * 100).toFixed(2)}%. `;

	if (burnProbability < 0.2) {
		insights += `The probability of burning the account is low. The Max Drawdown of ${maxDrawdownPercent}% combined with a Recovery Factor of ${recoveryFactor} indicates that the EA is likely to recover from losses. The Loss Trades percentage of ${lossTradesPercent}% shows a healthy balance between winning and losing trades.`;
	} else if (burnProbability < 0.5) {
		insights += `The probability of burning the account is moderate. The Max Drawdown of ${maxDrawdownPercent}% is significant, and a Recovery Factor of ${recoveryFactor} indicates challenges in recovering losses. The Loss Trades percentage of ${lossTradesPercent}% suggests a strategy that may be prone to larger losing streaks.`;
	} else {
		insights += `The probability of burning the account is high. A Max Drawdown of ${maxDrawdownPercent}% combined with a low Recovery Factor of ${recoveryFactor} shows that the EA struggles to recover from losses. With a Loss Trades percentage of ${lossTradesPercent}%, the EA has a high risk of depleting the account balance.`;
	}

	return insights;
}
