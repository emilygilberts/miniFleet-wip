// utils.js
//hardcorded to central med for now
export function getRandomLongInRange() {
  return (
    Math.random() * (23.53822224695913 - 12.321715363613052) +
    12.321715363613052
  );
}

export function getRandomLatInRange() {
  return (
    Math.random() * (39.257778150283364 - 32.24068253457369) + 32.24068253457369
  );
}

export function generateRandomId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000); // Adjust the range as needed
  return `${timestamp}_${random}`;
}
