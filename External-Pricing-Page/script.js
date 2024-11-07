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
const baseUrl = "https://app.meet2know.com"
const successUrl = urlParams.get("su")
const cancelUrl = urlParams.get("cu")

initPage();

function initPage(){
    setPricesUrls(); 
    setCancelUrl();  
    disableCurrentPlan();
}

function disableCurrentPlan(){
    const currentPlanName = urlParams.get("plan")
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

    linkElement.setAttribute("href", `${baseUrl}/${cancelUrl}`)
}

function setPricesUrls() {
    const planContainers = document.getElementsByClassName("pricing-plan")

    for (let planContainer of planContainers) {
        const url = buildPriceUrl(planContainer.getAttribute("id"))
        const linkElement = planContainer.getElementsByTagName("a")[0]
        linkElement.setAttribute("href", url)
    }

    return true
}

function buildPriceUrl(plan) {
    return `${baseUrl}/${successUrl}?plan=${plan}&cu=${cancelUrl}&su=${successUrl}`;
}