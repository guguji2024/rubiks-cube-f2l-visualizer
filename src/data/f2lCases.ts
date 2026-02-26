export interface F2LCase {
  id: string;
  category: string;
  name: string;
  targetCubies: string[]; // <-- 就是漏了这一行致命的定义！
  setupFormula: string;
  formula: string;
  stepDescriptions: string[];
}

export const f2lCases: F2LCase[] = [
  // ================= 类别 1：基础已配对 =================
  {
    id: "F2L-01",
    category: "1. 基础已配对",
    name: "右手标准入槽",
    targetCubies: ['1,-1,1', '1,0,1'], // 强制指定底前右槽
    setupFormula: "R U R' U'", 
    formula: "U R U' R'",
    stepDescriptions: [
      "将已配对好的长方体移至目标槽的正上方",
      "抬起右侧层，准备接收配对块",
      "转动顶层，将配对块推入右侧槽中",
      "复原右侧层，入槽完美完成！"
    ]
  },
  {
    id: "F2L-02",
    category: "1. 基础已配对",
    name: "前手标准入槽",
    targetCubies: ['1,-1,1', '1,0,1'],
    setupFormula: "F' U' F U",
    formula: "U' F' U F",
    stepDescriptions: [
      "将已配对好的长方体移至前侧槽的上方",
      "抬起前侧层，准备接收配对块",
      "转动顶层，将配对块推入前侧槽中",
      "复原前侧层，入槽完美完成！"
    ]
  },

  // ================= 类别 2：顶层异色 (白面朝侧) =================
  {
    id: "F2L-03",
    category: "2. 顶层异色",
    name: "右侧白面，利用空槽",
    targetCubies: ['1,-1,1', '1,0,1'],
    setupFormula: "R U' R'",
    formula: "R U R'",
    stepDescriptions: [
      "抬起右层。注意：这不仅是准备入槽，更是利用右下的空槽位，给顶层的棱块让出结合空间",
      "转动顶层。此时角块和棱块在空中相遇，【转化为：基础已配对】并顺势滑入槽中",
      "复原右层，F2L 完成！"
    ]
  },
  {
    id: "F2L-04",
    category: "2. 顶层异色",
    name: "前侧白面，利用空槽",
    targetCubies: ['1,-1,1', '1,0,1'],
    setupFormula: "F' U F",
    formula: "F' U' F",
    stepDescriptions: [
      "同理，抬起前层，利用前下的空槽位进行空间避让",
      "转动顶层，角棱在前方相遇，【转化为：基础已配对】并压入槽中",
      "复原前层，F2L 完成！"
    ]
  },

  // ================= 类别 3：顶层同色 (需要藏角) =================
  {
    id: "F2L-05",
    category: "3. 顶层同色",
    name: "白面朝右，同色藏角",
    targetCubies: ['1,-1,1', '1,0,1'],
    setupFormula: "R U' R' U2 R U' R'",
    formula: "R U R' U2 R U R'",
    stepDescriptions: [
      "【关键：藏角】抬起右层，将角块'藏'到后方的空槽中，保持其安全",
      "转动顶层，将孤立的棱块移动到对应的匹配位置",
      "复原右层，让角块重新'浮出'水面。此时【已转化为：基础已配对】！",
      "将组装好的长方体移到前方",
      "常规入槽：抬起右槽",
      "推入配对块",
      "复原右槽，完成！"
    ]
  },
  {
    id: "F2L-06",
    category: "3. 顶层同色",
    name: "白面朝前，同色藏角",
    targetCubies: ['1,-1,1', '1,0,1'],
    setupFormula: "R U' R' U R U2 R'",
    formula: "R U2 R' U' R U R'",
    stepDescriptions: [
      "先将妨碍配对的棱块推开至远端",
      "【关键：藏角】抬起右层将角块藏入空槽",
      "将棱块移回到角块上方进行组合",
      "复原右层浮出角块，此时【已转化为：基础已配对】！",
      "将长方体移至目标槽上方",
      "常规入槽：抬起",
      "推入并复原，完成！"
    ]
  },

  // ================= 类别 4：包含底角/槽内 =================
  {
    id: "F2L-07",
    category: "4. 包含底角/槽内",
    name: "角块在底，棱块在上",
    targetCubies: ['1,-1,1', '1,0,1'],
    setupFormula: "R U' R' U R U' R'",
    formula: "R U R' U' R U R'",
    stepDescriptions: [
      "遇到块卡在槽内，第一步永远是【提取】：抬起右层将角块带出",
      "转动顶层，将角块和棱块在顶层分离",
      "复原右层以免破坏底层十字。此时【已转化为：顶层异色】元情况！",
      "重新调整顶层位置，准备入槽",
      "利用空槽配对法：抬起右层",
      "顶层结合并推入",
      "复原右侧，完成！"
    ]
  },
  {
    id: "F2L-08",
    category: "4. 包含底角/槽内",
    name: "全在槽内，顺序错误",
    targetCubies: ['1,-1,1', '1,0,1'],
    setupFormula: "R U' R' U R U2 R' U R U' R'",
    formula: "R U R' U' R U2 R' U' R U R'",
    stepDescriptions: [
      "两个块都在目标槽里但方向不对，必须先将其【提出】",
      "分离角块和棱块",
      "复原右侧层。此时【已转化为：顶层同色】元情况！",
      "将棱块移开，准备藏角",
      "藏角",
      "组合角棱",
      "浮出角块（转化为基础配对）",
      "调整位置",
      "入槽",
      "推入",
      "完成复原！"
    ]
  }
];