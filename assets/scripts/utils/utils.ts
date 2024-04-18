// 判断多个值相等

export const isEqualAll = (...args) => {
    const [arg1, arg2, ...otherArgs] = args;
    if (otherArgs.length === 0) {
        return arg1 === arg2;
    }
    return arg1 === arg2 && isEqualAll.apply(this, [arg2, ...otherArgs]);
};
