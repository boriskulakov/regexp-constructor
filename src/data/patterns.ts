import { Patterns, PatternType } from '@/types/types'

export const patterns: Record<PatternType, Patterns> = {
  symbols: {
    any: {
      insert: '.',
      explanation: 'Любой символ',
      code: 'KeyA',
    },
    digit: {
      insert: '\\d',
      explanation: 'Любая цифра',
      code: 'KeyD',
    },
    non_digit: {
      insert: '\\D',
      explanation: 'Любой символ кроме цифры',
      code: 'Shift+KeyD',
    },
    space: {
      insert: '\\s',
      explanation: 'Любой пробельный символ',
      code: 'Space',
    },
    non_space: {
      insert: '\\S',
      explanation: 'Любой символ кроме пробельных',
      code: 'Shift+Space',
    },
    word_char: {
      insert: '\\w',
      explanation: 'Любая латинская буква, цифра или знак _',
      code: 'KeyW',
    },
    non_word_char: {
      insert: '\\W',
      explanation: 'Любой символ кроме латинских букв, цифр или знака _',
      code: 'Shift+KeyW',
    },
    escape_char: {
      insert: '\\',
      explanation: 'Символ экранирования',
      code: 'KeyE',
    },
    or: {
      insert: '|',
      explanation: 'Оператор ИЛИ',
      code: 'KeyO',
    },
    start: {
      insert: '^',
      explanation: 'Начало строки',
      code: 'KeyF',
    },
    end: {
      insert: '$',
      explanation: 'Конец строки',
      code: 'KeyL',
    },
  },
  quantifiers: {
    one_more: {
      insert: '+',
      explanation: 'Один повтор и больше',
      code: 'KeyP',
    },
    any: {
      insert: '*',
      explanation: 'От 0 повторов и больше',
      code: 'KeyM',
    },
    optional: {
      insert: '?',
      explanation: 'Максимум 1 повтор',
      code: 'KeyQ',
    },
    quant: {
      insert: '{n}',
      explanation: 'Ровно n повторов',
      code: 'KeyN',
      selection: {
        from: 1,
        to: 2,
        select: true,
      },
    },
    range: {
      insert: '{n,m}',
      explanation: 'От n до m повторов',
      code: 'KeyR',
      selection: {
        from: 1,
        to: 2,
        select: true,
      },
    },
    more: {
      insert: '{n,}',
      explanation: 'Минимум n повторов',
      code: 'Shift+KeyR',
      selection: {
        from: 1,
        to: 2,
        select: true,
      },
    },
  },
  groups: {
    set: {
      insert: '[]',
      explanation: 'Набор символов',
      code: 'KeyS',
      selection: {
        from: 1,
        to: 1,
        select: false,
      },
      isGroup: true,
    },
    non_set: {
      insert: '[^]',
      explanation: 'Исключающий набор',
      code: 'KeyX',
      selection: {
        from: 2,
        to: 2,
        select: false,
      },
      isGroup: true,
    },
    group: {
      insert: '()',
      explanation: 'Группа',
      code: 'KeyG',
      selection: {
        from: 1,
        to: 1,
        select: false,
      },
      isGroup: true,
    },
    ex_group: {
      insert: '(?:)',
      explanation: 'Группа, исключенная из нумерации',
      code: 'Shift+KeyG',
      selection: {
        from: 3,
        to: 3,
        select: false,
      },
      isGroup: true,
    },
    named_group: {
      insert: '(?<name>)',
      explanation: 'Именованная группа',
      code: 'Shift+KeyN',
      selection: {
        from: 3,
        to: 7,
        select: true,
      },
      isGroup: true,
    },
    positive_lookahead: {
      insert: '(?=)',
      explanation: 'Опережающая проверка',
      code: 'KeyC',
      selection: {
        from: 3,
        to: 3,
        select: false,
      },
      isGroup: true,
      link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookahead_assertion',
    },
    positive_lookbehind: {
      insert: '(?<=)',
      explanation: 'Ретроспективная проверка',
      code: 'KeyB',
      selection: {
        from: 4,
        to: 4,
        select: false,
      },
      isGroup: true,
      link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookbehind_assertion',
    },
    negative_lookahead: {
      insert: '(?!)',
      explanation: 'Негативная опережающая проверка',
      code: 'Shift+KeyC',
      selection: {
        from: 3,
        to: 3,
        select: false,
      },
      isGroup: true,
      link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookahead_assertion',
    },
    negative_lookbehind: {
      insert: '(?<!)',
      explanation: 'Негативная ретроспективная проверка',
      code: 'Shift+KeyB',
      selection: {
        from: 4,
        to: 4,
        select: false,
      },
      isGroup: true,
      link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookbehind_assertion',
    },
  },
}
