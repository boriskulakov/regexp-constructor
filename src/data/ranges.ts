import { Ranges } from "@/types/types"

export const availableCharacters = [
  'АЕЁИОУЫЭЮЯБВГДЖЗЙКЛМНПРСТФХЧЦШЩ',
  'аеёиоуыэюябвгджзйклмнпрстфхчцшщ',
  'AEIOUYBCDFGHJKLMNPQRSTVWXYZ',
  'aeiouybcdfghjklmnpqrstvwxyz',
  '0123456789',
  '.,+-*/\\|?<>;:\'"{[]}=+–—_!@#№$%^&*()`~ ',
]

export const ranges: Ranges = {
  digits: {
    insert: '0-9',
    text: '0-9',
  },
  odd: {
    insert: '13579',
    text: 'Нечетные цифры',
  },
  even: {
    insert: '02468',
    text: 'Четные цифры',
  },
  chars_en: {
    insert: 'a-z',
    text: 'a-z',
  },
  cap_chars_en: {
    insert: 'A-Z',
    text: 'A-Z',
  },
  both_chars_en: {
    insert: 'a-zA-Z',
    text: 'a-zA-Z',
  },
  chars_ru: {
    insert: 'а-я',
    text: 'а-я',
  },
  cap_chars_ru: {
    insert: 'А-Я',
    text: 'А-Я',
  },
  both_chars_ru: {
    insert: 'а-яА-Я',
    text: 'а-яА-Я',
  },
  word_ru: {
    insert: 'а-яА-Я0-9_',
    text: 'а-яА-Я0-9_',
  },
}

export const ranges_alphabet: Ranges = {
  vowels_en: {
    insert: 'AEIOUY',
    text: 'Гласные буквы [EN]',
  },
  vowels_ru: {
    insert: 'АЕЁИОУЫЭЮЯ',
    text: 'Гласные буквы [RU]',
  },
  consonants_en: {
    insert: 'BCDFGHJKLMNPQRSTVWXYZ',
    text: 'Согласные буквы [EN]',
  },
  consonants_ru: {
    insert: 'БВГДЖЗЙКЛМНПРСТФХЧЦШЩ',
    text: 'Согласные буквы [RU]',
  },
}
