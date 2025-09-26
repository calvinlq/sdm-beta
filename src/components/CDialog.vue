<template>
  <el-dialog
    v-model="model"
    :title="operate === 'create' ? '新建' : '编辑'"
    width="30%"
    @closed="handleClose"
  >
    <CFieldsForm
      ref="FormTabDetailsRef"
      v-model="formData"
      :computedFields="props.fields"
      :viewData="props.nodeData"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="model = false">关闭</el-button>
        <el-button type="primary" @click="handleDialogOk">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
  import { ref, useTemplateRef } from "vue";
  import CFieldsForm from "@/components/CFieldsForm.vue";
  import type { DynamicField } from "@/data/wbsFields.ts";

  const model = defineModel();
  const formData = ref<Record<string, any>>({});
  const FormTabDetailsRef = useTemplateRef("FormTabDetailsRef");

  interface Props {
    operate: string;
    fields: DynamicField[];
    nodeData: Record<string, any>;
  }

  const props = defineProps<Props>();
  const $emit = defineEmits<{
    (e: "handleDialogOk", formData: Record<string, any>): void;
    (e: "close"): void;
  }>();

  const handleClose = () => {
    console.log("handleClose");
    // formData.value = {};
    if (FormTabDetailsRef.value) {
      FormTabDetailsRef.value.initForm();
    }

    $emit("close");
  };
  const handleDialogOk = () => {
    if (FormTabDetailsRef.value) {
      FormTabDetailsRef.value.validForm().then((res) => {
        if (res) {
          $emit("handleDialogOk", formData.value);
        }
      });
    }
  };
</script>

<style scoped lang="scss"></style>
