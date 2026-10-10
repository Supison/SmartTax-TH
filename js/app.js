/* ==========================================================
   SmartTax TH
   Frontend Controller
   เชื่อม Form, Tax Calculator, Chart และ UI
   ========================================================== */

// สร้างตัวคำนวณภาษี
const backendAPI = new window.ThaiTaxBackendService();

// แปลงตัวเลขเป็นรูปแบบเงินบาท
function formatCurrency(value) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        maximumFractionDigits: 0
    }).format(value || 0);
}

// อ่านข้อมูลจากฟอร์ม
function collectTaxFormData() {
    return {
        monthlySalary:
            document.getElementById('monthlySalary').value,

        otherIncome:
            document.getElementById('otherIncome').value,

        socialSecurity:
            document.getElementById('socialSecurity').value,

        lifeInsurance:
            document.getElementById('lifeInsurance').value,

        pvdRmfSsf:
            document.getElementById('pvdRmfSsf').value,

        childrenCount:
            document.getElementById('childrenCount').value
    };
}

// คำนวณภาษีและแสดงผลบนหน้าเว็บ
function triggerFrontendSync() {
    const payload = collectTaxFormData();

    // เรียกใช้ตัวคำนวณภาษีใน taxCalculator.js
    const response =
        backendAPI.handleCalculateTaxRequest(payload);

    const resData = response.data;

    // แสดงรายได้สุทธิหลังภาษี
    document.getElementById('netIncomeDisplay').textContent =
        formatCurrency(resData.netTakeHome);

    // แสดงรายได้สุทธิเฉลี่ยต่อเดือน
    document.getElementById('monthlyTakeHome').textContent =
        `~${formatCurrency(resData.netTakeHome / 12)} / เดือน`;

    // แสดงภาษีรวม
    document.getElementById('totalTaxDisplay').textContent =
        formatCurrency(resData.totalTax);

    // แสดงอัตราภาษีเฉลี่ย
    document.getElementById('effectiveTaxRate').textContent =
        `อัตราเฉลี่ย: ${resData.effectiveRate.toFixed(1)}%`;

    // แสดงอัตราภาษีขั้นสูงสุดที่แตะถึง
    document.getElementById('marginalTaxRate').textContent =
        `${(resData.marginalRate * 100).toFixed(0)}%`;

    // อัปเดตกราฟ
    if (typeof window.updateBreakdownChart === 'function') {
        window.updateBreakdownChart(resData);
    }
}

// ตั้งค่าปุ่มและ Event Listeners
function initializeApp() {
    // สร้างกราฟก่อนคำนวณครั้งแรก
    if (typeof window.initChart === 'function') {
        window.initChart();
    }

    // คำนวณครั้งแรกเมื่อเปิดหน้าเว็บ
    triggerFrontendSync();

    // คำนวณใหม่เมื่อผู้ใช้แก้ไขข้อมูล
    document.querySelectorAll('#taxForm input').forEach((input) => {
        input.addEventListener('input', triggerFrontendSync);
    });

    // เปิดหน้าต่างสถาปัตยกรรมโค้ด
    const architectureToggle =
        document.getElementById('architectureToggle');

    const archModal =
        document.getElementById('archModal');

    if (architectureToggle && archModal) {
        architectureToggle.addEventListener('click', () => {
            archModal.classList.remove('hidden');
        });
    }

    // ปิดหน้าต่างสถาปัตยกรรมโค้ด
    const closeArchitectureModal =
        document.getElementById('closeArchitectureModal');

    if (closeArchitectureModal && archModal) {
        closeArchitectureModal.addEventListener('click', () => {
            archModal.classList.add('hidden');
        });
    }

    // ปิดหน้าต่างเมื่อคลิกพื้นที่ด้านนอก
    if (archModal) {
        archModal.addEventListener('click', (event) => {
            if (event.target === archModal) {
                archModal.classList.add('hidden');
            }
        });
    }

    // เปลี่ยนธีมสว่าง/มืด
    const themeToggleBtn =
        document.getElementById('themeToggleBtn');

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
        });
    }
}

// เริ่มทำงานหลังจาก HTML โหลดเสร็จ
document.addEventListener('DOMContentLoaded', initializeApp);
