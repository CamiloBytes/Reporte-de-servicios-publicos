const apiUsers = "http://localhost:3000/users";
const apiReports = "http://localhost:3000/reports";
const apiDamage = "http://localhost:3000/damage";

let users, reports, damages;

// Fetch data from a given URL and return parsed JSON
async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
    return await response.json();
}

// Initialize data when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch all data concurrently
        [users, reports, damages] = await Promise.all([
            fetchData(apiUsers),
            fetchData(apiReports),
            fetchData(apiDamage),
        ]);

        console.log("Datos cargados:", { users, reports, damages });
        
        // Render the table
        renderTable();
    } catch (error) {
        console.error("Error loading data:", error);
    }
});

// Render the reports table inside the page
function renderTable() {
    const tableContainer = document.getElementById("createTable");

    if (!tableContainer) {
        console.error("No se encontró el elemento createTable");
        return;
    }

    // Build the table header and start tbody
    let tableHTML = `
    <thead>
      <tr>
        <th>ID</th>
        <th>ADDRESS</th>
        <th>TIME</th>
        <th>DESCRIPTION</th>
        <th>STATUS</th>
      </tr>
    </thead>
    <tbody>
  `;

    // Create a row for each report
    for (const report of reports) {
        let statusClass = "";
        if (report.status === "recibido") statusClass = "pendiente";
        else if (report.status === "proceso") statusClass = "proceso";
        else statusClass = "resuelto";

        tableHTML += `
      <tr>
        <td>${report.ccUser}</td>
        <td>${report.address}</td>
        <td>${report.dataTime.timeCreateReport}</td>
        <td>${report.description}</td>
        <td>
          <button class="badge ${statusClass}" data-id="${report.id}">
            ${report.status}
          </button>
        </td>
      </tr>
    `;
    }

    tableHTML += "</tbody>";
    tableContainer.innerHTML = tableHTML;

    attachButtonListeners();
}

// Add click event listeners to status buttons
function attachButtonListeners() {
    const buttons = document.querySelectorAll(".badge");

    buttons.forEach((button) => {
        button.addEventListener("click", async () => {
            const reportId = button.getAttribute("data-id");
            const report = reports.find((r) => r.id == reportId);
            const damageReport = damages.find((d) => d.id == reportId);

            if (!report || !damageReport) return;

            const currentDate = new Date().toLocaleString();

            if (button.classList.contains("pendiente")) {
                // Change status from pending to in-process
                button.classList.replace("pendiente", "proceso");
                button.textContent = "proceso";

                const updatedReport = {
                    ...report,
                    dataTime: {
                        ...report.dataTime,
                        timeProcessReport: currentDate,
                    },
                    status: "proceso",
                };

                const updatedDamage = {
                    ...damageReport,
                    status: "proceso",
                };

                await updateReportAndDamage(reportId, updatedReport, updatedDamage);
            } else if (button.classList.contains("proceso")) {
                // Change status from in-process to resolved
                button.classList.replace("proceso", "resuelto");
                button.textContent = "resuelto";

                const updatedReport = {
                    ...report,
                    dataTime: {
                        ...report.dataTime,
                        timeFinishReport: currentDate,
                    },
                    status: "resuelto",
                };

                const updatedDamage = {
                    ...damageReport,
                    status: "resuelto",
                };

                await updateReportAndDamage(reportId, updatedReport, updatedDamage);
            }

            // Reload page to reflect the changes (could be optimized)
            location.reload();
        });
    });
}

// Send PUT requests to update report and damage records
async function updateReportAndDamage(id, reportData, damageData) {
    try {
        await fetch(`${apiDamage}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(damageData),
        });

        await fetch(`${apiReports}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reportData),
        });

        console.log("Datos actualizados correctamente");
    } catch (error) {
        console.error("Error actualizando datos:", error);
    }
}