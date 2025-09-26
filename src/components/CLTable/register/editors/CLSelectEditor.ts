import { nextTick, ref } from "vue";
import { ElSelect, ElOption } from "element-plus";
import "element-plus/dist/index.css";

/**
 * 选择器选项接口
 */
export interface SelectOption {
  value: string | number;
  label: string;
  tag?: string;
}

/**
 * CLSelect编辑器配置接口
 */
export interface CLSelectEditorConfig {
  options: SelectOption[];
  multiple?: boolean;
  filterable?: boolean;
  allowCreate?: boolean;
  placeholder?: string;
  teleported?: boolean;
}

/**
 * 编辑上下文接口 - 适配 VTable 的接口
 */
export interface EditContext {
  container: HTMLElement;
  referencePosition: {
    rect: {
      top: number;
      left: number;
      width: number;
      height: number;
      x?: number;
      y?: number;
      bottom?: number;
      right?: number;
      toJSON?: () => any;
    };
  };
  value: string | number | (string | number)[] | null;
  endEdit: () => void;
  [key: string]: any;
}

/**
 * VTable 编辑器接口
 */
export interface IEditor {
  onStart: (context: EditContext) => void;
  onEnd: () => void;
  getValue: () => string | number | (string | number)[] | null;
  isEditorElement: (target: HTMLElement) => boolean;
}

/**
 * 实现 VTable IEditor 接口的 Element Plus Select 编辑器
 */
export class CLSelectEditor implements IEditor {
  private config: CLSelectEditorConfig;
  private app: any = null;
  private container: HTMLElement | null = null;
  private selectedValue = ref<string | number | (string | number)[] | null>(
    null,
  );
  private endEditCallback: (() => void) | null = null;
  private editorElement: HTMLElement | null = null;

  constructor(config: CLSelectEditorConfig) {
    this.config = {
      multiple: false,
      filterable: true,
      allowCreate: false,
      placeholder: "查找或创建选项",
      teleported: false,
      ...config,
    };
  }

  onStart(context: EditContext): void {
    const { container, referencePosition, value, endEdit } = context;
    this.container = container;
    this.endEditCallback = endEdit;

    // 创建用于挂载 Vue 组件的 DOM 元素
    this.editorElement = document.createElement("div");
    this.editorElement.style.position = "absolute";
    this.editorElement.style.zIndex = "10000";
    this.editorElement.style.backgroundColor = "#fff";
    container.appendChild(this.editorElement);

    // 根据单元格位置定位编辑器
    this.adjustPosition(this.editorElement, referencePosition.rect);

    // 设置初始值
    this.selectedValue.value = value;

    // 使用 Vue 创建应用并挂载 Select 组件
    const { createApp } = require("vue/dist/vue.esm-bundler.js");

    this.app = createApp({
      components: { ElSelect, ElOption },
      setup: () => {
        const handleChange = (
          newValue: string | number | (string | number)[] | null,
        ) => {
          this.selectedValue.value = newValue;
          // 单选模式下，选择后立即结束编辑
          if (!this.config.multiple) {
            this.endEditCallback?.();
          }
        };

        const handleVisibleChange = (visible: boolean) => {
          // 多选模式下，下拉框关闭时结束编辑
          if (!visible && this.config.multiple) {
            this.endEditCallback?.();
          }
        };

        const handleBlur = () => {
          // 失去焦点时结束编辑
          setTimeout(() => {
            const popper = document.querySelector(".el-select-dropdown");
            if (!popper) {
              this.endEditCallback?.();
            }
          }, 150);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Enter") {
            // 按回车键结束编辑
            event.preventDefault();
            this.endEditCallback?.();
          } else if (event.key === "Escape") {
            // 按ESC键取消编辑，并恢复原值
            event.preventDefault();
            this.endEditCallback?.();
          }
        };

        return {
          selectedValue: this.selectedValue,
          config: this.config,
          handleChange,
          handleVisibleChange,
          handleBlur,
          handleKeyDown,
        };
      },
      template: `
        <el-select
          v-model="selectedValue"
          :multiple="config.multiple"
          :filterable="config.filterable"
          :allow-create="config.allowCreate"
          :placeholder="config.placeholder"
          :teleported="config.teleported"
          @change="handleChange"
          @visible-change="handleVisibleChange"
          @blur="handleBlur"
          @keydown="handleKeyDown"
          style="width: 100%; height: 100%; border:none; margin: 0;"
        >
          <el-option
            v-for="item in config.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <div v-if="item.tag" class="option-tag tag-{{ item.tag.toLowerCase() }}">{{ item.tag }}</div>
            <span>{{ item.label }}</span>
          </el-option>
        </el-select>
      `,
    });

    // 挂载到创建的 DOM 元素
    this.app.mount(this.editorElement);

    // 立即聚焦到输入框，方便用户操作
    nextTick(() => {
      const input = this.editorElement?.querySelector("input");
      if (input) {
        input.focus();
      }

      // 立即打开下拉框
      setTimeout(() => {
        const selectTrigger = this.editorElement?.querySelector(
          ".el-select__trigger",
        );
        if (selectTrigger) {
          (selectTrigger as HTMLElement).click();
        }
      }, 100);
    });
  }

  /**
   * 调整编辑器位置
   */
  private adjustPosition(
    element: HTMLElement,
    rect: {
      top: number;
      left: number;
      width: number;
      height: number;
      x?: number;
      y?: number;
      bottom?: number;
      right?: number;
      toJSON?: () => any;
    },
  ): void {
    element.style.top = `${rect.top + 1}px`;
    element.style.left = `${rect.left + 1}px`;
    element.style.width = `${rect.width - 3}px`;
    element.style.height = `${rect.height - 3}px`;
  }

  onEnd(): void {
    if (this.app) {
      this.app.unmount();
      this.app = null;
    }
    if (
      this.container &&
      this.editorElement &&
      this.container.contains(this.editorElement)
    ) {
      this.container.removeChild(this.editorElement);
    }
    this.editorElement = null;
    this.endEditCallback = null;
  }

  getValue(): string | number | (string | number)[] | null {
    return this.selectedValue.value;
  }

  isEditorElement(target: HTMLElement): boolean {
    // 检查点击是否发生在编辑器或选择器弹出层内
    if (this.editorElement && this.editorElement.contains(target)) {
      return true;
    }

    // 检查是否点击在选择器的弹出层上
    const popper = document.querySelector(".el-select-dropdown");
    if (popper && popper.contains(target)) {
      return true;
    }

    return false;
  }
}
