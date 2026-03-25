import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Layout,
  Card,
  Typography,
  Button,
  Space,
  Alert,
  Spin,
  Empty,
  message,
  Radio
} from 'antd'
import {
  ArrowLeftOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'
import { useProjectStore, Clip } from '../store/useProjectStore'
import { projectApi } from '../services/api'
import ClipVirtualGrid from '../components/ClipVirtualGrid'
import ClipCard from '../components/ClipCard'

const { Content } = Layout
const { Title, Text } = Typography

// 虚拟滚动阈值 - 超过此数量使用虚拟滚动
const VIRTUAL_SCROLL_THRESHOLD = 30

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    currentProject,
    loading,
    error,
    setCurrentProject
  } = useProjectStore()

  const [statusLoading, setStatusLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'time' | 'score'>('score')

  useEffect(() => {
    if (id) {
      // 只有当store中没有currentProject或者currentProject的id与当前id不匹配时才重新加载
      if (!currentProject || currentProject.id !== id) {
        loadProject()
      }
      loadProcessingStatus()
    }
  }, [id]) // 移除 currentProject 依赖,避免无限循环

  const loadProject = async () => {
    if (!id) return
    try {
      console.log('🔄 开始加载项目:', id)
      const project = await projectApi.getProject(id)

      // 调试日志
      console.log('📦 完整项目数据:', project)
      console.log('📦 项目ID:', project.id)
      console.log('📦 项目状态:', project.status)
      console.log('📦 clips 字段:', project.clips)
      console.log('📦 clips 类型:', typeof project.clips)
      console.log('📦 clips 长度:', Array.isArray(project.clips) ? project.clips.length : '不是数组')

      // getProject 现在已经包含了 clips 数据（通过 include_clips=true）
      // 不再需要单独调用 getClips API
      console.log('🎬 Loaded project with clips:', project.clips?.length || 0, 'clips')
      setCurrentProject(project)

      // 同时更新projects数组，确保Store中的数据同步
      const { projects } = useProjectStore.getState()
      const updatedProjects = projects.map(p =>
        p.id === id ? project : p
      )
      useProjectStore.setState({ projects: updatedProjects })
    } catch (error) {
      console.error('Failed to load project:', error)
      message.error('加载项目失败')
    }
  }

  const loadProcessingStatus = async () => {
    if (!id) return
    setStatusLoading(true)
    try {
      await projectApi.getProcessingStatus(id)
    } catch (error) {
      console.error('Failed to load processing status:', error)
    } finally {
      setStatusLoading(false)
    }
  }

  const handleStartProcessing = async () => {
    if (!id) return
    try {
      await projectApi.startProcessing(id)
      message.success('开始处理')
      loadProcessingStatus()
    } catch (error) {
      console.error('Failed to start processing:', error)
      message.error('启动处理失败')
    }
  }

  const getSortedClips = () => {
    if (!currentProject?.clips) return []
    const clips = [...currentProject.clips]
    
    if (sortBy === 'score') {
      return clips.sort((a, b) => b.final_score - a.final_score)
    } else {
      // 按时间排序 - 将时间字符串转换为秒数进行比较
      return clips.sort((a, b) => {
        const getTimeInSeconds = (timeStr: string | number) => {
          if (typeof timeStr === 'number') {
            return timeStr
          }
          const parts = timeStr.split(':')
          const hours = parseInt(parts[0])
          const minutes = parseInt(parts[1])
          const seconds = parseFloat(parts[2].replace(',', '.'))
          return hours * 3600 + minutes * 60 + seconds
        }
        
        const aTime = getTimeInSeconds(a.start_time)
        const bTime = getTimeInSeconds(b.start_time)
        return aTime - bTime
      })
    }
  }

  if (loading) {
    return (
      <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </Content>
    )
  }

  if (error || !currentProject) {
    return (
      <Content style={{ padding: '24px', background: '#ffffff' }}>
        <Alert
          message="加载失败"
          description={error || '项目不存在'}
          type="error"
          action={
            <Button size="small" onClick={() => navigate('/')}>
              返回首页
            </Button>
          }
        />
      </Content>
    )
  }

  return (
    <>
      <Content style={{ padding: '24px', background: '#ffffff' }}>
        {/* 简化的项目头部 */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
            style={{ padding: 0, marginBottom: '8px' }}
          >
            返回项目列表
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            {currentProject.name}
          </Title>
        </div>
        
        <Space>
          {currentProject.status === 'pending' && (
            <Button
              type="primary"
              onClick={handleStartProcessing}
              loading={statusLoading}
            >
              开始处理
            </Button>
          )}
          <Button
            onClick={() => {
              console.log('🔄 手动刷新项目数据')
              loadProject()
            }}
          >
            刷新
          </Button>
          <Button
            type="primary"
            onClick={() => {
              navigate(`/project/${currentProject.id}/ai`)
            }}
            style={{
              backgroundColor: '#1890ff',
              borderColor: '#1890ff',
              fontWeight: 'bold',
              marginLeft: '10px'
            }}
          >
            AI 响应详情
          </Button>
        </Space>
      </div>

      {/* 主要内容 */}
      {currentProject.status === 'completed' ? (
        <div>
          {/* 视频片段区域 */}
          <Card
            className="clip-list-card"
            style={{
              borderRadius: '16px',
              border: '1px solid #e0e0e0 !important',
              background: '#ffffff !important',
              backgroundColor: '#ffffff !important'
            }}
            styles={{
              body: {
                background: '#ffffff !important',
                backgroundColor: '#ffffff !important',
                padding: '24px'
              }
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <Title level={4} style={{ margin: 0, color: '#1a1a1a', fontWeight: 600 }}>视频片段</Title>
                <Text type="secondary" style={{ color: '#666666', fontSize: '14px' }}>
                  AI 已为您生成了 {currentProject.clips?.length || 0} 个精彩片段
                </Text>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* 排序控件 - 暗黑主题优化 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Text style={{ fontSize: '13px', color: '#666666', fontWeight: 500 }}>排序</Text>
                  <Radio.Group
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    size="small"
                    buttonStyle="solid"
                  >
                    <Radio.Button
                       value="time"
                       style={{
                         fontSize: '13px',
                         height: '32px',
                         lineHeight: '30px',
                         padding: '0 16px',
                         background: sortBy === 'time' ? 'linear-gradient(45deg, #1890ff, #36cfc9)' : '#ffffff',
                         border: sortBy === 'time' ? '1px solid #1890ff' : '1px solid #d0d0d0',
                         color: sortBy === 'time' ? '#ffffff' : '#666666',
                         borderRadius: '6px 0 0 6px',
                         fontWeight: sortBy === 'time' ? 600 : 400,
                         boxShadow: sortBy === 'time' ? '0 2px 8px rgba(24, 144, 255, 0.3)' : 'none',
                         transition: 'all 0.2s ease'
                       }}
                     >
                       时间
                     </Radio.Button>
                     <Radio.Button
                       value="score"
                       style={{
                         fontSize: '13px',
                         height: '32px',
                         lineHeight: '30px',
                         padding: '0 16px',
                         background: sortBy === 'score' ? 'linear-gradient(45deg, #1890ff, #36cfc9)' : '#ffffff',
                         border: sortBy === 'score' ? '1px solid #1890ff' : '1px solid #d0d0d0',
                         borderLeft: 'none',
                         color: sortBy === 'score' ? '#ffffff' : '#666666',
                         borderRadius: '0 6px 6px 0',
                         fontWeight: sortBy === 'score' ? 600 : 400,
                         boxShadow: sortBy === 'score' ? '0 2px 8px rgba(24, 144, 255, 0.3)' : 'none',
                         transition: 'all 0.2s ease'
                       }}
                     >
                       评分
                     </Radio.Button>
                  </Radio.Group>
                </div>
              </div>
            </div>

            {currentProject.clips && currentProject.clips.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '20px',
                  padding: '8px 0'
                }}
              >
                {getSortedClips().map((clip) => (
                  <ClipCard
                    key={clip.id}
                    clip={clip}
                    projectId={currentProject.id}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                padding: '60px 0',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: '1px dashed #404040'
              }}>
                <Empty
                  description={
                    <Text style={{ color: '#888', fontSize: '14px' }}>暂无视频片段</Text>
                  }
                  image={<PlayCircleOutlined style={{ fontSize: '48px', color: '#555' }} />}
                />
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div>
          {/* 处理中的项目也显示已生成的切片 */}
          {currentProject.clips && currentProject.clips.length > 0 ? (
            <Card style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <Title level={4} style={{ margin: 0, fontWeight: 600 }}>已生成的片段（预览）</Title>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    正在处理中... 已生成 {currentProject.clips?.length || 0} 个片段
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Text style={{ fontSize: '13px', color: '#666666', fontWeight: 500 }}>排序</Text>
                  <Radio.Group
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    size="small"
                    buttonStyle="solid"
                  >
                    <Radio.Button value="time" style={{ height: '28px', lineHeight: '26px' }}>时间</Radio.Button>
                    <Radio.Button value="score" style={{ height: '28px', lineHeight: '26px' }}>评分</Radio.Button>
                  </Radio.Group>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '20px',
                  padding: '8px 0'
                }}
              >
                {getSortedClips().map((clip) => (
                  <ClipCard
                    key={clip.id}
                    clip={clip}
                    projectId={currentProject.id}
                  />
                ))}
              </div>

              <div style={{ marginTop: '16px', textAlign: 'center', padding: '12px', background: '#fffbe6', borderRadius: '8px' }}>
                <Text style={{ color: '#faad14', fontSize: '14px' }}>
                  ℹ️ 更多片段正在处理中，完成后将自动更新...
                </Text>
              </div>
            </Card>
          ) : (
            /* 项目状态提示 */
            <Card style={{ marginTop: '16px' }}>
              <Empty
                image={<PlayCircleOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
                description={
                  <div>
                    <Text>项目还未完成处理</Text>
                    <br />
                    <Text type="secondary">处理完成后可查看视频片段</Text>
                  </div>
                }
              />
            </Card>
          )}
        </div>
      )}

      </Content>
    </>
  )
}

export default ProjectDetailPage