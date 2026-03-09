import * as htmlparser from 'htmlparser2';
import type { HtmlElement } from '../types.js';

/**
 * Парсит HTML и извлекает элементы с классами
 */
export function parseHtml(html: string, fileName: string = 'unknown'): HtmlElement[] {
  const elements: HtmlElement[] = [];

  // Стек открытых тегов для отслеживания вложенности
  const tagStack: Array<{ name: string; hasBlock: boolean }> = [];

  // Стек блоков: { blockName, tagIndex } где tagIndex - индекс тега в tagStack
  const blockStack: Array<{ block: string; tagIndex: number }> = [];

  const parser = new htmlparser.Parser({
    onopentag(name, attribs) {
      // Добавляем тег в стек
      tagStack.push({ name, hasBlock: false });
      const currentTagIndex = tagStack.length - 1;

      // Вычисляем позицию тега
      const { line, column } = findPosition(html, parser.startIndex);

      if (attribs.class) {
        const classes = attribs.class.split(/\s+/).filter(Boolean);

        // Определяем родительский блок из стека
        // Для элементов ищем блок, которому они принадлежат
        let parentBlock: string | undefined;
        
        // Сначала проверяем, есть ли среди классов элементы с блоком
        for (const cls of classes) {
          if (cls.includes('__')) {
            // Это элемент БЭМ, извлекаем имя блока
            const blockName = cls.split('__')[0];
            // Проверяем, есть ли такой блок в стеке
            for (let i = blockStack.length - 1; i >= 0; i--) {
              if (blockStack[i].block === blockName) {
                parentBlock = blockName;
                break;
              }
            }
            if (parentBlock) break;
          }
        }
        
        // Если не нашли блок для элемента, берём последний блок в стеке
        if (!parentBlock && blockStack.length > 0) {
          parentBlock = blockStack[blockStack.length - 1].block;
        }

        elements.push({
          tag: name,
          classes,
          line,
          column,
          parentBlock,
        });

        // Если класс выглядит как блок (без __), добавляем в стек
        for (const cls of classes) {
          // Пропускаем элементы (с __)
          if (cls.includes('__')) {
            continue;
          }
          // Извлекаем имя блока (до -- для модификаторов)
          const blockName = cls.split('--')[0];
          if (blockName && !cls.includes('--') && !cls.includes('_')) {
            // Это просто блок (button, header)
            blockStack.push({ block: blockName, tagIndex: currentTagIndex });
            // Помечаем тег как содержащий блок
            tagStack[currentTagIndex].hasBlock = true;
          }
        }
      }
    },

    onclosetag(name) {
      // Находим последний открытый тег с таким именем
      for (let i = tagStack.length - 1; i >= 0; i--) {
        if (tagStack[i].name === name) {
          const closedTagIndex = i;
          tagStack.pop();

          // Удаляем блоки, которые были добавлены этим тегом или вложенными
          while (blockStack.length > 0 && blockStack[blockStack.length - 1].tagIndex >= closedTagIndex) {
            blockStack.pop();
          }
          break;
        }
      }
    },
  }, {
    recognizeSelfClosing: true,
    xmlMode: false,
  });

  parser.write(html);
  parser.end();

  return elements;
}

/**
 * Находит позицию (строка, колонка) в HTML по индексу
 */
function findPosition(html: string, index: number): { line: number; column: number } {
  let line = 1;
  let column = 1;

  for (let i = 0; i < index && i < html.length; i++) {
    if (html[i] === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
  }

  return { line, column };
}

/**
 * Извлекает все классы из HTML
 */
export function extractClasses(html: string): string[] {
  const elements = parseHtml(html);
  const allClasses = new Set<string>();

  for (const element of elements) {
    for (const cls of element.classes) {
      allClasses.add(cls);
    }
  }

  return Array.from(allClasses);
}
