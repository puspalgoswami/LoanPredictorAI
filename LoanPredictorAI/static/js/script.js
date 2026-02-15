let chart;

async function predictLoan() {

    const data = {
        Gender: parseInt(document.getElementById("Gender").value),
        Married: parseInt(document.getElementById("Married").value),
        Dependents: parseInt(document.getElementById("Dependents").value),
        Education: parseInt(document.getElementById("Education").value),
        Self_Employed: parseInt(document.getElementById("Self_Employed").value),
        ApplicantIncome: parseFloat(document.getElementById("ApplicantIncome").value),
        CoapplicantIncome: parseFloat(document.getElementById("CoapplicantIncome").value),
        LoanAmount: parseFloat(document.getElementById("LoanAmount").value),
        Loan_Amount_Term: parseInt(document.getElementById("Loan_Amount_Term").value),
        Credit_History: parseInt(document.getElementById("Credit_History").value),
        Property_Area: parseInt(document.getElementById("Property_Area").value)
    };

    const interestRate = parseFloat(document.getElementById("InterestRate").value);

    const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.prediction === 1) {
        document.getElementById("loanStatus").innerHTML = "Loan Approved ✅";
        document.getElementById("loanStatus").style.color = "#00ffae";
        generateGraph(data.LoanAmount, interestRate, data.Loan_Amount_Term);
    } else {
        document.getElementById("loanStatus").innerHTML = "Loan Rejected ❌";
        document.getElementById("loanStatus").style.color = "#ff4d4d";
        document.getElementById("emiValue").innerHTML = "";
        document.getElementById("totalRepayment").innerHTML = "";
        if (chart) chart.destroy();
    }
}

function generateGraph(loanAmount, annualRate, months) {

    const monthlyRate = annualRate / 12 / 100;

    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
                (Math.pow(1 + monthlyRate, months) - 1);

    let cumulativePaid = [];
    let labels = [];
    let totalPaid = 0;

    for (let i = 1; i <= months; i++) {
        totalPaid += emi;
        cumulativePaid.push(totalPaid);
        labels.push("Month " + i);
    }

    if (chart) chart.destroy();

    const ctx = document.getElementById("repaymentChart").getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(0,224,255,0.6)");
    gradient.addColorStop(1, "rgba(0,224,255,0.05)");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Cumulative Repayment (₹)",
                data: cumulativePaid,
                borderColor: "#00e0ff",
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const totalRepayment = cumulativePaid[cumulativePaid.length - 1];

    document.getElementById("emiValue").innerHTML =
        "Monthly EMI: ₹ " + emi.toFixed(2);

    document.getElementById("totalRepayment").innerHTML =
        "Total Repayment: ₹ " + totalRepayment.toFixed(2);
}
