# KGTI
KGTI-“考古人格分析”

## 前言

**KGTI**原本只是我心血来潮利用晚上下班的几个小时时间手搓+“氛围编程”搞的自娱自乐的小项目，没想到能受到大家的喜欢。上线24小时不到便收获了7000+人次的访问，感谢支持！

如有任何意见或建议，可以在github提交或通过邮件（<a href="jiyiming@doubt-fact.top">jiyiming@doubt-fact.top</a>）联系我。

再次声明，**仅供娱乐**，并不作为专业“人格分析”参考。

## 文件结构

```markdown
  ├── server.js
  ├── public/
  │   ├── index.html
  │   ├── css/
  │   │   └── style.css
  │   └── js/
  │       └── app.js
  ├── json/
  │   ├── announcement.json
  │   ├── personality.json
  │   └── question.json
  └── icon/
      ├── demo.css
      ├── iconfont.css
      ├── iconfont.js
      ├── iconfont.json
      ├── iconfont.ttf
      ├── iconfont.woff
      └── iconfont.woff2
```

## 特点

~~（这个项目真的非常非常简单，真的有特点吗？）~~

1. 因为项目本身很简单，所以虽然使用了`Node.js`作为后端，但并没有使用框架，也没有第三方依赖；
2. 题目、人格、公告使用json进行存储，内容和界面得以解耦，对于大部分内容上的修改，可以直接修改json，而不必修改代码（非常便于二开）；
3. 人格“分析”采用了最简单的记分方式，选项按维度累加记分，最后排序确定“人格”；
4. 针对不同场景做了响应式设计。

## 在线体验

[kgti.doubt-fact.tech](kgti.doubt-fact.tech)

## 支持我

![https://www.doubt-fact.top/](https://www.doubt-fact.top/usr/uploads/2022/02/3193382672.png)

顺颂时祺！
