/**
 * Типы данных для валидатора БЭМ
 */
export const defaultConfig = {
    notation: 'bem',
    elementSeparator: '__',
    modifierSeparator: '--',
    rules: {
        'element-outside-block': 'error',
        'modifier-without-value': 'warning',
        'mixed-notations': 'error',
        'invalid-class-name': 'error',
    },
    ignore: ['node_modules', 'dist'],
    files: ['**/*.html'],
};
