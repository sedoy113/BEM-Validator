/**
 * Правило: Элемент не может существовать без родительского блока
 * Проверяем, что у элемента есть блок (на том же элементе или в родителе)
 */
export const elementOutsideBlockRule = {
    name: 'element-outside-block',
    check: (elements, bemClasses, config, fileName) => {
        const errors = [];
        const { elementSeparator } = config;
        for (const element of elements) {
            // Собираем все блоки, которые есть в классах этого элемента
            const blocksInElement = new Set();
            for (const cls of element.classes) {
                const bemClass = bemClasses.find(b => b.original === cls);
                if (bemClass?.block && !bemClass.element) {
                    blocksInElement.add(bemClass.block);
                }
            }
            // Проверяем каждый класс-элемент
            for (const cls of element.classes) {
                const bemClass = bemClasses.find(b => b.original === cls);
                // Если это элемент (есть блок и элемент)
                if (bemClass?.element && bemClass.block) {
                    // Проверяем наличие блока: в классах элемента или в parentBlock
                    const hasBlockInClasses = blocksInElement.has(bemClass.block);
                    const hasBlockInParent = element.parentBlock === bemClass.block;
                    if (!hasBlockInClasses && !hasBlockInParent) {
                        errors.push({
                            line: element.line,
                            column: element.column,
                            file: fileName,
                            class: cls,
                            rule: 'element-outside-block',
                            message: `Элемент "${cls}" должен находиться внутри блока "${bemClass.block}"`,
                            severity: 'error',
                        });
                    }
                }
            }
        }
        return errors;
    },
};
/**
 * Правило: Модификатор должен иметь значение
 * Булевы модификаторы (без значения) считаются валидными
 */
export const modifierWithoutValueRule = {
    name: 'modifier-without-value',
    check: (elements, bemClasses, config, fileName) => {
        const errors = [];
        for (const element of elements) {
            for (const cls of element.classes) {
                const bemClass = bemClasses.find(b => b.original === cls);
                // Пропускаем булевы модификаторы (они валидны без значения)
                // Проверяем только модификаторы с пустым значением (не undefined)
                if (bemClass?.modifier && bemClass.modifier.value === '') {
                    // Формируем правильный пример с учётом наличия элемента
                    const elementPart = bemClass.element ? `${config.elementSeparator}${bemClass.element}` : '';
                    const correctExample = `${bemClass.block}${elementPart}${config.modifierSeparator}${bemClass.modifier.name}-value`;
                    errors.push({
                        line: element.line,
                        column: element.column,
                        file: fileName,
                        class: cls,
                        rule: 'modifier-without-value',
                        message: `Модификатор "${bemClass.modifier.name}" должен иметь значение. ` +
                            `Правильный пример: "${correctExample}". ` +
                            `Исправление: добавьте значение модификатору через дефис, например: "${cls}-active" или "${cls}-large"`,
                        severity: 'warning',
                    });
                }
            }
        }
        return errors;
    },
};
/**
 * Правило: Некорректное имя класса
 */
export const invalidClassNameRule = {
    name: 'invalid-class-name',
    check: (elements, bemClasses, config, fileName) => {
        const errors = [];
        for (const element of elements) {
            for (const cls of element.classes) {
                const bemClass = bemClasses.find(b => b.original === cls);
                if (bemClass && !bemClass.isValid) {
                    errors.push({
                        line: element.line,
                        column: element.column,
                        file: fileName,
                        class: cls,
                        rule: 'invalid-class-name',
                        message: `Некорректное имя БЭМ-класса "${cls}"`,
                        severity: 'error',
                    });
                }
            }
        }
        return errors;
    },
};
/**
 * Правило: Смешение разных нотаций
 *
 * Проверяет реальное смешение нотаций БЭМ:
 * - Классическая: .block__element--modifier (два подчёркивания, два дефиса)
 * - Альтернативная: .block_element_modifier (одно подчёркивание)
 *
 * НЕ считает смешением:
 * - Дефисы в имени блока (news-list, page-content)
 * - Модификаторы с -- (block--modifier)
 */
export const mixedNotationsRule = {
    name: 'mixed-notations',
    check: (elements, bemClasses, config, fileName) => {
        const errors = [];
        // Считаем использование разных нотаций
        let classicCount = 0; // .block__element (два подчёркивания)
        let underscoreCount = 0; // .block_element (одно подчёркивание как разделитель)
        for (const bemClass of bemClasses) {
            const cls = bemClass.original;
            // Пропускаем классы без разделителей (просто блоки)
            if (!cls.includes('__') && !cls.includes('_')) {
                continue;
            }
            // Класс с двумя подчёркиваниями - классическая нотация
            if (cls.includes('__')) {
                classicCount++;
            }
            // Класс с одним подчёркиванием (но не с двумя) - альтернативная нотация
            // Проверяем, что это именно разделитель, а не часть имени
            else if (cls.includes('_')) {
                // Дополнительная проверка: если есть дефисы, это может быть модификатор
                // Считаем альтернативной нотацией только если подчёркивание используется как разделитель
                underscoreCount++;
            }
        }
        // Если используются обе нотации
        if (classicCount > 0 && underscoreCount > 0) {
            errors.push({
                line: 1,
                column: 1,
                file: fileName,
                class: '',
                rule: 'mixed-notations',
                message: `Обнаружено смешение нотаций: ${classicCount} классов с "__" и ${underscoreCount} классов с "_"`,
                severity: 'error',
            });
        }
        return errors;
    },
};
