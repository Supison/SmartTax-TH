/* ==========================================================
   SmartTax TH
   Tax Calculation Service

   หมายเหตุ:
   เป็นการคำนวณตามสมมติฐานจากโค้ดต้นฉบับ
   ยังไม่ใช่ระบบ Backend API จริง
   ========================================================== */

class ThaiTaxBackendService {
    constructor() {
        // อัตราภาษีแบบขั้นบันไดตามที่กำหนดไว้ในต้นฉบับ
        this.brackets = [
            { min: 0, max: 150000, rate: 0.00 },
            { min: 150000, max: 300000, rate: 0.05 },
            { min: 300000, max: 500000, rate: 0.10 },
            { min: 500000, max: 750000, rate: 0.15 },
            { min: 750000, max: 1000000, rate: 0.20 },
            { min: 1000000, max: 2000000, rate: 0.25 },
            { min: 2000000, max: 5000000, rate: 0.30 },
            { min: 5000000, max: Infinity, rate: 0.35 }
        ];
    }

    // จำลองการรับคำขอจาก Backend API
    handleCalculateTaxRequest(requestBody) {
        const monthlySalary =
            parseFloat(requestBody.monthlySalary) || 0;

        const otherIncome =
            parseFloat(requestBody.otherIncome) || 0;

        // รายได้รวมทั้งปี
        const annualGross =
            (monthlySalary * 12) + otherIncome;

        // ค่าใช้จ่ายมาตรฐาน
        const standardExpenses =
            Math.min(annualGross * 0.5, 100000);

        // ค่าลดหย่อนส่วนตัว
        const personalAllowance = 60000;

        // ค่าลดหย่อนบุตร
        const children =
            (parseInt(requestBody.childrenCount, 10) || 0) * 30000;

        // ประกันสังคม
        const socialSecurity = Math.min(
            parseFloat(requestBody.socialSecurity) || 0,
            9000
        );

        // ประกันชีวิต/สุขภาพ ตามสมมติฐานในโค้ดเดิม
        const lifeInsurance = Math.min(
            parseFloat(requestBody.lifeInsurance) || 0,
            100000
        );

        // กองทุน PVD / RMF / SSF ตามค่าที่กรอก
        const pvdRmfSsf =
            parseFloat(requestBody.pvdRmfSsf) || 0;

        // รวมค่าลดหย่อน
        const totalDeductions =
            personalAllowance +
            children +
            socialSecurity +
            lifeInsurance +
            pvdRmfSsf;

        // เงินได้สุทธิที่นำไปคำนวณภาษี
        const taxableIncome = Math.max(
            0,
            annualGross - standardExpenses - totalDeductions
        );

        let totalTax = 0;
        let marginalRate = 0;

        // คำนวณภาษีแยกตามแต่ละขั้น
        this.brackets.forEach((bracket) => {
            if (taxableIncome > bracket.min) {
                const inBracket = Math.min(
                    taxableIncome - bracket.min,
                    bracket.max - bracket.min
                );

                totalTax += inBracket * bracket.rate;

                if (inBracket > 0) {
                    marginalRate = bracket.rate;
                }
            }
        });

        // รายได้หลังหักภาษีและประกันสังคม
        const netTakeHome =
            annualGross - totalTax - socialSecurity;

        // อัตราภาษีเฉลี่ยเทียบกับรายได้รวม
        const effectiveRate = annualGross > 0
            ? (totalTax / annualGross) * 100
            : 0;

        // ส่งผลลัพธ์กลับในรูปแบบ object
        return {
            statusCode: 200,
            timestamp: new Date().toISOString(),

            data: {
                annualGross,
                standardExpenses,
                totalDeductions,
                taxableIncome,
                totalTax,
                netTakeHome,
                effectiveRate,
                marginalRate
            }
        };
    }
}

// ทำให้ไฟล์อื่นเรียกใช้งานคลาสนี้ได้
window.ThaiTaxBackendService = ThaiTaxBackendService;
