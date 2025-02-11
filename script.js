// 출산 휴가 날짜 계산
function calculateMaternityLeave() {
  const startDate = maternityStart.value;
  if (!startDate) {
    alert('출산휴가 시작일을 입력해주세요.');
    return;
  }

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 90); // 90일 추가
  
  const maternityResult = document.getElementById('maternityResult');
  maternityResult.innerText = formatDate(end);

  // return {
  //     startDate: formatDate(start),
  //     endDate: formatDate(end),
  //     workUntil: formatDate(new Date(start.setDate(start.getDate() - 1))),
  //     backToWork: formatDate(new Date(end.setDate(end.getDate() + 1)))
  // };
}

function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
}


function formatSalaryInput(input) {
  let value = input.value.replace(/,/g, ""); // 기존 콤마 제거
  if (!isNaN(value) && value !== "") {
      input.value = Number(value).toLocaleString(); // 콤마 추가
  } else {
      input.value = "";
  }
}

// 숫자로 변환할 때 사용하는 함수
function getSalaryValue(value) {
  return Number(value.replace(/,/g, ""));
}

// 육아휴직 급여 계산
function calculateParentalLeavePay() {
  const startDateInput = document.getElementById("parentalStart").value;
  const months = parseInt(document.getElementById("parentalMonths").value);
  const salary = parseInt(getSalaryValue(document.getElementById("paySalary").value));
  const isSingleParent = document.getElementById("singleParent").value === "yes";
  const isDoubleParent = document.getElementById("doubleParent").value === "yes";
  const spouseMonths = parseInt(document.getElementById("spouseMonths").value);  // 배우자 육아휴직 기간

  // 입력값 검증
  if (!startDateInput) {
      alert('육아 휴직 시작일을 입력해 주세요.');
      return;
  }
  if (isNaN(months)) {
      alert('육아휴직 기간을 선택해 주세요.');
      return;
  }
  if (isNaN(salary) || salary <= 0) {
      alert('월 통상임금을 입력해 주세요.');
      return;
  }

  const startDate = new Date(startDateInput);
  let totalAmount = 0;
  let spouseTotalAmount = 0;
  let resultHTML = `<thead><tr><th>휴가 기간</th><th>개월수</th><th>지급액</th></tr></thead><tbody>`;
  let spouseResultHTMl = `<thead><tr><th>휴가 기간</th><th>개월수</th><th>지급액</th></tr></thead><tbody>`;

  let monthlySalaries = [];
  let spouseMonthlySalaries = [];

  for (let i = 0; i < months; i++) {
      let currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + i);

      let nextDate = new Date(currentDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      nextDate.setDate(nextDate.getDate() - 1);

      let monthLabel = `${i + 1}개월차<br/>(${(nextDate - currentDate) / (1000 * 60 * 60 * 24) + 1}일)`;
      
      let maxSalary = 0;
      let paidSalary = 0;
      let spousePaid = 0;
      
      if (isDoubleParent) { // 6+6 부모 육아휴직제
        if (i < spouseMonths) {
            // 아빠가 육아휴직 중인 경우
            if (i < 1) maxSalary = 2500000; // 1개월차
            else if (i < 2) maxSalary = 2500000; // 2개월차
            else if (i < 3) maxSalary = 3000000; // 3개월차
            else if (i < 4) maxSalary = 3500000; // 4개월차
            else if (i < 5) maxSalary = 4000000; // 5개월차
            else if (i < 6) maxSalary = 4500000; // 6개월차
            else maxSalary = 1600000; // 이후부터 일반 정책
            paidSalary = Math.min(salary, maxSalary);
            spousePaid = Math.min(salary, maxSalary)
            
            spouseResultHTMl += `<tr>
              <td>${currentDate.toISOString().split("T")[0]}<br/>~ ${nextDate.toISOString().split("T")[0]}</td>
              <td>${monthLabel}</td>
              <td>${spousePaid.toLocaleString()}원</td>
            </tr>`;
            spouseMonthlySalaries.push({ month: i + 1, amount: spousePaid })
          } else {
              // 아빠의 육아휴직이 끝난 후 일반 정책 적용
          if (i < 3) {
              maxSalary = 2500000;
              paidSalary = Math.min(salary, maxSalary);
          } else if (i < 6) {
              maxSalary = 2000000;
              paidSalary = Math.min(salary, maxSalary);
          } else {
              maxSalary = 1600000;
              paidSalary = Math.min(salary * 0.8, maxSalary);
          }
          }
      } else {
          // 일반 정책
          if (i < 3) {
            maxSalary = 2500000;
            paidSalary = Math.min(salary, maxSalary);
        } else if (i < 6) {
            maxSalary = 2000000;
            paidSalary = Math.min(salary, maxSalary);
        } else {
            maxSalary = 1600000;
            paidSalary = Math.min(salary * 0.8, maxSalary);
        }
      }
    
      if (isSingleParent && i < 3) {
        // 한부모 근로자 첫 3개월은 300만원 상한
        maxSalary = 3000000;
        paidSalary = Math.min(salary, maxSalary);
      }

      totalAmount += paidSalary;
      spouseTotalAmount += spousePaid;
      monthlySalaries.push({ month: i + 1, amount: paidSalary });
      
      resultHTML += `<tr>
                      <td>${currentDate.toISOString().split("T")[0]}<br/>~ ${nextDate.toISOString().split("T")[0]}</td>
                      <td>${monthLabel}</td>
                      <td>${paidSalary.toLocaleString()}원</td>
                    </tr>`;
  }

  resultHTML += '</tbody>'
  spouseResultHTMl += '</tbody>'

  document.getElementById('salaryResult').classList.remove('hide');
  document.getElementById("parentalResult").innerText = `총 지급액: ${totalAmount.toLocaleString()}원`;
  document.getElementById("monthlyResult").innerHTML = resultHTML;

  console.log('monthlySalaries:::', monthlySalaries);
  console.log('spouseMonthlySalaries:::', spouseMonthlySalaries);
  drawSalaryChart(monthlySalaries);

  if (isDoubleParent) {
    document.getElementById('spouse').classList.remove('hide');
    document.getElementById("spouseResult").innerText = `배우자 총 지급액: ${spouseTotalAmount.toLocaleString()}원`;
    document.getElementById("spouseMonthlyResult").innerHTML = spouseResultHTMl;
    drawSpouseSalaryChart(spouseMonthlySalaries);    
  }
}

function drawSalaryChart(data) {
  const ctx = document.getElementById('salaryChart').getContext("2d");
  
  if (window.salaryChartInstance) {
      window.salaryChartInstance.destroy(); 
  }

  window.salaryChartInstance = new Chart(ctx, {
      type: "line",
      data: {
          labels: data.map(d => `${d.month}개월`),
          datasets: [{
              label: "월별 급여 지급액",
              data: data.map(d => d.amount),
              borderColor: "blue",
              backgroundColor: "rgba(0, 0, 255, 0.2)",
              fill: true
          }]
      },
      options: {
          responsive: true,
          scales: {
              y: { beginAtZero: true }
          }
      }
  });
}

function drawSpouseSalaryChart(data) {
  const ctx = document.getElementById('spouseSalaryChart').getContext("2d");
  
  if (window.spouseSalaryChartInstance) {
      window.spouseSalaryChartInstance.destroy(); 
  }

  window.spouseSalaryChartInstance = new Chart(ctx, {
      type: "line",
      data: {
          labels: data.map(d => `${d.month}개월`),
          datasets: [{
              label: "배우자 월별 급여 지급액",
              data: data.map(d => d.amount),
              borderColor: "blue",
              backgroundColor: "rgba(0, 0, 255, 0.2)",
              fill: true
          }]
      },
      options: {
          responsive: true,
          scales: {
              y: { beginAtZero: true }
          }
      }
  });
}

function changeDoubleParent() {
  var doubleParentValue = document.getElementById('doubleParent').value;
  var spouseMonths = document.getElementById('spouseMonths');
  
  if (doubleParentValue === 'yes') {
    spouseMonths.disabled = false;
  } else {
    spouseMonths.disabled = true;
  }
}

function resetParentalLeavePay() {
  document.getElementById("parentalStart").value = ""; // 육아휴직 시작일 초기화
  document.getElementById("parentalMonths").value = "1"; // 육아휴직 기간 기본값 (1개월)
  document.getElementById("paySalary").value = ""; // 월 통상임금 초기화
  document.getElementById("singleParent").value = "no"; // 한부모 근로자 여부 기본값 (아니요)
  document.getElementById("doubleParent").value = "no"; // 6+6 부모 육아휴직제 기본값 (미해당)
  
  // 배우자 육아휴직 기간 초기화 및 비활성화
  document.getElementById("spouseMonths").value = "1"; 
  document.getElementById("spouseMonths").disabled = true;

  // 결과 영역 숨기기
  document.getElementById("salaryResult").classList.add("hide");
  document.getElementById("spouse").classList.add("hide");

  // 월별 결과 테이블 초기화
  document.getElementById("monthlyResult").innerHTML = "";
  document.getElementById("spouseMonthlyResult").innerHTML = "";

  // 차트 초기화 (차트가 존재하는 경우)
  if (window.salaryChart) {
    window.salaryChart.destroy();
  }
  if (window.spouseSalaryChart) {
    window.spouseSalaryChart.destroy();
  }

  // 계산 결과 텍스트 초기화
  document.getElementById("parentalResult").textContent = "";
  document.getElementById("spouseResult").textContent = "";
}

document.getElementById("showPopup").onclick = function() {
  document.getElementById("popup").style.display = "block";
}

document.getElementById("closePopup").onclick = function() {
  document.getElementById("popup").style.display = "none";
}

window.onclick = function(event) {
  if (event.target == document.getElementById("popup")) {
      document.getElementById("popup").style.display = "none";
  }
}