import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-xl">AI Workflow</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
              登录
            </Link>
            <Link href="/auth/login">
              <Button>免费开始</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          让 AI 自动化你的工作流
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          AI 原生工作流自动化平台，中文友好，开发者优先。
          无需代码，拖拽即可创建强大的 AI 工作流。
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              免费试用
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="px-8">
              查看演示
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          免费版：100 次/月 · 无需信用卡
        </p>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">可视化编辑器</h3>
            <p className="text-gray-600">
              拖拽式工作流编排，所见即所得。支持多种节点类型，轻松构建复杂逻辑。
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI 原生集成</h3>
            <p className="text-gray-600">
              支持 Claude、OpenAI、DeepSeek、智谱等多个 AI 模型，一键切换。
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">模板市场</h3>
            <p className="text-gray-600">
              丰富的预置模板，一键部署。涵盖文本生成、数据分析、自动化等场景。
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 bg-gray-50 -mx-4 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">简单透明的定价</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">免费版</h3>
            <div className="text-4xl font-bold mb-4">¥0<span className="text-lg font-normal text-gray-500">/月</span></div>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>✓ 100 次执行/月</li>
              <li>✓ 5 个工作流</li>
              <li>✓ 基础模板</li>
              <li>✓ 社区支持</li>
            </ul>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">开始使用</Button>
            </Link>
          </div>

          <div className="p-6 bg-white rounded-xl border-2 border-indigo-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-sm px-3 py-1 rounded-full">
              推荐
            </div>
            <h3 className="text-lg font-semibold mb-2">专业版</h3>
            <div className="text-4xl font-bold mb-4">¥49<span className="text-lg font-normal text-gray-500">/月</span></div>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>✓ 5000 次执行/月</li>
              <li>✓ 无限工作流</li>
              <li>✓ 所有模板</li>
              <li>✓ 优先支持</li>
            </ul>
            <Link href="/auth/login">
              <Button className="w-full">升级专业版</Button>
            </Link>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">团队版</h3>
            <div className="text-4xl font-bold mb-4">¥149<span className="text-lg font-normal text-gray-500">/月</span></div>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>✓ 20000 次执行/月</li>
              <li>✓ 团队协作</li>
              <li>✓ API 访问</li>
              <li>✓ 专属支持</li>
            </ul>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">联系我们</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">准备好开始了吗？</h2>
        <p className="text-gray-600 mb-8">30 秒注册，立即开始创建你的第一个 AI 工作流</p>
        <Link href="/dashboard">
          <Button size="lg" className="px-12">
            免费开始 →
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-semibold">AI Workflow Automation</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">文档</a>
            <a href="#" className="hover:text-gray-900">博客</a>
            <a href="#" className="hover:text-gray-900">隐私政策</a>
            <a href="#" className="hover:text-gray-900">服务条款</a>
          </div>
          <div className="text-sm text-gray-500">
            © 2026 AI Workflow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
