//Sub menus
const tradeinMenu = document.getElementById("tradeinMenu");
const cashbackMenu = document.getElementById("cashbackMenu");

//Select menus
const tradeinSelected = document.getElementById("tradeinSelected");
const cashbackType = document.getElementById("cashbackType");

//Menus
const breakdownScreen = document.getElementById("breakdown-screen");

//Inputs
const contractMonthlyCost = document.getElementById("contractMonthlyCost");
const contractUpfrontCost = document.getElementById("contractUpfrontCost");
const contractDuration = document.getElementById("contractDuration");

const tradeinAmount = document.getElementById("tradeinAmount");
const cashbackAmount = document.getElementById("cashbackAmount");
const ccvAmount = document.getElementById("ccvAmount");

//Outputs
const youPayText = document.getElementById("youPayText");

function hideAllMenus(){
    tradeinMenu.style.display = "none";
    cashbackMenu.style.display = "none";
}

function tradeinMenuChecker(){
    if (tradeinSelected.options[tradeinSelected.selectedIndex].value == "none"){
        tradeinMenu.style.display = "none";
    } else if (tradeinSelected.options[tradeinSelected.selectedIndex].value == "tradein") {
        tradeinMenu.style.display = "flex";
    } else {
        tradeinMenu.style.display == "none";
    }

    //console.log(tradeinSelected.options[tradeinSelected.selectedIndex].value)
}

function cashbackMenuChecker(){
    if (cashbackType.options[cashbackType.selectedIndex].value == "none" || cashbackType.options[cashbackType.selectedIndex].value == "giftcard"){
        cashbackMenu.style.display = "none";
    } else if (cashbackType.options[cashbackType.selectedIndex].value == "bacs") {
        cashbackMenu.style.display = "flex";
    } else {
        cashbackMenu.style.display == "none";
    }

    //console.log(cashbackType.options[cashbackType.selectedIndex].value)
}

async function calculateContract(){
    let validated = await validateRequiredFields();

    if (!validated){
        alert("ERR: Not all fields are filled out!");
    }

    var costOfContractTotal = (contractMonthlyCost.value * contractDuration.value) + parseFloat(contractUpfrontCost.value);

    youPayText.textContent = "You pay: £" + Math.round(costOfContractTotal * 100) / 100
}

async function validateRequiredFields(){
    if (contractMonthlyCost <= 0 || contractUpfrontCost < 0){
        return false;
    }

    if(tradeinSelected.options[tradeinSelected.selectedIndex].value == "tradein" && tradeinAmount.value <= 0){
        return false;
    }

    if(cashbackType.options[cashbackType.selectedIndex].value == "bacs" && cashbackAmount.value <= 0){
        return false;
    }

    return true;
}

function init(){
    hideAllMenus();
}

init()