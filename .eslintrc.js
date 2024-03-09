module.exports = {
    extends: ['@taoliujun/eslint-config'],
    ignorePatterns: ['/*.js'],
    // rules: {
    //     'max-classes-per-file': ['off'],
    //     // 函数最大行数
    //     'max-lines-per-function': [
    //         'error',
    //         {
    //             max: 200,
    //             skipBlankLines: true,
    //             skipComments: true,
    //         },
    //     ],
    // },
    overrides: [
        {
            // 下列文件不用检查是否被引用
            files: ['./assets/scripts/*Controller.ts'],
            rules: {
                'import/no-unused-modules': ['off'],
            },
        },
    ],
};
