<template>
  <div v-if="show && selectedCount > 0" class="batch-operations-layer">
    <span>全选本页</span>
    <span class="selected-count">已选择 {{ selectedCount }} 个工作项</span>
    <slot></slot>
    <button class="batch-btn" @click="handleDelete">删除</button>
  </div>
</template>

<script setup lang="ts">
  // 定义组件props
  defineProps({
    // 是否显示批量操作浮层
    show: {
      type: Boolean,
      default: false,
    },
    // 选中的记录数量
    selectedCount: {
      type: Number,
      default: 0,
    },
  });
  // 处理删除操作
  const emit = defineEmits<{
    delete: [];
  }>();

  const handleDelete = () => {
    emit("delete");
  };
</script>

<style scoped>
  .batch-operations-layer {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0;
    background-color: #fff;
    margin: 1px 0 0 40px;
    position: absolute;
    width: calc(100vw - 81px);
    top: 0;
    z-index: 9;
    height: 36px;
    font-size: 12px;
  }

  .batch-operations-layer span {
    color: #646a73;
  }
  .selected-count {
    flex-shrink: 0;
    padding: 0 12px 0 16px;
  }

  .batch-btn {
    padding: 4px 12px;
    background-color: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 12px;
    color: #646a73;
  }

  .batch-btn:hover {
    color: #646a73;
    background-color: rgba(31, 35, 41, 0.1);
  }
</style>
