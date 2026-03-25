<template>
    <div class="popover" ref="PopoverRef" :position="position">
        <Button type="icon" icon="solar:menu-dots-bold" @click="TogglePopover()" default-state="calm"
            ref="PopoverButtonRef" />
        <div class="backdrop" @click="TogglePopover()"></div>
        <div class="popover-content" id="deployment-controls-popover">
            <button class="pop-item" @click="Execute(item.action)" v-for="item of items">
                <Icon :icon="item.icon" />
                <span>{{ item.title }}</span>
            </button>
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref, PropType } from 'vue';
import { Item } from '../../types/Dropdown';
import { Icon } from '@iconify/vue/dist/iconify.js';
import Button from './Button.vue';

const props = defineProps({
    items: {
        required: true,
        type: Array as PropType<Item[]>
    },
    data: {
        required: false,
        type: Object
    },
    position: {
        required: false,
        type: String as PropType<"down" | "up">,
        default: 'down'
    }
})

const PopoverRef = ref<HTMLDivElement | null>(null);
const PopoverButtonRef = ref<{ button: HTMLButtonElement } | null>(null);

function TogglePopover() {
    PopoverButtonRef.value?.button.classList.toggle("hover");
    PopoverRef.value?.classList.toggle('active');
}

async function Execute(action: (data?: Record<string, any>) => void) {
    await action(props.data);
    TogglePopover();
}

</script>

<style lang="scss" scoped>
.popover {
    position: relative;

    &.active {
        .popover-content {
            display: block;
        }

        .backdrop {
            display: block;
        }
    }

    button {
        position: relative;
        z-index: 10;
    }

    .backdrop {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        z-index: 9;
    }

    &[position="up"] {
        .popover-content {
            bottom: 3rem;
        }
    }

    .popover-content {
        width: max-content;
        inset: unset;
        margin: 0;
        position: absolute;
        right: 0;
        display: none;

        padding: .35rem;
        border: 1px solid #bababa;
        border-radius: .5rem;
        background: #f4f4f4;
        margin-top: .5rem;

        z-index: 10;

        .pop-item {
            display: flex;
            align-items: center;
            gap: .5rem;
            border-radius: .35rem;
            transition: .2s ease;
            height: min-content;
            background: transparent;
            border: 1px solid transparent;
            border-bottom: 2px solid transparent;
            outline: none;
            cursor: pointer;
            width: fit-content;
            flex-direction: row-reverse;

            padding: .35rem .75rem;

            margin: .25rem 0;

            span {
                font-size: 1rem;
            }

            span,
            svg {
                opacity: .7;
                transition: .2s ease;
            }

            svg {
                font-size: 1.25rem;
            }

            &:hover {
                border: 1px solid #e2e2e2;
                border-bottom: 2px solid #e2e2e2;
                background: #fff;

                span,
                svg {
                    opacity: .9;
                }
            }
        }
    }
}
</style>