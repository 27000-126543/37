export type QuestionType = 'single' | 'multiple' | 'judge' | 'subjective'
export type CourseStatus = 'draft' | 'published' | 'archived'
export type CoursewareType = 'video' | 'pdf' | 'ppt' | 'doc'

export interface QuestionOption {
  key: string
  content: string
}

export interface Question {
  id: string
  type: QuestionType
  content: string
  options?: QuestionOption[]
  answer: string | string[]
  score: number
  analysis?: string
  chapterId?: string
}

export interface Courseware {
  id: string
  title: string
  type: CoursewareType
  url: string
  fileSize: string
  duration?: number
  uploadedAt: string
}

export interface Lesson {
  id: string
  title: string
  duration: number
  description: string
  coursewares: Courseware[]
  isFree: boolean
  sortOrder: number
}

export interface Chapter {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  sortOrder: number
}

export interface Course {
  id: string
  title: string
  subtitle: string
  cover: string
  description: string
  category: string
  tags: string[]
  teacherId: string
  assistantIds: string[]
  chapters: Chapter[]
  questions: Question[]
  enrolledCount: number
  completedCount: number
  rating: number
  status: CourseStatus
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedHours: number
  price: number
  createdAt: string
  updatedAt: string
}

export const mockCourses: Course[] = [
  {
    id: 'c001',
    title: 'Python全栈开发实战',
    subtitle: '从零基础到项目实战，掌握Python全栈开发技能',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Python%20programming%20course%20cover%20with%20code%20snippets%20on%20dark%20background%20professional%20tech%20education&image_size=landscape_16_9',
    description: '本课程面向零基础学员，系统讲解Python编程语言。从基础语法到面向对象编程，从Web开发到数据分析，通过多个真实项目实战，让你快速掌握Python全栈开发技能。课程包含Django框架、Flask框架、MySQL数据库、爬虫技术等核心内容。',
    category: '编程语言',
    tags: ['Python', '后端开发', 'Web开发', '爬虫', '数据库'],
    teacherId: 'u003',
    assistantIds: ['u005'],
    difficulty: 'beginner',
    estimatedHours: 120,
    price: 1299,
    status: 'published',
    enrolledCount: 356,
    completedCount: 128,
    rating: 4.8,
    createdAt: '2024-07-01',
    updatedAt: '2025-05-20',
    chapters: [
      {
        id: 'ch001-1',
        title: '第一章 Python入门基础',
        description: '了解Python语言特点，搭建开发环境，学习基础语法',
        sortOrder: 1,
        lessons: [
          {
            id: 'l001-1-1',
            title: '1.1 Python简介与环境搭建',
            duration: 45,
            description: '介绍Python的发展历史、特点及应用领域，演示如何在Windows和Mac上安装Python及配置开发环境。',
            isFree: true,
            sortOrder: 1,
            coursewares: [
              {
                id: 'cw001-1-1-1',
                title: 'Python环境搭建教程.pdf',
                type: 'pdf',
                url: '/courseware/python-setup.pdf',
                fileSize: '2.3MB',
                uploadedAt: '2024-07-02'
              },
              {
                id: 'cw001-1-1-2',
                title: '1.1 Python简介与环境搭建.mp4',
                type: 'video',
                url: '/videos/lesson-1-1.mp4',
                fileSize: '128MB',
                duration: 2700,
                uploadedAt: '2024-07-02'
              }
            ]
          },
          {
            id: 'l001-1-2',
            title: '1.2 变量与数据类型',
            duration: 60,
            description: '深入学习Python变量命名规则、基本数据类型（整型、浮点型、字符串、布尔值）及类型转换。',
            isFree: true,
            sortOrder: 2,
            coursewares: [
              {
                id: 'cw001-1-2-1',
                title: '1.2 变量与数据类型.mp4',
                type: 'video',
                url: '/videos/lesson-1-2.mp4',
                fileSize: '156MB',
                duration: 3600,
                uploadedAt: '2024-07-03'
              },
              {
                id: 'cw001-1-2-2',
                title: '课堂练习代码.py',
                type: 'doc',
                url: '/courseware/lesson1-2-code.py',
                fileSize: '12KB',
                uploadedAt: '2024-07-03'
              }
            ]
          },
          {
            id: 'l001-1-3',
            title: '1.3 运算符与表达式',
            duration: 50,
            description: '掌握算术运算符、比较运算符、逻辑运算符、赋值运算符及表达式的使用。',
            isFree: false,
            sortOrder: 3,
            coursewares: [
              {
                id: 'cw001-1-3-1',
                title: '1.3 运算符与表达式.mp4',
                type: 'video',
                url: '/videos/lesson-1-3.mp4',
                fileSize: '140MB',
                duration: 3000,
                uploadedAt: '2024-07-04'
              }
            ]
          }
        ]
      },
      {
        id: 'ch001-2',
        title: '第二章 流程控制与函数',
        description: '学习条件判断、循环语句以及函数定义与使用',
        sortOrder: 2,
        lessons: [
          {
            id: 'l001-2-1',
            title: '2.1 条件判断语句',
            duration: 55,
            description: '深入理解if、elif、else条件语句的使用，掌握嵌套条件判断。',
            isFree: false,
            sortOrder: 1,
            coursewares: [
              {
                id: 'cw001-2-1-1',
                title: '2.1 条件判断语句.pptx',
                type: 'ppt',
                url: '/courseware/condition.pptx',
                fileSize: '5.6MB',
                uploadedAt: '2024-07-05'
              },
              {
                id: 'cw001-2-1-2',
                title: '2.1 条件判断语句.mp4',
                type: 'video',
                url: '/videos/lesson-2-1.mp4',
                fileSize: '165MB',
                duration: 3300,
                uploadedAt: '2024-07-05'
              }
            ]
          },
          {
            id: 'l001-2-2',
            title: '2.2 循环语句',
            duration: 65,
            description: '学习for循环、while循环、循环嵌套及break、continue关键字的使用。',
            isFree: false,
            sortOrder: 2,
            coursewares: [
              {
                id: 'cw001-2-2-1',
                title: '2.2 循环语句.mp4',
                type: 'video',
                url: '/videos/lesson-2-2.mp4',
                fileSize: '180MB',
                duration: 3900,
                uploadedAt: '2024-07-06'
              }
            ]
          },
          {
            id: 'l001-2-3',
            title: '2.3 函数定义与调用',
            duration: 70,
            description: '掌握函数定义、参数传递、返回值、作用域以及匿名函数lambda。',
            isFree: false,
            sortOrder: 3,
            coursewares: [
              {
                id: 'cw001-2-3-1',
                title: '2.3 函数详解.pdf',
                type: 'pdf',
                url: '/courseware/functions.pdf',
                fileSize: '3.2MB',
                uploadedAt: '2024-07-07'
              },
              {
                id: 'cw001-2-3-2',
                title: '2.3 函数定义与调用.mp4',
                type: 'video',
                url: '/videos/lesson-2-3.mp4',
                fileSize: '195MB',
                duration: 4200,
                uploadedAt: '2024-07-07'
              }
            ]
          }
        ]
      },
      {
        id: 'ch001-3',
        title: '第三章 面向对象编程',
        description: '深入理解OOP思想，掌握类、对象、继承、多态',
        sortOrder: 3,
        lessons: [
          {
            id: 'l001-3-1',
            title: '3.1 类与对象基础',
            duration: 60,
            description: '学习类的定义、属性与方法、构造函数__init__以及self关键字。',
            isFree: false,
            sortOrder: 1,
            coursewares: [
              {
                id: 'cw001-3-1-1',
                title: '3.1 类与对象基础.mp4',
                type: 'video',
                url: '/videos/lesson-3-1.mp4',
                fileSize: '170MB',
                duration: 3600,
                uploadedAt: '2024-07-08'
              }
            ]
          },
          {
            id: 'l001-3-2',
            title: '3.2 继承与多态',
            duration: 75,
            description: '掌握类的继承、方法重写、super()函数以及多态的概念与应用。',
            isFree: false,
            sortOrder: 2,
            coursewares: [
              {
                id: 'cw001-3-2-1',
                title: '面向对象编程进阶.pdf',
                type: 'pdf',
                url: '/courseware/oop-advanced.pdf',
                fileSize: '4.1MB',
                uploadedAt: '2024-07-09'
              },
              {
                id: 'cw001-3-2-2',
                title: '3.2 继承与多态.mp4',
                type: 'video',
                url: '/videos/lesson-3-2.mp4',
                fileSize: '210MB',
                duration: 4500,
                uploadedAt: '2024-07-09'
              }
            ]
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q001-1',
        type: 'single',
        content: '以下哪个不是Python的合法变量名？',
        options: [
          { key: 'A', content: 'user_name' },
          { key: 'B', content: '_private' },
          { key: 'C', content: '123abc' },
          { key: 'D', content: 'price123' }
        ],
        answer: 'C',
        score: 5,
        analysis: 'Python变量名不能以数字开头，必须以字母或下划线开头。',
        chapterId: 'ch001-1'
      },
      {
        id: 'q001-2',
        type: 'multiple',
        content: '以下哪些是Python的基本数据类型？（多选）',
        options: [
          { key: 'A', content: 'int' },
          { key: 'B', content: 'str' },
          { key: 'C', content: 'char' },
          { key: 'D', content: 'bool' }
        ],
        answer: ['A', 'B', 'D'],
        score: 10,
        analysis: 'Python的基本数据类型包括int、float、str、bool、list、tuple、dict、set等。char不是Python的独立类型，单个字符在Python中也是str类型。',
        chapterId: 'ch001-1'
      },
      {
        id: 'q001-3',
        type: 'judge',
        content: 'Python是一种强类型、动态类型的编程语言。',
        answer: '正确',
        score: 5,
        analysis: 'Python确实是强类型语言（不允许隐式类型转换），同时也是动态类型语言（变量类型在运行时确定）。',
        chapterId: 'ch001-1'
      },
      {
        id: 'q001-4',
        type: 'subjective',
        content: '请简述Python中列表（list）和元组（tuple）的区别，并举例说明它们各自的适用场景。',
        answer: '列表是可变的，可以增删改；元组是不可变的。列表用[]定义，元组用()定义。列表适用于需要动态修改的数据集合，如购物车列表；元组适用于固定不变的数据，如坐标点、配置信息等。',
        score: 20,
        analysis: '需要从可变性、定义方式、性能、适用场景等方面进行对比。',
        chapterId: 'ch001-2'
      },
      {
        id: 'q001-5',
        type: 'single',
        content: '在Python中，以下哪个关键字用于定义函数？',
        options: [
          { key: 'A', content: 'function' },
          { key: 'B', content: 'def' },
          { key: 'C', content: 'func' },
          { key: 'D', content: 'define' }
        ],
        answer: 'B',
        score: 5,
        analysis: 'Python使用def关键字来定义函数。',
        chapterId: 'ch001-2'
      },
      {
        id: 'q001-6',
        type: 'subjective',
        content: '请编写一个Python函数，实现冒泡排序算法，对传入的列表进行升序排序，并写出时间复杂度和空间复杂度。',
        answer: 'def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr\n时间复杂度O(n²)，空间复杂度O(1)',
        score: 25,
        analysis: '冒泡排序的核心是相邻元素比较和交换，需要掌握两层循环的边界条件。',
        chapterId: 'ch001-3'
      }
    ]
  },
  {
    id: 'c002',
    title: '数据分析与可视化实战',
    subtitle: 'Pandas、NumPy、Matplotlib、Seaborn全流程数据分析',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Data%20analytics%20course%20cover%20with%20charts%20graphs%20visualization%20professional%20business%20intelligence&image_size=landscape_16_9',
    description: '本课程系统讲解数据分析全流程，从数据清洗到可视化展示。使用Pandas进行数据处理，NumPy进行数值计算，Matplotlib和Seaborn进行数据可视化，并结合真实商业案例进行实战演练。',
    category: '数据科学',
    tags: ['数据分析', 'Pandas', 'NumPy', '可视化', '数据挖掘'],
    teacherId: 'u003',
    assistantIds: ['u005'],
    difficulty: 'intermediate',
    estimatedHours: 80,
    price: 999,
    status: 'published',
    enrolledCount: 289,
    completedCount: 95,
    rating: 4.7,
    createdAt: '2024-08-15',
    updatedAt: '2025-04-10',
    chapters: [
      {
        id: 'ch002-1',
        title: '第一章 数据分析基础',
        description: '了解数据分析流程，掌握NumPy数值计算',
        sortOrder: 1,
        lessons: [
          {
            id: 'l002-1-1',
            title: '1.1 数据分析概述',
            duration: 40,
            description: '介绍数据分析的概念、流程、常用工具及职业发展方向。',
            isFree: true,
            sortOrder: 1,
            coursewares: [
              {
                id: 'cw002-1-1-1',
                title: '1.1 数据分析概述.mp4',
                type: 'video',
                url: '/videos/da-lesson-1-1.mp4',
                fileSize: '110MB',
                duration: 2400,
                uploadedAt: '2024-08-16'
              }
            ]
          },
          {
            id: 'l002-1-2',
            title: '1.2 NumPy数组操作',
            duration: 70,
            description: '学习NumPy数组创建、索引切片、形状变换、数学运算及广播机制。',
            isFree: false,
            sortOrder: 2,
            coursewares: [
              {
                id: 'cw002-1-2-1',
                title: 'NumPy速查表.pdf',
                type: 'pdf',
                url: '/courseware/numpy-cheatsheet.pdf',
                fileSize: '1.8MB',
                uploadedAt: '2024-08-17'
              },
              {
                id: 'cw002-1-2-2',
                title: '1.2 NumPy数组操作.mp4',
                type: 'video',
                url: '/videos/da-lesson-1-2.mp4',
                fileSize: '195MB',
                duration: 4200,
                uploadedAt: '2024-08-17'
              }
            ]
          }
        ]
      },
      {
        id: 'ch002-2',
        title: '第二章 Pandas数据处理',
        description: '掌握Pandas核心数据结构及数据清洗转换',
        sortOrder: 2,
        lessons: [
          {
            id: 'l002-2-1',
            title: '2.1 DataFrame基础操作',
            duration: 80,
            description: '学习DataFrame创建、数据读取、选择过滤、增删改查等操作。',
            isFree: false,
            sortOrder: 1,
            coursewares: [
              {
                id: 'cw002-2-1-1',
                title: '2.1 DataFrame基础操作.mp4',
                type: 'video',
                url: '/videos/da-lesson-2-1.mp4',
                fileSize: '220MB',
                duration: 4800,
                uploadedAt: '2024-08-18'
              }
            ]
          },
          {
            id: 'l002-2-2',
            title: '2.2 数据清洗实战',
            duration: 90,
            description: '掌握缺失值处理、重复值删除、异常值检测、数据类型转换等数据清洗技巧。',
            isFree: false,
            sortOrder: 2,
            coursewares: [
              {
                id: 'cw002-2-2-1',
                title: '数据清洗实战数据集.csv',
                type: 'doc',
                url: '/courseware/raw-data.csv',
                fileSize: '8.5MB',
                uploadedAt: '2024-08-19'
              },
              {
                id: 'cw002-2-2-2',
                title: '2.2 数据清洗实战.mp4',
                type: 'video',
                url: '/videos/da-lesson-2-2.mp4',
                fileSize: '250MB',
                duration: 5400,
                uploadedAt: '2024-08-19'
              }
            ]
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q002-1',
        type: 'single',
        content: 'Pandas中读取CSV文件的函数是？',
        options: [
          { key: 'A', content: 'read_excel()' },
          { key: 'B', content: 'read_csv()' },
          { key: 'C', content: 'read_json()' },
          { key: 'D', content: 'load_csv()' }
        ],
        answer: 'B',
        score: 5,
        analysis: 'pandas.read_csv()用于读取CSV格式文件。',
        chapterId: 'ch002-2'
      },
      {
        id: 'q002-2',
        type: 'judge',
        content: 'NumPy数组中所有元素必须是相同数据类型。',
        answer: '正确',
        score: 5,
        analysis: 'NumPy数组是同质数组，要求所有元素具有相同的数据类型，这也是其运算效率高的原因之一。',
        chapterId: 'ch002-1'
      },
      {
        id: 'q002-3',
        type: 'subjective',
        content: '请描述数据分析的标准流程，并说明每个阶段的主要工作内容。',
        answer: '数据分析标准流程：1.需求理解 - 明确分析目标和业务问题；2.数据收集 - 从各数据源获取原始数据；3.数据清洗 - 处理缺失值、异常值、重复值；4.数据探索 - 描述性统计、相关性分析；5.数据建模 - 应用统计模型或机器学习算法；6.可视化呈现 - 用图表展示分析结果；7.报告输出 - 撰写分析报告并给出业务建议。',
        score: 20,
        analysis: '需要完整覆盖数据分析全流程的各个阶段。',
        chapterId: 'ch002-1'
      }
    ]
  },
  {
    id: 'c003',
    title: 'UI/UX设计从入门到精通',
    subtitle: 'Figma+Sketch双工具，设计思维与项目实战',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20UX%20design%20course%20cover%20with%20colorful%20interface%20mockups%20wireframes%20modern%20creative%20design&image_size=landscape_16_9',
    description: '零基础学习UI/UX设计，涵盖设计基础理论、用户研究、交互设计、视觉设计、原型制作到设计交付全流程。使用Figma和Sketch双工具教学，通过真实App和Web项目实战，助你成为合格的UI设计师。',
    category: '设计创意',
    tags: ['UI设计', 'UX设计', 'Figma', '交互设计', '原型设计'],
    teacherId: 'u004',
    assistantIds: ['u006'],
    difficulty: 'beginner',
    estimatedHours: 100,
    price: 1599,
    status: 'published',
    enrolledCount: 412,
    completedCount: 156,
    rating: 4.9,
    createdAt: '2024-06-20',
    updatedAt: '2025-05-15',
    chapters: [
      {
        id: 'ch003-1',
        title: '第一章 设计基础与色彩原理',
        description: '建立设计思维，掌握色彩、排版、构图基础',
        sortOrder: 1,
        lessons: [
          {
            id: 'l003-1-1',
            title: '1.1 什么是UI/UX设计',
            duration: 45,
            description: '理解UI和UX的区别与联系，了解设计师的工作内容和职业发展路径。',
            isFree: true,
            sortOrder: 1,
            coursewares: [
              {
                id: 'cw003-1-1-1',
                title: 'UI/UX设计入门指南.pdf',
                type: 'pdf',
                url: '/courseware/uiux-intro.pdf',
                fileSize: '8.5MB',
                uploadedAt: '2024-06-21'
              },
              {
                id: 'cw003-1-1-2',
                title: '1.1 什么是UI/UX设计.mp4',
                type: 'video',
                url: '/videos/ui-lesson-1-1.mp4',
                fileSize: '130MB',
                duration: 2700,
                uploadedAt: '2024-06-21'
              }
            ]
          },
          {
            id: 'l003-1-2',
            title: '1.2 色彩理论与配色技巧',
            duration: 75,
            description: '学习色彩三要素、色相对比、配色方案，掌握商业设计中的色彩运用。',
            isFree: true,
            sortOrder: 2,
            coursewares: [
              {
                id: 'cw003-1-2-1',
                title: '色彩搭配参考手册.pdf',
                type: 'pdf',
                url: '/courseware/color-guide.pdf',
                fileSize: '15.2MB',
                uploadedAt: '2024-06-22'
              },
              {
                id: 'cw003-1-2-2',
                title: '1.2 色彩理论与配色技巧.mp4',
                type: 'video',
                url: '/videos/ui-lesson-1-2.mp4',
                fileSize: '210MB',
                duration: 4500,
                uploadedAt: '2024-06-22'
              }
            ]
          }
        ]
      },
      {
        id: 'ch003-2',
        title: '第二章 Figma工具详解',
        description: '全面掌握Figma设计工具',
        sortOrder: 2,
        lessons: [
          {
            id: 'l003-2-1',
            title: '2.1 Figma入门与界面介绍',
            duration: 60,
            description: '介绍Figma的特点、界面布局、基础工具及团队协作功能。',
            isFree: false,
            sortOrder: 1,
            coursewares: [
              {
                id: 'cw003-2-1-1',
                title: '2.1 Figma入门.mp4',
                type: 'video',
                url: '/videos/ui-lesson-2-1.mp4',
                fileSize: '170MB',
                duration: 3600,
                uploadedAt: '2024-06-23'
              }
            ]
          },
          {
            id: 'l003-2-2',
            title: '2.2 组件系统与设计规范',
            duration: 85,
            description: '学习如何创建可复用组件、设计系统搭建、变量和样式管理。',
            isFree: false,
            sortOrder: 2,
            coursewares: [
              {
                id: 'cw003-2-2-1',
                title: '设计规范模板.fig',
                type: 'doc',
                url: '/courseware/design-system.fig',
                fileSize: '25MB',
                uploadedAt: '2024-06-24'
              },
              {
                id: 'cw003-2-2-2',
                title: '2.2 组件系统与设计规范.mp4',
                type: 'video',
                url: '/videos/ui-lesson-2-2.mp4',
                fileSize: '240MB',
                duration: 5100,
                uploadedAt: '2024-06-24'
              }
            ]
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q003-1',
        type: 'single',
        content: 'UI设计中的"H5"通常指什么？',
        options: [
          { key: 'A', content: 'HTML5标准' },
          { key: 'B', content: '移动端网页' },
          { key: 'C', content: '一种设计软件' },
          { key: 'D', content: '设计高度500px' }
        ],
        answer: 'B',
        score: 5,
        analysis: '在设计语境中，H5通常指代移动端网页设计，源自HTML5技术标准。',
        chapterId: 'ch003-1'
      },
      {
        id: 'q003-2',
        type: 'multiple',
        content: '以下哪些属于UI设计的基本原则？（多选）',
        options: [
          { key: 'A', content: '一致性原则' },
          { key: 'B', content: '可读性原则' },
          { key: 'C', content: '功能优先原则' },
          { key: 'D', content: '用户控制原则' }
        ],
        answer: ['A', 'B', 'C', 'D'],
        score: 10,
        analysis: 'UI设计的基本原则包括一致性、可读性、用户控制、容错性、功能优先等。',
        chapterId: 'ch003-1'
      },
      {
        id: 'q003-3',
        type: 'judge',
        content: 'UX设计只关注界面的视觉美观度。',
        answer: '错误',
        score: 5,
        analysis: 'UX（用户体验）设计关注用户使用产品的整体体验，包括可用性、易用性、情感体验等，视觉美观只是其中一部分。',
        chapterId: 'ch003-1'
      },
      {
        id: 'q003-4',
        type: 'subjective',
        content: '请简述移动端设计与PC端设计的主要区别，并说明在响应式设计中需要考虑的关键因素。',
        answer: '主要区别：1.屏幕尺寸不同，移动端空间有限；2.交互方式不同，移动端是触摸操作，PC是鼠标键盘；3.使用场景不同，移动端多为碎片化时间；4.信息层级不同，移动端需要更精简。响应式设计需考虑：断点设置、图片自适应、导航变化、内容优先级、触摸区域大小等。',
        score: 20,
        analysis: '需要从多个维度对比两种设计，并说明响应式的关键点。',
        chapterId: 'ch003-2'
      }
    ]
  },
  {
    id: 'c004',
    title: 'PMP项目管理实战',
    subtitle: 'PMBOK指南精讲 + 真实项目案例',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Project%20management%20course%20cover%20with%20gantt%20chart%20timeline%20team%20collaboration%20professional%20business&image_size=landscape_16_9',
    description: '基于PMBOK第六/七版指南，系统讲解项目管理十大知识领域和五大过程组。结合IT、建筑、制造等行业真实案例，掌握项目启动、规划、执行、监控、收尾全流程管理方法，助力通过PMP认证。',
    category: '项目管理',
    tags: ['PMP', '项目管理', 'PMBOK', '敏捷开发', '风险管理'],
    teacherId: 'u003',
    assistantIds: ['u005'],
    difficulty: 'intermediate',
    estimatedHours: 90,
    price: 1999,
    status: 'published',
    enrolledCount: 178,
    completedCount: 62,
    rating: 4.6,
    createdAt: '2024-09-01',
    updatedAt: '2025-03-20',
    chapters: [
      {
        id: 'ch004-1',
        title: '第一章 项目管理基础',
        description: '理解项目管理概念与框架',
        sortOrder: 1,
        lessons: [
          {
            id: 'l004-1-1',
            title: '1.1 项目与项目管理',
            duration: 50,
            description: '理解项目的定义、特征，项目管理的发展历程及价值。',
            isFree: true,
            sortOrder: 1,
            coursewares: [
              {
                id: 'cw004-1-1-1',
                title: '1.1 项目与项目管理.mp4',
                type: 'video',
                url: '/videos/pm-lesson-1-1.mp4',
                fileSize: '140MB',
                duration: 3000,
                uploadedAt: '2024-09-02'
              }
            ]
          },
          {
            id: 'l004-1-2',
            title: '1.2 PMBOK框架与过程组',
            duration: 80,
            description: '系统讲解PMBOK十大知识领域和五大过程组的关系。',
            isFree: false,
            sortOrder: 2,
            coursewares: [
              {
                id: 'cw004-1-2-1',
                title: 'PMBOK知识地图.pdf',
                type: 'pdf',
                url: '/courseware/pmbok-map.pdf',
                fileSize: '5.8MB',
                uploadedAt: '2024-09-03'
              },
              {
                id: 'cw004-1-2-2',
                title: '1.2 PMBOK框架.mp4',
                type: 'video',
                url: '/videos/pm-lesson-1-2.mp4',
                fileSize: '225MB',
                duration: 4800,
                uploadedAt: '2024-09-03'
              }
            ]
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q004-1',
        type: 'single',
        content: '以下哪个不是PMBOK的五大过程组？',
        options: [
          { key: 'A', content: '启动过程组' },
          { key: 'B', content: '规划过程组' },
          { key: 'C', content: '优化过程组' },
          { key: 'D', content: '监控过程组' }
        ],
        answer: 'C',
        score: 5,
        analysis: 'PMBOK五大过程组是：启动、规划、执行、监控、收尾。没有"优化过程组"。',
        chapterId: 'ch004-1'
      },
      {
        id: 'q004-2',
        type: 'subjective',
        content: '请说明项目范围管理的主要过程，并解释WBS（工作分解结构）在项目管理中的作用。',
        answer: '项目范围管理过程：1.规划范围管理；2.收集需求；3.定义范围；4.创建WBS；5.确认范围；6.控制范围。WBS的作用：将项目可交付成果分解为更小、更易管理的组件；确保所有工作都被识别；为成本估算、进度安排提供基础；帮助团队明确职责；是变更控制的基准。',
        score: 20,
        analysis: '需要完整列举范围管理过程并详细说明WBS的作用。',
        chapterId: 'ch004-1'
      }
    ]
  },
  {
    id: 'c005',
    title: '网络安全工程师训练营',
    subtitle: 'Web安全、渗透测试、安全运维全栈技能',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cybersecurity%20course%20cover%20with%20digital%20lock%20shield%20binary%20code%20hacker%20defense%20dark%20tech%20style&image_size=landscape_16_9',
    description: '从零开始学习网络安全技术，涵盖Web安全原理、渗透测试方法、漏洞挖掘利用、安全加固策略、应急响应等核心内容。通过靶场实战演练，培养企业级网络安全工程师。',
    category: '网络安全',
    tags: ['网络安全', '渗透测试', 'Web安全', '漏洞挖掘', '安全运维'],
    teacherId: 'u003',
    assistantIds: ['u005'],
    difficulty: 'advanced',
    estimatedHours: 150,
    price: 2499,
    status: 'published',
    enrolledCount: 145,
    completedCount: 38,
    rating: 4.7,
    createdAt: '2024-10-10',
    updatedAt: '2025-05-01',
    chapters: [
      {
        id: 'ch005-1',
        title: '第一章 网络安全基础',
        description: '了解网络安全概念、TCP/IP协议',
        sortOrder: 1,
        lessons: [
          {
            id: 'l005-1-1',
            title: '1.1 网络安全概述',
            duration: 55,
            description: '介绍网络安全的重要性、常见威胁类型及职业发展方向。',
            isFree: true,
            sortOrder: 1,
            coursewares: [
              {
                id: 'cw005-1-1-1',
                title: '网络安全职业发展指南.pdf',
                type: 'pdf',
                url: '/courseware/sec-career.pdf',
                fileSize: '3.5MB',
                uploadedAt: '2024-10-11'
              },
              {
                id: 'cw005-1-1-2',
                title: '1.1 网络安全概述.mp4',
                type: 'video',
                url: '/videos/sec-lesson-1-1.mp4',
                fileSize: '155MB',
                duration: 3300,
                uploadedAt: '2024-10-11'
              }
            ]
          },
          {
            id: 'l005-1-2',
            title: '1.2 TCP/IP协议与网络基础',
            duration: 90,
            description: '深入理解OSI七层模型、TCP/IP协议栈、常见端口及网络抓包分析。',
            isFree: false,
            sortOrder: 2,
            coursewares: [
              {
                id: 'cw005-1-2-1',
                title: 'TCP/IP协议详解.pdf',
                type: 'pdf',
                url: '/courseware/tcp-ip.pdf',
                fileSize: '12.8MB',
                uploadedAt: '2024-10-12'
              },
              {
                id: 'cw005-1-2-2',
                title: '1.2 TCP/IP协议.mp4',
                type: 'video',
                url: '/videos/sec-lesson-1-2.mp4',
                fileSize: '255MB',
                duration: 5400,
                uploadedAt: '2024-10-12'
              }
            ]
          }
        ]
      },
      {
        id: 'ch005-2',
        title: '第二章 Web安全核心',
        description: '掌握常见Web漏洞原理与防御',
        sortOrder: 2,
        lessons: [
          {
            id: 'l005-2-1',
            title: '2.1 SQL注入漏洞',
            duration: 100,
            description: '学习SQL注入原理、分类、利用方法及防御措施。',
            isFree: false,
            sortOrder: 1,
            coursewares: [
              {
                id: 'cw005-2-1-1',
                title: 'SQL注入靶场环境.zip',
                type: 'doc',
                url: '/courseware/sql-lab.zip',
                fileSize: '120MB',
                uploadedAt: '2024-10-13'
              },
              {
                id: 'cw005-2-1-2',
                title: '2.1 SQL注入漏洞.mp4',
                type: 'video',
                url: '/videos/sec-lesson-2-1.mp4',
                fileSize: '280MB',
                duration: 6000,
                uploadedAt: '2024-10-13'
              }
            ]
          },
          {
            id: 'l005-2-2',
            title: '2.2 XSS跨站脚本攻击',
            duration: 85,
            description: '学习反射型、存储型、DOM型XSS的原理与防御。',
            isFree: false,
            sortOrder: 2,
            coursewares: [
              {
                id: 'cw005-2-2-1',
                title: '2.2 XSS跨站脚本攻击.mp4',
                type: 'video',
                url: '/videos/sec-lesson-2-2.mp4',
                fileSize: '240MB',
                duration: 5100,
                uploadedAt: '2024-10-14'
              }
            ]
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q005-1',
        type: 'single',
        content: 'HTTPS默认使用的端口号是？',
        options: [
          { key: 'A', content: '80' },
          { key: 'B', content: '443' },
          { key: 'C', content: '8080' },
          { key: 'D', content: '22' }
        ],
        answer: 'B',
        score: 5,
        analysis: 'HTTP默认端口80，HTTPS默认端口443，SSH默认端口22。',
        chapterId: 'ch005-1'
      },
      {
        id: 'q005-2',
        type: 'multiple',
        content: '以下哪些属于OWASP Top 10常见Web漏洞？（多选）',
        options: [
          { key: 'A', content: 'SQL注入' },
          { key: 'B', content: 'XSS跨站脚本' },
          { key: 'C', content: '缓冲区溢出' },
          { key: 'D', content: '权限控制失效' }
        ],
        answer: ['A', 'B', 'D'],
        score: 10,
        analysis: 'OWASP Top 10包含注入、认证失效、敏感数据泄露等。缓冲区溢出属于系统级漏洞，不是Web特有的Top 10。',
        chapterId: 'ch005-2'
      },
      {
        id: 'q005-3',
        type: 'subjective',
        content: '请详细描述SQL注入漏洞的防御方案，至少列出5种有效措施。',
        answer: 'SQL注入防御措施：1.使用预编译语句（PreparedStatement）；2.输入验证和过滤；3.使用ORM框架；4.最小权限原则配置数据库账号；5.使用Web应用防火墙（WAF）；6.敏感数据加密存储；7.避免在前端展示详细错误信息；8.定期代码审计和渗透测试。',
        score: 25,
        analysis: '需要从代码层、配置层、防护层等多个维度说明防御方案。',
        chapterId: 'ch005-2'
      }
    ]
  }
]

export const getCourseById = (id: string): Course | undefined => {
  return mockCourses.find(c => c.id === id)
}

export const getCoursesByTeacher = (teacherId: string): Course[] => {
  return mockCourses.filter(c => c.teacherId === teacherId)
}
