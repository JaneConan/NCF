﻿## 调试说明

Razor Page 的独立库需要编译成 dll 后被 Senparc.Web 项目引用才能生效。

因此，如果需要快速调试 .cshtml 中的页面内容（避免每次都调试），可以将此文件夹（Areas）整体移动到 Senparc.Web 根目录下。

## 安全性

### 对Admin 模块进行访问限制

1. 为了提高安全性，我们建议对于线上生产环境中的制（如限制IP、限制本地访问，或在别处加载而不在生产环境中集成）。

2. 同时，您也可以通过随机修改 Area 名字来提高后台的安全性。请注意：这样会导致所有的链接都需要修改对应的 Area 名字，并且安全性不及上述方法。