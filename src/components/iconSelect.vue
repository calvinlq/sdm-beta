<template>
  <ul class="iconSelectContainer">
    <li
      @click="handleSelectIcon(item, index)"
      v-for="(item, index) in icons"
      :key="item.id"
      class="iconSelectItem"
      :class="{ isSelected: item.name === model }"
    >
      <el-icon>
        <CircleCheck v-if="item.name === 'CircleCheck'" />
        <CircleClose v-if="item.name === 'CircleClose'" />
      </el-icon>
    </li>
  </ul>
</template>
<script setup lang="ts">
  import { CircleCheck, CircleClose } from "@element-plus/icons-vue";
  import { ref } from "vue";

  interface iconType {
    name: string;
    id: string | number;
  }

  const icons: iconType[] = [
    {
      name: "CircleCheck",
      id: 0,
    },
    {
      name: "CircleClose",
      id: 1,
    },
  ];
  const selectIndex = ref(-1);
  const model = defineModel();
  const handleSelectIcon = (item: iconType, index: number) => {
    model.value = item.name;
    selectIndex.value = index;
  };
</script>

<style scoped lang="scss">
  .iconSelectContainer {
    padding: 0;
    margin: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;

    .iconSelectItem {
      width: 32px;
      height: 32px;
      cursor: pointer;
      border: 1px solid #ccc;
      line-height: 32px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        border: 1px solid dodgerblue;
      }
    }

    .isSelected {
      border: 1px solid dodgerblue;
    }
  }
</style>
