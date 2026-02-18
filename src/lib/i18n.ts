/**
 * 轻量级国际化系统
 * 支持中英文切换
 */

export type Locale = 'en' | 'zh';

// 英文翻译
const en: Record<string, string> = {
  // 通用
  'common.loading': 'Loading...',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.create': 'Create',
  'common.search': 'Search',
  'common.confirm': 'Confirm',
  'common.back': 'Back',
  'common.close': 'Close',
  'common.select': 'Select',

  // 导航
  'nav.home': 'Home',
  'nav.dashboard': 'Dashboard',
  'nav.templates': 'Templates',
  'nav.pricing': 'Pricing',
  'nav.login': 'Login',
  'nav.signup': 'Sign Up',
  'nav.logout': 'Logout',

  // Landing Page
  'landing.hero.title': 'AI-Powered Workflow Automation',
  'landing.hero.subtitle': 'Build, automate, and scale your workflows with AI',
  'landing.hero.cta': 'Get Started Free',
  'landing.hero.secondary': 'View Templates',
  'landing.features.title': 'Powerful Features',
  'landing.features.visual.title': 'Visual Workflow Builder',
  'landing.features.visual.desc': 'Drag and drop to create complex workflows',
  'landing.features.ai.title': 'AI Integration',
  'landing.features.ai.desc': 'Connect with Claude, GPT-4, DeepSeek, and more',
  'landing.features.templates.title': 'Template Library',
  'landing.features.templates.desc': 'Start quickly with pre-built templates',
  'landing.features.realtime.title': 'Real-time Execution',
  'landing.features.realtime.desc': 'Monitor workflow execution in real-time',

  // 认证
  'auth.login.title': 'Login',
  'auth.login.email': 'Email',
  'auth.login.password': 'Password',
  'auth.login.submit': 'Login',
  'auth.login.logging': 'Logging in...',
  'auth.register.title': 'Sign Up',
  'auth.register.submit': 'Sign Up',
  'auth.register.registering': 'Creating account...',
  'auth.register.checkEmail': 'Registration successful! Please check your email.',
  'auth.tabs.login': 'Login',
  'auth.tabs.register': 'Register',
  'auth.pricing.free': 'Free: 100 runs/month, 5 workflows',
  'auth.pricing.pro': 'Pro: ¥49/month, 5000 runs/month',

  // 工作流编辑器
  'editor.title': 'Workflow Editor',
  'editor.nodeLibrary': 'Node Library',
  'editor.dragToAdd': 'Drag to canvas to add',
  'editor.properties': 'Properties',
  'editor.selectNode': 'Select a node to view properties',
  'editor.configureNode': 'Configure node parameters',
  'editor.testNode': 'Test Node',
  'editor.nodeName': 'Node Name',

  // 节点类别
  'nodes.category.triggers': 'Triggers',
  'nodes.category.actions': 'Actions',
  'nodes.category.logic': 'Logic',

  // 节点名称
  'nodes.trigger.name': 'Trigger',
  'nodes.webhook.name': 'Webhook',
  'nodes.schedule.name': 'Schedule',
  'nodes.ai.name': 'AI',
  'nodes.http.name': 'HTTP Request',
  'nodes.transform.name': 'Transform',
  'nodes.condition.name': 'Condition',
  'nodes.loop.name': 'Loop',

  // AI 节点
  'ai.provider': 'AI Provider',
  'ai.model': 'Model',
  'ai.operation': 'Operation Type',
  'ai.prompt': 'Prompt',
  'ai.temperature': 'Temperature',
  'ai.operations.generate': 'Text Generation',
  'ai.operations.analyze': 'Text Analysis',
  'ai.operations.extract': 'Information Extraction',
  'ai.operations.summarize': 'Summarization',
  'ai.operations.translate': 'Translation',

  // HTTP 节点
  'http.method': 'Request Method',
  'http.url': 'URL',
  'http.body': 'Request Body (JSON)',

  // 条件节点
  'condition.expression': 'Condition Expression',
  'condition.hint': 'Use JavaScript expressions, can access previous node outputs',

  // 触发器节点
  'trigger.type': 'Trigger Type',
  'trigger.manual': 'Manual',
  'trigger.webhook': 'Webhook',
  'trigger.schedule': 'Schedule',

  // 工作流列表
  'workflows.title': 'My Workflows',
  'workflows.subtitle': 'Manage and edit your workflows',
  'workflows.createNew': 'Create New Workflow',
  'workflows.empty': 'No saved workflows yet',
  'workflows.createFirst': 'Create Your First Workflow',
  'workflows.noDescription': 'No description',
  'workflows.nodes': 'nodes',
  'workflows.edges': 'connections',
  'workflows.enabled': 'Enabled',
  'workflows.disabled': 'Disabled',
  'workflows.confirmDelete': 'Are you sure you want to delete this workflow?',

  // 模板市场
  'templates.title': 'Template Market',
  'templates.subtitle': 'Choose a template to get started quickly',
  'templates.useTemplate': 'Use Template',
  'templates.close': 'Close',
  'templates.tip': 'Tip',
  'templates.tip1': 'Templates can be freely modified without affecting the original',
  'templates.tip2': 'You can save your own workflows as templates',
  'templates.tip3': 'Advanced templates require a Pro subscription',
  'templates.nodes': 'nodes',
  'templates.connections': 'connections',
  'templates.createFromTemplate': 'Created from template',

  // 保存对话框
  'save.title': 'Save Workflow',
  'save.name': 'Workflow Name',
  'save.description': 'Description (optional)',
  'save.saved': 'Saved!',
  'save.failed': 'Save failed',

  // 相对时间
  'time.justNow': 'Just now',
  'time.minutesAgo': 'minutes ago',
  'time.hoursAgo': 'hours ago',
  'time.daysAgo': 'days ago',

  // 通用提示
  'prompt.selectWorkflow': 'Please create or select a workflow',

  // Dashboard
  'dashboard.exampleWorkflow': 'Example Workflow',
  'dashboard.exampleWorkflowDesc': 'This is an example AI workflow',
};

// 中文翻译
const zh: Record<string, string> = {
  // 通用
  'common.loading': '加载中...',
  'common.save': '保存',
  'common.cancel': '取消',
  'common.delete': '删除',
  'common.edit': '编辑',
  'common.create': '创建',
  'common.search': '搜索',
  'common.confirm': '确认',
  'common.back': '返回',
  'common.close': '关闭',
  'common.select': '选择',

  // 导航
  'nav.home': '首页',
  'nav.dashboard': '工作台',
  'nav.templates': '模板',
  'nav.pricing': '定价',
  'nav.login': '登录',
  'nav.signup': '注册',
  'nav.logout': '退出登录',

  // Landing Page
  'landing.hero.title': 'AI 原生工作流自动化平台',
  'landing.hero.subtitle': '用 AI 构建、自动化和扩展你的工作流',
  'landing.hero.cta': '免费开始',
  'landing.hero.secondary': '查看模板',
  'landing.features.title': '强大功能',
  'landing.features.visual.title': '可视化工作流',
  'landing.features.visual.desc': '拖拽创建复杂工作流',
  'landing.features.ai.title': 'AI 集成',
  'landing.features.ai.desc': '连接 Claude、GPT-4、DeepSeek 等',
  'landing.features.templates.title': '模板库',
  'landing.features.templates.desc': '使用预置模板快速开始',
  'landing.features.realtime.title': '实时执行',
  'landing.features.realtime.desc': '实时监控工作流执行',

  // 认证
  'auth.login.title': '登录',
  'auth.login.email': '邮箱',
  'auth.login.password': '密码',
  'auth.login.submit': '登录',
  'auth.login.logging': '登录中...',
  'auth.register.title': '注册',
  'auth.register.submit': '注册',
  'auth.register.registering': '注册中...',
  'auth.register.checkEmail': '注册成功！请检查邮箱验证。',
  'auth.tabs.login': '登录',
  'auth.tabs.register': '注册',
  'auth.pricing.free': '免费版：100次/月，5个工作流',
  'auth.pricing.pro': '专业版：¥49/月，5000次/月',

  // 工作流编辑器
  'editor.title': '工作流编辑器',
  'editor.nodeLibrary': '节点库',
  'editor.dragToAdd': '拖拽到画布添加',
  'editor.properties': '属性',
  'editor.selectNode': '选择节点查看属性',
  'editor.configureNode': '配置节点参数',
  'editor.testNode': '测试节点',
  'editor.nodeName': '节点名称',

  // 节点类别
  'nodes.category.triggers': '触发器',
  'nodes.category.actions': '操作',
  'nodes.category.logic': '逻辑',

  // 节点名称
  'nodes.trigger.name': '触发器',
  'nodes.webhook.name': 'Webhook',
  'nodes.schedule.name': '定时触发',
  'nodes.ai.name': 'AI',
  'nodes.http.name': 'HTTP 请求',
  'nodes.transform.name': '数据转换',
  'nodes.condition.name': '条件判断',
  'nodes.loop.name': '循环',

  // AI 节点
  'ai.provider': 'AI 服务商',
  'ai.model': '模型',
  'ai.operation': '操作类型',
  'ai.prompt': '提示词 (Prompt)',
  'ai.temperature': 'Temperature',
  'ai.operations.generate': '文本生成',
  'ai.operations.analyze': '文本分析',
  'ai.operations.extract': '信息提取',
  'ai.operations.summarize': '摘要总结',
  'ai.operations.translate': '翻译',

  // HTTP 节点
  'http.method': '请求方法',
  'http.url': 'URL',
  'http.body': '请求体 (JSON)',

  // 条件节点
  'condition.expression': '条件表达式',
  'condition.hint': '使用 JavaScript 表达式，可访问前序节点输出',

  // 触发器节点
  'trigger.type': '触发类型',
  'trigger.manual': '手动触发',
  'trigger.webhook': 'Webhook',
  'trigger.schedule': '定时触发',

  // 工作流列表
  'workflows.title': '我的工作流',
  'workflows.subtitle': '管理和编辑你的工作流',
  'workflows.createNew': '创建新工作流',
  'workflows.empty': '还没有保存的工作流',
  'workflows.createFirst': '创建第一个工作流',
  'workflows.noDescription': '暂无描述',
  'workflows.nodes': '个节点',
  'workflows.edges': '条连线',
  'workflows.enabled': '启用',
  'workflows.disabled': '禁用',
  'workflows.confirmDelete': '确定要删除这个工作流吗？',

  // 模板市场
  'templates.title': '模板市场',
  'templates.subtitle': '选择一个模板快速开始',
  'templates.useTemplate': '使用此模板',
  'templates.close': '关闭',
  'templates.tip': '💡 提示',
  'templates.tip1': '• 模板可以自由修改，不会影响原始模板',
  'templates.tip2': '• 你可以保存自己的工作流为模板',
  'templates.tip3': '• 高级模板需要专业版订阅',
  'templates.nodes': '个节点',
  'templates.connections': '条连线',
  'templates.createFromTemplate': '从模板创建',

  // 保存对话框
  'save.title': '保存工作流',
  'save.name': '工作流名称',
  'save.description': '描述（可选）',
  'save.saved': '已保存！',
  'save.failed': '保存失败',

  // 相对时间
  'time.justNow': '刚刚',
  'time.minutesAgo': '分钟前',
  'time.hoursAgo': '小时前',
  'time.daysAgo': '天前',

  // 通用提示
  'prompt.selectWorkflow': '请创建或选择一个工作流',

  // Dashboard
  'dashboard.exampleWorkflow': '示例工作流',
  'dashboard.exampleWorkflowDesc': '这是一个示例 AI 工作流',
};

const translations: Record<Locale, Record<string, string>> = { en, zh };

// 默认语言为英文
const DEFAULT_LOCALE: Locale = 'en';

/**
 * 获取翻译文本
 */
export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  return translations[locale]?.[key] || translations[DEFAULT_LOCALE]?.[key] || key;
}

/**
 * 获取相对时间文本
 */
export function formatRelativeTime(dateString: string, locale: Locale = DEFAULT_LOCALE): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('time.justNow', locale);
  if (diffMins < 60) return `${diffMins} ${t('time.minutesAgo', locale)}`;
  if (diffHours < 24) return `${diffHours} ${t('time.hoursAgo', locale)}`;
  if (diffDays < 7) return `${diffDays} ${t('time.daysAgo', locale)}`;
  return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US');
}

export { DEFAULT_LOCALE, translations };
export type { Locale as LocaleType };
