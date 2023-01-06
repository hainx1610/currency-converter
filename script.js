const API_KEY = "ee9195238a72efdd80ff3f6c";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

// fetch(`${BASE_URL}/codes`)
//     .then(response => response.json())
//     .then(data => {
//         console.log(data)
//     });

async function getSupportedCodes() {
    try {
        const response = await fetch(`${BASE_URL}/codes`);
        if (response.ok) {
            const data = await response.json();
            const codes = data["supported_codes"];
            return codes;
        }
    } catch (error) {
        console.log(error);
        return [];
    }
}

// getSupportedCodes().then(result => console.log(result))

async function getConversionRate(baseCode, targetCode) {
    try {
        const response = await fetch(`${BASE_URL}/pair/${baseCode}/${targetCode}`);
        if (response.ok) {
            const data = await response.json();
            const rate = data["conversion_rate"];
            return rate;
        }
    } catch (error) {
        console.log(error);
        return 0;
    }
}

// getConversionRate("USD", "VND").then(result => console.log(result))

const baseUnit = document.querySelector("#base-unit")
const targetRate = document.querySelector("#target-rate")

const inputBaseAmount = document.querySelector("#base-amount")
const selectBaseCode = document.querySelector("#base-code")
const inputTargetAmount = document.querySelector("#target-amount")
const selectTargetCode = document.querySelector("#target-code")

const errorMsg = document.querySelector(".error-message")

let supportedCodes = [];
let conversionRate = 0;

const updateExchangeRate = async () => {
    const baseCode = selectBaseCode.value;
    const targetCode = selectTargetCode.value;

    errorMsg.textContent = "Loading data...";
    conversionRate = await getConversionRate(baseCode, targetCode);
    if (conversionRate === 0) {
        errorMsg.textContent = "Cannot get conversion rate";
        return;
    }
    errorMsg.textContent = "";

    const baseName = supportedCodes.find(code => code[0] === baseCode)[1];
    const targetName = supportedCodes.find(code => code[0] === targetCode)[1];
    baseUnit.textContent = `1 ${baseName} equals`;
    targetRate.textContent = `${conversionRate} ${targetName}`;
}

const initialize = async () => {
    // get supported codes from the API
    errorMsg.textContent = "Loading data..."; //for slow Internet
    supportedCodes = await getSupportedCodes();
    if (!supportedCodes.length) {
        errorMsg.textContent = "No supported codes";
        return;
    }
    errorMsg.textContent = ""; //loading done!

    // put options into the select boxes
    supportedCodes.forEach(code => {
        const baseOption = document.createElement("option");
        baseOption.value = code[0];
        baseOption.textContent = code[1];
        selectBaseCode.appendChild(baseOption);

        const targetOption = document.createElement("option");
        targetOption.value = code[0];
        targetOption.textContent = code[1];
        selectTargetCode.appendChild(targetOption);
    });

    // set VND to USD as default
    selectBaseCode.value = "VND";
    selectTargetCode.value = "USD";

    // update exchange rate
    await updateExchangeRate();
}

selectBaseCode.addEventListener("change", updateExchangeRate);
selectTargetCode.addEventListener("change", updateExchangeRate);

inputBaseAmount.addEventListener("input", () => {
    inputTargetAmount.value = Math.round((inputBaseAmount.value * conversionRate) * 10 ** 3) / 10 ** 3;
})

inputTargetAmount.addEventListener("input", () => {
    inputBaseAmount.value = Math.round((inputTargetAmount.value / conversionRate) * 10 ** 3) / 10 ** 3;
})

initialize()