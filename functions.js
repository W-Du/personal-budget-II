//check if the new budget is lower than envelope expense
//if yes, return null
//if not, return the new remaining value of the envelope.
function checkNewBudget (currentBudget, budgetInput, remain) {
    const envSpent = Number(currentBudget) - Number(remain);
    if (budgetInput < envSpent) {
        return null;
    } else {
        return Number(budgetInput) - envSpent;
    }
};



module.exports = { checkNewBudget };