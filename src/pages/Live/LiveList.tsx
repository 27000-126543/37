import { useState, useMemo } from 'react';
import {
  Play,
  PlayCircle,
  Clock,
  Users,
  Calendar,
  Video,
  Search,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { mockLiveRecords, mockUsers, mockCourses, type LiveRecord } from '@/data';
import { useAuthStore } from '@/store';

type LiveFilter = 'all' | 'not_started' | 'live' | 'ended';

export default function LiveList() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<LiveFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const teacherMap = useMemo(() => {
    const map: Record<string, { name: string; avatar: string }> = {};
    mockUsers.forEach((u) => {
      map[u.id] = { name: u.name, avatar: u.avatar };
    });
    return map;
  }, []);

  const courseMap = useMemo(() => {
    const map: Record<string, string> = {};
    mockCourses.forEach((c) => {
      map[c.id] = c.title;
    });
    return map;
  }, []);

  const filteredLives = useMemo(() => {
    return mockLiveRecords.filter((live) => {
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'not_started' && live.status === 'scheduled') ||
        (activeTab === 'live' && live.status === 'living') ||
        (activeTab === 'ended' && live.status === 'ended');

      const matchesSearch =
        live.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (courseMap[live.courseId] || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery, courseMap]);

  const getStatusBadge = (status: LiveRecord['status']) => {
    switch (status) {
      case 'living':
        return (
          <Badge variant="danger" className="animate-pulse">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-white" />
            直播中
          </Badge>
        );
      case 'scheduled':
        return <Badge variant="warning">未开始</Badge>;
      case 'ended':
        return <Badge variant="secondary">已结束</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const getActionButton = (live: LiveRecord) => {
    const isTeacher = user?.id === live.teacherId;
    switch (live.status) {
      case 'living':
        return (
          <Button variant="default" size="sm" className="w-full">
            <Play className="h-4 w-4" />
            {isTeacher ? '进入直播间' : '进入观看'}
          </Button>
        );
      case 'scheduled':
        return (
          <Button variant="outline" size="sm" className="w-full" disabled>
            <Clock className="h-4 w-4" />
            预约提醒
          </Button>
        );
      case 'ended':
        return (
          <Button variant="secondary" size="sm" className="w-full">
            <PlayCircle className="h-4 w-4" />
            观看回放
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-surface-darker dark:via-surface-dark dark:to-surface-darker p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center gap-3">
            <Video className="h-8 w-8 text-primary-600" />
            直播课堂
          </h1>
          <p className="text-primary-600 dark:text-primary-300">
            实时互动授课，支持弹幕互动、录屏回放
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as LiveFilter)}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="not_started">未开始</TabsTrigger>
              <TabsTrigger value="live">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-accent-orange animate-pulse" />
                  直播中
                </span>
              </TabsTrigger>
              <TabsTrigger value="ended">已结束</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
            <Input
              placeholder="搜索直播标题或课程..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="mt-0">
          {filteredLives.length === 0 ? (
            <div className="text-center py-16 text-primary-500 dark:text-primary-400">
              <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>暂无直播记录</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredLives.map((live) => (
                <Card key={live.id} className="overflow-hidden group hover:shadow-card-hover transition-all">
                  <div className="relative aspect-video overflow-hidden bg-primary-900">
                    <img
                      src={live.cover}
                      alt={live.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(live.status)}
                    </div>
                    {live.status === 'living' && (
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-white" />
                        <span className="text-white text-xs font-medium">{live.currentViewers}</span>
                      </div>
                    )}
                    {live.status === 'ended' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <PlayCircle className="h-10 w-10 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-base line-clamp-1">{live.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {courseMap[live.courseId] || '未关联课程'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-300">
                      <img
                        src={teacherMap[live.teacherId]?.avatar}
                        alt=""
                        className="h-5 w-5 rounded-full"
                      />
                      <span>{teacherMap[live.teacherId]?.name || '未知讲师'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-300">
                      <Calendar className="h-4 w-4" />
                      <span>{live.scheduledStartAt}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-300">
                      <Clock className="h-4 w-4" />
                      <span>
                        {live.scheduledStartAt.slice(11, 16)} - {live.scheduledEndAt.slice(11, 16)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-300">
                      <Users className="h-4 w-4" />
                      <span>累计观看 {live.totalViewers} 人</span>
                    </div>
                  </CardContent>

                  <CardFooter>{getActionButton(live)}</CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
