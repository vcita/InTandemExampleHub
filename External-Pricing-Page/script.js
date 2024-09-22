// Description: This file contains the logic for the pricing page.
// Last modified: 2021-08-22
// =====================================================================================================================
//  Expected url params:
//      su: The url to redirect to after a successful payment.
//      cu: The url to redirect to after a canceled payment.
//      plan: The current plan name. options are : essential, business (recommended), platinum.
//      business_uid: The business uid. currently not in use!
// =====================================================================================================================

const urlParams = new URLSearchParams(window.location.search);
const baseUrl = "https://app.meet2know.com/app"
initPage();

function initPage(){
    setPricesUrls(); 
    setCancelUrl();  
    disableCurrentPlan();
}

function disableCurrentPlan(){
    const currentPlanName = getUrlParamValue("plan")
    const currentPlanContainer = document.getElementById(currentPlanName)
    currentPlanContainer.classList.add("disabled")

    // Remove recommended badge
    if (currentPlanName === "business") {
        const badge = currentPlanContainer.getElementsByClassName("badge")[0]
        badge.remove()
    }
}

function setCancelUrl() {
    const headerContainers = document.getElementsByClassName("header")[0]
    const linkElement = headerContainers.getElementsByTagName("a")[0]
    
    linkElement.setAttribute("href", `${baseUrl}/${getUrlParamValue("cu")}`)
}

function setPricesUrls() {
    const planContainers = document.getElementsByClassName("pricing-plan")

    for (let planContainer of planContainers) {
        const selectedPlanName = planContainer.getAttribute("id")
        const path = getUrlParamValue("su")
        const url = buildPriceUrl(path, selectedPlanName) 
        const linkElement = planContainer.getElementsByTagName("a")[0]
        linkElement.setAttribute("href", url)
    }

    return true
}

function buildPriceUrl(urlPath, plan) {
    const currentPlanName = getUrlParamValue("plan")
    const backUrl = `/${getUrlParamValue("cu")}`;

    return `${baseUrl}/${urlPath}?plan=${plan}&billing=monthly&cancelUrl=${backUrl}&successUrl=${backUrl}`;
}

function getUrlParamValue(paramName) {
    return urlParams.get(paramName)
}
