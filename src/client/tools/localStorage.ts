const ls = window.localStorage;

export default {
  get(key): any {
    let result = ls.getItem(key);

    try {
      result = JSON.parse(result);
    } catch (err) {
      console.warn(err);
    }

    return result;
  },

  set(key, obj) {
    const item = JSON.stringify(obj);
    ls.setItem(key, item);
  },

  remove(key) {
    ls.removeItem(key);
  },

  clear() {
    ls.clear();
  },
};
