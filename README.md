## Regexp Constructor

[Открыть демо](https://boriskulakov.github.io/)

Локальный запуск:
```bash
# клонирование репозитория
git clone https://github.com/boriskulakov/regexp-constructor.git
# запуск dev server
npm run dev
# или
yarn dev
# или
pnpm dev
```
Запустить [localhost:5173](http://localhost:5173/) в браузере


## О проекте
 Проект написан на [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/). Для сборки использован [Vite](https://vitejs.dev/)
### Для чего нужен
Основная идея – упростить написание регулярных выражений.
### Что для этого сделано
- Поле ввода с автоматической подсветкой разных типов шаблонов помогает проще находить нужные группы, наборы и специальные символы, в некоторых случаях отсутствие подсветки может сказать о наличии ошибки в регулярном выражении
- Основные конструкции вынесены в отдельные кнопки, вставка этих конструкций может происходить по нажатию самой кнопки или с помощью сочетания клавиш, что позволяет быстрее набирать сложные выражения. 
	- Сочетания клавиш можно активировать по кнопке Escape, что позволяет переключать режимы ввода не прекращая набора регулярного выражения
- Также добавлено несколько готовых наборов цифр и букв латинского и русского алфавитов
- Есть выпадающий список с RegExp методами для JavaScript, при нажатии на которые в буфер обмена копируется содержимое поле ввода, обернутое в выбранный метод
- Если кликнуть по полю ввода правой кнопкой мыши, откроется контекстное меню с доступными действиями:
	- Выбрать все, Вырезать, Вставить, Копировать – обычные функции
	- Копировать с флагами – копирует в буфер обмена регулярное выражение в формате `/regexp/flags` с активными флагами
	- Копировать как строку – копирует в буфер обмена регулярное выражение в формате `'/regexp/flags'` с активными флагами, при этом добавляет второй обратный слеш для символов с экранированием `\s ⇒ \\s` и экранирует все типы кавычек внутри выражения, чтобы можно было обернуть выражение в любые кавычки
- Внизу страницы есть небольшая шпаргалка с описанием основных конструкций и методов RegExp