# SVG编辑器升级版 Whale版

**使用方式**
    * 无需任何环境搭建, 直接将index.html文件打开即可

**2019.10.26 21:17**
  * 参考线功能已彻底重写, 耗时3天, 对应文件为 referLine.js
  * 设计思路: canvas为完全的面向对象操作, 第一代版本中坐标轴的设计中属于明显的面向过程, 导致后续进行坐标轴缩放等功能难以展开. 在新的版本中通过ReferLine, ReferLineX, ReferLineY 这三个类来进行参考线的绘制, 声明LINEDETAILS 常量并将其暴露至外, 来进行不同程序块之间的通信. 剩余具体实现请参见源码.

---
