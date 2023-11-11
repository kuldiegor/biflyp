# BIFLYP

Biflyp is simple web page for viewing Markdown text

# Описание
Biflyp это простой web проект для просмотра markdown текста, с формированием оглавления.

# Параметры

## href
Пример:
```vue 
href="README.md"
```
Ссылка на markdown текст.
Дополнительно настраивается параметром `only-own-host-in-href`, `use-href-in-location`.

## use-href-in-location
Пример:
```vue 
:use-href-in-location="false"
```
Флаг включения возможности передачи ссылки на markdown текст с помощью параметра `href` в запросе.  
Например так:
```
http://example.com/biflyp/index.html?href=http://example.com/test.md
```
По умолчанию имеет значение `false`.  
Дополнительно настраивается параметром `only-own-host-in-href`.  

## only-own-host-in-href
Пример:
```vue 
:only-own-host-in-href="true"
```
Флаг проверки хоста в параметре `href`. Парсить ссылки только с таким же хостом с которого загружен biflyp.
По умолчанию имеет значение `true`.

## markdown-text
Пример:
```vue 
:markdown-text="markdownText"
```
Текст markdown.

## show-table-of-contents
Пример:
```vue 
:show-table-of-contents="true"
```
Флаг показа оглавления.
По умолчанию имеет значение `true`.

# Использование
Для того чтобы начать использовать Biflyp достаточно склонировать репозиторий в каталог на серевере.
Например так:
```bash
:~$ git clone https://github.com/kuldiegor/biflyp.git
```
Затем в index.html файле вставить ссылку в параметр href.  
Вот тут:
```html
<biflyp 
        href="README.md"
/>
```
Готово.
