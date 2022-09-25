import Time from 'timen';

export default function debounce(cb, ms) {
  let isCooldown = false;
  let isCalledAtCooldown = false;
  return function (...args) {
    if (isCooldown) {
      isCalledAtCooldown = true;
      return;
    }
    cb(...args);
    isCooldown = true;
    Time.after(ms, () => {
      isCooldown = false;
      if (isCalledAtCooldown) {
        cb(...args);
        isCalledAtCooldown = false;
      }
    });
  };
}
