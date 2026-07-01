export const DEFAULT_TEMPLATE = `---
title: "{{title}}"
subtitle: "{{subtitle}}"
author: "{{author}}"
publisher: "{{publisher}}"
publishDate: "{{publishDate}}"
totalPage: {{totalPage}}
isbn: "{{isbn}}"
cover: "{{coverUrl}}"
status: unread
created: {{DATE:YYYY-MM-DD}}
---

![cover|200]({{coverUrl}})

# {{title}}

## Summary

{{description}}

## Notes

`;
