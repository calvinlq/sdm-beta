<template>
  <div class="about-container" :class="{ 'about-container-loaded': isLoaded }">
    <!-- 加载动画 -->
    <div v-if="!isLoaded" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- 页面头部 -->
    <header class="about-header">
      <div class="header-content">
        <h1 class="page-title">关于我们</h1>
        <div class="header-divider"></div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="about-main">
      <!-- 项目介绍卡片 -->
      <section class="intro-section">
        <div class="intro-card fade-in">
          <div class="card-header">
            <i class="el-icon-info card-icon"></i>
            <h2 class="card-title">项目介绍</h2>
          </div>
          <div class="card-content">
            <p class="intro-text">
              这是一个基于Vue
              3的现代化项目管理系统，旨在提供高效的任务管理、团队协作和项目进度跟踪功能。
              我们致力于为团队提供直观、易用且功能强大的项目管理解决方案，帮助团队提升工作效率，确保项目按时高质量完成。
            </p>
          </div>
        </div>
      </section>

      <!-- 功能特点 -->
      <section class="features-section">
        <h2 class="section-title">功能特点</h2>
        <div class="features-grid">
          <div
            class="feature-item fade-in"
            v-for="feature in features"
            :key="feature.id"
          >
            <div
              class="feature-icon"
              :style="{ backgroundColor: feature.color }"
            >
              <i :class="feature.icon"></i>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <!-- 技术栈 -->
      <section class="tech-stack-section">
        <h2 class="section-title">技术栈</h2>
        <div class="tech-stack-grid">
          <div
            class="tech-item fade-in"
            v-for="tech in techStack"
            :key="tech.id"
          >
            <div class="tech-logo">{{ tech.logo }}</div>
            <div class="tech-name">{{ tech.name }}</div>
          </div>
        </div>
      </section>

      <!-- 团队介绍 -->
      <section class="team-section">
        <h2 class="section-title">核心团队</h2>
        <div class="team-grid">
          <div
            class="team-member fade-in"
            v-for="member in teamMembers"
            :key="member.id"
          >
            <div
              class="member-avatar"
              :style="{ backgroundColor: member.color }"
            >
              {{ member.initials }}
            </div>
            <h3 class="member-name">{{ member.name }}</h3>
            <p class="member-role">{{ member.role }}</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 返回首页按钮 -->
    <div class="back-to-home">
      <RouterLink
        to="/"
        class="back-button"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <i class="el-icon-left"></i>
        <span>返回首页</span>
        <div
          class="button-overlay"
          :class="{ 'overlay-active': isHovered }"
        ></div>
      </RouterLink>
    </div>

    <!-- 页脚 -->
    <footer class="about-footer">
      <p>&copy; 2024 项目管理系统. 保留所有权利.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { RouterLink } from "vue-router";
  import { ref, onMounted } from "vue";

  // 页面加载状态
  const isLoaded = ref(false);
  // 按钮悬停状态
  const isHovered = ref(false);

  // 功能特点数据
  const features = [
    {
      id: 1,
      title: "WBS任务分解",
      description: "支持多层级任务分解，清晰展示项目结构和依赖关系",
      icon: "el-icon-todo-list",
      color: "#409eff",
    },
    {
      id: 2,
      title: "团队成员协作",
      description: "实时协作功能，支持任务分配、评论和通知",
      icon: "el-icon-user",
      color: "#67c23a",
    },
    {
      id: 3,
      title: "项目进度跟踪",
      description: "可视化甘特图展示，实时掌握项目进度和里程碑",
      icon: "el-icon-data-line",
      color: "#e6a23c",
    },
    {
      id: 4,
      title: "数据可视化",
      description: "丰富的图表展示，帮助分析项目数据和团队绩效",
      icon: "el-icon-pie-chart",
      color: "#f56c6c",
    },
  ];

  // 技术栈数据
  const techStack = [
    {
      id: 1,
      name: "Vue 3",
      logo: "Vue",
    },
    {
      id: 2,
      name: "TypeScript",
      logo: "TS",
    },
    {
      id: 3,
      name: "Element Plus",
      logo: "EP",
    },
    {
      id: 4,
      name: "Vue Router",
      logo: "Router",
    },
    {
      id: 5,
      name: "VTable",
      logo: "VT",
    },
  ];

  // 团队成员数据
  const teamMembers = [
    {
      id: 1,
      name: "张三",
      role: "产品经理",
      initials: "张",
      color: "#409eff",
    },
    {
      id: 2,
      name: "李四",
      role: "前端开发",
      initials: "李",
      color: "#67c23a",
    },
    {
      id: 3,
      name: "王五",
      role: "后端开发",
      initials: "王",
      color: "#e6a23c",
    },
  ];

  // 页面加载完成后显示内容
  onMounted(() => {
    setTimeout(() => {
      isLoaded.value = true;
    }, 500); // 模拟页面加载延迟
  });
</script>

<style lang="scss" scoped>
  // 页面容器样式
  .about-container {
    min-height: 100vh;
    background: #f5f7fa;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
      Cantarell, sans-serif;
    color: #333;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    overflow: hidden;
  }

  .about-container-loaded {
    opacity: 1;
  }

  // 加载动画
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #409eff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  // 页面头部
  .about-header {
    background: white;
    padding: 2rem 0;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .page-title {
    font-size: 2.5rem;
    margin: 0 0 10px 0;
    color: #333;
    font-weight: 700;
  }

  .header-divider {
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #409eff, #66b1ff);
    margin: 0 auto;
    border-radius: 2px;
  }

  // 主要内容区域
  .about-main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 20px;
  }

  // 项目介绍卡片
  .intro-section {
    margin-bottom: 3rem;
  }

  .intro-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease forwards;
  }

  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 10px;
  }

  .card-icon {
    font-size: 1.5rem;
    color: #409eff;
  }

  .card-title {
    font-size: 1.5rem;
    margin: 0;
    color: #333;
  }

  .card-content {
    color: #666;
    line-height: 1.8;
  }

  // 功能特点区域
  .features-section {
    margin-bottom: 3rem;
  }

  .section-title {
    font-size: 1.8rem;
    color: #333;
    margin: 0 0 1.5rem 0;
    text-align: center;
    position: relative;
    display: inline-block;
    left: 50%;
    transform: translateX(-50%);
  }

  .section-title::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background: #409eff;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .feature-item {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    text-align: center;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease forwards;
  }

  .feature-item:nth-child(1) {
    animation-delay: 0.1s;
  }
  .feature-item:nth-child(2) {
    animation-delay: 0.2s;
  }
  .feature-item:nth-child(3) {
    animation-delay: 0.3s;
  }
  .feature-item:nth-child(4) {
    animation-delay: 0.4s;
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .feature-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .feature-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: white;
    font-size: 1.5rem;
  }

  .feature-title {
    font-size: 1.2rem;
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  .feature-description {
    color: #666;
    margin: 0;
    line-height: 1.6;
  }

  // 技术栈区域
  .tech-stack-section {
    margin-bottom: 3rem;
  }

  .tech-stack-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1.5rem;
  }

  .tech-item {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    text-align: center;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease forwards;
  }

  .tech-item:nth-child(1) {
    animation-delay: 0.1s;
  }
  .tech-item:nth-child(2) {
    animation-delay: 0.2s;
  }
  .tech-item:nth-child(3) {
    animation-delay: 0.3s;
  }
  .tech-item:nth-child(4) {
    animation-delay: 0.4s;
  }
  .tech-item:nth-child(5) {
    animation-delay: 0.5s;
  }

  .tech-item:hover {
    transform: translateY(-5px) rotate(2deg);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .tech-logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: #409eff;
    margin-bottom: 0.5rem;
  }

  .tech-name {
    font-size: 0.9rem;
    color: #666;
  }

  // 团队介绍区域
  .team-section {
    margin-bottom: 3rem;
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .team-member {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    text-align: center;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease forwards;
  }

  .team-member:nth-child(1) {
    animation-delay: 0.1s;
  }
  .team-member:nth-child(2) {
    animation-delay: 0.2s;
  }
  .team-member:nth-child(3) {
    animation-delay: 0.3s;
  }

  .team-member:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .member-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: white;
    font-size: 2rem;
    font-weight: 700;
  }

  .member-name {
    font-size: 1.2rem;
    margin: 0 0 0.3rem 0;
    color: #333;
  }

  .member-role {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
  }

  // 返回首页按钮
  .back-to-home {
    text-align: center;
    margin-bottom: 2rem;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #409eff;
    color: white;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 500;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }

  .back-button:hover {
    color: white;
  }

  .button-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    transition: width 0.3s ease;
    z-index: -1;
  }

  .overlay-active {
    width: 100%;
  }

  // 页脚
  .about-footer {
    background: #333;
    padding: 1.5rem 0;
    text-align: center;
    color: white;
  }

  .about-footer p {
    margin: 0;
  }

  // 响应式设计
  @media (max-width: 768px) {
    .page-title {
      font-size: 2rem;
    }

    .section-title {
      font-size: 1.5rem;
    }

    .features-grid,
    .tech-stack-grid,
    .team-grid {
      grid-template-columns: 1fr;
    }

    .intro-card {
      padding: 1.5rem;
    }

    .feature-item,
    .tech-item,
    .team-member {
      padding: 1.2rem;
    }
  }
</style>
