/* ==========================================================
   SmartTax TH
   Chart.js - Tax Breakdown Chart
   ========================================================== */

let breakdownChart = null;

// สร้างกราฟเมื่อหน้าเว็บพร้อมใช้งาน
function initChart() {
    const canvas = document.getElementById('taxBreakdownChart');

    // ป้องกันข้อผิดพลาดถ้าไม่มี canvas
    if (!canvas) {
        console.error('ไม่พบ canvas สำหรับแสดงกราฟ');
        return;
    }

    const ctx = canvas.getContext('2d');

    breakdownChart = new Chart(ctx, {
        type: 'doughnut',

        data: {
            labels: [
                'รายได้คงเหลือ (Take-Home)',
                'ภาษีที่ต้องจ่าย',
                'ค่าใช้จ่าย & ลดหย่อน'
            ],

            datasets: [{
                data: [0, 0, 0],

                backgroundColor: [
                    '#22c55e',
                    '#ef4444',
                    '#3b82f6'
                ],

                borderWidth: 0
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: 'bottom',

                    labels: {
                        font: {
                            family: 'Sarabun',
                            size: 11
                        },

                        boxWidth: 10
                    }
                }
            },

            cutout: '75%'
        }
    });
}

// อัปเดตข้อมูลกราฟจากผลคำนวณภาษี
function updateBreakdownChart(data) {
    if (!breakdownChart || !data) {
        return;
    }

    breakdownChart.data.datasets[0].data = [
        Math.max(0, Math.round(data.netTakeHome)),
        Math.max(0, Math.round(data.totalTax)),
        Math.max(
            0,
            Math.round(data.standardExpenses + data.totalDeductions)
        )
    ];

    breakdownChart.update();
}

// เปิดให้ app.js เรียกใช้ฟังก์ชันได้
window.initChart = initChart;
window.updateBreakdownChart = updateBreakdownChart;