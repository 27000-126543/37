import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  MessageSquare,
  Send,
  Users,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Ban,
  Circle,
  Square,
  Film,
  MessageCircleOff,
  MessageCircle,
  UserX,
  UserCheck,
  ChevronLeft,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { mockLiveRecords, mockUsers, type LiveRecord, type Danmaku as DanmakuType } from '@/data';
import { useAuthStore } from '@/store';
import { filterContent } from '@/utils/danmakuFilter';
import { cn } from '@/lib/utils';

interface FloatingDanmaku {
  id: string;
  content: string;
  top: number;
  color: string;
  speed: number;
  left: number;
}

export default function LiveRoom() {
  const { user } = useAuthStore();
  const live = mockLiveRecords[0];
  const isTeacher = user?.id === live.teacherId || user?.role === 'teacher';

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [activeTab, setActiveTab] = useState<'live' | 'replay'>('live');

  const [isLiveStarted, setIsLiveStarted] = useState(live.status === 'living');
  const [isRecording, setIsRecording] = useState(live.isRecording);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isDanmakuEnabled, setIsDanmakuEnabled] = useState(live.enableDanmaku);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [viewers, setViewers] = useState(live.viewers);
  const [chatMessages, setChatMessages] = useState<DanmakuType[]>(live.danmakus);
  const [inputMessage, setInputMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<'safe' | 'warning'>('safe');
  const [floatingDanmakus, setFloatingDanmakus] = useState<FloatingDanmaku[]>([]);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const danmakuContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const danmakuIdRef = useRef(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (!isDanmakuEnabled) return;
    const interval = setInterval(() => {
      const randomMsg = live.danmakus[Math.floor(Math.random() * live.danmakus.length)];
      if (randomMsg && randomMsg.status === 'normal') {
        addFloatingDanmaku(randomMsg.content, randomMsg.color || '#FFFFFF');
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isDanmakuEnabled, live.danmakus]);

  const addFloatingDanmaku = (content: string, color: string) => {
    const id = `dm-${danmakuIdRef.current++}`;
    const newDanmaku: FloatingDanmaku = {
      id,
      content,
      top: Math.random() * 60 + 10,
      color,
      speed: 15 + Math.random() * 10,
      left: 100,
    };
    setFloatingDanmakus((prev) => [...prev, newDanmaku]);
    setTimeout(() => {
      setFloatingDanmakus((prev) => prev.filter((d) => d.id !== id));
    }, newDanmaku.speed * 1000);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const filterResult = filterContent(inputMessage);
    setFilterStatus(filterResult.isSafe ? 'safe' : 'warning');

    const newMsg: DanmakuType = {
      id: `dm-${Date.now()}`,
      liveId: live.id,
      userId: user?.id || 'anonymous',
      userName: user?.name || '匿名用户',
      content: filterResult.filteredContent,
      type: filterResult.isSafe ? 'normal' : 'warning',
      status: filterResult.severity === 'high' ? 'blocked' : 'normal',
      timestamp: Date.now(),
      isSensitive: !filterResult.isSafe,
      sensitiveWords: filterResult.matchedWords,
    };

    setChatMessages((prev) => [...prev, newMsg]);

    if (filterResult.isSafe && isDanmakuEnabled) {
      addFloatingDanmaku(filterResult.filteredContent, '#FFFFFF');
    }

    setInputMessage('');

    setTimeout(() => setFilterStatus('safe'), 3000);
  };

  const handleToggleMuteUser = (userId: string) => {
    setViewers((prev) =>
      prev.map((v) => (v.userId === userId ? { ...v, isMuted: !v.isMuted } : v)),
    );
  };

  const handleToggleBlockUser = (userId: string) => {
    setViewers((prev) =>
      prev.map((v) => (v.userId === userId ? { ...v, isBlocked: !v.isBlocked } : v)),
    );
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [elapsedTime, setElapsedTime] = useState(0);
  useEffect(() => {
    if (!isLiveStarted) return;
    const interval = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isLiveStarted]);

  const teacherControls = useMemo(() => {
    if (!isTeacher) return null;
    return (
      <div className="flex items-center gap-2 p-4 bg-primary-900/80 border-t border-primary-700">
        <Button
          variant={isLiveStarted ? 'destructive' : 'success'}
          size="sm"
          onClick={() => setIsLiveStarted(!isLiveStarted)}
        >
          {isLiveStarted ? (
            <>
              <Square className="h-4 w-4" />
              结束直播
            </>
          ) : (
            <>
              <Circle className="h-4 w-4 fill-current" />
              开始直播
            </>
          )}
        </Button>
        <Button
          variant={isRecording ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => setIsRecording(!isRecording)}
        >
          <Film className="h-4 w-4" />
          {isRecording ? '停止录制' : '开始录制'}
        </Button>
        <Button
          variant={isMicOn ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setIsMicOn(!isMicOn)}
        >
          {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
        <Button
          variant={isCameraOn ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setIsCameraOn(!isCameraOn)}
        >
          {isCameraOn ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>
        <Button
          variant={isScreenSharing ? 'success' : 'outline'}
          size="sm"
          onClick={() => setIsScreenSharing(!isScreenSharing)}
        >
          <Monitor className="h-4 w-4" />
          {isScreenSharing ? '停止共享' : '共享屏幕'}
        </Button>
        <Button
          variant={isDanmakuEnabled ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setIsDanmakuEnabled(!isDanmakuEnabled)}
        >
          {isDanmakuEnabled ? <MessageCircle className="h-4 w-4" /> : <MessageCircleOff className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }, [isTeacher, isLiveStarted, isRecording, isMicOn, isCameraOn, isScreenSharing, isDanmakuEnabled]);

  return (
    <div className="min-h-screen bg-surface-darker text-white">
      <div className="h-14 bg-primary-900 border-b border-primary-700 flex items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-primary-800">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{live.title}</h1>
            <p className="text-xs text-primary-300">
              {mockUsers.find((u) => u.id === live.teacherId)?.name || '未知讲师'} ·{' '}
              {isLiveStarted ? '直播中' : '未开始'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isLiveStarted && (
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-accent-orange animate-pulse" />
              <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
            </div>
          )}
          <Badge variant={isRecording ? 'danger' : 'secondary'} className="text-xs">
            <Film className="h-3 w-3 mr-1" />
            {isRecording ? '录制中' : '未录制'}
          </Badge>
          <div className="flex items-center gap-1.5 text-sm text-primary-300">
            <Users className="h-4 w-4" />
            {live.currentViewers} 人在线
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="flex-1 flex flex-col bg-black">
          <Tabs
            defaultValue="live"
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'live' | 'replay')}
            className="absolute top-16 left-4 z-10"
          >
            <TabsList className="bg-black/60 backdrop-blur-sm border border-white/10">
              <TabsTrigger value="live">
                <Circle className="h-3 w-3 mr-1.5 fill-current text-accent-orange" />
                直播
              </TabsTrigger>
              <TabsTrigger value="replay">
                <Film className="h-3 w-3 mr-1.5" />
                回放
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div
            ref={videoContainerRef}
            className="relative flex-1 bg-gradient-to-br from-primary-900 via-primary-950 to-black overflow-hidden"
          >
            {!isCameraOn && isTeacher ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <VideoOff className="h-20 w-20 mx-auto mb-4 text-primary-500" />
                  <p className="text-primary-300 text-lg">摄像头已关闭</p>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={live.cover}
                  alt="直播画面"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-grid-pattern bg-[size:50px_50px] opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden border-4 border-primary-400 shadow-glow-lg">
                      <img
                        src={mockUsers.find((u) => u.id === live.teacherId)?.avatar}
                        alt="讲师"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      {mockUsers.find((u) => u.id === live.teacherId)?.name}
                    </h3>
                    <p className="text-primary-300 mb-6">{live.title}</p>
                    {!isPlaying && (
                      <Button variant="default" size="lg" onClick={() => setIsPlaying(true)}>
                        <Play className="h-5 w-5" />
                        {activeTab === 'live' ? '进入直播' : '播放回放'}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}

            {isDanmakuEnabled && (
              <div
                ref={danmakuContainerRef}
                className="absolute inset-0 overflow-hidden pointer-events-none"
              >
                {floatingDanmakus.map((dm) => (
                  <div
                    key={dm.id}
                    className="absolute whitespace-nowrap text-lg font-medium drop-shadow-lg"
                    style={{
                      top: `${dm.top}%`,
                      color: dm.color,
                      animation: `danmaku-scroll ${dm.speed}s linear`,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    }}
                  >
                    {dm.content}
                  </div>
                ))}
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
              <div className="h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: activeTab === 'replay' ? '35%' : '100%' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-primary-400"
                    />
                  </div>
                  <span className="text-sm text-primary-200 font-mono">
                    {activeTab === 'replay'
                      ? `${formatTime(Math.floor(elapsedTime * 0.35))} / ${formatTime(live.duration || 0)}`
                      : formatTime(elapsedTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsDanmakuEnabled(!isDanmakuEnabled)}
                  >
                    {isDanmakuEnabled ? <MessageSquare className="h-5 w-5" /> : <MessageCircleOff className="h-5 w-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Maximize className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {teacherControls}
        </div>

        <div className="w-80 bg-surface-dark border-l border-primary-800 flex flex-col">
          <Tabs defaultValue="chat" className="flex flex-col h-full">
            <TabsList className="m-3">
              <TabsTrigger value="chat" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-1.5" />
                弹幕聊天
              </TabsTrigger>
              <TabsTrigger value="users" className="flex-1">
                <Users className="h-4 w-4 mr-1.5" />
                在线学员
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col mt-0 overflow-hidden">
              <div className="px-4 py-2 border-b border-primary-800 flex items-center justify-between">
                <span className="text-sm text-primary-300">聊天消息</span>
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-xs px-2 py-1 rounded-full',
                    filterStatus === 'safe'
                      ? 'bg-accent-teal/15 text-accent-teal'
                      : 'bg-accent-orange/15 text-accent-orange',
                  )}
                >
                  {filterStatus === 'safe' ? (
                    <ShieldCheck className="h-3 w-3" />
                  ) : (
                    <ShieldAlert className="h-3 w-3" />
                  )}
                  {filterStatus === 'safe' ? '过滤正常' : '检测到敏感词'}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'text-sm p-2 rounded-lg',
                      msg.type === 'system'
                        ? 'bg-primary-900/50 text-primary-300'
                        : msg.type === 'warning'
                        ? 'bg-accent-orange/10 text-accent-orange'
                        : msg.type === 'gift'
                        ? 'bg-pink-500/10 text-pink-300'
                        : 'bg-primary-800/30 text-white',
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-medium"
                        style={{ color: msg.type === 'system' ? undefined : msg.color }}
                      >
                        {msg.userName}
                      </span>
                      {msg.isSensitive && (
                        <Badge variant="danger" className="text-[10px] py-0">
                          已过滤
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-primary-800">
                <div className="flex gap-2">
                  <Input
                    placeholder="发送弹幕..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-primary-900 border-primary-700 text-white placeholder:text-primary-500"
                  />
                  <Button variant="default" size="icon" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="flex-1 flex flex-col mt-0 overflow-hidden">
              <div className="px-4 py-2 border-b border-primary-800">
                <span className="text-sm text-primary-300">在线学员 ({viewers.length})</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {viewers.map((viewer) => (
                  <div
                    key={viewer.userId}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary-800/30 transition-colors"
                  >
                    <img
                      src={viewer.avatar}
                      alt={viewer.userName}
                      className="h-9 w-9 rounded-full border-2 border-primary-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-white truncate">{viewer.userName}</p>
                        {viewer.isMuted && (
                          <Badge variant="warning" className="text-[10px] py-0">
                            禁言
                          </Badge>
                        )}
                        {viewer.isBlocked && (
                          <Badge variant="danger" className="text-[10px] py-0">
                            封禁
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-primary-400">
                        加入于 {viewer.joinTime.slice(11, 16)}
                      </p>
                    </div>
                    {isTeacher && (
                      <div className="flex gap-1">
                        <Button
                          variant={viewer.isMuted ? 'warning' : 'ghost'}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleMuteUser(viewer.userId)}
                          title={viewer.isMuted ? '解除禁言' : '禁言'}
                        >
                          {viewer.isMuted ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <Ban className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant={viewer.isBlocked ? 'destructive' : 'ghost'}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleBlockUser(viewer.userId)}
                          title={viewer.isBlocked ? '解除封禁' : '踢出'}
                        >
                          {viewer.isBlocked ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <style>{`
        @keyframes danmaku-scroll {
          from {
            transform: translateX(100vw);
          }
          to {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
