import { nextTick, ref } from "vue";
import { ElDatePicker } from "element-plus";
import type { DatePickerProps } from "element-plus";
import "element-plus/dist/index.css";

/**
 * Element Plus 日期选择器编辑器配置接口
 */
export interface ElementPlusDateEditorConfig extends Partial<DatePickerProps> {
  type?: DatePickerProps["type"];
  valueFormat?: string;
  placeholder?: string;
  clearable?: boolean;
  editable?: boolean;
  teleported?: boolean; // 添加teleported属性
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
  value: string | null;
  endEdit: () => void;
  [key: string]: any;
}

/**
 * VTable 编辑器接口
 */
export interface IEditor {
  onStart: (context: EditContext) => void;
  onEnd: () => void;
  getValue: () => string | null;
  isEditorElement: (target: HTMLElement) => boolean;
}

/**
 * 实现 VTable IEditor 接口的 Element Plus DatePicker 编辑器
 */
export class ElementPlusDateEditor implements IEditor {
  private config: ElementPlusDateEditorConfig;
  private app: any = null;
  private container: HTMLElement | null = null;
  private dateValue = ref<string | null>(null);
  private endEditCallback: (() => void) | null = null;
  private editorElement: HTMLElement | null = null;

  constructor(config: ElementPlusDateEditorConfig = {}) {
    this.config = {
      type: "date",
      valueFormat: "YYYY-MM-DD",
      placeholder: "选择日期",
      clearable: true,
      editable: false,
      teleported: false, // 默认阻止弹出层插入到body
      ...config,
    };
  }

  onStart(context: EditContext): void {
    console.log("onStart method called with context:", context);
    const { container, referencePosition, value, endEdit } = context;
    this.container = container;
    this.endEditCallback = endEdit;

    // 创建用于挂载 Vue 组件的 DOM 元素
    this.editorElement = document.createElement("div");
    this.editorElement.style.position = "absolute";
    this.editorElement.style.zIndex = "10000";
    this.editorElement.style.backgroundColor = "#fff";
    // this.editorElement.style.border = '1px solid #ddd';
    // this.editorElement.style.borderRadius = '4px';
    // this.editorElement.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.1)';
    container.appendChild(this.editorElement);

    // 根据单元格位置定位编辑器
    this.adjustPosition(this.editorElement, referencePosition.rect);

    // 修复日期值处理，确保格式正确
    this.dateValue.value = this.formatDateValue(value);

    // 使用 Vue 创建应用并挂载 DatePicker 组件
    const { createApp } = require("vue/dist/vue.esm-bundler.js");

    this.app = createApp({
      components: { ElDatePicker },
      setup: () => {
        const handleChange = (newValue: string | null) => {
          this.dateValue.value = newValue;
          // 可以选择在选择日期后立即结束编辑
          // this.endEditCallback?.();
        };

        const handleBlur = () => {
          // 失去焦点时结束编辑
          this.endEditCallback?.();
        };

        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Enter") {
            // 按回车键结束编辑
            event.preventDefault();
            this.endEditCallback?.();
          } else if (event.key === "Escape") {
            // 按ESC键取消编辑，并恢复原值
            event.preventDefault();
            this.dateValue.value = value; // 恢复原始值
            this.endEditCallback?.();
          }
        };

        return {
          dateValue: this.dateValue,
          config: this.config,
          handleChange,
          handleBlur,
          handleKeyDown,
        };
      },
      template: `
        <el-date-picker
          v-model="dateValue"
          :type="config.type"
          :value-format="config.valueFormat"
          :placeholder="config.placeholder"
          :clearable="config.clearable"
          :editable="config.editable"
          :teleported="config.teleported"
          @change="handleChange"
          @blur="handleBlur"
          @keydown="handleKeyDown"
          style="width: 100%; height: 100%; border:none; margin: 0;"
          class="vtable-date-picker"
        />
      `,
    });

    // 挂载到创建的 DOM 元素
    this.app.mount(this.editorElement);

    // 立即聚焦到输入框，方便用户操作
    nextTick(() => {
      const input = this.editorElement?.querySelector("input");
      if (input) {
        input.focus();
        input.addEventListener("blur", () => {
          // 轻微的延迟以确保日期选择器有时间处理选择
          setTimeout(() => {
            if (!this.isDatePickerOpen()) {
              this.endEditCallback?.();
            }
          }, 200);
        });
      }
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
    element.style.top = `${rect.top - 1}px`;
    element.style.left = `${rect.left - 2}px`;
    element.style.width = `${rect.width + 2}px`;
    // 高度稍微增加以容纳日期选择器弹出层
    element.style.height = `${rect.height + 2}px`;
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

  getValue(): string | null {
    return this.dateValue.value;
  }

  isEditorElement(target: HTMLElement): boolean {
    // 检查点击是否发生在编辑器或日期选择器弹出层内
    if (this.editorElement && this.editorElement.contains(target)) {
      return true;
    }

    // 检查是否点击在日期选择器的弹出层上
    const popper = document.querySelector(".el-picker__popper");
    if (popper && popper.contains(target)) {
      return true;
    }

    return false;
  }

  private isDatePickerOpen(): boolean {
    return document.querySelector(".el-picker__popper") !== null;
  }

  // 添加日期格式化方法
  private formatDateValue(value: string | null): string | null {
    if (!value) return null;

    // 检查是否已经是正确的格式
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    // 尝试解析其他可能的日期格式
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        // 格式化为YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.error("Failed to parse date:", e);
    }

    return value;
  }
}
