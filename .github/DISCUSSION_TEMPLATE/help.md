---
title: 问题求助
body:
  - type: textarea
    id: description
    attributes:
      label: 问题描述
      description: 请详细描述你遇到的问题
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: 复现步骤
      description: 请描述如何复现这个问题
  - type: textarea
    id: expectation
    attributes:
      label: 期望结果
      description: 你期望发生什么？
  - type: textarea
    id: actual
    attributes:
      label: 实际结果
      description: 实际发生了什么？
