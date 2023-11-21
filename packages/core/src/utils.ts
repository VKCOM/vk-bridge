export function createInstanceId() {
  const allNumbersAndLetters = 36;
  const positionAfterZeroAnDot = 2;
  const keyLength = 3;
  return Math.random()
    .toString(allNumbersAndLetters)
    .substring(positionAfterZeroAnDot, positionAfterZeroAnDot + keyLength);
}
