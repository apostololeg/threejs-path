import Time from 'timen';

type Params = { trailing?: boolean };

export default function throttle(
  fn,
  ms: number,
  { trailing }: Params = {}
): any {
  let isCooldown = false;
  let isCalledAtCooldown = false;

  return function (...args) {
    if (isCooldown) {
      isCalledAtCooldown = true;
    } else {
      isCooldown = true;
      isCalledAtCooldown = false;

      Time.after(ms, () => {
        isCooldown = false;
        if (trailing && isCalledAtCooldown) {
          fn.apply(this, args);
          isCalledAtCooldown = false;
        }
      });

      fn.apply(this, args);
    }
  };
}
