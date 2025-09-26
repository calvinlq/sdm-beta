<template>
  <div class="home-container" :class="{ 'home-container-loaded': isLoaded }">
    <!-- 加载动画 -->
    <div v-if="!isLoaded" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <header class="home-header">
      <div class="header-content">
        <h1 class="main-title">欢迎来到SDM项目管理系统</h1>
        <p class="subtitle">高效管理您的项目和任务</p>
      </div>
    </header>
    <main class="home-main">
      <!-- 导航菜单 -->
      <section class="navigation-section">
        <h2 class="section-title">快速导航</h2>
        <div class="navigation-grid">
          <RouterLink
            to="/project"
            class="nav-item"
            @mouseenter="hoverNavItem(true, 'wbs')"
            @mouseleave="hoverNavItem(false, 'wbs')"
          >
            <div
              class="nav-icon"
              :class="{ 'nav-icon-hover': hoveredNavItem === 'wbs' }"
            ></div>
            <span class="nav-text">项目</span>
          </RouterLink>
          <RouterLink
            to="/wbs"
            class="nav-item"
            @mouseenter="hoverNavItem(true, 'wbs')"
            @mouseleave="hoverNavItem(false, 'wbs')"
          >
            <div
              class="nav-icon"
              :class="{ 'nav-icon-hover': hoveredNavItem === 'wbs' }"
            ></div>
            <span class="nav-text">WBS任务管理</span>
          </RouterLink>

          <RouterLink
            to="/table"
            class="nav-item"
            @mouseenter="hoverNavItem(true, 'wbs')"
            @mouseleave="hoverNavItem(false, 'wbs')"
          >
            <div
              class="nav-icon"
              :class="{ 'nav-icon-hover': hoveredNavItem === 'wbs' }"
            ></div>
            <span class="nav-text">概览</span>
          </RouterLink>
          <RouterLink
            to="/lifecycle"
            class="nav-item"
            @mouseenter="hoverNavItem(true, 'lifecycle')"
            @mouseleave="hoverNavItem(false, 'lifecycle')"
          >
            <div
              class="nav-icon"
              :class="{ 'nav-icon-hover': hoveredNavItem === 'lifecycle' }"
            ></div>
            <span class="nav-text">生命周期</span>
          </RouterLink>
          <RouterLink
            to="/workStatus"
            class="nav-item"
            @mouseenter="hoverNavItem(true, 'workStatus')"
            @mouseleave="hoverNavItem(false, 'workStatus')"
          >
            <div
              class="nav-icon"
              :class="{ 'nav-icon-hover': hoveredNavItem === 'workStatus' }"
            ></div>
            <span class="nav-text">工作项状态</span>
          </RouterLink>
        </div>
      </section>

      <section class="feature-cards">
        <div
          class="feature-card fade-in"
          v-for="feature in features"
          :key="feature.id"
        >
          <div class="card-icon">
            <i :class="feature.icon"></i>
          </div>
          <h3 class="card-title">{{ feature.title }}</h3>
          <p class="card-description">{{ feature.description }}</p>
          <RouterLink :to="feature.link" class="card-link">
            {{ feature.buttonText }} <i class="el-icon-right"></i>
          </RouterLink>
        </div>
      </section>
      <section class="stats-section">
        <h2 class="section-title">项目概览</h2>
        <div class="stats-grid">
          <div class="stat-card" v-for="stat in stats" :key="stat.id">
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="home-footer">
      <p>&copy; 2025 SDM项目管理系统. 保留所有权利.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { RouterLink } from "vue-router";
  import { ref, onMounted } from "vue";

  // 页面加载状态
  const isLoaded = ref(false);
  // 导航项悬停状态
  const hoveredNavItem = ref("");

  // 功能卡片数据
  const features = [
    {
      id: 1,
      title: "任务管理",
      description: "轻松创建、分配和跟踪项目任务进度",
      link: "/wbs",
      buttonText: "管理任务",
      icon: "el-icon-todo-list",
    },
    {
      id: 2,
      title: "团队协作",
      description: "高效的团队协作工具，提升项目执行效率",
      link: "/about",
      buttonText: "了解更多",
      icon: "el-icon-user",
    },
  ];

  // 统计数据
  const stats = [
    { id: 1, number: "12+", label: "活跃项目" },
    { id: 2, number: "10+", label: "团队成员" },
    { id: 3, number: "98%", label: "按时完成率" },
  ];

  // 处理导航项悬停
  const hoverNavItem = (isHovered: boolean, item: string) => {
    if (isHovered) {
      hoveredNavItem.value = item;
    } else {
      hoveredNavItem.value = "";
    }
  };

  // 页面加载完成后显示内容
  onMounted(() => {
    setTimeout(() => {
      isLoaded.value = true;
    }, 500); // 模拟页面加载延迟
  });
</script>

<style lang="scss" scoped>
  // 页面容器样式
  .home-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
      Cantarell, sans-serif;
    color: #333;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    overflow: hidden;
  }

  .home-container-loaded {
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
  .home-header {
    background: rgba(255, 255, 255, 0.95);
    padding: 2rem 0;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .main-title {
    font-size: 2.5rem;
    margin: 0 0 10px 0;
    color: #333;
    font-weight: 700;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #666;
    margin: 0;
  }

  // 主要内容区域
  .home-main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 20px;
  }

  // 功能卡片区域
  .feature-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .feature-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease forwards;
  }

  .feature-card:nth-child(1) {
    animation-delay: 0.2s;
  }

  .feature-card:nth-child(2) {
    animation-delay: 0.4s;
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  .card-icon {
    font-size: 2.5rem;
    color: #409eff;
    margin-bottom: 1rem;
  }

  .card-title {
    font-size: 1.5rem;
    margin: 0 0 10px 0;
    color: #333;
  }

  .card-description {
    color: #666;
    margin: 0 0 1.5rem 0;
    line-height: 1.6;
  }

  .card-link {
    display: inline-flex;
    align-items: center;
    color: #409eff;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .card-link:hover {
    color: #66b1ff;
  }

  .card-link i {
    margin-left: 5px;
    transition: transform 0.3s ease;
  }

  .card-link:hover i {
    transform: translateX(3px);
  }

  // 导航区域
  .navigation-section {
    margin-bottom: 3rem;
  }

  .section-title {
    font-size: 1.8rem;
    color: white;
    margin: 0 0 1.5rem 0;
    text-align: center;
  }

  .navigation-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .nav-item {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    text-decoration: none;
    color: #333;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .nav-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    background: white;
  }

  .nav-icon {
    width: 60px;
    height: 60px;
    background: #409eff;
    border-radius: 50%;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .nav-icon-hover {
    background: linear-gradient(135deg, #409eff, #66b1ff);
    transform: scale(1.1);
  }

  .nav-icon::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 0.8;
    }
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }

  .nav-text {
    font-size: 1.1rem;
    font-weight: 500;
  }

  // 统计数据区域
  .stats-section {
    margin-bottom: 3rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-5px);
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #409eff;
    margin: 0 0 0.5rem 0;
  }

  .stat-label {
    font-size: 1rem;
    color: #666;
    margin: 0;
  }

  // 页脚
  .home-footer {
    background: rgba(0, 0, 0, 0.1);
    padding: 1.5rem 0;
    text-align: center;
    color: white;
    backdrop-filter: blur(10px);
  }

  .home-footer p {
    margin: 0;
  }

  // 响应式设计
  @media (max-width: 768px) {
    .main-title {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .feature-cards,
    .navigation-grid,
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
