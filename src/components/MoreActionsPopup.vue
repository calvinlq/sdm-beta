<template>
  <div
    class="more-actions-popup"
    v-if="visible"
    :style="{
      left: position.left + 'px',
      top: position.top + 'px',
    }"
    @click.stop
  >
    <div class="actions-menu">
      <div
        v-for="action in actions"
        :key="action.key"
        class="action-item"
        @click="handleAction(action.key)"
      >
        <div class="action-item-content">
          <div
            v-if="action.icon"
            class="action-icon"
            v-html="action.icon"
          ></div>
          <span>{{ action.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted } from "vue";

  // 定义操作项类型
  interface ActionItem {
    key: string;
    label: string;
    icon?: string;
  }

  // 定义props
  interface MoreActionsPopupProps {
    visible: boolean;
    position: { left: number; top: number };
    actions: ActionItem[];
  }

  const props = defineProps<MoreActionsPopupProps>();

  // 定义emits
  const emit = defineEmits<{
    (e: "close"): void;
    (e: "action", actionKey: string): void;
  }>();

  const handleClickOutside = (event: MouseEvent) => {
    if (props.visible) {
      const popup = document.querySelector(".more-actions-popup");
      if (popup && !popup.contains(event.target as Node)) {
        emit("close");
      }
    }
  };

  // 处理操作点击
  const handleAction = (actionKey: string) => {
    console.log("handleAction", actionKey);
    emit("action", actionKey);
    emit("close");
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<style scoped lang="scss">
  $primary-color: #1890ff;
  $success-color: #52c41a;
  $warning-color: #fa8c16;
  $danger-color: #ff4d4f;
  $text-color: #646a73;
  $light-text: rgba(0, 0, 0, 0.5);
  $border-color: #e0e0e0;
  $background-color: #f8f9fa;
  $hover-bg: #e6f7ff;

  .more-actions-popup {
    position: fixed;
    z-index: 1000;
    pointer-events: auto;
  }

  .actions-menu {
    min-width: 120px;
    background: #fff;
    border: 1px solid #dee0e3;
    border-radius: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    font-size: 12px;
    padding: 8px 0;
  }

  .action-item {
    display: flex;
    align-items: center;
    padding: 0 8px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .action-item-content {
    display: flex;
    align-items: center;
    padding: 6px 4px;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
  }
  .action-item-content:hover,
  .action-item-content.active {
    background-color: rgba(31, 35, 41, 0.1);
  }
  .action-icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
