function initializeDashboardChart(monthlyData) {
    const labels = monthlyData.map(item => new Date(item.month).toLocaleDateString('default', { month: 'short', year: 'numeric' }));
    const counts = monthlyData.map(item => item.count);

    const ctx = document.getElementById('monthlyStatsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Reports',
                data: counts,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
} 