// function calcSalary(base) {
//   base = Number(base) || 0;
//   const hra = base * 0.2;
//   const bonus = base * 0.1;
//   return Math.round((base + hra + bonus) * 100) / 100;
// }
// module.exports = { calcSalary };

function calcSalary(baseSalary, hraPercent, bonusPercent) {
  // Ensure numbers
  baseSalary = Number(baseSalary) || 0;
  hraPercent = Number(hraPercent) || 0;
  bonusPercent = Number(bonusPercent) || 0;

  // Calculate HRA and bonus
  const hra = (baseSalary * hraPercent) / 100;
  const bonus = (baseSalary * bonusPercent) / 100;

  // Total salary
  const total = baseSalary + hra + bonus;

  return {
    base: baseSalary,
    hra: hra,
    bonus: bonus,
    total: total,
  };
}

module.exports = { calcSalary };
