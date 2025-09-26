<template>
  <div class="cl-tabs-container">
    <div class="tabs-header">
      <div class="tabs-list">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ active: activeTab === tab.id }"
          @click="setActiveTab(tab.id)"
          draggable="true"
          @dragstart="onDragStart($event, tab)"
          @dragover="onDragOver($event)"
          @drop="onDrop($event, tab)"
          @dragend="onDragEnd($event)"
        >
          <svg
            v-if="activeTab === tab.id"
            width="9"
            height="9"
            xmlns="http://www.w3.org/2000/svg"
            class="left-arc-angle"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0 0v9h9a9 9 0 01-9-9z"
            ></path>
          </svg>
          <!-- <span class="tab-drag-handle">⠿</span> -->
          <div class="tab-content-wrapper">
            <div class="tab-icon" v-html="tab.icon"></div>
            <div>{{ tab.title }}</div>
            <div
              v-if="tab.closable"
              class="tab-close"
              @click="removeTab(tab.id, $event)"
            >
              ×
            </div>
          </div>
          <svg
            v-if="activeTab === tab.id"
            width="9"
            height="9"
            xmlns="http://www.w3.org/2000/svg"
            class="right-arc-angle"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M0 0v9h9a9 9 0 01-9-9z"
            ></path>
          </svg>
          <div v-if="activeTab !== tab.id" class="tab-divider"></div>
        </div>
      </div>
      <div v-if="showAddButton" class="add-tab-btn" @click="addNewTab">+</div>
    </div>

    <div class="tab-content">
      <slot name="content" :activeTab="activeTabData">
        {{ activeTabData?.content }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from "vue";

  interface TabItem {
    id: number | string;
    title: string;
    content?: string;
    closable: boolean;
    icon?: string;
  }

  const props = defineProps({
    modelValue: {
      type: [String, Number],
      default: null,
    },
    items: {
      type: Array as () => TabItem[],
      default: () => [],
    },
    showAddButton: {
      type: Boolean,
      default: true,
    },
    showActionButtons: {
      type: Boolean,
      default: true,
    },
    closable: {
      type: Boolean,
      default: true,
    },
  }) as {
    modelValue?: string | number | null;
    items: TabItem[];
    showAddButton?: boolean;
    showActionButtons?: boolean;
    closable?: boolean;
  };

  const emit = defineEmits([
    "update:modelValue",
    "tab-added",
    "tab-removed",
    "tab-sorted",
    "tab-activated",
  ]);

  const tabs = ref<TabItem[]>([...props.items]);
  const activeTab = ref<string | number | null>(
    props.modelValue || (props.items.length > 0 ? props.items[0].id : null),
  );
  const draggingTab = ref<TabItem | null>(null);

  // 默认列表选项卡
  if (tabs.value.length > 0) {
    const tabObj = tabs.value.find((tab) => tab.id === activeTab.value);
    if (tabObj) {
      activeTab.value = tabObj.id;
    }
  }

  const activeTabData = computed<TabItem | undefined>(() => {
    return tabs.value.find((tab) => tab.id === activeTab.value);
  });

  watch(
    () => props.items,
    (newItems) => {
      tabs.value = [...newItems];
      if (!activeTab.value && newItems.length > 0) {
        activeTab.value = newItems[0].id;
        emit("update:modelValue", activeTab.value);
      }
    },
  );

  // 监听activeTab变化
  watch(activeTab, (newValue) => {
    emit("update:modelValue", newValue);
    emit("tab-activated", newValue);
  });

  // 监听modelValue变化，实现双向绑定
  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue !== undefined && newValue !== activeTab.value) {
        activeTab.value = newValue;
      }
    },
  );

  const setActiveTab = (tabId: string | number): void => {
    activeTab.value = tabId;
  };

  const addNewTab = (): void => {
    const newId =
      tabs.value.length > 0
        ? Math.max(
            ...tabs.value.map((tab) =>
              typeof tab.id === "number" ? tab.id : 0,
            ),
          ) + 1
        : 1;
    const newTab: TabItem = {
      id: newId,
      title: `新标签 ${newId}`,
      content: `这是新标签 ${newId} 的内容`,
      closable: props.closable ?? true,
    };

    tabs.value.push(newTab);
    setActiveTab(newId);
    emit("tab-added", newTab);
  };

  const removeTab = (tabId: string | number, event?: MouseEvent): void => {
    if (event) event.stopPropagation();
    const index = tabs.value.findIndex((tab) => tab.id === tabId);
    if (index !== -1) {
      const removedTab = tabs.value[index];
      tabs.value.splice(index, 1);

      if (activeTab.value === tabId && tabs.value.length > 0) {
        const newActiveTabId =
          index > 0 ? tabs.value[index - 1].id : tabs.value[0].id;
        setActiveTab(newActiveTabId);
      }

      emit("tab-removed", removedTab);
    }
  };

  const onDragStart = (event: DragEvent, tab: TabItem): void => {
    draggingTab.value = tab;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  };

  const onDragOver = (event: DragEvent): void => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  };

  const onDrop = (event: DragEvent, targetTab: TabItem): void => {
    event.preventDefault();

    if (draggingTab.value && draggingTab.value.id !== targetTab.id) {
      const draggingIndex = tabs.value.findIndex(
        (tab) => tab.id === draggingTab?.value?.id,
      );
      const targetIndex = tabs.value.findIndex(
        (tab) => tab.id === targetTab.id,
      );

      if (draggingIndex !== -1 && targetIndex !== -1) {
        const newTabs = [...tabs.value];
        if (draggingTab?.value) {
          newTabs.splice(draggingIndex, 1);
          newTabs.splice(targetIndex, 0, draggingTab.value);
        }

        tabs.value = newTabs;
        emit("tab-sorted", newTabs);
      }
    }
  };

  const onDragEnd = (event: DragEvent): void => {
    draggingTab.value = null;
  };
</script>

<style scoped lang="scss">
  $primary-color: #1890ff;

  .cl-tabs-container {
    width: 100%;
    background: #fff;
    display: flex;
    flex-direction: column;
  }

  .title-bar {
    background-color: #f5f7fa;
    padding: 12px 20px;
    border-bottom: 1px solid #e5e5e5;
  }

  .title-bar h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2329;
  }

  .tabs-header {
    display: flex;
    align-items: center;
    position: relative;
    background: #f5f6f7;
  }

  .tabs-list {
    display: flex;
    // flex: 1;
    overflow-x: auto;
    scrollbar-width: none;
    .left-arc-angle {
      position: absolute;
      bottom: 0;
      left: -9px;
      rotate: none;
      transform: rotate(270deg);
      fill: #fff;
    }
    .right-arc-angle {
      position: absolute;
      bottom: 0;
      right: -9px;
      rotate: none;
      transform: rotate(0deg);
      fill: #fff;
    }
  }

  .tabs-list::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    padding: 12px 16px;
    cursor: pointer;
    white-space: nowrap;
    user-select: none;
    color: #646a73;
    position: relative;
    display: flex;
    align-items: center;
    transition: color 0.2s;
    font-size: 14px;
    gap: 4px;
    .tab-divider {
      width: 1px;
      height: 16px;
      background: #d0d3d6;
      position: absolute;
      right: -1px;
    }
  }

  .tab-item:hover {
    color: #1f2329;
  }

  .tab-item.active {
    color: #1f2329;
    line-height: 21px;
    background: #fff;
    border-radius: 8px 8px 0 0;
    box-shadow:
      0px 6px 18px 6px rgba(31, 35, 41, 0.03),
      0px 3px 6px -6px rgba(31, 35, 41, 0.05),
      0px 4px 8px 0px rgba(31, 35, 41, 0.03);
  }

  .tab-drag-handle {
    margin-right: 6px;
    cursor: grab;
    color: #1f2329;
    font-size: 14px;
  }
  .tab-content-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
    .tab-icon {
      display: flex;
      align-items: center;
    }
  }

  .tab-close {
    margin-left: 8px;
    border-radius: 50%;
    cursor: pointer;
    color: #8f959e;
    display: none;
  }

  .tab-item:hover .tab-close {
    display: block;
  }

  .tab-close:hover {
    background: #f0f1f3;
    color: #1f2329;
  }

  .add-tab-btn {
    padding: 0 6px;
    cursor: pointer;
    color: #8f959e;
    display: flex;
    align-items: center;
    margin-left: 10px;
    justify-content: center;
  }

  .add-tab-btn:hover {
    color: $primary-color;
    background: rgba(51, 112, 255, 0.1);
    border-radius: 4px;
  }

  .action-buttons {
    padding: 12px 16px;
    display: flex;
    gap: 8px;
    border-bottom: 1px solid #e5e5e5;
  }

  .action-btn {
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #c9cdd4;
    background: #fff;
    color: #1f2329;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .action-btn:hover {
    background: #f7f8fa;
  }

  .action-btn.primary {
    background: $primary-color;
    color: #fff;
    border: none;
  }

  .action-btn.primary:hover {
    background: #245bdb;
  }
</style>
