export type LiveStatus = 'scheduled' | 'living' | 'ended' | 'cancelled'
export type DanmakuType = 'normal' | 'system' | 'gift' | 'warning'
export type DanmakuStatus = 'normal' | 'blocked' | 'deleted'

export interface Danmaku {
  id: string
  liveId: string
  userId: string
  userName: string
  content: string
  type: DanmakuType
  status: DanmakuStatus
  timestamp: number
  color?: string
  isSensitive?: boolean
  sensitiveWords?: string[]
}

export interface LiveViewer {
  userId: string
  userName: string
  avatar: string
  joinTime: string
  isMuted: boolean
  isBlocked: boolean
}

export interface LiveRecord {
  id: string
  title: string
  description: string
  courseId: string
  chapterId?: string
  lessonId?: string
  teacherId: string
  assistantIds: string[]
  cover: string
  status: LiveStatus
  scheduledStartAt: string
  scheduledEndAt: string
  actualStartAt?: string
  actualEndAt?: string
  streamUrl: string
  playbackUrl?: string
  maxViewers: number
  currentViewers: number
  totalViewers: number
  duration?: number
  isRecording: boolean
  enableDanmaku: boolean
  enableInteraction: boolean
  viewers: LiveViewer[]
  danmakus: Danmaku[]
  createdBy: string
  createdAt: string
}

export const mockLiveRecords: LiveRecord[] = [
  {
    id: 'lv001',
    title: 'Python函数式编程与装饰器精讲',
    description: '本节直播课深入讲解Python函数式编程范式，包括lambda表达式、map/filter/reduce高阶函数、装饰器原理及应用场景。',
    courseId: 'c001',
    chapterId: 'ch001-2',
    lessonId: 'l001-2-3',
    teacherId: 'u003',
    assistantIds: ['u005'],
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Python%20live%20streaming%20tutorial%20code%20screen%20dark%20coding%20classroom&image_size=landscape_16_9',
    status: 'living',
    scheduledStartAt: '2025-06-05 19:00:00',
    scheduledEndAt: '2025-06-05 21:00:00',
    actualStartAt: '2025-06-05 19:02:30',
    streamUrl: 'https://live.vocedu.com/live/c001-001.m3u8',
    playbackUrl: '',
    maxViewers: 500,
    currentViewers: 238,
    totalViewers: 456,
    isRecording: true,
    enableDanmaku: true,
    enableInteraction: true,
    createdBy: 'u003',
    createdAt: '2025-06-03 10:00:00',
    viewers: [
      { userId: 'u007', userName: '刘小鹏', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student007', joinTime: '2025-06-05 19:03:15', isMuted: false, isBlocked: false },
      { userId: 'u008', userName: '王小美', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student008', joinTime: '2025-06-05 19:05:42', isMuted: false, isBlocked: false },
      { userId: 'u009', userName: '陈志强', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student009', joinTime: '2025-06-05 19:08:20', isMuted: true, isBlocked: false },
      { userId: 'u010', userName: '李思琪', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student010', joinTime: '2025-06-05 19:10:05', isMuted: false, isBlocked: false },
      { userId: 'u011', userName: '周子轩', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student011', joinTime: '2025-06-05 19:15:33', isMuted: false, isBlocked: false }
    ],
    danmakus: [
      { id: 'dm001', liveId: 'lv001', userId: 'u007', userName: '刘小鹏', content: '老师好！今天讲装饰器吗？', type: 'normal', status: 'normal', timestamp: 1749121440000, color: '#FFFFFF' },
      { id: 'dm002', liveId: 'lv001', userId: 'u008', userName: '王小美', content: '终于等到直播啦~', type: 'normal', status: 'normal', timestamp: 1749121455000, color: '#FFD700' },
      { id: 'dm003', liveId: 'lv001', userId: 'system', userName: '系统', content: '欢迎来到王老师的Python直播课堂！请遵守课堂纪律，文明发言。', type: 'system', status: 'normal', timestamp: 1749121380000, color: '#3E92CC' },
      { id: 'dm004', liveId: 'lv001', userId: 'u010', userName: '李思琪', content: '老师，装饰器和闭包是什么关系呀？', type: 'normal', status: 'normal', timestamp: 1749121800000, color: '#FFFFFF' },
      { id: 'dm005', liveId: 'lv001', userId: 'u007', userName: '刘小鹏', content: '这个例子讲得太清楚了！', type: 'normal', status: 'normal', timestamp: 1749122100000, color: '#2EC4B6' },
      { id: 'dm006', liveId: 'lv001', userId: 'u009', userName: '陈志强', content: '加个联系方式呗', type: 'normal', status: 'blocked', timestamp: 1749122220000, isSensitive: true, sensitiveWords: ['联系方式'] },
      { id: 'dm007', liveId: 'lv001', userId: 'system', userName: '系统', content: '检测到违规言论，用户"陈志强"已被禁言，请注意发言规范。', type: 'warning', status: 'normal', timestamp: 1749122225000, color: '#E63946' },
      { id: 'dm008', liveId: 'lv001', userId: 'u011', userName: '周子轩', content: '能再讲一下递归吗？不太懂', type: 'normal', status: 'normal', timestamp: 1749122500000, color: '#FFFFFF' },
      { id: 'dm009', liveId: 'lv001', userId: 'u008', userName: '王小美', content: '老师声音好清楚！', type: 'normal', status: 'normal', timestamp: 1749122580000, color: '#FFB6C1' },
      { id: 'dm010', liveId: 'lv001', userId: 'u010', userName: '李思琪', content: '666666', type: 'normal', status: 'normal', timestamp: 1749122640000, color: '#FFFFFF' },
      { id: 'dm011', liveId: 'lv001', userId: 'u007', userName: '刘小鹏', content: '笔记记了三页了😂', type: 'normal', status: 'normal', timestamp: 1749122760000, color: '#FFFFFF' },
      { id: 'dm012', liveId: 'lv001', userId: 'u005', userName: '赵助教', content: '同学们有问题可以在课后答疑区提问，我会收集给老师统一解答~', type: 'system', status: 'normal', timestamp: 1749122880000, color: '#3E92CC' },
      { id: 'dm013', liveId: 'lv001', userId: 'u011', userName: '周子轩', content: '好的，谢谢助教！', type: 'normal', status: 'normal', timestamp: 1749122940000, color: '#FFFFFF' },
      { id: 'dm014', liveId: 'lv001', userId: 'u008', userName: '王小美', content: '老师辛苦啦！', type: 'gift', status: 'normal', timestamp: 1749123060000, color: '#FF69B4' },
      { id: 'dm015', liveId: 'lv001', userId: 'u010', userName: '李思琪', content: '装饰器这个设计模式真好用，记下来！', type: 'normal', status: 'normal', timestamp: 1749123180000, color: '#FFFFFF' }
    ]
  },
  {
    id: 'lv002',
    title: 'UI设计色彩搭配与视觉层级',
    description: '本节课讲解商业设计中的色彩运用技巧，如何通过配色营造品牌调性，以及视觉层级设计的核心法则。',
    courseId: 'c003',
    chapterId: 'ch003-1',
    teacherId: 'u004',
    assistantIds: ['u006'],
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20design%20live%20stream%20color%20palette%20creative%20workshop%20colorful&image_size=landscape_16_9',
    status: 'ended',
    scheduledStartAt: '2025-06-04 19:30:00',
    scheduledEndAt: '2025-06-04 21:30:00',
    actualStartAt: '2025-06-04 19:31:00',
    actualEndAt: '2025-06-04 21:45:00',
    streamUrl: '',
    playbackUrl: 'https://play.vocedu.com/playback/lv002.mp4',
    maxViewers: 300,
    currentViewers: 0,
    totalViewers: 312,
    duration: 7740,
    isRecording: true,
    enableDanmaku: true,
    enableInteraction: true,
    createdBy: 'u004',
    createdAt: '2025-06-02 14:00:00',
    viewers: [],
    danmakus: [
      { id: 'dm101', liveId: 'lv002', userId: 'u008', userName: '王小美', content: '老师这个配色太美了！', type: 'normal', status: 'normal', timestamp: 1749036780000, color: '#FFB6C1' },
      { id: 'dm102', liveId: 'lv002', userId: 'u011', userName: '周子轩', content: '记笔记中...', type: 'normal', status: 'normal', timestamp: 1749036840000, color: '#FFFFFF' },
      { id: 'dm103', liveId: 'lv002', userId: 'system', userName: '系统', content: '陈老师的直播课堂已开始，祝大家学习愉快！', type: 'system', status: 'normal', timestamp: 1749036660000, color: '#3E92CC' },
      { id: 'dm104', liveId: 'lv002', userId: 'u008', userName: '王小美', content: '对比色和互补色怎么区分呀？', type: 'normal', status: 'normal', timestamp: 1749037200000, color: '#FFFFFF' }
    ]
  },
  {
    id: 'lv003',
    title: 'SQL注入漏洞实战演练',
    description: '网络安全系列直播，演示SQL注入漏洞的发现、利用与防御，配套靶场实操。',
    courseId: 'c005',
    chapterId: 'ch005-2',
    teacherId: 'u003',
    assistantIds: ['u005'],
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cybersecurity%20ethical%20hacking%20live%20stream%20terminal%20dark%20green%20code&image_size=landscape_16_9',
    status: 'scheduled',
    scheduledStartAt: '2025-06-08 20:00:00',
    scheduledEndAt: '2025-06-08 22:00:00',
    streamUrl: '',
    maxViewers: 200,
    currentViewers: 0,
    totalViewers: 0,
    isRecording: true,
    enableDanmaku: true,
    enableInteraction: true,
    createdBy: 'u003',
    createdAt: '2025-06-05 09:00:00',
    viewers: [],
    danmakus: []
  }
]

export const getLiveById = (id: string): LiveRecord | undefined => {
  return mockLiveRecords.find(l => l.id === id)
}

export const getLivesByCourse = (courseId: string): LiveRecord[] => {
  return mockLiveRecords.filter(l => l.courseId === courseId)
}

export const getLivingLives = (): LiveRecord[] => {
  return mockLiveRecords.filter(l => l.status === 'living')
}
