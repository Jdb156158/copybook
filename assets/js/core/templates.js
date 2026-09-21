/* ============================================================
 * core/templates.js —— 字帖模板预设 + 内置素材库
 * 模板 = 一组 settings 覆盖值；新增模板只需在此追加
 * ========================================================== */
(function (global) {
  'use strict';

  /* ---------------- 内置素材库 ---------------- */
  var POEMS = [
    { t: '静夜思', a: '李白', c: '床前明月光，疑是地上霜。举头望明月，低头思故乡。' },
    { t: '春晓', a: '孟浩然', c: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。' },
    { t: '咏鹅', a: '骆宾王', c: '鹅，鹅，鹅，曲项向天歌。白毛浮绿水，红掌拨清波。' },
    { t: '悯农', a: '李绅', c: '锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。' },
    { t: '登鹳雀楼', a: '王之涣', c: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。' },
    { t: '江雪', a: '柳宗元', c: '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。' },
    { t: '寻隐者不遇', a: '贾岛', c: '松下问童子，言师采药去。只在此山中，云深不知处。' },
    { t: '池上', a: '白居易', c: '小娃撑小艇，偷采白莲回。不解藏踪迹，浮萍一道开。' },
    { t: '小池', a: '杨万里', c: '泉眼无声惜细流，树阴照水爱晴柔。小荷才露尖尖角，早有蜻蜓立上头。' },
    { t: '绝句', a: '杜甫', c: '两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。' },
    { t: '望庐山瀑布', a: '李白', c: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。' },
    { t: '早发白帝城', a: '李白', c: '朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。' },
    { t: '赠汪伦', a: '李白', c: '李白乘舟将欲行，忽闻岸上踏歌声。桃花潭水深千尺，不及汪伦送我情。' },
    { t: '独坐敬亭山', a: '李白', c: '众鸟高飞尽，孤云独去闲。相看两不厌，只有敬亭山。' },
    { t: '村居', a: '高鼎', c: '草长莺飞二月天，拂堤杨柳醉春烟。儿童散学归来早，忙趁东风放纸鸢。' },
    { t: '所见', a: '袁枚', c: '牧童骑黄牛，歌声振林樾。意欲捕鸣蝉，忽然闭口立。' },
    { t: '敕勒歌', a: '北朝民歌', c: '敕勒川，阴山下。天似穹庐，笼盖四野。天苍苍，野茫茫，风吹草低见牛羊。' },
    { t: '风', a: '李峤', c: '解落三秋叶，能开二月花。过江千尺浪，入竹万竿斜。' },
    { t: '梅花', a: '王安石', c: '墙角数枝梅，凌寒独自开。遥知不是雪，为有暗香来。' },
    { t: '画', a: '王维', c: '远看山有色，近听水无声。春去花还在，人来鸟不惊。' },
    { t: '相思', a: '王维', c: '红豆生南国，春来发几枝。愿君多采撷，此物最相思。' },
    { t: '元日', a: '王安石', c: '爆竹声中一岁除，春风送暖入屠苏。千门万户曈曈日，总把新桃换旧符。' },
    { t: '九月九日忆山东兄弟', a: '王维', c: '独在异乡为异客，每逢佳节倍思亲。遥知兄弟登高处，遍插茱萸少一人。' },
    { t: '清明', a: '杜牧', c: '清明时节雨纷纷，路上行人欲断魂。借问酒家何处有，牧童遥指杏花村。' },
    { t: '游子吟', a: '孟郊', c: '慈母手中线，游子身上衣。临行密密缝，意恐迟迟归。谁言寸草心，报得三春晖。' },
    { t: '咏柳', a: '贺知章', c: '碧玉妆成一树高，万条垂下绿丝绦。不知细叶谁裁出，二月春风似剪刀。' },
    { t: '回乡偶书', a: '贺知章', c: '少小离家老大回，乡音无改鬓毛衰。儿童相见不相识，笑问客从何处来。' },
    { t: '题西林壁', a: '苏轼', c: '横看成岭侧成峰，远近高低各不同。不识庐山真面目，只缘身在此山中。' },
    { t: '饮湖上初晴后雨', a: '苏轼', c: '水光潋滟晴方好，山色空蒙雨亦奇。欲把西湖比西子，淡妆浓抹总相宜。' },
    { t: '示儿', a: '陆游', c: '死去元知万事空，但悲不见九州同。王师北定中原日，家祭无忘告乃翁。' }
  ];

  /* 汉字类素材适用的模板模式（拼音 / 英文 / 数字模板不列汉字素材） */
  var HANZI_MODES = ['hanzi', 'composition', 'vertical'];

  var MATERIALS = [
    {
      id: 'poem', name: '小学必背古诗', icon: 'poem',
      modes: HANZI_MODES,
      items: POEMS.map(function (p) {
        return { name: p.t + '·' + p.a, text: p.t + '\n' + p.a + '\n' + p.c.replace(/[，。、？！]/g, '') };
      })
    },
    {
      id: 'sanzi', name: '三字经', icon: 'book',
      modes: HANZI_MODES,
      items: [
        { name: '三字经·开篇', text: '人之初性本善性相近习相远苟不教性乃迁教之道贵以专昔孟母择邻处子不学断机杼窦燕山有义方教五子名俱扬' },
        { name: '三字经·勤学', text: '玉不琢不成器人不学不知义为人子方少时亲师友习礼仪香九龄能温席孝于亲所当执融四岁能让梨弟于长宜先知' },
        { name: '三字经·常识', text: '首孝悌次见闻知某数识某文一而十十而百百而千千而万三才者天地人三光者日月星三纲者君臣义父子亲夫妇顺' }
      ]
    },
    {
      id: 'dizigui', name: '弟子规', icon: 'book',
      modes: HANZI_MODES,
      items: [
        { name: '弟子规·总叙', text: '弟子规圣人训首孝悌次谨信泛爱众而亲仁有余力则学文' },
        { name: '弟子规·入则孝', text: '父母呼应勿缓父母命行勿懒父母教须敬听父母责须顺承冬则温夏则凊晨则省昏则定出必告反必面居有常业无变' }
      ]
    },
    {
      id: 'qianziwen', name: '千字文', icon: 'book',
      modes: HANZI_MODES,
      items: [
        { name: '千字文·开篇', text: '天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳' },
        { name: '千字文·修身', text: '女慕贞洁男效才良知过必改得能莫忘罔谈彼短靡恃己长信使可覆器欲难量' }
      ]
    },
    {
      id: 'baijiaxing', name: '百家姓', icon: 'book',
      modes: HANZI_MODES,
      items: [
        { name: '百家姓·一', text: '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜' },
        { name: '百家姓·二', text: '戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐' }
      ]
    },
    {
      id: 'pinyin', name: '汉语拼音', icon: 'pinyin',
      modes: ['pinyin'],
      items: [
        { name: '声母表', text: 'b p m f d t n l g k h j q x zh ch sh r z c s y w', mode: 'pinyin' },
        { name: '韵母表', text: 'a o e i u ü ai ei ui ao ou iu ie üe er an en in un ün ang eng ing ong', mode: 'pinyin' },
        { name: '整体认读音节', text: 'zhi chi shi ri zi ci si yi wu yu ye yue yuan yin yun ying', mode: 'pinyin' },
        { name: '四声调练习', text: 'mā má mǎ mà bō bó bǒ bò dī dí dǐ dì hū hú hǔ hù', mode: 'pinyin' }
      ]
    },
    {
      id: 'english', name: '英文字母', icon: 'abc',
      modes: ['english'],
      items: [
        { name: '大写 A-Z', text: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', mode: 'english' },
        { name: '小写 a-z', text: 'a b c d e f g h i j k l m n o p q r s t u v w x y z', mode: 'english' },
        { name: '大小写对照', text: 'Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz', mode: 'english' },
        { name: '常用单词', text: 'hello world apple book cat dog egg fish good home love name', mode: 'english' }
      ]
    },
    {
      id: 'number', name: '数字与算术', icon: 'num',
      modes: ['number'],
      items: [
        { name: '数字 0-9', text: '0 1 2 3 4 5 6 7 8 9', mode: 'number' },
        { name: '0-20 数数', text: '0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20', mode: 'number' },
        { name: '十以内加法', text: '1+1=2 1+2=3 2+3=5 4+5=9 3+6=9 7+2=9 5+5=10', mode: 'number' },
        { name: '十以内减法', text: '10-1=9 9-2=7 8-3=5 7-4=3 6-5=1 5-2=3 4-1=3', mode: 'number' }
      ]
    },
    {
      id: 'shizi', name: '启蒙识字', icon: 'hanzi',
      modes: HANZI_MODES,
      items: [
        { name: '数字汉字', text: '一二三四五六七八九十百千万' },
        { name: '人体与自然', text: '人口手足目耳头心天地日月水火山石田土木禾竹米雨云风雪' },
        { name: '方位与比较', text: '上下中左右前后里外东西南北大小多少长短高矮方圆' },
        { name: '生活常用', text: '爸妈爷奶哥姐弟妹师生学校国家朋友早晚年月日时分' },
        { name: '动作与颜色', text: '出入开关来去坐立走跑飞跳听说读写画唱笑红黄蓝绿黑白' }
      ]
    },
    {
      id: 'chengyu', name: '成语积累', icon: 'hanzi',
      modes: HANZI_MODES,
      items: [
        { name: '数字成语', text: '一心一意三心二意四面八方五湖四海七上八下九牛一毛十全十美' },
        { name: '动物成语', text: '龙飞凤舞画蛇添足亡羊补牢守株待兔狐假虎威鹤立鸡群' },
        { name: '勤学成语', text: '专心致志孜孜不倦勤能补拙锲而不舍学而不厌温故知新' }
      ]
    }
  ];

  /* ---------------- 模板预设 ---------------- */
  var TEMPLATES = [
    {
      id: 'tianzi-pinyin', name: '拼音田字格', tag: '热门', icon: 'hanzi',
      desc: '生字 + 拼音 + 描红，低年级每日练字标配',
      sample: '天地人你我他一二三四五六七八九十',
      settings: {
        mode: 'hanzi', grid: 'tianzi', showPinyin: true, cols: 9, repeat: 3,
        trace: true, traceOpacity: 0.25, font: 'kaiti', lineColor: '#2b2b2b',
        guideColor: '#c8c2b6', textColor: '#1a1a1a', rowGap: 3, pinyinStyle: 'tone',
        header: { title: '每日练字', fields: ['姓名', '班级', '日期'], score: true }
      }
    },
    {
      id: 'mizi-trace', name: '米字格描红', tag: '进阶', icon: 'hanzi',
      desc: '带对角辅助线，看清起笔收笔与笔画走向',
      sample: '春眠不觉晓处处闻啼鸟',
      settings: {
        mode: 'hanzi', grid: 'mizi', showPinyin: true, cols: 9, repeat: 2,
        trace: true, traceOpacity: 0.3, font: 'kaiti', rowGap: 4,
        header: { title: '硬笔书法练习', fields: ['姓名', '日期'], score: true }
      }
    },
    {
      id: 'mihui-pro', name: '米字回宫格', tag: '结构', icon: 'hanzi',
      desc: '内外框 + 斜线，专治结构松散与重心偏移',
      sample: '结构匀称收放有度',
      settings: {
        mode: 'hanzi', grid: 'mihui', showPinyin: false, cols: 9, repeat: 3,
        trace: true, traceOpacity: 0.22, rowGap: 4
      }
    },
    {
      id: 'hui-gongge', name: '回宫格', tag: '结构', icon: 'hanzi',
      desc: '内宫定位中宫，外宫控制收放',
      sample: '内外相宜中宫收紧',
      settings: {
        mode: 'hanzi', grid: 'hui', showPinyin: false, cols: 9, repeat: 3,
        trace: true, traceOpacity: 0.22, rowGap: 4
      }
    },
    {
      id: 'jiugong', name: '九宫格', tag: '比例', icon: 'hanzi',
      desc: '九等分辅助，精细观察部件布局与占格',
      sample: '比例协调重心平稳',
      settings: {
        mode: 'hanzi', grid: 'jiugong', showPinyin: false, cols: 8, repeat: 2,
        trace: true, traceOpacity: 0.25, rowGap: 4
      }
    },
    {
      id: 'pinyin-4line', name: '拼音四线三格', tag: '拼音', icon: 'pinyin',
      desc: '声母韵母专项，格线贴合教材规范',
      sample: 'b p m f d t n l g k h j q x zh ch sh r z c s y w',
      settings: {
        mode: 'pinyin', grid: 'sixiang', showPinyin: false, cols: 10, repeat: 2,
        trace: true, traceOpacity: 0.3, rowGap: 2, font: 'kaiti'
      }
    },
    {
      id: 'english-4line', name: '英文四线三格', tag: '英语', icon: 'abc',
      desc: '字母占格规范，含大小写对照练习',
      sample: 'A a B b C c D d E e F f G g H h',
      settings: {
        mode: 'english', grid: 'sixiang', showPinyin: false, cols: 10, repeat: 2,
        trace: true, traceOpacity: 0.3, rowGap: 2, font: 'english',
        header: { title: 'English Writing', fields: ['Name', 'Date'], score: false }
      }
    },
    {
      id: 'number', name: '数字练习', tag: '启蒙', icon: 'num',
      desc: '0-9 与算式书写，田字格居中定位',
      sample: '0 1 2 3 4 5 6 7 8 9 10',
      settings: {
        mode: 'number', grid: 'tianzi', showPinyin: false, cols: 9, repeat: 4,
        trace: true, traceOpacity: 0.3, rowGap: 3, font: 'kaiti'
      }
    },
    {
      id: 'gushi-vertical', name: '古诗竖排（右起）', tag: '作品', icon: 'poem',
      desc: '传统竖排右起，含落款列，适合作品展示',
      sample: '床前明月光\n疑是地上霜\n举头望明月\n低头思故乡',
      settings: {
        mode: 'vertical', grid: 'fang', showPinyin: false, cols: 0, repeat: 1,
        trace: true, traceOpacity: 0.2, vertical: true, rowGap: 2, font: 'kaiti',
        cellSizeV: 20,
        header: { title: '', fields: [], score: false }
      }
    },
    {
      id: 'gushi-square', name: '古诗方格抄写', tag: '作品', icon: 'poem',
      desc: '方格 + 标点占位，整篇抄写不串行',
      sample: '床前明月光\n疑是地上霜\n举头望明月\n低头思故乡',
      settings: {
        mode: 'composition', grid: 'fang', showPinyin: false, cols: 12, repeat: 1,
        trace: false, rowGap: 2, font: 'kaiti',
        header: { title: '古诗抄写', fields: ['姓名'], score: false }
      }
    },
    {
      id: 'composition', name: '作文稿纸', tag: '高年级', icon: 'write',
      desc: '标准方格稿纸，每格一字，标题居中',
      sample: ' ',
      settings: {
        mode: 'composition', grid: 'fang', showPinyin: false, cols: 15, repeat: 1,
        trace: false, rowGap: 0, font: 'songti', keepPunct: true,
        header: { title: '', fields: ['学校', '班级', '姓名'], score: false }
      }
    },
    {
      id: 'name-practice', name: '姓名练习', tag: '启蒙', icon: 'hanzi',
      desc: '大字反复书写，适合学写自己的名字',
      sample: '李小明',
      settings: {
        mode: 'hanzi', grid: 'tianzi', showPinyin: true, cols: 8, repeat: 6,
        trace: true, traceOpacity: 0.18, rowGap: 3, font: 'kaiti',
        header: { title: '姓名练习', fields: ['姓名'], score: false }
      }
    },
    {
      id: 'basic-strokes', name: '基本笔画', tag: '启蒙', icon: 'stroke',
      desc: '24 个基本笔画，一笔一画打基础',
      sample: '',
      settings: {
        mode: 'stroke', grid: 'tianzi', showPinyin: false, cols: 8, repeat: 3,
        trace: true, traceOpacity: 0.25, rowGap: 3
      }
    },
    {
      id: 'pen-control', name: '控笔训练', tag: '启蒙', icon: 'stroke',
      desc: '点连点 / 波浪 / 螺旋，先控笔再写字',
      sample: '',
      settings: {
        mode: 'pattern', grid: 'none', showPinyin: false, cols: 1, repeat: 2,
        trace: false, rowGap: 4, pattern: 'wave', cellRatio: 0.17,
        header: { title: '控笔训练', fields: ['姓名'], score: false }
      }
    },
    {
      id: 'zuoye-blank', name: '空白练习纸', tag: '通用', icon: 'blank',
      desc: '纯格子，任你自由发挥',
      sample: '',
      settings: {
        mode: 'composition', grid: 'none', showPinyin: false, cols: 8, repeat: 1,
        trace: false, rowGap: 3
      }
    },
    {
      id: 'calligraphy-work', name: '硬笔作品纸', tag: '作品', icon: 'poem',
      desc: '田字格大字 + 落款区，比赛投稿可用',
      sample: '床前明月光疑是地上霜举头望明月低头思故乡',
      settings: {
        mode: 'hanzi', grid: 'tianzi', showPinyin: false, cols: 7, repeat: 1,
        trace: false, rowGap: 5, font: 'kaiti', showSignature: true,
        header: { title: '', fields: [], score: false }
      }
    },

    /* ------- 以下为 zidianba.com/templates 去重后补充的模板 ------- */
    {
      id: 'mizi-blank', name: '米字格空白', tag: '通用', icon: 'blank',
      desc: '米字格空白页，可自由书写或打印手写，主题色可切换',
      sample: '',
      settings: {
        mode: 'hanzi', grid: 'mizi', showPinyin: false, cols: 10, repeat: 1,
        trace: false, rowGap: 3
      }
    },
    {
      id: 'fang-blank', name: '方格空白', tag: '通用', icon: 'blank',
      desc: '干净方格空白页，抄写与自由书写两用',
      sample: '',
      settings: {
        mode: 'composition', grid: 'fang', showPinyin: false, cols: 14, repeat: 1,
        trace: false, rowGap: 2
      }
    },
    {
      id: 'shengzi', name: '生字本', tag: '课堂', icon: 'hanzi',
      desc: '田字格 + 拼音 + 头行，贴近小学语文课堂生字纸',
      sample: '天地人你我他山水田上下左右',
      settings: {
        mode: 'hanzi', grid: 'tianzi', showPinyin: true, cols: 9, repeat: 2,
        trace: true, traceOpacity: 0.25, rowGap: 3, font: 'kaiti',
        header: { title: '生字本', fields: ['姓名', '班级', '日期'], score: false }
      }
    },
    {
      id: 'hardpen-hline', name: '硬笔横线格', tag: '硬笔', icon: 'write',
      desc: '实线横线格，稳定行距与水平，适合楷书连写与长句抄写',
      sample: '横平竖直，撇捺舒展，结构匀称，重心平稳。每日一练，贵在坚持。',
      settings: {
        mode: 'hanzi', grid: 'hengxian', showPinyin: false, cols: 18, repeat: 1,
        trace: false, rowGap: 10, dash: false, lineWidth: 1, font: 'kaiti',
        header: { title: '硬笔书法练习', fields: ['姓名', '日期'], score: false }
      }
    },
    {
      id: 'hengxian-dash', name: '横虚线格', tag: '硬笔', icon: 'write',
      desc: '虚线横线提示基线与行距，版面轻盈，整齐不死板',
      sample: '轻盈的虚线，写完卷面更干净。先慢写找齐线，再加快速度。',
      settings: {
        mode: 'hanzi', grid: 'hengxian', showPinyin: false, cols: 18, repeat: 1,
        trace: false, rowGap: 10, dash: true, lineWidth: 1, font: 'kaiti',
        header: { title: '横虚线书写', fields: ['姓名'], score: false }
      }
    },
    {
      id: 'hardpen-vline', name: '硬笔竖线格', tag: '硬笔', icon: 'write',
      desc: '中竖辅助线，看清列齐与相对位置，是方格到无格的过渡',
      sample: '中竖一线，列齐字正。由格入无，渐成章法。',
      settings: {
        mode: 'hanzi', grid: 'shuxian', showPinyin: false, cols: 12, repeat: 1,
        trace: false, rowGap: 4, dash: false, lineWidth: 1, font: 'kaiti',
        header: { title: '竖线格练习', fields: ['姓名', '日期'], score: false }
      }
    },
    {
      id: 'shuxian-dash', name: '竖虚线格', tag: '硬笔', icon: 'write',
      desc: '竖虚线提示对齐，视觉更轻，写完卷面更清爽',
      sample: '虚线不抢笔画，写稳后可逐步减少对它的依赖。',
      settings: {
        mode: 'hanzi', grid: 'shuxian', showPinyin: false, cols: 12, repeat: 1,
        trace: false, rowGap: 4, dash: true, lineWidth: 1, font: 'kaiti',
        header: { title: '竖虚线练习', fields: ['姓名'], score: false }
      }
    },
    {
      id: 'radical-practice', name: '偏旁部首', tag: '启蒙', icon: 'stroke',
      desc: '预填常用偏旁部件，先把偏旁写稳再组字',
      sample: '氵讠亻扌木忄彳辶纟钅火犭口日',
      settings: {
        mode: 'hanzi', grid: 'tianzi', showPinyin: false, cols: 9, repeat: 2,
        trace: true, traceOpacity: 0.25, rowGap: 3, font: 'kaiti',
        header: { title: '偏旁部首练习', fields: ['姓名', '日期'], score: false }
      }
    },
    {
      id: 'number-cards', name: '数字识字卡', tag: '启蒙', icon: 'num',
      desc: '一二到零米字格临摹，含拼音，适合数字汉字启蒙',
      sample: '一二三四五六七八九十零',
      settings: {
        mode: 'hanzi', grid: 'mizi', showPinyin: true, cols: 9, repeat: 2,
        trace: true, traceOpacity: 0.3, rowGap: 3, font: 'kaiti',
        header: { title: '数字识字卡', fields: ['姓名'], score: false }
      }
    },
    {
      id: 'name-mizi', name: '姓名练字帖', tag: '启蒙', icon: 'hanzi',
      desc: '米字格姓名临摹描红，大字反复书写',
      sample: '李小明',
      settings: {
        mode: 'hanzi', grid: 'mizi', showPinyin: true, cols: 8, repeat: 5,
        trace: true, traceOpacity: 0.18, rowGap: 3, font: 'kaiti',
        header: { title: '姓名练习', fields: ['姓名'], score: false }
      }
    },
    {
      id: 'mingpian-trace', name: '名篇描红', tag: '作品', icon: 'poem',
      desc: '竖线格虚线楷体描红，临写名篇，标题可自填',
      sample: '先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。',
      settings: {
        mode: 'vertical', grid: 'shuxian', showPinyin: false, cols: 0, repeat: 1,
        trace: true, traceOpacity: 0.2, vertical: true, rowGap: 2, font: 'kaiti',
        cellSizeV: 20, dash: true,
        header: { title: '出师表（节选）', fields: [], score: false }
      }
    },
    {
      id: 'diary', name: '日记书写纸', tag: '通用', icon: 'write',
      desc: '横线格 + 日期天气栏，适合每日日记与周记',
      sample: '今天天气晴朗，我和爸爸妈妈去公园放风筝。春风暖暖的，真开心！',
      settings: {
        mode: 'hanzi', grid: 'hengxian', showPinyin: false, cols: 18, repeat: 1,
        trace: false, rowGap: 10, dash: false, lineWidth: 1, font: 'kaiti',
        header: { title: '日记', fields: ['日期', '天气'], score: false }
      }
    },
    {
      id: 'growth-log', name: '成长记录', tag: '通用', icon: 'book',
      desc: '横线格 + 日期/心情/事件栏，手账风成长记录',
      sample: '学会了自己系鞋带，还得到了老师的表扬，心里美滋滋的。',
      settings: {
        mode: 'hanzi', grid: 'hengxian', showPinyin: false, cols: 18, repeat: 1,
        trace: false, rowGap: 10, dash: false, lineWidth: 1, font: 'kaiti',
        header: { title: '成长记录', fields: ['日期', '心情', '事件'], score: false }
      }
    },
    {
      id: 'months-card', name: '月份单词卡', tag: '英语', icon: 'abc',
      desc: '1-12 月英文单词卡，临写记忆，标题可自填',
      sample: 'January February March April May June July August September October November December',
      settings: {
        mode: 'english', grid: 'fang', showPinyin: false, cols: 4, repeat: 1,
        trace: true, traceOpacity: 0.3, rowGap: 4, font: 'english',
        header: { title: 'Months 月份单词卡', fields: ['Name', 'Date'], score: false }
      }
    },
    {
      id: 'creative-writing', name: '创意书写纸', tag: '通用', icon: 'write',
      desc: '大方格自由书写，适合主题创作与手抄报配套',
      sample: '',
      settings: {
        mode: 'composition', grid: 'fang', showPinyin: false, cols: 10, repeat: 1,
        trace: false, rowGap: 2, font: 'kaiti',
        header: { title: '创意书写', fields: ['主题', '姓名'], score: false }
      }
    }
  ];

  /* ---------------- 字体预设 ---------------- */
  /* 字体名称统一用单引号包裹：render.js 会把 stack 直接拼进 style="…" 双引号属性，
     若用双引号会导致内层引号提前闭合、整条 font-family 被浏览器截断（切换字体无变化）。 */
  var FONTS = [
    { id: 'kaiti', name: '楷体', stack: "'Kaiti SC','STKaiti','KaiTi','Kaiti TC','楷体',serif" },
    { id: 'xingkai', name: '行楷', stack: "'Xingkai SC','STXingkai','华文行楷',cursive,serif" },
    { id: 'songti', name: '宋体', stack: "'Songti SC','SimSun','宋体','STSong',serif" },
    { id: 'heiti', name: '黑体', stack: "'PingFang SC','Hiragino Sans GB','Heiti SC','Microsoft YaHei',sans-serif" },
    { id: 'lishu', name: '隶书', stack: "'STLibian','LiSu','隶书',serif" },
    { id: 'yuanti', name: '圆体', stack: "'Yuanti SC','YouYuan','幼圆',sans-serif" },
    { id: 'songti-bold', name: '宋体加粗', stack: "'Songti SC','SimSun',serif", weight: 700 },
    { id: 'english', name: '英文手写', stack: "'Snell Roundhand','Bradley Hand','Segoe Script','Comic Sans MS',cursive" }
  ];

  /* ---------------- 配色预设 ---------------- */
  var PALETTES = [
    { id: 'ink', name: '墨黑', line: '#2b2b2b', guide: '#c9c3b7', text: '#1a1a1a' },
    { id: 'textbook', name: '教材绿', line: '#3f7a52', guide: '#9dc3a8', text: '#2f6b45' },
    { id: 'vermilion', name: '朱砂红', line: '#b1392c', guide: '#e0aaa0', text: '#8f2c22' },
    { id: 'blue', name: '靛蓝', line: '#2b4f7a', guide: '#a8bcd4', text: '#1f3f66' },
    { id: 'gray', name: '石墨灰', line: '#6b6b6b', guide: '#c4c4c4', text: '#4a4a4a' }
  ];

  var PAGE_SIZES = [
    { id: 'A4', name: 'A4', w: 210, h: 297 },
    { id: 'A5', name: 'A5', w: 148, h: 210 },
    { id: 'B5', name: 'B5', w: 176, h: 250 },
    { id: '16K', name: '16 开', w: 185, h: 260 },
    { id: 'Letter', name: 'Letter', w: 215.9, h: 279.4 }
  ];

  /**
   * 取当前模板可用的素材组（内容类型不匹配的不列出）
   * stroke（基本笔画）/ pattern（控笔训练）用内置笔画与图案，不吃输入文本，故无素材
   * @param {string} mode 当前模板的 settings.mode
   * @return {Array} 可用的素材组
   */
  function materialsForMode(mode) {
    if (mode === 'stroke' || mode === 'pattern') return [];
    return MATERIALS.filter(function (g) {
      if (!g.modes) return true;
      return g.modes.indexOf(mode) >= 0;
    });
  }

  global.CBTemplates = {
    TEMPLATES: TEMPLATES,
    MATERIALS: MATERIALS,
    materialsForMode: materialsForMode,
    POEMS: POEMS,
    FONTS: FONTS,
    PALETTES: PALETTES,
    PAGE_SIZES: PAGE_SIZES,
    get: function (id) {
      for (var i = 0; i < TEMPLATES.length; i++) {
        if (TEMPLATES[i].id === id) return TEMPLATES[i];
      }
      return TEMPLATES[0];
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
