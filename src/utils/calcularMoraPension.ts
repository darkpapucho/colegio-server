export default function calcularMoraPension(monthToPay:number): number { //use month index from 0 to 11
  const currentMonth = new Date().getMonth(); //getMonth returns month index starting from 0
  const currentDay = new Date().getDate();
  
    if(currentMonth <= monthToPay) return 0; //no mora si el mes actual es menor o igual al mes a pagar
    const moraDays = (currentDay-10)>0?(currentDay-10):0;
    const monthDelta = currentMonth - monthToPay;
    const moraMeses = monthDelta <2?0:  (20+ (monthDelta-1)*30); //calcular mora por meses completos de atraso
    const mora = moraMeses+moraDays;
    return mora;
}