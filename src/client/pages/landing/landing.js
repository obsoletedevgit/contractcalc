// Sub menus
const tradeinMenu = document.getElementById("tradeinMenu");
const cashbackMenu = document.getElementById("cashbackMenu");

// Select menus
const tradeinSelected = document.getElementById("tradeinSelected");
const cashbackType = document.getElementById("cashbackType");
const savedCalculationsSelect = document.getElementById(
	"savedCalculationsSelect"
);
// New: Compare select menus
const compareSelect1 = document.getElementById("compareSelect1");
const compareSelect2 = document.getElementById("compareSelect2");

// Outputs
const youPayText = document.getElementById("youPayText");
// New: Comparison results display area
const comparisonResultsDiv = document.getElementById("comparisonResults");

// Inputs (grouped for easier iteration)
const inputElements = {
	contractMonthlyCost: document.getElementById("contractMonthlyCost"),
	contractUpfrontCost: document.getElementById("contractUpfrontCost"),
	contractDuration: document.getElementById("contractDuration"),
	contractIncrease: document.getElementById("contractIncrease"),
	tradeinSelected: document.getElementById("tradeinSelected"),
	tradeinAmount: document.getElementById("tradeinAmount"),
	cashbackType: document.getElementById("cashbackType"),
	cashbackAmount: document.getElementById("cashbackAmount"),
	calculationName: document.getElementById("calculationName"),
};

// Input fields that directly affect calculation (for validation)
const calculationInputs = [
	inputElements.contractMonthlyCost,
	inputElements.contractUpfrontCost,
	inputElements.contractDuration,
	inputElements.contractIncrease,
	inputElements.tradeinAmount,
	inputElements.cashbackAmount,
];

// Elements that need their validation state reset
const elementsToClearValidation = [
	...calculationInputs,
	inputElements.tradeinSelected,
	inputElements.cashbackType,
];

// Toast Container
const toastContainer = document.getElementById("toastContainer");

// Modal Elements (New)
const confirmModalOverlay = document.getElementById("confirmModalOverlay");
const confirmModalTitle = document.getElementById("confirmModalTitle");
const confirmModalMessage = document.getElementById("confirmModalMessage");
const confirmModalConfirmBtn = document.getElementById(
	"confirmModalConfirmBtn"
);
const confirmModalCancelBtn = document.getElementById("confirmModalCancelBtn");

// Local Storage Keys
const LOCAL_STORAGE_SAVED_CALCULATIONS_KEY = "savedCalculations";
const LOCAL_STORAGE_DRAFT_CALCULATION_KEY = "currentDraftCalculation";

// --- Toast Notification Function ---
/**
 * Displays a toast notification.
 * @param {string} message The message to display.
 * @param {'success'|'error'|'info'} type The type of toast (affects styling).
 * @param {number} [duration=3000] How long the toast stays visible in milliseconds.
 */
function showToast(message, type = "info", duration = 3000) {
	const toast = document.createElement("div");
	toast.classList.add("toast", type);
	toast.textContent = message;

	// Set the animation duration directly on the element for exit animation
	toast.style.setProperty("--toast-duration", `${duration / 1000}s`);

	toastContainer.appendChild(toast);

	// Remove toast after duration
	setTimeout(() => {
		toast.style.animation = "fadeOut 0.3s forwards"; // Trigger fade out animation
		toast.addEventListener(
			"animationend",
			() => {
				toast.remove();
			},
			{ once: true }
		); // Remove element after animation
	}, duration);
}

// --- Custom Confirmation Modal Function (New) ---
/**
 * Shows a custom confirmation modal.
 * @param {string} message The message to display in the modal.
 * @param {string} [title="Confirm Action"] The title of the modal.
 * @returns {Promise<boolean>} A promise that resolves to true if confirmed, false if cancelled.
 */
function showConfirmModal(message, title = "Confirm Action") {
	confirmModalTitle.textContent = title;
	confirmModalMessage.textContent = message;
	confirmModalOverlay.classList.add("show");

	return new Promise((resolve) => {
		const onConfirmClick = () => {
			confirmModalOverlay.classList.remove("show");
			confirmModalConfirmBtn.removeEventListener("click", onConfirmClick);
			confirmModalCancelBtn.removeEventListener("click", onCancelClick);
			resolve(true);
		};

		const onCancelClick = () => {
			confirmModalOverlay.classList.remove("show");
			confirmModalConfirmBtn.removeEventListener("click", onConfirmClick);
			confirmModalCancelBtn.removeEventListener("click", onCancelClick);
			resolve(false);
		};

		confirmModalConfirmBtn.addEventListener("click", onConfirmClick);
		confirmModalCancelBtn.addEventListener("click", onCancelClick);
	});
}

// --- Helper Functions for UI State ---

/**
 * Hides all collapsible sub-menus.
 */
function hideAllMenus() {
	tradeinMenu.style.display = "none";
	cashbackMenu.style.display = "none";
}

/**
 * Checks the selected trade-in option and shows/hides the trade-in amount input.
 */
function tradeinMenuChecker() {
	if (inputElements.tradeinSelected.value === "tradein") {
		tradeinMenu.style.display = "flex";
	} else {
		tradeinMenu.style.display = "none";
	}
	// Ensure trade-in amount is reset if menu is hidden, or if it was previously populated by a load
	if (tradeinMenu.style.display === "none") {
		inputElements.tradeinAmount.value = 0;
	}
}

/**
 * Checks the selected cashback type and shows/hides the cashback amount input for BACS.
 */
function cashbackMenuChecker() {
	if (inputElements.cashbackType.value === "bacs") {
		cashbackMenu.style.display = "flex";
	} else {
		cashbackMenu.style.display = "none";
	}
	// Ensure cashback amount is reset if menu is hidden, or if it was previously populated by a load
	if (cashbackMenu.style.display === "none") {
		inputElements.cashbackAmount.value = 0;
	}
}

/**
 * Clears validation errors for a given input element and its label.
 * @param {HTMLElement} inputElement The input element to clear.
 */
function clearValidationError(inputElement) {
	inputElement.classList.remove("validation-error");
	const label = document.querySelector(`label[for="${inputElement.id}"]`);
	if (label) {
		label.classList.remove("validation-error");
	}
}

/**
 * Applies validation error styling to an input element and its label.
 * @param {HTMLElement} inputElement The input element to mark as error.
 */
function applyValidationError(inputElement) {
	inputElement.classList.add("validation-error");
	const label = document.querySelector(`label[for="${inputElement.id}"]`);
	if (label) {
		label.classList.add("validation-error");
	}
}

/**
 * Validates a single input field and applies visual feedback.
 * @param {HTMLElement} inputElement The input element to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateInput(inputElement) {
	clearValidationError(inputElement); // Always clear first

	const value = parseFloat(inputElement.value);
	const intValue = parseInt(inputElement.value);
	const id = inputElement.id;
	let isValid = true;

	switch (id) {
		case "contractMonthlyCost":
		case "contractUpfrontCost":
		case "contractIncrease":
		case "tradeinAmount":
		case "cashbackAmount":
			if (isNaN(value) || value < 0 || inputElement.value.trim() === "") {
				isValid = false;
			}
			// For tradein/cashback, if option is "none" or "giftcard", amount doesn't matter for their validation
			if (
				(id === "tradeinAmount" &&
					inputElements.tradeinSelected.value === "none") ||
				(id === "cashbackAmount" &&
					inputElements.cashbackType.value !== "bacs")
			) {
				isValid = true; // No validation needed for these when their parent option is off
			}
			// Ensure positive for specific cases if value > 0 is expected
			if (
				(id === "tradeinAmount" &&
					inputElements.tradeinSelected.value === "tradein" &&
					value <= 0) ||
				(id === "cashbackAmount" &&
					inputElements.cashbackType.value === "bacs" &&
					value <= 0)
			) {
				isValid = false; // Must be positive if selected
			}
			break;
		case "contractDuration":
			if (
				isNaN(intValue) ||
				intValue <= 0 ||
				inputElement.value.trim() === ""
			) {
				isValid = false;
			}
			break;
		case "calculationName": // Validation for save name
			if (inputElement.value.trim() === "") {
				isValid = false;
			}
			break;
		default:
			break;
	}

	if (!isValid) {
		applyValidationError(inputElement);
	}
	return isValid;
}

// --- Validation for Form Submission (Checks all fields) ---
/**
 * Validates all required input fields for a calculation or save operation.
 * Applies visual feedback and provides a single toast if multiple errors.
 * @returns {boolean} True if all required fields are valid, false otherwise.
 */
function validateAllFields() {
	let allValid = true;
	let errorCount = 0;

	// Clear previous errors first
	elementsToClearValidation.forEach(clearValidationError);

	// Validate core calculation inputs
	if (!validateInput(inputElements.contractMonthlyCost)) allValid = false;
	if (!validateInput(inputElements.contractUpfrontCost)) allValid = false;
	if (!validateInput(inputElements.contractDuration)) allValid = false;
	if (!validateInput(inputElements.contractIncrease)) allValid = false;

	// Validate conditional inputs (trade-in, cashback)
	if (inputElements.tradeinSelected.value === "tradein") {
		if (!validateInput(inputElements.tradeinAmount)) allValid = false;
	} else {
		clearValidationError(inputElements.tradeinAmount); // Ensure it's clear if option is off
	}

	if (inputElements.cashbackType.value === "bacs") {
		if (!validateInput(inputElements.cashbackAmount)) allValid = false;
	} else {
		clearValidationError(inputElements.cashbackAmount); // Ensure it's clear if option is off
	}

	// Count errors for a general message if needed
	elementsToClearValidation.forEach((el) => {
		if (el.classList.contains("validation-error")) {
			errorCount++;
		}
	});

	if (!allValid && errorCount > 0) {
		const specificMessages = [
			"Monthly cost must be a non-negative number.",
			"Upfront cost must be a non-negative number.",
			"Contract duration must be a positive number of months.",
			"Annual increase must be a non-negative number.",
			"Trade-in amount must be a positive number.",
			"Cashback amount must be a positive number.",
		];
		let foundSpecificError = false;
		for (const msg of specificMessages) {
			if (toastContainer.textContent.includes(msg)) {
				foundSpecificError = true;
				break;
			}
		}

		if (!foundSpecificError || errorCount > 1) {
			showToast(
				"Please fix the highlighted errors in the form.",
				"error",
				4000
			);
		}
	}

	return allValid;
}

/**
 * Calculates the total contract cost based on provided input values.
 * This is a pure function, making it reusable for current calculation and saved ones.
 * @param {object} params Object containing contract details.
 * @param {number} params.monthlyCost
 * @param {number} params.upfrontCost
 * @param {number} params.durationMonths
 * @param {number} params.annualIncrease
 * @param {string} params.tradeinSelected ('none' or 'tradein')
 * @param {number} params.tradeinAmount
 * @param {string} params.cashbackType ('none', 'giftcard', or 'bacs')
 * @param {number} params.cashbackAmount
 * @returns {{totalFinalCost: number, totalMonthlyPayments: number, effectiveMonthlyCost: number, formattedTotalFinalCost: string}} Calculated metrics.
 */
function calculateContractMetrics(params) {
	let totalMonthlyPaymentsSum = 0;
	let currentMonthlyCost = parseFloat(params.monthlyCost);
	const durationMonths = parseInt(params.durationMonths);
	const annualIncrease = parseFloat(params.annualIncrease);

	for (let month = 1; month <= durationMonths; month++) {
		totalMonthlyPaymentsSum += currentMonthlyCost;

		if (month % 12 === 0 && month !== durationMonths) {
			currentMonthlyCost += annualIncrease;
		}
	}

	let totalFinalCost =
		totalMonthlyPaymentsSum + parseFloat(params.upfrontCost);

	if (params.tradeinSelected === "tradein") {
		totalFinalCost -= parseFloat(params.tradeinAmount);
	}

	if (params.cashbackType === "bacs") {
		totalFinalCost -= parseFloat(params.cashbackAmount);
	}

	const formattedTotalFinalCost = (
		Math.round(totalFinalCost * 100) / 100
	).toFixed(2);

	const effectiveMonthlyCost =
		durationMonths > 0
			? (Math.round(totalFinalCost * 100) / 100 / durationMonths).toFixed(
					2
			  )
			: (0).toFixed(2);

	return {
		totalFinalCost: totalFinalCost, // Raw number
		totalMonthlyPayments: totalMonthlyPaymentsSum, // Raw number
		effectiveMonthlyCost: parseFloat(effectiveMonthlyCost), // Parsed number
		formattedTotalFinalCost: `£${formattedTotalFinalCost}`, // Formatted string
	};
}

/**
 * Calculates and displays the current contract cost.
 * @returns {string} The formatted total cost string (e.g., "£123.45") or "£0.00" on error.
 */
async function calculateContract() {
	const validated = validateAllFields();

	if (!validated) {
		youPayText.textContent = "You pay: £0.00"; // Clear output if invalid
		return "£0.00";
	}

	const params = {
		monthlyCost: inputElements.contractMonthlyCost.value,
		upfrontCost: inputElements.contractUpfrontCost.value,
		durationMonths: inputElements.contractDuration.value,
		annualIncrease: inputElements.contractIncrease.value,
		tradeinSelected: inputElements.tradeinSelected.value,
		tradeinAmount: inputElements.tradeinAmount.value,
		cashbackType: inputElements.cashbackType.value,
		cashbackAmount: inputElements.cashbackAmount.value,
	};

	const metrics = calculateContractMetrics(params);
	youPayText.textContent = `You pay: ${metrics.formattedTotalFinalCost}`;
	return metrics.formattedTotalFinalCost;
}

// --- Save/Load/Delete Calculation Logic ---

/**
 * Retrieves all saved calculations from localStorage.
 * @returns {Array<Object>} An array of saved calculation objects.
 */
function getSavedCalculations() {
	try {
		const data = localStorage.getItem(LOCAL_STORAGE_SAVED_CALCULATIONS_KEY);
		return data ? JSON.parse(data) : [];
	} catch (e) {
		console.error("Error parsing saved calculations from localStorage", e);
		showToast("Error loading saved calculations.", "error");
		return [];
	}
}

/**
 * Saves the current calculations to localStorage.
 */
async function saveCalculation() {
	const calculationName = inputElements.calculationName.value.trim();
	if (!calculationName) {
		showToast(
			"Please enter a name for your calculation before saving!",
			"error"
		);
		applyValidationError(inputElements.calculationName); // Highlight the name field
		return;
	} else {
		clearValidationError(inputElements.calculationName);
	}

	const validated = validateAllFields();
	if (!validated) {
		showToast(
			"Cannot save: Please correct highlighted input errors before saving.",
			"error",
			4000
		);
		return;
	}

	// Calculate the current cost metrics to save them along with inputs
	const currentMetrics = calculateContractMetrics({
		monthlyCost: inputElements.contractMonthlyCost.value,
		upfrontCost: inputElements.contractUpfrontCost.value,
		durationMonths: inputElements.contractDuration.value,
		annualIncrease: inputElements.contractIncrease.value,
		tradeinSelected: inputElements.tradeinSelected.value,
		tradeinAmount: inputElements.tradeinAmount.value,
		cashbackType: inputElements.cashbackType.value,
		cashbackAmount: inputElements.cashbackAmount.value,
	});

	const currentCalculation = {
		name: calculationName,
		contractMonthlyCost: inputElements.contractMonthlyCost.value,
		contractUpfrontCost: inputElements.contractUpfrontCost.value,
		contractIncrease: inputElements.contractIncrease.value,
		contractDuration: inputElements.contractDuration.value,
		tradeinSelected: inputElements.tradeinSelected.value,
		tradeinAmount: inputElements.tradeinAmount.value,
		cashbackType: inputElements.cashbackType.value,
		cashbackAmount: inputElements.cashbackAmount.value,
		// Store calculated metrics
		savedPrice: currentMetrics.formattedTotalFinalCost,
		totalFinalCostNum: currentMetrics.totalFinalCost,
		totalMonthlyPaymentsNum: currentMetrics.totalMonthlyPayments,
		effectiveMonthlyCostNum: currentMetrics.effectiveMonthlyCost,
	};

	let savedCalculations = getSavedCalculations();

	const existingIndex = savedCalculations.findIndex(
		(calc) => calc.name === calculationName
	);

	if (existingIndex > -1) {
		savedCalculations[existingIndex] = currentCalculation;
		showToast(
			`Calculation "${calculationName}" updated successfully!`,
			"success"
		);
	} else {
		savedCalculations.push(currentCalculation);
		showToast(
			`Calculation "${calculationName}" saved successfully!`,
			"success"
		);
	}

	localStorage.setItem(
		LOCAL_STORAGE_SAVED_CALCULATIONS_KEY,
		JSON.stringify(savedCalculations)
	);
	populateSavedCalculationsDropdowns(); // Update all dropdowns
	saveDraftCalculation(); // Update draft after saving
}

/**
 * Loads a selected calculation from localStorage and populates the form.
 */
function loadCalculation() {
	const selectedName = savedCalculationsSelect.value;
	if (!selectedName) {
		resetCalculator(false); // Do not show "Calculator reset" toast
		return;
	}

	const savedCalculations = getSavedCalculations();
	const calculationToLoad = savedCalculations.find(
		(calc) => calc.name === selectedName
	);

	if (calculationToLoad) {
		// Populate inputs
		inputElements.contractMonthlyCost.value =
			calculationToLoad.contractMonthlyCost;
		inputElements.contractUpfrontCost.value =
			calculationToLoad.contractUpfrontCost;
		inputElements.contractIncrease.value =
			calculationToLoad.contractIncrease;
		inputElements.contractDuration.value =
			calculationToLoad.contractDuration;
		inputElements.tradeinSelected.value = calculationToLoad.tradeinSelected;
		inputElements.tradeinAmount.value = calculationToLoad.tradeinAmount;
		inputElements.cashbackType.value = calculationToLoad.cashbackType;
		inputElements.cashbackAmount.value = calculationToLoad.cashbackAmount;
		inputElements.calculationName.value = calculationToLoad.name; // Set the name field

		tradeinMenuChecker();
		cashbackMenuChecker();

		youPayText.textContent = "You pay: " + calculationToLoad.savedPrice;
		clearAllValidationErrors();
		showToast(`Calculation "${selectedName}" loaded!`, "info");
		saveDraftCalculation(); // Update draft with loaded calculation

		// Crucial: Re-run comparison if two contracts are selected and valid
		if (compareSelect1.value && compareSelect2.value) {
			initiateComparison();
		}
	} else {
		showToast("Error: Calculation not found.", "error");
	}
}

/**
 * Deletes the currently selected calculation from localStorage.
 */
async function deleteCalculation() {
	const selectedName = inputElements.calculationName.value.trim();
	if (!selectedName) {
		showToast(
			"Please enter or load a calculation name to delete.",
			"error"
		);
		return;
	}

	// Use custom modal for confirmation
	const confirmed = await showConfirmModal(
		`Are you sure you want to delete the calculation "${selectedName}"?`,
		"Confirm Deletion"
	);

	if (!confirmed) {
		showToast("Deletion cancelled.", "info");
		return;
	}

	let savedCalculations = getSavedCalculations();
	const initialLength = savedCalculations.length;

	savedCalculations = savedCalculations.filter(
		(calc) => calc.name !== selectedName
	);

	if (savedCalculations.length < initialLength) {
		localStorage.setItem(
			LOCAL_STORAGE_SAVED_CALCULATIONS_KEY,
			JSON.stringify(savedCalculations)
		);
		populateSavedCalculationsDropdowns(); // Update all dropdowns
		resetCalculator(); // Clear fields after deletion
		showToast(`Calculation "${selectedName}" deleted.`, "info");
	} else {
		showToast(`Calculation "${selectedName}" not found.`, "error");
	}
}

/**
 * Populates all dropdown menus (saved calculations and compare options).
 */
function populateSavedCalculationsDropdowns() {
	const savedCalculations = getSavedCalculatedRebuildData(); // Ensure data is up-to-date before populating

	// Helper to populate a single dropdown
	const populateDropdown = (selectElement) => {
		const currentSelectedValue = selectElement.value; // Remember current value
		selectElement.innerHTML = `<option value="">-- Select a calculation --</option>`;
		savedCalculations.forEach((calc) => {
			const option = document.createElement("option");
			option.value = calc.name;
			option.textContent = `${calc.name} - ${calc.savedPrice || "N/A"}`;
			selectElement.appendChild(option);
		});
		// Try to re-select the previously selected value
		if (
			currentSelectedValue &&
			savedCalculations.some((c) => c.name === currentSelectedValue)
		) {
			selectElement.value = currentSelectedValue;
		} else {
			selectElement.value = ""; // Clear if previous selection no longer exists
		}
	};

	// Populate main saved calculations dropdown
	populateDropdown(savedCalculationsSelect);
	if (inputElements.calculationName.value) {
		savedCalculationsSelect.value = inputElements.calculationName.value;
	}

	// Populate compare dropdowns and maintain selection
	populateDropdown(compareSelect1);
	populateDropdown(compareSelect2);

	// Trigger comparison if both compare dropdowns have valid selections
	if (compareSelect1.value && compareSelect2.value) {
		initiateComparison();
	} else {
		comparisonResultsDiv.innerHTML = ""; // Clear comparison if not enough selections
	}
}

// --- Draft Calculation Logic ---
/**
 * Saves the current state of all form inputs as a draft to localStorage.
 */
function saveDraftCalculation() {
	const currentDraft = {};
	for (const key in inputElements) {
		currentDraft[key] = inputElements[key].value;
	}
	localStorage.setItem(
		LOCAL_STORAGE_DRAFT_CALCULATION_KEY,
		JSON.stringify(currentDraft)
	);
}

/**
 * Loads the saved draft calculation from localStorage, if one exists.
 */
function loadDraftCalculation() {
	try {
		const draftData = localStorage.getItem(
			LOCAL_STORAGE_DRAFT_CALCULATION_KEY
		);
		if (draftData) {
			const draft = JSON.parse(draftData);
			// Populate inputs, handling potential undefined values from older drafts
			for (const key in inputElements) {
				if (draft[key] !== undefined) {
					inputElements[key].value = draft[key];
				}
			}

			// Re-trigger UI updates based on loaded draft
			tradeinMenuChecker();
			cashbackMenuChecker();
			populateSavedCalculationsDropdowns(); // Will also re-select compare if data exists and trigger comparison
			calculateContract(); // Recalculate based on loaded draft
			showToast("Draft calculation loaded.", "info");
		} else {
			// If no draft, reset to initial defaults (without toast)
			resetCalculator(false);
		}
	} catch (e) {
		console.error("Error loading draft calculation:", e);
		showToast("Error loading draft calculation.", "error");
		resetCalculator(false); // Reset on error
	}
}

/**
 * Clears all visual validation errors from the form.
 */
function clearAllValidationErrors() {
	elementsToClearValidation.forEach(clearValidationError);
	clearValidationError(inputElements.calculationName); // Also clear for the name field
}

/**
 * Resets all input fields to their default/empty values.
 * Also clears the output and the selected saved calculation.
 * @param {boolean} [showToastMessage=true] Whether to show a toast message for the reset.
 */
function resetCalculator(showToastMessage = true) {
	inputElements.contractMonthlyCost.value = "";
	inputElements.contractUpfrontCost.value = 0;
	inputElements.contractIncrease.value = 1.5;
	inputElements.contractDuration.value = 24;
	inputElements.tradeinSelected.value = "none";
	inputElements.tradeinAmount.value = 0;
	inputElements.cashbackType.value = "none";
	inputElements.cashbackAmount.value = 0;
	inputElements.calculationName.value = "";

	hideAllMenus();
	youPayText.textContent = "You pay: £0.00";

	savedCalculationsSelect.value = "";
	compareSelect1.value = ""; // Clear compare selectors
	compareSelect2.value = ""; // Clear compare selectors
	comparisonResultsDiv.innerHTML = ""; // Clear comparison results

	clearAllValidationErrors();
	localStorage.removeItem(LOCAL_STORAGE_DRAFT_CALCULATION_KEY);
	if (showToastMessage) {
		showToast("Calculator reset to default.", "info");
	}
}

// --- Comparison Logic ---

/**
 * Initiates the comparison of two selected saved calculations.
 */
function initiateComparison() {
	const name1 = compareSelect1.value;
	const name2 = compareSelect2.value;

	if (!name1 || !name2) {
		comparisonResultsDiv.innerHTML = ""; // Clear old results
		// Only show toast if it's not during initial load and user interaction is expected
		if (
			document.activeElement === compareSelect1 ||
			document.activeElement === compareSelect2 ||
			document.activeElement.onclick === initiateComparison
		) {
			showToast("Please select two contracts to compare.", "error");
		}
		return;
	}

	if (name1 === name2) {
		showToast(
			"Please select two *different* contracts to compare.",
			"error"
		);
		comparisonResultsDiv.innerHTML = ""; // Clear old results
		return;
	}

	const savedCalculations = getSavedCalculatedRebuildData(); // Use the rebuilt data if needed
	const contract1 = savedCalculations.find((calc) => calc.name === name1);
	const contract2 = savedCalculations.find((calc) => calc.name === name2);

	if (!contract1 || !contract2) {
		showToast(
			"Selected contract data not found. Please re-save if needed.",
			"error"
		);
		comparisonResultsDiv.innerHTML = ""; // Clear old results
		return;
	}

	// Data rebuilding for comparison is now handled in getSavedCalculatedRebuildData()
	// So we just need to ensure the fetched contracts have the required numeric fields.
	const requiredNumericFields = [
		"totalFinalCostNum",
		"totalMonthlyPaymentsNum",
		"effectiveMonthlyCostNum",
	];
	const missingData1 = requiredNumericFields.some(
		(field) => typeof contract1[field] !== "number"
	);
	const missingData2 = requiredNumericFields.some(
		(field) => typeof contract2[field] !== "number"
	);

	if (missingData1 || missingData2) {
		showToast(
			"Missing data for comparison. Please load and 'Save' older contracts to update them.",
			"error",
			5000
		);
		// Provide a helpful message in the comparison area itself
		comparisonResultsDiv.innerHTML = `
            <div class="header metric-name">Metric</div>
            <div class="header contract-name">${contract1.name}</div>
            <div class="header contract-name">${contract2.name}</div>
            <div style="grid-column: 1 / span 3; text-align: center; padding: 15px; color:var(--error-color);">
                <p>Some data for comparison is missing or corrupted. Please load each contract in the main calculator and click 'Save' to update them with full metrics.</p>
            </div>
        `;
		return;
	}

	displayComparisonResults(contract1, contract2);
	showToast("Comparison ready!", "success");
}

/**
 * Ensures all saved calculations have the latest numeric metrics by recalculating them.
 * This is crucial for older saves that might not have `totalFinalCostNum`, etc.
 * It also persists the updated data back to localStorage.
 * @returns {Array<Object>} An array of saved calculation objects with updated metrics.
 */
function getSavedCalculatedRebuildData() {
	let saved = getSavedCalculations();
	let needsUpdate = false;
	const updatedSaved = saved.map((calc) => {
		// Assume if totalFinalCostNum is a number, other numeric fields are also present from recent saves
		if (typeof calc.totalFinalCostNum !== "number") {
			needsUpdate = true;
			const metrics = calculateContractMetrics({
				monthlyCost: calc.contractMonthlyCost,
				upfrontCost: calc.contractUpfrontCost,
				durationMonths: calc.contractDuration,
				annualIncrease: calc.contractIncrease,
				tradeinSelected: calc.tradeinSelected,
				tradeinAmount: calc.tradeinAmount,
				cashbackType: calc.cashbackType,
				cashbackAmount: calc.cashbackAmount,
			});
			return {
				...calc, // Keep existing properties
				savedPrice: metrics.formattedTotalFinalCost,
				totalFinalCostNum: metrics.totalFinalCost,
				totalMonthlyPaymentsNum: metrics.totalMonthlyPayments,
				effectiveMonthlyCostNum: metrics.effectiveMonthlyCost,
			};
		}
		return calc;
	});

	if (needsUpdate) {
		localStorage.setItem(
			LOCAL_STORAGE_SAVED_CALCULATIONS_KEY,
			JSON.stringify(updatedSaved)
		);
		// Only repopulate dropdowns here if we want immediate reflection of updated names/prices
		// otherwise, it will happen on next full populateSavedCalculationsDropdowns call
	}
	return updatedSaved;
}

/**
 * Displays the comparison results in the dedicated div.
 * @param {object} contract1 The first contract object.
 * @param {object} contract2 The second contract object.
 */
function displayComparisonResults(contract1, contract2) {
	// Clear any existing content
	comparisonResultsDiv.innerHTML = "";

	// The .comparison-results class on the parent div already sets up the grid.
	// We only need to inject the grid items (headers and data rows).
	let htmlContent = `
        <div class="header metric-name">Metric</div>
        <div class="header contract-name">${contract1.name}</div>
        <div class="header contract-name">${contract2.name}</div>
  `;

	const metrics = [
		{
			label: "Total Final Cost",
			key: "totalFinalCostNum",
			format: (val) => `£${val.toFixed(2)}`,
			higherIsBetter: false,
		},
		{
			label: "Total Monthly Payments",
			key: "totalMonthlyPaymentsNum",
			format: (val) => `£${val.toFixed(2)}`,
			higherIsBetter: false,
		},
		{
			label: "Upfront Cost",
			key: "contractUpfrontCost",
			format: (val) => `£${parseFloat(val).toFixed(2)}`,
			higherIsBetter: false,
		},
		{
			label: "Effective Monthly Cost",
			key: "effectiveMonthlyCostNum",
			format: (val) => `£${parseFloat(val).toFixed(2)}`,
			higherIsBetter: false,
		},
		{
			label: "Duration (Months)",
			key: "contractDuration",
			format: (val) => `${parseInt(val)} months`,
			higherIsBetter: true, // Longer duration can be better depending on preference
		},
		{
			label: "Initial Monthly Cost",
			key: "contractMonthlyCost",
			format: (val) => `£${parseFloat(val).toFixed(2)}`,
			higherIsBetter: false,
		},
		{
			label: "Annual Increase",
			key: "contractIncrease",
			format: (val) => `£${parseFloat(val).toFixed(2)}`,
			higherIsBetter: false,
		},
		{
			label: "Trade-in Amount",
			key: "tradeinAmount",
			format: (val) => `£${parseFloat(val).toFixed(2)}`,
			higherIsBetter: true,
		},
		{
			label: "Cashback Amount",
			key: "cashbackAmount",
			format: (val) => `£${parseFloat(val).toFixed(2)}`,
			higherIsBetter: true,
		},
	];

	metrics.forEach((metric) => {
		// Ensure values are numbers before comparison
		const val1 =
			typeof contract1[metric.key] === "number"
				? contract1[metric.key]
				: parseFloat(contract1[metric.key]);
		const val2 =
			typeof contract2[metric.key] === "number"
				? contract2[metric.key]
				: parseFloat(contract2[metric.key]);

		let class1 = "";
		let class2 = "";

		// Handle NaN values, treat as neutral or incomparable
		if (isNaN(val1) || isNaN(val2)) {
			class1 = "value-neutral";
			class2 = "value-neutral";
		} else if (val1 === val2) {
			class1 = "value-neutral";
			class2 = "value-neutral";
		} else if (metric.higherIsBetter) {
			if (val1 > val2) {
				class1 = "value-good";
				class2 = "value-bad";
			} else {
				class1 = "value-bad";
				class2 = "value-good";
			}
		} else {
			// Lower is better (most common for costs)
			if (val1 < val2) {
				class1 = "value-good";
				class2 = "value-bad";
			} else {
				class1 = "value-bad";
				class2 = "value-good";
			}
		}

		htmlContent += `
            <div class="metric-name">${metric.label}</div>
            <div class="${class1}">${metric.format(val1)}</div>
            <div class="${class2}">${metric.format(val2)}</div>
        `;
	});

	comparisonResultsDiv.innerHTML = htmlContent;
}

// --- Initialization ---

/**
 * Initializes the page by attaching event listeners,
 * loading any saved calculations, and restoring draft if available.
 */
function init() {
	// Attach event listeners for dropdowns
	inputElements.tradeinSelected.addEventListener(
		"change",
		tradeinMenuChecker
	);
	inputElements.cashbackType.addEventListener("change", cashbackMenuChecker);

	// Attach input event listeners for real-time validation and draft saving
	Object.values(inputElements).forEach((input) => {
		input.addEventListener("input", (event) => {
			validateInput(event.target); // Validate individual field
			saveDraftCalculation(); // Save draft on any input change
		});
		// For select elements, 'change' is more appropriate for saving draft
		if (input.tagName === "SELECT") {
			input.addEventListener("change", saveDraftCalculation);
		}
	});

	// Attach change listeners for comparison dropdowns to trigger comparison
	compareSelect1.addEventListener("change", () => {
		initiateComparison();
	});
	compareSelect2.addEventListener("change", () => {
		initiateComparison();
	});

	// Listener for Enter key to trigger calculation
	document.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			const focusedElement = document.activeElement;
			// Trigger calculate if focus is on an input or select within the main calculator area
			if (
				focusedElement &&
				(focusedElement.tagName === "INPUT" ||
					focusedElement.tagName === "SELECT") &&
				focusedElement.closest(".calculator-screen")
			) {
				event.preventDefault(); // Prevent potential form submission
				calculateContract();
			}
		}
	});

	// Populate all saved calculations dropdowns on load
	populateSavedCalculationsDropdowns();

	// Load any existing draft calculation or reset if none
	loadDraftCalculation();
}

// Ensure the DOM is fully loaded before running init()
document.addEventListener("DOMContentLoaded", init);
